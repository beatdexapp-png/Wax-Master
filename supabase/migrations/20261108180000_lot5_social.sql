-- Lot 5 : social et marché (points 31 à 39 de LISTE-AMELIORATIONS.md) + récompense Discord.
-- Se greffe sur le lot 4 : la fonction eco du lot 4 devient eco_l4, une nouvelle eco l'enveloppe.
-- Tout ce qui donne quelque chose (drops, wax coins, cartes, numéros) est calculé ici, jamais par le téléphone.
-- Le portefeuille renvoie w.l5 : c'est ce qui allume le front du lot 5. Retour arrière : A-COLLER-SUPABASE-lot5-RETOUR.sql.

do $$ begin
  if to_regprocedure('public.eco_l3(text, jsonb)') is null or to_regprocedure('public.l4_info(public.wallets)') is null then
    raise exception 'Le lot 4 doit être appliqué avant le lot 5';
  end if;
  if to_regprocedure('public.eco_l4(text, jsonb)') is null then
    alter function public.eco(text, jsonb) rename to eco_l4;
  end if;
end $$;
revoke all on function public.eco_l4(text, jsonb) from public, anon, authenticated;

-- ---------- 38. ventes à la Bourse : 10 par jour au lieu de 5 (sans Pro) ----------
do $$ declare d text;
begin
  d := pg_get_functiondef('public.eco_base(text,jsonb)'::regprocedure);
  if strpos(d, '''bsell'')::int, 0) >= 5 then raise exception ''5 ventes') > 0 then
    execute replace(d, '''bsell'')::int, 0) >= 5 then raise exception ''5 ventes', '''bsell'')::int, 0) >= 10 then raise exception ''10 ventes');
  elsif strpos(d, '''bsell'')::int, 0) >= 10 then raise exception ''10 ventes') = 0 then
    raise exception 'Limite de ventes introuvable dans eco_base';
  end if;
  d := pg_get_functiondef('public.bourse_list(text,text,integer)'::regprocedure);
  if strpos(d, '''sells'', 5 -') > 0 then execute replace(d, '''sells'', 5 -', '''sells'', 10 -');
  elsif strpos(d, '''sells'', 10 -') = 0 then raise exception 'Limite de ventes introuvable dans bourse_list'; end if;
end $$;

-- ---------- 37. échange sans doublon obligatoire : on peut donner son seul exemplaire ----------
do $$ declare d text;
begin
  d := pg_get_functiondef('public.propose_trade_base(text,text,text)'::regprocedure);
  if strpos(d, '< 2 then raise exception ''Il te faut ce son en double''') > 0 then
    execute replace(d, '< 2 then raise exception ''Il te faut ce son en double''', '< 1 then raise exception ''Tu n''''as pas ce son''');
  elsif strpos(d, '< 1 then raise exception ''Tu n''''as pas ce son''') = 0 then
    raise exception 'Contrôle du double introuvable dans propose_trade_base';
  end if;
end $$;
revoke all on function public.propose_trade_base(text, text, text) from public, anon, authenticated;

-- fiche d'échange : en plus de ses doubles, les sons qu'il a et qui te manquent (60 au plus, les plus rares d'abord)
create or replace function public.player_card(p_pseudo text)
returns jsonb language plpgsql stable security definer set search_path to '' as $$
declare r record; d jsonb; mi jsonb; mine jsonb;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  select p.id, p.pseudo, p.avatar_url, p.score, w.owned into r from public.profiles p left join public.wallets w on w.uid = p.id where lower(p.pseudo) = lower(trim(p_pseudo));
  if not found then return null; end if;
  select coalesce(jsonb_agg(k order by k), '[]'::jsonb) into d from jsonb_each_text(coalesce(r.owned, '{}'::jsonb)) as e(k, v) where v::int > 1;
  select coalesce(owned, '{}'::jsonb) into mine from public.wallets where uid = auth.uid();
  select coalesce(jsonb_agg(z.id), '[]'::jsonb) into mi from (
    select c.id from jsonb_each_text(coalesce(r.owned, '{}'::jsonb)) e(k, v) join public.cards c on c.id = e.k
    where e.v::int > 0 and not coalesce(c.hidden, false) and coalesce((mine->>e.k)::int, 0) <= 0
    order by c.r desc, c.id limit 60) z;
  return jsonb_build_object('pseudo', r.pseudo, 'avatar', r.avatar_url, 'score', r.score, 'doubles', d, 'miss', mi, 'me', r.id = auth.uid(), 'friend', public.are_friends(auth.uid(), r.id));
end $$;
revoke all on function public.player_card(text) from public, anon;
grant execute on function public.player_card(text) to authenticated;

-- ---------- tables ----------
create table if not exists public.l5_ed_n(card text primary key, n int not null default 0);
create table if not exists public.l5_ed(card text not null, no smallint not null, uid uuid not null, at timestamptz not null default now(), primary key (card, no));
create index if not exists l5_ed_uid on public.l5_ed(uid);
create table if not exists public.l5_pulls(id bigserial primary key, uid uuid not null, card text not null, r smallint not null, no smallint, at timestamptz not null default now());
create index if not exists l5_pulls_at on public.l5_pulls(at);
create table if not exists public.l5_wish(uid uuid not null, card text not null, at timestamptz not null default now(), p0 int, hit_at timestamptz, hit_p int, seen boolean not null default true, primary key (uid, card));
create index if not exists l5_wish_card on public.l5_wish(card);
create table if not exists public.l5_chal(label_id bigint not null, wk text not null, goal int not null, n int not null default 0, primary key (label_id, wk));
create table if not exists public.l5_chal_m(uid uuid not null, wk text not null, label_id bigint not null, n int not null default 0, got boolean not null default false, primary key (uid, wk));
create table if not exists public.discord_codes(uid uuid primary key, code text unique not null, at timestamptz not null default now());
create table if not exists public.discord_links(uid uuid primary key, did text unique not null, dname text, at timestamptz not null default now());
alter table public.l5_ed_n enable row level security; alter table public.l5_ed enable row level security;
alter table public.l5_pulls enable row level security; alter table public.l5_wish enable row level security;
alter table public.l5_chal enable row level security; alter table public.l5_chal_m enable row level security;
alter table public.discord_codes enable row level security; alter table public.discord_links enable row level security;
revoke all on public.l5_ed_n, public.l5_ed, public.l5_pulls, public.l5_wish, public.l5_chal, public.l5_chal_m, public.discord_codes, public.discord_links from anon, authenticated;

-- ---------- 33. éditions numérotées : les 100 premiers exemplaires tirés de chaque son (depuis la mise en service) ----------
create or replace function public.l5_ed_give(p_uid uuid, p_ids text[])
returns jsonb language plpgsql security definer set search_path to '' as $$
declare x text; v int; o jsonb := '{}'::jsonb;
begin
  foreach x in array coalesce(p_ids, '{}'::text[]) loop
    v := null;
    insert into public.l5_ed_n(card, n) values (x, 1)
      on conflict (card) do update set n = public.l5_ed_n.n + 1 where public.l5_ed_n.n < 100 returning n into v;
    if v is not null then
      insert into public.l5_ed(card, no, uid) values (x, v, p_uid) on conflict do nothing;
      if not (o ? x) or (o->>x)::int > v then o := o || jsonb_build_object(x, v); end if;
    end if;
  end loop;
  return o;
end $$;

-- ---------- 32. flux des gros tirages (Légendaire ou mieux) ----------
create or replace function public.l5_pull_log(p_uid uuid, p_ids text[], p_ser jsonb)
returns void language plpgsql security definer set search_path to '' as $$
begin
  insert into public.l5_pulls(uid, card, r, no)
    select p_uid, c.id, c.r, (p_ser->>c.id)::int from (select distinct x from unnest(p_ids) x) z join public.cards c on c.id = z.x
    where c.r >= 3 and not coalesce(c.hidden, false);
  if random() < 0.02 then delete from public.l5_pulls where at < now() - interval '3 days'; end if;
end $$;

-- ---------- 31. défi de la semaine des labels ----------
create or replace function public.l5_chal_def(p_wk text)
returns jsonb language sql immutable set search_path to '' as $$
  select case w % 4
    when 0 then jsonb_build_object('k', 'open', 'per', 20, 't', 'Ouvrez des drops ensemble', 'u', 'drops')
    when 1 then jsonb_build_object('k', 'new', 'per', 25, 't', 'Trouvez des sons nouveaux', 'u', 'sons nouveaux')
    when 2 then jsonb_build_object('k', 'r2', 'per', 8, 't', 'Tirez des Ultra rares ou mieux', 'u', 'Ultra rares ou mieux')
    else jsonb_build_object('k', 'st', 'st', s, 'per', 15, 't', 'Semaine ' || s, 'u', 'sons ' || s) end
  from (select w, (array['Pop', 'R&B', 'Rock', 'Électro', 'Afro', 'Jazz', 'Latino', 'Rap'])[1 + (w / 4) % 8] s
        from (select coalesce(nullif(split_part(p_wk, '-', 2), '')::int, 0) w) a) z
$$;

create or replace function public.l5_chal_add(p_uid uuid, p_ids text[], p_new int)
returns void language plpgsql security definer set search_path to '' as $$
declare v_l bigint; v_wk text := public.label_wk(); df jsonb; k int; nm int;
begin
  select label_id into v_l from public.label_members where uid = p_uid;
  if v_l is null then return; end if;
  df := public.l5_chal_def(v_wk);
  k := case df->>'k' when 'open' then 1 when 'new' then coalesce(p_new, 0)
    when 'r2' then (select count(*) from unnest(p_ids) x join public.cards c on c.id = x where c.r >= 2)
    else (select count(*) from unnest(p_ids) x join public.cards c on c.id = x where c.st = df->>'st') end;
  if coalesce(k, 0) <= 0 then return; end if;
  select count(*) into nm from public.label_members where label_id = v_l;
  insert into public.l5_chal(label_id, wk, goal, n) values (v_l, v_wk, (df->>'per')::int * greatest(3, least(nm, 10)), k)
    on conflict (label_id, wk) do update set n = public.l5_chal.n + k;
  insert into public.l5_chal_m(uid, wk, label_id, n) values (p_uid, v_wk, v_l, k)
    on conflict (uid, wk) do update set n = case when public.l5_chal_m.label_id = v_l then public.l5_chal_m.n + k else k end, label_id = v_l;
end $$;

create or replace function public.l5_chal_me()
returns jsonb language plpgsql stable security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); v_l bigint; v_wk text := public.label_wk(); df jsonb; r public.l5_chal; m public.l5_chal_m; nm int; per int;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  df := public.l5_chal_def(v_wk); per := (df->>'per')::int;
  select label_id into v_l from public.label_members where uid = v_uid;
  if v_l is null then return jsonb_build_object('def', df, 'label', null); end if;
  select * into r from public.l5_chal where label_id = v_l and wk = v_wk;
  select * into m from public.l5_chal_m where uid = v_uid and wk = v_wk;
  select count(*) into nm from public.label_members where label_id = v_l;
  return jsonb_build_object('def', df, 'label', v_l, 'wk', v_wk,
    'goal', coalesce(r.goal, per * greatest(3, least(nm, 10))), 'n', coalesce(r.n, 0),
    'me', case when m.label_id = v_l then m.n else 0 end, 'need', ceil(per / 4.0)::int, 'got', coalesce(m.got, false),
    'end', (date_trunc('week', now() at time zone 'Europe/Paris') + interval '7 days') at time zone 'Europe/Paris',
    'rew', jsonb_build_object('bonus', 3, 'coins', 200));
end $$;

create or replace function public.l5_chal_claim()
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); v_l bigint; v_wk text := public.label_wk(); df jsonb; r public.l5_chal; m public.l5_chal_m;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  select label_id into v_l from public.label_members where uid = v_uid;
  if v_l is null then raise exception 'Rejoins un label'; end if;
  df := public.l5_chal_def(v_wk);
  perform public.w_lock(v_uid);
  select * into r from public.l5_chal where label_id = v_l and wk = v_wk;
  select * into m from public.l5_chal_m where uid = v_uid and wk = v_wk for update;
  if r.label_id is null or r.n < r.goal then raise exception 'Le défi n''est pas encore réussi'; end if;
  if m.uid is null or m.label_id <> v_l or m.n < ceil((df->>'per')::int / 4.0) then raise exception 'Participe un peu plus au défi pour récupérer la récompense'; end if;
  if m.got then raise exception 'Déjà récupéré'; end if;
  update public.l5_chal_m set got = true where uid = v_uid and wk = v_wk;
  update public.wallets set bonus = bonus + 3, coins = coins + 200, updated_at = now() where uid = v_uid;
  update public.profiles p set coins = w.coins from public.wallets w where w.uid = v_uid and p.id = v_uid;
  return public.l5_chal_me();
