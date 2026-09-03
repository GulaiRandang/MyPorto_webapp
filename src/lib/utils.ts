import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD currency, matching the dashboard's `$12,345.67` style. */
export function formatCurrency(
  value: number,
  opts: { decimals?: number; sign?: boolean } = {},
) {
  const { decimals = 2, sign = false } = opts;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));

  if (sign) return `${value < 0 ? "−" : "+"}${formatted}`;
  return value < 0 ? `−${formatted}` : formatted;
}

/** Format a percentage like `16.8%`. */
export function formatPercent(value: number, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}
