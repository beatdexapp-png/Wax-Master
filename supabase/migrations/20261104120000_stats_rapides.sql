-- NON APPLIQUÉE : à appliquer sur Supabase après le oui d'Alexi.
-- Bug joueurs #349 « On ne peut plus voir ses stats » : pour un joueur Pro avec une grande collection,
-- profile_stats calculait la valeur carte par carte (card_value appelée une fois par son possédé).
-- Mesuré le 04/11 sur un joueur de 13 788 sons : 30,5 s, alors que la base coupe à 8 s, donc erreur.
-- Correctif : un seul appel groupé à card_values (même formule, même instant). Valeur identique au centime
-- (9 577 171,23 dans les deux cas), 0,5 s au lieu de 29,8 s. Rien d'autre ne change.
CREATE OR REPLACE FUNCTION public.profile_stats(p_pseudo text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare me uuid := auth.uid(); tgt uuid; pr record; w public.wallets; pro boolean; v_st jsonb;
  v_sons int; v_copies int; v_alb int; v_art int; v_plat int; rc jsonb; v_val bigint; v_tot int; v_fr int; v_bx int; v_tr int;
  top jsonb; sty jsonb; scn jsonb; drawn int; hi int; luck int; bestc jsonb; res jsonb;
begin
  if me is null then raise exception 'Connexion requise'; end if;
  if p_pseudo is null or btrim(p_pseudo) = '' then tgt := me;
  else select p.id into tgt from public.profiles p where lower(p.pseudo) = lower(btrim(p_pseudo));
    if tgt is null then raise exception 'Joueur introuvable'; end if;

  end if;
  select * into pr from public.profiles p where p.id = tgt;
  select * into w from public.wallets x where x.uid = tgt;
  v_st := coalesce(w.stats, '{}'::jsonb);
  select coalesce(x.pass_until > now(), false) into pro from public.wallets x where x.uid = me;
  pro := coalesce(pro, false);
  select count(*), coalesce(sum(o.n),0) into v_sons, v_copies from public.owned_of(tgt) o;
  select count(*) into v_tot from public.cards c where not coalesce(c.hidden,false);
  select count(*) into v_alb from (select c.alk from public.cards c left join public.owned_of(tgt) o on o.id = c.id where c.alk like 'al-%' group by c.alk having count(*) >= 3 and bool_and(o.id is not null)) x;
  select count(distinct c.ak) into v_art from public.owned_of(tgt) o join public.cards c on c.id = o.id;
  select count(*) into v_plat from (select c.ak from public.cards c left join public.owned_of(tgt) o on o.id = c.id group by c.ak having count(*) >= 3 and bool_and(o.id is not null)) x;
  select jsonb_object_agg(x.r, x.n) into rc from (select c.r, count(*) n from public.owned_of(tgt) o join public.cards c on c.id = o.id group by c.r) x;
  res := jsonb_build_object('pseudo', pr.pseudo, 'avatar', pr.avatar_url, 'score', coalesce(pr.score,0), 'me', tgt = me, 'pro', pro,
    'since', coalesce(v_st->>'since', pr.created_at::text), 'packs', coalesce((v_st->>'packs')::int, 0),
    'sons', v_sons, 'total', v_tot, 'copies', v_copies, 'doubles', v_copies - v_sons, 'albums', v_alb, 'artists', v_art, 'platine', v_plat,
    'rar', coalesce(rc, '{}'::jsonb));
  if not pro then return res || jsonb_build_object('locked', true); end if;
  -- valeur de la collection : un seul appel groupé (avant : card_value une fois par son)
  select coalesce(sum(v.v * o.n),0) into v_val
    from public.owned_of(tgt) o
    join public.card_values((select array_agg(x.id) from public.owned_of(tgt) x), now()) v on v.id = o.id;
  select coalesce(jsonb_agg(jsonb_build_object('a', x.a, 'n', x.n, 'tot', x.tot) order by x.n desc), '[]'::jsonb) into top from (
    select c.a, count(o.id) n, count(*) tot from public.cards c left join public.owned_of(tgt) o on o.id = c.id
    where c.ak in (select c2.ak from public.owned_of(tgt) o2 join public.cards c2 on c2.id = o2.id)
    group by c.a order by count(o.id) desc limit 5) x;
  select coalesce(jsonb_object_agg(coalesce(x.s,'Autre'), x.n), '{}'::jsonb) into sty from (select c.st s, count(*) n from public.owned_of(tgt) o join public.cards c on c.id = o.id group by c.st) x;
  select coalesce(jsonb_object_agg(x.g, x.n), '{}'::jsonb) into scn from (select c.g, count(*) n from public.owned_of(tgt) o join public.cards c on c.id = o.id group by c.g) x;
  drawn := coalesce((v_st->>'drawn')::int, 0);
  hi := coalesce((v_st->>'r3')::int,0) + coalesce((v_st->>'r4')::int,0) + coalesce((v_st->>'r5')::int,0);
  luck := case when drawn >= 10 then round(100.0 * hi / drawn / (3.15/99.15))::int end;
  if v_st ? 'best' then select jsonb_build_object('id', c.id, 't', c.t, 'a', c.a, 'r', c.r, 'at', v_st->'best'->>'at') into bestc from public.cards c where c.id = v_st->'best'->>'id'; end if;
  select count(*) into v_fr from public.friends f where f.status = 'accepted' and (f.a = tgt or f.b = tgt);
  select count(*) into v_bx from public.bourse_trades b where b.uid = tgt;
  select count(*) into v_tr from public.trades t where t.status = 'accepted' and (t.from_id = tgt or t.to_id = tgt);
  return res || jsonb_build_object('value', v_val, 'drawn', drawn,
    'drawnRar', jsonb_build_object('0',coalesce((v_st->>'r0')::int,0),'1',coalesce((v_st->>'r1')::int,0),'2',coalesce((v_st->>'r2')::int,0),'3',coalesce((v_st->>'r3')::int,0),'4',coalesce((v_st->>'r4')::int,0),'5',coalesce((v_st->>'r5')::int,0)),
    'luck', luck, 'best', bestc, 'top', top, 'styles', sty, 'scenes', scn, 'kinds', coalesce(v_st->'kinds','{}'::jsonb),
    'friends', v_fr, 'bourse', v_bx, 'trades', v_tr, 'last', v_st->>'last', 'dust', coalesce(w.dust,0));
end $function$;
