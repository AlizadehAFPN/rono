"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoMark } from "@/components/logo";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className="size-7 text-[#22D3EE]" />
      <span className="text-white font-semibold text-lg tracking-tight">
        Synapse
      </span>
    </div>
  );
}

export default function Navbar() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: "#problem", label: t.home.nav.problem },
    { href: "#solution", label: t.home.nav.solution },
    { href: "#how-it-works", label: t.home.nav.howItWorks },
    { href: "#roadmap", label: t.home.nav.roadmap },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0B1E3D]/98 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-[#0B1E3D]/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#hero" aria-label={t.home.nav.home}>
            <Logo />
          </a>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-300 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher tone="onDark" className="hidden sm:inline-flex" />
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
            >
              {t.home.nav.getEarlyAccess}
            </a>
            {/* Visible on every breakpoint. On mobile it's the sole header CTA
                (Get Early Access lives in the drawer there), so it's a solid
                cyan button; at sm+ it steps back to the subtle outline style. */}
            <a
              href="/login"
              className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 sm:px-4 sm:py-2 bg-cyan-500 text-white hover:bg-cyan-400 sm:border sm:border-white/20 sm:bg-white/10 sm:text-white sm:hover:border-white/40 sm:hover:bg-white/20"
            >
              {t.home.nav.accessWebApp}
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={open ? t.home.nav.closeMenu : t.home.nav.openMenu}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#0B1E3D] border-t border-white/10 px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:text-white text-sm font-medium py-3 px-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center px-4 py-3 bg-cyan-500 text-white text-sm font-semibold rounded-lg"
            >
              {t.home.nav.getEarlyAccess}
            </a>
            <a
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-lg"
            >
              {t.home.nav.accessWebApp}
            </a>
            <div className="flex justify-center pt-1">
              <LanguageSwitcher tone="onDark" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
