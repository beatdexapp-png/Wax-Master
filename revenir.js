/* WaxDrop : lot 3 « Faire revenir les joueurs » (07/11/2026).
   Série de 7 jours, classement de la semaine, « changer cette mission », pastilles et notifications.
   Tout ce qui donne une récompense passe par le serveur (eco : streak, mission_swap ; week_board ; push_save).
   Sans la migration du lot 3, le serveur ne renvoie pas S.l3 : rien de ce fichier ne s'affiche et aucun appel nouveau n'est fait. */
(function(){
  if(typeof S==='undefined')return;
  function e(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function on(){return !!(S.l3&&window.CL&&CL.user)}
  function quiet0(){var a=document.getElementById('sh'),b=document.getElementById('ov'),c=document.getElementById('dd');return !(a&&a.innerHTML)&&!(b&&b.innerHTML)&&!(c&&c.innerHTML)&&!reveal}
  function parisDay(){try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(x){return new Date().toISOString().slice(0,10)}}
  function parisHour(){try{return +new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',hour:'2-digit',hourCycle:'h23'}).format(new Date())}catch(x){return new Date().getHours()}}
  function dayDiff(a,b){return Math.round((Date.parse(a+'T12:00:00Z')-Date.parse(b+'T12:00:00Z'))/864e5)}

  /* ---------- série de 7 jours ---------- */
  var RWD=[{c:40},{c:60},{b:1},{c:100},{b:2},{c:150},{g:1,c:200}];
  function rwTxt(r,long){var t=[];if(r.g)t.push(long?'1 Drop Or':'Or');if(r.b)t.push(r.b+' drop'+(r.b>1?'s':''));if(r.c)t.push(long?r.c+' wax coins':String(r.c));return t.join(' + ')}
  function st(){
    var k=S.l3&&S.l3.stk;if(!k)return null;var pd=parisDay(),n=k.n|0,last=k.last||null,done=!!k.done,play=!!k.play,sh=k.sh|0;
    if(k.pd&&k.pd!==pd){ /* minuit est passé depuis la dernière lecture du serveur */
      var g=last?dayDiff(pd,last):99;done=false;play=false;n=g<=1||(g===2&&sh)?n:0;if(!n)sh=1;
      if(!st.sy&&window.ECO&&ECO.sync){st.sy=1;setTimeout(function(){ECO.sync().then(function(){st.sy=0})},800)}}
    var gap=last?dayDiff(pd,last):99,pos=done?((n-1)%7)+1:(n%7)+1,saved=!done&&n>0&&gap===2;
    return{n:n,done:done,play:play,sh:sh,pos:pos,saved:saved,danger:!done&&n>0&&(gap===1&&parisHour()>=18||saved),ready:!done&&play};
  }
  var STK=window.STK={alert:function(){if(!on())return false;var s=st();return !!(s&&(s.ready||s.danger))}};
  var FL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.6 1.2 2.6 2.3 3C10.6 8.6 11 5.6 12 3z"/></svg>';
  var SH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>';
  function stkHTML(compact){
    var s=st();if(!s)return '';
    var next=RWD[s.pos-1],line;
    if(s.done)line='Validée aujourd’hui. Demain : jour '+(s.pos%7+1)+', '+rwTxt(RWD[s.pos%7],true)+'.';
    else if(s.saved)line='Hier manqué : ton protège-série te sauve si tu valides aujourd’hui.';
    else if(s.danger)line='En danger : valide avant minuit pour garder tes '+s.n+' jours.';
    else if(!s.play)line='Ouvre un drop aujourd’hui pour valider le jour '+s.pos+'.';
    else line='Jour '+s.pos+' prêt : '+rwTxt(next,true)+'.';
    var cells='';for(var i=1;i<=7;i++){var cls=i<s.pos||(s.done&&i===s.pos)?'past':i===s.pos?'cur':'';
      cells+='<span class="stk-c '+cls+(i===7?' j7':'')+'" style="--i:'+i+'"><em>J'+i+'</em><i>'+(cls==='past'?ICON.check:rwTxt(RWD[i-1]))+'</i></span>'}
    var btn=s.ready?'<button class="pbtn stk-b" data-stk="claim">'+(compact?'Valider':'Valider le jour '+s.pos)+'</button>':!s.done&&!compact?'<button class="gbtn stk-b" data-stk="go">Ouvrir un drop</button>':'';
    var title=s.n?'Série de '+s.n+' jour'+(s.n>1?'s':''):'Série de 7 jours';
    var shb='<span class="stk-sh'+(s.sh?'':' off')+'" title="'+(s.sh?'Protège-série prêt : 1 jour raté pardonné':'Protège-série utilisé cette semaine')+'" aria-label="'+(s.sh?'Protège-série prêt':'Protège-série utilisé')+'">'+SH+'<span>'+(s.sh?'Protège-série':'Utilisé')+'</span></span>';
    if(compact)line=s.ready?'Jour '+s.pos+' : '+rwTxt(next,true):s.danger&&!s.saved?'En danger : un drop avant minuit':line;
    return '<div class="stk glass'+(compact?' cmp':'')+(s.danger?' danger':'')+(s.ready?' ready':'')+'" role="group" aria-label="'+e(title)+'"><div class="stk-h"><span class="stk-f">'+FL+'</span><div class="stk-t"><b>'+title+'</b><small>'+line+'</small></div>'+(compact?btn||shb:shb)+'</div><div class="stk-d">'+cells+'</div>'+(compact?'':btn)+'</div>';
  }

  /* ---------- classement de la semaine ---------- */
  var WK=window.WK={d:null,ok:null,mode:'wk',t:0,busy:false};
  WK.load=function(force){
    if(!on()||WK.busy||WK.ok===false)return;if(!force&&WK.d&&Date.now()-WK.t<60e3)return;
    WK.busy=true;CL.sb.rpc('week_board',{lim:50}).then(function(r){WK.busy=false;WK.t=Date.now();
      if(r.error){WK.ok=false;return}WK.ok=true;WK.d=r.data;if(typeof tab!=='undefined'&&tab==='profil'&&profSub==='top'&&quiet0())render()},function(){WK.busy=false});
  };
  function relance(){
    var m=WK.d&&WK.d.me;if(!m)return '';
    if(!m.pts)return 'Ouvre un drop pour entrer au classement de la semaine.';
    if(m.ahead){var g=m.ahead.pts-m.pts+1;return 'Encore <b>'+g+'</b> point'+(g>1?'s':'')+' pour passer <b>'+e(m.ahead.pseudo)+'</b>.'}
    return 'Tu es en tête cette semaine. Garde ta place jusqu’à lundi.';
  }
  WK.head=function(){
    if(!on())return '';WK.load();if(!WK.ok)return '';
    var m=WK.d.me||{},left=Math.max(0,+new Date(WK.d.ends)-Date.now());
    var seg='<div class="wkseg" role="tablist" aria-label="Période du classement"><button role="tab" data-wk="wk" aria-selected="'+(WK.mode==='wk')+'">Cette semaine</button><button role="tab" data-wk="all" aria-selected="'+(WK.mode!=='wk')+'">Depuis le début</button></div>';
    if(WK.mode!=='wk')return seg;
    return seg+'<div class="wkh glass"><div class="wkr"><span class="wkk">Ta place</span><b>'+(m.rank?m.rank+(m.rank===1?'<sup>er</sup>':'<sup>e</sup>'):'-')+'</b><small>'+(m.pts|0).toLocaleString('fr-FR')+' pts</small></div><div class="wkt"><p>'+relance()+'</p><small>Remise à zéro lundi à 0 h, dans <span data-until="'+e(WK.d.ends)+'">'+dur(left)+'</span>. 10 points par drop, 5 par son nouveau, 50 par album complété.</small></div></div>';
  };
  WK.rows=function(){
    if(!on()||!WK.ok||WK.mode!=='wk'||!WK.d)return null;
    var me0=window.CL&&CL.pseudo,L=(WK.d.top||[]).map(function(x){return{n:x.pseudo,s:x.pts,av:x.avatar_url,r:x.rank,me:!!(me0&&x.pseudo===me0)}});
    if(!L.length)return '<p class="cap wke">Personne n’a encore de points cette semaine. Ouvre un drop pour prendre la 1<sup>re</sup> place.</p>';
    var h=L.map(boardRow).join('');var m=WK.d.me;
    if(m&&m.rank&&!L.some(function(x){return x.me}))h+='<div class="wkgap" aria-hidden="true">···</div>'+boardRow({n:me0||'Toi',s:m.pts,r:m.rank,me:true});
    return h;
  };

  /* ---------- notifications (web push) ---------- */
  var VAPID='BIkpldyMJ6rrkiAlavhA9yP4vrbSUonzPFqxZY8dXfrvJerI_RwH4t6SBkU0HQeTWfGVbC3zx6f0inFeOoClUCI';
  var ua=navigator.userAgent,isIOS=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
  function pushOk(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window}
  function lsg(k){try{return localStorage.getItem(k)}catch(x){return null}}function lss(k,v){try{localStorage.setItem(k,v)}catch(x){}}
  function u8(b){var p='='.repeat((4-b.length%4)%4),s=atob((b+p).replace(/-/g,'+').replace(/_/g,'/')),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a}
  var NOTIF=window.NOTIF={busy:false};
  NOTIF.row=function(){
    if(!on())return '';var sub,ctl;
    if(isIOS&&!standalone){sub='Sur iPhone, elles marchent seulement quand WaxDrop est installé sur l’écran d’accueil.';ctl='<button class="gbtn" style="height:38px" data-ntf="inst">Installer</button>'}
    else if(!pushOk()){sub='Ce navigateur ne les reçoit pas. Les pastilles dans le jeu restent actives.';ctl=''}
    else if(Notification.permission==='denied'){sub='Bloquées dans les réglages du navigateur. Les pastilles dans le jeu restent actives.';ctl=''}
    else{var v=lsg('wd-push')==='1';sub='Réserve pleine, ami qui te propose un échange, série en danger. Jamais de pub.';ctl='<button class="sw" role="switch" aria-checked="'+v+'" data-ntf="sw" aria-label="Notifications"'+(NOTIF.busy?' disabled':'')+'></button>'}
    return '<div class="set"><b>Notifications<small>'+sub+'</small></b>'+ctl+'</div>';
  };
  async function pushOn(){
    var p=await Notification.requestPermission();if(p!=='granted'){toast('Notifications refusées');return}
    var reg=await navigator.serviceWorker.ready;var s=await reg.pushManager.getSubscription();
    if(!s)s=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(VAPID)});
    var j=s.toJSON();var r=await CL.sb.rpc('push_save',{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth});
    if(r.error){try{await s.unsubscribe()}catch(x){}toast(niceErr(r.error.message));return}
    lss('wd-push','1');toast('Notifications activées');
  }
  async function pushOff(){
    try{var reg=await navigator.serviceWorker.ready;var s=await reg.pushManager.getSubscription();if(s){await CL.sb.rpc('push_del',{p_endpoint:s.endpoint});await s.unsubscribe()}}catch(x){}
    lss('wd-push','0');toast('Notifications coupées');
  }
  function instWin(){var b=document.getElementById('inst');if(!b)return;var h=document.getElementById('ith'),t=document.getElementById('itx'),i=document.getElementById('iios');
    if(h)h.textContent='Installe WaxDrop pour les notifications';if(t)t.textContent='Sur iPhone, Apple n’envoie les notifications qu’aux sites installés sur l’écran d’accueil (iOS 16.4 ou plus récent). Trois gestes dans Safari :';if(i)i.hidden=false;b.hidden=false}

  /* ---------- clics ---------- */
  document.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-stk],[data-act="mswap"],[data-wk],[data-ntf]');if(!b)return;ev.stopPropagation();
    if(b.dataset.stk==='claim'){if(b.disabled)return;b.disabled=true;ECO.op('streak').then(function(r){if(r){toast('Jour '+r.pos+' validé · '+rwTxt(r.rw||{},true));if(window.fx&&fx.burst)try{fx.burst(b)}catch(x){}}render()})}
    else if(b.dataset.stk==='go'){if(typeof closeMenu==='function')closeMenu();setTab('ouvrir')}
    else if(b.dataset.act==='mswap'){if(b.disabled)return;b.disabled=true;var m=MISS.find(function(x){return x.k===b.dataset.k});
      ECO.op('mission_swap',{k:b.dataset.k}).then(function(r){if(r){var n=MISS.find(function(x){return x.k===r.k});toast('Nouvelle mission : '+(r.k==='topA'?'un son de ton top':n?n.t:'')) }render()})}
    else if(b.dataset.wk){WK.mode=b.dataset.wk;if(WK.mode==='wk')WK.load(true);render()}
    else if(b.dataset.ntf==='inst'){if(typeof closeMenu==='function')closeMenu();instWin()}
    else if(b.dataset.ntf==='sw'){if(NOTIF.busy)return;NOTIF.busy=true;var was=lsg('wd-push')==='1';
      (was?pushOff():pushOn()).catch(function(){toast('Impossible d’activer les notifications ici')}).then(function(){NOTIF.busy=false;if(typeof renderMenu==='function')renderMenu()})}
  },true);

  /* ---------- injection dans les vues + pastilles ---------- */
  function inject(){
    if(!on())return;var main=document.getElementById('main');if(!main)return;
    if(tab==='ouvrir'){var v=main.querySelector('.v-open');if(v&&!v.querySelector('.stk')){var a=v.querySelector('.qst')||v.querySelector('.otop');var d=document.createElement('div');d.innerHTML=stkHTML(true);if(d.firstChild){if(a)a.insertAdjacentElement('afterend',d.firstChild);else v.prepend(d.firstChild)}}}
    main.querySelectorAll('.mhead').forEach(function(h){var p=h.previousElementSibling;if(p&&p.classList.contains('stk'))return;var d=document.createElement('div');d.innerHTML=stkHTML(false);if(d.firstChild)h.insertAdjacentElement('beforebegin',d.firstChild)});
  }
  function badge(){
    if(!on()||!('setAppBadge' in navigator))return;
    var n=(typeof rsvN==='function'&&S.l3&&rsvN()>=S.l3.cap?1:0)+(window.SOC&&SOC.pending?SOC.pending():0)+(STK.alert()?1:0);
    try{n?navigator.setAppBadge(n).catch(function(){}):navigator.clearAppBadge().catch(function(){})}catch(x){}
  }
  if(typeof render==='function'){var r0=render;window.render=function(){var r=r0.apply(this,arguments);try{inject();badge()}catch(x){}return r}}
  setInterval(function(){if(document.hidden||!on())return;badge();if(S.day&&S.day.d!==new Date().toISOString().slice(0,10)&&window.ECO&&ECO.sync&&quiet0()&&!STK.sy2){STK.sy2=1;ECO.sync().then(function(){STK.sy2=0;render()})}var c=document.querySelector('#main .stk');if(c&&quiet0()){var s=st(),k=s&&(s.danger+'|'+s.ready+'|'+s.done);if(k!==STK.k){if(STK.k!==undefined)render();STK.k=k}}},30e3);
  try{inject()}catch(x){}
})();
