# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is a tutorial project (.NET + React) in an early stage. The .NET backend (`API`, `Application`, `Domain`, `Persistence`) and a React client (`client/`) both exist, but each is minimal: the API only serves `Activity` CRUD, and the client is just a single `App.tsx` that fetches and lists activities. `Application` is currently a stub (only `Class1.cs`); business logic beyond basic CRUD in the controllers has not been built out yet.

## Commands

### Backend

Run from the repository root (where `Reactivities.slnx` lives).

```bash
# Restore + build the whole solution
dotnet build

# Run the API (serves on https://localhost:5001, per API/Properties/launchSettings.json)
dotnet run --project API

# Add a new EF Core migration after changing Domain/Persistence models
dotnet ef migrations add <MigrationName> --project Persistence --startup-project API

# Apply migrations manually (normally happens automatically on startup, see below)
dotnet ef database update --project Persistence --startup-project API
```

There are no test projects in the solution yet.

### Client

Run from `client/`.

```bash
npm run dev       # Vite dev server on https://localhost:3000 (mkcert-signed HTTPS, see vite.config.ts)
npm run build     # tsc -b type-check, then vite build
npm run lint      # eslint .
npm run preview
```

There are no client test scripts yet.

## Architecture

Solution follows a Clean Architecture-style layering (`Reactivities.slnx`), with dependencies flowing inward:

- **Domain** — POCO entities only (e.g. `Domain/Activity.cs`). No dependencies on other projects.
- **Application** — intended to hold business/use-case logic between API and Persistence. Depends on `Domain` and `Persistence`. Currently unimplemented.
- **Persistence** — EF Core data access. `AppDbContext` (`Persistence/AppDbContext.cs`) exposes `DbSet<Activity> Activities` and uses SQLite (`Microsoft.EntityFrameworkCore.Sqlite`). `DbInitializer.SeedData` seeds sample activities if the table is empty. Migrations live in `Persistence/Migrations`. Depends on `Domain`.
- **API** — ASP.NET Core Web API (`Microsoft.NET.Sdk.Web`, controllers only, no MVC views). Controllers live in `API/Controllers` and inherit from `BaseApiController` (`[Route("api/[controller]")]`, `[ApiController]`). Depends on `Application` (which transitively pulls in `Domain`/`Persistence`).

Currently controllers talk directly to `AppDbContext` via constructor injection (primary constructor syntax, e.g. `ActivitiesController(AppDbContext context)`) — the `Application` layer is not yet mediating this.

On startup (`API/Program.cs`), the app applies pending EF Core migrations and runs `DbInitializer.SeedData` automatically (`context.Database.MigrateAsync()` + seed), wrapped in a try/catch that logs migration errors rather than crashing the app. CORS is configured (`app.UseCors`) to allow only `http://localhost:3000` / `https://localhost:3000` — i.e. the Vite dev server origin.

Target framework: **.NET 10** (all four projects target `net10.0`, nullable reference types and implicit usings enabled).

The SQLite database file (`API/reactivies.db` and its `-shm`/`-wal` companions) and `API/appsettings.json` are gitignored; only `appsettings.Development.json` is checked in, with connection string `Data Source=reactivies.db`.

### Client (`client/`)

Vite + React 19 + TypeScript, using MUI (`@mui/material`) for components and `axios` for HTTP. No router or state management library yet — `App.tsx` calls the API directly with a hardcoded `https://localhost:5001/api/activities` URL and holds state in `useState`. Shared API types live in `client/src/lib/types/index.d.ts` (currently just the `Activity` type, hand-kept in sync with `Domain/Activity.cs`).

Notable non-default tooling: the React Compiler babel plugin is wired in via `@rolldown/plugin-babel` in `vite.config.ts`, and `vite-plugin-mkcert` auto-generates a trusted local HTTPS cert so the dev server can run on `https://localhost:3000` to match the API's CORS allowlist.
