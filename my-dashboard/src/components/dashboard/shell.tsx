import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Menu, Thermometer, TrendingUp, Truck, X } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { hero, intro, meta, mission } from "@/data/dashboard";
import { buildFacts } from "./widgets";

export type View = "overview" | "data" | "insights";

export const VIEWS: { id: View; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "data", label: "Data" },
  { id: "insights", label: "Insights" },
];

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export function Wordmark({ className }: { className?: string }) {
  return <Logo className={cn("w-[104px]", className)} title={meta.product} />;
}

/* ---------- Navigation (from the SaaS template) ---------- */

export function Navigation({
  view,
  go,
  reset,
}: {
  view: View;
  go: (v: View) => void;
  reset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const link = (v: (typeof VIEWS)[number], mobile = false) => (
    <a
      key={v.id}
      href="#app"
      onClick={(e) => {
        e.preventDefault();
        go(v.id);
        setOpen(false);
      }}
      className={cn(
        "text-[13.5px] transition-colors duration-300",
        mobile && "py-2",
        view === v.id ? "text-fg" : "text-fg/55 hover:text-fg",
      )}
    >
      {v.label}
    </a>
  );
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-page/80 backdrop-blur-md">
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#top" className="text-fg">
          <Wordmark />
        </a>
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex">
          {VIEWS.map((v) => link(v))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={reset}
            className="h-10 cursor-pointer px-4 text-[13.5px] font-medium text-fg transition-colors hover:bg-fg/[0.07]"
          >
            Reset view
          </button>
          <a
            href="#app"
            onClick={(e) => {
              e.preventDefault();
              go("overview");
            }}
            className="inline-flex h-10 items-center bg-fg px-5 text-[13.5px] font-medium text-card transition-colors hover:bg-fg-2"
          >
            Open dashboard
          </a>
        </div>
        <button
          type="button"
          className="cursor-pointer p-1.5 text-fg md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {open && (
        <div className="animate-slide-down border-t border-line bg-page/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-2 px-6 py-4">
            {VIEWS.map((v) => link(v, true))}
            <div className="mt-2 flex gap-2 border-t border-line pt-4">
              <button type="button" onClick={reset} className="h-10 flex-1 border border-line-2 text-[13.5px]">
                Reset view
              </button>
              <a
                href="#app"
                onClick={(e) => {
                  e.preventDefault();
                  go("overview");
                  setOpen(false);
                }}
                className="inline-flex h-10 flex-1 items-center justify-center bg-fg text-[13.5px] font-medium text-card"
              >
                Open dashboard
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Scroll-zoom intro: the wordmark, then a 2 × 2 image grid ---------- */

export function ScrollIntro() {
  const reduce = useReducedMotion();
  const sec = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const gallery = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLElement | null)[]>([]);
  const hint = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const s = sec.current;
      if (!s || !title.current || !gallery.current || !hint.current || !grid.current) return;
      const span = Math.max(s.offsetHeight - window.innerHeight, 1);
      const p = clamp(-s.getBoundingClientRect().top / span);
      const a = clamp(p / 0.55);
      title.current.style.transform = `scale(${1 + a * a * 4.2})`;
      title.current.style.opacity = String(1 - clamp((p - 0.2) / 0.28));
      gallery.current.style.visibility = p > 0.4 ? "visible" : "hidden";
      // Tiles rise in one after another, reading order.
      tiles.current.forEach((t, i) => {
        if (!t) return;
        const b = clamp((p - 0.4 - i * 0.05) / 0.26);
        t.style.opacity = String(b);
        t.style.transform = `translateY(${(1 - b) * 36}px)`;
      });
      hint.current.style.opacity = String(1 - clamp(p / 0.08));
      grid.current.style.transform = `scale(${1 + p * 0.25})`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <section ref={sec} id="top" aria-label="Headline" className={cn("relative", reduce ? "" : "h-[260vh]")}>
      <div
        className={cn(
          "isolate grid place-items-center overflow-hidden",
          reduce ? "gap-16 px-4 pb-16 pt-36" : "sticky top-0 h-svh",
        )}
      >
        <div ref={grid} aria-hidden className="grid-bg pointer-events-none absolute -inset-10 -z-10 will-change-transform" />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[70vmin] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(226,114,91,0.14),transparent)]"
        />
        <h1 ref={title} className="m-0 flex origin-[50%_50%] flex-col items-center text-fg will-change-[transform,opacity]">
          <Logo className="w-[min(82vw,1080px)]" title={meta.product} />
          <span className="mt-[clamp(1rem,3vw,2rem)] text-center font-display text-[clamp(1.05rem,2.6vw,1.9rem)] font-medium tracking-[-0.01em] text-fg/80">
            {meta.tagline}
          </span>
        </h1>

        <div
          ref={gallery}
          className={cn("grid place-items-center px-4", reduce ? "relative w-full" : "invisible absolute inset-0 pt-16")}
        >
          {/* Images keep their own shape; each is capped at half the free height so both rows fit under the nav. */}
          <div className="grid w-[min(100%,76rem)] grid-cols-2 place-items-center gap-x-[clamp(1rem,9vw,9rem)] gap-y-[clamp(1rem,4svh,2.5rem)]">
            {intro.images.map((img, i) => (
              <figure
                key={img.src}
                ref={(el) => {
                  tiles.current[i] = el;
                }}
                className={cn("m-0", !reduce && "opacity-0 will-change-[transform,opacity]")}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  decoding="async"
                  className="block max-h-[calc((100svh_-_11rem)/2)] w-auto max-w-full"
                />
              </figure>
            ))}
          </div>
        </div>

        {!reduce && (
          <div ref={hint} className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[10.5px] uppercase tracking-[0.3em] text-fg/50">
            Scroll
            <span className="relative block h-10 w-px overflow-hidden bg-fg/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-clay" />
            </span>
            <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Mission + solutions, straight after the intro images ---------- */

const MISSION_ICONS = { forecast: TrendingUp, fresh: Thermometer, route: Truck };

export function Mission() {
  return (
    <section aria-labelledby="mission" className="mx-auto grid max-w-5xl gap-16 px-4 pb-8 pt-24 sm:px-6">
      <div>
        <h2 id="mission" className="text-grad text-center text-[clamp(2rem,4.6vw,3.25rem)] font-medium tracking-[-0.04em]">
          Our mission
        </h2>
        <ul className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-2">
          {mission.points.map((p) => (
            <li key={p.text} className="flex items-center gap-5 rounded-2xl! border border-line bg-card p-6">
              <span aria-hidden className="grid size-20 shrink-0 place-items-center rounded-full! bg-raised/70 text-[42px] leading-none shadow-[inset_0_0_0_1px_rgba(13,60,38,0.08)]">
                {p.icon}
              </span>
              <span className="text-[clamp(1.1rem,2vw,1.35rem)] font-semibold leading-snug tracking-tight text-fg">{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-grad text-center text-[clamp(2rem,4.6vw,3.25rem)] font-medium tracking-[-0.04em]">Solutions</h2>
        <ul className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-3">
          {mission.solutions.map((p, i) => {
            const Icon = MISSION_ICONS[p.icon];
            return (
              <li key={p.title} className="flex flex-col items-center rounded-2xl! border border-line bg-card p-6 text-center">
                <span className="relative grid size-16 place-items-center rounded-full! bg-fg text-card">
                  <Icon className="size-7" strokeWidth={1.8} />
                  <span className="num absolute -right-1 -top-1 grid size-6 place-items-center rounded-full! bg-clay text-[11px] font-semibold text-card">
                    {i + 1}
                  </span>
                </span>
                <span className="mt-4 text-[16px] font-semibold text-fg">{p.title}</span>
                <span className="mt-1 text-[13px] text-muted">{p.body}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Hero (from the SaaS template) wrapping the live app ---------- */

export function Hero({ go, children }: { go: (v: View) => void; children: ReactNode }) {
  return (
    <section className="relative flex flex-col items-center px-4 pb-28 pt-24 sm:px-6">
      <aside className="mb-8 inline-flex max-w-full flex-wrap items-center justify-center gap-2 border border-line-2 bg-card/60 px-4 py-2 text-xs text-muted backdrop-blur-sm">
        <span className="inline-block size-1.5 animate-pulse bg-clay" />
        <span className="text-center">{hero.badge}</span>
        <a
          href="#app"
          onClick={(e) => {
            e.preventDefault();
            go("data");
          }}
          className="inline-flex items-center gap-1 whitespace-nowrap text-fg/80 transition-colors hover:text-fg"
        >
          {hero.badgeLink} <ArrowRight size={12} />
        </a>
      </aside>
      <h2 className="text-grad mb-6 max-w-3xl text-center text-[clamp(2.25rem,5.4vw,3.75rem)] font-medium leading-[1.12] tracking-[-0.05em] text-balance">
        {hero.title[0]}
        <br />
        {hero.title[1]}
      </h2>
      <p className="mb-10 max-w-2xl text-center text-[15px] text-muted text-pretty">{hero.subtitle}</p>
      <a
        href="#app"
        onClick={(e) => {
          e.preventDefault();
          go("overview");
        }}
        className="relative z-10 inline-flex h-12 items-center gap-2 bg-gradient-to-b from-fg via-fg/95 to-fg/70 px-8 text-[15px] font-medium text-card transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        {hero.cta} <ArrowRight size={16} />
      </a>

      <div className="relative mt-16 w-full max-w-[1260px]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-12%] h-[70%] w-[95%] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_45%_at_50%_50%,rgba(226,114,91,0.22),rgba(13,60,38,0.10)_45%,transparent_72%)]"
        />
        {children}
      </div>
    </section>
  );
}

/* ---------- Floating status bar ---------- */

export function FloatBar({ go }: { go: (v: View) => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const app = document.getElementById("app");
      const foot = document.getElementById("footer");
      const past = window.scrollY > window.innerHeight * 1.9;
      const r = app?.getBoundingClientRect();
      const vh = window.innerHeight;
      // Only while the dashboard itself is out of view, so it never covers a chart.
      const away = r ? r.top > vh * 0.92 || r.bottom < vh * 0.4 : true;
      const atFoot = foot ? foot.getBoundingClientRect().top < vh : false;
      setShow(past && away && !atFoot);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed bottom-[calc(18px+env(safe-area-inset-bottom,0px))] left-1/2 z-40 flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-1 border border-line-2 bg-frame/90 py-1.5 pl-4 pr-1.5 shadow-[0_18px_40px_-16px_rgba(13,60,38,0.45)] backdrop-blur-xl transition-[transform,opacity] duration-700 ease-out-expo",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[150%] opacity-0",
      )}
    >
      {buildFacts().slice(0, 3).map((f, i) => (
        <span key={f.label} className={cn("flex items-center gap-2 whitespace-nowrap pr-4 text-[12.5px] text-muted", i === 2 && "max-[420px]:hidden")}>
          <i className="size-1.5 bg-clay" />
          <span className="max-sm:hidden">{f.short}</span>
          <b className="num font-semibold text-fg">{f.value}</b>
        </span>
      ))}
      <a
        href="#app"
        tabIndex={show ? 0 : -1}
        onClick={(e) => {
          e.preventDefault();
          go("overview");
        }}
        className="inline-flex h-9 items-center bg-fg px-4 text-[12.5px] font-medium text-card transition-colors hover:bg-fg-2"
      >
        Open dashboard
      </a>
    </div>
  );
}

/* ---------- Footer (the alabaster band) ---------- */

export function Footer() {
  return (
    <footer id="footer" className="bg-fg text-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo className="w-[min(70vw,300px)] text-card" title={meta.product} />
          <p className="mt-4 max-w-sm text-[13px] text-card/70">{meta.product} · built for the competition brief.</p>
        </div>
        <div className="text-[12.5px]">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-card/50">Source</div>
          <p className="text-card/80">{meta.source}</p>
        </div>
        <div className="text-[12.5px]">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-card/50">Updated</div>
          <p className="text-card/80">{meta.updated}</p>
        </div>
      </div>
      <div className="h-2 bg-clay" />
    </footer>
  );
}
