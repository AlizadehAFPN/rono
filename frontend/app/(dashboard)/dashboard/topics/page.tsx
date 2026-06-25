"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronRightIcon,
  FolderOpenIcon,
  FolderTreeIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useTopicsTree,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
} from "@/lib/hooks/use-topics";
import type { TopicOut, TopicTree } from "@/lib/types/topics";
import { toast } from "@/lib/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

// ── Constants & types ─────────────────────────────────────────────────────────

type Level = "exam" | "subject" | "domain" | "subdomain";

const LEVEL_META = {
  exam: {
    dot: "bg-orange-500",
    ring: "ring-orange-400/40",
    rowBg: "hover:bg-orange-500/5",
    activeBorder: "border-orange-300 dark:border-orange-700",
    activeBg: "bg-orange-50/60 dark:bg-orange-950/20",
    activeRing: "ring-1 ring-orange-400/30 dark:ring-orange-600/30",
    badge:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/60",
    statBg: "bg-orange-500/10 dark:bg-orange-500/10",
    statText: "text-orange-600 dark:text-orange-400",
    num: 0,
  },
  subject: {
    dot: "bg-blue-500",
    ring: "ring-blue-400/40",
    rowBg: "hover:bg-blue-500/5",
    activeBorder: "border-blue-300 dark:border-blue-700",
    activeBg: "bg-blue-50/60 dark:bg-blue-950/20",
    activeRing: "ring-1 ring-blue-400/30 dark:ring-blue-600/30",
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/60",
    statBg: "bg-blue-500/10 dark:bg-blue-500/10",
    statText: "text-blue-600 dark:text-blue-400",
    num: 1,
  },
  domain: {
    dot: "bg-violet-500",
    ring: "ring-violet-400/40",
    rowBg: "hover:bg-violet-500/5",
    activeBorder: "border-violet-300 dark:border-violet-700",
    activeBg: "bg-violet-50/60 dark:bg-violet-950/20",
    activeRing: "ring-1 ring-violet-400/30 dark:ring-violet-600/30",
    badge:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/60",
    statBg: "bg-violet-500/10 dark:bg-violet-500/10",
    statText: "text-violet-600 dark:text-violet-400",
    num: 2,
  },
  subdomain: {
    dot: "bg-emerald-500",
    ring: "ring-emerald-400/40",
    rowBg: "hover:bg-emerald-500/5",
    activeBorder: "border-emerald-300 dark:border-emerald-700",
    activeBg: "bg-emerald-50/60 dark:bg-emerald-950/20",
    activeRing: "ring-1 ring-emerald-400/30 dark:ring-emerald-600/30",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/60",
    statBg: "bg-emerald-500/10 dark:bg-emerald-500/10",
    statText: "text-emerald-600 dark:text-emerald-400",
    num: 3,
  },
} as const;

const LEVELS: Level[] = ["exam", "subject", "domain", "subdomain"];

function numToLevel(n: number): Level {
  if (n === 0) return "exam";
  if (n === 1) return "subject";
  if (n === 2) return "domain";
  return "subdomain";
}

function childLevel(l: Level): Level {
  if (l === "exam") return "subject";
  if (l === "subject") return "domain";
  return "subdomain";
}

