"use client";

import Link from "next/link";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useAuthStore } from "@/lib/stores/auth";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  FlameIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "lucide-react";

// Ability level → ring color, reusing the app-wide mastery scale
// (amber → blue → teal → green) so the whole product reads one progression.
const LEVEL_COLOR: Record<string, string> = {
  beginner: "var(--m-review)",
  developing: "var(--m-dev)",
  proficient: "var(--m-prof)",
  advanced: "var(--m-master)",
};

export function StudentDashboard() {
  const { t } = useI18n();
  const h = t.dashHome;
  const { data, isLoading } = useDashboard();
  const user = useAuthStore((s) => s.user);

  const name =
    user?.preferred_name ?? user?.full_name?.split(" ")[0] ?? h.greeting.fallbackName;
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? h.greeting.morning : hour < 18 ? h.greeting.afternoon : h.greeting.evening;

  const hasData = data && data.answered > 0;

  return (
    <div className="flex h-full flex-col">
      <Topbar title={h.title} />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 sm:p-6">
        {/* ── Greeting + streak ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
              {greeting}, {name}
            </h1>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{h.subtitle}</p>
          </div>
          {hasData && data.streak_days > 0 && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 py-1.5">
              <FlameIcon className="size-4 text-[var(--study-warning)]" />
              <span className="text-sm font-bold tabular-nums">{data.streak_days}</span>
            </div>
          )}
        </div>

        {isLoading && <DashboardSkeleton />}

        {/* ── Empty state ── */}
        {data && data.answered === 0 && (
          <Card className="flex flex-1 items-center justify-center">
            <CardContent className="max-w-sm space-y-3 py-10 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                <SparklesIcon className="size-6 text-primary" />
              </div>
              <p className="text-lg font-semibold">{h.empty.title}</p>
              <p className="text-sm text-muted-foreground">{h.empty.body}</p>
              <Button asChild size="lg" className="mt-1">
                <Link href="/dashboard/study">
                  <SparklesIcon className="size-4" />
                  {h.empty.cta}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Main: ability hero + the two primary destinations ── */}
        {hasData && (
          <div className="flex flex-col gap-4">
            {/* Ability hero — compact ring + level, then full-width stats row */}
            <Card>
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-4">
                  <AbilityRing
                    theta={data.ability.theta}
                    color={LEVEL_COLOR[data.ability.level] ?? "var(--primary)"}
                  />
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {h.stats.ability}
                    </div>
                    <div className="truncate text-2xl font-bold leading-tight">
                      {h.levels[data.ability.level as keyof typeof h.levels] ??
                        data.ability.level}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t pt-4">
                  <Stat
                    value={
                      data.accuracy != null ? `${Math.round(data.accuracy * 100)}%` : "—"
                    }
                    label={h.stats.accuracy}
                  />
                  <Stat value={String(data.answered)} label={h.stats.answered} />
                  <Stat value={String(data.streak_days)} label={h.stats.streak} />
                </div>
              </CardContent>
            </Card>

            {/* The two clear destinations — compact, unmistakable menu buttons */}
            <div className="grid gap-3 sm:grid-cols-2">
              <DestinationCard
                href="/dashboard/daily"
                icon={<CalendarCheckIcon className="size-5" />}
                title={h.actions.dailyStudy}
                primary
                badge={data.due_now > 0 ? data.due_now : undefined}
                description={
                  data.due_now > 0 ? `${data.due_now} ${h.due.dueNow}` : h.due.caughtUp
                }
              />
              <DestinationCard
                href="/dashboard/progress"
                icon={<TrendingUpIcon className="size-5" />}
                title={h.actions.progressTitle}
                description={h.actions.progressSub}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ability ring ───────────────────────────────────────────────────────────
// θ runs roughly [-3, +3]; map to a [0, 1] sweep so the ring fills as ability
// grows. Center reads the raw θ; the level name sits beside it.
function AbilityRing({ theta, color }: { theta: number | null; color: string }) {
  const size = 92;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const frac = theta == null ? 0.06 : Math.min(Math.max((theta + 3) / 6, 0.06), 1);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - frac)}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {theta != null ? (
          <>
            <span className="text-[9px] font-medium uppercase text-muted-foreground">θ</span>
            <span className="text-base font-bold tabular-nums leading-none">
              {theta.toFixed(1)}
            </span>
          </>
        ) : (
          <SparklesIcon className="size-5 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="truncate text-xl font-bold tabular-nums">{value}</div>
      <div className="mt-0.5 truncate text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

// ── Primary destination ─────────────────────────────────────────────────────
// Compact, clear menu button. `primary` paints the brand surface (Daily Study,
// the everyday action); the other uses a calm card surface (Progress).
function DestinationCard({
  href,
  icon,
  title,
  description,
  badge,
  primary,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: number;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        primary
          ? "border-transparent bg-primary text-primary-foreground"
          : "bg-card hover:bg-accent",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          primary ? "bg-white/15" : "bg-primary/10 text-primary",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold leading-tight">{title}</span>
          {badge != null && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-bold tabular-nums">
              {badge}
            </span>
          )}
        </div>
        <div
          className={cn(
            "truncate text-xs",
            primary ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {description}
        </div>
      </div>
      <ArrowRightIcon
        className={cn(
          "size-5 shrink-0 transition-transform group-hover:translate-x-0.5",
          primary ? "text-primary-foreground/80" : "text-muted-foreground",
        )}
      />
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="size-[92px] shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t pt-4">
            <Skeleton className="mx-auto h-12 w-16" />
            <Skeleton className="mx-auto h-12 w-16" />
            <Skeleton className="mx-auto h-12 w-16" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-[72px] rounded-2xl" />
        <Skeleton className="h-[72px] rounded-2xl" />
      </div>
    </div>
  );
}
