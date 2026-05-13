"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { I18nProvider } from "@/components/layout/i18n-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ClinicContextProvider } from "@/features/auth/components/clinic-context-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider>
          <ClinicContextProvider>{children}</ClinicContextProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