end $$;

-- ---------- 34. fusion : 5 doubles de même rareté → 1 son (nouveau si possible), chance de monter d'une rareté ----------
create or replace function public.l5_fuse(p_uid uuid, p_a jsonb)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare w public.wallets; ids text[]; own jsonb; r0 int; r1 int; n int; x text; k int; up boolean; rr int; cid text; v_v timestamptz;
  pu numeric[] := array[0.25, 0.20, 0.15, 0.10, 0.03]; ser jsonb;
begin
  if jsonb_typeof(p_a->'ids') is distinct from 'array' or jsonb_array_length(p_a->'ids') <> 5 then raise exception 'Choisis 5 doubles'; end if;
  select array_agg(e) into ids from jsonb_array_elements_text(p_a->'ids') e;
  select min(c.r), max(c.r), count(*) into r0, r1, n from unnest(ids) e join public.cards c on c.id = e;
  if n <> 5 then raise exception 'Son inconnu'; end if;
  if r0 <> r1 then raise exception 'Les 5 doubles doivent avoir la même rareté'; end if;
  if r0 >= 5 then raise exception 'Les Divins ne se fusionnent pas'; end if;
  w := public.w_lock(p_uid); own := coalesce(w.owned, '{}'::jsonb);
  for x, k in select e, count(*)::int from unnest(ids) e group by e loop
    if coalesce((own->>x)::int, 0) < k + 1 then raise exception 'Garde au moins un exemplaire de chaque son : seuls les doubles se fusionnent'; end if;
    own := public.j_add(own, x, -k);
  end loop;
  up := random() < pu[r0 + 1]; rr := r0 + case when up then 1 else 0 end;
  v_v := case when coalesce(p_a->>'v', '') ~ '^[0-9]{4}-' then (p_a->>'v')::timestamptz end;
  select c.id into cid from public.cards c where c.r = rr and not coalesce(c.hidden, false) and (c.src = 'base' or (v_v is not null and c.created_at <= v_v))
    and coalesce((own->>c.id)::int, 0) <= 0 order by random() limit 1;
  if cid is null then
    select c.id into cid from public.cards c where c.r = rr and not coalesce(c.hidden, false) and (c.src = 'base' or (v_v is not null and c.created_at <= v_v)) order by random() limit 1;
  end if;
  if cid is null then raise exception 'Fusion indisponible'; end if;
  own := public.j_add(own, cid, 1);
  update public.wallets set owned = own, updated_at = now() where uid = p_uid;
  ser := public.l5_ed_give(p_uid, array[cid]);
  perform public.l5_pull_log(p_uid, array[cid], ser);
  return jsonb_build_object('card', cid, 'up', up, 'r', rr, 'ser', ser);
