const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./backend/config');
const { SYSTEM_PROMPT } = require('./backend/prompts/systemPrompt');
const { getConversation, addMessage, clearConversation } = require('./backend/conversationStore');
const { chat, OllamaError } = require('./backend/ollamaClient');
const { classify, localResponse } = require('./backend/policy');

const publicDir = path.join(__dirname, 'public');
const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

function json(response, status, data) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(data));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100000) reject(new Error('payload too large'));
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

async function handleChat(request, response) {
  let payload;
  try { payload = JSON.parse(await readBody(request)); } catch { return json(response, 400, { error: 'Please send a valid message.' }); }
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (!message) return json(response, 400, { error: 'Please enter a message.' });
  if (message.length > config.maxMessageLength) return json(response, 413, { error: 'That message is too long. Please shorten it and try again.' });

  const conversation = getConversation(typeof payload.conversationId === 'string' ? payload.conversationId : '');
  addMessage(conversation.id, 'user', message);
  const kind = classify(message);
  let answer;
  try {
    if (kind === 'ollama') {
      answer = await chat([{ role: 'system', content: SYSTEM_PROMPT }, ...conversation.messages]);
    } else {
      answer = localResponse(kind);
    }
  } catch (error) {
    conversation.messages.pop();
    const userError = error instanceof OllamaError && error.kind === 'model'
      ? `The selected AI model is currently unavailable. Please check that ${config.ollamaModel} is installed in Ollama.`
      : error instanceof OllamaError && error.kind === 'unavailable'
        ? 'Unable to connect to the AI service. Please make sure Ollama is running and try again.'
        : 'The AI service could not complete that request. Please try again.';
    return json(response, 503, { error: userError, retryable: true });
  }

  addMessage(conversation.id, 'assistant', answer);
  return json(response, 200, { message: answer, conversationId: conversation.id });
}

function serveStatic(request, response) {
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const filePath = path.normalize(path.join(publicDir, requested));
  if (!filePath.startsWith(publicDir)) return json(response, 404, { error: 'Not found' });
  fs.readFile(filePath, (error, content) => {
    if (error) return json(response, 404, { error: 'Not found' });
    response.writeHead(200, { 'content-type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(content);
  });
}

async function health() {
  try {
    const result = await fetch(`${config.ollamaBaseUrl}/api/tags`, { signal: AbortSignal.timeout(1500) });
    if (!result.ok) return { ok: false, ollama: false, modelAvailable: false };
    const payload = await result.json();
    const models = Array.isArray(payload.models) ? payload.models : [];
    return { ok: true, ollama: true, modelAvailable: models.some((model) => model.name === config.ollamaModel), model: config.ollamaModel };
  } catch {
    return { ok: false, ollama: false, modelAvailable: false, model: config.ollamaModel };
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/health') return json(response, 200, await health());
  if (request.method === 'POST' && request.url === '/api/chat') return handleChat(request, response);
  if (request.method === 'DELETE' && request.url?.startsWith('/api/conversations/')) {
    clearConversation(request.url.split('/').pop());
    return json(response, 200, { ok: true });
  }
  if (request.method === 'GET') return serveStatic(request, response);
  return json(response, 405, { error: 'Method not allowed' });
});

server.listen(config.port, () => console.log(`Atlas running at http://localhost:${config.port}`));
