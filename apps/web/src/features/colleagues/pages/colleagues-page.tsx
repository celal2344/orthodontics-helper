"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useI18n } from "@/components/layout/i18n-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClinicContext } from "@/features/auth/components/clinic-context-provider";
import { ColleaguesError, ColleaguesLoading } from "@/features/colleagues/components/colleagues-state";
import { ColleaguesTable } from "@/features/colleagues/components/colleagues-table";
import { useColleagues, useCreateClinicMember } from "@/features/colleagues/hooks/use-colleagues";
import { usePatients } from "@/features/patients/hooks/use-patients";

export function ColleaguesPage() {
  const { t } = useI18n();
  const { clinic } = useClinicContext();
  const colleaguesQuery = useColleagues();
  const createClinicMember = useCreateClinicMember();
  const patientsQuery = usePatients("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");

  async function addMember() {
    await createClinicMember.mutateAsync({
      fullName,
      email,
      temporaryPassword,
    });
    setFullName("");
    setEmail("");
    setTemporaryPassword("");
  }

  return (
    <AppShell currentPath="/colleagues">
      <PageHeader
        description={t("colleagues.description", { clinicName: clinic.name })}
        title={t("colleagues.title")}
      />

      <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
        <Input
          aria-label={t("colleagues.memberFullName")}
          placeholder={t("colleagues.memberFullName")}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
        <Input
          aria-label={t("colleagues.memberEmail")}
          placeholder={t("colleagues.memberEmail")}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          aria-label={t("colleagues.temporaryPassword")}
          placeholder={t("colleagues.temporaryPassword")}
          type="password"
          value={temporaryPassword}
          onChange={(event) => setTemporaryPassword(event.target.value)}
        />
        <Button disabled={createClinicMember.isPending} onClick={addMember}>
          {t("colleagues.addMember")}
        </Button>
      </div>

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
