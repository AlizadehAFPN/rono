"use client";

import { useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionEntryCard } from "@/components/dashboard/session-entry-card";
import { RecentSessionsScreen } from "@/components/dashboard/recent-sessions-screen";
import { useProgress } from "@/lib/hooks/use-progress";
import { useStudyOverview } from "@/lib/hooks/use-study";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import {
  AwardIcon,
  ClockIcon,
  HistoryIcon,
  TargetIcon,
  TrophyIcon,
} from "lucide-react";

// Mastery scale matches the Study page: amber → blue → teal → green.
const MASTERY_TONE: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  needs_review: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  developing: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  proficient: "bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300",
  mastered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
};

// Map ability θ (roughly −4…+4, 0 = average) onto a friendly level label.
function abilityLevelKey(theta: number | null): "beginner" | "developing" | "proficient" | "advanced" {
  if (theta == null || theta < -0.5) return "beginner";
  if (theta < 0.5) return "developing";
  if (theta < 1.5) return "proficient";
  return "advanced";
}

function insightKey(accuracy: number | null): "high" | "mid" | "low" {
  if (accuracy == null) return "low";
  if (accuracy >= 0.8) return "high";
  if (accuracy >= 0.5) return "mid";
  return "low";
}

export default function ProgressPage() {
  const { t } = useI18n();
  const g = t.dashProgress;
  const { data, isLoading } = useProgress();
  const { data: study } = useStudyOverview();
  const [showSessions, setShowSessions] = useState(false);

  const masteryLabel = (k: string) =>
    g.mastery[k as keyof typeof g.mastery] ?? k;

  // Derive the personal snapshot from already-loaded data (no extra request
  // beyond the study overview, which we reuse for the live "due for review"
  // count). Only subjects the student has actually attempted can be a
  // strongest/focus pick.
  const activeTopics = (data?.topics ?? []).filter(
    (tp) => tp.total_responses > 0 && tp.accuracy_rate != null,
  );
  const strongest = activeTopics.reduce<typeof activeTopics[number] | null>(
    (best, tp) =>
      best == null || (tp.accuracy_rate ?? 0) > (best.accuracy_rate ?? 0) ? tp : best,
    null,
  );
  const focus = activeTopics.reduce<typeof activeTopics[number] | null>(
    (worst, tp) =>
      worst == null || (tp.accuracy_rate ?? 1) < (worst.accuracy_rate ?? 1) ? tp : worst,
    null,
  );
  const masteredCount = (data?.topics ?? []).filter(
    (tp) => tp.mastery_level === "mastered",
  ).length;
  const dueTotal = study?.categories.reduce((sum, c) => sum + c.due_count, 0) ?? null;
  const pct = (v: number | null | undefined) =>
    v != null ? `${Math.round(v * 100)}%` : g.summary.none;

  // Recent sessions open as an internal sub-view stacked on this screen.
  if (showSessions) {
    return <RecentSessionsScreen onBack={() => setShowSessions(false)} />;
  }

  return (
    <div className="flex flex-col">
      <Topbar title={g.pageTitle} />
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
        {isLoading && <p className="text-sm text-muted-foreground">{g.loading}</p>}

        {data && data.total_responses === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {g.empty}
            </CardContent>
          </Card>
        )}

        {data && data.total_responses > 0 && (
          <>
            {/* Personal snapshot — a brief, friendly performance report */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{g.summary.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {g.abilityLevel[abilityLevelKey(data.global_theta)]}
                  {" · "}
                  {g.insight[insightKey(data.accuracy)]}
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Highlight
                  icon={<TrophyIcon className="size-4 text-[var(--m-master)]" />}
                  label={g.summary.strongest}
                  value={strongest ? strongest.topic_name : g.summary.none}
                  sub={strongest ? pct(strongest.accuracy_rate) : undefined}
                />
                <Highlight
                  icon={<TargetIcon className="size-4 text-[var(--study-warning)]" />}
                  label={g.summary.focus}
                  value={focus ? focus.topic_name : g.summary.none}
                  sub={focus ? pct(focus.accuracy_rate) : undefined}
                />
                <Highlight
                  icon={<ClockIcon className="size-4 text-primary" />}
                  label={g.summary.dueReview}
                  value={dueTotal != null ? String(dueTotal) : g.summary.none}
                  sub={dueTotal != null ? g.summary.cardsUnit : undefined}
                />
                <Highlight
                  icon={<AwardIcon className="size-4 text-primary" />}
                  label={g.summary.mastered}
                  value={String(masteredCount)}
                  sub={g.summary.subjectsUnit}
                />
              </CardContent>
            </Card>

            {/* Top stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label={g.stats.ability}
                value={data.global_theta != null ? data.global_theta.toFixed(2) : "—"}
              />
              <Stat label={g.stats.answered} value={String(data.total_responses)} />
              <Stat label={g.stats.correct} value={String(data.total_correct)} />
              <Stat
                label={g.stats.accuracy}
                value={data.accuracy != null ? `${Math.round(data.accuracy * 100)}%` : "—"}
              />
            </div>

            {/* By subject */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{g.topics.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.topics.length === 0 && (
                  <p className="text-sm text-muted-foreground">{g.topics.empty}</p>
                )}
                {data.topics.map((tp) => (
                  <div
                    key={tp.topic_id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{tp.topic_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {tp.correct_responses}/{tp.total_responses} {g.topics.questions}
                        {tp.accuracy_rate != null &&
                          ` · ${Math.round(tp.accuracy_rate * 100)}%`}
                        {tp.theta != null && ` · θ ${tp.theta.toFixed(2)}`}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        MASTERY_TONE[tp.mastery_level] ?? MASTERY_TONE.not_started,
                      )}
                    >
                      {masteryLabel(tp.mastery_level)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent sessions — full list opens as an internal sub-view */}
            <SessionEntryCard
              onClick={() => setShowSessions(true)}
              icon={HistoryIcon}
              title={t.dashSessions.recent.entryTitle}
              subtitle={t.dashSessions.recent.entrySubtitle}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Highlight({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1.5 truncate text-sm font-semibold" title={value}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
