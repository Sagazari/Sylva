const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'warns.json');

function load() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; }
}
function save(db) { fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); }

function add(guildId, userId, motivo, staffId) {
  const db = load();
  db[guildId] ??= {};
  db[guildId][userId] ??= [];
  db[guildId][userId].push({ motivo, staffId, data: Date.now() });
  save(db);
  return db[guildId][userId].length;
}
function list(guildId, userId) { return load()[guildId]?.[userId] ?? []; }
function clear(guildId, userId) {
  const db = load();
  if (db[guildId]) delete db[guildId][userId];
  save(db);
}

module.exports = { add, list, clear };
