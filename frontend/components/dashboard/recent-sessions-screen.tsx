"use client";

import { Topbar } from "@/components/dashboard/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { useProgress } from "@/lib/hooks/use-progress";
import { useI18n } from "@/lib/i18n/context";

/**
 * Recent learning sessions, rendered as an internal sub-view stacked within
 * Progress or Profile. `onBack` pops back to the parent screen.
 */
export function RecentSessionsScreen({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const r = t.dashSessions.recent;
  const { data, isLoading } = useProgress();

  const sessions = data?.recent_sessions ?? [];
  const sessionTypeLabel = (k: string) =>
    t.dashProgress.sessionType[k as keyof typeof t.dashProgress.sessionType] ?? k;

  return (
    <div className="flex flex-col">
      <Topbar title={r.pageTitle} onBack={onBack} />
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6">
        <p className="text-sm text-muted-foreground">{r.subtitle}</p>

        {isLoading && (
          <p className="text-sm text-muted-foreground">{t.dashProgress.loading}</p>
        )}

        {!isLoading && sessions.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {r.empty}
            </CardContent>
          </Card>
        )}

        {sessions.length > 0 && (
          <Card>
            <CardContent className="space-y-2 pt-6">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{sessionTypeLabel(s.session_type)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.started_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div>
                      {s.items_correct}/{s.items_delivered}
                      {s.score_percent != null && ` · ${s.score_percent}%`}
                    </div>
                    {s.net_score != null && (
                      <div className="text-muted-foreground">
                        {r.net}: {s.net_score}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
