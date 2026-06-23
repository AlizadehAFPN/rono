"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SplashScreen } from "@/components/splash-screen";
import { IosInstallBanner } from "@/components/ios-install-banner";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { PwaInstallRegister } from "@/components/pwa-install-register";
import { I18nProvider } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/config";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  // The PWA is for the web app, not the marketing site: suppress install
  // prompts on the public landing page ("/").
  const pathname = usePathname();
  const isMarketingHome = pathname === "/";

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider initialLocale={initialLocale}>
        <ThemeProvider>
          {children}
          <SplashScreen />
          <Toaster />
          <ServiceWorkerRegister />
          {/* Capture the install prompt everywhere so the dashboard drawer's
              "Install app" button works regardless of entry page. */}
          <PwaInstallRegister />
          {!isMarketingHome && (
            <>
              <IosInstallBanner />
              <PwaInstallBanner />
            </>
          )}
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
