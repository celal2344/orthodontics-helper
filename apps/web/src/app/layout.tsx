import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/layout/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orthodontics Helper",
  description: "Patient and appointment reminders for orthodontic clinics.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
