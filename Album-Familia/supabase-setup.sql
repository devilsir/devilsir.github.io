-- Recordações em Família — ranking online completo
-- Pode ser executado novamente: o script preserva os recordes existentes.

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
  updated_at timestamptz not null default now()
);

create table if not exists public.free_game_scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  game_key text not null references public.free_game_types(game_key),
  difficulty_key text not null check (difficulty_key in ('facil','normal','dificil','extremo','inferno')),
  points integer not null check (points between 1 and 100000),
  duration_ms integer not null check (duration_ms between 4500 and 5400000),
  phases_completed smallint not null default 3 check (phases_completed = 3),
  updated_at timestamptz not null default now(),
  unique (user_id, game_key)
);

-- Atualiza projetos que já tinham a primeira versão das tabelas.
alter table public.free_game_scores
  drop constraint if exists free_game_scores_game_key_check;
alter table public.free_game_scores
  drop constraint if exists free_game_scores_game_key_fkey;
alter table public.free_game_scores
  add constraint free_game_scores_game_key_fkey
  foreign key (game_key) references public.free_game_types(game_key);

alter table public.free_game_scores
  drop constraint if exists free_game_scores_difficulty_key_check;
alter table public.free_game_scores
  add constraint free_game_scores_difficulty_key_check
  check (difficulty_key in ('facil','normal','dificil','extremo','inferno'));

update public.player_profiles
set total_free_points = 0
where total_free_points < 0;

create index if not exists player_profiles_unlocked_rank_idx
  on public.player_profiles (unlocked_count desc, updated_at asc);
create index if not exists free_game_scores_game_rank_idx
  on public.free_game_scores (game_key, points desc, duration_ms asc);

alter table public.free_game_types enable row level security;
alter table public.player_profiles enable row level security;
alter table public.free_game_scores enable row level security;

drop policy if exists "Tipos de desafio podem ser lidos" on public.free_game_types;
create policy "Tipos de desafio podem ser lidos"
  on public.free_game_types for select to authenticated using (true);

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

grant select on public.free_game_types to authenticated;
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
  if not exists (select 1 from public.free_game_types where game_key = p_game_key) then raise exception 'Jogo inválido'; end if;
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
