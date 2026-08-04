# Request/Response Speed: Measurement and Optimization

**Date:** 2026-08-05
**Branch:** `perf/request-response-timing`
**Status:** Approved

## Problem

The application feels slow. Investigation of the request path found an artificial
one-second delay applied to every HTTP response, plus React Query cache defaults
that force a refetch on every component mount.

Evidence gathered before any change:

- `client/src/lib/api/agent.ts` calls `await sleep(1000)` in **both** the fulfilled
  and rejected response interceptors. Every request in the app — success or
  failure — pays a full second. This is deliberate tutorial scaffolding added to
  make loading states visible.
- `client/src/main.tsx` constructs `new QueryClient()` with no options. React
  Query's default `staleTime` is `0`, so every mount of a component using
  `useActivities` / `useProfile` refires its query. Combined with the sleep, a
  page rendering three queries costs roughly three seconds.
- The backend query handlers (`GetActivityList`, `GetActivityDetails`) already use
  AutoMapper's `ProjectTo`, which builds a server-side SQL projection rather than
  loading entities and mapping in memory. Against local SQLite these are expected
  to complete in single-digit milliseconds.

The backend is therefore *presumed* not to be the bottleneck. The measurement work
below exists to confirm that rather than assume it.

## Goals

1. Produce real before/after latency numbers that can go in the pull request.
2. Remove the artificial delay.
3. Stop redundant refetching.

## Non-goals

