import { usePwaInstallStore } from "@/lib/stores/pwa-install";

const DISMISS_KEY = "synapse-install-dismissed";

// Consumes the shared install prompt captured by <PwaInstallRegister>. Any
// surface (banner, drawer button) can call `install()` to open the native OS
// install dialog. `canInstall` is true only on browsers that fired the prompt
// (Android/Chromium) and where the app isn't already installed — iOS never
// fires it, so callers should fall back to the manual "Add to Home Screen"
// hint there.
export function usePwaInstall() {
  const deferred = usePwaInstallStore((s) => s.deferred);
  const installed = usePwaInstallStore((s) => s.installed);
  const setDeferred = usePwaInstallStore((s) => s.setDeferred);
  const setInstalled = usePwaInstallStore((s) => s.setInstalled);

  const install = async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    if (!deferred) return "unavailable";
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    // The event is single-use; drop it regardless of outcome.
    setDeferred(null);
    if (outcome === "accepted") {
      setInstalled(true);
      try {
        localStorage.setItem(DISMISS_KEY, "1");
      } catch {}
    }
    return outcome;
  };

  return { canInstall: !!deferred && !installed, installed, install };
}
