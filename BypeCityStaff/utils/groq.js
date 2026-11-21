// Chamada à API do Groq (compatível com OpenAI) — sem dependências extras.
async function gerar({ system, prompt, temperature = 1.0 }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY não configurada no .env');
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: 500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status} (modelo: ${model}): ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const txt = data.choices?.[0]?.message?.content ?? '';

  try {
    const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
    return {
      mensagens: Array.isArray(j.mensagens) ? j.mensagens.filter((m) => typeof m === 'string') : [],
      memorias: Array.isArray(j.memorias)
        ? j.memorias.filter((m) => m && typeof m.usuario === 'string' && typeof m.fato === 'string')
        : [],
    };
  } catch {
    return { mensagens: [], memorias: [] };
  }
}

module.exports = { gerar };
