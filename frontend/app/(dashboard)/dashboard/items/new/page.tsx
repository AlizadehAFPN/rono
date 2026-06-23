"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateItem } from "@/lib/hooks/use-items";
import { useTopicsTree } from "@/lib/hooks/use-topics";
import type { TopicOut, TopicTree } from "@/lib/types/topics";
import {
  EXAM_TYPE_LABELS,
  EXAM_TYPES,
  EXAM_PARTS,
  EXAM_SESSIONS,
} from "@/lib/types/items";
import { toast } from "@/lib/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import {
  CheckCircle2Icon,
  CircleIcon,
  GripVerticalIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function flattenTree(nodes: TopicTree[]): TopicOut[] {
  const result: TopicOut[] = [];
  const walk = (items: TopicTree[]) => {
    for (const item of items) {
      result.push(item);
      walk(item.children);
    }
  };
  walk(nodes);
  return result;
}

// Sentinel for "unspecified" Select options (Radix Select disallows empty values).
const NONE = "__none__";

// ── Difficulty presets ────────────────────────────────────────────────────────

const DIFFICULTY_PRESETS = [
  {
    value: 1,
    labelKey: "veryEasy",
    emoji: "🟢",
    irtB: -2.0,
    activeClass:
      "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  {
    value: 2,
    labelKey: "easy",
    emoji: "🔵",
    irtB: -1.0,
    activeClass:
      "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  {
    value: 3,
    labelKey: "average",
    emoji: "🟡",
    irtB: 0.0,
    activeClass:
      "border-slate-400 bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-300",
    dot: "bg-slate-500",
  },
  {
    value: 4,
    labelKey: "hard",
    emoji: "🟠",
    irtB: 1.0,
    activeClass:
      "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  {
    value: 5,
    labelKey: "veryHard",
    emoji: "🔴",
    irtB: 2.0,
    activeClass:
      "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
    dot: "bg-red-500",
  },
] as const;

// ── Topic level select ────────────────────────────────────────────────────────

