import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getProfile, FinnhubError } from "@/lib/market/finnhub";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await getUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const symbol = new URL(request.url).searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "pass ?symbol=" }, { status: 400 });
  }

  try {
    const profile = await getProfile(symbol);
    return NextResponse.json({ profile });
  } catch (err) {
    const status = err instanceof FinnhubError ? 502 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "profile failed" },
      { status },
    );
  }
}
