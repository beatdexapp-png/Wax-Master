/* Met à jour le catalogue statique servi aux joueurs (catalog.json) depuis Supabase,
   puis régénère les pages artistes et le plan du site (outils/seo/gen.cjs).
   Sans ça, les artistes ajoutés dans la base restent invisibles dans le jeu (bug « Mac DeMarco », 04/11 : 103 artistes manquaient).
   Usage : node outils/catalogue/maj.cjs   (depuis la racine du dépôt), puis vérifier et committer.
   Utilise seulement la clé publique (publishable), déjà présente dans catalog.js. */
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const ROOT=path.join(__dirname,'..','..'),FILE=path.join(ROOT,'catalog.json');
const src=fs.readFileSync(path.join(ROOT,'catalog.js'),'utf8');
const URL=src.match(/URL='(https:\/\/[^']+)'/)[1],KEY=src.match(/KEY='(sb_publishable_[^']+)'/)[1];
const count=d=>d.a.reduce((s,x)=>s+(x.al||[]).reduce((t,b)=>t+(b.tr||[]).length,0)+(x.sg||[]).length,0);

(async()=>{
  const r=await fetch(URL+'/rest/v1/rpc/catalog_dump2',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:'{}'});
  if(!r.ok)throw new Error('Supabase '+r.status+' '+(await r.text()).slice(0,200));
  const t=await r.text(),n=JSON.parse(t);
  if(!Array.isArray(n.a)||n.a.length<500)throw new Error('catalogue reçu suspect ('+(n.a||[]).length+' artistes), fichier non remplacé');
  const o=fs.existsSync(FILE)?JSON.parse(fs.readFileSync(FILE,'utf8')):{a:[]};
  const on=new Set(o.a.map(x=>x.k)),nn=new Set(n.a.map(x=>x.k));
  const add=n.a.filter(x=>!on.has(x.k)).map(x=>x.n),gone=o.a.filter(x=>!nn.has(x.k)).map(x=>x.n);
  console.log('Avant :',o.v||'?',o.a.length,'artistes,',count(o),'sons');
  console.log('Après :',n.v,n.a.length,'artistes,',count(n),'sons');
  console.log(add.length+' ajoutés'+(add.length?' : '+add.slice(0,30).join(', ')+(add.length>30?'…':''):''));
  if(gone.length)console.log('ATTENTION, '+gone.length+' disparus : '+gone.join(', '));
  /* un artiste disparu n'est pas forcément voulu : on s'arrête si beaucoup disparaissent d'un coup */
  if(gone.length>20&&!process.argv.includes('--force'))throw new Error('trop d\'artistes disparus, relancer avec --force si c\'est voulu');
  /* vraies pochettes retrouvées à part (07/11/2026) pour les albums et singles que la base n'a pas encore */
  const np=require('./pochettes.cjs').apply(n);if(np)console.log(np+' pochettes ajoutées depuis pochettes.json');
  fs.writeFileSync(FILE,np?JSON.stringify(n):t);
  execFileSync(process.execPath,[path.join(ROOT,'outils','seo','gen.cjs')],{stdio:'inherit',cwd:ROOT});
  console.log('Fait. Penser à monter CACHE dans sw.js seulement si d\'autres fichiers du jeu ont changé (catalog.json n\'en a pas besoin).');
})().catch(e=>{console.error('Échec :',e.message);process.exit(1)});
