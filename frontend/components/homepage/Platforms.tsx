"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

function AndroidIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
    >
      <line
        x1="15"
        y1="11"
        x2="12"
        y2="5"
        stroke="#3DDC84"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="29"
        y1="11"
        x2="32"
        y2="5"
        stroke="#3DDC84"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="7" y="12" width="30" height="19" rx="9.5" fill="#3DDC84" />
      <circle cx="16.5" cy="21.5" r="2.5" fill="white" />
      <circle cx="27.5" cy="21.5" r="2.5" fill="white" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
    >
      {/* Stem + leaf */}
      <path
        d="M22 10 C22 7 25 5 27 7"
        stroke="#1C1C1E"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Apple body */}
      <path
        d="M27 12 C30.5 12 35 16 35 23.5 C35 32 29.5 39 25 39 L22 39 L19 39 C14.5 39 9 32 9 23.5 C9 16 13.5 12 17 12 C19 12 20.5 14 22 14 C23.5 14 25 12 27 12 Z"
        fill="#1C1C1E"
      />
    </svg>
  );
}

const PLATFORM_META = [
  {
    id: "web",
    icon: "web" as const,
    accentText: "text-cyan-500",
    iconBg: "bg-cyan-50",
    cardBorder: "border-cyan-100",
    // Live now: links into the web app.
    href: "/login",
    download: false,
    // Whether to show the "<store> — Coming Soon" note under the CTA.
    storeSoon: false,
  },
  {
    id: "android",
    icon: "android" as const,
    accentText: "text-[#3DDC84]",
    iconBg: "bg-emerald-50",
    cardBorder: "border-emerald-100",
    // Direct APK download served from /public; Play Store still pending.
    href: "/downloads/synapse-android.apk",
    download: true,
    storeSoon: true,
  },
  {
    id: "ios",
    icon: "ios" as const,
    accentText: "text-slate-700",
    iconBg: "bg-slate-100",
    cardBorder: "border-slate-200",
    // No App Store build yet — send users to install the PWA.
    href: "/login",
    download: false,
    storeSoon: true,
  },
] as const;

export default function Platforms() {
  const { t } = useI18n();

  const platforms = PLATFORM_META.map((meta) => {
    const copy = t.home.platforms[meta.id];
    return {
      ...meta,
      name: copy.name,
      tagline: copy.tagline,
      description: copy.description,
      ctaLabel: copy.cta,
      meta: copy.meta,
      storeNote: copy.storeNote,
    };
  });

  return (
    <section id="platforms" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-cyan-600 text-sm font-semibold uppercase tracking-widest">
            {t.home.platforms.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            {t.home.platforms.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            {t.home.platforms.subtitle}
          </p>
        </div>

        {/* Platform cards */}
        <div className="grid md:grid-cols-3 gap-7">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`relative rounded-2xl border bg-white p-8 hover:shadow-lg transition-shadow duration-200 ${platform.cardBorder}`}
            >
              {/* Status badge — every platform has a live way in now. */}
              <div className="absolute top-6 right-6">
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  {t.home.platforms.statusAvailable}
                </span>
              </div>

              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl ${platform.iconBg} flex items-center justify-center mb-7`}
              >
                {platform.icon === "web" && (
                  <Globe
                    size={36}
                    className={platform.accentText}
                    strokeWidth={1.5}
                  />
                )}
                {platform.icon === "android" && <AndroidIcon />}
                {platform.icon === "ios" && <AppleIcon />}
              </div>

              {/* Content */}
              <p
                className={`text-xs font-semibold uppercase tracking-widest mb-1 ${platform.accentText}`}
              >
                {platform.tagline}
              </p>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {platform.name}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-8">
                {platform.description}
              </p>

              {/* CTA — live link for every platform (Android = direct APK). */}
              <a
                href={platform.href}
                {...(platform.download ? { download: true } : {})}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
              >
                {platform.download && (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M7.5 2V9.5M7.5 9.5L4.5 6.5M7.5 9.5L10.5 6.5M2.5 11.5V12.5C2.5 12.7761 2.72386 13 3 13H12C12.2761 13 12.5 12.7761 12.5 12.5V11.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {platform.ctaLabel}
                {!platform.download && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 7H11.5M8 3.5L11.5 7L8 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </a>

              {/* APK version / size line. */}
              {platform.meta && (
                <p className="mt-3 text-xs text-slate-400">{platform.meta}</p>
              )}

              {/* Native store still pending (Google Play / App Store). */}
              {platform.storeSoon && (
                <p
                  className={`flex items-center gap-1.5 text-xs font-medium text-slate-400 ${
                    platform.meta ? "mt-1.5" : "mt-3"
                  }`}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="6.5"
                      cy="6.5"
                      r="5.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M6.5 4V6.5L8 8"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {platform.storeNote} — {t.home.platforms.comingSoonSuffix}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Cross-platform sync note */}
        <p className="mt-10 text-center text-sm text-slate-500">
          {t.home.platforms.syncNote}
        </p>
      </div>
    </section>
  );
}
