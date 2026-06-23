"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheckIcon,
  BuildingIcon,
  CalendarIcon,
  CameraIcon,
  ClockIcon,
  HistoryIcon,
  InfoIcon,
  ListChecksIcon,
  Loader2Icon,
  ShieldIcon,
  TargetIcon,
  TriangleAlertIcon,
  Trash2Icon,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionEntryCard } from "@/components/dashboard/session-entry-card";
import { RecentSessionsScreen } from "@/components/dashboard/recent-sessions-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { useAuthStore } from "@/lib/stores/auth";
import {
  useDeleteAvatar,
  useUpdateProfile,
  useUploadAvatar,
} from "@/lib/hooks/use-auth";
import { useProgress } from "@/lib/hooks/use-progress";
import { useStudyOverview } from "@/lib/hooks/use-study";
import { useInstitution } from "@/lib/hooks/use-users";
import { toast } from "@/lib/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import type { Role } from "@/lib/types/auth";

// Mastery scale matches the Study page: amber → blue → teal → green.
const MASTERY_TONE: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  needs_review: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  developing: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  proficient: "bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300",
  mastered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
};

const MASTERY_BAR: Record<string, string> = {
  not_started: "bg-muted-foreground/30",
  needs_review: "bg-amber-500",
  developing: "bg-blue-500",
  proficient: "bg-teal-500",
  mastered: "bg-emerald-500",
};

const MASTERY_ORDER = [
  "needs_review",
  "developing",
  "proficient",
  "mastered",
] as const;

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Plain-language reading of an IRT θ on the N(0,1) scale. */
function interpretTheta(theta: number | null): "building" | "developing" | "solid" | "advanced" {
  if (theta == null || theta < -1) return "building";
  if (theta < -0.25) return "developing";
  if (theta < 1) return "solid";
  return "advanced";
}

