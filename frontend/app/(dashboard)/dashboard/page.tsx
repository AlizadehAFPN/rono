"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/dashboard/topbar";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useItems } from "@/lib/hooks/use-items";
import { useTopics } from "@/lib/hooks/use-topics";
import { useAuthStore } from "@/lib/stores/auth";
import { roleGte } from "@/lib/types/auth";
import { EXAM_TYPE_LABELS, STATUS_LABELS } from "@/lib/types/items";
import {
  BookOpenIcon,
  CheckCircle2Icon,
  FolderTreeIcon,
  LayersIcon,
  PlusIcon,
  ArrowRightIcon,
  FlaskConicalIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import type { DashOverviewDict } from "@/lib/i18n/dictionaries/dash-overview";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeGreeting(d: DashOverviewDict): string {
  const h = new Date().getHours();
  if (h < 12) return d.greetings.morning;
  if (h < 17) return d.greetings.afternoon;
  return d.greetings.evening;
}

function relativeTime(dateStr: string, d: DashOverviewDict): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return d.relativeTime.justNow;
  if (mins < 60) return `${mins}${d.relativeTime.minutesShort}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${d.relativeTime.hoursShort}`;
  const days = Math.floor(hrs / 24);
  return `${days}${d.relativeTime.daysShort}`;
}

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  draft: "bg-amber-400",
  retired: "bg-slate-400",
};

const EXAM_BAR_COLORS: Record<string, string> = {
  usmle_step1: "bg-orange-400",
  usmle_step2: "bg-blue-400",
  usmle_step3: "bg-violet-400",
  tus: "bg-emerald-400",
  unassigned: "bg-slate-300",
};

