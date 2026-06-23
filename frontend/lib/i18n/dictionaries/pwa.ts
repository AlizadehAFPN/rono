// Strings for the iOS "Add to Home Screen" install hint banner.
// iOS Safari offers no install prompt, so we guide users manually.

const en = {
  installHint: {
    title: "Install Synapse",
    // {share} is replaced with the Share icon at render time.
    body: "Tap {share} then “Add to Home Screen” for the full app experience.",
    dismiss: "Dismiss",
  },
  // Android / Chromium: a native install is available via beforeinstallprompt.
  installPrompt: {
    title: "Install Synapse",
    body: "Add Synapse to your home screen for a faster, full-screen experience.",
    install: "Install",
    dismiss: "Not now",
  },
};

export type PwaDict = typeof en;

const tr: PwaDict = {
  installHint: {
    title: "Synapse’ı Yükle",
    body: "Tam uygulama deneyimi için {share} simgesine dokunup “Ana Ekrana Ekle”’yi seçin.",
    dismiss: "Kapat",
  },
  installPrompt: {
    title: "Synapse’ı Yükle",
    body: "Daha hızlı ve tam ekran deneyim için Synapse’ı ana ekranınıza ekleyin.",
    install: "Yükle",
    dismiss: "Şimdi değil",
  },
};

export const pwa = { en, tr };
