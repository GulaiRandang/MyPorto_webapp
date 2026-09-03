-- Subscriptions (Stripe) + auto-provision default watchlist & free plan on signup.

create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  plan                   text not null default 'free' check (plan in ('free', 'pro')),
  status                 text,
  stripe_customer_id     text,
  stripe_subscription_id text,
  price_id               text,
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions: read own" on public.subscriptions;
create policy "subscriptions: read own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Clients may read their own row (via the policy) but never write it — only the
-- service role (Stripe webhook / checkout verification) mutates subscriptions.
revoke all on table public.subscriptions from anon;
revoke insert, update, delete, truncate on table public.subscriptions from authenticated;
grant select on table public.subscriptions to authenticated;

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Extend the signup trigger: give every new user a default watchlist + free plan.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;

  if not exists (select 1 from public.watchlists where user_id = new.id) then
    insert into public.watchlists (user_id, name) values (new.id, 'My Watchlist');
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- Backfill existing users.
insert into public.subscriptions (user_id, plan)
select id, 'free' from auth.users
on conflict (user_id) do nothing;

insert into public.watchlists (user_id, name)
select u.id, 'My Watchlist'
from auth.users u
where not exists (select 1 from public.watchlists w where w.user_id = u.id);
