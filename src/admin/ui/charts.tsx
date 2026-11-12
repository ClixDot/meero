'use client';

/** Lightweight SVG/CSS charts – no chart library needed. */
import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function GroupedBarChart({ data, series, height = 260 }: {
  data: Array<{ label: string; values: number[] }>;
  series: Array<{ name: string; color: string }>;
  height?: number;
}) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.flatMap((d) => d.values));
  const step = Math.max(1, Math.ceil(max / 4));
  const top = step * 4;
  const ticks = [4, 3, 2, 1, 0].map((i) => i * step);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-xs text-[#6B7678] font-medium">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
      <div className="flex gap-3" style={{ height }}>
        <div className="flex flex-col justify-between text-[10px] text-[#A3ACAE] font-medium py-0.5 shrink-0 w-6 text-right">
          {ticks.map((t) => <span key={t}>{t}</span>)}
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {ticks.map((t) => <div key={t} className="border-t border-dashed border-[#E6ECEB]" />)}
          </div>
          <div className="relative h-full flex items-end justify-around gap-1 sm:gap-2">
            {data.map((d, i) => (
              <div
                key={d.label}
                className="relative flex-1 h-full flex items-end justify-center gap-1 sm:gap-1.5 cursor-default"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {d.values.map((v, j) => (
                  <motion.div
                    key={j}
                    className="w-full max-w-[18px] rounded-full"
                    style={{ background: series[j].color, opacity: hover === null || hover === i ? 1 : 0.45 }}
                    initial={reduce ? false : { height: 0 }}
                    animate={{ height: `${(v / top) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
                {hover === i && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 px-3 py-2 rounded-xl bg-[#171B20] text-white text-[11px] shadow-xl whitespace-nowrap">
                    <div className="font-semibold mb-0.5">{d.label}</div>
                    {d.values.map((v, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: series[j].color }} />
                        {v} {series[j].name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-2">
        <div className="w-6 shrink-0" />
        <div className="flex-1 flex justify-around">
          {data.map((d) => <span key={d.label} className="flex-1 text-center text-[11px] text-[#8A9496] font-medium">{d.label}</span>)}
        </div>
      </div>
    </div>
  );
}

/** Concentric ring chart (inspired by "Product Statistic" rings). */
export function RingChart({ rings, center, size = 200 }: {
  rings: Array<{ label: string; value: number; color: string }>;
  center: { value: React.ReactNode; label: string };
  size?: number;
}) {
  const reduce = useReducedMotion();
  const total = Math.max(1, ...rings.map((r) => r.value));
  const stroke = 8;
  const gap = 5;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        {rings.map((r, i) => {
          const radius = size / 2 - stroke / 2 - i * (stroke + gap);
          if (radius <= stroke) return null;
          const c = 2 * Math.PI * radius;
          const frac = r.value / total;
          return (
            <g key={r.label}>
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EDF1F0" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * 0.75} ${c}`} />
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={r.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                initial={reduce ? false : { strokeDasharray: `0 ${c}` }}
                animate={{ strokeDasharray: `${Math.max(0.001, c * 0.75 * frac)} ${c}` }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <div className="text-2xl font-extrabold font-heading text-[#171B20]">{center.value}</div>
        <div className="text-[11px] text-[#8A9496] font-medium">{center.label}</div>
      </div>
    </div>
  );
}

export function MiniBars({ values, color = '#168F88' }: { values: number[]; color?: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-[3px] h-8" aria-hidden>
      {values.map((v, i) => (
        <span key={i} className="w-[5px] rounded-full" style={{ height: `${Math.max(12, (v / max) * 100)}%`, background: color, opacity: 0.35 + (0.65 * (i + 1)) / values.length }} />
      ))}
    </div>
  );
}

export function ProgressRow({ label, value, max, color = '#168F88', right }: { label: React.ReactNode; value: number; max: number; color?: string; right?: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span className="font-semibold text-[#2B3134] truncate">{label}</span>
        <span className="text-[#6B7678] font-semibold shrink-0">{right ?? value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#EDF1F0] overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${max ? (value / max) * 100 : 0}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
      </div>
    </div>
  );
}
