"use client";

import type { Patient } from "@orthodontics-helper/api-client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PatientModal,
  type PatientModalMode,
} from "@/features/patients/components/patient-modal";
import {
  PatientTableEmpty,
  PatientTableError,
  PatientTableLoading,
} from "@/features/patients/components/patient-states";
import { PatientTable } from "@/features/patients/components/patient-table";
import { usePatients } from "@/features/patients/hooks/use-patients";

export function PatientsPage() {
  const [query, setQuery] = useState("");
  const [modalMode, setModalMode] = useState<PatientModalMode>("create");
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const patientsQuery = usePatients(query);

  function openModal(patient: Patient | undefined, mode: PatientModalMode) {
    setSelectedPatient(patient);
    setModalMode(mode);
    setModalOpen(true);
  }

  return (
    <AppShell currentPath="/patients">
      <PageHeader
        action={
          <Button onClick={() => openModal(undefined, "create")}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add patient
          </Button>
        }
        description="Clinic-scoped patient records, appointments, reminders, and audit history."
        title="Patients"
      />

      <Input
        aria-label="Search patients"
        className="md:max-w-sm"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or phone"
        value={query}
      />

      {patientsQuery.isLoading ? <PatientTableLoading /> : null}
      {patientsQuery.isError ? <PatientTableError /> : null}
      {patientsQuery.data?.length === 0 ? <PatientTableEmpty /> : null}
      {patientsQuery.data && patientsQuery.data.length > 0 ? (
        <PatientTable
          patients={patientsQuery.data}
          onOpen={(patient, mode) => openModal(patient, mode)}
          onSendSMS={(patient) => openModal(patient, "sms")}
        />
      ) : null}

      <PatientModal
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onModeChange={setModalMode}
        open={modalOpen}
        patient={selectedPatient}
      />
    </AppShell>
  );
}
