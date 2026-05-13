"use client";

import type { Patient } from "@orthodontics-helper/api-client";
import type { TranslationKey } from "@orthodontics-helper/i18n";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useI18n } from "@/components/layout/i18n-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/ui/monthpicker";
import { useColleagues } from "@/features/colleagues/hooks/use-colleagues";
import {
  PatientModal,
  type PatientModalMode,
} from "@/features/patients/components/patient-modal";
import { usePatients } from "@/features/patients/hooks/use-patients";

const weekdayKeys = [
  "weekday.mon",
  "weekday.tue",
  "weekday.wed",
  "weekday.thu",
  "weekday.fri",
  "weekday.sat",
  "weekday.sun",
] as const;
const minCalendarMonth = new Date(2026, 0, 1);
const maxCalendarMonth = new Date(2026, 11, 1);

const fallbackDoctors = ["Dr. Deniz Aydin", "Dr. Selin Koc"];

const demoPatients: Patient[] = [
  {
    id: "demo-ayse-demir",
    fullName: "Ayse Demir",
    phone: "+90 555 010 1001",
    status: "active_treatment",
    treatmentNote: "Monthly aligner check",
    internalNote: "Prefers afternoon appointments",
    remindersEnabled: true,
    reminderDaysBefore: [1, 3],
    reminderSendHour: 9,
    nextAppointment: "2026-05-13T09:30:00.000Z",
    updatedAt: "2026-05-12T09:00:00.000Z",
  },
  {
    id: "demo-mehmet-yilmaz",
    fullName: "Mehmet Yilmaz",
    phone: "+90 555 010 1002",
    status: "waiting",
    treatmentNote: "Initial consultation follow-up",
    internalNote: "",
    remindersEnabled: true,
    reminderDaysBefore: [1],
    reminderSendHour: 10,
    nextAppointment: "2026-05-13T15:00:00.000Z",
    updatedAt: "2026-05-11T09:00:00.000Z",
  },
  {
    id: "demo-elif-kaya",
    fullName: "Elif Kaya",
    phone: "+90 555 010 1003",
    status: "active_treatment",
    treatmentNote: "Bracket adjustment",
    internalNote: "",
    remindersEnabled: true,
    reminderDaysBefore: [2],
    reminderSendHour: 8,
    nextAppointment: "2026-05-18T16:15:00.000Z",
    updatedAt: "2026-05-10T09:00:00.000Z",
  },
];

const demoAssignments = [
  { dateKey: "2026-05-04", time: "10:00", patientName: "Ayse Demir", doctorName: "Dr. Deniz Aydin", status: "planned" },
  { dateKey: "2026-05-08", time: "11:30", patientName: "Elif Kaya", doctorName: "Dr. Selin Koc", status: "confirmed" },
  { dateKey: "2026-05-13", time: "09:30", patientName: "Ayse Demir", doctorName: "Dr. Deniz Aydin", status: "confirmed" },
  { dateKey: "2026-05-13", time: "15:00", patientName: "Mehmet Yilmaz", doctorName: "Dr. Selin Koc", status: "planned" },
  { dateKey: "2026-05-15", time: "14:30", patientName: "Ayse Demir", doctorName: "Dr. Deniz Aydin", status: "planned" },
  { dateKey: "2026-05-18", time: "10:00", patientName: "Mehmet Yilmaz", doctorName: "Dr. Selin Koc", status: "planned" },
  { dateKey: "2026-05-18", time: "16:15", patientName: "Elif Kaya", doctorName: "Dr. Deniz Aydin", status: "confirmed" },
  { dateKey: "2026-05-22", time: "13:00", patientName: "Mehmet Yilmaz", doctorName: "Dr. Selin Koc", status: "planned" },
  { dateKey: "2026-05-27", time: "09:00", patientName: "Elif Kaya", doctorName: "Dr. Deniz Aydin", status: "confirmed" },
];

type CalendarAssignment = {
  dateKey: string;
  time: string;
  patientName: string;
  doctorName: string;
  status: string;
};

