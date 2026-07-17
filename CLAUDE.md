# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is a tutorial project (.NET + React) currently in an early stage: only the .NET backend exists so far (`API`, `Application`, `Domain`, `Persistence`). There is no React client yet — do not assume one exists when reasoning about "the frontend". `Application` is currently a stub (only `Class1.cs`); business logic beyond basic CRUD in the controllers has not been built out yet.

## Commands

Run all commands from the repository root (where `Reactivities.slnx` lives).

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

## Architecture

Solution follows a Clean Architecture-style layering (`Reactivities.slnx`), with dependencies flowing inward:

- **Domain** — POCO entities only (e.g. `Domain/Activity.cs`). No dependencies on other projects.
- **Application** — intended to hold business/use-case logic between API and Persistence. Depends on `Domain` and `Persistence`. Currently unimplemented.
- **Persistence** — EF Core data access. `AppDbContext` (`Persistence/AppDbContext.cs`) exposes `DbSet<Activity> Activities` and uses SQLite (`Microsoft.EntityFrameworkCore.Sqlite`). `DbInitializer.SeedData` seeds sample activities if the table is empty. Migrations live in `Persistence/Migrations`. Depends on `Domain`.
- **API** — ASP.NET Core Web API (`Microsoft.NET.Sdk.Web`, controllers only, no MVC views). Controllers live in `API/Controllers` and inherit from `BaseApiController` (`[Route("api/[controller]")]`, `[ApiController]`). Depends on `Application` (which transitively pulls in `Domain`/`Persistence`).

Currently controllers talk directly to `AppDbContext` via constructor injection (primary constructor syntax, e.g. `ActivitiesController(AppDbContext context)`) — the `Application` layer is not yet mediating this.

On startup (`API/Program.cs`), the app applies pending EF Core migrations and runs `DbInitializer.SeedData` automatically (`context.Database.MigrateAsync()` + seed), wrapped in a try/catch that logs migration errors rather than crashing the app.

Target framework: **.NET 10** (all four projects target `net10.0`, nullable reference types and implicit usings enabled).

The SQLite database file (`API/reactivies.db` and its `-shm`/`-wal` companions) and `API/appsettings.json` are gitignored; only `appsettings.Development.json` is checked in, with connection string `Data Source=reactivies.db`.
