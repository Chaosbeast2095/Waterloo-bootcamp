import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
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
import { cn } from "@/lib/utils";
import { fmt, pctChange, signed } from "@/lib/format";
import {
  breakdown,
  compareLabel,
  kpis,
  notes,
  segments,
  table,
  targets,
  trend,
  type Fmt,
  type IconName,
  type Kpi,
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

/* ---------- Sortable table ---------- */

type Row = (typeof table.rows)[number];
const textKeys = table.columns.filter((c) => !c.format).map((c) => c.key);

export function DataTable({ query }: { query: string }) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: table.columns[2].key, dir: -1 });
  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const r = table.rows.filter(
      (row) => !q || textKeys.some((k) => String(row[k as keyof Row]).toLowerCase().includes(q)),
    );
    return [...r].sort((a, b) => {
      const av = a[sort.key as keyof Row];
      const bv = b[sort.key as keyof Row];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv)) * sort.dir;
    });
  }, [q, sort]);

  const maxOf = (k: string) => Math.max(...table.rows.map((r) => Number(r[k as keyof Row]) || 0));

  return (
    <Panel title={table.title} action={<span className="text-[11.5px] text-faint">{table.note}</span>}>
      <div className="scroll-thin -mx-5 overflow-x-auto px-5">
        <table className="w-full min-w-[680px] border-collapse text-[13px]">
          <thead>
            <tr>
              {table.columns.map((c, i) => {
                const on = sort.key === c.key;
                const Icon = !on ? ArrowUpDown : sort.dir === 1 ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={c.key}
                    aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                    className={cn("border-b border-line p-0 font-medium", i === 0 ? "text-left" : "text-right")}
                  >
                    <button
                      type="button"
                      onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key ? ((-s.dir) as 1 | -1) : -1 }))}
                      className={cn(
                        "inline-flex w-full cursor-pointer items-center gap-1.5 px-3.5 py-3 text-[11px] uppercase tracking-[0.08em] transition-colors",
                        i === 0 ? "justify-start" : "justify-end",
                        on ? "text-clay" : "text-faint hover:text-fg",
                      )}
                    >
                      {c.label}
                      <Icon className={cn("size-3", on ? "opacity-100" : "opacity-50")} />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row[table.columns[0].key as keyof Row])} className="transition-colors duration-200 hover:bg-fg/[0.03]">
                {table.columns.map((c, i) => {
                  const v = row[c.key as keyof Row];
                  if (!c.format)
                    return (
                      <td key={c.key} className="border-b border-line px-3.5 py-3 text-left font-medium text-fg">
                        {String(v)}
                      </td>
                    );
                  const n = Number(v);
                  const isSigned = "signed" in c && c.signed;
                  const top = !isSigned && n === maxOf(c.key);
                  return (
                    <td
                      key={c.key}
                      className={cn(
                        "num whitespace-nowrap border-b border-line px-3.5 py-3 text-right",
                        isSigned ? (n >= 0 ? "text-sage" : "text-clay") : top ? "text-fg" : "text-fg/70",
                        i === 0 && "text-left",
                      )}
                    >
                      {isSigned ? signed(n) : fmt(n, c.format, "decimals" in c ? c.decimals : undefined)}
                      {top && <i className="ml-1.5 inline-block size-1.5 -translate-y-px bg-clay align-middle" title="Highest" />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="py-8 text-center text-[12.5px] text-muted">Nothing matches “{query}”.</p>}
      </div>
    </Panel>
  );
}

/* ---------- Insights, derived from the data ---------- */

export function buildInsights() {
  const out: { tag: string; title: string; figure: string; body: string; tone: "good" | "bad" | "neutral" }[] = [];

  const movers = kpis
    .map((k) => ({ k, c: pctChange(k.value, k.previous) }))
    .sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
  if (movers[0]) {
    const { k, c } = movers[0];
    const good = k.goodWhen === "down" ? c < 0 : c > 0;
    out.push({
      tag: "Biggest mover",
      title: k.label,
      figure: signed(c),
      body: `${k.label} moved from ${fmt(k.previous, k.format, k.decimals)} to ${fmt(k.value, k.format, k.decimals)} ${compareLabel}, the largest swing of any headline measure.`,
      tone: good ? "good" : "bad",
    });
  }

  const m0 = trend.metrics[0];
  const key = m0.series[0].key;
  const vals = trend.rows.map((r) => Number(r[key as keyof (typeof trend.rows)[number]]));
  if (vals.length > 1) {
    const g = pctChange(vals[vals.length - 1], vals[0]);
    let best = 1;
    for (let i = 2; i < vals.length; i++) if (vals[i] - vals[i - 1] > vals[best] - vals[best - 1]) best = i;
    const idx = (i: number) => String(trend.rows[i][trend.index as keyof (typeof trend.rows)[number]]);
    out.push({
      tag: "Trend",
      title: m0.label,
      figure: signed(g, 0),
      body: `From ${fmt(vals[0], m0.format)} in ${idx(0)} to ${fmt(vals[vals.length - 1], m0.format)} in ${idx(vals.length - 1)}. The biggest single jump came in ${idx(best)} (+${fmt(vals[best] - vals[best - 1], m0.format)}).`,
      tone: g >= 0 ? "good" : "bad",
    });
  }

  const segTotal = segments.items.reduce((a, b) => a + b.value, 0) || 1;
  const top = [...segments.items].sort((a, b) => b.value - a.value)[0];
  const fastest = [...segments.items].sort((a, b) => b.change - a.change)[0];
  if (top)
    out.push({
      tag: "Leader",
      title: top.name,
      figure: `${((top.value / segTotal) * 100).toFixed(0)}%`,
      body: `${top.name} carries the largest share of volume. ${fastest && fastest !== top ? `${fastest.name} is growing fastest at ${signed(fastest.change)}.` : "It is also the fastest grower."}`,
      tone: "neutral",
    });

  const t = evaluateTargets();
  const missed = t.filter((x) => !x.met);
  out.push({
    tag: "Targets",
    title: missed.length ? `${missed.length} target${missed.length > 1 ? "s" : ""} still open` : "All targets met",
    figure: `${t.length - missed.length}/${t.length}`,
    body: missed.length
      ? missed.map((x) => `${x.label}: ${x.gapText} to go`).join(" · ")
      : "Every target set in the brief is met by the current numbers.",
    tone: missed.length ? "bad" : "good",
  });

  const falling = segments.items.filter((s) => s.change < 0);
  if (falling.length)
    out.push({
      tag: "Watch",
      title: falling.map((s) => s.name).join(", "),
      figure: signed(Math.min(...falling.map((s) => s.change))),
      body: `${falling.length === 1 ? "This is the only line" : "These are the only lines"} shrinking ${compareLabel}. Worth a closer look before scaling further.`,
      tone: "bad",
    });

  return out;
}

export function NoteCard({ note, compact }: { note: { title: string; body: string }; compact?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden bg-fg text-card", compact ? "px-5 py-5" : "px-6 py-6 sm:px-8")}>
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
              "group animate-fade-up border border-line bg-card p-5 transition-colors duration-300 hover:border-line-2",
              items.length % 2 === 1 && i === items.length - 1 && "md:col-span-2",
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                <span className="mr-2 text-clay">{String(i + 1).padStart(2, "0")}</span>
                {it.tag}
              </span>
              <span
                className={cn(
                  "num px-2 py-0.5 text-[12px] font-semibold",
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
    </div>
  );
}
