create schema if not exists portfolio_private;

revoke all on schema portfolio_private from public, anon, authenticated;
grant usage on schema portfolio_private to service_role;

create table if not exists portfolio_private.access_attempts (
  client_key text primary key,
  failures integer not null default 0,
  updated_at timestamptz not null default now(),
  blocked_until timestamptz
);
alter table portfolio_private.access_attempts enable row level security;
revoke all on portfolio_private.access_attempts from public, anon, authenticated;
grant select, insert, update, delete on portfolio_private.access_attempts to service_role;

create or replace function public.portfolio_allow_attempt(p_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  last_row portfolio_private.access_attempts%rowtype;
begin
  if p_key is null or length(p_key) < 32 or length(p_key) > 160 then return false; end if;
  select * into last_row from portfolio_private.access_attempts where client_key = p_key;
  if not found then return true; end if;
  if last_row.updated_at < now() - interval '20 minutes' then return true; end if;
  return last_row.blocked_until is null or last_row.blocked_until <= now();
end
$$;

create or replace function public.portfolio_record_attempt(p_key text, p_success boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_key is null or length(p_key) < 32 or length(p_key) > 160 then return; end if;
  if p_success then
    delete from portfolio_private.access_attempts where client_key = p_key;
    return;
  end if;
  insert into portfolio_private.access_attempts (client_key, failures, updated_at, blocked_until)
  values (p_key, 1, now(), null)
  on conflict (client_key) do update set
    failures = case
      when portfolio_private.access_attempts.updated_at < now() - interval '20 minutes' then 1
      else least(portfolio_private.access_attempts.failures + 1, 30)
    end,
    updated_at = now(),
    blocked_until = case
      when portfolio_private.access_attempts.blocked_until > now() then portfolio_private.access_attempts.blocked_until
      when portfolio_private.access_attempts.updated_at < now() - interval '20 minutes' then null
      when portfolio_private.access_attempts.failures + 1 >= 5 then now() + interval '15 minutes'
      else null
    end;
end
$$;

revoke all on function public.portfolio_allow_attempt(text) from public, anon, authenticated;
revoke all on function public.portfolio_record_attempt(text, boolean) from public, anon, authenticated;
grant execute on function public.portfolio_allow_attempt(text) to service_role;
grant execute on function public.portfolio_record_attempt(text, boolean) to service_role;

insert into storage.buckets (id, name, public)
values ('portfolio-private', 'portfolio-private', false)
on conflict (id) do update set public = false;