end $$;

-- ---------- infos du lot 5 dans le portefeuille ----------
create or replace function public.l5_info(w public.wallets)
returns jsonb language sql stable security definer set search_path to '' as $$
  select jsonb_build_object('v', 1,
    'wh', (select count(*) from public.l5_wish x where x.uid = w.uid and not x.seen),
    'disc', exists (select 1 from public.discord_links d where d.uid = w.uid),
    'fuse', jsonb_build_array(25, 20, 15, 10, 3), 'sells', 10)
$$;

-- ---------- nouvelle eco ----------
create or replace function public.eco(p_op text, p_a jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); w public.wallets; res jsonb; own0 jsonb; ids text[]; nn int := 0; ser jsonb;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  if p_op = 'fuse' then
    res := public.l5_fuse(v_uid, coalesce(p_a, '{}'::jsonb));
    res := res || jsonb_build_object('w', coalesce(public.eco_l4('state', '{}'::jsonb)->'w', '{}'::jsonb));
  else
    if p_op = 'open' then select owned into own0 from public.wallets where uid = v_uid; end if;
    res := public.eco_l4(p_op, p_a);
    if p_op = 'open' and jsonb_typeof(res->'cards') = 'array' then
      select array_agg(e) into ids from jsonb_array_elements_text(res->'cards') e;
      select count(distinct e) into nn from unnest(ids) e where coalesce((coalesce(own0, '{}'::jsonb)->>e)::int, 0) <= 0;
      ser := public.l5_ed_give(v_uid, ids);
      perform public.l5_pull_log(v_uid, ids, ser);
      perform public.l5_chal_add(v_uid, ids, nn);
      res := res || jsonb_build_object('ser', ser);
    elsif p_op = 'bsell' and p_a ? 'id' then
      -- 35. liste de souhaits : un son revendu à la Bourse prévient ceux qui l'attendent
      update public.l5_wish set hit_at = now(), hit_p = (res->>'price')::int, seen = false where card = p_a->>'id' and uid <> v_uid;
    end if;
  end if;
  select * into w from public.wallets where uid = v_uid;
  if w.uid is null then return res; end if;
  return res || jsonb_build_object('w', coalesce(res->'w', '{}'::jsonb) || jsonb_build_object('l5', public.l5_info(w)));
