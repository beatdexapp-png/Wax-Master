/* BeatDex : comptes joueurs, sauvegarde en ligne, classement (Supabase) */
(function(){
  var SB_URL='https://ptoncebyqakclxqnmlzk.supabase.co';
  var SB_KEY='sb_publishable_6-9wecVefsCjpqMPnh9Afg_-x-PIjhv';
  var CL=window.CL={user:null,pseudo:null,top:null,msg:'',busy:false,ready:false,page:function(){return pageHTML()},board:function(){return boardRows()}};
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
    var r=await sb.from('profiles').select('pseudo,state').eq('id',CL.user.id).single();
    if(r.error){CL.pseudo=lsGet('bd-pseudo')||'…';return}
    CL.pseudo=r.data.pseudo;if(CL.pseudo)lsSet('bd-pseudo',CL.pseudo);
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
    var r=await sb.rpc('leaderboard',{lim:50});
    if(!r.error){CL.top=r.data||[];if(typeof tab!=='undefined'&&tab==='profil'&&profSub==='top'&&!reveal)render()}
  }
  function boardRows(){
    var me=score(),L=(CL.top||[]).map(function(x){return{n:x.pseudo,s:x.score,me:!!(CL.pseudo&&x.pseudo===CL.pseudo)}});
    if(!L.some(function(x){return x.me}))L.push({n:CL.pseudo||'Toi',s:me,me:true});
    L.forEach(function(x){if(x.me)x.s=me});
    L.sort(function(a,b){return b.s-a.s});
    return L.map(function(x,i){return Object.assign({},x,{r:i+1})});
  }

  /* ---------- écran de connexion (obligatoire) ---------- */
  var gate=document.createElement('div');gate.id='gate';gate.hidden=true;gate.setAttribute('role','dialog');gate.setAttribute('aria-label','Compte BeatDex');
  document.body.appendChild(gate);
  var st=document.createElement('style');st.textContent=
    '#gate{position:fixed;inset:0;z-index:150;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:calc(20px + env(safe-area-inset-top,0px)) 20px calc(20px + env(safe-area-inset-bottom,0px));background:radial-gradient(120% 80% at 50% 0%,#23263a,#0b0c10 70%);color:#f1f2f6;overflow-y:auto}'+
    '#gate .gv{width:min(34vw,140px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#ffc23d 0 15%,#111 15.5% 17%,transparent 17.5%),repeating-radial-gradient(circle,#111216 0 3px,#1d1e25 3px 6px);box-shadow:0 0 0 8px #17181d,0 0 60px rgba(255,194,61,.15);animation:rot 2.4s linear infinite}'+
    '#gate h1{font:800 clamp(2rem,9vw,2.8rem)/1 var(--disp);letter-spacing:-.03em;margin:0}'+
    '#gate p{margin:0;max-width:32ch;text-align:center;color:#a9afbd;font-size:14.5px;line-height:1.45}'+
    '#gate form{width:min(100%,360px);display:flex;flex-direction:column;gap:10px}'+
    '#gate label{font:600 11px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:#979dab}'+
    '#gate input{height:52px;border-radius:16px;border:0;padding:0 16px;background:rgba(255,255,255,.08);color:#fff;font:500 16px inherit;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}'+
    '#gate input:focus{outline:2px solid #ffc23d;outline-offset:1px}'+
    '#gate .gb{height:54px;border-radius:999px;border:0;background:#f1f2f6;color:#0e0f12;font:700 16px var(--disp);cursor:pointer}'+
    '#gate .gb2{height:50px;border-radius:999px;border:0;background:rgba(255,255,255,.1);color:#fff;font:600 15px var(--disp);cursor:pointer}'+
    '#gate .gl{background:none;border:0;color:#a9afbd;font-size:14px;text-decoration:underline;cursor:pointer;padding:6px}'+
    '#gate .gm{min-height:1.3em;color:#ffcf6b;font-size:14px;text-align:center}'+
    '#gate .gb[disabled],#gate .gb2[disabled]{opacity:.5}'+
    '.clf{display:flex;flex-direction:column;gap:10px}.clf input{height:48px;border-radius:14px;padding:0 14px;border:0;background:var(--soft);color:var(--fg);font:500 16px inherit;width:100%;min-width:0}.clf .row{display:flex;gap:8px}.clf .row .pbtn,.clf .row .gbtn{flex:1}';
  document.head.appendChild(st);
  var mode='in';
  if(!window.supabase||!window.supabase.createClient){showGate('offline');return}
  sb=CL.sb=window.supabase.createClient(SB_URL,SB_KEY);
  function gateHTML(){
    var top='<div class="gv" aria-hidden="true"></div><h1>BeatDex</h1>';
    var m='<div class="gm" id="gmsg">'+e(CL.msg)+'</div>';
    if(mode==='offline')return top+'<p>Connexion au serveur impossible. Vérifie ta connexion internet puis recharge la page.</p>';
    if(mode==='pseudo')return top+'<p>Choisis ton pseudo. Il apparaît au classement et à la Bourse.</p><form id="gform" data-m="pseudo"><label for="gpseudo">Pseudo</label><input id="gpseudo" maxlength="20" autocomplete="nickname" placeholder="3 à 20 caractères" required><button class="gb" type="submit">Valider</button>'+m+'</form>';
    if(mode==='newpass')return top+'<p>Choisis ton nouveau mot de passe.</p><form id="gform" data-m="newpass"><label for="gpass">Nouveau mot de passe</label><input id="gpass" type="password" autocomplete="new-password" placeholder="8 caractères minimum" required><button class="gb" type="submit">Enregistrer</button>'+m+'</form>';
    if(mode==='forgot')return top+'<p>Entre ton e-mail, tu recevras un lien pour choisir un nouveau mot de passe.</p><form id="gform" data-m="forgot"><label for="gmail">E-mail</label><input id="gmail" type="email" autocomplete="email" inputmode="email" required><button class="gb" type="submit">Envoyer le lien</button><button class="gl" type="button" data-g="in">Retour</button>'+m+'</form>';
    var up=mode==='up';
    return top+'<p>'+(up?'Crée ton compte pour garder ta collection sur tous tes appareils.':'Connecte-toi pour retrouver ta collection.')+'</p>'+
      '<form id="gform" data-m="'+(up?'up':'in')+'"><label for="gmail">E-mail</label><input id="gmail" type="email" autocomplete="email" inputmode="email" placeholder="toi@exemple.fr" required>'+
      '<label for="gpass">Mot de passe</label><input id="gpass" type="password" autocomplete="'+(up?'new-password':'current-password')+'" placeholder="8 caractères minimum" required>'+
      '<button class="gb" type="submit">'+(up?'Créer mon compte':'Se connecter')+'</button>'+
      '<button class="gb2" type="button" data-g="'+(up?'in':'up')+'">'+(up?'J’ai déjà un compte':'Créer un compte')+'</button>'+
      (up?'':'<button class="gl" type="button" data-g="forgot">Mot de passe oublié ?</button>')+m+'</form>';
  }
  function showGate(m){if(m)mode=m;if(!gate.isConnected)return;gate.innerHTML=gateHTML();gate.hidden=false}
  function hideGate(){gate.hidden=true;gate.innerHTML='';CL.msg=''}
  function say(t){CL.msg=t;var el=document.getElementById('gmsg')||document.getElementById('clmsg');if(el)el.textContent=t}
  gate.addEventListener('click',function(ev){var b=ev.target.closest('[data-g]');if(!b)return;CL.msg='';showGate(b.dataset.g)});
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
    if(!u){loaded=false;CL.pseudo=null;CL.ready=true;showGate(mode==='up'?'up':'in');rerender();return}
    if(changed)setTimeout(function(){pull().then(function(){CL.ready=true;afterLogin();rerender();if(window.MK)MK.kick()})},0);
    else if(recovery)showGate('newpass');
    else rerender();
  });
  loadTop();
})();
