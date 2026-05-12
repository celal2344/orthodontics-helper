"use client";

import type { Colleague } from "@orthodontics-helper/api-client";
import { format } from "date-fns";
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

export function ColleaguesTable({
  colleagues,
}: {
  colleagues: Colleague[];
}) {
  return (
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
                  <TableCell className="font-medium">
                    {colleague.fullName}
                  </TableCell>
                  <TableCell>{colleague.email}</TableCell>
                  <TableCell>{colleague.clinic}</TableCell>
                  <TableCell>
                    {format(new Date(colleague.joinedAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge>active</Badge>
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
