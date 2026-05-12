import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ColleaguesLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic members</CardTitle>
        <CardDescription>Loading</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-28 rounded-md bg-secondary" />
      </CardContent>
    </Card>
  );
}

export function ColleaguesError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic members</CardTitle>
        <CardDescription>Unable to load colleagues</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Please retry after the API is available.
        </p>
      </CardContent>
    </Card>
  );
}
