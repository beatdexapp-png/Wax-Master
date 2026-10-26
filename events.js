/* WaxDrop : événements (artistes à la une, 1 son garanti par drop, défi à 3 paliers). */
(function(){
  var TIERS=[[5,'+150',coinI],[15,'+2 drops',''],[30,'Drop Or','+300']];
  function art(n){return ARTISTS.find(function(A){return A.n===n})}
  function icons(x){return (x.ic||x.fx.artists||[]).slice(0,6)}
  function avs(x,cls){var L=icons(x).map(art).filter(Boolean);
    if(!L.length)return '<span class="evav '+(cls||'')+'"><i class="evsym">'+(x.fx.divin?ICON.gem:coinI)+'</i></span>';
    return '<span class="evav '+(cls||'')+'">'+L.map(function(A,i){return '<i style="--i:'+i+';background:'+esc(A.avg)+'" title="'+esc(A.n)+'">'+(A.img?'':esc(A.ini||A.n.slice(0,2)))+'</i>'}).join('')+'</span>'}
  function effects(x){var f=x.fx,L=[];
    if(f.artists||f.genre)L.push(['1 son garanti par drop',f.artists?'Chaque drop contient au moins un son des artistes à la une.':'Chaque drop contient au moins un son '+(GEN[f.genre]||f.genre)+'.']);
    if(f.mult&&(f.artists||f.genre))L.push(['×'+f.mult+' sur les autres cartes','Leurs sons tombent aussi '+f.mult+' fois plus souvent dans le reste du drop.']);
    if(f.divin)L.push(['Chance Divine ×'+f.divin,'Les Divins tombent '+f.divin+' fois plus souvent.']);
    if(f.cost)L.push(['Drops à '+f.cost+' wax coins','Au lieu de '+COST+'.']);
    return L}
  function goal(x){return x.fx.artists?'Sons des artistes à la une':x.fx.genre?'Sons '+(GEN[x.fx.genre]||x.fx.genre):'Sons Rare ou mieux'}
  function hero(x){var p=(S.evp||{})[x.id]||0,cl=(S.evc||{})[x.id]||[],max=TIERS[2][0];
    var bar='<div class="evbar"><i style="width:'+Math.min(100,p/max*100)+'%"></i>'+TIERS.map(function(t,k){var ok=p>=t[0],got=cl.indexOf(k)>=0;
      return '<button class="evt'+(ok?' ok':'')+(got?' got':'')+'" style="left:'+(t[0]/max*100)+'%" data-act="'+(ok&&!got?'evclaim':'')+'" data-t="'+k+'" '+(ok&&!got?'':'tabindex="-1"')+'><b>'+(got?'✓':t[0])+'</b><small>'+t[1]+'</small></button>'}).join('')+'</div>';
    return '<div class="evhero" style="--evbg:'+x.bg+'"><div class="evtop"><span class="evk"><i class="ldot"></i>En cours</span><span class="evtime">Fin dans <b data-until="'+x.e+'">'+dur(new Date(x.e)-now())+'</b></span></div>'
      +avs(x,'big')+'<h3>'+esc(x.n)+'</h3><p>'+esc(x.d)+'</p>'
      +'<div class="evfx">'+effects(x).map(function(e){return '<div><b>'+e[0]+'</b><small>'+e[1]+'</small></div>'}).join('')+'</div>'
      +'<div class="evgoal"><span class="lbl">Défi · '+goal(x)+'</span><b>'+p+' / '+max+'</b></div>'+bar
      +'<button class="pbtn evgo" data-act="evopen">Ouvrir un drop</button></div>'}
  function row(x){return '<div class="evrow" style="--evbg:'+x.bg+'">'+avs(x)+'<span><b>'+esc(x.n)+'</b><small>'+esc(x.d)+'</small></span><em>'+fdate(x.s)+'</em></div>'}
  window.evSheet=function(){closeMenu();menuPage='events';var L=EVENTS.filter(function(x){return evState(x)!=='past'}).sort(function(a,b){return new Date(a.s)-new Date(b.s)});
    var live=L.filter(function(x){return evState(x)==='live'}),next=L.filter(function(x){return evState(x)==='next'});
    sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass evsh" role="dialog" aria-label="Événements"><div class="grab"></div><div class="shh"><h2>Événements</h2><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div>'
      +(live.length?live.map(hero).join(''):'<p class="cap">Pas d’événement en ce moment.</p>')
      +(next.length?'<span class="lbl">À venir</span><div class="evlist">'+next.map(row).join('')+'</div>':'')+'</div>'};
  window.evAvatars=avs;
  document.addEventListener('click',async function(e){var t=e.target.closest('[data-act="evclaim"],[data-act="evopen"]');if(!t)return;e.stopPropagation();
    if(t.dataset.act==='evopen'){closeMenu();setTab('ouvrir');return}
    t.disabled=true;var r=window.ECO&&await ECO.op('ev_claim',{t:+t.dataset.t});
    if(r){var k=+t.dataset.t;rewardPop(k===0?{coins:150}:k===1?{maxi:2}:{gold:1,coins:300});evSheet()}else t.disabled=false},true);
})();
