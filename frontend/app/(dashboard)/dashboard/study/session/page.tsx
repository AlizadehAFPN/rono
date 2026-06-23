"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { Confetti } from "@/components/dashboard/confetti";
import {
  useFinishSession,
  useNextItem,
  useStartSession,
  useSubmitAnswer,
} from "@/lib/hooks/use-practice";
import {
  isNextItem,
  type AnswerResultOut,
  type NextItemOut,
  type SessionSummaryOut,
} from "@/lib/types/practice";
import { usePracticeIntentStore } from "@/lib/stores/practice-intent";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import {
  ArrowLeftIcon,
  CalendarCheckIcon,
  CalendarClockIcon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  XIcon,
} from "lucide-react";

type Phase = "loading" | "active" | "feedback" | "done" | "caughtUp";

const SESSION_SIZE = 10;

// θ roughly spans [-3, 3]; map to a 0..100 meter for the ability bar.
const thetaToPct = (theta: number) =>
  Math.max(4, Math.min(100, ((theta + 3) / 6) * 100));

export default function StudySessionPage() {
  const { t } = useI18n();
  const p = t.dashPractice;
  const router = useRouter();
  const consumeIntent = usePracticeIntentStore((s) => s.consume);

  const start = useStartSession();
  const next = useNextItem();
  const submit = useSubmitAnswer();
  const finish = useFinishSession();

  const [phase, setPhase] = useState<Phase>("loading");
  const [sessionId, setSessionId] = useState<string>("");
  const [topicName, setTopicName] = useState<string>("");
  const [item, setItem] = useState<NextItemOut | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResultOut | null>(null);
  const [summary, setSummary] = useState<SessionSummaryOut | null>(null);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0); // consecutive correct
  // Daily-review extras: a wall-clock budget and the "nothing due" landing.
  const [isDaily, setIsDaily] = useState(false);
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);

  const target = item?.items_target ?? SESSION_SIZE;

  async function advance(id: string, daily = isDaily) {
    const r = await next.mutateAsync(id);
    if (isNextItem(r)) {
      setItem(r);
      setSelected(null);
      setResult(null);
      setStartedAt(Date.now());
      setPhase("active");
    } else {
      const sum = await finish.mutateAsync(id);
      // A daily review that delivered nothing means the learner is caught up —
      // show an encouraging "all done" rather than a 0% score card.
      if (daily && sum.items_delivered === 0) {
        setPhase("caughtUp");
      } else {
        setSummary(sum);
        setPhase("done");
      }
    }
  }

  useEffect(() => {
    const intent = consumeIntent();
    if (!intent) {
      router.replace("/dashboard/study");
      return;
    }
    setTopicName(intent.topicName);
    const daily = intent.mode === "daily_review";
    setIsDaily(daily);
    void (async () => {
      const session = await start.mutateAsync({
        session_type: intent.mode,
        exam_type: intent.examType,
        exam_part: null,
        topic_id: intent.topicId,
        items_target: intent.count,
        topic_ids: intent.topicIds ?? null,
        limit_type: intent.limitType ?? null,
        time_limit_minutes: intent.timeLimitMinutes ?? null,
        self_rated_level: intent.selfRatedLevel ?? null,
      });
      setSessionId(session.id);
      // Time-budgeted daily review: anchor the countdown to the server's clock.
      if (session.limit_type === "time" && session.time_limit_minutes) {
        setDeadlineMs(
          new Date(session.started_at).getTime() +
            session.time_limit_minutes * 60_000,
        );
      }
      await advance(session.id, daily);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(skip: boolean) {
    if (!item) return;
    const res = await submit.mutateAsync({
      id: sessionId,
      data: {
        item_id: item.item_id,
        selected_option_id: skip ? null : selected,
        response_time_ms: Date.now() - startedAt,
        was_skipped: skip,
      },
    });
    setResult(res);
    setCombo((cur) => (res.is_correct ? cur + 1 : 0));
    setPhase("feedback");
  }

  const exit = () => router.push("/dashboard/study");
  const editDailyTarget = () => router.push("/dashboard/daily");

  return (
    <div className="flex h-full flex-col">
      <Topbar title={topicName || p.pageTitle} />

      {phase === "loading" && (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          {p.states.loading}
        </div>
      )}

      {(phase === "active" || phase === "feedback") && item && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-4 md:min-h-0 md:flex-1 md:px-6">
            {/* progress + combo */}
            <div className="mb-4 flex shrink-0 items-center gap-3">
              <button
                onClick={exit}
                aria-label={p.runner.finish}
                className="grid size-9 shrink-0 place-items-center rounded-lg border text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeftIcon className="size-4" />
              </button>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--track)]">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{
                    width: `${(((item.items_delivered ?? 0) + (phase === "feedback" ? 1 : 0)) / target) * 100}%`,
                  }}
                />
              </div>
              {deadlineMs !== null && (
                <Countdown deadlineMs={deadlineMs} label={t.dashStudy.daily.timeLeft} />
              )}
              {combo >= 2 && (
                <span
                  className="animate-study-pop inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold"
                  style={{
                    color: "var(--study-warning)",
                    borderColor: "color-mix(in srgb, var(--study-warning) 40%, transparent)",
                    backgroundColor: "color-mix(in srgb, var(--study-warning) 10%, transparent)",
                  }}
                >
                  <FlameIcon className="size-3.5" />
                  {p.runner.panel.streak(combo)}
                </span>
              )}
            </div>

            {/* body */}
            <div className="grid gap-4 md:min-h-0 md:flex-1 md:grid-cols-[1.4fr_1fr]">
              {/* question + options */}
              <div className="flex flex-col rounded-2xl border bg-card p-5 shadow-xs md:min-h-0 md:p-6">
                <p className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {topicName ? `${topicName} · ` : ""}
                  {p.runner.progress(item.items_delivered + 1, item.items_target)}
                </p>
                <p className="mt-3 shrink-0 whitespace-pre-line text-[17px] font-normal leading-relaxed text-foreground md:text-lg">
                  {item.content}
                </p>
                <div className="mt-5 space-y-2.5 md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
                  {item.options
                    .slice()
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((o) => {
                      const isPicked = selected === o.id;
                      const isCorrect =
                        phase === "feedback" && result?.correct_option_id === o.id;
                      const isWrongPick =
                        phase === "feedback" && isPicked && !result?.is_correct;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          disabled={phase === "feedback"}
                          onClick={() => setSelected(o.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border-[1.5px] p-3.5 text-left text-[15px] transition-colors",
                            phase === "active" &&
                              (isPicked
                                ? "border-primary bg-primary/[0.08]"
                                : "border-border bg-background hover:border-primary/45"),
                            isCorrect && "animate-study-pop",
                            isWrongPick && "animate-study-shake",
                          )}
                          style={
                            isCorrect
                              ? {
                                  borderColor: "var(--study-success)",
                                  backgroundColor:
                                    "color-mix(in srgb, var(--study-success) 12%, transparent)",
                                }
                              : isWrongPick
                                ? {
                                    borderColor: "var(--study-danger)",
                                    backgroundColor:
                                      "color-mix(in srgb, var(--study-danger) 10%, transparent)",
                                  }
                                : undefined
                          }
                        >
                          <OptionMarker
                            label={o.key}
                            picked={isPicked && phase === "active"}
                            correct={!!isCorrect}
                            wrong={!!isWrongPick}
                          />
                          <span className="text-foreground">{o.content}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* side: context (active) → feedback */}
              <aside className="flex flex-col rounded-2xl border bg-card p-5 shadow-xs md:min-h-0 md:overflow-y-auto">
                {phase === "active" ? (
                  <SessionContext
                    title={p.runner.panel.title}
                    rows={[
                      [
                        p.runner.panel.progress,
                        `${item.items_delivered + 1} / ${target}`,
                        undefined,
                      ],
                      result
                        ? [
                            p.runner.panel.accuracy,
                            `${Math.round((result.items_correct / Math.max(1, result.items_delivered)) * 100)}%`,
                            "var(--study-success)",
                          ]
                        : null,
                      combo >= 1
                        ? [
                            p.runner.panel.streak(combo),
                            "",
                            "var(--study-warning)",
                          ]
                        : null,
                    ]}
                    hint={p.runner.selectHint}
                  />
                ) : (
                  result && (
                    <Feedback p={p} result={result} thetaToPct={thetaToPct} />
                  )
                )}
              </aside>
            </div>
          </div>

          {/* action bar — sticky, always on-hand */}
          <div className="sticky bottom-0 z-30 shrink-0 border-t bg-background/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-5xl items-center gap-2.5 px-4 py-3 md:px-6">
              <span className="hidden text-sm font-medium text-muted-foreground md:block">
                {p.runner.progress(item.items_delivered + 1, item.items_target)}
              </span>
              <div className="ml-auto flex flex-1 items-center gap-2.5 md:flex-initial">
                {phase === "active" ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => onSubmit(true)}
                      disabled={submit.isPending}
                    >
                      {p.runner.skip}
                    </Button>
                    <Button
                      className="flex-1 md:flex-initial"
                      onClick={() => onSubmit(false)}
                      disabled={!selected || submit.isPending}
                    >
                      {submit.isPending ? p.runner.submitting : p.runner.submit}
                    </Button>
                  </>
                ) : (
                  <Button
                    className="flex-1 md:flex-initial"
                    onClick={() => advance(sessionId)}
                    disabled={next.isPending || finish.isPending}
                  >
                    {next.isPending || finish.isPending
                      ? p.runner.finishing
                      : p.runner.next}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "done" && summary && (
        <SessionDone
          summary={summary}
          p={p}
          isDaily={isDaily}
          onRestart={exit}
          onEditTarget={editDailyTarget}
        />
      )}

      {phase === "caughtUp" && (
        <CaughtUp onExit={exit} onEditTarget={editDailyTarget} />
      )}
    </div>
  );
}

// ── Time-budget countdown chip ────────────────────────────────────────────────
function Countdown({ deadlineMs, label }: { deadlineMs: number; label: string }) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, Math.floor((deadlineMs - now) / 1000));
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const low = remaining <= 60;
  const color = low ? "var(--study-danger)" : "var(--muted-foreground)";
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold tabular-nums"
      style={{
        color,
        borderColor: low
          ? "color-mix(in srgb, var(--study-danger) 40%, transparent)"
          : undefined,
      }}
      aria-label={label}
    >
      <ClockIcon className="size-3.5" />
      {mm}:{ss.toString().padStart(2, "0")}
    </span>
  );
}

