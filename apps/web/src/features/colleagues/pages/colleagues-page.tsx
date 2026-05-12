"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useClinicContext } from "@/features/auth/components/clinic-context-provider";
import { ColleaguesError, ColleaguesLoading } from "@/features/colleagues/components/colleagues-state";
import { ColleaguesTable } from "@/features/colleagues/components/colleagues-table";
import { useColleagues } from "@/features/colleagues/hooks/use-colleagues";

export function ColleaguesPage() {
  const { clinic } = useClinicContext();
  const colleaguesQuery = useColleagues();

  return (
    <AppShell currentPath="/colleagues">
      <PageHeader
        description={`Doctors attached to ${clinic.name}.`}
        title="Colleagues"
      />

      {colleaguesQuery.isLoading ? <ColleaguesLoading /> : null}
      {colleaguesQuery.isError ? <ColleaguesError /> : null}
      {colleaguesQuery.data ? (
        <ColleaguesTable colleagues={colleaguesQuery.data} />
      ) : null}
    </AppShell>
  );
}
