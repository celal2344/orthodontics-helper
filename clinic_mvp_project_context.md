# Clinic Patient Reminder System — Project Context

## 1. Product Summary

This project is a lightweight patient and appointment tracking system for orthodontic clinics.

The system is designed for doctors who currently manage patients manually through phone calls or WhatsApp messages. The goal is to provide a simple web application where clinic doctors can:

- Manage patients
- Track appointments
- View a monthly appointment calendar
- Send template-based SMS reminders
- Keep an audit history of patient and appointment changes

The system is independent from any hospital system. It is meant to be used by doctors or a small clinic team directly.

## 2. Core Product Positioning

The product should be positioned as:

> A lightweight patient and appointment tracking system for orthodontic clinics, with template-based SMS reminders, audit logs, and clinic-level data isolation.

This is not a full hospital management system, ERP, or advanced treatment management platform.

The MVP should stay simple, practical, and reliable.

---

## 3. Final Tech Stack

### Monorepo

Use Turborepo.

```txt
apps/
  web/
  api/

packages/
  api-client/
  constants/
  i18n/
```

### Frontend

- Next.js
- TypeScript
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- TanStack Table
- OpenAPI-generated API client
- Localized validation and error messages

### Backend

- Go
- PostgreSQL
- Feature/domain-based folder structure
- Repository/service/handler structure
- DTOs and models
- Dependency injection
- zap for structured logging
- OpenAPI documentation
- Scalar or Swagger UI for API docs

### Database

- Supabase Postgres

Supabase should be used mainly as a managed PostgreSQL database at first.

The frontend should not directly mutate patient data in Supabase.

Correct flow:

```txt
Next.js frontend
  -> Go API
    -> Supabase Postgres
```

### Deployment

- Frontend: Vercel
- Backend: Railway
- Database: Supabase Postgres
- SMS provider: İleti Merkezi or Netgsm
- Cron jobs: Railway Cron Job

---

## 4. MVP Scope

### Build Now

- Authentication
- Clinic model
- Clinic membership model
- Patient CRUD
- Appointment CRUD
- Patient list page
- Monthly calendar page
- Shared patient modal
- Colleagues page
- SMS templates
- Manual SMS sending
- SMS logs
- Notification settings
- Daily SMS reminder cron
- Audit logs
- OpenAPI docs
- Generated TypeScript API client
- CI/CD checks

### Do Not Build Yet

- Mobile app
- WhatsApp integration
- Complex role/permission system
- Advanced doctor profiles
- Multi-clinic creation UI
- Complex analytics dashboard
- File uploads
- Full treatment planning system
- Exact-hour SMS scheduling
- Always-running background workers

---

## 5. Permissions and Access Model

For MVP, there is no complex permission system.

Rule:

```txt
Everyone in the same clinic can view and edit all clinic patients.
```

This matches the expected real-world usage where all users are doctors in the same clinic.

Even without complex permissions, the system must still include:

- clinic_id isolation
- audit logs
- soft deletes
- created_by_user_id
- updated_by_user_id

Every important query must be scoped by clinic_id.

Example rule:

```txt
Only fetch patients where patient.clinic_id = current_user.clinic_id
```

Never allow a user from one clinic to access another clinic's data.

---

## 6. Core Screens

## 6.1 Patients Page

The patients page shows all patients in a table.

### Columns

- Patient name
- Phone
- Status
- Next appointment
- Last updated
- Actions

### Actions

- View
- Edit
- Soft delete
- Send SMS

### Patient Statuses

```txt
active_treatment
completed
cancelled
waiting
inactive
```

Use:

- shadcn DataTable
- TanStack Table
- TanStack Query
- Shared patient modal

---

## 6.2 Calendar Page

The calendar page is a simple monthly appointment overview.

### Features

- Month selector
- Appointments grouped by day
- Add patient / appointment button
- Click appointment to open patient modal

Do not build a full Google Calendar clone.

The calendar only needs to show monthly appointment distribution clearly.

---

## 6.3 Patient Modal

Use one shared modal for patient-related workflows.

The same modal should support:

- Create patient
- View patient
- Edit patient
- Create appointment
- Edit appointment
- Preview SMS
- Send SMS
- View audit/history

### Modal Sections

- Patient info
- Treatment/internal notes
- Appointments
- SMS preview
- Audit/history

Treatment notes are internal and should not be sent in SMS messages.

---

## 6.4 Colleagues Page

A simple page that lists doctors in the same clinic.

### Fields

- Doctor name
- Email
- Clinic
- Joined date

No advanced doctor profile system is needed for MVP.

---

## 7. Frontend Structure

```txt
apps/web/src/
  app/
    patients/page.tsx
    calendar/page.tsx
    colleagues/page.tsx

  features/
    patients/
      components/
      hooks/
      schemas/
      pages/

    calendar/
      components/
      hooks/
      pages/

    colleagues/
    sms/
    auth/

  components/
    ui/
    layout/
    feedback/

  lib/
    api/
    query-client.ts
```

Route files should stay thin.

Example:

