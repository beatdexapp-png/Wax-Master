/* WaxDrop : finitions (inclinaison 3D, reflet holo, onde qui vit avec l'extrait, transitions, nouveaux sons). */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lite(){return reduce||S.set.lite}
  var DD=document.getElementById('dd');
  var fine=matchMedia('(pointer:fine)').matches;

  /* ---------- inclinaison 3D + reflet qui suit le doigt / la souris / le téléphone ---------- */
  var TILT='.rsq,.big';
  var cur=null,raf=0,tx=0,ty=0,gx=.5,gy=.5;
  function apply(){raf=0;if(!cur)return;cur.style.setProperty('--rx',(ty*-9).toFixed(2)+'deg');cur.style.setProperty('--ry',(tx*11).toFixed(2)+'deg');cur.style.setProperty('--mx',(gx*100).toFixed(1)+'%');cur.style.setProperty('--my',(gy*100).toFixed(1)+'%')}
  function move(el,x,y){var r=el.getBoundingClientRect();if(!r.width)return;gx=Math.max(0,Math.min(1,(x-r.left)/r.width));gy=Math.max(0,Math.min(1,(y-r.top)/r.height));tx=gx*2-1;ty=gy*2-1;cur=el;el.classList.add('tilting');if(!raf)raf=requestAnimationFrame(apply)}
  function rest(el){if(!el)return;el.classList.remove('tilting');el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');el.style.setProperty('--mx','50%');el.style.setProperty('--my','30%');if(cur===el)cur=null}
  document.addEventListener('pointermove',function(e){if(lite())return;var el=e.target.closest&&e.target.closest(TILT);if(!el){var q=document.querySelector('.rvw.done .rsq');if(q){var r=q.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)el=q}}if(!el){if(cur)rest(cur);return}if(cur&&cur!==el)rest(cur);move(el,e.clientX,e.clientY)},{passive:true});
  document.addEventListener('pointerleave',function(){if(cur)rest(cur)},true);
  document.addEventListener('pointerup',function(e){if(e.pointerType==='touch'&&cur)rest(cur)},{passive:true});
  /* gyroscope (Android, et iOS sans demande d'autorisation quand c'est déjà permis) */
  if(!fine&&window.DeviceOrientationEvent){var b0=null,g0=null;
    addEventListener('deviceorientation',function(e){if(lite()||e.beta==null)return;var el=document.querySelector('.rvw.done .rsq')||document.querySelector('#dd .big');if(!el)return;
      if(b0===null){b0=e.beta;g0=e.gamma}var dx=Math.max(-1,Math.min(1,(e.gamma-g0)/22)),dy=Math.max(-1,Math.min(1,(e.beta-b0)/22));
      tx=dx;ty=dy;gx=(dx+1)/2;gy=(dy+1)/2;cur=el;if(!raf)raf=requestAnimationFrame(apply)},{passive:true});
    setInterval(function(){b0=null},20000)}

  /* ---------- bouton Extrait dans la fiche d'un son ---------- */
  if(typeof see==='function'){var oSee=see;window.see=function(id){var r=oSee.apply(this,arguments);
    try{if(window.PV&&!reveal){var row=DD&&DD.querySelector('.pop .row');if(row&&!row.querySelector('.pvsee')){var b=document.createElement('button');b.className='gbtn pvsee';b.dataset.act='pvsee';b.dataset.id=id;b.innerHTML='<span class="pveq"><i></i><i></i><i></i></span>Extrait';row.parentNode.insertBefore(b,row)}}
      if(window.SFX&&SFX.flip)SFX.flip()}catch(e){}return r}}
  document.addEventListener('click',function(e){var t=e.target.closest('[data-act="pvsee"]');if(!t)return;e.stopPropagation();
    if(t.classList.contains('on')){PV.stop(250);return}
    PV.play(C[t.dataset.id],{force:true,from:t});t.classList.add('on')},true);
  /* fermer la fiche coupe l'extrait */
  if(window.MutationObserver&&DD)new MutationObserver(function(){if(!DD.querySelector('.pop')&&!reveal&&window.PV)PV.stop(250)}).observe(DD,{childList:true});

  /* ---------- changement d'onglet : un seul rendu par image, même si on tape vite ---------- */
  if(typeof setTab==='function'){var oTab=setTab,pend=null,rq=0;window.setTab=function(t){if(t===tab&&!pend)return oTab.apply(this,arguments);
    document.querySelectorAll('#tabs button[data-tab]').forEach(function(b){b.setAttribute('aria-current',b.dataset.tab===t?'page':'false')});
    if(window.SFX&&SFX.whoosh&&t!==tab)SFX.whoosh();pend=t;if(!rq)rq=requestAnimationFrame(function(){rq=0;var x=pend;pend=null;oTab(x)})}}

  /* ---------- halo de rareté derrière la carte révélée ---------- */
  if(typeof revealCard==='function'){var oR=revealCard;window.revealCard=function(){var x=reveal&&reveal.res[reveal.i];var r=oR.apply(this,arguments);
    if(x&&x.c.r>=3&&!lite())setTimeout(function(){var w=document.querySelector('.rvw');if(w&&!w.querySelector('.halo')){var h=document.createElement('i');h.className='halo r'+x.c.r;w.insertBefore(h,w.firstChild)}},x.isNew?1000:500);
    return r}}
})();