export function CalendarPage() {
  const { t } = useI18n();
  const patientsQuery = usePatients("");
  const colleaguesQuery = useColleagues();
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const selectedMonthDate = useMemo(
    () => monthValueToDate(selectedMonth),
    [selectedMonth],
  );
  const patients = patientsQuery.data && patientsQuery.data.length > 0
    ? patientsQuery.data
    : demoPatients;
  const doctors = colleaguesQuery.data?.map((doctor) => doctor.fullName) ?? fallbackDoctors;
  const assignments = useMemo(
    () => buildAssignments(patients, doctors, selectedMonth),
    [patients, doctors, selectedMonth],
  );
  const monthCells = useMemo(
    () => buildMonthCells(selectedMonthDate),
    [selectedMonthDate],
  );
  const [modalMode, setModalMode] = useState<PatientModalMode>("create");
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const assignedDoctorCount = new Set(assignments.map((item) => item.doctorName)).size;
  const appointmentDayCount = new Set(assignments.map((item) => item.dateKey)).size;
  const patientCount = new Set(assignments.map((item) => item.patientName)).size;

  useEffect(() => {
    function closeMonthPicker(event: MouseEvent) {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(event.target as Node)
      ) {
        setMonthPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMonthPicker);
    return () => document.removeEventListener("mousedown", closeMonthPicker);
  }, []);

  function openCreateModal() {
    setSelectedPatient(undefined);
    setModalMode("create");
    setModalOpen(true);
  }

  function openPatient(patientName: string) {
    const patient = patients.find((item) => item.fullName === patientName);
    if (!patient) {
      return;
    }

    setSelectedPatient(patient);
    setModalMode("edit");
    setModalOpen(true);
  }

  function shiftMonth(offset: number) {
    const nextDate = new Date(selectedMonthDate);
    nextDate.setMonth(nextDate.getMonth() + offset);
    if (nextDate >= minCalendarMonth && nextDate <= maxCalendarMonth) {
      setSelectedMonth(dateToMonthValue(nextDate));
    }
  }

  return (
    <AppShell currentPath="/calendar">
      <PageHeader
        action={
          <Button onClick={openCreateModal}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            {t("calendar.addPatient")}
          </Button>
        }
        description={t("calendar.description")}
        title={t("calendar.title")}
      />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button aria-label={t("calendar.previousMonth")} variant="outline" onClick={() => shiftMonth(-1)}>
              <ChevronLeft aria-hidden="true" />
            </Button>
            <div className="relative" ref={monthPickerRef}>
              <Button
                aria-expanded={monthPickerOpen}
                aria-haspopup="dialog"
                aria-label={t("calendar.pickMonth")}
                className="w-44 justify-start"
                variant="outline"
                onClick={() => setMonthPickerOpen((open) => !open)}
              >
                <CalendarDays data-icon="inline-start" aria-hidden="true" />
                {formatMonth(selectedMonthDate, t)}
              </Button>
              {monthPickerOpen ? (
                <MonthPicker
                  className="absolute left-0 top-12 z-20"
                  maxDate={maxCalendarMonth}
                  minDate={minCalendarMonth}
                  selectedMonth={selectedMonthDate}
                  t={t}
                  onMonthSelect={(date) => {
                    setSelectedMonth(dateToMonthValue(date));
                    setMonthPickerOpen(false);
                  }}
                />
              ) : null}
            </div>
            <Button aria-label={t("calendar.nextMonth")} variant="outline" onClick={() => shiftMonth(1)}>
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {assignments.length} {t("calendar.appointments")} | {appointmentDayCount} {t("calendar.days")} | {patientCount} {t("calendar.patients")} | {assignedDoctorCount} {t("calendar.doctors")}
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-background">
          <div className="grid min-w-[980px] grid-cols-7 rounded-t-lg border-b bg-secondary/60">
            {weekdayKeys.map((weekdayKey) => (
              <div
                className="px-3 py-2 text-center text-xs font-medium text-foreground"
                key={weekdayKey}
              >
                {t(weekdayKey)}
              </div>
            ))}
          </div>
          <div className="grid min-w-[980px] grid-cols-7">
            {monthCells.map((cell) => {
              const dayAssignments = assignments.filter(
                (item) => item.dateKey === dateKey(cell.date),
              );

              return (
                <div
                  className="min-h-32 border-r border-b bg-background p-2 last:border-r-0"
                  key={dateKey(cell.date)}
                >
                  <div className="flex h-full flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={
                          cell.inCurrentMonth
                            ? "text-xs font-semibold"
                            : "text-xs text-muted-foreground"
                        }
                      >
                        {cell.date.getDate().toString().padStart(2, "0")}
                      </span>
                      {dayAssignments.length > 0 ? (
                        <Badge>{dayAssignments.length}</Badge>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1">
                      {dayAssignments.slice(0, 3).map((assignment) => (
                        <button
                          className="border-l-2 border-primary bg-secondary/50 px-1.5 py-1 text-left text-[11px] leading-tight transition hover:bg-secondary"
                          key={`${assignment.dateKey}-${assignment.time}-${assignment.patientName}`}
                          type="button"
                          onClick={() => openPatient(assignment.patientName)}
                        >
                          <span className="block truncate font-medium">
                            {assignment.time} {assignment.patientName}
                          </span>
                          <span className="block truncate text-muted-foreground">
                            {assignment.doctorName}
                          </span>
                        </button>
                      ))}
                      {dayAssignments.length > 3 ? (
                        <button
                          className="text-left text-[11px] font-medium text-primary"
                          type="button"
                        >
                          {t("calendar.seeMore", { count: dayAssignments.length - 3 })}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PatientModal
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        patient={selectedPatient}
      />
    </AppShell>
  );
}

function buildMonthCells(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const cells: { date: Date; inCurrentMonth: boolean }[] = [];
  const firstCellDate = new Date(year, month, 1 - mondayOffset);

  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(firstCellDate);
    cellDate.setDate(firstCellDate.getDate() + index);

    cells.push({
      date: cellDate,
      inCurrentMonth: cellDate.getMonth() === month,
    });
  }

  return cells;
}

function buildAssignments(
  patients: Patient[],
  doctors: string[],
  selectedMonth: string,
): CalendarAssignment[] {
  if (patients.length === 0 && selectedMonth === "2026-05") {
    return demoAssignments;
  }

  const assignments = patients
    .filter((patient) => patient.nextAppointment)
    .flatMap((patient, index) => {
      const appointmentDate = new Date(patient.nextAppointment ?? "");
      if (dateToMonthValue(appointmentDate) !== selectedMonth) {
        return [];
      }

      return {
        dateKey: dateKey(appointmentDate),
        time: appointmentDate.toLocaleTimeString("en", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        patientName: patient.fullName,
        doctorName: doctors[index % Math.max(doctors.length, 1)] ?? fallbackDoctors[0],
        status: "planned",
      };
    })
    .filter((assignment) => assignment.dateKey.startsWith(selectedMonth));

  if (assignments.length > 0) {
    return assignments;
  }

  return selectedMonth === "2026-05" ? demoAssignments : [];
}

function monthValueToDate(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function dateToMonthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateKey(date: Date) {
  return `${dateToMonthValue(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonth(
  date: Date,
  t: (key: TranslationKey) => string,
) {
  return `${t(`month.${date.getMonth()}` as TranslationKey)} ${date.getFullYear()}`;
}
