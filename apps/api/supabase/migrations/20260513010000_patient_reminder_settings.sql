alter table public.patients
  add column if not exists reminders_enabled boolean not null default true,
  add column if not exists reminder_days_before integer[] not null default array[1],
  add column if not exists reminder_send_hour smallint not null default 9;

alter table public.patients
  drop constraint if exists patients_reminder_send_hour_check,
  add constraint patients_reminder_send_hour_check
    check (reminder_send_hour between 0 and 23);
