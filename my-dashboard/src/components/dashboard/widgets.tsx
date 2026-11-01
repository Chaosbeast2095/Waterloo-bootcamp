import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import {
  Activity,
  Bot,
  Clock,
  Gauge,
  Leaf,
  Sparkles,
  Target,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { CA, GB, IN, KE } from "country-flag-icons/react/3x2";
import celestialLogo from "@/assets/partners/celestial.jpg";
import { cn } from "@/lib/utils";
import { fmt, pctChange, signed } from "@/lib/format";
import {
  breakdown,
  compareLabel,
  aiPlays,
  budget,
  budgetTitle,
  calendar,
  categories,
  countries,
  humanRole,
  hunger,
  investmentDecision,
  lifeline,
  kpis,
  notes,
  partners,
  phases,
  problem,
  risks,
  pilotGoal,
  seasons,
  segments,
  stakeholders,
  supplyChain,
  targets,
  waste,
  type Flag,
  type Heat,
  type Fmt,
  type IconName,
  type Kpi,
  type Ranking,
} from "@/data/dashboard";

export const ICONS: Record<IconName, LucideIcon> = {
  users: Users,
  zap: Zap,
  clock: Clock,
  target: Target,
  wallet: Wallet,
  gauge: Gauge,
  leaf: Leaf,
  sparkles: Sparkles,
  bot: Bot,
  activity: Activity,
};

/** Series palette: terracotta leads, then emerald, sand, sage. */
export const PALETTE = ["#E2725B", "#0D3C26", "#C9A46E", "#6FA582", "#B9CBBE"];

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------- Panel ---------- */

export function Panel({
  title,
  action,
  className,
  children,
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("min-w-0 border border-line bg-card p-5", className)}>
      <header className="mb-4 flex min-h-8 flex-wrap items-center justify-between gap-3">
        <h3 className="text-[14.5px] font-semibold text-fg">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Tabs<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-0.5 border border-line bg-frame p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "cursor-pointer px-2.5 py-1 text-[11.5px] transition-colors duration-300",
            value === o.value ? "bg-raised text-fg" : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Count-up number (writes to the DOM directly, no re-renders) ---------- */

export function CountUp({
  value,
  format = "number",
  decimals,
  className,
}: {
  value: number;
  format?: Fmt;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);

  useEffect(
    () =>
      mv.on("change", (v) => {
        if (ref.current) ref.current.textContent = fmt(v, format, decimals);
      }),
    [mv, format, decimals],
  );
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.jump(value);
      if (ref.current) ref.current.textContent = fmt(value, format, decimals);
      return;
    }
    const c = animate(mv, value, { duration: 1.3, ease: EASE });
    return () => c.stop();
  }, [inView, reduce, value, mv, format, decimals]);

  return (
    <span ref={ref} className={cn("num", className)}>
      {fmt(0, format, decimals)}
    </span>
  );
}

/* ---------- KPI card ---------- */

const TONES = [
  "bg-clay/15 text-clay",
  "bg-sage/15 text-sage",
  "bg-sand/15 text-sand",
  "bg-fg/10 text-fg",
];

export function KpiCard({ kpi, i }: { kpi: Kpi; i: number }) {
  const Icon = ICONS[kpi.icon];
  const change = pctChange(kpi.value, kpi.previous);
  const good = kpi.goodWhen === "down" ? change < 0 : change > 0;
  return (
    <div className="group relative min-w-0 border border-line bg-card px-4 pb-3.5 pt-4 transition-colors duration-300 hover:border-line-2 hover:bg-white/60">
      <div className="truncate pr-9 text-xs text-muted sm:pr-12">{kpi.label}</div>
      <div className="mt-1 whitespace-nowrap text-xl font-semibold tracking-tight text-fg sm:text-2xl">
        <CountUp value={kpi.value} format={kpi.format} decimals={kpi.decimals} />
      </div>
      <div className={cn("num mt-1.5 text-[11.5px]", good ? "text-sage" : "text-clay")}>
        {signed(change)} {compareLabel}
      </div>
      <span
        className={cn(
          "absolute right-3 top-3 grid size-7 place-items-center sm:right-4 sm:top-4 sm:size-9 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5",
          TONES[i % TONES.length],
        )}
      >
        <Icon className="size-[17px]" strokeWidth={2} />
      </span>
    </div>
  );
}

export function KpiRow() {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {kpis.map((k, i) => (
        <KpiCard key={k.label} kpi={k} i={i} />
      ))}
    </div>
  );
}

/* ---------- Donut ---------- */

