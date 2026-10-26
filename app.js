let STYLES=[['Tous','Tous']];
const SKINS=[['auto','Auto'],['graphite','Graphite'],['encre','Encre'],['aube','Aube'],['foret','Forêt'],['or','Or'],['brume','Brume'],['sable','Sable'],['lilas','Lilas'],['minuit','Minuit',1],['nacre','Nacre',1]];
const SKPV={auto:'linear-gradient(135deg,#e8ebf1 50%,#0e0f12 50%)',graphite:'radial-gradient(circle at 20% 20%,rgba(90,110,190,.8),transparent 60%),radial-gradient(circle at 90% 80%,rgba(40,130,115,.7),transparent 60%),#0e0f12',encre:'radial-gradient(circle at 20% 20%,rgba(70,90,230,.9),transparent 60%),radial-gradient(circle at 90% 80%,rgba(40,170,220,.7),transparent 60%),#0a0e1c',aube:'radial-gradient(circle at 20% 20%,rgba(230,90,110,.85),transparent 60%),radial-gradient(circle at 90% 80%,rgba(240,160,80,.7),transparent 60%),#160d10',foret:'radial-gradient(circle at 20% 20%,rgba(60,170,120,.85),transparent 60%),radial-gradient(circle at 90% 80%,rgba(150,190,80,.6),transparent 60%),#0b120f',or:'radial-gradient(circle at 20% 20%,rgba(210,160,60,.85),transparent 60%),radial-gradient(circle at 90% 80%,rgba(160,110,40,.7),transparent 60%),#12100a',brume:'radial-gradient(circle at 20% 20%,rgba(150,170,255,.9),transparent 60%),radial-gradient(circle at 90% 80%,rgba(255,190,160,.9),transparent 60%),#e8ebf1',sable:'radial-gradient(circle at 20% 20%,rgba(230,150,110,.8),transparent 60%),radial-gradient(circle at 90% 80%,rgba(150,180,140,.8),transparent 60%),#efe7db',lilas:'radial-gradient(circle at 20% 20%,rgba(170,140,255,.9),transparent 60%),radial-gradient(circle at 90% 80%,rgba(255,170,210,.85),transparent 60%),#ebe7f4',minuit:'radial-gradient(circle at 20% 20%,rgba(140,80,255,.8),transparent 60%),radial-gradient(circle at 90% 80%,rgba(255,60,140,.6),transparent 60%),#05040a',nacre:'radial-gradient(circle at 20% 20%,rgba(255,220,240,.95),transparent 60%),radial-gradient(circle at 90% 80%,rgba(200,240,255,.95),transparent 60%),#f6f4f1'};
const COST=100,ALB_BONUS=250,ART_BONUS=500,GOLD_COST=900,DROP_COST=250,DROP_LIMIT=500;
const CODES={UNDERGROUND:500,WAXDROP:300,ZARMA:200};
const SHOP=[{k:'c500',n:500,p:'0,99 €'},{k:'c1200',n:1200,p:'1,99 €',tag:'+20 %'},{k:'c3000',n:3000,p:'4,99 €',tag:'+20 %'},{k:'c7000',n:7000,p:'9,99 €',tag:'+40 %'}];
const PK={gold:{n:'Drop Or',p:GOLD_COST,min:1,last:3,b:{3:2,4:2,5:2},g:'Légendaire garanti'},nacre:{n:'Drop Ultra',p:400,min:1,last:2,b:{},g:'Ultra rare garanti'},diamant:{n:'Drop Diamant',p:2000,min:2,last:4,b:{4:2,5:2},g:'Mythique garanti'}};
const PASS_PRICE='4,99 € / mois';
const PSEUDOS=['zayn.93','lunatic_k','dalida.wav','mvp_sinna','yaya.prod','nekfan','oz.92i','soso.lune','ritchie.mp3','k.dot.fr','bbf_only','cramé.exe','mel_zer','djadja94','wave.95','rodé.x','ninho.lt','sch.akimbo','jvlivs','nuit.blanche'];
const FRIENDS=['soso.lune','mvp_sinna','oz.92i','wave.95','mel_zer'];
const DUST_GET=[5,10,25,60,150,400],DUST_COST=[40,80,200,500,1200,3000];
const WCOL=['rgba(255,255,255,.78)','#7cc0ff','#d4a3ff','#ffd36b','#ff8fab','#8a6420'];
const SEASON_END='2026-11-30T23:59',SEASON_START='2026-10-01T00:00',TIERS=30,TIER_XP=100;
const MISS=[{k:'open',n:3,t:'Ouvre 3 drops',c:80,x:60},{k:'newT',n:5,t:'Trouve 5 nouveaux sons',c:100,x:80},{k:'buy',n:1,t:'Achète un son à la Bourse',c:50,x:40},{k:'recycle',n:1,t:'Recycle un double',c:50,x:40},{k:'trade',n:1,t:'Propose un échange',c:60,x:40},{k:'sell',n:1,t:'Vends un son à la Bourse',c:60,x:40},{k:'topA',n:1,t:'Drop un son de ton top',c:120,x:80},{k:'rare',n:3,t:'Trouve 3 sons Ultra rare ou mieux',c:90,x:60},{k:'leg',n:1,t:'Trouve un Légendaire ou mieux',c:150,x:100},{k:'evc',n:3,t:'Drop 3 sons de l’événement',c:100,x:60},{k:'craft',n:1,t:'Fabrique un son avec ta poussière',c:60,x:40}];

function hash(s){let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}return h>>>0}
function rng(s){let a=hash(s);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const slug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'x';
function tierOf(s){if(s==null)return 5;let r=0;for(let i=0;i<5;i++)if(s>=RAR[i].min)r=i;return r}
function cover(seed,r){
  const R=rng('cv'+seed);
  if(r===5){const x=30+R()*40|0;return `radial-gradient(circle at ${x}% 40%,#d4a948 0 17%,rgba(212,169,72,0) 17.6%),repeating-linear-gradient(180deg,rgba(90,64,20,0) 0 8%,rgba(90,64,20,.2) 8% 8.7%),linear-gradient(160deg,#f6eedb,#e3d1a8)`}
  const h=R()*360|0,h2=(h+30+R()*60)%360|0,h3=(h+150+R()*60)%360|0;
  const c1=`hsl(${h} ${48+R()*20|0}% ${44+R()*14|0}%)`,c2=`hsl(${h2} ${38+R()*20|0}% ${20+R()*12|0}%)`,c3=`hsl(${h3} ${45+R()*25|0}% ${62+R()*16|0}%)`;
  const st=R()*5|0,x=15+R()*70|0,y=15+R()*55|0,a=R()*180|0;
  if(st===0)return `radial-gradient(circle at ${x}% ${y}%,${c3} 0 21%,rgba(0,0,0,0) 21.5%),linear-gradient(${a}deg,${c1},${c2})`;
  if(st===1)return `repeating-linear-gradient(${a}deg,${c1} 0 11%,${c2} 11% 22%,${c3} 22% 24%)`;
  if(st===2)return `repeating-radial-gradient(circle at ${x}% ${y}%,${c1} 0 7%,${c2} 7% 14%)`;
  if(st===3)return `radial-gradient(circle at ${x}% ${y}%,${c3} 0 10%,rgba(0,0,0,0) 10.5%),linear-gradient(${a>90?90:0}deg,${c1} 0 50%,${c2} 50%)`;
  return `conic-gradient(from ${a}deg at ${x}% ${y}%,${c1},${c2},${c3},${c1})`;
}

/* ================= CONSTRUCTION ================= */
const CARDS=[],ALBUMS=[],ARTISTS=[],C={},RW={};
RAW.forEach(A=>{
  const ak=A.k||slug(A.n);const st=A.st||(A.g==='Monde'?'Pop':'Rap');const art={key:ak,n:A.n,g:A.g,st,u:!!A.u,ids:[],albums:[],sgk:null,ini0:A.ini,type:'artiste'};
  (A.al||[]).forEach(al=>{
    const alk=al.k||('al-'+ak+'-'+slug(al.t));const alb={key:alk,t:al.t,a:A.n,ak,g:A.g,st,y:al.y,ids:[],p:!!al.p,type:'album'};
    const R=rng('st|'+alk);
    al.tr.forEach(x=>{const [t,s0,id0,r0]=typeof x==='string'?[x,undefined]:x;const id=id0||ak+'--'+slug(t);if(C[id])return;
      const s=s0===undefined?Math.max(1,Math.round(al.b*(.45+R()*.9))):s0;const c={id,t,a:A.n,ak,g:A.g,st,y:al.y,s,al:al.t,alk,r0};C[id]=c;CARDS.push(c);alb.ids.push(id);art.ids.push(id)});
    ALBUMS.push(alb);art.albums.push(alk);RW[alk]=alb;
  });
  if(A.sg&&A.sg.length){const sk='sg-'+ak;const sgl={key:sk,t:'Singles',a:A.n,ak,g:A.g,st,y:null,ids:[],single:true,type:'album'};
    A.sg.forEach(([t,s,y,from,id0,r0])=>{const id=id0||ak+'--'+slug(t);if(C[id])return;const c={id,t,a:A.n,ak,g:A.g,st,y,s,al:from||null,alk:sk,r0};C[id]=c;CARDS.push(c);sgl.ids.push(id);art.ids.push(id)});
    art.sgk=sk;RW[sk]=sgl}
  ARTISTS.push(art);RW[ak]=art;
});
/* styles musicaux présents (au moins 3 artistes), du plus fréquent au moins fréquent */
{const n={};ARTISTS.forEach(A=>{n[A.st]=(n[A.st]||0)+1});STYLES=[['Tous','Tous'],...Object.keys(n).filter(k=>n[k]>=3).sort((a,b)=>n[b]-n[a]).map(k=>[k,k])]}
const BASE=[[24,24],[36,24],[49,22],[61,20],[73,18],[84,15]];
CARDS.forEach(c=>{c.r=c.r0!=null?c.r0:tierOf(c.s)});
CARDS.sort((x,y)=>x.r-y.r||(x.s??0)-(y.s??0)||x.t.localeCompare(y.t));
CARDS.forEach((c,i)=>{c.no=i+1;c.q=slug(c.t+' '+c.a);
  const R=rng('bg'+c.id),h=R()*360|0;c.bg=c.r===5?'linear-gradient(155deg,#f6eedb,#e3d1a8)':`linear-gradient(155deg,hsl(${h} 32% 27%),hsl(${(h+40)%360} 38% 11%))`;c.hue=h;
  const r=rng(c.t+'|'+c.a),[b,sp]=BASE[c.r];c.flow=clamp(Math.round(b+sp*(.3+.7*r())),1,99);c.hype=clamp(Math.round(b+sp*r()),1,99);c.aura=clamp(Math.round(b+sp*(.2+.8*r())),1,99)});
[...ALBUMS,...ARTISTS.filter(a=>a.sgk).map(a=>RW[a.sgk])].forEach(A=>{A.r=A.ids.some(id=>C[id].r===5)?5:Math.max(1,tierOf(A.ids.reduce((s,id)=>s+(C[id].s||0),0)/4));A.art=cover('al|'+A.t+A.a,A.r===5?5:1);A.lab=`hsl(${hash(A.t+A.a)%360} 70% 62%)`;A.q=slug(A.t+' '+A.a)});
ARTISTS.forEach(A=>{const ws=A.n.split(/\s+/).filter(w=>/[A-Za-zÀ-ÿ0-9]/.test(w));
  A.ini=A.ini0||(ws.length===1&&ws[0].length<=4&&ws[0]===ws[0].toUpperCase()?ws[0]:ws.slice(0,2).map(w=>w[0].toUpperCase()).join(''));
  const h=hash(A.n)%360;A.avg=`linear-gradient(140deg,hsl(${h} 46% 60%),hsl(${(h+40)%360} 44% 34%))`;A.q=slug(A.n)});
/* vraies images (Spotify) */
const SC='https://i.scdn.co/image/',IMG_A={"PNL": "ab6761610000517451767bb5e3e3add66699344b", "Nekfeu": "ab6772690000bac34a1e10c0f2d273fcebe4a077", "Orelsan": "ab676161000051742b44dbe96b6b8e5261e142b1", "Booba": "ab6761610000517496b3ab10e89bad078d125c3a", "Damso": "ab67616100005174301a9c599d85d89e7a90fed0", "Ninho": "ab676161000051747844053470fa0a138eec6662", "Freeze Corleone": "ab67616100005174cbc9cc45e24377c8ca8344e4", "Lomepal": "ab6761610000517408a91c70b5af4a856d9ea2d0", "Sexion d'Assaut": "ab67616100005174e5380469a579bd4fc105899f", "Maître Gims": "ab6761610000517477144f838397a467e807df65", "Jul": "ab67616100005174aa70253f73793a0ff061069e", "13 Organisé": "ab676161000051747dee90f2a73339f6ca762872", "SCH": "ab676161000051744ed985f33e971801dae4e24d", "Gazo": "ab67616100005174de1f31d720f69ddfaaccc232", "Tiakola": "ab676161000051742b35d895b61bbfe90a903856", "SDM": "ab67616100005174cef13995942c7a300df73050", "Laylow": "ab6761610000517483e5fcaa1aa7b751966cf706", "Alpha Wann": "ab67616100005174d308bf91fbbf4c9cf8cecc05", "Vald": "ab676161000051747f424b7449ae0a21541a370d", "Kaaris": "ab67616100005174d1a3614ee97e2997a0eb8f1a", "Niska": "ab67616100005174536e207c626c48b3c2419212", "Koba LaD": "ab6761610000517459d9403f63dbda10b2875c53", "MHD": "ab6761610000517445dfc1305248ad28781e04bd", "Soolking": "ab67616100005174f5e6804e7f2f3ac8a8cfbdb0", "Heuss L'enfoiré": "ab676161000051742f80a4db539393be03e8cf93", "Naps": "ab67616100005174301657b8cb877183b9bc7a77", "Rohff": "ab6761610000517471c794ed448fec98dea6966a", "Diam's": "ab67616100005174cffba869095aecf597aaa104", "Kery James": "ab676161000051749617ebf931d7f2467cdaa714", "IAM": "210db36e46b7a7d5a4cccb16e722a605f17e9ab9", "Suprême NTM": "ab676161000051741d2e7085048e4f8ceb2f8a45", "MC Solaar": "ab67616100005174ac4b8b6c9308becb994e5673", "Oxmo Puccino": "ab67616100005174725875154cd5be92768226cf", "So La Lune": "ab67616100005174fd63183ccd56df9dbe40f17c", "Jeune Morty": "ab67616100005174cbee38059302e48ef042efae", "Jolagreen23": "ab6761610000517402ec56319ee5a4c3720db4ba", "La Fève": "ab67616100005174a400412a7cbdc913db7821a7", "Prince Waly": "ab67616100005174cc5f8a56afe5499ad769e555", "Luv Resval": "ab67616100005174aeadb37bba882423385e1a85", "H JeuneCrack": "ab67616100005174e35075e65c475dceb4655c92", "Rounhaa": "ab67616100005174197bd15007d8f57eeb12df63", "8ruki": "ab676161000051743ba3da5100ea03efc87366bf", "Yvnnis": "ab676161000051740a42f27b015923add400ae57", "Kerchak": "ab67616100005174fde06dfe57b324fc6d343093", "Kendrick Lamar": "ab6761610000517439ba6dcd4355c03de0b50918", "Eminem": "ab67616100005174a00b11c129b27a88fc72f36b", "Drake": "ab676161000051744293385d324db8558179afd9", "Travis Scott": "ab6761610000517419c2790744c792d05570bb71", "J. Cole": "ab67616100005174c401ea77e86ee984b1ba9fc2", "Kanye West": "ab676161000051746e835a500e791bf9c27a422a", "Tyler, The Creator": "ab67616100005174df2728294ff77dd11eeb18fb", "Juice WRLD": "ab6761610000517423a60030944f7853c21565ef", "XXXTENTACION": "ab67616100005174f0c20db5ef6c6fbe5135d2e4", "50 Cent": "df73c0cebe56cafe705ffdba5085ccbd5680bd16", "Nas": "ab67616100005174153198caeef9e3bda92f9285", "2Pac": "ab676161000051747f5cc432c9c109248ebec1ac", "The Notorious B.I.G.": "e56612ae56c9007e99ab36b83efd4faf6401260d", "Dr. Dre": "ab6772690000bac3250b3af4b06e1fcf538d398b", "Snoop Dogg": "ab67616100005174c19a88576ebe6fcbb325c297", "Dave": "ab676161000051742f23c7e361cef62490f44057", "Stormzy": "ab67616100005174674d29e07df021a35df3ddf1", "Skepta": "ab676161000051749b4eb6af9fdcc71799c5c5ba", "Central Cee": "ab676161000051746ce131983245fc2e6940f6c2"},IMG_B={"orelsan|le-chant-des-sirenes": "ab67616d00001e0208c348d65e72ef5b47f1942b", "orelsan|la-fete-est-finie": "ab67616d00001e027e41808b163893160ccf414b", "orelsan|civilisation": "ab67616d00001e02cde350de8f4c63e2987cabf7", "pnl|dans-la-legende": "ab67616d00001e02034f85da463faf79527d1fe0", "pnl|deux-freres": "ab67616d00001e026c3966c4dd0eb2273696fe16", "ninho|destin": "ab67616d00001e028c7e885a89abd9500f39a1d0", "lomepal|jeannine": "ab67616d00001e0200c0bba714d6c46e47ab1d07", "sexion-d-assaut|l-ecole-des-points-vitaux": "ab67616d00001e0299d53d8504478066f858f544", "maitre-gims|subliminal": "ab67616d00001e02596368082712ceff7ae95649", "laylow|trinity": "ab67616d00001e02cf9726b68163ea79514a3435", "diam-s|dans-ma-bulle": "ab67616d00001e020c945348847382dde8622c17", "iam|l-ecole-du-micro-d-argent": "ab67616d00001e0265716918209ccc6bac2af278", "supreme-ntm|supreme-ntm": "ab67616d00001e02b0af6c9d26487cf55ba0efd6", "oxmo-puccino|opera-puccino": "ab67616d00001e028b9e577d36c14f146c4e7a8d", "jeune-morty|eponyme": "ab67616d00001e022fc87ad594aa9ddd407477dc", "jolagreen23|goty-edition": "ab67616d00001e02f665a81395d0210f8fbcfc49", "la-feve|errr": "ab67616d00001e0263c957fb0bfa71e110ba748f", "prince-waly|moussa": "ab67616d00001e02c3439cd8965f67e2ed3ffb2d", "luv-resval|etoile-noire": "ab67616d00001e02f8703a930521cdb7521738f1", "8ruki|lobby": "ab67616d00001e028ec985b754d1fa1cf84e9eab", "yvnnis|dnd": "ab67616d00001e02b8b4b83a12d6fa70058f89bc", "travis-scott|astroworld": "ab67616d00001e02daec894c14c0ca42d76eeb32", "tyler-the-creator|igor": "ab67616d00001e0230a635de2bb0caa4e26f6abb", "nas|illmatic": "ab67616d00001e0271d840defb002ed3b180f7cd", "the-notorious-b-i-g|ready-to-die": "ab67616d00001e020f51e29700232d57fe8a0830", "snoop-dogg|doggystyle": "ab67616d00001e02733af86f8dea9692a3f59d29", "skepta|konnichiwa": "ab67616d00001e02969de80dfcad2d496da82410"};
ARTISTS.forEach(A=>{const u=IMG_A[A.n]?SC+IMG_A[A.n]:(window.CATIMG&&CATIMG.a[A.n]);if(u){A.img=u;A.avg=`url("${A.img}") center/cover no-repeat,${A.avg}`;A.ini=''}});
ALBUMS.forEach(B=>{const u=IMG_B[slug(B.a)+'|'+slug(B.t)]?SC+IMG_B[slug(B.a)+'|'+slug(B.t)]:(window.CATIMG&&CATIMG.b[B.a+'|'+B.t]);if(u){B.img=u;B.art=`url("${B.img}") center/cover no-repeat,${B.art}`}});
CARDS.forEach(c=>{const B=RW[c.alk];const u=(B&&B.img)||(window.CATIMG&&CATIMG.s&&CATIMG.s[c.a+'|'+c.t]);if(u)c.img=u});
const N=CARDS.length;
const POOL=RAR.map((_,r)=>CARDS.filter(c=>c.r===r));
const WEEK=Math.floor((Date.now()-Date.UTC(2026,0,5))/(7*864e5));
const TREND=new Set((()=>{const R=rng('trend'+WEEK),L=CARDS.filter(c=>c.r<5).slice(),o=[];while(o.length<15&&L.length)o.push(L.splice(Math.floor(R()*L.length),1)[0].id);return o})());
const BIGALB=ALBUMS.filter(A=>A.ids.length>=8);
function curDrop(){const w=Math.floor(Date.now()/(48*3600e3));const A=BIGALB[hash('drop'+w)%BIGALB.length];return{w,A,e:(w+1)*48*3600e3}}

/* ================= ÉTAT ================= */
const KEY='platine-v4';
function fresh(){const o={};['Shavkat','Projet Blue Beam','Rap catéchisme','Martin Eden','Validée','Galatée','Trinityville','Couture','MAUVAIS PAYEUR'].forEach(t=>{const c=CARDS.find(x=>x.t===t);if(c)o[c.id]=1});
  return{coins:300,owned:o,packs:0,freeAt:0,bonus:0,gold:0,dust:0,xp:0,sfree:[],sprem:[],fav:[],ser:{},drop:{},day:{},ul:{},codes:{},spot:null,pass:null,passDay:'',mk:null,set:{lite:false,skin:'auto'}}}
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||typeof S!=='object'||!S.owned)S=fresh();
S=Object.assign(fresh(),S);S.set=Object.assign({lite:false,skin:'auto'},S.set||{});
for(const k in S.owned)if(!C[k])delete S.owned[k];
for(const k in S.ul)if(!RW[k])delete S.ul[k];
S.fav=(S.fav||[]).filter(id=>C[id]);S.spot=null;S.pass=null;if(S.mk&&S.mk.list)S.mk.list=[];
if(S.freeAt>Date.now()+600e3)S.freeAt=Date.now()+600e3;
if(!SKINS.some(s=>s[0]===S.set.skin))S.set.skin='auto';
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
let tab='ouvrir';
let seaSub='pass',colView='bulles',colG='Tous',shopSub='hub',jetSub='packs',mkSub='live',profSub='vitrine',catQ='',catScope='artistes',catG='Tous',catOwn='all',reveal=null,menuPage=null,resetArm=false,stack=[];

