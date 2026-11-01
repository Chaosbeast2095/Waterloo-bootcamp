/**
 * ───────────────────────────────────────────────────────────────
 *  ALL DASHBOARD CONTENT LIVES HERE.
 *  Every number, label and chart on the page reads from this file.
 *  The values below are PLACEHOLDER sample data — replace them with
 *  the team's real data and the whole dashboard updates.
 * ───────────────────────────────────────────────────────────────
 */

export type Fmt = "number" | "compact" | "currency" | "percent";
export type IconName =
  | "users"
  | "zap"
  | "clock"
  | "target"
  | "wallet"
  | "gauge"
  | "leaf"
  | "sparkles"
  | "bot"
  | "activity";

export const meta = {
  wordmark: "NEXUS",
  product: "Nexus",
  currency: "INR",
  updated: "1 Nov 2026",
  source: "Team dataset · Jan – Dec 2026",
};

export const hero = {
  badge: "Live model · every figure traces back to the team dataset",
  badgeLink: "See the data",
  title: ["Every number that matters,", "in one clear view"],
  subtitle:
    "One view of adoption, accuracy, cost and time saved across every team, with the targets we were set and the insights that follow from them.",
  cta: "Explore the dashboard",
};

/** The scroll intro: kicker line plus the three headline KPIs (first three below). */
export const intro = {
  kicker: "12 months · 6 teams · 1 question",
  note: "Are we on track to hit every target?",
};

export interface Kpi {
  label: string;
  value: number;
  /** Previous period, used for the change line. */
  previous: number;
  format: Fmt;
  icon: IconName;
  /** "down" for metrics where lower is better (cost, errors, time). */
  goodWhen?: "up" | "down";
  decimals?: number;
}

export const compareLabel = "vs last month";

export const kpis: Kpi[] = [
  { label: "Active users", value: 12480, previous: 11130, format: "number", icon: "users" },
  { label: "Tasks automated", value: 86200, previous: 74900, format: "compact", icon: "zap" },
  { label: "Hours saved", value: 4310, previous: 3880, format: "number", icon: "clock" },
  { label: "Cost per task", value: 4.6, previous: 5.1, format: "currency", icon: "wallet", goodWhen: "down", decimals: 2 },
];

/** Monthly rows for the line chart. Add or rename columns freely. */
export const trend = {
  title: "Monthly performance",
  index: "month",
  rows: [
    { month: "Jan", tasks: 21400, tasksPlan: 24000, users: 3900, accuracy: 86.1, accuracyGoal: 95, cost: 9.8, costGoal: 4 },
    { month: "Feb", tasks: 26800, tasksPlan: 30000, users: 4700, accuracy: 87.4, accuracyGoal: 95, cost: 9.1, costGoal: 4 },
    { month: "Mar", tasks: 31200, tasksPlan: 36000, users: 5600, accuracy: 88.0, accuracyGoal: 95, cost: 8.4, costGoal: 4 },
    { month: "Apr", tasks: 38900, tasksPlan: 42000, users: 6400, accuracy: 89.6, accuracyGoal: 95, cost: 7.6, costGoal: 4 },
    { month: "May", tasks: 44100, tasksPlan: 48000, users: 7300, accuracy: 90.2, accuracyGoal: 95, cost: 7.0, costGoal: 4 },
    { month: "Jun", tasks: 49800, tasksPlan: 54000, users: 8100, accuracy: 91.1, accuracyGoal: 95, cost: 6.5, costGoal: 4 },
    { month: "Jul", tasks: 57300, tasksPlan: 60000, users: 8900, accuracy: 91.8, accuracyGoal: 95, cost: 6.1, costGoal: 4 },
    { month: "Aug", tasks: 61900, tasksPlan: 66000, users: 9600, accuracy: 92.5, accuracyGoal: 95, cost: 5.7, costGoal: 4 },
    { month: "Sep", tasks: 66400, tasksPlan: 72000, users: 10300, accuracy: 93.0, accuracyGoal: 95, cost: 5.4, costGoal: 4 },
    { month: "Oct", tasks: 74900, tasksPlan: 78000, users: 11130, accuracy: 93.6, accuracyGoal: 95, cost: 5.1, costGoal: 4 },
    { month: "Nov", tasks: 80300, tasksPlan: 84000, users: 11800, accuracy: 94.0, accuracyGoal: 95, cost: 4.8, costGoal: 4 },
    { month: "Dec", tasks: 86200, tasksPlan: 90000, users: 12480, accuracy: 94.2, accuracyGoal: 95, cost: 4.6, costGoal: 4 },
  ],
  /** Each entry is one choice in the chart's metric picker. */
  metrics: [
    {
      id: "tasks",
      label: "Tasks automated",
      description: "Actual vs plan, per month",
      format: "compact" as Fmt,
      series: [
        { key: "tasks", label: "Actual" },
        { key: "tasksPlan", label: "Plan" },
      ],
    },
    {
      id: "accuracy",
      label: "Accuracy",
      description: "Share of AI answers accepted without edits",
      format: "percent" as Fmt,
      yMin: 80,
      yMax: 100,
      series: [
        { key: "accuracy", label: "Accuracy" },
        { key: "accuracyGoal", label: "Goal" },
      ],
    },
    {
      id: "cost",
      label: "Cost per task",
      description: "Model + review cost per automated task",
      format: "currency" as Fmt,
      decimals: 2,
      goodWhen: "down" as const,
      series: [
        { key: "cost", label: "Cost per task" },
        { key: "costGoal", label: "Goal" },
      ],
    },
    {
      id: "users",
      label: "Active users",
      description: "People using the assistant each month",
      format: "compact" as Fmt,
      series: [{ key: "users", label: "Active users" }],
    },
  ],
};

