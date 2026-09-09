# AGENT.md

# Qwen2.5 Ollama AI Assistant

## 1. Project Overview

Build a premium-quality AI chatbot powered by the local Ollama LLM:

**Model:** `qwen2.5:5b`

The application will provide a specialized AI assistant capable of understanding user questions, maintaining conversational context, giving specific and relevant answers, refusing irrelevant or forbidden requests, and ending conversations naturally.

The application must feel like a **premium modern AI product**, not a basic chat interface.

---

# 2. Project Goal

Create a reliable AI assistant that:

1. Greets users naturally.
2. Responds accurately to user queries.
3. Provides specific, relevant, and useful answers.
4. Maintains conversation context.
5. Understands follow-up questions.
6. Refuses irrelevant, unsafe, or forbidden requests.
7. Handles unclear questions intelligently.
8. Ends conversations naturally and professionally.
9. Provides a premium, responsive, accessible UI.

The chatbot should prioritize:

**Relevance → Accuracy → Context → Safety → Clear Communication**

---

# 3. AI Assistant Personality

The assistant should behave as:

* Professional
* Helpful
* Specific
* Concise but informative
* Friendly
* Context-aware
* Non-judgmental
* Safety-conscious

Avoid:

* Excessive emojis
* Generic answers
* Repeating the same information
* Long unnecessary explanations
* Pretending to know information it does not know
* Making unsupported claims
* Answering unrelated questions when they fall outside the assistant's intended scope

---

# 4. Target Users

The chatbot should be usable by:

* Students
* Professionals
* Developers
* Researchers
* Business users
* General users seeking assistance within the assistant's defined scope

The interface should require no technical knowledge to operate.

---

# 5. Core AI Capabilities

## 5.1 Greeting

The assistant should recognize common greetings such as:

* Hi
* Hello
* Hey
* Good morning
* Good evening

Example behavior:

User:

> Hello

Assistant:

> Hello! 👋 How can I help you today?

The greeting should not unnecessarily trigger a long AI-generated explanation.

---

# 5.2 User Query Handling

For valid questions, the assistant should:

1. Understand the user's intent.
2. Consider previous conversation context.
3. Generate a relevant response.
4. Avoid unrelated information.
5. Clearly communicate uncertainty when necessary.

Responses should directly address the user's question.

---

# 5.3 Specific Responses

Avoid vague answers.

Bad:

> AI can be useful in many ways.

Better:

> Ollama allows you to run LLMs locally on your computer without sending prompts to a cloud API.

When appropriate, use:

* Bullet points
* Numbered steps
* Short sections
* Examples
* Code blocks for code
* Tables when comparisons are useful

---

# 5.4 Context Awareness

The chatbot MUST maintain conversation history.

Example:

User:

> What is Python?

Assistant:

> Python is a high-level programming language...

User:

> What is it used for?

The assistant must understand that "it" refers to Python.

The application should send relevant previous messages to Ollama with the current prompt.

Conversation history should contain:

```text
system
user
assistant
user
assistant
...
```

Do not treat every user message as an isolated request.

---

# 5.5 Follow-Up Questions

The assistant must understand:

* Pronouns
* References to previous answers
* Follow-up questions
* Corrections
* Clarifications
* Multi-turn conversations

Example:

```text
User:
What is React?

Assistant:
React is a JavaScript library...

User:
Is it good for dashboards?

Assistant:
Yes. React is well suited for dashboards because...
```

The assistant must preserve the meaning of previous turns.

---

# 6. Relevance Control

The assistant should remain within its defined purpose.

If a user asks something completely unrelated, the assistant should politely redirect the conversation.

Example:

User:

> Tell me a random joke.

Response:

> I’m focused on helping with your questions and tasks. If you have something you’d like to work on, feel free to ask.

Do not aggressively reject harmless requests.

The assistant should distinguish between:

* Valid requests
* Irrelevant requests
* Ambiguous requests
* Forbidden requests

---

# 7. Safety and Forbidden Requests

The assistant MUST NOT provide assistance that facilitates harmful, illegal, or dangerous activity.

Examples include requests involving:

* Malware creation
* Credential theft
* Phishing
* Cyber attacks
* Fraud
* Weapons construction
* Explosives
* Serious physical harm
* Illegal activity
* Instructions intended to bypass security protections

When refusing:

1. Do not provide the requested harmful instructions.
2. Keep the refusal concise.
3. Do not reproduce dangerous details.
4. When appropriate, offer a safe alternative.

Example:

> I can’t help with instructions for stealing credentials. I can help you learn how to secure accounts or build a legitimate authentication system.

---

