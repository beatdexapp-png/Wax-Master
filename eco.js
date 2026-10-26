/* WaxDrop : économie gérée par le serveur (wax coins, cartes, drops) et Bourse des cours */
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
    S.freeAt=+new Date(w.free_at)||0;S.xp=w.sxp||0;S.passUntil=w.pass_until?+new Date(w.pass_until):0;S.top=Array.isArray(w.top)?w.top:[];S.styles=Array.isArray(w.styles)?w.styles:[];S.topAt=w.top_at?+new Date(w.top_at):0;
    var cl=w.claims||{};S.ul=Object.assign({},cl.ul||{});S.sfree=(cl.sf||[]).slice();S.sprem=(cl.sp||[]).slice();S.codes=Object.assign({},cl.codes||{});S.evp=cl.evp||{};S.evc=cl.evc||{};
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
  /* précharge les pochettes et photos des sons tirés pendant l'animation */
  var PRE=[];ECO.preload=function(ids){ids.forEach(function(id){var c=C[id];if(!c)return;var A=ARTISTS.find(function(a){return a.ids&&a.ids.indexOf(id)>=0});
    [c.img,A&&A.img].forEach(function(u){if(!u)return;var i=new Image();i.decoding='async';i.fetchPriority='high';i.src=u;if(i.decode)i.decode().catch(function(){});PRE.push(i)})});if(PRE.length>60)PRE=PRE.slice(-60)};
  ECO.sync=async function(noRender){var r=await ECO.call('state');if(!r.error&&!noRender&&quiet())render();return r};

  /* ---------- actions du jeu passées au serveur ---------- */
  window.openPack=async function(m,express){
    if(reveal||ECO.busy)return;
    if(['free','pay','gold','drop','nacre','diamant'].indexOf(m)<0)m='pay';
    var need=m==='drop'?DROP_COST:PK[m]?PK[m].p:m==='pay'?cost():0;
    if(m==='gold'){if(S.gold<1){toast('Pas de Drop Or');return}}
    else if(m==='free'){if(!(S.bonus>0||freeReady())){toast('Pas de drop gratuit');return}}
    else if(S.coins<need){needCoins(need-S.coins);return}
    ECO.busy=true;var r;
    try{r=await sb.rpc('eco',{p_op:'open',p_a:{kind:m==='pay'?'std':m,alk:m==='drop'?curDrop().A.key:null,v:window.CATV}})}
    catch(e){r={error:{message:'Connexion impossible'}}}
    finally{ECO.busy=false}
    if(r.error){toast(/fetch|network/i.test(r.error.message)?'Connexion impossible, réessaie':r.error.message);return}
    if(reveal)return;
    var ids=(r.data.cards||[]).filter(function(id){return C[id]});
    if(!ids.length){ECO.apply(r.data.w);toast('Drop ajouté, recharge l’app');return}
    ECO.preload(ids);
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
    render();if(window.craftAnim)craftAnim(c);else see(id);if(r.ul&&r.ul.length)toast('Album complété · récompense !');
  };
  window.mClaim=async function(k){var m=MISS.find(function(x){return x.k===k});var r=await ECO.op('mission',{k:k});if(!r)return;toast('+'+m.c+' wax coins · +'+m.x+' XP');render()};
  window.sClaim=async function(i,t){if(t==='p'&&!hasPass()){passSheet();return}var r=await ECO.op('season',{i:+i,t:t==='p'?'p':'f'});if(!r)return;toast('Récompense ajoutée');render()};
  window.buyCoins=async function(k){
    if(k==='nacre'||k==='diamant'){if(S.coins<PK[k].p){needCoins(PK[k].p-S.coins);return}openPack(k);return}
    var P={gold:GOLD_COST,lot5:450,dust:300}[k];if(!P)return;if(S.coins<P){needCoins(P-S.coins);return}
    var r=await ECO.op('item',{k:k});if(!r)return;
    toast(k==='gold'?'Drop Or ajouté':k==='lot5'?'5 drops ajoutés':'+200 poussière');render();
  };
  /* paiements Stripe (liens de paiement, crédités par le serveur après confirmation de Stripe) */
  var PAY={pass:'https://buy.stripe.com/3cIcN433ge1g02Ibqh5AQ05',c500:'https://buy.stripe.com/6oU9ASfQ2bT86r6bqh5AQ06',c1200:'https://buy.stripe.com/9B67sKdHU9L0cPu8e55AQ07',c3000:'https://buy.stripe.com/eVqbJ047k2iy16Mamd5AQ08',c7000:'https://buy.stripe.com/5kQ5kCdHUg9og1G7a15AQ09'};
  window.buyFlow=function(k){
    if(!CL.user){toast('Connexion requise');return}
    if(!PAY[k]){toast('Bientôt disponible');return}
    if(k==='pass'&&hasPass()){passSheet();return}
    var item=k==='pass'?{n:'WaxDrop Pro',p:PASS_PRICE}:(function(){var s=SHOP.find(function(x){return x.k===k});return{n:s.n.toLocaleString('fr-FR')+' wax coins',p:s.p}})();
    var url=PAY[k]+'?client_reference_id='+encodeURIComponent(CL.user.id)+(CL.user.email?'&prefilled_email='+encodeURIComponent(CL.user.email):'')+'&locale=fr';
    closeMenu();
    dd.innerHTML=popHTML('<div class="card2 glass paysh"><span class="lbl">Paiement sécurisé · Stripe</span><h2>'+esc(item.n)+'</h2><p class="price2">'+item.p+'</p><p class="cap">Tu vas payer sur la page Stripe, puis revenir dans l’app. '+(k==='pass'?'WaxDrop Pro s’active':'Les wax coins arrivent')+' en quelques secondes.</p><div class="row"><button class="gbtn" data-act="ddclose">Annuler</button><a class="pbtn" href="'+esc(url)+'" rel="noopener">Payer '+item.p.replace(' / mois','')+'</a></div></div>');
  };
  window.buyOk=function(k){buyFlow(k)};
  window.claim=async function(){var r=await ECO.op('pass_daily');if(!r)return;toast('+1 drop'+(new Date().getDay()===1?' et 1 Drop Or':''));closeMenu();render()};
  /* retour de Stripe */
  var paid=null;try{paid=new URLSearchParams(location.search).get('paye');if(paid)history.replaceState(null,'',location.pathname)}catch(e){}
  ECO.afterLogin=function(){
    if(!paid)return;var k=paid,c0=S.coins,p0=hasPass(),n=0;paid=null;
    toast('Paiement reçu, merci !');
    (function poll(){n++;ECO.sync().then(function(){
      if(k==='pass'?hasPass()&&!p0:S.coins>c0){toast(k==='pass'?'WaxDrop Pro activé':'+'+(S.coins-c0).toLocaleString('fr-FR')+' wax coins');return}
      if(n<10)setTimeout(poll,3000);else toast('Paiement en cours de validation, tes achats arrivent bientôt');
    })})();
  };

  /* ---------- Ton top du moment : bonus de chance, modifiable une fois par semaine ---------- */
  var TP={sel:[],q:''};
  function topLeft(){return S.topAt&&(S.top||[]).length?Math.max(0,S.topAt+7*864e5-Date.now()):0}
  ECO.topHTML=function(){
    var L=(S.top||[]).map(function(k){return RW[k]}).filter(Boolean);
    return '<button class="topc" data-act="topedit"><span class="topk">Ton top du moment</span>'+(L.length?'<span class="topa">'+L.map(function(A){return '<span class="av" style="--avg:'+esc(A.avg)+'">'+esc(A.ini)+'</span>'}).join('')+'</span><span class="topb">×3 chances</span>':'<span class="topn">Choisis tes 5 artistes et drop-les 3× plus souvent</span>')+'</button>';
  };
  function topList(){var q=TP.q.trim().toLowerCase();return ARTISTS.filter(function(A){return !q||A.n.toLowerCase().indexOf(q)>=0}).sort(function(a,b){var sa=TP.sel.indexOf(a.key)>=0,sb=TP.sel.indexOf(b.key)>=0;return sa!==sb?(sa?-1:1):a.n.localeCompare(b.n)}).slice(0,80)}
  function topRows(){return topList().map(function(A){var on=TP.sel.indexOf(A.key)>=0;return '<button class="tpr'+(on?' on':'')+'" data-act="toppick" data-k="'+A.key+'"><span class="av" style="--avg:'+esc(A.avg)+'">'+esc(A.ini)+'</span><b>'+esc(A.n)+'</b><small>'+(GEN[A.g]||A.g)+'</small><i>'+(on?ICON.check:'')+'</i></button>'}).join('')}
  function topSheet(){
    closeMenu();menuPage='top';var left=topLeft();
    if(left){var L=(S.top||[]).map(function(k){return RW[k]}).filter(Boolean);
      sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Ton top du moment"><div class="grab"></div><div class="shh"><h2>Ton top du moment</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div><p class="cap" style="text-align:left">Leurs sons sortent 3 fois plus souvent dans tes drops. La rareté ne change pas.</p><div class="tpl">'+L.map(function(A){return '<div class="tpr on"><span class="av" style="--avg:'+esc(A.avg)+'">'+esc(A.ini)+'</span><b>'+esc(A.n)+'</b><small>×3</small></div>'}).join('')+'</div><p class="tplock">'+ICON.lock+'Modifiable dans '+dur(left)+'</p></div>';return}
    TP.sel=(S.top||[]).slice();TP.q='';
    sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass topsh" role="dialog" aria-label="Ton top du moment"><div class="grab"></div><div class="shh"><h2>Ton top du moment</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div><p class="cap" style="text-align:left">Choisis jusqu’à 5 artistes que tu écoutes en ce moment : leurs sons sortent 3 fois plus souvent dans tes drops. Tu pourras changer une fois par semaine.</p><div class="bxs"><input id="tpq" type="search" placeholder="Chercher un artiste" autocomplete="off"></div><div class="tpl" id="tpl">'+topRows()+'</div><button class="pbtn" id="tpgo2" data-act="topsave">'+topBtn()+'</button></div>';
  }
  function topBtn(){return TP.sel.length?'Valider · '+TP.sel.length+'/5':'Choisis au moins 1 artiste'}
  ECO.topSheet=topSheet;
  document.addEventListener('input',function(e){if(e.target.id==='tpq'){TP.q=e.target.value;var l=$('tpl');if(l)l.innerHTML=topRows()}});
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-act="topedit"],[data-act="toppick"],[data-act="topsave"]');if(!t)return;e.stopPropagation();
    var a=t.dataset.act;
    if(a==='topedit')topSheet();
    else if(a==='toppick'){var k=t.dataset.k,i=TP.sel.indexOf(k);if(i>=0)TP.sel.splice(i,1);else if(TP.sel.length<5)TP.sel.push(k);else{toast('5 artistes maximum');return}
      t.classList.toggle('on',TP.sel.indexOf(k)>=0);t.querySelector('i').innerHTML=TP.sel.indexOf(k)>=0?ICON.check:'';var b=$('tpgo2');if(b)b.textContent=topBtn()}
    else if(a==='topsave'){if(!TP.sel.length)return;t.disabled=true;ECO.op('top_set',{artists:TP.sel}).then(function(r){t.disabled=false;if(!r)return;closeMenu();toast('Top du moment enregistré · ×3 chances');try{localStorage.setItem('td-top-ask','1')}catch(_){}render()})}
  },true);
  ECO.afterSync=function(){var asked=null;try{asked=localStorage.getItem('td-top-ask')}catch(_){}if(!asked&&!(S.top||[]).length&&!reveal&&!sh.innerHTML&&!ov.innerHTML){try{localStorage.setItem('td-top-ask','1')}catch(_){}setTimeout(topSheet,600)}};

  /* ---------- Bourse ---------- */
  function pct(v){v=+v||0;return (v>0?'+':v<0?'−':'')+fr(Math.abs(v))+' %'}
  function cls(v){return v>0?' bxup':v<0?' bxdn':''}
  function money(v){return (Math.round(v*100)/100).toLocaleString('fr-FR',{minimumFractionDigits:v<100?2:0,maximumFractionDigits:2})}
  async function loadList(){
    B.load=true;
    var q=B.q.trim();
    var r=await sb.rpc('bourse_list',{p_f:B.f,p_q:q.length>1?q:null,p_r:null});
    B.load=false;
    if(r.error){toast(/fetch|network/i.test(r.error.message)?'Connexion impossible, réessaie':r.error.message);return}
    B.list=(r.data.rows||[]).filter(function(x){return C[x.id]});
    B.list.forEach(function(x){LIVE[x.id]=LIVE[x.id]||{};LIVE[x.id].sp=(x.sp||[x.p]).map(Number);LIVE[x.id].real=(x.sp&&x.sp.length?+x.sp[x.sp.length-1]:x.p)});
    B.meta={buys:r.data.buys,sells:r.data.sells,pro:!!r.data.pro};
    if(!q&&B.f==='hot'){ECO.ix=+r.data.ix||0;B.tk=B.list.slice()}
    B.t=Date.now();paint();
  }
  async function loadPf(){
    var r=await sb.rpc('bourse_portfolio');
    if(r.error){toast(/fetch|network/i.test(r.error.message)?'Connexion impossible, réessaie':r.error.message);return}
    B.pf=r.data;B.pf.rows=(B.pf.rows||[]).filter(function(x){return C[x.id]});B.t=Date.now();paint();
  }
  var LIVE={};
  function sparkPts(a,W,H){
    var mn=Math.min.apply(null,a),mx=Math.max.apply(null,a),sp=Math.max(mx-mn,mx*.02,.01);
    return a.map(function(v,i){return (i*W/(a.length-1)).toFixed(1)+','+(H-2-(v-mn)*(H-4)/sp).toFixed(1)}).join(' ');
  }
  function sparkHTML(id,W,H,cls,fill){
    var L=LIVE[id];if(!L||!L.sp||L.sp.length<2)return '';W=W||64;H=H||26;
    var up=L.sp[L.sp.length-1]>=L.sp[0],pts=sparkPts(L.sp,W,H);
    return '<svg class="bxsp '+(cls||'')+(up?' bxup':' bxdn')+'" data-sp="'+id+'" data-w="'+W+'" data-h="'+H+'" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true">'+(fill?'<polygon points="0,'+H+' '+pts+' '+W+','+H+'"/>':'')+'<polyline points="'+pts+'"/></svg>';
  }
  function chip(v){return '<span class="bxch2'+cls(v)+'">'+(v>0?'▲ ':v<0?'▼ ':'')+pct(v)+'</span>'}
  function buyBtn(x,big){return x.can?'<button class="bxb'+(big?' big':'')+'" data-act="bxbuy" data-id="'+x.id+'">'+(big?'Acheter · ':'')+x.buy+' '+coinI+'</button>':'<span class="bxlock">'+ICON.lock+(big?'Divin : WaxDrop Pro':'')+'</span>'}
  /* carte de la grille */
  function cardHTML(x,i,rank){
    var c=C[x.id],R=RAR[c.r];
    return '<div class="bxg" style="--i:'+(i||0)+';--rc:'+R.c+'" data-act="bxsee" data-id="'+x.id+'">'+(rank?'<b class="bxrk2">'+rank+'</b>':'')
      +'<span class="bxgt">'+tileHTML(c,{nocount:1,lock:false})+'</span>'
      +'<div class="bxgi"><b>'+esc(c.t)+'</b><span>'+esc(c.a)+'</span></div>'
      +sparkHTML(x.id,90,26,'bxgs')
      +'<div class="bxgp"><b>'+x.p+' '+coinI+'</b>'+chip(x.chg)+'</div>'
      +(x.own?'<em class="bxown">×'+x.own+'</em>':'')+'</div>';
  }
  /* carte du carrousel */
  function moverHTML(x,i){
    var c=C[x.id];
    return '<div class="bxm" style="--i:'+i+'" data-act="bxsee" data-id="'+x.id+'"><span class="bxmt">'+tileHTML(c,{nocount:1,lock:false})+chip(x.chg)+'</span><b>'+esc(c.t)+'</b><span>'+esc(c.a)+'</span><div class="bxmp"><b>'+x.p+' '+coinI+'</b>'+sparkHTML(x.id,54,20,'bxms')+'</div></div>';
  }
  function heroHTML(x){
    var c=C[x.id],R=RAR[c.r];
    return '<div class="bxhero" style="--rc:'+R.c+'" data-act="bxsee" data-id="'+x.id+'"><span class="bxhk"><i class="ldot"></i>Son du moment</span>'
      +'<div class="bxhm"><span class="bxht">'+tileHTML(c,{nocount:1,lock:false})+'</span><div class="bxhi"><b>'+esc(c.t)+'</b><span>'+esc(c.a)+' · '+R.n+'</span><div class="bxhp"><b>'+x.p+' '+coinI+'</b>'+chip(x.chg)+'</div></div></div>'
      +sparkHTML(x.id,300,64,'bxhs',1)+'<div class="bxha">'+buyBtn(x,1)+'</div></div>';
  }
  function podiumHTML(L){
    var o=[L[1],L[0],L[2]].filter(Boolean);
    return '<div class="bxpod">'+o.map(function(x){var k=L.indexOf(x)+1,c=C[x.id];return '<div class="bxpd p'+k+'" data-act="bxsee" data-id="'+x.id+'">'+(k===1?'<span class="bxcrown">'+ICON.star+'</span>':'')+'<span class="bxpt">'+tileHTML(c,{nocount:1,lock:false})+'</span><b>'+esc(c.t)+'</b><span>'+esc(c.a)+'</span><em>'+x.p+' '+coinI+'</em>'+chip(x.chg)+'<i class="bxstep">'+k+'</i></div>'}).join('')+'</div>';
  }
  function pfRowHTML(x,i){
    var c=C[x.id],R=RAR[c.r];
    return '<div class="bxg" style="--i:'+(i||0)+';--rc:'+R.c+'" data-act="bxsee" data-id="'+x.id+'"><span class="bxgt">'+tileHTML(c,{nocount:1,lock:false})+'</span>'
      +'<div class="bxgi"><b>'+esc(c.t)+'</b><span>'+esc(c.a)+(x.q>1?' · ×'+x.q:'')+'</span></div>'
      +'<div class="bxgp"><b>'+(x.sell*x.q)+' '+coinI+'</b>'+chip(x.chg)+'</div>'
      +(x.cost?'<small class="bxcost">Acheté '+x.cost+' · <span class="bxc'+cls(x.sell-x.cost)+'">'+(x.sell-x.cost>=0?'+':'−')+Math.abs(x.sell-x.cost)+'</span></small>':'')+'</div>';
  }
  function tickerHTML(){
    var L=(B.tk||[]).filter(function(x){return x.chg});
    if(!L.length)L=(B.tk||[]).slice(0,10);
    if(!L.length)return '<div class="bxtk"><div class="bxtr" style="animation:none"><span class="bxti">Ouverture du marché…</span></div></div>';
    L=L.slice().sort(function(a,b){return b.chg-a.chg}).slice(0,24);
    var one=L.map(function(x){var c=C[x.id];return '<span class="bxti"><b>'+esc(c.t)+'</b><em>'+x.p+'</em><i class="bxc'+cls(x.chg)+'">'+(x.chg>0?'▲ ':x.chg<0?'▼ ':'')+pct(x.chg)+'</i></span>'}).join('');
    return '<div class="bxtk" aria-label="Sons en hausse et en baisse"><div class="bxtr" style="--n:'+L.length+'">'+one+one+'</div></div>';
  }
  function sec(t,sub){return '<div class="bxsec"><b>'+t+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</div>'}
  function bodyHTML(){
    if(B.sub==='pf'){
      var P=B.pf;if(!P)return '<p class="cap">Chargement…</p>';
      var v=P.total0?(P.total-P.total0)*100/P.total0:0;
      var byR=[0,0,0,0,0,0];P.rows.forEach(function(x){byR[C[x.id].r]+=x.sell*x.q});var tot=byR.reduce(function(a,b){return a+b},0)||1,acc=0;
      var ring='conic-gradient('+byR.map(function(val,r){var a=acc;acc+=val/tot*360;return RAR[r].c+' '+a.toFixed(1)+'deg '+acc.toFixed(1)+'deg'}).join(',')+')';
      var sorted=P.rows.slice().sort(function(a,b){return b.chg-a.chg}),best=sorted[0],worst=sorted[sorted.length-1];
      return '<div class="bxpf"><div class="bxring" style="background:'+ring+'"><span><b>'+P.total.toLocaleString('fr-FR')+'</b><small>wax coins</small></span></div>'
        +'<div class="bxpfi"><span class="lbl">Valeur de tes sons</span>'+chip(Math.round(v*10)/10)+'<small>sur 24 h</small><span class="lbl" style="margin-top:8px">Résultat Bourse</span><b class="bxc'+cls(P.real)+'">'+(P.real>0?'+':P.real<0?'−':'')+Math.abs(P.real).toLocaleString('fr-FR')+' '+coinI+'</b></div>'
        +'<div class="bxleg">'+byR.map(function(val,r){return val?'<span><i style="background:'+RAR[r].c+'"></i>'+RAR[r].n+' '+Math.round(val/tot*100)+' %</span>':''}).join('')+'</div></div>'
        +(best&&worst&&best!==worst?'<div class="bxbw"><div class="bxbwc up" data-act="bxsee" data-id="'+best.id+'"><span class="lbl">Meilleur</span>'+tileHTML(C[best.id],{nocount:1,lock:false})+'<b>'+esc(C[best.id].t)+'</b>'+chip(best.chg)+'</div><div class="bxbwc dn" data-act="bxsee" data-id="'+worst.id+'"><span class="lbl">Pire</span>'+tileHTML(C[worst.id],{nocount:1,lock:false})+'<b>'+esc(C[worst.id].t)+'</b>'+chip(worst.chg)+'</div></div>':'')
        +sec('Tes sons',P.rows.length+' sons')+(P.rows.length?'<div class="bxgrid">'+P.rows.slice(0,120).map(pfRowHTML).join('')+'</div>':'<p class="cap">Aucun son</p>');
    }
    var top='<div class="bxs"><input id="bxq" type="search" placeholder="Chercher un son ou un artiste" value="'+esc(B.q)+'" autocomplete="off"></div>'
      +'<div class="chips">'+[['hot','Tendances'],['top','Les plus chers'],['mine','Mes sons']].map(function(z){return '<button class="chip" data-act="bxf" data-v="'+z[0]+'" aria-pressed="'+(B.f===z[0]&&!B.q)+'">'+z[1]+'</button>'}).join('')+'</div>';
    return top+'<div id="bxl" class="bxlist">'+listHTML()+'</div>'
      +'<p class="cap bxcap">Achat au cours +5 %, revente −5 %. '+(B.meta.pro?'WaxDrop Pro : achats et ventes illimités, Divins compris.':'Encore '+Math.max(0,B.meta.buys)+' achat'+(B.meta.buys>1?'s':'')+' et '+Math.max(0,B.meta.sells)+' vente'+(B.meta.sells>1?'s':'')+' aujourd’hui. Divins et illimité : WaxDrop Pro.')+'</p>';
  }
  function listHTML(){
    if(!B.list)return '<p class="cap">Chargement…</p>';
    var L=B.list;
    if(!L.length)return '<p class="cap">'+(B.q?'Aucun son trouvé':B.f==='mine'?'Aucun son':'Rien pour l’instant')+'</p>';
    if(B.q||B.f==='mine')return '<div class="bxgrid">'+L.map(function(x,i){return cardHTML(x,i)}).join('')+'</div>';
    if(B.f==='top')return podiumHTML(L.slice(0,3))+sec('Le classement','du 4e au '+L.length+'e')+'<div class="bxgrid">'+L.slice(3).map(function(x,i){return cardHTML(x,i,i+4)}).join('')+'</div>';
    var s=L.slice().sort(function(a,b){return b.chg-a.chg}),hero=s[0],up=s.filter(function(x){return x.chg>0&&x!==hero}).slice(0,8),dn=s.filter(function(x){return x.chg<0}).reverse().slice(0,8);
    var used={};[hero].concat(up,dn).forEach(function(x){if(x)used[x.id]=1});
    var rest=L.filter(function(x){return !used[x.id]});
    return heroHTML(hero)
      +(up.length?sec('Ça monte','sur 24 h')+'<div class="bxrow">'+up.map(moverHTML).join('')+'</div>':'')
      +(dn.length?sec('Ça baisse','sur 24 h')+'<div class="bxrow">'+dn.map(moverHTML).join('')+'</div>':'')
      +(rest.length?sec('Tout le marché')+'<div class="bxgrid">'+rest.map(function(x,i){return cardHTML(x,i)}).join('')+'</div>':'');
  }
  function ixHTML(){var ix=ECO.ix;return '<span class="wix sm'+(ix>0?' gn':ix===0?' z':'')+'">CAC Son '+(ix>0?'▲':ix<0?'▼':'=')+' '+fr(Math.abs(ix))+' %</span>'}
  var BG='<div class="bxbg" aria-hidden="true"><i class="g1"></i><i class="g2"></i><svg class="bxcand" viewBox="0 0 400 200" preserveAspectRatio="none">'+(function(){var s='',y=120;for(var i=0;i<26;i++){var o=y,c=Math.max(30,Math.min(170,y+(Math.sin(i*1.7)*22+Math.cos(i*.6)*14))),hi=Math.min(o,c)-6-(i*7%11),lo=Math.max(o,c)+5+(i*5%9),up=c<o;s+='<line x1="'+(i*15+8)+'" x2="'+(i*15+8)+'" y1="'+hi+'" y2="'+lo+'" class="'+(up?'u':'d')+'"/><rect x="'+(i*15+4)+'" y="'+Math.min(o,c)+'" width="8" height="'+Math.max(2,Math.abs(c-o))+'" class="'+(up?'u':'d')+'"/>';y=c}return s})()+'</svg></div>';
  function view(){
    var head='<div class="vh bxh"><h2>La Bourse</h2>'+ixHTML()+'</div>';
    var chips='<div class="chips">'+[['mkt','Marché'],['pf','Mon portefeuille']].map(function(z){return '<button class="chip" data-act="bxsub" data-v="'+z[0]+'" aria-pressed="'+(B.sub===z[0])+'">'+z[1]+'</button>'}).join('')+'</div>';
    if(Date.now()-B.t>60e3&&!B.load){if(B.sub==='pf')loadPf();else loadList()}
    if(!B.tk&&B.sub==='pf'&&!B.tkl){B.tkl=1;sb.rpc('bourse_list',{p_f:'hot',p_q:null,p_r:null}).then(function(r){if(!r.error){B.tk=(r.data.rows||[]).filter(function(x){return C[x.id]});ECO.ix=+r.data.ix||0;var t=$('bxtkw');if(t)t.innerHTML=tickerHTML()}})}
    return '<div class="view v-shop v-bx">'+BG+head+'<div id="bxtkw">'+tickerHTML()+'</div>'+chips+'<div class="bx" id="bxb">'+bodyHTML()+'</div></div>';
  }
  function paint(){
    if(tab!=='bourse')return;
    var t=$('bxtkw');if(t)t.innerHTML=tickerHTML();
    var w=document.querySelector('.v-bx .wix');if(w)w.outerHTML=ixHTML();
    var l=$('bxl');
    if(B.sub==='mkt'&&l&&document.activeElement&&document.activeElement.id==='bxq'){l.innerHTML=listHTML();return}
    var b=$('bxb');if(b&&quiet())b.innerHTML=bodyHTML();
  }
  window.vBourse=view;
  window.proLock=function(what){toast(what+' : réservé à WaxDrop Pro');setTimeout(function(){closeFull();shopSub='pass';setTab('shop')},700)};

  /* plus de variations simulées : les courbes ne bougent qu'avec les vrais achats, ventes et sorties d'albums */

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
    var s=$('bxstat');if(s){var h='<div><span>Plus haut</span><b>'+money(hi)+'</b></div><div><span>Plus bas</span><b>'+money(lo)+'</b></div><div><span>Chez les joueurs</span><b>'+F.x.held+'</b></div><div><span>Tu en as</span><b>'+F.x.own+'</b></div>';
      var vv=function(k){var q=F.x.pts[k]||[];return q.length>1?(q[q.length-1]-q[0])*100/q[0]:0};
      var vol=(function(){var q=(F.x.pts.m||a).map(Number),r=[];for(var i=1;i<q.length;i++)r.push(Math.log(q[i]/q[i-1]));if(!r.length)return 0;var m=r.reduce(function(x,y){return x+y},0)/r.length;return Math.sqrt(r.reduce(function(x,y){return x+(y-m)*(y-m)},0)/r.length)*100})();
      var pro='<div><span>Variation 7 j</span><b class="bxc'+cls(vv('w'))+'">'+pct(Math.round(vv('w')*10)/10)+'</b></div><div><span>Variation 30 j</span><b class="bxc'+cls(vv('m'))+'">'+pct(Math.round(vv('m')*10)/10)+'</b></div><div><span>Volatilité</span><b>'+(vol<1?'Calme':vol<3?'Normale':'Agitée')+'</b></div><div><span>Rareté</span><b>'+RAR[C[F.id]?C[F.id].r:0].n+'</b></div>';
      s.innerHTML=h+(hasPass()?pro:'<button class="bxpro" data-act="passinfo"><em class="pro">Pro</em> Variations 7 et 30 jours, volatilité, historique complet</button>')}
    var c=$('bxchg');if(c){c.className='bxc'+cls(v);c.textContent=pct(Math.round(v*10)/10)+' sur '+RG[F.rg].n}
  }
  function liveTip(){
    if(!F)return;var real=+F.x.pts[F.rg][F.x.pts[F.rg].length-1];
    F.live=real;
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
    var x=r.data;var rg0=hasPass()?((F&&F.rg)||'w'):'d';F={id:id,x:x,rg:rg0,live:+x.pts[rg0][x.pts[rg0].length-1],scrub:false};
    d.innerHTML='<div class="bxp"><b><span id="bxlive">'+money(F.live)+'</span> '+coinI+'</b><span id="bxchg" class="bxc"></span></div>'
      +'<div class="chips bxrg">'+['d','w','m'].map(function(k){var lk=k!=='d'&&!hasPass();return '<button class="chip'+(lk?' lk':'')+'" data-act="bxrg" data-v="'+k+'" aria-pressed="'+(F.rg===k)+'">'+RG[k].n+(lk?' <em class="pro">Pro</em>':'')+'</button>'}).join('')+'</div>'
      +'<div class="bxch" id="bxch"></div><p class="cap bxhint">Touche la courbe pour voir le prix à une date</p>'
      +'<div class="bxstat" id="bxstat"></div>'
      +(x.cost?'<p class="cap">Tu l’as acheté '+x.cost+' wax coins en moyenne.</p>':'')
      +'<div class="bxact">'
      +(x.can?'<button class="pbtn" data-act="bxbuy" data-id="'+id+'">Acheter · '+x.buy+' '+coinI+'</button>':'<button class="pbtn" data-act="gopass">Divin : avec WaxDrop Pro</button>')
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
  ECO.quote=async function(id){var el=$('qte');if(!el)return;var r=await sb.rpc('card_quote',{p_id:id});el=$('qte');if(!el)return;
    if(r.error||!r.data){el.innerHTML='<span>Bourse</span>';return}
    var v=+r.data.chg||0;el.className='qte'+(v>0?' bxup':v<0?' bxdn':'');el.innerHTML='<b>'+r.data.p+'</b><small>wax coins</small><em>'+(v>0?'▲':v<0?'▼':'=')+' '+fr(Math.abs(v))+' %</em>'};
  addEventListener('keydown',function(e){if(e.key==='Escape'&&$('bxfull'))closeFull()});
  addEventListener('resize',function(){if(F)drawChart()});

  async function trade(op,id,btn){
    if(btn)btn.disabled=true;
    var r=await ECO.op(op,{id:id});
    if(btn)btn.disabled=false;
    if(!r)return;
    toast((op==='bbuy'?'Acheté ':'Vendu ')+r.price+' wax coins'+(r.ul&&r.ul.length?' · récompense !':''));
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
    else if(a==='bxrg'){if(!F)return;if(t.dataset.v!=='d'&&!hasPass()){proLock('Historique sur 7 et 30 jours');return}F.rg=t.dataset.v;F.live=+F.x.pts[F.rg][F.x.pts[F.rg].length-1];t.parentElement.querySelectorAll('.chip').forEach(function(c){c.setAttribute('aria-pressed',c===t)});drawChart()}
    else if(a==='bxbuy')trade('bbuy',t.dataset.id,t);
    else if(a==='bxsell')trade('bsell',t.dataset.id,t);
  },true);
  document.addEventListener('input',function(e){
    if(e.target.id!=='bxq')return;
    B.q=e.target.value;clearTimeout(qT);
    qT=setTimeout(function(){if(B.q.trim().length===1)return;loadList()},350);
  });
  setInterval(function(){if(!document.hidden&&tab==='bourse'&&quiet()&&!$('bxfull')){if(B.sub==='pf')loadPf();else loadList()}},60e3);
  setTimeout(function(){if(CL.user)loadList()},4000);
})();

