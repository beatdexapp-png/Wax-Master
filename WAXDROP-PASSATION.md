# WaxDrop : passation complète du projet (état au 28 octobre 2026)

Ce document résume tout le projet WaxDrop pour reprendre le travail dans une nouvelle session Claude Code. Il couvre le projet, qui je suis et comment je veux qu'on travaille, l'architecture technique, la base de données, l'historique, les vidéos de pub, les connecteurs utilisés, l'état actuel et les pièges à connaître.

---

## 1. Qui je suis et comment travailler avec moi

- Je m'appelle Alexi (Alexi Michaud), j'habite à Bègles (Gironde). Je suis débutant sur la partie technique (hébergement, DNS, réglages) : pour tout ce que tu ne peux pas faire toi-même, donne-moi des instructions pas à pas.
- Réponses en français, concises, droit au but. Pas de formules de politesse, pas d'emojis, pas de tirets cadratins. Listes courtes plutôt que longs paragraphes.
- Sur une modif de code : montre le diff ou les lignes changées, pas le fichier entier.
- Ne jamais deviner un SHA de commit ou un nom de package.
- Sur une ambiguïté mineure : prends la décision la plus raisonnable et avance, dis juste l'hypothèse prise.
- Vérifier la doc seulement pour le code à enjeu (prod, sécurité, migration).
- Je veux que tu fasses le maximum en autonomie : coder, tester, pousser en ligne. Après chaque modif du site : commit + push sur `main` (le site se met à jour tout seul).
- Je donne souvent mes demandes à l'oral (dictée), donc il peut y avoir des mots mal transcrits (exemple : "finilé" = "FINIS-LES", "X-Field" = "Higgsfield", "Tembox" = "unbox").

---

## 2. Le projet

**WaxDrop** est un jeu de cartes à collectionner (TCG) sur la musique, surtout le rap. Chaque carte est un son (un titre) d'un artiste. On ouvre des "drops" (des paquets), un vinyle tourne puis se casse et révèle les sons, avec une rareté. On collectionne les sons, on complète des albums, on échange avec ses potes, on revend à la Bourse.

