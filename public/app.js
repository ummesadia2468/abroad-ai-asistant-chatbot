const state = { conversationId: null, lastMessage: '', busy: false };
const welcome = document.querySelector('#welcome');
const messageList = document.querySelector('#messageList');
const typing = document.querySelector('#typing');
const chatWindow = document.querySelector('#chatWindow');
const composer = document.querySelector('#composer');
const input = document.querySelector('#messageInput');
const sendButton = document.querySelector('#sendButton');
const errorBanner = document.querySelector('#errorBanner');
const errorText = document.querySelector('#errorText');
const retryButton = document.querySelector('#retryButton');
const sidebar = document.querySelector('.sidebar');

function escapeHtml(value) { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }
function inlineMarkdown(value) {
  return value.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}
function renderMarkdown(source) {
  const blocks = source.split(/```/);
  return blocks.map((block, index) => {
    if (index % 2 === 1) return `<div class="code-block"><button class="copy-code" type="button">Copy</button><code>${escapeHtml(block.replace(/^\w+\n/, '').trim())}</code></div>`;
    const lines = block.split('\n'); let html = ''; let list = null;
    const closeList = () => { if (list) { html += `</${list}>`; list = null; } };
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) { closeList(); continue; }
      const heading = line.match(/^(#{1,3})\s+(.+)/);
      const bullet = line.match(/^[-*]\s+(.+)/);
      const numbered = line.match(/^\d+\.\s+(.+)/);
      if (heading) { closeList(); const level = heading[1].length; html += `<h${level}>${inlineMarkdown(escapeHtml(heading[2]))}</h${level}>`; }
      else if (bullet || numbered) { const tag = bullet ? 'ul' : 'ol'; if (list !== tag) { closeList(); html += `<${tag}>`; list = tag; } html += `<li>${inlineMarkdown(escapeHtml((bullet || numbered)[1]))}</li>`; }
      else { closeList(); html += `<p>${inlineMarkdown(escapeHtml(line))}</p>`; }
    }
    closeList(); return html;
  }).join('');
}
function scrollToLatest() { requestAnimationFrame(() => { chatWindow.scrollTop = chatWindow.scrollHeight; }); }
function setLoading(loading) { state.busy = loading; typing.hidden = !loading; sendButton.disabled = loading; input.disabled = loading; if (loading) scrollToLatest(); }
function clearError() { errorBanner.hidden = true; }
function showError(message) { errorText.textContent = message; errorBanner.hidden = false; }
function addMessage(role, content) {
  welcome.hidden = true;
  const item = document.createElement('article'); item.className = `message ${role}`;
  if (role === 'assistant') {
    item.innerHTML = `<span class="avatar" aria-hidden="true">A</span><div class="message-content">${renderMarkdown(content)}<button class="copy-response" type="button">Copy response</button></div>`;
  } else item.innerHTML = `<div class="message-content">${escapeHtml(content).replace(/\n/g, '<br>')}</div>`;
  messageList.appendChild(item); scrollToLatest();
}
async function sendMessage(value) {
  const message = value.trim(); if (!message || state.busy) return;
  clearError(); state.lastMessage = message; input.value = ''; input.style.height = 'auto'; addMessage('user', message); setLoading(true);
  try {
    const response = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message, conversationId: state.conversationId }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'The AI service could not complete that request.');
    state.conversationId = payload.conversationId; document.querySelector('#conversationLabel').textContent = message.slice(0, 27) + (message.length > 27 ? '...' : ''); addMessage('assistant', payload.message);
  } catch (error) { showError(error.message); }
  finally { setLoading(false); input.focus(); }
}
composer.addEventListener('submit', (event) => { event.preventDefault(); sendMessage(input.value); });
input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); composer.requestSubmit(); } });
input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 130)}px`; });
document.querySelectorAll('.suggestion').forEach((button) => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
document.querySelector('#newChat').addEventListener('click', async () => {
  if (state.conversationId) await fetch(`/api/conversations/${state.conversationId}`, { method: 'DELETE' }).catch(() => {});
  state.conversationId = null; messageList.innerHTML = ''; welcome.hidden = false; document.querySelector('#conversationLabel').textContent = 'New conversation'; clearError(); sidebar.classList.remove('open'); input.focus();
});
document.querySelector('#menuButton').addEventListener('click', () => sidebar.classList.toggle('open'));
retryButton.addEventListener('click', () => sendMessage(state.lastMessage));
document.addEventListener('click', async (event) => { const button = event.target.closest('.copy-code, .copy-response'); if (!button) return; const source = button.classList.contains('copy-code') ? button.nextElementSibling.textContent : button.previousSibling.textContent; await navigator.clipboard.writeText(source); const label = button.textContent; button.textContent = 'Copied'; setTimeout(() => { button.textContent = label; }, 1200); });
fetch('/api/health').then((response) => response.json()).then((status) => {
  const connection = document.querySelector('.connection-status');
  if (!status.ollama) connection.innerHTML = '<span class="status-dot" style="background:#db8e69"></span><span>Ollama offline</span>';
  else if (!status.modelAvailable) connection.innerHTML = '<span class="status-dot" style="background:#db8e69"></span><span>Model missing</span>';
}).catch(() => { document.querySelector('.connection-status').innerHTML = '<span class="status-dot" style="background:#db8e69"></span><span>Offline</span>'; });
