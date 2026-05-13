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

Railway should run the API service with `./app server` and the daily cron service with `./app send-daily-reminders`.

## Database

Supabase migration files live in:

```txt
apps/api/supabase/migrations
```

Create new migrations with:

```bash
supabase migration new <name> --workdir apps/api
```
