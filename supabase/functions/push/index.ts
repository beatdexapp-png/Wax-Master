// WaxDrop : envoi des notifications web push (lot 3, 07/11/2026). NON DÉPLOYÉE.
// Appelée toutes les 15 min par pg_cron (voir la fin de A-COLLER-SUPABASE-lot3.sql), avec l'en-tête x-cron = PUSH_CRON_SECRET.
// Secrets à créer dans Supabase (Edge Functions > Secrets) : VAPID_PUBLIC, VAPID_PRIVATE, VAPID_SUBJECT, PUSH_CRON_SECRET.
// Déploiement : supabase functions deploy push --no-verify-jwt
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const env = (k: string) => Deno.env.get(k) ?? "";
webpush.setVapidDetails(env("VAPID_SUBJECT"), env("VAPID_PUBLIC"), env("VAPID_PRIVATE"));
const sb = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

Deno.serve(async (req) => {
  if (!env("PUSH_CRON_SECRET") || req.headers.get("x-cron") !== env("PUSH_CRON_SECRET")) return new Response("non", { status: 401 });
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
      if (code === 404 || code === 410) { await sb.from("push_subs").delete().eq("endpoint", r.endpoint); gone++; } else ko++;
    }
  }
  return Response.json({ ok, gone, ko });
});
