import { Bell, Clock, MessageSquareText } from "lucide-react";
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

export function SettingsPage() {
  return (
    <AppShell currentPath="/settings">
      <PageHeader
        action={<Button>Save settings</Button>}
        description="Reminder templates and daily notification preferences."
        title="Settings"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <Bell aria-hidden="true" />
                Reminders
              </span>
            </CardTitle>
            <CardDescription>Daily cron configuration</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Days before appointment
              <Input defaultValue="1, 7" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Send hour
              <Input defaultValue="06:00" />
            </label>
            <Badge>Enabled</Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <MessageSquareText aria-hidden="true" />
                SMS templates
              </span>
            </CardTitle>
            <CardDescription>Template-based messages only</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-medium">Appointment reminder</p>
                <Badge>Enabled</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Merhaba {"{patientName}"}, {"{date}"} saat {"{time}"} tarihinde
                randevunuz bulunmaktadir.
              </p>
            </div>
            <div className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-medium">Manual reminder</p>
                <Badge>Enabled</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Merhaba {"{patientName}"}, randevu bilginiz icin kliniginizle
                iletisime gecebilirsiniz.
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
              Reminder job
            </span>
          </CardTitle>
          <CardDescription>Railway cron command</CardDescription>
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
