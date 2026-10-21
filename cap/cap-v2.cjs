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

  // préparation : collection presque complète, il manque des tubes connus, des doubles à recycler
  const prep = await p.evaluate(() => {
    const FAM = ['Ninho','Jul','Gazo','Tiakola','PNL','Damso','SCH','Freeze Corleone','Booba','Aya Nakamura','Werenoi','Niska','Hamza','Josman','Laylow','Travis Scott','Drake','Central Cee','So La Lune','Nekfeu','Orelsan','Plk'];
    CARDS.forEach(c => { if (FAM.includes(c.a)) S.owned[c.id] = 1 });
    const hits = CARDS.filter(c => FAM.includes(c.a) && c.img && c.r >= 1 && c.r <= 3).sort((a, b) => (b.s || 0) - (a.s || 0)).slice(0, 16);
    hits.forEach(c => delete S.owned[c.id]);
    window.__miss = new Set(hits.map(c => c.id));
    // l'atelier ne liste que les sons manquants des artistes connus
    const keep = new Set(hits.map(c => c.id)); CARDS.forEach(c => { if (!keep.has(c.id) && !own(c.id)) S.owned[c.id] = 1 });
    CARDS.filter(c => FAM.includes(c.a) && c.img && own(c.id)).slice(0, 14).forEach((c, i) => S.owned[c.id] = 2 + (i % 3));
    S.dust = 5200; S.styles = ['Rap', 'R&B']; S.top = ARTISTS.filter(A => ['Ninho','Gazo','So La Lune','PNL','Jul'].includes(A.n)).map(A => A.key);
    // un album à compléter avec la dernière carte
    const B = ALBUMS.find(B => B.a === 'Gazo' && B.img && B.ids.length >= 6) || ALBUMS.find(B => B.a === 'Ninho' && B.img && B.ids.length >= 6);
    const last = B.ids.map(id => C[id]).sort((a, b) => b.r - a.r)[0];
    B.ids.forEach(id => S.owned[id] = 1); delete S.owned[last.id];
    window.__alb = { B: B.key, last: last.id };
    save && save(); render();
    return { hits: hits.map(c => c.a + ' - ' + c.t), alb: B.a + ' / ' + B.t + ' -> ' + last.t + ' r' + last.r };
  });
  console.log(JSON.stringify(prep));
  const sl = await p.evaluate(() => { const c = CARDS.find(c => c.a === 'So La Lune' && c.t === 'Numéro 11'); return c ? [c.id, c.r, !!c.img] : null });
  console.log('numero11', JSON.stringify(sl));
  // 1. atelier : les sons manquants, puis on en crée un
  await p.evaluate(() => { atR = -1; atelier() }); await waitImgs(); await sleep(1500); await p.evaluate(() => closeMenu()); await sleep(400);
  await clip('atelier', async () => { await p.evaluate(() => { atR = -1; atelier() }); await sleep(1600); await p.mouse.move(195, 600); for (let k = 0; k < 5; k++) { await p.mouse.wheel(0, 120); await sleep(150) } await sleep(700); });
  await clip('craft', async () => { await p.evaluate(() => { const id = [...window.__miss][0]; craft(id) }); await sleep(5200); });
  await p.evaluate(() => { try { closeOv() } catch (e) { } try { closeMenu() } catch (e) { } reveal = null; ov.innerHTML = ''; render() }); await sleep(600);
  // 2. recyclage des doubles
  await p.evaluate(() => recySheet()); await waitImgs(); await sleep(1200); await p.evaluate(() => closeMenu()); await sleep(400);
  await clip('recy', async () => { await p.evaluate(() => recySheet()); await sleep(1800); await p.evaluate(() => { const b = document.querySelector('[data-act="recyall"]'); if (b) b.click() }); await sleep(2600); });
  await p.evaluate(() => { try { closeMenu() } catch (e) { } try { closeDD() } catch (e) { } render() }); await sleep(600);
  // 3. recherche dans le catalogue
  await p.evaluate(() => { catQ = 'so la lune'; stack = [{ type: 'cat' }]; renderStack() }); await waitImgs(); await sleep(1000); await p.evaluate(() => { catQ = ''; stack = []; renderStack() }); await sleep(400);
  await clip('search', async () => { await p.evaluate(() => { catQ = ''; stack = [{ type: 'cat' }]; renderStack() }); await sleep(900);
    await p.click('#cq'); for (const ch of 'so la lune') { await p.keyboard.type(ch); await sleep(110) } await sleep(1400); });
  await p.evaluate(() => { const A = ARTISTS.find(a => a.n === 'So La Lune'); stack = [{ type: 'artist', k: A.key }]; renderStack() }); await waitImgs(); await sleep(1500); await p.evaluate(() => { stack = []; renderStack() }); await sleep(400);
  await clip('artSLL', async () => { await p.evaluate(() => { const A = ARTISTS.find(a => a.n === 'So La Lune'); stack = [{ type: 'artist', k: A.key }]; renderStack() }); await sleep(1800); for (let k = 0; k < 6; k++) { await p.mouse.wheel(0, 120); await sleep(140) } await sleep(700); });
  await p.evaluate(() => { stack = []; renderStack() }); await sleep(400);
  // 4. profil : styles + top du moment
  await p.evaluate(() => setTab('profil')); await waitImgs(); await sleep(1200); await p.evaluate(() => setTab('ouvrir')); await sleep(500);
  await clip('prof', async () => { await p.evaluate(() => setTab('profil')); await sleep(2600); });
  // 5. boutique des drops
  await p.evaluate(() => { setTab('shop'); shopSub = 'jetons'; jetSub = 'packs'; render() }); await waitImgs(); await sleep(1200); await p.evaluate(() => { setTab('ouvrir') }); await sleep(500);
  await clip('drops', async () => { await p.evaluate(() => { setTab('shop'); shopSub = 'jetons'; jetSub = 'packs'; render() }); await sleep(2200); await p.mouse.move(195, 600); for (let k = 0; k < 5; k++) { await p.mouse.wheel(0, 140); await sleep(160) } await sleep(800); });
  // 6. ouverture : la dernière carte qui complète l'album
  await p.evaluate(() => setTab('ouvrir')); await sleep(500);
  await clip('albfull', async () => {
    await p.evaluate(() => {
      const c = C[window.__alb.last], B = RW[window.__alb.B];
      reveal = { res: [{ c, isNew: true, sp: null }], i: 0, lv: 0, ul: [], gain: 0, stage: 'seal', secret: false, kind: 'std', base: new Set(B.ids.filter(id => id !== c.id)) };
      showOpening();
    });
    await sleep(700);
    for (let k = 0; k < 200; k++) {
      const st = await p.evaluate(() => { if (!reveal || reveal.stage === 'sum') return 'end'; if (reveal.stage === 'shown' && !A.busy) return 'end'; if (!A.busy) { opTap(); return 'tap' } return 'busy' });
      if (st === 'end') break;
      await sleep(st === 'tap' ? 260 : 90);
    }
    await sleep(2200);
  });
  await b.close();
})();
