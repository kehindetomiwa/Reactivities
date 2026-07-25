# Reactivities

A tutorial project implementing `Activity` CRUD end-to-end with a **.NET 10** backend (Clean Architecture + CQRS/MediatR, EF Core/SQLite) and a **React 19 + TypeScript** frontend (Vite, MUI, TanStack Query).

## Tools to install

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (LTS) + npm
- EF Core CLI: `dotnet tool install --global dotnet-ef`

## Getting started

### Backend

Run from the repository root:

```bash
dotnet build                    # restore + build the solution
dotnet run --project API        # start the API on https://localhost:5001
```

Migrations are applied and sample data seeded automatically on startup.

#### Database migrations

`Persistence` holds the `DbContext`; `API` is the startup project. Run from the repository root:

```bash
# add a new migration
dotnet ef migrations add <MigrationName> --project Persistence --startup-project API

# apply migrations manually (normally automatic on startup)
dotnet ef database update --project Persistence --startup-project API
```

### Frontend

Run from `client/`:

```bash
npm install       # install dependencies (first time only)
npm run dev       # start the Vite dev server on https://localhost:3000
```

Then open **https://localhost:3000** in your browser.
