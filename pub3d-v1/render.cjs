const { chromium } = require('playwright');const fs=require('fs');
(async()=>{const only=process.argv[2];const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CERR',m.text())});
await p.goto('http://localhost:8768/ad.html');await p.evaluate(()=>window.ready);const T=await p.evaluate(()=>TOTAL);
const out=only?'chk':'fr';fs.mkdirSync(out,{recursive:true});const fps=30,N=Math.round(T*fps);const t0=Date.now();
const part=process.env.PART?process.env.PART.split('/').map(Number):null;let list=only?only.split(',').map(Number):[...Array(N).keys()];if(part)list=list.filter(f=>f%part[1]===part[0]);
for(const f of list){const d=await p.evaluate(async t=>await frame(t),f/fps);fs.writeFileSync(out+'/'+String(f).padStart(4,'0')+'.jpg',Buffer.from(d.split(',')[1],'base64'))}
console.log('ok',list.length,'frames',((Date.now()-t0)/list.length|0)+'ms/frame');await b.close()})();
