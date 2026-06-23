"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";

// Run layout effects on the client, fall back to a no-op effect on the server
// (avoids React's useLayoutEffect-on-server warning during SSR).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SESSION_KEY = "synapse-splash-shown";
const HOLD_MS = 650; // time the mark is held before it fades
const FADE_MS = 500; // must match the CSS transition duration below

/**
 * Branded launch splash for the web app + installed PWA. Mirrors the iOS
 * `LaunchView` and the Android `LaunchScreen`: a soft brand glow with the mark
 * easing in. Shows once per browser session on app launch, then fades out.
 *
 * Skipped on the marketing home ("/") — that page is the public site, not the
 * app shell. The PWA `start_url` is /dashboard, so installed launches still see it.
 */
export function SplashScreen() {
  const pathname = usePathname();
  const enabled = pathname !== "/";

  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  // On a repeat load within the same session, skip the splash before the first
  // paint so it never flashes a second time.
  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;
    if (sessionStorage.getItem(SESSION_KEY)) {
      setHidden(true);
      setRemoved(true);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || removed) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    const hideTimer = window.setTimeout(() => setHidden(true), HOLD_MS);
    const removeTimer = window.setTimeout(
      () => setRemoved(true),
      HOLD_MS + FADE_MS,
    );
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, [enabled, removed]);

  if (!enabled || removed) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background transition-opacity duration-500 ease-out",
        hidden ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      {/* Brand glow, matching the auth screens */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center gap-5">
        <div className="text-primary motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-90 motion-safe:duration-700">
          <LogoMark className="size-20" title="Synapse" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-1000">
          Synapse
        </span>
      </div>
    </div>
  );
}
