/* WaxDrop : partager son dernier drop en image (story 1080 x 1920) */
(function(){
  function load(src){return new Promise(function(ok){if(!src)return ok(null);var i=new Image();i.crossOrigin='anonymous';i.decoding='async';
    var t=setTimeout(function(){ok(null)},4000);i.onload=function(){clearTimeout(t);ok(i)};i.onerror=function(){clearTimeout(t);ok(null)};i.src=src})}
  function rr(x,c,X,Y,W,H,R){x.beginPath();x.moveTo(X+R,Y);x.arcTo(X+W,Y,X+W,Y+H,R);x.arcTo(X+W,Y+H,X,Y+H,R);x.arcTo(X,Y+H,X,Y,R);x.arcTo(X,Y,X+W,Y,R);x.closePath()}
  function wrap(x,t,max){var w=t.split(' '),l=[],cur='';w.forEach(function(s){var n=cur?cur+' '+s:s;if(x.measureText(n).width>max&&cur){l.push(cur);cur=s}else cur=n});if(cur)l.push(cur);return l.slice(0,2)}
  async function draw(c,withImg){
    var W=1080,H=1920,cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=cv.getContext('2d');var R=RAR[c.r];
    var g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#14121c');g.addColorStop(1,'#07070b');x.fillStyle=g;x.fillRect(0,0,W,H);
    var rg=x.createRadialGradient(W/2,820,40,W/2,820,900);rg.addColorStop(0,R.c+'aa');rg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=rg;x.fillRect(0,0,W,H);
    /* rayons */
    x.save();x.translate(W/2,820);x.globalAlpha=.035;x.fillStyle='#fff';for(var i=0;i<24;i++){x.rotate(Math.PI*2/24);x.beginPath();x.moveTo(0,0);x.lineTo(-26,-1300);x.lineTo(26,-1300);x.fill()}x.restore();
    /* vinyle derrière la pochette */
    x.save();x.translate(W/2+170,820);x.fillStyle='#0d0d12';x.beginPath();x.arc(0,0,330,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=2;for(var k=120;k<330;k+=14){x.beginPath();x.arc(0,0,k,0,7);x.stroke()}x.fillStyle=R.c;x.beginPath();x.arc(0,0,90,0,7);x.fill();x.restore();
    /* pochette */
    var S2=600,X=W/2-S2/2-60,Y=820-S2/2;x.save();x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=60;x.shadowOffsetY=30;rr(x,0,X,Y,S2,S2,36);x.fillStyle='#22202c';x.fill();x.restore();
    var im=withImg?await load(c.img):null;
    x.save();rr(x,0,X,Y,S2,S2,36);x.clip();
    if(im){x.drawImage(im,X,Y,S2,S2)}else{var cg=x.createLinearGradient(X,Y,X+S2,Y+S2);cg.addColorStop(0,R.c);cg.addColorStop(1,'#1b1a24');x.fillStyle=cg;x.fillRect(X,Y,S2,S2);x.fillStyle='rgba(255,255,255,.85)';for(var b=0;b<26;b++){var hh=40+Math.abs(Math.sin(b*1.7+c.t.length))*180;x.fillRect(X+60+b*19,Y+S2/2-hh/2,9,hh)}}
    x.restore();x.lineWidth=6;x.strokeStyle=R.c;rr(x,0,X,Y,S2,S2,36);x.stroke();
    /* textes */
    x.textAlign='center';x.fillStyle='rgba(255,255,255,.7)';x.font='600 44px Geist, system-ui, sans-serif';x.fillText('Je viens de drop',W/2,300);
    x.font='800 64px "Bricolage Grotesque", system-ui, sans-serif';x.fillStyle='#fff';x.fillText('WaxDrop',W/2,380);
    var pill=R.n.toUpperCase();x.font='800 40px "Geist Mono", ui-monospace, monospace';var pw=x.measureText(pill).width+80;rr(x,0,W/2-pw/2,1180,pw,78,39);x.fillStyle=R.c;x.fill();x.fillStyle='#120d02';x.fillText(pill,W/2,1233);
    x.fillStyle='#fff';x.font='800 92px "Bricolage Grotesque", system-ui, sans-serif';var L=wrap(x,c.t,940);L.forEach(function(l,i){x.fillText(l,W/2,1380+i*100)});
    x.fillStyle='rgba(255,255,255,.75)';x.font='600 54px Geist, system-ui, sans-serif';x.fillText(c.a,W/2,1380+L.length*100+20);
    x.fillStyle='rgba(255,255,255,.55)';x.font='600 40px "Geist Mono", ui-monospace, monospace';x.fillText('waxdrop.fr',W/2,1810);
    return new Promise(function(ok,ko){try{cv.toBlob(function(b){b?ok(b):ko(new Error('blob'))},'image/png')}catch(e){ko(e)}});
  }
  window.shareCard=async function(c){
    if(!c)return;toast('Préparation de l’image…');
    var blob;try{blob=await draw(c,true)}catch(e){try{blob=await draw(c,false)}catch(e2){blob=null}}
    var text='Je viens de drop '+c.t+' de '+c.a+' ('+RAR[c.r].n+') sur WaxDrop',url='https://waxdrop.fr';
    try{
      if(blob){var f=new File([blob],'waxdrop-'+(c.t||'drop').replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.png',{type:'image/png'});
        if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text:text+' '+url});return}}
      if(navigator.share){await navigator.share({text:text,url:url});return}
    }catch(e){if(e&&e.name==='AbortError')return}
    if(blob){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='waxdrop.png';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},5000);toast('Image enregistrée')}
    else{try{await navigator.clipboard.writeText(text+' '+url);toast('Texte copié')}catch(_){toast(text)}}
  };
  /* remplace l'ancien partage : la meilleure carte du dernier drop */
  window.share=function(){var R=(typeof reveal!=='undefined')?reveal:null;var c=null;if(R&&R.res&&R.res.length)c=R.res.slice().sort(function(a,b){return b.c.r-a.c.r})[0].c;else if(S.lastDrop&&C[S.lastDrop])c=C[S.lastDrop];if(c)shareCard(c);else toast('Ouvre un drop d’abord')};
})();
