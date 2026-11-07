-- WaxDrop, lot 4 « Choix et acquisition » + audit sécurité (08/11/2026). Tout est vérifié et accordé par le serveur.
-- 25. Drop par style et par époque : le joueur choisit un booster, les 5 cartes viennent de ce style ou de cette époque.
-- 26. Artiste du jour (2 sons de l'artiste garantis) et sortie de la semaine (2 sons de l'album garantis).
-- 27. Compteur de garantie : un Mythique ou mieux au plus tard au 60e drop sans Mythique. Taux publics = poids de draw_card2 (inchangés).
-- 28. Parrainage : le parrain n'est payé que quand le filleul a ouvert 10 drops sur au moins 2 jours différents ; paliers à badge (1, 3, 10, 25).
-- 29. Anti-triche : un identifiant d'appareil par navigateur ; échanges fermés les 3 premiers jours d'un compte
--     et entre deux comptes du même appareil ; pas de parrainage entre comptes du même appareil.
-- 30. Audit : webhook Stripe (remboursements et litiges, lien Pro vérifié), colonnes de profiles protégées, fonctions réservées aux comptes.
-- PRÉREQUIS : le lot 3 (A-COLLER-SUPABASE-lot3.sql) doit être collé avant. Retour arrière : A-COLLER-SUPABASE-lot4-RETOUR.sql.

do $$ begin
  if to_regprocedure('public.eco_base(text, jsonb)') is null or to_regclass('public.week_pts') is null then
    raise exception 'Colle d''abord A-COLLER-SUPABASE-lot3.sql : le lot 4 se greffe sur le lot 3';
  end if;
  if to_regprocedure('public.eco_l3(text, jsonb)') is null then
    alter function public.eco(text, jsonb) rename to eco_l3;
  end if;
end $$;
revoke all on function public.eco_l3(text, jsonb) from public, anon, authenticated;

-- ---------- tables ----------
create table if not exists public.devices(
  dev text not null, uid uuid not null references auth.users(id) on delete cascade,
  fp text, ip text, first_at timestamptz not null default now(), last_at timestamptz not null default now(),
  primary key (dev, uid));
create index if not exists devices_uid on public.devices(uid);
create index if not exists devices_fp on public.devices(fp, ip);
alter table public.devices enable row level security;   -- aucune politique : invisible pour les joueurs

create table if not exists public.l4_daily(d date primary key, ak text, a text, styles jsonb, eras jsonb, sorties jsonb, at timestamptz default now());
alter table public.l4_daily enable row level security;

-- parrainages : existants considérés comme payés (ils l'ont été tout de suite avec l'ancienne règle)
do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'referrals' and column_name = 'paid_at') then
    alter table public.referrals add column paid_at timestamptz;
    alter table public.referrals add column state text not null default 'ok';
    update public.referrals set paid_at = coalesce(at, now());
  end if;
end $$;

-- achats : identifiant de paiement Stripe pour retrouver un remboursement
alter table public.purchases add column if not exists pi text;
alter table public.purchases add column if not exists refunded_at timestamptz;

-- ---------- outils ----------
create or replace function public.l4_day() returns date language sql stable set search_path to '' as $$
  select (now() at time zone 'Europe/Paris')::date $$;

-- boosters du jour : calculés une fois par jour (artiste du jour, sorties récentes, styles et époques assez fournis)
create or replace function public.l4_daily_get() returns public.l4_daily
language plpgsql security definer set search_path to '' as $$
declare r public.l4_daily; v_d date := public.l4_day();
begin
  select * into r from public.l4_daily where d = v_d;
  if found then return r; end if;
  insert into public.l4_daily(d, ak, a, styles, eras, sorties)
  select v_d,
    (select x.ak from (select c.ak, count(*) n from public.cards c where not coalesce(c.hidden, false) and c.ak is not null group by c.ak having count(*) >= 40) x
       order by md5(x.ak || v_d::text) limit 1),
    null,
    (select coalesce(jsonb_agg(jsonb_build_object('k', s.st, 'n', s.n) order by s.n desc), '[]') from
       (select c.st, count(*) n from public.cards c where not coalesce(c.hidden, false) and c.st is not null group by c.st having count(*) >= 300) s),
    (select coalesce(jsonb_agg(jsonb_build_object('k', e.k, 'n', e.n) order by e.k), '[]') from
       (select case when c.y < 1990 then '1960' when c.y < 2000 then '1990' when c.y < 2010 then '2000' when c.y < 2020 then '2010' else '2020' end k, count(*) n
          from public.cards c where not coalesce(c.hidden, false) and c.y is not null and c.y <= extract(year from now())::int group by 1 having count(*) >= 300) e),
    (select coalesce(jsonb_agg(jsonb_build_object('alk', z.alk, 'a', z.a, 'at', z.c) order by z.c desc), '[]') from
       (select c.alk, min(c.a) a, min(c.created_at) c from public.cards c
          where not coalesce(c.hidden, false) and c.alk like 'al-%' and c.created_at > now() - interval '30 days' and c.created_at <= now() - interval '1 hour'
          group by c.alk having count(*) >= 8 order by min(c.created_at) desc limit 3) z)
  on conflict (d) do nothing;
  update public.l4_daily l set a = (select c.a from public.cards c where c.ak = l.ak limit 1) where l.d = v_d and l.a is null;
  select * into r from public.l4_daily where d = v_d;
  return r;
