"use client";

import type { Clinic, CurrentUser } from "@orthodontics-helper/api-client";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useI18n } from "@/components/layout/i18n-provider";
import { apiClient } from "@/lib/api/client";

type ClinicContextValue = {
  user: CurrentUser;
  clinic: Clinic;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
};

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicContextProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(pathname !== "/login");

  async function refreshSession() {
    setLoading(true);
    try {
      const [currentUser, currentClinic] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getCurrentClinic(),
      ]);
      setUser(currentUser);
      setClinic(currentClinic);
    } catch {
      setUser(null);
      setClinic(null);
      if (pathname !== "/login") {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (pathname === "/login") {
      setLoading(false);
      return;
    }

    void refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const value = useMemo(
    () =>
      user && clinic
        ? {
            user,
            clinic,
            isAuthenticated: true,
            refreshSession,
          }
        : null,
    [user, clinic],
  );

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (loading || !value) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

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
