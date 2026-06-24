"use client";

import { useEffect } from "react";

// Registers the Rono service worker once, after hydration.
// Renders nothing; safe to mount high in the tree.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    // When a new SW takes control (after we ship an update), reload once so the
    // page runs the fresh code instead of whatever the old SW was serving.
    // Guarded so it can't loop.
    let reloading = false;
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Actively check for an updated SW on each launch.
          reg.update().catch(() => {});
        })
        .catch((err) => {
          // Non-fatal: the app still works without offline support.
          console.error("SW registration failed:", err);
        });
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      window.removeEventListener("load", onLoad);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  return null;
}
