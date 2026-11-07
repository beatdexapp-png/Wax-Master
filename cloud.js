/* WaxDrop : comptes joueurs, sauvegarde en ligne, classement (Supabase) */
(function(){
  var SB_URL='https://ptoncebyqakclxqnmlzk.supabase.co';
  var SB_KEY='sb_publishable_6-9wecVefsCjpqMPnh9Afg_-x-PIjhv';
  var CL=window.CL={user:null,pseudo:null,avatar:null,top:null,msg:'',busy:false,ready:false,page:function(){return pageHTML()},board:function(){return boardRows()}};
  var sb=null;
  var loaded=false,pushT=0,recovery=false;
  function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function e(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
  function val(id){var el=document.getElementById(id);return el?el.value.trim():''}

  /* chaque sauvegarde locale part aussi en ligne (regroupée toutes les 1,5 s) */
  var origSave=window.save;
  window.save=function(){S._t=Date.now();origSave();if(CL.user&&loaded){clearTimeout(pushT);pushT=setTimeout(push,1500)}};
  addEventListener('pagehide',function(){if(CL.user&&loaded){clearTimeout(pushT);push()}});

  async function push(){
    if(!CL.user)return;
    var r=await sb.from('profiles').update({state:S,score:score(),coins:S.coins|0}).eq('id',CL.user.id);
    if(!r.error)lsSet('bd-uid',CL.user.id);
  }
  async function pull(){
    var r=await sb.from('profiles').select('pseudo,state,avatar_url').eq('id',CL.user.id).single();
    if(r.error){CL.pseudo=lsGet('bd-pseudo')||'…';CL.avatar=lsGet('bd-avatar');return}
    CL.pseudo=r.data.pseudo;if(CL.pseudo)lsSet('bd-pseudo',CL.pseudo);CL.avatar=r.data.avatar_url||null;
    var cloud=r.data.state||{};
    var sameUser=lsGet('bd-uid')===CL.user.id;
    var cloudHas=cloud&&cloud.owned&&Object.keys(cloud.owned).length>0;
    if(cloudHas&&!(sameUser&&(S._t||0)>(cloud._t||0))){
      S=Object.assign(fresh(),cloud);S.set=Object.assign({lite:false,skin:'auto'},S.set||{});
      for(var k in S.owned)if(!C[k])delete S.owned[k];
      S.spot=null;S.pass=null;
      origSave();lsSet('bd-uid',CL.user.id);loaded=true;
      if(!reveal)render();
    }else{
      if(!sameUser&&lsGet('bd-uid')){S=fresh();origSave();if(!reveal)render()}
      loaded=true;await push();
    }
  }
  async function loadTop(){
    var r=await sb.rpc('leaderboard2',{lim:50});
    if(!r.error){CL.top=r.data||[];if(typeof tab!=='undefined'&&tab==='profil'&&profSub==='top'&&!reveal)render()}
  }
  function boardRows(){
    var me=score(),L=(CL.top||[]).map(function(x){return{n:x.pseudo,s:x.score,av:x.avatar_url,me:!!(CL.pseudo&&x.pseudo===CL.pseudo)}});
    if(!L.some(function(x){return x.me}))L.push({n:CL.pseudo||'Toi',s:me,me:true});
    L.forEach(function(x){if(x.me){x.s=me;x.av=CL.avatar}});
    L.sort(function(a,b){return b.s-a.s});
    return L.map(function(x,i){return Object.assign({},x,{r:i+1})});
  }

  /* ---------- écran de connexion (obligatoire) ---------- */
  var gate=document.createElement('div');gate.id='gate';gate.hidden=true;gate.setAttribute('role','dialog');gate.setAttribute('aria-label','Compte WaxDrop');
  document.body.appendChild(gate);
  var st=document.createElement('style');st.textContent=
    '.clf{display:flex;flex-direction:column;gap:10px}.clf input{height:48px;border-radius:14px;padding:0 14px;border:0;background:var(--soft);color:var(--fg);font:500 16px inherit;width:100%;min-width:0}.clf .row{display:flex;gap:8px}.clf .row .pbtn,.clf .row .gbtn{flex:1}';
  document.head.appendChild(st);
  var mode='in';
  if(!window.supabase||!window.supabase.createClient){showGate('offline');return}
  sb=CL.sb=window.supabase.createClient(SB_URL,SB_KEY);
  /* Page de connexion (refonte 07/11/2026) : à gauche la promesse et de vraies pochettes du jeu, à droite la carte de verre.
     Sur téléphone, la carte passe sous la promesse. Les champs, identifiants et messages sont les mêmes qu'avant. */
  var gsw=false;
  function gateFan(){
    if(typeof CARDS==='undefined'||!CARDS.length||typeof RAR==='undefined')return '';
    var pick=[],seen={};CARDS.forEach(function(c){if(pick.length<40&&c.img&&c.r>=3&&GEN[c.g]&&!seen[c.a]){seen[c.a]=1;pick.push(c)}});
    if(pick.length<3)return '';
    var d=new Date(),k=d.getFullYear()*400+d.getMonth()*31+d.getDate(),L=[pick[k%pick.length],pick[(k+7)%pick.length],pick[(k+13)%pick.length]];
    return '<div class="gfan" aria-hidden="true">'+L.map(function(c,i){var R=RAR[c.r]||RAR[0];return '<div class="gcd g'+i+'" style="--im:url(&quot;'+e(c.img)+'&quot;);--rc:'+R.c+'"><i></i><span class="gr">'+e(R.n)+'</span><b>'+e(c.t)+'</b><small>'+e(c.a)+'</small></div>'}).join('')+'</div>';
  }
  function gateStats(){
    if(typeof CARDS==='undefined'||!CARDS.length)return '';
    var f=function(v){return v.toLocaleString('fr-FR')};
    return '<div class="gstats"><div><b>'+f(Math.floor(CARDS.length/1000)*1000)+'</b><span>sons</span></div><div><b>'+f(ARTISTS.length)+'</b><span>artistes</span></div><div><b>100 %</b><span>gratuit</span></div></div>';
  }
  function gateHTML(){
    var m='<div class="gm" id="gmsg" role="status">'+e(CL.msg)+'</div>';
    var hero='<section class="ghero"><div class="gbrand"><i></i>WaxDrop</div><span class="gkick"><i></i>Jeu de cartes du rap · gratuit</span>'+
      '<h1>Le rap,<br>en <em>cartes</em>.</h1><p>Un drop gratuit toutes les 10 minutes. Complète les albums de tes artistes, échange avec tes potes, revends à la Bourse.</p>'+gateFan()+gateStats()+'</section>';
    var card='',head='';
    if(mode==='offline')card='<h2>Connexion impossible</h2><p class="gp">Le serveur ne répond pas. Vérifie ta connexion internet puis recharge la page.</p>';
    else if(mode==='pseudo')card='<h2>Choisis ton pseudo</h2><p class="gp">Il apparaît au classement, dans les échanges et sur ton profil.</p><form id="gform" data-m="pseudo"><label for="gpseudo">Pseudo</label><input id="gpseudo" maxlength="20" autocomplete="nickname" placeholder="3 à 20 caractères" required><button class="gb" type="submit">Valider</button>'+m+'</form>';
    else if(mode==='newpass')card='<h2>Nouveau mot de passe</h2><p class="gp">Choisis ton nouveau mot de passe.</p><form id="gform" data-m="newpass"><label for="gpass">Nouveau mot de passe</label><input id="gpass" type="password" autocomplete="new-password" placeholder="8 caractères minimum" required><button class="gb" type="submit">Enregistrer</button>'+m+'</form>';
    else if(mode==='forgot')card='<h2>Mot de passe oublié</h2><p class="gp">Entre ton e-mail : tu recevras un lien pour choisir un nouveau mot de passe.</p><form id="gform" data-m="forgot"><label for="gmail">E-mail</label><input id="gmail" type="email" autocomplete="email" inputmode="email" placeholder="toi@exemple.fr" required><button class="gb" type="submit">Envoyer le lien</button><button class="gl" type="button" data-g="in">Retour à la connexion</button>'+m+'</form>';
    else{
      var up=mode==='up';
      head='<div class="gseg'+(gsw?' gmove':'')+'" data-on="'+(up?'up':'in')+'" role="tablist" aria-label="Compte"><button type="button" role="tab" data-g="in" aria-selected="'+!up+'">J’ai un compte</button><button type="button" role="tab" data-g="up" aria-selected="'+up+'">Créer un compte</button></div>'+
        '<div class="gtick"><b>10<small>min</small></b><span><strong>Un drop offert</strong>toutes les 10 minutes, 5 sons à chaque fois</span></div>';
      card='<form id="gform" data-m="'+(up?'up':'in')+'"><label for="gmail">E-mail</label><input id="gmail" type="email" autocomplete="email" inputmode="email" placeholder="toi@exemple.fr" required>'+
        '<label for="gpass">Mot de passe</label><input id="gpass" type="password" autocomplete="'+(up?'new-password':'current-password')+'" placeholder="8 caractères minimum" required>'+
        '<button class="gb" type="submit">'+(up?'Créer mon compte':'Se connecter')+'</button>'+
        (up?'<p class="gfine">Gratuit, sans carte bancaire. Ta collection est sauvegardée sur tous tes appareils.</p>':'<button class="gl" type="button" data-g="forgot">Mot de passe oublié ?</button>')+m+'</form>';
    }
    gsw=false;
    return '<div class="gwrap">'+hero+'<section class="gcard">'+head+card+'</section></div>';
  }
  function showGate(m){if(m)mode=m;if(!gate.isConnected)return;gate.innerHTML=gateHTML();gate.hidden=false}
  function hideGate(){gate.hidden=true;gate.innerHTML='';CL.msg=''}
  function say(t){CL.msg=t;var el=document.getElementById('gmsg')||document.getElementById('clmsg');if(el)el.textContent=t}
  gate.addEventListener('click',function(ev){var b=ev.target.closest('[data-g]');if(!b)return;if(b.dataset.g===mode)return;gsw=b.getAttribute('role')==='tab';CL.msg='';showGate(b.dataset.g);var f=document.getElementById('gmail');if(f&&matchMedia('(pointer:fine)').matches)f.focus({preventScroll:true})});
  gate.addEventListener('submit',async function(ev){
    ev.preventDefault();var f=ev.target;var m=f.dataset.m;var btn=f.querySelector('.gb');if(btn)btn.disabled=true;
    try{
      if(m==='in'||m==='up'){
        var mail=val('gmail'),pass=val('gpass');
        if(!/^\S+@\S+\.\S+$/.test(mail)){say('Entre une adresse e-mail valide');return}
        if(pass.length<8){say('Le mot de passe doit faire au moins 8 caractères');return}
        say(m==='in'?'Connexion…':'Création du compte…');
        var r=m==='in'?await sb.auth.signInWithPassword({email:mail,password:pass}):await sb.auth.signUp({email:mail,password:pass,options:{emailRedirectTo:location.origin}});
        if(r.error){say(/Invalid login/i.test(r.error.message)?'E-mail ou mot de passe incorrect':/not confirmed|confirm/i.test(r.error.message)?'Confirme d’abord ton e-mail : clique sur le lien reçu':/registered|exists/i.test(r.error.message)?'Ce compte existe déjà, connecte-toi':/rate|limit/i.test(r.error.message)?'Trop d’essais, réessaie dans quelques minutes':r.error.message);return}
        if(m==='up'&&!r.data.session){mode='in';CL.msg='Compte créé. Clique sur le lien reçu par e-mail, puis connecte-toi.';showGate();return}
      }else if(m==='forgot'){
        var mail2=val('gmail');if(!/^\S+@\S+\.\S+$/.test(mail2)){say('Entre une adresse e-mail valide');return}
        var r2=await sb.auth.resetPasswordForEmail(mail2,{redirectTo:location.origin});
        say(r2.error?'Envoi impossible pour le moment, réessaie plus tard':'Lien envoyé. Regarde ta boîte de réception.');
      }else if(m==='newpass'){
        var p=val('gpass');if(p.length<8){say('Le mot de passe doit faire au moins 8 caractères');return}
        var r3=await sb.auth.updateUser({password:p});
        if(r3.error){say('Impossible de changer le mot de passe');return}
        recovery=false;afterLogin();
      }else if(m==='pseudo'){
        var ps=val('gpseudo');if(ps.length<3||ps.length>20){say('Le pseudo doit faire entre 3 et 20 caractères');return}
        var u=await sb.from('profiles').update({pseudo:ps}).eq('id',CL.user.id);
        if(u.error){say(/duplicate|unique/i.test(u.error.message)?'Ce pseudo est déjà pris':'Impossible d’enregistrer le pseudo');return}
        CL.pseudo=ps;lsSet('bd-pseudo',ps);hideGate();loadTop();
      }
    }finally{if(btn&&btn.isConnected)btn.disabled=false}
  });
  function afterLogin(){if(recovery){showGate('newpass');return}if(!CL.pseudo)showGate('pseudo');else hideGate()}

  /* ---------- page Compte du menu ---------- */
  function pageHTML(){
    var m='<p class="msg" id="clmsg">'+e(CL.msg)+'</p>';
    if(!CL.user)return '<div class="clf"><p class="cap">Non connecté</p></div>';
    return '<div class="clf"><div class="set"><span><b>'+e(CL.pseudo||'Sans pseudo')+'</b><br><small class="muted">'+e(CL.user.email)+'</small></span><span class="cap">Sauvegardé en ligne</span></div>'+
      '<label class="lbl" for="clpseudo">Pseudo</label><div class="row"><input id="clpseudo" maxlength="20" autocomplete="nickname" value="'+e(CL.pseudo||'')+'" placeholder="3 à 20 caractères"><button class="pbtn" data-act="clpseudo" style="height:48px">OK</button></div>'+
      '<div class="row"><button class="gbtn" data-act="clout">Se déconnecter</button></div>'+m+'</div>';
  }
  function rerender(){if(typeof menuPage!=='undefined'&&menuPage==='compte')renderMenu()}
  document.addEventListener('click',async function(ev){
    var t=ev.target.closest('[data-act]');if(!t)return;var a=t.dataset.act;
    if(a==='clout'){clearTimeout(pushT);if(loaded)await push();await sb.auth.signOut();closeMenu();}
    else if(a==='clpseudo'){
      var p=val('clpseudo');if(p.length<3||p.length>20){say('Le pseudo doit faire entre 3 et 20 caractères');return}
      var u=await sb.from('profiles').update({pseudo:p}).eq('id',CL.user.id);
      if(u.error){say(/duplicate|unique/i.test(u.error.message)?'Ce pseudo est déjà pris':'Impossible d’enregistrer le pseudo');return}
      CL.pseudo=p;lsSet('bd-pseudo',p);say('Pseudo enregistré');loadTop();
    }
  });

  sb.auth.onAuthStateChange(function(evt,session){
    if(evt==='PASSWORD_RECOVERY')recovery=true;
    var u=session?session.user:null,changed=(u&&u.id)!==(CL.user&&CL.user.id);
    CL.user=u;
    if(!u){loaded=false;CL.pseudo=null;CL.avatar=null;CL.ready=true;showGate(mode==='up'?'up':'in');rerender();return}
    if(changed)setTimeout(function(){pull().then(function(){CL.ready=true;afterLogin();rerender();if(window.ECO)ECO.sync().then(function(){if(ECO.afterLogin)ECO.afterLogin();if(ECO.afterSync)ECO.afterSync()});if(window.MK)MK.kick();if(window.SOC)SOC.kick();if(!reveal)render()})},0);
    else if(recovery)showGate('newpass');
    else rerender();
  });
  loadTop();
})();
