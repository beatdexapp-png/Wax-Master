/* WaxDrop : lot 5 (social et marché). Défi de la semaine des labels, gros tirages en direct, bandeau « En hausse » à la Bourse,
   éditions numérotées (100 premiers exemplaires), fusion de doublons, liste de souhaits, favoris et playlists, Discord (5 drops).
   Tout ce qui donne quelque chose passe par le serveur (eco et fonctions du lot 5). Le front s'allume avec S.l5 (portefeuille).
   Sans la migration : seuls les favoris et playlists (rangés dans la partie du joueur) et le lien vers le Discord, aucun appel nouveau. */
(function(){
  var INV='https://discord.gg/B57u7jwz3J';
  var DI='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.3 5.3A16.6 16.6 0 0 0 15.2 4l-.5 1a15 15 0 0 0-5.4 0l-.5-1a16.6 16.6 0 0 0-4.1 1.3C2.1 9.2 1.4 13 1.8 16.8a16.7 16.7 0 0 0 5 2.5l1.1-1.7a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 10.2 0l.4.3-1.7.8 1.1 1.7a16.6 16.6 0 0 0 5-2.5c.5-4.4-.8-8.2-2.3-11.5ZM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/></svg>';
  function on(){return typeof S!=='undefined'&&!!(S.l5&&S.l5.v)}
  function sb(){return window.CL&&CL.user&&CL.sb}
  function e(s){return esc(String(s==null?'':s))}
  function RR(){return typeof RAR!=='undefined'?RAR:[]}
  function CC(){return typeof C!=='undefined'?C:{}}
  function n(v){return (v||0).toLocaleString('fr-FR')}
  function pad(v){return String(v).padStart(3,'0')}
  function ago(t){var s=(Date.now()-new Date(t))/1e3;return s<60?'à l’instant':s<3600?'il y a '+Math.floor(s/60)+' min':s<86400?'il y a '+Math.floor(s/3600)+' h':'il y a '+Math.floor(s/86400)+' j'}
  async function rpc(fn,a,quiet){if(!sb())return null;try{var r=await sb().rpc(fn,a||{});if(r.error){if(!quiet)toast(niceErr(r.error.message));return null}return r.data}catch(x){if(!quiet)toast('Connexion impossible, réessaie');return null}}
  function head(t){return '<div class="grab"></div><div class="shh"><h2>'+t+'</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div>'}
  function sheet(cls,label,html){closeMenu();menuPage='l5';sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass l5sh '+cls+'" role="dialog" aria-label="'+label+'">'+html+'</div>'}
  function box(cls){return sh.querySelector('.l5sh.'+cls)}
  function closeCard(){if(typeof closeDD==='function')closeDD()}

  /* ---------- 36. favoris et playlists (dans la partie du joueur, S.pls) ---------- */
  function pls(){if(!Array.isArray(S.pls))S.pls=[];if(!S.pls.length||!S.pls[0].fav)S.pls.unshift({n:'Favoris',ids:[],fav:1});
    S.pls.forEach(function(p){p.ids=(p.ids||[]).filter(function(id){return CC()[id]}).slice(0,200)});return S.pls}
  function isFav(id){return pls()[0].ids.indexOf(id)>=0}
  var PL={i:0,play:null};
  function plHTML(){var L=pls();if(PL.i>=L.length)PL.i=0;var P=L[PL.i];
    return head('Favoris et playlists')
      +'<div class="chips l5plc">'+L.map(function(p,i){return '<button class="chip" data-l5="plsel" data-i="'+i+'" aria-pressed="'+(i===PL.i)+'">'+(p.fav?'★ ':'')+e(p.n)+' · '+p.ids.length+'</button>'}).join('')+(L.length<21?'<button class="chip" data-l5="plnew">+ Nouvelle</button>':'')+'</div>'
      +(P.ids.length?'<div class="row l5plr"><button class="pbtn" data-l5="plplay">'+(PL.play?'Arrêter l’écoute':'Écouter les extraits')+'</button>'+(P.fav?'':'<button class="gbtn" data-l5="plren">Renommer</button><button class="gbtn" data-l5="pldel">Supprimer</button>')+'</div>'
        +'<div class="l5grid">'+P.ids.map(function(id,k){return '<div class="l5it'+(PL.play&&PL.play.i===PL.i&&PL.play.k===k?' on':'')+'"><button class="l5tile" data-act="see" data-id="'+id+'">'+tileHTML(CC()[id],{nocount:1})+'</button><button class="l5x" data-l5="plrm" data-id="'+id+'" aria-label="Retirer">'+ICON.x+'</button></div>'}).join('')+'</div>'
       :'<div class="l5empty"><b>'+(P.fav?'Pas encore de favori':'Playlist vide')+'</b><p class="cap">Dans la fiche d’un son, touche '+(P.fav?'« Favori »':'« + Playlist »')+'.</p></div>')}
  function plOpen(i){if(i!=null)PL.i=i;sheet('l5pl','Favoris et playlists',plHTML())}
  function plPaint(){var b=box('l5pl');if(b)b.innerHTML=plHTML()}
  function addHTML(id){var c=CC()[id],L=pls();
    return head('Ajouter à une playlist')+'<p class="cap">'+e(c.t)+' · '+e(c.a)+'</p><div class="l5list">'+L.map(function(p,i){var inn=p.ids.indexOf(id)>=0;
      return '<button class="l5li" data-l5="pladd" data-i="'+i+'" data-id="'+id+'" aria-pressed="'+inn+'"><span><b>'+(p.fav?'★ ':'')+e(p.n)+'</b><small>'+p.ids.length+' son'+(p.ids.length>1?'s':'')+'</small></span><em>'+(inn?'✓':'+')+'</em></button>'}).join('')+'</div>'
      +(L.length<21?'<div class="lbrow l5new"><input id="l5pn" maxlength="30" placeholder="Nouvelle playlist" autocomplete="off"><button class="gbtn" data-l5="plmk" data-id="'+id+'">Créer</button></div>':'')}
  function plAdd(i,id){var p=pls()[i];if(!p)return;var k=p.ids.indexOf(id);if(k>=0)p.ids.splice(k,1);else{if(p.ids.length>=200){toast('200 sons au plus par playlist');return}p.ids.unshift(id)}save()}
  /* écoute : les extraits l'un après l'autre (un son sans extrait est passé) */
  function plPlay(){if(PL.play){plStop();return}var P=pls()[PL.i];if(!P||!P.ids.length||!window.PV)return;PL.play={i:PL.i,ids:P.ids.slice(),k:-1,t:0,st:0};plNext()}
  function plNext(){var p=PL.play;if(!p)return;p.k++;if(p.k>=p.ids.length){plStop();return}
    PV.play(CC()[p.ids[p.k]],{force:true});p.st=Date.now();plPaint();clearInterval(p.t);
    p.t=setInterval(function(){if(PL.play!==p)return clearInterval(p.t);if(document.hidden){plStop();return}if(Date.now()-p.st>3000&&!PV.playing())plNext()},1000)}
  function plStop(){var p=PL.play;if(!p)return;clearInterval(p.t);PL.play=null;if(window.PV)PV.stop(300);plPaint()}

  /* ---------- 33. éditions numérotées ---------- */
  var ED={c:{},n1:[],got:false};
  function serGot(m){if(!m||typeof m!=='object')return;for(var id in m){var v=+m[id];if(!v)continue;if(!S.ser[id]||S.ser[id]>v)S.ser[id]=v;delete ED.c[id];if(v===1)ED.n1.push(id)}}
  async function edMine(){if(ED.got||!on())return;ED.got=true;var m=await rpc('ed_mine',{},true);if(!m)return;
    /* les numéros viennent du serveur : on remplace les anciens numéros calculés sur le téléphone */
    var o={};for(var id in m)if(CC()[id]&&(S.owned[id]||0)>0)o[id]=+m[id];S.ser=o;save()}
  async function edLine(id){var x=ED.c[id];if(!x){x=await rpc('ed_card',{p_card:id},true);if(!x)return;ED.c[id]=x}
    var el=document.getElementById('l5ed');if(!el||el.dataset.id!==id)return;
    var t=(x.mine&&(S.owned[id]||0)>0?'<b class="l5no'+(x.mine===1?' n1':'')+'">N°'+pad(x.mine)+'</b> ':'')
      +(x.n>=x.max?'Les '+x.max+' exemplaires numérotés sont partis':x.n?x.n+' sur '+x.max+' exemplaires numérotés tirés':'Aucun exemplaire numéroté tiré : le N°001 est encore libre')
      +(x.first&&x.first.pseudo?' · N°001 : '+e(x.first.pseudo):'');
    el.innerHTML=t;el.hidden=false}

  /* ---------- fiche d'un son : favori, playlist, souhait, fusion, numéro ---------- */
  var W=null;
  async function wishLoad(){if(W||!on())return W;var L=await rpc('wish_list',{p_mark:false},true);W=new Set((L||[]).map(function(x){return x.id}));return W}
  function deco(id){var c=CC()[id],pop=document.querySelector('#dd .pop');if(!c||!pop||pop.querySelector('.l5row'))return;
    var nn=S.owned[id]||0,f=isFav(id);
    var h='<div class="row l5row"><button class="gbtn" data-l5="fav" data-id="'+id+'" aria-pressed="'+f+'">'+(f?'★ Favori':'☆ Favori')+'</button><button class="gbtn" data-l5="addpl" data-id="'+id+'">+ Playlist</button>';
    if(on()&&!nn)h+='<button class="gbtn" data-l5="wtog" data-id="'+id+'" aria-pressed="'+!!(W&&W.has(id))+'">'+(W&&W.has(id)?'Souhait enregistré ✓':'Préviens-moi à la Bourse')+'</button>';
    if(on()&&nn>1&&c.r<5)h+='<button class="gbtn" data-l5="fuse" data-r="'+c.r+'">Fusionner</button>';
    h+='</div>'+(on()?'<p class="cap l5ed" id="l5ed" data-id="'+id+'" hidden></p>':'');
    var rows=pop.querySelectorAll('.row'),last=rows[rows.length-1];if(last)last.insertAdjacentHTML('afterend',h);else pop.insertAdjacentHTML('beforeend',h);
    if(on()){edLine(id);if(!nn&&!W)wishLoad().then(function(){var b=pop.querySelector('[data-l5="wtog"]');if(b&&W&&W.has(id)){b.setAttribute('aria-pressed','true');b.textContent='Souhait enregistré ✓'}})}}
  var see0=window.see;if(typeof see0==='function')window.see=function(id){var r=see0.apply(this,arguments);try{deco(id)}catch(x){}return r};

  /* ---------- 34. fusion de doublons ---------- */
  var FU={r:0,pick:[],res:null,busy:false};
  function extras(r){var L=[],O=S.owned;for(var id in O){var c=CC()[id];if(c&&c.r===r&&O[id]>1)L.push({c:c,x:O[id]-1})}return L.sort(function(a,b){return b.x-a.x||(a.c.t<b.c.t?-1:1)})}
  function nX(r){return extras(r).reduce(function(s,z){return s+z.x},0)}
  function cnt(id){return FU.pick.filter(function(x){return x===id}).length}
  function fuHTML(){var R=RR(),r=FU.r;
    if(FU.res){var x=FU.res,c=CC()[x.card],Rx=R[x.r];
      return head('Fusion')+'<div class="l5res'+(x.up?' up':'')+'" style="--rc:'+Rx.c+'"><div class="l5rt">'+tileHTML(c,{nocount:1})+'</div><b>'+(x.up?'Rareté supérieure !':'Fusion réussie')+'</b><p>'+e(c.t)+' · '+e(c.a)+'<br><span class="l5rn">'+Rx.n+'</span>'+(x.no?' · N°'+pad(x.no):'')+(x.nw?' · nouveau son':'')+'</p></div>'
        +'<div class="row"><button class="gbtn" data-l5="fuagain">Encore une fusion</button><button class="pbtn" data-act="see" data-id="'+x.card+'">Voir la carte</button></div>'}
    var L=extras(r),tot=nX(r),p=(S.l5.fuse||[])[r]||0;
    return head('Fusion')+'<p class="cap l5fi">5 doubles de même rareté donnent 1 son, un nouveau si possible. Tu gardes toujours un exemplaire de chaque son.</p>'
      +'<div class="chips l5fr">'+[0,1,2,3,4].map(function(k){return '<button class="chip" data-l5="fur" data-r="'+k+'" aria-pressed="'+(k===r)+'" style="--rc:'+R[k].c+'"><i class="l5dot"></i>'+R[k].n+' · '+nX(k)+'</button>'}).join('')+'</div>'
      +'<div class="l5odds" style="--rc:'+R[r+1].c+'"><b>'+p+' %</b><span>de chance d’obtenir un son '+R[r+1].n+'<br><small>sinon un son '+R[r].n+'</small></span></div>'
      +'<div class="l5slots">'+[0,1,2,3,4].map(function(i){var id=FU.pick[i];return id?'<button class="l5slot on" data-l5="fuun" data-i="'+i+'" aria-label="Retirer">'+tileHTML(CC()[id],{nocount:1})+'</button>':'<span class="l5slot"><i>'+(i+1)+'</i></span>'}).join('')+'</div>'
      +'<div class="row"><button class="gbtn" data-l5="fuauto"'+(tot<5?' disabled':'')+'>Choisir pour moi</button><button class="pbtn" data-l5="fugo"'+(FU.pick.length===5?'':' disabled')+'>Fusionner 5 → 1</button></div>'
      +(L.length?'<span class="lbl">Tes doubles '+R[r].n+' · touche pour ajouter</span><div class="l5grid">'+L.map(function(z){var left=z.x-cnt(z.c.id);
          return '<button class="l5it l5pick" data-l5="fuadd" data-id="'+z.c.id+'"'+(left<=0||FU.pick.length>=5?' disabled':'')+'>'+tileHTML(z.c,{nocount:1})+'<em class="l5n">×'+left+'</em></button>'}).join('')+'</div>'
        :'<div class="l5empty"><b>Aucun double '+R[r].n+'</b><p class="cap">Ouvre des drops : chaque son en plus d’un exemplaire peut servir.</p></div>')}
  function fuOpen(r){if(!on())return;FU.res=null;FU.pick=[];if(r==null){r=0;for(var k=4;k>=0;k--)if(nX(k)>=5){r=k;break}}FU.r=+r;sheet('l5fu','Fusion',fuHTML())}
  function fuPaint(){var b=box('l5fu');if(b)b.innerHTML=fuHTML()}
  function fuAuto(){FU.pick=[];var L=extras(FU.r);for(var i=0;i<L.length&&FU.pick.length<5;i++)for(var k=0;k<L[i].x&&FU.pick.length<5;k++)FU.pick.push(L[i].c.id);fuPaint()}
  async function fuGo(){if(FU.busy||FU.pick.length!==5)return;FU.busy=true;var before=Object.assign({},S.owned),b=document.querySelector('[data-l5="fugo"]');if(b){b.disabled=true;b.textContent='Fusion…'}
    var r=await ECO.op('fuse',{ids:FU.pick,v:window.CATV});FU.busy=false;if(!r){fuPaint();return}
    var no=r.ser&&r.ser[r.card];serGot(r.ser);FU.res={card:r.card,r:r.r,up:!!r.up,no:no,nw:!(before[r.card]>0)};FU.pick=[];save();fuPaint();
    if(window.SFX&&SFX.reward&&r.up)try{SFX.reward()}catch(x){}}

  /* ---------- 35. liste de souhaits ---------- */
  async function wiOpen(){if(!on())return;sheet('l5wi','Liste de souhaits',head('Liste de souhaits')+'<p class="cap">Chargement…</p>');
    var L=await rpc('wish_list',{p_mark:true});var b=box('l5wi');if(!L||!b)return;W=new Set(L.map(function(x){return x.id}));S.l5.wh=0;
    b.innerHTML=head('Liste de souhaits')+'<p class="cap">Tu es prévenu dans le jeu dès qu’un joueur revend un de ces sons à la Bourse. 50 au plus.</p>'
      +(L.length?'<div class="l5wl">'+L.map(function(x){var c=CC()[x.id];if(!c)return '';
        return '<div class="l5w'+(x.new?' new':'')+'"><button class="l5tile" data-act="see" data-id="'+x.id+'">'+tileHTML(c,{nocount:1,lock:false})+'</button><span class="l5wt"><b>'+e(c.t)+'</b><small>'+e(c.a)+'</small>'
          +(x.hit?'<em class="hit">'+(x.new?'Nouveau · ':'')+'Revendu à la Bourse '+ago(x.hit)+'</em>':'<em>Pas encore revendu</em>')+'</span>'
          +'<span class="l5wp"><button class="bxb" data-l5="wibuy" data-id="'+x.id+'"'+(x.own?' disabled':'')+'>'+(x.own?'Tu l’as':n(x.buy)+' '+coinI)+'</button><button class="l5x" data-l5="wirm" data-id="'+x.id+'" aria-label="Retirer">'+ICON.x+'</button></span></div>'}).join('')+'</div>'
       :'<div class="l5empty"><b>Aucun souhait</b><p class="cap">Dans la fiche d’un son qui te manque, touche « Préviens-moi à la Bourse ».</p></div>')}

  /* ---------- 32. gros tirages en direct (Ouvrir et Aujourd'hui) ---------- */
  var FD={L:[],sig:'',at:0};
  async function feedLoad(){if(!on()||document.hidden||reveal)return;FD.at=Date.now();var r=await rpc('pulls_feed',{p_after:0},true);if(!Array.isArray(r))return;
    var L=r.filter(function(x){return CC()[x.card]&&RR()[x.r]}),sig=L.map(function(x){return x.id}).join(',');if(sig===FD.sig)return;FD.sig=sig;FD.L=L;paintFeed()}
  function feedHTML(){if(!FD.L.length)return '';
    return '<section class="l5feed" aria-label="Gros tirages en direct"><div class="l5fh"><i class="ldot"></i><b>En direct</b><small>Légendaires et mieux, tous les joueurs</small></div><div class="l5fr">'
      +FD.L.slice(0,12).map(function(x){var c=CC()[x.card],R=RR()[x.r];
        return '<button class="l5fi glass" data-act="see" data-id="'+x.card+'" style="--rc:'+R.c+'"><span class="l5fc" style="background:'+(c.img?'url(&quot;'+c.img+'&quot;) center/cover no-repeat,':'')+(c.bg||'#222')+'"></span><span class="l5ft"><b>'+e(x.pseudo)+'</b><small>'+e(c.t)+'</small><em>'+R.n+' · '+ago(x.at)+'</em></span>'+(x.no===1?'<u class="l5n1">N°001</u>':x.no?'<u>N°'+pad(x.no)+'</u>':'')+'</button>'}).join('')+'</div></section>'}
  /* sur Ouvrir : une seule ligne qui fait défiler les derniers gros tirages (le vinyle garde sa place) */
  function tickHTML(){if(!FD.L.length)return '';
    return '<button class="l5tick glass" data-act="see" data-id="'+FD.L[0].card+'" aria-label="Gros tirages en direct"><i class="ldot"></i><b>En direct</b><span class="l5tw">'
      +FD.L.slice(0,8).map(function(x,i){var c=CC()[x.card],R=RR()[x.r];return '<span class="l5tt'+(i===0?' on':'')+'" data-id="'+x.card+'" style="--rc:'+R.c+'"><em>'+e(x.pseudo)+'</em> a tiré <strong>'+e(c.t)+'</strong> <u>'+R.n+(x.no===1?' · N°001':'')+'</u></span>'}).join('')+'</span></button>'}
  var TK={i:0,t:0};
  function tickRun(){clearInterval(TK.t);TK.i=0;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    TK.t=setInterval(function(){var b=document.querySelector('.l5tick');if(!b){clearInterval(TK.t);return}if(document.hidden)return;var L=b.querySelectorAll('.l5tt');if(L.length<2)return;
      L[TK.i%L.length].classList.remove('on');TK.i++;var x=L[TK.i%L.length];x.classList.add('on');b.dataset.id=x.dataset.id},4200)}
  function paintFeed(){document.querySelectorAll('.l5feed,.l5tick').forEach(function(x){x.remove()});if(!FD.L.length)return;
    var hub=document.querySelector('.v-open .hub')||document.querySelector('.v-open .otop');if(hub){hub.insertAdjacentHTML('afterend',tickHTML());tickRun()}
    var j=document.querySelector('.v-jour .hj-col');if(j)j.insertAdjacentHTML('beforeend',feedHTML())}

  /* ---------- 32. bandeau « En hausse » à la Bourse ---------- */
  var UP={L:null,at:0};
  async function upLoad(){if(!on()||Date.now()-UP.at<180e3)return;UP.at=Date.now();var r=await rpc('bourse_up',{},true);if(!Array.isArray(r))return;UP.L=r.filter(function(x){return CC()[x.id]});paintUp()}
  function upHTML(){if(!UP.L||!UP.L.length)return '';
    var it=UP.L.map(function(x){var c=CC()[x.id];return '<button class="l5ui" data-act="bxsee" data-id="'+x.id+'" style="--rc:'+RR()[c.r].c+'"><b>'+e(c.t)+'</b><small>'+e(c.a)+'</small><em>+'+String(x.chg).replace('.',',')+' %</em></button>'}).join('');
    return '<div class="l5up" aria-label="Sons en hausse sur 24 h"><span class="l5ul"><i>↑</i>En hausse</span><div class="l5uw"><div class="l5ut">'+it+'<span class="l5uc" aria-hidden="true">'+it.replace(/data-act="bxsee"/g,'tabindex="-1" data-act="bxsee"')+'</span></div></div></div>'}
  function paintUp(){var v=document.querySelector('.v-bx');if(!v)return;var o=v.querySelector('.l5up');if(o)o.remove();var h=upHTML(),t=v.querySelector('#bxtkw');if(h&&t)t.insertAdjacentHTML('afterend',h);
    var ch=v.querySelector('.chips');if(ch&&!ch.querySelector('[data-l5="wish"]'))ch.insertAdjacentHTML('beforeend','<button class="chip l5wc" data-l5="wish">Mes souhaits'+(S.l5.wh?'<i class="l5dotn">'+S.l5.wh+'</i>':'')+'</button>')}

  /* ---------- 31. défi de la semaine des labels (dans la fenêtre Label) ---------- */
  var CH={d:null,at:0,busy:false};
  function fin(t){var d=new Date(t);return d.toLocaleDateString('fr-FR',{weekday:'long'})+' '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
  function chalHTML(x){var d=x.def;
    if(!x.label)return '<section class="l5ch l5chc glass"><span class="lbl">Défi de la semaine des labels</span><b>'+e(d.t)+'</b><p class="cap">Chaque label a son objectif : '+d.per+' '+e(d.u)+' par membre (3 membres au moins, 10 au plus). Réussi, chaque membre qui a participé gagne +3 drops et +200 wax coins.</p></section>';
    var p=Math.min(1,x.n/Math.max(1,x.goal)),done=x.n>=x.goal,ok=x.me>=x.need;
    return '<section class="l5ch l5chc glass'+(done?' ok':'')+'"><div class="l5chh"><span class="lbl">Défi de la semaine</span><small>Fin '+e(fin(x.end))+'</small></div><b>'+e(d.t)+'</b>'
      +'<div class="l5bar" style="--p:'+p+'"><i></i></div><p class="l5chn"><b>'+n(x.n)+'</b> / '+n(x.goal)+' '+e(d.u)+' · toi : '+n(x.me)+'</p>'
      +'<p class="cap">Pour chaque membre qui a participé (au moins '+x.need+') : +3 drops et +200 wax coins.</p>'
      +(x.got?'<button class="gbtn" disabled>Récupéré ✓</button>':'<button class="pbtn" data-l5="chclaim"'+(done&&ok?'':' disabled')+'>'+(done?(ok?'Récupérer +3 drops et +200':'Participe encore : '+x.me+'/'+x.need):'Objectif pas encore atteint')+'</button>')+'</section>'}
  async function chalFill(b){if(!CH.d||Date.now()-CH.at>30e3){if(CH.busy)return;CH.busy=true;var r=await rpc('l5_chal_me',{},true);CH.busy=false;if(!r)return;CH.d=r;CH.at=Date.now()}
    var s=b.querySelector('.l5ch');if(s)s.outerHTML=chalHTML(CH.d)}
  function chalMount(){var b=sh.querySelector('.lbsh');if(!b||!on()||b.querySelector('.l5ch'))return;var a=b.querySelector('.lbweek')||b.querySelector('.lbintro');if(!a)return;
    a.insertAdjacentHTML('afterend','<section class="l5ch l5chc glass l5wait"><span class="lbl">Défi de la semaine</span><p class="cap">Chargement…</p></section>');chalFill(b)}
  if(window.MutationObserver&&typeof sh!=='undefined')new MutationObserver(function(){if(sh.querySelector('.lbsh'))chalMount()}).observe(sh,{childList:true,subtree:true});

  /* ---------- 39 + récompense : Discord ---------- */
  var DS={d:null,busy:false};
  function inv(){return (DS.d&&DS.d.invite)||INV}
  function discHTML(){var cl=on()&&S.l5.disc,c=DS.d&&DS.d.code;
    return '<section class="hj-c l5ds glass"><div class="hj-h"><span class="hb-i l5dsi">'+DI+'</span><div><b>'+(cl?'Discord : tes 5 drops sont arrivés ✓':on()?'Rejoins le Discord, gagne 5 drops':'Le Discord de WaxDrop')+'</b><small>'+(cl?'Merci d’être là':on()?'Une fois par compte':'Échanges, gros tirages, idées')+'</small></div></div>'
      +(cl?'<a class="gbtn" href="'+inv()+'" target="_blank" rel="noopener">Ouvrir le Discord</a>'
       :on()?'<ol class="l5st"><li>Rejoins le serveur WaxDrop</li><li>Poste ton code dans <b>#récupère-tes-drops</b></li><li>Le bot répond ✅ : tes 5 drops arrivent dans la minute</li></ol>'
          +'<div class="l5code"><b>'+(c?e(c):'…')+'</b><button class="gbtn" data-l5="dscopy"'+(c?'':' disabled')+'>Copier</button></div>'
          +'<a class="pbtn" href="'+inv()+'" target="_blank" rel="noopener">Rejoindre le Discord</a><p class="cap">Compte Discord créé il y a plus de 7 jours. Une fois par compte WaxDrop et une fois par compte Discord.</p>'
       :'<a class="pbtn" href="'+inv()+'" target="_blank" rel="noopener">Rejoindre le Discord</a>')+'</section>'}
  async function dsLoad(){if(!on()||DS.d||DS.busy)return;DS.busy=true;DS.d=await rpc('discord_me',{},true);DS.busy=false;document.querySelectorAll('.l5ds').forEach(function(x){x.outerHTML=discHTML()})}
  function dsOpen(){sheet('l5dss','Discord',head('Discord')+discHTML());dsLoad()}
  /* retour dans l'appli après avoir posté le code : on regarde si les drops sont arrivés */
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&on()&&!S.l5.disc&&DS.d&&window.ECO&&ECO.sync)setTimeout(function(){ECO.sync(true).then(function(){if(S.l5&&S.l5.disc){toast('Discord : +5 drops');if(typeof rewardPop==='function')rewardPop({maxi:5});document.querySelectorAll('.l5ds').forEach(function(x){x.outerHTML=discHTML()})}})},1500)});

  /* ---------- branchements ---------- */
  var once={wh:false};
  function after(){
    if(typeof tab==='undefined')return;
    if(tab==='ouvrir'||(tab==='shop'&&shopSub==='jour')){if(on()){if(FD.L.length)paintFeed();if(Date.now()-FD.at>25e3)feedLoad()}}
    if(document.querySelector('.v-bx')&&on()){paintUp();upLoad()}
    if(tab==='collection'||document.querySelector('.v-col')){var vh=document.querySelector('.v-col .vh');if(vh&&!document.querySelector('.v-col .l5cb'))vh.insertAdjacentHTML('afterend','<div class="l5cb"><button class="gbtn sm" data-l5="pl">★ Favoris et playlists</button>'+(on()?'<button class="gbtn sm" data-l5="fuse">Fusion</button>':'')+'</div>')}
    var j=document.querySelector('.v-jour');if(j&&!j.querySelector('.l5ds')){var col=j.querySelectorAll('.hj-col')[1];if(col)col.insertAdjacentHTML('afterbegin',discHTML());dsLoad()}
    if(on()){edMine();
      if(!reveal&&ED.n1.length){var id=ED.n1.shift(),c=CC()[id];ED.n1=[];if(c)toast('N°001 : tu as le tout premier exemplaire numéroté de '+c.t)}
      if(S.l5.wh>0&&!once.wh){once.wh=true;toast(S.l5.wh+' son'+(S.l5.wh>1?'s':'')+' de ta liste de souhaits revendu'+(S.l5.wh>1?'s':'')+' à la Bourse')}}
  }
  var r0=window.render;if(typeof r0==='function')window.render=function(){var x=r0.apply(this,arguments);try{after()}catch(er){}return x};
  setInterval(function(){if(on()&&!document.hidden&&!reveal&&(tab==='ouvrir'||(tab==='shop'&&shopSub==='jour')))feedLoad()},30e3);

  window.L5={on:on,serGot:serGot,sc:function(){var h='<button class="hj-s" data-l5="pl"><span class="hb-i">★</span><span><b>Favoris et playlists</b><small>'+pls().reduce(function(s,p){return s+p.ids.length},0)+' sons rangés</small></span></button>';
      if(on())h+='<button class="hj-s" data-l5="fuse"><span class="hb-i">⚗</span><span><b>Fusion</b><small>5 doubles → 1 son</small></span></button><button class="hj-s" data-l5="wish"><span class="hb-i">◎</span><span><b>Liste de souhaits</b><small>'+(S.l5.wh?S.l5.wh+' nouveauté'+(S.l5.wh>1?'s':''):'Prévenu à la Bourse')+'</small></span></button>';
      return h},
    disc:dsOpen,pl:plOpen,fuse:fuOpen,wish:wiOpen};

  document.addEventListener('click',async function(ev){var t=ev.target.closest('[data-l5],[data-act="l5disc"],[data-act="l5pl"]');if(!t)return;ev.stopPropagation();
    var a=t.dataset.l5||t.dataset.act,id=t.dataset.id;
    if(a==='l5disc'||a==='disc'){dsOpen();return}
    if(a==='l5pl'||a==='pl'){plOpen();return}
    if(a==='fav'){var f=pls()[0].ids,i=f.indexOf(id);if(i>=0)f.splice(i,1);else{if(f.length>=200){toast('200 favoris au plus');return}f.unshift(id)}save();var on1=f.indexOf(id)>=0;t.setAttribute('aria-pressed',on1);t.textContent=on1?'★ Favori':'☆ Favori';toast(on1?'Ajouté aux favoris':'Retiré des favoris');return}
    if(a==='addpl'){closeCard();sheet('l5add','Ajouter à une playlist',addHTML(id));return}
    if(a==='pladd'){plAdd(+t.dataset.i,id);var b=box('l5add');if(b)b.innerHTML=addHTML(id);return}
    if(a==='plmk'){var inp=sh.querySelector('#l5pn'),nm=(inp&&inp.value||'').trim().slice(0,30);if(!nm){toast('Donne un nom à la playlist');return}pls().push({n:nm,ids:id?[id]:[]});save();if(id){var b2=box('l5add');if(b2)b2.innerHTML=addHTML(id);toast('Playlist créée')}else{PL.i=pls().length-1;plPaint()}return}
    if(a==='plsel'){PL.i=+t.dataset.i;plPaint();return}
    if(a==='plnew'){var b3=box('l5pl');if(b3&&!b3.querySelector('.l5new'))b3.querySelector('.l5plc').insertAdjacentHTML('afterend','<div class="lbrow l5new"><input id="l5pn" maxlength="30" placeholder="Nom de la playlist" autocomplete="off"><button class="gbtn" data-l5="plmk">Créer</button></div>');var i2=sh.querySelector('#l5pn');if(i2)i2.focus();return}
    if(a==='plrm'){var P=pls()[PL.i],k=P.ids.indexOf(id);if(k>=0)P.ids.splice(k,1);save();plPaint();return}
    if(a==='plren'){var P2=pls()[PL.i];var nm2=prompt('Nouveau nom',P2.n);if(nm2&&nm2.trim()){P2.n=nm2.trim().slice(0,30);save();plPaint()}return}
    if(a==='pldel'){if(!t.dataset.arm){t.dataset.arm=1;t.textContent='Confirmer';return}if(PL.play&&PL.play.i===PL.i)plStop();pls().splice(PL.i,1);PL.i=0;save();plPaint();return}
    if(a==='plplay'){plPlay();return}
    if(!on())return;
    if(a==='fuse'){closeCard();fuOpen(t.dataset.r!=null?+t.dataset.r:null);return}
    if(a==='fur'){FU.r=+t.dataset.r;FU.pick=[];fuPaint();return}
    if(a==='fuadd'){if(FU.pick.length<5){FU.pick.push(id);fuPaint()}return}
    if(a==='fuun'){FU.pick.splice(+t.dataset.i,1);fuPaint();return}
    if(a==='fuauto'){fuAuto();return}
    if(a==='fugo'){fuGo();return}
    if(a==='fuagain'){FU.res=null;fuPaint();return}
    if(a==='wish'){wiOpen();return}
    if(a==='wtog'){t.disabled=true;var r=await rpc('wish_toggle',{p_card:id});t.disabled=false;if(!r)return;if(!W)W=new Set();if(r.on)W.add(id);else W.delete(id);t.setAttribute('aria-pressed',!!r.on);t.textContent=r.on?'Souhait enregistré ✓':'Préviens-moi à la Bourse';toast(r.on?'Tu seras prévenu quand ce son arrive à la Bourse':'Souhait retiré');return}
    if(a==='wirm'){var r2=await rpc('wish_toggle',{p_card:id});if(r2&&r2.on)await rpc('wish_toggle',{p_card:id});wiOpen();return}
    if(a==='wibuy'){t.disabled=true;var r3=await ECO.op('bbuy',{id:id});if(!r3){t.disabled=false;return}toast('Acheté · '+n(r3.price)+' wax coins');wiOpen();return}
    if(a==='chclaim'){t.disabled=true;var r4=await rpc('l5_chal_claim');if(!r4){t.disabled=false;return}CH.d=r4;CH.at=Date.now();var s=sh.querySelector('.l5ch');if(s)s.outerHTML=chalHTML(r4);if(window.ECO&&ECO.sync)ECO.sync(true);if(typeof rewardPop==='function')rewardPop({maxi:3,coins:200});return}
    if(a==='dscopy'){var c=DS.d&&DS.d.code;if(!c)return;try{await navigator.clipboard.writeText(c);toast('Code copié : colle-le dans #récupère-tes-drops')}catch(x){toast('Ton code : '+c)}return}
  },true);
})();
