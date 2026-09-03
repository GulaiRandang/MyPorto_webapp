"use client";

import { ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { topHoldings } from "@/lib/mock-data";
import { useQuotes } from "@/lib/market/use-quotes";

export function TopHoldingsCard() {
  const symbols = topHoldings.map((h) => h.ticker);
  const { data: quotes, isError } = useQuotes(symbols);
  const live = !!quotes && !isError;

  return (
    <section className="rounded-card border border-card-border bg-card card-shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Top Holdings
          </h2>
          {live && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-surface px-1.5 py-0.5 text-[10px] font-semibold text-success">
              <span className="size-1.5 rounded-full bg-success" />
              LIVE
            </span>
          )}
        </div>
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-muted-surface"
        >
          See all
          <ChevronRight className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>

      <ul className="mt-4">
        {topHoldings.map((h, i) => {
          const q = quotes?.[h.ticker.toUpperCase()];
          const value = q && q.price > 0 ? q.price * h.shares : h.marketValue;
          const pct = q?.changePct ?? 0;
          const up = pct >= 0;

          return (
            <li
              key={h.ticker}
              className={cn(
                "flex items-center gap-3 py-3.5",
                i !== 0 && "border-t border-hairline",
              )}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl text-[11px] font-bold tracking-tight",
                  h.accent,
                )}
              >
                {h.ticker.slice(0, 4)}
              </span>
              <div className="flex-1 leading-tight">
                <p className="text-sm font-semibold text-foreground">
                  {h.ticker}
                </p>
                <p className="text-xs text-muted-2">{h.shares} shares</p>
              </div>
              <div className="text-right leading-tight">
                <p className="text-sm font-bold text-foreground">
                  {formatCurrency(value)}
                </p>
                {q && q.price > 0 && (
                  <p
                    className={cn(
                      "flex items-center justify-end gap-0.5 text-xs font-medium",
                      up ? "text-success" : "text-danger",
                    )}
                  >
                    {up ? (
                      <ArrowUpRight className="size-3" strokeWidth={2.5} />
                    ) : (
                      <ArrowDownRight className="size-3" strokeWidth={2.5} />
                    )}
                    {formatPercent(Math.abs(pct))}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
