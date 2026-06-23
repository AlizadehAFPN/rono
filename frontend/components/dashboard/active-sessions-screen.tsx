"use client";

import { useMemo } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LaptopIcon, LogOutIcon, SmartphoneIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import {
  useRevokeOtherSessions,
  useRevokeSession,
  useSessions,
} from "@/lib/hooks/use-auth";
import type { SessionOut } from "@/lib/types/auth";
import { toast } from "@/lib/hooks/use-toast";
import { ApiError } from "@/lib/api/client";

function deviceFromUserAgent(ua: string | null, fallback: string): string {
  if (!ua) return fallback;
  const browser =
    /Edg/.test(ua) ? "Edge"
    : /Chrome/.test(ua) ? "Chrome"
    : /Firefox/.test(ua) ? "Firefox"
    : /Safari/.test(ua) ? "Safari"
    : null;
  const os =
    /Windows/.test(ua) ? "Windows"
    : /Mac OS/.test(ua) ? "macOS"
    : /Android/.test(ua) ? "Android"
    : /iPhone|iPad|iOS/.test(ua) ? "iOS"
    : /Linux/.test(ua) ? "Linux"
    : null;
  const parts = [browser, os].filter(Boolean);
  return parts.length ? parts.join(" · ") : fallback;
}

function isMobile(ua: string | null): boolean {
  return !!ua && /Android|iPhone|iPad|Mobile/.test(ua);
}

/**
 * Active device sessions, rendered as an internal sub-view stacked within
 * Settings. `onBack` pops back to the parent screen.
 */
export function ActiveSessionsScreen({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const d = t.dashSettings.sessions;
  const { data: sessions, isLoading } = useSessions();
  const revoke = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();

  const hasOthers = (sessions ?? []).some((s) => !s.is_current);

  async function onRevoke(s: SessionOut) {
    try {
      await revoke.mutateAsync(s.id);
      toast({ title: d.revoked });
    } catch (err) {
      toast({
        title: d.failed,
        description: err instanceof ApiError ? String(err.detail) : undefined,
        variant: "destructive",
      });
    }
  }

  async function onRevokeOthers() {
    try {
      await revokeOthers.mutateAsync();
      toast({ title: d.revokedOthers });
    } catch (err) {
      toast({
        title: d.failed,
        description: err instanceof ApiError ? String(err.detail) : undefined,
        variant: "destructive",
      });
    }
  }

  // Current session first, then newest.
  const ordered = useMemo(
    () => [...(sessions ?? [])].sort((a, b) => Number(b.is_current) - Number(a.is_current)),
    [sessions],
  );

  return (
    <div className="flex flex-col">
      <Topbar title={t.dashSessions.active.pageTitle} onBack={onBack} />
      <div className="mx-auto w-full max-w-2xl space-y-4 p-6">
        <p className="text-sm text-muted-foreground">{d.description}</p>

        <Card>
          <CardContent className="space-y-2 pt-6">
            {isLoading && <p className="text-sm text-muted-foreground">{d.loading}</p>}

            {ordered.map((sess) => {
              const Icon = isMobile(sess.user_agent) ? SmartphoneIcon : LaptopIcon;
              return (
                <div
                  key={sess.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {deviceFromUserAgent(sess.user_agent, d.unknownDevice)}
                        </span>
                        {sess.is_current && (
                          <Badge variant="success" className="shrink-0">
                            {d.current}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sess.ip_address && <span>{sess.ip_address} · </span>}
                        {d.signedIn} {new Date(sess.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {!sess.is_current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => onRevoke(sess)}
                      disabled={revoke.isPending}
                    >
                      <LogOutIcon className="size-3.5" />
                      {d.revoke}
                    </Button>
                  )}
                </div>
              );
            })}

            {!isLoading && !hasOthers && (
              <p className="text-xs text-muted-foreground">{d.empty}</p>
            )}

            {hasOthers && (
              <Button
                variant="outline"
                size="sm"
                className="mt-1 text-destructive hover:text-destructive"
                onClick={onRevokeOthers}
                disabled={revokeOthers.isPending}
              >
                {d.revokeOthers}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
