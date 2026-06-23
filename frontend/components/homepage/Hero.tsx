"use client";

import { useI18n } from "@/lib/i18n/context";

function NeuralViz() {
  const { t } = useI18n();
  return (
    <svg
      viewBox="0 0 480 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-auto"
    >
      {/* IRT cluster — satellite connections */}
      <line
        x1="125"
        y1="60"
        x2="155"
        y2="180"
        stroke="#22D3EE"
        strokeWidth="1"
        strokeOpacity="0.28"
      />
      <line
        x1="78"
        y1="100"
        x2="155"
        y2="180"
        stroke="#22D3EE"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <line
        x1="52"
        y1="180"
        x2="155"
        y2="180"
        stroke="#22D3EE"
        strokeWidth="1.5"
        strokeOpacity="0.45"
      />
      <line
        x1="78"
        y1="260"
        x2="155"
        y2="180"
        stroke="#22D3EE"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <line
        x1="125"
        y1="300"
        x2="155"
        y2="180"
        stroke="#22D3EE"
        strokeWidth="1"
        strokeOpacity="0.28"
      />

      {/* Orchestrator bridge — dashed */}
      <line
        x1="177"
        y1="180"
        x2="309"
        y2="180"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
        strokeDasharray="5 4"
      />

      {/* FSRS cluster — satellite connections */}
      <line
        x1="325"
        y1="180"
        x2="355"
        y2="60"
        stroke="#8B5CF6"
        strokeWidth="1"
        strokeOpacity="0.28"
      />
      <line
        x1="325"
        y1="180"
        x2="402"
        y2="100"
        stroke="#8B5CF6"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <line
        x1="325"
        y1="180"
        x2="428"
        y2="180"
        stroke="#8B5CF6"
        strokeWidth="1.5"
        strokeOpacity="0.45"
      />
      <line
        x1="325"
        y1="180"
        x2="402"
        y2="260"
        stroke="#8B5CF6"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <line
        x1="325"
        y1="180"
        x2="355"
        y2="300"
        stroke="#8B5CF6"
        strokeWidth="1"
        strokeOpacity="0.28"
      />

      {/* IRT satellite nodes */}
      <circle cx="125" cy="60" r="5" fill="#22D3EE" fillOpacity="0.38" />
      <circle cx="78" cy="100" r="7.5" fill="#22D3EE" fillOpacity="0.58" />
      <circle cx="52" cy="180" r="9" fill="#22D3EE" fillOpacity="0.68" />
      <circle cx="78" cy="260" r="7.5" fill="#22D3EE" fillOpacity="0.58" />
      <circle cx="125" cy="300" r="5" fill="#22D3EE" fillOpacity="0.38" />

      {/* IRT hub — glow rings + core */}
      <circle cx="155" cy="180" r="52" fill="#22D3EE" fillOpacity="0.04" />
      <circle cx="155" cy="180" r="36" fill="#22D3EE" fillOpacity="0.07" />
      <circle
        cx="155"
        cy="180"
        r="22"
        fill="#0B1E3D"
        stroke="#22D3EE"
        strokeWidth="2"
      />
      <circle cx="155" cy="180" r="13" fill="#22D3EE" />

      {/* Orchestrator node */}
      <circle cx="240" cy="180" r="16" fill="white" fillOpacity="0.04" />
      <circle cx="240" cy="180" r="5.5" fill="white" fillOpacity="0.85" />

      {/* FSRS hub — glow rings + core */}
      <circle cx="325" cy="180" r="52" fill="#8B5CF6" fillOpacity="0.04" />
      <circle cx="325" cy="180" r="36" fill="#8B5CF6" fillOpacity="0.07" />
      <circle
        cx="325"
        cy="180"
        r="22"
        fill="#0B1E3D"
        stroke="#8B5CF6"
        strokeWidth="2"
      />
      <circle cx="325" cy="180" r="13" fill="#8B5CF6" />

      {/* FSRS satellite nodes */}
      <circle cx="355" cy="60" r="5" fill="#8B5CF6" fillOpacity="0.38" />
      <circle cx="402" cy="100" r="7.5" fill="#8B5CF6" fillOpacity="0.58" />
      <circle cx="428" cy="180" r="9" fill="#8B5CF6" fillOpacity="0.68" />
      <circle cx="402" cy="260" r="7.5" fill="#8B5CF6" fillOpacity="0.58" />
      <circle cx="355" cy="300" r="5" fill="#8B5CF6" fillOpacity="0.38" />

      {/* Labels */}
      <text
        x="155"
        y="216"
        textAnchor="middle"
        fill="#22D3EE"
        fontSize="11"
        fontWeight="600"
        letterSpacing="0.04em"
        fontFamily="system-ui, sans-serif"
      >
        IRT
      </text>
      <text
        x="155"
        y="230"
        textAnchor="middle"
        fill="#22D3EE"
        fontSize="8.5"
        fillOpacity="0.6"
        fontFamily="system-ui, sans-serif"
      >
        {t.home.hero.viz.abilityEstimation}
      </text>

      <text
        x="325"
        y="216"
        textAnchor="middle"
        fill="#a78bfa"
        fontSize="11"
        fontWeight="600"
        letterSpacing="0.04em"
        fontFamily="system-ui, sans-serif"
      >
        FSRS-5
      </text>
      <text
        x="325"
        y="230"
        textAnchor="middle"
        fill="#a78bfa"
        fontSize="8.5"
        fillOpacity="0.6"
        fontFamily="system-ui, sans-serif"
      >
        {t.home.hero.viz.memoryScheduling}
      </text>

      <text
        x="240"
        y="165"
        textAnchor="middle"
        fill="white"
        fontSize="7.5"
        fillOpacity="0.48"
        letterSpacing="0.1em"
        fontFamily="system-ui, sans-serif"
      >
        {t.home.hero.viz.orchestrator}
      </text>
    </svg>
  );
}

export default function Hero() {
  const { t } = useI18n();
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[#0B1E3D] pt-16 min-h-screen flex items-center"
    >
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-20 w-[480px] h-[480px] rounded-full bg-cyan-500 blur-[140px] opacity-[0.06]" />
        <div className="absolute bottom-1/4 -right-20 w-[480px] h-[480px] rounded-full bg-violet-600 blur-[140px] opacity-[0.06]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* ── Left: Text content ── */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-xs font-semibold tracking-widest uppercase">
                {t.home.hero.eyebrow}
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-[64px] font-bold text-white leading-[1.08] tracking-tight">
              {t.home.hero.titleLine1}
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                {t.home.hero.titleLine2}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-7 text-lg text-slate-400 leading-relaxed max-w-lg">
              {t.home.hero.subheadline}
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors duration-200 text-sm"
              >
                {t.home.hero.ctaPrimary}
              </a>
              <a
                href="#solution"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-white/20 hover:border-white/40 text-white font-semibold rounded-lg transition-colors duration-200 text-sm"
              >
                {t.home.hero.ctaSecondary}
              </a>
            </div>

            {/* Proof bar */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-white">90%</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">
                  {t.home.hero.stats.retentionLabel}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">2PL</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">
                  {t.home.hero.stats.irtLabel}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">&lt;100ms</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">
                  {t.home.hero.stats.latencyLabel}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Neural visualization ── */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[440px]">
              <NeuralViz />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-slate-50 pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}
