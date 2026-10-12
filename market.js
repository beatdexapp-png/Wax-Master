/* BeatDex : la Bourse entre vrais joueurs (Supabase) */
(function(){
  if(!window.CL||!CL.sb)return;
  var sb=CL.sb,busy=false,lastSig='',n=0;
  function me(){return CL.user&&CL.user.id}
  function onBourse(){return tab==='shop'&&(shopSub==='encheres'||shopSub==='hub')}
  function map(r){var u=me();return{id:'s'+r.id,sid:r.id,cid:r.card_id,seller:r.seller_name||'Joueur',cur:r.cur_price,
    lead:r.leader?(r.leader===u?'me':'other'):null,myBid:0,bids:r.bids,t0:+new Date(r.created_at),ends:+new Date(r.ends_at),
    h:r.hist&&r.hist.length?r.hist:[r.start_price],mine:r.seller===u}}
  async function refresh(force){
    if(!me()||busy)return;busy=true;
    try{
      var r=await sb.from('listings').select('id,seller,seller_name,card_id,start_price,cur_price,leader,bids,hist,created_at,ends_at')
        .gt('ends_at',new Date().toISOString()).order('ends_at',{ascending:true}).limit(150);
      if(r.error)return;
      mkInit();S.mk.list=r.data.filter(function(x){return C[x.card_id]}).map(map);
      var sig=S.mk.list.map(function(l){return l.id+':'+l.cur+':'+l.lead}).join('|');
      if(force||sig!==lastSig){lastSig=sig;if(onBourse()&&!ov.innerHTML&&!sh.innerHTML&&!dd.innerHTML)render();else mkPaint()}
    }finally{busy=false}
  }
  async function events(){
    if(!me())return;
    var r=await sb.rpc('market_events');if(r.error||!r.data)return;
    var d=r.data,notes=[];
    if(d.refund>0){S.coins+=d.refund;notes.push(d.refund+' jetons rendus après une surenchère')}
    (d.won||[]).forEach(function(w){if(C[w.card]){S.owned[w.card]=(S.owned[w.card]||0)+1;notes.push('Remporté : '+C[w.card].t)}});
    (d.sold||[]).forEach(function(x){var c=C[x.card];if(!c)return;
      if(x.sold){S.coins+=x.price;notes.push(c.t+' vendu '+x.price+' jetons')}else{S.owned[x.card]=(S.owned[x.card]||0)+1;notes.push(c.t+' invendu, rendu')}});
    if(notes.length){checkUnlocks();save();setCoins();toast(notes[notes.length-1]);if(!reveal&&!ov.innerHTML&&!sh.innerHTML)render()}
  }

  /* on remplace la simulation par le vrai marché */
  window.mkTick=function(){return false};
  window.bid=async function(id){
    var l=S.mk.list.find(function(x){return x.id===id});if(!l||l.mine||l.lead==='me')return;
    var nb=nextBid(l);if(S.coins<nb){toast('Pas assez de jetons');return}
    var r=await sb.rpc('place_bid',{p_id:l.sid});
    if(r.error){toast(r.error.message);refresh(true);return}
    S.coins-=r.data.cur_price;day().bid++;save();setCoins();toast('Tu es en tête');refresh(true);
  };
  window.listCard=async function(id){
    var c=C[id];if(!c||(S.owned[id]||0)<2)return;
    if(S.mk.list.filter(function(l){return l.mine}).length>=mkMax()){toast('5 ventes maximum');return}
    var sp=sh.querySelector('[data-act=sp][aria-pressed=true]'),sd=sh.querySelector('[data-act=sd][aria-pressed=true]');
    var p=sp?+sp.dataset.v:valOf(c),m=sd?+sd.dataset.v:15;
    S.owned[id]--;save();
    var r=await sb.rpc('create_listing',{p_card:id,p_price:p,p_minutes:m});
    if(r.error){S.owned[id]++;save();toast(r.error.message);return}
    day().sell++;save();closeMenu();shopSub='encheres';mkSub='mine';await refresh(true);render();toast('Mis en vente');
  };

  window.MK={kick:function(){refresh(true);events()}};
  setInterval(function(){n++;if(!me()||document.hidden)return;if(onBourse())refresh();if(n%5===0)events()},4000);
})();