export function Donut() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [hot, setHot] = useState<number | null>(null);
  const items = breakdown.items;
  const total = items.reduce((a, b) => a + b.value, 0) || 1;

  const W = 400;
  const H = 230;
  const cx = W / 2;
  const cy = H / 2;
  const R = 72;
  const SW = 22;
  const C = 2 * Math.PI * R;
  const GAP = 2.5;

  const segs = items.map((it, i) => {
    const start = items.slice(0, i).reduce((a, b) => a + b.value, 0) / total;
    const frac = it.value / total;
    const a = (start + frac / 2) * 2 * Math.PI - Math.PI / 2;
    const r1 = R + SW / 2 + 5;
    const r2 = R + SW / 2 + 18;
    const p1 = [cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)];
    const p2 = [cx + r2 * Math.cos(a), cy + r2 * Math.sin(a)];
    const right = Math.cos(a) >= 0;
    const p3 = [p2[0] + (right ? 16 : -16), p2[1]];
    return { ...it, i, start, frac, len: Math.max(frac * C - GAP, 0), p1, p2, p3, right, color: PALETTE[i % PALETTE.length] };
  });

  const focus = hot === null ? null : segs[hot];

  return (
    <div>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto max-h-[250px] w-full overflow-visible"
        role="img"
        aria-label={`${breakdown.title}: ${segs.map((s) => `${s.label} ${(s.frac * 100).toFixed(0)}%`).join(", ")}`}
        onPointerLeave={() => setHot(null)}
      >
        {segs.map((s) => (
          <motion.circle
            key={s.label}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={SW}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeDashoffset={-s.start * C}
            initial={reduce ? false : { strokeDasharray: `0 ${C}` }}
            animate={{
              strokeDasharray: inView || reduce ? `${s.len} ${C}` : `0 ${C}`,
              opacity: hot === null || hot === s.i ? 1 : 0.28,
              strokeWidth: hot === s.i ? SW + 6 : SW,
            }}
            transition={{
              strokeDasharray: { duration: 0.9, delay: 0.1 + s.i * 0.12, ease: EASE },
              opacity: { duration: 0.25 },
              strokeWidth: { duration: 0.3, ease: EASE },
            }}
            onPointerEnter={() => setHot(s.i)}
            className="cursor-pointer"
          />
        ))}
        {segs
          .filter((s) => s.frac >= 0.05)
          .map((s) => (
            <motion.g
              key={s.label}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: inView || reduce ? (hot === null || hot === s.i ? 1 : 0.3) : 0 }}
              transition={{ duration: 0.4, delay: hot === null && inView ? 0.7 + s.i * 0.1 : 0 }}
            >
              <polyline
                points={`${s.p1.join(",")} ${s.p2.join(",")} ${s.p3.join(",")}`}
                fill="none"
                stroke="rgba(13,60,38,0.35)"
                strokeWidth={1}
              />
              <text
                x={s.p3[0] + (s.right ? 5 : -5)}
                y={s.p3[1]}
                dominantBaseline="middle"
                textAnchor={s.right ? "start" : "end"}
                fontSize={12}
                fontWeight={600}
                fill="#0D3C26"
                className="num"
              >
                {(s.frac * 100).toFixed(0)}%
              </text>
            </motion.g>
          ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={24} fontWeight={600} fill="#0D3C26" className="num">
          {fmt(focus ? focus.value : total, breakdown.format)}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize={10.5} fill="#5E7466">
          {focus ? focus.label : breakdown.centerLabel}
        </text>
      </svg>

      <ul className="mt-3 grid gap-0.5">
        {segs.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              onPointerEnter={() => setHot(s.i)}
              onPointerLeave={() => setHot(null)}
              onFocus={() => setHot(s.i)}
              onBlur={() => setHot(null)}
              className={cn(
                "flex w-full cursor-default items-center gap-2.5 px-2 py-1.5 text-left text-[12.5px] transition-colors duration-200",
                hot === s.i ? "bg-raised text-fg" : "text-fg/75",
              )}
            >
              <i className="size-2.5 shrink-0" style={{ background: s.color }} />
              {s.label}
              <span className="num ml-auto text-muted">{(s.frac * 100).toFixed(1)}%</span>
              <b className="num w-14 text-right font-medium text-fg">{fmt(s.value, breakdown.format)}</b>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Ranked list with group tabs ---------- */

export function Segments({ query }: { query: string }) {
  const [group, setGroup] = useState("All");
  const q = query.trim().toLowerCase();
  const max = Math.max(...segments.items.map((s) => s.value), 1);
  const rows = segments.items
    .filter((s) => group === "All" || s.group === group)
    .filter((s) => !q || `${s.name} ${s.detail} ${s.group}`.toLowerCase().includes(q))
    .sort((a, b) => b.value - a.value);

  return (
    <Panel
      title={segments.title}
      action={
        <Tabs
          label="Filter by group"
          value={group}
          onChange={setGroup}
          options={["All", ...segments.groups].map((g) => ({ value: g, label: g }))}
        />
      }
    >
      <div className="grid gap-2">
        {rows.map((s, i) => (
          <div
            key={`${group}-${s.code}`}
            className="group grid animate-fade-up grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 border border-line bg-fg/[0.015] px-3.5 pb-2.5 pt-3 transition-colors duration-300 hover:border-line-2 hover:bg-fg/[0.04]"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <span className="grid size-9 place-items-center border border-line bg-frame text-[11px] font-semibold tracking-wide text-fg/80 transition-colors duration-300 group-hover:border-clay/40 group-hover:text-clay">
              {s.code}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-medium text-fg">{s.name}</span>
              <span className="block truncate text-[11.5px] text-muted">{s.detail}</span>
            </span>
            <span className="text-right">
              <span className="num block text-[13.5px] font-semibold text-fg">{fmt(s.value, segments.format)}</span>
              <span className={cn("num block text-[11px]", s.change >= 0 ? "text-sage" : "text-clay")}>
                {signed(s.change)}
              </span>
            </span>
            <span className="col-span-3 mt-2.5 block h-[3px] bg-fg/[0.07]">
              <motion.span
                className="block h-full bg-clay"
                initial={{ width: 0 }}
                animate={{ width: `${(s.value / max) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: EASE }}
              />
            </span>
          </div>
        ))}
        {!rows.length && (
          <p className="border border-dashed border-line px-4 py-6 text-center text-[12.5px] text-muted">
            Nothing matches “{query}”.
          </p>
        )}
      </div>
    </Panel>
  );
}

/* ---------- Targets ---------- */

export function evaluateTargets() {
  return targets.map((t) => {
    const met = t.rule === "atLeast" ? t.value >= t.target : t.value <= t.target;
    const fill = t.rule === "atLeast" ? t.value / t.target : t.target / Math.max(t.value, 1e-9);
    const gap = Math.abs(t.target - t.value);
    const gapText =
      t.format === "percent" ? `${gap.toFixed(1)} pts` : fmt(gap, t.format, "decimals" in t ? t.decimals : undefined);
    return { ...t, met, fill: Math.min(Math.max(fill, 0), 1), gapText };
  });
}

export function Targets() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const rows = evaluateTargets();
  const met = rows.filter((r) => r.met).length;
  const misses = rows.filter((r) => !r.met).sort((a, b) => b.fill - a.fill);
  const msg =
    met === rows.length
      ? "Every target is met. The story now is how far past them we can go, and at what cost."
      : `${misses[0].label} is the closest miss, ${misses[0].gapText} away from target.` +
        (misses.length > 1 ? ` ${misses.length - 1} more still to close.` : "");

  return (
    <Panel
      title="Targets"
      action={
        <span
          className={cn(
            "num px-2.5 py-1 text-[11px] font-semibold",
            met === rows.length ? "bg-sage/15 text-sage" : "bg-clay/15 text-clay",
          )}
        >
          {met} of {rows.length} met
        </span>
      }
    >
      <div ref={ref} className="grid gap-4">
        {rows.map((r, i) => (
          <div key={r.label} className="grid gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-[12.5px] text-fg/80">
              <span className="flex items-center gap-2">
                <i className={cn("size-1.5", r.met ? "bg-sage" : "bg-clay")} />
                {r.label}
              </span>
              <span className="num whitespace-nowrap">
                <b className="font-semibold text-fg">{fmt(r.value, r.format, "decimals" in r ? r.decimals : undefined)}</b>
                <span className="ml-1.5 text-[11.5px] text-faint">
                  {r.rule === "atLeast" ? "≥" : "≤"} {fmt(r.target, r.format, "decimals" in r ? r.decimals : undefined)}
                </span>
              </span>
            </div>
            <div className="relative h-1.5 bg-fg/[0.08]">
              <motion.div
                className={cn("absolute inset-y-0 left-0", r.met ? "bg-sage" : "bg-clay")}
                initial={{ width: 0 }}
                animate={{ width: inView ? `${r.fill * 100}%` : 0 }}
                transition={{ duration: 1, delay: 0.15 + i * 0.1, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 border-l-2 border-clay bg-frame px-4 py-3 text-[12.5px] leading-relaxed text-fg/80">{msg}</p>
    </Panel>
  );
}

/* ---------- Data view: waste vs hunger, ranked boxes + column charts ---------- */

const FLAGS = { IN, KE, CA, GB };
/** Series colours for the two columns (validated as a pair; every bar is direct-labelled). */
export const SERIES = { waste: PALETTE[0], hunger: "#2F7A4F" };
const CHART_H = 180;

const ordinal = (n: number) => (n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th");

function FlagIcon({ code, className }: { code: Flag; className?: string }) {
  const F = FLAGS[code];
  return <F aria-hidden className={cn("h-[14px] w-[21px] shrink-0 shadow-[0_0_0_1px_rgba(13,60,38,0.14)]", className)} />;
}

function RankBox({ data, color }: { data: Ranking; color: string }) {
  const reduce = useReducedMotion();
  const max = Math.max(...data.rows.map((r) => r.value ?? 0));
  const rows = data.rows.map((r, i) => ({ ...r, rank: r.value === null ? null : i + 1 }));
  return (
    <section className="flex min-w-0 flex-col rounded-2xl! border border-line bg-card p-5 sm:p-6">
      {/* Rows spread to fill the box so both boxes line up. */}
      <ol className="m-0 flex flex-1 list-none flex-col justify-between gap-5 p-0">
        {rows.map((r) => (
          <li key={r.country} className="flex items-center gap-4">
            <span
              className={cn(
                "num grid size-12 shrink-0 place-items-center rounded-full! border text-[15px] font-semibold leading-none",
                r.rank === 1 ? "border-transparent text-card" : "border-line-2 bg-frame text-fg",
                r.rank === null && "border-dashed bg-transparent text-faint",
              )}
              style={r.rank === 1 ? { background: color } : undefined}
            >
              {r.rank === null ? (
                "–"
              ) : (
                <span>
                  {r.rank}
                  <sup className="ml-px text-[9px] font-medium">{ordinal(r.rank)}</sup>
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2.5 text-[14px] font-medium text-fg">
                  <FlagIcon code={r.flag} />
                  <span className="truncate">{r.country}</span>
                </span>
                {r.value === null ? (
                  <span className="whitespace-nowrap text-[12.5px] text-faint">{data.missing}</span>
                ) : (
                  <span className="num whitespace-nowrap text-[14px] font-semibold text-fg">{fmt(r.value, data.format)}</span>
                )}
              </div>
              <div className="mt-2 h-1.5 bg-fg/[0.07]">
                {r.value !== null && (
                  <motion.div
                    className="h-full origin-left"
                    style={{ width: `${(r.value / max) * 100}%`, background: color }}
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.1 + (r.rank ?? 0) * 0.07 }}
                  />
                )}
              </div>
              {r.share !== undefined && <div className="num mt-1.5 text-[11.5px] text-muted">{r.share.toFixed(1)}% of population</div>}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6 border-l-2 pl-3" style={{ borderColor: color }}>
        <p className="text-[13px] font-medium leading-snug text-fg text-pretty">{data.conclusion}</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-faint text-pretty">{data.footnote}</p>
      </div>
    </section>
  );
}

export function ColumnChart({ data, color }: { data: Ranking; color: string }) {
  const reduce = useReducedMotion();
  const max = Math.max(...data.rows.map((r) => r.value ?? 0));
  const cols = { gridTemplateColumns: `repeat(${data.rows.length}, minmax(0, 1fr))` };
  return (
    <figure className="m-0 min-w-0 rounded-2xl! border border-line bg-card p-5 sm:p-6">
      <figcaption className="text-[13.5px] font-semibold text-fg">
        {data.chartTitle} <span className="font-normal text-muted">· {data.unit}</span>
      </figcaption>
      <div className="mt-4 flex gap-2">
        <div className="flex w-4 shrink-0 items-center justify-center pb-12">
          <span className="-rotate-90 whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-faint">{data.unit}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="grid border-b border-l border-line-2" style={{ ...cols, height: CHART_H + 28 }}>
            {data.rows.map((r, i) => {
              const label = r.value === null ? (data.missing ?? "No data") : fmt(r.value, data.format);
              return (
                <div
                  key={r.country}
                  tabIndex={0}
                  aria-label={`${r.country}: ${label}${r.share !== undefined ? `, ${r.share.toFixed(1)}% of population` : ""}`}
                  className="group flex flex-col items-center justify-end outline-none"
                >
                  {/* Label, bar and tooltip move together so the tooltip sits on the bar. */}
                  <div className="relative flex flex-col items-center">
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 translate-y-1 whitespace-nowrap border border-line-2 bg-card px-2.5 py-1.5 text-[11.5px] opacity-0 shadow-[0_10px_24px_-12px_rgba(13,60,38,0.4)] transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-fg">
                        <FlagIcon code={r.flag} className="h-[10px] w-[15px]" />
                        {r.country}
                      </div>
                      <div className="num text-muted">
                        {r.value === null ? label : `${label} ${data.unit.toLowerCase()}`}
                        {r.share !== undefined && ` · ${r.share.toFixed(1)}%`}
                      </div>
                    </div>
                    <span className={cn("num mb-1.5 text-[11.5px] font-semibold", r.value === null ? "font-normal text-faint" : "text-fg")}>
                      {r.value === null ? "n/a" : label}
                    </span>
                    {r.value !== null && (
                      <motion.div
                        className="w-6 origin-bottom rounded-t-[4px]! transition-[filter] duration-200 group-hover:brightness-110 group-focus-visible:brightness-110"
                        style={{ height: Math.max((r.value / max) * CHART_H, 2), background: color }}
                        initial={reduce ? false : { scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.8, ease: EASE, delay: i * 0.07 }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid pt-2.5" style={cols}>
            {data.rows.map((r) => (
              <div key={r.country} className="flex flex-col items-center gap-1 text-[11.5px] text-muted">
                <FlagIcon code={r.flag} />
                {r.country}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center text-[10px] uppercase tracking-[0.16em] text-faint">Countries</div>
        </div>
      </div>
    </figure>
  );
}

export function DataView() {
  const cols = [
    { data: waste, color: SERIES.waste },
    { data: hunger, color: SERIES.hunger },
  ];
  return (
    // Subgrid keeps heading / box / chart rows level across both columns.
    <div className="grid gap-x-4 gap-y-8 xl:grid-cols-2 xl:grid-rows-[auto_1fr_auto]">
      {cols.map(({ data, color }) => (
        <div key={data.heading} className="grid min-w-0 gap-3 xl:row-span-3 xl:grid-rows-subgrid">
          <h3 className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-fg">
            <i className="size-2.5 rounded-full!" style={{ background: color }} />
            {data.heading}
            <span className="font-normal text-muted">({data.unit})</span>
          </h3>
          <RankBox data={data} color={color} />
          <ColumnChart data={data} color={color} />
        </div>
      ))}
      <div className="grid min-w-0 gap-3 xl:col-span-2">
        <h3 className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-fg">
          <i className="size-2.5 rounded-full!" style={{ background: SUPPLY.lost }} />
          {supplyChain.heading}
          <span className="font-normal text-muted">({supplyChain.unit})</span>
        </h3>
        <SupplyTable />
        <SupplyChart />
      </div>
      <div className="grid min-w-0 gap-3 xl:col-span-2">
        <h3 className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-fg">
          <i className="size-2.5 rounded-full!" style={{ background: SERIES.hunger }} />
          Country profile
          <span className="font-normal text-muted">(challenge workbook)</span>
        </h3>
        <CountryTable />
        <div className="grid gap-4 md:grid-cols-2">
          <RateBars title="Waste rate by product category" note="Sample volumes; not added to country totals." rows={categories.map((c) => ({ label: c.label, rate: c.rate, sub: `${fmt(c.volume)} t` }))} />
          <RateBars title="Waste rate by season" note="Aggregate rates, not split by country." rows={seasons.map((c) => ({ label: c.label, rate: c.rate }))} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Research paper data: country profile, rates, pilot plan ---------- */

function MiniRing({ pct, color, size = 34 }: { pct: number; color: string; size?: number }) {
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(13 60 38 / 0.09)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
    </svg>
  );
}

const tonnes = (v: number) => `${new Intl.NumberFormat("en-US").format(v)} t`;

export function CountryTable() {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl! border border-line bg-card">
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-fg text-card">
              {["Market", "Annual handled", "Waste rate", "Implied waste", "Forecast accuracy"].map((h, i) => (
                <th key={h} className={cn("px-5 py-3.5 text-[12px] font-semibold", i === 0 ? "text-left" : "text-right")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.country} className="border-b border-line transition-colors last:border-b-0 hover:bg-fg/[0.03]">
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2.5 font-medium text-fg">
                    <FlagIcon code={c.flag} />
                    {c.country}
                  </span>
                </td>
                <td className="num px-5 py-3 text-right text-fg/80">{tonnes(c.handled)}</td>
                <td className="px-5 py-3">
                  <span className="flex items-center justify-end gap-2.5">
                    <span className="num font-semibold text-fg">{c.rate}%</span>
                    <MiniRing pct={c.rate} color={PALETTE[0]} />
                  </span>
                </td>
                <td className="num px-5 py-3 text-right font-semibold text-fg">{tonnes(c.waste)}</td>
                <td className="px-5 py-3">
                  <span className="flex items-center justify-end gap-2.5">
                    <span className="num font-semibold text-fg">{c.accuracy}%</span>
                    <MiniRing pct={c.accuracy} color={SERIES.hunger} />
                  </span>
                </td>
              </tr>
            ))}
            <tr className="bg-frame/60">
              <td className="px-5 py-3 font-semibold text-fg">Total</td>
              <td className="num px-5 py-3 text-right font-semibold text-fg">{tonnes(countries.reduce((t, c) => t + c.handled, 0))}</td>
              <td className="px-5 py-3 text-right text-faint">—</td>
              <td className="num px-5 py-3 text-right font-semibold text-fg">{tonnes(countries.reduce((t, c) => t + c.waste, 0))}</td>
              <td className="px-5 py-3 text-right text-faint">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RateBars({ title, note, rows }: { title: string; note: string; rows: { label: string; rate: number; sub?: string }[] }) {
  const reduce = useReducedMotion();
  const max = Math.max(...rows.map((r) => r.rate));
  return (
    <section className="min-w-0 rounded-2xl! border border-line bg-card p-5 sm:p-6">
      <h4 className="text-[14px] font-semibold text-fg">{title}</h4>
      <p className="mt-0.5 text-[11.5px] text-faint">{note}</p>
      <ul className="m-0 mt-5 grid list-none gap-4 p-0">
        {rows.map((r, i) => (
          <li key={r.label}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="font-medium text-fg">
                {r.label}
                {r.sub && <span className="num ml-2 text-[11.5px] font-normal text-faint">{r.sub}</span>}
              </span>
              <span className="num font-semibold text-fg">{r.rate}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full! bg-fg/[0.07]">
              <motion.div
                className="h-full origin-left rounded-full!"
                style={{ width: `${(r.rate / max) * 100}%`, background: i === 0 ? PALETTE[0] : "rgb(13 60 38 / 0.75)" }}
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE, delay: i * 0.06 }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Overview: budget donut, pilot goal, 12-month plan and country strategies. */
export function PilotPlan() {
  const total = budget.reduce((t, b) => t + b.amount, 0);
  const size = 300;
  const stroke = 38;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  // Start offset of each arc = sum of the lengths before it.
  const lens = budget.map((b) => (b.amount / total) * c);
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((t, l) => t + l, 0));
  // Sequential emerald ramp, darkest = largest line.
  const shade = (i: number) => `rgb(13 60 38 / ${1 - i * 0.075})`;
  return (
    <div className="grid gap-4">
      <div className="grid gap-4">
        <section className="rounded-2xl! border border-line bg-card p-5 sm:p-8">
          <h4 className="text-center text-[18px] font-semibold text-fg">{budgetTitle.title}</h4>
          <p className="mt-1 text-center text-[12.5px] text-faint">{budgetTitle.note}</p>
          <div className="mt-7 grid gap-8">
            <div className="relative shrink-0 justify-self-center" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90" aria-hidden>
                {budget.map((b, i) => (
                  <circle key={b.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={i === 0 ? PALETTE[0] : shade(i)} strokeWidth={stroke} strokeDasharray={`${Math.max(lens[i] - 2, 0)} ${c}`} strokeDashoffset={-starts[i]} />
                ))}
              </svg>
              <div className="absolute inset-0 grid place-content-center text-center">
                <div className="num text-[36px] font-semibold tracking-tight text-fg">{budgetTitle.total}</div>
                <div className="text-[12px] text-faint">{budget.length} line items</div>
              </div>
            </div>
            <ul className="m-0 mx-auto grid w-full max-w-4xl list-none gap-x-10 gap-y-3 p-0 text-[13.5px] md:grid-cols-2">
              {budget.map((b, i) => (
                <li key={b.label} className="flex items-center gap-3 border-b border-line pb-2.5">
                  <i className="size-2.5 shrink-0 rounded-full!" style={{ background: i === 0 ? PALETTE[0] : shade(i) }} />
                  <span className="min-w-0 flex-1 text-fg/85">{b.label}</span>
                  <span className="num shrink-0 font-semibold text-fg">${fmt(b.amount / 1000)}K</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="flex flex-col rounded-2xl! bg-fg p-5 text-card sm:p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">First-year goal</div>
          <div className="mt-3 flex items-center gap-5">
            <span className="grid size-28 shrink-0 place-items-center rounded-full! border-[10px] border-clay/80">
              <span className="num text-[18px] font-semibold">{pilotGoal.range}</span>
            </span>
            <p className="text-[13.5px] leading-relaxed text-card/85">{pilotGoal.text}</p>
          </div>
          <p className="mt-auto border-t border-card/15 pt-4 text-[12.5px] text-card/70">{pilotGoal.example} A testable target, not a forecast.</p>
        </section>
      </div>

      <section className="rounded-2xl! border border-line bg-card p-5 sm:p-6">
        <h4 className="text-[14.5px] font-semibold text-fg">12-month plan and stage gates</h4>
        <ol className="m-0 mt-5 grid list-none gap-5 p-0 md:grid-cols-3 xl:grid-cols-6">
          {calendar.map((st, i) => (
            <li key={st.period} className="relative">
              {i < calendar.length - 1 && <span aria-hidden className="absolute left-12 right-0 top-5 hidden h-px bg-line-2 xl:block" />}
              <span className={cn("num grid size-10 place-items-center rounded-full! border text-[13px] font-semibold", i === 0 ? "border-transparent bg-clay text-card" : "border-line-2 bg-frame text-fg")}>
                {i + 1}
              </span>
              <div className="mt-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-clay">{st.period}</div>
              <p className="mt-1 text-[12.5px] leading-snug text-fg">{st.build}</p>
              <p className="mt-2 text-[11.5px] leading-snug text-faint">Gate: {st.gate}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl! border border-line bg-card p-5 sm:p-6">
        <h4 className="text-[14.5px] font-semibold text-fg">Country by country</h4>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {countries.map((c) => (
            <article key={c.country} className="flex flex-col rounded-xl! border border-line bg-frame/40 p-4">
              <div className="flex items-center gap-2.5">
                <FlagIcon code={c.flag} />
                <span className="text-[14px] font-semibold text-fg">{c.country}</span>
              </div>
              <div className="mt-2 text-[12.5px] font-medium leading-snug text-clay-deep">{c.focus}</div>
              <p className="mt-1.5 text-[12px] leading-snug text-muted">{c.diagnosis}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {c.lead.map((m) => (
                  <span key={m} className="rounded-full! border border-line-2 bg-card px-2 py-0.5 text-[10.5px] font-medium text-fg">
                    {m}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- Supply chain: Dataset 2 table + stacked columns ---------- */

/** Cell highlights exactly as marked on the dataset; no other cell is coloured. */
const HEAT: Record<Heat, string> = {
  red: "bg-[#d9432b] text-white",
  orange: "bg-[#f39a2e] text-[#2e1500]",
  yellow: "bg-[#f7d635] text-[#2b2400]",
};
const SUPPLY = { kept: "#B9CBBE", lost: PALETTE[0] };
const STAGE_COLS = [
  { key: "entering", label: "Food entering (t)" },
  { key: "lost", label: "Food lost (t)" },
  { key: "waste", label: "Waste (%)" },
] as const;

export function SupplyTable() {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl! border border-line bg-card">
      <div className="scroll-thin overflow-x-auto">
        {/* Spreadsheet grid: every cell ruled; marked cells filled edge to edge. */}
        <table className="w-full min-w-[560px] border-collapse border-hidden text-[13px]">
          <thead>
            <tr className="bg-fg text-card">
              <th className="border border-card/20 px-5 py-4 text-left text-[13.5px] font-semibold">Supply chain stage</th>
              {STAGE_COLS.map((c) => (
                <th key={c.key} className="border border-card/20 px-5 py-4 text-right text-[13.5px] font-semibold">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {supplyChain.rows.map((r) => (
              <tr key={r.stage} className="transition-colors hover:bg-fg/[0.03]">
                <td className="border border-fg/15 px-5 py-4 text-[15px] font-medium text-fg">{r.stage}</td>
                {STAGE_COLS.map((c) => {
                  const heat = r.mark[c.key];
                  return (
                    <td
                      key={c.key}
                      className={cn("num border border-fg/15 px-5 py-4 text-right text-[19px]", heat ? `${HEAT[heat]} font-bold` : "font-medium text-fg/80")}
                    >
                      {c.key === "waste" ? `${r.waste}%` : fmt(r[c.key])}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SupplyChart() {
  const reduce = useReducedMotion();
  const max = Math.max(...supplyChain.rows.map((r) => r.entering));
  const cols = { gridTemplateColumns: `repeat(${supplyChain.rows.length}, minmax(0, 1fr))` };
  const px = (v: number) => (v / max) * CHART_H;
  return (
    <figure className="m-0 min-w-0 rounded-2xl! border border-line bg-card p-5 sm:p-6">
      <figcaption className="flex flex-wrap items-start justify-between gap-3">
        <span>
          <span className="block text-[13.5px] font-semibold text-fg">{supplyChain.chartTitle}</span>
          <span className="text-[12px] text-muted">{supplyChain.caption}</span>
        </span>
        <span className="flex items-center gap-4 text-[11.5px] text-muted">
          <span className="flex items-center gap-1.5">
            <i className="size-2.5 rounded-full!" style={{ background: SUPPLY.kept }} /> Passed on
          </span>
          <span className="flex items-center gap-1.5">
            <i className="size-2.5 rounded-full!" style={{ background: SUPPLY.lost }} /> Lost
          </span>
        </span>
      </figcaption>
      <div className="mt-4 flex gap-2">
        <div className="flex w-4 shrink-0 items-center justify-center pb-14">
          <span className="-rotate-90 whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-faint">Tonnes</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="grid border-b border-l border-line-2" style={{ ...cols, height: CHART_H + 28 }}>
            {supplyChain.rows.map((r, i) => (
              <div
                key={r.stage}
                tabIndex={0}
                aria-label={`${r.stage}: ${fmt(r.entering)} t entering, ${fmt(r.lost)} t lost (${r.waste}%)`}
                className="group flex flex-col items-center justify-end outline-none"
              >
                <div className="relative flex flex-col items-center">
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 translate-y-1 whitespace-nowrap border border-line-2 bg-card px-2.5 py-1.5 text-[11.5px] opacity-0 shadow-[0_10px_24px_-12px_rgba(13,60,38,0.4)] transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                  >
                    <div className="font-semibold text-fg">{r.stage}</div>
                    <div className="num text-muted">
                      {fmt(r.entering)} t in · {fmt(r.lost)} t lost · {r.waste}%
                    </div>
                  </div>
                  <span className="num mb-1.5 text-[11.5px] font-semibold text-fg">{fmt(r.entering)}</span>
                  <motion.div
                    className="flex w-7 origin-bottom flex-col gap-[2px] group-hover:brightness-105"
                    initial={reduce ? false : { scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.8, ease: EASE, delay: i * 0.07 }}
                  >
                    <div className="rounded-t-[4px]!" style={{ height: px(r.lost), background: SUPPLY.lost }} />
                    <div style={{ height: px(r.entering - r.lost) - 2, background: SUPPLY.kept }} />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid pt-2.5" style={cols}>
            {supplyChain.rows.map((r) => (
              <div key={r.stage} className="flex flex-col items-center px-0.5 text-center text-[11.5px] leading-tight">
                <span className="text-fg/80">{r.short}</span>
                <span className="num mt-0.5 text-faint">−{r.lost} t</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-center text-[10px] uppercase tracking-[0.16em] text-faint">Supply chain stage</div>
        </div>
      </div>
    </figure>
  );
}

/* ---------- Overview: NEXUS Harvest Lifeline pitch, in circles ---------- */

function Ring({ pct, color, size = 112, stroke = 9, children }: { pct: number; color: string; size?: number; stroke?: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(13 60 38 / 0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? c * (1 - pct / 100) : c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 1.2, ease: EASE }}
        />
      </svg>
      <div className="relative text-center">{children}</div>
    </div>
  );
}

const Badge = ({ children, solid }: { children: ReactNode; solid?: boolean }) => (
  <span
    className={cn(
      "num grid size-10 shrink-0 place-items-center rounded-full! border text-[14px] font-semibold",
      solid ? "border-transparent bg-clay text-card" : "border-line-2 bg-frame text-fg",
    )}
  >
    {children}
  </span>
);

export function Lifeline() {
  const L = lifeline;
  return (
    <div className="grid gap-4">
      {/* Pitch */}
      <section className="relative overflow-hidden rounded-2xl! bg-fg px-6 py-7 text-card sm:px-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full! border-[28px] border-clay/25" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 right-28 size-40 rounded-full! border-[18px] border-card/10" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">
            <Sparkles className="size-3.5" /> Our recommendation
          </div>
          <h3 className="mt-3 text-[clamp(1.5rem,3vw,2.1rem)] font-semibold leading-tight tracking-tight">{L.name}</h3>
          <p className="mt-1 text-[15px] text-card/75">{L.tagline}</p>
          <blockquote className="m-0 mt-5 border-l-2 border-clay pl-4 text-[17px] font-medium italic leading-snug text-card/95">
            “{L.quote}”
          </blockquote>
          <p className="mt-5 text-[13.5px] leading-relaxed text-card/80 text-pretty">{L.pitch}</p>
        </div>
      </section>

      <ProblemStatement />

      {/* The case, in three rings */}
      <div className="grid gap-4 md:grid-cols-3">
        {L.stats.map((st, i) => (
          <div key={st.label} className="flex items-center gap-5 rounded-2xl! border border-line bg-card p-5">
            <Ring pct={st.pct} color={i === 0 ? PALETTE[0] : i === 1 ? SERIES.hunger : PALETTE[2]}>
              <div className="num text-[19px] font-semibold leading-none tracking-tight text-fg">{st.value}</div>
            </Ring>
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold leading-snug text-fg">{st.label}</div>
              <div className="mt-1 text-[11.5px] text-faint">{st.ring}</div>
            </div>
          </div>
        ))}
      </div>

      <WhoWeProtect />

      {/* Three capabilities */}
      <section className="rounded-2xl! border border-line bg-card p-5 sm:p-6">
        <h4 className="text-[14.5px] font-semibold text-fg">Three AI capabilities, one system</h4>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          {L.capabilities.map((c, i) => (
            <div key={c.title} className="flex flex-col items-center text-center">
              <Ring pct={100 * ((i + 1) / 3)} color={PALETTE[0]} size={84} stroke={7}>
                <span className="num text-[20px] font-semibold text-fg">{i + 1}</span>
              </Ring>
              <div className="mt-3 text-[14px] font-semibold text-fg">{c.title}</div>
              <p className="mt-1 max-w-[16rem] text-[12.5px] text-muted">{c.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 border-t border-line pt-4 text-[12.5px] leading-relaxed text-muted text-pretty">{L.approach}</p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Five solutions */}
        <section className="rounded-2xl! border border-line bg-card p-5 sm:p-6">
          <h4 className="text-[14.5px] font-semibold text-fg">The five solutions, by priority</h4>
          <ol className="m-0 mt-4 grid list-none gap-0 p-0">
            {L.solutions.map((s, i) => (
              <li key={s.name} className="flex items-center gap-4 border-b border-line py-3 last:border-b-0">
                <Badge solid={i === 0}>{i + 1}</Badge>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-fg">{s.name}</div>
                  <div className="text-[12.5px] text-muted">{s.problem}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Investment + rollout */}
        <section className="flex flex-col rounded-2xl! border border-line bg-card p-5 sm:p-6">
          <h4 className="text-[14.5px] font-semibold text-fg">Investment and rollout</h4>
          <div className="mt-4 flex items-center gap-4">
            <Ring pct={100} color={SERIES.hunger} size={96} stroke={8}>
              <span className="num text-[20px] font-semibold text-fg">{L.investment}</span>
            </Ring>
            <p className="text-[12.5px] leading-relaxed text-muted">The challenge's $1 million USD, invested in a measurable Indian pilot first.</p>
          </div>
          <ol className="m-0 mt-5 grid list-none gap-0 p-0">
            {L.rollout.map((r, i) => (
              <li key={r.step} className="relative flex items-center gap-3 pb-4 last:pb-0">
                {i < L.rollout.length - 1 && <span aria-hidden className="absolute left-5 top-10 h-[calc(100%-2.5rem)] w-px bg-line-2" />}
                <Badge solid={i === 0}>{i + 1}</Badge>
                <FlagIcon code={r.flag} />
                <div>
                  <div className="text-[13.5px] font-semibold text-fg">{r.step}</div>
                  <div className="text-[11.5px] text-faint">{r.note}</div>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-auto border-t border-line pt-4 text-[12px] leading-relaxed text-muted text-pretty">{L.angle}</p>
        </section>
      </div>
    </div>
  );
}

/* ---------- Pitch requirements: problem, stakeholders, human role, risk, phases ---------- */

/** Ruled, spreadsheet-style table used for the human-role and risk tables. */
function SheetTable({ head, rows, first }: { head: string[]; rows: string[][]; first?: "strong" }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl! border border-line bg-card">
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse border-hidden text-[13.5px]">
          <thead>
            <tr className="bg-fg text-card">
              {head.map((h) => (
                <th key={h} className="border border-card/20 px-5 py-4 text-left text-[13.5px] font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="transition-colors hover:bg-fg/[0.03]">
                {r.map((cell, i) => (
                  <td
                    key={i}
                    className={cn(
                      "border border-fg/15 px-5 py-4 align-top leading-snug",
                      i === 0 ? (first === "strong" ? "text-[15px] font-bold text-fg" : "font-semibold text-fg") : "text-fg/80",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProblemStatement() {
  const handled = countries.reduce((t, c) => t + c.handled, 0);
  const lost = countries.reduce((t, c) => t + c.waste, 0);
  const india = countries.find((c) => c.country === "India");
  const kenya = countries.find((c) => c.country === "Kenya");
  const tonnes = (v: number) => new Intl.NumberFormat("en-US").format(v);
  return (
    <section className="rounded-2xl! border border-line bg-card p-6 sm:p-8">
      <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-clay">The problem</div>
      <h3 className="mt-2 text-[clamp(1.4rem,2.6vw,1.9rem)] font-semibold leading-tight tracking-tight text-fg">{problem.title}</h3>
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid gap-3 text-[14px] leading-relaxed text-fg/85">
          <p className="m-0">
            Every year, NEXUS Foods handles <b className="num text-fg">{tonnes(handled)} tonnes</b> of food across {["one", "two", "three", "four", "five"][countries.length - 1] ?? countries.length} countries, yet{" "}
            <b className="num text-clay-deep">{tonnes(lost)} tonnes</b> are lost or wasted.
          </p>
          <p className="m-0">
            That is a <b className="num text-fg">{((lost / handled) * 100).toFixed(1)}%</b> overall waste rate, {problem.impact}
          </p>
          {india && kenya && (
            <p className="m-0">
              The problem is most severe in India, where <b className="num text-fg">{tonnes(india.waste)} tonnes</b> are wasted each year, and Kenya, where{" "}
              <b className="num text-fg">{kenya.rate}%</b> of food is lost or wasted.
            </p>
          )}
          <p className="m-0 text-muted">{problem.cause}</p>
        </div>
        <div className="flex flex-col justify-center rounded-2xl! bg-fg p-6 text-card">
          <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-clay">Our mission</div>
          <p className="mt-2 text-[16px] font-medium leading-snug">{problem.mission}</p>
        </div>
      </div>
    </section>
  );
}

export function WhoWeProtect() {
  return (
    <section className="rounded-2xl! border border-line bg-card p-6 sm:p-8">
      <h3 className="text-[22px] font-semibold tracking-tight text-fg">{stakeholders.title}</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stakeholders.cards.map((c) => (
          <article key={c.name} className="flex flex-col items-start rounded-xl! border border-line bg-frame/40 p-5">
            <span aria-hidden className="grid size-16 place-items-center rounded-full! bg-card text-[34px] leading-none shadow-[inset_0_0_0_1px_rgba(13,60,38,0.08)]">
              {c.icon}
            </span>
            <h4 className="mt-4 text-[17px] font-semibold text-fg">{c.name}</h4>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{c.body}</p>
          </article>
        ))}
      </div>
      <blockquote className="m-0 mt-6 border-l-2 border-clay pl-4 text-[16px] font-medium italic leading-snug text-fg">“{stakeholders.quote}”</blockquote>
    </section>
  );
}

export function HumanRole() {
  return (
    <section className="mt-4 grid gap-4">
      <h3 className="text-[22px] font-semibold tracking-tight text-fg">{humanRole.title}</h3>
      <SheetTable head={["AI system", "What AI recommends", "What humans decide"]} rows={humanRole.rows} first="strong" />
      <div className="rounded-2xl! bg-fg p-6 text-card sm:p-8">
        <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-clay">
          <Users className="size-4" /> Human in the loop
        </div>
        <div className="mt-3 grid max-w-3xl gap-2 text-[14.5px] leading-relaxed text-card/85">
          {humanRole.body.map((b, i) => (
            <p key={i} className={cn("m-0", i === 0 && "text-[17px] font-semibold text-card")}>
              {b}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RiskView() {
  const D = investmentDecision;
  return (
    <div className="grid gap-4">
      <SheetTable head={["Risk", "Potential consequence", "Our safeguard"]} rows={risks.rows} first="strong" />
      <blockquote className="m-0 rounded-2xl! border border-line bg-card p-6 text-[17px] font-medium italic leading-snug text-fg sm:p-8">
        <span className="mr-1 text-clay">“</span>
        {risks.quote}
        <span className="ml-1 text-clay">”</span>
      </blockquote>
      <section className="rounded-2xl! bg-fg p-6 text-card sm:p-8">
        <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-clay">Investment decision</div>
        <div className="mt-4 grid items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
          <span className="grid size-32 place-items-center rounded-full! border-[10px] border-clay/80">
            <span className="num text-[30px] font-semibold">{D.amount}</span>
          </span>
          <div>
            <h3 className="text-[20px] font-semibold">{D.title}</h3>
            <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-[14px] text-card/85 sm:grid-cols-2">
              {D.gates.map((g) => (
                <li key={g} className="flex items-start gap-2">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full! bg-clay" />
                  {g}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12.5px] text-card/60">Success gate for the India pilot. Scale only if it is met.</p>
          </div>
        </div>
        <blockquote className="m-0 mt-6 border-t border-card/15 pt-5 text-[17px] font-medium leading-snug text-card">“{D.quote}”</blockquote>
      </section>
    </div>
  );
}

export function Phases() {
  return (
    <section className="rounded-2xl! border border-line bg-card p-6 sm:p-8">
      <h3 className="text-[22px] font-semibold tracking-tight text-fg">Global adaptation: three phases</h3>
      <ol className="m-0 mt-5 grid list-none gap-4 p-0 lg:grid-cols-3">
        {phases.rows.map((ph, i) => (
          <li key={ph.phase} className="flex flex-col rounded-xl! border border-line bg-frame/40 p-5">
            <div className="flex items-center gap-3">
              <span className={cn("num grid size-11 shrink-0 place-items-center rounded-full! text-[15px] font-semibold", i === 0 ? "bg-clay text-card" : "border border-line-2 bg-card text-fg")}>
                {i + 1}
              </span>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-clay">{ph.phase}</div>
                <div className="flex items-center gap-2 text-[16px] font-semibold text-fg">
                  {ph.where}
                  {ph.flags.map((f) => (
                    <FlagIcon key={f} code={f} />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 text-[14px] font-semibold text-fg">{ph.title}</div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{ph.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[12.5px] text-faint">{phases.note}</p>
    </section>
  );
}

/* ---------- Headline facts (Overview, Insights, float bar) ---------- */

export function buildFacts() {
  const wasteTotal = waste.rows.reduce((t, r) => t + (r.value ?? 0), 0);
  const hungry = hunger.rows.filter((r) => r.value !== null);
  const hungerTotal = hungry.reduce((t, r) => t + (r.value ?? 0), 0);
  const topShare = [...hungry].sort((a, b) => (b.share ?? 0) - (a.share ?? 0))[0];
  const lost = supplyChain.rows.reduce((t, r) => t + r.lost, 0);
  const start = supplyChain.rows[0].entering;
  const worst = [...supplyChain.rows].sort((a, b) => b.waste - a.waste)[0];
  return [
    { label: `Food wasted · ${waste.rows.length} countries`, short: "Wasted", value: `${fmt(wasteTotal)} t`, note: `${waste.rows[0].country} alone: ${fmt(waste.rows[0].value ?? 0)} t`, icon: "leaf" as const },
    { label: "Undernourished people", short: "Hungry", value: fmt(hungerTotal, "compact"), note: `${topShare.country}: ${topShare.share?.toFixed(1)}% of population`, icon: "users" as const },
    { label: "Lost from farm to fork", short: "Lost", value: `${Math.round((lost / start) * 100)}%`, note: `${fmt(lost)} t of ${fmt(start)} t`, icon: "activity" as const },
    { label: "Leakiest stage", short: worst.short, value: `${worst.waste}%`, note: `${worst.stage}: ${worst.lost} t lost`, icon: "target" as const },
  ];
}

export function FactRow() {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {buildFacts().map((f, i) => {
        const Icon = ICONS[f.icon];
        return (
          <div key={f.label} className="group relative min-w-0 border border-line bg-card px-4 pb-3.5 pt-4 transition-colors duration-300 hover:border-line-2 hover:bg-white/60">
            <div className="truncate pr-9 text-xs text-muted sm:pr-12">{f.label}</div>
            <div className="num mt-1 whitespace-nowrap text-xl font-semibold tracking-tight text-fg sm:text-2xl">{f.value}</div>
            <div className="mt-1.5 truncate text-[11.5px] text-muted">{f.note}</div>
            <span className={cn("absolute right-3 top-3 grid size-7 place-items-center transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 sm:right-4 sm:top-4 sm:size-9", TONES[i % TONES.length])}>
              <Icon className="size-[17px]" strokeWidth={2} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Insights, derived from the data ---------- */

export function buildInsights() {
  const out: { tag: string; title: string; figure: string; body: string; tone: "good" | "bad" | "neutral" }[] = [];
  const [w1, w2] = waste.rows;
  const wasteTotal = waste.rows.reduce((t, r) => t + (r.value ?? 0), 0);
  out.push({
    tag: "Waste",
    title: `${w1.country} wastes the most food`,
    figure: `${fmt(w1.value ?? 0)} t`,
    body: `More than double ${w2.country} (${fmt(w2.value ?? 0)} t), the next highest. The ${waste.rows.length} countries waste ${fmt(wasteTotal)} t a year between them.`,
    tone: "bad",
  });
  const share = [...hunger.rows].sort((a, b) => (b.share ?? 0) - (a.share ?? 0))[0];
  const most = hunger.rows[0];
  out.push({
    tag: "Hunger",
    title: `${share.country} has the highest share of undernourished people`,
    figure: `${share.share?.toFixed(1)}%`,
    body: `${fmt(share.value ?? 0, "compact")} people. ${most.country} has the most people affected (${fmt(most.value ?? 0, "compact")}) because its population is much larger.`,
    tone: "bad",
  });
  if (w1.country === most.country)
    out.push({
      tag: "Overlap",
      title: `${w1.country} tops both lists`,
      figure: "1st · 1st",
      body: `The most food wasted and the most people undernourished, which makes ${w1.country} the clearest case for redirecting surplus food to people who need it.`,
      tone: "neutral",
    });
  const byRate = [...supplyChain.rows].sort((a, b) => b.waste - a.waste);
  const byLoss = [...supplyChain.rows].sort((a, b) => b.lost - a.lost);
  out.push({
    tag: "Supply chain",
    title: `${byRate[0].stage} are the leakiest stage`,
    figure: `${byRate[0].waste}%`,
    body: `${byLoss[0].lost} t lost at ${byLoss[0].short.toLowerCase()}, the most of any stage. ${byRate[1].stage} follow at ${byRate[1].waste}% (${byRate[1].lost} t).`,
    tone: "bad",
  });
  const lost = supplyChain.rows.reduce((t, r) => t + r.lost, 0);
  const start = supplyChain.rows[0].entering;
  out.push({
    tag: "Farm to fork",
    title: "Almost half the food never makes it",
    figure: `${Math.round((lost / start) * 100)}%`,
    body: `${fmt(lost)} t of the ${fmt(start)} t that enters production is lost along the way, from harvest through to consumers.`,
    tone: "bad",
  });
  const byAcc = [...countries].sort((a, b) => a.accuracy - b.accuracy);
  out.push({
    tag: "Forecasting",
    title: `${byAcc[0].country} has the weakest forecasts and the highest waste rate`,
    figure: `${byAcc[0].accuracy}%`,
    body: `Forecast accuracy runs from ${byAcc[0].accuracy}% in ${byAcc[0].country} to ${byAcc[byAcc.length - 1].accuracy}% in the ${byAcc[byAcc.length - 1].country}. Lower accuracy goes with higher waste, though weather and infrastructure may also explain it.`,
    tone: "neutral",
  });
  out.push({
    tag: "Season",
    title: `${seasons[0].label} is the worst time for waste`,
    figure: `${seasons[0].rate}%`,
    body: `Nearly three times the winter rate (${seasons[seasons.length - 1].rate}%). Fresh fruit is the riskiest category at ${categories[0].rate}%.`,
    tone: "bad",
  });
  return out;
}

export function NoteCard({ note, compact }: { note: { title: string; body: string }; compact?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl! bg-fg text-card", compact ? "px-5 py-5" : "px-6 py-6 sm:px-8")}>
      <div className="relative z-10 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">
        <Sparkles className="size-3.5" /> {note.title}
      </div>
      <p
        className={cn(
          "relative z-10 mt-3 max-w-3xl font-medium leading-snug tracking-tight text-pretty",
          compact ? "text-[15px]" : "text-lg sm:text-xl",
        )}
      >
        {note.body}
      </p>
    </div>
  );
}

export function Insights() {
  const items = useMemo(() => buildInsights(), []);
  return (
    <div className="grid gap-3">
      {notes.map((n) => (
        <NoteCard key={n.title} note={n} />
      ))}
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((it, i) => (
          <article
            key={it.tag}
            className={cn(
              "group animate-fade-up rounded-2xl! border border-line bg-card p-6 transition-colors duration-300 hover:border-line-2",
              items.length % 2 === 1 && i === items.length - 1 && "md:col-span-2",
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[19px] font-bold uppercase tracking-[0.08em] text-fg">
                <span className="mr-2.5 text-clay">{String(i + 1).padStart(2, "0")}</span>
                {it.tag}
              </span>
              <span
                className={cn(
                  "num rounded-full! px-3 py-1 text-[13px] font-semibold",
                  it.tone === "good" ? "bg-sage/15 text-sage" : it.tone === "bad" ? "bg-clay/15 text-clay" : "bg-fg/10 text-fg",
                )}
              >
                {it.figure}
              </span>
            </div>
            <h4 className="mt-3 text-[15px] font-semibold text-fg">{it.title}</h4>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{it.body}</p>
          </article>
        ))}
      </div>
      <h3 className="mt-4 text-[22px] font-semibold tracking-tight text-fg">How AI can cut the waste</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {aiPlays.map((p, i) => (
          <article
            key={p.title}
            className="animate-fade-up rounded-2xl! border border-line bg-card p-6 transition-colors duration-300 hover:border-line-2"
            style={{ animationDelay: `${(items.length + i) * 60}ms` }}
          >
            <span className="text-[19px] font-bold uppercase tracking-[0.08em] text-clay">AI {String(i + 1).padStart(2, "0")}</span>
            <h4 className="mt-2 text-[15px] font-semibold text-fg">{p.title}</h4>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{p.body}</p>
          </article>
        ))}
      </div>
      <HumanRole />
      <section className="mt-4 rounded-2xl! border border-line bg-card p-6 sm:p-8">
        <h3 className="text-[22px] font-semibold tracking-tight text-fg">Strategic partnership</h3>
        <ul className="m-0 mt-5 grid list-none gap-4 p-0 md:grid-cols-3">
          {partners.map((p) => (
            <li key={p.name} className="flex items-center gap-4 rounded-xl! border border-line bg-frame/40 p-4">
              {p.logo ? (
                <img src={celestialLogo} alt={`${p.name} logo`} className="size-20 shrink-0 rounded-full! object-cover shadow-[0_8px_20px_-10px_rgba(60,0,10,0.6)]" />
              ) : (
                p.flag && (
                  <span className="grid size-14 shrink-0 place-items-center rounded-full! bg-card shadow-[inset_0_0_0_1px_rgba(13,60,38,0.1)]">
                    <FlagIcon code={p.flag} className="h-[22px] w-[33px]" />
                  </span>
                )
              )}
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-snug text-fg">{p.name}</span>
                {p.org && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{p.org}</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
