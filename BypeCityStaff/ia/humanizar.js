// Funções puras que deixam o texto com cara de gente digitando no celular.
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const chance = (p) => Math.random() < p;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** minúsculo, sem pontuação "certinha", sem markdown */
function limpar(texto) {
  let t = String(texto ?? '').trim();
  t = t.replace(/[*_`~#>]/g, '');
  t = t.replace(/^["“']+|["”']+$/g, '');
  t = t.toLowerCase();
  t = t.replace(/\s*,\s*/g, ' ');
  t = t.replace(/\.{4,}/g, '...');
  t = t.replace(/(?<!\.)\.(?!\.)/g, ' ');
  t = t.replace(/!+/g, () => (chance(0.25) ? '!!' : ''));
  t = t.replace(/\?{2,}/g, () => (chance(0.5) ? '??' : '?'));
  t = t.replace(/\s+/g, ' ').trim();
  return t.slice(0, 300);
}

/** risadinha e letra esticada de vez em quando */
function ruido(t) {
  if (t.length < 45 && !/k{3,}/.test(t) && chance(0.14)) {
    t += ' ' + 'k'.repeat(rand(4, 9));
  }
  if (chance(0.07)) {
    const palavras = t.split(' ');
    const i = palavras.length - 1;
    const w = palavras[i];
    if (/[aeiou]$/.test(w) && w.length >= 2 && w.length <= 8) {
      palavras[i] = w + w.slice(-1).repeat(rand(2, 4));
      t = palavras.join(' ');
    }
  }
  return t;
}

/** troca duas letras de uma palavra e devolve a correção ("*palavra") */
function errinho(t) {
  if (!chance(0.06)) return { texto: t, correcao: null };
  const palavras = t.split(' ');
  const candidatas = palavras.map((w, i) => ({ w, i })).filter(({ w }) => /^[a-zà-ú]{5,}$/.test(w));
  if (!candidatas.length) return { texto: t, correcao: null };
  const { w, i } = pick(candidatas);
  const p = rand(1, w.length - 3);
  const errada = w.slice(0, p) + w[p + 1] + w[p] + w.slice(p + 2);
  if (errada === w) return { texto: t, correcao: null };
  palavras[i] = errada;
  return { texto: palavras.join(' '), correcao: w };
}

/** lista crua do Groq -> lista pronta pra enviar */
function preparar(lista) {
  return lista
    .map(limpar)
    .filter(Boolean)
    .slice(0, 4)
    .map((t) => ({ ...errinho(ruido(t)) }));
}

const delayDigitacao = (txt) => Math.min(7000, 600 + txt.length * 60 + rand(200, 1200));

module.exports = { rand, chance, sleep, pick, limpar, ruido, errinho, preparar, delayDigitacao };
