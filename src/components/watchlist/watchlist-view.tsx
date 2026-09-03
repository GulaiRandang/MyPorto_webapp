"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Loader2,
} from "lucide-react";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { useQuotes } from "@/lib/market/use-quotes";
import type { Plan } from "@/lib/plan";
import { addSymbol, removeSymbol } from "@/app/(app)/watchlists/actions";
import { AddSymbolInput } from "./add-symbol-input";

export function WatchlistView({
  plan,
  initialSymbols,
}: {
  plan: Plan;
  initialSymbols: string[];
}) {
  const router = useRouter();
  const [symbols, setSymbols] = useState(initialSymbols);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isPro = plan === "pro";

  const { data: quotes } = useQuotes(symbols);

  function handleAdd(symbol: string) {
    setError(null);
    // optimistic
    setSymbols((s) => (s.includes(symbol) ? s : [...s, symbol]));
    startTransition(async () => {
      const res = await addSymbol(symbol);
      if (!res.ok) {
        setSymbols((s) => s.filter((x) => x !== symbol));
        setError(
          res.error === "upgrade_required"
            ? "Saving to your watchlist is a Pro feature."
            : res.error,
        );
      } else {
        router.refresh();
      }
    });
  }

  function handleRemove(symbol: string) {
    setError(null);
    const prev = symbols;
    setSymbols((s) => s.filter((x) => x !== symbol));
    startTransition(async () => {
      const res = await removeSymbol(symbol);
      if (!res.ok) {
        setSymbols(prev);
        setError(res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Star className="size-5 text-muted-2" strokeWidth={2} />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            My Watchlist
          </h2>
          <span className="rounded-full bg-muted-surface px-2 py-0.5 text-xs font-semibold text-muted">
            {symbols.length}
          </span>
        </div>
        {pending && <Loader2 className="size-4 animate-spin text-muted-2" />}
      </div>

      {!isPro && (
        <div className="mt-5 flex items-start gap-3 rounded-card border border-card-border bg-card p-4 card-shadow">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted-surface text-muted-2">
            <Lock className="size-4" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Saving stocks is a Pro feature
            </p>
            <p className="mt-0.5 text-sm text-muted">
              Upgrade to MyPorto Pro ($20/mo) to build your watchlist and track
              live quotes.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Upgrade
          </Link>
        </div>
      )}

      {isPro && (
        <div className="mt-5">
          <AddSymbolInput onAdd={handleAdd} disabled={pending} />
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-danger-border bg-danger-surface px-3 py-2 text-xs font-medium text-danger">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-card border border-card-border bg-card card-shadow">
        {symbols.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-2">
            {isPro
              ? "No stocks yet — search above to add one."
              : "Your watchlist is empty."}
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-2">
                <th className="px-5 py-3 font-medium">Symbol</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Change</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {symbols.map((symbol) => {
                const q = quotes?.[symbol];
                const pct = q?.changePct ?? 0;
                const up = pct >= 0;
                return (
                  <tr
                    key={symbol}
                    className="border-t border-hairline text-sm"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-foreground">
                        {symbol}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {q && q.price > 0 ? formatCurrency(q.price) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {q && q.price > 0 ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 font-medium",
                            up ? "text-success" : "text-danger",
                          )}
                        >
                          {up ? (
                            <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
                          ) : (
                            <ArrowDownRight
                              className="size-3.5"
                              strokeWidth={2.5}
                            />
                          )}
                          {formatPercent(Math.abs(pct))}
                        </span>
                      ) : (
                        <span className="text-muted-2">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(symbol)}
                        disabled={pending}
                        aria-label={`Remove ${symbol}`}
                        className="grid size-8 place-items-center rounded-lg text-muted-2 transition-colors hover:bg-muted-surface hover:text-danger disabled:opacity-50"
                      >
                        <X className="size-4" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
