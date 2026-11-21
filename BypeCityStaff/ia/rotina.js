// Rotina, atividade atual e humor da IA. Tudo aqui é editável.
const { rand, pick } = require('./humanizar');

const TZ = process.env.IA_TZ || 'America/Sao_Paulo';
const min = (m) => m * 60 * 1000;
const seg = (s) => s * 1000;

function agora() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour: 'numeric', minute: 'numeric', weekday: 'short', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const dia = get('weekday');
  return { hora: parseInt(get('hour'), 10), minuto: parseInt(get('minute'), 10), fimDeSemana: dia === 'Sat' || dia === 'Sun' };
}

// disp = disponibilidade (0 a 1). atraso = [min, max] em ms pra responder.
const A = (descricao, disp, atraso, presenca, puxa = false) => ({ descricao, disp, atraso, presenca, puxa });

const FIXAS = {
  madrugada: A('dormindo', 0.02, [min(5), min(30)], 'idle'),
  acordando: A('acordando e se arrumando', 0.2, [seg(60), min(3)], 'idle'),
  baba: A('trabalhando de babá', 0.12, [min(1), min(6)], 'dnd'),
  dormindoTarde: A('dormindo até tarde', 0.05, [min(5), min(30)], 'idle'),
  almoco: A('almoçando', 0.5, [seg(20), min(2)], 'idle'),
  jantar: A('jantando', 0.3, [seg(30), min(3)], 'idle'),
  estudando: A('estudando', 0.15, [min(1), min(5)], 'dnd'),
  cama: A('deitada no celular', 0.7, [seg(3), seg(25)], 'online', true),
};

// sorteadas durante o tempo livre (peso, atividade)
const LIVRES = [
  [3, A('de boa no chat', 1, [seg(3), seg(12)], 'online', true)],
  [3, A('de boa no celular', 0.95, [seg(4), seg(15)], 'online', true)],
  [2, A('vendo tiktok', 0.2, [seg(40), min(4)], 'idle')],
  [1, A('vendo série', 0.4, [seg(30), min(3)], 'idle')],
  [1, A('fazendo skincare', 0.45, [seg(20), min(3)], 'idle')],
  [1, A('comendo', 0.5, [seg(20), min(2)], 'idle')],
  [1, A('no banho', 0.0, [min(10), min(25)], 'dnd')],
  [1, A('arrumando o quarto', 0.35, [seg(30), min(4)], 'idle')],
  [1, A('falando com a mãe', 0.25, [min(1), min(5)], 'dnd')],
];

const HUMORES = [
  { nome: 'animada', mult: 1.15, desc: 'animada, cheia de energia, rindo de tudo' },
  { nome: 'de boa', mult: 1.0, desc: 'tranquila, de boa' },
  { nome: 'cansada', mult: 0.8, desc: 'cansada, com preguiça, respostas mais curtas' },
  { nome: 'carente', mult: 1.2, desc: 'carente, querendo atenção e elogio' },
  { nome: 'irritada', mult: 0.9, desc: 'meio irritada, estressadinha, respondona' },
  { nome: 'fofoqueira', mult: 1.15, desc: 'no modo fofoca, curiosa pra saber de tudo' },
  { nome: 'entediada', mult: 1.2, desc: 'entediada, sem nada pra fazer' },
  { nome: 'apaixonada', mult: 1.05, desc: 'apaixonadinha, pensando no crush' },
];

function blocoFixo({ hora, fimDeSemana }) {
  if (hora < 6) return ['madrugada', FIXAS.madrugada];
  if (hora < 7) return ['acordando', FIXAS.acordando];
  if (!fimDeSemana && hora < 12) return ['baba', FIXAS.baba];
  if (fimDeSemana && hora < 10) return ['dormindoTarde', FIXAS.dormindoTarde];
  if (!fimDeSemana && hora < 13) return ['almoco', FIXAS.almoco];
  if (hora >= 18 && hora < 19) return ['jantar', FIXAS.jantar];
  if (!fimDeSemana && hora >= 19 && hora < 23) return ['estudando', FIXAS.estudando];
  if (hora >= 23) return ['cama', FIXAS.cama];
  return null; // tempo livre
}

let livre = { ate: 0, item: null };
let humor = { ate: 0, item: HUMORES[1] };

function sortearLivre() {
  const total = LIVRES.reduce((s, [p]) => s + p, 0);
  let r = Math.random() * total;
  for (const [p, a] of LIVRES) { if ((r -= p) <= 0) return a; }
  return LIVRES[0][1];
}

function getHumor() {
  if (Date.now() > humor.ate) humor = { ate: Date.now() + min(rand(180, 360)), item: pick(HUMORES) };
  return humor.item;
}

/** Estado atual: { descricao, disp, atraso, presenca, puxa, hora } */
function estado() {
  const t = agora();
  const fixo = blocoFixo(t);
  let item;
  if (fixo) { item = fixo[1]; livre.ate = 0; }
  else {
    if (Date.now() > livre.ate) livre = { ate: Date.now() + min(rand(10, 45)), item: sortearLivre() };
    item = livre.item;
  }
  const h = getHumor();
  return { ...item, disp: Math.min(1, item.disp * h.mult), hora: t.hora, minuto: t.minuto };
}

module.exports = { estado, humor: getHumor, HUMORES };
