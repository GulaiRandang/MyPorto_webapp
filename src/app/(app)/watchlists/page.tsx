import type { Metadata } from "next";
import { WatchlistView } from "@/components/watchlist/watchlist-view";
import { getWatchlistItems } from "@/lib/watchlist";
import { getPlan } from "@/lib/plan";

export const metadata: Metadata = { title: "Watchlist — MyPorto" };

export default async function WatchlistsPage() {
  const [items, plan] = await Promise.all([getWatchlistItems(), getPlan()]);

  return (
    <WatchlistView
      plan={plan}
      initialSymbols={items.map((i) => i.symbol)}
    />
  );
}
