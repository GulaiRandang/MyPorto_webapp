# Backend setup — Supabase + Finnhub

One-time setup to make auth and live market data work locally.

## 1. Create a Supabase project

1. Go to <https://supabase.com/dashboard>, create a new project (free tier).
2. **Settings → API** — copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`
3. **Settings → Database → Connection string → URI** — copy the **Direct connection**
   (port `5432`, host `db.<ref>.supabase.co`). URL-encode the password if it has
   symbols. → `SUPABASE_DB_URL`
4. **Authentication → Providers → Email** — keep **Email** enabled.
   - For fast local testing you may turn **"Confirm email"** OFF
     (Authentication → Sign In / Providers). With it ON, sign-up sends a
     confirmation link that lands on `/auth/confirm`.
   - **Authentication → URL Configuration** → set **Site URL** to
     `http://localhost:3000` and add it to **Redirect URLs**.

## 2. Get a Finnhub key

1. Sign up at <https://finnhub.io/> (free).
2. Dashboard → copy the API key → `FINNHUB_API_KEY`.

Free tier covers quotes, symbol search, company profile and news (what MyPorto uses
now). Historical **candles are not on the free tier** — the price chart falls back
to sample data until a historical provider is added.

## 3. Fill `.env.local`

```bash
cp .env.example .env.local
# then edit .env.local with the 5 values above
```

## 4. Run migrations

```bash
npm run db:migrate
```

Creates: `profiles` (auto-filled on signup), `watchlists` / `watchlist_items`,
`portfolios` / `transactions`, `symbols`, `quote_cache` — all with Row Level
Security so each user only sees their own rows.

## 5. Start the app

```bash
npm run dev
```

- Visit `http://localhost:3000` → redirected to `/login`.
- Create an account at `/signup`.
- After sign-in the dashboard loads; **Top Holdings** shows a green **LIVE** badge
  with real Finnhub prices, and the top-bar search queries Finnhub symbol search.

## Regenerating DB types

`src/lib/supabase/database.types.ts` is hand-written to match the migration. To
regenerate from the live schema:

```bash
npx supabase gen types typescript --db-url "$SUPABASE_DB_URL" \
  > src/lib/supabase/database.types.ts
```
