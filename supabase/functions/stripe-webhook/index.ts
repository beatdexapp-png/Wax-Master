// TrackDex : webhook Stripe (signature vérifiée avec le secret du webhook)
// Copie EXACTE de la fonction déployée (version 1), rangée dans le dépôt le 08/11/2026 pour l'audit. Rien n'est redéployé.
const URL = Deno.env.get('SUPABASE_URL')!;
const KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const H = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
let secret: string | null = null;

async function getSecret() {
  if (secret) return secret;
  const r = await fetch(URL + '/rest/v1/private_cfg?k=eq.stripe_whsec&select=v', { headers: H });
  const j = await r.json();
  secret = j && j[0] ? j[0].v : null;
  return secret;
}
function hex(buf: ArrayBuffer) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''); }
function safeEq(a: string, b: string) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }

async function verify(payload: string, header: string, sec: string) {
  const parts = header.split(',').map(x => x.split('='));
  const t = parts.find(p => p[0] === 't')?.[1];
  const sigs = parts.filter(p => p[0] === 'v1').map(p => p[1]);
  if (!t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 600) return false;
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(sec), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(t + '.' + payload)));
  return sigs.some(s => safeEq(s, mac));
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok');
  const payload = await req.text();
  const sec = await getSecret();
  if (!sec) return new Response('config', { status: 500 });
  if (!(await verify(payload, req.headers.get('stripe-signature') || '', sec))) return new Response('signature', { status: 400 });
  const ev = JSON.parse(payload);
  const r = await fetch(URL + '/rest/v1/rpc/stripe_apply', { method: 'POST', headers: H, body: JSON.stringify({ p_event: ev }) });
  const txt = await r.text();
  if (!r.ok) { console.error('stripe_apply', r.status, txt); return new Response('db', { status: 500 }); }
  return new Response(JSON.stringify({ received: true, result: txt }), { headers: { 'Content-Type': 'application/json' } });
});
