"use client";

import {
  FlaskConical,
  Layers,
  Stethoscope,
  Zap,
  TrendingUp,
  Users,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const FEATURE_META = [
  { icon: FlaskConical, accent: "cyan" },
  { icon: Layers, accent: "violet" },
  { icon: Stethoscope, accent: "cyan" },
  { icon: Zap, accent: "violet" },
  { icon: TrendingUp, accent: "cyan" },
  { icon: Users, accent: "violet" },
] as const;

export default function Differentiators() {
  const { t } = useI18n();

  const features = t.home.differentiators.features.map((f, i) => ({
    ...f,
    ...FEATURE_META[i],
  }));

  return (
    <section id="why-rono" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl">
          <p className="text-violet-600 text-sm font-semibold uppercase tracking-widest">
            {t.home.differentiators.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            {t.home.differentiators.titleLine1}
            <br className="hidden sm:block" />{" "}
            {t.home.differentiators.titleLine2}
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            {t.home.differentiators.subtitle}
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="group">
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200 ${
                    feature.accent === "cyan"
                      ? "bg-violet-50 group-hover:bg-violet-100"
                      : "bg-violet-50 group-hover:bg-violet-100"
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      feature.accent === "cyan"
                        ? "text-violet-600"
                        : "text-violet-600"
                    }
                  />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