end $$;
revoke all on function public.eco(text, jsonb) from public, anon;
grant execute on function public.eco(text, jsonb) to authenticated;

-- ---------- lectures pour le jeu ----------
create or replace function public.ed_mine()
returns jsonb language sql stable security definer set search_path to '' as $$
  select coalesce(jsonb_object_agg(card, no), '{}'::jsonb) from (select card, min(no) no from public.l5_ed where uid = auth.uid() group by card) z
$$;
create or replace function public.ed_card(p_card text)
returns jsonb language sql stable security definer set search_path to '' as $$
  select jsonb_build_object('n', coalesce((select n from public.l5_ed_n where card = p_card), 0), 'max', 100,
    'first', (select jsonb_build_object('pseudo', p.pseudo, 'at', e.at) from public.l5_ed e left join public.profiles p on p.id = e.uid where e.card = p_card and e.no = 1),
    'mine', (select min(no) from public.l5_ed where card = p_card and uid = auth.uid()))
  where auth.uid() is not null
$$;
create or replace function public.pulls_feed(p_after bigint default 0)
returns jsonb language sql stable security definer set search_path to '' as $$
  select coalesce(jsonb_agg(z order by z.id desc), '[]'::jsonb) from (
    select l.id, l.card, l.r, l.no, l.at, p.pseudo from public.l5_pulls l join public.profiles p on p.id = l.uid
    where auth.uid() is not null and l.id > coalesce(p_after, 0) and l.at > now() - interval '2 days' and p.pseudo is not null
    order by l.id desc limit 20) z
