"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useI18n } from "@/components/layout/i18n-provider";
import { PageHeader } from "@/components/layout/page-header";
import { useClinicContext } from "@/features/auth/components/clinic-context-provider";
import { ColleaguesError, ColleaguesLoading } from "@/features/colleagues/components/colleagues-state";
import { ColleaguesTable } from "@/features/colleagues/components/colleagues-table";
import { useColleagues } from "@/features/colleagues/hooks/use-colleagues";
import { usePatients } from "@/features/patients/hooks/use-patients";

export function ColleaguesPage() {
  const { t } = useI18n();
  const { clinic } = useClinicContext();
  const colleaguesQuery = useColleagues();
  const patientsQuery = usePatients("");

  return (
    <AppShell currentPath="/colleagues">
      <PageHeader
        description={t("colleagues.description", { clinicName: clinic.name })}
        title={t("colleagues.title")}
      />

      {colleaguesQuery.isLoading ? <ColleaguesLoading /> : null}
      {colleaguesQuery.isError ? <ColleaguesError /> : null}
      {colleaguesQuery.data ? (
        <ColleaguesTable
          colleagues={colleaguesQuery.data}
          patients={patientsQuery.data ?? []}
        />
      ) : null}
    </AppShell>
  );
}
