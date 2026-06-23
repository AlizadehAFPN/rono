"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBulkSubmitAnswers,
  useExamPaper,
  useFinishSession,
  useStartSession,
  useSubmitAnswer,
} from "@/lib/hooks/use-practice";
import type { ExamItemOut, SessionSummaryOut } from "@/lib/types/practice";
import { EXAM_TYPE_LABELS, EXAM_TYPES } from "@/lib/types/items";
import { useAuthStore } from "@/lib/stores/auth";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, LayoutGridIcon, XIcon } from "lucide-react";

const NONE = "__none__";
const BOOKLET = "A";
type Phase = "setup" | "loading" | "ready" | "exam" | "results";

type AnswerMap = Record<string, string | null>;
interface QResult {
  is_correct: boolean;
  was_skipped: boolean;
  correct_option_id: string | null;
  explanation: string | null;
}
type ResultMap = Record<string, QResult>;

// Printed national-exam booklet: ink on paper, on a dark desk. The paper colours
// come from --exam-* CSS variables (see globals.css) so the booklet is warm ivory
// in light mode and a dark sheet in dark mode; the desk stays dark in both.
const SERIF =
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif';
const SANS = "var(--font-geist-sans, system-ui)";

function fmtTime(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function ExamPage() {
  const { t } = useI18n();
  const x = t.dashPractice.exam;
  const user = useAuthStore((s) => s.user);
  const candidate = user?.full_name ?? user?.preferred_name ?? user?.email ?? "—";

  const start = useStartSession();
  const paper = useExamPaper();
  const submit = useSubmitAnswer();
  const bulkSubmit = useBulkSubmitAnswers();
  const finish = useFinishSession();

  const [phase, setPhase] = useState<Phase>("setup");
  const [examType, setExamType] = useState<string>("tus");
  const [examPart, setExamPart] = useState<string>(NONE);
  const [feedbackMode, setFeedbackMode] = useState<boolean>(false);

  const [sessionId, setSessionId] = useState<string>("");
  const [items, setItems] = useState<ExamItemOut[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<ResultMap>({});
  const [current, setCurrent] = useState<number>(0);
  const [summary, setSummary] = useState<SessionSummaryOut | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const [showReview, setShowReview] = useState<boolean>(false);
  const submittedIds = useRef<Set<string>>(new Set());
  const startMsRef = useRef<number>(0);

  const answeredCount = useMemo(
    () => items.filter((it) => answers[it.item_id] != null).length,
    [items, answers],
  );
  const bookletCode = useMemo(
    () => (sessionId ? sessionId.replace(/-/g, "").slice(0, 6).toUpperCase() : "000000"),
    [sessionId],
  );

  const sectionLabel =
    examPart === "basic_sciences"
      ? x.setup.basic
      : examPart === "clinical_sciences"
        ? x.setup.clinical
        : null;
  const examTitle = [EXAM_TYPE_LABELS[examType] ?? examType, sectionLabel]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    if (phase !== "exam") return;
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - startMsRef.current) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exam" && phase !== "ready") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  const item = items[current];

  const choose = useCallback(
    async (it: ExamItemOut, optionId: string) => {
      if (results[it.item_id]) return; // graded & locked (feedback mode)
      if (feedbackMode) {
        // One shot: pick reveals the answer, so no toggling-off here.
        setAnswers((a) => ({ ...a, [it.item_id]: optionId }));
        const res = await submit.mutateAsync({
          id: sessionId,
          data: { item_id: it.item_id, selected_option_id: optionId },
        });
        submittedIds.current.add(it.item_id);
        setResults((r) => ({
          ...r,
          [it.item_id]: {
            is_correct: res.is_correct,
            was_skipped: res.was_skipped,
            correct_option_id: res.correct_option_id,
            explanation: res.explanation,
          },
        }));
        return;
      }
      // Exam mode: clicking the chosen option again clears it, so a student can
      // deliberately leave it blank (TUS penalises wrong answers, not blanks).
      setAnswers((a) => ({
        ...a,
        [it.item_id]: a[it.item_id] === optionId ? null : optionId,
      }));
    },
    [results, feedbackMode, sessionId, submit],
  );

  function toggleFlag(itemId: string) {
    setFlagged((f) => {
      const n = new Set(f);
      if (n.has(itemId)) n.delete(itemId);
      else n.add(itemId);
      return n;
    });
  }

  useEffect(() => {
    if (phase !== "exam" || showReview || !item) return;
    function onKey(e: KeyboardEvent) {
      if (!item) return;
      const opts = [...item.options].sort((a, b) => a.display_order - b.display_order);
      const k = e.key.toLowerCase();
      const num = Number(e.key);
      if (!Number.isNaN(num) && num >= 1 && num <= opts.length) choose(item, opts[num - 1].id);
      else if (k >= "a" && k <= "z") {
        const idx = k.charCodeAt(0) - 97;
        if (opts[idx]) choose(item, opts[idx].id);
      } else if (e.key === "ArrowRight") setCurrent((c) => Math.min(items.length - 1, c + 1));
      else if (e.key === "ArrowLeft") setCurrent((c) => Math.max(0, c - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, showReview, item, items.length, choose]);

  async function onStart() {
    const session = await start.mutateAsync({
      session_type: "exam",
      exam_type: examType === NONE ? null : examType,
      exam_part: examPart === NONE ? null : examPart,
      items_target: null,
    });
    setSessionId(session.id);
    setPhase("loading");
    const p = await paper.mutateAsync({ id: session.id });
    setItems(p.items);
    setAnswers({});
    setFlagged(new Set());
    setResults({});
    submittedIds.current = new Set();
    setCurrent(0);
    setElapsed(0);
    setPhase(p.items.length > 0 ? "ready" : "exam");
  }

  function begin() {
    startMsRef.current = Date.now();
    setElapsed(0);
    setPhase("exam");
  }

  async function onSubmitExam() {
    setShowReview(false);
    setPhase("loading");
    const collected: ResultMap = { ...results };

    // Grade every not-yet-submitted answer in one atomic round-trip
    // (feedback-mode answers were already graded live, so they're skipped).
    const pending = items.filter((it) => !submittedIds.current.has(it.item_id));
    if (pending.length > 0) {
      const { results: graded } = await bulkSubmit.mutateAsync({
        id: sessionId,
        answers: pending.map((it) => {
          const sel = answers[it.item_id] ?? null;
          return { item_id: it.item_id, selected_option_id: sel, was_skipped: sel == null };
        }),
      });
      for (const res of graded) {
        submittedIds.current.add(res.item_id);
        collected[res.item_id] = {
          is_correct: res.is_correct,
          was_skipped: res.was_skipped,
          correct_option_id: res.correct_option_id,
          explanation: res.explanation,
        };
      }
    }
    setResults(collected);
    const s = await finish.mutateAsync(sessionId);
    setSummary(s);
    setPhase("results");
  }

  function exit() {
    if (window.confirm(x.runner.exitConfirm)) reset();
  }

  function reset() {
    setPhase("setup");
    setItems([]);
    setAnswers({});
    setFlagged(new Set());
    setResults({});
    setSummary(null);
    setSessionId("");
    submittedIds.current = new Set();
    setCurrent(0);
    setElapsed(0);
    setShowReview(false);
  }

  function pickAt(index: number, optionId: string) {
    setCurrent(index);
    void choose(items[index], optionId);
  }

  const busy = start.isPending || paper.isPending;

  // ── Setup (normal dashboard chrome) ─────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="flex flex-col">
        <Topbar title={x.pageTitle} />
        <div className="mx-auto w-full max-w-2xl p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{x.setup.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{x.setup.subtitle}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium">{x.setup.examLabel}</span>
                  <Select value={examType} onValueChange={setExamType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_TYPES.map((e) => (
                        <SelectItem key={e} value={e}>
                          {EXAM_TYPE_LABELS[e]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium">{x.setup.partLabel}</span>
                  <Select value={examPart} onValueChange={setExamPart}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{x.setup.anyPart}</SelectItem>
                      <SelectItem value="basic_sciences">{x.setup.basic}</SelectItem>
                      <SelectItem value="clinical_sciences">{x.setup.clinical}</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <p className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                {x.setup.scopeHint}
              </p>
              <button
                type="button"
                onClick={() => setFeedbackMode((v) => !v)}
                className="flex w-full items-center justify-between gap-4 rounded-lg border p-3 text-left"
              >
                <span>
                  <span className="text-sm font-medium">{x.setup.feedbackLabel}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {x.setup.feedbackHint}
                  </span>
                </span>
                <span
                  className={cn(
                    "relative h-6 w-10 shrink-0 rounded-full transition-colors",
                    feedbackMode ? "bg-primary" : "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
                      feedbackMode ? "left-[18px]" : "left-0.5",
                    )}
                  />
                </span>
              </button>
              <Button onClick={onStart} disabled={busy} size="lg" className="w-full">
                {busy ? x.setup.starting : x.setup.start}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Exam world ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0E1116] text-[#E7E3D8]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_-5%,rgba(150,170,200,0.10),transparent)]"
      />

      {phase === "loading" && (
        <div className="relative flex flex-1 items-center justify-center">
          <p className="text-sm text-white/55">{x.setup.starting}</p>
        </div>
      )}

      {/* ── Cover sheet ── */}
      {phase === "ready" && (
        <div className="relative flex flex-1 items-center justify-center overflow-y-auto p-6">
          <Paper className="w-full max-w-md p-9">
            <Masthead board={x.official.board} bookletLabel={x.official.booklet} codeLabel={x.official.code} code={bookletCode} />
            <h1 className="mt-6 text-center text-2xl font-bold leading-snug">{examTitle}</h1>
            <div className="mt-5 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--exam-muted)]">
                  {x.official.candidate}
                </div>
                <div className="truncate border-b border-[var(--exam-ink)] pb-0.5 text-[15px] font-semibold">
                  {candidate}
                </div>
              </div>
              <Barcode seed={bookletCode} />
            </div>

            <div className="my-6 border-t-2 border-[var(--exam-ink)]" />

            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--exam-accent)]">
              {x.official.instructions}
            </div>
            <ol className="mt-2 space-y-1.5 text-[14px] leading-relaxed text-[var(--exam-ink-2)]">
              <li>1. {x.ready.rule1}</li>
              <li>2. {x.ready.rule2}</li>
              <li>3. {feedbackMode ? x.ready.feedbackOn : x.ready.feedbackOff}</li>
              <li>4. {x.ready.noTimeLimit}</li>
            </ol>
            <div className="mt-5 flex items-baseline justify-center gap-2 text-[var(--exam-muted)]">
              <span className="text-3xl font-bold tabular-nums text-[var(--exam-ink)]">{items.length}</span>
              <span className="text-sm">
                {x.ready.questions(items.length).replace(String(items.length), "").trim()}
              </span>
            </div>
            <button
              onClick={begin}
              className="mt-6 w-full rounded-[2px] bg-[var(--exam-ink)] py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--exam-paper)] transition-colors hover:bg-[var(--exam-ink-hover)]"
              style={{ fontFamily: SANS }}
            >
              {x.ready.begin}
            </button>
          </Paper>
        </div>
      )}

      {/* ── Exam runner ── */}
      {phase === "exam" && item && (
        <>
          <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0E1116]/90 px-4 py-2.5 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={exit}
                title={x.runner.exit}
                className="grid size-8 place-items-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white"
              >
                <XIcon className="size-4" />
              </button>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{examTitle}</div>
                <div className="text-xs text-white/45">
                  {x.runner.question(current + 1, items.length)} · {answeredCount}/{items.length}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-base font-semibold tabular-nums">
                <ClockIcon className="size-4 text-white/55" />
                {fmtTime(elapsed)}
              </span>
              <Button onClick={() => setShowReview(true)} size="sm">
                {x.runner.submit}
              </Button>
            </div>
          </header>

          <div className="relative flex flex-1 justify-center gap-6 overflow-y-auto px-4 py-6 sm:px-6">
            {/* Booklet page */}
            <Paper
              key={item.item_id}
              className="h-fit w-full max-w-2xl duration-200 animate-in fade-in slide-in-from-bottom-1 motion-reduce:animate-none"
            >
              {/* red margin rule */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-12 hidden w-px bg-[var(--exam-margin)]/35 sm:block"
              />
              <div className="px-6 py-7 sm:pl-16 sm:pr-12">
                {/* running header */}
                <div className="flex items-center justify-between border-b border-[var(--exam-ink)]/25 pb-2 text-[10px] uppercase tracking-[0.18em] text-[var(--exam-muted)]">
                  <span className="truncate">SYNAPSE · {examTitle}</span>
                  <span className="shrink-0">
                    {x.official.booklet} {BOOKLET} · {bookletCode}
                  </span>
                </div>

                {/* question */}
                <div className="mt-7 flex gap-3.5">
                  <span className="shrink-0 text-lg font-bold">{current + 1}.</span>
                  <p className="text-[17px] leading-[1.8] text-justify whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                {/* options — lettered, as in a printed booklet */}
                <ol className="mt-6 space-y-1">
                  {[...item.options]
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((o) => {
                      const picked = answers[item.item_id] === o.id;
                      const res = results[item.item_id];
                      const isCorrect = res && res.correct_option_id === o.id;
                      const isWrong = res && picked && !res.is_correct;
                      return (
                        <li key={o.id}>
                          <button
                            type="button"
                            disabled={!!res}
                            onClick={() => choose(item, o.id)}
                            className={cn(
                              "flex w-full items-baseline gap-3 rounded-[2px] px-3 py-2 text-left text-[16px] transition-colors",
                              !res && picked && "bg-[var(--exam-ink)]/[0.06]",
                              isCorrect && "bg-green-700/10",
                              isWrong && "bg-red-700/10",
                              !res && !picked && "hover:bg-[var(--exam-ink)]/[0.035]",
                            )}
                          >
                            <span
                              className={cn(
                                "shrink-0 font-bold tabular-nums",
                                isCorrect && "text-green-800",
                                isWrong && "text-red-800",
                                !res && picked && "text-[var(--exam-ink)]",
                                !picked && !isCorrect && "text-[var(--exam-muted)]",
                              )}
                            >
                              {o.key})
                            </span>
                            <span className={cn(picked && !res && "font-medium")}>{o.content}</span>
                            {!res && picked && (
                              <span className="ml-auto shrink-0 self-center text-xs font-semibold uppercase tracking-wider text-[var(--exam-accent)]">
                                ✓
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                </ol>

                {results[item.item_id]?.explanation && (
                  <div className="mt-5 border-l-2 border-[var(--exam-accent)] bg-[var(--exam-soft)] p-4 text-[15px] leading-relaxed">
                    <p className="mb-1 font-bold uppercase tracking-wide text-[11px] text-[var(--exam-accent)]">
                      {x.feedback.explanation}
                    </p>
                    <p className="whitespace-pre-line text-[var(--exam-ink-2)]">
                      {results[item.item_id].explanation}
                    </p>
                  </div>
                )}

                {/* page controls — on the booklet itself */}
                <div
                  className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--exam-ink)]/15 pt-4"
                  style={{ fontFamily: SANS }}
                >
                  <button
                    type="button"
                    disabled={current === 0}
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--exam-ink)] transition-opacity hover:opacity-70 disabled:pointer-events-none disabled:opacity-25"
                  >
                    <ChevronLeftIcon className="size-4" />
                    {x.runner.prev}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFlag(item.item_id)}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider transition-colors",
                      flagged.has(item.item_id)
                        ? "text-[var(--exam-accent)]"
                        : "text-[var(--exam-muted)] hover:text-[var(--exam-ink)]",
                    )}
                  >
                    {flagged.has(item.item_id) ? `★ ${x.runner.flagged}` : `☆ ${x.runner.flag}`}
                  </button>
                  <button
                    type="button"
                    disabled={current === items.length - 1}
                    onClick={() => setCurrent((c) => Math.min(items.length - 1, c + 1))}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--exam-ink)] transition-opacity hover:opacity-70 disabled:pointer-events-none disabled:opacity-25"
                  >
                    {x.runner.next}
                    <ChevronRightIcon className="size-4" />
                  </button>
                </div>

                {/* page number */}
                <div className="mt-4 text-center text-[11px] tabular-nums text-[var(--exam-muted)]">
                  — {x.official.page} {current + 1} / {items.length} —
                </div>
              </div>
            </Paper>

            {/* OMR answer sheet (desktop) */}
            <div className="hidden h-fit w-[252px] shrink-0 lg:block">
              <OmrSheet
                items={items}
                answers={answers}
                flagged={flagged}
                current={current}
                onJump={setCurrent}
                onPick={pickAt}
                title={x.official.answerSheet}
                candidate={candidate}
                candidateLabel={x.official.candidate}
                code={bookletCode}
              />
            </div>
          </div>

          {/* keyboard hint (desktop) */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 text-[11px] text-white/30 lg:block">
            {x.runner.kbd}
          </div>

          {/* mobile answer-sheet button */}
          <button
            type="button"
            onClick={() => setShowReview(true)}
            className="absolute bottom-5 right-5 z-10 inline-flex items-center gap-2 rounded-full bg-[var(--exam-paper)] px-4 py-3 text-sm font-semibold text-[var(--exam-ink)] shadow-lg lg:hidden"
          >
            <LayoutGridIcon className="size-4" />
            {answeredCount}/{items.length}
          </button>

          {/* review & submit */}
          {showReview && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <Paper className="max-h-full w-full max-w-lg overflow-y-auto p-6">
                <h2 className="text-lg font-bold">{x.review.title}</h2>
                <p className="mt-0.5 text-sm text-[var(--exam-muted)]">{x.review.subtitle}</p>
                <div className="my-4 grid grid-cols-3 gap-3 text-center">
                  <PaperStat label={x.review.answered} value={answeredCount} />
                  <PaperStat label={x.review.blank} value={items.length - answeredCount} />
                  <PaperStat label={x.review.flagged} value={flagged.size} accent />
                </div>
                <OmrSheet
                  items={items}
                  answers={answers}
                  flagged={flagged}
                  current={current}
                  onJump={(i) => {
                    setCurrent(i);
                    setShowReview(false);
                  }}
                  onPick={pickAt}
                  title={x.official.answerSheet}
                  candidate={candidate}
                  candidateLabel={x.official.candidate}
                  code={bookletCode}
                  bare
                />
                <div className="mt-5 flex gap-2" style={{ fontFamily: SANS }}>
                  <Button variant="outline" className="flex-1" onClick={() => setShowReview(false)}>
                    {x.review.keepWorking}
                  </Button>
                  <Button className="flex-1" onClick={onSubmitExam} disabled={submit.isPending}>
                    {submit.isPending ? x.runner.submitting : x.review.submitNow}
                  </Button>
                </div>
              </Paper>
            </div>
          )}
        </>
      )}

      {/* ── Score report ── */}
      {phase === "results" && summary && (
        <div className="relative flex-1 overflow-y-auto p-6">
          <Paper className="mx-auto w-full max-w-2xl p-8 sm:p-10">
            <Masthead board={x.official.board} bookletLabel={x.official.booklet} codeLabel={x.official.code} code={bookletCode} />
            <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--exam-accent)]">
              {x.results.title}
            </p>
            <h1 className="mt-1 text-center text-5xl font-bold tabular-nums">
              {summary.score_percent != null ? `${summary.score_percent}%` : "—"}
            </h1>
            <p className="mt-1 text-center text-sm text-[var(--exam-muted)]">
              {candidate} · {examTitle}
            </p>
            <div className="my-6 border-t-2 border-[var(--exam-ink)]" />

            <div className="grid grid-cols-3 gap-3 text-center">
              <PaperStat label={x.results.correct} value={summary.items_correct} tone="green" />
              <PaperStat label={x.results.wrong} value={summary.items_wrong} tone="red" />
              <PaperStat label={x.results.skipped} value={summary.items_skipped} />
            </div>
            <dl className="mt-5 space-y-1.5 text-[15px]">
              <PaperRow label={x.results.netScore} value={summary.net_score != null ? String(summary.net_score) : "—"} />
              <PaperRow
                label={x.results.ability}
                value={
                  summary.theta_delta != null
                    ? `${summary.theta_delta > 0 ? "+" : ""}${summary.theta_delta.toFixed(2)}`
                    : "—"
                }
              />
              {summary.time_spent_seconds != null && (
                <PaperRow label={x.results.timeTaken} value={fmtTime(summary.time_spent_seconds)} />
              )}
            </dl>

            <p className="mb-2 mt-6 text-sm font-bold">{x.results.review}</p>
            <div className="grid grid-cols-10 gap-1.5">
              {items.map((it, i) => {
                const r = results[it.item_id];
                const tone = !r
                  ? "border-[var(--exam-line)] text-[var(--exam-muted)]"
                  : r.was_skipped
                    ? "border-[var(--exam-line)] bg-[var(--exam-soft)] text-[var(--exam-muted)]"
                    : r.is_correct
                      ? "border-green-700 bg-green-700/10 text-green-800"
                      : "border-red-700 bg-red-700/10 text-red-800";
                return (
                  <div
                    key={it.item_id}
                    className={cn("flex h-7 items-center justify-center rounded-[2px] border font-mono text-[11px]", tone)}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>

            <button
              onClick={reset}
              className="mt-7 w-full rounded-[2px] bg-[var(--exam-ink)] py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--exam-paper)] transition-colors hover:bg-[var(--exam-ink-hover)]"
              style={{ fontFamily: SANS }}
            >
              {x.results.newExam}
            </button>
          </Paper>
        </div>
      )}
    </div>
  );
}

// ── Paper sheet ───────────────────────────────────────────────────────────
function Paper({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-[3px] bg-[var(--exam-paper)] text-[var(--exam-ink)] shadow-[0_24px_70px_-22px_rgba(0,0,0,0.72)] ring-1 ring-black/10",
        className,
      )}
      style={{ fontFamily: SERIF }}
      {...rest}
    >
      {children}
    </div>
  );
}

function Masthead({
  board,
  bookletLabel,
  codeLabel,
  code,
}: {
  board: string;
  bookletLabel: string;
  codeLabel: string;
  code: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-2 border-[var(--exam-ink)] px-4 py-3">
      <div className="min-w-0">
        <div className="text-lg font-black tracking-[0.22em]">SYNAPSE</div>
        <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--exam-muted)]">{board}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[13px] font-bold uppercase tracking-wider">
          {bookletLabel} {BOOKLET}
        </div>
        <div className="font-mono text-[10px] tracking-wide text-[var(--exam-muted)]">
          {codeLabel}: {code}
        </div>
      </div>
    </div>
  );
}

