"use client";

import { Building2 } from "lucide-react";
import { useClinicContext } from "@/features/auth/components/clinic-context-provider";

export function ClinicStatus() {
  const { clinic, user } = useClinicContext();

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border bg-background px-3 py-2">
      <Building2 aria-hidden="true" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{clinic.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.fullName}</p>
      </div>
    </div>
  );
}
