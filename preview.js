/* WaxDrop : extrait officiel (30 s, Deezer) joué quand une carte est révélée ou depuis la fiche d'un son. Réglable dans le menu.
   Les liens Deezer sont signés et expirent au bout de 15 min : on les garde en mémoire avec leur date d'expiration,
   on en redemande un frais s'il est trop vieux, et une seconde fois si la lecture échoue. */
(function(){
  var API='https://ptoncebyqakclxqnmlzk.supabase.co/functions/v1/preview?id=';
  var cache={},au=new Audio(),fadeT=null,stopT=null,cur=null,unlocked=false,pend=null,curUrl=null;
  au.preload='auto';au.volume=0;au.setAttribute('playsinline','');
  function on(){return S.set.prev!==false&&S.set.snd!==false}
  /* iOS : en session « ambient » (réglée par fx.js pour les bruitages), l'interrupteur silencieux coupe tout.
     Pendant un extrait on passe en « playback », comme une appli de musique, puis on revient en « ambient ». */
  function session(t){try{if(navigator.audioSession&&navigator.audioSession.type!==t)navigator.audioSession.type=t}catch(e){}}
  /* son muet de 20 ms, pour débloquer l'élément audio au premier toucher (sans source, play() échoue et rien n'est débloqué) */
  var SILENT=(function(){var n=160,b='RIFF'+le(36+n,4)+'WAVEfmt '+le(16,4)+le(1,2)+le(1,2)+le(8000,4)+le(8000,4)+le(1,2)+le(8,2)+'data'+le(n,4);for(var i=0;i<n;i++)b+='\x80';return 'data:audio/wav;base64,'+btoa(b);
    function le(v,k){var s='';for(var i=0;i<k;i++){s+=String.fromCharCode(v&255);v>>>=8}return s}})();
  function unlock(){
    /* un extrait refusé faute de geste (Safari, Chrome) repart au toucher suivant */
    if(pend&&cur===pend){pend=null;var q=au.play();if(q&&q.catch)q.catch(function(){});return}
    if(unlocked||cur)return;
    try{au.muted=true;au.src=SILENT;var p=au.play();
      if(p&&p.then)p.then(function(){unlocked=true;if(!cur){au.pause();au.muted=false}else au.muted=false},function(){au.muted=false});
      else{unlocked=true;au.muted=false}}catch(e){au.muted=false}}
  ['pointerdown','touchend','keydown'].forEach(function(ev){document.addEventListener(ev,unlock,{capture:true,passive:true})});
  function exp(u){var m=u&&u.match(/exp=(\d+)/);return m?+m[1]*1000:Infinity}
  function ok(e){return e&&(!e.d.url||exp(e.d.url)-Date.now()>90000)}
  /* on ne garde que les vraies réponses (lien ou « pas d'extrait ») ; une erreur réseau ou serveur n'est pas mémorisée */
  function get(id,fresh){
    var e=cache[id];if(!fresh&&e&&(e.p||ok(e)))return e.p||Promise.resolve(e.d);
    var p=fetch(API+encodeURIComponent(id)+(fresh?'&r='+Date.now():''),{cache:fresh?'no-store':'default'})
      .then(function(r){return r.ok?r.json():null})
      .then(function(d){
        if(d&&d.url&&exp(d.url)-Date.now()<90000&&!fresh)return get(id,true);
        if(d&&(d.url||d.none)){cache[id]={d:d};return d}
        delete cache[id];return null})
      .catch(function(){delete cache[id];return null});
    cache[id]={p:p};return p}
  function fade(to,ms,done){clearInterval(fadeT);var from=au.volume,t0=Date.now();fadeT=setInterval(function(){var p=Math.min(1,(Date.now()-t0)/ms);au.volume=Math.max(0,Math.min(1,from+(to-from)*p));if(p>=1){clearInterval(fadeT);if(done)done()}},40)}
  function live(v){var q=document.querySelector('.rvw .rsq');if(q)q.classList.toggle('live',v)}
  /* les événements du son muet de déblocage (fin, erreur) peuvent arriver après le début d'un extrait : on les ignore */
  function mine(){return !!cur&&!!curUrl&&au.currentSrc===curUrl}
  au.addEventListener('playing',function(){if(mine())live(true)});
  au.addEventListener('pause',function(){live(false)});
  au.addEventListener('ended',function(){if(mine())PV.stop(0)});
  /* lien expiré ou refusé : on en redemande un frais, une seule fois */
  var retry={};
  au.addEventListener('error',function(){var c=cur&&retry[cur.id];if(!mine())return;
    if(c===undefined){retry[cur.id]=1;delete cache[cur.id];start(cur.c,cur.o,true)}
    else{if(cur.o.from){cur.o.from.classList.remove('on');toast('Extrait indisponible pour le moment')}PV.stop(0)}});
  function start(c,o,fresh){var id=c.id,me={id:id,c:c,o:o};cur=me;
    get(id,fresh).then(function(d){if(cur!==me)return;
      if(!d||!d.url){if(o.from){o.from.classList.remove('on');toast(d&&d.none?'Pas d\'extrait pour ce son':'Extrait indisponible, réessaie')}cur=null;return}
      clearTimeout(stopT);au.pause();au.muted=false;au.src=d.url;curUrl=au.src;au.volume=0;session('playback');
      /* à la révélation on démarre un peu après le début, là où le morceau est lancé */
      if(!o.force)au.addEventListener('loadedmetadata',function m(){au.removeEventListener('loadedmetadata',m);try{if(cur===me&&au.duration>20)au.currentTime=Math.min(8,au.duration-14)}catch(e){}});
      var p=au.play();
      if(p&&p.catch)p.catch(function(err){if(cur!==me)return;
        /* lecture refusée faute de geste : elle repartira au prochain toucher */
        if(err&&err.name==='NotAllowedError'){pend=me;return}
        if(o.from)o.from.classList.remove('on')});
      fade(c.r>=4?.85:.7,o.force?400:900);
      if(o.force){if(o.from&&!o.from.querySelector('small')){var s=document.createElement('small');s.textContent='Deezer';o.from.appendChild(s)}}
      else{stopT=setTimeout(function(){PV.stop(1500)},12000)}})}
  window.PV={
    playing:function(){return !!cur&&!au.paused},
    prefetch:function(cards){if(!on())return;(cards||[]).forEach(function(c){if(c&&c.r>=1)get(c.id)})},
    /* o.force : lancé à la main depuis la fiche (extrait entier, même si les extraits auto sont coupés) */
    play:function(c,o){o=o||{};if(!c||(!o.force&&!on()))return;delete retry[c.id];start(c,o,false)},
    stop:function(ms){cur=null;pend=null;curUrl=null;clearTimeout(stopT);document.querySelectorAll('.pvsee.on').forEach(function(e){e.classList.remove('on')});
      var end=function(){if(!cur){au.pause();session('ambient')}};
      if(au.paused){session('ambient');return}if(!ms){end();return}fade(0,ms,end)}
  };
  document.addEventListener('click',function(e){var t=e.target.closest('[data-act="prev"]');if(!t)return;e.stopPropagation();S.set.prev=S.set.prev===false;save();t.setAttribute('aria-checked',S.set.prev!==false);if(S.set.prev===false)PV.stop(200)},true);
  document.addEventListener('visibilitychange',function(){if(document.hidden)PV.stop(0)});
})();
