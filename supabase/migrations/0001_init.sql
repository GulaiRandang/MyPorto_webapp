-- MyPorto initial schema
-- Run with:  npm run db:migrate   (uses SUPABASE_DB_URL from .env.local)
-- Safe to re-run: every statement is guarded.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- symbols  (search universe / reference data, populated from Finnhub)
-- ---------------------------------------------------------------------------
create table if not exists public.symbols (
  symbol      text primary key,
  name        text not null default '',
  exchange    text,
  type        text,
  currency    text not null default 'USD',
  updated_at  timestamptz not null default now()
);

alter table public.symbols enable row level security;

drop policy if exists "symbols: readable by anyone" on public.symbols;
create policy "symbols: readable by anyone"
  on public.symbols for select
  using (true);
-- writes only via service_role (bypasses RLS); no insert/update/delete policy.

-- ---------------------------------------------------------------------------
-- quote_cache  (server-managed; not readable by clients)
-- ---------------------------------------------------------------------------
create table if not exists public.quote_cache (
  symbol      text primary key,
  data        jsonb not null,
  fetched_at  timestamptz not null default now()
);

alter table public.quote_cache enable row level security;
-- no policies => only service_role can touch it.

-- ---------------------------------------------------------------------------
-- watchlists
-- ---------------------------------------------------------------------------
create table if not exists public.watchlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null default 'My Watchlist',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists watchlists_user_id_idx on public.watchlists (user_id);
alter table public.watchlists enable row level security;

drop policy if exists "watchlists: owner all" on public.watchlists;
create policy "watchlists: owner all"
  on public.watchlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists watchlists_updated_at on public.watchlists;
create trigger watchlists_updated_at
  before update on public.watchlists
  for each row execute function public.set_updated_at();

create table if not exists public.watchlist_items (
  id            uuid primary key default gen_random_uuid(),
  watchlist_id  uuid not null references public.watchlists (id) on delete cascade,
  symbol        text not null,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  unique (watchlist_id, symbol)
);

create index if not exists watchlist_items_watchlist_id_idx
  on public.watchlist_items (watchlist_id);
alter table public.watchlist_items enable row level security;

drop policy if exists "watchlist_items: via parent" on public.watchlist_items;
create policy "watchlist_items: via parent"
  on public.watchlist_items for all
  using (
    exists (
      select 1 from public.watchlists w
      where w.id = watchlist_items.watchlist_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.watchlists w
      where w.id = watchlist_items.watchlist_id and w.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- portfolios + transactions
-- ---------------------------------------------------------------------------
create table if not exists public.portfolios (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null default 'Main Portfolio',
  base_currency  text not null default 'USD',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists portfolios_user_id_idx on public.portfolios (user_id);
alter table public.portfolios enable row level security;

drop policy if exists "portfolios: owner all" on public.portfolios;
create policy "portfolios: owner all"
  on public.portfolios for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists portfolios_updated_at on public.portfolios;
create trigger portfolios_updated_at
  before update on public.portfolios
  for each row execute function public.set_updated_at();

create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references public.portfolios (id) on delete cascade,
  type          text not null check (type in ('buy','sell','dividend','deposit','withdrawal')),
  symbol        text,
  quantity      numeric(20, 8) not null default 0,
  price         numeric(20, 8) not null default 0,
  fees          numeric(20, 8) not null default 0,
  trade_date    date not null default current_date,
  note          text,
  import_hash   text,
  created_at    timestamptz not null default now(),
  unique (portfolio_id, import_hash)
);

create index if not exists transactions_portfolio_id_idx
  on public.transactions (portfolio_id);
alter table public.transactions enable row level security;

drop policy if exists "transactions: via parent" on public.transactions;
create policy "transactions: via parent"
  on public.transactions for all
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = transactions.portfolio_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.portfolios p
      where p.id = transactions.portfolio_id and p.user_id = auth.uid()
    )
  );
