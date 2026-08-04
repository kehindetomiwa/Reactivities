#!/usr/bin/env node
// Measures server-side latency of the main read endpoints.
//
// This measures the API only. Client-side costs (the axios interceptors, React
// Query's cache behaviour) are invisible here by design - this script exists to
// establish whether the backend is a bottleneck, not to prove client fixes.
//
//   node scripts/bench.mjs --email bob@test.com --password 'Pa$$w0rd'

const DEFAULTS = {
  "base-url": "https://localhost:5001",
  runs: "30",
  warmup: "5",
  email: "bob@test.com",
  password: "Pa$$w0rd",
};

function parseArgs(argv) {
  const args = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    if (!(key in DEFAULTS)) {
      throw new Error(`Unknown flag --${key}. Known: ${Object.keys(DEFAULTS).join(", ")}`);
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Flag --${key} needs a value`);
    }
    args[key] = value;
    i += 1;
  }
  const runs = Number(args.runs);
  const warmup = Number(args.warmup);
  if (!Number.isInteger(runs) || runs < 1) throw new Error("--runs must be a positive integer");
  if (!Number.isInteger(warmup) || warmup < 0) throw new Error("--warmup must be a non-negative integer");
  return { ...args, runs, warmup, baseUrl: args["base-url"].replace(/\/$/, "") };
}

// The dev server uses a locally-generated mkcert certificate that Node does not
// trust. Announced rather than set silently.
function trustLocalCert() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.log("note: TLS verification disabled for this process (local dev cert)\n");
}

// Minimal cookie jar. Identity issues its auth cookie via set-cookie and expects
// it back on every subsequent request.
class CookieJar {
  #cookies = new Map();

  store(response) {
    const raw = response.headers.getSetCookie?.() ?? [];
    for (const entry of raw) {
      const [pair] = entry.split(";");
      const index = pair.indexOf("=");
      if (index > 0) this.#cookies.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
    }
  }

  header() {
    return [...this.#cookies].map(([name, value]) => `${name}=${value}`).join("; ");
  }

  get isEmpty() {
    return this.#cookies.size === 0;
  }
}

async function request(baseUrl, jar, path, init = {}) {
  const headers = { ...(init.headers ?? {}) };
  if (!jar.isEmpty) headers.Cookie = jar.header();

  const started = performance.now();
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers, redirect: "manual" });
  // Drain the body before stopping the clock, otherwise we time the headers only
  // and understate the cost of large list responses.
  const body = await response.text();
  const elapsed = performance.now() - started;

  jar.store(response);
  return { response, body, elapsed, serverTiming: response.headers.get("server-timing") };
}

async function login(baseUrl, jar, email, password) {
  const { response, body } = await request(baseUrl, jar, "/api/login?useCookies=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed for ${email}: ${response.status} ${body.slice(0, 200)}`);
  }
  if (jar.isEmpty) {
    throw new Error("Login returned no cookie - is useCookies=true still supported?");
  }
}

// Hit /activities once to find real ids, so the detail endpoints exercise data
// that actually exists rather than hardcoded guesses.
async function discoverTargets(baseUrl, jar) {
  const { response, body } = await request(baseUrl, jar, "/api/activities");
  if (!response.ok) {
    throw new Error(`Could not list activities: ${response.status} ${body.slice(0, 200)}`);
  }

  const activities = JSON.parse(body);
  if (!activities.length) {
    throw new Error("No activities in the database - seed data first, or the bench has nothing to measure");
  }

  const activity = activities[0];
  const profileId = activity.hostId ?? activity.attendees?.[0]?.id;
  if (!profileId) {
    throw new Error("First activity has no hostId or attendees, cannot derive a profile id");
  }

  return [
    ["GET /api/activities", "/api/activities"],
    ["GET /api/activities/{id}", `/api/activities/${activity.id}`],
    ["GET /api/profiles/{id}", `/api/profiles/${profileId}`],
    ["GET /api/profiles/{id}/photos", `/api/profiles/${profileId}/photos`],
  ];
}

function percentile(sorted, p) {
  if (!sorted.length) return NaN;
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.min(Math.max(rank, 0), sorted.length - 1)];
}

async function measure(baseUrl, jar, path, runs, warmup) {
  const samples = [];
  let lastServerTiming = null;

  for (let i = 0; i < runs + warmup; i += 1) {
    const { response, body, elapsed, serverTiming } = await request(baseUrl, jar, path);
    if (!response.ok) {
      throw new Error(`${path} returned ${response.status}: ${body.slice(0, 200)}`);
    }
    lastServerTiming = serverTiming;
    if (i >= warmup) samples.push(elapsed);
  }

  samples.sort((a, b) => a - b);
  return {
    min: samples[0],
    median: percentile(samples, 50),
    p95: percentile(samples, 95),
    max: samples[samples.length - 1],
    serverTiming: lastServerTiming,
  };
}

function printTable(rows) {
  const headers = ["endpoint", "min", "median", "p95", "max"];
  const body = rows.map((r) => [
    r.label,
    `${r.min.toFixed(1)}ms`,
    `${r.median.toFixed(1)}ms`,
    `${r.p95.toFixed(1)}ms`,
    `${r.max.toFixed(1)}ms`,
  ]);

  const widths = headers.map((h, i) =>
    Math.max(h.length, ...body.map((row) => row[i].length)),
  );
  const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join("  ");

  console.log(line(headers));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of body) console.log(line(row));
}

async function main() {
  const { baseUrl, runs, warmup, email, password } = parseArgs(process.argv.slice(2));

  if (baseUrl.startsWith("https://localhost")) trustLocalCert();

  const jar = new CookieJar();
  await login(baseUrl, jar, email, password);

  const targets = await discoverTargets(baseUrl, jar);
  console.log(`${runs} runs per endpoint (${warmup} warmup discarded), against ${baseUrl}\n`);

  const rows = [];
  for (const [label, path] of targets) {
    rows.push({ label, ...(await measure(baseUrl, jar, path, runs, warmup)) });
  }

  printTable(rows);
  console.log("\nRound-trip wall time from this machine, including TLS and JSON parsing.");
  console.log("Server-Timing on the last sample:");
  for (const row of rows) console.log(`  ${row.label}: ${row.serverTiming ?? "(header absent)"}`);
}

main().catch((error) => {
  console.error(`\nbench failed: ${error.message}`);
  process.exit(1);
});
