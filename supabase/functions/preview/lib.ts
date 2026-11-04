// Recherche d'un extrait de 30 s pour un son : Deezer d'abord, iTunes (Apple) en secours.
// Sans dépendance à Deno, pour pouvoir être testé avec Node (tests/preview-lib.test.mjs).

export type Found = { src: "dz" | "it"; dz: number | null; url: string; link: string; title: string; artist: string };
export class Busy extends Error {}

export const norm = (s: string) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/\(.*?\)|\[.*?\]/g, "").replace(/feat\..*$/, "").replace(/[^a-z0-9]/g, "");

// Deezer répond 200 même quand il refuse (quota dépassé) : on le détecte pour ne pas enregistrer « pas d'extrait » à tort.
async function dz(path: string, f: typeof fetch) {
  const r = await f("https://api.deezer.com" + path);
  if (r.status === 429 || r.status >= 500) throw new Busy("deezer " + r.status);
  if (!r.ok) return null;
  const j = await r.json();
  if (j && j.error) { if (j.error.code === 4 || j.error.code === 700) throw new Busy("deezer quota"); return null; }
  return j;
}

function pick(list: any[], t: string, a: string, title: (x: any) => string, artist: (x: any) => string) {
  const want = norm(t), wa = norm(a);
  if (!want || !wa) return null;
  return list.find((x) => norm(title(x)) === want && norm(artist(x)) === wa)
    || list.find((x) => norm(title(x)) === want && norm(artist(x)).includes(wa.slice(0, 5)))
    || list.find((x) => norm(title(x)).startsWith(want) && norm(artist(x)) === wa)
    || null;
}

export async function fromDeezer(a: string, t: string, f: typeof fetch = fetch): Promise<Found | null> {
  const clean = t.replace(/\(.*?\)|\[.*?\]/g, "").trim();
  const tries = [
    `artist:"${a}" track:"${clean}"`,
    `${a} ${clean}`,
    `track:"${clean}"`,
  ];
  const want = norm(t), wa = norm(a), seen = new Set<number>();
  for (const q of tries) {
    const s = await dz(`/search?q=${encodeURIComponent(q)}&limit=25`, f);
    const list = s?.data || [];
    const x = pick(list, t, a, (y) => y.title, (y) => y.artist?.name);
    if (x && x.preview) return { src: "dz", dz: x.id, url: x.preview, link: x.link, title: x.title, artist: x.artist?.name };
    // featuring : la carte porte le nom de l'invité (SOBAD de Gazo avec Tiakola). Même titre exact, et l'artiste dans les participants du morceau.
    for (const y of list.filter((y: any) => norm(y.title) === want && y.preview && !seen.has(y.id)).slice(0, 3)) {
      seen.add(y.id);
      const tr = await dz(`/track/${y.id}`, f);
      if ((tr?.contributors || []).some((c: any) => norm(c.name) === wa)) return { src: "dz", dz: y.id, url: y.preview, link: y.link, title: y.title, artist: y.artist?.name };
    }
  }
  return null;
}

// Les extraits Apple ne sont pas signés : le lien ne périme pas.
export async function fromItunes(a: string, t: string, f: typeof fetch = fetch): Promise<Found | null> {
  const clean = t.replace(/\(.*?\)|\[.*?\]/g, "").trim();
  for (const country of ["FR", "US"]) {
    const r = await f(`https://itunes.apple.com/search?term=${encodeURIComponent(a + " " + clean)}&entity=song&limit=25&country=${country}`);
    if (r.status === 403 || r.status === 429 || r.status >= 500) throw new Busy("itunes " + r.status);
    if (!r.ok) continue;
    const j = await r.json();
    const x = pick(j?.results || [], t, a, (y) => y.trackName, (y) => y.artistName);
    if (x && x.previewUrl) return { src: "it", dz: null, url: x.previewUrl, link: x.trackViewUrl, title: x.trackName, artist: x.artistName };
  }
  return null;
}

export async function find(a: string, t: string, f: typeof fetch = fetch): Promise<Found | null> {
  let busy: Error | null = null;
  try { const d = await fromDeezer(a, t, f); if (d) return d; } catch (e) { if (e instanceof Busy) busy = e; else throw e; }
  const i = await fromItunes(a, t, f);
  if (i) return i;
  if (busy) throw busy; // Deezer n'a pas pu répondre : on ne conclut pas à « pas d'extrait »
  return null;
}

// Lien Deezer signé : encore valable au moins `marge` ms ?
export function fresh(u: string | null, marge = 600000) {
  if (!u) return false;
  const m = u.match(/exp=(\d+)/);
  return !m || +m[1] * 1000 > Date.now() + marge;
}
