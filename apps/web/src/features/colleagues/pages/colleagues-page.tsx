import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
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

const colleagues = [
  {
    id: "user_1",
    name: "Dr. Deniz Aydin",
    email: "deniz@example.com",
    clinic: "Ortodonti Klinik",
    joinedAt: "02 Jan 2026",
    status: "active",
  },
  {
    id: "user_2",
    name: "Dr. Selin Koc",
    email: "selin@example.com",
    clinic: "Ortodonti Klinik",
    joinedAt: "18 Feb 2026",
    status: "active",
  },
];

export function ColleaguesPage() {
  return (
    <AppShell currentPath="/colleagues">
      <PageHeader
        description="Doctors attached to the active clinic."
        title="Colleagues"
      />

      <Card>
        <CardHeader>
          <CardTitle>Clinic members</CardTitle>
          <CardDescription>{colleagues.length} active doctors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Joined date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colleagues.map((colleague) => (
                  <TableRow key={colleague.id}>
                    <TableCell className="font-medium">{colleague.name}</TableCell>
                    <TableCell>{colleague.email}</TableCell>
                    <TableCell>{colleague.clinic}</TableCell>
                    <TableCell>{colleague.joinedAt}</TableCell>
                    <TableCell>
                      <Badge>{colleague.status}</Badge>
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
