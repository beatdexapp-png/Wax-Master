// WaxDrop : envoi des notifications web push (lot 3, mise en service le 08/11/2026 avec les retouches).
// Appelée toutes les 10 min par pg_cron (tâche « waxdrop-push », migration 20261108230000_notifications.sql),
// avec l'en-tête x-cron égal à push_cfg.cron (secret créé au hasard dans la base, jamais affiché).
// Clés VAPID : créées ici au premier passage et rangées dans push_cfg (vapid_pub, vapid_priv). Le jeu lit la clé publique avec push_key().
// Déployée sans vérification JWT (verify_jwt false) : la protection est l'en-tête x-cron.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const env = (k: string) => Deno.env.get(k) ?? "";
const sb = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

async function cfg(k: string): Promise<string> {
  const { data } = await sb.from("push_cfg").select("v").eq("k", k).maybeSingle();
  return (data?.v as string) ?? "";
}
async function keys() {
  let pub = await cfg("vapid_pub"), priv = await cfg("vapid_priv");
  if (!pub || !priv) {
    const k = webpush.generateVAPIDKeys();
    await sb.from("push_cfg").upsert([{ k: "vapid_pub", v: k.publicKey }, { k: "vapid_priv", v: k.privateKey }], { onConflict: "k", ignoreDuplicates: true });
    pub = await cfg("vapid_pub"); priv = await cfg("vapid_priv");
  }
  return { pub, priv };
}

Deno.serve(async (req) => {
  const sec = await cfg("cron");
  if (!sec || req.headers.get("x-cron") !== sec) return new Response("non", { status: 401 });
  const { pub, priv } = await keys();
  if (!pub || !priv) return new Response("clés absentes", { status: 500 });
  webpush.setVapidDetails("mailto:atlasandcogroup@gmail.com", pub, priv);
  const { data, error } = await sb.rpc("push_due");
  if (error) return new Response(error.message, { status: 500 });
  let ok = 0, gone = 0, ko = 0;
  for (const r of data ?? []) {
    const payload = JSON.stringify({ title: r.title, body: r.body, tag: "wd-" + r.kind, url: "/?n=" + r.kind });
    try {
      await webpush.sendNotification({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }, payload, { TTL: 6 * 3600, urgency: "normal" });
      ok++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410 || code === 403) { await sb.from("push_subs").delete().eq("endpoint", r.endpoint); gone++; } else ko++;
    }
  }
  return Response.json({ ok, gone, ko });
});