# 8. Prompt Architecture

Use a system prompt to establish the assistant's behavior.

The system prompt should define:

* Assistant role
* Scope
* Personality
* Relevance rules
* Context behavior
* Safety behavior
* Response quality
* Uncertainty handling

Conceptually:

```text
System Prompt
      ↓
Conversation History
      ↓
Current User Message
      ↓
Qwen2.5:5b
      ↓
Assistant Response
```

The system prompt must NOT be exposed as a visible chat message.

---

# 9. Ollama Integration

Use Ollama as the local LLM runtime.

Required model:

```text
qwen2.5:5b
```

The application should communicate with Ollama through its local API.

Default Ollama endpoint:

```text
http://localhost:11434
```

Use the appropriate Ollama API endpoint for chat generation.

The model name must be configurable rather than scattered throughout the code.

Example configuration:

```text
OLLAMA_BASE_URL
OLLAMA_MODEL
```

Default:

```text
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:5b
```

Never hardcode sensitive configuration unnecessarily.

---

# 10. Architecture

Use a clean separation of responsibilities.

Recommended architecture:

```text
Frontend
   ↓
Chat UI
   ↓
Frontend API / Service Layer
   ↓
Backend
   ↓
Conversation Manager
   ↓
Ollama Client
   ↓
Qwen2.5:5b
   ↓
Response
   ↓
Frontend
```

Do not connect the UI directly to Ollama if the project uses a backend architecture.

The backend should control:

* Model requests
* System prompt
* Conversation history
* Validation
* Error handling
* Safety/relevance controls

---

# 11. Suggested Project Structure

Use the existing project structure if one already exists.

If starting from scratch, use a clean architecture similar to:

```text
project/
│
├── AGENT.md
├── README.md
├── .env
├── .gitignore
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   └── styles/
│
└── backend/
    ├── routes/
    ├── services/
    ├── models/
    ├── prompts/
    ├── utils/
    └── config/
```

Adapt this structure to the existing technology stack instead of blindly recreating it.

---

# 12. Chat API

Create a backend chat endpoint.

Conceptually:

```text
POST /api/chat
```

Request:

```json
{
  "message": "What is Python?",
  "conversationId": "conversation-id"
}
```

Response:

```json
{
  "message": "Python is...",
  "conversationId": "conversation-id"
}
```

The exact implementation should follow the selected backend framework.

---

# 13. Conversation Management

Each conversation should have an identifier.

Conceptually:

```text
Conversation
├── id
├── createdAt
└── messages
```

Messages:

```text
{
  role: "user",
  content: "..."
}

{
  role: "assistant",
  content: "..."
}
```

For the MVP, conversation persistence may use in-memory or local storage depending on architecture.

The code should be structured so a database can be added later.

---

# 14. Error Handling

The application must gracefully handle:

### Ollama unavailable

Display:

> Unable to connect to the AI service. Please make sure Ollama is running and try again.

### Model unavailable

Display:

> The selected AI model is currently unavailable. Please check that `qwen2.5:5b` is installed in Ollama.

### Empty message

Do not send empty messages.

### Network error

Show a clear retry option.

### Unexpected server error

Do not expose stack traces or internal implementation details to users.

---

# 15. Premium UI/UX Requirements

The chatbot must have a **premium AI SaaS-style interface**.

The design should communicate:

* Intelligence
* Trust
* Modern technology
* Simplicity
* Professional quality

Avoid making it look like a basic HTML chatbot.

---

# 16. Chat Interface

Main layout:

```text
┌─────────────────────────────────────────────┐
│ AI Assistant                         ● Online│
├─────────────────────────────────────────────┤
│                                             │
│  Assistant message                          │
│                                             │
│                         User message         │
│                                             │
│  Assistant message                          │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  Message AI...                       Send ↑ │
└─────────────────────────────────────────────┘
```

---

# 17. UI Components

Create reusable components such as:

```text
AppShell
ChatHeader
ChatWindow
MessageList
UserMessage
AssistantMessage
TypingIndicator
ChatInput
SendButton
WelcomeScreen
EmptyState
ErrorMessage
ConversationSidebar
ThemeToggle
```

Only create components that are actually needed.

---

# 18. Welcome Screen

When there is no conversation, display a premium welcome state.

Example:

```text
AI Assistant

Ask me anything within my area of expertise.

How can I help you today?
```

Provide suggested prompts.

Examples:

```text
Explain a technical concept
Help me solve a problem
Analyze an idea
Create a step-by-step plan
```

Clicking a suggestion should populate/send an appropriate message.

---

# 19. Message Design

Assistant messages and user messages must be visually distinct.

