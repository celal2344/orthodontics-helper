"use client";

import type { Patient, PatientInput } from "@orthodontics-helper/api-client";
import { patientStatuses } from "@orthodontics-helper/constants";
import { CalendarPlus, History, MessageSquareText, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
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

export type PatientModalMode = "create" | "view" | "edit" | "sms";

const statusLabels: Record<string, string> = {
  active_treatment: "Active treatment",
  completed: "Completed",
  cancelled: "Cancelled",
  waiting: "Waiting",
  inactive: "Inactive",
};

export function PatientModal({
  mode,
  patient,
  open,
  onClose,
  onModeChange,
}: {
  mode: PatientModalMode;
  patient?: Patient;
  open: boolean;
  onClose: () => void;
  onModeChange: (mode: PatientModalMode) => void;
}) {
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();
  const readonly = mode === "view" || mode === "sms";
  const [values, setValues] = useState<PatientFormValues>(defaultValues(patient));
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setValues(defaultValues(patient));
    setErrors({});
  }, [patient, open]);

  if (!open) {
    return null;
  }

  const title =
    mode === "create"
      ? "Create patient"
      : mode === "sms"
        ? "Send SMS"
        : patient?.fullName ?? "Patient";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (readonly) {
      return;
    }

    const result = patientSchema.safeParse(values);

    if (!result.success) {
      setErrors(fieldErrors(result.error.flatten().fieldErrors));
      return;
    }

    setErrors({});
    const input = patientInput(result.data);

    if (mode === "create") {
      await createPatient.mutateAsync(input);
      onClose();
      return;
    }

    if (mode === "edit" && patient) {
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
    createPatient.isPending || updatePatient.isPending || deletePatient.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/30 p-0 md:items-center md:justify-center md:p-6">
      <div className="max-h-[96vh] w-full overflow-y-auto rounded-t-lg border bg-background shadow-lg md:max-w-5xl md:rounded-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              Patient details, appointments, SMS, and audit history.
            </p>
          </div>
          <Button aria-label="Close modal" variant="ghost" onClick={onClose}>
            <X aria-hidden="true" />
          </Button>
        </div>

        <form className="grid gap-4 p-5 lg:grid-cols-[1.35fr_0.9fr]" onSubmit={submit}>
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient info</CardTitle>
                <CardDescription>Clinic-visible patient record</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label="Patient name" error={errors.fullName}>
                  <Input
                    disabled={readonly}
                    value={values.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                  />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <Input
                    disabled={readonly}
                    value={values.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </Field>
                <Field label="Status" error={errors.status}>
                  <Select
                    disabled={readonly}
                    value={values.status}
                    onChange={(event) =>
                      updateField("status", event.target.value as PatientFormValues["status"])
                    }
                  >
                    {patientStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="flex items-end justify-end gap-2">
                  {mode === "view" && (
                    <Button type="button" variant="outline" onClick={() => onModeChange("edit")}>
                      Edit patient
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Treatment and internal notes</CardTitle>
                <CardDescription>Internal notes are never sent in SMS messages</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label="Treatment note">
                  <Textarea
                    disabled={readonly}
                    value={values.treatmentNote ?? ""}
                    onChange={(event) => updateField("treatmentNote", event.target.value)}
                  />
                </Field>
                <Field label="Internal note">
                  <Textarea
                    disabled={readonly}
                    value={values.internalNote ?? ""}
                    onChange={(event) => updateField("internalNote", event.target.value)}
                  />
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
                    Soft delete
                  </Button>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {(mode === "create" || mode === "edit") && (
                  <Button type="submit" disabled={pending}>
                    <Save data-icon="inline-start" aria-hidden="true" />
                    Save patient
                  </Button>
                )}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <CalendarPlus aria-hidden="true" />
                    Appointments
                  </span>
                </CardTitle>
                <CardDescription>Appointment CRUD lands in the next slice</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Existing and new appointments will be managed here and opened from the calendar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <MessageSquareText aria-hidden="true" />
                    SMS preview
                  </span>
                </CardTitle>
                <CardDescription>Template-based only</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="rounded-md border p-3 text-sm text-muted-foreground">
                  Merhaba {values.fullName || "{patientName}"}, randevu bilginiz icin
                  kliniginizle iletisime gecebilirsiniz.
                </p>
                <Button type="button" variant="outline" onClick={() => onModeChange("sms")}>
                  Prepare SMS
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <History aria-hidden="true" />
                    Audit history
                  </span>
                </CardTitle>
                <CardDescription>Latest patient changes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Audit entries from patient, appointment, and SMS actions will appear here.
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
): FieldErrors {
  return Object.fromEntries(
    Object.entries(errors).flatMap(([field, messages]) =>
      messages?.[0] ? [[field, messages[0]]] : [],
    ),
  ) as FieldErrors;
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
  };
}

function patientInput(values: PatientFormValues): PatientInput {
  return {
    fullName: values.fullName,
    phone: values.phone,
    status: values.status,
    treatmentNote: values.treatmentNote ?? "",
    internalNote: values.internalNote ?? "",
  };
}
