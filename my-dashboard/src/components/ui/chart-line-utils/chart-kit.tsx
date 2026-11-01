"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/* ---------- Types ---------- */

export type ChartDatum = Record<string, string | number | null | undefined>;
export type ChartCurve = "smooth" | "linear" | "step";
export type Point = [number, number];
export type ValueFormat =
  | "number"
  | "compact"
  | "currency"
  | "percent"
  | ((v: number) => string);

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
}

export interface ChartBaseProps {
  title?: string;
  description?: ReactNode;
  titleSize?: "sm" | "md" | "lg";
  surface?: "dark" | "light";
  accent?: string;
  palette?: string[];
  /** Small glyph top-right. Pass null to hide it. */
  icon?: ReactNode;
  /** Extra controls top-right, e.g. a metric picker. */
  action?: ReactNode;
  /** Which direction of change is good, for the delta pill. Default: "up" */
  goodWhen?: "up" | "down";
  radius?: number;
  bare?: boolean;
  animate?: boolean;
  duration?: number;
  delay?: number;
  once?: boolean;
  valueFormat?: ValueFormat;
  currency?: string;
  decimals?: number;
  className?: string;
}

/* ---------- Theme (Botanical Luxe) ---------- */

export interface ChartTheme {
  bg: string;
  raise: string;
  tip: string;
  fg: string;
  muted: string;
  grid: string;
  subtle: string;
  border: string;
  accent: string;
  good: string;
  bad: string;
}

export function chartTheme(
  surface: "dark" | "light" = "dark",
  accent?: string,
): ChartTheme {
  if (surface === "light")
    return {
      bg: "#FBF6EF",
      raise: "#EFE3D3",
      tip: "#FFFDF9",
      fg: "#0D3C26",
      muted: "#5E7466",
      grid: "rgba(13,60,38,0.1)",
      subtle: "rgba(13,60,38,0.35)",
      border: "rgba(13,60,38,0.11)",
      accent: accent ?? "#E2725B",
      good: "#2F7A4F",
      bad: "#C2543C",
    };
  return {
    bg: "#0D3C26",
    raise: "#134A30",
    tip: "#072A19",
    fg: "#F4EADE",
    muted: "#A9B8AB",
    grid: "rgba(244,234,222,0.09)",
    subtle: "rgba(244,234,222,0.3)",
    border: "rgba(244,234,222,0.11)",
    accent: accent ?? "#E2725B",
    good: "#9CC5A1",
    bad: "#E2725B",
  };
}

export function resolveSeries(
  series: ChartSeries[],
  theme: ChartTheme,
  palette?: string[],
) {
  const colors = palette ?? [theme.accent, "#F4EADE", "#D9B98C", "#9CC5A1"];
  return series.map((s, i) => ({
    ...s,
    color: s.color ?? colors[i % colors.length],
  }));
}

/* ---------- Numbers ---------- */

export const toNumber = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function createFormatter(
  format: ValueFormat,
  { currency = "USD", decimals }: { currency?: string; decimals?: number } = {},
): (v: number) => string {
  if (typeof format === "function") return format;
  const locale = currency === "INR" ? "en-IN" : "en-US";
  if (format === "currency") {
    const intl = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: decimals ?? 0,
    });
    return (v) => intl.format(v);
  }
  if (format === "percent") return (v) => `${v.toFixed(decimals ?? 1)}%`;
  if (format === "compact") {
    const intl = new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: decimals ?? 1,
    });
    return (v) => intl.format(v);
  }
  const intl = new Intl.NumberFormat(locale, {
    maximumFractionDigits: decimals ?? 0,
  });
  return (v) => intl.format(v);
}

export function niceTicks(min: number, max: number, count: number) {
  if (!(max > min)) max = min + 1;
  const raw = (max - min) / Math.max(count, 1);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const err = raw / mag;
  const step = (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step * 1e-6; v += step)
    out.push(Math.round(v / step) * step);
  return out;
}

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Monotone cubic interpolation: smooth, never overshoots the data. */
function monotonePath(pts: Point[]) {
  const n = pts.length;
  const dx: number[] = [];
  const m: number[] = [];
  const t = new Array<number>(n);
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0];
    m[i] = (pts[i + 1][1] - pts[i][1]) / (dx[i] || 1);
  }
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++)
    t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(m[i]) < 1e-9) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const h = a * a + b * b;
    if (h > 9) {
      const s = 3 / Math.sqrt(h);
      t[i] = s * a * m[i];
      t[i + 1] = s * b * m[i];
    }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = dx[i] / 3;
    d += `C${r2(x0 + h)},${r2(y0 + t[i] * h)},${r2(x1 - h)},${r2(y1 - t[i + 1] * h)},${x1},${y1}`;
  }
  return d;
}

export function linePath(pts: Point[], curve: ChartCurve = "smooth") {
  if (!pts.length) return "";
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
  if (curve === "smooth") return monotonePath(pts);
  if (curve === "step") {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const mx = r2((pts[i - 1][0] + pts[i][0]) / 2);
      d += `H${mx}V${pts[i][1]}H${pts[i][0]}`;
    }
    return d;
  }
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("");
}

/* ---------- Reveal on scroll ---------- */

export function useChartReveal(once = true, animated = true) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount: 0.35 });
  const reduce = useReducedMotion();
  const still = !animated || !!reduce;
  return { ref, shown: still || inView, still };
}

/* ---------- Pieces ---------- */

