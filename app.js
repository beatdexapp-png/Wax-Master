const SKINS=[['auto','Auto'],['graphite','Graphite'],['encre','Encre'],['aube','Aube'],['foret','Forêt'],['or','Or'],['brume','Brume'],['sable','Sable'],['lilas','Lilas'],['minuit','Minuit',1],['nacre','Nacre',1]];
const SKPV={auto:'linear-gradient(135deg,#e8ebf1 50%,#0e0f12 50%)',graphite:'radial-gradient(circle at 20% 20%,rgba(90,110,190,.8),transparent 60%),radial-gradient(circle at 90% 80%,rgba(40,130,115,.7),transparent 60%),#0e0f12',encre:'radial-gradient(circle at 20% 20%,rgba(70,90,230,.9),transparent 60%),radial-gradient(circle at 90% 80%,rgba(40,170,220,.7),transparent 60%),#0a0e1c',aube:'radial-gradient(circle at 20% 20%,rgba(230,90,110,.85),transparent 60%),radial-gradient(circle at 90% 80%,rgba(240,160,80,.7),transparent 60%),#160d10',foret:'radial-gradient(circle at 20% 20%,rgba(60,170,120,.85),transparent 60%),radial-gradient(circle at 90% 80%,rgba(150,190,80,.6),transparent 60%),#0b120f',or:'radial-gradient(circle at 20% 20%,rgba(210,160,60,.85),transparent 60%),radial-gradient(circle at 90% 80%,rgba(160,110,40,.7),transparent 60%),#12100a',brume:'radial-gradient(circle at 20% 20%,rgba(150,170,255,.9),transparent 60%),radial-gradient(circle at 90% 80%,rgba(255,190,160,.9),transparent 60%),#e8ebf1',sable:'radial-gradient(circle at 20% 20%,rgba(230,150,110,.8),transparent 60%),radial-gradient(circle at 90% 80%,rgba(150,180,140,.8),transparent 60%),#efe7db',lilas:'radial-gradient(circle at 20% 20%,rgba(170,140,255,.9),transparent 60%),radial-gradient(circle at 90% 80%,rgba(255,170,210,.85),transparent 60%),#ebe7f4',minuit:'radial-gradient(circle at 20% 20%,rgba(140,80,255,.8),transparent 60%),radial-gradient(circle at 90% 80%,rgba(255,60,140,.6),transparent 60%),#05040a',nacre:'radial-gradient(circle at 20% 20%,rgba(255,220,240,.95),transparent 60%),radial-gradient(circle at 90% 80%,rgba(200,240,255,.95),transparent 60%),#f6f4f1'};
const COST=100,ALB_BONUS=250,ART_BONUS=500,GOLD_COST=400,DROP_COST=250,DROP_LIMIT=500;
const CODES={UNDERGROUND:500,TRACKDEX:300,ZARMA:200};
const SHOP=[{k:'c500',n:500,p:'1,99 €'},{k:'c1200',n:1200,p:'4,99 €',tag:'+20 %'},{k:'c2600',n:2600,p:'9,99 €',tag:'+30 %'},{k:'c6500',n:6500,p:'19,99 €',tag:'+60 %'}];
const PK={gold:{n:'Maxi Or',p:GOLD_COST,min:1,last:2,b:{},g:'Ultra rare garanti'},nacre:{n:'Maxi Nacre',p:900,min:1,last:3,b:{3:2,4:2,5:2},g:'Légendaire garanti'},diamant:{n:'Maxi Diamant',p:2000,min:2,last:4,b:{4:2,5:2},g:'Mythique garanti'}};
const PASS_PRICE='4,99 € / mois';
const PSEUDOS=['zayn.93','lunatic_k','dalida.wav','mvp_sinna','yaya.prod','nekfan','oz.92i','soso.lune','ritchie.mp3','k.dot.fr','bbf_only','cramé.exe','mel_zer','djadja94','wave.95','rodé.x','ninho.lt','sch.akimbo','jvlivs','nuit.blanche'];
const FRIENDS=['soso.lune','mvp_sinna','oz.92i','wave.95','mel_zer'];
const DUST_GET=[5,10,25,60,150,400],DUST_COST=[40,80,200,500,1200,3000];
const WCOL=['rgba(255,255,255,.78)','#7cc0ff','#d4a3ff','#ffd36b','#ff8fab','#8a6420'];
const SEASON_END='2026-11-30T23:59',SEASON_START='2026-10-01T00:00',TIERS=30,TIER_XP=100;
const MISS=[{k:'open',n:3,t:'Ouvre 3 maxis',c:80,x:60},{k:'newT',n:5,t:'Trouve 5 nouveaux sons',c:100,x:80},{k:'buy',n:1,t:'Achète un son à la Bourse',c:50,x:40},{k:'recycle',n:1,t:'Recycle un double',c:50,x:40},{k:'trade',n:1,t:'Propose un échange',c:60,x:40},{k:'sell',n:1,t:'Vends un son à la Bourse',c:60,x:40}];

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
  const ak=A.k||slug(A.n);const art={key:ak,n:A.n,g:A.g,u:!!A.u,ids:[],albums:[],sgk:null,ini0:A.ini,type:'artiste'};
  (A.al||[]).forEach(al=>{
    const alk=al.k||('al-'+ak+'-'+slug(al.t));const alb={key:alk,t:al.t,a:A.n,ak,g:A.g,y:al.y,ids:[],p:!!al.p,type:'album'};
    const R=rng('st|'+alk);
    al.tr.forEach(x=>{const [t,s0,id0,r0]=typeof x==='string'?[x,undefined]:x;const id=id0||ak+'--'+slug(t);if(C[id])return;
      const s=s0===undefined?Math.max(1,Math.round(al.b*(.45+R()*.9))):s0;const c={id,t,a:A.n,ak,g:A.g,y:al.y,s,al:al.t,alk,r0};C[id]=c;CARDS.push(c);alb.ids.push(id);art.ids.push(id)});
    ALBUMS.push(alb);art.albums.push(alk);RW[alk]=alb;
  });
  if(A.sg&&A.sg.length){const sk='sg-'+ak;const sgl={key:sk,t:'Singles',a:A.n,ak,g:A.g,y:null,ids:[],single:true,type:'album'};
    A.sg.forEach(([t,s,y,from,id0,r0])=>{const id=id0||ak+'--'+slug(t);if(C[id])return;const c={id,t,a:A.n,ak,g:A.g,y,s,al:from||null,alk:sk,r0};C[id]=c;CARDS.push(c);sgl.ids.push(id);art.ids.push(id)});
    art.sgk=sk;RW[sk]=sgl}
  ARTISTS.push(art);RW[ak]=art;
});
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
let tab='ouvrir';try{const t=localStorage.getItem(KEY+'-t8');if(['ouvrir','collection','shop','saison','profil'].includes(t))tab=t}catch(e){}
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
const hasPass=()=>false;
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
function todayMissions(){const R=rng('miss'+today());const rest=MISS.slice(1);const a=rest.splice(Math.floor(R()*rest.length),1)[0],b=rest.splice(Math.floor(R()*rest.length),1)[0];return[MISS[0],a,b]}
const missReady0=()=>{const d=day();return todayMissions().some(m=>!d.cl[m.k]&&d[m.k]>=m.n)};
const seasonReady0=()=>{const t=tierNow();for(let i=1;i<=t;i++){if(!S.sfree.includes(i))return true;if(hasPass()&&!S.sprem.includes(i))return true}return false};
function toast(t){document.querySelectorAll('.toast').forEach(x=>x.remove());const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2400)}
const I=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICON={list:I('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="2.6"/>'),users:I('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.2A5 5 0 0 1 21 19"/>'),pen:I('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),plus:I('<path d="M12 5v14M5 12h14"/>'),cam:I('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),bolt:I('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),sp:I('<circle cx="12" cy="12" r="9"/><path d="M7.5 9.5c3-.9 6.3-.6 9 .9M8 12.6c2.4-.6 4.9-.4 7 .7M8.6 15.5c1.8-.4 3.6-.3 5.2.5"/>'),gift:I('<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8c-1.5-3.5-5-4-5-1.5S12 8 12 8zm0 0c1.5-3.5 5-4 5-1.5S12 8 12 8z"/>'),search:I('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>'),back:I('<path d="m15 5-7 7 7 7"/>'),x:I('<path d="M6 6l12 12M18 6 6 18"/>'),share:I('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'),cal:I('<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),theme:I('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),gem:I('<path d="M12 3 20 12 12 21 4 12z"/>'),gear:I('<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.6M12 18.6v2.6M4.4 4.4l1.9 1.9M17.7 17.7l1.9 1.9M2.8 12h2.6M18.6 12h2.6M4.4 19.6l1.9-1.9M17.7 6.3l1.9-1.9"/>'),help:I('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17.2v.3"/>'),star:I('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),check:I('<path d="m5 12 5 5 9-10"/>'),grid:I('<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>'),bub:I('<circle cx="8.5" cy="9" r="4.5"/><circle cx="17" cy="15" r="3.5"/><circle cx="9.5" cy="18.5" r="2"/>'),recycle:I('<path d="M7 19H4.5a1.5 1.5 0 0 1-1.3-2.2L5 13.5M14 4.3l-1.3-2.2a1.5 1.5 0 0 0-2.6 0L8.3 5.4M17 13.5l1.8 3.3a1.5 1.5 0 0 1-1.3 2.2H11"/><path d="m11 16-2 3 2 3M3 9.5l2.9 1 1-2.9M20.2 7.5l-1 3-3-.9"/>'),play:I('<path d="M7 5v14l11-7z"/>'),pin:I('<path d="M12 17v5M8 3h8l-1 6 3 4H6l3-4z"/>'),swap:I('<path d="M7 7h12l-3-3M17 17H5l3 3"/>'),lock:I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>')};

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
const albBtn=A=>`<button class="it" data-act="album" data-k="${A.key}" aria-label="${esc(A.t)}">${albumHTML(A)}</button>`;

/* ================= PAGER ================= */
function pager(host,items,fn,o){
  if(!host)return;const gap=o.gap??10;const w=host.clientWidth,h=host.clientHeight-24;if(w<=0||h<=0)return;
  if(!items.length){host.innerHTML=`<p class="empty">${o.empty||'Rien ici'}</p>`;return}
  let cols,cw,ch;
  if(o.cellH){cols=o.cols||Math.max(1,Math.floor((w+gap)/((o.minW||320)+gap)));cw=(w-gap*(cols-1))/cols;ch=o.cellH}
  else{cols=Math.max(o.minCols||3,Math.floor((w+gap)/(o.minT+gap)));cw=(w-gap*(cols-1))/cols;ch=cw+(o.extra||0)}
  const rows=Math.max(1,Math.floor((h+gap)/(ch+gap)));const per=cols*rows;const P=Math.ceil(items.length/per);
  host.innerHTML=`<div class="pgt">${Array.from({length:P},()=>`<div class="pg" style="grid-template-columns:repeat(${cols},${cw.toFixed(1)}px);grid-auto-rows:${ch.toFixed(1)}px;gap:${gap}px"></div>`).join('')}</div><div class="pgi">${P>1?(P<=12?Array.from({length:P},(_,i)=>`<i class="${i?'':'on'}"></i>`).join(''):`<span>1 / ${P}</span>`):''}</div>`;
  const pages=host.querySelectorAll('.pg'),done=new Set();
  const fill=i=>{if(i<0||i>=P||done.has(i))return;done.add(i);pages[i].innerHTML=items.slice(i*per,(i+1)*per).map(fn).join('')};
  fill(0);fill(1);
  const tr=host.querySelector('.pgt'),ind=host.querySelector('.pgi');let raf=0,last=0;
  tr.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const i=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));fill(i-1);fill(i);fill(i+1);
    if(P<=12)ind.querySelectorAll('i').forEach((d,k)=>d.classList.toggle('on',k===i));else if(ind.firstChild)ind.firstChild.textContent=`${i+1} / ${P}`})},{passive:true});
  tr.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)<=Math.abs(e.deltaX)||P<2)return;e.preventDefault();const t=performance.now();if(t-last<350)return;last=t;tr.scrollBy({left:Math.sign(e.deltaY)*tr.clientWidth,behavior:'smooth'})},{passive:false});
}