end $$;

-- un booster demandé par le jeu -> filtre de tirage (ou refus)
create or replace function public.l4_pool(p text) returns jsonb
language plpgsql security definer set search_path to '' as $$
declare r public.l4_daily := public.l4_daily_get(); k text := split_part(p, ':', 1); v text := substr(p, length(split_part(p, ':', 1)) + 2); y0 int;
begin
  if k = 'st' and exists (select 1 from jsonb_array_elements(r.styles) x where x->>'k' = v) then return jsonb_build_object('st', v, 'n', 5);
  elsif k = 'era' and exists (select 1 from jsonb_array_elements(r.eras) x where x->>'k' = v) then
    y0 := v::int; return jsonb_build_object('y0', case when y0 = 1960 then 0 else y0 end, 'y1', case when y0 = 2020 then 9999 when y0 = 1960 then 1989 else y0 + 9 end, 'n', 5);
  elsif k = 'art' and v = r.ak then return jsonb_build_object('ak', v, 'n', 2);
  elsif k = 'alb' and exists (select 1 from jsonb_array_elements(r.sorties) x where x->>'alk' = v) then return jsonb_build_object('alk', v, 'n', 2);
  end if;
  raise exception 'Ce booster n''est pas disponible aujourd''hui';
end $$;

-- tirage d'une carte : mêmes poids qu'avant (62 / 26 / 8 / 2,5 / 0,6 / 0,05), plus le booster choisi et la garantie.
-- wd.pool (filtre) et wd.force (rareté minimale) ne sont posés que par eco, le temps d'une ouverture.
create or replace function public.draw_card2(minr integer, boost jsonb, ev jsonb, p_v timestamptz)
returns text language plpgsql security definer set search_path to '' as $function$
declare wt numeric[] := array[62,26,8,2.5,0.6,0.05]; tot numeric := 0; roll numeric; rr int := minr; i int; cid text;
  arts text[]; gen text; mult numeric; tops text[]; stys text[];
  pl jsonb := nullif(current_setting('wd.pool', true), '')::jsonb; pn int; fr int := nullif(current_setting('wd.force', true), '')::int;
