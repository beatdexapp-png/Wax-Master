import { createClient } from "jsr:@supabase/supabase-js@2";
import { Busy, find, fresh } from "./lib.ts";

// Extrait officiel de 30 s pour une carte du jeu (Deezer, iTunes en secours).
// Cache en base (track_previews) :
//  - dz renseigné : titre Deezer, l'URL signée (15 min) est redemandée quand il lui reste moins de 10 min ;
//  - dz vide et url renseignée : extrait iTunes, lien permanent ;
//  - dz et url vides : « pas d'extrait », retenté au bout de 3 jours (le catalogue Deezer change, et une erreur passagère ne bloque plus un son pour toujours).
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Content-Type": "application/json" };
const RETRY_NONE = 3 * 864e5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const id = new URL(req.url).searchParams.get("id") || "";
  // un lien signé ne doit pas rester dans le cache du navigateur plus longtemps que sa validité
  const out = (o: unknown, s = 200, cache = "private, max-age=60") => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Cache-Control": cache } });
  const ok = (url: string, link: string, title: string, artist: string, perm = false) => out({ url, link, title, artist }, 200, perm ? "public, max-age=86400" : "private, max-age=60");
  if (!id || id.length > 120) return out({ error: "id" }, 400, "no-store");
  try {
    const { data: c } = await sb.from("track_previews").select("*").eq("card", id).maybeSingle();
    if (c) {
      if (!c.dz && c.url) return ok(c.url, c.link, c.title, c.artist, true);
      if (!c.dz && Date.now() - new Date(c.at).getTime() < RETRY_NONE) return out({ none: true }, 200, "public, max-age=3600");
      if (c.dz) {
        if (fresh(c.url)) return ok(c.url, c.link, c.title, c.artist);
        const r = await fetch("https://api.deezer.com/track/" + c.dz);
        const t = r.ok ? await r.json() : null;
        if (t && t.preview) {
          await sb.from("track_previews").update({ url: t.preview, at: new Date().toISOString() }).eq("card", id);
          return ok(t.preview, t.link, t.title, t.artist?.name);
        }
        if (t && t.error && t.error.code === 4) return out({ error: "busy" }, 503, "no-store");
        // titre retiré de Deezer : on cherche à nouveau ci-dessous
      }
    }
    const { data: card } = await sb.from("cards").select("a,t").eq("id", id).maybeSingle();
    if (!card) return out({ error: "carte" }, 404, "no-store");
    const f = await find(card.a, card.t);
    const now = new Date().toISOString();
    if (!f) { await sb.from("track_previews").upsert({ card: id, dz: null, url: null, link: null, title: null, artist: null, at: now }); return out({ none: true }, 200, "public, max-age=3600"); }
    await sb.from("track_previews").upsert({ card: id, dz: f.dz, url: f.url, link: f.link, title: f.title, artist: f.artist, at: now });
    return ok(f.url, f.link, f.title, f.artist, f.src === "it");
  } catch (e) {
    if (e instanceof Busy) return out({ error: "busy" }, 503, "no-store");
    return out({ error: String((e as Error).message || e) }, 500, "no-store");
  }
});
