"use client";

import { Bell, Clock, MessageSquareText } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useI18n } from "@/components/layout/i18n-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SettingsPage() {
  const { t } = useI18n();

  return (
    <AppShell currentPath="/settings">
      <PageHeader
        action={<Button>{t("settings.save")}</Button>}
        description={t("settings.description")}
        title={t("settings.title")}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <Bell aria-hidden="true" />
                {t("settings.reminders")}
              </span>
            </CardTitle>
            <CardDescription>{t("settings.remindersDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <label className="flex flex-col gap-2 text-sm font-medium">
              {t("settings.daysBeforeAppointment")}
              <Input defaultValue="1, 7" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              {t("settings.sendHour")}
              <Input defaultValue="06:00" />
            </label>
            <Badge>{t("common.enabled")}</Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <MessageSquareText aria-hidden="true" />
                {t("settings.smsTemplates")}
              </span>
            </CardTitle>
            <CardDescription>{t("settings.smsTemplatesDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-medium">{t("settings.appointmentReminder")}</p>
                <Badge>{t("common.enabled")}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("settings.appointmentReminderBody", {
                  patientName: "{patientName}",
                  date: "{date}",
                  time: "{time}",
                })}
              </p>
            </div>
            <div className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-medium">{t("settings.manualReminder")}</p>
                <Badge>{t("common.enabled")}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("settings.manualReminderBody", {
                  patientName: "{patientName}",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <Clock aria-hidden="true" />
              {t("settings.reminderJob")}
            </span>
          </CardTitle>
          <CardDescription>{t("settings.reminderJobDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <code className="rounded-md bg-secondary px-3 py-2 text-sm">
            ./app send-daily-reminders
          </code>
        </CardContent>
      </Card>
    </AppShell>
  );
}
