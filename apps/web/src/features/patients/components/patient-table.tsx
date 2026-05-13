"use client";

import type { Patient } from "@orthodontics-helper/api-client";
import { Send } from "lucide-react";
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

const statusLabels: Record<string, string> = {
  active_treatment: "Active treatment",
  completed: "Completed",
  cancelled: "Cancelled",
  waiting: "Waiting",
  inactive: "Inactive",
};

export function PatientTable({
  patients,
  onOpen,
  onSendSMS,
}: {
  patients: Patient[];
  onOpen: (patient: Patient, mode: "view" | "edit") => void;
  onSendSMS: (patient: Patient) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient list</CardTitle>
        <CardDescription>{patients.length} records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next appointment</TableHead>
                <TableHead>Last updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.fullName}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    <Badge>{statusLabels[patient.status]}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(patient.nextAppointment)}</TableCell>
                  <TableCell>{formatDate(patient.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => onOpen(patient, "view")}>
                        View
                      </Button>
                      <Button variant="ghost" onClick={() => onOpen(patient, "edit")}>
                        Edit
                      </Button>
                      <Button variant="ghost" onClick={() => onSendSMS(patient)}>
                        <Send data-icon="inline-start" aria-hidden="true" />
                        SMS
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

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
