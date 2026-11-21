// Chamada simples à API do Gemini (REST) — sem dependências extras.
async function gerar({ system, prompt, temperature = 1.0 }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY não configurada no .env');
  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            mensagens: { type: 'ARRAY', items: { type: 'STRING' } },
            memorias: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: { usuario: { type: 'STRING' }, fato: { type: 'STRING' } },
                required: ['usuario', 'fato'],
              },
            },
          },
          required: ['mensagens'],
        },
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status} (modelo: ${model}): ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const txt = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('');
  try {
    const j = JSON.parse(txt);
    return {
      mensagens: Array.isArray(j.mensagens) ? j.mensagens.filter((m) => typeof m === 'string') : [],
      memorias: Array.isArray(j.memorias) ? j.memorias.filter((m) => m && typeof m.usuario === 'string' && typeof m.fato === 'string') : [],
    };
  } catch {
    return { mensagens: [], memorias: [] };
  }
}

module.exports = { gerar };
