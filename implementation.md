# Implementation Plan

## Current Constraints

- The repository is nearly empty, so the first milestone is scaffolding.
- Node and Bun are available locally.
- Go is not installed locally, so backend code can be scaffolded but not compiled or run here yet.
- Tests are intentionally skipped for now per request.
- Work should be committed and pushed frequently.

## Skill Context

Relevant skills installed for this project:

- `turborepo` for monorepo task and workspace structure.
- `shadcn` for UI component setup and composition.
- `nextjs-app-router-patterns` for thin App Router route files and feature-level pages.
- `golang-patterns` for backend package layout and idiomatic Go scaffolding.
- `openapi-to-typescript` for the OpenAPI-first generated client path.
- Existing `supabase` skill applies to schema and Supabase Postgres decisions.

Supabase changelog was checked before schema planning. Relevant current cautions:

- Do not rely on public REST OpenAPI schema access through anon keys.
- Keep schema security explicit and avoid exposing unnecessary table access.
- Treat new declarative schema tooling as experimental; use migration SQL for this MVP.

## Milestones

### M1: Monorepo Foundation

- Create Turborepo workspace with `apps/web`, `apps/api`, `packages/api-client`, `packages/constants`, and `packages/i18n`.
- Wire Bun workspace management and root scripts that delegate through `turbo run`.
- Scaffold Next.js App Router web app with a base shell, route placeholders, providers, and feature folders.
- Scaffold Go backend folder structure under `apps/api`.
- Add environment examples and README notes for local setup.

Completion criteria:

- Bun workspace files exist.
- Web app has a coherent first screen and route placeholders.
- API folders and entrypoints exist.
- The missing local Go toolchain is documented.

### M2: Domain Contract Backbone

- Define shared constants for patient, appointment, SMS, audit, and clinic membership statuses.
- Add initial SQL migration for:
  - `users`
  - `clinics`
  - `clinic_members`
  - `patients`
  - `appointments`
  - `sms_templates`
  - `sms_messages`
  - `notification_settings`
  - `audit_logs`
- Encode product rules in the schema:
  - `clinic_id` isolation.
  - soft deletes.
  - `created_by_user_id` and `updated_by_user_id`.
  - duplicate SMS reminder prevention.
- Author OpenAPI v1 manually first because Go is unavailable locally.
- Generate or scaffold the TypeScript client under `packages/api-client`.

Completion criteria:

- Schema and API contract cover core MVP resources.
- Web can import shared constants and API client types.

### M3: Auth And Clinic Context

- Implement frontend auth shell and protected-app layout assumptions.
- Add API contract and backend scaffolding for current user and clinic context.
- Build a web clinic/session context.
- Implement colleagues page as the first clinic-scoped read feature.

Completion criteria:

- UI can display active clinic context and colleagues data shape.

### M4: Patient Management Vertical Slice

- Scaffold patient repository/service/handler in Go with clinic-scoped query contracts.
- Add patient OpenAPI endpoints and client types.
- Implement patient table, query hooks, and shared patient modal.
- Support create, view, edit, soft delete, send SMS entrypoint, and audit/history tab shell.
- Add audit write points in backend scaffolding.

Completion criteria:

- Patient UI flow is present and wired to the API client boundary.
- Backend scaffolding shows clinic-scoped access and soft delete behavior.

### M5: Appointment Management Vertical Slice

- Scaffold appointment repository/service/handler in Go.
- Add appointment OpenAPI endpoints and client types.
- Add appointments section to patient modal.
- Implement simple monthly calendar page grouped by day.
- Add audit write points for appointment changes.

Completion criteria:

- Appointments appear in patient context and calendar context.

### M6: SMS Templates, Manual Send, And Logs

- Scaffold SMS templates, SMS messages, and provider abstraction in Go.
- Enforce template-based SMS at the API boundary.
- Implement template selection, SMS preview, manual send action, and SMS logs UI.
- Keep provider runtime credentials environment-based.

Completion criteria:

- User can preview a template-based reminder and see SMS log records.

### M7: Notification Settings And Daily Reminder Job

- Implement notification settings API contract and UI.
- Scaffold Go command path for `send-daily-reminders`.
- Implement reminder selection structure:
  - load active settings.
  - find appointments on configured future dates.
  - create SMS records.
  - rely on DB uniqueness to prevent duplicates.
  - update send status.
  - write audit logs.
- Document Railway API service and Railway cron service commands.

Completion criteria:

- Daily reminder workflow is fully represented in schema, backend structure, and deployment docs.

### M8: Audit Visibility And MVP Hardening

- Add audit read endpoints and patient modal history UI.
- Add localized frontend error mapping by backend error code.
- Add minimal CI config and deployment docs.
- Keep Go checks documented as requiring a Go-enabled environment.

Completion criteria:

- Audit history is visible.
- Stable error codes have Turkish UI mappings.
- Deployment inputs are documented.

## Commit Sequence

1. Root workspace, Turbo, Bun scripts, and durable plan. - Completed in `4641826`.
2. `apps/web` scaffold and base UI shell. - Completed in `dd01365`.
3. `apps/api` folder skeleton and backend README. - Completed in `f994593`.
4. Shared constants and i18n placeholders. - Completed in `64eea51`.
5. Initial SQL migration and schema rules. - In progress.
6. OpenAPI spec v1 and API client package.
7. Auth shell and clinic context.
8. Colleagues page.
9. Patient backend scaffold.
10. Patient table and modal.
11. Patient audit and soft delete scaffolding.
12. Appointment backend scaffold.
13. Appointment UI in modal.
14. Calendar page.
15. SMS template backend and UI.
16. Manual SMS send and logs.
17. Notification settings.
18. Cron command scaffold and duplicate reminder logic.
19. Audit history UI.
20. Environment docs, CI scripts, and deployment docs.

## Open Decisions

- Confirm MVP auth mechanism before deep backend auth implementation.
- Confirm first SMS provider: `Ileti Merkezi` or `Netgsm`.
- Confirm where Go compile/deploy validation will happen.

For now, implementation proceeds OpenAPI-first with backend scaffolding and frontend client boundaries.

## Validation Notes

- `supabase migration list --local --workdir apps/api` currently fails because no local Supabase Postgres is running on `127.0.0.1:54322`.
