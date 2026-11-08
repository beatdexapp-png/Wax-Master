/* WaxDrop : retouches du 08/11/2026 (lot de 14, sw v72).
   9. Ouvrir un drop depuis l'écran Ouvrir : petit zoom sur la pochette, le vinyle sort en tournant, puis fondu vers l'écran
      d'ouverture habituel (on touche le vinyle comme avant). Plus de changement d'écran brutal.
      Seulement de l'affichage : l'appel au serveur part tout de suite, en même temps que l'animation.
      Coupé si l'appareil demande moins d'animations, en mode économie ou sur appareil faible. */
(function(){
  if(typeof openPack!=='function'||typeof showOpening!=='function')return;
  var RM=matchMedia('(prefers-reduced-motion: reduce)'),EZ='cubic-bezier(.22,1,.36,1)';
  function calm(){return RM.matches||(typeof S!=='undefined'&&S.set&&S.set.lite)||document.documentElement.classList.contains('weak')||!Element.prototype.animate}
  var Z=null;
  function ok(m){try{if(m==='free')return S.bonus>0||freeReady();if(m==='pay')return S.coins>=cost()}catch(e){}return false}
  function fix(el,r){el.style.cssText='position:fixed;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;margin:0'}
  function start(){
    var src=document.querySelector('#main .v-open .mbox .dpk-hero');if(!src||calm())return null;
    var sv=src.querySelector('.dpk-v'),ss=src.querySelector('.dpk-s');if(!sv||!ss)return null;
    var rs=ss.getBoundingClientRect(),rv=sv.getBoundingClientRect();if(!rs.width||rs.bottom<0||rs.top>innerHeight)return null;
    var el=document.createElement('div');el.id='ozm';el.setAttribute('aria-hidden','true');
    el.innerHTML='<div class="oz-bg"></div><div class="oz-vo"><span class="oz-v dpk-v" style="--dc:'+getComputedStyle(src).getPropertyValue('--dc')+'"><i></i></span></div><div class="oz-s"></div>';
    var vo=el.querySelector('.oz-vo'),so=el.querySelector('.oz-s');fix(vo,rv);fix(so,rs);
    var sc=ss.cloneNode(true);sc.style.position='absolute';sc.style.inset='0';so.appendChild(sc);
    document.body.appendChild(el);src.style.visibility='hidden';
    /* A : la pochette vient au centre et grossit un peu ; B : elle glisse à gauche et s'efface, le vinyle reste au centre */
    var W=innerWidth,H=innerHeight,cx=W/2,cy=H*.46,pc={x:rs.left+rs.width/2,y:rs.top+rs.height/2},k=Math.min(1.18,W*.78/rs.width),
        dx=cx-pc.x,dy=cy-pc.y,vc={x:rv.left+rv.width/2,y:rv.top+rv.height/2},
        va={x:pc.x+(vc.x-pc.x)*k+dx,y:pc.y+(vc.y-pc.y)*k+dy},kv=Math.min(W*.72,H*.36)/rv.width;
    var T=700;
    el.querySelector('.oz-bg').animate([{opacity:0},{opacity:1}],{duration:T*.8,easing:'ease-in',fill:'forwards'});
    so.animate([{transform:'none',opacity:1},{transform:'translate('+dx+'px,'+dy+'px) scale('+k+')',opacity:1,offset:.45},{transform:'translate('+(dx-W*.75)+'px,'+dy+'px) scale('+(k*.92)+') rotate(-7deg)',opacity:0}],{duration:T,easing:EZ,fill:'forwards'});
    var a=vo.animate([{transform:'none'},{transform:'translate('+(va.x-vc.x)+'px,'+(va.y-vc.y)+'px) scale('+k+')',offset:.45},{transform:'translate('+(cx-vc.x)+'px,'+(cy-vc.y)+'px) scale('+kv+')'}],{duration:T,easing:EZ,fill:'forwards'});
    el.querySelector('.oz-v').animate([{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration:1400,iterations:Infinity});
    return {el:el,src:src,vo:vo,vc:vc,w:rv.width,ready:a.finished.catch(function(){})};
  }
  function drop(z){if(!z)return;z.src.style.visibility='';z.el.animate([{opacity:1},{opacity:0}],{duration:220,fill:'forwards'}).finished.then(function(){z.el.remove()},function(){z.el.remove()})}
  function land(z,op){
    z.ready.then(function(){
      var b=op&&document.body.contains(op)&&op.querySelector('.bv');
      if(!b){op&&(op.style.opacity='');drop(z);return}
      var t=b.getBoundingClientRect(),tx=t.left+t.width/2-z.vc.x,ty=t.top+t.height/2-z.vc.y,s=t.width/z.w;
      z.vo.animate([{transform:getComputedStyle(z.vo).transform},{transform:'translate('+tx+'px,'+ty+'px) scale('+s+')'}],{duration:260,easing:EZ,fill:'forwards'}).finished.then(function(){
        var f=op.animate([{opacity:0},{opacity:1}],{duration:220,easing:'ease-out',fill:'forwards'});
        f.finished.then(function(){op.style.opacity='';f.cancel();z.el.remove()},function(){op.style.opacity='';z.el.remove()})
      },function(){op.style.opacity='';z.el.remove()})
    })}
  var so0=window.showOpening;
  window.showOpening=function(){var z=Z;Z=null;var r=so0.apply(this,arguments);
    if(z){var op=document.getElementById('op');if(op){op.classList.add('oz');op.style.opacity='0'}land(z,op)}return r};
  var op0=window.openPack;
  window.openPack=async function(m,express){
    var zoom=!express&&(m==='free'||m==='pay')&&typeof tab!=='undefined'&&tab==='ouvrir'&&!reveal&&!(window.ECO&&ECO.busy)&&!document.querySelector('#ov .ov')&&ok(m);
    if(zoom)Z=start();
    try{return await op0.apply(this,arguments)}
    finally{if(Z){var z=Z;Z=null;drop(z)}}
  };
})();
