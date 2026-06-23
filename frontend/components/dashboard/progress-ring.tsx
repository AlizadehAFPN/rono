"use client";

import { useEffect, useState } from "react";

// A circular progress ring that draws itself in on mount (stroke-dashoffset
// transition). `color` is any CSS color — we pass mastery CSS vars from the
// study pages so the stroke flips correctly between light/dark themes.
export function ProgressRing({
  value,
  size = 56,
  stroke = 5.5,
  color = "var(--primary)",
  track = "var(--track, var(--muted))",
  children,
  className,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));

  // Start fully empty, then animate to the real offset after first paint.
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const offset = drawn ? c * (1 - clamped / 100) : c;

  return (
    <div
      className={className}
      style={{ position: "relative", width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.7,.2,1)",
          }}
        />
      </svg>
      {children != null && (
        <div
          style={{ position: "absolute", inset: 0 }}
          className="flex items-center justify-center"
        >
          {children}
        </div>
      )}
    </div>
  );
}