```tsx
import { PatientsPage } from "@/features/patients/pages/patients-page";

export default function Page() {
  return <PatientsPage />;
}
```

Do not put large components directly under routes.

---

## 8. Frontend Error Handling

Error handling should be local where possible.

The entire app should not crash because one section fails.

Examples:

```txt
Calendar fails -> only calendar section shows an error
Patient table fails -> only table section shows an error
Modal request fails -> modal shows retry/error
```

Use:

- TanStack Query error states
- Local error components
- Local ErrorBoundary where useful
- Next.js error.tsx for route-level fallback
- global-error.tsx only for fatal crashes

Each feature can have its own error component.

Example:

```txt
features/calendar/components/calendar-error.tsx
features/patients/components/patient-table-error.tsx
```

---

## 9. Backend Structure

Use feature/domain-based folders.

```txt
apps/api/
  cmd/
    api/
      main.go

  internal/
    app/
      server.go
      routes.go
      dependencies.go

    platform/
      config/
      db/
      logger/
      sms/
      openapi/

    features/
      auth/
      clinics/
      users/
      patients/
      appointments/
      sms/
      audit/

  migrations/
```

Inside each feature:

```txt
handler.go
service.go
repository.go
model.go
dto.go
```

Prefer feature folders over global folders like:

```txt
controllers/
services/
repositories/
```

Feature-based organization scales better for this project.

---

## 10. Backend Error Response Format

The backend should return stable error codes.

Example:

```json
{
  "success": false,
  "error": {
    "code": "PATIENT_NOT_FOUND",
    "message": "Patient not found"
  }
}
```

Frontend and mobile clients should translate by error code.

Examples:

```txt
PATIENT_NOT_FOUND -> Hasta bulunamadı
SMS_SEND_FAILED -> SMS gönderilemedi
UNAUTHORIZED -> Oturumunuzun süresi doldu
```

Do not rely on backend message text for user-facing Turkish copy.

Backend messages can remain technical or English.

---

## 11. Database Tables

Minimum tables:

```txt
users
clinics
clinic_members
patients
appointments
sms_templates
sms_messages
notification_settings
audit_logs
```

Important common fields:

```txt
clinic_id
created_at
updated_at
deleted_at where needed
created_by_user_id
updated_by_user_id
```

Use soft delete for patients.

---

## 12. Suggested Data Model Notes

### users

Stores authenticated users/doctors.

Relevant fields:

```txt
id
email
full_name
created_at
updated_at
```

### clinics

Stores clinics.

Relevant fields:

```txt
id
name
created_at
updated_at
```

### clinic_members

Connects users to clinics.

Relevant fields:

```txt
id
clinic_id
user_id
status
created_at
updated_at
```

For MVP, all active clinic members can edit clinic patients.

Optional future field:

```txt
role
```

This can be added or kept unused for future permissions.

### patients

Relevant fields:

```txt
id
clinic_id
full_name
phone
status
treatment_note
internal_note
created_by_user_id
updated_by_user_id
created_at
updated_at
deleted_at
```

### appointments

Relevant fields:

```txt
id
clinic_id
patient_id
doctor_user_id
starts_at
status
note
created_at
updated_at
deleted_at
```

Appointment statuses:

```txt
planned
confirmed
completed
cancelled
no_show
```

### sms_templates

Relevant fields:

```txt
id
clinic_id
key
title
body
enabled
created_at
updated_at
```

### sms_messages

Relevant fields:

```txt
id
clinic_id
patient_id
appointment_id
template_id
phone
message
status
provider
provider_message_id
error_message
reminder_type
days_before
sent_at
created_by_user_id
created_at
updated_at
```

SMS statuses:

```txt
queued
sent
failed
cancelled
```

### notification_settings

Relevant fields:

```txt
id
clinic_id
reminder_days_before
send_hour
enabled
created_at
updated_at
```

Example:

```ts
NotificationSetting {
  id
  clinicId
  reminderDaysBefore: number[] // example: [1, 7]
  sendHour: 6
  enabled: true
}
```

### audit_logs

Relevant fields:

```txt
id
clinic_id
actor_user_id
entity_type
entity_id
action
summary
before
after
ip_address
user_agent
created_at
```

Audit summaries should be human-readable.

Example:

```txt
Dr. Ahmet changed the appointment date from 12 May 14:00 to 15 May 16:30.
```

---

## 13. SMS System

Use SMS templates.

Do not allow fully free-form treatment-heavy SMS messages in MVP.

Good SMS example:

```txt
Merhaba {patientName}, {date} saat {time} tarihinde randevunuz bulunmaktadır. Değişiklik için kliniğinizle iletişime geçebilirsiniz.
```

Avoid:

```txt
Aparey kontrolünüz için randevunuz var.
```

Reason:

Treatment details should stay internal. SMS messages can be visible to other people on the patient's phone.

### SMS Providers

Use either:

- İleti Merkezi
- Netgsm

Wrap provider usage behind an interface.

Example:

```go
type SMSProvider interface {
    SendSMS(to string, message string) (*SMSResult, error)
}
```

Suggested structure:

```txt
platform/sms/
  provider.go
  iletimerkezi.go
  netgsm.go
```

