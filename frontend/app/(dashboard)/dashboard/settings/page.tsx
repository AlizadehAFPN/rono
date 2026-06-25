"use client";

import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SessionEntryCard } from "@/components/dashboard/session-entry-card";
import { ActiveSessionsScreen } from "@/components/dashboard/active-sessions-screen";
import { useThemeStore, type Theme } from "@/lib/stores/theme";
import {
  SunIcon,
  MoonIcon,
  MonitorIcon,
  LaptopIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { locales, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { useInstitution, useUpdateInstitution } from "@/lib/hooks/use-users";
import {
  useChangePassword,
  useUpdateProfile,
} from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/lib/stores/auth";
import { roleGte } from "@/lib/types/auth";
import { toast } from "@/lib/hooks/use-toast";
import { ApiError } from "@/lib/api/client";

const COMMON_TIMEZONES = [
  "UTC",
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function SettingsPage() {
  const { t } = useI18n();
  const s = t.dashSettings;
  const [showSessions, setShowSessions] = useState(false);

  // Active sessions open as an internal sub-view stacked on this screen.
  if (showSessions) {
    return <ActiveSessionsScreen onBack={() => setShowSessions(false)} />;
  }

  return (
    <div className="flex flex-col">
      <Topbar title={s.pageTitle} />
      <div className="flex-1 p-6">
        <div className="max-w-2xl space-y-10">
          {/* ── Appearance ── */}
          <section className="space-y-4">
            <SectionHeader heading={s.appearance.heading} description={s.appearance.description} />
            <ThemeSettings />
          </section>

          {/* ── Preferences ── */}
          <section className="space-y-4">
            <SectionHeader heading={s.preferences.heading} description={s.preferences.description} />
            <LanguageSettings />
            <TimezoneSettings />
          </section>

          {/* ── Account & security ── */}
          <section className="space-y-4">
            <SectionHeader heading={s.account.heading} description={s.account.description} />
            <AccountSettings />
            <PasswordSettings />
            {/* Active device sessions open as an internal sub-view */}
            <SessionEntryCard
              onClick={() => setShowSessions(true)}
              icon={LaptopIcon}
              title={t.dashSessions.active.entryTitle}
              subtitle={t.dashSessions.active.entrySubtitle}
            />
          </section>

          {/* ── Institution (admins) ── */}
          <InstitutionSection />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ heading, description }: { heading: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ThemeSettings() {
  const { theme, setTheme } = useThemeStore();
  const { t } = useI18n();
  const d = t.dashSettings.theme;

  const THEMES: {
    value: Theme;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
  }[] = [
    { value: "light", label: d.light.label, icon: SunIcon, desc: d.light.desc },
    { value: "dark", label: d.dark.label, icon: MoonIcon, desc: d.dark.desc },
    { value: "system", label: d.system.label, icon: MonitorIcon, desc: d.system.desc },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">{d.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{d.description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon: Icon, desc }) => {
            const isActive = theme === value;
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "group relative flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-150",
                  isActive
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-border hover:border-muted-foreground/40 hover:bg-muted/40",
                )}
              >
                {isActive && <ActiveDot />}
                <Icon
                  className={cn(
                    "size-6 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-primary" : "text-foreground",
                    )}
                  >
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveDot() {
  return (
    <span className="absolute end-3 top-3 flex size-4 items-center justify-center rounded-full bg-primary">
      <svg className="size-2.5 text-primary-foreground" fill="none" viewBox="0 0 12 12">
        <path
          d="M2 6l3 3 5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function LanguageSettings() {
  const { t, locale, setLocale } = useI18n();
  const d = t.dashSettings.language;
  const update = useUpdateProfile();

  async function pick(next: Locale) {
    if (next === locale) return;
    setLocale(next); // instant UI switch
    try {
      // Persist to the account so the preference follows the user across devices.
      await update.mutateAsync({ locale: next });
      toast({ title: d.saved });
    } catch (err) {
      toast({
        title: d.saveFailed,
        description: err instanceof ApiError ? String(err.detail) : undefined,
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">{d.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{d.description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {locales.map((loc) => {
            const isActive = locale === loc;
            return (
              <button
                key={loc}
                onClick={() => pick(loc)}
                disabled={update.isPending}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl border p-4 text-start transition-all duration-150",
                  isActive
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-border hover:border-muted-foreground/40 hover:bg-muted/40",
                )}
              >
                {isActive && <ActiveDot />}
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {LOCALE_LABELS[loc].short}
                </span>
                <span className={cn("text-sm font-medium", isActive && "text-primary")}>
                  {LOCALE_LABELS[loc].native}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TimezoneSettings() {
  const { t } = useI18n();
  const d = t.dashSettings.preferences.timezone;
  const user = useAuthStore((st) => st.user);
  const update = useUpdateProfile();

  const [tz, setTz] = useState("UTC");
  useEffect(() => {
    if (user?.timezone) setTz(user.timezone);
  }, [user?.timezone]);

  const options = useMemo(() => {
    const set = new Set(COMMON_TIMEZONES);
    if (tz) set.add(tz);
    return Array.from(set).sort();
  }, [tz]);

  function detect() {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTz(detected);
    } catch {}
  }

  const dirty = !!user && tz !== (user.timezone ?? "UTC");

  async function onSave() {
    try {
      await update.mutateAsync({ timezone: tz });
      toast({ title: d.saved });
    } catch (err) {
      toast({
        title: d.saveFailed,
        description: err instanceof ApiError ? String(err.detail) : undefined,
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">{d.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{d.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={tz} onValueChange={setTz}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={detect}>
            {d.detect}
          </Button>
        </div>
        <Button onClick={onSave} disabled={!dirty || update.isPending}>
          {update.isPending ? d.saving : d.save}
        </Button>
      </CardContent>
    </Card>
  );
}

function AccountSettings() {
  const { t } = useI18n();
  const a = t.dashSettings.account;
  const user = useAuthStore((st) => st.user);

  return (
    <Card>
      <CardContent className="space-y-1.5 pt-6">
        <span className="text-sm font-medium">{a.emailLabel}</span>
        <Input value={user?.email ?? ""} disabled readOnly />
        <span className="text-xs text-muted-foreground">{a.emailHint}</span>
      </CardContent>
    </Card>
  );
}

function PasswordSettings() {
  const { t } = useI18n();
  const d = t.dashSettings.password;
  const change = useChangePassword();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const canSubmit = current && next && confirm && !change.isPending;

  async function onSubmit() {
    if (next !== confirm) {
      toast({ title: d.mismatch, variant: "destructive" });
      return;
    }
    try {
      await change.mutateAsync({ current_password: current, new_password: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast({ title: d.changed });
    } catch (err) {
      toast({
        title: d.failed,
        description: err instanceof ApiError ? String(err.detail) : undefined,
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">{d.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{d.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{d.current}</span>
          <Input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{d.next}</span>
          <Input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">{d.rules}</span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{d.confirm}</span>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        <Button onClick={onSubmit} disabled={!canSubmit}>
          {change.isPending ? d.changing : d.change}
        </Button>
      </CardContent>
    </Card>
  );
}

function InstitutionSection() {
  const { t } = useI18n();
  const s = t.dashSettings.institution;
  const role = useAuthStore((st) => st.role);
  const isAdmin = roleGte(role ?? "", "institution_admin");

  const { data } = useInstitution();
  const update = useUpdateInstitution();

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name);
      setDomain(data.domain ?? "");
    }
  }, [data]);

  // Institution editing is an admin-only surface; hide it entirely for others.
  if (!isAdmin) return null;

  async function onSave() {
    try {
      await update.mutateAsync({ name, domain: domain || null });
      toast({ title: s.saved });
    } catch (err) {
      toast({
        title: s.error,
        description: err instanceof ApiError ? String(err.detail) : s.saveFailed,
        variant: "destructive",
      });
    }
  }

  return (
    <section className="space-y-4">
      <SectionHeader heading={s.heading} description={s.description} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{s.nameLabel}</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={s.namePh} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{s.domainLabel}</span>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={s.domainPh} />
          </label>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">{s.slugLabel}</span>
              <p className="font-mono">{data?.slug ?? "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">{s.tierLabel}</span>
              <p className="capitalize">{data?.subscription_tier ?? "—"}</p>
            </div>
          </div>
          <Button onClick={onSave} disabled={update.isPending || !data}>
            {update.isPending ? s.saving : s.save}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
