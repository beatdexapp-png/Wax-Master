/* WaxDrop : profil public des autres joueurs (vitrines) et likes sur les sons.
   Serveur : fonctions player_profile, song_likes_get, song_like_toggle (migrations du 07/11/2026).
   Tant qu'elles ne sont pas en ligne : le profil retombe sur les stats et le cœur reste caché, rien ne casse. */
(function(){
  if(!window.CL||!CL.sb)return;
  var sb=CL.sb;
  var HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/></svg>';
  function n(v){return (v||0).toLocaleString('fr-FR')}
  function missing(err){return !!err&&(err.code==='PGRST202'||/Could not find the function|does not exist/i.test(err.message||''))}

  /* ---------- profil d'un joueur ---------- */
  var P=null,vi=0,seq=0;
  function av(url,ps){return '<span class="av tbig" style="--avg:'+(url?"url('"+esc(url)+"') center/cover no-repeat,#333":'linear-gradient(140deg,hsl('+(hash(ps)%360)+' 46% 60%),hsl('+((hash(ps)+40)%360)+' 44% 34%))')+'">'+(url?'':esc((ps||'?').slice(0,2).toUpperCase()))+'</span>'}
  function since(s){var d=new Date(s);return isNaN(d)?'':d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}
  function plaque(A){return '<div class="plq ok"><div class="pfm"><div class="pdk"><i style="background:'+esc(A.avg)+'"></i></div><div class="ppl"><b>'+esc(A.n)+'</b><span>Disque de platine</span></div></div></div>'}
  function relBtn(d){
    if(d.rel==='accepted')return '<button class="gbtn" data-act="trplayer" data-p="'+esc(d.pseudo)+'">'+ICON.swap+'Échanger</button>';
    if(d.rel==='pending:out')return '<button class="gbtn" disabled>Demande envoyée</button>';
    if(d.rel==='pending:in')return '<button class="gbtn" data-act="frreq" data-p="'+esc(d.pseudo)+'">Accepter en ami</button>';
    return '<button class="gbtn" data-act="frreq" data-p="'+esc(d.pseudo)+'">'+ICON.plus+'Ajouter en ami</button>';
  }
  function view(d){
    var ul={};(d.ul||[]).forEach(function(k){ul[k]=1});
    var pl=ARTISTS.filter(function(A){return ul[A.key]}),al=ALBUMS.filter(function(A){return ul[A.key]}).length;
    var V=(d.vits||[])[vi]||{n:'Vitrine',ids:[]};
    var F=(V.ids||[]).filter(function(id){return C[id]}).slice(0,6).map(function(id){return C[id]});
    var cells=F.map(function(c){return '<button class="it" data-act="see" data-id="'+c.id+'" aria-label="'+esc(c.t)+', '+esc(c.a)+'">'+tileHTML(c,{nocount:1,lock:false})+'</button>'});
    while(cells.length<6)cells.push('<span class="fslot jpvide" aria-hidden="true"></span>');
    return '<div class="shh"><div class="phd">'+av(d.avatar,d.pseudo)+'<div><b>'+esc(d.pseudo)+'</b><small>Niveau '+(d.level|0)+' · '+n(d.score)+' pts</small>'+(d.since?'<small class="jpsince">Joue depuis '+since(d.since)+'</small>':'')+'</div></div><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div>'+
      '<div class="kpis3"><div class="k1"><b>'+n(d.sons)+'</b><span>sons</span></div><div class="k2"><b>'+n(al)+'</b><span>albums</span></div><div class="k3"><b>'+n(pl.length)+'</b><span>platines</span></div><div class="k4"><b>'+n(d.divins)+'</b><span>divins</span></div></div>'+
      ((d.vits||[]).length>1?'<div class="vtabs">'+d.vits.map(function(v,k){return '<button class="chip" data-act="jpvit" data-i="'+k+'" aria-pressed="'+(k===vi)+'">'+esc(v.n)+'</button>'}).join('')+'</div>':'<span class="lbl">'+esc(V.n)+'</span>')+
      '<div class="vitg jpvit">'+cells.join('')+'</div>'+
      (F.length?'':'<p class="cap">'+esc(d.pseudo)+' n’a encore rien mis dans cette vitrine</p>')+
      (pl.length?'<span class="lbl">Disques de platine</span><div class="wall">'+pl.map(function(A){return '<span>'+plaque(A)+'</span>'}).join('')+'</div>':'')+
      '<div class="row jpact"><button class="gbtn" data-act="frstats" data-p="'+esc(d.pseudo)+'">'+ICON.gem+'Stats</button>'+relBtn(d)+'</div>';
  }
  function paint(){var box=sh.querySelector('.jpsh');if(!box||menuPage!=='joueur'||!P)return;box.innerHTML='<div class="grab"></div>'+view(P)}
  function open(ps){
    if(!ps)return;
    if(CL.pseudo&&ps.toLowerCase()===CL.pseudo.toLowerCase()){closeMenu();profSub='vitrine';setTab('profil');return}
    closeMenu();menuPage='joueur';P=null;vi=0;var my=++seq;
    sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass jpsh" role="dialog" aria-label="Profil de '+esc(ps)+'"><div class="grab"></div><div class="jpload" aria-hidden="true"><i></i><i></i><i></i></div></div>';
    sb.rpc('player_profile',{p_pseudo:ps}).then(function(r){
      if(my!==seq||menuPage!=='joueur')return;
      if(missing(r.error)){if(window.STATS)STATS.open(ps);return}
      var box=sh.querySelector('.jpsh');if(!box)return;
      if(r.error||!r.data){box.innerHTML='<div class="shh"><b>Profil</b><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div><p class="cap">'+(r.error?esc(niceErr(r.error.message)):'Aucun joueur avec ce pseudo')+'</p>';return}
      if(r.data.me){closeMenu();profSub='vitrine';setTab('profil');return}
      P=r.data;paint();
    },function(){var box=sh.querySelector('.jpsh');if(box)box.innerHTML='<p class="cap">Connexion impossible</p>'});
  }

  /* ---------- likes ---------- */
  var LK=window.LK={on:true,cache:{}};
  function lkHTML(id,s){return '<button class="slike'+(s&&s.me?' on':'')+'" id="lk" data-act="like" data-id="'+esc(id)+'" aria-pressed="'+!!(s&&s.me)+'" aria-label="'+(s&&s.me?'Retirer mon like':'Liker ce son')+'">'+HEART+'<b>'+(s?n(s.n):'')+'</b></button>'}
  function paintLk(id,pop){var b=document.getElementById('lk');if(!b||b.dataset.id!==id)return;var s=LK.cache[id];b.outerHTML=lkHTML(id,s);if(pop){var nb=document.getElementById('lk');if(nb){void nb.offsetWidth;nb.classList.add('bump')}}}
  LK.html=function(id){return LK.on?lkHTML(id,LK.cache[id]):''};
  LK.load=function(id){
    if(!LK.on||!id)return;
    sb.rpc('song_likes_get',{p_ids:[id]}).then(function(r){
      if(missing(r.error)){LK.on=false;var b=document.getElementById('lk');if(b)b.remove();return}
      if(r.error||!r.data)return;var s=r.data[id];if(s){LK.cache[id]=s;paintLk(id)}
    });
  };
  var busy={};
  function toggle(id){
    if(busy[id])return;busy[id]=1;
    var old=LK.cache[id]||{n:0,me:false},nw={n:Math.max(0,old.n+(old.me?-1:1)),me:!old.me};
    LK.cache[id]=nw;paintLk(id,nw.me);if(nw.me&&navigator.vibrate)try{navigator.vibrate(8)}catch(e){}
    sb.rpc('song_like_toggle',{p_card:id}).then(function(r){
      delete busy[id];
      if(r.error){LK.cache[id]=old;paintLk(id);if(missing(r.error)){LK.on=false}else toast(niceErr(r.error.message));return}
      LK.cache[id]=r.data;paintLk(id);
    },function(){delete busy[id];LK.cache[id]=old;paintLk(id);toast('Connexion impossible')});
  }

  window.PROF={open:open};
  document.addEventListener('click',function(e){var t=e.target.closest('[data-act]');if(!t)return;var a=t.dataset.act;
    if(a==='plprof'){e.stopPropagation();open(t.dataset.p)}
    else if(a==='jpvit'){e.stopPropagation();vi=+t.dataset.i||0;paint()}
    else if(a==='like'){e.stopPropagation();toggle(t.dataset.id)}},true);
})();
