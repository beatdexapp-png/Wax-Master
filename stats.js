/* WaxDrop : statistiques de joueur (toi, ou un ami). Le détail est réservé à WaxDrop Pro. */
(function(){
  var RN=['Commun','Rare','Ultra rare','Légendaire','Mythique','Divin'],RC=['#aab3bd','#5aa9ff','#c27dff','#ffc23d','#ff5f86','#e8cf8a'];
  var KN={std:'Classiques',free:'Gratuits',pay:'Payés',drop:'Numérotés',gold:'Or',nacre:'Ultra',diamant:'Diamant'};
  function n(v){return (v||0).toLocaleString('fr-FR')}
  function since(s){var d=new Date(s);return isNaN(d)?'':d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}
  function ago(s){var d=new Date(s);if(isNaN(d))return '';var m=(Date.now()-d)/6e4;return m<60?'il y a '+Math.max(1,Math.round(m))+' min':m<1440?'il y a '+Math.round(m/60)+' h':'il y a '+Math.round(m/1440)+' j'}
  function av(url,ps){return '<span class="av tbig" style="'+(url?'--avg:url(\''+esc(url)+'\') center/cover no-repeat,#333':'')+'">'+(url?'':esc((ps||'?').slice(0,2).toUpperCase()))+'</span>'}
  function tile(v,l,sub){return '<div class="stt"><b>'+v+'</b><span>'+l+'</span>'+(sub?'<small>'+sub+'</small>':'')+'</div>'}
  function bars(obj,cols){var ks=Object.keys(obj||{}).filter(function(k){return obj[k]>0}).sort(function(a,b){return obj[b]-obj[a]});var tot=ks.reduce(function(s,k){return s+obj[k]},0)||1;
    return ks.map(function(k,i){var p=Math.round(obj[k]/tot*100);return '<div class="stbar"><span>'+esc(k)+'</span><i><u style="width:'+Math.max(3,p)+'%;background:'+(cols?cols[i%cols.length]:'var(--on)')+'"></u></i><em>'+p+' %</em></div>'}).join('')}
  function view(d){
    var pct=d.total?Math.round(d.sons/d.total*1000)/10:0;
    var h='<div class="shh"><div class="phd">'+av(d.avatar,d.pseudo)+'<div><b>'+esc(d.me?'Mes stats':d.pseudo)+'</b><small>'+n(d.score)+' pts'+(d.since?' · depuis le '+since(d.since):'')+'</small></div></div><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div>';
    h+='<div class="stg">'+tile(n(d.sons),'sons',pct+' % du jeu')+tile(n(d.packs),'drops ouverts')+tile(n(d.albums),'albums complets')+tile(n(d.artists),'artistes')+tile(n(d.doubles),'doubles')+tile(n(d.platine),'platines')+'</div>';
    h+='<span class="lbl">'+(d.me?'Ta':'Sa')+' collection par rareté</span><div class="strr">'+RN.map(function(nm,i){return '<div class="strc" style="--c:'+RC[i]+'"><b>'+n((d.rar||{})[i])+'</b><small>'+nm+'</small></div>'}).reverse().join('')+'</div>';
    if(d.locked){
      h+='<div class="stpro"><div class="stblur" aria-hidden="true"><div class="stg">'+tile('148 %','chance')+tile('Mythique','meilleur tirage')+tile('52 400','valeur')+'</div><div class="stbar"><span>Rap</span><i><u style="width:80%"></u></i><em>80 %</em></div><div class="stbar"><span>Pop</span><i><u style="width:30%"></u></i><em>12 %</em></div></div>'+
        '<div class="stlock"><b>Stats détaillées</b><small>Chance, meilleur tirage, valeur de la collection, artistes et styles préférés, tirages par rareté</small><button class="pbtn" data-act="gopass">Avec WaxDrop Pro</button></div></div>';
    }else{
      var lk=d.luck,ltx=lk==null?'Pas encore assez de drops':lk>=130?'Très chanceux':lk>=105?'Plus chanceux que la moyenne':lk>=90?'Dans la moyenne':'Pas de chance ces temps-ci';
      h+='<span class="lbl">WaxDrop Pro</span><div class="stg">'+tile(lk==null?'–':lk+' %','chance',ltx)+tile(n(d.value),'valeur','wax coins à la Bourse')+tile(n(d.drawn),'sons tirés','depuis le suivi')+'</div>';
      if(d.best&&C[d.best.id]){var c=C[d.best.id];h+='<span class="lbl">Meilleur tirage</span><div class="stbest">'+tileHTML(c,{nocount:1,lock:false})+'<div><b>'+esc(c.t)+'</b><small>'+esc(c.a)+'</small><em style="color:'+RC[c.r]+'">'+RN[c.r]+'</em><small>'+ago(d.best.at)+'</small></div></div>'}
      var dr=d.drawnRar||{},dt=0;for(var i=0;i<6;i++)dt+=dr[i]||0;
      if(dt){h+='<span class="lbl">'+(d.me?'Tes':'Ses')+' tirages par rareté</span>'+RN.map(function(nm,i){var v=dr[i]||0,p=Math.round(v/dt*1000)/10;return '<div class="stbar"><span>'+nm+'</span><i><u style="width:'+Math.max(v?2:0,p)+'%;background:'+RC[i]+'"></u></i><em>'+n(v)+'</em></div>'}).join('')}
      if(d.top&&d.top.length)h+='<span class="lbl">Artistes préférés</span>'+d.top.map(function(t){var p=Math.round(t.n/(t.tot||1)*100);return '<div class="stbar"><span>'+esc(t.a)+'</span><i><u style="width:'+Math.max(3,p)+'%"></u></i><em>'+t.n+'/'+t.tot+'</em></div>'}).join('');
      h+='<span class="lbl">Styles</span>'+bars(d.styles,['#ffc23d','#ff5f86','#5aa9ff','#3ddc84','#c27dff','#2fd3ff']);
      var sc={};Object.keys(d.scenes||{}).forEach(function(k){sc[k==='Monde'?'Monde':'Rap '+k]=d.scenes[k]});h+='<span class="lbl">Scènes</span>'+bars(sc,['#5aa9ff','#ff5f86','#c27dff','#ffc23d']);
      var kd={};Object.keys(d.kinds||{}).forEach(function(k){kd[KN[k]||k]=d.kinds[k]});if(Object.keys(kd).length)h+='<span class="lbl">Drops ouverts par type</span>'+bars(kd);
      h+='<div class="stg">'+tile(n(d.friends),'amis')+tile(n(d.trades),'échanges')+tile(n(d.bourse),'ordres Bourse')+'</div>';
      if(d.last)h+='<p class="cap">Dernier drop '+ago(d.last)+'</p>';
    }
    if(!d.me)h+='<button class="pbtn" data-act="trplayer" data-p="'+esc(d.pseudo)+'">Échanger avec '+esc(d.pseudo)+'</button>';
    return h;
  }
  function open(ps){
    if(!window.CL||!CL.sb){toast('Connexion requise');return}
    closeMenu();menuPage='stats';
    sh.innerHTML='<div class="scrim" data-act="mclose"></div><div class="sheet glass stsh" role="dialog" aria-label="Statistiques"><div class="grab"></div><p class="cap">Chargement…</p></div>';
    CL.sb.rpc('profile_stats',{p_pseudo:ps||null}).then(function(r){
      var box=sh.querySelector('.stsh');if(!box||menuPage!=='stats')return;
      if(r.error){box.innerHTML='<div class="shh"><b>Stats</b><button class="gbtn sq" data-act="mclose" aria-label="Fermer">'+ICON.x+'</button></div><p class="cap">'+esc(niceErr(r.error.message))+'</p>';return}
      box.innerHTML='<div class="grab"></div>'+view(r.data);
    },function(){var box=sh.querySelector('.stsh');if(box)box.innerHTML='<p class="cap">Connexion impossible</p>'});
  }
  window.STATS={open:open};
  document.addEventListener('click',function(e){var t=e.target.closest('[data-act]');if(!t)return;
    if(t.dataset.act==='mystats'){e.stopPropagation();open(null)}
    else if(t.dataset.act==='frstats'){e.stopPropagation();open(t.dataset.p)}},true);
})();
