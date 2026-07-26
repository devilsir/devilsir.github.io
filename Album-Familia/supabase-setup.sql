-- Recordações em Família — migração segura para save v2, 10 fases e rankings
-- Idempotente: pode ser executada novamente e preserva todas as linhas existentes.

create table if not exists public.free_game_types (
  game_key text primary key,
  display_name text not null,
  sort_order smallint not null unique check (sort_order between 1 and 8)
);

insert into public.free_game_types (game_key, display_name, sort_order) values
  ('numbers', 'Quebra-cabeça numérico', 1),
  ('image', 'Mosaico da lembrança', 2),
  ('memory', 'Jogo da memória', 3),
  ('snake', 'Cobrinha do carinho', 4),
  ('tetris', 'Blocos em família', 5),
  ('luxor', 'Luxor das Recordações', 6),
  ('simon', 'Sequência de cores', 7),
  ('lights', 'Luzes da casa', 8)
on conflict (game_key) do update
  set display_name = excluded.display_name,
      sort_order = excluded.sort_order;

create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  unlocked_count smallint not null default 0 check (unlocked_count between 0 and 64),
  total_free_points integer not null default 0 check (total_free_points >= 0),
  current_daily_streak integer not null default 0 check (current_daily_streak between 0 and 100000),
  best_daily_streak integer not null default 0 check (best_daily_streak between 0 and 100000),
  daily_grace_available boolean not null default true,
  last_daily_date date,
  updated_at timestamptz not null default now()
);

alter table public.player_profiles add column if not exists current_daily_streak integer not null default 0;
alter table public.player_profiles add column if not exists best_daily_streak integer not null default 0;
alter table public.player_profiles add column if not exists daily_grace_available boolean not null default true;
alter table public.player_profiles add column if not exists last_daily_date date;
alter table public.player_profiles drop constraint if exists player_profiles_current_daily_streak_check;
alter table public.player_profiles add constraint player_profiles_current_daily_streak_check check (current_daily_streak between 0 and 100000);
alter table public.player_profiles drop constraint if exists player_profiles_best_daily_streak_check;
alter table public.player_profiles add constraint player_profiles_best_daily_streak_check check (best_daily_streak between 0 and 100000);

create table if not exists public.free_game_scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  game_key text not null references public.free_game_types(game_key),
  difficulty_key text not null check (difficulty_key in ('facil','normal','dificil','extremo','inferno')),
  points integer not null check (points between 1 and 1000000),
  duration_ms integer not null check (duration_ms between 100 and 18000000),
  phases_completed smallint not null default 1 check (phases_completed between 1 and 10),
  updated_at timestamptz not null default now(),
  unique (user_id, game_key)
);

-- Expande projetos da versão anterior sem apagar pontuações de três fases.
alter table public.free_game_scores drop constraint if exists free_game_scores_game_key_check;
alter table public.free_game_scores drop constraint if exists free_game_scores_game_key_fkey;
alter table public.free_game_scores add constraint free_game_scores_game_key_fkey
  foreign key (game_key) references public.free_game_types(game_key);
alter table public.free_game_scores drop constraint if exists free_game_scores_difficulty_key_check;
alter table public.free_game_scores add constraint free_game_scores_difficulty_key_check
  check (difficulty_key in ('facil','normal','dificil','extremo','inferno'));
alter table public.free_game_scores drop constraint if exists free_game_scores_points_check;
alter table public.free_game_scores add constraint free_game_scores_points_check
  check (points between 1 and 1000000);
alter table public.free_game_scores drop constraint if exists free_game_scores_duration_ms_check;
alter table public.free_game_scores add constraint free_game_scores_duration_ms_check
  check (duration_ms between 100 and 18000000);
alter table public.free_game_scores drop constraint if exists free_game_scores_phases_completed_check;
alter table public.free_game_scores add constraint free_game_scores_phases_completed_check
  check (phases_completed between 1 and 10);

create table if not exists public.daily_challenge_scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  daily_id text not null check (char_length(daily_id) between 12 and 80),
  challenge_date date not null,
  slot text not null check (slot in ('featured','quick','mastery')),
  variant smallint not null default 0 check (variant between 0 and 1),
  game_key text not null references public.free_game_types(game_key),
  difficulty_key text not null check (difficulty_key in ('facil','normal','dificil','extremo','inferno')),
  phase smallint not null check (phase between 1 and 10),
  points integer not null check (points between 1 and 2000000),
  duration_ms integer not null check (duration_ms between 100 and 3600000),
  max_combo integer not null default 0 check (max_combo between 0 and 100000),
  accuracy numeric(5,2) not null default 0 check (accuracy between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (user_id, daily_id)
);

create table if not exists public.luxor_campaign_scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  level smallint not null check (level between 1 and 40),
  points integer not null check (points between 1 and 5000000),
  duration_ms integer not null check (duration_ms between 100 and 7200000),
  stars smallint not null check (stars between 0 and 3),
  max_combo integer not null default 0 check (max_combo between 0 and 100000),
  max_chain integer not null default 0 check (max_chain between 0 and 10000),
  accuracy numeric(5,2) not null default 0 check (accuracy between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (user_id, level)
);

