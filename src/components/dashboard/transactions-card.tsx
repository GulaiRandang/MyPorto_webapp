import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { transactions, type Transaction } from "@/lib/mock-data";

function StatusPill({ status }: { status: Transaction["status"] }) {
  const filled = status === "Filled";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        filled
          ? "border-success-border bg-success-surface text-success"
          : "border-warning-border bg-warning-surface text-warning",
      )}
    >
      {status}
    </span>
  );
}

function TickerBadge({ txn }: { txn: Transaction }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-lg text-[10px] font-bold tracking-tight",
        txn.accent,
      )}
    >
      {txn.ticker.slice(0, 4)}
    </span>
  );
}

const pages = [1, 2, 3, "…", 66] as const;

export function TransactionsCard() {
  return (
    <section className="flex flex-col rounded-card border border-card-border bg-card card-shadow">
      <div className="flex items-center justify-between px-6 pb-2 pt-6">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Transaction History
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-muted-surface"
        >
          See all
          <ChevronRight className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="px-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-xs font-medium text-muted-2">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Asset</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr
                key={txn.id}
                className="border-t border-hairline text-sm transition-colors hover:bg-muted-surface/60"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium text-muted">
                  {txn.id}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <TickerBadge txn={txn} />
                    <div className="leading-tight">
                      <p className="font-semibold text-foreground">{txn.ticker}</p>
                      <p className="text-xs text-muted-2">
                        {txn.side} · {txn.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {txn.date}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={txn.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                  {formatCurrency(txn.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    aria-label="Row actions"
                    className="grid size-8 place-items-center rounded-lg text-muted-2 transition-colors hover:bg-muted-surface"
                  >
                    <MoreHorizontal className="size-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <button
          type="button"
          className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-muted-surface"
        >
          Prev
        </button>
        <div className="flex items-center gap-1.5">
          {pages.map((p, i) =>
            typeof p === "number" ? (
              <button
                key={p}
                type="button"
                className={cn(
                  "grid size-9 place-items-center rounded-lg text-sm font-medium transition-colors",
                  p === 2
                    ? "bg-brand text-white"
                    : "text-muted hover:bg-muted-surface",
                )}
              >
                {p}
              </button>
            ) : (
              <span
                key={`gap-${i}`}
                className="grid size-9 place-items-center text-sm text-muted-2"
              >
                {p}
              </span>
            ),
          )}
        </div>
        <button
          type="button"
          className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-muted-surface"
        >
          Next
        </button>
      </div>
    </section>
  );
}
