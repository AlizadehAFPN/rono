"use client";

import { useI18n } from "@/lib/i18n/context";

export default function Solution() {
  const { t } = useI18n();
  return (
    <section id="solution" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-violet-600 text-sm font-semibold uppercase tracking-widest">
            {t.home.solution.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            {t.home.solution.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            {t.home.solution.subtitle}
          </p>
        </div>

        {/* Algorithm cards */}
        <div className="mt-16 grid md:grid-cols-2 gap-7 max-w-5xl mx-auto">
          {/* IRT card */}
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50/70 to-white p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold tracking-tight">
                  IRT
                </span>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-violet-600 uppercase tracking-widest mb-0.5">
                  {t.home.solution.irt.algoLabel}
                </div>
                <div className="text-slate-800 font-semibold text-sm">
                  {t.home.solution.irt.name}
                </div>
              </div>
            </div>

            <p className="text-xl font-bold text-slate-900 mb-4 leading-snug">
              {t.home.solution.irt.question}
            </p>

            <p className="text-slate-600 text-sm leading-relaxed mb-7">
              {t.home.solution.irt.description}
            </p>

            <ul className="space-y-3">
              {t.home.solution.irt.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-slate-600"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-[6px] shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* FSRS card */}
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50/70 to-white p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold tracking-tight">
                  SRS
                </span>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-violet-600 uppercase tracking-widest mb-0.5">
                  {t.home.solution.fsrs.algoLabel}
                </div>
                <div className="text-slate-800 font-semibold text-sm">
                  {t.home.solution.fsrs.name}
                </div>
              </div>
            </div>

            <p className="text-xl font-bold text-slate-900 mb-4 leading-snug">
              {t.home.solution.fsrs.question}
            </p>

            <p className="text-slate-600 text-sm leading-relaxed mb-7">
              {t.home.solution.fsrs.description}
            </p>

            <ul className="space-y-3">
              {t.home.solution.fsrs.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-slate-600"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-[6px] shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Orchestrator callout */}
        <div className="mt-7 max-w-5xl mx-auto rounded-xl bg-slate-900 px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/8 border border-white/15">
            <span className="w-3 h-3 rounded-full bg-white" />
          </div>
          <div>
            <p className="text-white font-semibold mb-1">
              {t.home.solution.orchestrator.title}
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t.home.solution.orchestrator.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
