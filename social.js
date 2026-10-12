/* TrackDex : échanges entre joueurs et profil (photo, pseudo) */
(function(){
  if(!window.CL||!CL.sb)return;
  var sb=CL.sb;
  var SOC=window.SOC={list:[],sub:'recus',player:null,pick:{give:null,want:null},sig:''};
  function me(){return CL.user&&CL.user.id}
  function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  SOC.pending=function(){var u=me();return SOC.list.filter(function(t){return t.status==='pending'&&t.to_id===u}).length};
  function avH(url,name,cls){name=name||'?';return '<span class="av '+(cls||'')+'" style="--avg:'+(url?"url('"+esc(url)+"') center/cover no-repeat,#333":'linear-gradient(140deg,hsl('+(hash(name)%360)+' 46% 60%),hsl('+((hash(name)+40)%360)+' 44% 34%))')+'">'+(url?'':esc(name.slice(0,2).toUpperCase()))+'</span>'}
  SOC.avH=avH;
  function quiet(){return !sh.innerHTML&&!ov.innerHTML&&!dd.innerHTML&&!reveal}

  async function load(){
    if(!me())return;
    var r=await sb.from('trades').select('*').order('created_at',{ascending:false}).limit(60);
    if(r.error)return;
    var sig=r.data.map(function(t){return t.id+t.status}).join(',');var ch=sig!==SOC.sig;SOC.sig=sig;SOC.list=r.data;
    if(ch){if(tab==='shop'&&(shopSub==='echanges'||shopSub==='hub')&&quiet())render();else{var d=$('shdot');if(d)d.hidden=!(SOC.pending()>0)}}
  }
  async function events(){
    if(!me())return;
    var r=await sb.rpc('trade_events');if(r.error||!Array.isArray(r.data)||!r.data.length)return;
    var notes=[];
    r.data.forEach(function(e){
      if(e.status==='accepted'&&C[e.want]){S.owned[e.want]=(S.owned[e.want]||0)+1;notes.push((e.to||'Le joueur')+' a accepté : tu reçois '+C[e.want].t)}
      else if(C[e.give]){S.owned[e.give]=(S.owned[e.give]||0)+1;notes.push(e.status==='declined'?(e.to||'Le joueur')+' a refusé ton échange':'Échange annulé, ton son est revenu')}
    });
    checkUnlocks();save();setCoins();if(notes.length)toast(notes[notes.length-1]);if(quiet())render();
  }
  SOC.kick=function(){load();events()};

  /* ---------- page Échanges du Shop ---------- */
  SOC.body=function(){
    var u=me(),rec=SOC.list.filter(function(t){return t.to_id===u&&t.status==='pending'}).length,env=SOC.list.filter(function(t){return t.from_id===u&&t.status==='pending'}).length;
    return '<form class="trs" id="trsf"><input class="tin" id="trq" placeholder="Pseudo d’un joueur" autocomplete="off" maxlength="20" aria-label="Pseudo d’un joueur"><button class="pbtn" type="submit">Voir</button></form>'+
      '<div class="chips">'+[['recus','Reçus'+(rec?' · '+rec:'')],['envoyes','Envoyés'+(env?' · '+env:'')],['joueurs','Joueurs']].map(function(x){return '<button class="chip" data-act="trsub" data-v="'+x[0]+'" aria-pressed="'+(SOC.sub===x[0])+'">'+x[1]+'</button>'}).join('')+'</div><div class="pgr" id="pgr"></div>';
  };
  function thumb(id){var c=C[id];return c?'<button class="lth" data-act="see" data-id="'+id+'" aria-label="'+esc(c.t)+'">'+tileHTML(c,{nocount:1,lock:false})+'</button>':''}
  function row(t){
    var mine=t.from_id===me(),other=mine?t.to_name:t.from_name;if(!C[t.give_card]||!C[t.want_card])return '<div class="trr"><div class="ttl"><small>Son indisponible</small></div></div>';
    var youGive=mine?t.give_card:t.want_card,youGet=mine?t.want_card:t.give_card,acts;
    if(t.status==='pending')acts=mine?'<button class="lbtn" data-act="trcancel" data-id="'+t.id+'">Annuler</button>':'<button class="lbtn on" data-act="tracc" data-id="'+t.id+'">Accepter</button><button class="lbtn ghost" data-act="trdec" data-id="'+t.id+'">Refuser</button>';
    else acts='<span class="st">'+(t.status==='accepted'?'Accepté':t.status==='declined'?'Refusé':'Annulé')+'</span>';
    return '<div class="trr">'+thumb(youGive)+'<span class="arr">'+ICON.swap+'</span>'+thumb(youGet)+'<div class="ttl"><b>'+esc(other||'Joueur')+'</b><small>Tu donnes '+esc(C[youGive].t)+'</small><small>Tu reçois '+esc(C[youGet].t)+'</small></div><div class="acts">'+acts+'</div></div>';
  }
  SOC.layout=function(h){
    if(SOC.sub==='joueurs'){
      var L=(CL.top||[]).filter(function(x){return x.pseudo&&x.pseudo!==CL.pseudo});
      pager(h,L,function(x){return '<button class="prow" data-act="trplayer" data-p="'+esc(x.pseudo)+'">'+avH(x.avatar_url,x.pseudo)+'<b>'+esc(x.pseudo)+'</b><em>'+(x.score||0).toLocaleString('fr-FR')+' pts</em></button>'},{cellH:60,minW:320,gap:8,empty:'Aucun autre joueur pour l’instant'});
    }else{
      var u=me(),L2=SOC.list.filter(function(t){return SOC.sub==='recus'?t.to_id===u:t.from_id===u});
      pager(h,L2,row,{cellH:84,minW:340,gap:8,empty:SOC.sub==='recus'?'Aucune proposition reçue. Cherche un joueur pour lui proposer un échange.':'Aucune proposition envoyée'});
    }
  };

  /* ---------- fiche d'un joueur : choisir l'échange ---------- */
  async function openPlayer(ps){
    if(!ps)return;
    var r=await sb.rpc('player_card',{p_pseudo:ps});
    if(r.error){toast('Connexion au serveur impossible');return}
    if(!r.data){toast('Aucun joueur avec ce pseudo');return}
    if(r.data.me){toast('C’est toi');return}
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
      '<button class="pbtn" id="tpgo" data-act="tpropose" disabled>Proposer l’échange</button></div>';
  }
  function pick(t,k){t.parentElement.querySelectorAll('.tpick').forEach(function(x){x.setAttribute('aria-pressed',x===t)});SOC.pick[k]=t.dataset.id;var b=$('tpgo');if(b)b.disabled=!(SOC.pick.give&&SOC.pick.want)}
  async function propose(){
    var P=SOC.player,g=SOC.pick.give,w=SOC.pick.want;if(!P||!g||!w)return;
    if((S.owned[g]||0)<2){toast('Il te faut ce son en double');return}
    var b=$('tpgo');if(b){b.disabled=true;b.textContent='Envoi…'}
    S.owned[g]--;save();
    var r=await sb.rpc('propose_trade',{p_to:P.pseudo,p_give:g,p_want:w});
    if(r.error){S.owned[g]++;save();toast(r.error.message);if(b){b.disabled=false;b.textContent='Proposer l’échange'}return}
    day().trade++;save();closeMenu();toast('Proposition envoyée à '+P.pseudo);SOC.sub='envoyes';await load();if(tab==='shop'&&shopSub==='echanges')render();
  }
  async function respond(id,ok){
    var t=SOC.list.find(function(x){return String(x.id)===String(id)});if(!t)return;
    if(ok&&!own(t.want_card)){toast('Tu n’as plus '+(C[t.want_card]?C[t.want_card].t:'ce son'));return}
    var r=await sb.rpc('respond_trade',{p_id:t.id,p_accept:ok});
    if(r.error){toast(r.error.message);load();return}
    if(ok){S.owned[t.want_card]--;S.owned[t.give_card]=(S.owned[t.give_card]||0)+1;checkUnlocks();save();toast('Échange fait : tu reçois '+C[t.give_card].t)}
    else toast('Échange refusé');
    await load();render();
  }
  async function cancel(id){
    var r=await sb.rpc('cancel_trade',{p_id:+id});if(r.error){toast(r.error.message);return}
    await events();await load();render();
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
  document.addEventListener('submit',function(ev){if(ev.target&&ev.target.id==='trsf'){ev.preventDefault();var q=$('trq');openPlayer(q?q.value.trim():'')}});
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
  });
  var n=0;
  setInterval(function(){n++;if(!me()||document.hidden)return;if(tab==='shop'&&shopSub==='echanges')load();else if(n%3===0)load();if(n%3===0)events()},8000);
})();
