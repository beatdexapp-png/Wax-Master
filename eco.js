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
    S.freeAt=+new Date(w.free_at)||0;S.xp=w.sxp||0;
    var cl=w.claims||{};S.ul=Object.assign({},cl.ul||{});S.sfree=(cl.sf||[]).slice();S.codes=Object.assign({},cl.codes||{});
    var d=w.day||{};S.day=d.d===today()?Object.assign(fresh0(),d,{cl:Object.assign({},d.cl||{})}):fresh0();
    save();setCoins();
  };
  /* appel brut : renvoie {error} ou les données */
  ECO.call=async function(op,a){
    if(!CL.user)return{error:'Connexion requise'};
    var r=await sb.rpc('eco',{p_op:op,p_a:a||{}});
    if(r.error)return{error:r.error.message};
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
  window.sClaim=async function(i,t){if(t==='p'){toast('Pass bientôt disponible');return}var r=await ECO.op('season',{i:+i,t:'f'});if(!r)return;toast('Récompense ajoutée');render()};
  window.buyCoins=async function(k){
    if(k==='nacre'||k==='diamant'){if(S.coins<PK[k].p){needCoins(PK[k].p-S.coins);return}openPack(k);return}
    var P={gold:GOLD_COST,lot5:450,dust:300}[k];if(!P)return;if(S.coins<P){needCoins(P-S.coins);return}
    var r=await ECO.op('item',{k:k});if(!r)return;
    toast(k==='gold'?'Maxi Or ajouté':k==='lot5'?'5 maxis ajoutés':'+200 poussière');render();
  };
  /* paiements réels : pas encore branchés (Stripe) */
  window.buyFlow=function(){toast('Paiement bientôt disponible')};
  window.buyOk=function(){closeDD();toast('Paiement bientôt disponible')};
  window.claim=function(){};

  /* ---------- Bourse ---------- */
  function pct(v){v=+v||0;return (v>0?'+':v<0?'−':'')+fr(Math.abs(v))+' %'}
  function cls(v){return v>0?' bxup':v<0?' bxdn':''}
  async function loadList(){
    B.load=true;
    var q=B.q.trim();
    var r=await sb.rpc('bourse_list',{p_f:B.f,p_q:q.length>1?q:null,p_r:null});
    B.load=false;
    if(r.error){toast(r.error.message);return}
    B.list=(r.data.rows||[]).filter(function(x){return C[x.id]});
    B.meta={buys:r.data.buys,sells:r.data.sells};
    if(!q&&B.f==='hot')ECO.ix=+r.data.ix||0;
    B.t=Date.now();paint();
  }
  async function loadPf(){
    var r=await sb.rpc('bourse_portfolio');
    if(r.error){toast(r.error.message);return}
    B.pf=r.data;B.pf.rows=(B.pf.rows||[]).filter(function(x){return C[x.id]});B.t=Date.now();paint();
  }
  function rowHTML(x){
    var c=C[x.id],R=RAR[c.r];
    var btn=x.can?'<button class="lbtn" data-act="bxbuy" data-id="'+x.id+'">'+x.buy+' '+coinI+'</button>'
      :'<span class="bxl">Packs<br>uniquement</span>';
    return '<div class="lr bxr" data-act="bxsee" data-id="'+x.id+'"><span class="lth">'+tileHTML(c,{nocount:1,lock:false})+'</span>'
      +'<div class="li"><b>'+esc(c.t)+'</b><span><i style="background:'+R.c+'"></i>'+esc(c.a)+'</span><small>'+R.n+(x.own?' · tu en as '+x.own:'')+'</small></div>'
      +'<div class="lp"><b>'+x.p+' '+coinI+'</b><small class="bxc'+cls(x.chg)+'">'+pct(x.chg)+'</small></div>'+btn+'</div>';
  }
  function pfRowHTML(x){
    var c=C[x.id],R=RAR[c.r];
    var res=x.cost?'<small>Acheté '+x.cost+' · '+(x.sell-x.cost>=0?'+':'−')+Math.abs(x.sell-x.cost)+'</small>':'<small>'+R.n+'</small>';
    return '<div class="lr bxr" data-act="bxsee" data-id="'+x.id+'"><span class="lth">'+tileHTML(c,{nocount:1,lock:false})+'</span>'
      +'<div class="li"><b>'+esc(c.t)+'</b><span><i style="background:'+R.c+'"></i>'+esc(c.a)+(x.q>1?' · ×'+x.q:'')+'</span>'+res+'</div>'
      +'<div class="lp"><b>'+(x.sell*x.q)+' '+coinI+'</b><small class="bxc'+cls(x.chg)+'">'+pct(x.chg)+'</small></div></div>';
  }
  function bodyHTML(){
    if(B.sub==='pf'){
      var P=B.pf;if(!P)return '<p class="cap">Chargement…</p>';
      var v=P.total0?(P.total-P.total0)*100/P.total0:0;
      return '<div class="bxsum glass"><div><span class="lbl">Valeur de tes sons</span><b>'+P.total.toLocaleString('fr-FR')+' '+coinI+'</b><small class="bxc'+cls(v)+'">'+pct(Math.round(v*10)/10)+' sur 24 h</small></div>'
        +'<div><span class="lbl">Résultat Bourse</span><b class="bxc'+cls(P.real)+'">'+(P.real>0?'+':P.real<0?'−':'')+Math.abs(P.real).toLocaleString('fr-FR')+'</b><small>ventes moins achats</small></div></div>'
        +'<p class="cap">Valeur au prix de revente actuel. Touche un son pour voir sa courbe.</p>'
        +(P.rows.length?P.rows.slice(0,150).map(pfRowHTML).join(''):'<p class="cap">Aucun son</p>');
    }
    var L=B.list;
    var top='<div class="bxs"><input id="bxq" type="search" placeholder="Chercher un son ou un artiste" value="'+esc(B.q)+'" autocomplete="off"></div>'
      +'<div class="chips">'+[['hot','Tendances'],['mine','Mes sons']].map(function(z){return '<button class="chip" data-act="bxf" data-v="'+z[0]+'" aria-pressed="'+(B.f===z[0]&&!B.q)+'">'+z[1]+'</button>'}).join('')+'</div>'
      +'<p class="cap">Achat au cours +5 %, vente au cours −5 %. Aujourd’hui : '+B.meta.buys+' achat'+(B.meta.buys>1?'s':'')+' et '+B.meta.sells+' vente'+(B.meta.sells>1?'s':'')+' restants. Mythiques et Divins : packs uniquement.</p>';
    return top+'<div id="bxl">'+listHTML()+'</div>';
  }
  function listHTML(){
    if(!B.list)return '<p class="cap">Chargement…</p>';
    if(!B.list.length)return '<p class="cap">'+(B.q?'Aucun son trouvé':B.f==='mine'?'Aucun son':'Rien pour l’instant')+'</p>';
    return B.list.map(rowHTML).join('');
  }
  function view(){
    var ix=ECO.ix;
    var head=subHead('La Bourse','<span class="wix sm'+(ix>0?' gn':ix===0?' z':'')+'">CAC Son '+(ix>0?'▲':ix<0?'▼':'=')+' '+fr(Math.abs(ix))+' %</span>');
    var chips='<div class="chips">'+[['mkt','Marché'],['pf','Mon portefeuille']].map(function(z){return '<button class="chip" data-act="bxsub" data-v="'+z[0]+'" aria-pressed="'+(B.sub===z[0])+'">'+z[1]+'</button>'}).join('')
      +'<button class="chip" data-act="shs" data-v="encheres">Enchères</button></div>';
    if(Date.now()-B.t>60e3&&!B.load){if(B.sub==='pf')loadPf();else loadList()}
    return '<div class="view v-shop">'+head+chips+'<div class="bx" id="bxb">'+bodyHTML()+'</div></div>';
  }
  function paint(){
    if(tab!=='shop'||shopSub!=='cours')return;
    var l=$('bxl');
    if(B.sub==='mkt'&&l&&document.activeElement&&document.activeElement.id==='bxq'){l.innerHTML=listHTML();return}
    var b=$('bxb');if(b&&quiet())b.innerHTML=bodyHTML();
    var w=document.querySelector('.v-shop .wix');if(w){var ix=ECO.ix;w.className='wix sm'+(ix>0?' gn':ix===0?' z':'');w.textContent='CAC Son '+(ix>0?'▲':ix<0?'▼':'=')+' '+fr(Math.abs(ix))+' %'}
  }
  var origShop=window.vShop;
  window.vShop=function(){return shopSub==='cours'?view():origShop()};

  /* fiche d'un son : courbe 7 jours, achat et vente */
  function curve(pts){
    var W=300,H=110,mn=Math.min.apply(null,pts),mx=Math.max.apply(null,pts),sp=Math.max(1,mx-mn);
    var p=pts.map(function(v,i){return (i*W/(pts.length-1)).toFixed(1)+','+(H-6-(v-mn)*(H-12)/sp).toFixed(1)}).join(' ');
    var up=pts[pts.length-1]>=pts[0];
    return '<svg class="bxcv'+(up?' bxup':' bxdn')+'" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,'+H+' '+p+' '+W+','+H+'"/><polyline points="'+p+'"/></svg>'
      +'<div class="bxax"><span>il y a 7 j</span><span>'+mn+' – '+mx+' '+coinI+'</span><span>maintenant</span></div>';
  }
  async function bxSee(id){
    var c=C[id];if(!c)return;
    menuPage='bourse';
    sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="'+esc(c.t)+'"><div class="grab"></div><div class="shh"><h2>Cours</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div><div id="bxd"><p class="cap">Chargement…</p></div></div>';
    var r=await sb.rpc('bourse_card',{p_id:id});
    var el=$('bxd');if(!el)return;
    if(r.error){el.innerHTML='<p class="cap">'+esc(r.error.message)+'</p>';return}
    var x=r.data,v=x.pts[0]?(x.p-x.pts[0])*100/x.pts[0]:0;
    el.innerHTML='<div class="sellh"><div class="sth">'+tileHTML(c,{nocount:1,lock:false})+'</div><div><b>'+esc(c.t)+'</b><small>'+esc(c.a)+' · '+RAR[c.r].n+'</small><small>Tu en as '+x.own+' · '+x.held+' chez les joueurs</small></div></div>'
      +'<div class="bxp"><b>'+x.p+' '+coinI+'</b><span class="bxc'+cls(v)+'">'+pct(Math.round(v*10)/10)+' sur 7 jours</span></div>'
      +curve(x.pts)
      +(x.cost?'<p class="cap">Tu l’as acheté '+x.cost+' jetons en moyenne.</p>':'')
      +'<div class="row">'
      +(x.can?'<button class="pbtn" data-act="bxbuy" data-id="'+id+'">Acheter · '+x.buy+' '+coinI+'</button>':'<button class="pbtn" disabled>Packs uniquement</button>')
      +'<button class="gbtn" data-act="bxsell" data-id="'+id+'"'+(x.own?'':' disabled')+'>Vendre · '+x.sell+' '+coinI+'</button></div>'
      +(x.own===1?'<p class="cap">C’est ton seul exemplaire : il quittera ta collection.</p>':'');
  }
  async function trade(op,id,btn){
    if(btn)btn.disabled=true;
    var r=await ECO.op(op,{id:id});
    if(btn)btn.disabled=false;
    if(!r)return;
    toast((op==='bbuy'?'Acheté ':'Vendu ')+r.price+' jetons'+(r.ul&&r.ul.length?' · récompense !':''));
    B.t=0;B.pf=null;
    if(sh.innerHTML&&menuPage==='bourse')bxSee(id);
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
    else if(a==='bxbuy')trade('bbuy',t.dataset.id,t);
    else if(a==='bxsell')trade('bsell',t.dataset.id,t);
  },true);
  document.addEventListener('input',function(e){
    if(e.target.id!=='bxq')return;
    B.q=e.target.value;clearTimeout(qT);
    qT=setTimeout(function(){if(B.q.trim().length===1)return;loadList()},350);
  });
  setInterval(function(){if(!document.hidden&&tab==='shop'&&shopSub==='cours'&&quiet()){if(B.sub==='pf')loadPf();else loadList()}},60e3);
  /* l'indice du hub */
  setTimeout(function(){if(CL.user)loadList()},4000);
})();