begin
  for i in 0..5 loop wt[i+1] := wt[i+1] * coalesce((boost->>(i::text))::numeric, 1); end loop;
  if ev ? 'divin' then wt[6] := wt[6] * (ev->>'divin')::numeric; end if;
  for i in minr..5 loop tot := tot + wt[i+1]; end loop;
  roll := random() * tot;
  for i in minr..5 loop roll := roll - wt[i+1]; if roll <= 0 then rr := i; exit; end if; end loop;
  if fr is not null then if rr < fr then rr := fr; end if; perform set_config('wd.force', '', true); end if;
  if pl is not null then pn := coalesce((pl->>'n')::int, 0);
    if pn <= 0 then pl := null; else perform set_config('wd.pool', (pl || jsonb_build_object('n', pn - 1))::text, true); end if;
  end if;
  if ev ? 'artists' then select array_agg(x) into arts from jsonb_array_elements_text(ev->'artists') x; end if;
  if jsonb_typeof(ev->'top') = 'array' then select array_agg(x) into tops from jsonb_array_elements_text(ev->'top') x; end if;
  if jsonb_typeof(ev->'sty') = 'array' then select array_agg(x) into stys from jsonb_array_elements_text(ev->'sty') x; end if;
  gen := ev->>'genre'; mult := coalesce((ev->>'mult')::numeric, 1);
  loop
    if pl is not null then
      select c.id into cid from public.cards c where c.r = rr and not coalesce(c.hidden,false) and (c.src = 'base' or (p_v is not null and c.created_at <= p_v))
        and (pl->>'st' is null or c.st = pl->>'st')
        and (pl->>'y0' is null or c.y between (pl->>'y0')::int and (pl->>'y1')::int)
        and (pl->>'ak' is null or c.ak = pl->>'ak')
        and (pl->>'alk' is null or c.alk = pl->>'alk')
        order by random() limit 1;
      -- artiste ou album sans carte de cette rareté : sa meilleure carte en dessous (jamais au-dessus)
      if cid is null and (pl ? 'ak' or pl ? 'alk') then
        select c.id into cid from public.cards c where c.r < rr and not coalesce(c.hidden,false) and (c.src = 'base' or (p_v is not null and c.created_at <= p_v))
          and (pl->>'ak' is null or c.ak = pl->>'ak') and (pl->>'alk' is null or c.alk = pl->>'alk')
          order by c.r desc, random() limit 1;
      end if;
      exit when cid is not null;
    end if;
    select c.id into cid from public.cards c where c.r = rr and not coalesce(c.hidden,false) and (c.src = 'base' or (p_v is not null and c.created_at <= p_v))
      order by -ln(1 - random()) / ((case c.g when 'FR' then 1.6 else 1 end)
        * (case when arts is not null and c.a = any(arts) then mult else 1 end)
        * (case when gen is not null and c.g = gen then mult else 1 end)
        * (case when tops is not null and c.ak = any(tops) then 3 else 1 end)
        * (case when stys is not null and c.st = any(stys) then 2.5 else 1 end))
      limit 1;
    exit when cid is not null or rr = 0;
    rr := rr - 1;
  end loop;
  return cid;
end $function$;

-- appareils : deux comptes partagent-ils un appareil (même identifiant, ou même empreinte depuis la même adresse) ?
create or replace function public.l4_dup(a uuid, b uuid) returns boolean language sql stable security definer set search_path to '' as $$
  select exists (select 1 from public.devices x join public.devices y on y.uid = b and (y.dev = x.dev or (x.fp is not null and x.fp = y.fp and x.ip is not null and x.ip = y.ip)) where x.uid = a) $$;
