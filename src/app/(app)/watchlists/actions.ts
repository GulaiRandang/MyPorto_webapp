"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPlan } from "@/lib/plan";
import { getOrCreateWatchlistId } from "@/lib/watchlist";

export type ActionResult = { ok: true } | { ok: false; error: string };

const SYMBOL_RE = /^[A-Z][A-Z0-9.\-]{0,14}$/;

export async function addSymbol(symbolRaw: string): Promise<ActionResult> {
  const symbol = symbolRaw.trim().toUpperCase();
  if (!SYMBOL_RE.test(symbol)) {
    return { ok: false, error: "That doesn't look like a valid ticker." };
  }

  if ((await getPlan()) !== "pro") {
    return { ok: false, error: "upgrade_required" };
  }

  const supabase = await createClient();
  const watchlistId = await getOrCreateWatchlistId();

  const { error } = await supabase
    .from("watchlist_items")
    .insert({ watchlist_id: watchlistId, symbol });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: `${symbol} is already on your watchlist.` };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/watchlists");
  return { ok: true };
}

export async function removeSymbol(symbolRaw: string): Promise<ActionResult> {
  const symbol = symbolRaw.trim().toUpperCase();
  const supabase = await createClient();
  const watchlistId = await getOrCreateWatchlistId();

  const { error } = await supabase
    .from("watchlist_items")
    .delete()
    .eq("watchlist_id", watchlistId)
    .eq("symbol", symbol);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/watchlists");
  return { ok: true };
}
