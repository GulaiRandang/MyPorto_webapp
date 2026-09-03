"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const ASSETS = [
  { id: "stocks", label: "Stocks", annualReturn: 0.09 },
  { id: "bonds", label: "Bonds", annualReturn: 0.04 },
  { id: "crypto", label: "Crypto", annualReturn: 0.2 },
] as const;

const YEARS = 10;

export function TimeMachineCard() {
  const [monthly, setMonthly] = useState(1400);
  const [selected, setSelected] = useState<string[]>(["stocks"]);

  const projected = useMemo(() => {
    const picks = ASSETS.filter((a) => selected.includes(a.id));
    if (picks.length === 0 || monthly <= 0) return 0;
    const annual =
      picks.reduce((sum, a) => sum + a.annualReturn, 0) / picks.length;
    const r = annual / 12;
    const n = YEARS * 12;
    // Future value of a monthly annuity
    const fv = monthly * ((Math.pow(1 + r, n) - 1) / r);
    return fv;
  }, [monthly, selected]);

  function toggle(id: string) {
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }

  return (
    <section className="rounded-card border border-card-border bg-card card-shadow p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Time Machine
        </h2>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-muted"
        >
          Invest Monthly
          <ChevronDown className="size-3.5 text-muted-2" strokeWidth={2.5} />
        </button>
      </div>

      <p className="mt-5 text-sm font-medium text-muted">
        Investment Value / Month
      </p>
      <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-card-border px-3.5 py-3">
        <Search className="size-4 text-muted-2" strokeWidth={2} />
        <span className="text-sm font-semibold text-foreground">$</span>
        <input
          value={monthly.toLocaleString("en-US")}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^0-9]/g, ""));
            setMonthly(Number.isFinite(n) ? n : 0);
          }}
          inputMode="numeric"
          className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-2"
        />
      </div>

      <p className="mt-5 text-sm font-medium text-muted">
        Which assets would you have invested in?
      </p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
        {ASSETS.map((a) => {
          const on = selected.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle(a.id)}
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <span
                className={cn(
                  "grid size-[18px] place-items-center rounded-md border transition-colors",
                  on
                    ? "border-brand bg-brand text-white"
                    : "border-border-strong bg-card",
                )}
              >
                {on && <Check className="size-3" strokeWidth={3} />}
              </span>
              {a.label}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-muted">
        So, your portfolio today would be worth
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
        {formatCurrency(projected)}
      </p>
    </section>
  );
}
