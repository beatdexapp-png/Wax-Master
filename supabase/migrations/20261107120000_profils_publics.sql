-- Profil public d'un joueur (demande de @felix.s6trn) : ouvrir le profil des autres et voir leurs vitrines.
-- NE PAS APPLIQUER sans le oui d'Alexi.
-- La table profiles garde sa RLS stricte (chaque joueur ne lit que sa ligne) : rien n'est ouvert en lecture directe.
-- La lecture publique passe uniquement par cette fonction, qui ne renvoie qu'une liste fermée de champs :
--   pseudo, photo, score, niveau, date d'arrivée (déjà visible dans les stats), vitrines, nombre de sons et de divins,
--   albums et artistes complétés, lien d'amitié avec moi.
-- Jamais renvoyé : e-mail (auth.users n'est pas lu), wax coins, or, poussière, abonnement Pro, code d'invitation,
--   état complet du jeu, liste complète des sons.

create index if not exists profiles_pseudo_lower on public.profiles (lower(pseudo));

create or replace function public.player_profile(p_pseudo text)
returns jsonb
language plpgsql
stable
security definer
set search_path to ''
as $$
declare
  v_uid uuid := auth.uid();
  r record;
  v_own jsonb;
  v_vits jsonb;
  v_sons int;
  v_div int;
  v_ul jsonb;
  v_rel text;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  if p_pseudo is null or length(trim(p_pseudo)) < 1 or length(p_pseudo) > 40 then return null; end if;

  select p.id, p.pseudo, p.avatar_url, p.score, p.created_at, p.state, coalesce(w.owned, '{}'::jsonb) owned
    into r
    from public.profiles p left join public.wallets w on w.uid = p.id
   where lower(p.pseudo) = lower(trim(p_pseudo)) and p.pseudo is not null;
  if not found then return null; end if;

  -- sons réellement possédés (côté serveur), cartes cachées exclues
  select coalesce(jsonb_object_agg(c.id, c.r), '{}'::jsonb), count(*), count(*) filter (where c.r = 5)
    into v_own, v_sons, v_div
    from jsonb_each_text(r.owned) e(k, v)
    join public.cards c on c.id = e.k
   where e.v ~ '^[0-9]+$' and e.v::int > 0 and not coalesce(c.hidden, false);

  -- vitrines : 3 au plus, 6 sons chacune, seulement des sons possédés ; nom limité à 18 caractères
  select coalesce(jsonb_agg(jsonb_build_object('n', left(coalesce(x.v->>'n', 'Vitrine'), 18), 'ids', x.ids) order by x.o), '[]'::jsonb)
    into v_vits
    from (
      select vv.o, vv.v,
             coalesce((select jsonb_agg(i.id order by i.o2)
                         from (select ii.id, ii.o2 from jsonb_array_elements_text(case when jsonb_typeof(vv.v->'ids') = 'array' then vv.v->'ids' else '[]'::jsonb end) with ordinality ii(id, o2)
                                where v_own ? ii.id order by ii.o2 limit 6) i), '[]'::jsonb) ids
        from jsonb_array_elements(
               case when jsonb_typeof(r.state->'vits') = 'array' and jsonb_array_length(r.state->'vits') > 0 then r.state->'vits'
                    else jsonb_build_array(jsonb_build_object('n', 'Vitrine', 'ids', case when jsonb_typeof(r.state->'fav') = 'array' then r.state->'fav' else '[]'::jsonb end))
               end) with ordinality vv(v, o)
       where jsonb_typeof(vv.v) = 'object'
       order by vv.o limit 3
    ) x;

  -- albums et artistes complétés (clés seules, au plus 2000)
  select coalesce(jsonb_agg(k), '[]'::jsonb) into v_ul
    from (select k from jsonb_object_keys(case when jsonb_typeof(r.state->'ul') = 'object' then r.state->'ul' else '{}'::jsonb end) k limit 2000) s;

  select f.status || case when f.status = 'pending' then case when f.a = v_uid then ':out' else ':in' end else '' end
    into v_rel
    from public.friends f
   where least(f.a, f.b) = least(v_uid, r.id) and greatest(f.a, f.b) = greatest(v_uid, r.id) and f.status in ('pending', 'accepted')
   limit 1;

  return jsonb_build_object(
    'pseudo', r.pseudo,
    'avatar', r.avatar_url,
    'score', coalesce(r.score, 0),
    'level', least(30, greatest(0, coalesce(case when (r.state->>'xp') ~ '^[0-9]+$' then (r.state->>'xp')::bigint end, 0) / 100)),
    'since', r.created_at,
    'sons', v_sons,
    'divins', v_div,
    'ul', v_ul,
    'vits', v_vits,
    'me', r.id = v_uid,
    'rel', v_rel
  );
end $$;

revoke all on function public.player_profile(text) from public, anon;
grant execute on function public.player_profile(text) to authenticated;
