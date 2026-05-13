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
import { apiClient } from "@/lib/api/client";

export function ProfilePage() {
  const { t } = useI18n();
  const { user, clinic, refreshSession } = useClinicContext();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function saveProfile() {
    setPending(true);
    setMessage("");
    await apiClient.updateProfile({ fullName, email });
    if (password) {
      await apiClient.updatePassword({ password });
      setPassword("");
      setMessage(t("profile.passwordSaved"));
    } else {
      setMessage(t("profile.saved"));
    }
    await refreshSession();
    setPending(false);
  }

  return (
    <AppShell currentPath="/profile">
      <PageHeader
        action={
          <Button disabled={pending} onClick={saveProfile}>
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
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold">{t("profile.accountSecurity")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("profile.accountSecurityDescription")}
            </p>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
            {t("profile.password")}
            <Input
              autoComplete="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {message ? (
            <p className="text-sm text-muted-foreground md:col-span-2">{message}</p>
          ) : null}
        </CardContent>
      </Card>
    </AppShell>
  );
}
