"use client";

import { useI18n } from "@/components/layout/i18n-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PatientTableLoading() {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("patients.tableTitle")}</CardTitle>
        <CardDescription>{t("patients.loading")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 rounded-md bg-secondary" />
      </CardContent>
    </Card>
  );
}

export function PatientTableError() {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("patients.tableTitle")}</CardTitle>
        <CardDescription>{t("patients.loadError")}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {t("patients.loadErrorBody")}
        </p>
      </CardContent>
    </Card>
  );
}

export function PatientTableEmpty() {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("patients.tableTitle")}</CardTitle>
        <CardDescription>{t("patients.empty")}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {t("patients.emptyBody")}
        </p>
      </CardContent>
    </Card>
  );
}