-- compte de moins de 3 jours (date d'auth.users, que le joueur ne peut pas modifier)
create or replace function public.l4_young(u uuid) returns boolean language sql stable security definer set search_path to '' as $$
  select coalesce((select created_at > now() - interval '3 days' from auth.users where id = u), true) $$;

-- parrainage : paie le parrain quand le filleul a vraiment joué (10 drops, sur 2 jours différents au moins)
create or replace function public.l4_ref_pay(p_uid uuid) returns void
language plpgsql security definer set search_path to '' as $$
declare rf record; s jsonb; n int;
begin
  select * into rf from public.referrals where referee = p_uid and paid_at is null and state = 'ok' for update;
  if not found then return; end if;
  select stats into s from public.wallets where uid = p_uid;
  if coalesce((s->>'packs')::int, 0) < 10 then return; end if;
  if ((s->>'since')::timestamptz at time zone 'Europe/Paris')::date >= ((s->>'last')::timestamptz at time zone 'Europe/Paris')::date then return; end if;
  if public.l4_dup(p_uid, rf.referrer) then update public.referrals set state = 'meme_appareil' where referee = p_uid; return; end if;
  update public.referrals set paid_at = now() where referee = p_uid;
  select count(*) into n from public.referrals where referrer = rf.referrer and paid_at is not null;
  perform public.w_lock(rf.referrer);
  update public.wallets set bonus = bonus + 2, coins = coins + 150,
    gold = gold + case n when 3 then 1 when 10 then 2 when 25 then 3 else 0 end, updated_at = now() where uid = rf.referrer;
  update public.profiles p set coins = w.coins from public.wallets w where w.uid = p.id and p.id = rf.referrer;
end $$;

create or replace function public.l4_info(w public.wallets) returns jsonb
language plpgsql security definer set search_path to '' as $$
declare r public.l4_daily := public.l4_daily_get();
begin
  return jsonb_build_object('pity', coalesce((w.claims->'l4'->>'pity')::int, 0), 'every', 60,
    'day', jsonb_build_object('ak', r.ak, 'a', r.a), 'sorties', r.sorties, 'styles', r.styles, 'eras', r.eras,
    'young', public.l4_young(w.uid));
end $$;

revoke all on function public.l4_daily_get(), public.l4_pool(text), public.l4_dup(uuid, uuid), public.l4_young(uuid), public.l4_ref_pay(uuid),
  public.l4_info(public.wallets), public.draw_card2(integer, jsonb, jsonb, timestamptz) from public, anon, authenticated;

-- ---------- nouvelle eco (enveloppe celle du lot 3) ----------
create or replace function public.eco(p_op text, p_a jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); w public.wallets; res jsonb; kind text; p text; pity int := 0; mx int; cnt boolean := false;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  if p_op = 'open' then
    kind := coalesce(p_a->>'kind', 'std'); p := nullif(p_a->>'pool', '');
    if p is not null then
      if kind not in ('free', 'std') then raise exception 'Ce booster s''ouvre avec un drop gratuit ou normal'; end if;
      perform set_config('wd.pool', public.l4_pool(p)::text, true);
    end if;
    if kind in ('free', 'std', 'gold', 'nacre', 'diamant') then
      cnt := true;
      select coalesce((claims->'l4'->>'pity')::int, 0) into pity from public.wallets where uid = v_uid;
      if coalesce(pity, 0) >= 59 then perform set_config('wd.force', '4', true); end if;
    end if;
  end if;

  res := public.eco_l3(p_op, p_a);
  perform set_config('wd.pool', '', true); perform set_config('wd.force', '', true);

  if cnt then
    select max(c.r) into mx from jsonb_array_elements_text(coalesce(res->'cards', '[]'::jsonb)) x join public.cards c on c.id = x;
    update public.wallets set claims = jsonb_set(coalesce(claims, '{}'::jsonb), '{l4}',
      coalesce(claims->'l4', '{}'::jsonb) || jsonb_build_object('pity', case when coalesce(mx, 0) >= 4 then 0 else coalesce(pity, 0) + 1 end)) where uid = v_uid;
    perform public.l4_ref_pay(v_uid);
  end if;

  select * into w from public.wallets where uid = v_uid;
  if w.uid is null then return res; end if;
  return res || jsonb_build_object('w', coalesce(res->'w', '{}'::jsonb) || jsonb_build_object('l4', public.l4_info(w)));
end $$;
revoke all on function public.eco(text, jsonb) from public, anon;
grant execute on function public.eco(text, jsonb) to authenticated;

-- ---------- appareils ----------
create or replace function public.device_seen(p_dev text, p_fp text default null)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); v_ip text; n int;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  if coalesce(p_dev, '') !~ '^[A-Za-z0-9_-]{16,64}$' then raise exception 'Appareil inconnu'; end if;
  v_ip := nullif(split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1), '');
  insert into public.devices(dev, uid, fp, ip) values (p_dev, v_uid, left(p_fp, 64), v_ip)
    on conflict (dev, uid) do update set last_at = now(), fp = coalesce(excluded.fp, public.devices.fp), ip = coalesce(excluded.ip, public.devices.ip);
  -- autres comptes, créés avant celui-ci, vus sur cet appareil
  select count(distinct d.uid) into n from public.devices d join auth.users u on u.id = d.uid
    where d.uid <> v_uid and (d.dev = p_dev or (p_fp is not null and d.fp = left(p_fp, 64) and d.ip = v_ip))
      and u.created_at < (select created_at from auth.users where id = v_uid);
  return jsonb_build_object('dup', n > 0, 'young', public.l4_young(v_uid));
end $$;
revoke all on function public.device_seen(text, text) from public, anon;
grant execute on function public.device_seen(text, text) to authenticated;

-- ---------- échanges : fermés aux comptes neufs et entre comptes du même appareil ----------
do $$ begin
  if to_regprocedure('public.propose_trade_base(text, text, text)') is null then
    alter function public.propose_trade(text, text, text) rename to propose_trade_base;
  end if;
  if to_regprocedure('public.respond_trade_base(bigint, boolean)') is null then
    alter function public.respond_trade(bigint, boolean) rename to respond_trade_base;
  end if;
end $$;
revoke all on function public.propose_trade_base(text, text, text), public.respond_trade_base(bigint, boolean) from public, anon, authenticated;

