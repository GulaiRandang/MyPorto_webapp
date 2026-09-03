import "server-only";
import { serverEnv } from "@/lib/env";
import { cached } from "./cache";
import type {
  Quote,
  SymbolSearchResult,
  CompanyProfile,
  NewsArticle,
  Candles,
} from "./types";

const BASE = "https://finnhub.io/api/v1";

export class FinnhubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "FinnhubError";
  }
}

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("token", serverEnv.finnhubApiKey);

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    // We do our own caching; don't let the platform cache the keyed URL.
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new FinnhubError(
      `Finnhub ${path} -> ${res.status} ${res.statusText} ${body.slice(0, 200)}`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

// --- Quote -----------------------------------------------------------------

interface RawQuote {
  c: number;
  d: number | null;
  dp: number | null;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export function getQuote(symbol: string): Promise<Quote> {
  const sym = symbol.toUpperCase();
  return cached(`quote:${sym}`, 15, async () => {
    const q = await get<RawQuote>("/quote", { symbol: sym });
    return {
      symbol: sym,
      price: q.c,
      change: q.d ?? 0,
      changePct: q.dp ?? 0,
      high: q.h,
      low: q.l,
      open: q.o,
      prevClose: q.pc,
      time: q.t,
    } satisfies Quote;
  });
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()))].slice(0, 25);
  const settled = await Promise.allSettled(unique.map((s) => getQuote(s)));
  return settled
    .filter((r): r is PromiseFulfilledResult<Quote> => r.status === "fulfilled")
    .map((r) => r.value);
}

// --- Search --------------------------------------------------------------

interface RawSearch {
  count: number;
  result: {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }[];
}

export function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  const q = query.trim();
  if (!q) return Promise.resolve([]);
  return cached(`search:${q.toLowerCase()}`, 60 * 60, async () => {
    const data = await get<RawSearch>("/search", { q });
    return (data.result ?? [])
      .filter((r) => r.type === "Common Stock" || r.type === "ETP" || !r.type)
      .filter((r) => !r.symbol.includes("."))
      .slice(0, 12)
      .map((r) => ({
        symbol: r.symbol,
        displaySymbol: r.displaySymbol,
        description: r.description,
        type: r.type,
      }));
  });
}

// --- Profile -----------------------------------------------------------

interface RawProfile {
  name?: string;
  ticker?: string;
  exchange?: string;
  finnhubIndustry?: string;
  logo?: string;
  marketCapitalization?: number;
  currency?: string;
  weburl?: string;
  ipo?: string;
  country?: string;
}

export function getProfile(symbol: string): Promise<CompanyProfile> {
  const sym = symbol.toUpperCase();
  return cached(`profile:${sym}`, 24 * 60 * 60, async () => {
    const p = await get<RawProfile>("/stock/profile2", { symbol: sym });
    return {
      symbol: sym,
      name: p.name ?? sym,
      exchange: p.exchange ?? null,
      industry: p.finnhubIndustry ?? null,
      logo: p.logo ?? null,
      marketCap: p.marketCapitalization ?? null,
      currency: p.currency ?? null,
      weburl: p.weburl ?? null,
      ipo: p.ipo ?? null,
      country: p.country ?? null,
    } satisfies CompanyProfile;
  });
}

// --- News --------------------------------------------------------------

interface RawNews {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image?: string;
  datetime: number;
  related?: string;
}

function normaliseNews(items: RawNews[]): NewsArticle[] {
  return items
    .filter((n) => n.headline && n.url)
    .slice(0, 20)
    .map((n) => ({
      id: n.id,
      headline: n.headline,
      summary: n.summary,
      source: n.source,
      url: n.url,
      image: n.image || null,
      datetime: n.datetime,
      related: n.related || null,
    }));
}

export function getGeneralNews(): Promise<NewsArticle[]> {
  return cached("news:general", 10 * 60, async () => {
    const items = await get<RawNews[]>("/news", { category: "general" });
    return normaliseNews(items);
  });
}

export function getCompanyNews(symbol: string): Promise<NewsArticle[]> {
  const sym = symbol.toUpperCase();
  return cached(`news:${sym}`, 15 * 60, async () => {
    const to = new Date();
    const from = new Date(to.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const items = await get<RawNews[]>("/company-news", {
      symbol: sym,
      from: fmt(from),
      to: fmt(to),
    });
    return normaliseNews(items);
  });
}

// --- Candles ----------------------------------------------------------
// NOTE: /stock/candle is not available on Finnhub's free tier (returns 403).
// We surface that cleanly so the chart can fall back to sample data until a
// historical-data provider (Alpha Vantage / Twelve Data / Stooq) is added.

interface RawCandles {
  s: "ok" | "no_data";
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
  v?: number[];
}

export interface CandlesUnavailable {
  unavailable: true;
  reason: string;
}

export async function getCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number,
): Promise<Candles | CandlesUnavailable> {
  const sym = symbol.toUpperCase();
  return cached(
    `candles:${sym}:${resolution}:${from}:${to}`,
    5 * 60,
    async () => {
      try {
        const raw = await get<RawCandles>("/stock/candle", {
          symbol: sym,
          resolution,
          from: String(from),
          to: String(to),
        });
        if (raw.s !== "ok" || !raw.t?.length) {
          return { unavailable: true, reason: "no_data" } as CandlesUnavailable;
        }
        return {
          symbol: sym,
          t: raw.t,
          o: raw.o ?? [],
          h: raw.h ?? [],
          l: raw.l ?? [],
          c: raw.c ?? [],
          v: raw.v ?? [],
        } satisfies Candles;
      } catch (err) {
        if (err instanceof FinnhubError && (err.status === 403 || err.status === 401)) {
          return {
            unavailable: true,
            reason: "free_tier_no_candles",
          } as CandlesUnavailable;
        }
        throw err;
      }
    },
  );
}
