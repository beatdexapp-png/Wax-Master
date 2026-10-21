import { createClient } from "jsr:@supabase/supabase-js@2";

// Pont vers l'API Zernio (publication TikTok et autres réseaux).
// La clé Zernio et le jeton d'admin sont dans public.private_cfg (lisible seulement par le service).
// Appel réservé à l'admin : en-tête x-admin égal à private_cfg.zernio_admin.
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const API = "https://zernio.com/api/v1";

async function cfg(k: string) {
  const { data } = await sb.from("private_cfg").select("v").eq("k", k).maybeSingle();
  return data?.v as string | undefined;
}

Deno.serve(async (req) => {
  const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });
  const admin = await cfg("zernio_admin");
  if (!admin || req.headers.get("x-admin") !== admin) return json({ error: "forbidden" }, 403);
  const key = await cfg("zernio_key");
  if (!key) return json({ error: "zernio_key manquante" }, 500);
  const H = { Authorization: "Bearer " + key, "Content-Type": "application/json" };
  const call = async (method: string, path: string, body?: unknown) => {
    const r = await fetch(API + path, { method, headers: H, body: body === undefined ? undefined : JSON.stringify(body) });
    const t = await r.text();
    let d: unknown = t; try { d = JSON.parse(t) } catch (_e) { /* texte */ }
    return { status: r.status, data: d };
  };
  let p: any = {};
  try { p = await req.json() } catch (_e) { /* vide */ }
  try {
    switch (p.op) {
      case "accounts": return json(await call("GET", "/accounts"));
      case "creator": return json(await call("GET", `/accounts/${encodeURIComponent(p.accountId)}/tiktok/creator-info`));
      case "get": return json(await call("GET", `/posts/${encodeURIComponent(p.id)}`));
      case "list": return json(await call("GET", `/posts?limit=${Number(p.limit) || 20}`));
      case "post": return json(await call("POST", "/posts", p.body));
      case "upload": {
        // récupère un fichier public (ex. vidéo sur GitHub) et l'envoie dans le stockage Zernio
        const src = await fetch(p.url);
        if (!src.ok) return json({ error: "source " + src.status }, 400);
        const buf = new Uint8Array(await src.arrayBuffer());
        const ct = p.contentType || src.headers.get("content-type") || "video/mp4";
        const pre = await call("POST", "/media/presign", { filename: p.filename || "video.mp4", contentType: ct, size: buf.length });
        if (pre.status >= 300) return json(pre, 400);
        const d: any = pre.data;
        const put = await fetch(d.uploadUrl, { method: "PUT", headers: { "Content-Type": ct }, body: buf });
        return json({ status: put.status, publicUrl: d.publicUrl, key: d.key, bytes: buf.length });
      }
      case "raw": return json(await call(p.method || "GET", p.path, p.body));
      default: return json({ error: "op inconnue", ops: ["accounts", "creator", "upload", "post", "get", "list", "raw"] }, 400);
    }
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
