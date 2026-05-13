"use client";

import type { Patient, PatientInput, SMSTemplate } from "@orthodontics-helper/api-client";
import { patientStatuses } from "@orthodontics-helper/constants";
import {
  Bell,
  CalendarPlus,
  History,
  MessageSquareText,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useI18n } from "@/components/layout/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePatient, useDeletePatient, useUpdatePatient } from "@/features/patients/hooks/use-patients";
import {
  patientSchema,
  type PatientFormValues,
} from "@/features/patients/schemas/patient-schema";
import {
  defaultSMSTemplates,
  useSendManualSMS,
  useSMSTemplates,
} from "@/features/sms/hooks/use-sms";

export type PatientModalMode = "create" | "edit";

export function PatientModal({
  mode,
  patient,
  open,
  onClose,
}: {
  mode: PatientModalMode;
  patient?: Patient;
  open: boolean;
  onClose: () => void;
}) {
  const { locale, t } = useI18n();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();
  const templatesQuery = useSMSTemplates();
  const sendSMS = useSendManualSMS();
  const templates = templatesQuery.data ?? defaultSMSTemplates;
  const [values, setValues] = useState<PatientFormValues>(defaultValues(patient));
  const [reminderDaysText, setReminderDaysText] = useState(
    values.reminderDaysBefore.join(", "),
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templates[0]?.id ?? "",
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const nextValues = defaultValues(patient);
    setValues(nextValues);
    setReminderDaysText(nextValues.reminderDaysBefore.join(", "));
    setErrors({});
  }, [patient, open]);

  useEffect(() => {
    if (!selectedTemplateId && templates[0]) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [selectedTemplateId, templates]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  );

  if (!open) {
    return null;
  }

  const title = mode === "create" ? t("patientModal.createTitle") : patient?.fullName ?? t("patientModal.editTitle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const candidateValues = {
      ...values,
      reminderDaysBefore: parseReminderDays(reminderDaysText),
    };
    const result = patientSchema.safeParse(candidateValues);

    if (!result.success) {
      setErrors(fieldErrors(result.error.flatten().fieldErrors, t));
      return;
    }

    setErrors({});
    const input = patientInput(result.data);

    if (mode === "create") {
      await createPatient.mutateAsync(input);
      onClose();
      return;
    }

    if (patient) {
      await updatePatient.mutateAsync({ id: patient.id, input });
      onClose();
    }
  };

  const updateField = <TKey extends keyof PatientFormValues>(
    key: TKey,
    value: PatientFormValues[TKey],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const pending =
    createPatient.isPending ||
    updatePatient.isPending ||
    deletePatient.isPending ||
    sendSMS.isPending;
  const smsPreview = renderTemplate(selectedTemplate, patient, values, locale);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/30 p-0 md:items-center md:justify-center md:p-6">
      <div className="max-h-[96vh] w-full overflow-y-auto rounded-t-lg border bg-background shadow-lg md:max-w-5xl md:rounded-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {t("patientModal.description")}
            </p>
          </div>
          <Button aria-label={t("patientModal.close")} variant="ghost" onClick={onClose}>
            <X aria-hidden="true" />
          </Button>
        </div>

        <form className="grid gap-4 p-5 lg:grid-cols-[1.35fr_0.9fr]" onSubmit={submit}>
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("patientModal.patientInfo")}</CardTitle>
                <CardDescription>{t("patientModal.patientInfoDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label={t("patientModal.patientName")} error={errors.fullName}>
                  <Input
                    value={values.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                  />
                </Field>
                <Field label={t("patientModal.phone")} error={errors.phone}>
                  <Input
                    value={values.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </Field>
                <Field label={t("patientModal.status")} error={errors.status}>
                  <Select
                    value={values.status}
                    onChange={(event) =>
                      updateField("status", event.target.value as PatientFormValues["status"])
                    }
                  >
                    {patientStatuses.map((status) => (
                      <option key={status} value={status}>
                        {t(`status.${status}`)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("patientModal.notesTitle")}</CardTitle>
                <CardDescription>{t("patientModal.notesDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label={t("patientModal.treatmentNote")}>
                  <Textarea
                    value={values.treatmentNote ?? ""}
                    onChange={(event) => updateField("treatmentNote", event.target.value)}
                  />
                </Field>
                <Field label={t("patientModal.internalNote")}>
                  <Textarea
                    value={values.internalNote ?? ""}
                    onChange={(event) => updateField("internalNote", event.target.value)}
                  />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <Bell aria-hidden="true" />
                    {t("patientModal.reminderSettings")}
                  </span>
                </CardTitle>
                <CardDescription>{t("patientModal.reminderSettingsDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <Field label={t("patientModal.reminders")}>
                  <Select
                    value={values.remindersEnabled ? "enabled" : "disabled"}
                    onChange={(event) =>
                      updateField("remindersEnabled", event.target.value === "enabled")
                    }
                  >
                    <option value="enabled">{t("common.enabled")}</option>
                    <option value="disabled">{t("common.disabled")}</option>
                  </Select>
                </Field>
                <Field label={t("patientModal.daysBefore")} error={errors.reminderDaysBefore}>
                  <Input
                    inputMode="numeric"
                    placeholder="1, 3"
                    value={reminderDaysText}
                    onChange={(event) => setReminderDaysText(event.target.value)}
                  />
                </Field>
                <Field label={t("patientModal.sendHour")} error={errors.reminderSendHour}>
                  <Select
                    value={String(values.reminderSendHour)}
                    onChange={(event) =>
                      updateField("reminderSendHour", Number(event.target.value))
                    }
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <option key={hour} value={hour}>
                        {hour.toString().padStart(2, "0")}:00
                      </option>
                    ))}
                  </Select>
                </Field>
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-2 border-t pt-4 md:flex-row md:justify-between">
              <div>
                {patient && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    onClick={async () => {
                      await deletePatient.mutateAsync(patient.id);
                      onClose();
                    }}
                  >
                    <Trash2 data-icon="inline-start" aria-hidden="true" />
                    {t("patientModal.softDelete")}
                  </Button>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={pending}>
                  <Save data-icon="inline-start" aria-hidden="true" />
                  {t("patientModal.save")}
                </Button>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <MessageSquareText aria-hidden="true" />
                    {t("patientModal.smsTemplate")}
                  </span>
                </CardTitle>
                <CardDescription>{t("patientModal.smsTemplateDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Select
                  aria-label={t("patientModal.smsTemplate")}
                  value={selectedTemplate?.id ?? ""}
                  onChange={(event) => setSelectedTemplateId(event.target.value)}
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title}
                    </option>
                  ))}
                </Select>
                <p className="rounded-md border p-3 text-sm text-muted-foreground">
                  {smsPreview}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!patient || !selectedTemplate || pending}
                  onClick={async () => {
                    if (!patient || !selectedTemplate) {
                      return;
                    }
                    await sendSMS.mutateAsync({
                      patientId: patient.id,
                      templateId: selectedTemplate.id,
                    });
                  }}
                >
                  <MessageSquareText data-icon="inline-start" aria-hidden="true" />
                  {t("patientModal.sendSms")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <CalendarPlus aria-hidden="true" />
                    {t("patientModal.appointments")}
                  </span>
                </CardTitle>
                <CardDescription>{t("patientModal.appointmentsDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("patientModal.appointmentsBody")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <History aria-hidden="true" />
                    {t("patientModal.auditHistory")}
                  </span>
                </CardTitle>
                <CardDescription>{t("patientModal.auditHistoryDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("patientModal.auditHistoryBody")}
                </p>
              </CardContent>
            </Card>
          </aside>
        </form>
      </div>
    </div>
  );
}

type FieldErrors = Partial<Record<keyof PatientFormValues, string>>;

function fieldErrors(
  errors: Partial<Record<keyof PatientFormValues, string[] | undefined>>,
  t: (key: Parameters<ReturnType<typeof useI18n>["t"]>[0]) => string,
): FieldErrors {
  return Object.fromEntries(
    Object.entries(errors).flatMap(([field, messages]) => {
      if (!messages?.[0]) {
        return [];
      }

      const translated = translatedFieldError(field as keyof PatientFormValues, t);
      return [[field, translated ?? messages[0]]];
    }),
  ) as FieldErrors;
}

function translatedFieldError(
  field: keyof PatientFormValues,
  t: (key: Parameters<ReturnType<typeof useI18n>["t"]>[0]) => string,
) {
  switch (field) {
    case "fullName":
      return t("patientModal.validation.fullName");
    case "phone":
      return t("patientModal.validation.phone");
    case "reminderDaysBefore":
      return t("patientModal.validation.reminderDaysBefore");
    case "reminderSendHour":
      return t("patientModal.validation.reminderSendHour");
    default:
      return undefined;
  }
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function defaultValues(patient?: Patient): PatientFormValues {
  return {
    fullName: patient?.fullName ?? "",
    phone: patient?.phone ?? "",
    status: patient?.status ?? "active_treatment",
    treatmentNote: patient?.treatmentNote ?? "",
    internalNote: patient?.internalNote ?? "",
    remindersEnabled: patient?.remindersEnabled ?? true,
    reminderDaysBefore: patient?.reminderDaysBefore ?? [1],
    reminderSendHour: patient?.reminderSendHour ?? 9,
  };
}

function patientInput(values: PatientFormValues): PatientInput {
  return {
    fullName: values.fullName,
    phone: values.phone,
    status: values.status,
    treatmentNote: values.treatmentNote ?? "",
    internalNote: values.internalNote ?? "",
    remindersEnabled: values.remindersEnabled,
    reminderDaysBefore: values.reminderDaysBefore,
    reminderSendHour: values.reminderSendHour,
  };
}

function parseReminderDays(value: string) {
  const days = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((day) => Number.isInteger(day) && day >= 0);

  return days.length > 0 ? days : [];
}

function renderTemplate(
  template: SMSTemplate | undefined,
  patient: Patient | undefined,
  values: PatientFormValues,
  locale: string,
) {
  const body = template?.body ?? defaultSMSTemplates[0]?.body ?? "";
  const name = values.fullName || patient?.fullName || "{patientName}";
  const appointmentDate = patient?.nextAppointment
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(patient.nextAppointment))
    : "{appointmentDate}";

  return body
    .replaceAll("{patientName}", name)
    .replaceAll("{appointmentDate}", appointmentDate);
}
