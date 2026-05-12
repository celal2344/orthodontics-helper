import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarDays,
  ClipboardList,
  MessageSquareText,
  Settings,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/patients", label: "Patients", icon: ClipboardList },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/colleagues", label: "Colleagues", icon: UsersRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  currentPath,
}: {
  children: ReactNode;
  currentPath: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-secondary/40 px-4 py-5 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MessageSquareText aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold">Orthodontics Helper</p>
            <p className="text-xs text-muted-foreground">Clinic reminders</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href;

            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-background hover:text-foreground",
                  active && "bg-background text-foreground shadow-sm",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Orthodontics Helper</p>
            <nav className="flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    aria-label={item.label}
                    className={cn(
                      "rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground",
                      currentPath === item.href && "bg-secondary text-foreground",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <Icon aria-hidden="true" />
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
