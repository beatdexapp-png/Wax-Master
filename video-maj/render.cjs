const { chromium } = require('playwright');const fs=require('fs');
(async()=>{const D=process.argv[2],only=process.argv[3];const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1080,height:1920}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8767/'+(process.env.V||'video.html')+'');await p.evaluate(()=>window.ready);const T=await p.evaluate(()=>TOTAL);
const out=D+'/'+(only?'chk':'fr');fs.mkdirSync(out,{recursive:true});const fps=30,N=Math.round(T*fps);
const list=only?only.split(',').map(Number):[...Array(N).keys()];
for(const f of list){const d=await p.evaluate(async t=>{await draw(t);return document.getElementById('c').toDataURL('image/jpeg',.9)},f/fps);
 fs.writeFileSync(out+'/'+String(f).padStart(4,'0')+'.jpg',Buffer.from(d.split(',')[1],'base64'))}
console.log(errs.join('\n')||'ok',T);await b.close()})();
