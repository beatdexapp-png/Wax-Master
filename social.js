/* WaxDrop : échanges entre joueurs et profil (photo, pseudo) */
(function(){
  if(!window.CL||!CL.sb)return;
  var sb=CL.sb;
  var SOC=window.SOC={list:[],sub:'amis',player:null,pick:{give:null,want:null},sig:'',fr:[],code:null,fsig:''};
  function me(){return CL.user&&CL.user.id}
  function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  SOC.pending=function(){var u=me();return SOC.list.filter(function(t){return t.status==='pending'&&t.to_id===u}).length+SOC.fr.filter(function(f){return f.status==='pending'&&f.dir==='in'}).length};
  SOC.friends=function(){return SOC.fr.filter(function(f){return f.status==='accepted'})};
  function avH(url,name,cls){name=name||'?';return '<span class="av '+(cls||'')+'" style="--avg:'+(url?"url('"+esc(url)+"') center/cover no-repeat,#333":'linear-gradient(140deg,hsl('+(hash(name)%360)+' 46% 60%),hsl('+((hash(name)+40)%360)+' 44% 34%))')+'">'+(url?'':esc(name.slice(0,2).toUpperCase()))+'</span>'}
  SOC.avH=avH;
  function quiet(){return !sh.innerHTML&&!ov.innerHTML&&!dd.innerHTML&&!reveal}

  async function load(){
    if(!me())return;
    var r=await sb.from('trades').select('*').order('created_at',{ascending:false}).limit(60);
    if(r.error)return;
    var f=await sb.rpc('friends_list');
    if(!f.error&&f.data){SOC.fr=f.data.rows||[];SOC.code=f.data.code;SOC.by=f.data.by||null;var nr=f.data.ref||0,old=null;try{old=localStorage.getItem('td-ref')}catch(e){}if(old!==null&&nr>+old){toast(nr-old>1?(nr-old)+' potes ont rejoint grâce à toi : +'+2*(nr-old)+' drops':'Un pote a rejoint grâce à toi : +2 drops et +150 wax coins');if(window.ECO&&ECO.sync)ECO.sync()}SOC.ref=nr;lsSet('td-ref',String(nr))}
    var sig=r.data.map(function(t){return t.id+t.status}).join(',')+'|'+SOC.fr.map(function(x){return x.id+x.status}).join(',');var ch=sig!==SOC.sig;SOC.sig=sig;SOC.list=r.data;
    if(ch){if(tab==='shop'&&(shopSub==='echanges'||shopSub==='hub')&&quiet())render();else{var d=$('shdot');if(d)d.hidden=!(SOC.pending()>0)}}
  }
  async function events(){
    if(!me())return;
    var r=await sb.rpc('trade_events');if(r.error||!Array.isArray(r.data)||!r.data.length)return;
    var notes=[];
    r.data.forEach(function(e){
      if(e.status==='accepted'&&C[e.want]){notes.push((e.to||'Le joueur')+' a accepté : tu reçois '+C[e.want].t)}
      else if(C[e.give]){notes.push(e.status==='declined'?(e.to||'Le joueur')+' a refusé ton échange':'Échange annulé, ton son est revenu')}
    });
    if(notes.length)toast(notes[notes.length-1]);if(window.ECO)await ECO.sync();if(quiet())render();
  }
  SOC.kick=function(){useInvite().then(load);events()};

  /* ---------- page Échanges du Shop ---------- */
  SOC.body=function(){
    var u=me(),nf=SOC.friends().length,dem=SOC.fr.filter(function(f){return f.status==='pending'&&f.dir==='in'}).length,
      tr=SOC.list.filter(function(t){return t.to_id===u&&t.status==='pending'}).length;
    return refCard()+'<div class="frbox"><form class="frs" id="frf" autocomplete="off"><span class="frsi">'+ICON.search+'</span><input id="frq" type="search" placeholder="Chercher un joueur par pseudo" maxlength="20" aria-label="Pseudo" value="'+esc(SOC.q||'')+'"><button class="pbtn" type="submit">Ajouter</button></form><div class="frres" id="frres"></div><p class="msg" id="frmsg"></p>'+
      '</div>'+
      '<div class="chips">'+[['amis','Amis'+(nf?' · '+nf:'')],['demandes','Demandes'+(dem?' · '+dem:'')],['echanges','Échanges'+(tr?' · '+tr:'')]].map(function(x){return '<button class="chip" data-act="trsub" data-v="'+x[0]+'" aria-pressed="'+(SOC.sub===x[0])+'">'+x[1]+'</button>'}).join('')+'</div><div class="pgr" id="pgr"></div>';
  };
  function thumb(id){var c=C[id];return c?'<button class="lth" data-act="see" data-id="'+id+'" aria-label="'+esc(c.t)+'">'+tileHTML(c,{nocount:1,lock:false})+'</button>':''}
  function row(t){
    var mine=t.from_id===me(),other=mine?t.to_name:t.from_name;if(!C[t.give_card]||!C[t.want_card])return '<div class="trr"><div class="ttl"><small>Son indisponible</small></div></div>';
    var youGive=mine?t.give_card:t.want_card,youGet=mine?t.want_card:t.give_card,acts;
    if(t.status==='pending')acts=mine?'<button class="lbtn" data-act="trcancel" data-id="'+t.id+'">Annuler</button>':'<button class="lbtn on" data-act="tracc" data-id="'+t.id+'">Accepter</button><button class="lbtn ghost" data-act="trdec" data-id="'+t.id+'">Refuser</button>';
    else acts='<span class="st">'+(t.status==='accepted'?'Accepté':t.status==='declined'?'Refusé':'Annulé')+'</span>';
    return '<div class="trr">'+thumb(youGive)+'<span class="arr">'+ICON.swap+'</span>'+thumb(youGet)+'<div class="ttl"><b>'+esc(other||'Joueur')+'</b><small>Tu donnes '+esc(C[youGive].t)+'</small><small>Tu reçois '+esc(C[youGet].t)+'</small></div><div class="acts">'+acts+'</div></div>';
  }
  function frRow(f){
    var b;
    if(f.status==='accepted')b='<button class="lbtn" data-act="trplayer" data-p="'+esc(f.pseudo)+'">'+ICON.swap+'Échanger</button>';
    else if(f.dir==='in')b='<span class="acts"><button class="lbtn on" data-act="fracc" data-id="'+f.id+'">Accepter</button><button class="lbtn ghost" data-act="frdec" data-id="'+f.id+'">Refuser</button></span>';
    else b='<span class="acts"><span class="st">En attente</span><button class="lbtn ghost" data-act="frdel" data-id="'+f.id+'">Annuler</button></span>';
    var who=avH(f.avatar,f.pseudo)+'<b>'+esc(f.pseudo||'Joueur')+'</b><em>'+(f.score||0).toLocaleString('fr-FR')+' pts</em>';
    return '<div class="prow fr">'+(f.status==='accepted'?'<button class="frwho" data-act="frstats" data-p="'+esc(f.pseudo)+'" aria-label="Stats de '+esc(f.pseudo||'Joueur')+'">'+who+'</button>':who)+b+'</div>';
  }
  SOC.layout=function(h){
    if(SOC.sub==='amis'){
      var L=SOC.friends();
      if(!L.length){h.innerHTML='<div class="frempty"><div class="fre" aria-hidden="true"><i></i><i></i><i></i></div><b>Pas encore d’amis</b><p class="cap">Parraine tes potes : +2 drops pour toi et pour eux, puis échangez vos doubles.</p><button class="pbtn" data-act="frshare">Parrainer un pote</button></div>';return}
      pager(h,L,frRow,{cellH:64,minW:320,gap:8,flow:1});
    }else if(SOC.sub==='demandes'){
      pager(h,SOC.fr.filter(function(f){return f.status==='pending'}).sort(function(a,b){return a.dir===b.dir?0:a.dir==='in'?-1:1}),frRow,{cellH:64,minW:320,gap:8,flow:1,empty:'Aucune demande d’ami'});
    }else{
      var u=me(),L2=SOC.list.filter(function(t){return t.to_id===u||t.from_id===u});
      pager(h,L2,row,{cellH:84,minW:340,gap:8,flow:1,empty:'Aucun échange. Choisis un ami pour lui proposer un échange.'});
    }
  };
  /* ---------- amis : invitation, demandes ---------- */
  var INV='Rejoins-moi sur WaxDrop, le jeu de cartes du rap : avec mon lien on gagne 2 drops gratuits chacun. Gratuit, pas besoin de code.';
  var PAL=[[3,'1 Drop Or'],[10,'2 Drops Or'],[25,'3 Drops Or']];
  function refCard(){var n=SOC.ref||0,nx=PAL.find(function(p){return n<p[0]})||PAL[PAL.length-1],max=nx[0],url=SOC.code?location.host+'/?ami='+SOC.code:'';
    return '<div class="refc"><div class="refh"><span class="refi">'+ICON.gift+'</span><div><span class="refk">Parrainage</span><b>Invite un pote, gagnez 2 drops chacun</b></div></div>'+
      '<div class="refg"><div><b>+2 drops</b><small>+150 wax coins pour toi</small></div><div><b>+2 drops</b><small>+100 wax coins pour ton pote</small></div></div>'+
      '<div class="refp"><div class="refbar"><i style="width:'+Math.min(100,n/max*100)+'%"></i></div><small><b>'+n+' filleul'+(n>1?'s':'')+'</b> · '+(n>=25?'Merci, tu as tout débloqué':'Bonus à '+max+' : '+nx[1])+'</small></div>'+
      (url?'<button class="refl" data-act="frcopy"><span>'+esc(url)+'</span><em>Copier</em></button>':'')+
      '<button class="pbtn refgo" data-act="frshare">'+ICON.share+'Parrainer un pote</button>'+
      (SOC.by?'<p class="cap">Parrainé par '+esc(SOC.by)+'</p>':'<p class="cap">Ton pote doit créer son compte avec ton lien.</p>')+'</div>'}
  SOC.refCard=refCard;
  async function share(){
    if(!SOC.code)await load();
    if(!SOC.code){toast('Connexion requise');return}
    var url=location.origin+'/?ami='+SOC.code;
    if(navigator.share){try{await navigator.share({title:'WaxDrop',text:INV,url:url});return}catch(e){if(e&&e.name==='AbortError')return}}
    try{await navigator.clipboard.writeText(INV+' '+url);toast('Lien de parrainage copié')}catch(e){toast(url)}
  }
  async function copyLink(){if(!SOC.code)await load();if(!SOC.code)return;var url=location.origin+'/?ami='+SOC.code;try{await navigator.clipboard.writeText(url);toast('Lien copié')}catch(e){toast(url)}}
  SOC.share=share;
  function addSheet(){
    if(!SOC.friends().length){share();return}
    closeMenu();menuPage='addf';
    sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Ajouter des amis"><div class="grab"></div><div class="shh"><h2>Ajouter des amis</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div>'+
      '<form class="trs" id="frf"><input class="tin" id="frq" placeholder="Pseudo de ton ami" autocomplete="off" maxlength="20" aria-label="Pseudo"><button class="pbtn" type="submit">Envoyer</button></form>'+
      '<p class="msg" id="frmsg"></p><div class="orl"><span>ou</span></div><button class="gbtn wide" data-act="frshare">'+ICON.share+'Partager mon lien d’invitation</button></div>';
    setTimeout(function(){var q=$('frq');if(q)q.focus()},250);
  }
  var sT=0;
  async function search(q){
    SOC.q=q;var box=$('frres');if(!box)return;
    if(q.trim().length<2){box.innerHTML='';return}
    var r=await sb.rpc('search_players',{p_q:q.trim()});
    box=$('frres');if(!box||SOC.q!==q)return;
    if(r.error){box.innerHTML='';return}
    var L=r.data||[];
    box.innerHTML=L.length?L.map(function(p){
      var b=p.rel==='accepted'?'<span class="st">Ami</span>':p.rel==='pending:out'?'<span class="st">Demande envoyée</span>':p.rel==='pending:in'?'<button class="lbtn on" data-act="frreq" data-p="'+esc(p.pseudo)+'">Accepter</button>':'<button class="lbtn" data-act="frreq" data-p="'+esc(p.pseudo)+'">'+ICON.plus+'Ajouter</button>';
      return '<div class="prow fr">'+avH(p.avatar,p.pseudo)+'<b>'+esc(p.pseudo)+'</b><em>'+(p.score||0).toLocaleString('fr-FR')+' pts</em>'+b+'</div>'}).join(''):'<p class="cap">Aucun joueur trouvé</p>';
  }
  document.addEventListener('input',function(ev){if(ev.target&&ev.target.id==='frq'){var q=ev.target.value;clearTimeout(sT);sT=setTimeout(function(){search(q)},250)}});
  async function request(ps){
    var m=$('frmsg');if(!ps||ps.length<3){if(m)m.textContent='Entre un pseudo';return}
    var r=await sb.rpc('friend_request',{p_pseudo:ps});
    if(r.error){if(m)m.textContent=niceErr(r.error.message);return}
    closeMenu();SOC.q='';toast(r.data==='accepted'?'Vous êtes maintenant amis':'Demande envoyée à '+ps);SOC.sub=r.data==='accepted'?'amis':'demandes';await load();render();
  }
  async function frAct(fn,args,msg){var r=await sb.rpc(fn,args);if(r.error){toast(niceErr(r.error.message));return}if(msg)toast(msg);await load();render()}
  /* lien d'invitation reçu */
  try{var ami=new URLSearchParams(location.search).get('ami');if(ami){localStorage.setItem('td-ami',ami);history.replaceState(null,'',location.pathname)}}catch(e){}
  async function useInvite(){
    var c=null;try{c=localStorage.getItem('td-ami')}catch(e){}
    if(!c||!me())return;
    var r=await sb.rpc('friend_invite',{p_code:c});
    try{localStorage.removeItem('td-ami')}catch(e){}
    if(!r.error&&r.data){var pp=String(r.data).split('|');if(pp[1]==='ref'){if(window.ECO&&ECO.sync)await ECO.sync();if(typeof rewardPop==='function')rewardPop({maxi:2,coins:100});toast('Parrainé par '+pp[0]+' : +2 drops offerts')}else toast('Tu es maintenant ami avec '+pp[0]);await load();if(quiet())render()}
  }

  /* ---------- fiche d'un joueur : choisir l'échange ---------- */
  async function openPlayer(ps){
    if(!ps)return;
    var r=await sb.rpc('player_card',{p_pseudo:ps});
    if(r.error){toast('Connexion au serveur impossible');return}
    if(!r.data){toast('Aucun joueur avec ce pseudo');return}
    if(r.data.me){toast('C’est toi');return}
    if(!r.data.friend){toast('Ajoute '+r.data.pseudo+' en ami pour échanger');return}
    SOC.player=r.data;SOC.pick={give:null,want:null};renderPlayer();
  }
  function renderPlayer(){
    var P=SOC.player;
    var theirs=(P.doubles||[]).filter(function(id){return C[id]}).map(function(id){return C[id]}).sort(function(a,b){return b.r-a.r});
    var mine=CARDS.filter(function(c){return (S.owned[c.id]||0)>1}).sort(function(a,b){return b.r-a.r});
    closeMenu();menuPage='trade';
    sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Échange avec '+esc(P.pseudo)+'"><div class="grab"></div>'+
      '<div class="shh"><div class="phd">'+avH(P.avatar,P.pseudo,'tbig')+'<div><b>'+esc(P.pseudo)+'</b><small>'+(P.score||0).toLocaleString('fr-FR')+' pts</small></div></div><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div>'+
      '<span class="lbl">Tu reçois · ses doubles</span>'+(theirs.length?'<div class="trow">'+theirs.map(function(c){return '<button class="tpick" data-act="tpw" data-id="'+c.id+'" aria-pressed="false">'+tileHTML(c,{nocount:1,lock:false})+(own(c.id)?'':'<em class="nw">Manque</em>')+'</button>'}).join('')+'</div>':'<p class="muted">Ce joueur n’a pas encore de doubles</p>')+
      '<span class="lbl">Tu donnes · tes doubles</span>'+(mine.length?'<div class="trow">'+mine.map(function(c){return '<button class="tpick" data-act="tpg" data-id="'+c.id+'" aria-pressed="false">'+tileHTML(c)+'</button>'}).join('')+'</div>':'<p class="muted">Tu n’as pas encore de doubles</p>')+
      '<button class="pbtn" id="tpgo" data-act="tpropose" disabled>Proposer l’échange</button><button class="gl2" data-act="frrm" data-p="'+esc(P.pseudo)+'">Retirer des amis</button></div>';
  }
  function pick(t,k){t.parentElement.querySelectorAll('.tpick').forEach(function(x){x.setAttribute('aria-pressed',x===t)});SOC.pick[k]=t.dataset.id;var b=$('tpgo');if(b)b.disabled=!(SOC.pick.give&&SOC.pick.want)}
  async function propose(){
    var P=SOC.player,g=SOC.pick.give,w=SOC.pick.want;if(!P||!g||!w)return;
    if((S.owned[g]||0)<2){toast('Il te faut ce son en double');return}
    var b=$('tpgo');if(b){b.disabled=true;b.textContent='Envoi…'}
    var r=await sb.rpc('propose_trade',{p_to:P.pseudo,p_give:g,p_want:w});
    if(r.error){toast(niceErr(r.error.message));if(b){b.disabled=false;b.textContent='Proposer l’échange'}return}
    if(window.ECO)await ECO.sync(true);closeMenu();toast('Proposition envoyée à '+P.pseudo);SOC.sub='envoyes';await load();if(tab==='shop'&&shopSub==='echanges')render();
  }
  async function respond(id,ok){
    var t=SOC.list.find(function(x){return String(x.id)===String(id)});if(!t)return;
    if(ok&&!own(t.want_card)){toast('Tu n’as plus '+(C[t.want_card]?C[t.want_card].t:'ce son'));return}
    var r=await sb.rpc('respond_trade',{p_id:t.id,p_accept:ok});
    if(r.error){toast(niceErr(r.error.message));load();return}
    if(window.ECO)await ECO.sync(true);
    if(ok)toast('Échange fait : tu reçois '+(C[t.give_card]?C[t.give_card].t:'un son'))
    else toast('Échange refusé');
    await load();render();
  }
  async function cancel(id){
    var r=await sb.rpc('cancel_trade',{p_id:+id});if(r.error){toast(niceErr(r.error.message));return}
    await events();if(window.ECO)await ECO.sync(true);await load();render();
  }

  /* ---------- profil : photo et pseudo ---------- */
  SOC.profileSheet=function(){
    if(!me())return;closeMenu();menuPage='prof';
    sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass" role="dialog" aria-label="Modifier le profil"><div class="grab"></div><div class="shh"><h2>Mon profil</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div>'+
      '<div class="avup">'+avH(CL.avatar,CL.pseudo||'Moi','tbig')+'<label class="gbtn" for="avfile" style="cursor:pointer">'+ICON.cam+'Changer la photo</label><input type="file" id="avfile" accept="image/*" hidden></div>'+
      '<label class="lbl" for="pfpseudo">Pseudo</label><input class="tin" id="pfpseudo" maxlength="20" autocomplete="nickname" value="'+esc(CL.pseudo||'')+'">'+
      '<p class="msg" id="pfmsg"></p><div class="row"><button class="pbtn" data-act="pfsave">Enregistrer</button><button class="gbtn" data-act="clout">Se déconnecter</button></div></div>';
  };
  function pfMsg(t){var m=$('pfmsg');if(m)m.textContent=t}
  async function savePseudo(){
    var el=$('pfpseudo'),p=el?el.value.trim():'';
    if(p===CL.pseudo){closeMenu();return}
    if(p.length<3||p.length>20){pfMsg('Le pseudo doit faire entre 3 et 20 caractères');return}
    var u=await sb.from('profiles').update({pseudo:p}).eq('id',me());
    if(u.error){pfMsg(/duplicate|unique/i.test(u.error.message)?'Ce pseudo est déjà pris':'Impossible d’enregistrer');return}
    CL.pseudo=p;lsSet('bd-pseudo',p);closeMenu();toast('Profil enregistré');render();
  }
  function resize(file){return new Promise(function(ok,ko){var img=new Image();var url=URL.createObjectURL(file);img.onload=function(){var s=Math.min(img.width,img.height),c=document.createElement('canvas');c.width=c.height=256;c.getContext('2d').drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,256,256);URL.revokeObjectURL(url);c.toBlob(function(b){b?ok(b):ko()},'image/jpeg',.85)};img.onerror=ko;img.src=url})}
  async function upload(file){
    pfMsg('Envoi de la photo…');
    try{
      var blob=await resize(file),path=me()+'.jpg';
      var up=await sb.storage.from('avatars').upload(path,blob,{upsert:true,contentType:'image/jpeg',cacheControl:'60'});
      if(up.error)throw up.error;
      var pub=sb.storage.from('avatars').getPublicUrl(path).data.publicUrl+'?v='+Date.now();
      var u=await sb.from('profiles').update({avatar_url:pub}).eq('id',me());if(u.error)throw u.error;
      CL.avatar=pub;lsSet('bd-avatar',pub);SOC.profileSheet();pfMsg('Photo enregistrée');render();
    }catch(e){pfMsg('Envoi impossible. Essaie une autre image.')}
  }

  document.addEventListener('change',function(ev){if(ev.target&&ev.target.id==='avfile'&&ev.target.files&&ev.target.files[0])upload(ev.target.files[0])});
  document.addEventListener('submit',function(ev){if(ev.target&&ev.target.id==='frf'){ev.preventDefault();var q=$('frq');request(q?q.value.trim():'')}});
  document.addEventListener('click',function(ev){
    var t=ev.target.closest('[data-act]');if(!t)return;var a=t.dataset.act;
    if(a==='trsub'){SOC.sub=t.dataset.v;render()}
    else if(a==='trplayer')openPlayer(t.dataset.p);
    else if(a==='tpw')pick(t,'want');
    else if(a==='tpg')pick(t,'give');
    else if(a==='tpropose')propose();
    else if(a==='tracc')respond(t.dataset.id,true);
    else if(a==='trdec')respond(t.dataset.id,false);
    else if(a==='trcancel')cancel(t.dataset.id);
    else if(a==='pfsave')savePseudo();
    else if(a==='fradd')addSheet();
    else if(a==='frreq')request(t.dataset.p);
    else if(a==='frshare')share();
    else if(a==='frcopy')copyLink();
    else if(a==='fracc')frAct('friend_respond',{p_id:+t.dataset.id,p_accept:true},'Nouvel ami ajouté');
    else if(a==='frdec')frAct('friend_respond',{p_id:+t.dataset.id,p_accept:false});
    else if(a==='frdel')frAct('friend_remove',{p_id:+t.dataset.id});
    else if(a==='frrm'){var f=SOC.fr.find(function(x){return x.pseudo===t.dataset.p});if(f){closeMenu();frAct('friend_remove',{p_id:f.id},t.dataset.p+' retiré de tes amis')}}
  });
  var n=0;
  setInterval(function(){n++;if(!me()||document.hidden)return;if(tab==='shop'&&shopSub==='echanges')load();else if(n%3===0)load();if(n%3===0)events()},20000);
})();
