const greetingPattern = /^(hi|hello|hey|good morning|good afternoon|good evening)[!. ,]*$/i;
const endingPattern = /^(thanks|thank you|bye|goodbye|that's all|that is all|done)[!. ,]*$/i;
const irrelevantPattern = /\b(random joke|celebrity gossip|astrology prediction|lottery numbers)\b/i;
const forbiddenPattern = /\b(malware|ransomware|credential theft|steal passwords?|phishing kit|ddos attack|make (a )?bomb|explosive|weapon construction|bypass (security|authentication)|credit card fraud)\b/i;

function classify(message) {
  if (greetingPattern.test(message)) return 'greeting';
  if (endingPattern.test(message)) return 'ending';
  if (forbiddenPattern.test(message)) return 'forbidden';
  if (irrelevantPattern.test(message)) return 'irrelevant';
  return 'ollama';
}

function localResponse(kind) {
  if (kind === 'greeting') return 'Hello. How can I help you today?';
  if (kind === 'ending') return "You're welcome. Glad I could help. Have a great day.";
  if (kind === 'forbidden') return "I can't help with harmful or illegal instructions. I can help with a safe alternative, such as defensive security, account protection, or risk analysis.";
  return "I'm focused on helping with questions and tasks. Tell me what you'd like to learn, plan, build, or solve.";
}

module.exports = { classify, localResponse };
