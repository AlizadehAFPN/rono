"use client";

import { Mail, ArrowRight, Building2, FlaskConical } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const PARTNER_ICONS = [Building2, FlaskConical, ArrowRight];

export default function ContactCTA() {
  const { t } = useI18n();

  const partnerTypes = t.home.contact.partnerTypes.map((type, i) => ({
    ...type,
    icon: PARTNER_ICONS[i],
  }));

  return (
    <section id="contact" className="py-24 bg-[#0B1E3D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-14">
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-4">
              {t.home.contact.eyebrow}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
              {t.home.contact.titleLine1}
              <br className="hidden sm:block" /> {t.home.contact.titleLine2}
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
              {t.home.contact.subtitle}
            </p>
          </div>

          {/* Partner type cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {partnerTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-6 text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                    <Icon size={16} className="text-cyan-400" />
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">
                    {type.label}
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {type.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:farzad@touchzenmedia.com"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors duration-200 text-sm"
            >
              <Mail size={16} />
              {t.home.contact.ctaPrimary}
              <ArrowRight size={15} />
            </a>
            <a
              href="#solution"
              className="inline-flex items-center justify-center px-7 py-4 border border-white/20 hover:border-white/35 text-white font-semibold rounded-lg transition-colors duration-200 text-sm"
            >
              {t.home.contact.ctaSecondary}
            </a>
          </div>

          {/* Status line */}
          <p className="mt-8 text-center text-slate-600 text-xs tracking-wide">
            {t.home.contact.statusLine}
          </p>
        </div>
      </div>
    </section>
  );
}
