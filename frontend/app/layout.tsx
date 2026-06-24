import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rono — Adaptive Learning Platform",
  description:
    "Rono combines Item Response Theory and spaced repetition scheduling to deliver personalized medical education that adapts to every learner in real time.",
  keywords: [
    "adaptive learning",
    "medical education",
    "spaced repetition",
    "IRT",
    "FSRS",
  ],
  // PWA: tells the browser this app is installable and how to render it.
  applicationName: "Rono",
  appleWebApp: {
    capable: true, // run standalone (no Safari chrome) when added to home screen
    // NOT "black-translucent": that anchors the web view at the physical top in
    // an iOS standalone PWA, so its bottom falls one status-bar-height short of
    // the screen and the fixed tab bar floats above a dead strip. "black" sits
    // the web view below the status bar and lets it reach the physical bottom.
    statusBarStyle: "black",
    title: "Rono",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png", // required for a sharp iOS home-screen icon
  },
};

// Drives the theme-color and notch-safe rendering for the installed PWA.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7C3AED" },
    { media: "(prefers-color-scheme: dark)", color: "#15202B" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets content extend under the iPhone notch/safe areas
};

// Only needed for the "system" edge case: server cannot know the OS preference,
// so we apply it client-side before React hydrates to avoid FOUC.
// For explicit "light" or "dark" cookies the server already renders the right class.
const systemThemeScript = `try{if(document.cookie.match(/rono-theme=system/)&&window.matchMedia("(prefers-color-scheme:dark)").matches){document.documentElement.classList.add("dark")}}catch(e){}`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("rono-theme")?.value;
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  // Server-side class determination:
  //   "dark" or no cookie (first visit) → dark class applied → no mismatch
  //   "light"                           → no dark class      → no mismatch
  //   "system"                          → no dark class      → script handles it
  const isDark = !themeCookie || themeCookie === "dark";

  const htmlClass = [
    geistSans.variable,
    geistMono.variable,
    "scroll-smooth",
    "antialiased",
    isDark ? "dark" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <html lang={locale} className={htmlClass} suppressHydrationWarning>
      <head>
        {/* Only fires for "system" preference; suppressed for everything else */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: systemThemeScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
