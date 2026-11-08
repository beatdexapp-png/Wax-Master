// WaxDrop : récompense Discord (5 drops) et rôle Pro automatique, par le bot du serveur de Jarvis (API REST, aucun service permanent).
// Lancé chaque minute par le timer systemd --user « waxdrop-discord » (outils/discord/waxdrop-discord.{service,timer}).
//   node recompense.mjs init       crée le secret du bot (~/.config/waxdrop-discord/secret, mode 600) et affiche SEULEMENT son empreinte
//                                  (à mettre dans private_cfg, k = 'discord_bot')
//   node recompense.mjs salon      crée #récupère-tes-drops (caché tant que la base n'est pas prête) et épingle le message d'explication
//   node recompense.mjs accueil    règle l'Onboarding du serveur (question d'arrivée → rôle Joueur)
//   node recompense.mjs tour       un passage : lit les codes postés, vérifie, donne les drops, répond ✅/❌, efface le message ; rôles Pro
// Secrets : jeton du bot ~/.config/discord/jeton, secret ~/.config/waxdrop-discord/secret. Jamais affichés ni écrits ailleurs.
// Anti-triche : compte Discord de plus de 7 jours (vérifié aussi par la base), membre présent sur le serveur, un code par compte WaxDrop,
// un compte Discord une seule fois. La base (discord_redeem) décide, le bot ne fait que transmettre.
import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from 'node:fs';
import { randomBytes, createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

const H = os.homedir();
const CFG_DIR = path.join(H, '.config', 'waxdrop-discord');
const ETAT_DIR = path.join(H, '.local', 'state', 'waxdrop-discord');
const ETAT = path.join(ETAT_DIR, 'etat.json');
const GUILD = '1568670214197878824';
const CAT_JEU = '1568670862847246378';
const ROLE_PRO = '1568670846367572009', ROLE_JOUEUR = '1568670852902297690';
const SB = process.env.SB_TEST || 'https://ptoncebyqakclxqnmlzk.supabase.co';
const API = process.env.DISCORD_API_TEST || 'https://discord.com/api/v10';
const NOM_SALON = 'récupère-tes-drops';

const lire = (f) => { try { return readFileSync(f, 'utf8').trim(); } catch { return ''; } };
const jeton = lire(path.join(H, '.config', 'discord', 'jeton'));
const secret = lire(path.join(CFG_DIR, 'secret'));
const etat = (() => { try { return JSON.parse(readFileSync(ETAT, 'utf8')); } catch { return {}; } })();
const garder = () => { mkdirSync(ETAT_DIR, { recursive: true }); writeFileSync(ETAT, JSON.stringify(etat, null, 1)); };
const log = (m) => console.log(new Date().toISOString().slice(0, 19) + ' ' + m);
// clé publique du site (déjà dans cloud.js, visible par tous) : lue dans le dépôt pour ne pas la recopier
const anon = (() => { const m = lire(path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..', 'cloud.js')).match(/sb_publishable_[A-Za-z0-9_-]+/); return m ? m[0] : ''; })();

async function dc(methode, route, body) {
  if (!jeton) throw new Error('pas de jeton Discord');
  for (let essai = 0; essai < 3; essai++) {
    const r = await fetch(API + route, { method: methode, headers: { Authorization: 'Bot ' + jeton, 'Content-Type': 'application/json', 'User-Agent': 'WaxDropBot (waxdrop.fr, 1)' }, body: body === undefined ? undefined : JSON.stringify(body) });
    if (r.status === 429) { const j = await r.json().catch(() => ({})); await new Promise((ok) => setTimeout(ok, Math.ceil((j.retry_after || 1) * 1000) + 100)); continue; }
    if (r.status === 204) return {};
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(`Discord ${methode} ${route.replace(/\d{15,}/g, '…')} → ${r.status} ${j.message || ''}${j.errors ? ' ' + JSON.stringify(j.errors).slice(0, 600) : ''}`); e.status = r.status; throw e; }
    return j;
  }
  throw new Error('Discord : trop de requêtes');
}
async function rpc(fn, args) {
  const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: anon, Authorization: 'Bearer ' + anon, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, data: j };
}
const ne = (id) => new Date(Number(BigInt(id) >> 22n) + 1420070400000);
const POURQUOI = {
  code: 'ce code n’existe pas. Copie-le depuis WaxDrop : Menu > Discord.',
  jeune: 'ton compte Discord doit avoir plus de 7 jours.',
  deja: 'tu as déjà reçu tes 5 drops. Merci !',
  discord_deja: 'ce compte Discord a déjà servi pour un autre compte WaxDrop.',
  compte_deja: 'ce compte WaxDrop a déjà reçu sa récompense Discord.',
  id: 'compte Discord non reconnu.',
  membre: 'il faut être membre du serveur.',
};

async function salonDe() {
  const ch = await dc('GET', `/guilds/${GUILD}/channels`);
  return ch.find((c) => c.id === etat.salon) || ch.find((c) => c.name === NOM_SALON);
}
const TEXTE = [
  '**Récupère tes 5 drops gratuits** 🎁',
  '',
  '1. Ouvre WaxDrop sur **waxdrop.fr** (pas waxdrop.app), puis **Menu > Discord** ou la page **Aujourd’hui** : ton code ressemble à `WD-AB12CD`.',
  '2. Poste ton code ici, seul dans ton message.',
  '3. Le bot répond ✅ et efface ton message (ton code reste privé). Tes **5 drops** arrivent sur ton compte dans la minute.',
  '',
  'Une fois par compte WaxDrop et une fois par compte Discord. Ton compte Discord doit avoir plus de 7 jours.',
  'Pas encore de compte ? Il est gratuit sur waxdrop.fr : pas de code, pas d’invitation.',
].join('\n');

const C = {
  async init() {
    mkdirSync(CFG_DIR, { recursive: true, mode: 0o700 });
    const f = path.join(CFG_DIR, 'secret');
    if (!existsSync(f)) { writeFileSync(f, randomBytes(48).toString('base64url'), { mode: 0o600 }); chmodSync(f, 0o600); }
    const s = readFileSync(f, 'utf8').trim();
    console.log('empreinte sha256 (à mettre dans private_cfg, k = discord_bot) : ' + createHash('sha256').update(s, 'utf8').digest('hex'));
  },
  async salon() {
    let s = await salonDe();
    if (!s) {
      s = await dc('POST', `/guilds/${GUILD}/channels`, { name: NOM_SALON, type: 0, parent_id: CAT_JEU, rate_limit_per_user: 10,
        topic: 'Poste ici ton code WaxDrop (WD-…) : 5 drops offerts, une fois par compte. Le bot efface ton message.',
        permission_overwrites: [{ id: GUILD, type: 0, deny: String(1n << 10n) }] });   // caché (ViewChannel refusé) tant que la base n'est pas prête
      log('salon créé (caché)');
    }
    etat.salon = s.id;
    if (!etat.epingle) {
      const m = await dc('POST', `/channels/${s.id}/messages`, { content: TEXTE, allowed_mentions: { parse: [] } });
      await dc('PUT', `/channels/${s.id}/pins/${m.id}`);
      etat.epingle = m.id; log('message d’explication épinglé');
    }
    garder();
  },
  async accueil() {
    const ch = await dc('GET', `/guilds/${GUILD}/channels`);
    const par = (n) => ch.find((c) => c.name === n)?.id;
    const defaut = ['bienvenue', 'annonces', 'nouveaux-sons', 'général', 'drops-rares', 'échanges', 'idées-et-artistes', 'bugs'].map(par).filter(Boolean);
    const ecoute = ch.find((c) => c.type === 2)?.id; if (ecoute) defaut.push(ecoute);
    const sf = (k) => String(((BigInt(Date.now()) - 1420070400000n) << 22n) + BigInt(k));   // identifiants neufs exigés par Discord
    const r = await dc('PUT', `/guilds/${GUILD}/onboarding`, {
      enabled: true, mode: 0, default_channel_ids: defaut,
      prompts: [{ id: sf(1), type: 0, title: 'Bienvenue ! Tu viens pour…', single_select: true, required: true, in_onboarding: true, options: [
        { id: sf(2), title: 'Je joue à WaxDrop', description: 'Rôle Joueur : échanges, drops rares, idées', emoji_name: '💿', role_ids: [ROLE_JOUEUR], channel_ids: [] },
        { id: sf(3), title: 'Je découvre le jeu', description: 'Rôle Joueur aussi : tout le serveur t’est ouvert', emoji_name: '👀', role_ids: [ROLE_JOUEUR], channel_ids: [] },
      ] }],
    });
    log(`Onboarding : ${r.enabled ? 'activé' : 'NON activé'}, ${r.prompts?.length || 0} question, ${r.default_channel_ids?.length || 0} salons par défaut`);
  },
  async tour() {
    if (!secret || !anon) { log('secret ou clé publique absents : rien à faire'); return; }
    // la base est-elle prête (migration du lot 5) ?
    const p = await rpc('discord_pro', { p_secret: secret });
    if (p.status === 404) { if (!etat.attente) { log('migration du lot 5 pas encore appliquée : salon laissé caché'); etat.attente = 1; garder(); } return; }
    if (p.status !== 200) { log(`base : discord_pro → ${p.status}`); return; }
    if (etat.attente) { delete etat.attente; garder(); }
    const s = await salonDe(); if (!s) { log('salon absent : lancer « node recompense.mjs salon »'); return; }
    etat.salon = s.id;
    // ouvre le salon une fois la base prête
    const ow = (s.permission_overwrites || []).find((o) => o.id === GUILD);
    if (ow && (BigInt(ow.deny) & (1n << 10n))) {
      await dc('PUT', `/channels/${s.id}/permissions/${GUILD}`, { type: 0, allow: String((1n << 10n) | (1n << 11n) | (1n << 16n)), deny: '0' });
      log('salon ouvert à tous');
    }
    // 1. codes postés
    const q = etat.dernier ? `?after=${etat.dernier}&limit=50` : '?limit=50';
    const msgs = (await dc('GET', `/channels/${s.id}/messages${q}`)).sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
    etat.reponses = etat.reponses || [];
    for (const m of msgs) {
      etat.dernier = m.id;
      if (m.author?.bot || m.pinned || m.type !== 0) continue;
      const code = (m.content.match(/\bWD-?[A-Z2-9]{6}\b/i) || [])[0];
      let why = null, ok = null;
      if (!code) why = 'pas de code dans ton message. Il ressemble à `WD-AB12CD` (WaxDrop : Menu > Discord).';
      else if (ne(m.author.id) > new Date(Date.now() - 7 * 864e5)) why = POURQUOI.jeune;
      else {
        let membre = true;
        try { await dc('GET', `/guilds/${GUILD}/members/${m.author.id}`); } catch (e) { if (e.status === 404) membre = false; else throw e; }
        if (!membre) why = POURQUOI.membre;
        else {
          const r = await rpc('discord_redeem', { p_secret: secret, p_code: code.toUpperCase().replace(/^WD-?/, 'WD-'), p_did: m.author.id, p_dname: m.author.username });
          if (r.status !== 200 || !r.data) { log(`base : discord_redeem → ${r.status}`); etat.dernier = msgs[msgs.indexOf(m) - 1]?.id || etat.dernier; break; }
          if (r.data.ok) ok = r.data; else why = POURQUOI[r.data.why] || 'refusé.';
        }
      }
      const texte = ok ? `✅ <@${m.author.id}> : **5 drops** ajoutés sur le compte WaxDrop **${String(ok.pseudo || '').replace(/[*_`~|>@]/g, '')}**. Ouvre waxdrop.fr pour les voir.`
        : `❌ <@${m.author.id}> : ${why}`;
      const rep = await dc('POST', `/channels/${s.id}/messages`, { content: texte, allowed_mentions: { users: [m.author.id] } });
      etat.reponses.push({ id: rep.id, t: Date.now() });
      try { await dc('DELETE', `/channels/${s.id}/messages/${m.id}`); } catch (e) { if (e.status !== 404) throw e; }
      if (ok) {
        try { await dc('PUT', `/guilds/${GUILD}/members/${m.author.id}/roles/${ROLE_JOUEUR}`); } catch {}
        log(`récompense donnée (${ok.pseudo})`);
      } else log('code refusé');
    }
    // réponses du bot effacées au bout de 10 minutes (le salon reste propre, le message épinglé reste)
    const vieux = etat.reponses.filter((x) => Date.now() - x.t > 10 * 60e3);
    for (const x of vieux) { try { await dc('DELETE', `/channels/${s.id}/messages/${x.id}`); } catch (e) { if (e.status !== 404) log(e.message); } }
    etat.reponses = etat.reponses.filter((x) => !vieux.includes(x));
    garder();
    // 2. rôle Pro automatique (toutes les 10 minutes)
    if (Date.now() - (etat.pro || 0) > 10 * 60e3) {
      for (const x of p.data || []) {
        let mb; try { mb = await dc('GET', `/guilds/${GUILD}/members/${x.did}`); } catch (e) { if (e.status === 404) continue; throw e; }
        const a = mb.roles.includes(ROLE_PRO);
        if (x.pro && !a) { await dc('PUT', `/guilds/${GUILD}/members/${x.did}/roles/${ROLE_PRO}`); log('rôle Pro donné'); }
        if (!x.pro && a) { await dc('DELETE', `/guilds/${GUILD}/members/${x.did}/roles/${ROLE_PRO}`); log('rôle Pro retiré'); }
      }
      etat.pro = Date.now(); garder();
    }
  },
};
const cmd = process.argv[2];
if (!C[cmd]) { console.log('Commandes : ' + Object.keys(C).join(', ')); process.exit(1); }
try { await C[cmd](); } catch (e) { log('erreur : ' + String(e.message || e).replace(/Bot [A-Za-z0-9._-]+/g, 'Bot …')); process.exit(1); }