/* ================= OUTILS ================= */
const $=id=>document.getElementById(id);
const now=()=>Date.now();
const today=()=>new Date().toISOString().slice(0,10);
const fr=v=>v.toLocaleString('fr-FR',{maximumFractionDigits:1});
const fmtS=s=>s==null?'Classique':s>=1000?`${fr(s/1000)} Md`:`${s} M`;
function dur(ms){const m=Math.max(0,Math.ceil(ms/60000));const d=Math.floor(m/1440),h=Math.floor(m%1440/60),mn=m%60;return d?`${d} j ${h} h`:h?`${h} h ${String(mn).padStart(2,'0')}`:`${mn} min`}
function clock(ms){const s=Math.max(0,Math.ceil(ms/1000));const m=Math.floor(s/60);return m>=60?dur(ms):`${m}:${String(s%60).padStart(2,'0')}`}
const fdate=s=>new Date(s).toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
function evState(e){const t=now();return t<+new Date(e.s)?'next':t<+new Date(e.e)?'live':'past'}
const liveEv=()=>EVENTS.find(e=>evState(e)==='live');
const nextEv=()=>EVENTS.filter(e=>evState(e)==='next').sort((a,b)=>new Date(a.s)-new Date(b.s))[0];
const cost=()=>{const e=liveEv();return e&&e.fx.cost||COST};
const hasPass=()=>!!(S.passUntil&&S.passUntil>Date.now());
const freeMs=()=>hasPass()?300e3:600e3;
const coinI='<i class="coin"></i>',dustI='<i class="dust"></i>';
const own=id=>(S.owned[id]||0)>0;
const pct=ids=>ids.length?Math.round(ids.filter(own).length/ids.length*100):0;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const freeReady=()=>now()>=S.freeAt;
const canFree=()=>S.bonus>0||freeReady();
const ownedArtists=()=>ARTISTS.filter(A=>A.ids.some(own));
const extras=()=>CARDS.reduce((s,c)=>s+Math.max(0,(S.owned[c.id]||0)-1),0);
function day(){if(S.day.d!==today())S.day={d:today(),open:0,newT:0,bid:0,recycle:0,trade:0,sell:0,cl:{}};return S.day}
function addXP(n){S.xp=(S.xp||0)+n}
const tierNow=()=>Math.min(TIERS,Math.floor((S.xp||0)/TIER_XP));
function topArtist(){const T=S.top||[];if(!T.length)return null;const d=new Date(),doy=Math.floor((Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-Date.UTC(d.getUTCFullYear(),0,0))/864e5);return RW[T[doy%T.length]]||null}
function todayMissions(){const R=rng('miss'+today());const A=topArtist(),out=[MISS[0]];
  if(A)out.push(Object.assign({},MISS.find(m=>m.k==='topA'),{t:`Drop un son de ${A.n}`,av:A.avg}));
  const rest=MISS.slice(1).filter(m=>m.k!=='topA'&&(m.k!=='evc'||liveEv()));while(out.length<5&&rest.length)out.push(rest.splice(Math.floor(R()*rest.length),1)[0]);return out}
