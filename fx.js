/* WaxDrop : sons (synthétisés, sans fichier) et animations à ressort (Motion) */
(function(){
  /* ================= SONS ================= */
  var AC=null,master=null,verb=null;
  function on(){return S.set.snd!==false}
  function ctx(){
    if(AC)return AC;
    var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
    try{AC=new C({latencyHint:'interactive'})}catch(e){AC=new C()}master=AC.createGain();master.gain.value=.55;
    var comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;
    master.connect(comp);comp.connect(AC.destination);
    /* petite réverbération pour les grands moments */
    verb=AC.createConvolver();var len=AC.sampleRate*2.2,b=AC.createBuffer(2,len,AC.sampleRate);
    for(var ch=0;ch<2;ch++){var d=b.getChannelData(ch);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
    verb.buffer=b;var vg=AC.createGain();vg.gain.value=.35;verb.connect(vg);vg.connect(master);
    return AC;
  }
  /* iOS : laisse la musique de l'utilisateur continuer, et débloque le son au premier toucher */
  try{if(navigator.audioSession)navigator.audioSession.type='ambient'}catch(e){}
  var primed=false;
  function unlock(){var c=ctx();if(!c)return;if(c.state!=='running')c.resume().catch(function(){});
    if(!primed){primed=true;try{var b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}catch(e){}}}
  ['pointerdown','touchend','click','keydown'].forEach(function(ev){addEventListener(ev,unlock,{passive:true,capture:true})});
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&AC&&AC.state!=='running')AC.resume().catch(function(){})});
  function out(rev){var g=AC.createGain();g.connect(master);if(rev)g.connect(verb);return g}
  function tone(f,t,dur,o){o=o||{};var c=AC;if(!c)return;
    var os=c.createOscillator(),g=c.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);
    if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+(o.slide||dur));
    var v=o.vol||.2,a=o.a||.005;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    os.connect(g);g.connect(out(o.rev));os.start(t);os.stop(t+dur+.05)}
  var NB=null;function nbuf(){if(NB)return NB;var n=AC.sampleRate*1.5;NB=AC.createBuffer(1,n,AC.sampleRate);var d=NB.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;return NB}
  function noise(t,dur,o){o=o||{};var c=AC;if(!c)return;
    var s=c.createBufferSource();s.buffer=nbuf();s.loop=true;var f=c.createBiquadFilter();f.type=o.ft||'lowpass';f.frequency.setValueAtTime(o.f||1200,t);
    if(o.fto)f.frequency.exponentialRampToValueAtTime(o.fto,t+dur);f.Q.value=o.q||.7;
    var g=c.createGain(),v=o.vol||.15;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.a||.01));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(out(o.rev));s.start(t);s.stop(t+dur+.05)}
  function play(fn){if(!on())return;var c=ctx();if(!c)return;var go=function(){try{fn(c.currentTime+.005)}catch(e){}};if(c.state!=='running'){c.resume().then(go,function(){})}else go()}
  var NOTE=function(n){return 440*Math.pow(2,(n-69)/12)};
  var SFX=window.SFX={
    tap:function(){play(function(t){tone(1400,t,.035,{vol:.035,to:900});})},
    unwrap:function(){play(function(t){noise(t,.35,{f:3000,fto:600,vol:.12,ft:'bandpass',q:1.2});tone(220,t+.05,.25,{type:'triangle',vol:.06,to:330})})},
    spin:function(ms,L){play(function(t){var d=ms/1000,top=160+L*170;
      var c=AC,os=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();os.type='sawtooth';os.frequency.setValueAtTime(70,t);os.frequency.exponentialRampToValueAtTime(top,t+d);
      f.type='lowpass';f.frequency.setValueAtTime(400,t);f.frequency.exponentialRampToValueAtTime(800+L*900,t+d);
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(.035+L*.012,t+.03);g.gain.exponentialRampToValueAtTime(.05+L*.025,t+d*.85);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
      os.connect(f);f.connect(g);g.connect(out());os.start(t);os.stop(t+d+.05);
      noise(t,d,{ft:'bandpass',f:500,fto:2500+L*1200,q:2,vol:.03+L*.012,a:d*.8});
      noise(t,.12,{ft:'bandpass',f:1800,fto:600,q:2.5,vol:.18,a:.004});tone(180,t,.15,{type:'triangle',to:260,vol:.08})})},
    spinTap:function(){play(function(t){noise(t,.12,{ft:'bandpass',f:1800,fto:600,q:2.5,vol:.16,a:.004});tone(180,t,.15,{type:'triangle',to:260,vol:.07})})},
    crack:function(){play(function(t){[0,.045,.1,.16].forEach(function(o,i){noise(t+o,.025,{ft:'highpass',f:3500+i*600,vol:.35-i*.05,a:.001})});
      tone(260,t,.28,{type:'sawtooth',to:150,vol:.035});noise(t,.3,{ft:'bandpass',f:900,fto:300,q:3,vol:.06});tone(55,t,.25,{to:40,vol:.25})})},
    shatter:function(){play(function(t){
      /* impact : grosse caisse + souffle */
      tone(150,t,.55,{to:34,slide:.3,vol:.85,a:.002});noise(t,.35,{f:1400,fto:90,vol:.45,a:.002});
      /* la cassure : claquement sec */
      noise(t,.05,{ft:'highpass',f:2800,vol:.7,a:.001});noise(t+.01,.12,{ft:'bandpass',f:5200,fto:2400,q:1.5,vol:.35,a:.001,rev:true});
      /* éclats qui tintent, de plus en plus espacés */
      for(var i=0;i<26;i++){var o=.02+Math.pow(Math.random(),1.7)*.75,f=2400+Math.random()*5200;tone(f,t+o,.05+Math.random()*.14,{type:i%3?'triangle':'sine',vol:.03+Math.random()*.06,a:.001,rev:true,to:f*(.94+Math.random()*.04)})}
      /* débris qui retombent */
      for(var k=0;k<9;k++){var q=.35+Math.random()*.6;noise(t+q,.03,{ft:'bandpass',f:1800+Math.random()*2500,q:4,vol:.07+Math.random()*.06,a:.001})}
      /* traîne brillante */
      noise(t+.03,1.1,{ft:'highpass',f:5500,vol:.07,a:.05,rev:true});tone(NOTE(96),t+.05,.9,{vol:.025,rev:true})})},
    craft:function(){play(function(t){noise(t,1.1,{ft:'bandpass',f:400,fto:5000,q:1.5,vol:.12,a:.8});
      [72,79,84,88,91].forEach(function(n,i){tone(NOTE(n),t+1.0+i*.05,.9,{type:'triangle',vol:.07,rev:true})});tone(120,t+1.0,.4,{to:50,vol:.5})})},
    level:function(L){play(function(t){var base=[0,72,74,76,79,84][L]||72;tone(NOTE(base),t,.25,{type:'triangle',vol:.1});tone(NOTE(base+7),t+.05,.3,{type:'sine',vol:.06,rev:true})})},
    boom:function(L){play(function(t){
      tone(130,t,.7+L*.12,{to:38,slide:.45,vol:.9,a:.003});
      noise(t,.5+L*.1,{f:900,fto:80,vol:.5,a:.002});
      if(L>=4)noise(t,1.2,{ft:'highpass',f:3000,vol:.1,a:.02,rev:true});
      var ch=L>=5?[60,64,67,71,74,79]:L>=4?[62,66,69,74]:[60,67,72];
      ch.forEach(function(n,i){tone(NOTE(n),t+.04+i*.035,1.2+L*.3,{type:i%2?'triangle':'sine',vol:.09,a:.02,rev:true})})})},
    divine:function(){play(function(t){
      [48,55,60,64,67,72,76,79,84].forEach(function(n,i){tone(NOTE(n),t+i*.09,3.2,{type:'sine',vol:.07,a:.25,rev:true});tone(NOTE(n)*1.003,t+i*.09,3.2,{type:'triangle',vol:.03,a:.3,rev:true})});
      [96,100,103,108,103,108,112].forEach(function(n,i){tone(NOTE(n),t+.6+i*.12,.6,{vol:.04,rev:true})})})},
    voidIn:function(){play(function(t){tone(90,t,.6,{to:40,vol:.25,type:'sine'});noise(t,.6,{f:300,fto:60,vol:.15})})},
    reveal:function(r){play(function(t){var seq=[[76],[76,83],[76,80,83],[72,76,79,84],[72,76,79,84,88],[72,76,79,84,88,91]][r]||[76];
      seq.forEach(function(n,i){tone(NOTE(n),t+i*.06,.35+r*.08,{type:r>=3?'triangle':'sine',vol:.07,rev:r>=2})})})},
    scratch:function(){play(function(t){[0,.18,.32,.5].forEach(function(o,i){noise(t+o,.14,{ft:'bandpass',f:i%2?900:2600,fto:i%2?2600:700,q:3,vol:.22})})})},
    needle:function(){play(function(t){noise(t,.05,{ft:'highpass',f:2000,vol:.3});noise(t+.25,.04,{ft:'highpass',f:2500,vol:.25});tone(420,t+.3,.6,{to:90,vol:.08,type:'sawtooth'})})},
    vhs:function(){play(function(t){noise(t,.95,{f:5000,fto:1500,vol:.07,ft:'bandpass',q:.8});var c=AC,o=c.createOscillator(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain();o.type='sawtooth';o.frequency.value=180;l.frequency.value=7;lg.gain.value=14;l.connect(lg);lg.connect(o.frequency);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.95);o.connect(g);g.connect(out());o.start(t);l.start(t);o.stop(t+1);l.stop(t+1)})},
    pixel:function(){play(function(t){[523,659,784,1047,784,1047,1319].forEach(function(f,i){tone(f,t+i*.08,.07,{type:'square',vol:.045})})})},
    lag:function(){play(function(t){for(var i=0;i<6;i++){tone(320,t+i*.11,.04,{type:'square',vol:.05});noise(t+i*.11,.04,{f:2500,vol:.05})}tone(160,t+.75,.3,{type:'sawtooth',vol:.05,to:900})})},
    glitch:function(){play(function(t){for(var i=0;i<9;i++)tone(200+Math.random()*1800,t+i*.07,.05,{type:'square',vol:.04})})},
    bass:function(){play(function(t){for(var i=0;i<4;i++)tone(110,t+i*.26,.22,{to:45,vol:.7,a:.002});noise(t+1.05,.25,{f:6000,fto:400,vol:.12})})},
    coin:function(){play(function(t){tone(NOTE(88),t,.12,{vol:.07});tone(NOTE(93),t+.07,.25,{vol:.07,rev:true})})},
    buy:function(){play(function(t){tone(NOTE(79),t,.1,{type:'triangle',vol:.08});tone(NOTE(86),t+.07,.2,{type:'triangle',vol:.08})})},
    sell:function(){play(function(t){tone(NOTE(86),t,.1,{type:'triangle',vol:.08});tone(NOTE(79),t+.07,.2,{type:'triangle',vol:.08})})},
    flip:function(){play(function(t){noise(t,.16,{ft:'bandpass',f:1200,fto:3800,q:1.4,vol:.06,a:.02});tone(NOTE(84),t+.08,.18,{vol:.03,rev:true})})},
    whoosh:function(){play(function(t){noise(t,.22,{ft:'bandpass',f:500,fto:2200,q:.9,vol:.035,a:.08})})},
    reward:function(){play(function(t){[72,76,79,84,88].forEach(function(n,i){tone(NOTE(n),t+i*.07,.4,{vol:.07,rev:true})})})}
  };

  /* --- branchements sur le jeu --- */
  var SP_T={scratch:700,rewind:850,fake:1350,pulse:1150,blackout:1350,faceb:350,needle:1100,glitch:900,bass:1300,vhs:1000,pixel:950,lag:1100};
  if(typeof unwrap==='function'){var oU=unwrap;window.unwrap=function(){SFX.unwrap();return oU.apply(this,arguments)}}
  if(typeof levelUp==='function'){var oL=levelUp;window.levelUp=function(){
    var R=reveal,from=R?R.lv:0,x=R&&R.res[R.i],sp=x&&x.sp&&x.sp.at===from?x.sp.kind:null;
    var r=oL.apply(this,arguments);var to=reveal?reveal.lv:from+1;
    if(sp){if(sp==='scratch'||sp==='rewind')SFX.scratch();else if(sp==='needle')SFX.needle();else if(sp==='glitch')SFX.glitch();else if(sp==='vhs')SFX.vhs();else if(sp==='pixel')SFX.pixel();else if(sp==='lag')SFX.lag();else if(sp==='bass')SFX.bass();
      setTimeout(function(){if(to>=3)SFX.boom(to);else SFX.level(to)},SP_T[sp]||700)}
    else if(to<3){SFX.spin(Math.max(400,D[to]*.6),to);setTimeout(function(){SFX.level(to)},Math.min(250,D[to]*.3))}
    else{var tB=Math.round(D[to]*.82);SFX.spin(tB,to);
      if(to===5){setTimeout(SFX.voidIn,tB);setTimeout(function(){SFX.boom(5);SFX.divine()},tB+650+1150)}
      else setTimeout(function(){SFX.boom(to)},tB)}
    return r}}
  if(typeof tapPing==='function'){var oT=tapPing;window.tapPing=function(){SFX.spinTap();return oT.apply(this,arguments)}}
  if(typeof shatter==='function'){var oS=shatter;window.shatter=function(){SFX.shatter();return oS.apply(this,arguments)}}
  if(typeof craftAnim==='function'){var oCr=craftAnim;window.craftAnim=function(){SFX.craft();return oCr.apply(this,arguments)}}
  if(typeof revealCard==='function'){var oR=revealCard;window.revealCard=function(){var x=reveal&&reveal.res[reveal.i];var r=oR.apply(this,arguments);if(x)SFX.reveal(x.c.r);return r}}
  if(typeof setCoins==='function'){var oC=setCoins;window.setCoins=function(){var b=typeof coinShown!=='undefined'?coinShown:null;var r=oC.apply(this,arguments);if(b!==null&&S.coins>b)SFX.coin();return r}}
  if(typeof rewardPop==='function'){var oP=rewardPop;window.rewardPop=function(){SFX.reward();return oP.apply(this,arguments)}}
  if(window.ECO&&ECO.op){var oO=ECO.op;ECO.op=async function(op){var r=await oO.apply(this,arguments);if(r){if(op==='bbuy')SFX.buy();else if(op==='bsell')SFX.sell();else if(op==='mission'||op==='season'||op==='pass_daily')SFX.reward()}return r}}
  document.addEventListener('pointerdown',function(e){if(e.target.closest('button,.chip,[role=button]')&&!e.target.closest('#op'))SFX.tap()},{passive:true});
  /* réglage Son dans le menu */
  if(typeof renderMenu==='function'){var oM=renderMenu;window.renderMenu=function(){var r=oM.apply(this,arguments);var lite=sh.querySelector('[data-act="lite"]');
    if(lite&&!sh.querySelector('[data-act="snd"]')){var row=lite.closest('.set');var d=document.createElement('div');d.className='set';d.innerHTML='<b>Sons</b><button class="sw" role="switch" aria-checked="'+on()+'" data-act="snd" aria-label="Sons"></button>';row.parentNode.insertBefore(d,row)}return r}}
  document.addEventListener('click',function(e){var t=e.target.closest('[data-act="snd"]');if(!t)return;e.stopPropagation();S.set.snd=!on();save();t.setAttribute('aria-checked',on());if(on())SFX.reward()},true);

  /* ================= ANIMATIONS À RESSORT (Motion) ================= */
  var M=window.Motion;if(!M||!M.animate)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lite(){return reduce||S.set.lite}
  var SPR={type:'spring',stiffness:420,damping:30};
  document.body.classList.add('mo');
  /* appui : le bouton s'enfonce puis rebondit */
  var PRESS='button,.chip,.hb,.pk,.lr,.arow,.prow,.tpr,.topc,.mcard,.tcell';
  /* l'appui attend un peu : si le doigt fait défiler la liste, rien ne bouge */
  document.addEventListener('pointerdown',function(e){if(lite())return;var el=e.target.closest(PRESS);if(!el||el.disabled||el.closest('#op,#bub,.bb'))return;
    var x0=e.clientX,y0=e.clientY,down=false,done=false;
    var tm=setTimeout(function(){if(done)return;down=true;M.animate(el,{scale:.96},{duration:.1})},e.pointerType==='touch'?70:0);
    var end=function(){if(done)return;done=true;clearTimeout(tm);removeEventListener('pointerup',end);removeEventListener('pointercancel',end);removeEventListener('pointermove',mv);
      if(el.isConnected)M.animate(el,{scale:1},down?{type:'spring',stiffness:600,damping:16}:{duration:.08})};
    var mv=function(ev){if(Math.abs(ev.clientX-x0)+Math.abs(ev.clientY-y0)>8)end()};
    addEventListener('pointerup',end);addEventListener('pointercancel',end);addEventListener('pointermove',mv,{passive:true})},{passive:true});
  /* nouvel écran : les blocs arrivent en cascade */
  var main=document.getElementById('main');
  new MutationObserver(function(){if(lite())return;var v=main.firstElementChild;if(!v||v._mo)return;v._mo=1;if(v._same)return;
    var kids=Array.prototype.slice.call(v.children,0,8);if(!kids.length)return;
    M.animate(kids,{opacity:[0,1],y:[14,0]},{delay:M.stagger(.035),type:'spring',stiffness:380,damping:30})}).observe(main,{childList:true});
  /* fenêtres du bas et pop-ups : ressort */
  function watch(id,sel,kf){var host=document.getElementById(id);if(!host)return;
    new MutationObserver(function(){if(lite())return;var el=host.querySelector(sel);if(!el||el._mo)return;el._mo=1;M.animate(el,kf,SPR)}).observe(host,{childList:true})}
  watch('sh','.sheet',{y:[60,0],opacity:[0,1],scale:[.98,1]});
  window.FX={animate:M.animate,spring:SPR};
})();