create or replace function public.propose_trade(p_to text, p_give text, p_want text)
returns public.trades language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); tgt uuid;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  if public.l4_young(v_uid) then raise exception 'Les échanges s''ouvrent 3 jours après la création de ton compte'; end if;
  select id into tgt from public.profiles where lower(pseudo) = lower(trim(p_to));
  if tgt is not null and public.l4_young(tgt) then raise exception 'Ce joueur pourra échanger 3 jours après la création de son compte'; end if;
  if tgt is not null and public.l4_dup(v_uid, tgt) then raise exception 'Échange impossible entre deux comptes du même appareil'; end if;
  return public.propose_trade_base(p_to, p_give, p_want);
end $$;
create or replace function public.respond_trade(p_id bigint, p_accept boolean)
returns public.trades language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); fr uuid;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  if p_accept then
    select from_id into fr from public.trades where id = p_id and to_id = v_uid;
    if public.l4_young(v_uid) then raise exception 'Les échanges s''ouvrent 3 jours après la création de ton compte'; end if;
    if fr is not null and public.l4_dup(v_uid, fr) then raise exception 'Échange impossible entre deux comptes du même appareil'; end if;
  end if;
  return public.respond_trade_base(p_id, p_accept);
end $$;
revoke all on function public.propose_trade(text, text, text), public.respond_trade(bigint, boolean) from public, anon;
grant execute on function public.propose_trade(text, text, text), public.respond_trade(bigint, boolean) to authenticated;

-- ---------- parrainage : récompense du parrain différée ----------
create or replace function public.friend_invite(p_code text)
returns text language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); tgt uuid; nm text; v_new boolean; n int; rew boolean := false; dup boolean;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  select id, pseudo into tgt, nm from public.profiles where invite_code = trim(p_code);
  if tgt is null or tgt = v_uid then return null; end if;
  insert into public.friends(a, b, status) values (tgt, v_uid, 'accepted')
    on conflict (least(a, b), greatest(a, b)) do update set status = 'accepted';
  -- compte de moins de 7 jours (date d'auth.users), une seule fois, 50 filleuls max, jamais entre comptes du même appareil
  select coalesce(created_at > now() - interval '7 days', false) into v_new from auth.users where id = v_uid;
  select count(*) into n from public.referrals where referrer = tgt;
  dup := public.l4_dup(v_uid, tgt);
  if v_new and n < 50 and not exists (select 1 from public.referrals where referee = v_uid)
     and not exists (select 1 from public.referrals where referee = tgt and referrer = v_uid) then
    insert into public.referrals(referee, referrer, paid_at, state) values (v_uid, tgt, null, case when dup then 'meme_appareil' else 'ok' end);
    if not dup then
      insert into public.wallets(uid) values (v_uid) on conflict do nothing;
      update public.wallets set bonus = bonus + 2, coins = coins + 100, updated_at = now() where uid = v_uid;
      update public.profiles p set coins = w.coins from public.wallets w where w.uid = p.id and p.id = v_uid;
      rew := true;
    end if;
  end if;
  return nm || case when rew then '|ref' else '' end;
end $$;
revoke all on function public.friend_invite(text) from public, anon;
grant execute on function public.friend_invite(text) to authenticated;

create or replace function public.referral_me()
returns jsonb language plpgsql stable security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); paid int; pend int; tiers int[] := array[1, 3, 10, 25]; t int := 0; i int;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  select count(*) filter (where paid_at is not null), count(*) filter (where paid_at is null and state = 'ok') into paid, pend
    from public.referrals where referrer = v_uid;
  for i in 1..4 loop if paid >= tiers[i] then t := i; end if; end loop;
  return jsonb_build_object('paid', paid, 'pending', pend, 'tier', t, 'next', case when t < 4 then tiers[t + 1] end,
    'list', (select coalesce(jsonb_agg(jsonb_build_object('pseudo', p.pseudo, 'paid', r.paid_at is not null,
        'packs', least(coalesce((w.stats->>'packs')::int, 0), 10)) order by r.at desc), '[]') from public.referrals r
      join public.profiles p on p.id = r.referee left join public.wallets w on w.uid = r.referee
      where r.referrer = v_uid and r.state = 'ok' and r.paid_at is null));
end $$;
revoke all on function public.referral_me() from public, anon;
grant execute on function public.referral_me() to authenticated;

