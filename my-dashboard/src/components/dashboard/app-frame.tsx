import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, LayoutDashboard, RotateCcw, Search, Sparkles, Table2 } from "lucide-react";
import { Mark } from "./logo";
import { cn } from "@/lib/utils";
import { meta, notes } from "@/data/dashboard";
import { DataView, FactRow, Insights, Lifeline, NoteCard, PilotPlan, buildInsights } from "./widgets";
import type { View } from "./shell";

const NAV: { id: View; label: string; icon: typeof LayoutDashboard; count?: number }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "data", label: "Data", icon: Table2 },
  { id: "insights", label: "Insights", icon: Sparkles, count: buildInsights().length },
];

const HEAD: Record<View, [string, string]> = {
  overview: ["Overview", "Food waste, hunger and supply chain losses at a glance."],
  data: ["Data", "Food waste and hunger across four countries, side by side."],
  insights: ["Insights", "What the data says, and where AI can cut the waste."],
};

export function AppFrame({
  view,
  setView,
  query,
  setQuery,
  reset,
}: {
  view: View;
  setView: (v: View) => void;
  metric: string;
  setMetric: (m: string) => void;
  query: string;
  setQuery: (q: string) => void;
  reset: () => void;
}) {
  return (
    <div
      id="app"
      className="relative grid scroll-mt-20 border border-line-2 bg-frame shadow-[0_50px_120px_-50px_rgba(13,60,38,0.4)] lg:grid-cols-[232px_minmax(0,1fr)]"
    >
      {/* Sidebar */}
      <aside className="min-w-0 border-b border-line p-2.5 lg:border-b-0 lg:border-r lg:p-3">
        <div className="scroll-thin flex gap-1 overflow-x-auto lg:sticky lg:top-20 lg:grid lg:overflow-visible">
          <div className="mb-2 hidden items-center gap-2.5 border-b border-line px-2.5 pb-4 pt-2 text-[15px] font-semibold lg:flex">
            <Mark className="size-6" />
            {meta.product}
          </div>
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setView(n.id)}
              aria-current={view === n.id ? "page" : undefined}
              className={cn(
                "relative flex shrink-0 cursor-pointer items-center gap-3 border px-3 py-2.5 text-left text-[13.5px] whitespace-nowrap transition-colors duration-300",
                view === n.id
                  ? "border-line-2 bg-raised text-fg"
                  : "border-transparent text-fg/70 hover:bg-fg/[0.04] hover:text-fg",
              )}
            >
              {view === n.id && <motion.span layoutId="nav-bar" className="absolute inset-y-0 left-0 w-0.5 bg-clay" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
              <n.icon className="size-4 shrink-0 opacity-80" />
              {n.label}
              {n.count !== undefined && <span className="num ml-auto pl-2 text-[11px] text-faint">{n.count}</span>}
            </button>
          ))}
          <hr className="mx-1 my-2.5 hidden border-line lg:block" />
          <button
            type="button"
            onClick={reset}
            className="flex shrink-0 cursor-pointer items-center gap-3 border border-transparent px-3 py-2.5 text-[13.5px] whitespace-nowrap text-fg/70 transition-colors hover:bg-fg/[0.04] hover:text-fg"
          >
            <RotateCcw className="size-4 opacity-80" /> Reset view
          </button>
          <div className="mx-2.5 mt-4 hidden border-l-2 border-clay pl-3 text-[11.5px] leading-relaxed text-faint lg:block">
            <div className="text-fg/70">{meta.source}</div>
            Updated {meta.updated}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{HEAD[view][0]}</h2>
            <p className="mt-0.5 text-[12.5px] text-muted">{HEAD[view][1]}</p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <label className="flex h-9 min-w-0 flex-1 items-center gap-2 border border-line-2 bg-card px-3 text-muted transition-colors focus-within:border-clay/60 sm:w-60 sm:flex-none">
              <Search className="size-3.5 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={view === "data" ? "Search countries…" : "Search use cases, teams…"}
                aria-label="Search"
                className="w-full min-w-0 bg-transparent text-[12.5px] text-fg outline-none placeholder:text-faint"
              />
            </label>
            <button type="button" aria-label="Notifications" className="relative grid size-9 shrink-0 cursor-pointer place-items-center border border-line-2 bg-card text-fg/80 transition-colors hover:text-fg">
              <Bell className="size-4" />
              <i className="absolute right-1.5 top-1.5 size-1.5 bg-clay" />
            </button>
          </div>
        </div>

        {view !== "data" && <FactRow />}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === "overview" && (
              <div className="grid gap-4">
                <Lifeline />
                <PilotPlan />
                {notes[0] && <NoteCard note={notes[0]} compact />}
              </div>
            )}
            {view === "data" && <DataView query={query} />}
            {view === "insights" && <Insights />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
