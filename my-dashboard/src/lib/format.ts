import { meta, type Fmt } from "@/data/dashboard";

const locale = meta.currency === "INR" ? "en-IN" : "en-US";

/** One formatter for every number on the page. */
export function fmt(v: number, format: Fmt = "number", decimals?: number) {
  if (format === "currency")
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: meta.currency,
      maximumFractionDigits: decimals ?? 0,
      minimumFractionDigits: decimals ?? 0,
    }).format(v);
  if (format === "percent") return `${v.toFixed(decimals ?? 1)}%`;
  if (format === "compact")
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: decimals ?? 1,
    }).format(v);
  return new Intl.NumberFormat(locale, { maximumFractionDigits: decimals ?? 0 }).format(v);
}

export const pctChange = (now: number, before: number) =>
  before === 0 ? 0 : ((now - before) / Math.abs(before)) * 100;

export const signed = (v: number, d = 1) =>
  `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}%`;
