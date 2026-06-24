"use client";

import { useI18n } from "@/lib/i18n/context";
import { LogoMark } from "@/components/logo";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className="size-6 text-[#22D3EE]" />
      <span className="text-white font-semibold text-base">Rono</span>
    </div>
  );
}

export default function Footer() {
  const { t } = useI18n();

  const footerLinks = [
    { href: "#problem", label: t.home.footer.problem },
    { href: "#solution", label: t.home.footer.solution },
    { href: "#how-it-works", label: t.home.footer.howItWorks },
    { href: "#roadmap", label: t.home.footer.roadmap },
    { href: "#contact", label: t.home.footer.contact },
  ];

  return (
    <footer className="bg-[#060F1C] border-t border-white/6 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-7">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center sm:items-start gap-1.5">
            <Logo />
            <p className="text-slate-600 text-xs">{t.home.footer.tagline}</p>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-600 hover:text-slate-400 text-xs transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-slate-700 text-xs text-center sm:text-right">
            {t.home.footer.copyright}
            <br className="sm:hidden" /> {t.home.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
