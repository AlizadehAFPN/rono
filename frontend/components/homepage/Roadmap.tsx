"use client";

import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type PhaseStatus = "complete" | "active" | "upcoming";

// One entry per roadmap phase in the dictionary (t.home.roadmap.phases).
// Keep this length in sync with that array.
const PHASE_META: { number: number; status: PhaseStatus }[] = [
  { number: 1, status: "complete" },
  { number: 2, status: "active" },
  { number: 3, status: "upcoming" },
  { number: 4, status: "upcoming" },
];

function StatusBadge({ status }: { status: PhaseStatus }) {
  const { t } = useI18n();
  if (status === "complete") {
    return (
      <div className="flex items-center gap-1.5">
        <CheckCircle2 size={15} className="text-emerald-500" />
        <span className="text-xs font-semibold text-emerald-600">
          {t.home.roadmap.statusComplete}
        </span>
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
        <span className="text-xs font-semibold text-violet-600">
          {t.home.roadmap.statusActive}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <Circle size={14} className="text-slate-300" />
      <span className="text-xs text-slate-400">
        {t.home.roadmap.statusUpcoming}
      </span>
    </div>
  );
}

export default function Roadmap() {
  const { t } = useI18n();

  const phases = PHASE_META.map((meta, i) => ({
    ...meta,
    ...t.home.roadmap.phases[i],
  }));

  return (
    <section id="roadmap" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-violet-600 text-sm font-semibold uppercase tracking-widest">
            {t.home.roadmap.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            {t.home.roadmap.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            {t.home.roadmap.subtitle}
          </p>
        </div>

        {/* Phase grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {phases.map((phase) => (
            <div
              key={phase.number}
              className={`relative rounded-xl p-7 border transition-shadow duration-200 ${
                phase.status === "complete"
                  ? "bg-white border-emerald-200"
                  : phase.status === "active"
                    ? "bg-white border-violet-200 shadow-md shadow-violet-100/60"
                    : "bg-white border-slate-200"
              }`}
            >
              {/* Phase label + status */}
              <div className="flex items-center justify-between mb-5">
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    phase.status === "complete"
                      ? "bg-emerald-50 text-emerald-600"
                      : phase.status === "active"
                        ? "bg-violet-50 text-violet-600"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {t.home.roadmap.phaseLabel} {phase.number}
                </span>
                <StatusBadge status={phase.status} />
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {phase.title}
              </h3>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                {phase.description}
              </p>

              <ul className="space-y-2.5">
                {phase.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-slate-500"
                  >
                    <ChevronRight
                      size={12}
                      className="shrink-0 mt-0.5 text-slate-400"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
