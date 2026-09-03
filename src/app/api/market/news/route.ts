import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import {
  getCompanyNews,
  getGeneralNews,
  FinnhubError,
} from "@/lib/market/finnhub";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await getUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const symbol = new URL(request.url).searchParams.get("symbol");

  try {
    const articles = symbol
      ? await getCompanyNews(symbol)
      : await getGeneralNews();
    return NextResponse.json({ articles });
  } catch (err) {
    const status = err instanceof FinnhubError ? 502 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "news failed" },
      { status },
    );
  }
}
