import { Plus, Send } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const patients = [
  {
    id: "pat_1",
    name: "Ayse Demir",
    phone: "+90 532 000 00 01",
    status: "active_treatment",
    nextAppointment: "15 May 2026, 14:30",
    updatedAt: "12 May 2026",
  },
  {
    id: "pat_2",
    name: "Mehmet Yilmaz",
    phone: "+90 533 000 00 02",
    status: "waiting",
    nextAppointment: "18 May 2026, 10:00",
    updatedAt: "11 May 2026",
  },
  {
    id: "pat_3",
    name: "Elif Kaya",
    phone: "+90 534 000 00 03",
    status: "completed",
    nextAppointment: "-",
    updatedAt: "08 May 2026",
  },
];

const statusLabels: Record<string, string> = {
  active_treatment: "Active treatment",
  completed: "Completed",
  cancelled: "Cancelled",
  waiting: "Waiting",
  inactive: "Inactive",
};

export function PatientsPage() {
  return (
    <AppShell currentPath="/patients">
      <PageHeader
        action={
          <Button>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add patient
          </Button>
        }
        description="Clinic-scoped patient records, appointments, reminders, and audit history."
        title="Patients"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Patient list</CardTitle>
              <CardDescription>{patients.length} records</CardDescription>
            </div>
            <Input
              aria-label="Search patients"
              className="md:max-w-xs"
              placeholder="Search by name or phone"
            />
          </div>
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
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      <Badge>{statusLabels[patient.status]}</Badge>
                    </TableCell>
                    <TableCell>{patient.nextAppointment}</TableCell>
                    <TableCell>{patient.updatedAt}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">View</Button>
                        <Button variant="ghost">
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
    </AppShell>
  );
}
