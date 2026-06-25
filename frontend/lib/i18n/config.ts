export const locales = ["fa", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fa";

export const LOCALE_COOKIE = "rono-lang";

export type Direction = "rtl" | "ltr";

export const LOCALE_LABELS: Record<Locale, { native: string; short: string }> =
  {
    fa: { native: "فارسی", short: "FA" },
    en: { native: "English", short: "EN" },
  };

/** Writing direction per locale — Persian is right-to-left, English left-to-right. */
export const LOCALE_DIR: Record<Locale, Direction> = {
  fa: "rtl",
  en: "ltr",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fa" || value === "en";
}

/** Normalize any cookie/header value to a supported locale, falling back to the default. */
export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/** The writing direction for a locale (`"rtl"` for Persian, `"ltr"` for English). */
export function getDirection(locale: Locale): Direction {
  return LOCALE_DIR[locale];
}
