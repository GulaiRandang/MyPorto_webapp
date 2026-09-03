import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { searchSymbols, FinnhubError } from "@/lib/market/finnhub";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await getUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.trim().length < 1) return NextResponse.json({ results: [] });

  try {
    const results = await searchSymbols(q);
    return NextResponse.json({ results });
  } catch (err) {
    const status = err instanceof FinnhubError ? 502 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "search failed" },
      { status },
    );
  }
}
