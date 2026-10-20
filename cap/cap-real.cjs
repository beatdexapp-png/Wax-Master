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
  await ctx.addInitScript(() => { window.__slow = 1; const st = window.setTimeout.bind(window), si = window.setInterval.bind(window); window.setTimeout = (f, d, ...a) => st(f, (d || 0) * window.__slow, ...a); window.setInterval = (f, d, ...a) => si(f, (d || 0) * window.__slow, ...a); });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('pageerror', e.message));
  p.on('response', r => { const u = r.url(); if (/mzstatic|coverartarchive|scdn|wikimedia/.test(u) && r.status() >= 400) console.log('IMGFAIL', r.status(), u.slice(0, 160)) });
  p.on('requestfailed', r => { const u = r.url(); if (/mzstatic|coverartarchive|scdn|wikimedia/.test(u)) console.log('IMGREQFAIL', r.failure() && r.failure().errorText, u.slice(0, 160)) });
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
    const pick = (names, r) => { const l = CARDS.filter(c => names.includes(c.a) && c.r === r && c.img).sort((a, b) => (b.s || 0) - (a.s || 0)); return l[0] || CARDS.find(c => c.r === r && c.img) };
    const byT = (artist, title, r) => CARDS.find(c => c.a === artist && c.t === title) || pick([artist], r);
    const cs = [byT('PNL', 'Au DD', 2), byT('Ninho', 'Tokarev', 3), byT('Freeze Corleone', 'Tse Chi Lop', 4), CARDS.find(c => c.a === 'Cherry Pie' && c.r === 5) || pick(['PNL'], 5)];
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
  await p.evaluate(async urls => { const t0 = Date.now(); for (let k = 0; k < urls.length && Date.now() - t0 < 60000; k += 6) await Promise.all(urls.slice(k, k + 6).map(u => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = u; setTimeout(r, 8000) }))) }, info.urls);
  await p.waitForTimeout(1500);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Animation.enable');
  const SLOW = 8;
  let cur = 1;
  async function clip(name, fn) {
    // ralenti x8 : animations CSS et minuteries ralenties, captures nettes en 2x, puis remises à vitesse réelle
    cur = SLOW; await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / SLOW }); await p.evaluate(s => window.__slow = s, SLOW);
    const shots = []; let rec = true; const t0 = Date.now();
    const loop = (async () => { while (rec) { const a = Date.now(); const d = await p.screenshot({ type: 'jpeg', quality: 90 }); shots.push({ t: (a - t0) / SLOW / 1000, d }) } })();
    await fn(); rec = false; await loop;
    cur = 1; await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 }); await p.evaluate(() => window.__slow = 1);
    const dir = OUT + '/' + name; fs.mkdirSync(dir, { recursive: true });
    const T = shots[shots.length - 1].t; const n = Math.floor(T * 30); let j = 0;
    for (let k = 0; k <= n; k++) { const t = k / 30; while (j + 1 < shots.length && shots[j + 1].t <= t) j++; fs.writeFileSync(dir + '/' + String(k).padStart(4, '0') + '.jpg', shots[j].d) }
    fs.writeFileSync(OUT + '/' + name + '.png', shots[shots.length - 1].d);
    console.log(name, shots.length, 'shots ->', n + 1, 'frames', T.toFixed(1) + 's');
  }
  const sleep = ms => p.waitForTimeout(ms * cur);
  const waitImgs = () => p.evaluate(() => new Promise(r => { const urls = new Set(); document.querySelectorAll('*').forEach(e => { const m = getComputedStyle(e).backgroundImage.match(/url\("([^"]+)"\)/g); if (m) m.forEach(u => urls.add(u.slice(5, -2))) }); document.querySelectorAll('img').forEach(i => urls.add(i.src)); Promise.all([...urls].map(u => new Promise(q => { const i = new Image(); i.onload = i.onerror = q; i.src = u }))).then(r); setTimeout(r, 15000) }));
  // écrans préparés hors enregistrement pour que les images soient déjà là
  await p.evaluate(() => { colView = 'bulles'; setTab('collection') }); await waitImgs(); await sleep(1500);
  await clip('col', async () => { await p.evaluate(() => { setTab('ouvrir') }); await sleep(300); await p.evaluate(() => { setTab('collection') }); await sleep(3500); });
  for (const [nm, name] of [['Freeze Corleone', 'artFreeze'], ['Ninho', 'artNinho'], ['Cherry Pie', 'artCherry'], ['PNL', 'artPNL']]) {
    await p.evaluate(nm => { const A = ARTISTS.find(a => a.n === nm); stack = [{ type: 'artist', k: A.key }]; renderStack() }, nm); await waitImgs(); await sleep(2000);
    await p.evaluate(() => { stack = []; renderStack() }); await sleep(400);
    await clip(name, async () => { await p.evaluate(nm => { const A = ARTISTS.find(a => a.n === nm); stack = [{ type: 'artist', k: A.key }]; renderStack() }, nm); await sleep(1800); for (let k = 0; k < 6; k++) { await p.mouse.wheel(0, 120); await sleep(140) } await sleep(800); });
  }
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
