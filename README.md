# VGRO AI — Super Complete Unified

VGRO AI is a single website built by combining the Super Complete visual landing experience with the Full Stack Starter chat/backend.

## User flow
1. `index.html` — premium landing page.
2. Click **Start chatting / Try VGRO** → a completely separate page, no scroll-to-chat.
3. `auth.html` — Login or Create account.
4. Successful login → `app.html` — full AI workspace with chat history, settings, language, theme and logout.

## Run
Requirements: Node.js 18+.

```bash
cd backend
npm install
node server.js
```
Open: `http://localhost:3001`

## Ollama
Copy `.env.example` to `.env`, then enable Ollama:

`OLLAMA_ENABLED=true`

Set `OLLAMA_MODEL` to a model installed on your machine.

## Note
The login/register system in this demo is client-side prototype authentication using localStorage. For production, replace it with real server-side authentication and a database.
