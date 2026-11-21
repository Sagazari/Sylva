const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'ia.json');

function load() { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return { canais: {} }; } }
function save(db) { fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); }

const ativo = (id) => Boolean(load().canais[id]);
const listar = () => Object.keys(load().canais);
function ativar(id, guildId) { const db = load(); db.canais[id] = { guildId }; save(db); }
function desativar(id) { const db = load(); const tinha = Boolean(db.canais[id]); delete db.canais[id]; save(db); return tinha; }

module.exports = { ativo, listar, ativar, desativar };
