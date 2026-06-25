"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Topbar } from "@/components/dashboard/topbar";
import { QuestionImageField } from "@/components/dashboard/question-image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useItem,
  useItemVersions,
  useUpdateItem,
  useDeleteItem,
  useCreateItemVersion,
} from "@/lib/hooks/use-items";
import { useTopicsTree } from "@/lib/hooks/use-topics";
import type { TopicOut, TopicTree } from "@/lib/types/topics";
import { EXAM_TYPE_LABELS, STATUS_LABELS } from "@/lib/types/items";
import { toast } from "@/lib/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleIcon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Topic helpers
// ---------------------------------------------------------------------------

function flattenTree(nodes: TopicTree[]): TopicOut[] {
  const out: TopicOut[] = [];
  function walk(ns: TopicTree[]) {
    for (const n of ns) {
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  }
  walk(nodes);
  return out;
}

function buildBreadcrumb(
  topicId: string | null,
  allTopics: TopicOut[],
): TopicOut[] {
  if (!topicId) return [];
  const map = new Map(allTopics.map((t) => [t.id, t]));
  const chain: TopicOut[] = [];
  let cur = map.get(topicId);
  while (cur) {
    chain.unshift(cur);
    cur = cur.parent_id ? map.get(cur.parent_id) : undefined;
  }
  return chain;
}

function deriveExamType(breadcrumb: TopicOut[]): string | null {
  const examTopic = breadcrumb.find((t) => t.level === 0);
  if (!examTopic) return null;
  const match = Object.entries(EXAM_TYPE_LABELS).find(
    ([, label]) => label.toLowerCase() === examTopic.name.toLowerCase(),
  );
  return match?.[0] ?? null;
}

// ---------------------------------------------------------------------------
// IRT difficulty card
// ---------------------------------------------------------------------------

type CalibrationKey = "uncalibrated" | "pre_set" | "calibrating" | "calibrated";

const CALIBRATION_BADGES: Record<string, { key: CalibrationKey; cls: string }> =
  {
    uncalibrated: {
      key: "uncalibrated",
      cls: "border-slate-300 text-slate-600 bg-slate-50",
    },
    pre_set: {
      key: "pre_set",
      cls: "border-blue-300 text-blue-700 bg-blue-50",
    },
    calibrating: {
      key: "calibrating",
      cls: "border-yellow-300 text-yellow-700 bg-yellow-50",
    },
    calibrated: {
      key: "calibrated",
      cls: "border-green-300 text-green-700 bg-green-50",
    },
  };

const DIFFICULTY_PRESETS = [
  {
    value: 1,
    labelKey: "veryEasy",
    emoji: "🟢",
    irtB: -2.0,
    dot: "bg-emerald-500",
    active: "border-emerald-400 bg-emerald-50 text-emerald-700",
  },
  {
    value: 2,
    labelKey: "easy",
    emoji: "🔵",
    irtB: -1.0,
    dot: "bg-blue-500",
    active: "border-blue-400 bg-blue-50 text-blue-700",
  },
  {
    value: 3,
    labelKey: "average",
    emoji: "🟡",
    irtB: 0.0,
    dot: "bg-slate-500",
    active: "border-slate-400 bg-slate-100 text-slate-700",
  },
  {
    value: 4,
    labelKey: "hard",
    emoji: "🟠",
    irtB: 1.0,
    dot: "bg-orange-500",
    active: "border-orange-400 bg-orange-50 text-orange-700",
  },
  {
    value: 5,
    labelKey: "veryHard",
    emoji: "🔴",
    irtB: 2.0,
    dot: "bg-red-500",
    active: "border-red-400 bg-red-50 text-red-700",
  },
] as const;

type PresetKey = (typeof DIFFICULTY_PRESETS)[number]["labelKey"];

function irtDotColor(b: number): string {
  if (b <= -1.5) return "bg-emerald-500";
  if (b <= -0.5) return "bg-blue-500";
  if (b <= 0.5) return "bg-slate-500";
  if (b <= 1.5) return "bg-orange-500";
  return "bg-red-500";
}

function irtBToPreset(b: number | null): number | null {
  if (b == null) return null;
  for (const p of DIFFICULTY_PRESETS) {
    if (Math.abs(p.irtB - b) < 0.01) return p.value;
  }
  return null;
}

function closestPresetKey(b: number): PresetKey {
  let best: (typeof DIFFICULTY_PRESETS)[number] = DIFFICULTY_PRESETS[0];
  for (const p of DIFFICULTY_PRESETS) {
    if (Math.abs(p.irtB - b) < Math.abs(best.irtB - b)) best = p;
  }
  return best.labelKey;
}

// ---------------------------------------------------------------------------
// Shared preset buttons — read-only in view mode, interactive in edit mode
// ---------------------------------------------------------------------------

function PresetButtons({
  activePreset,
  onSelect,
  readOnly = false,
}: {
  activePreset: number | null;
  onSelect?: (preset: number) => void;
  readOnly?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t.dashItemEditor.difficulty.presetLabel}
      </p>
      <div className="grid grid-cols-5 gap-2">
        {DIFFICULTY_PRESETS.map((p) => {
          const isSelected = activePreset === p.value;
          return (
            <button
              key={p.value}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onSelect?.(p.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border py-3 text-center transition-all",
                isSelected ? p.active : "border-border text-muted-foreground",
                !readOnly && "hover:border-muted-foreground/40",
                readOnly && "cursor-default",
              )}
            >
              <span className="text-lg leading-none">{p.emoji}</span>
              <span className="text-[11px] leading-tight font-medium px-0.5">
                {t.dashItemEditor.difficulty.presets[p.labelKey]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IrtDifficultyCard({
  calibrationStatus,
  irtA,
  irtB,
  irtASe,
  irtBSe,
  irtResponsesUsed,
}: {
  calibrationStatus: string;
  irtA: number | null;
  irtB: number | null;
  irtASe: number | null;
  irtBSe: number | null;
  irtResponsesUsed: number;
}) {
  const { t } = useI18n();
  const badge =
    CALIBRATION_BADGES[calibrationStatus] ?? CALIBRATION_BADGES.uncalibrated;
  const barPosition =
    irtB != null ? Math.max(0, Math.min(100, ((irtB + 3) / 6) * 100)) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            {t.dashItemEditor.sections.difficulty}
          </CardTitle>
          <Badge variant="outline" className={cn("text-[10px]", badge.cls)}>
            {t.dashItemEditor.calibration[badge.key]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gradient bar */}
        <div className="space-y-1">
          <div className="relative h-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-slate-300 to-red-400 opacity-80">
            {barPosition != null && irtB != null && (
              <span
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-4 rounded-full ring-2 ring-background shadow-md transition-all duration-300",
                  irtDotColor(irtB),
                )}
                style={{ left: `${barPosition}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{t.dashItemEditor.difficulty.scale.easy}</span>
            <span>{t.dashItemEditor.difficulty.scale.hard}</span>
          </div>
        </div>

        {/* Contextual detail text */}
        {calibrationStatus === "uncalibrated" && irtB == null && (
          <p className="text-xs text-muted-foreground">
            {t.dashItemEditor.calibration.awaitingCalibration(irtResponsesUsed)}
          </p>
        )}
        {(calibrationStatus === "pre_set" ||
          (calibrationStatus === "uncalibrated" && irtB != null)) &&
          irtB != null && (
            <p className="text-xs text-muted-foreground">
              {t.dashItemEditor.calibration.expertPreset(
                t.dashItemEditor.difficulty.presets[closestPresetKey(irtB)],
                irtB.toFixed(1),
              )}
            </p>
          )}
        {calibrationStatus === "calibrating" && (
          <p className="text-xs text-muted-foreground">
            {t.dashItemEditor.calibration.calibratingProgress(
              irtResponsesUsed,
              irtB != null ? irtB.toFixed(2) : null,
            )}
          </p>
        )}
        {calibrationStatus === "calibrated" && irtB != null && (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t.dashItemEditor.difficulty.fields.difficultyB}
              </span>
              <span className="font-medium tabular-nums">
                {irtB.toFixed(3)}
                {irtBSe != null && (
                  <span className="text-muted-foreground">
                    {" "}
                    ±{irtBSe.toFixed(3)}
                  </span>
                )}
              </span>
            </div>
            {irtA != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.dashItemEditor.difficulty.fields.discriminationA}
                </span>
                <span className="font-medium tabular-nums">
                  {irtA.toFixed(3)}
                  {irtASe != null && (
                    <span className="text-muted-foreground">
                      {" "}
                      ±{irtASe.toFixed(3)}
                    </span>
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t.dashItemEditor.difficulty.fields.responsesUsed}
              </span>
              <span>{irtResponsesUsed}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Version history
// ---------------------------------------------------------------------------

function VersionHistoryCard({ itemId }: { itemId: string }) {
  const { t } = useI18n();
  const { data: versions, isPending } = useItemVersions(itemId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {t.dashItemEditor.sections.versionHistory}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isPending && <Skeleton className="h-8 w-full" />}
        {versions?.map((v) => (
          <div
            key={v.id}
            className="flex items-start gap-2 rounded-md border p-2.5 text-sm"
          >
            <ClockIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">v{v.version_number}</span>
                {v.is_published && (
                  <Badge variant="success" className="text-[10px]">
                    {t.dashItemEditor.versions.published}
                  </Badge>
                )}
                {v.change_summary && (
                  <span className="text-xs text-muted-foreground truncate">
                    {v.change_summary}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(v.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Inline edit card
// ---------------------------------------------------------------------------

type EditValues = {
  content: string;
  explanation?: string;
  difficulty_preset?: number | null;
  options: {
    key: string;
    content: string;
    is_correct: boolean;
    explanation?: string;
  }[];
};
const OPTION_KEYS = ["A", "B", "C", "D", "E", "F"];

function InlineEditCard({
  itemId,
  currentVersion: cv,
  calibrationStatus,
  currentIrtB,
  onClose,
}: {
  itemId: string;
  currentVersion:
    | NonNullable<ReturnType<typeof useItem>["data"]>["current_version"]
    | undefined;
  calibrationStatus: string;
  currentIrtB: number | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const createVersion = useCreateItemVersion();
  const updateItem = useUpdateItem();
  const [imageUrl, setImageUrl] = useState<string | null>(
    cv?.media_attachments?.[0]?.url ?? null,
  );
  const canEditDifficulty =
    calibrationStatus === "uncalibrated" || calibrationStatus === "pre_set";

  const v = t.dashItemEditor.validation;
  const editSchema = useMemo(
    () =>
      z.object({
        content: z.string().min(10, { message: v.stemMin }),
        explanation: z.string().optional(),
        difficulty_preset: z.number().int().min(1).max(5).nullable().optional(),
        options: z
          .array(
            z.object({
              key: z.string().min(1, { message: v.keyRequired }),
              content: z.string().min(1, { message: v.optionTextRequired }),
              is_correct: z.boolean(),
              explanation: z.string().optional(),
            }),
          )
          .min(2, { message: v.optionsMin })
          .refine((opts) => opts.some((o) => o.is_correct), {
            message: v.atLeastOneCorrectShort,
          }),
      }),
    [v],
  );

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      content: cv?.content ?? "",
      explanation: cv?.explanation ?? "",
      difficulty_preset: irtBToPreset(currentIrtB) ?? undefined,
      options:
        cv?.options
          .slice()
          .sort((a, b) => a.display_order - b.display_order)
          .map((o) => ({
            key: o.key,
            content: o.content,
            is_correct: o.is_correct,
            explanation: o.explanation ?? "",
          })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const watchOptions = form.watch("options");

  function setCorrectOption(index: number) {
    fields.forEach((_, i) => {
      form.setValue(`options.${i}.is_correct`, i === index, {
        shouldValidate: true,
      });
    });
  }

  async function onSubmit(values: EditValues) {
    try {
      await createVersion.mutateAsync({
        id: itemId,
        data: {
          content: values.content,
          explanation: values.explanation || null,
          media_attachments: imageUrl ? [{ url: imageUrl }] : [],
          change_summary: "Content edit",
          options: values.options.map((o, i) => ({
            key: o.key,
            content: o.content,
            is_correct: o.is_correct,
            explanation: o.explanation || null,
            display_order: i,
          })),
        },
      });
      if (
        canEditDifficulty &&
        values.difficulty_preset != null &&
        values.difficulty_preset !== irtBToPreset(currentIrtB)
      ) {
        await updateItem.mutateAsync({
          id: itemId,
          data: { difficulty_preset: values.difficulty_preset },
        });
      }
      toast({ title: t.dashItemEditor.toast.saved });
      onClose();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? String(err.detail)
          : t.dashItemEditor.toast.saveFailed;
      toast({
        title: t.dashItemEditor.toast.error,
        description: msg,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm">
                {t.dashItemEditor.sections.editQuestion}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <XIcon className="size-3.5" />
                  {t.common.actions.cancel}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createVersion.isPending || updateItem.isPending}
                >
                  {createVersion.isPending || updateItem.isPending
                    ? t.dashItemEditor.buttons.saving
                    : t.dashItemEditor.buttons.saveChanges}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            {/* Question stem */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.dashItemEditor.sections.questionStem}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px] resize-y text-sm"
                      placeholder={t.dashItemEditor.stem.placeholderEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <QuestionImageField value={imageUrl} onChange={setImageUrl} />

            {/* Explanation */}
            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.dashItemEditor.explanation.label}{" "}
                    <span className="normal-case font-normal text-muted-foreground/60">
                      {t.dashItemEditor.explanation.optional}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[80px] resize-y text-sm"
                      placeholder={t.dashItemEditor.explanation.placeholderEdit}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            {/* Answer choices */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.dashItemEditor.sections.answerChoices}
                </p>
                {fields.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        key:
                          OPTION_KEYS[fields.length] ??
                          String(fields.length + 1),
                        content: "",
                        is_correct: false,
                        explanation: "",
                      })
                    }
                  >
                    <PlusIcon className="size-3" />
                    {t.dashItemEditor.options.addOption}
                  </Button>
                )}
              </div>

              {fields.map((field, index) => {
                const isCorrect = watchOptions[index]?.is_correct;
                return (
                  <div
                    key={field.id}
                    className={cn(
                      "rounded-lg border transition-colors",
                      isCorrect
                        ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20"
                        : "border-border bg-muted/20",
                    )}
                  >
                    <div className="flex items-center gap-2.5 px-3 pt-2.5">
                      <button
                        type="button"
                        title={
                          isCorrect
                            ? t.dashItemEditor.options.correctAnswer
                            : t.dashItemEditor.options.markAsCorrect
                        }
                        onClick={() => setCorrectOption(index)}
                        className="shrink-0"
                      >
                        {isCorrect ? (
                          <CheckCircle2Icon className="size-4 text-emerald-600" />
                        ) : (
                          <CircleIcon className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                      </button>
                      <span className="text-xs font-bold w-5 text-muted-foreground">
                        {watchOptions[index]?.key}
                      </span>
                      <FormField
                        control={form.control}
                        name={`options.${index}.content`}
                        render={({ field: cf }) => (
                          <FormItem className="flex-1 m-0">
                            <FormControl>
                              <Input
                                className="h-8 text-sm border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                placeholder={
                                  t.dashItemEditor.options.contentPlaceholder
                                }
                                {...cf}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {fields.length > 2 && (
                        <button
                          type="button"
                          title={t.dashItemEditor.options.removeOption}
                          onClick={() => remove(index)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2Icon className="size-3.5" />
                        </button>
                      )}
                    </div>
                    {/* Per-option explanation */}
                    <FormField
                      control={form.control}
                      name={`options.${index}.explanation`}
                      render={({ field: cf }) => (
                        <FormItem className="mx-3 mb-2 ms-10">
                          <FormControl>
                            <Input
                              className="h-7 text-xs border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-muted-foreground placeholder:text-muted-foreground/40"
                              placeholder={
                                t.dashItemEditor.options
                                  .optionExplanationPlaceholderEdit
                              }
                              {...cf}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                );
              })}
            </div>

            {/* Difficulty preset — only for uncalibrated / expert-set items */}
            {canEditDifficulty && (
              <>
                <Separator />
                <FormField
                  control={form.control}
                  name="difficulty_preset"
                  render={({ field: pf }) => (
                    <FormItem>
                      <PresetButtons
                        activePreset={pf.value ?? null}
                        onSelect={(v) => pf.onChange(v)}
                      />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

// ---------------------------------------------------------------------------
// View card (read-only)
// ---------------------------------------------------------------------------

function ViewCard({
  cv,
  calibrationStatus,
  irtB,
  onEdit,
}: {
  cv:
    | NonNullable<ReturnType<typeof useItem>["data"]>["current_version"]
    | null
    | undefined;
  calibrationStatus: string;
  irtB: number | null;
  onEdit: () => void;
}) {
  const { t } = useI18n();
  const canShowPreset =
    calibrationStatus === "uncalibrated" || calibrationStatus === "pre_set";
  const savedPreset = irtBToPreset(irtB);

  return (
    <Card>
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            {t.dashItemEditor.sections.questionStem}
          </CardTitle>
          <Button size="sm" onClick={onEdit}>
            <PencilIcon className="size-3.5" />
            {t.dashItemEditor.buttons.editQuestion}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {cv ? (
          <>
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {cv.content}
              </p>
            </div>

            {cv.media_attachments?.[0]?.url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={cv.media_attachments[0].url}
                alt=""
                className="max-h-64 rounded-lg border border-border object-contain"
              />
            )}

            {cv.explanation && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.dashItemEditor.explanation.label}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cv.explanation}
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.dashItemEditor.sections.answerChoices}
              </p>
              {cv.options
                .slice()
                .sort((a, b) => a.display_order - b.display_order)
                .map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg border p-3",
                      option.is_correct
                        ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                        : "",
                    )}
                  >
                    {option.is_correct ? (
                      <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    ) : (
                      <CircleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground">
                          {option.key}.
                        </span>
                        <span className="text-sm">{option.content}</span>
                        {option.is_correct && (
                          <Badge variant="success" className="text-[10px]">
                            {t.dashItemEditor.options.correct}
                          </Badge>
                        )}
                      </div>
                      {option.explanation && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {option.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Read-only difficulty preset */}
            {canShowPreset && (
              <>
                <Separator />
                <PresetButtons activePreset={savedPreset} readOnly />
              </>
            )}
          </>
        ) : (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {t.dashItemEditor.view.noContent}
            </p>
            <Button size="sm" variant="outline" onClick={onEdit}>
              <PencilIcon className="size-3.5" />
              {t.dashItemEditor.view.addContent}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useI18n();
  const { data: item, isPending, isError } = useItem(id);
  const { data: tree } = useTopicsTree();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const allTopics = useMemo(() => (tree ? flattenTree(tree) : []), [tree]);

  const breadcrumb = useMemo(
    () => buildBreadcrumb(item?.primary_topic_id ?? null, allTopics),
    [item?.primary_topic_id, allTopics],
  );

  const derivedExamType = useMemo(
    () => deriveExamType(breadcrumb),
    [breadcrumb],
  );

  async function handleStatusChange(status: string) {
    try {
      await updateItem.mutateAsync({ id, data: { status } });
      toast({ title: t.dashItemEditor.toast.statusUpdated });
    } catch {
      toast({
        title: t.dashItemEditor.toast.updateFailed,
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    try {
      await deleteItem.mutateAsync(id);
      toast({ title: t.dashItemEditor.toast.deleted });
      router.push("/dashboard/items");
    } catch {
      toast({
        title: t.dashItemEditor.toast.deleteFailed,
        variant: "destructive",
      });
    }
  }

  const cv = item?.current_version;

  return (
    <div className="flex flex-col">
      <Topbar
        title={
          mode === "edit"
            ? t.dashItemEditor.pageTitle.edit
            : t.dashItemEditor.pageTitle.detail
        }
      />
      <div className="w-full space-y-4 p-4 md:space-y-6 md:p-6">
        {/* Back navigation */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="-ms-2">
            <Link href="/dashboard/items">
              <ArrowLeftIcon className="size-4" />
              {t.dashItemEditor.buttons.backToQuestions}
            </Link>
          </Button>
        </div>

        {/* Loading state */}
        {isPending && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {t.dashItemEditor.states.loadError}
            </AlertDescription>
          </Alert>
        )}

        {/* Content */}
        {item && (
          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            {/* ── Main content col ── */}
            <div className="space-y-4 md:space-y-6 md:col-span-2">
              {mode === "view" ? (
                <ViewCard
                  cv={cv}
                  calibrationStatus={item.calibration_status}
                  irtB={item.irt_b}
                  onEdit={() => setMode("edit")}
                />
              ) : (
                <InlineEditCard
                  itemId={id}
                  currentVersion={cv}
                  calibrationStatus={item.calibration_status}
                  currentIrtB={item.irt_b}
                  onClose={() => setMode("view")}
                />
              )}
              <VersionHistoryCard itemId={id} />
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-4">
              {/* Metadata card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {t.dashItemEditor.sections.metadata}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      {t.dashItemEditor.metadata.status}
                    </label>
                    <Select
                      value={item.status}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Classification */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      {t.dashItemEditor.metadata.classification}
                    </label>
                    {breadcrumb.length > 0 ? (
                      <div className="space-y-1">
                        {breadcrumb.map((t, i) => (
                          <div key={t.id} className="flex items-center gap-1">
                            {i > 0 && (
                              <ChevronRightIcon className="size-3 shrink-0 text-muted-foreground" />
                            )}
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-xs",
                                i === 0
                                  ? "bg-orange-100 font-medium text-orange-700"
                                  : "text-foreground",
                              )}
                            >
                              {t.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {t.dashItemEditor.topic.noTopicAssigned}
                      </p>
                    )}
                  </div>

                  {/* Derived exam type */}
                  {derivedExamType && (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        {t.dashItemEditor.metadata.examType}
                      </label>
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                        {EXAM_TYPE_LABELS[derivedExamType]}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.dashItemEditor.metadata.type}
                      </span>
                      <span>{item.item_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.dashItemEditor.metadata.created}
                      </span>
                      <span>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* IRT difficulty card */}
              <IrtDifficultyCard
                calibrationStatus={item.calibration_status}
                irtA={item.irt_a}
                irtB={item.irt_b}
                irtASe={item.irt_a_se}
                irtBSe={item.irt_b_se}
                irtResponsesUsed={item.irt_responses_used}
              />

              <Button
                variant="destructive"
                className="w-full"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2Icon className="size-3.5" />
                {t.dashItemEditor.buttons.deleteQuestion}
              </Button>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        <Dialog
          open={confirmDelete}
          onOpenChange={(o) => !o && setConfirmDelete(false)}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{t.dashItemEditor.deleteDialog.title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {t.dashItemEditor.deleteDialog.body}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                {t.common.actions.cancel}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteItem.isPending}
              >
                {deleteItem.isPending
                  ? t.common.actions.deleting
                  : t.common.actions.delete}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
