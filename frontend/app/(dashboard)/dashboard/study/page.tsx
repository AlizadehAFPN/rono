"use client";

import { useRouter } from "next/navigation";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { useStudyOverview } from "@/lib/hooks/use-study";
import { usePracticeIntentStore } from "@/lib/stores/practice-intent";
import type { CategoryCardOut, MasteryLevel } from "@/lib/types/study";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import {
  SparklesIcon,
  FlameIcon,
  TrophyIcon,
  CalendarCheckIcon,
  ChevronRightIcon,
} from "lucide-react";

// How many questions a single tap on a category should queue up.
const SESSION_SIZE = 10;

// Mastery → ring/dot color. Values are CSS vars defined in globals.css and
// verified for both themes, so they flip correctly between light and dark.
const MASTERY_COLOR: Record<string, string> = {
  not_started: "var(--m-none)",
  needs_review: "var(--m-review)",
  developing: "var(--m-dev)",
  proficient: "var(--m-prof)",
  mastered: "var(--m-master)",
};

export default function StudyPage() {
  const { t } = useI18n();
  const s = t.dashStudy;
  const router = useRouter();
  const setIntent = usePracticeIntentStore((st) => st.setIntent);

  const { data, isLoading, isError } = useStudyOverview();
  const categories = data?.categories ?? [];

  // Real aggregates for the header — no synthetic gamification.
  const totalDue = categories.reduce((a, c) => a + c.due_count, 0);
  const masteredCount = categories.filter(
    (c) => c.mastery_level === "mastered",
  ).length;
  const seen = categories.reduce((a, c) => a + c.answered, 0);
  const totalQ = categories.reduce((a, c) => a + c.total_questions, 0);
  const overall = totalQ > 0 ? Math.round((seen / totalQ) * 100) : 0;

  function onStart(c: CategoryCardOut) {
    const mode = c.recommended_mode ?? "adaptive_practice";
    setIntent({
      topicId: c.topic_id,
      topicName: c.topic_name,
      examType: c.exam_type,
      mode,
      count: SESSION_SIZE,
    });
    router.push("/dashboard/study/session");
  }

  return (
    <div className="flex flex-col">
      <Topbar title={s.pageTitle} />
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
        {/* ── Overview header (live data) ───────────────────────────────── */}
        {!isLoading && !isError && categories.length > 0 && (
          <div className="animate-study-fade flex flex-wrap items-center gap-5 rounded-2xl border bg-card p-5 shadow-xs">
            <ProgressRing value={overall} size={64} stroke={6} color="var(--primary)">
              <span className="text-sm font-bold text-foreground">{overall}%</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="text-base font-semibold leading-tight text-foreground">
                {s.subtitle}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {s.stats.progress} · {seen}/{totalQ}
              </p>
            </div>
            <div className="ml-auto flex gap-3">
              <HeaderStat
                icon={<FlameIcon className="size-4" />}
                value={totalDue}
                label={s.stats.due}
                color="var(--study-warning)"
              />
              <HeaderStat
                icon={<TrophyIcon className="size-4" />}
                value={masteredCount}
                label={s.mastery.mastered}
                color="var(--m-master)"
              />
            </div>
          </div>
        )}

        {/* ── Daily Review entry — the cross-topic spaced-repetition loop ──── */}
        {!isLoading && !isError && categories.length > 0 && (
          <button
            onClick={() => router.push("/dashboard/daily")}
            className="animate-study-fade group flex w-full items-center gap-4 rounded-2xl border bg-card p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-muted-foreground/40 hover:shadow-lg"
          >
            <span
              className="grid size-12 shrink-0 place-items-center rounded-xl"
              style={{
                color: "var(--primary)",
                backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)",
              }}
            >
              <CalendarCheckIcon className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold leading-tight text-foreground">
                {s.daily.cardTitle}
              </h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {totalDue > 0 ? s.daily.dueToday(totalDue) : s.daily.cardSubtitle}
              </p>
            </div>
            <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        )}

        {isLoading && (
          <p className="text-sm text-muted-foreground">{s.loading}</p>
        )}
        {isError && <p className="text-sm text-destructive">{s.error}</p>}
        {!isLoading && !isError && categories.length === 0 && (
          <p className="text-sm text-muted-foreground">{s.empty}</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <CategoryCard key={c.topic_id} c={c} onStart={() => onStart(c)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeaderStat({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border bg-background px-3.5 py-2">
      <span style={{ color }} className="grid place-items-center">
        {icon}
      </span>
      <div className="leading-none">
        <div className="text-base font-bold text-foreground">{value}</div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  c,
  onStart,
}: {
  c: CategoryCardOut;
  onStart: () => void;
}) {
  const { t } = useI18n();
  const s = t.dashStudy;

  const masteryKey = c.mastery_level as MasteryLevel;
  const masteryColor = MASTERY_COLOR[c.mastery_level] ?? "var(--m-none)";
  const coverage =
    c.total_questions > 0
      ? Math.round((c.answered / c.total_questions) * 100)
      : 0;

  // Primary action follows the journey: learn new, then clear due reviews.
  const actionLabel =
    c.recommended_mode === "review"
      ? s.action.review(c.due_count)
      : c.recommended_mode === "adaptive_practice"
        ? c.answered === 0
          ? s.action.start
          : s.action.continue
        : s.action.caughtUp;
  const actionDisabled = c.recommended_mode === null;

  return (
    <div className="animate-study-fade flex flex-col rounded-2xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-muted-foreground/40 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <ProgressRing value={coverage} size={56} stroke={5.5} color={masteryColor}>
          <span className="text-[13px] font-bold text-foreground">
            {coverage}%
          </span>
        </ProgressRing>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold leading-snug text-foreground">
            {c.topic_name}
          </h3>
          <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: masteryColor }}
            />
            {s.mastery[masteryKey] ?? c.mastery_level}
            {c.accuracy_rate != null && (
              <span className="text-muted-foreground">
                · {Math.round(c.accuracy_rate * 100)}%
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="mt-4 mb-4 flex gap-5">
        <CatStat value={c.new_count} label={s.stats.new} color="var(--primary)" />
        <CatStat
          value={c.due_count}
          label={s.stats.due}
          color="var(--study-warning)"
        />
        <CatStat value={c.total_questions} label={s.stats.total} />
      </div>

      <Button
        onClick={onStart}
        disabled={actionDisabled}
        className="mt-auto w-full"
        variant={actionDisabled ? "outline" : "default"}
      >
        {!actionDisabled && <SparklesIcon className="size-4" />}
        {actionLabel}
      </Button>
    </div>
  );
}

function CatStat({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="leading-none">
      <div
        className={cn("text-lg font-bold", !color && "text-foreground")}
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
