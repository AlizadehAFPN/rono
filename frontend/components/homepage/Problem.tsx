"use client";

import { BookOpen, RefreshCw, BarChart2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function Problem() {
  const { t } = useI18n();

  const problems = [
    { icon: BookOpen, ...t.home.problem.cards.generic },
    { icon: RefreshCw, ...t.home.problem.cards.memorization },
    { icon: BarChart2, ...t.home.problem.cards.noAdaptation },
  ];

  return (
    <section id="problem" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl">
          <p className="text-cyan-600 text-sm font-semibold uppercase tracking-widest">
            {t.home.problem.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            {t.home.problem.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            {t.home.problem.subtitle}
          </p>
        </div>

        {/* Problem cards */}
        <div className="mt-14 grid md:grid-cols-3 gap-7">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <div
                key={problem.title}
                className="bg-white rounded-xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center mb-5">
                  <Icon size={20} className="text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">
                  {problem.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Transition statement */}
        <div className="mt-14 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <p className="text-sm font-medium text-slate-500 px-4 text-center">
            {t.home.problem.transition}
          </p>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
      </div>
    </section>
  );
}
