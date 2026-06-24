"use client";

import { useState } from "react";
import { DownloadIcon, XIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { usePwaInstall } from "@/lib/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

// Android / desktop Chromium install banner.
//
// Chrome fires `beforeinstallprompt` when the app meets PWA install criteria
// (valid manifest, registered service worker with a fetch handler, served over
// HTTPS/localhost). <PwaInstallRegister> captures that event into the shared
// store; here we surface a transient banner with an "Install" button that calls
// `install()` to open the native OS install dialog. iOS never fires the event,
// so this stays hidden there — see <IosInstallBanner> for that path.

const DISMISS_KEY = "rono-install-dismissed";

export function PwaInstallBanner() {
  const { t } = useI18n();
  const { canInstall, install } = usePwaInstall();
  // Read the persisted dismissal once. Safe to do lazily: both server and the
  // client's first render show nothing (canInstall is false until the browser
  // fires `beforeinstallprompt`), so there's no hydration mismatch.
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // Private mode can throw — fail open and allow the banner.
      return false;
    }
  });

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  const onInstall = async () => {
    const outcome = await install();
    // `install()` persists the dismissal flag on accept; hide either way.
    if (outcome !== "unavailable") setDismissed(true);
  };

  if (dismissed || !canInstall) return null;

  return (
    <div
      role="dialog"
      aria-label={t.pwa.installPrompt.title}
      className={cn(
        "fixed inset-x-0 bottom-0 z-[120] flex justify-center px-3",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        "motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:fade-in",
      )}
    >
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <DownloadIcon className="size-[18px] text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {t.pwa.installPrompt.title}
          </p>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
            {t.pwa.installPrompt.body}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onInstall}
            className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t.pwa.installPrompt.install}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t.pwa.installPrompt.dismiss}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
