-- 10 drops offerts à la création du compte (demande d'Alexi, 07/11/2026). NE PAS APPLIQUER sans son oui à l'écran.
-- Anti-triche : tout se passe côté serveur. Le portefeuille d'un joueur (public.wallets) est créé une seule fois
-- (clé primaire uid) par w_lock au premier appel de eco ; ce déclencheur ajoute les drops à ce moment-là,
-- seulement pour les comptes créés APRÈS la mise en service. Aucun joueur existant n'est modifié.
-- Le nombre est réglable sans migration : update public.game_cfg set v = jsonb_set(v,'{n}','5') where k = 'signup_gift';
-- Retour arrière : voir la fin du fichier.

insert into public.game_cfg (k, v)
values ('signup_gift', jsonb_build_object('n', 10, 'since', now()))
on conflict (k) do nothing;

create or replace function public.wallets_signup_gift()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare cfg jsonb; created timestamptz;
begin
  select v into cfg from public.game_cfg where k = 'signup_gift';
  if cfg is null or coalesce((cfg->>'n')::int, 0) <= 0 then return new; end if;
  select created_at into created from public.profiles where id = new.uid;
  if created is not null and created >= (cfg->>'since')::timestamptz then
    new.bonus := coalesce(new.bonus, 0) + least((cfg->>'n')::int, 50);
  end if;
  return new;
end $$;
revoke all on function public.wallets_signup_gift() from public, anon, authenticated;

drop trigger if exists wallets_signup_gift on public.wallets;
create trigger wallets_signup_gift before insert on public.wallets
for each row execute function public.wallets_signup_gift();

-- Lu par la page de connexion pour afficher « 10 drops offerts » seulement quand c'est vrai.
create or replace function public.signup_gift()
returns int
language sql
stable
security definer
set search_path to ''
as $$ select coalesce((select (v->>'n')::int from public.game_cfg where k = 'signup_gift'), 0) $$;
revoke all on function public.signup_gift() from public;
grant execute on function public.signup_gift() to anon, authenticated;

-- Retour arrière :
-- drop trigger if exists wallets_signup_gift on public.wallets;
-- drop function if exists public.wallets_signup_gift();
-- drop function if exists public.signup_gift();
-- delete from public.game_cfg where k = 'signup_gift';
