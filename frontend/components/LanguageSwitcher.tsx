"use client";

import { DropdownMenu } from "radix-ui";
import { Check, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { locales, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

type Tone = "onDark" | "surface";

/**
 * Professional language switcher used in the homepage navbar (`tone="onDark"`)
 * and the dashboard topbar (`tone="surface"`). Shows a globe + the active
 * locale's short code, and a dropdown of full native names with a checkmark.
 */
export function LanguageSwitcher({
  tone = "surface",
  className,
}: {
  tone?: Tone;
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();

  const triggerClass =
    tone === "onDark"
      ? "border border-white/20 text-slate-200 hover:bg-white/10 hover:text-white hover:border-white/40"
      : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground";

  const contentClass =
    tone === "onDark"
      ? "border border-white/10 bg-[#0B1E3D] text-slate-200 shadow-xl shadow-black/30"
      : "border border-border bg-popover text-popover-foreground shadow-lg";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={t.common.language.label}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-violet-500/50",
          triggerClass,
          className,
        )}
      >
        <Globe className="size-4 shrink-0" strokeWidth={1.75} />
        <span className="tabular-nums">{LOCALE_LABELS[locale].short}</span>
        <ChevronDown className="size-3.5 shrink-0 opacity-60" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 min-w-[9rem] overflow-hidden rounded-xl p-1",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
            contentClass,
          )}
        >
          {locales.map((l: Locale) => {
            const active = l === locale;
            return (
              <DropdownMenu.Item
                key={l}
                onSelect={() => setLocale(l)}
                className={cn(
                  "flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                  tone === "onDark"
                    ? "focus:bg-white/10 data-[highlighted]:bg-white/10"
                    : "focus:bg-accent data-[highlighted]:bg-accent",
                  active &&
                    (tone === "onDark" ? "text-violet-400" : "font-medium"),
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "text-[10px] font-bold tabular-nums opacity-70",
                    )}
                  >
                    {LOCALE_LABELS[l].short}
                  </span>
                  {LOCALE_LABELS[l].native}
                </span>
                {active && <Check className="size-4 shrink-0" />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
