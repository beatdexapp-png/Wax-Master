-- PROPOSITION, NON APPLIQUÉE : à appliquer sur Supabase après le oui d'Alexi.
--
-- 1) Classement : aujourd'hui le score est calculé par le téléphone (app.js score()) et envoyé tel quel dans profiles.score.
--    Un joueur peut donc écrire n'importe quel score (requête PATCH sur sa ligne profiles, autorisée par la règle
--    « profil modifiable par son joueur »). Vérifié le 04/11 : personne n'a triché (aucun score au-dessus du calcul serveur).
--    Correctif : avant chaque écriture du profil, le serveur recalcule le score à partir du portefeuille (wallets),
--    avec la même formule que le jeu : 10 par son possédé, 100 par album complété, 500 par artiste complété.
--    Sur 1 624 joueurs : 1 265 identiques, 1 595 à moins de 2 % (les autres avaient un score en retard, jamais en avance).
create or replace function public.profiles_score_serveur()
returns trigger language plpgsql security definer set search_path to '' as $$
declare w public.wallets;
begin
  select * into w from public.wallets x where x.uid = new.id;
  if found then
    new.score := (select count(*) from jsonb_each_text(coalesce(w.owned, '{}'::jsonb)) e join public.cards c on c.id = e.key
                   where e.value ~ '^[0-9]+$' and e.value::int > 0) * 10
               + (select count(*) from jsonb_object_keys(coalesce(w.claims->'ul', '{}'::jsonb)) k where k like 'al-%') * 100
               + (select count(*) from jsonb_object_keys(coalesce(w.claims->'ul', '{}'::jsonb)) k where k not like 'al-%') * 500;
    new.coins := w.coins;
  end if;
  return new;
end $$;
drop trigger if exists profiles_score_serveur on public.profiles;
create trigger profiles_score_serveur before insert or update on public.profiles
  for each row execute function public.profiles_score_serveur();

-- 2) Fonctions lourdes appelables par n'importe qui sans compte (rôle anon) : reconstruction du catalogue (jusqu'à 120 s)
--    et réécriture des styles de toutes les cartes. Un visiteur malveillant peut les lancer en boucle et ralentir la base.
--    Elles servent aux tâches automatiques (cron, service), pas au jeu : on les réserve au serveur.
revoke execute on function public.catalog_cache_refresh() from anon, authenticated, public;
revoke execute on function public.cards_sync_st() from anon, authenticated, public;
