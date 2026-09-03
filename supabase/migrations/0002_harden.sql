-- Address Supabase security-advisor findings from 0001.

-- 1. Pin search_path on trigger functions.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
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

-- 2. Trigger functions must not be callable as PostgREST RPCs.
revoke execute on function public.set_updated_at() from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- 3. quote_cache is server-only (service_role bypasses RLS). Remove it from the
--    anon/authenticated API surface entirely.
revoke all on table public.quote_cache from anon, authenticated;