Backend query tuning (`AsNoTracking`, `AsSplitQuery`, added indexes, reordering the
detail query's filter ahead of its projection). `ProjectTo` already covers the main
cost, and the target database is local SQLite. If measurement contradicts this, the
finding gets reported rather than acted on inside this change.

## Design

### Component 1: Server-side request timing

**New file:** `API/Middleware/RequestTimingMiddleware.cs`

An `IMiddleware` implementation that starts a `Stopwatch`, awaits the rest of the
pipeline, and on completion:

- logs one structured line per request at Information level: method, path, status
  code, elapsed milliseconds;
- sets a `Server-Timing: app;dur=<ms>` response header.

`Server-Timing` is a standard header that browser devtools render natively in the
Network panel's Timing tab, so it gives per-request server cost without extra
client code.

**Amended during implementation.** The above is only true same-origin. The client
runs on `:3000` and the API on `:5001`, so every response is cross-origin, and
browsers withhold `Server-Timing` from cross-origin resources unless the response
also carries `Timing-Allow-Origin`. Verified empirically: with the header alone,
`PerformanceResourceTiming.serverTiming` came back as an empty array in the
browser. The middleware therefore also sets `Timing-Allow-Origin` to the request's
`Origin`, **gated to the Development environment** — it opts whichever origin asked
into reading timing data, which is fine for local work and not something to ship
enabled by default.

The elapsed time must be written to the header *before* the response body starts
flushing. The middleware registers an `HttpResponse.OnStarting` callback to set the
header, since writing to `Headers` after the response has begun throws.

**Registration:** in `API/Program.cs`, added via `AddTransient` alongside the
existing `ExceptionMiddleware`, and placed in the pipeline immediately **after
`UseCors(...)`**. Placement matters and is easy to get wrong: `UseCors` currently
runs *after* `UseMiddleware<ExceptionMiddleware>()`, and it short-circuits `OPTIONS`
preflight requests. Registering the timing middleware before `UseCors` would
therefore log a timing line for every preflight, roughly doubling the log volume
with entries that measure nothing useful. Registering it after `UseCors` means it
sees only real requests that reach authentication and the controllers.

**Interface:** the middleware has no configuration and no consumers. It depends on
`ILogger<RequestTimingMiddleware>` only.

### Component 2: Benchmark script

**New file:** `scripts/bench.mjs`

A standalone Node script (Node's built-in `fetch`, no new dependencies) that:

1. Authenticates once against `POST /api/login?useCookies=true` with credentials
   supplied by `--email` / `--password` flags, capturing the returned cookie into
   a simple in-memory jar reused for all subsequent requests.
2. Discovers a real activity id and profile id from `GET /api/activities` so the
   detail endpoints are exercised against existing data rather than hardcoded ids.
3. Hits each target endpoint N times sequentially:
   - `GET /api/activities`
   - `GET /api/activities/{id}`
   - `GET /api/profiles/{id}`
   - `GET /api/profiles/{id}/photos`
4. Discards the first 5 responses per endpoint as warmup (JIT, EF model build,
   connection pool), then reports min / median / p95 / max over the remaining runs.

**Flags:** `--base-url` (default `https://localhost:5001`), `--runs` (default 30),
`--email`, `--password`.

Because the dev server uses a locally-generated certificate, the script sets
`NODE_TLS_REJECT_UNAUTHORIZED=0` for its own process and prints a one-line notice
that it is doing so, so the behavior is visible rather than silent.

**Interface:** run as `node scripts/bench.mjs --email x --password y`. Prints a
table to stdout. Exits non-zero on auth failure or if any endpoint errors.

### Component 3: Client optimizations

**`client/src/lib/api/agent.ts`** — delete the `sleep` helper and both
`await sleep(1000)` calls. The surrounding `store.uiStore.isBusy()` /
`isIdle()` calls stay untouched, so the `LinearProgress` bar in the NavBar
continues to work; it will simply reflect real latency.

**`client/src/main.tsx`** — give the `QueryClient` explicit defaults:

```
defaultOptions: {
  queries: {
    staleTime: 1000 * 60,      // 1 minute
    refetchOnWindowFocus: false,
    retry: 1,
  },
}
```

`staleTime: 0` is the reason revisiting `/activities` always refetches.
`refetchOnWindowFocus` defaults to `true`, which fires an extra request every time
the browser tab regains focus. `retry` defaults to `3`, which turns a genuinely
failing request into four round trips before the error surfaces.

**`client/src/lib/hooks/useActivities.ts`** — the `updateAttendance` mutation's
`onSettled` invalidates the `["activities"]` prefix, which matches both the list
cache and every individual detail cache, so each attendance toggle refetches the
entire activity list. Narrow it to `["activities", id]`.

This one is behavior-adjacent rather than purely a speedup: the list's attendee
counts will no longer silently refresh after a toggle made from a detail page.
That is acceptable because the list query re-runs on its own once `staleTime`
expires, and the optimistic update in `onMutate` already keeps the detail view
correct. It is called out separately in the pull request body so a reviewer can
disagree with it independently of the rest.

## Data flow

Unchanged. No request paths, payload shapes, or endpoints are added or modified.
The timing middleware is passive: it observes and annotates, and cannot alter a
response body or status code.

## Error handling

- The timing middleware sits *inside* `ExceptionMiddleware`, so a thrown exception
  is still converted to the existing error response; the timing log line records
  the resulting status code.
- Two readings of the stopwatch, for two different consumers. The `Server-Timing`
  header is written from inside the `OnStarting` callback, which fires the moment
  the response begins — necessarily before the body has finished, so the header
  reflects time-to-first-byte. The log line is written after `await next(context)`
  returns and therefore covers the full request. These differ slightly for large
  responses; the log line is the authoritative number.
- The `await next(context)` call is wrapped in `try`/`finally` so the log line is
  emitted even when an exception propagates past this middleware.
- `bench.mjs` treats any non-2xx as a hard failure, prints the offending endpoint
  and status, and exits non-zero. It does not retry, because a retry would hide
  exactly the latency being measured.

## Testing and verification

No test framework exists in this repository on either side, so `bench.mjs` is the
verification instrument.

Procedure:

1. On the branch, before any client change, run the bench and record the output.
2. Apply the client changes.
3. Run the bench again.

Important limitation, stated plainly: **the bench measures server-side latency
only.** The sleep and the caching changes are client-side, so they will *not* move
the bench numbers. The bench's job is to establish that the backend is fast and
therefore not the cause — it is the control, not the result.

The client-side wins are verified separately and reported as such:

- The sleep removal is verified by observing that the browser Network panel's total
  time for a request drops by ~1000ms and now approximates the `Server-Timing`
  value.
- The caching change is verified by counting requests in the Network panel across a
  navigation sequence (`/activities` → detail → back to `/activities`) before and
  after: the return navigation should issue zero new requests instead of one.

Both figures are recorded manually and go in the PR body alongside the bench table.

## Deliverable

A branch containing the middleware, the bench script, the three client edits, and
before/after numbers in the commit messages, ready to push and open as a PR
against `master`.
