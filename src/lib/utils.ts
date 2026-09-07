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

/**
 * Sanitises a post-login `?next=` value: only same-origin, absolute paths are
 * allowed. Rejects `//host`, `/\host`, and anything with a scheme so a crafted
 * link can't bounce a signed-in user to an external site.
 */
export function safeNext(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (!value) return fallback;
  if (value[0] !== "/") return fallback;
  if (value[1] === "/" || value[1] === "\\") return fallback;
  return value;
}
