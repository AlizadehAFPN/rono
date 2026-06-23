"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { useStudyOverview } from "@/lib/hooks/use-study";
import { usePracticeIntentStore } from "@/lib/stores/practice-intent";
import { useAuthStore } from "@/lib/stores/auth";
import { useUpdateProfile } from "@/lib/hooks/use-auth";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  ListChecksIcon,
  SparkleIcon,
} from "lucide-react";

const TIME_OPTIONS = [10, 20, 30, 45, 60, 90, 180];
const COUNT_OPTIONS = [10, 20, 30, 50, 100, 200, 500];
const LEVELS = ["beginner", "developing", "proficient", "advanced"] as const;

const MASTERY_COLOR: Record<string, string> = {
  not_started: "var(--m-none)",
  needs_review: "var(--m-review)",
  developing: "var(--m-dev)",
  proficient: "var(--m-prof)",
  mastered: "var(--m-master)",
};

type LimitType = "count" | "time";
type Level = (typeof LEVELS)[number];

export default function DailyReviewSetupPage() {
  const { t } = useI18n();
  const s = t.dashStudy.daily;
  const router = useRouter();
  const setIntent = usePracticeIntentStore((st) => st.setIntent);
  const savedUser = useAuthStore((st) => st.user);
  const updateProfile = useUpdateProfile();

  const { data, isLoading } = useStudyOverview();
  const categories = useMemo(() => data?.categories ?? [], [data]);

  const [selected, setSelected] = useState<Set<string> | null>(null);
  const sel = selected ?? new Set(categories.map((c) => c.topic_id));
  const allSelected = categories.length > 0 && sel.size === categories.length;

  const [limitType, setLimitType] = useState<LimitType>("count");
  const [countValue, setCountValue] = useState(20);
  const [timeValue, setTimeValue] = useState(20);
  const [level, setLevel] = useState<Level | null>(null);

  // Seed the form from the learner's saved daily target so this screen doubles
  // as the editor — they see exactly what they last registered. Runs once, when
  // the cached user first becomes available, so it never clobbers live edits.
  const seeded = useRef(false);
  useEffect(() => {
    if (!savedUser || seeded.current) return;
    seeded.current = true;
    setLimitType(savedUser.daily_limit_type);
    setCountValue(savedUser.daily_target_count);
    setTimeValue(savedUser.daily_time_limit_minutes);
    setLevel(savedUser.daily_self_rated_level ?? null);
  }, [savedUser]);

  // Restore the saved collection scope once the category list has loaded.
  const colSeeded = useRef(false);
  useEffect(() => {
    if (!savedUser || categories.length === 0 || colSeeded.current) return;
    colSeeded.current = true;
    const saved = savedUser.daily_topic_ids;
    if (saved && saved.length > 0) {
      const avail = new Set(categories.map((c) => c.topic_id));
      setSelected(new Set(saved.filter((id) => avail.has(id))));
    }
  }, [savedUser, categories]);

  // Live, selection-aware stats — what today's session will actually draw from.
  const inScope = categories.filter((c) => sel.has(c.topic_id));
  const dueInScope = inScope.reduce((a, c) => a + c.due_count, 0);
  const newInScope = inScope.reduce((a, c) => a + c.new_count, 0);
  const dueElsewhere = categories
    .filter((c) => !sel.has(c.topic_id))
    .reduce((a, c) => a + c.due_count, 0);

  function toggle(topicId: string) {
    const base = new Set(sel);
    if (base.has(topicId)) base.delete(topicId);
    else base.add(topicId);
    setSelected(base);
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(categories.map((c) => c.topic_id)));
  }

  function start() {
    if (sel.size === 0) return;
    const topicIds = allSelected ? null : [...sel];
    // Persist this configuration as the learner's daily target so it's prefilled
    // next time and stays in sync with the profile editor. Best-effort — never
    // block the session on the save. (new-card cap is owned by the profile.)
    updateProfile.mutate({
      daily_target_count: countValue,
      daily_limit_type: limitType,
      daily_time_limit_minutes: timeValue,
      daily_topic_ids: topicIds,
      daily_self_rated_level: level,
    });
    setIntent({
      topicId: null,
      topicName: s.formTitle,
      examType: null,
      mode: "daily_review",
      count: countValue,
      topicIds,
      limitType,
      timeLimitMinutes: limitType === "time" ? timeValue : null,
      selfRatedLevel: level,
    });
    router.push("/dashboard/study/session");
  }

  const summary =
    limitType === "count" ? s.summaryCount(countValue) : s.summaryTime(timeValue);
  const composition =
    sel.size === 0
      ? s.none
      : dueInScope > 0
        ? s.startsReviews(dueInScope)
        : s.allNew;

  return (
    <div className="flex h-full flex-col">
      <Topbar title={s.formTitle} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-8 p-4 md:p-8">
          {/* ── Hero ──────────────────────────────────────────────────── */}
          <header className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {s.formTitle}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{s.formSubtitle}</p>
            </div>
            {!isLoading && categories.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                <StatPill
                  icon={<FlameIcon className="size-4" />}
                  label={s.dueToday2(dueInScope)}
                  tone="warning"
                />
                <StatPill
                  icon={<SparkleIcon className="size-4" />}
                  label={s.newAvailable(newInScope)}
                  tone="primary"
                />
              </div>
            )}
          </header>

          {isLoading && (
            <p className="text-sm text-muted-foreground">{t.dashStudy.loading}</p>
          )}

          {!isLoading && categories.length > 0 && (
            <>
              {/* ── Collections ───────────────────────────────────────── */}
              <Section
                title={s.collections}
                hint={s.collectionsHint}
                action={
                  <button
                    onClick={toggleAll}
                    className="text-xs font-semibold text-primary transition-opacity hover:opacity-70"
                  >
                    {allSelected ? s.clear : s.selectAll}
                  </button>
                }
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {categories.map((c) => {
                    const on = sel.has(c.topic_id);
                    const dot = MASTERY_COLOR[c.mastery_level] ?? "var(--m-none)";
                    return (
                      <button
                        key={c.topic_id}
                        onClick={() => toggle(c.topic_id)}
                        aria-pressed={on}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border-[1.5px] p-3.5 text-left transition-colors",
                          on
                            ? "border-primary bg-primary/[0.06]"
                            : "border-border bg-card hover:border-primary/40",
                        )}
                      >
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: dot }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {c.topic_name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {c.due_count > 0 && (
                              <span style={{ color: "var(--study-warning)" }}>
                                {s.dueCount(c.due_count)}
                              </span>
                            )}
                            {c.due_count > 0 && " · "}
                            {s.newCount(c.new_count)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                            on
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background",
                          )}
                        >
                          {on && <CheckIcon className="size-3.5" strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {dueElsewhere > 0 && (
                  <p className="pt-1 text-xs text-muted-foreground">
                    {s.dueElsewhere(dueElsewhere)}
                  </p>
                )}
              </Section>

              {/* ── Session length ────────────────────────────────────── */}
              <Section title={s.length}>
                <div className="inline-flex rounded-xl border bg-muted/40 p-1">
                  <Seg
                    active={limitType === "count"}
                    onClick={() => setLimitType("count")}
                    icon={<ListChecksIcon className="size-4" />}
                    label={s.byCount}
                  />
                  <Seg
                    active={limitType === "time"}
                    onClick={() => setLimitType("time")}
                    icon={<ClockIcon className="size-4" />}
                    label={s.byTime}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(limitType === "count" ? COUNT_OPTIONS : TIME_OPTIONS).map((n) => {
                    const active =
                      limitType === "count" ? countValue === n : timeValue === n;
                    const setter =
                      limitType === "count" ? setCountValue : setTimeValue;
                    const unit =
                      limitType === "count" ? s.questionsOpt(n) : s.minutesOpt(n);
                    return (
                      <button
                        key={n}
                        onClick={() => setter(n)}
                        className={cn(
                          "rounded-xl border-[1.5px] py-3 text-center transition-colors",
                          active
                            ? "border-primary bg-primary/[0.06]"
                            : "border-border bg-card hover:border-primary/40",
                        )}
                      >
                        <span className="block text-lg font-bold tabular-nums text-foreground">
                          {n}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {unit.replace(`${n} `, "")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* ── Starting level (optional, cold-start) ─────────────── */}
              <Section
                title={s.level}
                badge={s.optional}
                hint={s.levelHint}
              >
                <div className="flex flex-wrap gap-2">
                  <Chip
                    active={level === null}
                    onClick={() => setLevel(null)}
                    label={s.levelSkip}
                  />
                  {LEVELS.map((lv) => (
                    <Chip
                      key={lv}
                      active={level === lv}
                      onClick={() => setLevel(lv)}
                      label={s.levels[lv]}
                    />
                  ))}
                </div>
              </Section>
            </>
          )}
        </div>
      </div>

      {/* ── Pinned action bar with live summary ───────────────────────── */}
      <div className="sticky bottom-0 z-30 shrink-0 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-4 px-4 py-3 md:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{summary}</p>
            <p className="truncate text-xs text-muted-foreground">{composition}</p>
          </div>
          <Button
            className="ml-auto shrink-0"
            onClick={start}
            disabled={sel.size === 0 || isLoading}
          >
            {s.start}
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  title,
  hint,
  badge,
  action,
  children,
}: {
  title: string;
  hint?: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {title}
          {badge && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {badge}
            </span>
          )}
        </h2>
        {action}
      </div>
      {hint && <p className="-mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </section>
  );
}

function StatPill({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "warning" | "primary";
}) {
  const color = tone === "warning" ? "var(--study-warning)" : "var(--primary)";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

function Seg({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/[0.06] text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40",
      )}
    >
      {label}
    </button>
  );
}
