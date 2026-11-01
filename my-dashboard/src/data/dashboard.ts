/**
 * ───────────────────────────────────────────────────────────────
 *  ALL DASHBOARD CONTENT LIVES HERE.
 *  Every number, label and chart on the page reads from this file.
 *  The values below are PLACEHOLDER sample data — replace them with
 *  the team's real data and the whole dashboard updates.
 * ───────────────────────────────────────────────────────────────
 */

import waste1 from "@/assets/intro/waste-1.jpg";
import waste2 from "@/assets/intro/waste-2.jpg";
import waste3 from "@/assets/intro/waste-3.jpg";
import waste4 from "@/assets/intro/waste-4.jpg";

export type Fmt ="number" | "compact" | "currency" | "percent";
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
  source: "NEXUS Foods datasets · World Bank / FAO 2024",
};

export const hero = {
  badge: "Every figure traces back to the NEXUS Foods datasets",
  badgeLink: "See the data",
  title: ["Every number that matters,", "in one clear view"],
  subtitle:
    "Food waste, hunger and supply chain losses across five countries, with the insights that follow from them.",
  cta: "Explore the dashboard",
};

/** The scroll intro: four images shown 2 × 2 once the wordmark zooms away. */
export const intro = {
  images: [
    {
      src: waste1,
      alt: "Quote by Pope Francis over a photo of vegetables: “Throwing away food is like stealing from the table of those who are poor and hungry.”",
    },
    {
      src: waste2,
      alt: "Two-part image: salad scraped into a bin, captioned “the food you waste”, above a hand holding out an empty bowl, captioned “can be someone’s meal”.",
    },
    {
      src: waste3,
      alt: "“Food is the largest single contributor to landfills” — 24% of landfill is food waste, shown as one clear bag of food scraps among black rubbish bags.",
    },
    {
      src: waste4,
      alt: "Illustration titled “Don’t waste food”: a well-fed man says “I can’t eat everything…” while a thin boy beside the same bin says “I can eat anything!”",
    },
  ],
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

export type Flag = "IN" | "BR" | "KE" | "CA" | "GB";

/** One column of the Data view: a ranked box of countries, with a column chart beneath it. */
export interface Ranking {
  heading: string;
  unit: string;
  chartTitle: string;
  format: Fmt;
  /** Ordered most to least; `value: null` = no figure for that country. */
  rows: { country: string; flag: Flag; value: number | null; share?: number }[];
  /** Tooltip / box text for a row with no value. */
  missing?: string;
  conclusion: string;
  footnote: string;
}

/** Data view, left: estimated food waste by country, most to least. */
export const waste: Ranking = {
  heading: "Waste",
  unit: "tonnes",
  chartTitle: "Estimated food waste per year",
  format: "number",
  rows: [
    { country: "India", flag: "IN", value: 18000 },
    { country: "Brazil", flag: "BR", value: 8400 },
    { country: "Kenya", flag: "KE", value: 4140 },
    { country: "Canada", flag: "CA", value: 3800 },
    { country: "UK", flag: "GB", value: 3000 },
  ],
  conclusion: "India produces the highest amount of food waste among these five countries, followed by Brazil.",
  footnote: "Calculation: annual food handled × food waste percentage.",
};

/** Data view, right: undernourished people by country, most to least. */
export const hunger: Ranking = {
  heading: "Hunger",
  unit: "People affected",
  chartTitle: "Undernourished people",
  format: "compact",
  rows: [
    { country: "India", flag: "IN", value: 175.7e6, share: 12.0 },
    { country: "Kenya", flag: "KE", value: 21.2e6, share: 36.8 },
    { country: "Brazil", flag: "BR", value: 6.4e6, share: 3.0 },
    { country: "Canada", flag: "CA", value: 1.2e6, share: 3.0 },
    { country: "UK", flag: "GB", value: null },
  ],
  missing: "Not included",
  conclusion:
    "Kenya has the highest share of undernourished people (36.8%), while India has the most people affected because its population is much larger.",
  footnote:
    "World Bank / FAO undernourishment data (2024), approximate. Undernourishment means insufficient regular dietary energy intake; it is not the same as everyone experiencing food insecurity.",
};

/** Data view, full width: Dataset 2, supply chain performance (tonnes). */
export type Heat = "red" | "orange" | "yellow";
export const supplyChain = {
  heading: "Supply chain",
  unit: "tonnes",
  chartTitle: "How food moves through the supply chain",
  caption: "From producers to consumers, and where waste occurs at each stage.",
  rows: [
    { stage: "Production and harvesting", short: "Production", entering: 1000, lost: 80, waste: 8, mark: { entering: "red", lost: "yellow" } },
    { stage: "Transportation", short: "Transport", entering: 920, lost: 40, waste: 4, mark: { entering: "orange" } },
    { stage: "Warehousing", short: "Warehousing", entering: 880, lost: 60, waste: 7, mark: { entering: "yellow" } },
    { stage: "Retail stores", short: "Retail", entering: 820, lost: 120, waste: 15, mark: { lost: "red", waste: "red" } },
    { stage: "Food service", short: "Food service", entering: 700, lost: 70, waste: 10, mark: { waste: "orange" } },
    { stage: "Consumers", short: "Consumers", entering: 630, lost: 90, waste: 14, mark: { lost: "orange", waste: "yellow" } },
  ] as { stage: string; short: string; entering: number; lost: number; waste: number; mark: Partial<Record<"entering" | "lost" | "waste", Heat>> }[],
};

/** Insights view: where AI can cut raw food waste across the supply chain. */
export const aiPlays = [
  {
    title: "Weather-aware demand forecasting",
    body: "AI can analyze historical sales alongside live weather data (monsoon rains, summer heatwaves) to lift demand prediction accuracy from low baselines like 67% in India and 61% in Kenya toward high-performing benchmarks.",
  },
  {
    title: "Real-time perishability tracking",
    body: "AI can track temperature, humidity and inventory velocity to monitor the exact shelf life of raw food, especially high-waste items like fresh fruit (24% waste) and vegetables (19% waste).",
  },
  {
    title: "Dynamic markdown and rescue routing",
    body: "Before produce spoils in retail stores (where waste peaks at 15%), AI can trigger price adjustments or alert community partners to rescue surplus food while it is still usable.",
  },
  {
    title: "Supply chain bottleneck optimization",
    body: "AI can weigh shifting variables across production, transportation (4% waste), warehousing (7% waste) and retail at once, in a way static spreadsheets never could.",
  },
];

/** Overview: the pitch. NEXUS Harvest Lifeline, one mission, three AI systems. */
export const lifeline = {
  name: "NEXUS Harvest Lifeline",
  tagline: "One mission. Three AI systems. Less food wasted.",
  quote: "The food isn't worthless. We're just running out of time to save it.",
  pitch:
    "An AI-powered system that predicts when raw food is at risk of being wasted and finds a better destination for it before it spoils.",
  stats: [
    { value: "18,000 t", label: "Estimated annual food waste in India", pct: 48, ring: "48% of the five-country total" },
    { value: "26%", label: "Waste rate during monsoon season", pct: 26, ring: "of food handled" },
    { value: "24%", label: "Fresh fruit waste rate", pct: 24, ring: "of fresh fruit" },
  ],
  capabilities: [
    { title: "AI demand forecasting", body: "Buy what will sell, not what might." },
    { title: "Freshness monitoring", body: "Know how long every batch has left." },
    { title: "Smart redistribution", body: "Send food where it will be used before it spoils." },
  ],
  approach:
    "Rather than an expensive overhaul or turning raw materials into processed products, it improves how NEXUS buys, stores, transports and redirects food.",
  solutions: [
    { name: "NEXUS DemandPulse", problem: "Inaccurate demand forecasts and excessive purchasing" },
    { name: "NEXUS FreshClock", problem: "Spoilage of fruits, vegetables and other perishables" },
    { name: "NEXUS StormSwitch", problem: "Monsoon disruption, delivery delays and transport losses" },
    { name: "NEXUS RescueMesh", problem: "Unsold food at retail and limited access for communities" },
    { name: "NEXUS FarmLink", problem: "Poor coordination between farmers, harvests and buyers" },
  ],
  investment: "$1M",
  rollout: [
    { step: "India", note: "Measurable pilot first", flag: "IN" as Flag },
    { step: "Kenya", note: "Next market", flag: "KE" as Flag },
    { step: "Brazil", note: "Then scale", flag: "BR" as Flag },
  ],
  angle:
    "Prevent waste before it happens, not just discount or donate food afterwards. Actual challenge data is kept separate from projected pilot results.",
};

/** Hand-written finding shown first in the Overview and Insights views. */
export const notes: { title: string; body: string }[] = [
  {
    title: "Recommendation",
    body: "Start at retail. It has the highest waste rate (15%) and the biggest loss (120 t) of any stage, and AI-led markdowns and rescue routing there would cut more waste than anywhere else in the chain.",
  },
];
