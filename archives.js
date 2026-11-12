/* WaxDrop : sons « Archives », publiés par l'artiste sur sa chaîne YouTube officielle mais absents de Deezer (demande de @KLK, 12/11/2026).
   Aucun fichier audio chez nous : la fiche du son ouvre le lecteur YouTube officiel intégré (youtube-nocookie), seulement au toucher.
   Les cartes elles-mêmes sont en base (table cards) ; ici on ne garde que le lien vers la vidéo officielle.
   yt : identifiant de la vidéo officielle ; ch : chaîne qui l'a publiée (vérifiée) ; v : vues YouTube relevées (millions), base de la rareté. */
(function(){
  var A={
    /* PNL (Ademo) - MOWGLI, 19/12/2014, chaîne officielle @pnl. Pas sur Deezer : le serveur d'extraits renvoyait « MOWGLI II » (autre son). */
    'sp-s3ae140d7-30b5-419a-9661-d161dcfe8a38':{yt:'medPORJ8KO0',ch:'@pnl',v:36},
    /* Anciens sons d'Ademo et de N.O.S d'avant PNL (2011-2013), demande de @KLK corrigée par Alexi le 12/11/2026.
       Rangés en base avec les singles de PNL ; a : nom affiché à la place de « PNL » ; n : vues exactes ; y : année de mise en ligne.
       Chaînes : celle de l'artiste, ou celle du réalisateur du clip (détail : tests/archives-anciens/classement.txt). */
    'yt-70BVgTDYJ_I':{yt:'70BVgTDYJ_I',ch:'@ADEMOOFFICIEL',v:0.81,a:'Ademo',n:810516,y:2012},
    'yt-_6EOAWjTuAY':{yt:'_6EOAWjTuAY',ch:'@ADEMOOFFICIEL',v:0.43,a:'Ademo',n:433936,y:2013},
    'yt-o_0EmIfLzzQ':{yt:'o_0EmIfLzzQ',ch:'@NOS365JoursPourPerC',v:0.31,a:'N.O.S',n:310841,y:2012},
    'yt-ihUzzUj-jp4':{yt:'ihUzzUj-jp4',ch:'@NOS365JoursPourPerC',v:0.15,a:'N.O.S',n:147933,y:2012},
    'yt-e5XLZc24dYU':{yt:'e5XLZc24dYU',ch:'@RedwoodOG_',v:3.42,a:'N.O.S',n:3423625,y:2012},
    'yt-8FUq4A3IVg0':{yt:'8FUq4A3IVg0',ch:'@RedwoodOG_',v:0.36,a:'Ademo',n:358742,y:2012},
    'yt-c0hOvD7-kbY':{yt:'c0hOvD7-kbY',ch:'@ADEMOOFFICIEL',v:0.8,a:'Ademo',n:802227,y:2012},
    'yt-qLbWbltHpvg':{yt:'qLbWbltHpvg',ch:'@ADEMOOFFICIEL',v:2.59,a:'Ademo',n:2588200,y:2012},
    'yt-433koBM2nPo':{yt:'433koBM2nPo',ch:'@NOS365JoursPourPerC',v:0.36,a:'N.O.S',n:360218,y:2011},
    'yt-1QVxSnvgxF4':{yt:'1QVxSnvgxF4',ch:'@NOS365JoursPourPerC',v:0.65,a:'N.O.S',n:648198,y:2011},
    'yt-jVP3D6vz3zU':{yt:'jVP3D6vz3zU',ch:'@NOS365JoursPourPerC',v:0.71,a:'N.O.S',n:709968,y:2011},
    'yt-gTF4cKVfDoo':{yt:'gTF4cKVfDoo',ch:'@artistec4',v:0.5,a:'Ademo & N.O.S',n:503416,y:2011},
    'yt-3DbFWlcDbkk':{yt:'3DbFWlcDbkk',ch:'@Fabi92i',v:1.31,a:'Ademo',n:1305200,y:2011},
    'yt-sMEU_oKVyUs':{yt:'sMEU_oKVyUs',ch:'@lucifrere1',v:0.1,a:'Ademo',n:96849,y:2011},
    'yt-8jbJVVRpFpY':{yt:'8jbJVVRpFpY',ch:'@NOS365JoursPourPerC',v:0.37,a:'N.O.S',n:372702,y:2012},
    'yt-CwAO-ru4fKk':{yt:'CwAO-ru4fKk',ch:'@OrdeLLBProd',v:1.13,a:'N.O.S',n:1127329,y:2012},
    'yt-ySZeklklkg8':{yt:'ySZeklklkg8',ch:'@ADEMOOFFICIEL',v:0.25,a:'Ademo',n:246430,y:2012},
    'yt-AwPM3Kriny0':{yt:'AwPM3Kriny0',ch:'@ADEMOOFFICIEL',v:0.35,a:'Ademo',n:349006,y:2012},
    'yt-lRM34-o_lX8':{yt:'lRM34-o_lX8',ch:'@ADEMOOFFICIEL',v:0.45,a:'Ademo',n:453916,y:2012},
    'yt-8Pxfjz2aZ-w':{yt:'8Pxfjz2aZ-w',ch:'@ADEMOOFFICIEL',v:0.29,a:'Ademo',n:294045,y:2012},
    'yt-kcj02m4I1yc':{yt:'kcj02m4I1yc',ch:'@NOS365JoursPourPerC',v:0.36,a:'N.O.S',n:358518,y:2012}
  };
  window.ARCH=A;
  if(typeof C==='undefined')return;
  Object.keys(A).forEach(function(id){var c=C[id];if(!c)return;c.arch=A[id].yt;
    /* le son reste rangé sous PNL (page artiste, récompense) mais affiche qui le chante : « Ademo (avant PNL) » */
    if(A[id].a){c.a=A[id].a+' (avant PNL)';c.q=(c.q||'')+' '+A[id].a.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}
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
      /* sous la carte : d'où vient le son, au lieu de « Single » */
      var cap=dd.querySelector('.pop > p.cap');if(cap&&a.n)cap.textContent='Archives YouTube · '+a.n.toLocaleString('fr-FR')+' vues · '+a.y;
      var pv=dd.querySelector('.pvsee');if(pv)pv.remove();
      if(!reveal&&!dd.querySelector('.ytgo')){var row=dd.querySelector('.pop .row');if(row){var g=document.createElement('button');g.className='gbtn ytgo';g.dataset.act='ytgo';g.dataset.id=id;
        g.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l11-6.5z"/></svg>Regarder le clip';row.parentNode.insertBefore(g,row)}}
    }catch(e){}return r}}

  /* le lecteur n'est chargé qu'au toucher : aucun appel à YouTube avant le geste du joueur */
  document.addEventListener('click',function(e){var t=e.target.closest('[data-act="ytgo"]');if(!t)return;e.stopPropagation();
    var a=A[t.dataset.id],c=C[t.dataset.id];if(!a)return;if(window.PV)PV.stop(0);
    var w=document.createElement('div');w.className='ytw';
    w.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+a.yt+'?autoplay=1&playsinline=1&rel=0" title="'+esc((c?c.t+' · '+c.a:'Clip')+' (YouTube)')+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><p>Lecteur YouTube · vidéo publiée par '+esc(a.ch)+'</p>';
    t.replaceWith(w)},true);
})();
