/* WaxDrop : extrait officiel (30 s, Deezer) joué quand une carte est révélée ou depuis la fiche d'un son. Réglable dans le menu. */
(function(){
  var API='https://ptoncebyqakclxqnmlzk.supabase.co/functions/v1/preview?id=';
  var cache={},au=new Audio(),fadeT=null,stopT=null,cur=null,unlocked=false;
  au.preload='auto';au.volume=0;
  function on(){return S.set.prev!==false&&S.set.snd!==false}
  /* iOS : l'élément audio doit être « débloqué » par un premier toucher */
  function unlock(){if(unlocked)return;unlocked=true;try{au.muted=true;var p=au.play();if(p&&p.then)p.then(function(){au.pause();au.muted=false},function(){au.muted=false});else au.muted=false}catch(e){au.muted=false}}
  document.addEventListener('pointerdown',unlock,{once:true,capture:true});
  function get(id){if(cache[id])return cache[id];cache[id]=fetch(API+encodeURIComponent(id)).then(function(r){return r.json()}).catch(function(){delete cache[id];return {none:true}});return cache[id]}
  function fade(to,ms,done){clearInterval(fadeT);var from=au.volume,t0=Date.now();fadeT=setInterval(function(){var p=Math.min(1,(Date.now()-t0)/ms);au.volume=Math.max(0,Math.min(1,from+(to-from)*p));if(p>=1){clearInterval(fadeT);if(done)done()}},40)}
  function badge(d){var box=document.querySelector('.rvw');if(!box||box.querySelector('.pvb'))return;var a=document.createElement('a');a.className='pvb';a.href=d.link||'https://www.deezer.com';a.target='_blank';a.rel='noopener';a.innerHTML='<span class="pveq"><i></i><i></i><i></i></span>Extrait · Deezer';box.appendChild(a)}
  function live(v){var q=document.querySelector('.rvw .rsq');if(q)q.classList.toggle('live',v)}
  au.addEventListener('playing',function(){if(cur)live(true)});
  au.addEventListener('pause',function(){live(false)});
  au.addEventListener('ended',function(){PV.stop(0)});
  window.PV={
    playing:function(){return !!cur&&!au.paused},
    prefetch:function(cards){if(!on())return;(cards||[]).forEach(function(c){if(c&&c.r>=1)get(c.id)})},
    /* o.force : lancé à la main depuis la fiche (extrait entier, même si les extraits auto sont coupés) */
    play:function(c,o){o=o||{};if(!c||(!o.force&&!on()))return;var id=c.id;cur=id;
      get(id).then(function(d){if(cur!==id)return;
        if(!d||!d.url){if(o.from){o.from.classList.remove('on');toast('Pas d\'extrait pour ce son')}cur=null;return}
        clearTimeout(stopT);au.pause();au.src=d.url;au.volume=0;
        var p=au.play();if(p&&p.catch)p.catch(function(){if(o.from)o.from.classList.remove('on')});
        /* à la révélation on démarre un peu après le début, là où le morceau est lancé */
        if(!o.force)au.addEventListener('loadedmetadata',function m(){au.removeEventListener('loadedmetadata',m);try{if(au.duration>20)au.currentTime=Math.min(8,au.duration-14)}catch(e){}});
        fade(c.r>=4?.85:.7,o.force?400:900);
        if(o.force){if(o.from&&!o.from.querySelector('small')){var s=document.createElement('small');s.textContent='Deezer';o.from.appendChild(s)}}
        else{badge(d);stopT=setTimeout(function(){PV.stop(1500)},12000)}})},
    stop:function(ms){cur=null;clearTimeout(stopT);document.querySelectorAll('.pvsee.on').forEach(function(e){e.classList.remove('on')});if(au.paused)return;if(!ms){au.pause();return}fade(0,ms,function(){if(!cur)au.pause()})}
  };
  document.addEventListener('click',function(e){var t=e.target.closest('[data-act="prev"]');if(!t)return;e.stopPropagation();S.set.prev=S.set.prev===false;save();t.setAttribute('aria-checked',S.set.prev!==false);if(S.set.prev===false)PV.stop(200)},true);
  document.addEventListener('visibilitychange',function(){if(document.hidden)PV.stop(0)});
})();