- Site : **https://waxdrop.fr** (application web installable, PWA). Pas d'App Store : on l'ouvre dans Safari ou Chrome et on l'ajoute à l'écran d'accueil. Gratuit, pas de code ni d'invitation pour entrer.
- Attention : **waxdrop.app est un autre site** qui n'a rien à voir, et il est devant moi sur Google. Objectif : être premier sur Google quand on tape "WaxDrop".
- Concurrent : un compte "WAX TCG" (lancé le 14/10) m'a accusé de copie. J'ai commencé le 12/10 et acheté le domaine le 13/10, avant eux. Je ne change rien.
- Noms précédents (pour comprendre l'historique et le code) : Platine, BeatDex, TrackDex, puis WaxDrop (choisi le 13/10). Le dépôt s'appelait Beat-Dex puis Wax-Master.
- Promo : vidéos TikTok et pubs TikTok payantes (lancées le 26/10). Comptes TikTok et Instagram : @waxdrop.fr.
- Monétisation : abonnement **WaxDrop Pro à 4,99 €/mois** et packs de **wax coins** (monnaie du jeu), payés via **Stripe**. Pas de pub dans le jeu.

### Les éléments du jeu
- **Raretés** (6) : Commun, Rare, Ultra rare, Légendaire, Mythique, Divin. Couleurs : `#aab3bd`, `#5aa9ff`, `#c27dff`, `#ffc23d`, `#ff5f86`, `#f6dfa0`. Dans la base, `r` va de 0 (Commun) à 5 (Divin).
- **Drops** : un drop gratuit toutes les 10 min (5 min avec Pro), des drops bonus (`bonus` dans le portefeuille), Drop Or (`gold`, Légendaire garanti), packs payants en wax coins.
- **Ouverture** : le vinyle tourne, accélère, change de couleur selon la rareté, se fissure puis explose en éclats (v3 : 8 secteurs, débris), avec sons synthétisés, extrait Deezer de 30 s à la révélation, carte inclinable en 3D avec reflet holo, halo de rareté.
- **Collection** : par artiste, par album, et vue "Sons" (doubles, tri par rareté). Compléter un album donne des disques d'or et de platine.
- **Catalogue** : environ 1 013 artistes (rap FR surtout, US, un peu UK, plus underground FR) et des dizaines de milliers de sons, avec recherche et filtres repliés. Un joueur peut proposer un artiste depuis la recherche.
- **Styles** : le joueur choisit ses styles (Rap, Pop, R&B, Rock, Électro, Jazz...) pour avoir ×2,5 de chances.
- **Top du moment** : 5 artistes choisis, ×3 de chances, modifiable une fois par semaine.
- **Bourse** : chaque son a un cours qui dépend de l'offre et de la demande des joueurs (pas de variations simulées). Achats et ventes limités à 5 par jour pour les non-Pro, Divins réservés aux Pro. Formule de prix amortie (`1+0.35*tanh(demande/25)`) pour qu'une vente en masse ne casse pas les prix.
- **Amis et échanges** : recherche par pseudo, demandes d'ami, échanges de doubles uniquement entre amis.
- **Parrainage** (ajouté le 28/10) : lien `waxdrop.fr/?ami=CODE`. Filleul : +2 drops et +100 wax coins. Parrain : +2 drops et +150 wax coins par filleul, plus des paliers (1 Drop Or à 3 filleuls, 2 à 10, 3 à 25). Seulement pour un compte créé il y a moins de 7 jours, une fois par compte, 50 filleuls max. Grosse carte "Parrainage" en haut de la page Amis (la page défile), tuile "Amis & parrainage" avec badge "+2" sur le Disquaire, bouton doré "Parrainer" dans le profil.
- **Labels** : équipes entre potes (20 membres max, création 500 wax coins, code à 6 caractères). Chaque drop d'un membre donne des points au label. Coffres chaque semaine pour tous les membres (paliers 1 500 / 5 000 / 12 000 points). Classement des labels.
- **Événements** : un artiste à l'honneur pendant quelques jours, ses sons tombent beaucoup plus souvent (exemple : événement 14 "FINIS-LES" de La Fève, chances ×8, du 26/10 16h au 29/10 23h59). Défi à paliers (3 / 8 / 15 sons de l'événement). Il n'y a plus de "son garanti par drop" (retiré le 27/10, ça cassait les prix).
- **Missions** : 11 missions possibles, 5 par jour (dont une sur un artiste de ton top).
- **Succès** : 34 succès en médailles, bouton "tout récupérer".
- **Recyclage** des doublons en poussière, **atelier** pour créer un son.
- **Profil** : photo, pseudo, niveau, vitrines, classement (joueurs cliquables pour voir leurs stats), "Mes stats".
- **Onglets** (5) : Collection, Disquaire (packs, Pro, succès, missions, amis), Ouvrir (au centre, onglet par défaut au lancement), Bourse, Profil. Thèmes (Minuit et Nacre pour Pro).
- **Boîte à idées** dans le menu (table `feedback`).

### WaxDrop Pro (4,99 €/mois)
Bourse en détail (historique 7 et 30 jours), drop gratuit toutes les 5 min, 1 drop offert par jour, 1 Drop Or chaque lundi, thèmes exclusifs, Bourse sans limite (Divins compris), défis d'événement ×2, label boosté +50 %.

---

## 3. Architecture technique