const CALIBRATION_DOTS: Record<string, string> = {
  calibrated: "bg-emerald-500",
  pre_set: "bg-blue-500",
  calibrating: "bg-amber-400",
  uncalibrated: "bg-slate-300",
};

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  loading,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className="text-3xl font-bold tabular-nums tracking-tight">
                {value}
              </p>
            )}
            {sub && !loading && (
              <p className="text-xs text-muted-foreground">{sub}</p>
            )}
          </div>
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              iconBg,
            )}
          >
            <Icon className={cn("size-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

// The dashboard landing branches by role: students get their personal home
// dashboard; instructors and admins get the question-bank overview below.
export default function DashboardPage() {
  const role = useAuthStore((s) => s.role);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  if (!isInitialized) return null;
  const isStaff = role ? roleGte(role, "instructor") : false;
  return isStaff ? <StaffOverview /> : <StudentDashboard />;
}

function StaffOverview() {
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);

  // Separate small queries for accurate counts (invalidated independently).
  const { data: allData, isPending: allPending } = useItems({ limit: 100 });
  const { data: activeData } = useItems({ status: "active", limit: 1 });
  const { data: draftData } = useItems({ status: "draft", limit: 1 });
  const { data: topics, isPending: topicsPending } = useTopics();

  const greeting =
    user?.preferred_name ??
    user?.full_name?.split(" ")[0] ??
    t.dashOverview.greetings.fallbackName;

  const items = allData?.items ?? [];
  const totalItems = allData?.total ?? 0;
  const activeItems = activeData?.total ?? 0;
  const draftItems = draftData?.total ?? 0;
  const totalTopics = topics?.length ?? 0;
  const activePct =
    totalItems > 0 ? Math.round((activeItems / totalItems) * 100) : 0;

  const examBreakdown = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const item of items) {
      const key = item.exam_type ?? "unassigned";
      acc[key] = (acc[key] ?? 0) + 1;
    }
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const calibrationBreakdown = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const item of items) {
      acc[item.calibration_status] = (acc[item.calibration_status] ?? 0) + 1;
    }
    return acc;
  }, [items]);

  // Sort newest-first so recently added always shows the latest questions.
  const recentItems = useMemo(
    () =>
      [...items]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 10),
    [items],
  );

  return (
    <div className="flex flex-col">
      <Topbar />
      <div className="flex-1 space-y-8 p-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {timeGreeting(t.dashOverview)}, {greeting}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              {" · "}
              {t.dashOverview.header.subtitle}
            </p>
          </div>
          <Button size="sm" asChild className="shrink-0">
            <Link href="/dashboard/items/new">
              <PlusIcon className="size-4" />
              {t.dashOverview.header.newQuestion}
            </Link>
          </Button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={t.dashOverview.stats.totalQuestions}
            value={totalItems}
            sub={`${activeItems} ${t.dashOverview.stats.totalQuestionsSub.activeSuffix} · ${draftItems} ${t.dashOverview.stats.totalQuestionsSub.draftSuffix}`}
            icon={BookOpenIcon}
            iconBg="bg-violet-100 dark:bg-violet-900/30"
            iconColor="text-violet-600 dark:text-violet-400"
            loading={allPending}
          />
          <StatCard
            title={t.dashOverview.stats.activeQuestions}
            value={activeItems}
            sub={`${activePct}% ${t.dashOverview.stats.activeQuestionsSubSuffix}`}
            icon={CheckCircle2Icon}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-400"
            loading={allPending}
          />
          <StatCard
            title={t.dashOverview.stats.draftQuestions}
            value={draftItems}
            sub={t.dashOverview.stats.draftQuestionsSub}
            icon={LayersIcon}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600 dark:text-amber-400"
            loading={allPending}
          />
          <StatCard
            title={t.dashOverview.stats.topics}
            value={totalTopics}
            sub={`${totalTopics} ${
              totalTopics !== 1
                ? t.dashOverview.stats.topicsSub.other
                : t.dashOverview.stats.topicsSub.one
            }`}
            icon={FolderTreeIcon}
            iconBg="bg-sky-100 dark:bg-sky-900/30"
            iconColor="text-sky-600 dark:text-sky-400"
            loading={topicsPending}
          />
        </div>

        {/* ── Main charts row ── */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Exam type breakdown */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  {t.dashOverview.examBreakdown.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-7 text-xs text-muted-foreground"
                >
                  <Link href="/dashboard/items">
                    {t.dashOverview.examBreakdown.viewAll}
                    <ArrowRightIcon className="size-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {allPending ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3.5 w-12" />
                      </div>
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              ) : examBreakdown.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  {t.dashOverview.examBreakdown.empty}
                </p>
              ) : (
                examBreakdown.map(([type, count]) => {
                  const pct =
                    totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
                  const barColor = EXAM_BAR_COLORS[type] ?? "bg-slate-400";
                  const label =
                    type === "unassigned"
                      ? t.dashOverview.examBreakdown.unassigned
                      : EXAM_TYPE_LABELS[type] ?? type;
                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{label}</span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="tabular-nums">{count}</span>
                          <span className="w-8 text-right text-xs tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            barColor,
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* IRT calibration status */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <FlaskConicalIcon className="size-3.5 text-muted-foreground" />
                {t.dashOverview.calibration.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allPending ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="size-2.5 rounded-full" />
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="ml-auto h-3.5 w-8" />
                    </div>
                  ))}
                </div>
              ) : (
                Object.entries(CALIBRATION_DOTS).map(([status, dot]) => {
                  const count = calibrationBreakdown[status] ?? 0;
                  const meta =
                    t.dashOverview.calibration.statuses[
                      status as keyof typeof t.dashOverview.calibration.statuses
                    ];
                  return (
                    <div key={status} className="flex items-center gap-2.5">
                      <span
                        className={cn("size-2 shrink-0 rounded-full", dot)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-none">
                          {meta.label}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {meta.desc}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        {count}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Recent questions ── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {t.dashOverview.recent.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 text-xs text-muted-foreground"
              >
                <Link href="/dashboard/items">
                  {t.dashOverview.recent.allQuestions}
                  <ArrowRightIcon className="size-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {allPending ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-2 shrink-0 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : recentItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <BookOpenIcon className="size-8 text-muted-foreground/30" />
                <div>
                  <p className="text-sm font-medium">
                    {t.dashOverview.recent.emptyTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.dashOverview.recent.emptyDescription}
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/dashboard/items/new">
                    <PlusIcon className="size-4" />
                    {t.dashOverview.recent.newQuestion}
                  </Link>
                </Button>
              </div>
            ) : (
              recentItems.map((item) => {
                const stem =
                  item.current_version?.content ??
                  t.dashOverview.recent.noContent;
                const shortStem =
                  stem.length > 120 ? stem.slice(0, 120) + "…" : stem;
                const examLabel = item.exam_type
                  ? EXAM_TYPE_LABELS[item.exam_type]
                  : null;
                return (
                  <Link
                    key={item.id}
                    href={`/dashboard/items/${item.id}`}
                    className="group -mx-3 flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        STATUS_DOT[item.status] ?? "bg-slate-400",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {shortStem}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {examLabel ?? t.dashOverview.recent.noExamType}
                        {" · "}
                        {t.dashOverview.status[
                          item.status as keyof typeof t.dashOverview.status
                        ] ??
                          STATUS_LABELS[item.status] ??
                          item.status}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground/60 mt-0.5">
                      {relativeTime(item.created_at, t.dashOverview)}
                    </span>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