/* ================= VUES ================= */
function vOuvrir(){
  const e=liveEv(),nx=nextEv(),cst=cost(),free=canFree(),can=free||S.coins>=cst;const dp=curDrop();const left=Math.max(0,DROP_LIMIT-(S.drop[dp.w]||0)-((hash('ds'+dp.w)%120)+Math.floor((now()-(dp.w*48*3600e3))/(48*3600e3)*260)));
  const evp=e?`<button class="evp glass" data-act="menu" data-p="events"><i class="ldot"></i><b>${e.n}</b><span data-until="${e.e}">${dur(new Date(e.e)-now())}</span></button>`:nx?`<button class="evp glass" data-act="menu" data-p="events"><b>${nx.n}</b><span>${fdate(nx.s)}</span></button>`:'';
  return `<div class="view v-open">${evp}
   <div class="ofx" aria-hidden="true"><i class="n1">♪</i><i class="n2">♫</i><i class="n3">♪</i><i class="s1"></i><i class="s2"></i><i class="s3"></i></div>
   <div class="mbox" data-act="open" data-m="${free?'free':'pay'}" role="button" tabindex="0" aria-label="Ouvrir un maxi"><div class="maxi"><div class="mv" style="--lc:${e?'#ff5f86':'#c9c3b5'}"></div><div class="ms glass"><b>Track<br>Dex</b><span>Vol. 01</span><em>5 sons</em></div></div></div>
   <div class="obar"><button class="pbtn" data-act="open" data-m="${free?'free':'pay'}" ${can?'':'disabled'}>${free?(S.bonus>0?`Ouvrir · ${S.bonus} offert${S.bonus>1?'s':''}`:'Ouvrir · Gratuit'):`Ouvrir · ${cst} ${coinI}`}</button><button class="gbtn sq" data-act="openall" aria-label="Ouverture express" ${can?'':'disabled'}>${ICON.bolt}</button></div>
   <div class="odeco" aria-hidden="true">${Array.from({length:23},(_,i)=>`<i style="--d:${(i*.137%1).toFixed(2)};--h:${(.25+((i*7)%10)/14).toFixed(2)}"></i>`).join('')}</div>
   <p class="cap" id="freecap">${freeReady()?'Maxi gratuit prêt':`Gratuit dans <b data-clock="${S.freeAt}">${clock(S.freeAt-now())}</b>`}</p>
   <div class="orow">
     <button class="dropc glass" data-act="opendrop" ${S.coins>=DROP_COST&&left>0?'':'disabled'}><span class="dcv" style="background:${esc(dp.A.art)}"></span><span class="dct"><b>Drop numéroté</b><small><i class="ldot"></i><span data-clock="${dp.e}">${clock(dp.e-now())}</span></small></span><span class="dcp">${DROP_COST} ${coinI}</span></button>
     ${S.gold>0?`<button class="goldp" data-act="opengold" aria-label="Ouvrir un Maxi Or">Or ×${S.gold}</button>`:''}
   </div>
  </div>`;
}
function colList(){return ownedArtists().filter(A=>colG==='Tous'||A.g===colG).sort((a,b)=>pct(b.ids)-pct(a.ids)||a.n.localeCompare(b.n))}
function vCollection(){
  const L=colList(),tot=ownedArtists().length;
  return `<div class="view v-col"><div class="vh"><button class="gbtn sq" data-act="colv" data-v="${colView==='bulles'?'liste':'bulles'}" aria-label="${colView==='bulles'?'Voir en liste':'Voir en bulles'}">${colView==='bulles'?ICON.list:ICON.bub}</button>
    <div class="seg glass sm">${['Tous','FR','US','UK','Monde'].map(g=>`<button data-act="colg" data-v="${g}" aria-pressed="${colG===g}">${g}</button>`).join('')}</div>
    <button class="gbtn sq" data-act="recy" aria-label="Recycler les doubles" style="margin-left:auto">${ICON.recycle}</button><button class="gbtn sq" data-act="cat" aria-label="Tout le catalogue">${ICON.search}</button></div>
    <p class="cnt2">${tot} rappeur${tot>1?'s':''} · ${CARDS.filter(c=>own(c.id)).length}/${N} sons · ${dustI}${S.dust}</p>
    ${colView==='bulles'?`<div class="bubw glass" id="bub">${L.length?'':'<p class="empty">Ouvre un maxi pour commencer</p>'}</div>`:`<div class="pgr" id="pgr"></div>`}</div>`;
}
function tickHTML(){mkInit();const L=S.mk.list.filter(l=>!l.mine).slice().sort((a,b)=>Math.abs(chg(b))-Math.abs(chg(a))).slice(0,8);if(!L.length)return '';
  const one=L.map(l=>`<span class="ti${chg(l)>0?' gn':''}"><b>${esc(C[l.cid].t)}</b>${chgHTML(l)}</span>`).join('');return `<div class="tick" aria-hidden="true"><div class="tk">${one}${one}</div></div>`}
function tickPaint(){}
function wsIndex(){mkInit();const L=S.mk.list.filter(l=>!l.mine);if(!L.length)return 0;return Math.round(L.reduce((s,l)=>s+chg(l),0)/L.length*10)/10}
function bigChart(){const R=rng('ws'+Math.floor(now()/3600e3));let v=50,p=[];for(let i=0;i<=24;i++){v=clamp(v+(R()-.42)*14,8,92);p.push(`${(i/24*100).toFixed(1)},${(100-v).toFixed(1)}`)}
  return `<svg class="bch" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,100 ${p.join(' ')} 100,100"/><polyline points="${p.join(' ')}"/></svg>`}
