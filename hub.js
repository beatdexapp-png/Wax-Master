/* WaxDrop : hub « Aujourd'hui » du joueur connecté (08/11/2026).
   En haut de l'écran Ouvrir : une rangée de tuiles (réserve, série, missions, classement, Première soirée, tout voir).
   Page complète « Aujourd'hui » : Disquaire > Aujourd'hui sur téléphone (et la tuile « Tout voir »), entrée en tête de la barre latérale sur ordinateur.
   Avec la migration du lot 3 (S.l3) : vraie réserve, série et classement de la semaine du serveur.
   Sans elle : version simple, toujours vraie (drop gratuit, jours joués d'affilée sur cet appareil, classement général). Aucun bouton mort. */
(function(){
  if(typeof S==='undefined'||typeof render!=='function')return;
  function e(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function lsg(k){try{return localStorage.getItem(k)}catch(x){return null}}function lss(k,v){try{localStorage.setItem(k,v)}catch(x){}}
  function on(){return !!(window.CL&&CL.user&&CL.pseudo)}
  function l3(){return !!S.l3}
  function pday(o){var d=new Date(Date.now()+(o||0)*864e5);try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}catch(x){return d.toISOString().slice(0,10)}}
  var SV=function(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'};
  var IC={
    rsv:SV('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/><path d="M12 3.5v2M12 18.5v2"/>'),
    stk:SV('<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.6 1.2 2.6 2.3 3C10.6 8.6 11 5.6 12 3z"/>'),
    mis:SV('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>'),
    top:SV('<path d="M5 20V11M12 20V5M19 20v-6"/>'),
    qst:SV('<path d="M12 4l2.3 4.7 5.2.8-3.8 3.6.9 5.1L12 15.8 7.4 18.2l.9-5.1L4.5 9.5l5.2-.8z"/>'),
    all:SV('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'),
    book:SV('<path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h9"/>'),
    story:SV('<rect x="6" y="3" width="12" height="18" rx="3"/><path d="M10 8h4"/>'),
    gear:SV('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>'),
    tuto:SV('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4"/><path d="M12 16.8h.01"/>')
  };

  /* ---------- série simple (sans migration) : jours où un drop a été ouvert, vus sur cet appareil ---------- */
  function days(){try{return JSON.parse(lsg('wd-jours')||'[]')}catch(x){return[]}}
  function noteDay(){var p=S.packs|0,k=+lsg('wd-jours-p');if(isNaN(k)||lsg('wd-jours-p')===null){lss('wd-jours-p',p);return}
    if(p>k){var L=days(),t=pday();if(L[L.length-1]!==t){L.push(t);lss('wd-jours',JSON.stringify(L.slice(-30)))}}if(p!==k)lss('wd-jours-p',p)}
  function localStreak(){var L=days(),n=0,o=L[L.length-1]===pday()?0:-1;for(var i=L.length-1;i>=0;i--){if(L[i]===pday(o-n))n++;else break}return{n:n,today:L[L.length-1]===pday()}}

  /* ---------- données des tuiles ---------- */
  function rsv(){var n=typeof rsvN==='function'?rsvN():0;
    if(l3())return{n:n,t:'Réserve',v:n+'/'+S.l3.cap,s:n?'Ouvrir maintenant':'+1 bientôt',hot:n>0,full:n>=S.l3.cap};
    var r=S.bonus>0||freeReady();return{n:r?1:0,t:'Drop gratuit',v:S.bonus>0?S.bonus+' offert'+(S.bonus>1?'s':''):r?'Prêt':clock(S.freeAt-now()),clk:!r&&!(S.bonus>0),s:r?'Ouvrir maintenant':'Toutes les 10 min',hot:r}}
  function stk(){
    var k=S.l3&&S.l3.stk;
    if(k){var ready=!k.done&&k.play,n=k.n|0;return{t:'Série',v:n?n+' j':'0 j',s:k.done?'Validée aujourd’hui':ready?'Valider le jour':n?'Un drop pour valider':'Commence ta série',hot:ready,warn:window.STK&&STK.alert&&STK.alert()&&!ready,act:ready?'claim':'mis'}}
    var L=localStreak();return{t:'Jours d’affilée',v:L.n+' j',s:L.today?'Reviens demain':L.n?'Un drop pour continuer':'Ouvre un drop aujourd’hui',hot:false,act:L.today?'mis':'open'}}
  function mis(){var d=day(),L=todayMissions(),dn=L.filter(function(m){return d.cl[m.k]}).length,rd=L.filter(function(m){return !d.cl[m.k]&&(d[m.k]||0)>=m.n}).length;
    return{t:'Missions',v:dn+'/'+L.length,s:rd?rd+' récompense'+(rd>1?'s':'')+' à prendre':dn>=L.length?(d.cl.all?'Tout est fait':'Bonus à prendre'):'Encore '+(L.length-dn)+' aujourd’hui',hot:rd>0||(dn>=L.length&&!d.cl.all)}}
  function rank(){
    if(l3()&&window.WK){WK.load();if(WK.ok&&WK.d&&WK.d.me){var m=WK.d.me;return{t:'Cette semaine',v:m.rank?m.rank+(m.rank===1?'er':'e'):'-',s:m.ahead?'Encore '+(m.ahead.pts-m.pts+1)+' pts pour passer '+m.ahead.pseudo:m.pts?'En tête':'Ouvre un drop pour entrer',wk:1}}}
    var B=typeof board==='function'?board():[],me=B.filter(function(x){return x.me})[0];
    return{t:'Classement',v:me?me.r+(me.r===1?'er':'e'):'-',s:me&&me.r>1&&B[me.r-2]?'Juste derrière '+B[me.r-2].n:'Général'}}

  function tile(k,o,act){return '<button class="hb-t'+(o.hot?' hot':'')+(o.warn?' warn':'')+(o.full?' full':'')+'" data-hub="'+act+'" data-k="'+k+'"><span class="hb-i">'+IC[k]+'</span><span class="hb-x"><small>'+e(o.t)+'</small><b'+(o.clk?' data-clock="'+S.freeAt+'"':'')+'>'+e(o.v)+'</b><em>'+e(o.s)+'</em></span></button>'}
  function rail(){
    var h=tile('rsv',rsv(),'rsv')+tile('stk',stk(),'stk')+tile('mis',mis(),'mis')+tile('top',rank(),'top');
    if(window.QST&&QST.on())h+=tile('qst',{t:'Première soirée',v:QST.n()+'/'+QST.goal,s:QST.n()>=QST.goal?'Soirée réussie':'Encore '+(QST.goal-QST.n())+' drops'},'jour');
    h+='<button class="hb-t hb-all" data-hub="jour"><span class="hb-i">'+IC.all+'</span><span class="hb-x"><b>Tout voir</b><em>Ta journée</em></span></button>';
    return '<nav class="hub" aria-label="Aujourd’hui">'+h+'</nav>';
  }

  /* ---------- page complète ---------- */
  function hello(){var h=new Date().getHours();return (h<5||h>=18?'Bonsoir':'Bonjour')+(CL.pseudo?', '+CL.pseudo:'')}
  function bestOwned(){var b=null;for(var id in S.owned){if(!(S.owned[id]>0))continue;var c=C[id];if(c&&(!b||c.r>b.r||(c.r===b.r&&(c.s||0)>(b.s||0))))b=c}return b}
  function topCol(){var b=null,bn=0;ARTISTS.forEach(function(A){if(A.ids.length<8)return;var n=0;for(var i=0;i<A.ids.length;i++)if(S.owned[A.ids[i]]>0)n++;if(n>bn){bn=n;b=A}});return b?{A:b,n:bn}:null}
  function rankCard(){
    var wk=l3()&&window.WK&&WK.ok&&WK.d,L,me;
    if(wk){L=(WK.d.top||[]).slice(0,3).map(function(x){return{n:x.pseudo,s:x.pts,r:x.rank}});me=WK.d.me}
    else{var B=typeof board==='function'?board():[];L=B.slice(0,3);me=B.filter(function(x){return x.me})[0]}
    var rows=L.map(function(x){return '<li><span class="hj-rk">'+x.r+'</span><b>'+e(x.n)+'</b><small>'+(x.s|0).toLocaleString('fr-FR')+(wk?' pts':'')+'</small></li>'}).join('');
    var mine=me&&(me.rank||me.r)?'<p class="hj-me">Ta place : <b>'+(me.rank||me.r)+((me.rank||me.r)===1?'er':'e')+'</b>'+(wk&&me.ahead?' · encore '+(me.ahead.pts-me.pts+1)+' points pour passer '+e(me.ahead.pseudo):'')+'</p>':'';
    return '<section class="hj-c hj-top glass"><div class="hj-h"><span class="hb-i">'+IC.top+'</span><div><b>'+(wk?'Classement de la semaine':'Classement')+'</b><small>'+(wk?'Remis à zéro lundi à 0 h':'Depuis le début')+'</small></div></div><ol class="hj-l">'+rows+'</ol>'+mine+'<button class="gbtn" data-hub="top">Voir le classement</button></section>';
  }
  function rsvCard(){var o=rsv();
    return '<section class="hj-c hj-rsv glass"><div class="hj-h"><span class="hb-i">'+IC.rsv+'</span><div><b>'+(l3()?'Réserve de drops gratuits':'Drop gratuit')+'</b><small>'+(l3()?'Elle se remplit même quand tu n’es pas là':'Un toutes les '+(typeof hasPass==='function'&&hasPass()?'5':'10')+' minutes')+'</small></div></div>'+
      (l3()&&typeof rsvHTML==='function'?rsvHTML().replace('id="freecap"',''):'<p class="hj-big"'+(o.clk?' data-clock="'+S.freeAt+'"':'')+'>'+e(o.v)+'</p>')+
      '<button class="pbtn" data-hub="rsv"'+(o.n||S.bonus>0?'':' disabled')+'>'+(o.n||S.bonus>0?'Ouvrir un drop':'Bientôt prêt')+'</button></section>'}
  function stkCard(){if(l3())return '';var L=localStreak();
    var cells='';for(var i=6;i>=0;i--){var dd=pday(-i),hit=days().indexOf(dd)>=0;cells+='<span class="hj-d'+(hit?' on':'')+(i===0?' td':'')+'"><i></i><small>'+['D','L','M','M','J','V','S'][new Date(dd+'T12:00:00').getDay()]+'</small></span>'}
    return '<section class="hj-c hj-stk glass"><div class="hj-h"><span class="hb-i">'+IC.stk+'</span><div><b>'+(L.n?L.n+' jour'+(L.n>1?'s':'')+' d’affilée':'Ta série')+'</b><small>'+(L.today?'Drop ouvert aujourd’hui. Reviens demain.':'Ouvre un drop aujourd’hui pour la faire grandir.')+'</small></div></div><div class="hj-w">'+cells+'</div></section>'}
  function shortcuts(){
    var T=topCol(),b=bestOwned(),h='';
    if(T)h+='<button class="hj-s" data-act="book" data-k="'+e(T.A.key)+'"><span class="hb-i">'+IC.book+'</span><span><b>Classeur de '+e(T.A.n)+'</b><small>'+T.n+'/'+T.A.ids.length+' sons</small></span></button>';
    if(b&&window.shareCard)h+='<button class="hj-s" data-act="story" data-id="'+e(b.id)+'"><span class="hb-i">'+IC.story+'</span><span><b>Partager ta meilleure carte</b><small>'+e(b.t)+' · '+e((RAR[b.r]||{}).n||'')+'</small></span></button>';
    if(window.L5&&L5.sc)h+=L5.sc();
    h+='<button class="hj-s" data-hub="set"><span class="hb-i">'+IC.gear+'</span><span><b>Réglages</b><small>Mode économie, sans spoiler, notifications</small></span></button>';
    h+='<button class="hj-s" data-act="tuto"><span class="hb-i">'+IC.tuto+'</span><span><b>Revoir le tutoriel</b><small>4 étapes</small></span></button>';
    return '<section class="hj-c hj-sc"><div class="hj-h"><div><b>Raccourcis</b></div></div><div class="hj-sg">'+h+'</div></section>'}
  window.HUB={rail:rail,page:function(){noteDay();
    var q=window.QST&&QST.on()?QST.html():'';
    return '<div class="view v-jour vs">'+(typeof subHead==='function'?subHead('Aujourd’hui'):'')+'<p class="hj-hi">'+e(hello())+'</p>'+
      '<div class="hj-g"><div class="hj-col">'+stkCard()+rsvCard()+q+(window.L4&&L4.jour?L4.jour():'')+rankCard()+'</div><div class="hj-col">'+(typeof vMissions==='function'?'<section class="hj-c hj-mis glass">'+vMissions()+'<button class="gbtn" data-hub="mis">Toutes les missions</button></section>':'')+shortcuts()+'</div></div></div>'}};

  /* la page « Aujourd'hui » est une rubrique du Disquaire (shopSub 'jour'), comme Missions ou Succès */
  var vs0=window.vShop;if(typeof vs0==='function')window.vShop=function(){return shopSub==='jour'&&on()?HUB.page():vs0.apply(this,arguments)};

  /* ---------- clics ---------- */
  document.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-hub]');if(!b)return;ev.stopPropagation();var a=b.dataset.hub;
    if(typeof closeMenu==='function')closeMenu();
    if(a==='rsv'){if(typeof canFree==='function'&&canFree()){setTab('ouvrir');openPack('free')}else go('jour')}
    else if(a==='stk'){if(S.l3&&S.l3.stk&&!S.l3.stk.done&&S.l3.stk.play){var x=document.createElement('button');x.dataset.stk='claim';x.hidden=true;document.body.appendChild(x);x.click();x.remove()}else if(!S.l3&&!localStreak().today){setTab('ouvrir');if(typeof canFree==='function'&&canFree())openPack('free')}else go('saison')}
    else if(a==='mis')go('saison');
    else if(a==='top'){if(window.WK&&S.l3)WK.mode='wk';profSub='top';setTab('profil')}
    else if(a==='jour')go('jour');
    else if(a==='set'){if(typeof openMenu==='function')openMenu('set')}
  },true);
  function go(v){if(typeof closeStack==='function')closeStack();shopSub=v;setTab('shop')}

  /* ---------- injection : rangée sur Ouvrir, entrée de barre latérale, titre ---------- */
  function sideEntry(){var x=document.getElementById('sbx');if(!x||x.querySelector('[data-v="jour"]'))return;
    var h=document.createElement('div');h.innerHTML='<span class="sbh">Aujourd’hui</span><button data-act="sbgo" data-v="jour">'+IC.all+'<span>Ta journée</span><i class="dot" hidden></i></button>';
    x.prepend(h.childNodes[1]);x.prepend(h.firstChild)}
  function inject(){
    noteDay();if(!on())return;sideEntry();
    var sb=document.querySelector('#sbx [data-v="jour"]');if(sb){var d=sb.querySelector('.dot');if(d)d.hidden=!(rsv().full||stk().hot||mis().hot)}
    if(tab==='ouvrir'){var v=document.querySelector('#main .v-open');if(v&&!v.querySelector('.hub')){var t=v.querySelector('.otop'),w=document.createElement('div');w.innerHTML=rail();if(t)t.insertAdjacentElement('afterend',w.firstChild);else v.prepend(w.firstChild);v.classList.add('hashub')}}
    if(tab==='shop'&&shopSub==='jour'){var ht=document.getElementById('hdt');if(ht)ht.textContent='Aujourd’hui'}
  }
  var r0=render;window.render=function(){var r=r0.apply(this,arguments);try{inject()}catch(x){}return r};
  setInterval(function(){if(document.hidden||!on()||typeof tab==='undefined')return;var h=document.querySelector('#main .hub');if(!h||document.querySelector('#ov .ov'))return;
    var w=document.createElement('div');w.innerHTML=rail();if(w.firstChild&&w.firstChild.innerHTML!==h.innerHTML)h.innerHTML=w.firstChild.innerHTML},15e3);
  try{inject()}catch(x){}
})();
