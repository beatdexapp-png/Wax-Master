/* TrackDex : économie gérée par le serveur (jetons, cartes, maxis) et Bourse des cours */
(function(){
  if(!window.CL||!CL.sb)return;
  var sb=CL.sb;
  var ECO=window.ECO={ix:0,busy:false};
  var B={sub:'mkt',f:'hot',q:'',list:null,pf:null,meta:{buys:5,sells:20},t:0,load:false};

  function quiet(){return !sh.innerHTML&&!ov.innerHTML&&!dd.innerHTML&&!reveal}
  function fresh0(){return{d:today(),open:0,newT:0,bid:0,recycle:0,trade:0,sell:0,buy:0,bsell:0,cl:{}}}
  ECO.apply=function(w){
    if(!w)return;
    S.coins=w.coins;S.gold=w.gold;S.bonus=w.bonus;S.dust=w.dust;
    var o={};for(var k in (w.owned||{}))if(C[k])o[k]=w.owned[k];S.owned=o;
    S.freeAt=+new Date(w.free_at)||0;S.xp=w.sxp||0;S.passUntil=w.pass_until?+new Date(w.pass_until):0;
    var cl=w.claims||{};S.ul=Object.assign({},cl.ul||{});S.sfree=(cl.sf||[]).slice();S.sprem=(cl.sp||[]).slice();S.codes=Object.assign({},cl.codes||{});
    var d=w.day||{};S.day=d.d===today()?Object.assign(fresh0(),d,{cl:Object.assign({},d.cl||{})}):fresh0();
    save();setCoins();
  };
  /* appel brut : renvoie {error} ou les données */
  ECO.call=async function(op,a){
    if(!CL.user)return{error:'Connexion requise'};
    var r;try{r=await sb.rpc('eco',{p_op:op,p_a:a||{}})}catch(x){return{error:'Connexion impossible, réessaie'}}
    if(r.error)return{error:/fetch|network/i.test(r.error.message)?'Connexion impossible, réessaie':r.error.message};
    ECO.apply(r.data.w);return r.data;
  };
  ECO.op=async function(op,a){var r=await ECO.call(op,a);if(r.error){toast(r.error);return null}return r};
  ECO.sync=async function(noRender){var r=await ECO.call('state');if(!r.error&&!noRender&&quiet())render();return r};

  /* ---------- actions du jeu passées au serveur ---------- */
  window.openPack=async function(m,express){
    if(reveal||ECO.busy)return;
    if(['free','pay','gold','drop','nacre','diamant'].indexOf(m)<0)m='pay';
    var need=m==='drop'?DROP_COST:PK[m]?PK[m].p:m==='pay'?cost():0;
    if(m==='gold'){if(S.gold<1){toast('Pas de Maxi Or');return}}
    else if(m==='free'){if(!(S.bonus>0||freeReady())){toast('Pas de maxi gratuit');return}}
    else if(S.coins<need){needCoins(need-S.coins);return}
    ECO.busy=true;var r;
    try{r=await sb.rpc('eco',{p_op:'open',p_a:{kind:m==='pay'?'std':m,alk:m==='drop'?curDrop().A.key:null,v:window.CATV}})}
    catch(e){r={error:{message:'Connexion impossible'}}}
    finally{ECO.busy=false}
    if(r.error){toast(r.error.message);return}
    if(reveal)return;
    var ids=(r.data.cards||[]).filter(function(id){return C[id]});
    if(!ids.length){ECO.apply(r.data.w);toast('Maxi ajouté, recharge l’app');return}
    window.SRV={cards:ids,gain:r.data.gain||0,secret:!!r.data.secret};
    try{reveal=pull(PK[m]||m==='drop'?m:'std')}finally{window.SRV=null}
    ECO.apply(r.data.w);
    closeStack();closeDD();closeMenu();
    if(express){showSummary();return}
    showOpening();
  };
  window.recyAll=async function(){var r=await ECO.op('recycle_all');if(!r)return;closeMenu();toast('+'+r.dust+' poussière');render()};
  window.recyOne=async function(id){var r=await ECO.op('recycle',{id:id});if(!r)return;toast('+'+r.dust+' poussière');see(id);render()};
  window.craft=async function(id){
    var c=C[id];if(!c)return;if(own(id)||S.dust<DUST_COST[c.r]){toast('Pas assez de poussière');return}
    var r=await ECO.op('craft',{id:id});if(!r)return;
    toast(c.t+' fabriqué'+(r.ul&&r.ul.length?' · récompense !':''));see(id);render();
  };
  window.mClaim=async function(k){var m=MISS.find(function(x){return x.k===k});var r=await ECO.op('mission',{k:k});if(!r)return;toast('+'+m.c+' jetons · +'+m.x+' XP');render()};
  window.sClaim=async function(i,t){if(t==='p'&&!hasPass()){passSheet();return}var r=await ECO.op('season',{i:+i,t:t==='p'?'p':'f'});if(!r)return;toast('Récompense ajoutée');render()};
  window.buyCoins=async function(k){
    if(k==='nacre'||k==='diamant'){if(S.coins<PK[k].p){needCoins(PK[k].p-S.coins);return}openPack(k);return}
    var P={gold:GOLD_COST,lot5:450,dust:300}[k];if(!P)return;if(S.coins<P){needCoins(P-S.coins);return}
    var r=await ECO.op('item',{k:k});if(!r)return;
    toast(k==='gold'?'Maxi Or ajouté':k==='lot5'?'5 maxis ajoutés':'+200 poussière');render();
  };
  /* paiements Stripe (liens de paiement, crédités par le serveur après confirmation de Stripe) */
  var PAY={pass:'https://buy.stripe.com/3cI9ASgU66yOg1Gbqh5AQ00',c500:'https://buy.stripe.com/7sYcN46fs8GW02I8e55AQ01',c1200:'https://buy.stripe.com/5kQ6oGcDQf5k7va8e55AQ02',c2600:'https://buy.stripe.com/28E5kC8nA7CS3eU2TL5AQ03',c6500:'https://buy.stripe.com/14A8wO9rEcXc02I51T5AQ04'};
  window.buyFlow=function(k){
    if(!CL.user){toast('Connexion requise');return}
    if(!PAY[k]){toast('Bientôt disponible');return}
    if(k==='pass'&&hasPass()){passSheet();return}
    var item=k==='pass'?{n:'TrackDex Pass',p:PASS_PRICE}:(function(){var s=SHOP.find(function(x){return x.k===k});return{n:s.n.toLocaleString('fr-FR')+' jetons',p:s.p}})();
    var url=PAY[k]+'?client_reference_id='+encodeURIComponent(CL.user.id)+(CL.user.email?'&prefilled_email='+encodeURIComponent(CL.user.email):'')+'&locale=fr';
    closeMenu();
    dd.innerHTML=popHTML('<div class="card2 glass paysh"><span class="lbl">Paiement sécurisé · Stripe</span><h2>'+esc(item.n)+'</h2><p class="price2">'+item.p+'</p><p class="cap">Tu vas payer sur la page Stripe, puis revenir dans l’app. '+(k==='pass'?'Le Pass s’active':'Les jetons arrivent')+' en quelques secondes.</p><div class="row"><button class="gbtn" data-act="ddclose">Annuler</button><a class="pbtn" href="'+esc(url)+'" rel="noopener">Payer '+item.p.replace(' / mois','')+'</a></div></div>');
  };
  window.buyOk=function(k){buyFlow(k)};
  window.claim=async function(){var r=await ECO.op('pass_daily');if(!r)return;toast('+1 maxi'+(new Date().getDay()===1?' et 1 Maxi Or':''));closeMenu();render()};
  /* retour de Stripe */
  var paid=null;try{paid=new URLSearchParams(location.search).get('paye');if(paid)history.replaceState(null,'',location.pathname)}catch(e){}
  ECO.afterLogin=function(){
    if(!paid)return;var k=paid,c0=S.coins,p0=hasPass(),n=0;paid=null;
    toast('Paiement reçu, merci !');
    (function poll(){n++;ECO.sync().then(function(){
      if(k==='pass'?hasPass()&&!p0:S.coins>c0){toast(k==='pass'?'TrackDex Pass activé':'+'+(S.coins-c0).toLocaleString('fr-FR')+' jetons');return}
      if(n<10)setTimeout(poll,3000);else toast('Paiement en cours de validation, tes achats arrivent bientôt');
    })})();
  };

  /* ---------- Bourse ---------- */
  function pct(v){v=+v||0;return (v>0?'+':v<0?'−':'')+fr(Math.abs(v))+' %'}
  function cls(v){return v>0?' bxup':v<0?' bxdn':''}
  function money(v){return (Math.round(v*100)/100).toLocaleString('fr-FR',{minimumFractionDigits:v<100?2:0,maximumFractionDigits:2})}
  async function loadList(){
    B.load=true;
    var q=B.q.trim();
    var r=await sb.rpc('bourse_list',{p_f:B.f,p_q:q.length>1?q:null,p_r:null});
    B.load=false;
    if(r.error){toast(r.error.message);return}
    B.list=(r.data.rows||[]).filter(function(x){return C[x.id]});
    B.list.forEach(function(x){LIVE[x.id]=LIVE[x.id]||{};LIVE[x.id].sp=(x.sp||[x.p]).map(Number);LIVE[x.id].real=(x.sp&&x.sp.length?+x.sp[x.sp.length-1]:x.p)});
    B.meta={buys:r.data.buys,sells:r.data.sells};
    if(!q&&B.f==='hot'){ECO.ix=+r.data.ix||0;B.tk=B.list.slice()}
    B.t=Date.now();paint();
  }
  async function loadPf(){
    var r=await sb.rpc('bourse_portfolio');
    if(r.error){toast(r.error.message);return}
    B.pf=r.data;B.pf.rows=(B.pf.rows||[]).filter(function(x){return C[x.id]});B.t=Date.now();paint();
  }
  var LIVE={};
  function sparkPts(a,W,H){
    var mn=Math.min.apply(null,a),mx=Math.max.apply(null,a),sp=Math.max(mx-mn,mx*.02,.01);
    return a.map(function(v,i){return (i*W/(a.length-1)).toFixed(1)+','+(H-2-(v-mn)*(H-4)/sp).toFixed(1)}).join(' ');
  }
  function sparkHTML(id){
    var L=LIVE[id];if(!L||!L.sp||L.sp.length<2)return '';
    var up=L.sp[L.sp.length-1]>=L.sp[0];
    return '<svg class="bxsp'+(up?' bxup':' bxdn')+'" data-sp="'+id+'" viewBox="0 0 64 26" preserveAspectRatio="none" aria-hidden="true"><polyline points="'+sparkPts(L.sp,64,26)+'"/></svg>';
  }
  function rowHTML(x,i){
    var c=C[x.id],R=RAR[c.r];
    var btn=x.can?'<button class="lbtn bxbuy" data-act="bxbuy" data-id="'+x.id+'">'+x.buy+' '+coinI+'</button>'
      :'<span class="bxl">Packs<br>uniquement</span>';
    return '<div class="lr bxr" style="--i:'+(i||0)+'" data-act="bxsee" data-id="'+x.id+'"><span class="lth">'+tileHTML(c,{nocount:1,lock:false})+'</span>'
      +'<div class="li"><b>'+esc(c.t)+'</b><span><i style="background:'+R.c+'"></i>'+esc(c.a)+'</span><small>'+R.n+(x.own?' · ×'+x.own:'')+'</small></div>'
      +sparkHTML(x.id)
      +'<div class="lp"><b>'+x.p+' '+coinI+'</b><small class="bxc'+cls(x.chg)+'">'+pct(x.chg)+'</small></div>'+btn+'</div>';
  }
  function pfRowHTML(x,i){
    var c=C[x.id],R=RAR[c.r];
    var res=x.cost?'<small>Acheté '+x.cost+' · <span class="bxc'+cls(x.sell-x.cost)+'">'+(x.sell-x.cost>=0?'+':'−')+Math.abs(x.sell-x.cost)+'</span></small>':'<small>'+R.n+'</small>';
    return '<div class="lr bxr" style="--i:'+(i||0)+'" data-act="bxsee" data-id="'+x.id+'"><span class="lth">'+tileHTML(c,{nocount:1,lock:false})+'</span>'
      +'<div class="li"><b>'+esc(c.t)+'</b><span><i style="background:'+R.c+'"></i>'+esc(c.a)+(x.q>1?' · ×'+x.q:'')+'</span>'+res+'</div>'
      +'<div class="lp"><b>'+(x.sell*x.q)+' '+coinI+'</b><small class="bxc'+cls(x.chg)+'">'+pct(x.chg)+'</small></div></div>';
  }
  function tickerHTML(){
    var L=(B.tk||[]).filter(function(x){return x.chg});
    if(!L.length)L=(B.tk||[]).slice(0,10);
    if(!L.length)return '<div class="bxtk"><div class="bxtr" style="animation:none"><span class="bxti">Ouverture du marché…</span></div></div>';
    L=L.slice().sort(function(a,b){return b.chg-a.chg}).slice(0,24);
    var one=L.map(function(x){var c=C[x.id];return '<span class="bxti"><b>'+esc(c.t)+'</b><em>'+x.p+'</em><i class="bxc'+cls(x.chg)+'">'+(x.chg>0?'▲ ':x.chg<0?'▼ ':'')+pct(x.chg)+'</i></span>'}).join('');
    return '<div class="bxtk" aria-label="Sons en hausse et en baisse"><div class="bxtr" style="--n:'+L.length+'">'+one+one+'</div></div>';
  }
  function bodyHTML(){
    if(B.sub==='pf'){
      var P=B.pf;if(!P)return '<p class="cap">Chargement…</p>';
      var v=P.total0?(P.total-P.total0)*100/P.total0:0;
      return '<div class="bxsum"><div><span class="lbl">Valeur de tes sons</span><b>'+P.total.toLocaleString('fr-FR')+' '+coinI+'</b><small class="bxc'+cls(v)+'">'+pct(Math.round(v*10)/10)+' sur 24 h</small></div>'
        +'<div><span class="lbl">Résultat Bourse</span><b class="bxc'+cls(P.real)+'">'+(P.real>0?'+':P.real<0?'−':'')+Math.abs(P.real).toLocaleString('fr-FR')+'</b><small>ventes moins achats</small></div></div>'
        +'<p class="cap">Valeur au prix de revente actuel. Touche un son pour voir sa courbe.</p>'
        +(P.rows.length?P.rows.slice(0,150).map(pfRowHTML).join(''):'<p class="cap">Aucun son</p>');
    }
    var top='<div class="bxs"><input id="bxq" type="search" placeholder="Chercher un son ou un artiste" value="'+esc(B.q)+'" autocomplete="off"></div>'
      +'<div class="chips">'+[['hot','Tendances'],['mine','Mes sons']].map(function(z){return '<button class="chip" data-act="bxf" data-v="'+z[0]+'" aria-pressed="'+(B.f===z[0]&&!B.q)+'">'+z[1]+'</button>'}).join('')+'</div>'
      +'<p class="cap bxcap">Achat au cours +5 %, revente −5 %. Encore '+B.meta.buys+' achat'+(B.meta.buys>1?'s':'')+' et '+B.meta.sells+' vente'+(B.meta.sells>1?'s':'')+' aujourd’hui. Mythiques et Divins : packs uniquement.</p>';
    return top+'<div id="bxl" class="bxlist">'+listHTML()+'</div>';
  }
  function listHTML(){
    if(!B.list)return '<p class="cap">Chargement…</p>';
    if(!B.list.length)return '<p class="cap">'+(B.q?'Aucun son trouvé':B.f==='mine'?'Aucun son':'Rien pour l’instant')+'</p>';
    return B.list.map(rowHTML).join('');
  }
  function ixHTML(){var ix=ECO.ix;return '<span class="wix sm'+(ix>0?' gn':ix===0?' z':'')+'">CAC Son '+(ix>0?'▲':ix<0?'▼':'=')+' '+fr(Math.abs(ix))+' %</span>'}
  var BG='<div class="bxbg" aria-hidden="true"><i class="g1"></i><i class="g2"></i><svg class="bxcand" viewBox="0 0 400 200" preserveAspectRatio="none">'+(function(){var s='',y=120;for(var i=0;i<26;i++){var o=y,c=Math.max(30,Math.min(170,y+(Math.sin(i*1.7)*22+Math.cos(i*.6)*14))),hi=Math.min(o,c)-6-(i*7%11),lo=Math.max(o,c)+5+(i*5%9),up=c<o;s+='<line x1="'+(i*15+8)+'" x2="'+(i*15+8)+'" y1="'+hi+'" y2="'+lo+'" class="'+(up?'u':'d')+'"/><rect x="'+(i*15+4)+'" y="'+Math.min(o,c)+'" width="8" height="'+Math.max(2,Math.abs(c-o))+'" class="'+(up?'u':'d')+'"/>';y=c}return s})()+'</svg></div>';
  function view(){
    var head=subHead('La Bourse',ixHTML());
    var chips='<div class="chips">'+[['mkt','Marché'],['pf','Mon portefeuille']].map(function(z){return '<button class="chip" data-act="bxsub" data-v="'+z[0]+'" aria-pressed="'+(B.sub===z[0])+'">'+z[1]+'</button>'}).join('')+'</div>';
    if(Date.now()-B.t>60e3&&!B.load){if(B.sub==='pf')loadPf();else loadList()}
    if(!B.tk&&B.sub==='pf'&&!B.tkl){B.tkl=1;sb.rpc('bourse_list',{p_f:'hot',p_q:null,p_r:null}).then(function(r){if(!r.error){B.tk=(r.data.rows||[]).filter(function(x){return C[x.id]});ECO.ix=+r.data.ix||0;var t=$('bxtkw');if(t)t.innerHTML=tickerHTML()}})}
    return '<div class="view v-shop v-bx">'+BG+head+'<div id="bxtkw">'+tickerHTML()+'</div>'+chips+'<div class="bx" id="bxb">'+bodyHTML()+'</div></div>';
  }
  function paint(){
    if(tab!=='shop'||shopSub!=='cours')return;
    var t=$('bxtkw');if(t)t.innerHTML=tickerHTML();
    var w=document.querySelector('.v-bx .wix');if(w)w.outerHTML=ixHTML();
    var l=$('bxl');
    if(B.sub==='mkt'&&l&&document.activeElement&&document.activeElement.id==='bxq'){l.innerHTML=listHTML();return}
    var b=$('bxb');if(b&&quiet())b.innerHTML=bodyHTML();
  }
  var origShop=window.vShop;
  window.vShop=function(){return shopSub==='cours'?view():origShop()};

  /* courbes vivantes : petites variations simulées autour du vrai cours */
  function gauss(){return (Math.random()+Math.random()+Math.random()-1.5)/1.5}
  setInterval(function(){
    if(document.hidden)return;
    var els=document.querySelectorAll('svg[data-sp]');
    els.forEach(function(el){
      var L=LIVE[el.dataset.sp];if(!L||!L.sp)return;
      var last=L.sp[L.sp.length-1],nx=last+(L.real-last)*.35+gauss()*L.real*.012;
      L.sp=L.sp.slice(1).concat([Math.max(.1,nx)]);
      var pl=el.querySelector('polyline');if(pl)pl.setAttribute('points',sparkPts(L.sp,64,26));
      var up=L.sp[L.sp.length-1]>=L.sp[0];el.classList.toggle('bxup',up);el.classList.toggle('bxdn',!up);
    });
    if(F&&!F.scrub)liveTip();
  },1400);

  /* ---------- fiche plein écran ---------- */
  var F=null;
  var RG={d:{n:'24 h',step:3600e3},w:{n:'7 jours',step:4*3600e3},m:{n:'30 jours',step:12*3600e3}};
  function fdate(ms){var d=new Date(ms),a=Date.now()-ms;
    if(a<90e3)return 'maintenant';
    if(a<36*3600e3)return 'il y a '+Math.round(a/3600e3)+' h · '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    return d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})+' · '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
  function chartPts(){var a=F.x.pts[F.rg].map(Number);a=a.slice(0,-1).concat([F.live]);return a}
  function drawChart(){
    var el=$('bxch');if(!el||!F)return;
    var a=chartPts(),W=el.clientWidth||320,H=el.clientHeight||220,pad=14;
    var mn=Math.min.apply(null,a),mx=Math.max.apply(null,a),sp=Math.max(mx-mn,mx*.03,.01);
    F.geo={W:W,H:H,mn:mn,sp:sp,pad:pad,n:a.length};
    var P=a.map(function(v,i){return [i*W/(a.length-1),pad+(H-2*pad)*(1-(v-mn)/sp)]});
    var pts=P.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' ');
    var up=a[a.length-1]>=a[0];
    var grid='';for(var g=1;g<4;g++)grid+='<line x1="0" x2="'+W+'" y1="'+(H*g/4)+'" y2="'+(H*g/4)+'"/>';
    var lp=P[P.length-1];
    el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" class="bxcv'+(up?' bxup':' bxdn')+'"><defs><linearGradient id="bxgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".32"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>'
      +'<g class="gr">'+grid+'</g><polygon points="0,'+H+' '+pts+' '+W+','+H+'" fill="url(#bxgr)"/><polyline points="'+pts+'"/>'
      +'<circle class="pulse" cx="'+lp[0]+'" cy="'+lp[1]+'" r="9"/><circle class="tip" cx="'+lp[0]+'" cy="'+lp[1]+'" r="4"/>'
      +'<line class="cur" x1="0" x2="0" y1="0" y2="'+H+'" style="display:none"/><circle class="cdot" r="5" style="display:none"/></svg>'
      +'<div class="bxtt" id="bxtt" hidden></div>';
    var hi=Math.max.apply(null,a),lo=Math.min.apply(null,a),v=(a[a.length-1]-a[0])*100/a[0];
    var s=$('bxstat');if(s)s.innerHTML='<div><span>Plus haut</span><b>'+money(hi)+'</b></div><div><span>Plus bas</span><b>'+money(lo)+'</b></div><div><span>Chez les joueurs</span><b>'+F.x.held+'</b></div><div><span>Tu en as</span><b>'+F.x.own+'</b></div>';
    var c=$('bxchg');if(c){c.className='bxc'+cls(v);c.textContent=pct(Math.round(v*10)/10)+' sur '+RG[F.rg].n}
  }
  function liveTip(){
    if(!F)return;var real=+F.x.pts[F.rg][F.x.pts[F.rg].length-1];
    F.live=Math.max(.1,F.live+(real-F.live)*.4+gauss()*real*.01);
    var lv=$('bxlive');if(lv)lv.textContent=money(F.live);
    drawChart();
  }
  function scrub(e){
    if(!F||!F.geo)return;var el=$('bxch');var r=el.getBoundingClientRect();
    var a=chartPts(),g=F.geo,i=Math.round(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*(a.length-1));
    var x=i*g.W/(a.length-1),y=g.pad+(g.H-2*g.pad)*(1-(a[i]-g.mn)/g.sp);
    var svg=el.querySelector('svg'),cur=svg.querySelector('.cur'),d=svg.querySelector('.cdot');
    cur.setAttribute('x1',x);cur.setAttribute('x2',x);cur.style.display='';d.setAttribute('cx',x);d.setAttribute('cy',y);d.style.display='';
    var tt=$('bxtt');tt.hidden=false;
    tt.innerHTML='<b>'+money(a[i])+' '+coinI+'</b><span>'+fdate(Date.now()-(a.length-1-i)*RG[F.rg].step)+'</span>';
    tt.style.left=Math.max(8,Math.min(r.width-tt.offsetWidth-8,x-tt.offsetWidth/2))+'px';
  }
  function unscrub(){if(!F)return;F.scrub=false;var tt=$('bxtt');if(tt)tt.hidden=true;drawChart()}
  async function bxSee(id){
    var c=C[id];if(!c)return;
    closeFull();
    var el=document.createElement('div');el.id='bxfull';el.className='bxfull';el.setAttribute('role','dialog');el.setAttribute('aria-label',c.t);
    el.innerHTML=BG+'<div class="bxfh"><button class="gbtn sq" data-act="bxclose" aria-label="Retour">'+ICON.back+'</button><span class="lbl">Cours en direct</span><span class="ldot"></span></div>'
      +'<div class="bxfc"><div class="bxid"><div class="sth">'+tileHTML(c,{nocount:1,lock:false})+'</div><div><b>'+esc(c.t)+'</b><small>'+esc(c.a)+'</small><small style="color:'+RAR[c.r].c+'">'+RAR[c.r].n+'</small></div></div>'
      +'<div id="bxd"><p class="cap">Chargement…</p></div></div>';
    document.body.appendChild(el);
    requestAnimationFrame(function(){el.classList.add('on')});
    var r=await sb.rpc('bourse_card',{p_id:id});
    var d=$('bxd');if(!d||!el.isConnected)return;
    if(r.error){d.innerHTML='<p class="cap">'+esc(r.error.message)+'</p>';return}
    var x=r.data;F={id:id,x:x,rg:(F&&F.rg)||'w',live:+x.pts.w[x.pts.w.length-1],scrub:false};
    d.innerHTML='<div class="bxp"><b><span id="bxlive">'+money(F.live)+'</span> '+coinI+'</b><span id="bxchg" class="bxc"></span></div>'
      +'<div class="chips bxrg">'+['d','w','m'].map(function(k){return '<button class="chip" data-act="bxrg" data-v="'+k+'" aria-pressed="'+(F.rg===k)+'">'+RG[k].n+'</button>'}).join('')+'</div>'
      +'<div class="bxch" id="bxch"></div><p class="cap bxhint">Touche la courbe pour voir le prix à une date</p>'
      +'<div class="bxstat" id="bxstat"></div>'
      +(x.cost?'<p class="cap">Tu l’as acheté '+x.cost+' jetons en moyenne.</p>':'')
      +'<div class="bxact">'
      +(x.can?'<button class="pbtn" data-act="bxbuy" data-id="'+id+'">Acheter · '+x.buy+' '+coinI+'</button>':'<button class="pbtn" disabled>Packs uniquement</button>')
      +'<button class="gbtn" data-act="bxsell" data-id="'+id+'"'+(x.own?'':' disabled')+'>Vendre · '+x.sell+' '+coinI+'</button></div>'
      +(x.own===1?'<p class="cap">C’est ton seul exemplaire : le vendre le retire de ta collection.</p>':'');
    drawChart();
    var ch=$('bxch');
    ch.addEventListener('pointerdown',function(e){F.scrub=true;try{ch.setPointerCapture(e.pointerId)}catch(_){}scrub(e)});
    ch.addEventListener('pointermove',function(e){if(F&&(F.scrub||e.pointerType==='mouse')){F.scrub=true;scrub(e)}});
    ch.addEventListener('pointerup',unscrub);ch.addEventListener('pointercancel',unscrub);ch.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')unscrub()});
  }
  function closeFull(){var el=$('bxfull');if(el)el.remove();F=null}
  ECO.see=function(id){bxSee(id)};
  addEventListener('keydown',function(e){if(e.key==='Escape'&&$('bxfull'))closeFull()});
  addEventListener('resize',function(){if(F)drawChart()});

  async function trade(op,id,btn){
    if(btn)btn.disabled=true;
    var r=await ECO.op(op,{id:id});
    if(btn)btn.disabled=false;
    if(!r)return;
    toast((op==='bbuy'?'Acheté ':'Vendu ')+r.price+' jetons'+(r.ul&&r.ul.length?' · récompense !':''));
    if(btn){btn.classList.remove('bxok');void btn.offsetWidth;btn.classList.add('bxok')}
    B.t=0;B.pf=null;
    if($('bxfull'))bxSee(id);
    if(B.sub==='pf')loadPf();else loadList();
  }

  var qT=0;
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-act^="bx"]');if(!t)return;
    var a=t.dataset.act;
    if(a==='bxsee'&&e.target.closest('button,input'))return;
    e.stopPropagation();e.preventDefault();
    if(a==='bxsub'){B.sub=t.dataset.v;B.t=0;render()}
    else if(a==='bxf'){B.f=t.dataset.v;B.q='';B.list=null;B.t=0;render()}
    else if(a==='bxsee')bxSee(t.dataset.id);
    else if(a==='bxclose')closeFull();
    else if(a==='bxrg'){if(!F)return;F.rg=t.dataset.v;F.live=+F.x.pts[F.rg][F.x.pts[F.rg].length-1];t.parentElement.querySelectorAll('.chip').forEach(function(c){c.setAttribute('aria-pressed',c===t)});drawChart()}
    else if(a==='bxbuy')trade('bbuy',t.dataset.id,t);
    else if(a==='bxsell')trade('bsell',t.dataset.id,t);
  },true);
  document.addEventListener('input',function(e){
    if(e.target.id!=='bxq')return;
    B.q=e.target.value;clearTimeout(qT);
    qT=setTimeout(function(){if(B.q.trim().length===1)return;loadList()},350);
  });
  setInterval(function(){if(!document.hidden&&tab==='shop'&&shopSub==='cours'&&quiet()&&!$('bxfull')){if(B.sub==='pf')loadPf();else loadList()}},60e3);
  setTimeout(function(){if(CL.user)loadList()},4000);
})();
