"use client";

import type { Colleague, Patient } from "@orthodontics-helper/api-client";
import { ChevronDown } from "lucide-react";
import { Fragment, useState } from "react";
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

export function ColleaguesTable({
  colleagues,
  patients,
}: {
  colleagues: Colleague[];
  patients: Patient[];
}) {
  const { locale, t } = useI18n();
  const [openDoctorId, setOpenDoctorId] = useState<string | undefined>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("colleagues.cardTitle")}</CardTitle>
        <CardDescription>
          {t("colleagues.cardDescription", {
            doctorCount: colleagues.length,
            patientCount: patients.length,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>{t("colleagues.table.doctorName")}</TableHead>
                <TableHead>{t("colleagues.table.email")}</TableHead>
                <TableHead>{t("colleagues.table.clinic")}</TableHead>
                <TableHead>{t("colleagues.table.patients")}</TableHead>
                <TableHead>{t("colleagues.table.upcoming")}</TableHead>
                <TableHead>{t("colleagues.table.joinedDate")}</TableHead>
                <TableHead>{t("colleagues.table.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colleagues.map((colleague, index) => {
                const assignedPatients = patients.filter(
                  (_, patientIndex) => patientIndex % colleagues.length === index,
                );
                const upcomingCount = assignedPatients.filter(
                  (patient) => patient.nextAppointment,
                ).length;
                const isOpen = openDoctorId === colleague.id;

                return (
                  <Fragment key={colleague.id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          aria-label={t(
                            isOpen ? "colleagues.collapseStats" : "colleagues.expandStats",
                            { doctorName: colleague.fullName },
                          )}
                          className="size-8 px-0"
                          variant="ghost"
                          onClick={() =>
                            setOpenDoctorId(isOpen ? undefined : colleague.id)
                          }
                        >
                          <ChevronDown
                            aria-hidden="true"
                            className={isOpen ? "rotate-180 transition" : "transition"}
                          />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {colleague.fullName}
                      </TableCell>
                      <TableCell>{colleague.email}</TableCell>
                      <TableCell>{colleague.clinic}</TableCell>
                      <TableCell>{assignedPatients.length}</TableCell>
                      <TableCell>{upcomingCount}</TableCell>
                      <TableCell>
                        {formatDate(colleague.joinedAt, locale)}
                      </TableCell>
                      <TableCell>
                        <Badge>{t("common.active")}</Badge>
                      </TableCell>
                    </TableRow>
                    {isOpen ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          {assignedPatients.length > 0 ? (
                            <div className="flex flex-col gap-3 rounded-md bg-secondary/30 p-3">
                              <div className="grid gap-2 text-sm md:grid-cols-4">
                                <Stat label={t("colleagues.share")} value={patientShare(assignedPatients.length, patients.length)} />
                                <Stat label={t("status.active_treatment")} value={countByStatus(assignedPatients, "active_treatment")} />
                                <Stat label={t("status.waiting")} value={countByStatus(assignedPatients, "waiting")} />
                                <Stat label={t("status.completed")} value={countByStatus(assignedPatients, "completed")} />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {assignedPatients.map((patient) => (
                                  <Badge key={patient.id}>
                                    {patient.fullName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="rounded-md bg-secondary/30 p-3 text-sm text-muted-foreground">
                              {t("colleagues.noPatients")}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function countByStatus(patients: Patient[], status: Patient["status"]) {
  return patients.filter((patient) => patient.status === status).length;
}

function patientShare(assignedCount: number, totalCount: number) {
  if (totalCount === 0) {
    return "0%";
  }
  return `${Math.round((assignedCount / totalCount) * 100)}%`;
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