Assistant:

* Clean readable container
* AI/avatar indicator
* Markdown support
* Code block support

User:

* Visually distinct message bubble
* Right-aligned or clearly separated

Do not overuse rounded containers.

---

# 20. Markdown Support

Assistant responses should support:

* Headings
* Bold
* Italic
* Lists
* Numbered lists
* Links where appropriate
* Code blocks
* Inline code
* Tables where useful

Code blocks should have:

* Proper formatting
* Horizontal scrolling where necessary
* Copy button

Never render raw Markdown characters unnecessarily.

---

# 21. Typing / Loading State

While waiting for Ollama:

Display an elegant typing indicator.

Example:

```text
AI is thinking...
● ● ●
```

Disable duplicate submissions while a request is being processed unless cancellation is intentionally supported.

---

# 22. Streaming Responses

If supported by the chosen Ollama API implementation, prefer streaming responses.

Desired behavior:

```text
AI is generating...
↓
Text appears progressively
↓
Response completes
```

Do not make streaming mandatory if it significantly complicates the MVP.

Correctness and reliability are more important than streaming.

---

# 23. Chat Input

The input area should support:

* Multi-line text
* Enter to send
* Shift + Enter for new line
* Send button
* Disabled state while processing
* Empty-message prevention

On mobile, the input must remain easy to use.

---

# 24. Responsive Design

The application MUST work on:

* Desktop
* Laptop
* Tablet
* Mobile

On mobile:

* Sidebar should collapse.
* Chat should use the full available width.
* Input should remain accessible.
* Header should remain compact.
* Messages should not overflow the viewport.

No horizontal scrolling.

---

# 25. Accessibility

Implement basic accessibility:

* Semantic HTML
* Keyboard navigation
* Accessible buttons
* Visible focus states
* Proper labels
* Sufficient contrast
* Screen-reader-friendly status messages

Do not rely solely on color to communicate state.

---

# 26. Theme

Support a premium dark-first interface.

Preferred visual direction:

```text
Dark background
+
Subtle borders
+
Soft gradients
+
Minimal accent color
+
Clean typography
+
Subtle shadows
```

Do not use excessive gradients, glowing effects, or animations.

Animations should be subtle and purposeful.

If light mode is implemented, maintain the same design quality.

---

# 27. UX Details

Include:

* Auto-scroll to latest message
* Scroll-to-bottom behavior
* Clear loading state
* Error state
* Empty state
* Copy response button
* Clear conversation option
* New conversation option if sidebar exists

Do not unexpectedly delete conversations.

If clearing a conversation, ask for confirmation when appropriate.

---

# 28. Conversation Ending

The assistant should end conversations naturally.

If the user says:

* Thanks
* Thank you
* Bye
* Goodbye
* That's all

Respond naturally and briefly.

Example:

> You're welcome! Glad I could help. Have a great day!

Do not continue generating unnecessary information after the conversation has clearly ended.

---

# 29. Context Engineering / Scaffold Method

The AI coding agent must use this development process.

## SCAN

First inspect:

* AGENT.md
* package.json
* existing source
* dependencies
* environment configuration
* existing routes
* existing components

Understand before modifying.

---

## MAP

Map the system into:

```text
UI
↓
State
↓
API
↓
Conversation Manager
↓
Ollama
↓
Qwen2.5:5b
```

Identify where each responsibility belongs.

---

## SCAFFOLD

Create the minimum required architecture.

Do not build unnecessary infrastructure.

Create:

* UI shell
* Chat components
* API route
* Ollama service
* Conversation handling
* Prompt configuration
* Error handling

---

## IMPLEMENT

Implement in this order:

1. Project setup
2. Ollama connection
3. Backend chat endpoint
4. System prompt
5. Conversation context
6. Frontend chat UI
7. Message rendering
8. Loading state
9. Error handling
10. Responsive design
11. Premium visual polish

---

## VERIFY

Test:

```text
Greeting
↓
Question
↓
Answer
↓
Follow-up
↓
Context retention
↓
Irrelevant request
↓
Forbidden request
↓
Conversation ending
```

Also verify:

* Ollama unavailable
* Model unavailable
* Empty input
* Network failure
* Mobile UI
* Desktop UI
* Build
* Console errors

---

# 30. AI System Prompt Requirements

Create the system prompt in a dedicated configuration/prompt file.

The prompt should instruct Qwen to:

* Act as the defined specialized AI assistant.
* Answer the user's actual question.
* Stay relevant.
* Use conversation context.
* Ask for clarification only when necessary.
* Avoid inventing facts.
* State uncertainty when information is insufficient.
* Refuse harmful or forbidden requests.
* Redirect irrelevant requests politely.
* Keep responses readable.
* End conversations naturally.

