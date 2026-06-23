"use client";

import { useEffect } from "react";
import {
  usePwaInstallStore,
  type BeforeInstallPromptEvent,
} from "@/lib/stores/pwa-install";

// Captures the one-shot `beforeinstallprompt` event into the shared store and
// tracks `appinstalled`. Mounted once at the app root so every install surface
// (banner, drawer button) reads from the same captured event. Renders nothing.
export function PwaInstallRegister() {
  const setDeferred = usePwaInstallStore((s) => s.setDeferred);
  const setInstalled = usePwaInstallStore((s) => s.setInstalled);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      // Stop Chrome's mini-infobar; our own UI drives the prompt.
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setDeferred(null);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [setDeferred, setInstalled]);

  return null;
}