function TopicLevelSelect({
  label,
  dot,
  options,
  value,
  onChange,
  disabled,
  placeholder,
  noOptionsLabel,
  required,
}: {
  label: string;
  dot: string;
  options: TopicOut[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
  noOptionsLabel: string;
  required?: boolean;
}) {
  return (
    <div className="grid grid-cols-[108px_1fr] items-center gap-3">
      <div className="flex items-center gap-2">
        <span className={cn("size-2 shrink-0 rounded-full", dot)} />
        <span className="text-sm font-medium text-foreground/80">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
      </div>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || options.length === 0}
      >
        <SelectTrigger className={cn(disabled && "opacity-50")}>
          <SelectValue
            placeholder={
              options.length === 0 && !disabled ? noOptionsLabel : placeholder
            }
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── Schema ────────────────────────────────────────────────────────────────────

type ItemFormValues = {
  exam_type: string;
  exam_part: string;
  source?: string;
  source_reference?: string;
  exam_year?: string;
  exam_session: string;
  topic_id: string;
  difficulty_preset: number;
  content: string;
  explanation?: string;
  change_summary?: string;
  options: {
    key: string;
    content: string;
    is_correct: boolean;
    explanation?: string;
  }[];
};

const OPTION_KEYS = ["A", "B", "C", "D", "E", "F"];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewItemPage() {
  const router = useRouter();
  const { t } = useI18n();
  const create = useCreateItem();
  const { data: tree } = useTopicsTree();

  const v = t.dashItemEditor.validation;
  const itemFormSchema = useMemo(
    () =>
      z.object({
        exam_type: z.string(),
        exam_part: z.string(),
        source: z.string().optional(),
        source_reference: z.string().optional(),
        exam_year: z
          .string()
          .optional()
          .refine((val) => !val || /^\d{4}$/.test(val), { message: v.yearInvalid }),
        exam_session: z.string(),
        topic_id: z.string().min(1, { message: v.topicRequired }),
        difficulty_preset: z.number().int().min(1).max(5),
        content: z.string().min(10, { message: v.stemMin }),
        explanation: z.string().optional(),
        change_summary: z.string().optional(),
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
          .max(6, { message: v.optionsMax })
          .refine((opts) => opts.some((o) => o.is_correct), {
            message: v.atLeastOneCorrect,
          }),
      }),
    [v],
  );

  const flatTopics = useMemo(() => (tree ? flattenTree(tree) : []), [tree]);

  // Subject-based topic cascade: subject → domain → sub-domain. The deepest
  // selected level is assigned as the question's topic_id. Subjects are the
  // top-level (level 0) topics; exam/part are independent fields below.
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDomainId, setSelectedDomainId] = useState("");

  const subjects = useMemo(
    () => flatTopics.filter((t) => t.level === 0),
    [flatTopics],
  );
  const domains = useMemo(
    () =>
      flatTopics.filter(
        (t) => t.level === 1 && t.parent_id === selectedSubjectId,
      ),
    [flatTopics, selectedSubjectId],
  );
  const subdomains = useMemo(
    () =>
      flatTopics.filter(
        (t) => t.level === 2 && t.parent_id === selectedDomainId,
      ),
    [flatTopics, selectedDomainId],
  );

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      exam_type: NONE,
      exam_part: NONE,
      source: "",
      source_reference: "",
      exam_year: "",
      exam_session: NONE,
      topic_id: "",
      difficulty_preset: 3,
      content: "",
      explanation: "",
      change_summary: "",
      options: [
        { key: "A", content: "", is_correct: false, explanation: "" },
        { key: "B", content: "", is_correct: false, explanation: "" },
        { key: "C", content: "", is_correct: false, explanation: "" },
        { key: "D", content: "", is_correct: false, explanation: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });
  const watchOptions = form.watch("options");
  const watchPreset = form.watch("difficulty_preset");
  const watchTopicId = form.watch("topic_id");

  function setCorrectOption(index: number) {
    form.getValues("options").forEach((_, i) => {
      form.setValue(`options.${i}.is_correct`, i === index, {
        shouldValidate: true,
      });
    });
  }

  function addOption() {
    const nextKey =
      OPTION_KEYS[fields.length] ?? String.fromCharCode(65 + fields.length);
    append({ key: nextKey, content: "", is_correct: false, explanation: "" });
  }

  async function onSubmit(values: ItemFormValues) {
    try {
      const item = await create.mutateAsync({
        exam_type: values.exam_type === NONE ? null : values.exam_type,
        exam_part: values.exam_part === NONE ? null : values.exam_part,
        source: values.source?.trim() || null,
        source_reference: values.source_reference?.trim() || null,
        exam_year: values.exam_year ? Number(values.exam_year) : null,
        exam_session: values.exam_session === NONE ? null : values.exam_session,
        topic_ids: [values.topic_id],
        primary_topic_id: values.topic_id,
        difficulty_preset: values.difficulty_preset,
        version: {
          content: values.content,
          explanation: values.explanation || null,
          change_summary: values.change_summary || null,
          options: values.options.map((o, i) => ({
            key: o.key,
            content: o.content,
            is_correct: o.is_correct,
            explanation: o.explanation || null,
            display_order: i,
          })),
        },
      });
      toast({ title: t.dashItemEditor.toast.created, variant: "default" });
      router.push(`/dashboard/items/${item.id}`);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? String(err.detail)
          : t.dashItemEditor.toast.createFailed;
      toast({
        title: t.dashItemEditor.toast.error,
        description: msg,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-col">
      <Topbar title={t.dashItemEditor.pageTitle.new} />
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Classification ─────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {t.dashItemEditor.sections.classification}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Exam + exam part — exam-based, independent of the topic tree */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="exam_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.dashItemEditor.exam.typeLabel}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  t.dashItemEditor.exam.typePlaceholder
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE}>
                              {t.dashItemEditor.exam.typeNone}
                            </SelectItem>
                            {EXAM_TYPES.map((et) => (
                              <SelectItem key={et} value={et}>
                                {EXAM_TYPE_LABELS[et]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="exam_part"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.dashItemEditor.exam.partLabel}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  t.dashItemEditor.exam.partPlaceholder
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE}>
                              {t.dashItemEditor.exam.partNone}
                            </SelectItem>
                            {EXAM_PARTS.map((ep) => (
                              <SelectItem key={ep} value={ep}>
                                {
                                  t.dashItemEditor.exam.parts[
                                    ep as keyof typeof t.dashItemEditor.exam.parts
                                  ]
                                }
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Subject-based topic cascade (deepest selected level = topic_id) */}
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">
                    {t.dashItemEditor.topic.label}{" "}
                    <span className="text-destructive">*</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.dashItemEditor.topic.hint}
                  </p>

                  <div className="mt-2 rounded-lg border bg-muted/20 p-4 space-y-3">
                    {/* Subject (required — sets topic_id) */}
                    <TopicLevelSelect
                      label={t.dashItemEditor.topic.levels.subject}
                      dot="bg-blue-500"
                      options={subjects}
                      value={selectedSubjectId}
                      onChange={(v) => {
                        setSelectedSubjectId(v);
                        setSelectedDomainId("");
                        form.setValue("topic_id", v, { shouldValidate: true });
                      }}
                      placeholder={t.dashItemEditor.topic.placeholders.subject}
                      noOptionsLabel={
                        t.dashItemEditor.topic.placeholders.noOptions
                      }
                      required
                    />

                    {/* Domain (optional — overrides topic_id when chosen) */}
                    <TopicLevelSelect
                      label={t.dashItemEditor.topic.levels.domain}
                      dot="bg-violet-500"
                      options={domains}
                      value={selectedDomainId}
                      onChange={(v) => {
                        setSelectedDomainId(v);
                        form.setValue("topic_id", v, { shouldValidate: true });
                      }}
                      disabled={!selectedSubjectId}
                      placeholder={
                        !selectedSubjectId
                          ? t.dashItemEditor.topic.placeholders
                              .selectSubjectFirst
                          : t.dashItemEditor.topic.placeholders.domain
                      }
                      noOptionsLabel={
                        t.dashItemEditor.topic.placeholders.noOptions
                      }
                    />

                    {/* Sub-domain (optional — overrides topic_id when chosen) */}
                    <TopicLevelSelect
                      label={t.dashItemEditor.topic.levels.subdomain}
                      dot="bg-emerald-500"
                      options={subdomains}
                      value={
                        subdomains.some((s) => s.id === watchTopicId)
                          ? watchTopicId
                          : ""
                      }
                      onChange={(v) =>
                        form.setValue("topic_id", v, { shouldValidate: true })
                      }
                      disabled={!selectedDomainId}
                      placeholder={
                        !selectedDomainId
                          ? t.dashItemEditor.topic.placeholders.selectDomainFirst
                          : t.dashItemEditor.topic.placeholders.subdomain
                      }
                      noOptionsLabel={
                        t.dashItemEditor.topic.placeholders.noOptions
                      }
                    />
                  </div>

                  {form.formState.errors.topic_id && (
                    <p className="pl-1 pt-0.5 text-sm font-medium text-destructive">
                      {form.formState.errors.topic_id.message}
                    </p>
                  )}
                </div>

                {/* Difficulty preset */}
                <FormField
                  control={form.control}
                  name="difficulty_preset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.dashItemEditor.difficulty.label}</FormLabel>
                      <p className="text-xs text-muted-foreground -mt-1">
                        {t.dashItemEditor.difficulty.hint}
                      </p>
                      <div className="flex gap-2 pt-1">
                        {DIFFICULTY_PRESETS.map((p) => {
                          const isActive = field.value === p.value;
                          return (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => field.onChange(p.value)}
                              className={cn(
                                "flex flex-1 flex-col items-center gap-2 rounded-lg border px-1 py-3.5 text-center transition-all",
                                isActive
                                  ? p.activeClass
                                  : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:bg-muted/40",
                              )}
                            >
                              <span className="text-xl leading-none">
                                {p.emoji}
                              </span>
                              <span className="text-xs font-semibold leading-tight">
                                {
                                  t.dashItemEditor.difficulty.presets[
                                    p.labelKey
                                  ]
                                }
                              </span>
                              <span className="font-mono text-[10px] opacity-60">
                                b={p.irtB > 0 ? "+" : ""}
                                {p.irtB.toFixed(1)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <FormDescription className="pt-0.5">
                        {t.dashItemEditor.difficulty.descriptionPrefix}
                        <strong>
                          {t.dashItemEditor.difficulty.descriptionDefault}
                        </strong>
                        {t.dashItemEditor.difficulty.descriptionSuffix}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ── Source / provenance ─────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {t.dashItemEditor.provenance.sectionLabel}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t.dashItemEditor.provenance.sectionHint}
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t.dashItemEditor.provenance.sourceLabel}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            t.dashItemEditor.provenance.sourcePlaceholder
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source_reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t.dashItemEditor.provenance.sourceRefLabel}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            t.dashItemEditor.provenance.sourceRefPlaceholder
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exam_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t.dashItemEditor.provenance.yearLabel}
                      </FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          placeholder={
                            t.dashItemEditor.provenance.yearPlaceholder
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exam_session"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t.dashItemEditor.provenance.sessionLabel}
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                t.dashItemEditor.provenance.sessionPlaceholder
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE}>
                            {t.dashItemEditor.provenance.sessionNone}
                          </SelectItem>
                          {EXAM_SESSIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {
                                t.dashItemEditor.provenance.sessions[
                                  s as keyof typeof t.dashItemEditor.provenance.sessions
                                ]
                              }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ── Question stem ───────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {t.dashItemEditor.sections.questionStem}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={t.dashItemEditor.stem.placeholder}
                          className="min-h-[120px] resize-y font-normal text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t.dashItemEditor.explanation.overallLabel}{" "}
                        <span className="font-normal text-muted-foreground">
                          {t.dashItemEditor.explanation.optional}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t.dashItemEditor.explanation.placeholder}
                          className="min-h-[80px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ── Answer choices ──────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">
                      {t.dashItemEditor.sections.answerChoices}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.dashItemEditor.options.hint}
                    </p>
                  </div>
                  {fields.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      <PlusIcon className="size-3.5" />
                      {t.dashItemEditor.options.addOption}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.formState.errors.options?.root && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {form.formState.errors.options.root.message}
                    </AlertDescription>
                  </Alert>
                )}

                {fields.map((field, index) => {
                  const isCorrect = watchOptions[index]?.is_correct;
                  return (
                    <div
                      key={field.id}
                      className={cn(
                        "rounded-lg border p-3 transition-colors",
                        isCorrect
                          ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                          : "border-border",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          className="mt-2.5 shrink-0"
                          onClick={() => setCorrectOption(index)}
                          title={
                            isCorrect
                              ? t.dashItemEditor.options.correctAnswer
                              : t.dashItemEditor.options.markAsCorrect
                          }
                        >
                          {isCorrect ? (
                            <CheckCircle2Icon className="size-5 text-green-600" />
                          ) : (
                            <CircleIcon className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
                          )}
                        </button>

                        <GripVerticalIcon className="mt-2.5 size-4 shrink-0 text-muted-foreground/40" />

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name={`options.${index}.key`}
                              render={({ field: keyField }) => (
                                <Input
                                  {...keyField}
                                  className="h-7 w-12 text-center text-xs font-bold uppercase"
                                  maxLength={2}
                                />
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`options.${index}.content`}
                              render={({ field: contentField }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      placeholder={t.dashItemEditor.options.optionPlaceholder(
                                        OPTION_KEYS[index] ?? index + 1,
                                      )}
                                      className="h-8"
                                      {...contentField}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {fields.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => remove(index)}
                              >
                                <Trash2Icon className="size-3.5" />
                              </Button>
                            )}
                          </div>

                          <FormField
                            control={form.control}
                            name={`options.${index}.explanation`}
                            render={({ field: expField }) => (
                              <Input
                                placeholder={
                                  t.dashItemEditor.options
                                    .optionExplanationPlaceholder
                                }
                                className="h-7 text-xs"
                                {...expField}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* ── Version note ────────────────────────────────────────────── */}
            <Card>
              <CardContent className="pt-4">
                <FormField
                  control={form.control}
                  name="change_summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t.dashItemEditor.versionNote.label}{" "}
                        <span className="font-normal text-muted-foreground">
                          {t.dashItemEditor.versionNote.optional}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t.dashItemEditor.versionNote.placeholder}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t.dashItemEditor.versionNote.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t.common.actions.cancel}
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending
                  ? t.dashItemEditor.buttons.creating
                  : t.dashItemEditor.buttons.createQuestion}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
