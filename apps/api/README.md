# API

Go API for the Orthodontics Helper MVP.

This service owns all patient, appointment, SMS, audit, and clinic-scoped data access.
The Next.js frontend must not mutate Supabase Postgres directly.

## Local Validation

```bash
go mod tidy
go test ./...
go vet ./...
go run ./cmd/api server
go run ./cmd/api send-daily-reminders
```

Current validation status:

- `go test ./...` passes.
- `go vet ./...` passes.
- `go build ./cmd/api` passes.

## Commands

```bash
./app server
./app send-daily-reminders
```

Railway should deploy this service with:

- Root Directory: `/apps/api`
- Config File Path: `/apps/api/railway.json`
- Builder: Dockerfile
- Dockerfile Path: `Dockerfile`

The API reads Railway's `PORT` automatically when `HTTP_ADDR` is not set. A root-level Dockerfile and `railway.json` also exist as a fallback if Railway scans the repository root instead of `/apps/api`. A future daily cron service can reuse the same image and run `/app/api send-daily-reminders`.

## Database

Supabase migration files live in:

```txt
apps/api/supabase/migrations
```

Create new migrations with:

```bash
supabase migration new <name> --workdir apps/api
```