### Hébergement et dépôt
- Dépôt GitHub : **beatdexapp-png/Wax-Master** (anciennement beat-dex, l'ancienne URL redirige). Le site est servi par **GitHub Pages** depuis la branche `main`, domaine `waxdrop.fr` (fichier `CNAME`).
- Domaine **waxdrop.fr chez OVHcloud**. DNS : enregistrements GitHub Pages + un TXT `google-site-verification` (domaine vérifié dans Google Search Console, sitemap envoyé le 27/10).
- Netlify a été utilisé au début puis abandonné (quota gratuit épuisé). Il reste un `netlify.toml` inutile.
- Branches du dépôt :
  - `main` : le site.
  - `capture` : workflows GitHub Actions (récupération de fichiers, captures d'écran), voir section 7.
  - `assets-out`, `capture-out` : sorties des workflows.
  - `media` : anciennes vidéos TikTok.
  - `outils` : sources des pubs 3D, de la vidéo de mise à jour, du générateur SEO, et ce document.

### Front (JavaScript sans framework)
Fichiers à la racine de `main` :
- `index.html` : coquille, balises SEO (title, description, canonical, Open Graph, JSON-LD WebSite/Organization/VideoGame), petit texte indexable dans `#main` remplacé par l'app, menu caché "plan du site" pour Google.
- `app.js` (environ 137 Ko) : cœur du jeu (rendu des onglets, ouverture, collection, Disquaire, profil, missions, `pager()` pour les listes).
- `data.js` : données de base (artistes de base, liste `EVENTS`, raretés).
- `catalog.js` : charge le catalogue. D'abord le fichier statique `/catalog.json` (6,4 Mo, servi par le CDN), sinon la RPC `catalog_dump2`. Le catalogue est rangé dans IndexedDB.
- `cloud.js` : comptes (Supabase Auth), sauvegarde, classement.
- `eco.js` : économie côté serveur (RPC `eco`), Bourse, succès, liens de paiement Stripe, `niceErr()` pour des messages d'erreur lisibles.
- `social.js` : amis, échanges, parrainage.
- `labels.js`, `events.js`, `stats.js`, `share.js` (partage du dernier drop en image), `fx.js` (sons synthétisés), `preview.js` (extraits Deezer), `polish.js` (inclinaison 3D, gyroscope, hauteur plein écran iPhone, couleur de la barre d'état, app mise en pause pendant l'ouverture).
- `style.css` (environ 180 Ko).
- `sw.js` : service worker. **Le nom du cache (`waxdrop-vNN`, actuellement v51) doit être incrémenté à chaque mise à jour** pour que les joueurs reçoivent la nouvelle version. Il ignore `/artistes`, `/a-propos`, `.xml` et `.txt`.
- `vendor/` : supabase-js, Motion.
- SEO : `a-propos.html` (FAQ), `artistes/` (950 pages, une par artiste, plus `artistes/index.html`), `sitemap.xml`, `robots.txt`, `icons/og.png` (1200×630).

### Backend : Supabase
- Projet **ptoncebyqakclxqnmlzk**, organisation passée en **plan Pro** le 26/10 (après une saturation du serveur), compute augmenté.
- Tables : `profiles`, `wallets` (coins, gold, bonus, dust, owned, free_at, claims, day, pass_until, top, ach, styles, stats), `cards` (tous les sons jouables : id, a, ak, alk, t, r, s, y, cover, src, artist_id, hidden, st...), `card_held`, `bourse_trades`, `listings`, `bids`, `trades`, `friends`, `referrals`, `labels`, `label_members`, `label_week`, `label_mweek`, `label_claims`, `game_cfg` (dont `missions`), `game_events`, `catalog_artists`, `catalog_albums`, `catalog_tracks`, `catalog_seed`, `catalog_cache`, `catalog_state`, `track_previews`, `purchases`, `stripe_events`, `stripe_subs`, `feedback`, `feedback_report`, `private_cfg`, `base_check`.
- RPC principales :
  - `eco(p_op, p_a)` : toute l'économie (ouvrir un drop, missions, recyclage, craft, achat/vente Bourse `bbuy`/`bsell`, top, etc.). Le tirage passe par `draw_card2` (tirage pondéré : rareté, styles, top, événement).
  - Bourse : `bourse_list`, `bourse_card`, `bourse_portfolio` (en lot, rapide), `card_quote`, `card_values` / `card_value`.
  - Succès : `ach_list`, `ach_compute`, `ach_claim`, `ach_claim_all`.
  - Social : `friends_list`, `friend_request`, `friend_invite` (gère aussi le parrainage), `search_players`, `player_card`, `propose_trade`, `respond_trade`, `cancel_trade`, `trade_events`.
  - Labels : `label_me`, `label_top`, `label_create`, `label_join`, `label_leave`, `label_kick`, `label_claim`, `label_add`.
  - Autres : `ev_claim` (défi d'événement), `profile_stats`, `leaderboard2`, `style_set`, `feedback_send`, `catalog_dump2`, `catalog_cache_refresh`, `refresh_cards`, `refresh_held`, `cards_sync_st`.
- Fonctions Edge :
  - `mb-sync` : remplit le catalogue depuis MusicBrainz (+ pochettes Cover Art Archive + photos Wikidata) pour chaque artiste en attente dans `catalog_seed`.
  - `mb-style` : styles musicaux des artistes.
  - `preview` : extraits Deezer de 30 s.
  - `stripe-webhook` : paiements Stripe (Pro et wax coins).
  - `zernio` : pont de publication vers TikTok et Instagram via Zernio (clé stockée côté serveur, jamais dans le dépôt).
  - `spotify-sync`, `sp-artist` : anciennes fonctions Spotify (Spotify abandonné pour le catalogue, mais les données déjà récupérées sont gardées).
  - `verify-base` : vérification des artistes de base.
- Tâches planifiées (pg_cron) :
  - 3 `refresh_cards()` toutes les heures à :37 (crée les cartes des nouveaux sons, rareté tirée au hasard) ;
  - 4 `refresh_held()` à :21 et :51 ;
  - 5 `mb-sync` toutes les 15 min ;
  - 7 `mb-style` toutes les 15 min (décalé de 7) ;
  - 8 `cards_sync_st()` à :47 ;
  - 10 `catalog_cache_refresh()` à :09 et :39 ;
  - 11 nettoyage de `cron.job_run_details` toutes les heures.
  - Le job 2 est désactivé.
- Paiements : liens Stripe dans `eco.js` (`PAY.pass`, `c500`, `c1200`, `c3000`, `c7000`), portail client Stripe pour gérer l'abonnement.

### Ajouter un artiste (procédure)
1. `insert into catalog_seed(name, scene, status, updated_at) values ('Nom', 'rap-fr', 'pending', now());` (scene : `rap-fr`, `rap-us` ou `rap-uk`).
2. Attendre le cron `mb-sync` ou l'appeler tout de suite (POST sur `/functions/v1/mb-sync`).
3. Si pas de photo ou de pochette : les récupérer sur l'API Deezer (`api.deezer.com/search/artist?q=...`) et mettre à jour `catalog_artists.image` / `catalog_albums.cover`.
4. `select refresh_cards(); select cards_sync_st(); select catalog_cache_refresh();`
5. **Régénérer le fichier statique `catalog.json`** (sinon l'app ne voit pas le nouvel artiste) : télécharger `https://ptoncebyqakclxqnmlzk.supabase.co/rest/v1/rpc/catalog_dump2?apikey=<clé publishable>` et le remplacer dans `main`.
6. Régénérer les pages SEO avec `outils/seo/gen.cjs`. Après génération, il faut :
   - remettre le lien "C'est quoi WaxDrop ?" en pied de page des pages artistes ;
   - remettre l'entrée `a-propos.html` dans `sitemap.xml` ;
   - mettre à jour le nombre d'artistes dans `a-propos.html`.
7. Incrémenter le cache de `sw.js`, commit, push.

Pour changer la rareté d'un son précis : `update cards set r=... where id=...`, puis `catalog_cache_refresh()` et régénérer `catalog.json`.

---

## 4. Historique (résumé)

- **12/10** : début du projet (BeatDex puis TrackDex) : comptes, Bourse, 5 onglets, catalogue Spotify dans Supabase.
- **13/10** : économie gérée par le serveur, amis et invitations, paiements Stripe, renommage en **WaxDrop**, achat de waxdrop.fr chez OVH, passage de Netlify à GitHub Pages, wax coins, WaxDrop Pro à 4,99 €, succès.
- **14/10** : styles préférés, partage du dernier drop en image, catalogue dans IndexedDB.
- **Autour du 20/10** : catalogue MusicBrainz, Spotify abandonné pour le catalogue. Styles musicaux, proposer un artiste, boîte à idées. Stats de joueur. Pont Zernio pour publier sur TikTok/Instagram.
- **26/10, grosse mise à jour** :
  - Ouverture : extraits Deezer, inclinaison 3D et holo, vinyle qui se casse en vrais éclats, nouveaux sons, ouverture sur l'onglet Ouvrir, albums en grand.
  - Bourse : 5 ventes et 5 achats par jour, illimité en Pro, Divins réservés au Pro.
  - Événements refaits avec icônes d'artistes et défi à paliers, labels, collection en vue Sons, plein écran iPhone avec le dock en bas, 5 missions par jour, 15 nouveaux succès, joueurs cliquables au classement.
  - Événement FINIS-LES de La Fève (le son FINIS-LES passé Mythique).
- **26/10 au soir, panne serveur** (pendant une pub TikTok payante). Causes :
  - `refresh_held` beaucoup trop lent ;
  - trop de crons ;
  - `catalog_dump2` trop lourd ;
  - quota du plan gratuit épuisé.
  Corrections :
  - crons réduits et `refresh_held` réécrit ;
  - catalogue mis en cache puis servi en fichier statique ;
  - rafraîchissement des échanges toutes les 20 s au lieu de 8 ;
  - passage de Supabase en Pro.
- **27/10** :
  - Grande vérification et corrections : succès qui plantaient (timeout), erreurs illisibles, spam de ventes, portefeuille Bourse lent.
  - Événement La Fève : plus de son garanti, chances ×8, cote amortie.
  - Une image pour chaque son, album et artiste ; ouverture 2× plus fluide.
- **27/10, SEO** : balises, JSON-LD, 921 pages artistes (950 maintenant), page À propos avec FAQ, sitemap, robots.txt, image de partage. Domaine vérifié dans Search Console et sitemap envoyé (fait par moi).
- **27/10** : nouvelle pub 3D "Fille à Papa" (Vacra, La Rvfleuze). Le son passe Légendaire dans le jeu avec sa pochette. Ajout de Jungle Jack (51 sons) et d'autres artistes en attente (dont 55asky).
- **28/10** : parrainage avec récompenses, et page Amis qui défile.

---

## 5. Les vidéos (TikTok et pubs) : comment elles ont été faites

Tout est fait en code, sans logiciel de montage. Les sources sont dans la branche **`outils`** du dépôt (`git fetch origin outils`). Le README de cette branche explique le rendu.

### Règles que je veux pour les vidéos
- Format 1080×1920 (vertical TikTok), 30 images/s.
- **Pas de musique de fond** dans le fichier : j'ajoute moi-même le son sur TikTok (le son du moment, par exemple "Fille à Papa" ou "FINIS-LES"). Bruitages discrets seulement.
- Une vraie accroche dans les 2 premières secondes.
- Expliquer simplement le jeu.
- Toujours finir par "waxdrop.fr" en gros, avec "100% gratuit, pas de code, pas d'invitation, sur Safari". Préciser que ce n'est pas waxdrop.app.
- Transitions fluides : zooms, mouvements de caméra, texte qui s'étire.
- Les vidéos ne doivent pas être trop longues (une de mes remarques : "beaucoup trop long").

### Pipeline 1 : vidéos "mise à jour" en 2D (`outils/video-maj/`)
- Une page HTML avec un canvas (`video2.html`) anime des captures d'écran de l'app : zooms, textes qui s'étirent, transitions.
- `render.cjs` (Playwright) avance le temps image par image et enregistre chaque image en JPEG. La variable d'environnement `V` choisit la page.
- Captures d'écran de l'app : faites avec Playwright sur une copie locale du site (viewport 390×844, fuseau Europe/Paris). Parfois via GitHub Actions (branche `capture`, script `cap/cap-v35.cjs`, sortie dans `capture-out`) car mon ancien environnement n'avait pas accès à internet. Pour les séquences d'ouverture, captures en "slow-mo" image par image.
- Voix off : **ElevenLabs**, voix **Léo** (`jsScnYkNNda9Q1NES5nn`, "Energetic & Engaging"), modèle `eleven_v4`, flow ElevenLabs `d9hI2DJdhlJtOVwi8eCY`. Ton choqué/excité dans l'accroche.
- Bruitages : synthétisés en Python/numpy (`outils/vid6/audio_sfx.py` : kick, clap, hat, 808, bell, riser, boom, whoosh), puis mixés avec ffmpeg.
- Assemblage : `ffmpeg -framerate 30 -i fr/%04d.jpg -i mix.wav -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac out.mp4`.
- Résultats : `waxdrop-maj-finis-les.mp4`, `waxdrop-maj-voix.mp4` (accroche FINIS-LES, voix).

### Pipeline 2 : pubs en vraie 3D (`outils/pub3d-v1/` et `outils/pub3d-v2/`)
- J'avais demandé une pub avec Higgsfield ("X-Field") : le connecteur Higgsfield ne peut pas générer de vidéo (seulement consulter le solde et les modèles). Donc pub faite "à la main" en **Three.js** (version 0.170.0).
- `ad.html` : toute la scène 3D et la chronologie. Fonction `frame(t)` qui dessine l'instant t, puis textes 2D animés par-dessus (textes qui s'étirent, pastilles, coches vertes).
  - Matériaux physiques : vernis, iridescence, métal brossé.
  - Sillons du vinyle en relief (normal map générée), environnement studio (RoomEnvironment), bloom, flou de mouvement (AfterimagePass), brouillard, faisceaux lumineux, bokeh, sol brillant.
  - Platine complète (plateau alu, bras, cellule, boutons).
  - Vinyle qui monte en rareté, se soulève, se fissure avec de la lumière dorée qui sort des fissures, puis explose en éclats extrudés et étincelles.
  - Carte en 3D avec cadre doré, médaillons des artistes, confettis dorés, mur de cartes, les 6 raretés, téléphone 3D avec captures de l'app et bulles Bourse/Labels/Événements, logo final.
- `render.cjs` : Chromium (Playwright) avec SwiftShader (`--use-gl=angle --use-angle=swiftshader`), rendu en 720×1280 agrandi en 1080×1920. Environ 3,7 s par image. Rendu en parallèle avec `PART=0/2` et `PART=1/2`.
- Pochettes et photos : récupérées via l'**API Deezer** (`cover_xl`, `picture_xl`).
- `sfx.py` : bruitages calés sur la chronologie. Mix avec les voix ElevenLabs via ffmpeg (`adelay`, `atempo`, `amix`, `alimiter`).
- **Pub v1** (26/10) : FINIS-LES de La Fève, "Collectionnez tous vos artistes préférés", une version avec beat et une "sans musique" (`waxdrop-pub-3d-sans-musique.mp4`).
- **Pub v2** (27/10, `waxdrop-pub-3d-v2.mp4`, 28 s) :
  - Accroche : la carte "Fille à Papa" en Légendaire, avec la voix "Attends... regarde ce que je viens de drop !", puis un effet "ON REMBOBINE".
  - Ensuite : le drop sur la platine, "BOUM.", la carte, "Chaque son est une carte" (60 000 sons, 900+ artistes), les 6 raretés, "Tout est dans le jeu".
  - Fin : "WAXDROP.FR", 100% gratuit, pas de code, pas d'invitation, Safari → waxdrop.fr, avec la voix qui le dit.

### Descriptions TikTok (modèle)
"J'ai drop Fille à Papa en LÉGENDAIRE sur WaxDrop. Collectionne les sons de tes rappeurs préférés en cartes. Gratuit, pas de code, pas d'invitation : tape waxdrop.fr sur Safari #waxdrop #rapfr ..."

### Publication
Le pont `zernio` (fonction Edge) permet de publier sur TikTok et Instagram via Zernio.

---

## 6. SEO (objectif : premier sur "WaxDrop")
- Fait :
  - titre "WaxDrop : le jeu de cartes du rap (waxdrop.fr)", description, canonical, Open Graph/Twitter, JSON-LD (WebSite avec alternateName, Organization, VideoGame gratuit) ;
  - texte indexable sur l'accueil ;
  - page `a-propos.html` avec FAQ balisée (dont "le site officiel est waxdrop.fr") ;
  - 950 pages artistes ("{Artiste} : cartes à collectionner | WaxDrop"), maillage interne, sitemap, robots.txt ;
  - domaine vérifié dans Google Search Console (TXT chez OVH) et sitemap envoyé.
- Les liens TikTok/Instagram dans le JSON-LD sont `tiktok.com/@waxdrop` et `instagram.com/waxdrop` : à corriger en `@waxdrop.fr` si ce sont les vrais comptes.
- À faire de mon côté :
  - mettre waxdrop.fr dans les bios et descriptions ;
  - obtenir des liens (Reddit, Discord, créateurs) ;
  - dire "waxdrop point fr" dans les vidéos ;
  - ajouter le site dans Bing Webmaster Tools ;
  - suivre l'indexation dans Search Console (rubriques Pages et Performances).

---

## 7. Connecteurs et outils utilisés dans l'ancienne session

- **Supabase (MCP)** : requêtes SQL, migrations, fonctions Edge (déploiement et lecture), logs, secrets. C'est le plus utilisé.
- **GitHub** : via `git` et le CLI `gh` (push sur `main`, lecture des runs Actions). L'ancienne session tournait dans un conteneur cloud **sans accès réseau** à Supabase, aux CDN, à Deezer ou à Google Storage. Il fallait donc passer par GitHub Actions :
  - branche `capture`, fichier `cap/assets.txt` (lignes "nom url") ;
  - le workflow `assets.yml` télécharge les fichiers et les pousse dans la branche `assets-out` ;
  - le workflow `capture.yml` fait les captures Playwright dans `capture-out`.

  Avec Claude Code en local sur mon Mac, tu as normalement internet directement : ces détours ne sont plus nécessaires.
- **ElevenLabs (MCP)** : voix off (voix Léo `jsScnYkNNda9Q1NES5nn`, flow `d9hI2DJdhlJtOVwi8eCY`, modèle `eleven_v4`). Le connecteur ne fait que la voix (pas de musique ni d'image).
- **Higgsfield (MCP)** : consulté pour une pub vidéo IA, mais ce connecteur ne peut pas générer : abandonné au profit de Three.js.
- **Spotify (MCP)** : recherche de titres (exemple : trouver "Fille à Papa", album `6WJKMOUNc5MI0l5CUp5fhl`).
- **API Deezer** (publique, sans clé) : pochettes, photos d'artistes, extraits 30 s.
- **Stripe** : paiements (liens de paiement + webhook dans Supabase). Le compte Stripe est configuré dans la catégorie Jeux.
- **Zernio** : publication TikTok/Instagram (via la fonction Edge `zernio`).
- **Google Search Console** : vérification du domaine et sitemap (fait par moi).
- **OVHcloud** : DNS du domaine (fait par moi).
- **Recherche web** et **mémoire Claude** (mes préférences et le contexte du projet).
- Outils locaux : Playwright + Chromium, Three.js, Python (numpy, Pillow), ffmpeg.

---

## 8. Où on en est (28/10/2026)

- Le site tourne bien sur Supabase Pro, sans erreurs serveur depuis les corrections du 27/10.
- Événement FINIS-LES de La Fève en cours jusqu'au 29/10 23h59.
- Dernier commit sur `main` : `4a3a398` (page Amis qui défile). Cache du service worker : `waxdrop-v51`.
- Catalogue : environ 1 013 artistes. Les artistes en attente sont traités par `mb-sync`. Certains ne sont "pas trouvés" sur MusicBrainz (statut `notfound`, exemple Jolagreen) : il faut les ajouter autrement (Deezer).
- Pubs TikTok payantes en cours. Dernière pub : `waxdrop-pub-3d-v2.mp4`.

### Idées et pistes pour la suite
- Mode bataille (repoussé à plus tard), cartes "artiste" quand on complète un artiste.
- Connecter le compte Spotify des joueurs (temps d'écoute) plus tard.
- Plus de genres que le rap à terme.
- Continuer le SEO et les pubs TikTok (une pub par son du moment, avec vraies pochettes et photos).
- Corriger les liens sociaux du JSON-LD si besoin.
- Supprimer `netlify.toml` (inutile).

### Pièges à connaître
- Toujours incrémenter `CACHE` dans `sw.js` à chaque mise en ligne.
- Après un changement de catalogue ou de rareté en base : `catalog_cache_refresh()` **et** régénérer `catalog.json` (fichier statique), sinon l'app ne le voit pas.
- Ne pas recréer de cron toutes les minutes (c'est ce qui avait aggravé la panne). Le plan Pro a des limites d'IO.
- `profile_stats` est publique. Les messages d'erreur passent par `niceErr()`.
- Les pages `artistes/` sont générées : ne pas les modifier à la main, modifier `gen.cjs`.
- Le site est public (GitHub Pages) : ne jamais mettre de clé secrète dans `main`. La clé "publishable" Supabase est publique par nature. Les clés Stripe, Zernio et le service role sont dans les secrets Supabase.
