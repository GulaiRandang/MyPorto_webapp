import { Info, ArrowUpRight, ArrowDownRight, Calendar, ChevronDown } from "lucide-react";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import type { StatCard as StatCardData } from "@/lib/mock-data";

export function StatCard({ stat }: { stat: StatCardData }) {
  const up = stat.trend === "up";

  return (
    <div className="rounded-card border border-card-border bg-card card-shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted">
          {stat.label}
          <Info className="size-3.5 text-muted-2" strokeWidth={2} />
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-card-border px-2.5 py-1.5 text-xs font-medium text-muted"
        >
          <Calendar className="size-3.5 text-muted-2" strokeWidth={2} />
          July 16
          <ChevronDown className="size-3.5 text-muted-2" strokeWidth={2.5} />
        </button>
      </div>

      <p className="mt-4 text-[32px] font-bold leading-none tracking-tight text-foreground">
        {formatCurrency(stat.value)}
      </p>

      <div className="mt-4 flex items-center gap-2.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
            up
              ? "bg-success-surface text-success"
              : "bg-danger-surface text-danger",
          )}
        >
          {up ? (
            <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
          ) : (
            <ArrowDownRight className="size-3.5" strokeWidth={2.5} />
          )}
          {formatPercent(stat.changePct)}
        </span>
        <span className="text-xs text-muted-2">{stat.caption}</span>
      </div>
    </div>
  );
}