This makes it easier to switch providers later.

---

## 14. SMS Reminder Logic

Do not run an always-on SMS worker.

Do not check every 5 minutes.

For this clinic use case, daily reminders are enough.

### Railway Cron

Run one daily Railway Cron Job.

Cron expression:

```txt
0 6 * * *
```

Command:

```txt
./app send-daily-reminders
```

The job runs every day at 06:00.

### Reminder Logic

At 06:00, the backend job should:

1. Load active notification settings
2. Check reminderDaysBefore values
3. Find appointments matching those future dates
4. Create sms_messages records
5. Prevent duplicates
6. Send SMS
7. Mark SMS as sent or failed
8. Write audit log
9. Exit

Example settings:

```txt
Send reminder 1 day before appointment
Send reminder 3 days before appointment
Send reminder 7 days before appointment
```

If today is May 10 and the clinic has reminderDaysBefore = [1, 7]:

```txt
Find appointments on May 11
Find appointments on May 17
Send reminders for both groups
```

### Duplicate Prevention

Prevent duplicate reminders.

Add a unique constraint:

```sql
unique (appointment_id, reminder_type, days_before)
```

This ensures the same reminder is not sent twice for the same appointment.

Example:

```txt
Appointment: 20 May 14:00
Reminder: 1 day before

Only one SMS can exist for:
appointment_id + appointment_reminder + 1
```

---

## 15. OpenAPI and Type-Safe Client

Use OpenAPI documentation in the Go backend.

Flow:

```txt
Go backend
  -> OpenAPI docs
    -> Generate TypeScript client
      -> Next.js uses generated client
        -> React Query hooks wrap generated client
```

The generated client should live in:

```txt
packages/api-client/
```

Frontend should call backend through this generated client where possible.

This improves type safety and makes the project stronger for portfolio/interview discussions.

---

## 16. Deployment Plan

### Vercel

Deploy frontend from:

```txt
apps/web
```

Frontend environment variable:

```txt
NEXT_PUBLIC_API_URL=https://your-railway-api-url
```

### Railway

Deploy backend from:

```txt
apps/api
```

Railway services:

```txt
API service:
./app server

Cron service:
./app send-daily-reminders
```

Railway environment variables:

```txt
DATABASE_URL
JWT_SECRET
SMS_PROVIDER
SMS_API_KEY
SMS_API_SECRET
INTERNAL_JOB_SECRET
APP_ENV
```

### Supabase

Use Supabase as managed PostgreSQL.

The Go API connects to Supabase using DATABASE_URL.

The frontend should not directly write patient data to Supabase.

---

## 17. CI/CD

Use GitHub Actions.

Minimum checks:

### Go API

```txt
go test ./...
go vet ./...
```

### Web

```txt
bun install
bun run lint
bun run typecheck
bun run build
```

Vercel and Railway can auto-deploy from GitHub after checks pass.

---

## 18. Build Order

Recommended build order:

```txt
1. Monorepo setup
2. Go API skeleton
3. Supabase Postgres connection
4. Migrations
5. Auth
6. Clinic + clinic_members
7. Patient CRUD
8. Patient table
9. Patient modal
10. Appointment CRUD
11. Calendar page
12. SMS templates
13. Manual SMS send/log
14. Notification settings
15. Daily Railway cron
16. Audit log
17. OpenAPI docs
18. Generated API client
19. Deploy backend to Railway
20. Deploy frontend to Vercel
```

---

## 19. Important Product Rules

Do not skip:

- clinic_id isolation
- audit logs
- soft delete
- SMS logs
- duplicate SMS prevention
- template-based SMS messages
- local frontend error handling
- OpenAPI code generation

Do not overbuild:

- mobile
- WhatsApp
- exact-hour SMS scheduling
- complex permission system
- big dashboard
- advanced doctor profile
- file uploads

---

## 20. Portfolio / Interview Value

This project can be described as:

> Built a Go backend and Next.js frontend for a clinic patient and appointment management system. Designed clinic-level data isolation, audit logging, appointment reminders, template-based SMS notifications, OpenAPI-generated TypeScript client, and deployed the backend on Railway with Supabase Postgres and Vercel frontend hosting.

Strong technical points to mention:

- Go backend with feature-based architecture
- PostgreSQL schema design
- Multi-tenant clinic isolation with clinic_id
- Audit logging
- SMS provider abstraction
- Scheduled Railway cron jobs
- OpenAPI documentation
- Generated TypeScript API client
- React Query integration
- shadcn UI
- Local frontend error handling
- CI/CD with GitHub Actions
- Budget-conscious deployment architecture

---

## 21. Final Architecture Summary

```txt
Vercel Next.js frontend
  -> Railway Go API
    -> Supabase Postgres
    -> SMS provider

Railway Cron Job
  -> ./app send-daily-reminders
    -> Supabase Postgres
    -> SMS provider
```

Final stack:

```txt
Next.js + Go + Supabase Postgres + Railway + Vercel
```

Main principle:

> Keep the MVP boring, reliable, cheap, and easy to explain.
