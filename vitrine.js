/* WaxDrop : page d'accueil plus vivante (lot 4, 08/11/2026).
   Cartes qui penchent sous le doigt ou la souris, un drop de démo jouable sans compte (rien n'est gardé),
   un défilé de vraies pochettes, les raretés à toucher avec leurs vraies chances, et de vrais chiffres lus en base.
   Les chiffres et les « drops du moment » viennent de la fonction public_pulse (migration du lot 4) : sans elle, rien ne s'affiche.
   Seulement transform et opacity ; tout est calmé si l'appareil est faible ou demande moins d'animations. */
(function(){
  var VIT=window.VIT={pulse:null};
  function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var RM=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  var WEAK=(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2);
  function calm(){return RM.matches||WEAK}
  function f(n){return Number(n).toLocaleString('fr-FR')}

  /* ---------- vraies chances (mêmes poids que le serveur, fonction draw_card2) ---------- */
  /* 4 cartes tirées parmi toutes les raretés, la 5e au moins Rare. */
  var W=[62,26,8,2.5,.6,.05];
  VIT.pct=function(p){var x=p*100;return x.toLocaleString('fr-FR',{maximumFractionDigits:x<1?2:x<10?1:0})+' %'};
  VIT.rates=function(){var T=W.reduce(function(a,b){return a+b},0),T1=T-W[0];
    return W.map(function(w,i){var p=(4*w/T+(i>=1?w/T1:0))/5;return{card:p,one:Math.max(1,Math.round(1/p))}})};

  /* ---------- cartes réelles avec pochette, rangées par rareté ---------- */
  var byR=null;
  function pool(){if(byR)return byR;byR=[[],[],[],[],[],[]];if(typeof CARDS!=='undefined')CARDS.forEach(function(c){if(c.img&&byR[c.r])byR[c.r].push(c)});return byR}
  function pick(r,R){var P=pool();for(var i=r;i>=0;i--)if(P[i].length)return P[i][Math.floor((R||Math.random)()*P[i].length)];return null}
  function roll(min){var t=0,i;for(i=min;i<6;i++)t+=W[i];var x=Math.random()*t;for(i=min;i<6;i++){x-=W[i];if(x<=0)return i}return min}
  function RR(){return typeof RAR!=='undefined'?RAR:[]}
  function CC(id){return typeof C!=='undefined'?C[id]:null}
  function rar(r){return RR()[r]||{n:'',c:'#aab3bd'}}

  /* ---------- défilé de pochettes (ou « drops du moment » si le serveur les donne) ---------- */
  function seeded(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return function(){h^=h<<13;h^=h>>>17;h^=h<<5;return ((h>>>0)%1e6)/1e6}}
  function item(c,who){var R=rar(c.r);return '<span class="gmq-i" style="--rc:'+R.c+'"><img src="'+e(c.img)+'" alt="" loading="lazy" decoding="async" width="40" height="40"><b>'+e(c.t)+'</b><small>'+e(c.a)+'</small><em>'+e(R.n)+'</em>'+(who?'<i>par '+e(who)+'</i>':'')+'</span>'}
  VIT.marquee=function(){
    if(typeof CARDS==='undefined'||!CARDS.length)return '';
    var L=[],P=VIT.pulse,d=new Date(),R=seeded('mq'+d.getFullYear()+d.getMonth()+d.getDate());
    if(P&&P.recent&&P.recent.length)P.recent.forEach(function(x){var c=CC(x.id);if(c&&c.img)L.push(item(c,x.pseudo))});
    if(L.length<6){L=[];for(var i=0;i<16;i++){var c=pick(i%5===0?4:i%3===0?3:2,R);if(c)L.push(item(c))}}
    if(!L.length)return '';
    var live=P&&P.recent&&P.recent.length&&L[0].indexOf('<i>par')>0;
    var row=L.join('');
    return '<section class="gmq'+(calm()?' calm':'')+'" aria-label="'+(live?'Gros tirages récents des joueurs':'Quelques sons du jeu')+'"><span class="gk">'+(live?'<i class="glv"></i>Drops du moment':'Dans les drops')+'</span><div class="gmq-w"><div class="gmq-t">'+row+'<span class="gmq-dup" aria-hidden="true">'+row+'</span></div></div></section>';
  };

  /* ---------- vrais chiffres (public_pulse), sinon rien ---------- */
  VIT.live=function(){var P=VIT.pulse;if(!P||!(P.players>0))return '<p class="glive" hidden></p>';
    return '<p class="glive"><i class="glv"></i><span><b>'+f(P.players)+'</b> joueurs</span>'+(P.drops>0?'<span>· <b>'+f(P.drops)+'</b> drops ouverts</span>':'')+(P.today>0?'<span>· <b>'+f(P.today)+'</b> actifs aujourd’hui</span>':'')+'</p>'};
  VIT.load=function(sb){
    if(!sb||VIT._asked)return;VIT._asked=1;
    /* tant que la migration du lot 4 n'est pas collée, la fonction n'existe pas : on ne redemande qu'une fois par jour */
    var off=0;try{off=+localStorage.getItem('wd-pulse-off')||0}catch(x){}if(Date.now()-off<864e5)return;
    sb.rpc('public_pulse').then(function(r){if(!r||r.error||!r.data){try{localStorage.setItem('wd-pulse-off',String(Date.now()))}catch(x){}return}
      try{localStorage.removeItem('wd-pulse-off')}catch(x){}VIT.pulse=r.data;
      var g=document.getElementById('gate');if(!g||g.hidden)return;
      var l=g.querySelector('.glive');if(l){var d=document.createElement('div');d.innerHTML=VIT.live();l.replaceWith(d.firstChild)}
      var m=g.querySelector('.gmq');if(m){var d2=document.createElement('div');d2.innerHTML=VIT.marquee();if(d2.firstChild)m.replaceWith(d2.firstChild);watch()}},function(){});
  };

  /* ---------- raretés à toucher ---------- */
  VIT.rarHTML=function(){
    var R=RR(),K=VIT.rates();if(!R.length)return '';
    return '<div class="grar" role="tablist" aria-label="Raretés">'+R.map(function(r,i){return '<button type="button" role="tab" data-vr="'+i+'" aria-selected="'+(i===3)+'" style="--rc:'+r.c+'"><i></i><b>'+e(r.n)+'</b><small>'+e(r.d)+(r.min<Infinity?' de streams':'')+'</small><span class="gro">1 carte sur '+f(K[i].one)+'</span></button>'}).join('')+'</div>'+
      '<div class="grs" aria-live="polite">'+rarStage(3)+'</div><p class="gfine2">Chances réelles d’un drop gratuit ou normal : 4 cartes tirées parmi toutes les raretés, la 5<sup>e</sup> au moins Rare.</p>';
  };
  function rarStage(i){var c=pick(i),R=rar(i),K=VIT.rates()[i];if(!c)return '';
    return '<div class="grs-c" style="--rc:'+R.c+'"><span class="grs-im" style="background-image:url(&quot;'+e(c.img)+'&quot;)"></span><em>'+e(R.n)+'</em><span class="grs-t"><b>'+e(c.t)+'</b><small>'+e(c.a)+'</small></span></div><p class="grs-p"><b>'+VIT.pct(K.card)+'</b> des cartes</p>'}

  /* ---------- drop de démo ---------- */
  VIT.demoHTML=function(){
    if(typeof CARDS==='undefined'||!CARDS.length)return '';
    return '<section class="gsec gdemo" id="gdemo"><span class="gk">Essaie, sans compte</span><h2>Ouvre un drop pour voir.</h2>'+
      '<div class="dm" data-st="0"><button type="button" class="dm-pk" data-dm="open" aria-label="Ouvrir le drop de démo"><span class="dm-vi" aria-hidden="true"></span><span class="dm-sl"><b>Wax<br>Drop</b><small>Démo · 5 sons</small></span></button>'+
      '<div class="dm-row" role="group" aria-label="Cartes du drop de démo"></div><p class="dm-h" aria-live="polite">Touche le drop</p><div class="dm-end" hidden></div></div></section>';
  };
  var hand=null;
  function deal(box){
    hand=[0,0,0,0,1].map(function(m){return pick(roll(m))}).filter(Boolean);
    var row=box.querySelector('.dm-row');
    row.innerHTML=hand.map(function(c,i){var R=rar(c.r);return '<button type="button" class="dm-c" data-dm="flip" data-i="'+i+'" style="--i:'+i+';--rc:'+R.c+'" aria-label="Retourner la carte '+(i+1)+'"><span class="dm-in"><span class="dm-b" aria-hidden="true"><i></i></span><span class="dm-f"><span class="dm-im" style="background-image:url(&quot;'+e(c.img)+'&quot;)"></span><em>'+e(R.n)+'</em><b>'+e(c.t)+'</b><small>'+e(c.a)+'</small></span></span></button>'}).join('');
    box.dataset.st='1';box.querySelector('.dm-h').innerHTML='Touche chaque carte, ou <button type="button" class="dm-all" data-dm="all">tout révéler</button>';
    if(window.PV&&PV.prefetch)try{PV.prefetch(hand)}catch(x){}
  }
  function flip(box,b){if(b.classList.contains('on'))return play(b);b.classList.add('on');b.setAttribute('aria-label',hand[+b.dataset.i].t+', '+rar(hand[+b.dataset.i].r).n);
    if(!box.querySelector('.dm-c:not(.on)'))end(box)}
  function end(box){
    var best=hand.reduce(function(a,c){return c.r>a.r?c:a},hand[0]),R=rar(best.r);
    box.dataset.st='2';var cb=box.querySelector('.dm-c[data-i="'+hand.indexOf(best)+'"]');if(cb)cb.classList.add('best');
    box.querySelector('.dm-h').textContent='Touche une carte pour écouter son extrait';
    var x=box.querySelector('.dm-end');x.hidden=false;
    x.innerHTML='<p>Ta meilleure : <b style="color:'+R.c+'">'+e(R.n)+'</b>. Ce drop était pour de faux, rien n’est gardé. Les vrais sont gratuits, un toutes les 10 minutes.</p><div class="dm-bt"><button type="button" class="gb" data-g="up" data-top="1">Créer mon compte</button><button type="button" class="dm-again" data-dm="again">Rejouer</button></div>';
  }
  function play(b){var c=hand&&hand[+b.dataset.i];if(!c||!window.PV)return;
    if(b.classList.contains('pl')){PV.stop(300);b.classList.remove('pl');return}
    document.querySelectorAll('#gate .pl').forEach(function(x){x.classList.remove('pl')});
    try{PV.play(c,{force:true});b.classList.add('pl')}catch(x){}}

  document.addEventListener('click',function(ev){
    var b=ev.target.closest('#gate [data-dm],#gate [data-vr],#gate .gcd[data-id],#gate [data-gtry]');if(!b)return;
    if(b.dataset.gtry){ev.preventDefault();var d=document.getElementById('gdemo');if(d)d.scrollIntoView({behavior:calm()?'auto':'smooth',block:'center'});return}
    if(b.dataset.vr){var g=b.closest('.gsec');g.querySelectorAll('[data-vr]').forEach(function(x){x.setAttribute('aria-selected',String(x===b))});var s=g.querySelector('.grs');if(s)s.innerHTML=rarStage(+b.dataset.vr);return}
    if(b.classList.contains('gcd')){var c=CC(b.dataset.id);if(!c||!window.PV)return;
      if(b.classList.contains('pl')){PV.stop(300);b.classList.remove('pl');return}
      document.querySelectorAll('#gate .pl').forEach(function(x){x.classList.remove('pl')});try{PV.play(c,{force:true});b.classList.add('pl')}catch(x){}return}
    var box=b.closest('.dm');if(!box)return;var a=b.dataset.dm;
    if(a==='open'&&box.dataset.st==='0')deal(box);
    else if(a==='flip')flip(box,b);
    else if(a==='all'){box.querySelectorAll('.dm-c:not(.on)').forEach(function(x,i){setTimeout(function(){flip(box,x)},calm()?0:i*90)})}
    else if(a==='again'){if(window.PV)PV.stop(200);box.dataset.st='0';box.querySelector('.dm-row').innerHTML='';box.querySelector('.dm-end').hidden=true;box.querySelector('.dm-h').textContent='Touche le drop';setTimeout(function(){deal(box)},calm()?0:240)}
  });

  /* ---------- cartes qui penchent (souris, doigt) ---------- */
  var raf=0,tgt=null,px=0,py=0;
  function tilt(){raf=0;if(!tgt)return;var r=tgt.getBoundingClientRect();var x=(px-r.left)/r.width-.5,y=(py-r.top)/r.height-.5;
    tgt.style.setProperty('--tx',(x*16).toFixed(2)+'deg');tgt.style.setProperty('--ty',(-y*12).toFixed(2)+'deg');tgt.style.setProperty('--lx',((x+.5)*100).toFixed(1)+'%')}
  document.addEventListener('pointermove',function(ev){if(calm())return;var g=ev.target.closest&&ev.target.closest('#gate .gfan');
    if(g!==tgt){if(tgt)rest(tgt);tgt=g;if(g)g.classList.add('tl')}
    if(!g)return;px=ev.clientX;py=ev.clientY;if(!raf)raf=requestAnimationFrame(tilt)},{passive:true});
  function rest(g){g.classList.remove('tl');g.style.setProperty('--tx','0deg');g.style.setProperty('--ty','0deg')}
  ['pointerleave','pointercancel','pointerup'].forEach(function(t){document.addEventListener(t,function(ev){if(tgt&&(ev.pointerType!=='mouse'||t==='pointerleave')){rest(tgt);tgt=null}},{passive:true,capture:true})});

  /* extrait au survol (ordinateur), seulement après un premier geste sur la page */
  var hov=0;
  document.addEventListener('pointerover',function(ev){if(ev.pointerType!=='mouse'||!window.PV)return;var b=ev.target.closest&&ev.target.closest('#gate .dm-c.on,#gate .gcd[data-id]');clearTimeout(hov);if(!b)return;
    if(!(navigator.userActivation&&navigator.userActivation.hasBeenActive))return;
    hov=setTimeout(function(){if(b.matches(':hover')&&!b.classList.contains('pl'))b.click()},450)});

  /* le défilé ne tourne que s'il est à l'écran */
  var io=null;
  function watch(){var m=document.querySelector('#gate .gmq');if(!m||!('IntersectionObserver' in window))return;if(!io)io=new IntersectionObserver(function(L){L.forEach(function(x){x.target.classList.toggle('run',x.isIntersecting)})});io.observe(m)}
  VIT.mounted=function(){watch()};
})();