const missReady0=()=>{const d=day();return todayMissions().some(m=>!d.cl[m.k]&&d[m.k]>=m.n)};
const seasonReady0=()=>{const t=tierNow();for(let i=1;i<=t;i++){if(!S.sfree.includes(i))return true;if(hasPass()&&!S.sprem.includes(i))return true}return false};
function toast(t){document.querySelectorAll('.toast').forEach(x=>x.remove());const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2400)}
const I=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICON={list:I('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="2.6"/>'),users:I('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.2A5 5 0 0 1 21 19"/>'),pen:I('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),plus:I('<path d="M12 5v14M5 12h14"/>'),cam:I('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),bolt:I('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),sp:I('<circle cx="12" cy="12" r="9"/><path d="M7.5 9.5c3-.9 6.3-.6 9 .9M8 12.6c2.4-.6 4.9-.4 7 .7M8.6 15.5c1.8-.4 3.6-.3 5.2.5"/>'),gift:I('<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8c-1.5-3.5-5-4-5-1.5S12 8 12 8zm0 0c1.5-3.5 5-4 5-1.5S12 8 12 8z"/>'),search:I('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>'),back:I('<path d="m15 5-7 7 7 7"/>'),x:I('<path d="M6 6l12 12M18 6 6 18"/>'),share:I('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'),cal:I('<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),theme:I('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),gem:I('<path d="M12 3 20 12 12 21 4 12z"/>'),gear:I('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),help:I('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17.2v.3"/>'),star:I('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),check:I('<path d="m5 12 5 5 9-10"/>'),grid:I('<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>'),bub:I('<circle cx="8.5" cy="9" r="4.5"/><circle cx="17" cy="15" r="3.5"/><circle cx="9.5" cy="18.5" r="2"/>'),recycle:I('<path d="M7 19H4.5a1.5 1.5 0 0 1-1.3-2.2L5 13.5M14 4.3l-1.3-2.2a1.5 1.5 0 0 0-2.6 0L8.3 5.4M17 13.5l1.8 3.3a1.5 1.5 0 0 1-1.3 2.2H11"/><path d="m11 16-2 3 2 3M3 9.5l2.9 1 1-2.9M20.2 7.5l-1 3-3-.9"/>'),play:I('<path d="M7 5v14l11-7z"/>'),pin:I('<path d="M12 17v5M8 3h8l-1 6 3 4H6l3-4z"/>'),swap:I('<path d="M7 7h12l-3-3M17 17H5l3 3"/>'),lock:I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>')};

/* ================= RENDUS D'OBJETS ================= */
function waveSVG(c){if(!c.wv){const R=rng('wv'+c.id);let d='';for(let k=0;k<24;k++){const v=.16+.84*Math.abs(Math.sin(k*.45+R()*2.2))*(.45+.55*R());const h=v*40;d+=`M${k*4.4+2} ${(24-h/2).toFixed(1)}v${h.toFixed(1)}`}c.wv=d}
  return `<svg class="wf" viewBox="0 0 106 48" preserveAspectRatio="none" aria-hidden="true"><path d="${c.wv}"/></svg>`}
function tileHTML(c,o={}){const n=S.owned[c.id]||0;const lock=o.lock!==undefined?o.lock:!n;const R=RAR[c.r];const ser=S.ser[c.id];
  return `<div class="wc${lock?' lk':''}${c.r===5?' dv':''}${c.img?' im':''}" style="--bg:${c.bg};${c.img?`--im:url(&quot;${c.img}&quot;);`:''}--wc:${WCOL[c.r]};--rc:${R.c}"><i class="rd"></i>${ser?`<em class="sn">#${String(ser).padStart(3,'0')}</em>`:n>1&&!o.nocount?`<em class="tc">×${n}</em>`:''}${TREND.has(c.id)?'<i class="up" title="En hausse">↑</i>':''}${waveSVG(c)}<div class="tx"><b>${esc(c.t)}</b><span>${esc(c.a)}</span></div></div>`}
function albumHTML(A){const ok=A.single?A.ids.every(own):S.ul[A.key];const n=A.ids.filter(own).length;
  return `<div class="alb${ok?' ok':''}${n?'':' none'}"><div class="alv" style="--lab:${A.lab}"></div><div class="alc${A.img?' im':''}" style="background:${esc(A.art)}"><span>${esc(A.t)}</span><i>${esc(A.a)}</i></div>${ok?'':`<em class="badge">${n}/${A.ids.length}</em>`}</div>`}
function plaqueHTML(A){const ok=S.ul[A.key];
  return `<div class="plq${ok?' ok':''}"><div class="pfm"><div class="pdk"><i style="background:${esc(A.avg)}"></i></div><div class="ppl"><b>${esc(A.n)}</b><span>Disque de platine</span></div></div>${ok?'':`<em class="badge">${pct(A.ids)}%</em>`}</div>`}
const rewardHTML=x=>x.type==='album'?albumHTML(x):plaqueHTML(x);
function artistRow(A,i){const p=pct(A.ids),n=A.ids.filter(own).length;return `<button class="arow" style="--i:${i%14}" data-act="artist" data-k="${A.key}" aria-label="${esc(A.n)}"><span class="av" style="--avg:${esc(A.avg)}">${esc(A.ini)}</span><span class="art"><b>${esc(A.n)}</b><small>${GEN[A.g]||A.g} · ${n}/${A.ids.length} sons</small><span class="abar"><i style="width:${p}%"></i></span></span><em>${p}%</em></button>`}
function artistCell(A){const p=pct(A.ids);return `<button class="acell" data-act="artist" data-k="${A.key}" aria-label="${esc(A.n)}"><span class="ar" style="--p:${p}"><span class="av" style="--avg:${esc(A.avg)}">${esc(A.ini)}</span></span><b>${esc(A.n)}</b><small>${p}%</small></button>`}
const tileBtn=c=>`<button class="it" data-act="see" data-id="${c.id}" aria-label="${esc(c.t)}, ${esc(c.a)}">${tileHTML(c)}</button>`;
const albBig=A=>`<button class="it alit" data-act="album" data-k="${A.key}" aria-label="${esc(A.t)}">${albumHTML(A)}<span class="alcap"><b>${esc(A.single?'Singles':A.t)}</b><small>${A.y?A.y+' · ':''}${A.ids.filter(own).length}/${A.ids.length}</small></span></button>`;
const albBtn=A=>`<button class="it" data-act="album" data-k="${A.key}" aria-label="${esc(A.t)}">${albumHTML(A)}</button>`;

/* ================= PAGER ================= */
function pager(host,items,fn,o){
  if(!host)return;const gap=o.gap??10;const w=host.clientWidth;if(w<=0)return;
  if(!items.length){host.innerHTML=`<p class="empty">${o.empty||'Rien ici'}</p>`;return}
  let cols,ch;
  if(o.cellH){cols=o.cols||Math.max(1,Math.floor((w+gap)/((o.minW||320)+gap)));ch=o.cellH}
  else{cols=o.cols||Math.max(o.minCols||3,Math.floor((w+gap)/(o.minT+gap)));ch=(w-gap*(cols-1))/cols+(o.extra||0)}
  host.innerHTML=`<div class="pgv"><div class="pgd" style="grid-template-columns:repeat(${cols},minmax(0,1fr));grid-auto-rows:${ch.toFixed(1)}px;gap:${gap}px"></div></div>`;
  const sc=host.firstChild,g=sc.firstChild,step=cols*Math.max(4,Math.ceil((host.clientHeight||600)/(ch+gap))+2);let n=0;
  const add=()=>{if(n>=items.length)return;g.insertAdjacentHTML('beforeend',items.slice(n,n+step).map(fn).join(''));n+=step};
  add();add();
  sc.addEventListener('scroll',()=>{if(sc.scrollTop+sc.clientHeight>sc.scrollHeight-(ch+gap)*4)add()},{passive:true});
}


/* atelier : créer un son qui manque avec la poussière */
let atR=-1;
function atelier(){closeMenu();menuPage='atelier';
  const miss=CARDS.filter(c=>!own(c.id)&&(atR<0||c.r===atR)).sort((a,b)=>DUST_COST[a.r]-DUST_COST[b.r]||a.a.localeCompare(b.a)).slice(0,90);
  sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass atsh" role="dialog" aria-label="Atelier"><div class="grab"></div><div class="shh"><h2>Atelier</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <div class="atd"><span class="dsi">${dustI}</span><div><b>${S.dust.toLocaleString('fr-FR')} poussière</b><small>Crée un son qui te manque. Recycle tes doubles pour en gagner.</small></div><button class="gbtn" data-act="dusthelp">?</button></div>
   <div class="chips">${[[-1,'Tous'],[0,'Commun'],[1,'Rare'],[2,'Ultra rare'],[3,'Légendaire'],[4,'Mythique'],[5,'Divin']].map(([v,n])=>`<button class="chip" data-act="atr" data-v="${v}" aria-pressed="${atR===v}">${n}</button>`).join('')}</div>
   <div class="atl">${miss.length?miss.map(c=>{const k=DUST_COST[c.r],ok=S.dust>=k;return `<button class="atc${ok?'':' no'}" data-act="atc" data-id="${c.id}">${tileHTML(c,{nocount:1,lock:false})}<span class="atp">${k} ${dustI}</span></button>`}).join(''):'<p class="cap">Tu as tous les sons de cette rareté</p>'}</div></div>`}
function craftAnim(c){closeMenu();let p='';for(let k=0;k<26;k++){const a=k/26*360,d=38+Math.random()*30;p+=`<i style="--a:${a}deg;--d:${d}vw;animation-delay:${(Math.random()*.25).toFixed(2)}s"></i>`}
  dd.innerHTML=`<div class="scrim" data-act="ddclose"></div><div class="crf" style="--rc:${RAR[c.r].c}"><button class="gbtn sq crx2" data-act="ddclose" aria-label="Fermer">${ICON.x}</button><div class="crp">${p}</div><div class="crc">${tileHTML(c,{nocount:1,lock:false})}</div><div class="crt"><span class="lbl">Son créé</span><b>${esc(c.t)}</b><small>${esc(c.a)} · ${RAR[c.r].n}</small><button class="pbtn" data-act="ddclose">Continuer</button></div></div>`;
  buzz([15,30,60])}
/* événements */
function evSheet(){closeMenu();menuPage='events';
  sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Événements"><div class="grab"></div><div class="shh"><h2>Événements</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <p class="cap" style="text-align:left">Pendant un événement, certains sons tombent plus souvent dans les drops. Touche un événement pour le détail.</p>
   <div class="evl">${EVENTS.filter(x=>evState(x)!=='past').sort((a,b)=>new Date(a.s)-new Date(b.s)).map((x,i)=>{const st=evState(x),f=x.fx;
     const det=f.artists?`Les sons de ${f.artists.join(', ')} sortent ${f.mult} fois plus souvent.`:f.genre?`Les sons ${GEN[f.genre]||f.genre} sortent ${f.mult} fois plus souvent.`:f.divin?`Les chances de tomber sur un Divin sont multipliées par ${f.divin}.`:f.cost?`Les drops coûtent ${f.cost} wax coins au lieu de ${COST}.`:'';
     return `<div class="evc2${st==='live'?' live open':''}" style="--evbg:${x.bg}"><button class="evh" data-act="evx"><i class="sw2"></i><span><b>${x.n}</b><small>${x.d}</small></span><em>${st==='live'?`<i class="ldot"></i>En cours`:fdate(x.s)}</em></button><div class="evd"><p>${det}</p><p class="cap">${st==='live'?`Se termine dans <b data-until="${x.e}">${dur(new Date(x.e)-now())}</b>`:`Du ${fdate(x.s)} au ${fdate(x.e)}`}</p></div></div>`}).join('')}</div></div>`}
/* poussière : explication */
function dustHelp(){closeMenu();menuPage='dust';sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="La poussière"><div class="grab"></div><div class="shh"><h2>La poussière</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
  <div class="dsh"><span class="dsi">${dustI}</span><b>Tu en as ${S.dust.toLocaleString('fr-FR')}</b></div>
  <ol class="howl"><li><b>Recycle tes doubles</b><span>Chaque son en trop se transforme en poussière : ${DUST_GET.slice(0,5).map((v,i)=>`${RAR[i].n} ${v}`).join(', ')}.</span></li><li><b>Fabrique le son qui te manque</b><span>Ouvre un son que tu n’as pas et touche « Fabriquer ». Prix : ${DUST_COST.slice(0,5).map((v,i)=>`${RAR[i].n} ${v}`).join(', ')}.</span></li><li><b>Complète tes albums</b><span>C’est le moyen le plus sûr de finir un album sans compter sur la chance.</span></li></ol>
  <div class="row"><button class="gbtn" data-act="recy">Recycler mes doubles</button><button class="pbtn" data-act="buyc" data-k="dust">+200 · 300 wax coins</button></div></div>`}
/* récompenses récupérées */
function rewardPop(g,n){const L=[g.coins>0&&[coinI,'+'+g.coins.toLocaleString('fr-FR'),'wax coins'],g.maxi>0&&['<i class="mini"></i>','+'+g.maxi,'drop'+(g.maxi>1?'s':'')],g.gold>0&&['<i class="mini gold"></i>','+'+g.gold,'Drop Or'],g.dust>0&&[dustI,'+'+g.dust,'poussière']].filter(Boolean);
  dd.innerHTML=popHTML(`<div class="rwp"><div class="rwrays" aria-hidden="true"></div>${L[0]?`<div class="rwhero">${L[0][0]}</div>`:''}<span class="lbl">Bien joué</span><h2>Récompense récupérée</h2><div class="rwl">${L.map(([i,v,t],k)=>`<div class="rwi" style="--k:${k}"><span class="rwic">${i}</span><b>${v}</b><small>${t}</small></div>`).join('')}</div><button class="pbtn" data-act="ddclose">Super</button></div>`);
  buzz([20,40,20])}
/* illustrations du Shop */
const ART={
 ach:`<svg class="hart ha-c" viewBox="0 0 160 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hacg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#f2c14e"/><stop offset="1" stop-color="#b9831f"/></linearGradient></defs><g transform="translate(96 62)"><path d="M-26 -34h52v18a26 26 0 0 1-52 0z" fill="url(#hacg)"/><path d="M-26 -28h-12a12 12 0 0 0 12 22M26 -28h12a12 12 0 0 1-12 22" fill="none" stroke="#f2c14e" stroke-width="5"/><rect x="-6" y="8" width="12" height="16" fill="#d9a43a"/><rect x="-20" y="24" width="40" height="9" rx="3" fill="#8a5d12"/><circle r="11" cy="-16" fill="#1a1a20"/><circle r="3" cy="-16" fill="#f2c14e"/></g><g fill="#fff" opacity=".7"><circle cx="40" cy="30" r="2"/><circle cx="140" cy="20" r="1.5"/><circle cx="130" cy="110" r="2"/><circle cx="30" cy="90" r="1.5"/></g></svg>`,
 saison:`<svg class="hart ha-s" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="has" x1="0" x2="1"><stop offset="0" stop-color="#ffc23d"/><stop offset="1" stop-color="#ff5f86"/></linearGradient></defs><path class="hsp2" d="M-10 150 C60 140 90 110 140 100 S230 60 330 30" fill="none" stroke="url(#has)" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 16"/>${[[30,146,'c'],[90,126,'m'],[150,98,'g'],[210,80,'c'],[270,52,'m']].map(([x,y,k],n)=>`<g class="hst" style="--k:${n}"><circle cx="${x}" cy="${y}" r="17" fill="${n<2?'url(#has)':'rgba(255,255,255,.14)'}" stroke="rgba(255,255,255,.5)" stroke-width="2"/>${k==='c'?`<circle cx="${x}" cy="${y}" r="7" fill="#fff3c4"/>`:k==='m'?`<rect x="${x-5}" y="${y-7}" width="10" height="14" rx="2" fill="#e9ecff"/>`:`<rect x="${x-5}" y="${y-7}" width="10" height="14" rx="2" fill="#ffd76b"/>`}</g>`).join('')}<path d="M296 18l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#ffd76b" class="hsz"/></svg>`,
 bourse:`<svg class="hart ha-b" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#30c07a" stop-opacity=".45"/><stop offset="1" stop-color="#30c07a" stop-opacity="0"/></linearGradient></defs><g class="hgr">${[30,60,90,120,150].map(y=>`<line x1="0" x2="320" y1="${y}" y2="${y}"/>`).join('')}${[40,80,120,160,200,240,280].map(x=>`<line y1="0" y2="180" x1="${x}" x2="${x}"/>`).join('')}</g>${[[24,96,120,82,128],[44,90,104,70,118],[64,98,110,86,122],[84,76,94,60,104],[104,82,100,70,112],[124,64,86,52,94],[144,72,80,58,92],[164,50,70,40,80],[184,58,66,44,76],[204,40,56,30,64],[224,46,52,32,62],[244,30,44,20,52],[264,34,40,24,50],[284,22,30,12,38]].map(([x,o,c,h,l],k)=>`<g class="${k%3===1?'cd':'cu'}" style="--k:${k}"><line x1="${x+5}" x2="${x+5}" y1="${h}" y2="${l}"/><rect x="${x}" y="${Math.min(o,c)}" width="10" height="${Math.max(3,Math.abs(c-o))}" rx="1.5"/></g>`).join('')}<path class="hl" d="M0 128 C40 120 60 112 90 100 S150 80 180 66 S250 40 320 22"/><path d="M0 128 C40 120 60 112 90 100 S150 80 180 66 S250 40 320 22 V180 H0Z" fill="url(#hab)"/><circle class="hdot" cx="320" cy="22" r="5"/></svg>`,
 amis:`<svg class="hart ha-a" viewBox="0 0 160 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="haa1" x1="0" x2="1"><stop offset="0" stop-color="#ffc23d"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient><linearGradient id="haa2" x1="0" x2="1"><stop offset="0" stop-color="#20c997"/><stop offset="1" stop-color="#1c7fd6"/></linearGradient></defs><circle cx="130" cy="30" r="46" fill="rgba(255,255,255,.12)"/><g class="hav"><circle cx="62" cy="62" r="24" fill="url(#haa1)"/><circle cx="62" cy="55" r="8" fill="rgba(255,255,255,.85)"/><path d="M48 76a14 12 0 0 1 28 0" fill="rgba(255,255,255,.85)"/></g><g class="hav h2"><circle cx="108" cy="78" r="24" fill="url(#haa2)"/><circle cx="108" cy="71" r="8" fill="rgba(255,255,255,.85)"/><path d="M94 92a14 12 0 0 1 28 0" fill="rgba(255,255,255,.85)"/></g><g class="hsw"><circle cx="86" cy="112" r="14" fill="#fff"/><path d="M79 109h12l-3-3M93 115H81l3 3" fill="none" stroke="#6d5cff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g><rect class="hcd" x="22" y="104" width="30" height="40" rx="6" fill="rgba(255,255,255,.9)"/><rect class="hcd h2" x="118" y="110" width="30" height="40" rx="6" fill="rgba(255,255,255,.75)"/></svg>`,
 pass:`<svg class="hart ha-p" viewBox="0 0 160 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6d6"/><stop offset="1" stop-color="#f2c45a"/></linearGradient></defs><g class="hrays">${Array.from({length:12},(_,k)=>`<path d="M100 56 L${100+120*Math.cos(k*Math.PI/6)} ${56+120*Math.sin(k*Math.PI/6)} L${100+120*Math.cos(k*Math.PI/6+.18)} ${56+120*Math.sin(k*Math.PI/6+.18)}Z"/>`).join('')}</g><g class="htk"><path d="M52 30h96v24a10 10 0 0 0 0 20v24H52V74a10 10 0 0 0 0-20z" fill="url(#hap)" stroke="rgba(120,80,0,.25)"/><line x1="78" x2="78" y1="34" y2="94" stroke="rgba(120,80,0,.3)" stroke-dasharray="3 4"/><path d="M113 46l4.5 9.2 10.1 1.5-7.3 7.1 1.7 10.1-9-4.8-9 4.8 1.7-10.1-7.3-7.1 10.1-1.5z" fill="#c98a12"/></g><circle class="hsp" cx="40" cy="40" r="3" fill="#fff"/><circle class="hsp s2" cx="140" cy="20" r="2.5" fill="#fff"/></svg>`,
 packs:`<svg class="hart ha-k" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><linearGradient id="hk1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ce0ff"/><stop offset="1" stop-color="#6d5cff"/></linearGradient><linearGradient id="hk2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#e0a21a"/></linearGradient><linearGradient id="hk3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdf6ff"/><stop offset="1" stop-color="#d9c8f2"/></linearGradient><radialGradient id="hkc" cx=".35" cy=".3"><stop offset="0" stop-color="#fff3c4"/><stop offset=".5" stop-color="#ffc23d"/><stop offset="1" stop-color="#c98a12"/></radialGradient></defs><g class="hpk"><rect x="18" y="22" width="44" height="60" rx="7" fill="#2a2b33" transform="rotate(-16 40 52)"/><rect x="40" y="16" width="44" height="60" rx="7" fill="url(#hk2)" transform="rotate(-6 62 46)"/><rect x="62" y="14" width="44" height="60" rx="7" fill="url(#hk3)" transform="rotate(5 84 44)"/><rect x="84" y="18" width="44" height="60" rx="7" fill="url(#hk1)" transform="rotate(15 106 48)"/><circle cx="106" cy="48" r="9" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="2" transform="rotate(15 106 48)"/></g><g class="hco">${[[112,98],[126,92],[138,100],[124,104]].map(([x,y],k)=>`<ellipse cx="${x}" cy="${y}" rx="11" ry="11" fill="url(#hkc)" stroke="#a8730d" stroke-width="1.2" style="--k:${k}"/>`).join('')}</g></svg>`
};
/* ================= VUES ================= */
function vOuvrir(){
  const e=liveEv(),nx=nextEv(),cst=cost(),free=canFree(),can=free||S.coins>=cst;const dp=curDrop();const left=Math.max(0,DROP_LIMIT-(S.drop[dp.w]||0)-((hash('ds'+dp.w)%120)+Math.floor((now()-(dp.w*48*3600e3))/(48*3600e3)*260)));
  const evp=e?`<button class="evp glass" data-act="events">${window.evAvatars?evAvatars(e,'sm'):''}<span class="evk">Événement</span><i class="ldot"></i><b>${e.n}</b><span data-until="${e.e}">${dur(new Date(e.e)-now())}</span></button>`:nx?`<button class="evp glass" data-act="events"><span class="evk">Prochain</span><b>${nx.n}</b><span>${fdate(nx.s)}</span></button>`:'';
  return `<div class="view v-open"><div class="otop">${evp}${window.LABEL&&LABEL.pill?LABEL.pill():''}</div>
   <div class="obg" aria-hidden="true"><i class="og1"></i><i class="og2"></i><i class="og3"></i><span class="ogrid"></span><span class="orays"></span>${Array.from({length:14},(_,i)=>`<b style="--x:${(i*37)%100};--y:${(i*53)%100};--d:${(i%7)*.9}s;--s:${2+(i%3)}px"></b>`).join('')}</div><div class="ofx" aria-hidden="true"><i class="n1">♪</i><i class="n2">♫</i><i class="n3">♪</i><i class="s1"></i><i class="s2"></i><i class="s3"></i></div>
   <div class="mbox" data-act="open" data-m="${free?'free':'pay'}" role="button" tabindex="0" aria-label="Ouvrir un drop"><div class="maxi"><div class="mv" style="--lc:${e?'#ff5f86':'#c9c3b5'}"></div><div class="ms glass"><b>Wax<br>Drop</b><span>Vol. 01</span><em>5 sons</em></div></div></div>
   <div class="obar"><button class="pbtn" data-act="open" data-m="${free?'free':'pay'}" ${can?'':'disabled'}>${free?(S.bonus>0?`Ouvrir · ${S.bonus} offert${S.bonus>1?'s':''}`:'Ouvrir · Gratuit'):`Ouvrir · ${cst} ${coinI}`}</button><button class="gbtn sq" data-act="openall" aria-label="Ouverture express" ${can?'':'disabled'}>${ICON.bolt}</button></div>
   <div class="odeco" aria-hidden="true">${Array.from({length:23},(_,i)=>`<i style="--d:${(i*.137%1).toFixed(2)};--h:${(.25+((i*7)%10)/14).toFixed(2)}"></i>`).join('')}</div>
   <p class="cap" id="freecap">${freeReady()?'Drop gratuit prêt':`Gratuit dans <b data-clock="${S.freeAt}">${clock(S.freeAt-now())}</b>`}</p>
   ${S.gold>0?`<button class="goldp" data-act="opengold" aria-label="Ouvrir un Drop Or">Drop Or ×${S.gold}</button>`:''}
  </div>`;
}
function colList(){return ownedArtists().filter(A=>colG==='Tous'||A.st===colG).sort((a,b)=>pct(b.ids)-pct(a.ids)||a.n.localeCompare(b.n))}
let sonsF='all',catF=false;
function sonsList(){const L=CARDS.filter(c=>{const n=S.owned[c.id]||0;return n>0&&(sonsF==='all'||(sonsF==='dup'?n>1:c.r===+sonsF))});return L.sort((a,b)=>b.r-a.r||(S.owned[b.id]||0)-(S.owned[a.id]||0)||a.t.localeCompare(b.t))}
function sonsChips(){const all=CARDS.filter(c=>own(c.id));const cnt=r=>all.filter(c=>c.r===r).length,dup=all.filter(c=>(S.owned[c.id]||0)>1).length;
  return `<div class="chips scr sonsf">${[['all','Tous',all.length],['dup','Doubles',dup],...[5,4,3,2,1,0].map(r=>[String(r),RAR[r].n,cnt(r)])].filter(x=>x[0]==='all'||x[2]).map(([k,n,v])=>`<button class="chip" data-act="sonsf" data-v="${k}" aria-pressed="${sonsF===k}"${/^\d$/.test(k)?` style="--rc:${RAR[+k].c}"`:''}>${/^\d$/.test(k)?'<i class="rdot"></i>':''}${n}<small>${v}</small></button>`).join('')}</div>`}
function vCollection(){
  const L=colList(),tot=ownedArtists().length;
  const so=colView==='sons';
  return `<div class="view v-col"><div class="vh"><div class="seg glass sm cmode">${[['bulles','Bulles'],['liste','Artistes'],['sons','Sons']].map(([k,n])=>`<button data-act="colv" data-v="${k}" aria-pressed="${colView===k}">${n}</button>`).join('')}</div></div>
    <div class="vh">${so?sonsChips():`<div class="seg glass sm">${STYLES.map(([g,n])=>`<button data-act="colg" data-v="${g}" aria-pressed="${colG===g}">${n}</button>`).join('')}</div>`}
    <button class="gbtn sq" data-act="cat" aria-label="Tout le catalogue">${ICON.search}</button></div>
    <div class="cntr"><p class="cnt2"><b>${tot}</b> artiste${tot>1?'s':''} · <b>${CARDS.filter(c=>own(c.id)).length}</b>/${N} sons</p><button class="dpill" data-act="dusthelp" aria-label="Poussière : ${S.dust}">${dustI}<b>${S.dust.toLocaleString('fr-FR')}</b></button><button class="gbtn sq sm2" data-act="recy" aria-label="Recycler les doubles">${ICON.recycle}</button><button class="crb" data-act="atelier" aria-label="Créer un son"><span>${ICON.plus}</span>Créer</button></div>
    ${so?`<div class="pgr" id="pgs"></div>`:colView==='bulles'?`<div class="bubw glass" id="bub">${L.length?'':'<p class="empty">Ouvre un drop pour commencer</p>'}</div>`:`<div class="pgr" id="pgr"></div>`}</div>`;
}
function tickHTML(){mkInit();const L=S.mk.list.filter(l=>!l.mine).slice().sort((a,b)=>Math.abs(chg(b))-Math.abs(chg(a))).slice(0,8);if(!L.length)return '';
  const one=L.map(l=>`<span class="ti${chg(l)>0?' gn':''}"><b>${esc(C[l.cid].t)}</b>${chgHTML(l)}</span>`).join('');return `<div class="tick" aria-hidden="true"><div class="tk">${one}${one}</div></div>`}
function tickPaint(){}
function wsIndex(){mkInit();const L=S.mk.list.filter(l=>!l.mine);if(!L.length)return 0;return Math.round(L.reduce((s,l)=>s+chg(l),0)/L.length*10)/10}
function bigChart(){const R=rng('ws'+Math.floor(now()/3600e3));let v=50,p=[];for(let i=0;i<=24;i++){v=clamp(v+(R()-.42)*14,8,92);p.push(`${(i/24*100).toFixed(1)},${(100-v).toFixed(1)}`)}
  return `<svg class="bch" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,100 ${p.join(' ')} 100,100"/><polyline points="${p.join(' ')}"/></svg>`}
const subHead=(t,x)=>`<div class="vh shd2"><button class="gbtn sq" data-act="shs" data-v="hub" aria-label="Retour">${ICON.back}</button><h2>${t}</h2>${x||''}</div>`;
function vShop(){
  if(shopSub==='encheres'||shopSub==='cours')shopSub='hub';
  if(shopSub==='saison')return vSaisonTab();
  if(shopSub==='hub'){const ix=window.ECO?ECO.ix:0,pend=window.SOC?SOC.pending():0,nf=window.SOC?SOC.friends().length:0,on=hasPass();
    const an=window.ACH?ACH.ready():0;
    return `<div class="view v-shop v-hub"><div class="hgrid">
     <button class="hb hb-jt" data-act="shs" data-v="jetons">${ART.packs}<span class="hbt"><b>Drops & wax coins</b><small>Drop Diamant · Mythique garanti</small></span></button>
     <div class="hrow">
      <button class="hb hb-ach" data-act="shs" data-v="succes">${ART.ach}${an?`<i class="hbn">${an}</i>`:''}<span class="hbt"><b>Succès</b><small>${an?`${an} à récupérer`:'Des wax coins à gagner'}</small></span></button>
      <button class="hb hb-ps" data-act="passinfo">${ART.pass}<span class="hbt"><b>WaxDrop Pro</b><small>${on?'Actif':'4,99 € / mois'}</small></span></button>
     </div>
     <div class="hrow">
      <button class="hb hb-sz" data-act="shs" data-v="saison">${ART.saison}${missReady()?'<i class="hbn">!</i>':''}<span class="hbt"><b>Missions</b><small>Du jour · ${todayMissions().filter(m=>day().cl[m.k]).length}/${todayMissions().length}</small></span></button>
      <button class="hb hb-tr" data-act="shs" data-v="echanges">${ART.amis}${pend?`<i class="hbn">${pend}</i>`:''}<span class="hbt"><b>Amis & échanges</b><small>${pend?`${pend} nouveauté${pend>1?'s':''}`:nf?`${nf} ami${nf>1?'s':''}`:'Invite tes potes'}</small></span></button>
     </div>
    </div></div>`}
  if(shopSub==='succes')return window.ACH?ACH.view():'';
  let head='',body='';
  if(shopSub==='encheres'){mkTick();const mine=S.mk.list.filter(l=>l.mine).length;const dups=CARDS.filter(c=>(S.owned[c.id]||0)>1).length;const ix=wsIndex();
    head=subHead('Enchères');
    body=`${tickHTML()}<div class="chips">${[['live','Marché'],['mine',`Mes ventes ${mine}/${mkMax()}`],['sell',`Vendre · ${dups}`]].map(([k,n])=>`<button class="chip" data-act="mks" data-v="${k}" aria-pressed="${mkSub===k}">${n}</button>`).join('')}</div><div class="pgr" id="pgr"></div>`}
  else if(shopSub==='echanges'){head=subHead('Amis');body=window.SOC?SOC.body():'<p class="cap">Connexion requise</p>'}
  else if(shopSub==='pass'){const on=hasPass();head=subHead('WaxDrop Pro');
    const perks=[['chart','Bourse en détail','Historique 7 et 30 jours, variations, volatilité de chaque son'],['clock','Drop gratuit toutes les 5 min','Deux fois plus souvent'],['gift','1 drop offert chaque jour','À récupérer ici, tous les jours'],['gold','1 Drop Or chaque lundi','Légendaire garanti à chaque fois'],['theme','Thèmes Minuit et Nacre','Pour personnaliser ton app'],['chart','Bourse sans limite','Achats et ventes illimités, Divins compris'],['gift','Défis d’événement ×2','Chaque son de l’événement compte double'],['gold','Label boosté','+50 % de points pour ton label, création offerte'],['chart','Stats détaillées','Chance, meilleur tirage, valeur, styles, pour toi et tes amis']];
    const PI={chart:'<path d="M4 19h16"/><path d="M5 15l4-5 3.5 3L19 6"/><path d="M15 6h4v4"/>',clock:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 3h6"/>',gift:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8c-2-4-6-4-6-1.5S9 8 12 8c3 0 6-.5 6-1.5S14 4 12 8"/>',gold:'<circle cx="12" cy="12" r="8"/><path d="M12 7l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z"/>',theme:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>'};
    body=`<div class="psp"><div class="psh"><div class="psart">${ART.pass}</div><div class="psht"><span class="psk">Pour les vrais collectionneurs</span><b>WaxDrop Pro.<br>Les données, et plus de drops.</b>${on?`<span class="pson">${ICON.check}Actif jusqu’au ${new Date(S.passUntil).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}</span>`:`<span class="psprice"><b>4,99 €</b> / mois</span>`}</div></div>
     <div class="psbar">${on?`${!day().pd?'<button class="pbtn" data-act="claim">Drop du jour</button>':'<button class="pbtn" disabled>Drop du jour récupéré</button>'}<button class="gbtn" data-act="passmanage">Gérer</button>`:`<button class="pbtn pscta" data-act="buy" data-k="pass">S’abonner · 4,99 € / mois</button>`}</div>
     <div class="psl">${perks.map(([k,t,d],n)=>`<div class="psi" style="--i:${n}"><span class="psic psic-${k==='chart'?'star':k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${PI[k]}</svg></span><span><b>${t}</b><small>${d}</small></span></div>`).join('')}</div>
     <div class="pscmp"><div class="pch"><span></span><b>Gratuit</b><b class="pp">Pro</b></div>${[['Historique Bourse','24 h','30 jours'],['Stats détaillées','–','Oui'],['Drop gratuit','10 min','5 min'],['Drop offert / jour','–','1'],['Drop Or / semaine','–','1'],['Thèmes exclusifs','–','2']].map(([a,b,c])=>`<div class="pcr"><span>${a}</span><em>${b}</em><em class="pp">${c}</em></div>`).join('')}</div>
     <p class="cap">Paiement sécurisé par Stripe. Sans engagement, résiliable à tout moment.</p></div>`}
  else{head=subHead('Drops & wax coins');body=`<div class="chips">${[['packs','Drops'],['jetons','Wax coins']].map(([k,n])=>`<button class="chip" data-act="jts" data-v="${k}" aria-pressed="${jetSub===k}">${n}</button>`).join('')}</div><div class="pgr" id="pgr"></div>${jetSub==='jetons'?'<p class="cap">Paiement sécurisé par Stripe · wax coins ajoutés en quelques secondes</p>':''}`}
  return `<div class="view v-shop">${head}${body}</div>`;
}
function avHTML(cls){const ph=window.CL&&CL.avatar;const nm=(window.CL&&CL.pseudo)||'Moi';return `<span class="av me ${cls||''}" style="${ph?`--avg:url('${esc(ph)}') center/cover no-repeat,#333`:''}">${ph?'':esc(nm.slice(0,2).toUpperCase())}</span>`}
function vProfil(){
  const t=tierNow();const nm=(window.CL&&CL.pseudo)||'Ton profil';const nf=window.SOC?SOC.friends().length:0,pend=window.SOC?SOC.pending():0;const x=(S.xp||0)%TIER_XP;
  return `<div class="view v-prof vs"><div class="phero"><button class="avb" data-act="pedit" aria-label="Modifier le profil">${avHTML('tbig')}<i class="ped">${ICON.pen}</i></button><div class="pn"><b>${esc(nm)}</b><span>Niveau ${t} · ${score().toLocaleString('fr-FR')} pts</span><span class="plv" style="--p:${t>=TIERS?100:x}%"><i></i></span></div><button class="gbtn sq ghost" data-act="menu" aria-label="Réglages">${ICON.gear}</button></div>
   ${window.ECO?ECO.topHTML():''}
   <div class="stys"><span class="styk">Tes styles <small>×2,5 de chances</small></span><div class="styl">${STYLES.slice(1).map(([g,n])=>`<button class="chip" data-act="sty" data-v="${g}" aria-pressed="${(S.styles||[]).includes(g)}">${n}</button>`).join('')}</div></div>
   <div class="pq"><button class="pqa pq-fr" data-act="gofriends"><span class="pqi">${ICON.users}</span><b>Amis</b><small>${nf?nf+' ami'+(nf>1?'s':''):'Aucun'}${pend?' · '+pend+' nouveau'+(pend>1?'x':''):''}</small></button><button class="pqa pq-inv" data-act="invite"><span class="pqi">${ICON.share}</span><b>Inviter</b><small>Partage ton lien</small></button><button class="pqa pq-top" data-act="prs" data-v="${profSub==='top'?'vitrine':'top'}" aria-pressed="${profSub==='top'}"><span class="pqi">${profSub==='top'?ICON.grid:ICON.star}</span><b>${profSub==='top'?'Vitrines':'Classement'}</b><small>${profSub==='top'?'Retour':'Top joueurs'}</small></button></div>
   <button class="statb glass" data-act="mystats"><span class="pqi">${ICON.gem}</span><span><b>Mes stats</b><small>Drops ouverts, chance, meilleur tirage…</small></span><i>›</i></button>${window.LABEL&&LABEL.sub&&LABEL.sub()?`
   <button class="statb glass lblb" data-act="label"><span class="pqi" style="background:#7c5cff;color:#fff">${ICON.users}</span><span><b>Mon label</b><small>${esc(LABEL.sub())}</small></span><i>›</i></button>`:''}
   ${profSub==='top'?`<div class="plist">${board().map(boardRow).join('')}</div>`:vVitrine()}</div>`;
}
function vitInit(){if(!Array.isArray(S.vits)||!S.vits.length)S.vits=[{n:'Ma vitrine',ids:(S.fav||[]).slice(0,6)}];S.vits.forEach(v=>{v.ids=(v.ids||[]).filter(id=>C[id]&&own(id)).slice(0,6)});S.vi=Math.min(S.vi|0,S.vits.length-1);S.fav=S.vits[S.vi].ids}
function vVitrine(){vitInit();const pl=ARTISTS.filter(A=>S.ul[A.key]);const al=ALBUMS.filter(A=>S.ul[A.key]).length;const V=S.vits[S.vi];
  return `<div class="kpis3"><div class="k1"><b>${CARDS.filter(c=>own(c.id)).length}</b><span>sons</span></div><div class="k2"><b>${al}</b><span>albums</span></div><div class="k3"><b>${pl.length}</b><span>platines</span></div><div class="k4"><b>${POOL[5].filter(c=>own(c.id)).length}</b><span>divins</span></div></div>
   <div class="vtabs">${S.vits.map((v,k)=>`<button class="chip" data-act="vsel" data-i="${k}" aria-pressed="${k===S.vi}">${esc(v.n)}</button>`).join('')}${S.vits.length<3?`<button class="chip add" data-act="vnew" aria-label="Nouvelle vitrine">+</button>`:''}<button class="chip" data-act="vedit" aria-label="Renommer la vitrine">${ICON.pen}</button></div>
   <div class="vitg">${(()=>{const F=S.fav.map(id=>C[id]);while(F.length<6)F.push(null);return F.map(c=>c?tileBtn(c):'<button class="fslot" data-act="vpick">'+ICON.plus+'<span>Ajouter</span></button>').join('')})()}</div>
   ${pl.length?`<div class="wall">${pl.map(A=>`<button data-act="seepl" data-k="${A.key}">${plaqueHTML(A)}</button>`).join('')}</div>`:''}`}
const MI={rare:'<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',leg:'<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18"/>',evc:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',craft:'<path d="M12 3v6M9 6h6"/><circle cx="12" cy="15" r="6"/>',buy:'<path d="M4 17l5-5 4 4 7-8"/><path d="M15 8h5v5"/>',open:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',newT:'<path d="M12 3l2.2 5.6L20 9.3l-4.4 3.9L17 19l-5-3-5 3 1.4-5.8L4 9.3l5.8-.7z"/>',bid:'<path d="M4 17l5-5 4 4 7-8"/><path d="M15 8h5v5"/>',recycle:'<path d="M7 19H4l3-5M17 19h3l-3-5M12 4l-2 3h4z"/><path d="M9 14l3-5 3 5"/>',sell:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',trade:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>'};
function vMissions(){const d=day();const L=todayMissions();const tm=new Date();tm.setHours(24,0,0,0);const done=L.filter(m=>d.cl[m.k]).length;
  return `<div class="mhead"><div><b>Missions du jour</b><small>Nouvelles dans <span data-clock="${+tm}">${clock(+tm-now())}</span></small></div><div class="mbonus${done>=L.length?' ok':''}">${done>=L.length&&!d.cl.all?`<button class="pbtn" data-act="mall" style="height:38px">Bonus · 1 drop + 100</button>`:`<span>${d.cl.all?ICON.check+'Bonus récupéré':`${done}/${L.length} · bonus 1 drop`}</span>`}</div></div>
   <div class="mlist3">${L.map((m,ix)=>{const v=Math.min(d[m.k]||0,m.n),ok=v>=m.n,cl=d.cl[m.k];return `<div class="mcard${ok?' ok':''}${cl?' cl':''}" style="--p:${v/m.n*100};--i:${ix}"><span class="mring${m.av?' mav':''}"${m.av?` style="--mav:${esc(m.av)}"`:''}>${m.av?'':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${MI[m.k]||MI.open||''}</svg>`}</span><div class="mtx"><b>${m.t}</b><small>${v}/${m.n}</small><span class="mrw"><em>+${m.c} ${coinI}</em><em>+${m.x} XP</em></span></div><button class="mbtn" data-act="mclaim" data-k="${m.k}" ${ok&&!cl?'':'disabled'}>${cl?ICON.check:ok?'Prendre':`${Math.round(v/m.n*100)} %`}</button></div>`}).join('')}</div>`}
const rwIcon=r=>r.gold?'<i class="mini gold"></i>':r.maxi?'<i class="mini"></i>':r.coins?coinI:dustI;
const rwShort=r=>r.gold?'Drop Or':r.maxi?`×${r.maxi}`:r.coins?r.coins:r.dust;
function trackHTML(){const t=tierNow(),hp=hasPass();let h='';for(let i=1;i<=TIERS;i++){const {f,p}=seasonRewards(i);const un=i<=t,fc=S.sfree.includes(i),pc=S.sprem.includes(i);
    h+=`<div class="tcol${un?' un':''}${i===t+1?' nx':''}${i%10===0?' tbig':''}"><span class="tnum">${i}</span><button class="tcell${un&&!fc?' ready':''}" data-act="sclaim" data-i="${i}" data-t="f" ${un&&!fc?'':'disabled'} aria-label="Palier ${i}">${rwIcon(f)}<b>${rwShort(f)}</b>${fc?'<u>'+ICON.check+'</u>':''}</button><button class="tcell pr" data-act="sclaim" data-i="${i}" data-t="p" ${un&&!pc&&hp?'':'disabled'} aria-label="Palier ${i} premium">${rwIcon(p)}<b>${rwShort(p)}</b>${pc?'<u>'+ICON.check+'</u>':hp?'':'<u>'+ICON.lock+'</u>'}</button></div>`}
  return h}
function vSaisonTab(){return `<div class="view v-sea vs">${subHead('Missions')}${vMissions()}<p class="cap">Chaque mission donne des wax coins et de l’XP. Fais les 5 pour gagner un drop bonus et 100 wax coins.</p></div>`}
function vSaison(){return ''}
const missReady=()=>missReady0()||(todayMissions().every(m=>day().cl[m.k])&&!day().cl.all);
const seasonReady=()=>false;
function seasonRewards(i){return{f:i%10===0?{gold:1}:i%3===0?{maxi:1}:i%3===1?{coins:60}:{dust:40},p:i%5===0?{gold:1}:i%2===0?{maxi:2}:{coins:150}}}
const rwLabel=r=>r.gold?`Drop Or`:r.maxi?`${r.maxi} drop${r.maxi>1?'s':''}`:r.coins?`${r.coins} ${coinI}`:`${r.dust} ${dustI}`;
function seasonRow(i){const t=tierNow(),{f,p}=seasonRewards(i);const un=i<=t;const fc=S.sfree.includes(i),pc=S.sprem.includes(i);
  return `<div class="srow2${un?' un':''}"><span class="tn">${i}</span><button class="rwb" data-act="sclaim" data-i="${i}" data-t="f" ${un&&!fc?'':'disabled'}>${fc?ICON.check:''}${rwLabel(f)}</button><button class="rwb pr" data-act="sclaim" data-i="${i}" data-t="p" ${un&&!pc&&hasPass()?'':'disabled'}>${pc?ICON.check:hasPass()?'':ICON.lock}${rwLabel(p)}</button></div>`}
function score(){return CARDS.filter(c=>own(c.id)).length*10+ALBUMS.filter(A=>S.ul[A.key]).length*100+ARTISTS.filter(A=>S.ul[A.key]).length*500}
function board(){if(window.CL&&CL.top)return CL.board();const days=Math.max(1,(now()-new Date(SEASON_START))/864e5);const me=score();
  const L=[];L.push({n:'Toi',s:me,me:true});L.sort((a,b)=>b.s-a.s);return L.map((x,i)=>({...x,r:i+1}))}
const boardRow=x=>`<button class="brow${x.me?' me':''}${x.r<=3?' r'+x.r:''}" data-act="${x.me?'mystats':'frstats'}" data-p="${esc(x.n)}"><span class="rk">${x.r}</span><span class="av" style="--avg:${x.av?`url('${esc(x.av)}') center/cover no-repeat,#333`:`linear-gradient(140deg,hsl(${hash(x.n)%360} 46% 60%),hsl(${(hash(x.n)+40)%360} 44% 34%))`}">${x.av?'':esc(x.n.slice(0,2).toUpperCase())}</span><b>${esc(x.n)}</b><em>${x.s.toLocaleString('fr-FR')}</em><i class="bchev">›</i></button>`;

/* ===== bulles ===== */
const BB={nodes:[],raf:0,drag:null,calm:0,w:0,h:0};
function initBub(){
  const el=$('bub');if(!el)return;const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;BB.w=w;BB.h=h;
  let list=colList();if(!list.length)return;
  const cap=Math.max(12,Math.min(32,Math.floor(w*h/4200)));let more=0;
  if(list.length>cap){more=list.length-(cap-1);list=list.slice(0,cap-1)}
  const r0=list.map(A=>16+34*pct(A.ids)/100+3*Math.sqrt(A.ids.filter(own).length));const TOPS=S.top||[];const area=r0.reduce((a,r)=>a+Math.PI*r*r,0)||1;
  const k=Math.min(1.7,Math.sqrt(.45*w*h/area));
  BB.nodes=list.map((A,i)=>{const r=clamp(r0[i]*k,22,86);const p=pct(A.ids);const b=document.createElement('button');
    b.className='bb'+(S.ul[A.key]?' done':'')+(TOPS.indexOf(A.key)>=0?' tops':'');b.setAttribute('aria-label',`${A.n}, ${p} %`);
    b.style.cssText=`width:${2*r}px;height:${2*r}px;--avg:${A.avg};--p:${p}`;
    b.innerHTML=`<span><b style="font-size:${Math.max(12,r*.4).toFixed(0)}px">${esc(A.ini)}</b>${r>=34?`<em>${p}%</em>`:''}</span>`;
    el.appendChild(b);const a=i*2.4,d=Math.sqrt(i)*17;
    const nd={el:b,A,r,x:clamp(w/2+Math.cos(a)*d,r,w-r),y:clamp(h/2+Math.sin(a)*d,r,h-r),vx:0,vy:0};b.style.transform=`translate3d(${nd.x-r}px,${nd.y-r}px,0)`;return nd});
  if(more){const r=Math.max(30,Math.min(46,w/9));const b=document.createElement('button');b.className='bb bbmore';b.setAttribute('aria-label',`${more} autres artistes, voir la liste`);
    b.style.cssText=`width:${2*r}px;height:${2*r}px`;b.innerHTML=`<span><b>+${more}</b><em>en liste</em></span>`;el.appendChild(b);
    const nd={el:b,A:null,r,x:w/2,y:h-r-4,vx:0,vy:0};b.style.transform=`translate3d(${nd.x-r}px,${nd.y-r}px,0)`;BB.nodes.push(nd)}
  BB.calm=0;bKick();
}
function bStep(){
  const n=BB.nodes,w=BB.w,h=BB.h,cx=w/2,cy=h/2,dg=BB.drag&&BB.drag.n;let e=0;
  for(const a of n){if(a===dg)continue;a.vx+=(cx-a.x)*.0016;a.vy+=(cy-a.y)*.0022}
  for(let i=0;i<n.length;i++){const a=n[i];for(let j=i+1;j<n.length;j++){const b=n[j];const dx=b.x-a.x,dy=b.y-a.y,m=a.r+b.r+3;if(Math.abs(dx)>m||Math.abs(dy)>m)continue;const d2=dx*dx+dy*dy;if(d2>=m*m)continue;const d=Math.sqrt(d2)||.01,o=(m-d)/2,nx=dx/d,ny=dy/d;
    if(a!==dg){const f=b===dg?2:1;a.x-=nx*o*f;a.y-=ny*o*f;a.vx-=nx*o*.12;a.vy-=ny*o*.12}
    if(b!==dg){const f=a===dg?2:1;b.x+=nx*o*f;b.y+=ny*o*f;b.vx+=nx*o*.12;b.vy+=ny*o*.12}}}
  for(const a of n){if(a!==dg){a.vx*=.86;a.vy*=.86;a.x+=a.vx;a.y+=a.vy}a.x=clamp(a.x,a.r,w-a.r);a.y=clamp(a.y,a.r,h-a.r);e+=a.vx*a.vx+a.vy*a.vy;a.el.style.transform=`translate3d(${(a.x-a.r).toFixed(1)}px,${(a.y-a.r).toFixed(1)}px,0)`}
  BB.calm=e<.05&&!BB.drag?BB.calm+1:0;BB.raf=BB.calm>40||!$('bub')?0:requestAnimationFrame(bStep);
}
function bKick(){BB.calm=0;if(!BB.raf)BB.raf=requestAnimationFrame(bStep)}
function stopBub(){if(BB.raf)cancelAnimationFrame(BB.raf);BB.raf=0;BB.nodes=[];BB.drag=null}

/* ================= RENDU ================= */
const main=$('main'),ov=$('ov'),dt=$('dt'),sh=$('sh'),dd=$('dd');
function applySkin(){const sk=SKINS.find(s=>s[0]===S.set.skin);if(sk&&sk[2]&&!hasPass())S.set.skin='auto';if(S.set.skin==='auto')delete document.body.dataset.skin;else document.body.dataset.skin=S.set.skin;document.body.classList.toggle('lite',!!S.set.lite)}
let coinShown=null,coinRaf=0;function setCoins(){const el=$('coins');if(!el)return;const to=S.coins;if(coinShown===null||S.set.lite||Math.abs(to-coinShown)>100000){coinShown=to;el.innerHTML=`${coinI}${to.toLocaleString('fr-FR')}`;return}if(to===coinShown)return;const from=coinShown,t0=performance.now();coinShown=to;if(to>from){const r=el.getBoundingClientRect(),f=document.createElement('div');f.className='cfly';f.innerHTML=`+${(to-from).toLocaleString('fr-FR')} ${coinI}`;f.style.top=(r.bottom+4)+'px';f.style.right=(innerWidth-r.right)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1500)}el.classList.toggle('up',to>from);el.classList.toggle('dn',to<from);cancelAnimationFrame(coinRaf);const step=t=>{const k=Math.min(1,(t-t0)/450),v=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));el.innerHTML=`${coinI}${v.toLocaleString('fr-FR')}`;if(k<1)coinRaf=requestAnimationFrame(step);else el.classList.remove('up','dn')};coinRaf=requestAnimationFrame(step)}
function render(){
  stopBub();applySkin();setCoins();
  const od=$('odot');if(od)od.hidden=!canFree();const sd=$('shdot');if(sd)sd.hidden=!(missReady()||window.ACH&&ACH.ready()>0||window.SOC&&SOC.pending()>0);
  document.querySelectorAll('#tabs button[data-tab]').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false'));
  if(tab==='saison'){tab='shop';shopSub='saison'}
  const ov=main.firstElementChild,ok0=ov&&ov.className,st0=ov&&ov.classList.contains('vs')?ov.scrollTop:0,pg0=main.querySelector('.pgv'),ps0=pg0?pg0.scrollTop:0;
  main.innerHTML=tab==='ouvrir'?vOuvrir():tab==='collection'?vCollection():tab==='shop'?vShop():tab==='bourse'?(window.vBourse?vBourse():''):vProfil();
  const nv=main.firstElementChild;if(nv&&ok0===nv.className){nv._same=1;if(st0)nv.scrollTop=st0}
  layout();
  if(nv&&nv._same&&ps0){const pg=main.querySelector('.pgv');if(pg)pg.scrollTop=ps0}
}
function layout(){
  const h=$('pgr');
  if(tab==='collection'){if($('bub'))initBub();if(h)pager(h,colList(),artistRow,{cellH:66,minW:320,gap:8,empty:'Ouvre un drop pour commencer'});const hs=$('pgs');if(hs)pager(hs,sonsList(),tileBtn,{minT:100,empty:sonsF==='dup'?'Aucun double':'Aucun son'})}
  if(tab==='shop'&&h){if(shopSub==='encheres')mkLayout();else if(shopSub==='echanges'){if(window.SOC)SOC.layout(h)}else if(shopSub==='jetons')pager(h,shopItems(),x=>x,{cellH:jetSub==='packs'?190:188,cols:2,gap:10})}
  
  if(tab==='shop'&&shopSub==='saison'&&seaSub!=='missions'){const tk=$('trk'),v=tk&&tk.closest('.view');const t=tierNow();if(v&&!v._same&&t>2&&t<TIERS){const c=tk.children[t-2];if(c)v.scrollTop=Math.max(0,c.offsetTop-v.clientHeight*.35)}}
  if(stack.length)renderStack(true);
}
const TABS=['collection','shop','ouvrir','bourse','profil'];
function setTab(t){const d=TABS.indexOf(t)-TABS.indexOf(tab);main.style.setProperty('--dx',(d>0?28:d<0?-28:0)+'px');clearTimeout(setTab.t);setTab.t=setTimeout(()=>main.style.setProperty('--dx','0px'),400);tab=t;try{localStorage.setItem(KEY+'-t8',t)}catch(_){}render()}
function shopItems(){
  if(jetSub==='jetons')return SHOP.map((p,i)=>`<button class="pk glass cpk cpk${i}" data-act="buy" data-k="${p.k}">${i===1?'<span class="rib">Populaire</span>':i===3?'<span class="rib best">Meilleure offre</span>':''}${p.tag?`<em>${p.tag}</em>`:''}<span class="cstack" aria-hidden="true">${Array.from({length:i+2},(_,k)=>`<i style="--k:${k}"></i>`).join('')}<s></s><s></s><s></s></span><b>${p.n.toLocaleString('fr-FR')}</b><small class="cpb">${p.tag?`dont ${Math.round(p.n-p.n/(1+parseInt(p.tag.replace(/\D/g,''))/100)).toLocaleString('fr-FR')} offerts`:'Pour bien démarrer'}</small><span class="price">${p.p}</span></button>`);
  const pk=(k,cls,name,r,odds,price,act)=>`<button class="pk pkx pk-${cls}" style="--rc:${RAR[r].c}" data-act="${act||'buyc'}" data-k="${k}"><span class="pkglow"></span><span class="mini ${cls}"></span><span class="pkg"><i style="background:${RAR[r].c}"></i>${RAR[r].n} garanti</span><b>${name}</b><small class="pko">${odds}</small><span class="price">${price}</span></button>`;
  return [pk('diamant','diam','Drop Diamant',4,'Divin ×2',`${PK.diamant.p.toLocaleString('fr-FR')} ${coinI}`),
    pk('gold','gold','Drop Or',3,'Mythique et Divin ×2',`${GOLD_COST} ${coinI}`),
    pk('nacre','nacre','Drop Ultra',2,'5 sons dont 1 Ultra rare',`${PK.nacre.p} ${coinI}`),
    `<button class="pk pkx pk-lot" data-act="buyc" data-k="lot5"><span class="pkglow"></span><span class="lotst"><i class="mini"></i><i class="mini"></i><i class="mini"></i></span><span class="pkg pkd">−10 %</span><b>5 drops</b><small class="pko">À ouvrir quand tu veux</small><span class="price">450 ${coinI}</span></button>`,
    `<button class="pk pkx pk-dust" data-act="dusthelp"><span class="pkglow"></span><span class="stack">${dustI}${dustI}${dustI}</span><span class="pkg pkd">C’est quoi ?</span><b>200 poussière</b><small class="pko">Fabrique les sons qui te manquent</small><span class="price" data-act="buyc" data-k="dust">300 ${coinI}</span></button>`]}

/* ================= PILE : catalogue → artiste → album ================= */
function pushPage(p){stack.push(p);renderStack()}
function popPage(){stack.pop();renderStack()}
function closeStack(){stack=[];dt.innerHTML=''}
function catResults(){const q=catQ.trim()?slug(catQ):'';const okG=x=>catG==='Tous'||x.st===catG;
  if(catScope==='artistes')return ARTISTS.filter(A=>okG(A)&&(!q||A.q.includes(q))&&(catOwn==='all'||(catOwn==='own')===A.ids.some(own))).sort((a,b)=>a.n.localeCompare(b.n));
  if(catScope==='albums')return ALBUMS.filter(A=>okG(A)&&(!q||A.q.includes(q))&&(catOwn==='all'||(catOwn==='own')===!!S.ul[A.key])).sort((a,b)=>a.a.localeCompare(b.a)||(a.y||0)-(b.y||0));
  return CARDS.filter(c=>okG(c)&&(!q||c.q.includes(q))&&(catOwn==='all'||(catOwn==='own')===own(c.id))).slice().sort((a,b)=>b.r-a.r||a.t.localeCompare(b.t));
}
function catPager(){const h=$('spgr');if(!h)return;const L=catResults();const c=$('catn');if(c)c.textContent=L.length;
  const sg=$('catsug');if(sg){const q=catQ.trim(),has=q&&ARTISTS.some(A=>A.q===slug(q));sg.innerHTML=q.length>=2&&!has?`<div class="sugb glass"><span>« ${esc(q)} » n’est pas dans le jeu ?</span><button class="pbtn sm" data-act="askart">Proposer l’ajout</button></div>`:''}
  if(catScope==='artistes')pager(h,L,artistCell,{minT:88,extra:30,empty:'Aucun résultat'});
  else if(catScope==='albums')pager(h,L,albBig,{minT:160,minCols:2,extra:46,empty:'Aucun résultat'});
  else pager(h,L,tileBtn,{minT:92,empty:'Aucun résultat'})}
function renderStack(keep){
  const p=stack[stack.length-1];if(!p){dt.innerHTML='';return}
  const back=`<button class="gbtn sq" data-act="pop" aria-label="Retour">${stack.length>1?ICON.back:ICON.x}</button>`;
  let h='';
  if(p.type==='cat'){
    h=`<div class="ph">${back}<div class="pn"><b>Catalogue</b><span><span id="catn">0</span> résultats</span></div></div>
     <input class="search glass" id="cq" type="search" placeholder="Artiste, album ou son" value="${esc(catQ)}" autocomplete="off" aria-label="Rechercher">
     <div class="vh catvh"><div class="seg glass">${[['artistes','Artistes'],['albums','Albums'],['titres','Sons']].map(([k,n])=>`<button data-act="cats" data-v="${k}" aria-pressed="${catScope===k}">${n}</button>`).join('')}</div>
      <button class="gbtn catfb${catF?' on':''}" data-act="catf" aria-expanded="${!!catF}">Filtres${(catG!=='Tous')+(catOwn!=='all')?`<u>${(catG!=='Tous')+(catOwn!=='all')}</u>`:''}</button></div>
     ${catF?`<div class="catfp glass"><span class="lbl">Style</span><div class="chips wrap">${STYLES.map(([g,n])=>`<button class="chip" data-act="catg" data-v="${g}" aria-pressed="${catG===g}">${n}</button>`).join('')}</div>
      <span class="lbl">Collection</span><div class="chips">${[['all','Tout'],['own','À moi'],['miss','Il me manque']].map(([k,n])=>`<button class="chip" data-act="cato" data-v="${k}" aria-pressed="${catOwn===k}">${n}</button>`).join('')}</div></div>`:''}
     <div id="catsug"></div><div class="pgr" id="spgr"></div>`;
  }else if(p.type==='artist'){const A=RW[p.k];const n=A.ids.filter(own).length,pc=pct(A.ids);
    p.items=[...A.albums.map(k=>RW[k]),...(A.sgk?[RW[A.sgk]]:[])];
    h=`<div class="ph">${back}<span class="av" style="--avg:${esc(A.avg)}">${esc(A.ini)}</span><div class="pn"><b>${esc(A.n)}</b><span>${esc(A.st)}${A.u?' · underground':''} · ${n}/${A.ids.length}</span></div><button class="ring" data-act="seepl" data-k="${A.key}" style="--p:${pc}" aria-label="Disque de platine"><span>${pc}%</span></button></div>
     <div class="pgr" id="spgr"></div>`;
  }else if(p.type==='album'){const B=RW[p.k];const n=B.ids.filter(own).length;
    h=`<div class="ph">${back}<button class="alth" data-act="seeal" data-k="${B.key}" style="background:${esc(B.art)}" aria-label="Pochette"></button><div class="pn"><b>${esc(B.t)}</b><span>${esc(B.a)}${B.y?' · '+B.y:''} · ${n}/${B.ids.length}${B.p?' · sélection':''}</span></div><span class="ring" style="--p:${pct(B.ids)}"><span>${pct(B.ids)}%</span></span></div>
     <div class="pgr" id="spgr"></div>`;
  }
  if(!keep||!dt.querySelector('.page'))dt.innerHTML=`<div class="scrim" data-act="closestack"></div><div class="page glass">${h}</div>`;
  else dt.querySelector('.page').innerHTML=h;
  if(p.type==='cat')catPager();
  else if(p.type==='artist'){const n=p.items.length;pager($('spgr'),p.items,albBig,{minT:160,minCols:2,cols:n<=2?n:undefined,extra:n===1?54:46,empty:'Aucun album'})}
  else if(p.type==='album')pager($('spgr'),RW[p.k].ids.map(id=>C[id]),tileBtn,{minT:92});
}

/* ================= TIRAGE ================= */
function drawCard(minR=0,bo){
  const e=liveEv();const w=RAR.map((R,i)=>R.drop*((bo&&bo[i])||1));if(e&&e.fx.divin)w[5]*=e.fx.divin;
  let roll=Math.random()*w.slice(minR).reduce((a,b)=>a+b,0),r=minR;
  for(let i=minR;i<RAR.length;i++){roll-=w[i];if(roll<=0){r=i;break}}
  const pool=POOL[r];const top=S.spot?S.spot.top:[];
  const ww=pool.map(c=>{let m=GW[c.g]||1;if(e){const f=e.fx;if(f.artists&&f.artists.includes(c.a))m*=f.mult;if(f.genre&&f.genre===c.g)m*=f.mult}if(top.includes(c.ak))m*=2;return m});
  let t=Math.random()*ww.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){t-=ww[i];if(t<=0)return pool[i]}return pool[pool.length-1];
}
function checkUnlocks(){const out=[];
  ALBUMS.forEach(A=>{if(!S.ul[A.key]&&A.ids.every(own)){S.ul[A.key]=1;S.coins+=ALB_BONUS;addXP(100);out.push(A)}});
  ARTISTS.forEach(A=>{if(!S.ul[A.key]&&A.ids.every(own)){S.ul[A.key]=1;S.coins+=ART_BONUS;addXP(300);out.push(A)}});return out}
function pay(m){if(m==='gold'){if(S.gold>0){S.gold--;return true}return false}if(m==='drop'){if(S.coins<DROP_COST)return false;S.coins-=DROP_COST;return true}if(m==='nacre'||m==='diamant'){if(S.coins<PK[m].p)return false;S.coins-=PK[m].p;return true}
  if(m==='free'){if(S.bonus>0){S.bonus--;return true}if(freeReady()){S.freeAt=now()+freeMs();return true}return false}if(S.coins<cost())return false;S.coins-=cost();return true}
const SPP=[0,.08,.22,.45,.6,.8];
function pull(kind){
  S.packs++;const base=new Set(Object.keys(S.owned).filter(k=>S.owned[k]>0));let cards;
  if(kind==='drop'){const dp=curDrop();const ids=dp.A.ids.slice();cards=[];for(let k=0;k<3&&ids.length;k++)cards.push(C[ids.splice(Math.floor(Math.random()*ids.length),1)[0]]);cards.sort((a,b)=>a.r-b.r);
    S.drop[dp.w]=(S.drop[dp.w]||0)+1;if(window.SRV)cards=SRV.cards.map(id=>C[id]).sort((a,b)=>a.r-b.r);const last=cards[cards.length-1];S.ser[last.id]=Math.min(DROP_LIMIT,(hash('ds'+dp.w)%120)+Math.floor((now()-dp.w*48*3600e3)/(48*3600e3)*260)+S.drop[dp.w])}
  else if(PK[kind]){const P=PK[kind];cards=[0,1,2,3].map(()=>drawCard(P.min,P.b));cards.push(drawCard(P.last,P.b));cards.sort((a,b)=>a.r-b.r)}
  else cards=[drawCard(),drawCard(),drawCard(),drawCard(),drawCard(1)].sort((a,b)=>a.r-b.r);
  if(window.SRV&&kind!=='drop')cards=SRV.cards.map(id=>C[id]).sort((a,b)=>a.r-b.r);
  const seen=new Set();
  const res=cards.map(c=>{const isNew=!own(c.id)&&!seen.has(c.id);seen.add(c.id);S.owned[c.id]=(S.owned[c.id]||0)+1;
    let sp=null;if(c.r>=3&&Math.random()<[0,0,0,.6,.85,1][c.r]){const at=c.r-1-(c.r>=4&&Math.random()<.4?1:0);const opts=['scratch','pulse','fake','needle','glitch','bass','vhs','pixel','lag'];if(c.r>=4)opts.push('faceb','blackout');if(at+2<=c.r)opts.push('rewind');if(c.r===5)opts.push('blackout','pulse');sp={at,kind:opts[Math.floor(Math.random()*opts.length)]}}
    return{c,isNew,sp}});
  const secret=!!PK[kind]||(window.SRV?SRV.secret:(kind!=='drop'&&Math.random()<1/40));const gain=window.SRV?SRV.gain:(secret&&kind==='std'?100:0);
  const nn=res.filter(x=>x.isNew).length;const d=day();d.open++;d.newT+=nn;addXP(20+10*nn);
  S.coins+=gain;const ul=checkUnlocks();save();setCoins();
  return{res,i:0,lv:0,ul,gain,stage:'seal',secret,kind,base};
}
function openPack(m,express){
  if(reveal)return;if(!['free','pay','gold','drop','nacre','diamant'].includes(m))m='pay';
  if(!pay(m)){if(m==='pay'||m==='drop'||m==='nacre'||m==='diamant')needCoins((m==='drop'?DROP_COST:PK[m]?PK[m].p:cost())-S.coins);else toast(m==='gold'?'Pas de Drop Or':'Pas de drop gratuit');return}
  reveal=pull(PK[m]||m==='drop'?m:'std');closeStack();closeDD();closeMenu();
  if(express){showSummary();return}
  showOpening();
}

/* ================= OUVERTURE : moteur ================= */
const A={t:[],busy:false,fin:null};
function after(ms,f){A.t.push(setTimeout(f,ms))}
function run(ms,fin){A.busy=true;A.fin=fin;after(ms,()=>finish(false))}
function finish(skip){
  A.t.forEach(clearTimeout);A.t=[];
  const op=$('op');
  if(op&&skip){op.querySelectorAll('.tfx').forEach(x=>x.remove());op.classList.remove('shake','scr','rw','fake','fb','go4','go5','rush','crack','pulse','bo');op.querySelectorAll('.shards').forEach(e=>e.remove());const bv=op.querySelector('.bvr');if(bv)bv.style.animationPlayState=''}
  const f=A.fin;A.fin=null;A.busy=false;if(f)f();
  if(A.q){A.q=0;if(reveal&&reveal.stage==='spin'&&!A.busy)setTimeout(opTap,0)}
}
function hardStop(){A.t.forEach(clearTimeout);A.t=[];A.busy=false;A.fin=null;A.q=0}
function snap(){const op=$('op');if(!op)return;op.classList.add('snap');void op.offsetWidth;requestAnimationFrame(()=>requestAnimationFrame(()=>{const o=$('op');if(o)o.classList.remove('snap')}))}
function kick(zoom){const op=$('op');if(!op)return;op.classList.remove('kick','kz');void op.offsetWidth;op.classList.add('kick');if(zoom)op.classList.add('kz')}
const D=[0,750,1050,1700,2300,2900];const LZ=[1,1.06,1.12,1.22,1.3,1.38],TURNS=[0,540,900,4320,7200,11520];
function hype(to){const op=$('op');if(!op)return;op.classList.remove('kick','kz','hype');op.style.setProperty('--hd',D[to]+'ms');op.style.setProperty('--lz',LZ[to]);op.style.setProperty('--turns',TURNS[to]+'deg');void op.offsetWidth;op.classList.add('hype');op.classList.toggle('blur',to>=3);after(D[to],()=>op.classList.remove('hype','blur'))}
function boom(L){const op=$('op');if(!op||L<3)return;const c=RAR[L].c,lite=S.set.lite;
  let h=`<i class="bm" style="--c:${c}"></i>`;const rings=L>=5?5:L>=4?3:2;for(let k=0;k<rings;k++)h+=`<i class="rg" style="--c:${L>=4?COLS[L][k%COLS[L].length]:c};animation-delay:${k*.11}s"></i>`;
  const n=(L>=5?60:L>=4?44:30)>>(lite?1:0);for(let k=0;k<n;k++){const a=Math.random()*360,d=40+Math.random()*(L>=4?70:50);h+=`<i class="ex" style="--a:${a.toFixed(0)}deg;--d:${d.toFixed(0)}cqw;--c:${COLS[L][k%COLS[L].length]};--s:${(4+Math.random()*(L>=4?9:6)).toFixed(1)}px;animation-delay:${(Math.random()*.12).toFixed(2)}s"></i>`}
  fxAdd(h,2000);op.classList.remove('quake','quake2');void op.offsetWidth;op.classList.add(L>=4?'quake2':'quake');after(L>=4?900:600,()=>op.classList.remove('quake','quake2'));
  if(L>=4){op.classList.add('chroma');after(700,()=>op.classList.remove('chroma'))}
  buzz(L>=5?[60,40,120,40,200]:L>=4?[40,30,90]:[35,25,50])}
function divine(){const op=$('op');if(!op)return;let p='';for(let k=0;k<(S.set.lite?18:40);k++)p+=`<i style="--x:${(Math.random()*100).toFixed(1)}%;--d:${(Math.random()*2.4).toFixed(2)}s;--s:${(3+Math.random()*6).toFixed(1)}px;--t:${(2.2+Math.random()*1.6).toFixed(2)}s"></i>`;
  fxAdd(`<div class="dvn"><i class="dvr"></i><i class="dvr r2"></i><i class="dvb"></i><div class="dvp">${p}</div><b class="dvt">${'DIVIN'.split('').map((ch,k)=>`<span style="--k:${k}">${ch}</span>`).join('')}</b></div>`,4200,op);coins(26)}
function twins(L){if(S.set.lite||L<3)return;const n=L>=5?6:L>=4?4:2;let h='';for(let k=0;k<n;k++){const a=k/n*360+(n===2?0:45);h+=`<i class="twin" style="--a:${a}deg;--c:${RAR[L].c};animation-delay:${(k*.06).toFixed(2)}s"></i>`}fxAdd(h,1800)}
const COLS=[['#fff'],['#5aa9ff','#cfe5ff'],['#c27dff','#f0d8ff'],['#ffc23d','#fff1c4','#e09a12'],['#ff4f72','#ffc53d','#5dffb0','#4aa8ff','#c56bff'],['#ffffff','#ffe7a8','#ffcf6b']];
function fxAdd(html,ms,host){const h=host||$('fxl');if(!h)return;const d=document.createElement('div');d.className='tfx';d.innerHTML=html;h.appendChild(d);setTimeout(()=>d.remove(),ms)}
function burst(r){const cs=COLS[r],n=(r>=4?22:r>=2?16:10)>>(S.set.lite?1:0);let s='';for(let i=0;i<n;i++)s+=`<i class="pt" style="--a:${(i*360/n+Math.random()*14).toFixed(0)}deg;--d:${(38+Math.random()*34).toFixed(0)}cqw;--c:${cs[i%cs.length]}"></i>`;fxAdd(s,1200)}
function shock(cs){fxAdd(cs.map((c,i)=>`<i class="sk" style="--c:${c};animation-delay:${(i*.12).toFixed(2)}s"></i>`).join(''),1400)}
function flash(c){fxAdd(`<i class="fl" style="--c:${c||'#fff'}"></i>`,700,$('op'))}
function coins(n){if(S.set.lite)n=Math.ceil(n/2);let s='';for(let i=0;i<n;i++)s+=`<i class="cn" style="left:${(Math.random()*94).toFixed(1)}%;animation-delay:${(Math.random()*.5).toFixed(2)}s"></i>`;fxAdd(s,2200,$('op'))}
function buzz(p){try{if(!S.set.lite&&navigator.vibrate)navigator.vibrate(p)}catch(e){}}
function hint(t){const h=$('oph');if(h)h.textContent=t}
function stamp(t,anim){const s=$('stamp');if(s)s.innerHTML=t?`<span class="${anim?'a':''}">${t}</span>`:''}
const lvlHTML=L=>RAR.slice(1).map((R,i)=>`<i class="${i+1<=L?'on':''}" style="--c:${R.c}"></i>`).join('');
function trayFill(){const R=reveal,t=$('tray');if(!R||!t)return;
  t.innerHTML=R.res.map((x,k)=>(k<R.i||(k===R.i&&R.stage==='shown'))?`<i class="on" style="background:${x.c.bg};--wc:${WCOL[x.c.r]}"></i>`:`<i class="${k===R.i&&R.stage!=='seal'?'cur':''}"></i>`).join('')}
function showOpening(){
  const R=reveal;hardStop();if(window.PV){PV.stop();PV.prefetch(R.res.map(y=>y.c))}const sl=PK[R.kind]?PK[R.kind].n:R.kind==='drop'?'Drop numéroté':R.secret?'Édition secrète':'Vol. 01';
  ov.innerHTML=`<div class="ov op lv-0 k-${R.kind}${R.secret||R.kind==='drop'?' secret':''}" id="op" data-act="op" style="--rc:${RAR[0].c}">
    <div class="L blk"></div><div class="L glow"></div><div class="L speed"></div><div class="L grays"><i></i></div><div class="L beam"></div>
    <div class="optop"><div class="lvl" id="lvl">${lvlHTML(0)}</div><button class="skip" data-act="skipall">Passer</button></div>
    <div class="opmid"><div class="stage" id="stage">
      <div class="pl"><div class="bv"><div class="bvx"><div class="bvr">${[0,1,2,3,4,5].map(i=>`<i class="l${i}"></i>`).join('')}<div class="bvl"><b>WAXDROP</b></div></div></div><div class="bvs"></div></div></div>
      <div class="slv"><b>Wax<br>Drop</b><span>${sl}</span></div>
      <div class="stamp" id="stamp"></div><div class="rvc" id="rvc"></div><div class="acw" id="acw"></div><div class="fxl" id="fxl"></div>
    </div></div>
    <div class="eq">${Array.from({length:14},(_,i)=>`<i style="animation-delay:${(-i*.13).toFixed(2)}s;animation-duration:${(.4+(i*37%10)/25).toFixed(2)}s"></i>`).join('')}</div>
    <div class="tray" id="tray"></div><p class="hint" id="oph"></p></div>`;
  R.stage='seal';trayFill();if(R.secret&&R.kind==='std')stamp('Secret',true);
  run(260,unwrap);
}
function opTap(){
  const R=reveal;if(!R||R.stage==='sum'||!$('op'))return;
  if(A.busy){if(R.stage==='spin'){A.q=1;tapPing();return}snap();finish(true);return}
  if(R.stage==='seal')unwrap();
  else if(R.stage==='spin'){if(R.lv<R.res[R.i].c.r)levelUp();else revealCard()}
  else if(R.stage==='shown')nextCard();
}
function tapPing(){const op=$('op');if(!op)return;op.classList.remove('ping');void op.offsetWidth;op.classList.add('ping');buzz(6)}
function unwrap(){const R=reveal;const best=Math.max(...R.res.map(x=>x.c.r));if(best>=2&&Math.random()<(best>=4?.6:best>=3?.4:.15)){const op=$('op');if(op){op.style.setProperty('--aura',RAR[best].c);op.classList.add('aura');setTimeout(()=>{const o=$('op');if(o)o.classList.remove('aura')},2200)}}R.stage='spin';R.i=0;R.lv=0;stamp('');$('op').classList.add('play');hint('');trayFill();run(850,()=>hint('Touche le vinyle'))}
function applyLevel(L,fx){
  const op=$('op');if(!op)return;
  for(let k=0;k<6;k++)op.classList.toggle('lv-'+k,k===L);
  op.style.setProperty('--rc',RAR[L].c);op.style.setProperty('--lc',L?RAR[L].c:'#3a3c45');
  const lv=$('lvl');if(lv)lv.innerHTML=lvlHTML(L);
  op.classList.toggle('dim',L>=2);op.classList.toggle('dim2',L>=4);
  op.classList.toggle('raysOn',L>=3&&!(fx&&L===5));
  stamp(L&&!(fx&&L===5)?RAR[L].n:'',fx);if(fx&&L>=3)buzz(L>=5?[30,50,80]:L>=4?[25,40]:25);
  if(!fx)return;
  if(L===1)after(40,()=>{shock([RAR[1].c]);burst(1)});
  if(L===2)after(40,()=>{shock([RAR[2].c,'#fff']);burst(2)});
  if(L===3)after(40,()=>{flash(RAR[3].c);shock([RAR[3].c,'#fff']);burst(3);coins(14)});
  if(L===4){op.classList.add('go4');after(220,()=>{flash('#fff');op.classList.add('shake');shock(['#ff4f72','#ffc53d','#5dffb0','#4aa8ff']);burst(4)})}
  if(L===5){op.classList.add('go5');const bv=op.querySelector('.bvr');if(bv)bv.style.animationPlayState='paused';
    after(1150,()=>{if(bv)bv.style.animationPlayState='';stamp(RAR[5].n,true);flash('#fff3d0');op.classList.add('raysOn');shock(['#fff','#ffe7a8','#ffcf6b']);burst(5);coins(20)})}
}
function levelUp(){
  const R=reveal,x=R.res[R.i],from=R.lv;const sp=x.sp&&x.sp.at===from?x.sp.kind:null;
  let to=from+1;if(sp==='rewind')to=Math.min(x.c.r,from+2);
  R.lv=to;hint('');const op=$('op');if(sp&&sp!=='scratch'&&sp!=='fake')kick(true);
  const fin=()=>{op.classList.remove('shake','scr','rw','fake','fb','go4','go5','pulse','bo');applyLevel(to,false);if(sp==='rewind')stamp('Double',false);hint('Touche')};
  if(!sp){
    if(to<3){hype(to);applyLevel(to,true);run(D[to],fin);return}
    /* légendaire et plus : le vinyle s'emballe, puis explose */
    hype(to);op.classList.add('charge');op.style.setProperty('--cc',RAR[to].c);hint('');
    const tB=Math.round(D[to]*.82);
    if(to===5){after(tB,()=>{op.classList.remove('charge');op.classList.add('void')});after(tB+650,()=>{op.classList.remove('void');applyLevel(5,true);after(1150,()=>{boom(5);divine()})});run(tB+650+1150+2600,fin);return}
    after(tB,()=>{op.classList.remove('charge');applyLevel(to,true);boom(to)});run(tB+(to>=4?1400:1000),fin);return}
  if(sp==='scratch'){op.classList.add('scr');stamp('Scratch',true);after(700,()=>{op.classList.remove('scr');kick(true);applyLevel(to,true)});run(700+D[to],fin)}
  else if(sp==='rewind'){op.classList.add('rw');stamp('Rewind',true);after(850,()=>{op.classList.remove('rw');applyLevel(to,true)});run(850+D[to],fin)}
  else if(sp==='fake'){op.classList.add('fake');stamp('',false);after(1000,()=>stamp('Encore',true));after(1350,()=>{op.classList.remove('fake');kick(true);applyLevel(to,true)});run(1350+D[to],fin)}
  else if(sp==='needle'){op.classList.add('ndl');stamp('Rayure',true);buzz([10,40,10]);after(1100,()=>{op.classList.remove('ndl');kick(true);applyLevel(to,true);if(to>=3)boom(to)});run(1100+D[to],fin)}
  else if(sp==='glitch'){op.classList.add('glt');stamp('Bug',true);after(900,()=>{op.classList.remove('glt');flash(RAR[to].c);kick(true);applyLevel(to,true);if(to>=3)boom(to)});run(900+D[to],fin)}
  else if(sp==='vhs'){op.classList.add('vhs');stamp('VHS',true);after(1000,()=>{op.classList.remove('vhs');flash(RAR[to].c);kick(true);applyLevel(to,true);if(to>=3)boom(to)});run(1000+D[to],fin)}
  else if(sp==='pixel'){op.classList.add('pxl');stamp('8-bit',true);buzz([8,30,8,30,8]);after(950,()=>{op.classList.remove('pxl');flash('#fff');kick(true);applyLevel(to,true);if(to>=3)boom(to)});run(950+D[to],fin)}
  else if(sp==='lag'){op.classList.add('lag');stamp('Lag',true);after(1100,()=>{op.classList.remove('lag');flash(RAR[to].c);kick(true);applyLevel(to,true);if(to>=3)boom(to)});run(1100+D[to],fin)}
  else if(sp==='bass'){op.classList.add('bss');stamp('Drop',true);after(250,()=>buzz([20,60,20,60,40]));after(1300,()=>{op.classList.remove('bss');flash('#fff');kick(true);applyLevel(to,true);if(to>=3)boom(to)});run(1300+D[to],fin)}
  else if(sp==='pulse'){op.classList.add('pulse');stamp('',false);buzz(20);after(1150,()=>{op.classList.remove('pulse');kick(true);applyLevel(to,true)});run(1150+D[to],fin)}
  else if(sp==='blackout'){op.classList.add('bo');stamp('',false);after(700,()=>buzz(15));after(1350,()=>{op.classList.remove('bo');flash('#fff');kick(true);applyLevel(to,true)});run(1350+D[to],fin)}
  else{op.classList.add('fb');stamp('Face B',true);after(350,()=>applyLevel(to,true));after(960,()=>op.classList.remove('fb'));run(Math.max(980,350+D[to]),fin)}
}
function waveBars(c){const R=rng('wb'+c.id);let s='';for(let k=0;k<26;k++){const v=.2+.8*Math.abs(Math.sin(k*.43+R()*2))*(.5+.5*R());s+=`<i style="--h:${v.toFixed(2)};--d:-${(R()*.8).toFixed(2)}s;--u:${(.5+R()*.4).toFixed(2)}s"></i>`}return s}
function sqHTML(x){const c=x.c,B=c.alk&&RW[c.alk];const ser=S.ser[c.id];
  return `<div class="rsq r${c.r}${c.r===5?' dv':''}" style="--art:${esc(c.img?`url("${c.img}") center/cover no-repeat,${c.bg}`:(B&&B.art||c.bg))};--wc:${WCOL[c.r]};--rc:${RAR[c.r].c}"><div class="sqa"></div><div class="sqw">${waveBars(c)}</div><div class="sqt"><span class="sqr"><i></i>${RAR[c.r].n}</span><b>${esc(c.t)}</b><span>${esc(c.a)}</span></div>${ser?`<em class="sn">#${String(ser).padStart(3,'0')}</em>`:''}</div>`}
let CRK=null;
function crkGeo(){const R=Math.random,n=S.set.lite?5:8,a0=R()*360,ang=[];let acc=0;const w=[];for(let k=0;k<n;k++){w.push(.6+R()*.8);acc+=w[k]}
  let t=a0;for(let k=0;k<n;k++){ang.push(t);t+=w[k]/acc*360}
  const P=(a,r)=>{const q=a*Math.PI/180;return [50+Math.cos(q)*r,50+Math.sin(q)*r]};
  const r1=16+R()*8,r2=34+R()*6;
  const rad=ang.map(a=>{const j=()=>(R()-.5)*9;return [P(a+j(),r1),P(a+j(),(r1+r2)/2),P(a+j(),r2),P(a+j(),42),P(a+(R()-.5)*5,80)]});
  const mid=ang.map((a,k)=>{const b=k+1<n?ang[k+1]:ang[0]+360;return P((a+b)/2+(R()-.5)*6,r1+(R()-.5)*5)});
  return CRK={n,ang,rad,mid}}
function crackSVG(){const g=crkGeo(),f=p=>p[0].toFixed(1)+' '+p[1].toFixed(1),cl=p=>{const dx=p[0]-50,dy=p[1]-50,d=Math.hypot(dx,dy),m=Math.min(1,49/d);return [50+dx*m,50+dy*m]};let d='',e='';
  g.rad.forEach(r=>{d+=`M50 50`+r.map(p=>`L${f(cl(p))}`).join('')});
  g.rad.forEach((r,k)=>{const q=g.rad[(k+1)%g.n];e+=`M${f(r[0])}L${f(g.mid[k])}L${f(q[0])}`});
  return `<svg class="crk" viewBox="0 0 100 100" aria-hidden="true"><path class="glow" d="${d}${e}"/><path d="${d}"/><path class="ring" d="${e}"/></svg>`}
function shatter(){const op=$('op');if(!op)return;const pl=op.querySelector('.pl'),bvr=op.querySelector('.bv .bvr');if(!pl||!bvr)return;let inner='';bvr.querySelectorAll(':scope>i,:scope>.bvl').forEach(e=>{if(e.classList.contains('bvl')||getComputedStyle(e).opacity>.05)inner+=e.outerHTML.replace('<i ','<i style="opacity:1" ')});const g=CRK||crkGeo();CRK=null;const R=Math.random;let h='';
  const poly=pts=>'polygon('+pts.map(p=>p[0].toFixed(1)+'% '+p[1].toFixed(1)+'%').join(',')+')';
  const piece=(pts,dist,del)=>{let cx=0,cy=0;pts.forEach(p=>{cx+=p[0];cy+=p[1]});cx=cx/pts.length-50;cy=cy/pts.length-50;const m=Math.hypot(cx,cy)||1;
    h+=`<div class="shd" style="clip-path:${poly(pts)};transform-origin:${(cx+50).toFixed(0)}% ${(cy+50).toFixed(0)}%;--x:${(cx/m*dist).toFixed(1)}cqw;--y:${(cy/m*dist-8).toFixed(1)}cqw;--r:${((R()-.5)*300).toFixed(0)}deg;--ax:${(R()-.5).toFixed(2)};--ay:${(R()-.5).toFixed(2)};--g:${(20+R()*30).toFixed(0)}cqw;--z:${(40+R()*200).toFixed(0)}px;animation-delay:${del}ms;animation-duration:${(1000+R()*450).toFixed(0)}ms"><div class="bvr">${inner}</div><i class="shl" style="--a:${(R()*360).toFixed(0)}deg"></i></div>`};
  for(let k=0;k<g.n;k++){const a=g.rad[k],b=g.rad[(k+1)%g.n];
    piece([[50,50],a[0],g.mid[k],b[0]],18+R()*14,0);
    piece([...a,...b.slice().reverse(),g.mid[k]],42+R()*34,(R()*40)|0)}
  const cs=[RAR[(reveal&&reveal.res[reveal.i]?reveal.res[reveal.i].c.r:0)].c,'#fff','#1a1a20','#2a2a32'];
  for(let k=0;k<(S.set.lite?6:16);k++){const q=R()*Math.PI*2,d=26+R()*70;h+=`<i class="dbr" style="--x:${(Math.cos(q)*d).toFixed(1)}cqw;--y:${(Math.sin(q)*d-10).toFixed(1)}cqw;--r:${((R()-.5)*720).toFixed(0)}deg;--s:${(1+R()*2.6).toFixed(1)}cqw;--c:${cs[k%cs.length]};animation-delay:${(R()*60)|0}ms"></i>`}
  const old=pl.querySelector('.shards');if(old)old.remove();const d=document.createElement('div');d.className='shards';d.innerHTML=h;pl.appendChild(d);op.classList.add('brk');
  const st=op.querySelector('.stage');if(st&&!S.set.lite){st.classList.remove('boomk');void st.offsetWidth;st.classList.add('boomk');setTimeout(()=>st.classList.remove('boomk'),600)}}
const acHTML=(B,x,b,N,full)=>`<div class="acp${full?' full':''}" id="acp"><span class="acv" style="background:${esc(B.art)}"><i class="gh" style="--rc:${RAR[x.c.r].c}"></i></span><span class="acm"><b>${esc(B.t)}</b><span class="acb"><i id="acbi" style="width:${b/N*100}%"></i></span></span><em><span id="acn">${b}</span>/${N}</em></div>`;
function revealCard(){
  const R=reveal,x=R.res[R.i],r=x.c.r;R.stage='shown';hint('');stamp('',false);
  const op=$('op');const brk=!!x.isNew;
  op.classList.add('rush');kick(true);
  const show=()=>{const o=$('op');if(!o)return;o.classList.remove('rush','crack');o.classList.add('out');const box=$('rvc');
    if(box&&!box.firstChild){box.innerHTML=`<div class="rvw"><span class="tag${x.isNew?'':' dup'}">${x.isNew?'Nouveau':'Double'}</span>${sqHTML(x)}</div>`;const sq=box.querySelector('.rsq');if(sq&&A.busy)sq.classList.add('em');if(window.PV)PV.play(x.c)}trayFill()};
  const TS=brk?980:480;
  if(brk){after(430,()=>{op.classList.add('crack');if(window.SFX&&SFX.crack)SFX.crack();const pl=op.querySelector('.pl');if(pl&&!pl.querySelector('.crk'))pl.insertAdjacentHTML('beforeend',crackSVG())});
    after(TS,()=>{flash(RAR[r].c);shatter();show()})}
  else after(TS,show);
  after(TS+160,()=>{if(r>=1)burst(r);if(r>=2)shock([RAR[r].c])});
  const B=x.c.alk&&RW[x.c.alk];const prog=x.isNew&&B&&!B.single;let before=0,Nn=0,full=false;
  if(prog){before=B.ids.filter(id=>R.base.has(id)||R.res.slice(0,R.i).some(y=>y.isNew&&y.c.id===id)).length;Nn=B.ids.length;full=before+1>=Nn}
  const build=()=>{const w=$('acw');if(!w||w.firstChild)return;w.innerHTML=acHTML(B,x,before,Nn,full);
    const g=w.querySelector('.gh'),v=w.querySelector('.acv'),c=document.querySelector('.rvw .rsq');
    if(g&&v&&c&&A.busy){const a=v.getBoundingClientRect(),b=c.getBoundingClientRect();g.style.setProperty('--gx',(b.x+b.width/2-a.x-a.width/2).toFixed(0)+'px');g.style.setProperty('--gy',(b.y+b.height*.42-a.y-a.height/2).toFixed(0)+'px');g.classList.add('go')}else if(g)g.remove()};
  const set=()=>{const bi=$('acbi'),n=$('acn'),p=$('acp');if(bi)bi.style.width=(before+1)/Nn*100+'%';if(n)n.textContent=before+1;if(p)p.classList.add('hit')};
  if(prog){after(TS+620,build);after(TS+1080,set);if(full)after(TS+1250,()=>{stamp('Album complet',true);shock(['#ffd36b','#fff'])})}
  run(TS+(prog?(full?1550:1350):760),()=>{show();const o=$('op');if(o){o.classList.remove('rush','crack');const sh_=o.querySelector('.shards');if(sh_)sh_.remove()}
    const w=document.querySelector('.rvw');if(w)w.classList.add('done');
    if(prog){build();set();const p=$('acp');if(p)p.classList.add('done');if(full)stamp('Album complet',false)}hint(x.isNew?'Nouveau':'Double')});
}
function nextCard(){
  const R=reveal;if(window.PV)PV.stop(250);const w=$('rvc').querySelector('.rvw');if(w){w.classList.remove('pop','done');w.classList.add('fly')}const ap=$('acp');if(ap)ap.classList.add('away');
  run(230,()=>{const box=$('rvc');if(box)box.innerHTML='';const aw=$('acw');if(aw)aw.innerHTML='';stamp('',false);const o_=$('op');if(o_){o_.classList.remove('brk','crack','rush');o_.querySelectorAll('.shards,.crk').forEach(e=>e.remove())}
    if(R.i+1>=R.res.length){showSummary();return}
    R.i++;R.lv=0;R.stage='spin';const op=$('op');op.classList.remove('out');applyLevel(0,false);trayFill();hint('Touche')});
}
function showSummary(){
  hardStop();if(window.PV)PV.stop(400);const R=reveal;if(!R)return;R.stage='sum';try{S.lastDrop=R.res.slice().sort((a,b)=>b.c.r-a.c.r)[0].c.id;save()}catch(_){}const nn=R.res.filter(x=>x.isNew).length;
  const again=canFree()||S.coins>=cost();
  ov.innerHTML=`<div class="ov sumv"><h2>${nn} nouveau${nn>1?'x':''}</h2>${R.gain?`<p class="gain">+${R.gain} ${coinI}</p>`:''}
    <div class="sumg${R.res.length<5?' s3':''}">${R.res.map((x,k)=>`<button class="it" style="animation-delay:${k*.06}s" data-act="see" data-id="${x.c.id}"><span class="tag${x.isNew?'':' dup'}">${x.isNew?'Nouveau':'Double'}</span>${tileHTML(x.c,{nocount:1,lock:false})}</button>`).join('')}</div>
    <div class="row">${R.ul.length?`<button class="pbtn" data-act="unlocks">${R.ul.length} récompense${R.ul.length>1?'s':''}</button>`:`<button class="pbtn" data-act="done">Continuer</button>${again?'<button class="gbtn" data-act="again">Encore</button>':''}`}<button class="gbtn shr" data-act="share" aria-label="Partager mon drop">${ICON.share}Partager</button></div></div>`;
}
function showUnlock(i){
  hardStop();const R=reveal;if(!R)return;const x=R.ul[i];if(!x){closeOv();return}
  ov.innerHTML=`<div class="ov op ul sumv raysOn" id="op" style="--rc:${x.type==='album'?'#e9c46a':'#dfe5ec'}"><div class="L glow" style="opacity:.4"></div><div class="L grays"><i></i></div>
   <p class="hint">${x.type==='album'?'Album complété':'Disque de platine'}</p><div class="uw">${rewardHTML(x)}</div><h2 style="text-align:center">${esc(x.type==='album'?x.t:x.n)}</h2>
   <p class="gain">+${x.type==='album'?ALB_BONUS:ART_BONUS} ${coinI}</p><button class="pbtn" data-act="unext" data-i="${i+1}">${i+1<R.ul.length?'Suivante':'Continuer'}</button></div>`;
}
function closeOv(){hardStop();if(window.PV)PV.stop(300);ov.innerHTML='';reveal=null;render()}

/* ================= MARCHÉ ================= */
const mkMax=()=>5;
const nextBid=l=>l.lead?Math.ceil(l.cur*1.1+2):l.cur;
const valOf=c=>Math.round(RAR[c.r].v*(TREND.has(c.id)?1.5:1));
function mkNew(t0){
  const R=Math.random;let r=R()<.5?1:R()<.6?2:R()<.6?3:R()<.6?4:R()<.85?0:5;const pool=POOL[r];const c=pool[Math.floor(R()*pool.length)];
  const V=valOf(c);const len=(4+R()*22)*60e3;S.mk.seq++;
  return{id:'l'+S.mk.seq,cid:c.id,seller:PSEUDOS[Math.floor(R()*PSEUDOS.length)],cur:Math.max(5,Math.round(V*(.35+R()*.3))),lead:null,h:null,myBid:0,bids:0,t0,ends:t0+len,max:Math.round(V*(.75+R()*1.1)),heat:.4+R()*.6,mine:false};
}
function hp(l,v){if(!l.h)l.h=[l.cur];l.h.push(v);if(l.h.length>14)l.h.splice(1,1)}
const chg=l=>{const s0=l.h?l.h[0]:l.cur;return Math.round((l.cur/s0-1)*100)};
function spark(l,cls){const h=l.h&&l.h.length>1?l.h:[l.cur,l.cur];const mn=Math.min(...h),mx=Math.max(...h),sp=mx-mn||1;const pts=h.map((v,i)=>`${(i/(h.length-1)*100).toFixed(1)},${(30-(v-mn)/sp*26).toFixed(1)}`).join(' ');return `<svg class="${cls||'spk'}" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}"/></svg>`}
const chgHTML=l=>{const v=chg(l);return `<span class="chg${v>0?' gn':''}">${v>0?'▲ ':''}${v} %</span>`};
function mkInit(){if(!S.mk||!Array.isArray(S.mk.list))S.mk={list:[],seq:0,t:now()}}
function mkStep(t){
  const M=S.mk;const notes=[];
  for(const l of M.list){if(l.done)continue;
    if(t>=l.ends){l.done=true;const c=C[l.cid];
      if(l.mine){if(l.lead){S.coins+=l.cur;notes.push(`${c.t} vendu ${l.cur} wax coins`)}else{S.owned[l.cid]=(S.owned[l.cid]||0)+1;notes.push(`${c.t} invendu, rendu`)}}
      else if(l.lead==='me'){S.owned[l.cid]=(S.owned[l.cid]||0)+1;notes.push(`Remporté : ${c.t}`);checkUnlocks()}
      continue}
    const prog=clamp((t-l.t0)/(l.ends-l.t0),0,1);
    if(Math.random()<l.heat*(.05+.35*prog*prog)){const nb=nextBid(l);if(nb<=l.max){
      if(l.lead==='me'){S.coins+=l.myBid;l.myBid=0;notes.push(`Surenchère sur ${C[l.cid].t}`)}
      hp(l,nb);l.cur=nb;l.lead='bot';l.bids++}}
  }
  M.list=M.list.filter(l=>!l.done);
  const pub=M.list.filter(l=>!l.mine).length;for(let k=pub;k<10;k++)M.list.push(mkNew(t));
  M.t=t;return notes;
}
function mkTick(){return false}
function mkRow(l){const c=C[l.cid];const R=RAR[c.r];const v=chg(l);
  let btn;if(l.mine)btn=`<span class="ls">${l.lead?`${l.bids} offre${l.bids>1?'s':''}`:'Aucune offre'}</span>`;
  else if(l.lead==='me')btn=`<button class="lbtn on" disabled>En tête</button>`;
  else btn=`<button class="lbtn" data-act="bid" data-l="${l.id}">${nextBid(l)} ${coinI}</button>`;
  return `<div class="lr wx${v>0?' gn':''}" data-lid="${l.id}">${spark(l,'spk')}<button class="lth" data-act="see" data-id="${c.id}" aria-label="${esc(c.t)}">${tileHTML(c,{nocount:1,lock:false})}</button><div class="li"><b>${esc(c.t)}</b><span><i style="background:${R.c}"></i>${esc(c.a)}</span><small>${chgHTML(l)} · <span class="ltm">${clock(l.ends-now())}</span></small></div><div class="lp"><b class="lcur">${l.cur} ${coinI}</b><small>${l.mine?'Ta vente':esc(l.seller)}</small></div>${btn}</div>`}
function mkLayout(){const h=$('pgr');if(!h)return;mkInit();
  if(mkSub==='live')pager(h,S.mk.list.filter(l=>!l.mine).sort((a,b)=>a.ends-b.ends),mkRow,{cellH:76,minW:340,gap:8,empty:'Aucun son en vente pour l’instant. Mets tes doubles en vente !'});
  else if(mkSub==='mine')pager(h,S.mk.list.filter(l=>l.mine).sort((a,b)=>a.ends-b.ends),mkRow,{cellH:76,minW:340,gap:8,empty:'Aucune vente en cours'});
  else pager(h,CARDS.filter(c=>(S.owned[c.id]||0)>1).sort((a,b)=>b.r-a.r),c=>`<button class="it" data-act="sell" data-id="${c.id}" aria-label="Vendre ${esc(c.t)}">${tileHTML(c)}</button>`,{minT:96,empty:'Pas de doubles à vendre'});
}
function mkPaint(){if(tab!=='shop'||shopSub!=='encheres')return;tickPaint();document.querySelectorAll('[data-lid]').forEach(el=>{const l=S.mk.list.find(x=>x.id===el.dataset.lid);if(!l){el.style.opacity=.35;return}
  const tm=el.querySelector('.ltm');if(tm)tm.textContent=clock(l.ends-now());const sk=el.querySelector('.spk');if(sk)sk.outerHTML=spark(l,'spk');const cg=el.querySelector('.chg');if(cg)cg.outerHTML=chgHTML(l);el.classList.toggle('gn',chg(l)>0);const cu=el.querySelector('.lcur');if(cu)cu.innerHTML=`${l.cur} ${coinI}`;
  const b=el.querySelector('.lbtn');if(b&&!l.mine){if(l.lead==='me'){b.disabled=true;b.classList.add('on');b.textContent='En tête'}else{b.disabled=false;b.classList.remove('on');b.dataset.act='bid';b.dataset.l=l.id;b.innerHTML=`${nextBid(l)} ${coinI}`}}
  const ls=el.querySelector('.ls');if(ls)ls.textContent=l.lead?`${l.bids} offre${l.bids>1?'s':''}`:'Aucune offre'})}
function bid(id){const l=S.mk.list.find(x=>x.id===id);if(!l||l.mine||l.lead==='me')return;const nb=nextBid(l);
  if(S.coins<nb){toast('Pas assez de wax coins');return}S.coins-=nb;hp(l,nb);l.cur=nb;l.lead='me';l.myBid=nb;l.bids++;day().bid++;
  if(l.ends-now()<30e3)l.ends=now()+30e3;save();setCoins();mkPaint();toast('Tu es en tête')}
function sellSheet(id){const c=C[id];if(!c||(S.owned[id]||0)<2)return;const V=valOf(c);const prices=[Math.round(V*.4),Math.round(V*.7),V];
  menuPage='sell';sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Vendre"><div class="grab"></div><div class="shh"><h2>Vendre</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <div class="sellh"><div class="sth">${tileHTML(c,{nocount:1})}</div><div><b>${esc(c.t)}</b><small>${esc(c.a)} · ${RAR[c.r].n}</small><small>Tu en as ${S.owned[id]}</small></div></div>
   <span class="lbl">Prix de départ</span><div class="chips">${prices.map((p,i)=>`<button class="chip" data-act="sp" data-v="${p}" aria-pressed="${i===1}">${p} wax coins</button>`).join('')}</div>
   <span class="lbl">Durée</span><div class="chips">${[[5,'5 min'],[15,'15 min'],[60,'1 h']].map(([m,n],i)=>`<button class="chip" data-act="sd" data-v="${m}" aria-pressed="${i===1}">${n}</button>`).join('')}</div>
   <p class="cap" style="text-align:left">Aucuns frais · ${S.mk.list.filter(l=>l.mine).length}/${mkMax()} ventes</p>
   <button class="pbtn" data-act="list" data-id="${id}">Mettre aux enchères</button></div>`}
function listCard(id){const c=C[id];if(!c||(S.owned[id]||0)<2)return;if(S.mk.list.filter(l=>l.mine).length>=mkMax()){toast('5 ventes maximum');return}
  const sp=sh.querySelector('[data-act=sp][aria-pressed=true]'),sd=sh.querySelector('[data-act=sd][aria-pressed=true]');const p=sp?+sp.dataset.v:valOf(c),m=sd?+sd.dataset.v:15;
  S.owned[id]--;S.mk.seq++;const V=valOf(c),t=now();day().sell++;
  S.mk.list.push({id:'m'+S.mk.seq,cid:id,seller:'moi',cur:p,h:[p],lead:null,myBid:0,bids:0,t0:t,ends:t+m*60e3,max:Math.round(Math.max(p,V*(.8+Math.random()*1.2))),heat:.5+Math.random()*.5,mine:true});
  save();closeMenu();shopSub='encheres';mkSub='mine';render();toast('Mis en vente')}

/* ================= ÉCHANGES (amis simulés) ================= */
function friendDups(f){const R=rng('fd'+f+today());const o=[];let guard=0;while(o.length<6&&guard++<50){const r=R()<.45?0:R()<.6?1:R()<.6?2:R()<.7?3:4;const p=POOL[r];const c=p[Math.floor(R()*p.length)];if(!o.includes(c)&&!(S.codes['tr'+f+today()+c.id]))o.push(c)}return o}
function friendRow(f){const L=friendDups(f);return `<div class="lr"><span class="av" style="--avg:linear-gradient(140deg,hsl(${hash(f)%360} 46% 60%),hsl(${(hash(f)+40)%360} 44% 34%))">${esc(f.slice(0,2).toUpperCase())}</span><div class="li"><b>${esc(f)}</b><span>${L.length} doubles à échanger</span><small>${L.slice(0,3).map(c=>esc(c.t)).join(' · ')}</small></div><button class="lbtn" data-act="trade" data-f="${esc(f)}">${ICON.swap}</button></div>`}
let TR=null;
function tradeSheet(f){const mine=CARDS.filter(c=>(S.owned[c.id]||0)>1).sort((a,b)=>b.r-a.r);const theirs=friendDups(f);TR={f,give:null,get:null};
  menuPage='trade';sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Échange"><div class="grab"></div><div class="shh"><h2>Échange avec ${esc(f)}</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <span class="lbl">Tu reçois</span><div class="trow">${theirs.map(c=>`<button class="tpick" data-act="tget" data-id="${c.id}" aria-pressed="false">${tileHTML(c,{nocount:1,lock:false})}${own(c.id)?'':'<em class="nw">Manque</em>'}</button>`).join('')}</div>
   <span class="lbl">Tu donnes</span>${mine.length?`<div class="trow">${mine.map(c=>`<button class="tpick" data-act="tgive" data-id="${c.id}" aria-pressed="false">${tileHTML(c)}</button>`).join('')}</div>`:'<p class="muted">Tu n’as pas encore de doubles</p>'}
   <p class="cap" id="trmsg" style="text-align:left">Choisis un son de chaque côté · démo</p><button class="pbtn" id="trgo" data-act="tgo" disabled>Proposer</button></div>`}
function tradePick(t){const k=t.dataset.act==='tget'?'get':'give';t.parentElement.querySelectorAll('.tpick').forEach(x=>x.setAttribute('aria-pressed',x===t));TR[k]=t.dataset.id;const b=$('trgo');if(b)b.disabled=!(TR.get&&TR.give)}
function tradeGo(){if(!TR||!TR.get||!TR.give)return;const g=C[TR.give],r=C[TR.get];const b=$('trgo'),m=$('trmsg');b.disabled=true;b.textContent='En attente…';day().trade++;save();
  setTimeout(()=>{if(!TR||!$('trgo'))return;const ok=valOf(g)*(.8+Math.random()*.5)>=valOf(r)*.9;
    if(ok&&(S.owned[g.id]||0)>1){S.owned[g.id]--;S.owned[r.id]=(S.owned[r.id]||0)+1;S.codes['tr'+TR.f+today()+r.id]=1;const ul=checkUnlocks();save();setCoins();closeMenu();toast(`${TR.f} accepte : ${r.t} ajouté${ul.length?' · récompense !':''}`);TR=null;render()}
    else{m.textContent=`${TR.f} refuse. Propose un son plus rare.`;b.textContent='Proposer';b.disabled=false}},2000)}

/* ================= RECYCLAGE / FABRICATION ================= */
function recySheet(){const ex=CARDS.filter(c=>(S.owned[c.id]||0)>1);const gain=ex.reduce((s,c)=>s+(S.owned[c.id]-1)*DUST_GET[c.r],0);
  menuPage='recy';sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Recycler"><div class="grab"></div><div class="shh"><h2>Recycler</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <div class="dustbig">${dustI}<b>${S.dust}</b><span>poussière de vinyle</span></div>
   <div class="mlist">${RAR.map((R,i)=>{const n=ex.filter(c=>c.r===i).reduce((s,c)=>s+S.owned[c.id]-1,0);return n?`<div class="set"><span style="display:flex;align-items:center;gap:10px"><i style="width:10px;height:10px;border-radius:50%;background:${R.c}"></i><b>${R.n}</b></span><span style="font:600 13px var(--mono)">${n} × ${DUST_GET[i]}</span></div>`:''}).join('')||'<div class="set"><span class="muted">Aucun double</span></div>'}</div>
   <p class="cap" style="text-align:left">Garde 1 exemplaire de chaque son. La poussière sert à fabriquer un son manquant.</p>
   <button class="pbtn" data-act="recyall" ${gain?'':'disabled'}>Tout recycler · +${gain}</button></div>`}
function recyAll(){let g=0,n=0;CARDS.forEach(c=>{const k=(S.owned[c.id]||0)-1;if(k>0){g+=k*DUST_GET[c.r];n+=k;S.owned[c.id]=1}});S.dust+=g;day().recycle+=n;save();closeMenu();toast(`+${g} poussière`);render()}
function recyOne(id){const c=C[id];if((S.owned[id]||0)<2)return;S.owned[id]--;S.dust+=DUST_GET[c.r];day().recycle++;save();toast(`+${DUST_GET[c.r]} poussière`);see(id);render()}
function craft(id){const c=C[id];const k=DUST_COST[c.r];if(own(id)||S.dust<k){toast('Pas assez de poussière');return}S.dust-=k;S.owned[id]=1;const ul=checkUnlocks();save();setCoins();toast(`${c.t} fabriqué${ul.length?' · récompense !':''}`);see(id);render()}

/* ================= MISSIONS / SAISON ================= */
function mClaim(k){const d=day();const m=MISS.find(x=>x.k===k);if(!m||d.cl[k]||(d[k]||0)<m.n)return;d.cl[k]=1;S.coins+=m.c;addXP(m.x);save();toast(`+${m.c} wax coins · +${m.x} XP`);render()}
function giveR(r){if(r.gold)S.gold+=r.gold;if(r.maxi)S.bonus+=r.maxi;if(r.coins)S.coins+=r.coins;if(r.dust)S.dust+=r.dust}
function sClaim(i,t){i=+i;if(i>tierNow())return;const {f,p}=seasonRewards(i);
  if(t==='f'&&!S.sfree.includes(i)){S.sfree.push(i);giveR(f)}else if(t==='p'&&hasPass()&&!S.sprem.includes(i)){S.sprem.push(i);giveR(p)}else return;save();toast('Récompense ajoutée');render()}

/* ================= CALQUES ================= */
function closeDD(){dd.innerHTML=''}
function needCoins(miss){miss=Math.max(1,miss|0);closeMenu();menuPage='need';
  const best=SHOP.find(p=>p.n>=miss)||SHOP[SHOP.length-1];
  sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Pas assez de wax coins"><div class="grab"></div><div class="shh"><h2>Il te manque ${miss.toLocaleString('fr-FR')} wax coins</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <div class="offers">${SHOP.map(p=>`<button class="offer${p===best?' best':''}" data-act="buy" data-k="${p.k}">${p===best?'<em>Conseillé</em>':p.tag?`<em>${p.tag}</em>`:''}<span class="stack">${coinI}${coinI}${coinI}</span><b>${p.n.toLocaleString('fr-FR')}</b><span class="price">${p.p}</span></button>`).join('')}</div>
   <p class="cap" style="text-align:left">${freeReady()||S.bonus>0?'Tu as un drop gratuit à ouvrir.':`Prochain drop gratuit dans <b data-clock="${S.freeAt}">${clock(S.freeAt-now())}</b>.`} Les missions et les succès donnent aussi des wax coins.</p>
   <button class="gbtn" data-act="gocoins">Voir toutes les offres</button></div>`}
function passSheet(){closeMenu();closeDD();shopSub='pass';setTab('shop');return;menuPage='pass';
  sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass passsh" role="dialog" aria-label="WaxDrop Pro"><div class="grab"></div><div class="shh"><h2>WaxDrop Pro</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <ul class="perks">${['Bourse en détail : historique 7 et 30 jours, variations, volatilité','Drop gratuit toutes les 5 min au lieu de 10','+1 drop offert chaque jour','1 Drop Or chaque lundi','Thèmes Minuit et Nacre','Bourse sans limite, Divins compris','Défis d’événement ×2','Label +50 % de points, création offerte','Stats détaillées'].map(t=>`<li>${ICON.check}${t}</li>`).join('')}</ul>
   ${hasPass()?`<p class="cap">Actif jusqu’au ${new Date(S.passUntil).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}, renouvelé automatiquement.</p><div class="row">${day().pd?'<button class="pbtn" disabled>Drop du jour récupéré</button>':'<button class="pbtn" data-act="claim">Drop du jour</button>'}<button class="gbtn" data-act="passmanage">Gérer</button></div>`:`<button class="pbtn" data-act="buy" data-k="pass">S’abonner · ${PASS_PRICE}</button><p class="cap">Paiement sécurisé par Stripe. Résiliable à tout moment.</p>`}</div>`}
function vitSheet(){vitInit();closeMenu();menuPage='vit';const V=S.vits[S.vi];
  sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Vitrine"><div class="grab"></div><div class="shh"><h2>Vitrine</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <label class="lbl" for="vname">Nom</label><input class="tin" id="vname" maxlength="18" value="${esc(V.n)}">
   <div class="row"><button class="pbtn" data-act="vsave">Enregistrer</button>${S.vits.length>1?'<button class="gbtn" data-act="vdel">Supprimer</button>':''}</div></div>`}
function vitPick(){vitInit();closeMenu();menuPage='vpick';const L=CARDS.filter(c=>own(c.id)&&!S.fav.includes(c.id)).sort((a,b)=>b.r-a.r).slice(0,120);
  sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Ajouter à la vitrine"><div class="grab"></div><div class="shh"><h2>Ajouter un son</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   ${L.length?`<div class="pickg">${L.map(c=>`<button data-act="vadd" data-id="${c.id}" aria-label="${esc(c.t)}">${tileHTML(c,{nocount:1})}</button>`).join('')}</div>`:'<p class="muted">Ouvre des drops pour remplir ta vitrine</p>'}</div>`}
function popHTML(inner){return `<div class="scrim" data-act="ddclose"></div><div class="pop">${inner}</div>`}
function see(id){const c=C[id];if(!c)return;const n=S.owned[id]||0;const fav=S.fav.includes(id);
  const acts=reveal?'':`<div class="row"><a class="gbtn" href="https://open.spotify.com/search/${encodeURIComponent(c.t+' '+c.a)}" target="_blank" rel="noopener">${ICON.play}Écouter</a><button class="gbtn" data-act="goartist" data-k="${c.ak}">${esc(c.a)}</button>${c.alk&&!RW[c.alk].single?`<button class="gbtn" data-act="goalbum" data-k="${c.alk}">Album</button>`:''}</div>
   <div class="row">${n?`<button class="gbtn" data-act="fav" data-id="${id}">${ICON.pin}${fav?'Retirer':'Mettre en vitrine'}</button>`:`<button class="gbtn" data-act="craft" data-id="${id}" ${S.dust>=DUST_COST[c.r]?'':'disabled'}>Fabriquer · ${DUST_COST[c.r]} ${dustI}</button>`}${n>1?`<button class="gbtn" data-act="sellfrom" data-id="${id}">Vendre</button><button class="gbtn" data-act="recy1" data-id="${id}">${ICON.recycle}+${DUST_GET[c.r]}</button>`:''}</div>`;
  dd.innerHTML=popHTML(`<div class="big">${tileHTML(c,{nocount:1})}</div><div class="info glass" style="--rc:${RAR[c.r].c}"><span><i></i>${RAR[c.r].n}</span><button class="qte" id="qte" data-act="quote" data-id="${id}" aria-label="Voir à la Bourse"><span class="qld">Cours…</span></button>${c.y?`<span>${c.y}</span>`:''}<span>×${n}</span></div><p class="cap">${esc(c.al||'Single')}</p>${acts}`);if(window.ECO&&ECO.quote)ECO.quote(id)}
function seeAl(k){const B=RW[k];if(!B)return;
  dd.innerHTML=popHTML(`<div class="big shine">${albumHTML(B)}</div><div class="trk glass">${B.ids.slice(0,9).map(id=>{const c=C[id];return `<div class="${own(id)?'':'no'}" style="--rc:${RAR[c.r].c}"><i></i><span>${esc(c.t)}</span><em>${own(id)?'✓':''}</em></div>`}).join('')}${B.ids.length>9?`<div><span class="muted">+ ${B.ids.length-9} autres</span></div>`:''}</div>
   <p class="cap">${B.single?'Singles':S.ul[k]?'Complété':`+${ALB_BONUS} wax coins à la clé`}</p>`)}
function seePl(k){const A=RW[k];if(!A)return;
  dd.innerHTML=popHTML(`<div class="big">${plaqueHTML(A)}</div><div class="info glass"><span>${A.ids.filter(own).length}/${A.ids.length} sons</span><span>${S.ul[k]?'Obtenu':`+${ART_BONUS} wax coins`}</span></div>`)}
function share(){const R=reveal;if(!R)return;const b=R.res.slice().sort((a,b)=>b.c.r-a.c.r)[0].c;const cap=`J'ai tiré ${b.t} de ${b.a} (${RAR[b.r].n}) sur WaxDrop #trackdex #rap`;
  dd.innerHTML=popHTML(`<div class="story" style="--rc:${RAR[b.r].c}"><p>WaxDrop</p><div class="sc">${tileHTML(b,{nocount:1,lock:false})}</div><div><h3>${RAR[b.r].n}</h3><p style="margin-top:4px">${esc(b.a)}</p></div></div><div class="row"><button class="pbtn" data-act="copycap" data-cap="${esc(cap)}">Copier la légende</button></div>`)}
function buyFlow(k){
  const item=k==='pass'?{n:'WaxDrop Pro',p:PASS_PRICE}:k==='starter'?{n:'Pack Starter',p:'2,99 €'}:(()=>{const s=SHOP.find(x=>x.k===k);return{n:`${s.n.toLocaleString('fr-FR')} wax coins`,p:s.p}})();
  dd.innerHTML=popHTML(`<div class="card2 glass"><span class="lbl">Paiement · démo</span><h2>${item.n}</h2><p class="price2">${item.p}</p><p class="cap">Aucun paiement réel ici. Dans l’app, le paiement passera par l’App Store, Google Play ou Stripe.</p><div class="row"><button class="gbtn" data-act="ddclose">Annuler</button><button class="pbtn" data-act="buyok" data-k="${k}">Confirmer</button></div></div>`)}
function buyOk(k){
  if(k==='pass'){S.pass={on:true,since:today()};toast('WaxDrop Pro activé')}
  else if(k==='starter'){if(S.codes._starter){toast('Déjà acheté');closeDD();return}S.codes._starter=1;S.bonus+=3;S.gold+=1;S.coins+=300;toast('Starter ajouté')}
  else{const s=SHOP.find(x=>x.k===k);if(s){S.coins+=s.n;toast(`+${s.n.toLocaleString('fr-FR')} wax coins`)}}
  save();closeDD();render()}
function buyCoins(k){if(k==='nacre'||k==='diamant'){if(S.coins<PK[k].p){needCoins(PK[k].p-S.coins);return}openPack(k);return}const P={gold:GOLD_COST,lot5:450,dust:300}[k];if(S.coins<P){needCoins(P-S.coins);return}S.coins-=P;
  if(k==='gold'){S.gold++;toast('Drop Or ajouté')}else if(k==='lot5'){S.bonus+=5;toast('5 drops ajoutés')}else{S.dust+=200;toast('+200 poussière')}save();render()}
function claim(){if(!hasPass()||S.passDay===today())return;S.passDay=today();S.bonus++;if(new Date().getDay()===1)S.gold++;save();toast(new Date().getDay()===1?'+1 drop et 1 Drop Or':'+1 drop');render()}
function spotFlow(){if(S.spot){spotShow();return}
  dd.innerHTML=popHTML(`<div class="card2 glass"><span class="lbl">Spotify · démo</span><div class="steps">${['Connexion','Autorisation','Ton top du mois','Bonus'].map(t=>`<div><i>✓</i>${t}</div>`).join('')}</div></div>`);
  dd.querySelectorAll('.steps div').forEach((d,i)=>setTimeout(()=>{if(d.isConnected)d.classList.add('on')},350+i*550));
  setTimeout(()=>{if(!dd.querySelector('.steps'))return;const r=rng('spot'+today());const pool=ARTISTS.filter(a=>a.g==='FR').slice(),top=[];while(top.length<5&&pool.length)top.push(pool.splice(Math.floor(r()*pool.length),1)[0].key);
    S.spot={top,min:2200+Math.floor(r()*4000)};save();spotShow();render()},350+4*550+250)}
function spotShow(){const sp=S.spot;if(!sp)return;
  dd.innerHTML=popHTML(`<div class="card2 glass"><span class="lbl" style="color:#1ed760">Spotify connecté · démo</span><div class="sptop">${sp.top.map(k=>{const A=RW[k];return A?`<div><span class="av" style="--avg:${esc(A.avg)}">${esc(A.ini)}</span><span>${esc(A.n)}</span></div>`:''}).join('')}</div>
   <div class="info"><span>${sp.min.toLocaleString('fr-FR')} min ce mois</span><span>×2 sur ton top</span></div><button class="gbtn" data-act="spotoff">Déconnecter</button></div>`)}

/* ================= MENU ================= */
function closeMenu(){sh.innerHTML='';menuPage=null;TR=null}
function openMenu(p){menuPage=p||'';resetArm=false;renderMenu()}
function mi(p,bg,icon,t,s){return `<button class="mi" data-act="${p[0]==='!'?p.slice(1):'mpage'}" data-p="${p}"><span class="ic" style="--icbg:${bg}">${icon}</span><b>${t}</b><small>${s||''}</small></button>`}
function renderMenu(){
  const e=liveEv();const top=t=>`<div class="grab"></div><div class="shh">${t?`<button class="gbtn" data-act="mpage" data-p="">${ICON.back}Menu</button>`:'<h2>Menu</h2>'}<button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>`;
  let b='';const p=menuPage;
  if(!p){const nm=(window.CL&&CL.pseudo)||'Invité';const on=hasPass();
    b=top('')+`<div class="mhero">${avHTML('mav')}<div class="mhn"><b>${esc(nm)}</b><small>${window.CL&&CL.user?'Compte connecté':'Non connecté'}</small></div>${on?'<span class="pro big">Pro</span>':`<button class="mgo" data-act="gopass"><em class="pro">Pro</em>4,99 €</button>`}</div>
     <h3 class="msec">Thème</h3>
     <div class="skrow">${SKINS.map(([id,n,pp])=>{const lk=pp&&!on;return `<button class="skin2" data-act="${lk?'needpass':'skin'}" data-s="${id}" aria-pressed="${(S.set.skin||'auto')===id}"><span class="pv" style="--pv:${SKPV[id]}">${lk?'<u class="pro">Pro</u>':''}</span><small>${n}</small></button>`}).join('')}</div>
     <div class="mtg"><div class="set"><span class="ic" style="--icbg:#7c5cff">${ICON.play}</span><b>Sons</b><button class="sw" role="switch" aria-checked="${S.set.snd!==false}" data-act="snd" aria-label="Sons"></button></div><div class="set"><span class="ic" style="--icbg:#ef5466">${ICON.play}</span><b>Extraits</b><button class="sw" role="switch" aria-checked="${S.set.prev!==false}" data-act="prev" aria-label="Extraits musicaux"></button></div><div class="set"><span class="ic" style="--icbg:#30a46c">${ICON.bolt}</span><b>Mode économie</b><button class="sw" role="switch" aria-checked="${!!S.set.lite}" data-act="lite" aria-label="Mode économie"></button></div></div>
     <div class="mgrid">${[['events','#d6336c',ICON.cal,'Événements',liveEv()?'En cours':''],['!label','#7c5cff',ICON.users,'Label',window.LABEL&&LABEL.sub?LABEL.sub():'Avec tes potes'],['!cat','#2b8a3e',ICON.search,'Catalogue',`${ARTISTS.length} artistes`],['rar','#e9a23b',ICON.gem,'Raretés',''],['code','#ff7a3d',ICON.gift,'Code',''],['idee','#9c36b5',ICON.star,'Tes idées','Améliore le jeu'],['how','#3a8dde',ICON.help,'Aide',''],['compte','#4c6ef5',ICON.users,'Compte','']].map(([p2,bg,ic,t,sm])=>`<button class="mt" data-act="${p2[0]==='!'?p2.slice(1):'mpage'}" data-p="${p2}"><span class="ic" style="--icbg:${bg}">${ic}</span><b>${t}</b>${sm?`<small>${sm}</small>`:''}</button>`).join('')}</div>
     <button class="mlink" data-act="mpage" data-p="set">Réinitialiser les réglages</button>`}
  else if(p==='compte'){b=top('Compte')+(window.CL?CL.page():'<p class="cap">Indisponible hors ligne</p>')}
  else if(p==='events'){b=top('Événements')+`<h2>Événements</h2>`+EVENTS.filter(x=>evState(x)!=='past').sort((a,b)=>new Date(a.s)-new Date(b.s)).map(x=>{const st=evState(x);return `<div class="evc"><i class="sw2" style="--evbg:${x.bg}"></i><div><b>${x.n}</b><small>${x.d}</small></div><em>${st==='live'?`<span data-until="${x.e}">${dur(new Date(x.e)-now())}</span>`:fdate(x.s)}</em></div>`}).join('')}
  else if(p==='themes'){b=top('Thèmes')+`<div class="skins">${SKINS.map(([id,n,pp])=>{const lk=pp&&!hasPass();return `<button class="skin" data-act="${lk?'needpass':'skin'}" data-s="${id}" aria-pressed="${S.set.skin===id}"><span class="pv" style="--pv:${SKPV[id]}"><i></i>${lk?'<u>Pass</u>':''}</span>${n}</button>`}).join('')}</div>`}
  else if(p==='rar'){b=top('Raretés')+`<div class="mlist">${RAR.map((R,i)=>{const d=i===5&&e&&e.fx.divin?R.drop*e.fx.divin:R.drop;return `<div class="set"><span style="display:flex;align-items:center;gap:10px"><i style="width:10px;height:10px;border-radius:50%;background:${R.c}"></i><span><b>${R.n}</b><br><small class="muted">${R.d}</small></span></span><span style="font:600 13px var(--mono);text-align:right">${d} %<br><small class="muted">${POOL[i].filter(c=>own(c.id)).length}/${POOL[i].length}</small></span></div>`}).reverse().join('')}</div><p class="cap" style="text-align:left">Le rap français tombe plus souvent. ↑ = son en hausse cette semaine.</p>`}
  else if(p==='idee'){b=top('Tes idées')+`<h2>Améliore WaxDrop</h2><form class="fbf" id="fbf"><div class="chips">${[['idea','Idée'],['bug','Bug'],['artist','Artiste à ajouter']].map(([k,n])=>`<button type="button" class="chip" data-act="fbk" data-v="${k}" aria-pressed="${fbK===k}">${n}</button>`).join('')}</div><textarea id="fbt" maxlength="600" rows="5" placeholder="${fbK==='artist'?'Nom de l’artiste':fbK==='bug'?'Ce qui ne marche pas, et où':'Ton idée pour le jeu'}" aria-label="Ton message"></textarea><button class="pbtn" type="submit" style="height:48px">Envoyer</button></form><p class="msg" id="fbm"></p><p class="cap" style="text-align:left">On lit tout. Les artistes proposés sont ajoutés automatiquement s’ils existent.</p>`}
  else if(p==='code'){b=top('Code')+`<form class="codef" id="codef"><input id="code" placeholder="CODE" autocomplete="off" aria-label="Code bonus"><button class="pbtn" type="submit" style="height:48px">OK</button></form><p class="msg" id="cmsg"></p>`}
  else if(p==='how'){b=top('Aide')+`<div class="prose"><p><b>Drop</b> · 5 sons, gratuit toutes les ${hasPass()?'5':'10'} min.</p><p><b>Touche le vinyle</b> : il accélère, et change de couleur si la rareté monte.</p><p><b>Collection</b> · un artiste, puis un album, puis ses sons.</p><p><b>Doubles</b> · vends-les à la Bourse ou recycle-les en poussière pour fabriquer un son manquant.</p><p><b>Profil</b> · missions du jour, saison, classement des joueurs.</p></div>`}
  else if(p==='set'){b=top('Réglages')+`<div class="mlist"><div class="set"><b>Mode économie</b><button class="sw" role="switch" aria-checked="${!!S.set.lite}" data-act="lite" aria-label="Mode économie"></button></div><div class="set"><b>Réinitialiser</b><button class="gbtn" style="height:38px${resetArm?';background:#e5484d;color:#fff;border-color:#e5484d':''}" data-act="reset">${resetArm?'Confirmer':'Effacer'}</button></div></div>`}
  sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Menu">${b}</div>`;
}

/* ================= INTERACTIONS ================= */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act],[data-tab]');if(!t)return;
  if(t.dataset.tab){closeMenu();closeStack();closeDD();if(t.dataset.tab==='shop'&&tab==='shop')shopSub='hub';setTab(t.dataset.tab);return}
  const a=t.dataset.act;
  switch(a){
    case 'open':openPack(t.dataset.m);break;
    case 'opengold':openPack('gold');break;
    case 'opendrop':openPack('drop');break;
    case 'openall':openPack(canFree()?'free':'pay',true);break;
    case 'op':opTap();break;
    case 'skipall':if(reveal)showSummary();break;
    case 'done':closeOv();break;
    case 'again':{hardStop();ov.innerHTML='';reveal=null;openPack(canFree()?'free':'pay');break}
    case 'unlocks':showUnlock(0);break;
    case 'unext':showUnlock(+t.dataset.i);break;
    case 'share':share();break;
    case 'copycap':{const cap=t.dataset.cap;try{navigator.clipboard.writeText(cap).then(()=>toast('Légende copiée'),()=>toast(cap))}catch(_){toast(cap)}break}
    case 'spot':closeMenu();spotFlow();break;
    case 'spotoff':S.spot=null;save();closeDD();toast('Spotify déconnecté');render();break;
    case 'claim':claim();break;
    case 'colv':colView=t.dataset.v;try{localStorage.setItem('td-colv',colView)}catch(_){}render();break;
    case 'sonsf':sonsF=t.dataset.v;render();break;
    case 'colg':colG=t.dataset.v;render();break;
    case 'cat':closeMenu();closeDD();stack=[{type:'cat'}];renderStack();break;
    case 'cats':catScope=t.dataset.v;renderStack(true);break;
    case 'catf':catF=!catF;renderStack(true);break;
    case 'catg':catG=t.dataset.v;renderStack(true);break;
    case 'cato':catOwn=t.dataset.v;renderStack(true);break;
    case 'artist':case 'goartist':closeDD();pushPage({type:'artist',k:t.dataset.k});break;
    case 'album':case 'goalbum':closeDD();pushPage({type:'album',k:t.dataset.k});break;
    case 'pop':popPage();break;
    case 'closestack':closeStack();break;
    case 'see':see(t.dataset.id);break;
    case 'seeal':seeAl(t.dataset.k);break;
    case 'seepl':seePl(t.dataset.k);break;
    case 'ddclose':closeDD();break;
    case 'fav':{vitInit();const id=t.dataset.id;const i=S.fav.indexOf(id);if(i>=0)S.fav.splice(i,1);else{if(S.fav.length>=6){toast('Vitrine pleine (6 sons)');break}S.fav.push(id)}save();see(id);if(tab==='profil')render();break}
    case 'vsel':vitInit();S.vi=+t.dataset.i;S.fav=S.vits[S.vi].ids;save();render();break;
    case 'vnew':vitInit();if(S.vits.length<3){S.vits.push({n:'Vitrine '+(S.vits.length+1),ids:[]});S.vi=S.vits.length-1;S.fav=S.vits[S.vi].ids;save();render()}break;
    case 'vedit':vitSheet();break;
    case 'vpick':vitPick();break;
    case 'vadd':{vitInit();const id=t.dataset.id;if(S.fav.length<6&&!S.fav.includes(id)){S.fav.push(id);save()}closeMenu();render();break}
    case 'vsave':{vitInit();const v=(sh.querySelector('#vname')||{}).value;if(v&&v.trim())S.vits[S.vi].n=v.trim().slice(0,18);save();closeMenu();render();break}
    case 'vdel':{vitInit();if(S.vits.length>1){S.vits.splice(S.vi,1);S.vi=0;S.fav=S.vits[0].ids;save()}closeMenu();render();break}
    case 'craft':craft(t.dataset.id);break;
    case 'atelier':atelier();break;
    case 'quote':{const id=t.dataset.id;closeDD();closeStack();setTab('bourse');if(window.ECO)setTimeout(()=>ECO.see(id),60);break}
    case 'atr':atR=+t.dataset.v;atelier();break;
    case 'atc':{const c=C[t.dataset.id];if(c&&S.dust>=DUST_COST[c.r])craft(c.id);else toast('Pas assez de poussière');break}
    case 'events':evSheet();break;
    case 'evx':{const el=t.closest('.evc2');if(el)el.classList.toggle('open');break}
    case 'recy1':recyOne(t.dataset.id);break;
    case 'recy':recySheet();break;
    case 'recyall':recyAll();break;
    case 'soon':toast('Bientôt disponible');break;
    case 'pedit':window.SOC&&SOC.profileSheet();break;
    case 'gofriends':closeMenu();shopSub='echanges';if(window.SOC)SOC.sub='amis';setTab('shop');break;
    case 'invite':if(window.SOC)SOC.share();break;
    case 'shs':shopSub=t.dataset.v;render();break;
    case 'mks':mkSub=t.dataset.v;render();break;
    case 'jts':jetSub=t.dataset.v;render();break;
    case 'bid':bid(t.dataset.l);break;
    case 'sell':sellSheet(t.dataset.id);break;
    case 'sellfrom':closeDD();closeStack();setTab('bourse');if(window.ECO)ECO.see(t.dataset.id);break;
    case 'sp':case 'sd':t.parentElement.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c===t));break;
    case 'list':listCard(t.dataset.id);break;
    
    case 'tget':case 'tgive':tradePick(t);break;
    case 'tgo':tradeGo();break;
    case 'gojet':closeMenu();closeStack();closeDD();tab='shop';shopSub='jetons';jetSub='packs';setTab('shop');break;
    case 'buy':buyFlow(t.dataset.k);break;
    case 'buyok':buyOk(t.dataset.k);break;
    case 'buyc':buyCoins(t.dataset.k);break;
    case 'passoff':case 'passmanage':window.open('https://billing.stripe.com/p/login/3cI9ASgU66yOg1Gbqh5AQ00','_blank','noopener');break;
    case 'gopass':case 'needpass':closeMenu();tab='shop';shopSub='pass';render();if(a==='needpass')toast('Réservé à WaxDrop Pro');break;
    case 'prs':profSub=t.dataset.v;render();break;
    case 'seas':seaSub=t.dataset.v;render();break;
    case 'mall':{const d=day();if(d.cl.all||todayMissions().some(m=>!d.cl[m.k]))break;if(window.ECO)ECO.op('mission_all').then(r=>{if(r){toast('+1 drop · +50 XP');render()}});break}
    case 'dusthelp':if(e.target.closest('.price')){buyCoins('dust');break}dustHelp();break;
    case 'passinfo':closeMenu();closeDD();shopSub='pass';setTab('shop');break;
    case 'seahelp':closeMenu();menuPage='seah';sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Le pass de saison"><div class="grab"></div><div class="shh"><h2>Le pass de saison</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div><ol class="howl"><li><b>Gagne de l’XP</b><span>Chaque drop ouvert, chaque nouveau son, chaque mission et chaque album complété te donnent de l’XP.</span></li><li><b>Monte de palier</b><span>Tous les ${TIER_XP} XP, tu passes au palier suivant. Il y a ${TIERS} paliers jusqu’au ${new Date(SEASON_END).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}.</span></li><li><b>Récupère tes récompenses</b><span>Chaque palier débloque une récompense gratuite : wax coins, poussière, drops ou Drop Or. Avec le Pass, tu en as une deuxième à chaque palier.</span></li></ol><button class="pbtn" data-act="mclose">Compris</button></div>`;break;
    case 'gocoins':closeMenu();closeDD();tab='shop';shopSub='jetons';jetSub='jetons';setTab('shop');break;
    case 'mclaim':mClaim(t.dataset.k);break;
    case 'sclaim':sClaim(t.dataset.i,t.dataset.t);break;
    case 'sall':if(window.ECO){t.disabled=true;const b0={c:S.coins,g:S.gold,m:S.bonus,d:S.dust};ECO.op('season_all').then(r=>{render();if(r)rewardPop({coins:S.coins-b0.c,gold:S.gold-b0.g,maxi:S.bonus-b0.m,dust:S.dust-b0.d},r.n)})}break;
    case 'menu':openMenu(t.dataset.p);break;
    case 'mclose':closeMenu();break;
    case 'mpage':menuPage=t.dataset.p||'';resetArm=false;renderMenu();break;
    case 'fbk':fbK=t.dataset.v;document.querySelectorAll('[data-act="fbk"]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===fbK));{const ta=$('fbt');if(ta)ta.placeholder=fbK==='artist'?'Nom de l’artiste':fbK==='bug'?'Ce qui ne marche pas, et où':'Ton idée pour le jeu'}break;
    case 'askart':{const q=catQ.trim();t.disabled=true;fbSend('artist',q).then(r=>{if(r.error){toast(r.error);t.disabled=false;return}toast(r.status==='exists'?'Déjà dans le jeu, recharge l’app pour le voir':'Merci ! '+q+' arrive dans quelques heures s’il existe');const sg=$('catsug');if(sg)sg.innerHTML=''})}break;
    case 'skin':S.set.skin=t.dataset.s;save();applySkin();renderMenu();break;
    case 'lite':S.set.lite=!S.set.lite;save();applySkin();renderMenu();break;
    case 'reset':if(!resetArm){resetArm=true;renderMenu()}else{resetArm=false;S=fresh();save();closeMenu();closeStack();setTab('ouvrir');if(window.ECO)ECO.sync();toast('Réglages effacés')}break;
  }
});
let fbK='idea';
function fbSend(kind,text){if(!window.CL||!CL.sb)return Promise.resolve({error:'Hors ligne, réessaie plus tard'});return CL.sb.rpc('feedback_send',{p_kind:kind,p_text:text}).then(r=>r.error?{error:/fetch|network/i.test(r.error.message)?'Connexion impossible, réessaie':r.error.message}:r.data,()=>({error:'Connexion impossible, réessaie'}))}
document.addEventListener('submit',e=>{
  if(e.target.id!=='fbf')return;e.preventDefault();
  const ta=$('fbt'),m=$('fbm'),v=ta.value.trim();if(v.length<2){m.textContent='Écris un peu plus';m.style.color='#e5484d';return}
  const bt=e.target.querySelector('button[type=submit]');bt.disabled=true;
  fbSend(fbK,v).then(r=>{bt.disabled=false;if(r.error){m.textContent=r.error;m.style.color='#e5484d';return}
    ta.value='';m.style.color='#30a46c';m.textContent=r.status==='exists'?'Cet artiste est déjà dans le jeu':fbK==='artist'?'Merci ! Il arrive dans quelques heures s’il existe':'Merci, c’est envoyé'})});
