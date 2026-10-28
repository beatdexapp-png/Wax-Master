/* Génère artistes/*.html, artistes/index.html et sitemap.xml à partir de data.js + catalog.json,
   avec la même fusion que catalog.js (ce que le joueur voit en jeu).
   Usage : node outils/seo/gen.cjs   (depuis la racine du dépôt) */
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..'),OUT=path.join(ROOT,'artistes'),SITE='https://waxdrop.fr';
const DATE=new Date().toISOString().slice(0,10);

const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT,'data.js'),'utf8')+';this.RAW=RAW',ctx);
const RAW=ctx.RAW,dump=JSON.parse(fs.readFileSync(path.join(ROOT,'catalog.json'),'utf8'));

/* fusion : copie de merge() dans catalog.js */
function key(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
const IMG={a:{},b:{}};
const have={};RAW.forEach(A=>{have[key(A.n)]=A});
dump.a.forEach(x=>{
  if(!x||!x.n)return;
  if(x.i)IMG.a[x.n]=x.i;
  (x.al||[]).forEach(b=>{if(b.c)IMG.b[x.n+'|'+b.t]=b.c});
  if(x.base)return;
  const al=(x.al||[]).filter(b=>b.tr&&b.tr.length).map(b=>({t:b.t,y:+b.y||2020,tr:b.tr}));
  const sg=(x.sg||[]).map(s=>[s[0],s[1],+s[2]||2020]);
  if(!al.length&&!sg.length)return;
  const kx=key(x.n);
  if(have[kx]){
    const R0=have[kx],tk={},ak={};
    (R0.al||[]).forEach(b=>{ak[key(b.t)]=b;(b.tr||[]).forEach(t=>{tk[key(typeof t==='string'?t:t[0])]=1})});
    (R0.sg||[]).forEach(t=>{tk[key(t[0])]=1});
    al.forEach(b=>{b.tr=b.tr.filter(t=>{if(tk[key(t[0])])return false;tk[key(t[0])]=1;return true});if(!b.tr.length)return;
      const same=ak[key(b.t)];if(same)same.tr=(same.tr||[]).concat(b.tr);else{R0.al=R0.al||[];R0.al.push(b)}});
    sg.forEach(t=>{if(tk[key(t[0])])return;tk[key(t[0])]=1;R0.sg=R0.sg||[];R0.sg.push(t)});
    return}
  RAW.push({n:x.n,al,sg});have[kx]=RAW[RAW.length-1];
});

const slug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const tn=t=>typeof t==='string'?t:t[0];
const STYLE='body{margin:0;font-family:-apple-system,system-ui,Segoe UI,Roboto,sans-serif;background:#0b0a10;color:#eee;line-height:1.5}main{max-width:760px;margin:0 auto;padding:24px 18px 60px}a{color:#ffc23d}h1{font-size:2rem;margin:.2em 0}h2{font-size:1.2rem;margin:1.6em 0 .4em}.cta{display:inline-block;background:#ffc23d;color:#1a1200;font-weight:800;padding:14px 22px;border-radius:999px;text-decoration:none;margin:14px 0}.hd{display:flex;gap:16px;align-items:center}.hd img{width:96px;height:96px;border-radius:50%;object-fit:cover}ul{padding-left:18px}li{margin:2px 0}.al{display:flex;gap:12px;align-items:center}.al img{width:56px;height:56px;border-radius:8px;object-fit:cover}nav{font-size:.9rem;opacity:.8}footer{margin-top:40px;font-size:.85rem;opacity:.7}';

function page(A,s){
  const N=A.n,url=SITE+'/artistes/'+s+'.html',img=IMG.a[N]||'';
  const al=(A.al||[]).filter(b=>b.tr&&b.tr.length),sg=A.sg||[];
  const count=al.reduce((n,b)=>n+b.tr.length,0)+sg.length;
  const desc=`Collectionne les ${count} sons de ${N} en cartes sur WaxDrop : ouvre des drops gratuits, trouve les raretés (Mythique, Divin) et complète ses albums. Gratuit sur waxdrop.fr.`;
  const title=`${N} : cartes à collectionner | WaxDrop`;
  const group={'@type':'MusicGroup',name:N};if(img)group.image=img;
  group.album=al.map(b=>{const o={'@type':'MusicAlbum',name:b.t};if(b.y)o.datePublished=String(b.y);return o});
  const ld={'@context':'https://schema.org','@graph':[{'@type':'BreadcrumbList',itemListElement:[
    {'@type':'ListItem',position:1,name:'WaxDrop',item:SITE+'/'},
    {'@type':'ListItem',position:2,name:'Artistes',item:SITE+'/artistes/'},
    {'@type':'ListItem',position:3,name:N,item:url}]},group]};
  let h=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="WaxDrop"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">`+`<meta property="og:image" content="${esc(img||SITE+'/icons/og.png')}">`+`<meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/icons/icon-192.png" type="image/png"><script type="application/ld+json">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script><style>${STYLE}</style></head><body><main>\n`;
  h+=`<nav><a href="/">WaxDrop</a> › <a href="/artistes/">Artistes</a> › ${esc(N)}</nav>\n`;
  h+=`<div class="hd">`+(img?`<img src="${esc(img)}" alt="${esc(N)}" loading="lazy">`:'')+`<div><h1>${esc(N)} sur WaxDrop</h1><p>${count} sons de ${esc(N)} à collectionner en cartes, de Commun à Divin.</p></div></div>\n`;
  h+=`<a class="cta" href="/">Ouvrir un drop gratuit</a>\n`;
  h+=al.map(b=>{const c=IMG.b[N+'|'+b.t];
    return (c?`<h2 class="al"><img src="${esc(c)}" alt="${esc(b.t)}" loading="lazy">`:'<h2>')+`${esc(b.t)}${b.y?` (${b.y})`:''}</h2><ul>`+b.tr.map(t=>`<li>${esc(tn(t))}</li>`).join('')+'</ul>'}).join('')+'\n';
  h+=(sg.length?'<h2>Singles</h2><ul>'+sg.map(t=>`<li>${esc(t[0])}</li>`).join('')+'</ul>':'')+'\n';
  h+=`<a class="cta" href="/">Jouer à WaxDrop</a>\n`;
  h+=`<footer><a href="/a-propos.html">C'est quoi WaxDrop ?</a> · WaxDrop, le jeu de cartes à collectionner du rap. Gratuit, sans téléchargement, sur <a href="/">waxdrop.fr</a>.</footer></main></body></html>`;
  return h;
}

const done={},list=[];
RAW.forEach(A=>{const s=slug(A.n);if(!s||s==='index'||done[s])return;
  const n=(A.al||[]).reduce((k,b)=>k+(b.tr||[]).length,0)+(A.sg||[]).length;if(!n)return;
  done[s]=1;list.push({n:A.n,s});fs.writeFileSync(path.join(OUT,s+'.html'),page(A,s))});
/* pages d'anciens noms gardées (liens entrants) */
fs.readdirSync(OUT).forEach(f=>{const s=f.replace(/\.html$/,'');if(f.endsWith('.html')&&s!=='index'&&!done[s])console.log('page sans artiste (gardée) :',f)});
list.sort((a,b)=>a.n.localeCompare(b.n,'fr',{sensitivity:'base'}));
const tot=list.length;
fs.writeFileSync(path.join(OUT,'index.html'),`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tous les artistes | WaxDrop</title><meta name="description" content="Les ${tot} artistes à collectionner sur WaxDrop, le jeu de cartes du rap : PNL, Ninho, Jul, Booba, Damso, La Fève et bien plus."><link rel="canonical" href="${SITE}/artistes/"><link rel="icon" href="/icons/icon-192.png" type="image/png"><style>${STYLE}.g{columns:2}</style></head><body><main><nav><a href="/">WaxDrop</a> › Artistes</nav><h1>Les artistes de WaxDrop</h1><p>${tot} artistes, plus de 60 000 sons à collectionner.</p><a class="cta" href="/">Ouvrir un drop gratuit</a><ul class="g">`+list.map(a=>`<li><a href="/artistes/${a.s}.html">${esc(a.n)}</a></li>`).join('')+`</ul></main></body></html>\n`);
fs.writeFileSync(path.join(ROOT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${SITE}/</loc><lastmod>${DATE}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n<url><loc>${SITE}/a-propos.html</loc><changefreq>monthly</changefreq><priority>0.9</priority></url><url><loc>${SITE}/artistes/</loc><lastmod>${DATE}</lastmod><priority>0.8</priority></url>\n`+list.map(a=>`<url><loc>${SITE}/artistes/${a.s}.html</loc><lastmod>${DATE}</lastmod><priority>0.6</priority></url>`).join('\n')+'\n</urlset>\n');
console.log(tot+' pages artistes');