$$;
create or replace function public.bourse_up()
returns jsonb language sql stable security definer set search_path to '' as $$
  with c as (select t.card, max(t.ts) ts from public.bourse_trades t where t.ts > now() - interval '2 days' group by t.card order by max(t.ts) desc limit 80),
  p as (select c.card, public.card_price(c.card) p, public.card_price(c.card, now() - interval '1 day') p0 from c)
  select coalesce(jsonb_agg(jsonb_build_object('id', card, 'p', p, 'chg', round((p - p0) * 100.0 / greatest(p0, 1), 1)) order by (p - p0) * 1.0 / greatest(p0, 1) desc), '[]'::jsonb)
  from (select * from p where p > p0 and auth.uid() is not null order by (p - p0) * 1.0 / greatest(p0, 1) desc limit 10) z
$$;

-- ---------- 35. liste de souhaits ----------
create or replace function public.wish_toggle(p_card text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); n int;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  delete from public.l5_wish where uid = v_uid and card = p_card;
  if found then return jsonb_build_object('on', false); end if;
  if not exists (select 1 from public.cards c where c.id = p_card and not coalesce(c.hidden, false)) then raise exception 'Son inconnu'; end if;
  select count(*) into n from public.l5_wish where uid = v_uid;
  if n >= 50 then raise exception '50 souhaits au plus'; end if;
  insert into public.l5_wish(uid, card, p0) values (v_uid, p_card, public.card_price(p_card));
  return jsonb_build_object('on', true);
end $$;
create or replace function public.wish_list(p_mark boolean default true)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); o jsonb; own jsonb;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  select coalesce(owned, '{}'::jsonb) into own from public.wallets where uid = v_uid;
  select coalesce(jsonb_agg(jsonb_build_object('id', x.card, 'at', x.at, 'p0', x.p0, 'hit', x.hit_at, 'hp', x.hit_p, 'new', not x.seen,
      'p', public.card_price(x.card), 'buy', ceil(public.card_price(x.card) * 1.05)::int, 'own', coalesce((own->>x.card)::int, 0))
    order by (not x.seen) desc, x.hit_at desc nulls last, x.at desc), '[]'::jsonb) into o from public.l5_wish x where x.uid = v_uid;
  if coalesce(p_mark, true) then update public.l5_wish set seen = true where uid = v_uid and not seen; end if;
  return o;
end $$;

-- ---------- 39 + récompense : Discord (code unique, vérifié par le bot du serveur de Jarvis) ----------
create or replace function public.l5_code()
returns text language sql volatile set search_path to '' as $$
  select 'WD-' || string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '') from generate_series(1, 6)
