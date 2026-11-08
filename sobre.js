/* WaxDrop : refonte sobre (08/11/2026).
   Pochettes de drops (une image par style, époque et drop spécial, le vinyle qui dépasse, reflet qui suit le doigt ou la souris
   grâce à l'inclinaison de polish.js, coupée en mode léger, si l'appareil demande moins d'animations ou s'il est faible),
   images d'en-tête et d'écrans vides. Photos générées (Cloudflare Workers AI, FLUX.2 klein) ; Drops, Wax coins, Missions, Amis et pochettes Or, Diamant, Ultra, Tout dessinées en code (tests/images-v71/art.html, 08/11). WebP 2 tailles, chargées à la demande.
   Aucune règle du jeu ni appel serveur ici : seulement de l'affichage. */
(function(){
  if(typeof S==='undefined')return;
  function e(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var SB=window.SB={};
  /* style ou époque du jeu → image ; couleur de lumière du vinyle */
  var ST={'Rap':'rap','Pop':'pop','Rock':'rock','Électro':'electro','Afro':'afro','Latino':'latino','K-pop':'kpop','Jazz':'jazz','Variété':'chanson','Chanson FR':'chanson','R&B':'rnb','Soul':'soul','Reggae':'reggae','Raï':'rai'};
  var COL={rap:'#9b6bff',pop:'#ff8fc8',rock:'#ff5a4e',electro:'#3fe0ff',afro:'#ffa23a',latino:'#2fd3c0',kpop:'#ff5fd2',jazz:'#e8b04a',chanson:'#7fa7ff',rnb:'#b46bff',soul:'#ff9a4a',reggae:'#5fd36b',rai:'#3fc4d8',
    'era-1960':'#ffb35a','era-1990':'#ff6b8a','era-2000':'#8fd3ff','era-2010':'#b07bff','era-2020':'#ffa9c0',tout:'#ff5f86',or:'#f5c542',diamant:'#8fe3ff',ultra:'#ffd6f4'};
  /* clé du booster (lot 4 : '', st:Rap, era:1990, art:…, alb:…) ou du drop spécial → nom de fichier */
  SB.key=function(k){k=k||'';if(!k)return 'sp-tout';
    if(k.indexOf('st:')===0)return ST[k.slice(3)]?'st-'+ST[k.slice(3)]:'sp-tout';
    if(k.indexOf('era:')===0)return /^(1960|1990|2000|2010|2020)$/.test(k.slice(4))?'era-'+k.slice(4):'sp-tout';
    if(/^(or|diamant|ultra|tout)$/.test(k))return 'sp-'+k;return 'sp-tout'};
  function col(f){return COL[f.replace(/^(st|sp)-/,'')]||COL[f]||'#ff5f86'}
  SB.src=function(f,big){return '/img/drops/'+f+'-'+(big?480:240)+'.webp'};
  SB.il=function(n){return '/img/il/'+n+'-960.webp'};
  function img(f,eager){return '<img src="'+SB.src(f)+'" srcset="'+SB.src(f)+' 240w, '+SB.src(f,1)+' 480w" sizes="(min-width:1024px) 320px, 60vw" width="480" height="480" alt="" decoding="async"'+(eager?' fetchpriority="high"':' loading="lazy"')+'>'}
  /* pochette : o.u = image déjà au catalogue (artiste du jour, sortie de la semaine), o.hero = grande pochette d'Ouvrir */
  SB.dpk=function(k,o){o=o||{};var f=SB.key(k);var u=o.u?'<img src="'+e(o.u)+'" alt="" loading="lazy" decoding="async">':img(f,o.hero);
    return '<span class="dpk'+(o.hero?' dpk-hero':'')+(o.cls?' '+o.cls:'')+'" style="--dc:'+(o.c||col(f))+'" aria-hidden="true"><span class="dpk-v"><i></i></span><span class="dpk-s">'+u+'<span class="dpk-g"></span></span></span>'};
  /* bannière photo en haut d'une page */
  /* les scènes dessinées ont une version large (1600×400) pour la bannière basse et large du PC */
  var WIDE={'il-boutique':1,'il-coins':1,'il-missions':1,'il-amis':1};
  SB.ban=function(n,t){return '<figure class="sbn"><picture>'+(WIDE[n]?'<source media="(min-width:1024px)" srcset="/img/il/'+n+'-w.webp">':'')+'<img src="'+SB.il(n)+'" srcset="/img/il/'+n+'-480.webp 480w, /img/il/'+n+'-960.webp 960w" sizes="(min-width:1024px) 720px, 100vw" width="960" height="600" alt="" loading="lazy" decoding="async"></picture>'+(t?'<figcaption>'+t+'</figcaption>':'')+'</figure>'};
  function ph(n){return '<img class="hart hph" src="/img/il/'+n+'-480.webp" width="480" height="300" alt="" loading="lazy" decoding="async">'}
  /* sommaire du Disquaire et carte Pro : photos à la place des dessins */
  if(typeof ART!=='undefined'){ART.packs=ph('il-boutique');ART.ach=ph('il-succes');ART.pass=ph('il-pro');ART.saison=ph('il-missions');ART.amis=ph('il-amis');ART.bourse=ph('il-bourse')}

  /* images d'en-tête par page du Disquaire (une seule, sous le titre) */
  var BAN={jour:'il-jour',saison:'il-missions',succes:'il-succes',echanges:'il-amis',jetons:'il-boutique'};
  function after(){
    var v=document.querySelector('#main .view');if(!v)return;
    if(tab==='shop'){var n=BAN[shopSub];if(shopSub==='jetons'&&typeof jetSub!=='undefined')n=jetSub==='packs'?'il-boutique':'il-coins';
      if(n&&!v.querySelector('.sbn')){var h=v.querySelector('.vh');var d=document.createElement('div');d.innerHTML=SB.ban(n);if(h)h.insertAdjacentElement('afterend',d.firstChild);else v.prepend(d.firstChild)}}
    if(tab==='profil'&&typeof profSub!=='undefined'&&profSub==='top'&&!v.querySelector('.sbn')){var p=v.querySelector('.wkh,.vh');var d2=document.createElement('div');d2.innerHTML=SB.ban('il-classement');if(p)p.insertAdjacentElement('beforebegin',d2.firstChild)}
    /* Drop Or : petite pochette dorée sur le bouton */
    var g=v.querySelector('.goldp');if(g&&!g.querySelector('.dpk'))g.insertAdjacentHTML('afterbegin',SB.dpk('or',{cls:'dpk-xs'}));
  }
  if(typeof render==='function'){var r0=render;window.render=function(){var r=r0.apply(this,arguments);try{after()}catch(x){}return r}}
  /* premier rendu fait avant le chargement de ce fichier : on le refait une fois */
  try{if(document.querySelector('#main .view'))render();else after()}catch(x){}
})();