document.addEventListener('submit',e=>{
  if(e.target.id!=='codef')return;e.preventDefault();
  const v=$('code').value.trim().toUpperCase(),m=$('cmsg');
  if(window.ECO){ECO.call('code',{v}).then(r=>{if(r.error){m.textContent=r.error;m.style.color='#e5484d'}else{m.textContent=`+${r.coins} wax coins`;m.style.color='#30a46c'}});return}
  m.textContent='Connexion requise';m.style.color='#e5484d';
});
let qT=0;
document.addEventListener('input',e=>{if(e.target.id==='cq'){catQ=e.target.value;clearTimeout(qT);qT=setTimeout(catPager,140)}});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(dd.innerHTML)closeDD();else if(sh.innerHTML)closeMenu();else if(stack.length)popPage();return}
  if(reveal&&!dd.innerHTML&&$('op')&&reveal.stage!=='sum'&&(e.key===' '||e.key==='Enter')){e.preventDefault();opTap();return}
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role=button][data-act=open]')){e.preventDefault();openPack(e.target.dataset.m)}
});
document.addEventListener('pointerdown',e=>{
  const b=e.target.closest('.bb');if(!b)return;const node=BB.nodes.find(x=>x.el===b);if(!node)return;const r=$('bub').getBoundingClientRect();
  BB.drag={n:node,ox:e.clientX-r.left-node.x,oy:e.clientY-r.top-node.y,moved:0,lx:e.clientX,ly:e.clientY,id:e.pointerId,rect:r};try{b.setPointerCapture(e.pointerId)}catch(_){}bKick()});
