/* WaxDrop : sons « Archives », publiés par l'artiste sur sa chaîne YouTube officielle mais absents de Deezer (demande de @KLK, 12/11/2026).
   Aucun fichier audio chez nous : la fiche du son ouvre le lecteur YouTube officiel intégré (youtube-nocookie), seulement au toucher.
   Les cartes elles-mêmes sont en base (table cards) ; ici on ne garde que le lien vers la vidéo officielle.
   yt : identifiant de la vidéo officielle ; ch : chaîne qui l'a publiée (vérifiée) ; v : vues YouTube relevées (millions), base de la rareté. */
(function(){
  var A={
    /* PNL (Ademo) - MOWGLI, 19/12/2014, chaîne officielle @pnl. Pas sur Deezer : le serveur d'extraits renvoyait « MOWGLI II » (autre son). */
    'sp-s3ae140d7-30b5-419a-9661-d161dcfe8a38':{yt:'medPORJ8KO0',ch:'@pnl',v:36}
  };
  window.ARCH=A;
  if(typeof C==='undefined')return;
  Object.keys(A).forEach(function(id){var c=C[id];if(!c)return;c.arch=A[id].yt;
    /* pochette : la miniature officielle de la vidéo si la carte n'en a pas déjà une */
    if(!c.img)c.img='https://i.ytimg.com/vi/'+A[id].yt+'/maxresdefault.jpg'});

  /* pas d'extrait Deezer pour ces sons (ni à la révélation, ni en préchargement) */
  if(window.PV){var p0=PV.play,f0=PV.prefetch;
    PV.play=function(c){if(c&&A[c.id])return;return p0.apply(this,arguments)};
    PV.prefetch=function(cards){return f0.call(this,(cards||[]).filter(function(c){return !(c&&A[c.id])}))}}

  function esc(s){return String(s).replace(/[&<>"']/g,function(x){return'&#'+x.charCodeAt(0)+';'})}
  if(typeof see==='function'){var s0=see;window.see=function(id){var r=s0.apply(this,arguments);
    try{var a=A[id],dd=document.getElementById('dd');if(!a||!dd)return r;
      var info=dd.querySelector('.pop .info');
      if(info&&!info.querySelector('.archb')){var b=document.createElement('span');b.className='archb';b.textContent='Archives';info.insertBefore(b,info.children[1]||null)}
      /* « Écouter » mène à la vidéo officielle, pas à une recherche Spotify qui ne trouverait rien */
      var lk=dd.querySelector('.pop a.gbtn[href*="open.spotify.com"]');if(lk){lk.href='https://www.youtube.com/watch?v='+a.yt;lk.lastChild.textContent='YouTube'}
      var pv=dd.querySelector('.pvsee');if(pv)pv.remove();
      if(!reveal&&!dd.querySelector('.ytgo')){var row=dd.querySelector('.pop .row');if(row){var g=document.createElement('button');g.className='gbtn ytgo';g.dataset.act='ytgo';g.dataset.id=id;
        g.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l11-6.5z"/></svg>Regarder le clip';row.parentNode.insertBefore(g,row)}}
    }catch(e){}return r}}

  /* le lecteur n'est chargé qu'au toucher : aucun appel à YouTube avant le geste du joueur */
  document.addEventListener('click',function(e){var t=e.target.closest('[data-act="ytgo"]');if(!t)return;e.stopPropagation();
    var a=A[t.dataset.id],c=C[t.dataset.id];if(!a)return;if(window.PV)PV.stop(0);
    var w=document.createElement('div');w.className='ytw';
    w.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+a.yt+'?autoplay=1&playsinline=1&rel=0" title="'+esc((c?c.t+' · '+c.a:'Clip')+' (YouTube)')+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><p>Lecteur YouTube officiel · '+esc(a.ch)+'</p>';
    t.replaceWith(w)},true);
})();
