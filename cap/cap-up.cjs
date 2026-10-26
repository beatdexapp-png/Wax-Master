// Filme de vrais passages de waxdrop.fr, avec les vraies pochettes et photos d'artistes.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2] || 'out';
const SITE = 'https://waxdrop.fr/';
const FAMOUS = ['Cherry Pie','Ninho','Jul','Booba','PNL','Damso','SCH','Gazo','Tiakola','Freeze Corleone','Aya Nakamura','Nekfeu','Orelsan','Werenoi','Niska','Hamza','Laylow','Josman','Maes','Kaaris','Drake','Travis Scott','Kendrick Lamar','Central Cee','Future','Playboi Carti','21 Savage','Lil Baby','Dave','Stormzy','Gims','Leto','Zola','Soolking','Koba LaD','Plk','Rsko','Lacrim','La Fouine','Rohff'];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: 'fr-FR' });
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


  console.log('PVLOG has PV', await p.evaluate(() => typeof PV + ' ' + typeof SFX.flip));
  p.on('console', m => { if (/PVLOG/.test(m.text())) console.log(m.text()) });
  async function open(idx, after) {
    await p.evaluate(i => { const c = window.__cs[i]; delete S.owned[c.id];
      reveal = { res: [{ c, isNew: true, sp: null }], i: 0, lv: 0, ul: [], gain: 0, stage: 'seal', secret: false, kind: 'std', base: new Set() }; showOpening() }, idx);
    await sleep(700);
    for (let k = 0; k < 220; k++) {
      const st = await p.evaluate(() => { if (!reveal || reveal.stage === 'sum') return 'end'; if (reveal.stage === 'shown' && !A.busy) return 'end'; if (!A.busy) { opTap(); return 'tap' } return 'busy' });
      if (st === 'end') break;
      await sleep(st === 'tap' ? 260 : 90);
    }
    await after();
  }
  async function wobble(cx, cy, r, ms) { const n = Math.round(ms / 60); for (let k = 0; k <= n; k++) { const a = k / n * Math.PI * 2; await p.mouse.move(cx + Math.sin(a) * r, cy + Math.sin(a * 2) * r * .6); await sleep(60) } }
  const center = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width] }, sel);
  async function reset() { await p.evaluate(() => { try { closeOv() } catch (e) { } try { closeMenu() } catch (e) { } try { document.getElementById('dd').innerHTML = '' } catch (e) { } reveal = null; ov.innerHTML = ''; setTab('ouvrir') }); await sleep(800) }
  await p.evaluate(() => setTab('ouvrir')); await sleep(800);
  // 1. Mythique : révélation, l'extrait se lance, inclinaison + reflet holo
  await clip('myth', () => open(2, async () => { await sleep(1500); const c = await center('.rvw .rsq'); if (c) await wobble(c[0], c[1], c[2] * .35, 3200); await sleep(1500);
    console.log('PVLOG myth badge', await p.evaluate(() => !!document.querySelector('.pvb') + ' live=' + !!document.querySelector('.rsq.live'))) }));
  await reset();
  // 2. Divin : halo tournant
  await clip('divin', () => open(3, async () => { await sleep(1500); const c = await center('.rvw .rsq'); if (c) await wobble(c[0], c[1], c[2] * .3, 2600); await sleep(1200) }));
  await reset();
  // 3. Légendaire So La Lune
  await clip('leg', () => open(4, async () => { await sleep(1200); const c = await center('.rvw .rsq'); if (c) await wobble(c[0], c[1], c[2] * .35, 2400); await sleep(1000) }));
  await reset();
  // 4. fiche d'un son : bouton Extrait
  const sid = await p.evaluate(() => { const c = window.__cs[0]; S.owned[c.id] = 1; return c.id });
  await p.evaluate(id => see(id), sid); await waitImgs(); await sleep(800); await p.evaluate(() => document.getElementById('dd').innerHTML = ''); await sleep(500);
  await clip('see', async () => { await p.evaluate(id => see(id), sid); await sleep(1300); await p.evaluate(() => { const b = document.querySelector('.pvsee'); if (b) b.click() }); await sleep(900);
    const c = await center('#dd .big'); if (c) await wobble(c[0], c[1], c[2] * .35, 2600); await sleep(800) });
  await reset();
  // 5. onglets
  await p.evaluate(() => { colView = 'bulles'; setTab('collection') }); await waitImgs(); await p.evaluate(() => setTab('profil')); await waitImgs(); await p.evaluate(() => setTab('ouvrir')); await sleep(800);
  await clip('tabs', async () => { for (const t of ['collection', 'shop', 'profil', 'ouvrir']) { await p.evaluate(t => setTab(t), t); await sleep(1000) } });
  // 6. menu : réglage Extraits
  await clip('menu', async () => { await p.evaluate(() => openMenu()); await sleep(1800) });
  await b.close();
})();