export function ChartCard({
  theme,
  title,
  description,
  titleSize = "sm",
  value,
  delta,
  goodWhen = "up",
  icon,
  action,
  radius = 0,
  bare,
  className,
  children,
}: {
  theme: ChartTheme;
  title?: string;
  description?: ReactNode;
  titleSize?: "sm" | "md" | "lg";
  value?: ReactNode;
  delta?: number;
  goodWhen?: "up" | "down";
  icon?: ReactNode;
  action?: ReactNode;
  radius?: number;
  bare?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const titleCls =
    titleSize === "lg" ? "text-base" : titleSize === "md" ? "text-sm" : "text-[13px]";
  return (
    <article
      className={cn("min-w-0", !bare && "border px-5 pb-4 pt-5", className)}
      style={{
        background: bare ? undefined : theme.bg,
        borderColor: theme.border,
        color: theme.fg,
        borderRadius: radius,
      }}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          {title && (
            <p className={cn(titleCls, "font-medium")} style={{ color: theme.muted }}>
              {title}
            </p>
          )}
          {value !== undefined && (
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <span className="text-[30px] font-semibold leading-tight tracking-tight tabular-nums">
                {value}
              </span>
              {delta !== undefined && Number.isFinite(delta) && (
                <DeltaPill delta={delta} goodWhen={goodWhen} theme={theme} />
              )}
            </div>
          )}
          {description && (
            <p className="mt-1 text-xs" style={{ color: theme.muted }}>
              {description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {icon && (
            <span
              className="grid size-9 place-items-center border"
              style={{ borderColor: theme.border, background: theme.raise }}
            >
              {icon}
            </span>
          )}
        </div>
      </header>
      {children}
    </article>
  );
}

export function DeltaPill({
  delta,
  goodWhen = "up",
  theme,
}: {
  delta: number;
  goodWhen?: "up" | "down";
  theme: ChartTheme;
}) {
  const up = delta > 0.05;
  const down = delta < -0.05;
  const good = goodWhen === "down" ? down : up;
  const bad = goodWhen === "down" ? up : down;
  const color = good ? theme.good : bad ? theme.bad : theme.muted;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-[3px] text-[11.5px] font-semibold tabular-nums transition-colors duration-300"
      style={{ color, background: `${color}24` }}
    >
      {up ? "▲" : down ? "▼" : "•"} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

export function ChartLegend({
  series,
  theme,
  hidden,
  onToggle,
}: {
  series: { key: string; label: string; color: string; texture?: string }[];
  theme: ChartTheme;
  hidden: Set<string>;
  onToggle: (key: string) => void;
}) {
  const visible = series.filter((s) => !hidden.has(s.key)).length;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {series.map((s) => {
        const on = !hidden.has(s.key);
        return (
          <button
            key={s.key}
            type="button"
            aria-pressed={on}
            onClick={() => (on && visible <= 1 ? undefined : onToggle(s.key))}
            className="inline-flex cursor-pointer items-center gap-2 py-0.5 text-xs transition-opacity duration-300 hover:opacity-100"
            style={{ color: theme.muted, opacity: on ? 1 : 0.45 }}
          >
            <i
              className="size-2.5 transition-colors duration-300"
              style={{
                background: on ? s.color : "transparent",
                boxShadow: on ? undefined : `inset 0 0 0 1.5px ${s.color}`,
              }}
            />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

export function ChartPattern({
  id,
  color,
  texture,
}: {
  id: string;
  color: string;
  texture: "hatch" | "dots";
  theme?: ChartTheme;
}) {
  if (texture === "dots")
    return (
      <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse">
        <rect x="0.5" y="0.5" width="1.6" height="1.6" fill={color} />
        <rect x="3" y="3" width="1.6" height="1.6" fill={color} />
      </pattern>
    );
  return (
    <pattern
      id={id}
      width="6"
      height="6"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="1.5" />
    </pattern>
  );
}

const TIP_W = 180;

export function ChartTooltip({
  open,
  x,
  y,
  width,
  title,
  rows,
  theme,
}: {
  open: boolean;
  x: number;
  y: number;
  width: number;
  title?: string;
  rows: { label: string; value: string; color: string }[];
  theme: ChartTheme;
}) {
  const last = useRef({ left: 0, top: 0 });
  if (open) {
    last.current = {
      left: x + 16 + TIP_W < width ? x + 16 : Math.max(0, x - 16 - TIP_W),
      top: y,
    };
  }
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-10 border px-3 py-2.5 text-xs shadow-[0_18px_40px_-14px_rgba(13,60,38,0.35)]"
      style={{
        width: TIP_W,
        background: theme.tip,
        borderColor: theme.border,
        translate: "0 -50%",
      }}
      initial={false}
      animate={{ opacity: open ? 1 : 0, x: last.current.left, y: last.current.top }}
      transition={{
        opacity: { duration: 0.15 },
        x: { type: "spring", stiffness: 600, damping: 45 },
        y: { type: "spring", stiffness: 600, damping: 45 },
      }}
    >
      {title && (
        <p className="mb-1.5 font-semibold" style={{ color: theme.fg }}>
          {title}
        </p>
      )}
      {rows.map((r) => (
        <div key={r.label} className="mt-1 flex items-center gap-2" style={{ color: theme.muted }}>
          <i className="size-2 shrink-0" style={{ background: r.color }} />
          {r.label}
          <b className="ml-auto pl-3 font-medium tabular-nums" style={{ color: theme.fg }}>
            {r.value}
          </b>
        </div>
      ))}
    </motion.div>
  );
}