// ── Daily review: nothing due, learner is caught up ───────────────────────────
function CaughtUp({
  onExit,
  onEditTarget,
}: {
  onExit: () => void;
  onEditTarget: () => void;
}) {
  const { t } = useI18n();
  const d = t.dashStudy.daily;
  return (
    <div className="flex flex-1 items-center justify-center p-4 md:p-6">
      <div className="animate-study-fade w-full max-w-md rounded-2xl border bg-card p-7 text-center shadow-xs md:p-8">
        <div
          className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl"
          style={{
            color: "var(--study-success)",
            backgroundColor: "color-mix(in srgb, var(--study-success) 14%, transparent)",
          }}
        >
          <CalendarCheckIcon className="size-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {d.caughtUpTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {d.caughtUpBody}
        </p>
        <Button className="mt-6 w-full" onClick={onExit}>
          {d.backToStudy}
        </Button>
        <Button variant="outline" className="mt-2 w-full" onClick={onEditTarget}>
          {d.editTarget}
        </Button>
      </div>
    </div>
  );
}

// ── Option leading marker — tinted badge + icon, never white-on-fill ──────────
function OptionMarker({
  label,
  picked,
  correct,
  wrong,
}: {
  label: string;
  picked: boolean;
  correct: boolean;
  wrong: boolean;
}) {
  if (correct || wrong) {
    const color = correct ? "var(--study-success)" : "var(--study-danger)";
    return (
      <span
        className="grid size-6 shrink-0 place-items-center rounded-md"
        style={{
          color,
          backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
        }}
      >
        {correct ? (
          <CheckIcon className="size-4" strokeWidth={3} />
        ) : (
          <XIcon className="size-4" strokeWidth={3} />
        )}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-md border text-xs font-bold",
        picked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

// ── Pre-answer context panel ──────────────────────────────────────────────────
function SessionContext({
  title,
  rows,
  hint,
}: {
  title: string;
  rows: ([string, string, string | undefined] | null)[];
  hint: string;
}) {
  return (
    <div className="animate-study-fade flex h-full flex-col">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="mt-4 space-y-0">
        {rows.filter(Boolean).map((row, i) => {
          const [label, value, color] = row as [string, string, string | undefined];
          return (
            <div
              key={i}
              className="flex items-center justify-between border-b py-3 last:border-b-0"
            >
              <span className="text-sm text-muted-foreground">
                {value ? label : ""}
              </span>
              <span
                className="text-sm font-bold text-foreground"
                style={color ? { color } : undefined}
              >
                {value || label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-auto pt-4 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

// ── Post-answer feedback ──────────────────────────────────────────────────────
function Feedback({
  p,
  result,
  thetaToPct,
}: {
  p: ReturnType<typeof useI18n>["t"]["dashPractice"];
  result: AnswerResultOut;
  thetaToPct: (t: number) => number;
}) {
  const ok = result.is_correct;
  const skipped = result.was_skipped;
  const color = ok ? "var(--study-success)" : "var(--study-danger)";
  const dTheta = result.theta_after - result.theta_before;

  const sched = p.runner.schedule;
  const days = result.card?.scheduled_interval_days ?? 0;
  const reviewText =
    days >= 1
      ? sched.inDays(Math.round(days))
      : days * 24 >= 1
        ? sched.inHours(Math.round(days * 24))
        : days * 24 * 60 >= 1
          ? sched.inMinutes(Math.round(days * 24 * 60))
          : sched.soon;

  return (
    <div className="animate-study-fade flex h-full flex-col">
      <div className="flex items-center gap-2.5">
        <span
          className="grid size-7 place-items-center rounded-lg text-white"
          style={{ backgroundColor: color }}
        >
          {ok ? (
            <CheckIcon className="size-4" strokeWidth={3} />
          ) : (
            <XIcon className="size-4" strokeWidth={3} />
          )}
        </span>
        <span className="text-base font-bold" style={{ color }}>
          {skipped ? p.runner.skipped : ok ? p.runner.correct : p.runner.incorrect}
        </span>
      </div>

      {/* ability change */}
      <div className="mt-4 rounded-xl border bg-background p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {p.runner.panel.ability}
        </p>
        <p className="mt-1.5 text-sm font-bold" style={{ color }}>
          {dTheta >= 0 ? "+" : ""}
          {dTheta.toFixed(2)}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--track)]">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{
              width: `${thetaToPct(result.theta_after)}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* spaced repetition */}
      <div className="mt-2.5 rounded-xl border bg-background p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {sched.label}
        </p>
        <p className="mt-1.5 flex items-center gap-2 text-sm font-bold text-foreground">
          <CalendarClockIcon className="size-4 text-muted-foreground" />
          {reviewText}
        </p>
      </div>

      {/* explanation */}
      {result.explanation && (
        <div className="mt-2.5 min-h-0 flex-1 overflow-y-auto border-t pt-3.5 text-sm leading-relaxed text-muted-foreground">
          <p className="mb-1.5 font-semibold text-foreground">
            {p.runner.explanation}
          </p>
          <p className="whitespace-pre-line">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ── Session complete ──────────────────────────────────────────────────────────
function SessionDone({
  summary,
  p,
  isDaily,
  onRestart,
  onEditTarget,
}: {
  summary: SessionSummaryOut;
  p: ReturnType<typeof useI18n>["t"]["dashPractice"];
  isDaily: boolean;
  onRestart: () => void;
  onEditTarget: () => void;
}) {
  const { t } = useI18n();
  const d = t.dashStudy.daily;
  const accuracy =
    summary.items_delivered > 0
      ? Math.round((summary.items_correct / summary.items_delivered) * 100)
      : 0;

  return (
    <div className="flex flex-1 items-center justify-center p-4 md:p-6">
      <Confetti />
      <div className="animate-study-fade w-full max-w-md rounded-2xl border bg-card p-7 text-center shadow-xs md:p-8">
        <div className="mx-auto mb-3 w-fit">
          <ProgressRing value={accuracy} size={132} stroke={10} color="var(--primary)">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">
                {accuracy}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {p.summary.accuracy}
              </span>
            </div>
          </ProgressRing>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {p.summary.title}
        </h2>

        <div className="mt-5 flex gap-2.5">
          <DoneStat
            value={summary.items_correct}
            label={p.summary.correct}
            color="var(--study-success)"
          />
          <DoneStat
            value={summary.items_wrong}
            label={p.summary.wrong}
            color="var(--study-danger)"
          />
          <DoneStat value={summary.items_skipped} label={p.summary.skipped} />
        </div>

        {isDaily ? (
          <>
            {/* The daily target is a soft goal — Study mode isn't capped by it,
                so we nudge the learner there to keep answering. */}
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {d.reachedTargetBody}
            </p>
            <Button className="mt-5 w-full" onClick={onRestart}>
              {d.continueStudy}
            </Button>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={onEditTarget}
            >
              {d.editTarget}
            </Button>
          </>
        ) : (
          <Button className="mt-6 w-full" onClick={onRestart}>
            {p.summary.restart}
          </Button>
        )}
      </div>
    </div>
  );
}

function DoneStat({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="flex-1 rounded-xl border bg-background p-3">
      <div
        className={cn("text-xl font-extrabold", !color && "text-foreground")}
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
