/* WaxDrop : lot 4 « Choix et acquisition » (08/11/2026).
   Boosters (style, époque, artiste du jour, sortie de la semaine), compteur de garantie et vraies chances,
   parrainage payé quand le filleul a vraiment joué (paliers à badge), identifiant d'appareil (anti-triche).
   Tout est décidé par le serveur. Sans la migration du lot 4, le serveur ne renvoie pas S.l4 : rien ne s'affiche
   ici, l'ouverture d'un drop est exactement la même qu'avant, et les appels nouveaux échouent sans bruit. */
(function(){
  if(typeof S==='undefined')return;
  function e(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function lsg(k){try{return localStorage.getItem(k)}catch(x){return null}}function lss(k,v){try{localStorage.setItem(k,v)}catch(x){}}
  function on(){return !!(S.l4&&window.CL&&CL.user)}
  function f(n){return Number(n).toLocaleString('fr-FR')}
  var ERA={'1960':'Années 60 à 80','1990':'Années 90','2000':'Années 2000','2010':'Années 2010','2020':'Années 2020'};
  var L4=window.L4={sel:lsg('wd-booster')||''};

  /* ---------- boosters proposés aujourd'hui (liste du serveur, gardée seulement si le jeu connaît l'artiste ou l'album) ---------- */
  function list(){
    var o=S.l4,L=[{k:'',n:'Tout WaxDrop',s:'Tous les styles, toutes les époques',g:'une'}];if(!o)return L;
    var A=o.day&&o.day.ak&&RW[o.day.ak];if(A)L.push({k:'art:'+o.day.ak,n:A.n,s:'Artiste du jour · 2 de ses sons garantis',g:'une',img:A.img});
    (o.sorties||[]).some(function(x){var B=RW[x.alk];if(B){L.push({k:'alb:'+x.alk,n:B.t,s:'Sortie de la semaine · '+B.a+' · 2 sons garantis',g:'une',img:B.img});return true}});
    (o.styles||[]).forEach(function(x){L.push({k:'st:'+x.k,n:typeof styN==='function'?styN(x.k):x.k,s:f(x.n)+' sons',g:'st'})});
    (o.eras||[]).forEach(function(x){if(ERA[x.k])L.push({k:'era:'+x.k,n:ERA[x.k],s:f(x.n)+' sons',g:'era'})});
    return L;
  }
  function cur(){var L=list();return L.filter(function(x){return x.k===L4.sel})[0]||L[0]}
  /* appelé par eco.js au moment d'ouvrir un drop gratuit ou normal */
  L4.pool=function(){if(!on())return null;var c=cur();return c&&c.k?c.k:null};

  /* ---------- écran Ouvrir : choix du booster + garantie ---------- */
  function pity(){var o=S.l4;return{left:Math.max(1,(o.every||60)-(o.pity|0)),p:Math.min(1,(o.pity|0)/(o.every||60))}}
  function openBar(){
    var c=cur(),g=pity(),R=typeof RAR!=='undefined'?RAR:[];
    return '<div class="l4b"><button class="l4-sel glass" data-l4="panel" aria-haspopup="dialog"><span class="l4-im"'+(c.img?' style="background-image:url(&quot;'+e(c.img)+'&quot;)"':'')+'></span><span class="l4-tx"><small>Booster</small><b>'+e(c.n)+'</b></span><i aria-hidden="true"></i></button>'+
      '<button class="l4-g" data-l4="odds" style="--p:'+g.p.toFixed(3)+';--rc:'+((R[4]||{}).c||'#ff5f86')+'"><span><b>'+(R[4]?R[4].n:'Mythique')+' garanti</b> dans '+g.left+' drop'+(g.left>1?'s':'')+'</span><i aria-hidden="true"></i><em>Chances</em></button></div>';
  }
  function panel(){
    if(typeof closeMenu==='function')closeMenu();menuPage='l4';
    var L=list(),grp=function(g,t){var x=L.filter(function(b){return b.g===g});return x.length?'<h3 class="l4-h">'+t+'</h3><div class="l4-gr'+(g!=='une'?' l4-ch':'')+'">'+x.map(function(b){return '<button class="l4-o'+(b.k===cur().k?' on':'')+'" data-l4b="'+e(b.k)+'" aria-pressed="'+(b.k===cur().k)+'">'+(g==='une'?'<span class="l4-im"'+(b.img?' style="background-image:url(&quot;'+e(b.img)+'&quot;)"':'')+'></span>':'')+'<span><b>'+e(b.n)+'</b><small>'+e(b.s)+'</small></span></button>'}).join('')+'</div>':''};
    sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass l4-sh" role="dialog" aria-label="Choisir un booster"><div class="grab"></div><div class="shh"><h2>Choisir un booster</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div>'+
      '<p class="cap" style="text-align:left">Même prix, mêmes chances de rareté. Le booster choisit seulement d’où viennent les sons.</p>'+grp('une','À la une')+grp('st','Styles')+grp('era','Époques')+'</div>';
  }
  function odds(){
    if(typeof closeMenu==='function')closeMenu();menuPage='l4';
    var R=typeof RAR!=='undefined'?RAR:[],K=window.VIT&&VIT.rates?VIT.rates():[],g=pity();
    sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass l4-sh" role="dialog" aria-label="Chances"><div class="grab"></div><div class="shh"><h2>Les vraies chances</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div>'+
      '<p class="cap" style="text-align:left">Drop gratuit ou normal : 4 cartes tirées parmi toutes les raretés, la 5<sup>e</sup> au moins Rare. Ce sont les poids utilisés par le serveur.</p>'+
      '<div class="l4-od">'+R.map(function(r,i){var k=K[i]||{card:0,one:0};return '<div style="--rc:'+r.c+'"><i></i><b>'+e(r.n)+'</b><span>'+(k.card*100<1?(k.card*100).toLocaleString('fr-FR',{maximumFractionDigits:2}):Math.round(k.card*100))+' %</span><small>1 carte sur '+f(k.one)+'</small></div>'}).join('')+'</div>'+
      '<div class="l4-gu"><b>Garantie</b><p>Si tu ouvres '+(S.l4.every||60)+' drops sans '+(R[4]?R[4].n:'Mythique')+' ni '+(R[5]?R[5].n:'Divin')+', le suivant en contient un. Il te reste <b>'+g.left+'</b> drop'+(g.left>1?'s':'')+' avant la garantie. Le compteur repart à zéro dès qu’un '+(R[4]?R[4].n:'Mythique')+' ou mieux sort.</p></div>'+
      '<a class="gbtn" href="/regles.html" target="_blank" rel="noopener">Toutes les règles</a></div>';
  }

  /* ---------- page Aujourd'hui : boosters du jour ---------- */
  L4.jour=function(){if(!on())return '';var L=list().filter(function(b){return b.g==='une'&&b.k});if(!L.length)return '';
    return '<section class="hj-c glass"><div class="hj-h"><div><b>Boosters du jour</b><small>Même prix qu’un drop normal, ou avec un drop gratuit</small></div></div><div class="l4-gr">'+L.map(function(b){return '<button class="l4-o" data-l4b="'+e(b.k)+'" data-l4go="1"><span class="l4-im"'+(b.img?' style="background-image:url(&quot;'+e(b.img)+'&quot;)"':'')+'></span><span><b>'+e(b.n)+'</b><small>'+e(b.s)+'</small></span></button>'}).join('')+'</div></section>'};

  /* ---------- parrainage : paliers à badge, filleuls en cours ---------- */
  var REF=window.REF4={d:null,ok:null,t:0};
  var TIERS=[[1,'Bronze','#c58a5a'],[3,'Argent','#c9d1db'],[10,'Or','#ffc23d'],[25,'Platine','#9fe3ff']];
  function refLoad(){if(!window.CL||!CL.user||REF.ok===false||Date.now()-REF.t<60e3)return;REF.t=Date.now();
    CL.sb.rpc('referral_me').then(function(r){if(r.error){REF.ok=false;return}REF.ok=true;REF.d=r.data;var o=REF.d;if(typeof tab!=='undefined'&&(tab==='shop'||tab==='profil')&&quiet())render()},function(){})}
  function quiet(){var a=document.getElementById('sh'),b=document.getElementById('ov'),c=document.getElementById('dd');return !(a&&a.innerHTML)&&!(b&&b.innerHTML)&&!(c&&c.innerHTML)&&!reveal}
  function refBlock(){var o=REF.d;if(!o)return '';
    var badges=TIERS.map(function(t,i){var got=o.paid>=t[0];return '<span class="l4-bd'+(got?' on':'')+'" style="--bc:'+t[2]+'" title="'+t[1]+' : '+t[0]+' filleul'+(t[0]>1?'s':'')+'"><i></i><b>'+t[1]+'</b><small>'+t[0]+'</small></span>'}).join('');
    var pend=(o.list||[]).slice(0,5).map(function(x){return '<li><b>'+e(x.pseudo||'Joueur')+'</b><span class="l4-pb"><i style="width:'+(x.packs*10)+'%"></i></span><small>'+x.packs+'/10 drops</small></li>'}).join('');
    return '<div class="l4-ref"><div class="l4-bds">'+badges+'</div><p class="cap" style="text-align:left">Ta récompense tombe quand ton filleul a ouvert 10 drops, sur au moins 2 jours différents. Ton pote, lui, reçoit ses 2 drops tout de suite.</p>'+(pend?'<ul class="l4-pl">'+pend+'</ul>':'')+'</div>'}
  /* la carte Parrainage est dessinée par social.js : on la complète après chaque rendu */
  function patchRef(){if(!REF.ok||!REF.d)return;document.querySelectorAll('#main .refc').forEach(function(c){if(c.querySelector('.l4-ref'))return;var o=REF.d;
    var sm=c.querySelector('.refp small');if(sm)sm.innerHTML='<b>'+o.paid+' filleul'+(o.paid>1?'s':'')+' validé'+(o.paid>1?'s':'')+'</b>'+(o.pending?' · '+o.pending+' en cours':'')+(o.next?' · prochain badge à '+o.next:'');
    var bar=c.querySelector('.refbar i');if(bar)bar.style.width=Math.min(100,o.paid/(o.next||25)*100)+'%';
    var go=c.querySelector('.refgo'),d=document.createElement('div');d.innerHTML=refBlock();if(go&&d.firstChild)go.insertAdjacentElement('beforebegin',d.firstChild)})}

  /* ---------- appareil (anti-triche) : identifiant au hasard gardé par ce navigateur ---------- */
  function devId(){var d=lsg('wd-dev');if(!d||!/^[A-Za-z0-9_-]{16,64}$/.test(d)){var a=new Uint8Array(18);(window.crypto||{}).getRandomValues?crypto.getRandomValues(a):a.forEach(function(_,i){a[i]=Math.random()*256|0});
      d=btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');lss('wd-dev',d)}
    try{document.cookie='wd-dev='+d+';max-age=31536000;path=/;samesite=lax;secure'}catch(x){}return d}
  function fp(){var s=[screen.width+'x'+screen.height,window.devicePixelRatio,navigator.language,(Intl.DateTimeFormat().resolvedOptions().timeZone||''),navigator.platform,navigator.hardwareConcurrency,navigator.deviceMemory].join('|');
    var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
  var seen=null;
  function devSeen(){if(!window.CL||!CL.user||seen===CL.user.id)return;seen=CL.user.id;
    CL.sb.rpc('device_seen',{p_dev:devId(),p_fp:fp()}).then(function(r){if(r.error||!r.data)return;
      if(r.data.dup&&lsg('wd-dup')!==CL.user.id){lss('wd-dup',CL.user.id);if(typeof toast==='function')toast('Ce navigateur a déjà un autre compte WaxDrop : pas d’échange ni de parrainage entre ces comptes')}},function(){})}

  /* ---------- clics ---------- */
  document.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-l4],[data-l4b]');if(!b)return;ev.stopPropagation();
    if(b.dataset.l4==='panel')panel();
    else if(b.dataset.l4==='odds')odds();
    else if(b.dataset.l4b!==undefined){L4.sel=b.dataset.l4b;lss('wd-booster',L4.sel);if(typeof closeMenu==='function')closeMenu();
      var c=cur();if(typeof toast==='function')toast('Booster : '+c.n);if(b.dataset.l4go&&typeof setTab==='function')setTab('ouvrir');else render()}
  },true);

  /* ---------- injection ---------- */
  function inject(){
    if(!window.CL||!CL.user||!on())return;devSeen();patchRef();
    if(tab==='ouvrir'){var v=document.querySelector('#main .v-open');if(v&&!v.querySelector('.l4b')){var bar=v.querySelector('.obar'),d=document.createElement('div');d.innerHTML=openBar();if(bar)bar.insertAdjacentElement('beforebegin',d.firstChild)}}
    if(tab==='shop'||tab==='profil')refLoad();
  }
  if(typeof render==='function'){var r0=render;window.render=function(){var r=r0.apply(this,arguments);try{inject()}catch(x){}return r}}
  try{inject()}catch(x){}
})();