/** Donut: parts of a whole. */
export const breakdown = {
  title: "Where the work goes",
  centerLabel: "tasks in Dec",
  format: "compact" as Fmt,
  items: [
    { label: "Customer support", value: 36200 },
    { label: "Sales ops", value: 19800 },
    { label: "Finance", value: 16400 },
    { label: "HR & internal", value: 13800 },
  ],
};

/** Ranked list with filter tabs (by group). */
export const segments = {
  title: "Use cases",
  groups: ["Customer", "Internal"],
  format: "compact" as Fmt,
  items: [
    { code: "CS", name: "Ticket triage", group: "Customer", detail: "Support · 94% routed correctly", value: 24100, change: 18.2 },
    { code: "RP", name: "Reply drafting", group: "Customer", detail: "Support · 71% sent unedited", value: 12100, change: 9.4 },
    { code: "LQ", name: "Lead qualification", group: "Customer", detail: "Sales · 3.1× faster first touch", value: 19800, change: 26.5 },
    { code: "IN", name: "Invoice matching", group: "Internal", detail: "Finance · 2 min → 9 sec", value: 16400, change: 12.0 },
    { code: "HR", name: "Policy Q&A", group: "Internal", detail: "HR · 1,900 questions / week", value: 8300, change: -4.1 },
    { code: "ON", name: "Onboarding guides", group: "Internal", detail: "HR · 140 new joiners", value: 5500, change: 6.8 },
  ],
};

/** Targets panel: value vs target. "atLeast" = higher is better, "atMost" = lower is better. */
export const targets = [
  { label: "Tasks automated / month", value: 86200, target: 90000, rule: "atLeast" as const, format: "compact" as Fmt },
  { label: "Accuracy", value: 94.2, target: 95, rule: "atLeast" as const, format: "percent" as Fmt },
  { label: "Cost per task", value: 4.6, target: 5, rule: "atMost" as const, format: "currency" as Fmt, decimals: 2 },
  { label: "Hours saved / month", value: 4310, target: 4000, rule: "atLeast" as const, format: "number" as Fmt },
];

/** Full data table (Data view). Columns are sortable. */
export const table = {
  title: "Team by team",
  note: "December 2026 · click a column to sort",
  columns: [
    { key: "team", label: "Team" },
    { key: "users", label: "Users", format: "number" as Fmt },
    { key: "tasks", label: "Tasks", format: "number" as Fmt },
    { key: "accuracy", label: "Accuracy", format: "percent" as Fmt },
    { key: "hours", label: "Hours saved", format: "number" as Fmt },
    { key: "cost", label: "Cost / task", format: "currency" as Fmt, decimals: 2 },
    { key: "change", label: "MoM", format: "percent" as Fmt, signed: true },
  ],
  rows: [
    { team: "Customer support", users: 4620, tasks: 36200, accuracy: 95.1, hours: 1820, cost: 3.9, change: 14.6 },
    { team: "Sales ops", users: 2740, tasks: 19800, accuracy: 93.8, hours: 960, cost: 4.4, change: 26.5 },
    { team: "Finance", users: 1560, tasks: 16400, accuracy: 96.3, hours: 840, cost: 4.1, change: 12.0 },
    { team: "HR & internal", users: 3560, tasks: 13800, accuracy: 91.2, hours: 690, cost: 6.2, change: 0.7 },
  ],
};

/** Optional hand-written findings shown first in the Insights view. */
export const notes: { title: string; body: string }[] = [
  {
    title: "Recommendation",
    body: "Scale reply drafting only after accuracy clears 95%. Every point below that adds review time, which is where most of the cost per task comes from.",
  },
];
