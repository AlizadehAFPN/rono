export type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  listeners: Set<() => void>;
  subscribe: (listener: () => void) => () => void;
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const v = localStorage.getItem("rono-theme");
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {}
  return "dark";
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark");
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "system") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
    }
  }
}

// Simple pub/sub store — avoids zustand SSR issues with persist middleware
const store: ThemeStore = {
  theme: getStoredTheme(),
  listeners: new Set(),
  setTheme(theme: Theme) {
    try {
      localStorage.setItem("rono-theme", theme);
      // Write a cookie so the server can apply the correct class on next request,
      // eliminating the hydration mismatch for explicit light/dark preferences.
      document.cookie = `rono-theme=${theme};path=/;max-age=31536000;SameSite=Lax`;
    } catch {}
    store.theme = theme;
    applyTheme(theme);
    store.listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    store.listeners.add(listener);
    return () => store.listeners.delete(listener);
  },
};

// React hook
import { useSyncExternalStore } from "react";

export function useThemeStore() {
  const theme = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.theme,
    () => "dark" as Theme,
  );
  return { theme, setTheme: store.setTheme.bind(store) };
}
