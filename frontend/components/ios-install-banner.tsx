"use client";

import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// iOS Safari has no install prompt — the only way to install a PWA is the
// manual "Share → Add to Home Screen" flow. This banner nudges iOS Safari
// users toward it, and only them: it stays hidden on Android (which gets a
// native prompt), on desktop, in non-Safari iOS browsers, and once the app
// is already installed (standalone) or the user has dismissed it.

const DISMISS_KEY = "rono-ios-install-dismissed";

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos =
    /iPhone|iPad|iPod/.test(ua) ||
    // iPadOS 13+ identifies as "MacIntel" — distinguish via touch points.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIos) return false;
  // Chrome (CriOS), Firefox (FxiOS), Edge (EdgiOS), Opera (OPiOS) on iOS
  // can't add to the home screen via the share sheet — show only in Safari.
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Legacy iOS standalone flag, not in the standard Navigator type.
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

// The iOS "Share" glyph (square with an up arrow) — lucide has no exact match,
// so we inline it for instructional accuracy.
function ShareGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-0.5 inline-block align-text-bottom text-primary"
      aria-hidden="true"
    >
      <path d="M12 3v13" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

export function IosInstallBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIosSafari() || isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // Private mode can throw on storage access — fail open and still show.
    }
    // Brief delay so the banner animates in after the page settles.
    const id = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  if (!visible) return null;

  // Split the localized body on the {share} token to inline the glyph.
  const [before, after] = t.pwa.installHint.body.split("{share}");

  return (
    <div
      role="dialog"
      aria-label={t.pwa.installHint.title}
      className={cn(
        "fixed inset-x-0 bottom-0 z-[120] flex justify-center px-3",
        // Respect the iPhone home indicator / safe area.
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        "motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:fade-in",
      )}
    >
      <div className="flex w-full max-w-md items-start gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <ShareGlyph />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {t.pwa.installHint.title}
          </p>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
            {before}
            <ShareGlyph />
            {after}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t.pwa.installHint.dismiss}
          className="-m-1 shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
