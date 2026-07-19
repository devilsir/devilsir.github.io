-- Recordações em Família — ranking online
-- Execute este arquivo no SQL Editor do Supabase.

create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  unlocked_count smallint not null default 0 check (unlocked_count between 0 and 64),
  total_free_points integer not null default 0 check (total_free_points >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.free_game_scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  game_key text not null check (game_key in ('numbers','image','memory','snake','tetris','luxor','simon','lights')),
  difficulty_key text not null check (difficulty_key in ('facil','normal','dificil','extremo','inferno')),
  points integer not null check (points between 1 and 100000),
  duration_ms integer not null check (duration_ms between 4500 and 5400000),
  phases_completed smallint not null default 3 check (phases_completed = 3),
  updated_at timestamptz not null default now(),
  unique (user_id, game_key)
);

create index if not exists player_profiles_unlocked_rank_idx
  on public.player_profiles (unlocked_count desc, updated_at asc);
create index if not exists free_game_scores_game_rank_idx
  on public.free_game_scores (game_key, points desc, duration_ms asc);

alter table public.player_profiles enable row level security;
alter table public.free_game_scores enable row level security;

drop policy if exists "Ranking de perfis pode ser lido" on public.player_profiles;
create policy "Ranking de perfis pode ser lido"
  on public.player_profiles for select to authenticated using (true);

drop policy if exists "Jogador cria o próprio perfil" on public.player_profiles;
create policy "Jogador cria o próprio perfil"
  on public.player_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Jogador atualiza o próprio perfil" on public.player_profiles;
create policy "Jogador atualiza o próprio perfil"
  on public.player_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Ranking de jogos pode ser lido" on public.free_game_scores;
create policy "Ranking de jogos pode ser lido"
  on public.free_game_scores for select to authenticated using (true);

grant select, insert, update on public.player_profiles to authenticated;
grant select on public.free_game_scores to authenticated;
revoke insert, update, delete on public.free_game_scores from anon, authenticated;

create or replace function public.record_free_score(
  p_user_id uuid,
  p_display_name text,
  p_game_key text,
  p_difficulty_key text,
  p_points integer,
  p_duration_ms integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then raise exception 'Usuário inválido'; end if;
  if p_game_key not in ('numbers','image','memory','snake','tetris','luxor','simon','lights') then raise exception 'Jogo inválido'; end if;
  if p_difficulty_key not in ('facil','normal','dificil','extremo','inferno') then raise exception 'Dificuldade inválida'; end if;
  if p_points < 1 or p_points > 100000 then raise exception 'Pontuação inválida'; end if;
  if p_duration_ms < 4500 or p_duration_ms > 5400000 then raise exception 'Tempo inválido'; end if;

  insert into public.free_game_scores (
    user_id, display_name, game_key, difficulty_key, points, duration_ms, phases_completed, updated_at
  ) values (
    p_user_id, left(trim(p_display_name), 32), p_game_key, p_difficulty_key, p_points, p_duration_ms, 3, now()
  )
  on conflict (user_id, game_key) do update
    set display_name = excluded.display_name,
        difficulty_key = excluded.difficulty_key,
        points = excluded.points,
        duration_ms = excluded.duration_ms,
        phases_completed = 3,
        updated_at = now()
    where excluded.points > free_game_scores.points
       or (excluded.points = free_game_scores.points and excluded.duration_ms < free_game_scores.duration_ms);
end;
$$;

revoke all on function public.record_free_score(uuid,text,text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.record_free_score(uuid,text,text,text,integer,integer) to service_role;