function toSlug(v: string) {
  return v
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function computeStats(tree: TopicTree[]) {
  let e = 0,
    s = 0,
    d = 0,
    sd = 0;
  const walk = (nodes: TopicTree[]) => {
    for (const n of nodes) {
      if (n.level === 0) e++;
      else if (n.level === 1) s++;
      else if (n.level === 2) d++;
      else sd++;
      walk(n.children);
    }
  };
  walk(tree);
  return {
    exams: e,
    subjects: s,
    domains: d,
    subdomains: sd,
    total: e + s + d + sd,
  };
}

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

// ── Form schema ───────────────────────────────────────────────────────────────

function buildFormSchema(v: {
  nameRequired: string;
  slugRequired: string;
  slugFormat: string;
}) {
  return z.object({
    name: z.string().min(1, v.nameRequired),
    slug: z
      .string()
      .min(1, v.slugRequired)
      .regex(/^[a-z0-9-]+$/, v.slugFormat),
    description: z.string().optional(),
    display_order: z.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
  });
}
type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

// ── ParentSelect ──────────────────────────────────────────────────────────────

function ParentSelect({
  label,
  options,
  value,
  onChange,
  disabled,
  placeholder,
  emptyMessage,
}: {
  label: string;
  options: TopicOut[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
  emptyMessage: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label} <span className="text-destructive">*</span>
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            options.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── Delete dialog ─────────────────────────────────────────────────────────────

function DeleteDialog({
  topic,
  onClose,
}: {
  topic: TopicTree | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const td = t.dashTopics.delete;
  const del = useDeleteTopic();
  const hasChildren = (topic?.children?.length ?? 0) > 0;

  async function handleDelete() {
    if (!topic) return;
    try {
      await del.mutateAsync(topic.id);
      toast({ title: td.toastDeleted });
      onClose();
    } catch (err) {
      const detail =
        err instanceof ApiError &&
        typeof err.detail === "object" &&
        err.detail !== null &&
        "detail" in err.detail
          ? String((err.detail as { detail: string }).detail)
          : null;
      toast({
        title: td.toastCannotTitle,
        description: detail ?? td.toastCannotDescription,
        variant: "destructive",
      });
    }
  }

  const childCount = topic?.children.length ?? 0;

  return (
    <Dialog open={!!topic} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{td.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <p className="text-sm text-muted-foreground">
            {td.confirmPrefix}{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{topic?.name}&rdquo;
            </span>
            {td.confirmSuffix}
          </p>
          {hasChildren && (
            <Alert variant="destructive">
              <AlertDescription>
                {td.childWarningPrefix} {childCount}{" "}
                {childCount !== 1 ? td.childTopicUnitPlural : td.childTopicUnit}
                {td.childWarningSuffix}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t.common.actions.cancel}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={del.isPending || hasChildren}
          >
            {del.isPending ? td.deleting : td.confirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Topic node ────────────────────────────────────────────────────────────────

function TopicNode({
  topic,
  depth,
  onAdd,
  onEdit,
  onDelete,
  query,
}: {
  topic: TopicTree;
  depth: number;
  onAdd: (parentId: string, level: Level) => void;
  onEdit: (topic: TopicTree) => void;
  onDelete: (topic: TopicTree) => void;
  query: string;
}) {
  const { t } = useI18n();
  const dt = t.dashTopics;
  const [expanded, setExpanded] = useState(depth <= 1);
  const hasChildren = topic.children.length > 0;
  const isGlobal = topic.institution_id === null;
  const level = numToLevel(topic.level);
  const meta = LEVEL_META[level];
  const nextLevel = level !== "subdomain" ? childLevel(level) : null;

  const isMatch =
    query.length > 0 &&
    (topic.name.toLowerCase().includes(query.toLowerCase()) ||
      topic.slug.toLowerCase().includes(query.toLowerCase()));

  const actionButtons = (
    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      {nextLevel && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onAdd(topic.id, nextLevel)}
          title={`${dt.node.addChild} ${dt.levels[nextLevel].label}`}
          className="hover:bg-primary/10 hover:text-primary"
        >
          <PlusIcon className="size-3" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onEdit(topic)}
        title={dt.node.edit}
      >
        <PencilIcon className="size-3" />
      </Button>
      {!isGlobal && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-destructive/60 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(topic)}
          title={dt.node.delete}
        >
          <Trash2Icon className="size-3" />
        </Button>
      )}
    </div>
  );

  // ── Exam (depth 0): distinct card / section-header style ───────────────────
  if (depth === 0) {
    return (
      <div className="mb-2 last:mb-0">
        <div
          className={cn(
            "group flex items-center gap-3 rounded-xl border border-s-4 px-4 py-3.5",
            "border-orange-200/70 border-s-orange-500 dark:border-orange-800/40",
            "bg-orange-500/[0.06] dark:bg-orange-500/[0.05]",
            "transition-colors hover:bg-orange-500/10 dark:hover:bg-orange-500/[0.08]",
            isMatch && "ring-2 ring-amber-400/40",
          )}
        >
          <button
            className="flex size-6 shrink-0 items-center justify-center rounded-md transition-all text-orange-600/70 hover:bg-orange-500/20 hover:text-orange-600 dark:text-orange-400/70"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? dt.node.collapse : dt.node.expand}
          >
            <ChevronRightIcon
              className={cn(
                "size-4 transition-transform duration-200",
                expanded && "rotate-90",
              )}
            />
          </button>

          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 dark:bg-orange-500/20">
            <span className="text-[10px] font-extrabold tracking-tight text-orange-600 dark:text-orange-400">
              EX
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[15px] font-semibold leading-tight text-foreground">
              {topic.name}
            </span>
            <code className="hidden truncate font-mono text-[11px] leading-none text-muted-foreground/50 group-hover:block">
              {topic.slug}
            </code>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!topic.is_active && (
              <span className="rounded border border-border bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
                {dt.badges.inactive}
              </span>
            )}
            {isGlobal && (
              <span
                className={cn(
                  "rounded border px-1.5 py-px text-[10px] font-semibold",
                  meta.badge,
                )}
              >
                {dt.badges.global}
              </span>
            )}
            {hasChildren && (
              <span className="text-xs font-medium text-orange-600/60 dark:text-orange-400/60">
                {topic.children.length}{" "}
                {topic.children.length !== 1
                  ? dt.subjectUnitPlural
                  : dt.subjectUnit}
              </span>
            )}
            <span
              className={cn(
                "rounded border px-2 py-0.5 text-[10px] font-bold tracking-wide",
                meta.badge,
              )}
            >
              {dt.badges.exam}
            </span>
            {actionButtons}
          </div>
        </div>

        {expanded && hasChildren && (
          <div className="ms-7 mt-1.5 space-y-0.5 border-s-2 border-orange-200/50 pb-1 ps-4 dark:border-orange-800/30">
            {topic.children.map((child) => (
              <TopicNode
                key={child.id}
                topic={child}
                depth={1}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                query={query}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Subject / Domain / Subdomain: row style with left colour accent ─────────
  const rowCfg =
    depth === 1
      ? {
          border: "border-s-4 border-s-blue-400 dark:border-s-blue-500",
          hover: "hover:bg-blue-500/[0.05] dark:hover:bg-blue-500/[0.08]",
          childLine: "border-s-2 border-blue-200/50 dark:border-blue-800/40",
        }
      : depth === 2
        ? {
            border: "border-s-4 border-s-violet-400 dark:border-s-violet-500",
            hover: "hover:bg-violet-500/[0.05] dark:hover:bg-violet-500/[0.08]",
            childLine:
              "border-s-2 border-violet-200/50 dark:border-violet-800/40",
          }
        : {
            border: "border-s-4 border-s-emerald-400 dark:border-s-emerald-500",
            hover:
              "hover:bg-emerald-500/[0.05] dark:hover:bg-emerald-500/[0.08]",
            childLine:
              "border-s-2 border-emerald-200/50 dark:border-emerald-800/40",
          };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2.5 rounded-lg py-2.5 pe-2 ps-3",
          "transition-colors duration-100",
          rowCfg.border,
          rowCfg.hover,
          isMatch && "bg-amber-400/[0.08] ring-1 ring-amber-400/20",
        )}
      >
        <button
          className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? dt.node.collapse : dt.node.expand}
        >
          {hasChildren ? (
            <ChevronRightIcon
              className={cn(
                "size-3.5 transition-transform duration-150",
                expanded && "rotate-90",
              )}
            />
          ) : (
            <span className="size-3.5" />
          )}
        </button>

        <span className={cn("size-2 shrink-0 rounded-full", meta.dot)} />

        <span
          className={cn(
            "flex-1 truncate text-sm leading-none",
            depth === 1
              ? "font-medium text-foreground"
              : "font-normal text-foreground/85",
          )}
        >
          {topic.name}
        </span>

        <code className="hidden truncate font-mono text-[11px] text-muted-foreground/40 group-hover:block">
          {topic.slug}
        </code>

        {hasChildren && (
          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
            {topic.children.length}
          </span>
        )}

        {!topic.is_active && (
          <span className="shrink-0 rounded border border-border bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
            {dt.badges.inactive}
          </span>
        )}

        {isGlobal && (
          <span
            className={cn(
              "shrink-0 rounded border px-1.5 py-px text-[10px] font-medium",
              meta.badge,
            )}
          >
            {dt.badges.global}
          </span>
        )}

        <span
          className={cn(
            "shrink-0 rounded border px-1.5 py-px text-[10px] font-bold",
            meta.badge,
          )}
        >
          {dt.levels[level].label}
        </span>

        {actionButtons}
      </div>

      {expanded && hasChildren && (
        <div
          className={cn(
            "mt-0.5 ms-5 space-y-0.5 pb-0.5 ps-3",
            rowCfg.childLine,
          )}
        >
          {topic.children.map((child) => (
            <TopicNode
              key={child.id}
              topic={child}
              depth={depth + 1}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Topic sheet (create / edit) ───────────────────────────────────────────────

interface SheetState {
  open: boolean;
  editTopic: TopicTree | null;
  preLevel: Level | null;
  preParentId: string | null;
}

function TopicSheet({
  state,
  onClose,
  flatTopics,
}: {
  state: SheetState;
  onClose: () => void;
  flatTopics: TopicOut[];
}) {
  const { t } = useI18n();
  const dt = t.dashTopics;
  const { open, editTopic, preLevel, preParentId } = state;
  const isEditing = !!editTopic;

  const formSchema = useMemo(
    () =>
      buildFormSchema({
        nameRequired: dt.validation.nameRequired,
        slugRequired: dt.validation.slugRequired,
        slugFormat: dt.validation.slugFormat,
      }),
    [dt],
  );

  const create = useCreateTopic();
  const update = useUpdateTopic();
  const isPending = create.isPending || update.isPending;

  const [level, setLevel] = useState<Level>(preLevel ?? "exam");
  const [parentExamId, setParentExamId] = useState("");
  const [parentSubjectId, setParentSubjectId] = useState("");
  const [parentDomainId, setParentDomainId] = useState("");

  const exams = useMemo(
    () => flatTopics.filter((t) => t.level === 0),
    [flatTopics],
  );
  const subjectsForExam = useMemo(
    () =>
      flatTopics.filter((t) => t.level === 1 && t.parent_id === parentExamId),
    [flatTopics, parentExamId],
  );
  const domainsForSubject = useMemo(
    () =>
      flatTopics.filter(
        (t) => t.level === 2 && t.parent_id === parentSubjectId,
      ),
    [flatTopics, parentSubjectId],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      display_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (isEditing) {
      setLevel(numToLevel(editTopic.level));
      form.reset({
        name: editTopic.name,
        slug: editTopic.slug,
        description: editTopic.description ?? "",
        display_order: editTopic.display_order,
        is_active: editTopic.is_active,
      });
    } else {
      const initLevel = preLevel ?? "exam";
      setLevel(initLevel);
      form.reset({
        name: "",
        slug: "",
        description: "",
        display_order: 0,
        is_active: true,
      });
      if (initLevel === "subject" && preParentId) {
        setParentExamId(preParentId);
        setParentSubjectId("");
        setParentDomainId("");
      } else if (initLevel === "domain" && preParentId) {
        const subject = flatTopics.find((t) => t.id === preParentId);
        setParentExamId(subject?.parent_id ?? "");
        setParentSubjectId(preParentId);
        setParentDomainId("");
      } else if (initLevel === "subdomain" && preParentId) {
        const domain = flatTopics.find((t) => t.id === preParentId);
        const subject = flatTopics.find((t) => t.id === domain?.parent_id);
        setParentExamId(subject?.parent_id ?? "");
        setParentSubjectId(domain?.parent_id ?? "");
        setParentDomainId(preParentId);
      } else {
        setParentExamId("");
        setParentSubjectId("");
        setParentDomainId("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTopic?.id, preLevel, preParentId]);

  function handleLevelChange(l: Level) {
    setLevel(l);
    setParentExamId("");
    setParentSubjectId("");
    setParentDomainId("");
  }

  function getParentId(): string | null {
    if (level === "exam") return null;
    if (level === "subject") return parentExamId || null;
    if (level === "domain") return parentSubjectId || null;
    return parentDomainId || null;
  }

  function isSubmitDisabled() {
    if (isPending) return true;
    if (!isEditing) {
      if (level === "subject" && !parentExamId) return true;
      if (level === "domain" && (!parentExamId || !parentSubjectId))
        return true;
      if (
        level === "subdomain" &&
        (!parentExamId || !parentSubjectId || !parentDomainId)
      )
        return true;
    }
    return false;
  }

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing) {
        await update.mutateAsync({ id: editTopic.id, data: values });
        toast({ title: dt.sheet.toastUpdated });
      } else {
        await create.mutateAsync({ ...values, parent_id: getParentId() });
        toast({
          title: `${dt.levels[level].label} ${dt.sheet.toastCreatedSuffix}`,
        });
      }
      onClose();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? typeof err.detail === "string"
            ? err.detail
            : (err.detail as Record<string, unknown>)?.detail
              ? String((err.detail as Record<string, unknown>).detail)
              : err.message
          : dt.sheet.toastErrorGeneric;
      toast({
        title: dt.sheet.toastErrorTitle,
        description: msg,
        variant: "destructive",
      });
    }
  }

  const editLevel = isEditing ? numToLevel(editTopic.level) : level;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span
              className={cn("size-2 rounded-full", LEVEL_META[editLevel].dot)}
            />
            {isEditing ? dt.sheet.titleEdit : dt.sheet.titleNew}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? `${dt.sheet.descriptionEditPrefix} ${dt.levels[editLevel].label} · ${editTopic.slug}`
              : dt.sheet.descriptionCreate}
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          <div className="space-y-5">
            {/* Level selector (create only) */}
            {!isEditing && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {dt.sheet.hierarchyLevel}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {LEVELS.map((l) => {
                    const m = LEVEL_META[l];
                    const isActive = level === l;
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => handleLevelChange(l)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3.5 text-start transition-all duration-150",
                          isActive
                            ? cn(m.activeBorder, m.activeBg, m.activeRing)
                            : "border-border hover:border-muted-foreground/30 hover:bg-muted/40",
                        )}
                      >
                        <span
                          className={cn(
                            "size-2.5 shrink-0 rounded-full",
                            m.dot,
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold">
                            {dt.levels[l].label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {dt.levels[l].sublabel}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {dt.levels[level].hint && (
                  <p className="ps-0.5 text-[11px] text-muted-foreground/70">
                    {dt.sheet.hintPrefix} {dt.levels[level].hint}
                  </p>
                )}
              </div>
            )}

            {/* Edit: read-only level context */}
            {isEditing && (
              <div className="rounded-xl border bg-muted/30 px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      LEVEL_META[editLevel].dot,
                    )}
                  />
                  <span className="font-medium">
                    {dt.levels[editLevel].label}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">
                    {dt.levels[editLevel].sublabel}
                  </span>
                  {editTopic.parent_id && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        {dt.sheet.editContextUnder}{" "}
                        <span className="font-medium text-foreground">
                          {flatTopics.find(
                            (topic) => topic.id === editTopic.parent_id,
                          )?.name ?? "—"}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Parent selectors (create only) */}
            {!isEditing && level !== "exam" && (
              <div className="space-y-3">
                <div className="relative flex items-center gap-2">
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground/60">
                    {dt.sheet.placeInHierarchy}
                  </span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                <ParentSelect
                  label={dt.sheet.parentExamLabel}
                  options={exams}
                  value={parentExamId}
                  onChange={(v) => {
                    setParentExamId(v);
                    setParentSubjectId("");
                    setParentDomainId("");
                  }}
                  placeholder={dt.sheet.parentExamPlaceholder}
                  emptyMessage={dt.sheet.parentExamEmpty}
                />

                {(level === "domain" || level === "subdomain") && (
                  <ParentSelect
                    label={dt.sheet.parentSubjectLabel}
                    options={subjectsForExam}
                    value={parentSubjectId}
                    onChange={(v) => {
                      setParentSubjectId(v);
                      setParentDomainId("");
                    }}
                    disabled={!parentExamId}
                    placeholder={
                      !parentExamId
                        ? dt.sheet.parentSubjectPlaceholderDisabled
                        : dt.sheet.parentSubjectPlaceholder
                    }
                    emptyMessage={dt.sheet.parentSubjectEmpty}
                  />
                )}

                {level === "subdomain" && (
                  <ParentSelect
                    label={dt.sheet.parentDomainLabel}
                    options={domainsForSubject}
                    value={parentDomainId}
                    onChange={setParentDomainId}
                    disabled={!parentSubjectId}
                    placeholder={
                      !parentSubjectId
                        ? dt.sheet.parentDomainPlaceholderDisabled
                        : dt.sheet.parentDomainPlaceholder
                    }
                    emptyMessage={dt.sheet.parentDomainEmpty}
                  />
                )}
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center gap-2">
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/60">
                {isEditing ? dt.sheet.detailsEdit : dt.sheet.detailsCreate}
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            {/* Form fields */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                id="topic-form"
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {dt.sheet.nameLabel}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={dt.levels[level].hint}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!isEditing)
                              form.setValue("slug", toSlug(e.target.value), {
                                shouldValidate: true,
                              });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {dt.sheet.slugLabel}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={dt.sheet.slugPlaceholder}
                          className="font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {dt.sheet.slugDescription}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dt.sheet.descriptionLabel}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={dt.sheet.descriptionPlaceholder}
                          rows={3}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditing && (
                  <>
                    <FormField
                      control={form.control}
                      name="display_order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{dt.sheet.displayOrderLabel}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              value={field.value ?? 0}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            {dt.sheet.displayOrderDescription}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">
                                {dt.sheet.activeLabel}
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">
                                {dt.sheet.activeDescription}
                              </p>
                            </div>
                            <FormControl>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={field.value}
                                onClick={() => field.onChange(!field.value)}
                                className={cn(
                                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
                                  "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                  field.value
                                    ? "bg-primary"
                                    : "bg-muted-foreground/30",
                                )}
                              >
                                <span
                                  className={cn(
                                    "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm",
                                    "transition-transform duration-200",
                                    field.value
                                      ? "translate-x-4 rtl:-translate-x-4"
                                      : "translate-x-0",
                                  )}
                                />
                              </button>
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </form>
            </Form>
          </div>
        </SheetBody>

        <SheetFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            {t.common.actions.cancel}
          </Button>
          <Button
            type="submit"
            form="topic-form"
            size="sm"
            disabled={isSubmitDisabled()}
          >
            {isPending
              ? dt.sheet.saving
              : isEditing
                ? dt.sheet.saveChanges
                : `${dt.sheet.createPrefix} ${dt.levels[level].label}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TopicsPage() {
  const { t } = useI18n();
  const dt = t.dashTopics;
  const { data: tree, isPending, isError } = useTopicsTree();
  const flatTopics = useMemo(() => (tree ? flattenTree(tree) : []), [tree]);
  const stats = useMemo(() => (tree ? computeStats(tree) : null), [tree]);

  const [sheet, setSheet] = useState<SheetState>({
    open: false,
    editTopic: null,
    preLevel: null,
    preParentId: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<TopicTree | null>(null);
  const [query, setQuery] = useState("");

  function openCreate(
    preLevel: Level | null = null,
    preParentId: string | null = null,
  ) {
    setSheet({ open: true, editTopic: null, preLevel, preParentId });
  }
  function openEdit(topic: TopicTree) {
    setSheet({
      open: true,
      editTopic: topic,
      preLevel: null,
      preParentId: null,
    });
  }
  function closeSheet() {
    setSheet({
      open: false,
      editTopic: null,
      preLevel: null,
      preParentId: null,
    });
  }

  const statItems = stats
    ? [
        {
          label: dt.stats.totalTopics,
          value: stats.total,
          dotColor: "bg-muted-foreground",
          icon: <FolderTreeIcon className="size-4 text-muted-foreground/70" />,
          bg: "bg-muted/60",
        },
        {
          label: dt.stats.exams,
          value: stats.exams,
          dotColor: LEVEL_META.exam.dot,
          bg: LEVEL_META.exam.statBg,
          textColor: LEVEL_META.exam.statText,
        },
        {
          label: dt.stats.subjects,
          value: stats.subjects,
          dotColor: LEVEL_META.subject.dot,
          bg: LEVEL_META.subject.statBg,
          textColor: LEVEL_META.subject.statText,
        },
        {
          label: dt.stats.domains,
          value: stats.domains,
          dotColor: LEVEL_META.domain.dot,
          bg: LEVEL_META.domain.statBg,
          textColor: LEVEL_META.domain.statText,
        },
        {
          label: dt.stats.subdomains,
          value: stats.subdomains,
          dotColor: LEVEL_META.subdomain.dot,
          bg: LEVEL_META.subdomain.statBg,
          textColor: LEVEL_META.subdomain.statText,
        },
      ]
    : null;

  return (
    <div className="flex min-h-full flex-col">
      <Topbar title={dt.topbarTitle} />

      <div className="flex-1 space-y-6 p-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {dt.header.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dt.header.subtitlePrefix}{" "}
              <span className="text-orange-500 font-medium">
                {dt.levels.exam.label}
              </span>
              {" → "}
              <span className="text-blue-500 font-medium">
                {dt.levels.subject.label}
              </span>
              {" → "}
              <span className="text-violet-500 font-medium">
                {dt.levels.domain.label}
              </span>
              {" → "}
              <span className="text-emerald-500 font-medium">
                {dt.levels.subdomain.label}
              </span>
            </p>
          </div>
          <Button size="sm" onClick={() => openCreate()} className="shrink-0">
            <PlusIcon className="size-4" />
            {dt.header.newTopic}
          </Button>
        </div>

        {/* ── Stats ── */}
        {isPending ? (
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card px-4 py-3">
                <Skeleton className="mb-2 h-6 w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : (
          statItems && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {statItems.map((s) => (
                <div
                  key={s.label}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 shadow-xs",
                    s.bg,
                  )}
                >
                  {s.icon ? (
                    s.icon
                  ) : (
                    <span
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        s.dotColor,
                      )}
                    />
                  )}
                  <div>
                    <p
                      className={cn(
                        "text-xl font-bold leading-none tabular-nums",
                        s.textColor ?? "text-foreground",
                      )}
                    >
                      {s.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Tree card ── */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* Search header */}
          <div className="flex items-center gap-3 border-b border-border/70 bg-muted/20 px-4 py-3">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground/50" />
            <input
              type="text"
              placeholder={dt.search.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label={dt.search.clear}
                className="flex size-5 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>

          {/* Tree content */}
          <div className="p-3">
            {isPending && (
              <div className="space-y-2 p-1">
                {[80, 60, 72, 50, 65, 55].map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-s-4 border-muted-foreground/10 px-4 py-3.5"
                  >
                    <Skeleton className="size-8 rounded-lg shrink-0" />
                    <Skeleton
                      className="h-4 rounded"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                ))}
              </div>
            )}

            {isError && (
              <div className="p-4">
                <Alert variant="destructive">
                  <AlertDescription>{dt.error.loadFailed}</AlertDescription>
                </Alert>
              </div>
            )}

            {!isPending && !isError && tree && tree.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl border-2 border-dashed border-border">
                  <FolderOpenIcon className="size-6 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{dt.empty.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {dt.empty.description}
                  </p>
                </div>
                <Button size="sm" onClick={() => openCreate("exam")}>
                  <PlusIcon className="size-4" />
                  {dt.empty.createFirstExam}
                </Button>
              </div>
            )}

            {!isPending && !isError && tree && tree.length > 0 && (
              <div>
                {tree.map((topic) => (
                  <TopicNode
                    key={topic.id}
                    topic={topic}
                    depth={0}
                    onAdd={(parentId, level) => openCreate(level, parentId)}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                    query={query}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TopicSheet state={sheet} onClose={closeSheet} flatTopics={flatTopics} />
      <DeleteDialog
        topic={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
