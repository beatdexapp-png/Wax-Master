/* WaxDrop : lot 6 « Argent » (08/11/2026).
   - Coffret à 9,99 € : 5 000 wax coins + 2 Drops Or + 10 drops (crédité par le serveur, stripe_apply).
   - WaxDrop Pro à l'année : 49,90 € (2 mois offerts par rapport au mensuel à 4,99 €).
     Les deux offres restent CACHÉES tant que leur lien de paiement Stripe n'est pas renseigné dans eco.js (PAY.proan, PAY.coffret).
   - Page « Gratuit ou Pro » (Disquaire > Pro > Tout comparer).
   - Avantages Pro visibles : badge Pro à côté du pseudo (profil, classement, amis, profils publics, grâce à pro_flags),
     anneau doré autour de l'avatar, bouton Ouvrir doré réservé aux Pro.
   Sans la migration du lot 6 : pro_flags répond 404, seul le badge des autres joueurs manque. Rien d'autre ne change. */
(function(){
  if(typeof S==='undefined')return;
  var L6=window.L6={YEAR:'49,90 €',MONTH:'4,99 €',COF:{p:'9,99 €',coins:5000,gold:2,drops:10}};
  function n(v){return (v||0).toLocaleString('fr-FR')}
  L6.on=function(k){return !!(window.ECO&&ECO.canPay&&ECO.canPay(k))};
  /* valeur du coffret en wax coins, aux prix du jeu (Drop Or 900, drop 100) */
  L6.cofValue=function(){return L6.COF.coins+L6.COF.gold*GOLD_COST+L6.COF.drops*COST};

  /* ---------- Coffret (boutique, onglet Drops) ---------- */
  L6.coffret=function(){if(!L6.on('coffret'))return '';var C=L6.COF;
    return '<div class="l6cof glass">'+(window.SB?SB.dpk('or',{cls:'l6cofp'}):'')+'<div class="l6cofb"><span class="lbl">Coffret WaxDrop</span><b>'+n(C.coins)+' wax coins<br>+ '+C.gold+' Drops Or + '+C.drops+' drops</b><small>Vaut '+n(L6.cofValue())+' wax coins au prix du jeu</small></div><button class="pbtn" data-act="buy" data-k="coffret">'+C.p+'</button></div>'};

  /* ---------- formules Pro (page Pro, joueur non abonné) ---------- */
  L6.plans=function(){var an=L6.on('proan');
    if(!an)return '<button class="pbtn pscta" data-act="buy" data-k="pass">S’abonner · '+L6.MONTH+' / mois</button>';
    return '<div class="l6pl" role="group" aria-label="Formules WaxDrop Pro">'+
      '<button class="l6p" data-act="buy" data-k="pass"><b>Au mois</b><span><em>'+L6.MONTH+'</em> / mois</span><small>Sans engagement</small></button>'+
      '<button class="l6p on" data-act="buy" data-k="proan"><i class="l6tag">2 mois offerts</i><b>À l’année</b><span><em>'+L6.YEAR+'</em> / an</span><small>Soit 4,16 € par mois</small></button></div>'};

  /* ---------- comparatif Gratuit / Pro ---------- */
  var ROWS=[['Drop gratuit','Toutes les 10 min','Toutes les 5 min'],['Drop offert chaque jour','–','1 par jour'],['Drop Or chaque lundi','–','1, Légendaire garanti'],
    ['Bourse','Achats et ventes limités','Sans limite, Divins compris'],['Historique de la Bourse','24 h','7 et 30 jours'],['Stats détaillées','–','Pour toi et tes amis'],
    ['Défis d’événement','Points normaux','Chaque son compte double'],['Label','–','+50 % de points, création offerte'],['Thèmes','Classiques','+ Minuit et Nacre'],
    ['Badge Pro','–','Sur ton profil, au classement et chez tes amis'],['Bouton Ouvrir doré','–','Oui']];
  L6.table=function(){return '<div class="l6cmp" role="table" aria-label="Comparatif Gratuit et Pro"><div class="l6r l6h" role="row"><span role="columnheader">Avantage</span><b role="columnheader">Gratuit</b><b class="pp" role="columnheader">Pro</b></div>'+
    ROWS.map(function(r){return '<div class="l6r" role="row"><span role="cell">'+r[0]+'</span><em role="cell">'+r[1]+'</em><em class="pp" role="cell">'+r[2]+'</em></div>'}).join('')+
    '<div class="l6r l6price" role="row"><span role="cell">Prix</span><em role="cell">Gratuit</em><em class="pp" role="cell">'+L6.MONTH+' / mois'+(L6.on('proan')?'<br>ou '+L6.YEAR+' / an':'')+'</em></div></div>'};
  L6.cmp=function(){var on=hasPass();
    return '<div class="psp l6page"><p class="l6lead">Le jeu reste entièrement gratuit. Pro donne plus de drops, la Bourse en détail et des signes visibles.</p>'+L6.table()+
      '<div class="psbar">'+(on?'<span class="pson">'+ICON.check+'Tu es Pro</span>':L6.plans())+'</div><p class="cap">Paiement sécurisé par Stripe. Sans engagement, résiliable à tout moment.</p></div>'};

  /* ---------- badges Pro ---------- */
  var PRO={},ASKED={},wait=null;
  function me(){return window.CL&&CL.pseudo}
  async function ask(list){if(!(window.CL&&CL.user&&CL.sb))return;list=list.filter(function(p){return !(p in ASKED)}).slice(0,100);if(!list.length)return;
    list.forEach(function(p){ASKED[p]=1});
    try{var r=await CL.sb.rpc('pro_flags',{p_pseudos:list});if(r.error)return;(r.data||[]).forEach(function(p){PRO[p]=1});if(r.data&&r.data.length)mark()}catch(x){}}
  function isPro(p){return p===me()?hasPass():!!PRO[p]}
  function badge(){var b=document.createElement('em');b.className='pro l6b';b.textContent='Pro';return b}
  function mark(){
    var need=[];
    document.querySelectorAll('[data-act="plprof"][data-p],[data-act="mystats"][data-p]').forEach(function(el){var p=el.dataset.p;if(!p)return;
      if(!isPro(p)){if(p!==me()&&!(p in ASKED))need.push(p);return}
      if(el.dataset.l6)return;el.dataset.l6='1';var av=el.querySelector('.av');if(av)av.classList.add('l6av');
      var b=el.querySelector('b');if(b)b.insertAdjacentElement('afterend',badge());else el.appendChild(badge())});
    /* ton profil */
    if(hasPass()){var pn=document.querySelector('.v-prof .phero .pn>b');if(pn&&!pn.querySelector('.l6b'))pn.appendChild(badge());
      var a=document.querySelector('.v-prof .phero .av');if(a)a.classList.add('l6av')}
    if(need.length)ask(need);
  }
  function soon(){if(wait)return;wait=setTimeout(function(){wait=null;try{mark()}catch(x){}},120)}
  /* bouton Ouvrir doré pour les Pro */
  function gold(){var on=hasPass();document.querySelectorAll('.pbtn[data-act="open"]').forEach(function(b){b.classList.toggle('l6gold',on)})}
  function after(){gold();soon()}
  if(typeof render==='function'){var r0=render;window.render=function(){var r=r0.apply(this,arguments);try{after()}catch(x){}return r}}
  /* feuilles (amis, profils publics) ouvertes sans passer par render */
  try{['sh','dd'].forEach(function(id){var h=document.getElementById(id);if(h)new MutationObserver(function(){soon()}).observe(h,{childList:true,subtree:true})})}catch(x){}
  try{if(document.querySelector('#main .view'))render();else after()}catch(x){}
})();
