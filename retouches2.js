/* WaxDrop : retouches du 08/11/2026 au soir (2e lot, sw v74).
   1. Fiche d'un son (et d'un album, d'un artiste) : la fiche défile de haut en bas, la croix reste collée en haut.
   5. Drops et Wax coins : on glisse d'un onglet à l'autre ; deux petites barres en haut montrent l'onglet affiché
      (Drops = barre de gauche) ; accès aux Wax coins mis en avant. */
(function(){
  if(typeof S==='undefined')return;
  var X=typeof ICON!=='undefined'&&ICON.x?ICON.x:'×';

  /* ---------- 1. fiches : défilement + croix toujours accessible ---------- */
  function fiche(){var p=document.querySelector('#dd .pop');if(!p||p.classList.contains('pfiche'))return;
    p.classList.add('pfiche');p.scrollTop=0;
    p.insertAdjacentHTML('afterbegin','<button class="gbtn sq popx" data-act="ddclose" aria-label="Fermer">'+X+'</button>')}
  ['see','seeAl','seePl'].forEach(function(k){var f=window[k];if(typeof f!=='function')return;
    window[k]=function(){var r=f.apply(this,arguments);try{fiche()}catch(e){}return r}});

  /* ---------- 5. Drops / Wax coins : barres indicatrices et balayage ---------- */
  var ORD=['packs','jetons'],dir=0;
  function onJet(){return tab==='shop'&&shopSub==='jetons'}
  function bars(){
    var v=document.querySelector('#main .view.vjet');if(!onJet()||!v||v.querySelector('.r2bars'))return;
    var i=ORD.indexOf(jetSub),h='<div class="r2bars" role="tablist" aria-label="Drops ou wax coins">'+
      ORD.map(function(k,j){return '<button class="r2bar'+(j===i?' on':'')+'" role="tab" aria-selected="'+(j===i)+'" data-act="jts" data-v="'+k+'" aria-label="'+(k==='packs'?'Drops':'Wax coins')+'"><i></i></button>'}).join('')+'</div>';
    var ban=v.querySelector('.sbn');if(ban)ban.insertAdjacentHTML('afterbegin',h);else{var c=v.querySelector('.chips');if(c)c.insertAdjacentHTML('beforebegin',h)}
    if(dir){var g=v.querySelector('.pgr'),l=v.querySelector('.l6cof');[l,g].forEach(function(el){if(el){el.classList.remove('r2in-l','r2in-r');void el.offsetWidth;el.classList.add(dir>0?'r2in-r':'r2in-l')}});dir=0}
  }
  function go(d){var i=ORD.indexOf(jetSub)+d;if(i<0||i>=ORD.length)return false;dir=d;jetSub=ORD[i];render();
    var v=document.querySelector('#main .view');if(v)v.scrollTo(0,0);return true}
  /* on suit le doigt seulement si le geste est nettement horizontal ; le défilement vertical reste libre */
  var t0=null;
  document.addEventListener('touchstart',function(e){if(!onJet()||e.touches.length!==1||!e.target.closest('#main .view.vjet')||e.target.closest('.hsc,input,textarea')){t0=null;return}
    t0={x:e.touches[0].clientX,y:e.touches[0].clientY,h:null}},{passive:true});
  document.addEventListener('touchmove',function(e){if(!t0)return;var dx=e.touches[0].clientX-t0.x,dy=e.touches[0].clientY-t0.y;
    if(t0.h===null&&(Math.abs(dx)>10||Math.abs(dy)>10))t0.h=Math.abs(dx)>Math.abs(dy)*1.4;
    if(t0.h){var g=document.querySelector('#main .view.vjet .pgr');if(g){var i=ORD.indexOf(jetSub),edge=(i===0&&dx>0)||(i===ORD.length-1&&dx<0);g.style.transform='translateX('+(dx*(edge?.12:.35)).toFixed(1)+'px)';g.style.transition='none'}}},{passive:true});
  document.addEventListener('touchend',function(e){if(!t0)return;var t=e.changedTouches[0],dx=t.clientX-t0.x,h=t0.h;t0=null;
    var g=document.querySelector('#main .view.vjet .pgr');if(g){g.style.transition='';g.style.transform=''}
    if(h&&Math.abs(dx)>50)go(dx<0?1:-1)},{passive:true});
  document.addEventListener('touchcancel',function(){t0=null;var g=document.querySelector('#main .view.vjet .pgr');if(g){g.style.transition='';g.style.transform=''}},{passive:true});
  /* clavier : flèches gauche et droite */
  document.addEventListener('keydown',function(e){if(!onJet()||document.querySelector('#dd .pop,#sh .sheet')||/INPUT|TEXTAREA/.test((e.target||{}).tagName||''))return;
    if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1)});
  /* sens de l'animation quand on touche « Drops » ou « Wax coins » */
  document.addEventListener('click',function(e){var b=e.target.closest('[data-act="jts"]');if(b&&onJet()){var d=ORD.indexOf(b.dataset.v)-ORD.indexOf(jetSub);if(d)dir=d}},true);

  if(typeof render==='function'){var r0=render;window.render=function(){var r=r0.apply(this,arguments);try{bars()}catch(x){}return r}}
  try{bars()}catch(x){}
})();
