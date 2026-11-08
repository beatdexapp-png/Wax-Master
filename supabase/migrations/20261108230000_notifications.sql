-- WaxDrop : notifications web push en service (retouches du 08/11/2026, point 12).
-- Peu nombreuses : 3 sortes seulement, 3 par jour au plus, une par passage, jamais entre 22 h et 9 h (heure de Paris).
--   1. nouvel événement (une fois par événement, pendant qu'il est en cours ; liste dans push_ev)
--   2. drops prêts : réserve pleine (10 drops gratuits), une fois par remplissage
--   3. baisse de prix d'un son de la liste de souhaits : au moins 10 % sous le prix au moment de l'ajout,
--      puis 10 % sous la dernière alerte ; une alerte de ce type par jour au plus
-- Les clés VAPID sont créées par la fonction Edge « push » elle-même et rangées dans push_cfg (jamais affichées, jamais dans le dépôt).
-- Le secret de la tâche planifiée est créé ici au hasard, lu par la tâche et par la fonction. Seule la clé publique sort (push_key).

create table if not exists public.push_cfg (k text primary key, v text not null);
alter table public.push_cfg enable row level security;
revoke all on table public.push_cfg from public, anon, authenticated;
grant all on table public.push_cfg to service_role;
insert into public.push_cfg (k, v) values ('cron', encode(extensions.gen_random_bytes(24), 'hex')) on conflict (k) do nothing;

create or replace function public.push_key()
returns text
language sql
stable
security definer
set search_path to ''
as $$ select v from public.push_cfg where k = 'vapid_pub' $$;
revoke all on function public.push_key() from public, anon;
grant execute on function public.push_key() to authenticated;

-- événements à venir (mêmes noms et dates que data.js, heure de Paris). En ajouter ici quand on en ajoute dans data.js.
create table if not exists public.push_ev (id int primary key, n text not null, d text not null, s timestamptz not null, e timestamptz not null);
alter table public.push_ev enable row level security;
revoke all on table public.push_ev from public, anon, authenticated;
grant all on table public.push_ev to service_role;
insert into public.push_ev (id, n, d, s, e) values
  (8,  'Les Légendes',   'Booba, Rohff, Kery James, IAM… 4 fois plus souvent', '2026-11-10 00:00 Europe/Paris', '2026-11-13 23:59 Europe/Paris'),
  (9,  'Nuit US',        'Le rap US 3 fois plus souvent',                      '2026-11-14 00:00 Europe/Paris', '2026-11-16 23:59 Europe/Paris'),
  (10, 'Nouvelle Vague', 'Tiakola, Werenoi, Theodora… 4 fois plus souvent',    '2026-11-17 00:00 Europe/Paris', '2026-11-20 23:59 Europe/Paris'),
  (11, 'Âge d’or',       'Chance Divine ×2',                                   '2026-11-21 00:00 Europe/Paris', '2026-11-23 23:59 Europe/Paris'),
  (12, 'Rap Belge',      'Damso, Hamza, Shay, Krisy… 4 fois plus souvent',     '2026-11-24 00:00 Europe/Paris', '2026-11-27 23:59 Europe/Paris'),
  (13, 'Black Friday',   'Drops à 50 wax coins',                               '2026-11-28 00:00 Europe/Paris', '2026-11-30 23:59 Europe/Paris')
on conflict (id) do nothing;

create or replace function public.push_due()
returns table(endpoint text, p256dh text, auth text, kind text, title text, body text)
language plpgsql
security definer
set search_path to ''
as $$
declare
  r record; wal public.wallets; inf jsonb; ev record; w record; snt jsonb;
  pd text := (now() at time zone 'Europe/Paris')::date::text;
  hr int := extract(hour from now() at time zone 'Europe/Paris')::int;
begin
  if hr < 9 or hr >= 22 then return; end if;
  for r in select s.endpoint ep, s.p256dh pk, s.auth au, coalesce(s.sent, '{}'::jsonb) sent, s.uid from public.push_subs s loop
    snt := r.sent;
    if snt->>'day' is distinct from pd then snt := snt || jsonb_build_object('day', pd, 'n', 0); end if;
    if coalesce((snt->>'n')::int, 0) < 3 then
      kind := null;
      -- 1. nouvel événement
      select x.id, x.n, x.d, x.e into ev from public.push_ev x where now() >= x.s and now() < x.e order by x.s desc limit 1;
      if found and coalesce(snt->>'ev', '') <> ev.id::text then
        kind := 'event'; title := 'Nouvel événement : ' || ev.n;
        body := ev.d || '. Jusqu’au ' || to_char(ev.e at time zone 'Europe/Paris', 'DD/MM') || '.';
        snt := snt || jsonb_build_object('ev', ev.id::text);
      end if;
      -- 2. drops prêts (réserve pleine)
      if kind is null then
        select * into wal from public.wallets x where x.uid = r.uid;
        if found then
          inf := public.l3_info(wal);
          if (inf->>'stock')::int >= 10 and coalesce(snt->>'full', '') <> coalesce(wal.free_at::text, '') then
            kind := 'full'; title := 'Tes drops sont prêts'; body := '10 drops gratuits t’attendent sur WaxDrop.';
            snt := snt || jsonb_build_object('full', coalesce(wal.free_at::text, ''));
          end if;
        end if;
      end if;
      -- 3. baisse de prix d'un son de la liste de souhaits
      if kind is null and coalesce(snt->>'wd', '') <> pd then
        select q.card, q.t, q.a, q.p, q.ref into w from (
          select x.card, c.t, c.a, public.card_price(x.card) p, coalesce((snt->'w'->>x.card)::int, x.p0) ref
            from public.l5_wish x join public.cards c on c.id = x.card
           where x.uid = r.uid and x.p0 > 0) q
         where q.p > 0 and q.p <= floor(q.ref * 0.9)
         order by q.p::numeric / q.ref limit 1;
        if found then
          kind := 'wish'; title := w.t || ' baisse à la Bourse';
          body := w.a || ' · ' || w.p || ' wax coins (avant ' || w.ref || '). Il est dans ta liste de souhaits.';
          snt := snt || jsonb_build_object('wd', pd, 'w', coalesce(snt->'w', '{}'::jsonb) || jsonb_build_object(w.card, w.p));
        end if;
      end if;
      if kind is not null then
        snt := jsonb_set(snt, '{n}', to_jsonb(coalesce((snt->>'n')::int, 0) + 1));
        endpoint := r.ep; p256dh := r.pk; auth := r.au; return next;
      end if;
    end if;
    if snt is distinct from r.sent then update public.push_subs s set sent = snt where s.endpoint = r.ep; end if;
  end loop;
end $$;
revoke all on function public.push_due() from public, anon, authenticated;
grant execute on function public.push_due() to service_role;

-- toutes les 10 minutes ; le secret est lu dans push_cfg au moment de l'appel
select cron.schedule('waxdrop-push', '*/10 * * * *', $c$
  select net.http_post(
    url := 'https://ptoncebyqakclxqnmlzk.supabase.co/functions/v1/push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron', (select v from public.push_cfg where k = 'cron')),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000)
$c$);
