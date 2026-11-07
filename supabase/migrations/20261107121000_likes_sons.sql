-- Likes sur les sons (demande de @felix.s6trn) : un like par joueur et par son, retirable, compteur visible.
-- NE PAS APPLIQUER sans le oui d'Alexi.
-- Écriture uniquement par la fonction song_like_toggle (aucune policy INSERT/UPDATE/DELETE).
-- Lecture directe : chaque joueur ne voit que ses propres likes. Les compteurs passent par song_likes_get,
-- qui ne renvoie que des nombres (jamais qui a liké).

create table if not exists public.song_likes (
  uid uuid not null references auth.users (id) on delete cascade,
  card text not null references public.cards (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (uid, card)
);
create index if not exists song_likes_card on public.song_likes (card);
create index if not exists song_likes_uid_at on public.song_likes (uid, created_at desc);

alter table public.song_likes enable row level security;
revoke all on table public.song_likes from anon, authenticated;
grant select on table public.song_likes to authenticated;
create policy "mes likes" on public.song_likes for select to authenticated using ((select auth.uid()) = uid);

-- Compteurs et état « j'ai liké » pour une liste de sons (60 au plus par appel)
create or replace function public.song_likes_get(p_ids text[])
returns jsonb
language sql
stable
security definer
set search_path to ''
as $$
  select case when auth.uid() is null then '{}'::jsonb else coalesce((
    select jsonb_object_agg(i.id, jsonb_build_object(
             'n', (select count(*) from public.song_likes l where l.card = i.id),
             'me', exists (select 1 from public.song_likes l where l.card = i.id and l.uid = auth.uid())))
      from (select distinct id from unnest(p_ids[1:60]) id where id is not null and length(id) <= 120) i
  ), '{}'::jsonb) end
$$;

-- Ajoute ou retire mon like ; renvoie le nouveau compteur
create or replace function public.song_like_toggle(p_card text)
returns jsonb
language plpgsql
volatile
security definer
set search_path to ''
as $$
declare v_uid uuid := auth.uid(); v_me boolean;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  if p_card is null or not exists (select 1 from public.cards c where c.id = p_card and not coalesce(c.hidden, false)) then
    raise exception 'Son introuvable';
  end if;
  delete from public.song_likes where uid = v_uid and card = p_card;
  if found then
    v_me := false;
  else
    -- garde-fou anti-robot : 60 nouveaux likes par minute au plus
    if (select count(*) from public.song_likes where uid = v_uid and created_at > now() - interval '1 minute') >= 60 then
      raise exception 'Doucement, réessaie dans une minute';
    end if;
    insert into public.song_likes (uid, card) values (v_uid, p_card);
    v_me := true;
  end if;
  return jsonb_build_object('n', (select count(*) from public.song_likes where card = p_card), 'me', v_me);
end $$;

revoke all on function public.song_likes_get(text[]) from public, anon;
revoke all on function public.song_like_toggle(text) from public, anon;
grant execute on function public.song_likes_get(text[]) to authenticated;
grant execute on function public.song_like_toggle(text) to authenticated;
