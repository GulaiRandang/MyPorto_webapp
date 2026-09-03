/** Normalised shapes returned by our API routes (provider-agnostic). */

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  /** epoch seconds of the quote */
  time: number;
}

export interface SymbolSearchResult {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  exchange: string | null;
  industry: string | null;
  logo: string | null;
  marketCap: number | null;
  currency: string | null;
  weburl: string | null;
  ipo: string | null;
  country: string | null;
}

export interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string | null;
  datetime: number;
  related: string | null;
}

export interface Candles {
  symbol: string;
  /** epoch seconds */
  t: number[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
}
