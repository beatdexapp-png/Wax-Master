-- À LANCER APRÈS le déploiement de la nouvelle fonction preview (supabase/functions/preview), jamais avant.
-- 13 289 sons sont marqués « pas d'extrait » pour toujours, dont 12 128 avant le 31/10, en grande partie à cause du quota Deezer
-- (Deezer répond 200 avec une erreur, l'ancienne fonction le prenait pour « pas d'extrait ») et des featurings
-- (SOBAD de Gazo avec Tiakola, FBI de La Mano 1.9 avec Ninho, Mauvais de Heuss avec Vald…).
-- Test du 04/11 sur 24 titres connus bloqués : 16 retrouvés par la nouvelle recherche, 0 par l'ancienne.
-- On efface ces marques : la nouvelle fonction refera la recherche la prochaine fois qu'un joueur tombe sur le son.
-- Aucune donnée de joueur n'est touchée (table de cache uniquement).
delete from public.track_previews where dz is null and url is null;
