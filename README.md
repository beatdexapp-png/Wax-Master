# Outils WaxDrop (branche `outils`, pas servie par le site)

- `pub3d-v2/` : pub 3D "Fille à Papa" (Three.js). `ad.html` = la scène, `render.cjs` = rendu image par image (Playwright + SwiftShader), `sfx.py` = bruitages (utilise `../vid6/audio_sfx.py`), `vo_*.mp3` = voix ElevenLabs (Léo), `tex/` = pochettes et captures.
- `pub3d-v1/` : première pub 3D (FINIS-LES de La Fève).
- `video-maj/` : vidéo "mise à jour" en canvas 2D (captures de l'app animées + voix). Les captures d'écran ne sont pas incluses (à refaire avec Playwright sur l'app).
- `vid6/audio_sfx.py` : synthé de bruitages en numpy (kick, clap, hat, 808, bell, riser, boom, whoosh).
- `seo/gen.cjs` : génère `artistes/*.html`, `artistes/index.html`, `sitemap.xml` depuis `data.js` + `catalog.json`.
- Vidéos finales : `waxdrop-pub-3d-v2.mp4`, `waxdrop-pub-3d-sans-musique.mp4`, `waxdrop-maj-voix.mp4`.

Rendu d'une pub 3D :
```
cd pub3d-v2 && npm i three@0.170.0 && python3 -m http.server 8769 &
PART=0/2 node render.cjs & PART=1/2 node render.cjs & wait     # images dans fr/
python3 sfx.py   # sfx.wav ; puis mixer avec les voix (ffmpeg adelay/amix) et assembler :
ffmpeg -framerate 30 -i fr/%04d.jpg -i mix.wav -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -shortest out.mp4
```
