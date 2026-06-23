"use client";

import { useI18n } from "@/lib/i18n/context";

export default function HowItWorks() {
  const { t } = useI18n();
  const steps = t.home.howItWorks.steps.map((step, i) => ({
    number: `0${i + 1}`,
    ...step,
  }));
  return (
    <section id="how-it-works" className="py-24 bg-[#0B1E3D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">
            {t.home.howItWorks.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white leading-tight">
            {t.home.howItWorks.title}
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            {t.home.howItWorks.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex gap-7 lg:gap-10">
              {/* Number + connector */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                  <span className="text-cyan-400 font-bold text-sm font-mono tracking-wide">
                    {step.number}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 w-px bg-gradient-to-b from-cyan-500/30 via-cyan-500/10 to-transparent mt-3" />
                )}
              </div>

              {/* Content */}
              <div className={`${i < steps.length - 1 ? "pb-12" : "pb-0"}`}>
                <h3 className="text-xl font-semibold text-white mb-3 leading-snug">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  {step.description}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
                  <span className="text-cyan-400/65 text-xs font-mono">
                    {step.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