Do not put the complete system prompt directly inside UI components.

---

# 31. Security Requirements

Never expose:

* API secrets
* Environment secrets
* Internal system prompts
* Server stack traces
* Private configuration

Validate incoming requests on the backend.

Do not trust frontend validation alone.

Implement reasonable message length limits to prevent abuse and accidental oversized requests.

---

# 32. Performance

The application should:

* Avoid unnecessary re-renders.
* Keep chat scrolling smooth.
* Prevent duplicate requests.
* Handle long conversations responsibly.
* Avoid sending unnecessary data to Ollama.

If conversation history becomes too large, implement a reasonable strategy such as:

* Context window management
* Message truncation
* Summarization

Only implement advanced context compression if required by the selected model/context limits.

---

# 33. MVP Scope

The MVP must include:

* Ollama integration
* Qwen2.5:5b
* Premium chat UI
* Greeting
* User queries
* Relevant answers
* Context retention
* Follow-up questions
* Relevance control
* Safety refusal
* Loading state
* Error handling
* Conversation ending
* Responsive design
* Markdown rendering
* Code block support
* Copy response
* New/clear conversation

Do NOT add unnecessary features such as:

* Authentication
* Payments
* Subscription plans
* Complex analytics
* Multi-user organizations
* Admin dashboards
* Cloud LLM APIs

unless explicitly requested later.

---

# 34. Future Expansion

Architecture should allow future additions:

* Multiple Ollama models
* Model selector
* Conversation database
* Authentication
* User accounts
* RAG
* Document upload
* Web search
* Voice input
* Voice output
* AI agents
* Tool calling
* Analytics
* Admin dashboard

Do not implement these in the MVP unless required.

---

# 35. Agent Rules

The AI coding agent MUST:

1. Read `AGENT.md` first.
2. Inspect the existing project before changing it.
3. Follow the existing stack when possible.
4. Use reusable components.
5. Keep business logic separate from UI.
6. Keep Ollama configuration centralized.
7. Keep the system prompt separate from UI code.
8. Maintain conversation history.
9. Handle errors gracefully.
10. Validate requests.
11. Protect secrets.
12. Avoid unnecessary dependencies.
13. Avoid unrelated changes.
14. Avoid fake functionality.
15. Test the complete user flow.
16. Fix discovered errors.
17. Prioritize reliability over unnecessary visual effects.
18. Do not expose internal prompts or implementation details to users.

---

# 36. Final Acceptance Criteria

The application is complete only when all of the following work.

## AI

* [ ] Ollama connects successfully.
* [ ] `qwen2.5:5b` responds successfully.
* [ ] Greeting works.
* [ ] User questions receive relevant responses.
* [ ] Responses are specific.
* [ ] Follow-up questions understand context.
* [ ] Conversation history is maintained.
* [ ] Irrelevant requests are redirected.
* [ ] Forbidden requests are refused safely.
* [ ] Goodbye/thank-you messages receive natural endings.

## Chat UI

* [ ] Premium visual design.
* [ ] Responsive desktop UI.
* [ ] Responsive mobile UI.
* [ ] Welcome screen.
* [ ] User message styling.
* [ ] Assistant message styling.
* [ ] Typing indicator.
* [ ] Error state.
* [ ] Auto-scroll.
* [ ] Markdown rendering.
* [ ] Code blocks.
* [ ] Copy response.
* [ ] Clear/new conversation.

## Backend

* [ ] Chat endpoint works.
* [ ] Ollama service is separated from routes.
* [ ] System prompt is centralized.
* [ ] Conversation context is preserved.
* [ ] Errors are handled.
* [ ] Secrets are not exposed.

## UX

The complete experience must work:

```text
Open Application
      ↓
Welcome Screen
      ↓
User Sends Greeting
      ↓
AI Responds
      ↓
User Asks Question
      ↓
AI Answers
      ↓
User Asks Follow-Up
      ↓
AI Uses Previous Context
      ↓
User Ends Conversation
      ↓
AI Responds Naturally
```

## Final Quality

Before completion:

* [ ] Run the application.
* [ ] Verify Ollama connection.
* [ ] Verify model response.
* [ ] Test multi-turn conversation.
* [ ] Test safety/relevance behavior.
* [ ] Test mobile layout.
* [ ] Test desktop layout.
* [ ] Check console errors.
* [ ] Check build errors.
* [ ] Fix all critical issues.

The project should feel like a **production-quality premium AI assistant MVP**, not a basic demonstration.
