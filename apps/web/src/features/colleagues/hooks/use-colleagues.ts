import type { Colleague } from "@orthodontics-helper/api-client";
import { useQuery } from "@tanstack/react-query";

const demoColleagues: Colleague[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    fullName: "Dr. Deniz Aydin",
    email: "deniz@example.com",
    clinic: "Ortodonti Klinik",
    joinedAt: "2026-01-02T09:00:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    fullName: "Dr. Selin Koc",
    email: "selin@example.com",
    clinic: "Ortodonti Klinik",
    joinedAt: "2026-02-18T09:00:00.000Z",
  },
];

export function useColleagues() {
  return useQuery({
    queryKey: ["colleagues"],
    queryFn: async () => demoColleagues,
  });
}
