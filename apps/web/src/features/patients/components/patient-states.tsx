import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PatientTableLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient list</CardTitle>
        <CardDescription>Loading patients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 rounded-md bg-secondary" />
      </CardContent>
    </Card>
  );
}

export function PatientTableError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient list</CardTitle>
        <CardDescription>Unable to load patients</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Confirm the API is running and the active user belongs to a clinic.
        </p>
      </CardContent>
    </Card>
  );
}

export function PatientTableEmpty() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient list</CardTitle>
        <CardDescription>No patients yet</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Add the first patient to start tracking appointments and reminders.
        </p>
      </CardContent>
    </Card>
  );
}
