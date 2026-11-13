-- Retour arrière Dalí 13/11/2026 : réaffiche le Dali metal, retire le rappeur (sauf cartes déjà tirées par des joueurs, alors masquées)
update public.cards set hidden=false where artist_id='c33d50c4-7eca-4922-93a0-ba5fc9ce1733' and src='cat';
CREATE OR REPLACE FUNCTION public.catalog_dump()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select jsonb_build_object('n', a.name, 'k', 'sp-' || a.id, 'i', a.image, 's', a.scene, 'st', a.style,
      'al', (select coalesce(jsonb_agg(jsonb_build_object('k', q.alk, 't', q.alt, 'y', q.y, 'c', q.cover, 'tr', q.tr) order by q.y desc nulls last), '[]'::jsonb)
             from (select c.alk, max(c.alt) alt, max(c.y) y, max(c.cover) cover, jsonb_agg(jsonb_build_array(c.t, c.s, c.id, c.r) order by c.ord) tr
                   from public.cards c where c.artist_id = a.id and c.src = 'cat' and c.alk like 'al-%' and not coalesce(c.hidden,false) group by c.alk) q),
      'sg', (select coalesce(jsonb_agg(jsonb_build_array(c.t, c.s, c.y, null, c.id, c.r, c.cover) order by c.y desc nulls last), '[]'::jsonb)
             from public.cards c where c.artist_id = a.id and c.src = 'cat' and c.alk like 'sg-%' and not coalesce(c.hidden,false))) x
    from public.catalog_artists a where exists (select 1 from public.cards c where c.artist_id = a.id and c.src = 'cat')
    union all
    select jsonb_build_object('n', b.a, 'base', true, 'i', a.image, 'st', a.style,
      'al', (select coalesce(jsonb_agg(jsonb_build_object('t', al.title, 'c', al.cover)), '[]'::jsonb) from public.catalog_albums al where al.artist_id = a.id and al.album_type = 'album'))
    from (select distinct c.a, c.artist_id from public.cards c where c.src = 'base' and c.artist_id is not null) b
    join public.catalog_artists a on a.id = b.artist_id
  ) s;
$function$;
update public.cards set hidden=true where artist_id='635135db-cc18-4995-a5f6-001affac91c1' and src='cat' and id in (select card from public.card_held where n>0);
delete from public.cards where artist_id='635135db-cc18-4995-a5f6-001affac91c1' and src='cat' and not exists (select 1 from public.card_held h where h.card=cards.id and h.n>0) and not exists (select 1 from public.wallets w where w.owned ? cards.id);
delete from public.catalog_tracks where artist_id='635135db-cc18-4995-a5f6-001affac91c1' and not exists (select 1 from public.cards c where c.artist_id='635135db-cc18-4995-a5f6-001affac91c1');
delete from public.catalog_albums where artist_id='635135db-cc18-4995-a5f6-001affac91c1' and not exists (select 1 from public.cards c where c.artist_id='635135db-cc18-4995-a5f6-001affac91c1');
delete from public.catalog_artists where id='635135db-cc18-4995-a5f6-001affac91c1' and not exists (select 1 from public.cards c where c.artist_id='635135db-cc18-4995-a5f6-001affac91c1');
update public.catalog_seed set mbid='c33d50c4-7eca-4922-93a0-ba5fc9ce1733' where name='Dali';
select public.catalog_cache_refresh();
-- Site : git revert du commit Dalí (ou git push --force origin avant-dali-2026-11-13:main), puis node outils/catalogue/maj.cjs
