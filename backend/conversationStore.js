const crypto = require('node:crypto');

const conversations = new Map();

function getConversation(id) {
  if (!id || !conversations.has(id)) {
    const newId = id || crypto.randomUUID();
    conversations.set(newId, { id: newId, createdAt: new Date().toISOString(), messages: [] });
    id = newId;
  }
  return conversations.get(id);
}

function addMessage(id, role, content) {
  const conversation = getConversation(id);
  conversation.messages.push({ role, content });
  return conversation;
}

function clearConversation(id) {
  conversations.delete(id);
}

module.exports = { getConversation, addMessage, clearConversation };
