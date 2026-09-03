import { Calendar } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { TransactionsCard } from "@/components/dashboard/transactions-card";
import { TopHoldingsCard } from "@/components/dashboard/top-holdings-card";
import { TimeMachineCard } from "@/components/dashboard/time-machine-card";
import { getUser } from "@/lib/auth";
import { stats } from "@/lib/mock-data";

function firstNameFrom(user: Awaited<ReturnType<typeof getUser>>) {
  const full =
    (user?.user_metadata?.full_name as string | undefined)?.trim() || "";
  if (full) return full.split(/\s+/)[0];
  const local = user?.email?.split("@")[0] ?? "there";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default async function DashboardPage() {
  const user = await getUser();
  const firstName = firstNameFrom(user);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      {/* Welcome */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[26px] font-bold tracking-tight text-foreground">
          Welcome back, {firstName} <span aria-hidden>🔥</span>
        </h2>
        <div className="flex items-center gap-2 rounded-xl border border-card-border bg-card px-3.5 py-2 text-sm font-medium text-muted">
          <Calendar className="size-4 text-muted-2" strokeWidth={2} />
          {today}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Main grid */}
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TransactionsCard />
        </div>
        <div className="flex flex-col gap-5">
          <TopHoldingsCard />
          <TimeMachineCard />
        </div>
      </div>
    </>
  );
}
