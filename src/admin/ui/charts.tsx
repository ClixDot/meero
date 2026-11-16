'use client';

/** Lightweight SVG/CSS charts – no chart library needed. */
import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

/** Integer-friendly "nice" axis: returns [top, step] with 4 intervals. */
function niceScale(max: number): [number, number] {
  if (max <= 4) return [4, 1];
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw && Number.isInteger(s)) ?? Math.ceil(raw);
  return [step * 4, step];
}

/**
 * Thin grouped bars (soft-UI style). Bars are rounded at the top and square at the baseline.
 * Colours validated on the light surface: #0E9F95 / #8B80F9 pass CVD, chroma and contrast checks;
 * the legend and tooltip carry identity too, so colour is never the only cue.
 */
export function GroupedBarChart({ data, series, height = 250, emptyText = 'No data in this period yet.', emptyHint }: {
  data: Array<{ label: string; values: number[] }>;
  series: Array<{ name: string; color: string }>;
  height?: number;
  emptyText?: string;
  emptyHint?: string;
}) {
  const reduce = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  const clipId = `clip-${React.useId().replace(/:/g, '')}`;

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = { l: 34, r: 8, t: 12, b: 30 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const max = Math.max(0, ...data.flatMap((d) => d.values));
  const [top, step] = niceScale(max);
  const ticks = Array.from({ length: 5 }, (_, i) => i * step);
  const n = Math.max(1, data.length);
  const colW = innerW / n;
  const cxOf = (i: number) => pad.l + colW * (i + 0.5);
  const y = (v: number) => pad.t + innerH - (v / top) * innerH;
  const base = y(0);
  const barW = Math.max(5, Math.min(10, colW * 0.12));
  const gap = Math.max(3, barW * 0.6);
  const groupW = series.length * barW + (series.length - 1) * gap;
  const empty = max === 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 flex-wrap justify-end">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-xs text-[#5E696B] font-medium">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <div ref={wrapRef} className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
        <svg width={width} height={height} className="block" role="img" aria-label={`${series.map((s) => s.name).join(' and ')} by month`}>
          <defs>
            <clipPath id={clipId}><rect x={0} y={0} width={width} height={base} /></clipPath>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? '#DDE5E3' : '#EEF2F1'} strokeDasharray={t === 0 ? undefined : '3 5'} />
              <text x={pad.l - 10} y={y(t)} dy="0.32em" textAnchor="end" className="fill-[#A3ACAE] text-[10px] font-medium tabular-nums">{t}</text>
            </g>
          ))}
          {/* Hover band */}
          {hover !== null && !empty && (
            <rect x={cxOf(hover) - Math.min(colW * 0.42, groupW + 22) / 2} y={pad.t} width={Math.min(colW * 0.42, groupW + 22)} height={innerH} rx={12} fill="#168F88" opacity={0.06} />
          )}
          <g clipPath={`url(#${clipId})`}>
            {!empty && data.map((d, i) => d.values.map((v, k) => {
              if (v <= 0) return null;
              const x = cxOf(i) - groupW / 2 + k * (barW + gap);
              const h = base - y(v);
              return (
                <motion.rect
                  key={`${i}-${k}`}
                  x={x}
                  width={barW}
                  rx={barW / 2}
                  fill={series[k].color}
                  opacity={hover === null || hover === i ? 1 : 0.4}
                  initial={reduce ? false : { y: base, height: 0 }}
                  animate={{ y: y(v), height: h + barW }}
                  transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : i * 0.05 + k * 0.04, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            }))}
          </g>
          {data.map((d, i) => (
            <text key={d.label} x={cxOf(i)} y={height - 8} textAnchor="middle" className={cx('text-[11px] font-medium', hover === i ? 'fill-[#171B20]' : 'fill-[#8A9496]')}>{d.label}</text>
          ))}
          {/* Hit targets: full column, larger than the bars */}
          {!empty && data.map((d, i) => (
            <rect key={`h${i}`} x={pad.l + colW * i} y={pad.t} width={colW} height={innerH} fill="transparent" tabIndex={0}
              onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              aria-label={`${d.label}: ${d.values.map((v, k) => `${v} ${series[k].name}`).join(', ')}`} className="outline-none" />
          ))}
        </svg>

        {hover !== null && !empty && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl bg-[#171B20]/95 backdrop-blur text-white px-3 py-2.5 shadow-xl text-[11px] min-w-[150px]"
            style={{ left: Math.min(Math.max(cxOf(hover), 84), width - 84), top: y(Math.max(...data[hover].values)) - 12, transform: 'translate(-50%, -100%)' }}
          >
            <div className="font-semibold text-[12px] mb-1.5">{data[hover].label}</div>
            {series.map((s, k) => (
              <div key={s.name} className="flex items-center justify-between gap-4 py-0.5">
                <span className="flex items-center gap-1.5 text-slate-300"><span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.name}</span>
                <span className="font-bold tabular-nums">{data[hover].values[k]}</span>
              </div>
            ))}
            {series.length === 2 && data[hover].values[0] > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-white/10 flex justify-between text-slate-300">
                <span>Rate</span>
                <span className="font-bold text-white tabular-nums">{Math.round((data[hover].values[1] / data[hover].values[0]) * 100)}%</span>
              </div>
            )}
          </div>
        )}

        {empty && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ paddingLeft: pad.l, paddingBottom: pad.b }}>
            <div className="text-center px-5 py-4 rounded-2xl bg-white/90 backdrop-blur border border-white shadow-[0_10px_30px_-18px_rgba(23,27,32,0.3)] max-w-xs">
              <p className="text-sm font-semibold text-[#2B3134]">{emptyText}</p>
              {emptyHint && <p className="text-xs text-[#8A9496] mt-1">{emptyHint}</p>}
            </div>
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>{series.map((s) => s.name).join(' and ')} by month</caption>
        <thead><tr><th>Month</th>{series.map((s) => <th key={s.name}>{s.name}</th>)}</tr></thead>
        <tbody>{data.map((d) => <tr key={d.label}><td>{d.label}</td>{d.values.map((v, k) => <td key={k}>{v}</td>)}</tr>)}</tbody>
      </table>
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

/** Sparkline of thin bars. Empty periods show as short stubs so the shape still reads; the latest bar is full strength. */
export function MiniBars({ values, color = '#168F88', className }: { values: number[]; color?: string; className?: string }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...values);
  return (
    <div className={cx('flex items-end gap-[5px] h-7', className)} aria-hidden>
      {values.map((v, i) => (
        <motion.span
          key={i}
          className="w-[4px] rounded-full"
          style={{ background: color, opacity: i === values.length - 1 ? 1 : 0.75 }}
          initial={reduce ? false : { height: '14%' }}
          animate={{ height: `${v > 0 ? Math.max(22, (v / max) * 100) : 14}%` }}
          transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : i * 0.03, ease: [0.16, 1, 0.3, 1] }}
        />
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
