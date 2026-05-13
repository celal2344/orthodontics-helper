"use client";

import { useI18n } from "@/components/layout/i18n-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ColleaguesLoading() {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("colleagues.cardTitle")}</CardTitle>
        <CardDescription>{t("colleagues.loading")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-28 rounded-md bg-secondary" />
      </CardContent>
    </Card>
  );
}

export function ColleaguesError() {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("colleagues.cardTitle")}</CardTitle>
        <CardDescription>{t("colleagues.loadError")}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {t("colleagues.loadErrorBody")}
        </p>
      </CardContent>
    </Card>
  );
}
