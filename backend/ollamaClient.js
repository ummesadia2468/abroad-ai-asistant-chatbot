const config = require('./config');

class OllamaError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

async function chat(messages) {
  let response;
  try {
    response = await fetch(`${config.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: config.ollamaModel, messages, stream: false }),
      signal: AbortSignal.timeout(120000),
    });
  } catch {
    throw new OllamaError('unavailable', 'Ollama is not reachable');
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const modelMissing = response.status === 404 || /not found|model/i.test(body);
    throw new OllamaError(modelMissing ? 'model' : 'service', 'Ollama returned an error');
  }

  const payload = await response.json().catch(() => null);
  const message = payload?.message?.content?.trim();
  if (!message) throw new OllamaError('service', 'Ollama returned an empty response');
  return message;
}

module.exports = { chat, OllamaError };
