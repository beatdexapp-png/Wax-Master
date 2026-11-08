-- WaxDrop lot 6 « Argent » (08/11/2026). À appliquer par Jarvis (connecteur Supabase). Idempotent.
-- Ne change AUCUN prix existant ni l'abonnement mensuel des abonnés actuels. Aucun identifiant Stripe inventé :
-- les deux nouvelles offres sont reconnues seulement quand leur lien de paiement (plink_…) est rangé dans private_cfg :
--   insert into public.private_cfg(k, v) values ('plink_pro_an', 'plink_…') on conflict (k) do update set v = excluded.v;   -- WaxDrop Pro à l'année, 49,90 €
--   insert into public.private_cfg(k, v) values ('plink_coffret', 'plink_…') on conflict (k) do update set v = excluded.v;  -- Coffret 9,99 €
-- Tant que ces lignes n'existent pas, stripe_apply se comporte exactement comme avant (le jeu cache aussi les deux offres).
-- Contenu :
--   1. purchases.items : objets en plus des wax coins (pour reprendre aussi les Drops Or et drops en cas de remboursement)
--   2. stripe_apply : + Pro à l'année (367 jours dès le paiement, puis invoice.paid comme le mensuel) ; + Coffret 9,99 €
--   3. pro_flags(pseudos) : quels pseudos ont WaxDrop Pro (badge Pro dans le classement, chez les amis et sur les profils)

alter table public.purchases add column if not exists items jsonb;

create or replace function public.stripe_apply(p_event jsonb)
returns text language plpgsql security definer set search_path to '' as $function$
declare t text := p_event->>'type'; o jsonb := p_event->'data'->'object'; v_uid uuid; v_n int; v_until timestamptz; v_sub text; pu record;
  v_an text := (select v from public.private_cfg where k = 'plink_pro_an'); v_cof text := (select v from public.private_cfg where k = 'plink_coffret');
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
      -- lot 6 : le Pro à l'année (lien lu dans private_cfg, rien tant que le lien n'y est pas)
      if coalesce(o->>'payment_link', '') <> 'plink_1UQDXvCpQcu4qQ3qcFt7s5cV' and (v_an is null or coalesce(o->>'payment_link', '') <> v_an) then
        insert into public.stripe_events(id, type, uid, data) values (p_event->>'id', t, v_uid, o); return 'unknown-link'; end if;
      v_sub := o->>'subscription';
      v_until := now() + case when v_an is not null and o->>'payment_link' = v_an then interval '367 days' else interval '32 days' end;
      insert into public.stripe_subs(sub, uid, customer, status, until) values (v_sub, v_uid, o->>'customer', 'active', v_until)
        on conflict (sub) do update set uid = excluded.uid, status = 'active', until = greatest(public.stripe_subs.until, excluded.until), updated_at = now();
      update public.wallets set pass_until = greatest(coalesce(pass_until, now()), v_until) where uid = v_uid;
      insert into public.purchases(uid, kind, amount, currency, session, pi) values (v_uid, 'pass', (o->>'amount_total')::int, o->>'currency', o->>'id', o->>'payment_intent') on conflict (session) do nothing;
    elsif v_cof is not null and o->>'payment_link' = v_cof then
      -- lot 6 : le Coffret à 9,99 € = 5 000 wax coins + 2 Drops Or + 10 drops
      update public.wallets set coins = coins + 5000, gold = gold + 2, bonus = bonus + 10 where uid = v_uid;
      insert into public.purchases(uid, kind, coins, amount, currency, session, pi, items) values (v_uid, 'coins', 5000, (o->>'amount_total')::int, o->>'currency', o->>'id', o->>'payment_intent', '{"gold":2,"bonus":10}') on conflict (session) do nothing;
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
      if pu.kind = 'coins' then update public.wallets set coins = greatest(coins - coalesce(pu.coins, 0), 0),
          gold = greatest(gold - coalesce((pu.items->>'gold')::int, 0), 0), bonus = greatest(bonus - coalesce((pu.items->>'bonus')::int, 0), 0) where uid = pu.uid;
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

-- ---------- badge Pro : liste des pseudos abonnés parmi ceux demandés (100 au plus) ----------
create or replace function public.pro_flags(p_pseudos text[])
returns text[] language sql stable security definer set search_path to '' as $$
  select coalesce(array_agg(p.pseudo), '{}') from public.profiles p join public.wallets w on w.uid = p.id
  where p.pseudo = any (p_pseudos[1:100]) and w.pass_until > now()
$$;
revoke all on function public.pro_flags(text[]) from public, anon;
grant execute on function public.pro_flags(text[]) to authenticated;
