"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useI18n } from "@/components/layout/i18n-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useClinicContext } from "@/features/auth/components/clinic-context-provider";

export function ProfilePage() {
  const { t } = useI18n();
  const { user, clinic } = useClinicContext();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);

  return (
    <AppShell currentPath="/profile">
      <PageHeader
        action={
          <Button>
            <Save data-icon="inline-start" aria-hidden="true" />
            {t("profile.save")}
          </Button>
        }
        description={t("profile.description")}
        title={t("profile.title")}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t("profile.personalInfo")}</CardTitle>
          <CardDescription>{t("profile.personalInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            {t("profile.fullName")}
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            {t("profile.email")}
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
            {t("profile.clinic")}
            <Input disabled value={clinic.name} />
          </label>
        </CardContent>
      </Card>
    </AppShell>
  );
}
