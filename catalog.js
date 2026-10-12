/* TrackDex : catalogue Spotify (Supabase). Ajouté au jeu au lancement, mis à jour en arrière-plan. */
(function(){
  var URL='https://ptoncebyqakclxqnmlzk.supabase.co',KEY='sb_publishable_6-9wecVefsCjpqMPnh9Afg_-x-PIjhv',CK='td-catalog-v1';
  window.CATIMG={a:{},b:{},s:{}};
  function h(s){var x=2166136261;for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return (x>>>0)/4294967296}
  function key(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
  var G={'rap-fr':'FR','rap-us':'US','rap-uk':'UK','global':'Monde'};
  // écoutes fictives (en millions) pour la rareté : la plupart Commun ou Rare, quelques sons plus rares
  function streams(seed){var r=h(seed);return r<.55?Math.round(5+r*80):r<.85?Math.round(60+r*160):r<.96?Math.round(220+r*300):r<.993?Math.round(560+r*400):Math.round(1050+r*900)}
  function merge(list){
    if(!Array.isArray(list)||typeof RAW==='undefined')return;
    var have={};RAW.forEach(function(A){have[key(A.n)]=A});
    list.forEach(function(x){
      if(!x||!x.n)return;
      if(x.i)CATIMG.a[x.n]=x.i;
      (x.al||[]).forEach(function(b){if(b.c)CATIMG.b[x.n+'|'+b.t]=b.c});
      (x.sg||[]).forEach(function(b){if(b.c)CATIMG.s[x.n+'|'+b.t]=b.c});
      if(have[key(x.n)])return; // artiste déjà présent : on ne touche pas aux cartes existantes
      var al=(x.al||[]).filter(function(b){return b.tr&&b.tr.length}).map(function(b){return{t:b.t,y:+b.y||2020,b:40,tr:b.tr.map(function(t){return[t,streams(x.n+'|'+t)]})}});
      var sg=(x.sg||[]).map(function(b){return[b.t,streams(x.n+'|'+b.t),+b.y||2020]});
      if(!al.length&&!sg.length)return;
      RAW.push({n:x.n,g:G[x.s]||'Monde',al:al,sg:sg});
    });
  }
  try{var c=localStorage.getItem(CK);if(c)merge(JSON.parse(c))}catch(e){}
  addEventListener('load',function(){
    setTimeout(function(){
      fetch(URL+'/rest/v1/rpc/catalog_dump',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:'{}'})
        .then(function(r){return r.ok?r.text():null})
        .then(function(t){if(!t)return;try{localStorage.setItem(CK,t)}catch(e){try{localStorage.removeItem(CK)}catch(_){}}})
        .catch(function(){});
    },3000);
  });
})();