// CSS barcode — deterministic bars from the booklet code.
function Barcode({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    const out: { w: number; ink: boolean }[] = [];
    for (let i = 0; i < 46; i++) {
      const c = seed.charCodeAt(i % seed.length) + i * 7;
      out.push({ w: (c % 3) + 1, ink: ((c >> (i % 4)) & 1) === 1 });
    }
    return out;
  }, [seed]);
  return (
    <div className="shrink-0">
      <div className="flex h-9 items-stretch gap-px">
        {bars.map((b, i) => (
          <span
            key={i}
            className={b.ink ? "bg-[var(--exam-ink)]" : "bg-transparent"}
            style={{ width: `${b.w}px` }}
          />
        ))}
      </div>
      <div className="mt-0.5 text-center font-mono text-[9px] tracking-[0.15em] text-[var(--exam-muted)]">
        {seed}
      </div>
    </div>
  );
}

// ── OMR (optical-mark) answer sheet ───────────────────────────────────────
function OmrSheet({
  items,
  answers,
  flagged,
  current,
  onJump,
  onPick,
  title,
  candidate,
  candidateLabel,
  code,
  bare,
}: {
  items: ExamItemOut[];
  answers: AnswerMap;
  flagged: Set<string>;
  current: number;
  onJump: (i: number) => void;
  onPick: (i: number, optionId: string) => void;
  title: string;
  candidate: string;
  candidateLabel: string;
  code: string;
  bare?: boolean;
}) {
  return (
    <div
      className={cn(
        "text-[var(--exam-ink)]",
        !bare &&
          "rounded-[3px] bg-[var(--exam-paper)] p-4 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.7)] ring-1 ring-black/10",
      )}
    >
      <div className="mb-2 border-b-2 border-[var(--exam-ink)] pb-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--exam-accent)]">{title}</p>
        <p className="truncate text-[10px] text-[var(--exam-muted)]" style={{ fontFamily: SERIF }}>
          {candidateLabel}: {candidate} · {code}
        </p>
      </div>
      <div
        className="max-h-[52vh] space-y-0.5 overflow-y-auto pr-1"
        style={{ fontFamily: "var(--font-geist-mono, ui-monospace, monospace)" }}
      >
        {items.map((it, i) => {
          const sel = answers[it.item_id];
          const opts = [...it.options].sort((a, b) => a.display_order - b.display_order);
          return (
            <div
              key={it.item_id}
              className={cn(
                "flex items-center gap-1.5 rounded-[2px] px-1 py-0.5",
                i === current && "bg-[var(--exam-ink)]/[0.07]",
              )}
            >
              <button
                type="button"
                onClick={() => onJump(i)}
                className="flex w-7 shrink-0 items-center justify-end gap-0.5 text-[11px] tabular-nums text-[var(--exam-muted)] hover:text-[var(--exam-ink)]"
              >
                {flagged.has(it.item_id) && <span className="text-[var(--exam-accent)]">★</span>}
                {i + 1}
              </button>
              <div className="flex gap-1">
                {opts.map((o) => {
                  const on = sel === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => onPick(i, o.id)}
                      title={`${i + 1}${o.key}`}
                      className={cn(
                        "grid size-5 place-items-center rounded-full border text-[9px] font-bold transition-colors",
                        on
                          ? "border-[var(--exam-ink)] bg-[var(--exam-ink)] text-[var(--exam-paper)]"
                          : "border-[var(--exam-ink)]/35 text-[var(--exam-ink)]/50 hover:border-[var(--exam-ink)]",
                      )}
                    >
                      {o.key}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaperStat({
  label,
  value,
  tone,
  accent,
}: {
  label: string;
  value: number;
  tone?: "green" | "red";
  accent?: boolean;
}) {
  const color =
    tone === "green"
      ? "text-green-800"
      : tone === "red"
        ? "text-red-800"
        : accent
          ? "text-[var(--exam-accent)]"
          : "text-[var(--exam-ink)]";
  return (
    <div className="rounded-[3px] border border-[var(--exam-line)] p-3">
      <div className={cn("text-2xl font-bold tabular-nums", color)}>{value}</div>
      <div className="text-xs text-[var(--exam-muted)]">{label}</div>
    </div>
  );
}

function PaperRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-[var(--exam-line)] pb-1.5">
      <dt className="text-[var(--exam-muted)]">{label}</dt>
      <dd className="font-bold tabular-nums">{value}</dd>
    </div>
  );
}
