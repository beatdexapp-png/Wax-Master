// Filme de vrais passages de waxdrop.fr, avec les vraies pochettes et photos d'artistes.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2] || 'out';
const SITE = 'https://waxdrop.fr/';
const FAMOUS = ['Cherry Pie','Ninho','Jul','Booba','PNL','Damso','SCH','Gazo','Tiakola','Freeze Corleone','Aya Nakamura','Nekfeu','Orelsan','Werenoi','Niska','Hamza','Laylow','Josman','Maes','Kaaris','Drake','Travis Scott','Kendrick Lamar','Central Cee','Future','Playboi Carti','21 Savage','Lil Baby','Dave','Stormzy','Gims','Leto','Zola','Soolking','Koba LaD','Plk','Rsko','Lacrim','La Fouine','Rohff'];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  await ctx.addInitScript(() => { window.__slow = 1; const st = window.setTimeout.bind(window), si = window.setInterval.bind(window); window.setTimeout = (f, d, ...a) => st(f, (d || 0) * window.__slow, ...a); window.setInterval = (f, d, ...a) => si(f, (d || 0) * window.__slow, ...a); });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('pageerror', e.message));
  p.on('response', r => { const u = r.url(); if (/mzstatic|coverartarchive|scdn|wikimedia/.test(u) && r.status() >= 400) console.log('IMGFAIL', r.status(), u.slice(0, 160)) });
  p.on('requestfailed', r => { const u = r.url(); if (/mzstatic|coverartarchive|scdn|wikimedia/.test(u)) console.log('IMGREQFAIL', r.failure() && r.failure().errorText, u.slice(0, 160)) });
  await p.route('**/*supabase.co/**', r => /\/rpc\/catalog_dump2|\/functions\/v1\/preview/.test(r.request().url()) ? r.continue() : r.abort());
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
    const cs = [byT('PNL', 'Au DD', 2), byT('Ninho', 'Jefe', 3), byT('Freeze Corleone', 'Tse Chi Lop', 4), CARDS.find(c => c.a === 'Cherry Pie' && c.r === 5) || pick(['PNL'], 5), byT('So La Lune', 'Numéro 11', 3)];
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


  console.log('PVLOG has PV', await p.evaluate(() => typeof PV + ' ' + typeof SFX.crack + ' tab=' + tab));

  p.on('console', m => { if (/PVLOG/.test(m.text())) console.log(m.text()) });
  const center = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width] }, sel);
  async function wobble(cx, cy, r, ms) { const n = Math.round(ms / 60); for (let k = 0; k <= n; k++) { const a = k / n * Math.PI * 2; await p.mouse.move(cx + Math.sin(a) * r, cy + Math.sin(a * 2) * r * .6); await sleep(60) } }
  async function shot(name, fn, scrolls) { await fn(); await p.waitForTimeout(1800); await waitImgs(); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/' + name + '.png' });
    for (let k = 0; k < (scrolls || 0); k++) { await p.mouse.move(195, 600); for (let j = 0; j < 3; j++) { await p.mouse.wheel(0, 170); await p.waitForTimeout(120) } await p.waitForTimeout(700); await p.screenshot({ path: OUT + '/' + name + '_' + (k + 2) + '.png' }) } console.log('shot', name) }
  async function reset() { await p.evaluate(() => { try { closeOv() } catch (e) { } try { closeMenu() } catch (e) { } try { document.getElementById('dd').innerHTML = '' } catch (e) { } reveal = null; ov.innerHTML = ''; stack = []; renderStack(); setTab('ouvrir') }); await sleep(800) }
  const fev = await p.evaluate(() => { const c = CARDS.find(c => c.a === 'La Fève' && c.t === 'BLACKOUT') || CARDS.find(c => c.a === 'La Fève' && c.alk === 'al-sp-1hvfxqZg3KcDfAxSrB1XXv'); window.__fev = c; return c ? [c.id, c.t, c.r, c.img] : null });
  console.log('PVLOG fev', JSON.stringify(fev));
  await p.evaluate(() => { CL.user = CL.user || { id: 'demo' }; S.top = ARTISTS.filter(A => A.n === 'La Fève').map(A => A.key); S.evp = { 14: 11 }; S.evc = { 14: [0] }; render() }); await sleep(800);
  await p.evaluate(() => { const c = window.__fev; const im = new Image(); im.src = c.img; }); await sleep(2500);
  // 1. drop FINIS-LES
  await clip('fev', async () => {
    await p.evaluate(() => { const c = window.__fev; delete S.owned[c.id]; reveal = { res: [{ c, isNew: true, sp: null }], i: 0, lv: 0, ul: [], gain: 0, stage: 'seal', secret: false, kind: 'std', base: new Set() }; showOpening() });
    await sleep(600);
    for (let k = 0; k < 220; k++) { const st = await p.evaluate(() => { if (!reveal || reveal.stage === 'sum') return 'end'; if (reveal.stage === 'shown' && !A.busy) return 'end'; if (!A.busy) { opTap(); return 'tap' } return 'busy' }); if (st === 'end') break; await sleep(st === 'tap' ? 240 : 90) }
    await sleep(1000); const c = await center('.rvw .rsq'); if (c) await wobble(c[0], c[1], c[2] * .35, 2000); await sleep(600) });
  await reset();
  // 2. accueil : événement + label
  await p.evaluate(() => setTab('collection')); await sleep(400);
  await shot('home', async () => { await p.evaluate(() => setTab('ouvrir')) });
  // 3. événements
  await shot('events', async () => { await p.evaluate(() => evSheet()) }, 1);
  await reset();
  // 4. label (démo)
  await shot('label', async () => { await p.evaluate(() => { const top = [{ id: 1, name: 'Cloud Gang', tag: 'CLOU', color: '#7c5cff', n: 8, w: 6400 }, { id: 2, name: 'Rive Gauche', tag: 'RIVE', color: '#ff5f86', n: 5, w: 4100 }, { id: 3, name: 'Nuit Blanche', tag: 'NUIT', color: '#ffc23d', n: 12, w: 3900 }];
      CL.sb.rpc = async () => ({ data: { label: { id: 1, name: 'Cloud Gang', tag: 'CLOU', color: '#7c5cff', code: 'K7Q2ZP', pts: 18400, week: 6400, rank: 1, owner: true, claimed: [0], members: [{ uid: 'a', pseudo: 'Toi', role: 'owner', me: true, week: 2600, pts: 7400 }, { uid: 'b', pseudo: 'Nino', week: 1900, pts: 5100 }, { uid: 'c', pseudo: 'Sacha', week: 1200, pts: 3300 }, { uid: 'd', pseudo: 'Ilyes', week: 700, pts: 2600 }] }, top } }); LABEL.open() }) }, 1);
  await reset();
  // 5. missions
  await p.evaluate(() => { const d = day(); d.open = 2; d.topA = 1; d.rare = 2; d.evc = 1; }); 
  await shot('missions', async () => { await p.evaluate(() => { setTab('shop'); shopSub = 'saison'; render() }) });
  // 6. succès (démo)
  await shot('ach', async () => { await p.evaluate(() => { const L = [['drop','pk10','Premiers pas','Ouvre 10 drops',10,10,100,1],['drop','pk100','Habitué','Ouvre 100 drops',100,64,500,0],['rar','myth1','Mythique','Obtiens un son Mythique',1,1,300,0],['rar','div1','Touché par la grâce','Obtiens un son Divin',1,0,500,0],['ev','ev1','Tête d\'affiche','Termine le défi d\'un événement',1,1,400,0],['lbl','lb1','Signé','Rejoins ou crée un label',1,1,150,1],['lbl','lb10k','Label en vue','Ton label atteint 10 000 points',10000,6400,800,0],['alb','alb10','Collectionneur','Complète 10 albums',10,4,1200,0]];
      ACH.list = L.map(x => ({ cat: x[0], k: x[1], t: x[2], d: x[3], n: x[4], v: x[5], r: x[6], got: !!x[7] })); setTab('shop'); shopSub = 'succes'; render() }) });
  // 7. collection : vue Sons, doubles
  await p.evaluate(() => { CARDS.filter(c => own(c.id) && c.img).slice(0, 400).forEach((c, i) => { if (i % 3 === 0) S.owned[c.id] = 2 + (i % 2) }); colView = 'sons'; sonsF = 'all'; setTab('collection') }); await waitImgs(); await sleep(600); await p.evaluate(() => setTab('ouvrir')); await sleep(400);
  await shot('sons', async () => { await p.evaluate(() => { setTab('collection'); sonsF = 'dup'; render() }) });
  // 8. boîte à idées
  await reset();
  await shot('idee', async () => { await p.evaluate(() => openMenu('idee')); await p.waitForTimeout(900); try { await p.click('#fbf textarea', { timeout: 1500 }) } catch (e) { } await p.keyboard.type('Un mode duel entre potes') });
  await b.close();
})();
