export const patientStatuses = [
  "active_treatment",
  "completed",
  "cancelled",
  "waiting",
  "inactive",
] as const;

export type PatientStatus = (typeof patientStatuses)[number];

export const appointmentStatuses = [
  "planned",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export const smsStatuses = ["queued", "sent", "failed", "cancelled"] as const;

export type SMSStatus = (typeof smsStatuses)[number];

export const clinicMemberStatuses = ["active", "invited", "disabled"] as const;

export type ClinicMemberStatus = (typeof clinicMemberStatuses)[number];

export const auditEntityTypes = [
  "patient",
  "appointment",
  "sms_template",
  "sms_message",
  "notification_setting",
  "clinic_member",
] as const;

export type AuditEntityType = (typeof auditEntityTypes)[number];

export const auditActions = [
  "create",
  "update",
  "soft_delete",
  "send_sms",
  "send_reminder",
  "settings_update",
] as const;

export type AuditAction = (typeof auditActions)[number];

export const reminderTypes = ["appointment_reminder", "manual"] as const;

export type ReminderType = (typeof reminderTypes)[number];
