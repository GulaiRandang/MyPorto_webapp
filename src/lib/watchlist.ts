import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface WatchlistItem {
  id: string;
  symbol: string;
  sort_order: number;
  created_at: string;
}

/** Returns the current user's default watchlist id, creating it if missing. */
export async function getOrCreateWatchlistId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const { data: existing } = await supabase
    .from("watchlists")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("watchlists")
    .insert({ user_id: user.id, name: "My Watchlist" })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

export async function getWatchlistItems(): Promise<WatchlistItem[]> {
  const supabase = await createClient();
  const watchlistId = await getOrCreateWatchlistId();
  const { data, error } = await supabase
    .from("watchlist_items")
    .select("id, symbol, sort_order, created_at")
    .eq("watchlist_id", watchlistId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
