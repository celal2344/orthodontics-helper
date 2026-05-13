create extension if not exists pgcrypto;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'doctor@example.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Deniz Kaya"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-4333-8333-333333333333',
    'authenticated',
    'authenticated',
    'alexis@example.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Alexis Morgan"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-8444-444444444444',
    'authenticated',
    'authenticated',
    'weddi@example.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Weddi Arslan"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do update
set email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    '{"sub":"22222222-2222-4222-8222-222222222222","email":"doctor@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    '{"sub":"33333333-3333-4333-8333-333333333333","email":"alexis@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '44444444-4444-4444-8444-444444444444',
    '44444444-4444-4444-8444-444444444444',
    '{"sub":"44444444-4444-4444-8444-444444444444","email":"weddi@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  )
on conflict (provider, provider_id) do update
set identity_data = excluded.identity_data,
    updated_at = now();

insert into public.clinics (id, name)
values ('11111111-1111-4111-8111-111111111111', 'Istanbul Orthodontics')
on conflict (id) do update
set name = excluded.name,
    updated_at = now();

insert into public.users (id, email, full_name)
values
  ('22222222-2222-4222-8222-222222222222', 'doctor@example.com', 'Dr. Deniz Kaya'),
  ('33333333-3333-4333-8333-333333333333', 'alexis@example.com', 'Dr. Alexis Morgan'),
  ('44444444-4444-4444-8444-444444444444', 'weddi@example.com', 'Dr. Weddi Arslan')
on conflict (id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    updated_at = now();

insert into public.clinic_members (clinic_id, user_id, status)
values
  ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'active'),
  ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', 'active'),
  ('11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444444', 'active')
on conflict (clinic_id, user_id) do update
set status = excluded.status,
    updated_at = now();

insert into public.notification_settings (
  clinic_id,
  reminder_days_before,
  send_hour,
  enabled
)
values ('11111111-1111-4111-8111-111111111111', array[3, 1], 9, true)
on conflict (clinic_id) do update
set reminder_days_before = excluded.reminder_days_before,
    send_hour = excluded.send_hour,
    enabled = excluded.enabled,
    updated_at = now();

insert into public.sms_templates (id, clinic_id, key, title, body, enabled)
values
  (
    '55555555-5555-4555-8555-555555555551',
    '11111111-1111-4111-8111-111111111111',
    'appointment_reminder',
    'Appointment reminder',
    'Hello {patientName}, you have an appointment on {date} at {time}.',
    true
  ),
  (
    '55555555-5555-4555-8555-555555555552',
    '11111111-1111-4111-8111-111111111111',
    'manual_reminder',
    'Manual reminder',
    'Hello {patientName}, please contact your clinic for your appointment information.',
    true
  ),
  (
    '55555555-5555-4555-8555-555555555553',
    '11111111-1111-4111-8111-111111111111',
    'treatment_followup',
    'Treatment follow-up',
    'Hello {patientName}, this is a quick follow-up from your orthodontic clinic.',
    true
  )
on conflict (clinic_id, key) do update
set title = excluded.title,
    body = excluded.body,
    enabled = excluded.enabled,
    updated_at = now();

insert into public.patients (
  id,
  clinic_id,
  full_name,
  phone,
  status,
  treatment_note,
  internal_note,
  reminders_enabled,
  reminder_days_before,
  reminder_send_hour,
  created_by_user_id,
  updated_by_user_id
)
values
  (
    '66666666-6666-4666-8666-666666666661',
    '11111111-1111-4111-8111-111111111111',
    'Mert Yilmaz',
    '+905551110001',
    'active_treatment',
    'Upper braces adjustment.',
    'Prefers morning appointments.',
    true,
    array[3, 1],
    9,
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222'
  ),
  (
    '66666666-6666-4666-8666-666666666662',
    '11111111-1111-4111-8111-111111111111',
    'Elif Demir',
    '+905551110002',
    'waiting',
    'Initial consultation scheduled.',
    'Needs x-ray review.',
    true,
    array[2, 1],
    10,
    '33333333-3333-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333'
  ),
  (
    '66666666-6666-4666-8666-666666666663',
    '11111111-1111-4111-8111-111111111111',
    'Can Aydin',
    '+905551110003',
    'active_treatment',
    'Aligner tracking check.',
    'Bring latest aligner set.',
    true,
    array[1],
    8,
    '44444444-4444-4444-8444-444444444444',
    '44444444-4444-4444-8444-444444444444'
  ),
  (
    '66666666-6666-4666-8666-666666666664',
    '11111111-1111-4111-8111-111111111111',
    'Zeynep Sahin',
    '+905551110004',
    'completed',
    'Retainer check only.',
    '',
    false,
    array[1],
    9,
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222'
  )
on conflict (id) do update
set full_name = excluded.full_name,
    phone = excluded.phone,
    status = excluded.status,
    treatment_note = excluded.treatment_note,
    internal_note = excluded.internal_note,
    reminders_enabled = excluded.reminders_enabled,
    reminder_days_before = excluded.reminder_days_before,
    reminder_send_hour = excluded.reminder_send_hour,
    updated_by_user_id = excluded.updated_by_user_id,
    updated_at = now(),
    deleted_at = null;

insert into public.appointments (
  id,
  clinic_id,
  patient_id,
  doctor_user_id,
  starts_at,
  status,
  note
)
values
  (
    '77777777-7777-4777-8777-777777777771',
    '11111111-1111-4111-8111-111111111111',
    '66666666-6666-4666-8666-666666666661',
    '22222222-2222-4222-8222-222222222222',
    date_trunc('month', now()) + interval '7 days 10 hours',
    'confirmed',
    'Wire adjustment'
  ),
  (
    '77777777-7777-4777-8777-777777777772',
    '11111111-1111-4111-8111-111111111111',
    '66666666-6666-4666-8666-666666666662',
    '33333333-3333-4333-8333-333333333333',
    date_trunc('month', now()) + interval '12 days 14 hours',
    'planned',
    'Consultation'
  ),
  (
    '77777777-7777-4777-8777-777777777773',
    '11111111-1111-4111-8111-111111111111',
    '66666666-6666-4666-8666-666666666663',
    '44444444-4444-4444-8444-444444444444',
    date_trunc('month', now()) + interval '16 days 9 hours',
    'planned',
    'Aligner check'
  ),
  (
    '77777777-7777-4777-8777-777777777774',
    '11111111-1111-4111-8111-111111111111',
    '66666666-6666-4666-8666-666666666664',
    '22222222-2222-4222-8222-222222222222',
    date_trunc('month', now()) + interval '28 days 11 hours',
    'planned',
    'Retainer check'
  )
on conflict (id) do update
set doctor_user_id = excluded.doctor_user_id,
    starts_at = excluded.starts_at,
    status = excluded.status,
    note = excluded.note,
    updated_at = now(),
    deleted_at = null;

