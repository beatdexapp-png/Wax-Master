/* WaxDrop : première session (lot 2, 07/11/2026).
   1. « Bienvenue, pseudo » avec un seul bouton, puis un tutoriel de 4 étapes, passable à tout moment.
   2. Quête « Première soirée » sur l'écran Ouvrir : 10 drops, une récompense à mi-chemin.
      Les récompenses sont celles des missions du jour déjà existantes (validées par le serveur via mClaim) : rien de nouveau côté économie.
   Tout est local (localStorage), aucune donnée nouvelle en base. */
(function(){
  var K_SEEN='wd-acc1',K_QUEST='wd-soiree',GOAL=10,MID=5;
  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  function esc2(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function packs(){return (typeof S!=='undefined'&&S.packs|0)||0}
  function pseudo(){return (window.CL&&CL.pseudo)||''}
  function ready(){var g=document.getElementById('gate');return typeof S!=='undefined'&&window.CL&&CL.user&&CL.pseudo&&(!g||g.hidden)&&!document.querySelector('#ov .ov')}

  /* ---------- accueil + tutoriel ---------- */
  var STEPS=[
    {k:'hi'},
    {k:'open',t:'Ouvre un drop',p:'Un drop gratuit toutes les 10 minutes. Dedans, 5 vrais sons tirés au sort, de tous les styles.'},
    {k:'vinyl',t:'Touche le vinyle',p:'Il accélère et change de couleur quand la rareté monte. Du Commun au Divin.'},
    {k:'book',t:'Remplis tes classeurs',p:'Chaque son rejoint le classeur de son artiste. Un album complet rapporte des wax coins.'},
    {k:'trade',t:'Échange tes doubles',p:'Avec tes potes, ou revends-les à la Bourse quand leur cours monte.'}
  ];
  var cur=0,box=null;
  function art(k){
    if(k==='open')return '<div class="tzv tzv-open"><i></i><b>Wax<br>Drop</b></div>';
    if(k==='vinyl'){var R=window.RAR||[];return '<div class="tzv tzv-vin"><i class="tzd"></i><div class="tzr">'+R.map(function(r,i){return '<span style="--c:'+r.c+';--i:'+i+'"></span>'}).join('')+'</div></div>'}
    if(k==='book'){var s='';for(var i=0;i<9;i++)s+='<span class="'+(i===0||i===4||i===5?'on':'')+'" style="--i:'+i+'"></span>';return '<div class="tzv tzv-book"><div class="tzg">'+s+'</div><em>3 / 9</em></div>'}
    if(k==='trade')return '<div class="tzv tzv-trade"><span class="t1"></span><span class="t2"></span><i></i></div>';
    return '';
  }
  function html(){
    var st=STEPS[cur],last=cur===STEPS.length-1,dots=STEPS.slice(1).map(function(_,i){return '<i class="'+(i+1===cur?'on':'')+'"></i>'}).join('');
    if(st.k==='hi'){var ps=pseudo();
      return '<div class="acx-card acx-hi"><div class="acx-vin" aria-hidden="true"></div><span class="acx-k">Bienvenue</span><h2>'+(ps?esc2(ps):'Bienvenue')+'</h2><p>WaxDrop, c’est le jeu de cartes de ta musique. Rap, pop, rock, électro, afro, K-pop, jazz, chanson : chaque son est une carte.</p><button class="pbtn acx-go" data-acx="next">C’est parti</button><button class="acx-skip" data-acx="skip">Passer</button></div>'}
    return '<div class="acx-card"><button class="acx-skip acx-top" data-acx="skip">Passer</button>'+art(st.k)+'<span class="acx-k">Étape '+cur+' sur '+(STEPS.length-1)+'</span><h2>'+st.t+'</h2><p>'+st.p+'</p><div class="acx-dots" aria-hidden="true">'+dots+'</div><button class="pbtn acx-go" data-acx="'+(last?'first':'next')+'">'+(last?'Ouvrir mon premier drop':'Suivant')+'</button></div>';
  }
  function paint(){if(!box)return;box.innerHTML='<div class="acx-scrim"></div>'+html();var c=box.querySelector('.acx-card');if(c){c.classList.remove('in');void c.offsetWidth;c.classList.add('in')}}
  function open(from){if(box)return;cur=from|0;box=document.createElement('div');box.id='acx';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Bienvenue sur WaxDrop');document.body.appendChild(box);paint();
    box.addEventListener('click',function(ev){var b=ev.target.closest('[data-acx]');if(!b)return;var a=b.dataset.acx;
      if(a==='next'){cur++;paint()}
      else if(a==='skip')close();
      else if(a==='first'){close();try{if(typeof setTab==='function')setTab('ouvrir');if(typeof openPack==='function')openPack(typeof canFree==='function'&&canFree()?'free':'pay')}catch(e){}}})}
  function close(){ls(K_SEEN,'1');if(box){var b=box;box=null;b.classList.add('out');setTimeout(function(){b.remove()},320)}if(typeof render==='function')render()}
  window.ACC={open:open};
  document.addEventListener('click',function(ev){var t=ev.target.closest('[data-act="tuto"]');if(!t)return;ev.stopPropagation();if(typeof closeMenu==='function')closeMenu();open(1)},true);

  /* première session : compte connecté, pseudo choisi, aucun drop ouvert, accueil jamais vu */
  var tries=0,iv=setInterval(function(){
    if(++tries>120||ls(K_SEEN)){clearInterval(iv);return}
    if(!ready())return;
    if(packs()>0){ls(K_SEEN,'1');clearInterval(iv);return}
    clearInterval(iv);open(0);
  },1000);

  /* ---------- quête « Première soirée » ---------- */
  function questOn(){var q=ls(K_QUEST);return q!=='fin'&&q!=='off'&&packs()<GOAL+1}
  function readyMission(){try{var d=day();return todayMissions().filter(function(m){return !d.cl[m.k]&&(d[m.k]||0)>=m.n})[0]||null}catch(e){return null}}
  function questHTML(){
    var n=Math.min(packs(),GOAL),pc=n/GOAL*100,m=readyMission(),done=n>=GOAL;
    var right=m?'<button class="qst-b" data-qst="claim" data-k="'+m.k+'">Prendre +'+m.c+'</button>':done?'<button class="qst-b" data-qst="end">Terminer</button>':'<span class="qst-n">'+n+'<small>/'+GOAL+'</small></span>';
    var sub=done?'Soirée réussie. Tes missions du jour continuent demain.':m?'Récompense prête : '+esc2(m.t):n<MID?'Encore '+(MID-n)+' drop'+(MID-n>1?'s':'')+' : récompense à mi-chemin':'Encore '+(GOAL-n)+' drop'+(GOAL-n>1?'s':'')+' pour finir la soirée';
    return '<div class="qst glass'+(done?' ok':'')+'" style="--p:'+pc.toFixed(1)+'%"><div class="qst-t"><b>Première soirée</b><small>'+sub+'</small></div>'+right+'<div class="qst-bar" aria-hidden="true"><i></i><em style="left:'+(MID/GOAL*100)+'%"></em></div><button class="qst-x" data-qst="off" aria-label="Masquer la quête">×</button></div>';
  }
  function inject(){
    if(typeof tab==='undefined'||tab!=='ouvrir'||!questOn())return;
    var v=document.querySelector('#main .v-open');if(!v||v.querySelector('.qst'))return;
    var top=v.querySelector('.otop');var d=document.createElement('div');d.innerHTML=questHTML();var q=d.firstChild;
    if(top)top.insertAdjacentElement('afterend',q);else v.prepend(q);
  }
  document.addEventListener('click',function(ev){var b=ev.target.closest('[data-qst]');if(!b)return;ev.stopPropagation();var a=b.dataset.qst;
    if(a==='claim'&&window.mClaim){b.disabled=true;mClaim(b.dataset.k)}
    else if(a==='end'){ls(K_QUEST,'fin');if(typeof toast==='function')toast('Première soirée terminée');render()}
    else if(a==='off'){ls(K_QUEST,'off');render()}},true);
  if(typeof render==='function'){var r0=render;window.render=function(){var r=r0.apply(this,arguments);try{inject()}catch(e){}return r}}
  inject();
})();
