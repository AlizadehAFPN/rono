"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/stores/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.matches) root.classList.add("dark");
      const handler = (e: MediaQueryListEvent) =>
        root.classList.toggle("dark", e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  return <>{children}</>;
}
