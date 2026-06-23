import { create } from "zustand";

// `beforeinstallprompt` isn't in the standard DOM lib types yet.
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// A single source of truth for the captured Android/Chromium install prompt.
//
// The browser fires `beforeinstallprompt` exactly once and the event can only
// be consumed once (`prompt()` is single-use). Several surfaces want to drive
// that install — the transient banner and the permanent drawer button — so we
// capture the event in one place (<PwaInstallRegister>) and share it here
// instead of each component racing to grab its own copy.
interface PwaInstallStore {
  deferred: BeforeInstallPromptEvent | null;
  installed: boolean;
  setDeferred: (e: BeforeInstallPromptEvent | null) => void;
  setInstalled: (v: boolean) => void;
}

export const usePwaInstallStore = create<PwaInstallStore>((set) => ({
  deferred: null,
  installed: false,
  setDeferred: (deferred) => set({ deferred }),
  setInstalled: (installed) => set({ installed }),
}));
