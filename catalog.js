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
    var have={};RAW.forEach(function(A){have[key(A.n)]=A});
    dump.a.forEach(function(x){
      if(!x||!x.n)return;
      if(x.i)CATIMG.a[x.n]=x.i;
      var kx=key(x.n);if(x.st&&have[kx])have[kx].st=x.st;
      (x.al||[]).forEach(function(b){if(b.c)CATIMG.b[x.n+'|'+b.t]=b.c});
      if(x.base)return;
      (x.sg||[]).forEach(function(s){if(s[6])CATIMG.s[x.n+'|'+s[0]]=s[6]});
      var al=(x.al||[]).filter(function(b){return b.tr&&b.tr.length}).map(function(b){return{k:b.k,t:b.t,y:+b.y||2020,b:40,tr:b.tr}});
      var sg=(x.sg||[]).map(function(s){return[s[0],s[1],+s[2]||2020,null,s[4],s[5]]});
      if(!al.length&&!sg.length)return;
      if(have[kx]){
        /* artiste déjà dans le jeu de base : on ajoute ses autres albums et singles, sans doublons */
        var R0=have[kx];
        var tk={},ak={};(R0.al||[]).forEach(function(b){ak[key(b.t)]=b;(b.tr||[]).forEach(function(t){tk[key(typeof t==='string'?t:t[0])]=1})});(R0.sg||[]).forEach(function(t){tk[key(t[0])]=1});
        al.forEach(function(b){b.tr=b.tr.filter(function(t){if(tk[key(t[0])])return false;tk[key(t[0])]=1;return true});if(!b.tr.length)return;var same=ak[key(b.t)];if(same){same.tr=(same.tr||[]).concat(b.tr)}else{R0.al=R0.al||[];R0.al.push(b)}});
        sg.forEach(function(t){if(tk[key(t[0])])return;tk[key(t[0])]=1;R0.sg=R0.sg||[];R0.sg.push(t)});
        return}
      RAW.push({n:x.n,k:x.k,g:G[x.s]||'Monde',st:x.st||null,al:al,sg:sg});have[kx]=RAW[RAW.length-1];
    });
    window.CATV=dump.v||null;
  }
  /* Le catalogue (plusieurs Mo) est rangé dans IndexedDB, sans la limite d'environ 5 Mo du stockage local de Safari.
     Le reste de l'app ne démarre qu'une fois le catalogue chargé, pour que tous les artistes soient là dès l'ouverture. */
  var REST=['/app.js','/vendor/supabase.js','/cloud.js','/eco.js','/social.js','/vendor/motion.js','/fx.js','/share.js','/stats.js','/preview.js','/polish.js'];
  var started=false;
  function boot(){if(started)return;started=true;REST.forEach(function(src){var el=document.createElement('script');el.src=src;el.async=false;document.body.appendChild(el)});
    setTimeout(refresh,4000)}
  function db(){return new Promise(function(ok,ko){if(!window.indexedDB)return ko(new Error('idb'));var r=indexedDB.open('waxdrop',1);
    r.onupgradeneeded=function(){r.result.createObjectStore('kv')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){ko(r.error)}})}
  function idbGet(k){return db().then(function(d){return new Promise(function(ok,ko){var q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=function(){ok(q.result||null)};q.onerror=function(){ko(q.error)}})})}
  function idbSet(k,v){return db().then(function(d){return new Promise(function(ok,ko){var t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=function(){ok()};t.onerror=function(){ko(t.error)}})})}
  function get(){return fetch(URL+'/rest/v1/rpc/catalog_dump2',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:'{}'}).then(function(r){return r.ok?r.text():null}).catch(function(){return null})}
  function refresh(){get().then(function(t){if(t)idbSet(CK,t).catch(function(){})})}
  function use(t){if(!t||started)return;try{merge(JSON.parse(t))}catch(e){}}
  /* ancienne version : catalogue dans localStorage, on le déplace */
  var old=null;try{old=localStorage.getItem(CK)}catch(e){}
  if(old){use(old);boot();idbSet(CK,old).then(function(){try{localStorage.removeItem(CK)}catch(e){}}).catch(function(){});return}
  var guard=setTimeout(boot,2500);
  idbGet(CK).then(function(t){
    if(t){use(t);clearTimeout(guard);boot();return}
    /* premier lancement : on attend le catalogue au plus 4 s */
    clearTimeout(guard);var g2=setTimeout(boot,4000);
    get().then(function(t2){if(t2){use(t2);idbSet(CK,t2).catch(function(){})}clearTimeout(g2);boot()});
  }).catch(function(){clearTimeout(guard);boot()});
})();
