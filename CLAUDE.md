# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Tutorial project (.NET 10 + React) implementing `Activity` CRUD end-to-end. The backend uses **CQRS via MediatR** (the `Application` layer mediates between controllers and `AppDbContext`), with AutoMapper wired in. The client is a **feature-based React app** using **react-router** for navigation, **TanStack Query** for server state (via a `useActivities` hook + axios agent), and **MobX** for client/UI state. There is no auth, and the only domain entity is `Activity`. No test projects exist on either side.

## Commands

### Backend

Run from the repository root (where `Reactivities.slnx` lives).

```bash
dotnet build                                  # restore + build the whole solution
dotnet run --project API                      # run the API (https://localhost:5001, per launchSettings.json)

# EF Core migrations (Persistence holds the DbContext, API is the startup project)
dotnet ef migrations add <MigrationName> --project Persistence --startup-project API
dotnet ef database update      --project Persistence --startup-project API   # normally automatic on startup
```

### Client

Run from `client/`.

```bash
npm run dev       # Vite dev server on https://localhost:3000 (mkcert-signed HTTPS, see vite.config.ts)
npm run build     # tsc -b type-check, then vite build
npm run lint      # eslint .
npm run preview
```

No test scripts exist on either side.

## Backend architecture

Clean Architecture-style layering (`Reactivities.slnx`), dependencies flowing inward:

- **Domain** — POCO entities only (`Domain/Activity.cs`). No project dependencies.
- **Application** — CQRS use cases. Depends on `Domain` + `Persistence`. Uses AutoMapper + MediatR.
- **Persistence** — EF Core (SQLite). `AppDbContext` exposes `DbSet<Activity> Activities`; `DbInitializer.SeedData` seeds sample activities when the table is empty; migrations live in `Persistence/Migrations`. Depends on `Domain`.
- **API** — ASP.NET Core Web API (controllers only, no MVC views). Depends on `Application`.

### CQRS / MediatR pattern

This is the core pattern to follow when adding backend features. Each use case is a **static wrapper class** in `Application/Activities/{Queries,Commands}/` containing two nested classes:

- a `Query`/`Command` implementing `IRequest<TResult>` (or `IRequest` for no result), carrying its inputs as `required` properties, and
- a `Handler` implementing `IRequestHandler<...>`, using **primary-constructor injection** of `AppDbContext` (and `IMapper` where needed).

Example: `Application/Activities/Commands/EditActivity.cs` injects `IMapper` and does `mapper.Map(request.Activity, activity)` onto a tracked entity before `SaveChangesAsync`. `CreateActivity` returns the new `Activity.Id` as a `string`.

Controllers (`API/Controllers`) inherit `BaseApiController` and **do not touch `AppDbContext`** — they only call `Mediator.Send(new SomeUseCase.Query/Command { ... })`. `BaseApiController` lazily resolves `IMediator` from `HttpContext.RequestServices` (so controllers can use empty primary constructors, e.g. `ActivitiesController() : BaseApiController`). Route/attribute conventions (`[Route("api/[controller]")]`, `[ApiController]`) live on `BaseApiController`.

Registration is in `API/Program.cs`: `AddMediatR(...RegisterServicesFromAssemblyContaining<GetActivityList.Handler>())` and `AddAutoMapper(typeof(MappingProfiles).Assembly)`. AutoMapper profiles live in `Application/Core/MappingProfiles.cs` (currently just `Activity → Activity` for edits).

### Startup, config, CORS

`API/Program.cs` on startup applies pending migrations (`context.Database.MigrateAsync()`) then runs `DbInitializer.SeedData`, wrapped in a try/catch that **logs** migration errors rather than crashing. CORS allows only `http://localhost:3000` / `https://localhost:3000` (the Vite dev origin).

The SQLite connection string comes from `GetConnectionString("DefaultConnection")`. It is defined in `appsettings.Development.json` (`Data Source=reactivies.db`) — note the spelling `reactivies`, not `reactivities`. The DB file, its `-shm`/`-wal` companions, and `API/appsettings.json` are gitignored; only `appsettings.Development.json` is checked in.

All four projects target **net10.0** with nullable + implicit usings enabled.

**Known rough edges:** handlers throw bare `throw new Exception("Activity not found")` for missing records (surfaces as a 500, not a 404) — there is no error-handling middleware or `Result`/`ActionResult` shaping yet.

## Client architecture (`client/`)

Vite + React 19 + TypeScript, MUI (`@mui/material` v9) for components, **TanStack Query** for server state, **MobX** for UI state, **react-router** (v8) for navigation, axios for HTTP.

- **`src/main.tsx`** wraps the router in `StoreContext.Provider` → `QueryClientProvider` (+ React Query Devtools) → `RouterProvider`.
- **`src/app/router/Routes.tsx`** — the single `createBrowserRouter` route table. `App` is the layout route; children are `""` (HomePage), `activities` (dashboard), `activities/:id` (detail), `createActivity` + `manage/:id` (both `ActivityForm`, the create route passing `key="create"` to force a fresh form), and `counter`. Navigation and the selected activity come from the **URL/route params**, not props — this replaced the earlier props-drilling.
- **`src/lib/api/agent.ts`** — a shared axios instance (`baseURL` from `import.meta.env.VITE_API_URL`, set in `client/.env.development` to `https://localhost:5001/api`). Its interceptors also drive the global loading bar: the **request** interceptor calls `store.uiStore.isBusy()` and the **response** interceptor adds a deliberate **1-second `sleep`** (to exercise loading states) then calls `store.uiStore.isIdle()` in `finally`.
- **`src/lib/stores/`** — MobX stores. `store.ts` composes `counterStore` + `uiStore` into a single `store` object exposed via `StoreContext`; access it with the `useStore()` hook (`src/lib/hooks/useStores.ts`). `uiStore.isLoading` backs the `LinearProgress` bar in `NavBar` (wrapped in `<Observer>` from `mobx-react-lite`). `counterStore` is a demo store for the `/counter` page.
- **`src/lib/hooks/useActivities.ts`** — the data layer. Takes an optional `id`: with no `id` it runs the `["activities"]` list query (gated on `location.pathname === "/activities"`); with an `id` it runs the `["activities", id]` detail query. Also exposes `createActivity`/`updateActivity`/`deleteActivity` mutations, each invalidating `["activities"]` on success. Add new server interactions here rather than calling axios from components.
- **`src/features/activities/{dashboard,details,form}/`** — feature components. `details/` is decomposed into `ActivityDetailPage` + `ActivityDetailsHeader`/`Info`/`Sidebar`/`Chat`.
- **`src/app/layout/`** — `App.tsx` (renders `HomePage` at `/`, otherwise `NavBar` + an `<Outlet/>`), `NavBar.tsx`, global styles.

Shared types are hand-kept in `src/lib/types/index.d.ts` as a **global ambient** `Activity` type (no import needed, must stay in sync with `Domain/Activity.cs` manually).

**Known rough edge:** the axios `response` interceptor only defines a fulfilled handler (no rejected handler), so a failed request never reaches its `finally` and `uiStore.isLoading` can stay stuck on `true` after an error.

### Notable tooling

The React Compiler babel plugin is wired via `@rolldown/plugin-babel` + `reactCompilerPreset()` in `vite.config.ts`, and `vite-plugin-mkcert` auto-generates a trusted local HTTPS cert so the dev server runs on `https://localhost:3000` to match the API's CORS allowlist.
