# API

Go API for the Orthodontics Helper MVP.

This service owns all patient, appointment, SMS, audit, and clinic-scoped data access.
The Next.js frontend must not mutate Supabase Postgres directly.

## Local Status

Go is not installed in the current workspace, so this backend is scaffolded but not locally compiled yet.

Expected validation once Go is available:

```bash
go mod tidy
go test ./...
go vet ./...
go run ./cmd/api server
go run ./cmd/api send-daily-reminders
```

## Commands

```bash
./app server
./app send-daily-reminders
```

Railway should run the API service with `./app server` and the daily cron service with `./app send-daily-reminders`.
