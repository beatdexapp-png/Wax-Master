/* WaxDrop : classeur d'un artiste façon livre (lot 2, 07/11/2026).
   Un sommaire, puis une page par album (et une pour les singles). Les sons possédés sont collés à leur emplacement,
   les autres restent des emplacements grisés numérotés. Le tampon donne la progression (ex. 2/125).
   Lecture seule : s'appuie sur ARTISTS, RW, C et own() du jeu. Toucher un son ouvre sa fiche habituelle. */
(function(){
  var bk=null,A=null,pg=0;
  function e(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function books(){return A.albums.map(function(k){return RW[k]}).concat(A.sgk?[RW[A.sgk]]:[]).filter(function(B){return B&&B.ids.length})}
  function cnt(ids){return ids.filter(own).length}
  function stamp(n,t){return '<div class="bk-st'+(n>=t?' full':'')+'" aria-label="'+n+' sur '+t+'"><b>'+n+'</b><i></i><span>'+t+'</span></div>'}
  function toc(L){
    return '<section class="bk-pg bk-toc"><span class="bk-k">Sommaire</span><h3>'+e(A.n)+'</h3><ol>'+L.map(function(B,i){var n=cnt(B.ids);
      return '<li><button data-bk="go" data-i="'+(i+1)+'"><span class="bk-th" style="background:'+e(B.art)+'"></span><span class="bk-tt"><b>'+e(B.single?'Singles':B.t)+'</b><small>'+(B.y?B.y+' · ':'')+n+' / '+B.ids.length+'</small></span><span class="bk-pn">p. '+(i+1)+'</span><i class="bk-bar" style="--p:'+Math.round(n/B.ids.length*100)+'%"></i></button></li>'}).join('')+'</ol></section>';
  }
  function page(B,i){var n=cnt(B.ids);
    return '<section class="bk-pg"><header><span class="bk-k">Page '+(i+1)+'</span><h3>'+e(B.single?'Singles':B.t)+'</h3><small>'+(B.y?B.y+' · ':'')+n+' / '+B.ids.length+(n>=B.ids.length?' · complet':'')+'</small></header><div class="bk-g">'+
      B.ids.map(function(id,k){var c=C[id],o=own(id),R=RAR[c.r];
        return o?'<button class="bk-s on" data-act="see" data-id="'+e(id)+'" style="--rc:'+R.c+';--im:'+(c.img?'url(&quot;'+e(c.img)+'&quot;)':e(c.bg))+'"><span class="bk-im"></span><b>'+e(c.t)+'</b><em>'+e(R.n)+'</em></button>'
               :'<div class="bk-s"><span class="bk-no">'+(k+1)+'</span><b>'+e(c.t)+'</b></div>'}).join('')+'</div></section>';
  }
  function paint(keep){
    var L=books(),tot=A.ids.length,n=cnt(A.ids);
    bk.innerHTML='<div class="bk-scrim" data-bk="x"></div><div class="bk-book" role="dialog" aria-label="Classeur de '+e(A.n)+'"><div class="bk-hd"><span class="av" style="--avg:'+e(A.avg)+'">'+e(A.ini)+'</span><div><b>'+e(A.n)+'</b><small>Classeur · '+L.length+' page'+(L.length>1?'s':'')+'</small></div>'+stamp(n,tot)+'<button class="gbtn sq" data-bk="x" aria-label="Fermer">'+ICON.x+'</button></div>'+
      '<div class="bk-pages" id="bkp">'+toc(L)+L.map(page).join('')+'</div>'+
      '<div class="bk-ft"><button class="gbtn sq" data-bk="prev" aria-label="Page précédente">‹</button><span id="bkn"></span><button class="gbtn sq" data-bk="next" aria-label="Page suivante">›</button></div></div>';
    var P=bk.querySelector('#bkp');P.addEventListener('scroll',function(){var w=P.clientWidth/(isWide()?2:1);pg=Math.round(P.scrollLeft/w);num()},{passive:true});
    if(keep)go(pg,true);num();
  }
  function isWide(){return innerWidth>=1024}
  function num(){var el=bk&&bk.querySelector('#bkn');if(!el)return;var L=books().length+1,w=isWide();el.textContent=w?('Pages '+(pg+1)+' et '+Math.min(L,pg+2)+' sur '+L):('Page '+(pg+1)+' sur '+L)}
  function go(i,instant){var P=bk&&bk.querySelector('#bkp');if(!P)return;var L=books().length+1;pg=Math.max(0,Math.min(L-1,i));var w=P.clientWidth/(isWide()?2:1);P.scrollTo({left:pg*w,behavior:instant?'auto':'smooth'});num()}
  function open(k){A=RW[k];if(!A||A.type!=='artiste')return;pg=0;if(!bk){bk=document.createElement('div');bk.id='bk';document.body.appendChild(bk)}paint(false);bk.classList.remove('out');document.body.classList.add('bkon')}
  function close(){if(!bk)return;var b=bk;bk=null;b.classList.add('out');document.body.classList.remove('bkon');setTimeout(function(){b.remove()},300)}
  window.BOOK={open:open,close:close};
  document.addEventListener('click',function(ev){
    var t=ev.target.closest('[data-act="book"]');if(t){ev.stopPropagation();open(t.dataset.k);return}
    var b=ev.target.closest('[data-bk]');if(!b||!bk)return;var a=b.dataset.bk;
    if(a==='x')close();else if(a==='go')go(+b.dataset.i);else if(a==='prev')go(pg-(isWide()?2:1));else if(a==='next')go(pg+(isWide()?2:1));
  },true);
  addEventListener('keydown',function(ev){if(!bk)return;if(ev.key==='Escape'&&!document.querySelector('#dd .pop'))close();else if(ev.key==='ArrowRight')go(pg+(isWide()?2:1));else if(ev.key==='ArrowLeft')go(pg-(isWide()?2:1))});
  /* un son fabriqué ou acheté depuis sa fiche : le classeur se met à jour */
  if(typeof render==='function'){var r0=render;window.render=function(){var r=r0.apply(this,arguments);if(bk&&A){var P=bk.querySelector('#bkp'),x=P?P.scrollLeft:0;paint(false);var Q=bk.querySelector('#bkp');if(Q)Q.scrollLeft=x}return r}}
})();
