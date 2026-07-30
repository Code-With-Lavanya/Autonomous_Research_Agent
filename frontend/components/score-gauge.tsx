"use client";

import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function bandColor(score: number): string {
  if (score >= 80) return "var(--color-good)";
  if (score >= 50) return "var(--color-warn)";
  return "var(--color-bad)";
}

export function ScoreGauge({ score, size = 96 }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const color = bandColor(clamped);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="9" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-medium text-ink leading-none">{clamped}</span>
        <span className="mt-0.5 font-mono text-[9px] text-ink-faint tracking-wide">/ 100</span>
      </div>
    </div>
  );
}