const subHead=(t,x)=>`<div class="vh shd2"><button class="gbtn sq" data-act="shs" data-v="hub" aria-label="Retour">${ICON.back}</button><h2>${t}</h2>${x||''}</div>`;
function vShop(){
  if(shopSub==='encheres')shopSub='cours';
  if(shopSub==='hub'){mkTick();const live=S.mk.list.filter(l=>!l.mine).length,mine=S.mk.list.filter(l=>l.mine).length,ix=window.ECO?ECO.ix:wsIndex(),on=hasPass();
    return `<div class="view v-shop v-hub"><div class="hgrid">
     <button class="hb hb-ws" data-act="shs" data-v="cours">${bigChart()}${tickHTML()}<span class="hbt"><span class="hbk">Achète et vends tes sons</span><b>La Bourse</b><small><i class="ldot"></i>Cours en direct</small></span><span class="wix${ix>0?' gn':ix===0?' z':''}">CAC Son ${ix>0?'▲':ix<0?'▼':'='} ${fr(Math.abs(ix))} %</span></button>
     <div class="hrow">
      <button class="hb hb-tr" data-act="shs" data-v="echanges"><span class="hbi">${ICON.users}</span><span class="hbt"><b>Amis</b><small>${window.SOC&&SOC.pending()?`${SOC.pending()} nouveauté${SOC.pending()>1?'s':''}`:'Échange avec tes amis'}</small></span></button>
      <button class="hb hb-ps" data-act="passinfo"><span class="hbi">${ICON.star}</span><span class="hbt"><b>Pass</b><small>Saison 1 · bientôt</small></span></button>
     </div>
     <button class="hb hb-jt" data-act="shs" data-v="jetons"><span class="fan"><i class="mini"></i><i class="mini gold"></i><i class="mini nacre"></i><i class="mini diam"></i></span><span class="hbt"><b>Packs & jetons</b><small>Maxi Diamant · Mythique garanti</small></span></button>
    </div></div>`}
  let head='',body='';
  if(shopSub==='encheres'){mkTick();const mine=S.mk.list.filter(l=>l.mine).length;const dups=CARDS.filter(c=>(S.owned[c.id]||0)>1).length;const ix=wsIndex();
    head=subHead('Enchères');
    body=`${tickHTML()}<div class="chips">${[['live','Marché'],['mine',`Mes ventes ${mine}/${mkMax()}`],['sell',`Vendre · ${dups}`]].map(([k,n])=>`<button class="chip" data-act="mks" data-v="${k}" aria-pressed="${mkSub===k}">${n}</button>`).join('')}</div><div class="pgr" id="pgr"></div>`}
  else if(shopSub==='echanges'){head=subHead('Amis');body=window.SOC?SOC.body():'<p class="cap">Connexion requise</p>'}
  else if(shopSub==='pass'){const on=hasPass();head=subHead('TrackDex Pass');
    body=`<div class="passc glass"><div class="ph2"><span class="pico">${ICON.star}</span><div><b>TrackDex Pass</b><small>${on?'Actif':PASS_PRICE}</small></div></div>
     <ul class="perks">${['Maxi gratuit toutes les 5 min','+1 maxi offert chaque jour','1 Maxi Or chaque lundi','Pass de saison premium','Thèmes Minuit et Nacre'].map(t=>`<li>${ICON.check}${t}</li>`).join('')}</ul>
     ${on?`<div class="row">${S.passDay!==today()?'<button class="pbtn" data-act="claim">Maxi du jour</button>':'<button class="pbtn" disabled>Récupéré</button>'}<button class="gbtn" data-act="passoff">Résilier</button></div>`:`<button class="pbtn wide" data-act="buy" data-k="pass">S’abonner · ${PASS_PRICE}</button>`}</div><p class="cap">Paiement simulé dans cette démo</p>`}
  else{head=subHead('Packs & jetons');body=`<div class="chips">${[['packs','Packs'],['jetons','Jetons']].map(([k,n])=>`<button class="chip" data-act="jts" data-v="${k}" aria-pressed="${jetSub===k}">${n}</button>`).join('')}</div><div class="pgr" id="pgr"></div>${jetSub==='jetons'?'<p class="cap">Paiement sécurisé bientôt disponible</p>':''}`}
  return `<div class="view v-shop">${head}${body}</div>`;
}
function avHTML(cls){const ph=window.CL&&CL.avatar;const nm=(window.CL&&CL.pseudo)||'Moi';return `<span class="av me ${cls||''}" style="${ph?`--avg:url('${esc(ph)}') center/cover no-repeat,#333`:''}">${ph?'':esc(nm.slice(0,2).toUpperCase())}</span>`}
function vProfil(){
  const t=tierNow();const nm=(window.CL&&CL.pseudo)||'Ton profil';const nf=window.SOC?SOC.friends().length:0,pend=window.SOC?SOC.pending():0;const x=(S.xp||0)%TIER_XP;
  return `<div class="view v-prof"><div class="phero"><button class="avb" data-act="pedit" aria-label="Modifier le profil">${avHTML('tbig')}<i class="ped">${ICON.pen}</i></button><div class="pn"><b>${esc(nm)}</b><span>Palier ${t} · ${score().toLocaleString('fr-FR')} pts</span><span class="plv" style="--p:${t>=TIERS?100:x}%"><i></i></span></div><button class="gbtn sq ghost" data-act="menu" aria-label="Réglages">${ICON.gear}</button></div>
   <div class="pq"><button class="pqa pq-fr" data-act="gofriends"><span class="pqi">${ICON.users}</span><b>Amis</b><small>${nf?nf+' ami'+(nf>1?'s':''):'Aucun'}${pend?' · '+pend+' nouveau'+(pend>1?'x':''):''}</small></button><button class="pqa pq-inv" data-act="invite"><span class="pqi">${ICON.share}</span><b>Inviter</b><small>Partage ton lien</small></button><button class="pqa pq-top" data-act="prs" data-v="${profSub==='top'?'vitrine':'top'}" aria-pressed="${profSub==='top'}"><span class="pqi">${profSub==='top'?ICON.grid:ICON.star}</span><b>${profSub==='top'?'Vitrines':'Classement'}</b><small>${profSub==='top'?'Retour':'Top joueurs'}</small></button></div>
   ${profSub==='top'?`<div class="pgr" id="pgr"></div>`:vVitrine()}</div>`;
}
function vitInit(){if(!Array.isArray(S.vits)||!S.vits.length)S.vits=[{n:'Ma vitrine',ids:(S.fav||[]).slice(0,6)}];S.vits.forEach(v=>{v.ids=(v.ids||[]).filter(id=>C[id]&&own(id)).slice(0,6)});S.vi=Math.min(S.vi|0,S.vits.length-1);S.fav=S.vits[S.vi].ids}
function vVitrine(){vitInit();const pl=ARTISTS.filter(A=>S.ul[A.key]);const al=ALBUMS.filter(A=>S.ul[A.key]).length;const V=S.vits[S.vi];
  return `<div class="kpis3"><div class="k1"><b>${CARDS.filter(c=>own(c.id)).length}</b><span>sons</span></div><div class="k2"><b>${al}</b><span>albums</span></div><div class="k3"><b>${pl.length}</b><span>platines</span></div><div class="k4"><b>${POOL[5].filter(c=>own(c.id)).length}</b><span>divins</span></div></div>
   <div class="vtabs">${S.vits.map((v,k)=>`<button class="chip" data-act="vsel" data-i="${k}" aria-pressed="${k===S.vi}">${esc(v.n)}</button>`).join('')}${S.vits.length<3?`<button class="chip add" data-act="vnew" aria-label="Nouvelle vitrine">+</button>`:''}<button class="chip" data-act="vedit" aria-label="Renommer la vitrine">${ICON.pen}</button></div>
   <div class="pgr vit" id="pgr"></div>
   ${pl.length?`<div class="wall">${pl.map(A=>`<button data-act="seepl" data-k="${A.key}">${plaqueHTML(A)}</button>`).join('')}</div>`:''}`}
const MI={open:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',newT:'<path d="M12 3l2.2 5.6L20 9.3l-4.4 3.9L17 19l-5-3-5 3 1.4-5.8L4 9.3l5.8-.7z"/>',bid:'<path d="M4 17l5-5 4 4 7-8"/><path d="M15 8h5v5"/>',recycle:'<path d="M7 19H4l3-5M17 19h3l-3-5M12 4l-2 3h4z"/><path d="M9 14l3-5 3 5"/>',sell:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',trade:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>'};
function vMissions(){const d=day();const L=todayMissions();const tm=new Date();tm.setHours(24,0,0,0);const done=L.filter(m=>d.cl[m.k]).length;
  return `<div class="mhead"><div><b>Missions du jour</b><small>Nouvelles dans <span data-clock="${+tm}">${clock(+tm-now())}</span></small></div><div class="mbonus${done>=L.length?' ok':''}">${done>=L.length&&!d.cl.all?`<button class="pbtn" data-act="mall" style="height:38px">Bonus · 1 maxi</button>`:`<span>${d.cl.all?ICON.check+'Bonus récupéré':`${done}/${L.length} · bonus 1 maxi`}</span>`}</div></div>
   <div class="mlist3">${L.map((m,ix)=>{const v=Math.min(d[m.k]||0,m.n),ok=v>=m.n,cl=d.cl[m.k];return `<div class="mcard${ok?' ok':''}${cl?' cl':''}" style="--p:${v/m.n*100};--i:${ix}"><span class="mring"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${MI[m.k]||''}</svg></span><div class="mtx"><b>${m.t}</b><small>${v}/${m.n}</small><span class="mrw"><em>+${m.c} ${coinI}</em><em>+${m.x} XP</em></span></div><button class="mbtn" data-act="mclaim" data-k="${m.k}" ${ok&&!cl?'':'disabled'}>${cl?ICON.check:ok?'Prendre':`${Math.round(v/m.n*100)} %`}</button></div>`}).join('')}</div>`}
const rwIcon=r=>r.gold?'<i class="mini gold"></i>':r.maxi?'<i class="mini"></i>':r.coins?coinI:dustI;
const rwShort=r=>r.gold?'Or':r.maxi?`×${r.maxi}`:r.coins?r.coins:r.dust;
function trackHTML(){const t=tierNow();let h='';for(let i=1;i<=TIERS;i++){const {f,p}=seasonRewards(i);const un=i<=t,fc=S.sfree.includes(i),pc=S.sprem.includes(i);
    h+=`<div class="tcol${un?' un':''}${i===t+1?' nx':''}${i%10===0?' tbig':''}"><button class="tcell pr" data-act="sclaim" data-i="${i}" data-t="p" ${un&&!pc&&hasPass()?'':'disabled'} aria-label="Palier ${i} premium">${rwIcon(p)}<b>${rwShort(p)}</b>${pc?'<u>'+ICON.check+'</u>':hasPass()?'':'<u>'+ICON.lock+'</u>'}</button><span class="tnum">${i}</span><button class="tcell${un&&!fc?' ready':''}" data-act="sclaim" data-i="${i}" data-t="f" ${un&&!fc?'':'disabled'} aria-label="Palier ${i}">${rwIcon(f)}<b>${rwShort(f)}</b>${fc?'<u>'+ICON.check+'</u>':''}</button></div>`}
  return h}
function vSaisonTab(){const t=tierNow(),x=(S.xp||0)%TIER_XP;const dotM=missReady(),dotS=seasonReady();
  return `<div class="view v-sea"><div class="shero"><span class="slv2" style="--p:${t>=TIERS?100:x}"><b>${t}</b><small>palier</small></span><div class="sinfo"><span class="skk">Saison 1 · Premiers sillons</span><b>${t>=TIERS?'Saison terminée, bravo':`${TIER_XP-x} XP avant le palier ${t+1}`}</b><span class="pbar" style="--p:${t>=TIERS?100:x}%"><i></i></span><small>Fin dans ${dur(new Date(SEASON_END)-now())}</small></div></div>
   <div class="seg glass">${[['pass','Pass de saison',dotS],['missions','Missions',dotM]].map(([k,n,dot])=>`<button data-act="seas" data-v="${k}" aria-pressed="${seaSub===k}">${n}${dot?'<i class="sdot"></i>':''}</button>`).join('')}</div>
   ${seaSub==='missions'?vMissions():`${(()=>{let n=0,nx=null;for(let i=1;i<=TIERS;i++){if(i<=t&&!S.sfree.includes(i))n++;if(!nx&&i>t)nx=i}const r=nx?seasonRewards(nx).f:null;
     return `<div class="sgrab${n?' on':''}"><div class="sgi">${n?`<span class="sgn">${n}</span>`:ICON.gift}</div><div class="sgt"><b>${n?`${n} récompense${n>1?'s':''} à récupérer`:'Tout est récupéré'}</b><small>${r?`Prochaine : ${rwLabel(r)} au palier ${nx}`:'Saison terminée'}</small></div>${n?`<button class="pbtn" data-act="sall">Tout récupérer</button>`:''}</div>`})()}<div class="trkw"><div class="trkl"><span class="pr">Premium</span><span>Gratuit</span></div><div class="strk" id="trk">${trackHTML()}</div></div>
   <button class="passbn" data-act="passinfo"><span class="pico">${ICON.star}</span><span><b>Pass Premium</b><small>Double récompenses, maxi gratuit toutes les 5 min</small></span><em>Bientôt</em></button>`}</div>`}
function vSaison(){return ''}
const missReady=()=>missReady0()||(todayMissions().every(m=>day().cl[m.k])&&!day().cl.all);
const seasonReady=()=>seasonReady0();
function seasonRewards(i){return{f:i%10===0?{gold:1}:i%3===0?{maxi:1}:i%3===1?{coins:60}:{dust:40},p:i%5===0?{gold:1}:i%2===0?{maxi:2}:{coins:150}}}
const rwLabel=r=>r.gold?`Maxi Or`:r.maxi?`${r.maxi} maxi${r.maxi>1?'s':''}`:r.coins?`${r.coins} ${coinI}`:`${r.dust} ${dustI}`;
function seasonRow(i){const t=tierNow(),{f,p}=seasonRewards(i);const un=i<=t;const fc=S.sfree.includes(i),pc=S.sprem.includes(i);
  return `<div class="srow2${un?' un':''}"><span class="tn">${i}</span><button class="rwb" data-act="sclaim" data-i="${i}" data-t="f" ${un&&!fc?'':'disabled'}>${fc?ICON.check:''}${rwLabel(f)}</button><button class="rwb pr" data-act="sclaim" data-i="${i}" data-t="p" ${un&&!pc&&hasPass()?'':'disabled'}>${pc?ICON.check:hasPass()?'':ICON.lock}${rwLabel(p)}</button></div>`}
function score(){return CARDS.filter(c=>own(c.id)).length*10+ALBUMS.filter(A=>S.ul[A.key]).length*100+ARTISTS.filter(A=>S.ul[A.key]).length*500}
function board(){if(window.CL&&CL.top)return CL.board();const days=Math.max(1,(now()-new Date(SEASON_START))/864e5);const me=score();
  const L=[];L.push({n:'Toi',s:me,me:true});L.sort((a,b)=>b.s-a.s);return L.map((x,i)=>({...x,r:i+1}))}
const boardRow=x=>`<div class="brow${x.me?' me':''}${x.r<=3?' r'+x.r:''}"><span class="rk">${x.r}</span><span class="av" style="--avg:${x.av?`url('${esc(x.av)}') center/cover no-repeat,#333`:`linear-gradient(140deg,hsl(${hash(x.n)%360} 46% 60%),hsl(${(hash(x.n)+40)%360} 44% 34%))`}">${x.av?'':esc(x.n.slice(0,2).toUpperCase())}</span><b>${esc(x.n)}</b><em>${x.s.toLocaleString('fr-FR')}</em></div>`;

/* ===== bulles ===== */
const BB={nodes:[],raf:0,drag:null,calm:0,w:0,h:0};
function initBub(){
  const el=$('bub');if(!el)return;const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;BB.w=w;BB.h=h;
  const list=colList();if(!list.length)return;
  const r0=list.map(A=>14+7*Math.sqrt(A.ids.filter(own).length+2));const area=r0.reduce((a,r)=>a+Math.PI*r*r,0)||1;
  const k=Math.min(1.7,Math.sqrt(.45*w*h/area));
  BB.nodes=list.map((A,i)=>{const r=clamp(r0[i]*k,22,86);const p=pct(A.ids);const b=document.createElement('button');
    b.className='bb'+(S.ul[A.key]?' done':'');b.setAttribute('aria-label',`${A.n}, ${p} %`);
    b.style.cssText=`width:${2*r}px;height:${2*r}px;--avg:${A.avg};--p:${p}`;
    b.innerHTML=`<span><b style="font-size:${Math.max(12,r*.4).toFixed(0)}px">${esc(A.ini)}</b>${r>=34?`<em>${p}%</em>`:''}</span>`;
    el.appendChild(b);const a=i*2.4,d=Math.sqrt(i)*17;
    const nd={el:b,A,r,x:clamp(w/2+Math.cos(a)*d,r,w-r),y:clamp(h/2+Math.sin(a)*d,r,h-r),vx:0,vy:0};b.style.transform=`translate3d(${nd.x-r}px,${nd.y-r}px,0)`;return nd});
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
let coinShown=null,coinRaf=0;function setCoins(){const el=$('coins');if(!el)return;const to=S.coins;if(coinShown===null||S.set.lite||Math.abs(to-coinShown)>100000){coinShown=to;el.innerHTML=`${coinI}${to.toLocaleString('fr-FR')}`;return}if(to===coinShown)return;const from=coinShown,t0=performance.now();coinShown=to;el.classList.toggle('up',to>from);el.classList.toggle('dn',to<from);cancelAnimationFrame(coinRaf);const step=t=>{const k=Math.min(1,(t-t0)/450),v=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));el.innerHTML=`${coinI}${v.toLocaleString('fr-FR')}`;if(k<1)coinRaf=requestAnimationFrame(step);else el.classList.remove('up','dn')};coinRaf=requestAnimationFrame(step)}
function render(){
  stopBub();applySkin();setCoins();
  $('pdot').hidden=!(missReady()||seasonReady());const od=$('odot');if(od)od.hidden=!canFree();const sd=$('shdot');if(sd)sd.hidden=!(window.SOC&&SOC.pending()>0);
  document.querySelectorAll('#tabs button[data-tab]').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false'));
  main.innerHTML=tab==='ouvrir'?vOuvrir():tab==='collection'?vCollection():tab==='shop'?vShop():tab==='saison'?vSaisonTab():vProfil();
  layout();
}
function layout(){
  const h=$('pgr');
  if(tab==='collection'){if($('bub'))initBub();if(h)pager(h,colList(),artistRow,{cellH:66,minW:320,gap:8,empty:'Ouvre un maxi pour commencer'})}
  if(tab==='shop'&&h){if(shopSub==='encheres')mkLayout();else if(shopSub==='echanges'){if(window.SOC)SOC.layout(h)}else if(shopSub==='jetons')pager(h,shopItems(),x=>x,{cellH:jetSub==='packs'?150:188,cols:2,gap:10})}
  if(tab==='profil'&&h){if(profSub==='vitrine'){vitInit();const F=S.fav.map(id=>C[id]);while(F.length<6)F.push(null);pager(h,F,c=>c?tileBtn(c):'<button class="fslot" data-act="vpick">'+ICON.plus+'<span>Ajouter</span></button>',{minT:96,cols:3})}
    else if(profSub==='top')pager(h,board(),boardRow,{cellH:54,minW:320,gap:6})}
  if(tab==='saison'){const tk=$('trk');if(tk){const t=tierNow();const c=tk.children[Math.max(0,t-1)];if(c)tk.scrollLeft=Math.max(0,c.offsetLeft-tk.clientWidth/2+c.clientWidth/2)}}
  if(stack.length)renderStack(true);
}
const TABS=['collection','shop','ouvrir','saison','profil'];
function setTab(t){const d=TABS.indexOf(t)-TABS.indexOf(tab);main.style.setProperty('--dx',(d>0?28:d<0?-28:0)+'px');clearTimeout(setTab.t);setTab.t=setTimeout(()=>main.style.setProperty('--dx','0px'),400);tab=t;try{localStorage.setItem(KEY+'-t8',t)}catch(_){}render()}
function shopItems(){
  if(jetSub==='jetons')return SHOP.map((p,i)=>`<button class="pk glass cpk cpk${i}" data-act="buy" data-k="${p.k}">${i===1?'<span class="rib">Populaire</span>':i===3?'<span class="rib best">Meilleure offre</span>':''}${p.tag?`<em>${p.tag}</em>`:''}<span class="cstack" aria-hidden="true">${Array.from({length:i+2},(_,k)=>`<i style="--k:${k}"></i>`).join('')}<s></s><s></s><s></s></span><b>${p.n.toLocaleString('fr-FR')}</b><small class="cpb">${p.tag?`dont ${Math.round(p.n-p.n/(1+parseInt(p.tag.replace(/\D/g,''))/100)).toLocaleString('fr-FR')} offerts`:'Pour bien démarrer'}</small><span class="price">${p.p}</span></button>`);
  const pk=(k,cls,name,tag,price,act)=>`<button class="pk glass pk-${cls}" data-act="${act||'buyc'}" data-k="${k}">${tag?`<em>${tag}</em>`:''}<span class="mini ${cls}"></span><b>${name}</b><span class="price">${price}</span></button>`;
  return [pk('diamant','diam','Maxi Diamant','Mythique garanti',`${PK.diamant.p.toLocaleString('fr-FR')} ${coinI}`),
    pk('nacre','nacre','Maxi Nacre','Légendaire garanti',`${PK.nacre.p} ${coinI}`),
    pk('gold','gold','Maxi Or','Ultra rare garanti',`${GOLD_COST} ${coinI}`),
    pk('lot5','','5 maxis','−10 %',`450 ${coinI}`),
    `<button class="pk glass" data-act="buyc" data-k="dust"><span class="stack">${dustI}${dustI}</span><b>200 poussière</b><span class="price">300 ${coinI}</span></button>`]}

/* ================= PILE : catalogue → artiste → album ================= */
function pushPage(p){stack.push(p);renderStack()}
function popPage(){stack.pop();renderStack()}
function closeStack(){stack=[];dt.innerHTML=''}
function catResults(){const q=catQ.trim()?slug(catQ):'';const okG=x=>catG==='Tous'||x.g===catG;
  if(catScope==='artistes')return ARTISTS.filter(A=>okG(A)&&(!q||A.q.includes(q))&&(catOwn==='all'||(catOwn==='own')===A.ids.some(own))).sort((a,b)=>a.n.localeCompare(b.n));
  if(catScope==='albums')return ALBUMS.filter(A=>okG(A)&&(!q||A.q.includes(q))&&(catOwn==='all'||(catOwn==='own')===!!S.ul[A.key])).sort((a,b)=>a.a.localeCompare(b.a)||(a.y||0)-(b.y||0));
  return CARDS.filter(c=>okG(c)&&(!q||c.q.includes(q))&&(catOwn==='all'||(catOwn==='own')===own(c.id))).slice().sort((a,b)=>b.r-a.r||a.t.localeCompare(b.t));
}
function catPager(){const h=$('spgr');if(!h)return;const L=catResults();const c=$('catn');if(c)c.textContent=L.length;
  if(catScope==='artistes')pager(h,L,artistCell,{minT:88,extra:30,empty:'Aucun résultat'});
  else if(catScope==='albums')pager(h,L,albBtn,{minT:140,empty:'Aucun résultat'});
  else pager(h,L,tileBtn,{minT:92,empty:'Aucun résultat'})}
function renderStack(keep){
  const p=stack[stack.length-1];if(!p){dt.innerHTML='';return}
  const back=`<button class="gbtn sq" data-act="pop" aria-label="Retour">${stack.length>1?ICON.back:ICON.x}</button>`;
  let h='';
  if(p.type==='cat'){
    h=`<div class="ph">${back}<div class="pn"><b>Catalogue</b><span><span id="catn">0</span> résultats</span></div></div>
     <input class="search glass" id="cq" type="search" placeholder="Rappeur, album ou son" value="${esc(catQ)}" autocomplete="off" aria-label="Rechercher">
     <div class="vh wrap"><div class="seg glass">${[['artistes','Rappeurs'],['albums','Albums'],['titres','Sons']].map(([k,n])=>`<button data-act="cats" data-v="${k}" aria-pressed="${catScope===k}">${n}</button>`).join('')}</div>
      <div class="seg glass sm">${['Tous','FR','US','UK','Monde'].map(g=>`<button data-act="catg" data-v="${g}" aria-pressed="${catG===g}">${g}</button>`).join('')}</div>
      <div class="seg glass sm">${[['all','Tout'],['own','À moi'],['miss','Manque']].map(([k,n])=>`<button data-act="cato" data-v="${k}" aria-pressed="${catOwn===k}">${n}</button>`).join('')}</div></div>
     <div class="pgr" id="spgr"></div>`;
  }else if(p.type==='artist'){const A=RW[p.k];const n=A.ids.filter(own).length,pc=pct(A.ids);
    p.items=[...A.albums.map(k=>RW[k]),...(A.sgk?[RW[A.sgk]]:[])];
    h=`<div class="ph">${back}<span class="av" style="--avg:${esc(A.avg)}">${esc(A.ini)}</span><div class="pn"><b>${esc(A.n)}</b><span>${GEN[A.g]}${A.u?' · underground':''} · ${n}/${A.ids.length}</span></div><button class="ring" data-act="seepl" data-k="${A.key}" style="--p:${pc}" aria-label="Disque de platine"><span>${pc}%</span></button></div>
     <div class="pgr" id="spgr"></div>`;
  }else if(p.type==='album'){const B=RW[p.k];const n=B.ids.filter(own).length;
    h=`<div class="ph">${back}<button class="alth" data-act="seeal" data-k="${B.key}" style="background:${esc(B.art)}" aria-label="Pochette"></button><div class="pn"><b>${esc(B.t)}</b><span>${esc(B.a)}${B.y?' · '+B.y:''} · ${n}/${B.ids.length}${B.p?' · sélection':''}</span></div><span class="ring" style="--p:${pct(B.ids)}"><span>${pct(B.ids)}%</span></span></div>
     <div class="pgr" id="spgr"></div>`;
  }
  if(!keep||!dt.querySelector('.page'))dt.innerHTML=`<div class="scrim" data-act="closestack"></div><div class="page glass">${h}</div>`;
  else dt.querySelector('.page').innerHTML=h;
  if(p.type==='cat')catPager();
  else if(p.type==='artist')pager($('spgr'),p.items,albBtn,{minT:150,empty:'Aucun album'});
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
    let sp=null;if(c.r>=3&&Math.random()<[0,0,0,.6,.85,1][c.r]){const at=c.r-1-(c.r>=4&&Math.random()<.4?1:0);const opts=['scratch','pulse','fake'];if(c.r>=4)opts.push('faceb','blackout');if(at+2<=c.r)opts.push('rewind');if(c.r===5)opts.push('blackout','pulse');sp={at,kind:opts[Math.floor(Math.random()*opts.length)]}}
    return{c,isNew,sp}});
  const secret=!!PK[kind]||(window.SRV?SRV.secret:(kind!=='drop'&&Math.random()<1/40));const gain=window.SRV?SRV.gain:(secret&&kind==='std'?100:0);
  const nn=res.filter(x=>x.isNew).length;const d=day();d.open++;d.newT+=nn;addXP(20+10*nn);
  S.coins+=gain;const ul=checkUnlocks();save();setCoins();
  return{res,i:0,lv:0,ul,gain,stage:'seal',secret,kind,base};
}
function openPack(m,express){
  if(reveal)return;if(!['free','pay','gold','drop','nacre','diamant'].includes(m))m='pay';
  if(!pay(m)){if(m==='pay'||m==='drop'||m==='nacre'||m==='diamant')needCoins((m==='drop'?DROP_COST:PK[m]?PK[m].p:cost())-S.coins);else toast(m==='gold'?'Pas de Maxi Or':'Pas de maxi gratuit');return}
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
}
function hardStop(){A.t.forEach(clearTimeout);A.t=[];A.busy=false;A.fin=null}
function snap(){const op=$('op');if(!op)return;op.classList.add('snap');void op.offsetWidth;requestAnimationFrame(()=>requestAnimationFrame(()=>{const o=$('op');if(o)o.classList.remove('snap')}))}
function kick(zoom){const op=$('op');if(!op)return;op.classList.remove('kick','kz');void op.offsetWidth;op.classList.add('kick');if(zoom)op.classList.add('kz')}
const D=[0,550,700,900,1100,1900];
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
  const R=reveal;hardStop();const sl=PK[R.kind]?PK[R.kind].n:R.kind==='drop'?'Drop numéroté':R.secret?'Édition secrète':'Vol. 01';
  ov.innerHTML=`<div class="ov op lv-0 k-${R.kind}${R.secret||R.kind==='drop'?' secret':''}" id="op" data-act="op" style="--rc:${RAR[0].c}">
    <div class="L blk"></div><div class="L glow"></div><div class="L speed"></div><div class="L grays"><i></i></div><div class="L beam"></div>
    <div class="optop"><div class="lvl" id="lvl">${lvlHTML(0)}</div><button class="skip" data-act="skipall">Passer</button></div>
    <div class="opmid"><div class="stage" id="stage">
      <div class="pl"><div class="bv"><div class="bvx"><div class="bvr">${[0,1,2,3,4,5].map(i=>`<i class="l${i}"></i>`).join('')}<div class="bvl"><b>TRACKDEX</b></div></div></div><div class="bvs"></div></div></div>
      <div class="slv"><b>Track<br>Dex</b><span>${sl}</span></div>
      <div class="stamp" id="stamp"></div><div class="rvc" id="rvc"></div><div class="acw" id="acw"></div><div class="fxl" id="fxl"></div>
    </div></div>
    <div class="eq">${Array.from({length:14},(_,i)=>`<i style="animation-delay:${(-i*.13).toFixed(2)}s;animation-duration:${(.4+(i*37%10)/25).toFixed(2)}s"></i>`).join('')}</div>
    <div class="tray" id="tray"></div><p class="hint" id="oph"></p></div>`;
  R.stage='seal';trayFill();if(R.secret&&R.kind==='std')stamp('Secret',true);
  run(260,unwrap);
}
function opTap(){
  const R=reveal;if(!R||R.stage==='sum'||!$('op'))return;
  if(A.busy){snap();finish(true);return}
  if(R.stage==='seal')unwrap();
  else if(R.stage==='spin'){if(R.lv<R.res[R.i].c.r)levelUp();else revealCard()}
  else if(R.stage==='shown')nextCard();
}
function unwrap(){const R=reveal;R.stage='spin';R.i=0;R.lv=0;stamp('');$('op').classList.add('play');hint('');trayFill();run(850,()=>hint('Touche le vinyle'))}
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
  R.lv=to;hint('');const op=$('op');if(sp!=='scratch'&&sp!=='fake')kick(true);
  const fin=()=>{op.classList.remove('shake','scr','rw','fake','fb','go4','go5','pulse','bo');applyLevel(to,false);if(sp==='rewind')stamp('Double',false);hint('Touche')};
  if(!sp){applyLevel(to,true);run(D[to],fin);return}
  if(sp==='scratch'){op.classList.add('scr');stamp('Scratch',true);after(700,()=>{op.classList.remove('scr');kick(true);applyLevel(to,true)});run(700+D[to],fin)}
  else if(sp==='rewind'){op.classList.add('rw');stamp('Rewind',true);after(850,()=>{op.classList.remove('rw');applyLevel(to,true)});run(850+D[to],fin)}
  else if(sp==='fake'){op.classList.add('fake');stamp('',false);after(1000,()=>stamp('Encore',true));after(1350,()=>{op.classList.remove('fake');kick(true);applyLevel(to,true)});run(1350+D[to],fin)}
  else if(sp==='pulse'){op.classList.add('pulse');stamp('',false);buzz(20);after(1150,()=>{op.classList.remove('pulse');kick(true);applyLevel(to,true)});run(1150+D[to],fin)}
  else if(sp==='blackout'){op.classList.add('bo');stamp('',false);after(700,()=>buzz(15));after(1350,()=>{op.classList.remove('bo');flash('#fff');kick(true);applyLevel(to,true)});run(1350+D[to],fin)}
  else{op.classList.add('fb');stamp('Face B',true);after(350,()=>applyLevel(to,true));after(960,()=>op.classList.remove('fb'));run(Math.max(980,350+D[to]),fin)}
}
function waveBars(c){const R=rng('wb'+c.id);let s='';for(let k=0;k<26;k++){const v=.2+.8*Math.abs(Math.sin(k*.43+R()*2))*(.5+.5*R());s+=`<i style="--h:${v.toFixed(2)};--d:-${(R()*.8).toFixed(2)}s;--u:${(.5+R()*.4).toFixed(2)}s"></i>`}return s}
function sqHTML(x){const c=x.c,B=c.alk&&RW[c.alk];const ser=S.ser[c.id];
  return `<div class="rsq${c.r===5?' dv':''}" style="--art:${B&&B.art||c.bg};--wc:${WCOL[c.r]};--rc:${RAR[c.r].c}"><div class="sqa"></div><div class="sqw">${waveBars(c)}</div><div class="sqt"><span class="sqr"><i></i>${RAR[c.r].n}</span><b>${esc(c.t)}</b><span>${esc(c.a)}</span></div>${ser?`<em class="sn">#${String(ser).padStart(3,'0')}</em>`:''}</div>`}
function crackSVG(){const R=Math.random;let d='';for(let k=0;k<7;k++){const a=k/7*Math.PI*2+R()*.5;let x=50,y=50,r=0;d+=`M50 50`;while(r<48){r+=8+R()*9;const b=a+(R()-.5)*.6;x=50+Math.cos(b)*Math.min(r,48);y=50+Math.sin(b)*Math.min(r,48);d+=`L${x.toFixed(1)} ${y.toFixed(1)}`}}
  return `<svg class="crk" viewBox="0 0 100 100" aria-hidden="true"><path d="${d}"/></svg>`}
function shatter(){const op=$('op');if(!op)return;const pl=op.querySelector('.pl'),bvr=op.querySelector('.bv .bvr');if(!pl||!bvr)return;const inner=bvr.innerHTML;const n=S.set.lite?6:9;let h='';
  for(let k=0;k<n;k++){const a0=k/n*360+(Math.random()-.5)*14,a1=(k+1)/n*360+(Math.random()-.5)*14,mid=(a0+a1)/2*Math.PI/180;const P=a=>{const t=a*Math.PI/180;return `${(50+Math.cos(t)*75).toFixed(1)}% ${(50+Math.sin(t)*75).toFixed(1)}%`};
    const dist=40+Math.random()*30;h+=`<div class="shd" style="clip-path:polygon(50% 50%,${P(a0)},${P((a0+a1)/2)},${P(a1)});--x:${(Math.cos(mid)*dist).toFixed(1)}cqw;--y:${(Math.sin(mid)*dist+10).toFixed(1)}cqw;--r:${((Math.random()-.5)*160).toFixed(0)}deg"><div class="bvr">${inner}</div></div>`}
  const old=pl.querySelector('.shards');if(old)old.remove();const d=document.createElement('div');d.className='shards';d.innerHTML=h;pl.appendChild(d);op.classList.add('brk')}
const acHTML=(B,x,b,N,full)=>`<div class="acp${full?' full':''}" id="acp"><span class="acv" style="background:${esc(B.art)}"><i class="gh" style="--rc:${RAR[x.c.r].c}"></i></span><span class="acm"><b>${esc(B.t)}</b><span class="acb"><i id="acbi" style="width:${b/N*100}%"></i></span></span><em><span id="acn">${b}</span>/${N}</em></div>`;
function revealCard(){
  const R=reveal,x=R.res[R.i],r=x.c.r;R.stage='shown';hint('');stamp('',false);
  const op=$('op');const brk=!!x.isNew;
  op.classList.add('rush');kick(true);
  const show=()=>{const o=$('op');if(!o)return;o.classList.remove('rush','crack');o.classList.add('out');const box=$('rvc');
    if(box&&!box.firstChild){box.innerHTML=`<div class="rvw"><span class="tag${x.isNew?'':' dup'}">${x.isNew?'Nouveau':'Double'}</span>${sqHTML(x)}</div>`;const sq=box.querySelector('.rsq');if(sq&&A.busy)sq.classList.add('em')}trayFill()};
  const TS=brk?980:480;
  if(brk){after(430,()=>{op.classList.add('crack');const pl=op.querySelector('.pl');if(pl&&!pl.querySelector('.crk'))pl.insertAdjacentHTML('beforeend',crackSVG())});
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
  const R=reveal;const w=$('rvc').querySelector('.rvw');if(w){w.classList.remove('pop','done');w.classList.add('fly')}const ap=$('acp');if(ap)ap.classList.add('away');
  run(230,()=>{const box=$('rvc');if(box)box.innerHTML='';const aw=$('acw');if(aw)aw.innerHTML='';stamp('',false);const o_=$('op');if(o_){o_.classList.remove('brk','crack','rush');o_.querySelectorAll('.shards,.crk').forEach(e=>e.remove())}
    if(R.i+1>=R.res.length){showSummary();return}
    R.i++;R.lv=0;R.stage='spin';const op=$('op');op.classList.remove('out');applyLevel(0,false);trayFill();hint('Touche')});
}
function showSummary(){
  hardStop();const R=reveal;if(!R)return;R.stage='sum';const nn=R.res.filter(x=>x.isNew).length;
  const again=canFree()||S.coins>=cost();
  ov.innerHTML=`<div class="ov sumv"><h2>${nn} nouveau${nn>1?'x':''}</h2>${R.gain?`<p class="gain">+${R.gain} ${coinI}</p>`:''}
    <div class="sumg${R.res.length<5?' s3':''}">${R.res.map((x,k)=>`<button class="it" style="animation-delay:${k*.06}s" data-act="see" data-id="${x.c.id}"><span class="tag${x.isNew?'':' dup'}">${x.isNew?'Nouveau':'Double'}</span>${tileHTML(x.c,{nocount:1,lock:false})}</button>`).join('')}</div>
    <div class="row">${R.ul.length?`<button class="pbtn" data-act="unlocks">${R.ul.length} récompense${R.ul.length>1?'s':''}</button>`:`<button class="pbtn" data-act="done">Continuer</button>${again?'<button class="gbtn" data-act="again">Encore</button>':''}`}<button class="gbtn sq" data-act="share" aria-label="Partager">${ICON.share}</button></div></div>`;
}
function showUnlock(i){
  hardStop();const R=reveal;if(!R)return;const x=R.ul[i];if(!x){closeOv();return}
  ov.innerHTML=`<div class="ov op ul sumv raysOn" id="op" style="--rc:${x.type==='album'?'#e9c46a':'#dfe5ec'}"><div class="L glow" style="opacity:.4"></div><div class="L grays"><i></i></div>
   <p class="hint">${x.type==='album'?'Album complété':'Disque de platine'}</p><div class="uw">${rewardHTML(x)}</div><h2 style="text-align:center">${esc(x.type==='album'?x.t:x.n)}</h2>
   <p class="gain">+${x.type==='album'?ALB_BONUS:ART_BONUS} ${coinI}</p><button class="pbtn" data-act="unext" data-i="${i+1}">${i+1<R.ul.length?'Suivante':'Continuer'}</button></div>`;
}
function closeOv(){hardStop();ov.innerHTML='';reveal=null;render()}

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
      if(l.mine){if(l.lead){S.coins+=l.cur;notes.push(`${c.t} vendu ${l.cur} jetons`)}else{S.owned[l.cid]=(S.owned[l.cid]||0)+1;notes.push(`${c.t} invendu, rendu`)}}
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
  if(S.coins<nb){toast('Pas assez de jetons');return}S.coins-=nb;hp(l,nb);l.cur=nb;l.lead='me';l.myBid=nb;l.bids++;day().bid++;
  if(l.ends-now()<30e3)l.ends=now()+30e3;save();setCoins();mkPaint();toast('Tu es en tête')}
function sellSheet(id){const c=C[id];if(!c||(S.owned[id]||0)<2)return;const V=valOf(c);const prices=[Math.round(V*.4),Math.round(V*.7),V];
  menuPage='sell';sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Vendre"><div class="grab"></div><div class="shh"><h2>Vendre</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <div class="sellh"><div class="sth">${tileHTML(c,{nocount:1})}</div><div><b>${esc(c.t)}</b><small>${esc(c.a)} · ${RAR[c.r].n}</small><small>Tu en as ${S.owned[id]}</small></div></div>
   <span class="lbl">Prix de départ</span><div class="chips">${prices.map((p,i)=>`<button class="chip" data-act="sp" data-v="${p}" aria-pressed="${i===1}">${p} jetons</button>`).join('')}</div>
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
function mClaim(k){const d=day();const m=MISS.find(x=>x.k===k);if(!m||d.cl[k]||(d[k]||0)<m.n)return;d.cl[k]=1;S.coins+=m.c;addXP(m.x);save();toast(`+${m.c} jetons · +${m.x} XP`);render()}
function giveR(r){if(r.gold)S.gold+=r.gold;if(r.maxi)S.bonus+=r.maxi;if(r.coins)S.coins+=r.coins;if(r.dust)S.dust+=r.dust}
function sClaim(i,t){i=+i;if(i>tierNow())return;const {f,p}=seasonRewards(i);
  if(t==='f'&&!S.sfree.includes(i)){S.sfree.push(i);giveR(f)}else if(t==='p'&&hasPass()&&!S.sprem.includes(i)){S.sprem.push(i);giveR(p)}else return;save();toast('Récompense ajoutée');render()}

/* ================= CALQUES ================= */
function closeDD(){dd.innerHTML=''}
function needCoins(miss){miss=Math.max(1,miss|0);closeMenu();menuPage='need';
  const best=SHOP.find(p=>p.n>=miss)||SHOP[SHOP.length-1];
  sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Pas assez de jetons"><div class="grab"></div><div class="shh"><h2>Il te manque ${miss.toLocaleString('fr-FR')} jetons</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <div class="offers">${SHOP.map(p=>`<button class="offer${p===best?' best':''}" data-act="buy" data-k="${p.k}">${p===best?'<em>Conseillé</em>':p.tag?`<em>${p.tag}</em>`:''}<span class="stack">${coinI}${coinI}${coinI}</span><b>${p.n.toLocaleString('fr-FR')}</b><span class="price">${p.p}</span></button>`).join('')}</div>
   <p class="cap" style="text-align:left">${freeReady()||S.bonus>0?'Tu as un maxi gratuit à ouvrir.':`Prochain maxi gratuit dans <b data-clock="${S.freeAt}">${clock(S.freeAt-now())}</b>.`} Les missions et la saison donnent aussi des jetons.</p>
   <button class="gbtn" data-act="gocoins">Voir toutes les offres</button></div>`}
function passSheet(){closeMenu();menuPage='pass';
  sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass passsh" role="dialog" aria-label="Pass Premium"><div class="grab"></div><div class="shh"><h2>Pass Premium</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <ul class="perks">${['Une 2e récompense à chaque palier de la saison','Maxi gratuit toutes les 5 min au lieu de 10','+1 maxi offert chaque jour','1 Maxi Or chaque lundi','Thèmes Minuit et Nacre'].map(t=>`<li>${ICON.check}${t}</li>`).join('')}</ul>
   <button class="pbtn" data-act="buy" data-k="pass">${PASS_PRICE} · bientôt</button></div>`}
function vitSheet(){vitInit();closeMenu();menuPage='vit';const V=S.vits[S.vi];
  sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Vitrine"><div class="grab"></div><div class="shh"><h2>Vitrine</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   <label class="lbl" for="vname">Nom</label><input class="tin" id="vname" maxlength="18" value="${esc(V.n)}">
   <div class="row"><button class="pbtn" data-act="vsave">Enregistrer</button>${S.vits.length>1?'<button class="gbtn" data-act="vdel">Supprimer</button>':''}</div></div>`}
function vitPick(){vitInit();closeMenu();menuPage='vpick';const L=CARDS.filter(c=>own(c.id)&&!S.fav.includes(c.id)).sort((a,b)=>b.r-a.r).slice(0,120);
  sh.innerHTML=`<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Ajouter à la vitrine"><div class="grab"></div><div class="shh"><h2>Ajouter un son</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">${ICON.x}</button></div>
   ${L.length?`<div class="pickg">${L.map(c=>`<button data-act="vadd" data-id="${c.id}" aria-label="${esc(c.t)}">${tileHTML(c,{nocount:1})}</button>`).join('')}</div>`:'<p class="muted">Ouvre des maxis pour remplir ta vitrine</p>'}</div>`}
function popHTML(inner){return `<div class="scrim" data-act="ddclose"></div><div class="pop">${inner}</div>`}
function see(id){const c=C[id];if(!c)return;const n=S.owned[id]||0;const fav=S.fav.includes(id);
  const acts=reveal?'':`<div class="row"><a class="gbtn" href="https://open.spotify.com/search/${encodeURIComponent(c.t+' '+c.a)}" target="_blank" rel="noopener">${ICON.play}Écouter</a><button class="gbtn" data-act="goartist" data-k="${c.ak}">${esc(c.a)}</button>${c.alk&&!RW[c.alk].single?`<button class="gbtn" data-act="goalbum" data-k="${c.alk}">Album</button>`:''}</div>
   <div class="row">${n?`<button class="gbtn" data-act="fav" data-id="${id}">${ICON.pin}${fav?'Retirer':'Mettre en vitrine'}</button>`:`<button class="gbtn" data-act="craft" data-id="${id}" ${S.dust>=DUST_COST[c.r]?'':'disabled'}>Fabriquer · ${DUST_COST[c.r]} ${dustI}</button>`}${n>1?`<button class="gbtn" data-act="sellfrom" data-id="${id}">Vendre</button><button class="gbtn" data-act="recy1" data-id="${id}">${ICON.recycle}+${DUST_GET[c.r]}</button>`:''}</div>`;
  dd.innerHTML=popHTML(`<div class="big">${tileHTML(c,{nocount:1})}</div><div class="info glass" style="--rc:${RAR[c.r].c}"><span><i></i>${RAR[c.r].n}</span><span>${fmtS(c.s)}</span>${c.y?`<span>${c.y}</span>`:''}<span>×${n}</span>${TREND.has(id)?'<span class="upt">↑ En hausse</span>':''}</div><p class="cap">${esc(c.al||'Single')}</p>${acts}`)}
function seeAl(k){const B=RW[k];if(!B)return;
  dd.innerHTML=popHTML(`<div class="big shine">${albumHTML(B)}</div><div class="trk glass">${B.ids.slice(0,9).map(id=>{const c=C[id];return `<div class="${own(id)?'':'no'}" style="--rc:${RAR[c.r].c}"><i></i><span>${esc(c.t)}</span><em>${own(id)?'✓':''}</em></div>`}).join('')}${B.ids.length>9?`<div><span class="muted">+ ${B.ids.length-9} autres</span></div>`:''}</div>
   <p class="cap">${B.single?'Singles':S.ul[k]?'Complété':`+${ALB_BONUS} jetons à la clé`}</p>`)}
function seePl(k){const A=RW[k];if(!A)return;
  dd.innerHTML=popHTML(`<div class="big">${plaqueHTML(A)}</div><div class="info glass"><span>${A.ids.filter(own).length}/${A.ids.length} sons</span><span>${S.ul[k]?'Obtenu':`+${ART_BONUS} jetons`}</span></div>`)}
function share(){const R=reveal;if(!R)return;const b=R.res.slice().sort((a,b)=>b.c.r-a.c.r)[0].c;const cap=`J'ai tiré ${b.t} de ${b.a} (${RAR[b.r].n}) sur TrackDex #trackdex #rap`;
  dd.innerHTML=popHTML(`<div class="story" style="--rc:${RAR[b.r].c}"><p>TrackDex</p><div class="sc">${tileHTML(b,{nocount:1,lock:false})}</div><div><h3>${RAR[b.r].n}</h3><p style="margin-top:4px">${esc(b.a)}</p></div></div><div class="row"><button class="pbtn" data-act="copycap" data-cap="${esc(cap)}">Copier la légende</button></div>`)}
function buyFlow(k){
  const item=k==='pass'?{n:'TrackDex Pass',p:PASS_PRICE}:k==='starter'?{n:'Pack Starter',p:'2,99 €'}:(()=>{const s=SHOP.find(x=>x.k===k);return{n:`${s.n.toLocaleString('fr-FR')} jetons`,p:s.p}})();
  dd.innerHTML=popHTML(`<div class="card2 glass"><span class="lbl">Paiement · démo</span><h2>${item.n}</h2><p class="price2">${item.p}</p><p class="cap">Aucun paiement réel ici. Dans l’app, le paiement passera par l’App Store, Google Play ou Stripe.</p><div class="row"><button class="gbtn" data-act="ddclose">Annuler</button><button class="pbtn" data-act="buyok" data-k="${k}">Confirmer</button></div></div>`)}
function buyOk(k){
  if(k==='pass'){S.pass={on:true,since:today()};toast('TrackDex Pass activé')}
  else if(k==='starter'){if(S.codes._starter){toast('Déjà acheté');closeDD();return}S.codes._starter=1;S.bonus+=3;S.gold+=1;S.coins+=300;toast('Starter ajouté')}
  else{const s=SHOP.find(x=>x.k===k);if(s){S.coins+=s.n;toast(`+${s.n.toLocaleString('fr-FR')} jetons`)}}
  save();closeDD();render()}
function buyCoins(k){if(k==='nacre'||k==='diamant'){if(S.coins<PK[k].p){needCoins(PK[k].p-S.coins);return}openPack(k);return}const P={gold:GOLD_COST,lot5:450,dust:300}[k];if(S.coins<P){needCoins(P-S.coins);return}S.coins-=P;
  if(k==='gold'){S.gold++;toast('Maxi Or ajouté')}else if(k==='lot5'){S.bonus+=5;toast('5 maxis ajoutés')}else{S.dust+=200;toast('+200 poussière')}save();render()}
function claim(){if(!hasPass()||S.passDay===today())return;S.passDay=today();S.bonus++;if(new Date().getDay()===1)S.gold++;save();toast(new Date().getDay()===1?'+1 maxi et 1 Maxi Or':'+1 maxi');render()}
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
  if(!p){const sk=SKINS.find(s=>s[0]===S.set.skin);
    b=top('')+`<div class="mlist">${mi('compte','#30a46c',ICON.check,'Compte',window.CL&&CL.user?(CL.pseudo||'Connecté'):'Sauvegarde en ligne')}${mi('events','#d6336c',ICON.cal,'Événements',e?'En cours':'')}${mi('!cat','#2b8a3e',ICON.search,'Catalogue',`${ARTISTS.length} rappeurs`)}${mi('themes','#5b6cff',ICON.theme,'Thèmes',sk?sk[1]:'')}${mi('rar','#e9a23b',ICON.gem,'Raretés','')}${mi('code','#ff7a3d',ICON.gift,'Code','')}${mi('how','#3a8dde',ICON.help,'Aide','')}${mi('set','#7c8494',ICON.gear,'Réglages','')}</div>`}
  else if(p==='compte'){b=top('Compte')+(window.CL?CL.page():'<p class="cap">Indisponible hors ligne</p>')}
  else if(p==='events'){b=top('Événements')+`<h2>Événements</h2>`+EVENTS.filter(x=>evState(x)!=='past').sort((a,b)=>new Date(a.s)-new Date(b.s)).map(x=>{const st=evState(x);return `<div class="evc"><i class="sw2" style="--evbg:${x.bg}"></i><div><b>${x.n}</b><small>${x.d}</small></div><em>${st==='live'?`<span data-until="${x.e}">${dur(new Date(x.e)-now())}</span>`:fdate(x.s)}</em></div>`}).join('')}
  else if(p==='themes'){b=top('Thèmes')+`<div class="skins">${SKINS.map(([id,n,pp])=>{const lk=pp&&!hasPass();return `<button class="skin" data-act="${lk?'needpass':'skin'}" data-s="${id}" aria-pressed="${S.set.skin===id}"><span class="pv" style="--pv:${SKPV[id]}"><i></i>${lk?'<u>Pass</u>':''}</span>${n}</button>`}).join('')}</div>`}
  else if(p==='rar'){b=top('Raretés')+`<div class="mlist">${RAR.map((R,i)=>{const d=i===5&&e&&e.fx.divin?R.drop*e.fx.divin:R.drop;return `<div class="set"><span style="display:flex;align-items:center;gap:10px"><i style="width:10px;height:10px;border-radius:50%;background:${R.c}"></i><span><b>${R.n}</b><br><small class="muted">${R.d}</small></span></span><span style="font:600 13px var(--mono);text-align:right">${d} %<br><small class="muted">${POOL[i].filter(c=>own(c.id)).length}/${POOL[i].length}</small></span></div>`}).reverse().join('')}</div><p class="cap" style="text-align:left">Le rap français tombe plus souvent. ↑ = son en hausse cette semaine.</p>`}
  else if(p==='code'){b=top('Code')+`<form class="codef" id="codef"><input id="code" placeholder="CODE" autocomplete="off" aria-label="Code bonus"><button class="pbtn" type="submit" style="height:48px">OK</button></form><p class="msg" id="cmsg"></p>`}
  else if(p==='how'){b=top('Aide')+`<div class="prose"><p><b>Maxi</b> · 5 sons, gratuit toutes les ${hasPass()?'5':'10'} min.</p><p><b>Touche le vinyle</b> : il accélère, et change de couleur si la rareté monte.</p><p><b>Collection</b> · un rappeur, puis un album, puis ses sons.</p><p><b>Doubles</b> · vends-les à la Bourse ou recycle-les en poussière pour fabriquer un son manquant.</p><p><b>Profil</b> · missions du jour, saison, classement des joueurs.</p></div>`}
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
    case 'colv':colView=t.dataset.v;render();break;
    case 'colg':colG=t.dataset.v;render();break;
    case 'cat':closeMenu();closeDD();stack=[{type:'cat'}];renderStack();break;
    case 'cats':catScope=t.dataset.v;renderStack(true);break;
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
    case 'sellfrom':closeDD();closeStack();shopSub='cours';setTab('shop');if(window.ECO)ECO.see(t.dataset.id);break;
    case 'sp':case 'sd':t.parentElement.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c===t));break;
    case 'list':listCard(t.dataset.id);break;
    
    case 'tget':case 'tgive':tradePick(t);break;
    case 'tgo':tradeGo();break;
    case 'gojet':closeMenu();closeStack();closeDD();tab='shop';shopSub='jetons';jetSub='packs';setTab('shop');break;
    case 'buy':toast('Paiement bientôt disponible');break;
    case 'buyok':buyOk(t.dataset.k);break;
    case 'buyc':buyCoins(t.dataset.k);break;
    case 'passoff':S.pass=null;applySkin();save();toast('Pass résilié');render();break;
    case 'gopass':case 'needpass':closeMenu();tab='shop';shopSub='pass';render();if(a==='needpass')toast('Réservé au TrackDex Pass');break;
    case 'prs':profSub=t.dataset.v;render();break;
    case 'seas':seaSub=t.dataset.v;render();break;
    case 'mall':{const d=day();if(d.cl.all||todayMissions().some(m=>!d.cl[m.k]))break;if(window.ECO)ECO.op('mission_all').then(r=>{if(r){toast('+1 maxi · +50 XP');render()}});break}
    case 'passinfo':passSheet();break;
    case 'gocoins':closeMenu();closeDD();tab='shop';shopSub='jetons';jetSub='jetons';setTab('shop');break;
    case 'mclaim':mClaim(t.dataset.k);break;
    case 'sclaim':sClaim(t.dataset.i,t.dataset.t);break;
    case 'sall':if(window.ECO){t.disabled=true;ECO.op('season_all').then(r=>{if(r){toast(`${r.n} récompense${r.n>1?'s':''} ajoutée${r.n>1?'s':''}`)}render()})}break;
    case 'menu':openMenu(t.dataset.p);break;
    case 'mclose':closeMenu();break;
    case 'mpage':menuPage=t.dataset.p||'';resetArm=false;renderMenu();break;
    case 'skin':S.set.skin=t.dataset.s;save();applySkin();renderMenu();break;
    case 'lite':S.set.lite=!S.set.lite;save();applySkin();renderMenu();break;
    case 'reset':if(!resetArm){resetArm=true;renderMenu()}else{resetArm=false;S=fresh();save();closeMenu();closeStack();setTab('ouvrir');if(window.ECO)ECO.sync();toast('Réglages effacés')}break;
  }
});
document.addEventListener('submit',e=>{
  if(e.target.id!=='codef')return;e.preventDefault();
  const v=$('code').value.trim().toUpperCase(),m=$('cmsg');
  if(window.ECO){ECO.call('code',{v}).then(r=>{if(r.error){m.textContent=r.error;m.style.color='#e5484d'}else{m.textContent=`+${r.coins} jetons`;m.style.color='#30a46c'}});return}
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
function pEnd(e){const g=BB.drag;if(g&&e.pointerId===g.id){BB.drag=null;if(g.moved<8&&e.type==='pointerup')pushPage({type:'artist',k:g.n.A.key});bKick()}}
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