document.addEventListener('pointermove',e=>{const g=BB.drag;if(g&&e.pointerId===g.id){const n=g.n;n.x=e.clientX-g.rect.left-g.ox;n.y=e.clientY-g.rect.top-g.oy;n.vx=(e.clientX-g.lx)*.6;n.vy=(e.clientY-g.ly)*.6;g.lx=e.clientX;g.ly=e.clientY;g.moved+=Math.abs(n.vx)+Math.abs(n.vy);bKick()}},{passive:true});
function pEnd(e){const g=BB.drag;if(g&&e.pointerId===g.id){BB.drag=null;if(g.moved<8&&e.type==='pointerup'){if(g.n.A)pushPage({type:'artist',k:g.n.A.key});else{colView='liste';try{localStorage.setItem('td-colv','liste')}catch(_){}render();return}}bKick()}}
document.addEventListener('pointerup',pEnd);document.addEventListener('pointercancel',pEnd);
let rz=0;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{stopBub();if($('bub'))$('bub').querySelectorAll('.bb').forEach(x=>x.remove());layout()},160)});
let tickN=0;setInterval(()=>{const ch=(++tickN%2===0)&&mkTick();if(ch&&tab==='shop'&&(shopSub==='encheres'||shopSub==='hub')&&!ov.innerHTML&&!sh.innerHTML)render();else mkPaint();
  document.querySelectorAll('[data-clock]').forEach(el=>{el.textContent=clock(+el.dataset.clock-now())});
  if(tab==='ouvrir'&&!ov.innerHTML&&!sh.innerHTML&&!dd.innerHTML&&!dt.innerHTML){const fc=$('freecap');if(fc&&freeReady()&&fc.querySelector('[data-clock]'))render()}},1000);
setInterval(()=>{document.querySelectorAll('[data-until]').forEach(el=>{el.textContent=dur(new Date(el.dataset.until)-now())})},15000);
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applySkin)}catch(_){}

mkInit();mkTick();render();

/* bouton Ouvrir : le vinyle sort de la pochette */
document.addEventListener('pointerdown',e=>{const t=e.target.closest('.tcen');if(!t)return;const v=t.querySelector('.tcv');if(!v)return;v.classList.remove('tap');void v.offsetWidth;v.classList.add('tap');setTimeout(()=>v.classList.remove('tap'),900)});
