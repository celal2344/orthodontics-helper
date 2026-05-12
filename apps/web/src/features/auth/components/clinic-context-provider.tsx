"use client";

import type { Clinic, CurrentUser } from "@orthodontics-helper/api-client";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from "react";

type ClinicContextValue = {
  user: CurrentUser;
  clinic: Clinic;
  isAuthenticated: boolean;
};

const demoUser: CurrentUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "doctor@example.com",
  fullName: "Demo Doctor",
  clinicId: "00000000-0000-0000-0000-000000000010",
};

const demoClinic: Clinic = {
  id: "00000000-0000-0000-0000-000000000010",
  name: "Ortodonti Klinik",
};

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicContextProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      user: demoUser,
      clinic: demoClinic,
      isAuthenticated: true,
    }),
    [],
  );

  return (
    <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
  );
}

export function useClinicContext() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error("useClinicContext must be used within ClinicContextProvider");
  }

  return context;
}
