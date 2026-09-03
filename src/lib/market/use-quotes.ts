"use client";

import { useQuery } from "@tanstack/react-query";
import type { Quote } from "./types";

export type QuoteMap = Record<string, Quote>;

/** Polls live quotes for a set of symbols via /api/market/quote. */
export function useQuotes(symbols: string[]) {
  const key = [...new Set(symbols.map((s) => s.toUpperCase()))].sort();

  return useQuery<QuoteMap>({
    queryKey: ["quotes", key],
    enabled: key.length > 0,
    refetchInterval: 20_000,
    queryFn: async () => {
      const res = await fetch(
        `/api/market/quote?symbols=${encodeURIComponent(key.join(","))}`,
      );
      if (!res.ok) throw new Error(`quotes ${res.status}`);
      const json = (await res.json()) as { quotes: Quote[] };
      const map: QuoteMap = {};
      for (const q of json.quotes) map[q.symbol] = q;
      return map;
    },
  });
}
