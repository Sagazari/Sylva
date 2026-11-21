// Cérebro da IA: decide quando falar, quando ignorar, quando puxar assunto.
const { ActivityType } = require('discord.js');
const llm = require('../utils/groq');
const store = require('./store');
const rotina = require('./rotina');
const memoria = require('./memoria');
const persona = require('./persona');
const { rand, chance, sleep, pick, preparar, delayDigitacao } = require('./humanizar');

const NOME = () => (process.env.IA_NOME || 'sylva').toLowerCase();
const INTERESSES = /(tiktok|k-?pop|bts|blackpink|skincare|maquiagem|\bmake\b|unha|cabelo|shein|shopee|crush|ficante|namor|\bex\b|fofoca|treta|s[eé]rie|novela|netflix|\bbbb\b|comida|a[cç]a[ií]|sorvete|pizza|caf[eé]|cachorr|gatinh|viagem|praia|festa|balada|rol[eê]|\blook\b|roupa|bolsa|perfume|signo|astral|hor[oó]scopo|b[aá]b[aá]|crian[cç]a|faculdade|prova|estudar|bype)/i;
const REACOES = ['💀', '😭', '🥺', '🙄', '💅', '😍', '🤭', '👀', '😂', '🫶'];

const canais = new Map();
function est(id) {
  if (!canais.has(id)) {
    canais.set(id, {
      historico: [], timer: null, ocupado: false, ultimaFala: 0, idsIA: new Set(),
      diretoPendente: false, alvo: null, tardioPendente: false,
      iniciativasSeguidas: 0, proximaIniciativa: Date.now() + rand(10, 40) * 60000,
    });
  }
  return canais.get(id);
}

function registrar(e, item) {
  e.historico.push({ ts: Date.now(), ...item });
  if (e.historico.length > 30) e.historico.shift();
}

/** Envia a lista de mensagens digitando como gente */
async function enviar(canal, lista, e, { alvo = null, direto = false } = {}) {
  const prontas = preparar(lista);
  for (let i = 0; i < prontas.length; i++) {
    const { texto, correcao } = prontas[i];
    if (i === 0 && chance(0.1)) { await canal.sendTyping().catch(() => {}); await sleep(rand(3000, 6000)); }
    await canal.sendTyping().catch(() => {});
    await sleep(Math.min(7000, 600 + texto.length * 60 + rand(200, 1200)));

    let enviada;
    if (i === 0 && alvo && chance(direto ? 0.4 : 0.2)) {
      enviada = await alvo.reply({ content: texto, allowedMentions: { parse: [], repliedUser: false } })
        .catch(() => canal.send({ content: texto, allowedMentions: { parse: [] } }));
    } else {
      enviada = await canal.send({ content: texto, allowedMentions: { parse: [] } });
    }
    e.idsIA.add(enviada.id);
    if (e.idsIA.size > 60) e.idsIA.delete(e.idsIA.values().next().value);
    registrar(e, { autor: NOME(), texto, ia: true });
    e.ultimaFala = Date.now();

    if (correcao) {
      await sleep(rand(900, 2200));
      const c = await canal.send({ content: `*${correcao}`, allowedMentions: { parse: [] } });
      e.idsIA.add(c.id);
    }
    if (i < prontas.length - 1) await sleep(rand(500, 2000));
  }
}

/** pessoas (não-bot) que falaram recentemente: [{id, nome}] */
function quemEstaNoChat(e) {
  const mapa = new Map();
  for (const m of e.historico.slice(-18)) if (!m.ia && m.uid) mapa.set(m.uid, m.autor);
  return [...mapa].map(([id, nome]) => ({ id, nome }));
}

/** guarda o que a IA aprendeu (validando que a pessoa realmente está no chat) */
function salvarMemorias(canal, e, lista) {
  for (const m of (lista ?? []).slice(0, 2)) {
    const nome = m.usuario.replace(/^@/, '').trim().toLowerCase();
    const alvo = [...e.historico].reverse().find((x) => !x.ia && x.uid && x.autor.toLowerCase() === nome);
    if (alvo) memoria.adicionar(canal.guildId, alvo.uid, alvo.autor, m.fato);
  }
}

async function responder(canal, { modo = 'resposta', tardio = null, alvo = null, direto = false } = {}) {
  const e = est(canal.id);
  e.ocupado = true;
  try {
    const st = rotina.estado();
    const pessoas = quemEstaNoChat(e);
    const prompt = persona.montarPrompt({
      historico: e.historico, estado: st, humor: rotina.humor(), nome: NOME(), modo, tardio,
      memorias: memoria.resumo(canal.guildId, pessoas),
    });
    const { mensagens, memorias } = await llm.gerar({ system: persona.system(NOME()), prompt });
    salvarMemorias(canal, e, memorias); // ela pode aprender algo mesmo sem responder
    if (!mensagens.length) return;
    await enviar(canal, mensagens, e, { alvo, direto });
  } catch (err) {
    console.error('[ia]', err.message);
  } finally {
    e.ocupado = false;
  }
}

