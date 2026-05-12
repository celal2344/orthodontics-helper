create extension if not exists pgcrypto;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clinic_members (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, user_id)
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  full_name text not null,
  phone text not null,
  status text not null default 'active_treatment' check (status in ('active_treatment', 'completed', 'cancelled', 'waiting', 'inactive')),
  treatment_note text not null default '',
  internal_note text not null default '',
  created_by_user_id uuid references public.users(id) on delete set null,
  updated_by_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, clinic_id)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null,
  doctor_user_id uuid references public.users(id) on delete set null,
  starts_at timestamptz not null,
  status text not null default 'planned' check (status in ('planned', 'confirmed', 'completed', 'cancelled', 'no_show')),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (patient_id, clinic_id) references public.patients(id, clinic_id) on delete cascade
);

create table public.sms_templates (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  key text not null,
  title text not null,
  body text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, key)
);

create table public.sms_messages (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null,
  appointment_id uuid,
  template_id uuid references public.sms_templates(id) on delete set null,
  phone text not null,
  message text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'cancelled')),
  provider text not null,
  provider_message_id text,
  error_message text,
  reminder_type text not null check (reminder_type in ('appointment_reminder', 'manual')),
  days_before integer,
  sent_at timestamptz,
  created_by_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (patient_id, clinic_id) references public.patients(id, clinic_id) on delete cascade,
  foreign key (appointment_id) references public.appointments(id) on delete set null,
  check (
    (reminder_type = 'manual' and days_before is null)
    or (reminder_type = 'appointment_reminder' and days_before is not null)
  )
);

create table public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null unique references public.clinics(id) on delete cascade,
  reminder_days_before integer[] not null default array[1],
  send_hour smallint not null default 6 check (send_hour between 0 and 23),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (array_length(reminder_days_before, 1) > 0)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  summary text not null,
  before jsonb,
  after jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create unique index sms_messages_unique_appointment_reminder
  on public.sms_messages (appointment_id, reminder_type, days_before)
  where reminder_type = 'appointment_reminder' and appointment_id is not null;

create index clinic_members_clinic_id_idx on public.clinic_members (clinic_id);
create index patients_clinic_active_idx on public.patients (clinic_id, updated_at desc) where deleted_at is null;
create index appointments_clinic_starts_at_idx on public.appointments (clinic_id, starts_at) where deleted_at is null;
create index appointments_patient_id_idx on public.appointments (patient_id) where deleted_at is null;
create index sms_messages_clinic_created_at_idx on public.sms_messages (clinic_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (clinic_id, entity_type, entity_id, created_at desc);

alter table public.users enable row level security;
alter table public.clinics enable row level security;
alter table public.clinic_members enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.sms_templates enable row level security;
alter table public.sms_messages enable row level security;
alter table public.notification_settings enable row level security;
alter table public.audit_logs enable row level security;
