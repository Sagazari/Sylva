// O que a IA aprende sobre cada pessoa (gostos e curiosidades leves).
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'ia-memoria.json');
const MAX_FATOS = 15;

// nunca guarda dados sensíveis ou pessoais demais
const SENSIVEL = /(\d[\d\s().-]{7,}\d|\S+@\S+\.\S+|\bcpf\b|\brg\b|senha|cart[aã]o|endere[cç]o|\bmoro (na|no|em)\b|\brua\b|\bavenida\b|\bpix\b|diagn[oó]stic|depress|ansiedade|suic|automutila|rem[eé]dio|doen[cç]a|religi|pol[ií]tic|\bvoto\b|\bgay\b|l[eé]sbica|bissexual|\btrans\b|sexual|sal[aá]rio|d[ií]vida|menor de idade|\bescola\b)/i;

function load() { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; } }
function save(db) { fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); }
const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

function adicionar(guildId, userId, nome, fato) {
  fato = String(fato ?? '').replace(/\s+/g, ' ').trim();
  if (fato.length < 4 || fato.length > 120 || SENSIVEL.test(fato)) return false;
  const db = load();
  db[guildId] ??= {};
  const u = (db[guildId][userId] ??= { nome, fatos: [] });
  u.nome = nome;
  const n = norm(fato);
  if (u.fatos.some((f) => norm(f.t) === n || norm(f.t).includes(n) || n.includes(norm(f.t)))) return false;
  u.fatos.push({ t: fato, ts: Date.now() });
  if (u.fatos.length > MAX_FATOS) u.fatos.shift();
  save(db);
  return true;
}

const fatos = (guildId, userId) => (load()[guildId]?.[userId]?.fatos ?? []).map((f) => f.t);

function esquecer(guildId, userId) {
  const db = load();
  const qtd = db[guildId]?.[userId]?.fatos?.length ?? 0;
  if (db[guildId]) delete db[guildId][userId];
  save(db);
  return qtd;
}

/** texto com o que ela sabe das pessoas citadas: [{id, nome}] */
function resumo(guildId, pessoas) {
  const db = load()[guildId] ?? {};
  return pessoas
    .map((p) => (db[p.id]?.fatos?.length ? `${p.nome}: ${db[p.id].fatos.map((f) => f.t).join('; ')}` : null))
    .filter(Boolean)
    .join('\n');
}

module.exports = { adicionar, fatos, esquecer, resumo };