$$;
create or replace function public.discord_me()
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); c text; l public.discord_links; i int := 0;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  select code into c from public.discord_codes where uid = v_uid;
  while c is null and i < 5 loop
    i := i + 1;
    begin
      insert into public.discord_codes(uid, code) values (v_uid, public.l5_code()) on conflict (uid) do nothing;
    exception when unique_violation then null;
    end;
    select code into c from public.discord_codes where uid = v_uid;
  end loop;
  select * into l from public.discord_links where uid = v_uid;
  return jsonb_build_object('code', c, 'claimed', l.uid is not null, 'name', l.dname, 'at', l.at, 'n', 5,
    'invite', (select g.v->>'invite' from public.game_cfg g where g.k = 'discord'));
end $$;

-- le bot prouve qui il est avec un secret dont seule l'empreinte est en base (private_cfg, k = 'discord_bot')
create or replace function public.l5_bot_ok(p_secret text)
returns boolean language sql stable security definer set search_path to '' as $$
  select coalesce(length(p_secret), 0) >= 32 and exists (select 1 from public.private_cfg where k = 'discord_bot' and v = encode(sha256(convert_to(p_secret, 'UTF8')), 'hex'))
$$;
create or replace function public.discord_redeem(p_secret text, p_code text, p_did text, p_dname text default null)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_uid uuid; born timestamptz; ps text; lk public.discord_links;
begin
  if not public.l5_bot_ok(p_secret) then raise exception 'Refusé'; end if;
  if coalesce(p_did, '') !~ '^[0-9]{15,21}$' then return jsonb_build_object('ok', false, 'why', 'id'); end if;
  born := to_timestamp((div(p_did::numeric, 4194304) + 1420070400000) / 1000.0);
  if born > now() - interval '7 days' then return jsonb_build_object('ok', false, 'why', 'jeune'); end if;
  select uid into v_uid from public.discord_codes where code = upper(trim(coalesce(p_code, '')));
  if v_uid is null then return jsonb_build_object('ok', false, 'why', 'code'); end if;
  select * into lk from public.discord_links where did = p_did;
  if lk.uid is not null then return jsonb_build_object('ok', false, 'why', case when lk.uid = v_uid then 'deja' else 'discord_deja' end); end if;
  if exists (select 1 from public.discord_links where uid = v_uid) then return jsonb_build_object('ok', false, 'why', 'compte_deja'); end if;
  perform public.w_lock(v_uid);
  insert into public.discord_links(uid, did, dname) values (v_uid, p_did, left(p_dname, 64));
  update public.wallets set bonus = bonus + 5, updated_at = now() where uid = v_uid;
  select pseudo into ps from public.profiles where id = v_uid;
  return jsonb_build_object('ok', true, 'pseudo', ps, 'n', 5);
end $$;
-- rôle Pro automatique : comptes Discord liés et abonnement Pro en cours
create or replace function public.discord_pro(p_secret text)
returns jsonb language plpgsql stable security definer set search_path to '' as $$
begin
  if not public.l5_bot_ok(p_secret) then raise exception 'Refusé'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('did', l.did, 'pro', coalesce(w.pass_until > now(), false))), '[]'::jsonb)
    from public.discord_links l left join public.wallets w on w.uid = l.uid);
end $$;

-- ---------- droits ----------
revoke all on function public.l5_ed_give(uuid, text[]), public.l5_pull_log(uuid, text[], jsonb), public.l5_chal_add(uuid, text[], integer),
  public.l5_fuse(uuid, jsonb), public.l5_info(public.wallets), public.l5_code(), public.l5_bot_ok(text) from public, anon, authenticated;
revoke all on function public.l5_chal_me(), public.l5_chal_claim(), public.ed_mine(), public.ed_card(text), public.pulls_feed(bigint), public.bourse_up(),
  public.wish_toggle(text), public.wish_list(boolean), public.discord_me() from public, anon;
grant execute on function public.l5_chal_me(), public.l5_chal_claim(), public.ed_mine(), public.ed_card(text), public.pulls_feed(bigint), public.bourse_up(),
  public.wish_toggle(text), public.wish_list(boolean), public.discord_me() to authenticated;
revoke all on function public.discord_redeem(text, text, text, text), public.discord_pro(text) from public;
grant execute on function public.discord_redeem(text, text, text, text), public.discord_pro(text) to anon, authenticated;
grant execute on function public.l5_chal_def(text) to authenticated;