create table if not exists public.daily_reward_claims (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_date date not null,
  reward_key text not null check (char_length(reward_key) between 1 and 80),
  reward_type text not null check (reward_type in ('badge','stamp','powerSkin','confetti','title','reroll')),
  claimed_at timestamptz not null default now(),
  unique (user_id, challenge_date)
);

create table if not exists public.album_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_data jsonb not null check (jsonb_typeof(save_data) = 'object'),
  schema_version integer not null check (schema_version between 1 and 1000),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists player_profiles_unlocked_rank_idx
  on public.player_profiles (unlocked_count desc, updated_at asc);
create index if not exists free_game_scores_game_rank_idx
  on public.free_game_scores (game_key, points desc, duration_ms asc);
create index if not exists daily_challenge_rank_idx
  on public.daily_challenge_scores (daily_id, points desc, duration_ms asc);
create index if not exists luxor_campaign_rank_idx
  on public.luxor_campaign_scores (level, points desc, duration_ms asc);

alter table public.free_game_types enable row level security;
alter table public.player_profiles enable row level security;
alter table public.free_game_scores enable row level security;
alter table public.daily_challenge_scores enable row level security;
alter table public.luxor_campaign_scores enable row level security;
alter table public.daily_reward_claims enable row level security;
alter table public.album_saves enable row level security;

drop policy if exists "Tipos de desafio podem ser lidos" on public.free_game_types;
create policy "Tipos de desafio podem ser lidos"
  on public.free_game_types for select to authenticated using (true);

drop policy if exists "Ranking de perfis pode ser lido" on public.player_profiles;
create policy "Ranking de perfis pode ser lido"
  on public.player_profiles for select to authenticated using (true);
drop policy if exists "Jogador cria o próprio perfil" on public.player_profiles;
create policy "Jogador cria o próprio perfil"
  on public.player_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Jogador atualiza o próprio perfil" on public.player_profiles;
create policy "Jogador atualiza o próprio perfil"
  on public.player_profiles for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Ranking de jogos pode ser lido" on public.free_game_scores;
create policy "Ranking de jogos pode ser lido"
  on public.free_game_scores for select to authenticated using (true);
drop policy if exists "Ranking diário pode ser lido" on public.daily_challenge_scores;
create policy "Ranking diário pode ser lido"
  on public.daily_challenge_scores for select to authenticated using (true);
drop policy if exists "Ranking Luxor pode ser lido" on public.luxor_campaign_scores;
create policy "Ranking Luxor pode ser lido"
  on public.luxor_campaign_scores for select to authenticated using (true);

drop policy if exists "Jogador registra a própria recompensa" on public.daily_reward_claims;
create policy "Jogador registra a própria recompensa"
  on public.daily_reward_claims for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Jogador lê as próprias recompensas" on public.daily_reward_claims;
create policy "Jogador lê as próprias recompensas"
  on public.daily_reward_claims for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Jogador lê o próprio save" on public.album_saves;
create policy "Jogador lê o próprio save"
  on public.album_saves for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Jogador cria o próprio save" on public.album_saves;
create policy "Jogador cria o próprio save"
  on public.album_saves for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Jogador atualiza o próprio save" on public.album_saves;
create policy "Jogador atualiza o próprio save"
  on public.album_saves for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select on public.free_game_types, public.free_game_scores, public.daily_challenge_scores, public.luxor_campaign_scores to authenticated;
grant select, insert, update on public.player_profiles, public.album_saves to authenticated;
grant select, insert on public.daily_reward_claims to authenticated;
revoke insert, update, delete on public.free_game_scores, public.daily_challenge_scores, public.luxor_campaign_scores from anon, authenticated;