/* ---------- succès : vérifiés et payés par le serveur ---------- */
(function(){
  if(!window.CL||!CL.sb)return;
  var A=window.ACH={list:null,load:false};
  var CAT={col:'Collection',rar:'Raretés',alb:'Albums et artistes',soc:'Amis',bx:'Bourse'};
  var IC={col:'<circle cx="8.5" cy="9" r="4.5"/><circle cx="17" cy="15" r="3.5"/><circle cx="9.5" cy="18.5" r="2"/>',rar:'<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',alb:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',soc:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.6c2 .7 3.2 2.6 3.6 5.4"/>',bx:'<path d="M4 19h16"/><path d="M5 15l4-5 3.5 3L19 6"/><path d="M15 6h4v4"/>'};
  A.ready=function(){return (A.list||[]).filter(function(x){return !x.got&&x.v>=x.n}).length};
  A.fetch=async function(){if(!CL.user||A.load)return;A.load=true;try{var r=await CL.sb.rpc('ach_list');if(!r.error)A.list=r.data||[]}catch(e){}A.load=false;
    if(tab==='shop'&&(shopSub==='hub'||shopSub==='succes')&&!sh.innerHTML&&!ov.innerHTML)render();var d=$('shdot');if(d&&A.ready())d.hidden=false};
  A.view=function(){
    if(!A.list){A.fetch();return '<div class="view v-ach vs">'+subHead('Succès')+'<p class="cap">Chargement…</p></div>'}
    var L=A.list,got=L.filter(function(x){return x.got}).length,tot=L.reduce(function(s,x){return s+x.r},0),won=L.filter(function(x){return x.got}).reduce(function(s,x){return s+x.r},0);
    var g={};L.forEach(function(x){(g[x.cat]=g[x.cat]||[]).push(x)});
    return '<div class="view v-ach vs">'+subHead('Succès')
      +'<div class="achh"><div class="achr" style="--p:'+Math.round(got*100/Math.max(1,L.length))+'"><b>'+got+'</b><small>/ '+L.length+'</small></div><div><b>'+won.toLocaleString('fr-FR')+' '+coinI+' gagnés</b><small>'+(tot-won).toLocaleString('fr-FR')+' wax coins encore à gagner</small></div></div>'
      +(A.ready()?'<button class="pbtn achall" data-act="achall">Tout récupérer · '+A.ready()+' succès</button>':'')
      +Object.keys(CAT).filter(function(k){return g[k]}).map(function(k){return '<h3 class="achc">'+CAT[k]+'</h3><div class="achl">'+g[k].map(function(x,i){var ok=x.v>=x.n;
        return '<div class="achi'+(x.got?' got':ok?' ok':'')+'" style="--i:'+i+';--p:'+Math.round(x.v*100/x.n)+'"><span class="achic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+IC[k]+'</svg></span><span class="acht"><b>'+esc(x.t)+'</b><small>'+esc(x.d)+'</small><span class="achb"><i></i></span></span>'
          +(x.got?'<span class="achd">'+ICON.check+'</span>':ok?'<button class="pbtn achg" data-act="achc" data-k="'+x.k+'">+'+x.r+' '+coinI+'</button>':'<span class="achv"><b>'+x.v.toLocaleString('fr-FR')+'</b>/'+x.n.toLocaleString('fr-FR')+'<small>+'+x.r+' '+coinI+'</small></span>')+'</div>'}).join('')+'</div>'}).join('')
      +'</div>'};
  document.addEventListener('click',async function(e){var t=e.target.closest('[data-act="achall"]');if(!t)return;e.stopPropagation();t.disabled=true;
    var ks=(A.list||[]).filter(function(x){return !x.got&&x.v>=x.n}).map(function(x){return x.k}),sum=0;
    for(var i=0;i<ks.length;i++){var r;try{r=await CL.sb.rpc('ach_claim',{p_k:ks[i]})}catch(x){r={error:{message:'Connexion impossible, réessaie'}}}if(r.error){toast(r.error.message);break}sum+=r.data.coins||0;A.list=r.data.list}
    await ECO.sync(true);render();if(sum&&window.rewardPop)rewardPop({coins:sum},1)},true);
  document.addEventListener('click',async function(e){var t=e.target.closest('[data-act="achc"]');if(!t)return;e.stopPropagation();t.disabled=true;
    var r;try{r=await CL.sb.rpc('ach_claim',{p_k:t.dataset.k})}catch(x){r={error:{message:'Connexion impossible, réessaie'}}}
    if(r.error){toast(r.error.message);t.disabled=false;return}
    A.list=r.data.list;var c0=S.coins;await ECO.sync(true);render();if(window.rewardPop)rewardPop({coins:S.coins-c0||r.data.coins},1)},true);
  /* recharge les succès quand on revient sur le Disquaire */
  document.addEventListener('click',function(e){var t=e.target.closest('[data-tab="shop"],[data-act="shs"][data-v="succes"],[data-act="shs"][data-v="hub"]');if(t)setTimeout(A.fetch,50)},true);
  if(window.ECO){var oA=ECO.afterSync;ECO.afterSync=function(){if(oA)oA.apply(this,arguments);A.fetch()}}
})();

/* ---------- styles préférés : 2 max, ×2,5 de chances dans les drops ---------- */
(function(){
  if(!window.CL||!CL.sb)return;
  document.addEventListener('click',async function(e){var t=e.target.closest('[data-act="sty"]');if(!t)return;e.stopPropagation();
    var g=t.dataset.v,cur=(S.styles||[]).slice(),i=cur.indexOf(g);
    if(i>=0)cur.splice(i,1);else{if(cur.length>=2){toast('2 styles maximum');return}cur.push(g)}
    var prev=S.styles;S.styles=cur;render();
    var r;try{r=await CL.sb.rpc('style_set',{p_s:cur})}catch(x){r={error:{message:'Connexion impossible, réessaie'}}}
    if(r.error){S.styles=prev;toast(r.error.message);render();return}
    S.styles=r.data||cur;save();toast(cur.length?'Tes styles tombent 2,5× plus souvent':'Styles retirés')},true);
})();
