// Filme de vrais passages de waxdrop.fr, avec les vraies pochettes et photos d'artistes.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2] || 'out';
const SITE = 'https://waxdrop.fr/';
const FAMOUS = ['Cherry Pie','Ninho','Jul','Booba','PNL','Damso','SCH','Gazo','Tiakola','Freeze Corleone','Aya Nakamura','Nekfeu','Orelsan','Werenoi','Niska','Hamza','Laylow','Josman','Maes','Kaaris','Drake','Travis Scott','Kendrick Lamar','Central Cee','Future','Playboi Carti','21 Savage','Lil Baby','Dave','Stormzy','Gims','Leto','Zola','Soolking','Koba LaD','Plk','Rsko','Lacrim','La Fouine','Rohff'];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: 'fr-FR' });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.route('**/*supabase.co/**', r => r.request().url().includes('/rpc/catalog_dump2') ? r.continue() : r.abort());
  // 1er passage : le catalogue est téléchargé et rangé, 2e passage : il est chargé au démarrage
  await p.goto(SITE); await p.waitForTimeout(25000);
  await p.reload(); await p.waitForFunction(() => window.CARDS && CARDS.length > 20000, null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(3000);
  console.log('cards', await p.evaluate(() => CARDS.length), 'artists', await p.evaluate(() => ARTISTS.length));
  await p.addStyleTag({ content: '#inst,#gate{display:none!important}' });
  const info = await p.evaluate((FAMOUS) => {
    const g = document.getElementById('gate'); if (g) g.hidden = true;
    const fam = ARTISTS.filter(A => FAMOUS.includes(A.n));
    fam.forEach((A, i) => A.ids.forEach((id, k) => { if ((k + i) % 3 !== 0) S.owned[id] = 1 }));
    S.coins = 2480; S.dust = 1340; S.set.lite = false; render();
    const pick = (names, r) => { for (const n of names) { const c = CARDS.find(c => c.a === n && c.r === r && c.img); if (c) return c } return CARDS.find(c => c.r === r && c.img) };
    const cs = [pick(['Damso','Jul','SCH','Gazo'], 2), pick(['Ninho','Freeze Corleone','Tiakola','Werenoi'], 3), pick(['Booba','PNL','Gazo','Niska'], 4), CARDS.find(c => c.a === 'Cherry Pie' && c.r === 5) || pick(['PNL'], 5)];
    cs.forEach(c => delete S.owned[c.id]);
    window.__cs = cs;
    const urls = new Set();
    fam.forEach(A => { if (A.img) urls.add(A.img); A.albums.forEach(k => { const B = RW[k]; if (B && B.img) urls.add(B.img) }) });
    cs.forEach(c => { if (c.img) urls.add(c.img) });
    ARTISTS.slice().sort((a, b) => a.n.localeCompare(b.n)).slice(0, 60).forEach(A => { if (A.img) urls.add(A.img) });
    return { cs: cs.map(c => c && [c.a, c.t, c.r, !!c.img]), urls: [...urls] };
  }, FAMOUS);
  console.log(JSON.stringify(info.cs), 'images', info.urls.length);
  // on attend que toutes les images soient chargées
  await p.evaluate(urls => Promise.race([Promise.all(urls.map(u => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = u }))), new Promise(r => setTimeout(r, 30000))]), info.urls);
  await p.waitForTimeout(1500);
  const cdp = await ctx.newCDPSession(p);
  let frames = [], rec = false;
  cdp.on('Page.screencastFrame', async f => { if (rec) frames.push({ t: f.metadata.timestamp, d: f.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch (e) { } });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 780, maxHeight: 1688, everyNthFrame: 1 });
  const sleep = ms => p.waitForTimeout(ms);
  async function clip(name, fn) {
    frames = []; rec = true; await fn(); rec = false;
    const dir = OUT + '/' + name; fs.mkdirSync(dir, { recursive: true });
    if (!frames.length) { console.log(name, 'no frames'); return }
    const t0 = frames[0].t, t1 = frames[frames.length - 1].t; const n = Math.floor((t1 - t0) * 30); let j = 0;
    for (let k = 0; k <= n; k++) { const t = t0 + k / 30; while (j + 1 < frames.length && frames[j + 1].t <= t) j++; fs.writeFileSync(dir + '/' + String(k).padStart(4, '0') + '.jpg', Buffer.from(frames[j].d, 'base64')) }
    await p.screenshot({ path: OUT + '/' + name + '.png' });
    console.log(name, frames.length, 'raw ->', n + 1, 'frames', (t1 - t0).toFixed(1) + 's');
  }
  const waitImgs = () => p.evaluate(() => new Promise(r => { const urls = new Set(); document.querySelectorAll('*').forEach(e => { const m = getComputedStyle(e).backgroundImage.match(/url\("([^"]+)"\)/g); if (m) m.forEach(u => urls.add(u.slice(5, -2))) }); document.querySelectorAll('img').forEach(i => urls.add(i.src)); Promise.all([...urls].map(u => new Promise(q => { const i = new Image(); i.onload = i.onerror = q; i.src = u }))).then(r); setTimeout(r, 15000) }));
  // écrans préparés hors enregistrement pour que les images soient déjà là
  await p.evaluate(() => { colView = 'bulles'; setTab('collection') }); await waitImgs(); await sleep(1500);
  await clip('col', async () => { await p.evaluate(() => { setTab('ouvrir') }); await sleep(300); await p.evaluate(() => { setTab('collection') }); await sleep(3500); });
  await p.evaluate(() => { stack = [{ type: 'cat' }]; renderStack() }); await waitImgs(); await sleep(1500);
  await p.evaluate(() => { stack = []; renderStack() }); await sleep(400);
  await clip('cat', async () => { await p.evaluate(() => { stack = [{ type: 'cat' }]; renderStack() }); await sleep(1300); for (let k = 0; k < 14; k++) { await p.mouse.wheel(0, 150); await sleep(130) } await sleep(1200); });
  await p.evaluate(() => { const A = ARTISTS.find(a => a.n === 'Cherry Pie'); stack = [{ type: 'artist', k: A.key }]; renderStack() }); await waitImgs(); await sleep(1500);
  await p.evaluate(() => { stack = []; renderStack() }); await sleep(400);
  await clip('artist', async () => { await p.evaluate(() => { const A = ARTISTS.find(a => a.n === 'Cherry Pie'); stack = [{ type: 'artist', k: A.key }]; renderStack() }); await sleep(3000); });
  await p.evaluate(() => { stack = []; renderStack() }); await sleep(400);
  await clip('shop', async () => { await p.evaluate(() => { setTab('shop'); shopSub = 'hub'; render() }); await sleep(2800); });
  await clip('home', async () => { await p.evaluate(() => { setTab('ouvrir') }); await sleep(2800); });
  await clip('open', async () => {
    await p.evaluate(() => {
      const cs = window.__cs;
      reveal = { res: cs.map(c => ({ c, isNew: true, sp: null })), i: 0, lv: 0, ul: [], gain: 0, stage: 'seal', secret: false, kind: 'std', base: new Set() };
      reveal.res[1].sp = { at: 1, kind: 'vhs' };
      showOpening();
    });
    await sleep(700);
    for (let k = 0; k < 500; k++) {
      const st = await p.evaluate(() => { if (!reveal || reveal.stage === 'sum') return 'end'; if (!A.busy) { opTap(); return 'tap' } return 'busy' });
      if (st === 'end') break;
      await sleep(st === 'tap' ? (k % 1 === 0 ? 450 : 260) : 90);
    }
    await sleep(2000);
  });
  await b.close();
})();
