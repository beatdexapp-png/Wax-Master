/* WaxDrop : catalogue Spotify (Supabase). Ajouté au jeu au lancement, mis à jour en arrière-plan.
   Les identifiants et raretés des sons viennent du serveur, qui s'en sert aussi pour les tirages. */
(function(){
  var URL='https://ptoncebyqakclxqnmlzk.supabase.co',KEY='sb_publishable_6-9wecVefsCjpqMPnh9Afg_-x-PIjhv',CK='td-catalog-v2';
  window.CATIMG={a:{},b:{},s:{}};window.CATV=null;
  try{localStorage.removeItem('td-catalog-v1')}catch(e){}
  function key(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
  var G={'rap-fr':'FR','rap-us':'US','rap-uk':'UK','global':'Monde'};
  function merge(dump){
    if(!dump||!Array.isArray(dump.a)||typeof RAW==='undefined')return;
    var have={};RAW.forEach(function(A){have[key(A.n)]=1});
    dump.a.forEach(function(x){
      if(!x||!x.n)return;
      if(x.i)CATIMG.a[x.n]=x.i;
      (x.al||[]).forEach(function(b){if(b.c)CATIMG.b[x.n+'|'+b.t]=b.c});
      if(x.base||have[key(x.n)])return;
      (x.sg||[]).forEach(function(s){if(s[6])CATIMG.s[x.n+'|'+s[0]]=s[6]});
      var al=(x.al||[]).filter(function(b){return b.tr&&b.tr.length}).map(function(b){return{k:b.k,t:b.t,y:+b.y||2020,b:40,tr:b.tr}});
      var sg=(x.sg||[]).map(function(s){return[s[0],s[1],+s[2]||2020,null,s[4],s[5]]});
      if(!al.length&&!sg.length)return;
      RAW.push({n:x.n,k:x.k,g:G[x.s]||'Monde',al:al,sg:sg});
    });
    window.CATV=dump.v||null;
  }
  try{var c=localStorage.getItem(CK);if(c)merge(JSON.parse(c))}catch(e){}
  addEventListener('load',function(){
    setTimeout(function(){
      fetch(URL+'/rest/v1/rpc/catalog_dump2',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:'{}'})
        .then(function(r){return r.ok?r.text():null})
        .then(function(t){if(!t)return;try{localStorage.setItem(CK,t)}catch(e){try{localStorage.removeItem(CK)}catch(_){}}})
        .catch(function(){});
    },3000);
  });
})();
