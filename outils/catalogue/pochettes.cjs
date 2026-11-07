/* Ajoute au catalogue servi aux joueurs (catalog.json) les vraies pochettes retrouvées pour les albums et singles qui n'en avaient pas.
   Source : outils/catalogue/pochettes.json { id de l'album en base : adresse de la pochette } (Cover Art Archive, Deezer, iTunes ; jamais d'image générée).
   Appelé tout seul par maj.cjs après chaque mise à jour, ou à la main : node outils/catalogue/pochettes.cjs */
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..'),FILE=path.join(ROOT,'catalog.json'),MAP=path.join(__dirname,'pochettes.json');
function apply(d){const P=fs.existsSync(MAP)?JSON.parse(fs.readFileSync(MAP,'utf8')):{};let n=0;
  for(const x of d.a||[]){
    for(const b of x.al||[]){if(b.c)continue;const id=(b.k||'').replace(/^al-sp-/,'');if(P[id]){b.c=P[id];n++}}
    for(const s of x.sg||[]){if(s[6])continue;const id=(s[4]||'').replace(/^sp-s/,'');if(P[id]){while(s.length<7)s.push(null);s[6]=P[id];n++}}
  }return n}
module.exports={apply};
if(require.main===module){const d=JSON.parse(fs.readFileSync(FILE,'utf8'));const n=apply(d);fs.writeFileSync(FILE,JSON.stringify(d));console.log(n+' pochettes ajoutées à catalog.json')}
