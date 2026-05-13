"use client";

import {
  localeLabels,
  locales,
  type Locale,
  type TranslationKey,
} from "@orthodontics-helper/i18n";
import {
  CalendarDays,
  ClipboardList,
  Globe,
  LogOut,
  Moon,
  Settings,
  SmilePlus,
  Sun,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/components/layout/i18n-provider";
import { useTheme } from "@/components/layout/theme-provider";
import { useClinicContext } from "@/features/auth/components/clinic-context-provider";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/patients", labelKey: "nav.patients", icon: ClipboardList },
  { href: "/calendar", labelKey: "nav.calendar", icon: CalendarDays },
  { href: "/colleagues", labelKey: "nav.colleagues", icon: UsersRound },
] as const;

export function AppShell({
  children,
  currentPath,
}: {
  children: ReactNode;
  currentPath: string;
}) {
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user, clinic } = useClinicContext();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeProfileMenu(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link className="flex items-center gap-3" href="/calendar">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <SmilePlus aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{t("app.name")}</span>
                <span className="block text-xs text-muted-foreground">
                  {t("app.subtitle")}
                </span>
              </span>
            </Link>
            <p className="max-w-40 truncate text-xs text-muted-foreground md:hidden">
              {clinic.name}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = currentPath === item.href;

                return (
                  <Link
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground",
                      active && "bg-secondary text-foreground",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <Icon aria-hidden="true" />
                    <span>{t(item.labelKey as TranslationKey)}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                aria-label={t("theme.toggle")}
                className="size-10 px-0"
                variant="outline"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <Sun aria-hidden="true" />
                ) : (
                  <Moon aria-hidden="true" />
                )}
              </Button>
              <label className="flex items-center gap-2">
                <Globe aria-hidden="true" />
                <span className="sr-only">{t("language.label")}</span>
                <Select
                  className="w-28"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as Locale)}
                >
                  {locales.map((item) => (
                    <option key={item} value={item}>
                      {localeLabels[item]}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="hidden md:block">
              <p className="max-w-40 truncate text-xs text-muted-foreground">
                {clinic.name}
              </p>
            </div>

            <div className="relative" ref={profileMenuRef}>
              <Button
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                aria-label={t("profile.menu")}
                className="size-10 px-0"
                variant="outline"
                onClick={() => setProfileMenuOpen((open) => !open)}
              >
                <UserRound aria-hidden="true" />
              </Button>
              {profileMenuOpen ? (
                <div className="absolute right-0 top-12 z-20 w-56 rounded-md border bg-background p-2 shadow-lg">
                  <div className="border-b px-2 pb-2">
                    <p className="truncate text-sm font-medium">{user.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex flex-col gap-1 pt-2">
                    <Link
                      className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <UserRound aria-hidden="true" />
                      {t("nav.profile")}
                    </Link>
                    <Link
                      className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      href="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Settings aria-hidden="true" />
                      {t("nav.settings")}
                    </Link>
                    <Button className="h-9 justify-start px-2" variant="ghost" onClick={logout}>
                      <LogOut aria-hidden="true" />
                      {t("nav.logout")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