/** How settled the estimate is, from its standard error. */
function confidenceFromSe(se: number | null): "building" | "medium" | "high" {
  if (se == null || se > 0.5) return "building";
  if (se > 0.3) return "medium";
  return "high";
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Help({ text }: { text: string }) {
  return (
    <span className="inline-flex cursor-help align-text-bottom" title={text} aria-label={text}>
      <InfoIcon className="size-3.5 shrink-0 text-muted-foreground/50" />
    </span>
  );
}

export default function ProfilePage() {
  const { t } = useI18n();
  const p = t.dashProfile;

  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const roleLabel = role ? t.common.roles[role as Role] ?? role : null;

  const { data: institution } = useInstitution();
  const { data: progress } = useProgress();
  const { data: study } = useStudyOverview();
  const [showSessions, setShowSessions] = useState(false);

  const reviewsDue = useMemo(
    () => study?.categories.reduce((sum, c) => sum + c.due_count, 0) ?? null,
    [study],
  );
  const newAvailable = useMemo(
    () => study?.categories.reduce((sum, c) => sum + c.new_count, 0) ?? null,
    [study],
  );

  const hasActivity = !!progress && progress.total_responses > 0;
  const displayName = user?.preferred_name ?? user?.full_name ?? user?.email ?? "";

  // Recent sessions open as an internal sub-view stacked on this screen.
  if (showSessions) {
    return <RecentSessionsScreen onBack={() => setShowSessions(false)} />;
  }

  return (
    <div className="flex flex-col">
      <Topbar title={p.pageTitle} />
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
        {/* ── Identity header ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <AvatarEditor />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-semibold tracking-tight">
                  {displayName}
                </h2>
                <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {roleLabel && (
                    <Badge variant="secondary" className="gap-1">
                      <ShieldIcon className="size-3" />
                      {roleLabel}
                    </Badge>
                  )}
                  {user?.email_verified_at ? (
                    <Badge variant="secondary" className="gap-1 text-[var(--study-success)]">
                      <BadgeCheckIcon className="size-3" />
                      {p.identity.emailVerified}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {p.identity.emailUnverified}
                    </Badge>
                  )}
                  {user && !user.is_active && (
                    <Badge variant="destructive">{p.identity.accountInactive}</Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Fact icon={BuildingIcon} label={p.identity.institution} value={institution?.name ?? "—"} />
              <Fact icon={ShieldIcon} label={p.identity.role} value={roleLabel ?? "—"} />
              <Fact
                icon={CalendarIcon}
                label={p.identity.memberSince}
                value={formatDate(user?.created_at ?? null) ?? "—"}
              />
              <Fact
                icon={ClockIcon}
                label={p.identity.lastLogin}
                value={formatDate(user?.last_login_at ?? null) ?? p.identity.never}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Personal details (editable) ── */}
        <PersonalDetails />

        {/* ── Daily target (editable) ── */}
        <DailyTargetSettings />

        {/* ── Learning state ── */}
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{p.state.title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{p.state.description}</p>
        </div>

        {!hasActivity && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {p.state.empty}
            </CardContent>
          </Card>
        )}

        {hasActivity && progress && (
          <>
            {/* Ability hero */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      {p.state.ability.label} <Help text={p.state.ability.help} />
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-4xl font-bold tabular-nums">
                        {progress.global_theta != null ? progress.global_theta.toFixed(2) : "—"}
                      </span>
                      {progress.global_theta_se != null && (
                        <span className="text-xs text-muted-foreground">
                          ± {progress.global_theta_se.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    {(() => {
                      const key = interpretTheta(progress.global_theta);
                      const conf = confidenceFromSe(progress.global_theta_se);
                      return (
                        <>
                          <div className="text-base font-semibold">
                            {p.state.ability.interpret[key]}
                          </div>
                          <p className="mt-0.5 max-w-xs text-xs text-muted-foreground sm:ml-auto">
                            {p.state.ability.interpretHint[key]}
                          </p>
                          <div className="mt-2 sm:flex sm:justify-end">
                            <Badge variant="outline" className="text-muted-foreground">
                              {p.state.ability.confidenceLabel}: {p.state.ability.confidence[conf]}
                            </Badge>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label={p.state.stats.answered} value={String(progress.total_responses)} />
              <Stat label={p.state.stats.correct} value={String(progress.total_correct)} />
              <Stat
                label={p.state.stats.accuracy}
                value={progress.accuracy != null ? `${Math.round(progress.accuracy * 100)}%` : "—"}
              />
              <Stat
                label={p.state.stats.reviewDue}
                value={reviewsDue != null ? String(reviewsDue) : "—"}
                help={p.state.stats.reviewDueHelp}
              />
            </div>

            {/* Mastery distribution */}
            <MasteryDistribution topics={progress.topics} />

            {/* Mastery by topic */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{p.state.mastery.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{p.state.mastery.description}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {progress.topics.length === 0 && (
                  <p className="text-sm text-muted-foreground">{p.state.mastery.empty}</p>
                )}
                {progress.topics.map((tp) => (
                  <div
                    key={tp.topic_id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{tp.topic_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {tp.correct_responses}/{tp.total_responses} {p.state.mastery.questions}
                        {tp.accuracy_rate != null && ` · ${Math.round(tp.accuracy_rate * 100)}%`}
                        {tp.theta != null && ` · θ ${tp.theta.toFixed(2)}`}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        MASTERY_TONE[tp.mastery_level] ?? MASTERY_TONE.not_started,
                      )}
                    >
                      {t.dashProgress.mastery[
                        tp.mastery_level as keyof typeof t.dashProgress.mastery
                      ] ?? tp.mastery_level}
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

const AVATAR_ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/** Avatar with inline upload/replace/remove — the self-service profile photo. */
function AvatarEditor() {
  const { t } = useI18n();
  const a = t.dashProfile.avatar;
  const errorTitle = t.dashProfile.edit.error;
  const user = useAuthStore((s) => s.user);
  const upload = useUploadAvatar();
  const remove = useDeleteAvatar();
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = upload.isPending || remove.isPending;
  const hasAvatar = !!user?.avatar_url;

  function pick() {
    if (!busy) inputRef.current?.click();
  }

  async function onFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    // Reset the input so picking the same file again still fires onChange.
    ev.target.value = "";
    if (!file) return;

    if (!AVATAR_ACCEPT.includes(file.type)) {
      toast({ title: errorTitle, description: a.badType, variant: "destructive" });
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast({ title: errorTitle, description: a.tooLarge, variant: "destructive" });
      return;
    }

    try {
      await upload.mutateAsync(file);
      toast({ title: a.uploaded });
    } catch (err) {
      toast({
        title: a.uploadFailed,
        description: err instanceof ApiError ? String(err.detail) : undefined,
        variant: "destructive",
      });
    }
  }

  async function onRemove() {
    try {
      await remove.mutateAsync();
      toast({ title: a.removed });
    } catch (err) {
      toast({
        title: a.removeFailed,
        description: err instanceof ApiError ? String(err.detail) : undefined,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          aria-label={hasAvatar ? a.change : a.upload}
          className="group relative block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="size-20">
            <AvatarImage src={user?.avatar_url ?? undefined} alt={a.alt} />
            <AvatarFallback className="text-xl font-semibold">
              {getInitials(user?.full_name ?? null)}
            </AvatarFallback>
          </Avatar>
          {/* Hover/upload overlay */}
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white transition-opacity",
              busy ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          >
            {upload.isPending ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : (
              <CameraIcon className="size-5" />
            )}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_ACCEPT.join(",")}
          className="hidden"
          onChange={onFile}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={pick} disabled={busy}>
            {upload.isPending ? a.uploading : hasAvatar ? a.change : a.upload}
          </Button>
          {hasAvatar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={busy}
              aria-label={a.remove}
              className="text-muted-foreground hover:text-destructive"
            >
              {remove.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <Trash2Icon className="size-4" />
              )}
            </Button>
          )}
        </div>
        <span className="text-center text-[11px] text-muted-foreground">{a.hint}</span>
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-0.5 truncate font-medium">{value}</p>
    </div>
  );
}

function Stat({ label, value, help }: { label: string; value: string; help?: string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        {label}
        {help && <Help text={help} />}
      </div>
    </div>
  );
}

function MasteryDistribution({
  topics,
}: {
  topics: { mastery_level: string }[];
}) {
  const { t } = useI18n();
  const p = t.dashProfile;

  const counts = MASTERY_ORDER.map((level) => ({
    level,
    count: topics.filter((tp) => tp.mastery_level === level).length,
  }));
  const total = counts.reduce((s, c) => s + c.count, 0);
  if (total === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          {p.state.mastery.distributionTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
          {counts.map(
            ({ level, count }) =>
              count > 0 && (
                <div
                  key={level}
                  className={cn("h-full", MASTERY_BAR[level])}
                  style={{ width: `${(count / total) * 100}%` }}
                />
              ),
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {counts
            .filter((c) => c.count > 0)
            .map(({ level, count }) => (
              <div key={level} className="flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", MASTERY_BAR[level])} />
                <span className="text-muted-foreground">
                  {t.dashProgress.mastery[level as keyof typeof t.dashProgress.mastery] ?? level}
                </span>
                <span className="font-medium tabular-nums">{count}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PersonalDetails() {
  const { t } = useI18n();
  const e = t.dashProfile.edit;
  const user = useAuthStore((s) => s.user);
  const update = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [preferredName, setPreferredName] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? "");
      setPreferredName(user.preferred_name ?? "");
    }
  }, [user]);

  const dirty =
    !!user &&
    (fullName !== (user.full_name ?? "") ||
      preferredName !== (user.preferred_name ?? ""));

  async function onSave() {
    try {
      await update.mutateAsync({
        full_name: fullName.trim() || undefined,
        preferred_name: preferredName.trim() ? preferredName.trim() : null,
      });
      toast({ title: e.saved });
    } catch (err) {
      toast({
        title: e.error,
        description: err instanceof ApiError ? String(err.detail) : e.saveFailed,
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">{e.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{e.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{e.fullName}</span>
          <Input value={fullName} onChange={(ev) => setFullName(ev.target.value)} placeholder={e.fullNamePh} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{e.preferredName}</span>
          <Input
            value={preferredName}
            onChange={(ev) => setPreferredName(ev.target.value)}
            placeholder={e.preferredNamePh}
          />
          <span className="text-xs text-muted-foreground">{e.preferredNameHint}</span>
        </label>
        <Button onClick={onSave} disabled={!dirty || update.isPending}>
          {update.isPending ? e.saving : e.save}
        </Button>
      </CardContent>
    </Card>
  );
}

const DAILY_COUNT_OPTIONS = [10, 20, 30, 50, 100, 200, 500];
const DAILY_TIME_OPTIONS = [10, 20, 30, 45, 60, 90, 180];
const NEW_CAP_OPTIONS = [10, 20, 50, 100];

/** Persistent Daily Review target — count/time budget + new-card cap. Writes the
 *  same user fields the Daily setup form does, so the two stay in sync. */
function DailyTargetSettings() {
  const { t } = useI18n();
  const d = t.dashProfile.daily;
  const user = useAuthStore((s) => s.user);
  const update = useUpdateProfile();

  const [limitType, setLimitType] = useState<"count" | "time">("count");
  const [count, setCount] = useState(20);
  const [time, setTime] = useState(20);
  const [cap, setCap] = useState(20);

  useEffect(() => {
    if (!user) return;
    setLimitType(user.daily_limit_type);
    setCount(user.daily_target_count);
    setTime(user.daily_time_limit_minutes);
    setCap(user.daily_new_cards_cap);
  }, [user]);

  const dirty =
    !!user &&
    (limitType !== user.daily_limit_type ||
      count !== user.daily_target_count ||
      time !== user.daily_time_limit_minutes ||
      cap !== user.daily_new_cards_cap);

  async function onSave() {
    try {
      await update.mutateAsync({
        daily_limit_type: limitType,
        daily_target_count: count,
        daily_time_limit_minutes: time,
        daily_new_cards_cap: cap,
      });
      toast({ title: d.saved });
    } catch (err) {
      toast({
        title: t.dashProfile.edit.error,
        description: err instanceof ApiError ? String(err.detail) : d.saveFailed,
        variant: "destructive",
      });
    }
  }

  const lengthOptions = limitType === "count" ? DAILY_COUNT_OPTIONS : DAILY_TIME_OPTIONS;
  const lengthValue = limitType === "count" ? count : time;
  const setLength = limitType === "count" ? setCount : setTime;
  const lengthLabel = (n: number) =>
    limitType === "count" ? d.questionsOpt(n) : d.minutesOpt(n);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <TargetIcon className="size-4 text-muted-foreground" />
          {d.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{d.description}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Budget kind */}
        <div className="space-y-2">
          <span className="text-sm font-medium">{d.limit}</span>
          <div className="inline-flex rounded-xl border bg-muted/40 p-1">
            <DailySeg
              active={limitType === "count"}
              onClick={() => setLimitType("count")}
              icon={<ListChecksIcon className="size-4" />}
              label={d.byCount}
            />
            <DailySeg
              active={limitType === "time"}
              onClick={() => setLimitType("time")}
              icon={<ClockIcon className="size-4" />}
              label={d.byTime}
            />
          </div>
        </div>

        {/* Length value */}
        <div className="space-y-2">
          <span className="text-sm font-medium">
            {limitType === "count" ? d.target : d.limit}
          </span>
          <div className="flex flex-wrap gap-2">
            {lengthOptions.map((n) => (
              <DailyPill
                key={n}
                active={lengthValue === n}
                onClick={() => setLength(n)}
                label={lengthLabel(n)}
              />
            ))}
          </div>
        </div>

        {/* New-card cap */}
        <div className="space-y-2">
          <span className="text-sm font-medium">{d.newCap}</span>
          <p className="text-xs text-muted-foreground">{d.newCapHint}</p>
          <div className="flex flex-wrap gap-2">
            {NEW_CAP_OPTIONS.map((n) => (
              <DailyPill
                key={n}
                active={cap === n}
                onClick={() => setCap(n)}
                label={String(n)}
              />
            ))}
          </div>
          {cap > 20 && (
            <p className="flex items-start gap-1.5 text-xs text-[var(--study-warning)]">
              <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
              {d.newCapWarning}
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">{d.collectionsNote}</p>

        <Button onClick={onSave} disabled={!dirty || update.isPending}>
          {update.isPending ? d.saving : d.save}
        </Button>
      </CardContent>
    </Card>
  );
}

function DailySeg({
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
      type="button"
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

function DailyPill({
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
      type="button"
      onClick={onClick}
      className={cn(
        "min-w-[3.25rem] rounded-xl border-[1.5px] px-3.5 py-2 text-center text-sm font-bold tabular-nums transition-colors",
        active
          ? "border-primary bg-primary/[0.06] text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40",
      )}
    >
      {label}
    </button>
  );
}
