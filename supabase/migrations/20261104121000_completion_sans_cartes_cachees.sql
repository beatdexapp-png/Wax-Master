-- NON APPLIQUÉE : à appliquer sur Supabase après le oui d'Alexi.
-- Bug joueurs #360 « J'ai complété tous les sons d'un artiste mais la quête n'est pas acquise ».
-- Le serveur (fonction eco) ne donne la récompense album / artiste que si le joueur possède TOUTES les cartes
-- de l'album ou de l'artiste, y compris les cartes cachées (hidden), que le jeu n'affiche pas et qu'on ne peut pas tirer.
-- Mesuré le 04/11 : 2 cartes cachées (PNL : « Coco », « Cramés »), donc la récompense artiste PNL est impossible pour tout le monde.
-- Correctif : les cartes cachées ne comptent plus dans la condition. Montants des récompenses inchangés (250 et 500).
-- La fonction eco est longue : on remplace seulement les deux conditions, et on vérifie qu'elles existent une fois chacune.
do $$
declare s text := pg_get_functiondef('public.eco'::regproc);
  a_old text := 'x.alk = v_k and coalesce((own->>x.id)::int, 0) <= 0';
  a_new text := 'x.alk = v_k and not coalesce(x.hidden, false) and coalesce((own->>x.id)::int, 0) <= 0';
  r_old text := 'x.ak = v_k and coalesce((own->>x.id)::int, 0) <= 0';
  r_new text := 'x.ak = v_k and not coalesce(x.hidden, false) and coalesce((own->>x.id)::int, 0) <= 0';
begin
  if (length(s) - length(replace(s, a_old, ''))) / length(a_old) <> 1 then raise exception 'condition album introuvable ou en double'; end if;
  if (length(s) - length(replace(s, r_old, ''))) / length(r_old) <> 1 then raise exception 'condition artiste introuvable ou en double'; end if;
  execute replace(replace(s, a_old, a_new), r_old, r_new);
end $$;
