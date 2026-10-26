/* WaxDrop : labels. Monte ton label avec tes potes : chaque drop rapporte des points, coffres chaque semaine, classement des labels. */
(function(){
  var NEED=[1500,5000,12000],REW=['+200','+2 drops','Drop Or'];
  var COLS=['#7c5cff','#ff5f86','#ffc23d','#3ddc84','#2fb6ff','#e5484d','#111111'];
  var D=null,col=COLS[0];
  function n(v){return (v||0).toLocaleString('fr-FR')}
  function sb(){return window.CL&&CL.sb}
  function badge(L,cls){return '<span class="lbg '+(cls||'')+'" style="--lc:'+esc(L.color||'#7c5cff')+'"><b>'+esc(L.tag||'?')+'</b></span>'}
  function av(m){var h=hash(m.pseudo||'?')%360;return '<span class="av" style="--avg:'+(m.avatar?'url(\''+esc(m.avatar)+'\') center/cover no-repeat,#333':'linear-gradient(140deg,hsl('+h+' 46% 60%),hsl('+((h+40)%360)+' 44% 34%))')+'">'+(m.avatar?'':esc((m.pseudo||'?').slice(0,2).toUpperCase()))+'</span>'}
  function top(T,me){return '<div class="lbtop">'+(T||[]).map(function(L,i){return '<div class="lbtr'+(me&&L.id===me?' me':'')+'"><em>'+(i+1)+'</em>'+badge(L)+'<span><b>'+esc(L.name)+'</b><small>'+L.n+' membre'+(L.n>1?'s':'')+'</small></span><strong>'+n(L.w)+'<small>pts</small></strong></div>'}).join('')+(!(T||[]).length?'<p class="cap">Aucun label pour l’instant. Sois le premier.</p>':'')+'</div>'}
  function head(t){return '<div class="shh"><h2>'+t+'</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div>'}
  function none(){return head('Labels')
    +'<div class="lbintro"><div class="lbart"><i></i><i></i><i></i></div><b>Monte ton label</b><p>Invite tes potes. Chaque drop ouvert par un membre rapporte des points au label (+10, et +5 par son nouveau). Chaque semaine, le label débloque des coffres pour tous ses membres et grimpe au classement.</p></div>'
    +'<div class="lbform"><span class="lbl">Créer un label · 500 wax coins</span><input id="lbn" maxlength="22" placeholder="Nom du label" autocomplete="off"><div class="lbcols">'+COLS.map(function(c){return '<button class="lbc" data-act="lbcol" data-c="'+c+'" style="--lc:'+c+'" aria-pressed="'+(c===col)+'" aria-label="Couleur"></button>'}).join('')+'</div><button class="pbtn" data-act="lbcreate">Créer mon label</button></div>'
    +'<div class="lbform"><span class="lbl">Rejoindre avec un code</span><div class="lbrow"><input id="lbc" maxlength="6" placeholder="Code à 6 caractères" autocomplete="off" autocapitalize="characters"><button class="gbtn" data-act="lbjoin">Rejoindre</button></div></div>'
    +'<span class="lbl">Classement de la semaine</span>'+top(D.top)}
  function mine(){var L=D.label,cl=L.claimed||[],max=NEED[2];
    var bar='<div class="evbar lbbar"><i style="width:'+Math.min(100,L.week/max*100)+'%"></i>'+NEED.map(function(v,k){var ok=L.week>=v,got=cl.indexOf(k)>=0;return '<button class="evt'+(ok?' ok':'')+(got?' got':'')+'" style="left:'+(v/max*100)+'%" data-act="'+(ok&&!got?'lbclaim':'')+'" data-t="'+k+'"><b>'+(got?'✓':(v/1000)+'k')+'</b><small>'+REW[k]+'</small></button>'}).join('')+'</div>';
    return head('Mon label')
      +'<div class="lbhero" style="--lc:'+esc(L.color)+'">'+badge(L,'big')+'<div><h3>'+esc(L.name)+'</h3><small>#'+L.rank+' cette semaine · '+D.label.members.length+'/20 membres</small></div></div>'
      +'<div class="lbweek"><div><span class="lbl">Points de la semaine</span><b>'+n(L.week)+'</b></div><div><span class="lbl">Depuis la création</span><b>'+n(L.pts)+'</b></div></div>'
      +'<span class="lbl">Coffres de la semaine (pour chaque membre)</span>'+bar
      +'<div class="lbinv"><div><span class="lbl">Code d’invitation</span><b class="lbcode">'+esc(L.code)+'</b></div><button class="pbtn" data-act="lbshare">'+ICON.share+'Inviter</button></div>'
      +'<span class="lbl">Membres · cette semaine</span><div class="lbmem">'+L.members.map(function(m,i){return '<div class="lbm'+(m.me?' me':'')+'"><em>'+(i+1)+'</em>'+av(m)+'<span><b>'+esc(m.pseudo||'Joueur')+(m.role==='owner'?' <u>Patron</u>':'')+'</b><small>'+n(m.pts)+' pts au total</small></span><strong>'+n(m.week)+'</strong>'+(L.owner&&!m.me?'<button class="gbtn sq sm2" data-act="lbkick" data-u="'+m.uid+'" aria-label="Retirer">'+ICON.x+'</button>':'')+'</div>'}).join('')+'</div>'
      +'<span class="lbl">Classement des labels</span>'+top(D.top,L.id)
      +'<button class="gbtn lbleave" data-act="lbleave">Quitter le label</button>'}
  function paint(){var box=sh.querySelector('.lbsh');if(!box||menuPage!=='label')return;box.innerHTML='<div class="grab"></div>'+(D.label?mine():none())}
  async function call(fn,a){var r=await sb().rpc(fn,a||{});if(r.error){toast(/fetch|network/i.test(r.error.message)?'Connexion impossible':r.error.message);return null}D=r.data;return D}
  async function open(){if(!sb()){toast('Connexion requise');return}closeMenu();menuPage='label';
    sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass lbsh" role="dialog" aria-label="Label"><div class="grab"></div><p class="cap">Chargement…</p></div>';
    if(await call('label_me'))paint()}
  function pill(){if(!window.CL||!CL.user)return '';var L=D&&D.label;
    return L?'<button class="lbp glass" data-act="label">'+badge(L,'sm')+'<span><b>'+esc(L.name)+'</b><small>#'+L.rank+' · '+n(L.week)+' pts</small></span></button>'
      :'<button class="lbp glass new" data-act="label"><span class="lbp0">'+ICON.users+'</span><span><b>Labels</b><small>Joue avec tes potes</small></span></button>'}
  window.LABEL={open:open,pill:pill,sub:function(){return D&&D.label?D.label.name+' · #'+D.label.rank:null}};
  document.addEventListener('click',async function(e){var t=e.target.closest('[data-act]');if(!t)return;var a=t.dataset.act;
    if(a==='label'){e.stopPropagation();open();return}
    if(!/^lb/.test(a))return;e.stopPropagation();
    if(a==='lbcol'){col=t.dataset.c;sh.querySelectorAll('.lbc').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.c===col)});return}
    if(a==='lbshare'){var code=D.label.code,txt='Rejoins mon label '+D.label.name+' sur WaxDrop avec le code '+code+' : waxdrop.fr';
      try{if(navigator.share){await navigator.share({text:txt});return}}catch(x){return}
      try{await navigator.clipboard.writeText(txt);toast('Invitation copiée')}catch(x){toast('Code : '+code)}return}
    if(a==='lbleave'&&!t.dataset.arm){t.dataset.arm=1;t.textContent='Confirmer : quitter';return}
    t.disabled=true;var ok=null;
    if(a==='lbcreate')ok=await call('label_create',{p_name:(sh.querySelector('#lbn')||{}).value||'',p_color:col});
    else if(a==='lbjoin')ok=await call('label_join',{p_code:(sh.querySelector('#lbc')||{}).value||''});
    else if(a==='lbleave')ok=await call('label_leave');
    else if(a==='lbkick')ok=await call('label_kick',{p_uid:t.dataset.u});
    else if(a==='lbclaim'){var k=+t.dataset.t;ok=await call('label_claim',{p_tier:k});if(ok){if(window.ECO&&ECO.sync)ECO.sync();rewardPop(k===0?{coins:200}:k===1?{maxi:2}:{gold:1,coins:300})}}
    t.disabled=false;if(ok){if(a==='lbcreate'){toast('Label créé');if(window.ECO&&ECO.sync)ECO.sync()}paint()}},true);
  /* charge le label en fond pour l'afficher dans le profil */
  setTimeout(function(){if(sb()&&CL.user)sb().rpc('label_me').then(function(r){if(!r.error){D=r.data;if((tab==='profil'||tab==='ouvrir')&&!stack.length&&!reveal)render()}})},4000);
})();
