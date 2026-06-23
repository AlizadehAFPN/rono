"use client";

import { useEffect, useRef } from "react";

// One-shot celebratory confetti burst on mount. Pure canvas + rAF, no deps.
// Brand colors only, ~90 particles, ~1.3s — deliberately restrained.
export function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const canvas = ref.current;
    if (reduce || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (canvas.width = window.innerWidth * dpr);
    const H = (canvas.height = window.innerHeight * dpr);
    const cols = ["#1D9BF0", "#00BA7C", "#8B98A5", "#FFFFFF"];

    const parts = Array.from({ length: 90 }, (_, i) => ({
      x: W / 2,
      y: H * 0.34,
      vx: (Math.random() - 0.5) * 9 * dpr,
      vy: (Math.random() * -11 - 3) * dpr,
      g: 0.3 * dpr,
      s: (Math.random() * 6 + 3) * dpr,
      c: cols[i % cols.length],
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
      life: 1,
    }));

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of parts) {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        p.life -= 0.009;
        if (p.life > 0 && p.y < H + 20) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.r);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
          ctx.restore();
        }
      }
      if (alive) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
