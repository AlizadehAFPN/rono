// Strings for the iOS "Add to Home Screen" install hint banner.
// iOS Safari offers no install prompt, so we guide users manually.

const en = {
  installHint: {
    title: "Install Rono",
    // {share} is replaced with the Share icon at render time.
    body: "Tap {share} then “Add to Home Screen” for the full app experience.",
    dismiss: "Dismiss",
  },
  // Android / Chromium: a native install is available via beforeinstallprompt.
  installPrompt: {
    title: "Install Rono",
    body: "Add Rono to your home screen for a faster, full-screen experience.",
    install: "Install",
    dismiss: "Not now",
  },
};

export type PwaDict = typeof en;

const fa: PwaDict = {
  installHint: {
    title: "نصب Rono",
    body: "برای تجربه کامل برنامه، روی {share} بزنید و سپس «افزودن به صفحه اصلی» را انتخاب کنید.",
    dismiss: "بستن",
  },
  installPrompt: {
    title: "نصب Rono",
    body: "برای تجربه‌ای سریع‌تر و تمام‌صفحه، Rono را به صفحه اصلی خود اضافه کنید.",
    install: "نصب",
    dismiss: "حالا نه",
  },
};

export const pwa = { en, fa };
