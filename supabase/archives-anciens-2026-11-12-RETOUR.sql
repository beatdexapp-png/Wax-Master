-- Retour arrière des Archives PNL (12/11/2026) : retire les 21 cartes yt-… et reconstruit le cache du catalogue.
-- Les cartes déjà tirées par des joueurs restent dans leurs collections mais deviennent inconnues du jeu : à utiliser seulement en cas de problème grave.
delete from public.cards where id in ('yt-70BVgTDYJ_I','yt-_6EOAWjTuAY','yt-o_0EmIfLzzQ','yt-ihUzzUj-jp4','yt-e5XLZc24dYU','yt-8FUq4A3IVg0','yt-c0hOvD7-kbY','yt-qLbWbltHpvg','yt-433koBM2nPo','yt-1QVxSnvgxF4','yt-jVP3D6vz3zU','yt-gTF4cKVfDoo','yt-3DbFWlcDbkk','yt-sMEU_oKVyUs','yt-8jbJVVRpFpY','yt-CwAO-ru4fKk','yt-ySZeklklkg8','yt-AwPM3Kriny0','yt-lRM34-o_lX8','yt-8Pxfjz2aZ-w','yt-kcj02m4I1yc');
select public.catalog_cache_refresh();