async function avaliar(canal, client) {
  const e = est(canal.id);
  if (!store.ativo(canal.id) || !e.historico.length) return;
  if (e.ocupado) { e.timer = setTimeout(() => avaliar(canal, client).catch(console.error), 5000); return; }

  const st = rotina.estado();
  const direto = e.diretoPendente;
  e.diretoPendente = false;
  const alvo = e.alvo;

  const ultima = e.historico[e.historico.length - 1];
  if (ultima.ia) return;
  const recente = e.historico.slice(-4).map((m) => m.texto).join(' ');
  const interesse = INTERESSES.test(recente);
  const conversando = Date.now() - e.ultimaFala < 4 * 60000;

  if (!direto && Date.now() - e.ultimaFala < 20000) return; // não emenda resposta em resposta

  const base = direto ? 0.97 : interesse ? 0.5 : conversando ? 0.45 : 0.1;
  const p = direto ? Math.min(0.98, st.disp * 1.6 + 0.03) : base * st.disp;

  if (chance(p)) {
    e.ocupado = true; // reserva a vez enquanto "demora" pra ver a mensagem
    const [a, b] = st.atraso;
    await sleep(direto ? rand(a, Math.max(a, Math.floor((a + b) / 2))) : rand(a, b));
    e.ocupado = false;
    if (!store.ativo(canal.id)) return;
    return responder(canal, { alvo, direto });
  }

  // ignorou: às vezes só reage com emoji, às vezes responde tarde
  if ((direto || interesse) && alvo && chance(0.4)) alvo.react(pick(REACOES)).catch(() => {});
  if (direto && st.disp < 0.6 && !e.tardioPendente && chance(0.4)) {
    e.tardioPendente = true;
    const marco = Date.now();
    setTimeout(() => {
      e.tardioPendente = false;
      if (!store.ativo(canal.id) || e.ultimaFala > marco) return;
      responder(canal, { tardio: st.descricao, alvo, direto: true });
    }, rand(2, 12) * 60000);
  }
}

function mencionaIA(message, client, e) {
  if (message.mentions.users.has(client.user.id)) return true;
  const nomes = [NOME(), ...(process.env.IA_APELIDOS || 'syl').split(',')].map((n) => n.trim().toLowerCase()).filter(Boolean);
  if (nomes.some((n) => new RegExp(`(^|[^a-z0-9])${n}([^a-z0-9]|$)`, 'i').test(message.content))) return true;
  const ref = message.reference?.messageId;
  return Boolean(ref && e.idsIA.has(ref));
}

function onMessage(message, client) {
  if (message.author.bot || !message.guild || !store.ativo(message.channelId)) return;
  const e = est(message.channelId);

  let texto = message.cleanContent?.trim() ?? '';
  if (message.attachments.size) texto += ' [mandou uma foto/arquivo]';
  if (message.stickers.size) texto += ' [mandou uma figurinha]';
  texto = texto.trim();
  if (!texto) return;

  registrar(e, { autor: message.member?.displayName ?? message.author.username, uid: message.author.id, texto, ia: false });
  e.iniciativasSeguidas = 0;
  e.proximaIniciativa = Date.now() + rand(25, 75) * 60000;
  e.alvo = message;
  const direto = mencionaIA(message, client, e);
  e.diretoPendente = e.diretoPendente || direto;

  clearTimeout(e.timer);
  e.timer = setTimeout(() => avaliar(message.channel, client).catch(console.error), direto ? rand(1500, 4000) : rand(4000, 9000));
}

let ultimaPresenca = '';
function presenca(client, st) {
  if (!store.listar().length) {
    if (ultimaPresenca) {
      ultimaPresenca = '';
      client.user.setActivity('Bype City | /ajuda', { type: ActivityType.Watching });
    }
    return;
  }
  const chave = st.presenca + st.descricao;
  if (chave === ultimaPresenca) return;
  ultimaPresenca = chave;
  client.user.setPresence({ status: st.presenca, activities: [{ name: 'status', type: ActivityType.Custom, state: st.descricao }] });
}

async function tick(client) {
  const st = rotina.estado();
  presenca(client, st);
  if (!st.puxa) return;

  for (const id of store.listar()) {
    const e = est(id);
    if (e.ocupado || Date.now() < e.proximaIniciativa) continue;
    if (e.iniciativasSeguidas >= 2) { e.proximaIniciativa = Date.now() + rand(120, 240) * 60000; continue; }
    if (!chance(st.disp)) { e.proximaIniciativa = Date.now() + rand(3, 10) * 60000; continue; }

    const canal = await client.channels.fetch(id).catch(() => null);
    if (!canal) continue;
    e.iniciativasSeguidas++;
    e.proximaIniciativa = Date.now() + rand(40, 120) * 60000;

    if (chance(0.4)) {
      e.ocupado = true;
      try { await enviar(canal, [pick(persona.INICIOS_PRONTOS)], e); } catch (err) { console.error('[ia]', err.message); }
      e.ocupado = false;
    } else {
      await responder(canal, { modo: 'iniciativa' });
    }
  }
}

async function cumprimentar(canal) {
  const e = est(canal.id);
  if (!chance(0.7) || e.ocupado) return;
  await sleep(rand(5000, 20000));
  e.ocupado = true;
  try { await enviar(canal, [pick(persona.SAUDACOES)], e); } catch (err) { console.error('[ia]', err.message); }
  e.ocupado = false;
}

function iniciar(client) {
  setInterval(() => tick(client).catch((e) => console.error('[ia]', e.message)), 60000);
  console.log(`🧠 IA "${NOME()}" carregada (${store.listar().length} canal(is) ativo(s))`);
}

module.exports = { iniciar, onMessage, cumprimentar };
