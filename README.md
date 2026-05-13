# Orthodontics Helper

Lightweight patient and appointment tracking system for orthodontic clinics.

The MVP is a Turborepo monorepo:

```txt
apps/
  web/   Next.js clinic UI
  api/   Go API for Supabase Postgres

packages/
  api-client/  OpenAPI-generated TypeScript client
  constants/   shared domain constants
  i18n/        localized messages and error mappings
```

## Local Prerequisites

- Bun
- Node.js
- Go, for backend compile/run validation

Go is installed in this workspace through Scoop and backend validation passes.

## Commands

```bash
bun install
bun run dev
bun run lint
bun run typecheck
bun run build
```

Root scripts delegate to Turborepo. Package-specific task logic should live in each package.

Backend validation:

```bash
cd apps/api
go test ./...
go vet ./...
go build ./cmd/api
```
