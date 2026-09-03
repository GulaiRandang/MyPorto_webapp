/**
 * Verifies the Finnhub API key works, independent of the app / Supabase.
 *
 *   npm run check:finnhub            # defaults to AAPL
 *   npm run check:finnhub -- MSFT NVDA
 */
const key = process.env.FINNHUB_API_KEY;
if (!key || key.trim() === "") {
  console.error("FINNHUB_API_KEY is empty in .env.local");
  process.exit(1);
}

const symbols = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["AAPL"];

const BASE = "https://finnhub.io/api/v1";

async function quote(symbol) {
  const url = `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${symbol}: HTTP ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function search(q) {
  const url = `${BASE}/search?q=${encodeURIComponent(q)}&token=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`search: HTTP ${res.status}`);
  return res.json();
}

try {
  console.log(`Finnhub key: ...${key.slice(-4)}\n`);

  for (const s of symbols) {
    const q = await quote(s);
    if (q.c === 0 && q.pc === 0) {
      console.log(`${s.padEnd(6)} no data (unknown symbol or market closed pre-IPO)`);
    } else {
      const arrow = q.d >= 0 ? "▲" : "▼";
      console.log(
        `${s.padEnd(6)} $${q.c.toFixed(2)}  ${arrow} ${q.d?.toFixed(2)} (${q.dp?.toFixed(2)}%)  ` +
          `O ${q.o}  H ${q.h}  L ${q.l}  prevClose ${q.pc}`,
      );
    }
  }

  const r = await search("apple");
  console.log(`\nsearch("apple") -> ${r.count} results, e.g. ${r.result?.[0]?.symbol} (${r.result?.[0]?.description})`);

  console.log("\n✅ Finnhub key is working.");
} catch (err) {
  console.error("\n❌ Finnhub check failed:\n", err.message);
  process.exit(1);
}
