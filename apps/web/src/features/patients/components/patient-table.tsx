"use client";

import type { Patient } from "@orthodontics-helper/api-client";
import { useI18n } from "@/components/layout/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PatientTable({
  patients,
  onOpen,
}: {
  patients: Patient[];
  onOpen: (patient: Patient, mode: "edit") => void;
}) {
  const { locale, t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("patients.tableTitle")}</CardTitle>
        <CardDescription>{t("patients.records", { count: patients.length })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("patients.table.patientName")}</TableHead>
                <TableHead>{t("patients.table.phone")}</TableHead>
                <TableHead>{t("patients.table.status")}</TableHead>
                <TableHead>{t("patients.table.nextAppointment")}</TableHead>
                <TableHead>{t("patients.table.lastUpdated")}</TableHead>
                <TableHead className="text-right">{t("patients.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.fullName}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    <Badge>{t(`status.${patient.status}`)}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(patient.nextAppointment, locale)}</TableCell>
                  <TableCell>{formatDate(patient.updatedAt, locale)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => onOpen(patient, "edit")}>
                        {t("patients.table.open")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(value?: string, locale = "en") {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value?: string, locale = "en") {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