-- ---------- vitrine : vrais chiffres pour la page d'accueil (lisibles sans compte) ----------
create or replace function public.public_pulse()
returns jsonb language sql stable security definer set search_path to '' as $$
  select jsonb_build_object(
    'players', (select count(*) from public.profiles where pseudo is not null),
    'drops', (select coalesce(sum((stats->>'packs')::bigint), 0) from public.wallets),
    'today', (select count(*) from public.wallets where (stats->>'last')::timestamptz >= (date_trunc('day', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris')),
    'recent', (select coalesce(jsonb_agg(z order by z.at desc), '[]') from (
        select w.stats->'best'->>'id' id, (w.stats->'best'->>'r')::int r, (w.stats->'best'->>'at')::timestamptz at, p.pseudo
        from public.wallets w join public.profiles p on p.id = w.uid
        where p.pseudo is not null and (w.stats->'best'->>'r')::int >= 3 and (w.stats->'best'->>'at')::timestamptz > now() - interval '7 days'
        order by (w.stats->'best'->>'at')::timestamptz desc limit 12) z)) $$;
revoke all on function public.public_pulse() from public;
grant execute on function public.public_pulse() to anon, authenticated;

-- ---------- audit 30 : Stripe ----------
-- Inchangé et sain : signature vérifiée par la fonction Edge stripe-webhook, événements rejoués ignorés, montant crédité fixé par le lien de paiement.
-- Ajouts : lien Pro vérifié, paiement différé (async) crédité quand il réussit, remboursement et litige reprennent ce qui a été donné.
-- Pour les remboursements et litiges, Alexi doit cocher dans Stripe (Développeurs > Webhooks) : charge.refunded, charge.dispute.created,
-- checkout.session.async_payment_succeeded. Rien n'est changé dans le compte Stripe par ce fichier.
create or replace function public.stripe_apply(p_event jsonb)
returns text language plpgsql security definer set search_path to '' as $function$
declare t text := p_event->>'type'; o jsonb := p_event->'data'->'object'; v_uid uuid; v_n int; v_until timestamptz; v_sub text; pu record;
begin
  if exists (select 1 from public.stripe_events where id = p_event->>'id') then return 'dup'; end if;
  if t in ('checkout.session.completed', 'checkout.session.async_payment_succeeded') then
    if coalesce(o->>'client_reference_id', '') !~ '^[0-9a-f-]{36}$' then
      insert into public.stripe_events(id, type, data) values (p_event->>'id', t, o); return 'no-user'; end if;
    v_uid := (o->>'client_reference_id')::uuid;
    if not exists (select 1 from public.profiles where id = v_uid) then
      insert into public.stripe_events(id, type, data) values (p_event->>'id', t, o); return 'unknown-user'; end if;
    if coalesce(o->>'payment_status', '') <> 'paid' then
      insert into public.stripe_events(id, type, uid, data) values (p_event->>'id', t, v_uid, o); return 'unpaid'; end if;
    if exists (select 1 from public.purchases where session = o->>'id') then
      insert into public.stripe_events(id, type, uid, data) values (p_event->>'id', t, v_uid, o); return 'dup-session'; end if;
    perform public.w_lock(v_uid);
    if o->>'mode' = 'subscription' then
      if coalesce(o->>'payment_link', '') <> 'plink_1UQDXvCpQcu4qQ3qcFt7s5cV' then
        insert into public.stripe_events(id, type, uid, data) values (p_event->>'id', t, v_uid, o); return 'unknown-link'; end if;
      v_sub := o->>'subscription';
      v_until := now() + interval '32 days';
      insert into public.stripe_subs(sub, uid, customer, status, until) values (v_sub, v_uid, o->>'customer', 'active', v_until)
        on conflict (sub) do update set uid = excluded.uid, status = 'active', until = greatest(public.stripe_subs.until, excluded.until), updated_at = now();
      update public.wallets set pass_until = greatest(coalesce(pass_until, now()), v_until) where uid = v_uid;
      insert into public.purchases(uid, kind, amount, currency, session, pi) values (v_uid, 'pass', (o->>'amount_total')::int, o->>'currency', o->>'id', o->>'payment_intent') on conflict (session) do nothing;
    else
      v_n := case o->>'payment_link'
        when 'plink_1UQ36TCpQcu4qQ3qlEl9MExO' then 500 when 'plink_1UQ36XCpQcu4qQ3q7T3EsnQ2' then 1200
        when 'plink_1UQ36aCpQcu4qQ3qH2SRO8UT' then 2600 when 'plink_1UQ36eCpQcu4qQ3qnmNMrfHP' then 6500
        when 'plink_1UQDXxCpQcu4qQ3quBE4qggO' then 500 when 'plink_1UQDXzCpQcu4qQ3q3jcokwla' then 1200
        when 'plink_1UQDY1CpQcu4qQ3qxuy9KydQ' then 3000 when 'plink_1UQDY3CpQcu4qQ3qbD7NUKQ7' then 7000 end;
      if v_n is null then insert into public.stripe_events(id, type, uid, data) values (p_event->>'id', t, v_uid, o); return 'unknown-link'; end if;
      update public.wallets set coins = coins + v_n where uid = v_uid;
      insert into public.purchases(uid, kind, coins, amount, currency, session, pi) values (v_uid, 'coins', v_n, (o->>'amount_total')::int, o->>'currency', o->>'id', o->>'payment_intent') on conflict (session) do nothing;
    end if;
  elsif t = 'invoice.paid' then
    v_sub := coalesce(o->>'subscription', o->'parent'->'subscription_details'->>'subscription');
    select uid into v_uid from public.stripe_subs where sub = v_sub;
    if v_uid is not null then
      v_until := to_timestamp(coalesce((o->'lines'->'data'->0->'period'->>'end')::bigint, extract(epoch from now() + interval '31 days')::bigint)) + interval '1 day';
      update public.stripe_subs set status = 'active', until = greatest(until, v_until), updated_at = now() where sub = v_sub;
      update public.wallets set pass_until = greatest(coalesce(pass_until, now()), v_until) where uid = v_uid;
    end if;
  elsif t = 'customer.subscription.deleted' then
    select uid into v_uid from public.stripe_subs where sub = o->>'id';
    if v_uid is not null then
      update public.stripe_subs set status = 'canceled', until = now(), updated_at = now() where sub = o->>'id';
      update public.wallets set pass_until = now() where uid = v_uid;
    end if;
  elsif t in ('charge.refunded', 'charge.dispute.created') then
    -- achat de wax coins retrouvé par son paiement : on reprend les wax coins (sans descendre sous 0)
    select * into pu from public.purchases where pi = o->>'payment_intent' and o->>'payment_intent' is not null and refunded_at is null limit 1;
    if found then
      v_uid := pu.uid;
      if pu.kind = 'coins' then update public.wallets set coins = greatest(coins - coalesce(pu.coins, 0), 0) where uid = pu.uid;
      else update public.wallets set pass_until = now() where uid = pu.uid; end if;
      update public.purchases set refunded_at = now() where session = pu.session;
    else
      -- abonnement Pro : retrouvé par le client Stripe
      select uid into v_uid from public.stripe_subs where customer = o->>'customer' order by updated_at desc nulls last limit 1;
      if v_uid is not null then
        update public.stripe_subs set status = 'refunded', until = now(), updated_at = now() where customer = o->>'customer';
        update public.wallets set pass_until = now() where uid = v_uid;
      end if;
    end if;
  end if;
  insert into public.stripe_events(id, type, uid, data) values (p_event->>'id', t, v_uid, o);
  return 'ok';
end $function$;
revoke all on function public.stripe_apply(jsonb) from public, anon, authenticated;

-- ---------- audit 30 : colonnes de profiles que le joueur ne doit pas changer ----------
-- La politique « profil modifiable par son joueur » laisse modifier toute la ligne. On garde ce que le jeu envoie
-- (pseudo, state, score, avatar) et on fige le reste : wax coins (la vraie valeur est dans wallets), date de création, code d'invitation.
create or replace function public.profiles_guard() returns trigger
language plpgsql set search_path to '' as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.id := old.id; new.coins := old.coins; new.created_at := old.created_at; new.invite_code := old.invite_code;
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles for each row execute function public.profiles_guard();

-- ---------- audit 30 : fonctions réservées aux comptes (un visiteur sans compte ne peut plus les appeler) ----------
do $$ declare f text; begin
  foreach f in array array['public.ach_claim_all()', 'public.label_claim(integer)', 'public.label_create(text, text)', 'public.label_join(text)',
    'public.label_kick(uuid)', 'public.label_leave()', 'public.label_me()', 'public.cards_sync_st()', 'public.catalog_cache_refresh()'] loop
    if to_regprocedure(f) is not null then
      execute 'revoke execute on function ' || f || ' from public, anon';
      execute 'grant execute on function ' || f || ' to authenticated';
    end if;
  end loop;
end $$;
