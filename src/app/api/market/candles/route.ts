import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getCandles, FinnhubError } from "@/lib/market/finnhub";

export const dynamic = "force-dynamic";

const RANGES: Record<string, { days: number; resolution: string }> = {
  "1D": { days: 1, resolution: "5" },
  "5D": { days: 5, resolution: "15" },
  "1M": { days: 31, resolution: "60" },
  "6M": { days: 183, resolution: "D" },
  YTD: { days: 366, resolution: "D" },
  "1Y": { days: 366, resolution: "D" },
  "5Y": { days: 5 * 366, resolution: "W" },
  MAX: { days: 20 * 366, resolution: "M" },
};

export async function GET(request: Request) {
  if (!(await getUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const range = (searchParams.get("range") ?? "1Y").toUpperCase();
  if (!symbol) {
    return NextResponse.json({ error: "pass ?symbol=" }, { status: 400 });
  }

  const cfg = RANGES[range] ?? RANGES["1Y"];
  const to = Math.floor(Date.now() / 1000);
  const from = to - cfg.days * 24 * 60 * 60;

  try {
    const result = await getCandles(symbol, cfg.resolution, from, to);
    if ("unavailable" in result) {
      return NextResponse.json(result, { status: 200 });
    }
    return NextResponse.json({ candles: result });
  } catch (err) {
    const status = err instanceof FinnhubError ? 502 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "candles failed" },
      { status },
    );
  }
}
