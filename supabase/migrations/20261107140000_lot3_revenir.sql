-- WaxDrop, lot 3 « Faire revenir les joueurs » (07/11/2026). Tout est calculé et accordé par le serveur.
-- 20. Réserve de drops gratuits : jusqu'à 10, un toutes les 10 min (5 min avec Pro), remplie pendant l'absence.
-- 21. Série de 7 jours : récompense qui monte, protège-série (1 jour raté pardonné par semaine de série).
-- 22. Classement de la semaine (points gagnés au jeu, remis à zéro le lundi 00:00 heure de Paris).
-- 23. Missions du jour choisies par le serveur + « changer cette mission » (1 fois par jour) + défi d'artiste.
-- 24. Notifications web push : abonnements + liste des envois dus (l'envoi lui-même est fait par la fonction Edge « push »).
-- Méthode : la fonction eco existante est renommée eco_base (inchangée, plus appelable par les joueurs)
-- et une nouvelle eco l'enveloppe. Retour arrière : A-COLLER-SUPABASE-lot3-RETOUR.sql.

-- ---------- tables ----------
create table if not exists public.week_pts(
  uid uuid not null references auth.users on delete cascade,
  wk text not null,
  pts int not null default 0,
  primary key (uid, wk)
);
create index if not exists week_pts_wk_pts on public.week_pts (wk, pts desc);
alter table public.week_pts enable row level security;
revoke all on public.week_pts from anon, authenticated;

create table if not exists public.push_subs(
  endpoint text primary key,
  uid uuid not null references auth.users on delete cascade,
  p256dh text not null,
  auth text not null,
  sent jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists push_subs_uid on public.push_subs (uid);
alter table public.push_subs enable row level security;
revoke all on public.push_subs from anon, authenticated;

-- défi d'artiste : nouvelle mission (compteur « art » tenu par le serveur)
update public.game_cfg set v = v || '[{"k":"art","n":1,"c":120,"x":80}]'::jsonb
  where k = 'missions' and not (v @> '[{"k":"art"}]'::jsonb);

-- ---------- l'ancienne eco devient eco_base ----------
do $$ begin
  if to_regprocedure('public.eco_base(text,jsonb)') is null then
    alter function public.eco(text, jsonb) rename to eco_base;
  end if;
end $$;
revoke all on function public.eco_base(text, jsonb) from public, anon, authenticated;

-- ---------- outils ----------
create or replace function public.l3_per(w public.wallets) returns interval
language sql stable set search_path to '' as $$
  select case when coalesce(w.pass_until, now()) > now() then interval '5 minutes' else interval '10 minutes' end $$;

-- nombre de drops gratuits en réserve : 1 dès free_at, +1 par période, 10 au plus
create or replace function public.l3_stock(p_free timestamptz, p_per interval) returns int
language sql stable set search_path to '' as $$
  select case when now() < coalesce(p_free, now()) then 0
    else least(10, floor(extract(epoch from now() - coalesce(p_free, now())) / extract(epoch from p_per))::int + 1) end $$;

create or replace function public.l3_today() returns date
language sql stable set search_path to '' as $$ select (now() at time zone 'Europe/Paris')::date $$;

-- missions tirables (hors « open » toujours présente et hors défi d'artiste)
create or replace function public.l3_pool(p_top jsonb) returns text[]
language sql stable set search_path to '' as $$
  select coalesce(array_agg(x->>'k'), '{}') from jsonb_array_elements((select g.v from public.game_cfg g where g.k = 'missions')) x
  where x->>'k' not in ('open', 'art')
    and (x->>'k' <> 'topA' or (jsonb_typeof(p_top) = 'array' and jsonb_array_length(p_top) > 0))
    and (x->>'k' <> 'evc' or exists (select 1 from public.game_events g
         where now() >= (g.s::timestamp at time zone 'Europe/Paris') and now() < (g.e::timestamp at time zone 'Europe/Paris'))) $$;

-- les 5 missions du jour : « Ouvre 3 drops », un défi d'artiste (un artiste à moitié collectionné, ton top d'abord), puis au hasard
create or replace function public.l3_pick(w public.wallets) returns jsonb
language plpgsql volatile set search_path to '' as $$
declare ms text[] := array['open']; v_ak text; k text;
begin
  select c.ak into v_ak from public.cards c
    where not coalesce(c.hidden, false) and c.ak is not null
    group by c.ak
    having bool_or(coalesce((w.owned->>c.id)::int, 0) > 0) and bool_or(coalesce((w.owned->>c.id)::int, 0) <= 0)
    order by (case when jsonb_typeof(w.top) = 'array' and w.top ? c.ak then 0 else 1 end), random() limit 1;
  if v_ak is not null then ms := ms || 'art'::text; end if;
  for k in select x from unnest(public.l3_pool(w.top)) x order by random() loop
    exit when array_length(ms, 1) >= 5;
    ms := ms || k;
  end loop;
  return jsonb_build_object('ms', to_jsonb(ms), 'ak', v_ak);
end $$;

-- infos du lot 3 renvoyées au jeu avec le portefeuille
create or replace function public.l3_info(w public.wallets) returns jsonb
language plpgsql stable set search_path to '' as $$
declare per interval := public.l3_per(w); fa timestamptz := coalesce(w.free_at, now()); st int; nx timestamptz;
  s jsonb := coalesce(w.claims->'stk', '{}'::jsonb); pd date := public.l3_today(); v_last date; n int; sh int; live int;
begin
  st := public.l3_stock(fa, per);
  nx := case when st >= 10 then null when now() < fa then fa else fa + per * st end;
  v_last := (s->>'last')::date; n := coalesce((s->>'n')::int, 0); sh := coalesce((s->>'sh')::int, 1);
  live := case when v_last is null then 0 when v_last >= pd - 1 then n when v_last = pd - 2 and sh >= 1 then n else 0 end;
  return jsonb_build_object('cap', 10, 'per', extract(epoch from per)::int, 'stock', st, 'next', nx,
    'stk', jsonb_build_object('n', live, 'last', v_last, 'sh', case when live = 0 then 1 else sh end, 'done', v_last = pd,
      'play', ((w.stats->>'last')::timestamptz at time zone 'Europe/Paris')::date = pd, 'pd', pd));
end $$;

create or replace function public.l3_w(w public.wallets) returns jsonb
language sql stable set search_path to '' as $$
  select jsonb_build_object('coins', w.coins, 'gold', w.gold, 'bonus', w.bonus, 'dust', w.dust, 'owned', w.owned, 'free_at', w.free_at,
    'pass_until', w.pass_until, 'top', w.top, 'top_at', w.top_at, 'sxp', w.sxp, 'claims', w.claims, 'day', w.day, 'l3', public.l3_info(w)) $$;

revoke all on function public.l3_per(public.wallets), public.l3_stock(timestamptz, interval), public.l3_today(), public.l3_pool(jsonb),
  public.l3_pick(public.wallets), public.l3_info(public.wallets), public.l3_w(public.wallets) from public, anon, authenticated;

-- ---------- nouvelle eco ----------
create or replace function public.eco(p_op text, p_a jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare
  v_uid uuid := auth.uid(); w public.wallets; d jsonb; res jsonb; per interval; f0 timestamptz; rsv boolean := false;
  tdy text := to_char(now() at time zone 'utc', 'YYYY-MM-DD'); own0 jsonb; ids text[]; nn int := 0; na int := 0; pts int := 0;
  v_k text; nk text; s jsonb; pd date; v_last date; n int; sh int; pos int; rw jsonb;
  v_coins int; v_bonus int; v_gold int;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  w := public.w_lock(v_uid);
  per := public.l3_per(w);

  -- missions du jour choisies par le serveur, une fois par jour
  d := coalesce(w.day, '{}'::jsonb);
  if coalesce(d->>'d', '') <> tdy then
    d := jsonb_build_object('d', tdy, 'open', 0, 'newT', 0, 'bid', 0, 'recycle', 0, 'trade', 0, 'sell', 0, 'buy', 0, 'bsell', 0, 'cl', '{}'::jsonb);
  end if;
  if jsonb_typeof(d->'ms') is distinct from 'array' then
    d := d || public.l3_pick(w);
    update public.wallets set day = d where uid = v_uid;
    w.day := d;
  end if;

  -- série de 7 jours
  if p_op = 'streak' then
    s := coalesce(w.claims->'stk', '{}'::jsonb); pd := public.l3_today();
    v_last := (s->>'last')::date; n := coalesce((s->>'n')::int, 0); sh := coalesce((s->>'sh')::int, 1);
    if v_last = pd then raise exception 'Série déjà validée aujourd''hui'; end if;
    if coalesce(((w.stats->>'last')::timestamptz at time zone 'Europe/Paris')::date <> pd, true) then
      raise exception 'Ouvre un drop aujourd''hui pour valider ta série'; end if;
    if v_last = pd - 1 then n := n + 1;
    elsif v_last = pd - 2 and sh >= 1 then n := n + 1; sh := 0;
    else n := 1; sh := 1; end if;
    pos := ((n - 1) % 7) + 1;
    if pos = 1 then sh := 1; end if;
    rw := (array['{"c":40}', '{"c":60}', '{"b":1}', '{"c":100}', '{"b":2}', '{"c":150}', '{"g":1,"c":200}'])[pos]::jsonb;
    v_coins := w.coins + coalesce((rw->>'c')::int, 0); v_bonus := w.bonus + coalesce((rw->>'b')::int, 0); v_gold := w.gold + coalesce((rw->>'g')::int, 0);
    update public.wallets set coins = v_coins, bonus = v_bonus, gold = v_gold, sxp = sxp + 20 * pos,
      claims = jsonb_set(coalesce(claims, '{}'::jsonb), '{stk}', jsonb_build_object('n', n, 'last', pd, 'sh', sh)), updated_at = now()
      where uid = v_uid returning * into w;
    update public.profiles set coins = v_coins where id = v_uid;
    return jsonb_build_object('n', n, 'pos', pos, 'rw', rw, 'w', public.l3_w(w));

  -- changer une mission du jour (1 fois par jour)
  elsif p_op = 'mission_swap' then
    v_k := p_a->>'k';
    if coalesce(d->>'rr', '') = '1' then raise exception 'Tu as déjà changé une mission aujourd''hui'; end if;
    if v_k is null or not (d->'ms' ? v_k) then raise exception 'Mission inconnue'; end if;
    if coalesce(d->'cl'->>v_k, '') = '1' then raise exception 'Mission déjà récupérée'; end if;
    select x into nk from unnest(public.l3_pool(w.top)) x where not (d->'ms' ? x) order by random() limit 1;
    if nk is null then raise exception 'Aucune autre mission disponible'; end if;
    select jsonb_agg(case when e = v_k then nk else e end order by o) into s from jsonb_array_elements_text(d->'ms') with ordinality t(e, o);
    d := jsonb_set(d, '{ms}', s) || '{"rr":1}'::jsonb;
    if v_k = 'art' then d := d - 'ak'; end if;
    update public.wallets set day = d, updated_at = now() where uid = v_uid returning * into w;
    return jsonb_build_object('k', nk, 'w', public.l3_w(w));
  end if;

  -- vérifications avant l'économie de base
  if p_op = 'mission' and not (d->'ms' ? coalesce(p_a->>'k', '')) then
    raise exception 'Cette mission n''est pas dans tes missions du jour';
  end if;
  if p_op = 'open' and coalesce(p_a->>'kind', 'std') = 'free' and coalesce(w.bonus, 0) <= 0 then
    if public.l3_stock(w.free_at, per) <= 0 then raise exception 'Pas de drop gratuit'; end if;
    f0 := greatest(coalesce(w.free_at, now()), now() - per * 9) + per;  -- on retire un drop de la réserve
    update public.wallets set free_at = now() - interval '1 second' where uid = v_uid;
    rsv := true;
  end if;
  own0 := coalesce(w.owned, '{}'::jsonb);

  res := public.eco_base(p_op, p_a);

  if rsv then update public.wallets set free_at = f0 where uid = v_uid; end if;

  -- sons nouveaux : défi d'artiste et points de la semaine
  if p_op in ('open', 'craft', 'bbuy') then
    if p_op = 'open' then select coalesce(array_agg(x), '{}') into ids from jsonb_array_elements_text(coalesce(res->'cards', '[]'::jsonb)) x;
    else ids := array[p_a->>'id']; end if;
    select count(distinct z.id), count(distinct z.id) filter (where c.ak = d->>'ak') into nn, na
      from unnest(ids) z(id) join public.cards c on c.id = z.id where coalesce((own0->>z.id)::int, 0) <= 0;
    pts := (case when p_op = 'open' then 10 else 0 end) + 5 * nn + 50 * coalesce(jsonb_array_length(res->'ul'), 0);
    if p_op = 'bbuy' then pts := 5 * nn; end if;
    if na > 0 then
      update public.wallets set day = public.j_inc(day, 'art', na) where uid = v_uid;
    end if;
    if pts > 0 then
      insert into public.week_pts(uid, wk, pts) values (v_uid, public.label_wk(), pts)
        on conflict (uid, wk) do update set pts = public.week_pts.pts + excluded.pts;
    end if;
  end if;

  select * into w from public.wallets where uid = v_uid;
  return res || jsonb_build_object('w', (coalesce(res->'w', '{}'::jsonb)) || jsonb_build_object('free_at', w.free_at, 'day', w.day, 'l3', public.l3_info(w)), 'wpts', pts);
end $$;
revoke all on function public.eco(text, jsonb) from public, anon;
grant execute on function public.eco(text, jsonb) to authenticated;

-- ---------- classement de la semaine ----------
create or replace function public.week_board(lim int default 50)
returns jsonb language plpgsql stable security definer set search_path to '' as $$
declare v_uid uuid := auth.uid(); v_wk text := public.label_wk(); top jsonb; me jsonb; ahead jsonb; mp int; n int;
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('pseudo', b.pseudo, 'avatar_url', b.avatar_url, 'pts', b.pts, 'rank', b.rk) order by b.rn), '[]'::jsonb) into top
  from (select p.pseudo, p.avatar_url, x.pts, rank() over (order by x.pts desc) rk, row_number() over (order by x.pts desc, p.pseudo) rn
        from public.week_pts x join public.profiles p on p.id = x.uid where x.wk = v_wk and x.pts > 0 and p.pseudo is not null) b
  where b.rn <= least(greatest(coalesce(lim, 50), 1), 100);
  select x.pts into mp from public.week_pts x where x.uid = v_uid and x.wk = v_wk;
  mp := coalesce(mp, 0);
  select count(*) into n from public.week_pts x where x.wk = v_wk and x.pts > 0;
  select jsonb_build_object('pseudo', p.pseudo, 'pts', x.pts) into ahead from public.week_pts x join public.profiles p on p.id = x.uid
    where x.wk = v_wk and x.pts > mp and p.pseudo is not null and x.uid <> v_uid order by x.pts asc, p.pseudo limit 1;
  me := jsonb_build_object('pts', mp, 'rank', case when mp > 0 then 1 + (select count(*) from public.week_pts x where x.wk = v_wk and x.pts > mp) end, 'ahead', ahead);
  return jsonb_build_object('wk', v_wk, 'n', n,
    'ends', ((date_trunc('week', now() at time zone 'Europe/Paris') + interval '7 days') at time zone 'Europe/Paris'),
    'top', top, 'me', me);
end $$;
revoke all on function public.week_board(int) from public, anon;
grant execute on function public.week_board(int) to authenticated;

-- ---------- notifications web push ----------
create or replace function public.push_save(p_endpoint text, p_p256dh text, p_auth text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Connexion requise'; end if;
  if p_endpoint is null or p_endpoint !~ '^https://' or length(p_endpoint) > 1000 or length(coalesce(p_p256dh, '')) not between 20 and 200
     or length(coalesce(p_auth, '')) not between 8 and 100 then raise exception 'Abonnement invalide'; end if;
  insert into public.push_subs(endpoint, uid, p256dh, auth) values (p_endpoint, v_uid, p_p256dh, p_auth)
    on conflict (endpoint) do update set uid = excluded.uid, p256dh = excluded.p256dh, auth = excluded.auth;
  delete from public.push_subs where uid = v_uid and endpoint in
    (select endpoint from public.push_subs where uid = v_uid order by created_at desc offset 5);
  return jsonb_build_object('ok', true);
end $$;
create or replace function public.push_del(p_endpoint text)
returns jsonb language plpgsql security definer set search_path to '' as $$
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  delete from public.push_subs where endpoint = p_endpoint and uid = auth.uid();
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.push_save(text, text, text), public.push_del(text) from public, anon;
grant execute on function public.push_save(text, text, text), public.push_del(text) to authenticated;

-- envois dus (appelée par la fonction Edge « push » avec la clé service, jamais par un joueur) ; marque ce qui est renvoyé
create or replace function public.push_due()
returns table(endpoint text, p256dh text, auth text, kind text, title text, body text)
language plpgsql security definer set search_path to '' as $$
declare r record; wal public.wallets; inf jsonb; pd date := public.l3_today(); hr int := extract(hour from now() at time zone 'Europe/Paris')::int; t record;
begin
  for r in select s.endpoint, s.p256dh, s.auth, s.sent, s.uid from public.push_subs s loop
    select * into wal from public.wallets w where w.uid = r.uid;
    if not found then continue; end if;
    inf := public.l3_info(wal);
    -- réserve pleine (une fois par remplissage)
    if (inf->>'stock')::int >= 10 and coalesce(r.sent->>'full', '') <> coalesce(wal.free_at::text, '') then
      endpoint := r.endpoint; p256dh := r.p256dh; auth := r.auth; kind := 'full';
      title := 'Ta réserve est pleine'; body := '10 drops gratuits t''attendent sur WaxDrop.'; return next;
      r.sent := r.sent || jsonb_build_object('full', coalesce(wal.free_at::text, ''));
    end if;
    -- un ami te propose un échange
    select tr.from_name, tr.created_at into t from public.trades tr
      where tr.to_id = wal.uid and tr.status = 'pending' and tr.created_at > coalesce((r.sent->>'tr')::timestamptz, now() - interval '1 hour')
      order by tr.created_at desc limit 1;
    if found then
      endpoint := r.endpoint; p256dh := r.p256dh; auth := r.auth; kind := 'trade';
      title := 'Nouvel échange'; body := coalesce(t.from_name, 'Un ami') || ' te propose un échange.'; return next;
      r.sent := r.sent || jsonb_build_object('tr', t.created_at);
    end if;
    -- série en danger, entre 19 h et 21 h (heure de Paris), une fois par jour
    if hr between 19 and 20 and (inf->'stk'->>'n')::int >= 2 and not (inf->'stk'->>'done')::boolean and coalesce(r.sent->>'stk', '') <> pd::text then
      endpoint := r.endpoint; p256dh := r.p256dh; auth := r.auth; kind := 'streak';
      title := 'Ta série est en danger'; body := 'Ouvre un drop avant minuit pour garder ta série de ' || (inf->'stk'->>'n') || ' jours.'; return next;
      r.sent := r.sent || jsonb_build_object('stk', pd::text);
    end if;
    update public.push_subs set sent = r.sent where push_subs.endpoint = r.endpoint and push_subs.sent is distinct from r.sent;
  end loop;
end $$;
revoke all on function public.push_due() from public, anon, authenticated;
grant execute on function public.push_due() to service_role;

notify pgrst, 'reload schema';
