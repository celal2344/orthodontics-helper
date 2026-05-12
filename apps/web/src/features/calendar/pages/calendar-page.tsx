import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
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

const days = [
  {
    date: "13",
    weekday: "Wed",
    appointments: [
      { time: "09:30", patient: "Ayse Demir", status: "confirmed" },
      { time: "15:00", patient: "Mehmet Yilmaz", status: "planned" },
    ],
  },
  {
    date: "14",
    weekday: "Thu",
    appointments: [],
  },
  {
    date: "15",
    weekday: "Fri",
    appointments: [
      { time: "14:30", patient: "Ayse Demir", status: "planned" },
    ],
  },
  {
    date: "18",
    weekday: "Mon",
    appointments: [
      { time: "10:00", patient: "Mehmet Yilmaz", status: "planned" },
      { time: "16:15", patient: "Elif Kaya", status: "confirmed" },
    ],
  },
];

export function CalendarPage() {
  return (
    <AppShell currentPath="/calendar">
      <PageHeader
        action={
          <Button>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add appointment
          </Button>
        }
        description="Monthly overview grouped by appointment day."
        title="Calendar"
      />

      <div className="flex items-center justify-between rounded-lg border bg-secondary/40 px-3 py-2">
        <Button aria-label="Previous month" variant="ghost">
          <ChevronLeft aria-hidden="true" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold">May 2026</p>
          <p className="text-xs text-muted-foreground">4 active appointment days</p>
        </div>
        <Button aria-label="Next month" variant="ghost">
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {days.map((day) => (
          <Card key={day.date}>
            <CardHeader>
              <CardTitle>
                {day.weekday}, May {day.date}
              </CardTitle>
              <CardDescription>
                {day.appointments.length} appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {day.appointments.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {day.appointments.map((appointment) => (
                    <button
                      className="flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition hover:bg-secondary"
                      key={`${appointment.patient}-${appointment.time}`}
                      type="button"
                    >
                      <span>
                        <span className="block text-sm font-medium">
                          {appointment.patient}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {appointment.time}
                        </span>
                      </span>
                      <Badge>{appointment.status}</Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No appointments</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
