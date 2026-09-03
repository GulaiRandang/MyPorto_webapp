import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getQuote, getQuotes, FinnhubError } from "@/lib/market/finnhub";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await getUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const symbols = searchParams.get("symbols");

  try {
    if (symbols) {
      const list = symbols
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const quotes = await getQuotes(list);
      return NextResponse.json({ quotes });
    }
    if (symbol) {
      const quote = await getQuote(symbol);
      return NextResponse.json({ quote });
    }
    return NextResponse.json(
      { error: "pass ?symbol= or ?symbols=A,B,C" },
      { status: 400 },
    );
  } catch (err) {
    const status = err instanceof FinnhubError ? 502 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "quote failed" },
      { status },
    );
  }
}
