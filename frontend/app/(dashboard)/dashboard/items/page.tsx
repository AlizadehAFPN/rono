"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useItems, useDeleteItem } from "@/lib/hooks/use-items";
import type { ItemsFilter } from "@/lib/api/items";
import { EXAM_TYPE_LABELS, EXAM_TYPES } from "@/lib/types/items";
import type { ItemOut } from "@/lib/types/items";
import { BookOpenIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/lib/hooks/use-toast";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_VARIANT: Record<string, "success" | "outline" | "secondary"> = {
  active: "success",
  draft: "secondary",
  retired: "outline",
};

const CALIBRATION_DOT: Record<string, string> = {
  calibrated: "bg-emerald-500",
  pre_set: "bg-blue-500",
  calibrating: "bg-amber-400",
  uncalibrated: "bg-slate-400",
};

type DifficultyKey =
  | "veryEasy"
  | "easy"
  | "average"
  | "hard"
  | "veryHard"
  | null;

function difficultyKey(irtB: number | null): DifficultyKey {
  if (irtB == null) return null;
  if (irtB <= -1.5) return "veryEasy";
  if (irtB <= -0.5) return "easy";
  if (irtB <= 0.5) return "average";
  if (irtB <= 1.5) return "hard";
  return "veryHard";
}

const DIFFICULTY_COLOR: Record<string, string> = {
  veryEasy:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  easy: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  average: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  hard: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  veryHard: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

// ---------------------------------------------------------------------------
// Delete dialog
// ---------------------------------------------------------------------------

function DeleteDialog({
  item,
  onClose,
}: {
  item: ItemOut | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const deleteItem = useDeleteItem();

  async function handleDelete() {
    if (!item) return;
    try {
      await deleteItem.mutateAsync(item.id);
      toast({ title: t.dashItems.toast.deleted });
      onClose();
    } catch {
      toast({
        title: t.dashItems.toast.deleteFailedTitle,
        description: t.dashItems.toast.deleteFailedDescription,
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.dashItems.deleteDialog.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t.dashItems.deleteDialog.description}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.dashItems.deleteDialog.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteItem.isPending}
          >
            {deleteItem.isPending
              ? t.dashItems.deleteDialog.deleting
              : t.dashItems.deleteDialog.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Tab filter
// ---------------------------------------------------------------------------

type StatusTab = "all" | "active" | "draft" | "retired";

const TAB_KEYS: StatusTab[] = ["all", "active", "draft", "retired"];

function StatusTabs({
  active,
  counts,
  onChange,
}: {
  active: StatusTab;
  counts: Record<StatusTab, number | undefined>;
  onChange: (tab: StatusTab) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-muted/60 p-1">
      {TAB_KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            active === key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.dashItems.tabs[key]}
          {counts[key] != null && (
            <span
              className={cn(
                "rounded-full px-1.5 py-px text-[10px] tabular-nums leading-none",
                active === key
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground/70",
              )}
            >
              {counts[key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------

function QuestionRow({
  item,
  onDelete,
}: {
  item: ItemOut;
  onDelete: (item: ItemOut) => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const version = item.current_version;
  const stem = version?.content ?? t.dashItems.empty_em_dash;
  const options = version?.options ?? [];
  const correctOption = options.find((o) => o.is_correct);
  const optionCount = options.length;

  const examLabel = item.exam_type
    ? EXAM_TYPE_LABELS[item.exam_type]
    : t.dashItems.empty_em_dash;
  const calDot = CALIBRATION_DOT[item.calibration_status] ?? "bg-slate-400";
  const diffK = difficultyKey(item.irt_b);
  const diffLabel = diffK ? t.dashItems.difficulty[diffK] : null;
  const diffColor = diffK ? DIFFICULTY_COLOR[diffK] : undefined;

  const dateAdded = new Date(item.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <tr
      className="group border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
      onClick={() => router.push(`/dashboard/items/${item.id}`)}
    >
      {/* Question stem */}
      <td className="py-3 ps-5 pe-4 align-top">
        <div className="flex items-start gap-2.5">
          <span
            className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", calDot)}
            title={item.calibration_status}
          />
          <div className="min-w-0">
            <p className="text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {stem}
            </p>
            {diffLabel != null && (
              <span
                className={cn(
                  "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium leading-none",
                  diffColor,
                )}
              >
                {diffLabel}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Correct answer */}
      <td className="py-3 px-4 align-top w-56">
        {correctOption ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 line-clamp-2 leading-snug">
            {correctOption.content}
          </p>
        ) : (
          <span className="text-sm text-muted-foreground/50">
            {t.dashItems.empty_em_dash}
          </span>
        )}
      </td>

      {/* Options count */}
      <td className="py-3 px-4 align-top w-20 text-center">
        <span className="text-sm tabular-nums text-muted-foreground">
          {optionCount > 0 ? optionCount : t.dashItems.empty_em_dash}
        </span>
      </td>

      {/* Exam type */}
      <td className="py-3 px-4 align-top w-32">
        <span className="text-xs text-muted-foreground">{examLabel}</span>
      </td>

      {/* Date added */}
      <td className="py-3 px-4 align-top w-32">
        <span className="text-xs tabular-nums text-muted-foreground">
          {dateAdded}
        </span>
      </td>

      {/* Status */}
      <td className="py-3 px-4 align-top w-20">
        <Badge
          variant={STATUS_VARIANT[item.status] ?? "secondary"}
          className="text-[10px]"
        >
          {t.dashItems.status[item.status as keyof typeof t.dashItems.status] ??
            item.status}
        </Badge>
      </td>

      {/* Actions */}
      <td
        className="py-3 ps-2 pe-5 align-top w-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <button
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={t.dashItems.rowActions.edit}
            onClick={() => router.push(`/dashboard/items/${item.id}`)}
          >
            <PencilIcon className="size-3.5" />
          </button>
          <button
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title={t.dashItems.rowActions.delete}
            onClick={() => onDelete(item)}
          >
            <Trash2Icon className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ItemsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [examTypeFilter, setExamTypeFilter] = useState<string | undefined>(
    undefined,
  );
  const [offset, setOffset] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<ItemOut | null>(null);

  const apiFilter = useMemo<ItemsFilter>(
    () => ({
      status: activeTab === "all" ? undefined : activeTab,
      exam_type: examTypeFilter,
      limit: PAGE_SIZE,
      offset,
    }),
    [activeTab, examTypeFilter, offset],
  );

  const { data, isPending, isError } = useItems(apiFilter);

  const allCount = useItems({ limit: 1 });
  const activeCount = useItems({ status: "active", limit: 1 });
  const draftCount = useItems({ status: "draft", limit: 1 });
  const retiredCount = useItems({ status: "retired", limit: 1 });

  const tabCounts: Record<StatusTab, number | undefined> = {
    all: allCount.data?.total,
    active: activeCount.data?.total,
    draft: draftCount.data?.total,
    retired: retiredCount.data?.total,
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  function handleTabChange(tab: StatusTab) {
    setActiveTab(tab);
    setOffset(0);
  }

  function handleExamTypeChange(v: string) {
    setExamTypeFilter(v === "__all__" ? undefined : v);
    setOffset(0);
  }

  return (
    <div className="flex flex-col">
      <Topbar title={t.dashItems.topbarTitle} />
      <div className="flex-1 space-y-5 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {t.dashItems.header.title}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {data != null
                ? `${data.total} ${
                    data.total !== 1
                      ? t.dashItems.header.countSuffixMany
                      : t.dashItems.header.countSuffixOne
                  }`
                : t.common.states.loading}
            </p>
          </div>
          <Button size="sm" asChild className="shrink-0">
            <Link href="/dashboard/items/new">
              <PlusIcon className="size-4" />
              {t.dashItems.header.newQuestion}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusTabs
            active={activeTab}
            counts={tabCounts}
            onChange={handleTabChange}
          />
          <Select
            value={examTypeFilter ?? "__all__"}
            onValueChange={handleExamTypeChange}
          >
            <SelectTrigger className="h-9 w-44 text-sm">
              <SelectValue placeholder={t.dashItems.filters.allExamTypes} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">
                {t.dashItems.filters.allExamTypes}
              </SelectItem>
              {EXAM_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {EXAM_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {isError && (
            <Alert variant="destructive" className="m-4">
              <AlertDescription>
                {t.dashItems.error.loadFailed}
              </AlertDescription>
            </Alert>
          )}

          <table className="w-full text-start">
            {/* Column headers */}
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="py-2.5 ps-5 pe-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.dashItems.columns.question}
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-56">
                  {t.dashItems.columns.correctAnswer}
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-20 text-center">
                  {t.dashItems.columns.options}
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-32">
                  {t.dashItems.columns.examType}
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-32">
                  {t.dashItems.columns.dateAdded}
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-20">
                  {t.dashItems.columns.status}
                </th>
                <th className="py-2.5 ps-2 pe-5 w-20" />
              </tr>
            </thead>

            <tbody>
              {isPending &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-3 ps-5 pe-4">
                      <div className="flex items-start gap-2.5">
                        <Skeleton className="mt-1.5 size-1.5 shrink-0 rounded-full" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3.5 w-4/5" />
                          <Skeleton className="h-3.5 w-3/5" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 w-56">
                      <Skeleton className="h-3.5 w-4/5" />
                    </td>
                    <td className="py-3 px-4 w-20 text-center">
                      <Skeleton className="h-3.5 w-6 mx-auto" />
                    </td>
                    <td className="py-3 px-4 w-32">
                      <Skeleton className="h-3.5 w-20" />
                    </td>
                    <td className="py-3 px-4 w-32">
                      <Skeleton className="h-3.5 w-24" />
                    </td>
                    <td className="py-3 px-4 w-20">
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </td>
                    <td className="py-3 ps-2 pe-5 w-20" />
                  </tr>
                ))}

              {!isPending && !isError && data && data.items.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center gap-4 py-20 text-center">
                      <div className="flex size-14 items-center justify-center rounded-2xl border-2 border-dashed border-border">
                        <BookOpenIcon className="size-6 text-muted-foreground/40" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {activeTab === "all"
                            ? t.dashItems.empty.titleAll
                            : `${t.dashItems.empty.titleFilteredPrefix} ${t.dashItems.status[activeTab]} ${t.dashItems.empty.titleFilteredSuffix}`.trim()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activeTab === "all"
                            ? t.dashItems.empty.descriptionAll
                            : `${t.dashItems.empty.descriptionFilteredPrefix} "${t.dashItems.status[activeTab]}" ${t.dashItems.empty.descriptionFilteredSuffix}`}
                        </p>
                      </div>
                      {activeTab === "all" && (
                        <Button size="sm" asChild>
                          <Link href="/dashboard/items/new">
                            <PlusIcon className="size-4" />
                            {t.dashItems.empty.newQuestion}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!isPending &&
                data &&
                data.items.map((item) => (
                  <QuestionRow
                    key={item.id}
                    item={item}
                    onDelete={setDeleteTarget}
                  />
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {`${t.dashItems.pagination.pagePrefix} ${currentPage} ${t.dashItems.pagination.pageOf} ${totalPages} · ${data.total} ${t.dashItems.pagination.pageTotalSuffix}`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setOffset((currentPage - 2) * PAGE_SIZE)}
              >
                {t.dashItems.pagination.previous}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setOffset(currentPage * PAGE_SIZE)}
              >
                {t.dashItems.pagination.next}
              </Button>
            </div>
          </div>
        )}
      </div>

      <DeleteDialog item={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
}