drop function if exists public.record_free_score(uuid,text,text,text,integer,integer);
drop function if exists public.record_free_score(uuid,text,text,text,integer,integer,smallint);
create function public.record_free_score(
  p_user_id uuid,
  p_display_name text,
  p_game_key text,
  p_difficulty_key text,
  p_points integer,
  p_duration_ms integer,
  p_phases_completed smallint
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_user_id is null then raise exception 'Usuário inválido'; end if;
  if not exists (select 1 from public.free_game_types where game_key = p_game_key) then raise exception 'Jogo inválido'; end if;
  if p_difficulty_key not in ('facil','normal','dificil','extremo','inferno') then raise exception 'Dificuldade inválida'; end if;
  if p_points < 1 or p_points > 1000000 then raise exception 'Pontuação inválida'; end if;
  if p_duration_ms < 100 or p_duration_ms > 18000000 then raise exception 'Tempo inválido'; end if;
  if p_phases_completed < 1 or p_phases_completed > 10 then raise exception 'Quantidade de fases inválida'; end if;

  insert into public.free_game_scores
    (user_id, display_name, game_key, difficulty_key, points, duration_ms, phases_completed, updated_at)
  values
    (p_user_id, left(trim(p_display_name), 32), p_game_key, p_difficulty_key, p_points, p_duration_ms, p_phases_completed, now())
  on conflict (user_id, game_key) do update
    set display_name = excluded.display_name,
        difficulty_key = excluded.difficulty_key,
        points = excluded.points,
        duration_ms = excluded.duration_ms,
        phases_completed = excluded.phases_completed,
        updated_at = now()
    where excluded.points > free_game_scores.points
       or (excluded.points = free_game_scores.points and excluded.phases_completed > free_game_scores.phases_completed)
       or (excluded.points = free_game_scores.points and excluded.phases_completed = free_game_scores.phases_completed and excluded.duration_ms < free_game_scores.duration_ms);
end;
$$;

drop function if exists public.record_daily_score(uuid,text,text,date,text,smallint,text,text,smallint,integer,integer,integer,numeric);
create function public.record_daily_score(
  p_user_id uuid,
  p_display_name text,
  p_daily_id text,
  p_challenge_date date,
  p_slot text,
  p_variant smallint,
  p_game_key text,
  p_difficulty_key text,
  p_phase smallint,
  p_points integer,
  p_duration_ms integer,
  p_max_combo integer,
  p_accuracy numeric
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_user_id is null or p_slot not in ('featured','quick','mastery') or p_variant not between 0 and 1 then raise exception 'Desafio diário inválido'; end if;
  if not exists (select 1 from public.free_game_types where game_key = p_game_key) then raise exception 'Jogo inválido'; end if;
  if p_difficulty_key not in ('facil','normal','dificil','extremo','inferno') or p_phase not between 1 and 10 then raise exception 'Configuração inválida'; end if;
  if p_points not between 1 and 2000000 or p_duration_ms not between 100 and 3600000 then raise exception 'Resultado inválido'; end if;

  insert into public.daily_challenge_scores
    (user_id, display_name, daily_id, challenge_date, slot, variant, game_key, difficulty_key, phase, points, duration_ms, max_combo, accuracy, updated_at)
  values
    (p_user_id, left(trim(p_display_name),32), p_daily_id, p_challenge_date, p_slot, p_variant, p_game_key, p_difficulty_key, p_phase, p_points, p_duration_ms, p_max_combo, p_accuracy, now())
  on conflict (user_id, daily_id) do update
    set display_name = excluded.display_name,
        points = excluded.points,
        duration_ms = excluded.duration_ms,
        max_combo = greatest(daily_challenge_scores.max_combo, excluded.max_combo),
        accuracy = greatest(daily_challenge_scores.accuracy, excluded.accuracy),
        updated_at = now()
    where excluded.points > daily_challenge_scores.points
       or (excluded.points = daily_challenge_scores.points and excluded.duration_ms < daily_challenge_scores.duration_ms);
end;
$$;

drop function if exists public.record_luxor_campaign_score(uuid,text,smallint,integer,integer,smallint,integer,integer,numeric);
create function public.record_luxor_campaign_score(
  p_user_id uuid,
  p_display_name text,
  p_level smallint,
  p_points integer,
  p_duration_ms integer,
  p_stars smallint,
  p_max_combo integer,
  p_max_chain integer,
  p_accuracy numeric
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_user_id is null or p_level not between 1 and 40 then raise exception 'Nível inválido'; end if;
  if p_points not between 1 and 5000000 or p_duration_ms not between 100 and 7200000 or p_stars not between 0 and 3 then raise exception 'Resultado inválido'; end if;

  insert into public.luxor_campaign_scores
    (user_id, display_name, level, points, duration_ms, stars, max_combo, max_chain, accuracy, updated_at)
  values
    (p_user_id, left(trim(p_display_name),32), p_level, p_points, p_duration_ms, p_stars, p_max_combo, p_max_chain, p_accuracy, now())
  on conflict (user_id, level) do update
    set display_name = excluded.display_name,
        points = excluded.points,
        duration_ms = excluded.duration_ms,
        stars = greatest(luxor_campaign_scores.stars, excluded.stars),
        max_combo = greatest(luxor_campaign_scores.max_combo, excluded.max_combo),
        max_chain = greatest(luxor_campaign_scores.max_chain, excluded.max_chain),
        accuracy = greatest(luxor_campaign_scores.accuracy, excluded.accuracy),
        updated_at = now()
    where excluded.points > luxor_campaign_scores.points
       or (excluded.points = luxor_campaign_scores.points and excluded.duration_ms < luxor_campaign_scores.duration_ms);
end;
$$;

revoke all on function public.record_free_score(uuid,text,text,text,integer,integer,smallint) from public, anon, authenticated;
revoke all on function public.record_daily_score(uuid,text,text,date,text,smallint,text,text,smallint,integer,integer,integer,numeric) from public, anon, authenticated;
revoke all on function public.record_luxor_campaign_score(uuid,text,smallint,integer,integer,smallint,integer,integer,numeric) from public, anon, authenticated;
grant execute on function public.record_free_score(uuid,text,text,text,integer,integer,smallint) to service_role;
grant execute on function public.record_daily_score(uuid,text,text,date,text,smallint,text,text,smallint,integer,integer,integer,numeric) to service_role;
grant execute on function public.record_luxor_campaign_score(uuid,text,smallint,integer,integer,smallint,integer,integer,numeric) to service_role;
