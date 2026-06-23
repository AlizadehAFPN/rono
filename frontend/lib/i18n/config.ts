export const locales = ["tr", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";

export const LOCALE_COOKIE = "synapse-lang";

export const LOCALE_LABELS: Record<Locale, { native: string; short: string }> =
  {
    tr: { native: "Türkçe", short: "TR" },
    en: { native: "English", short: "EN" },
  };

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "tr" || value === "en";
}

/** Normalize any cookie/header value to a supported locale, falling back to the default. */
export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}
