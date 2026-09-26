/**
 * VGRO AI — chat.js
 * -----------------------------------------------------------------------
 * Everything the chat page needs: message rendering, localStorage-backed
 * chat history, settings, and the sendMessage() abstraction.
 *
 * HOW TO CONNECT A REAL BACKEND LATER
 * -----------------------------------------------------------------------
 * Right now sendMessage() resolves with a local mock reply. Once
 * backend/ is running (see backend/README.md), replace the body of
 * sendMessage() with a fetch call, for example:
 *
 *   async function sendMessage(message, history) {
 *     const res = await fetch("/api/chat", {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify({ message, history, language: VGRO_I18N.getActiveLang() }),
 *     });
 *     if (!res.ok) throw new Error("VGRO backend error");
 *     const data = await res.json();
 *     return data.reply;
 *   }
 *
 * No other part of this file needs to change: the rest of the UI only
 * ever calls sendMessage(text, history) and awaits a string back.
 * -----------------------------------------------------------------------
 */

const VGRO_STORAGE_KEYS = {
  chats: "vgro:chats",
  activeChat: "vgro:activeChat",
  theme: "vgro:theme",
  temperature: "vgro:temperature",
};

let state = {
  chats: {},        // { chatId: { id, title, messages: [{role, text}] } }
  activeChatId: null,
};

document.addEventListener("DOMContentLoaded", () => {
  VGRO_I18N.applyToDocument();
  loadTheme();
  loadChats();
  bindEvents();
  renderSidebarHistory();
  renderActiveChat();
  document.addEventListener("vgro:languagechange", renderActiveChat);
});

/* -------------------------------------------------------------------- */
/* sendMessage() — the ONE function to swap for real backend/Ollama use */
/* -------------------------------------------------------------------- */
async function sendMessage(message, history) {
  try {
    const res = await fetch("/api/chat", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message, history, language:VGRO_I18N.getActiveLang()})});
    if (!res.ok) throw new Error("Backend unavailable");
    const data = await res.json();
    return data.reply || "VGRO tidak memberikan jawaban.";
  } catch (e) {
    return mockReply(message, history);
  }
}

function mockReply(message) {
  const lang = VGRO_I18N.getActiveLang();
  const dict = VGRO_TRANSLATIONS[lang] || VGRO_TRANSLATIONS.en;
  const lower = message.toLowerCase();

  return new Promise((resolve) => {
    const delay = 700 + Math.random() * 900;
    setTimeout(() => {
      if (/machine learning|apa itu ml|belajar mesin/.test(lower)) {
        resolve(dict.mock.ml);
      } else if (/^(hai|halo|hi|hello|hey)\b/.test(lower.trim())) {
        resolve(dict.mock.greeting);
      } else {
        resolve(dict.mock.fallback);
      }
    }, delay);
  });
}

/* -------------------------------------------------------------------- */
/* Chat storage                                                          */
/* -------------------------------------------------------------------- */

function loadChats() {
  try {
    const saved = JSON.parse(localStorage.getItem(VGRO_STORAGE_KEYS.chats) || "{}");
    state.chats = saved;
  } catch {
    state.chats = {};
  }
  state.activeChatId = localStorage.getItem(VGRO_STORAGE_KEYS.activeChat);

  if (!state.activeChatId || !state.chats[state.activeChatId]) {
    createNewChat(false);
  }
}

function persistChats() {
  localStorage.setItem(VGRO_STORAGE_KEYS.chats, JSON.stringify(state.chats));
  localStorage.setItem(VGRO_STORAGE_KEYS.activeChat, state.activeChatId);
}

function createNewChat(render = true) {
  const id = `chat_${Date.now()}`;
  state.chats[id] = { id, title: null, messages: [] };
  state.activeChatId = id;
  persistChats();
  if (render) {
    renderSidebarHistory();
    renderActiveChat();
    closeMobileSidebar();
  }
}

function getActiveChat() {
  return state.chats[state.activeChatId];
}

function deriveTitle(text) {
  const trimmed = text.trim();
  return trimmed.length > 38 ? trimmed.slice(0, 38) + "…" : trimmed;
}

/* -------------------------------------------------------------------- */
/* Rendering                                                             */
/* -------------------------------------------------------------------- */

function renderSidebarHistory() {
  const list = document.getElementById("chatHistory");
  if (!list) return;
  const chats = Object.values(state.chats)
    .filter((c) => c.messages.length > 0)
    .sort((a, b) => Number(b.id.split("_")[1]) - Number(a.id.split("_")[1]));

  list.innerHTML = "";

  if (!chats.length) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.setAttribute("data-i18n", "chat.noChats");
    empty.textContent = VGRO_I18N.t("chat.noChats");
    list.appendChild(empty);
    return;
  }

  chats.forEach((chat) => {
    const btn = document.createElement("button");
    btn.className = "history-item" + (chat.id === state.activeChatId ? " active" : "");
    btn.textContent = chat.title || deriveTitle(chat.messages[0].text);
    btn.addEventListener("click", () => {
      state.activeChatId = chat.id;
      persistChats();
      renderSidebarHistory();
      renderActiveChat();
      closeMobileSidebar();
    });
    list.appendChild(btn);
  });
}

function renderActiveChat() {
  const scroll = document.getElementById("chatScroll");
  if (!scroll) return;
  const chat = getActiveChat();
  scroll.innerHTML = "";

  if (!chat || chat.messages.length === 0) {
    scroll.appendChild(buildEmptyState());
    return;
  }

  chat.messages.forEach((msg) => scroll.appendChild(buildMessageRow(msg.role, msg.text)));
  scroll.scrollTop = scroll.scrollHeight;
}

function buildEmptyState() {
  const wrap = document.createElement("div");
  wrap.className = "chat-empty";
  wrap.innerHTML = `
    <div class="orb-mini" aria-hidden="true"></div>
    <h3 data-i18n="chat.emptyTitle">${VGRO_I18N.t("chat.emptyTitle")}</h3>
    <p data-i18n="chat.emptyBody">${VGRO_I18N.t("chat.emptyBody")}</p>
  `;
  return wrap;
}

function buildMessageRow(role, text) {
  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${role === "user" ? "user" : "vgro"}`;
  avatar.textContent = role === "user" ? VGRO_I18N.t("chat.you").slice(0, 1) : "V";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.appendChild(avatar);
  row.appendChild(bubble);
  return row;
}

function buildTypingRow() {
  const row = document.createElement("div");
  row.className = "msg-row vgro";
  row.id = "typingRow";
  row.innerHTML = `
    <div class="avatar vgro">V</div>
    <div class="bubble typing"><span></span><span></span><span></span></div>
  `;
  return row;
}

/* -------------------------------------------------------------------- */
/* Sending flow                                                          */
/* -------------------------------------------------------------------- */

async function handleSend() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;

  const chat = getActiveChat();
  chat.messages.push({ role: "user", text });
  if (!chat.title) chat.title = deriveTitle(text);
  persistChats();
  renderSidebarHistory();
  renderActiveChat();

  input.value = "";
  autoGrow(input);
  toggleSendButton();

  const scroll = document.getElementById("chatScroll");
  scroll.appendChild(buildTypingRow());
  scroll.scrollTop = scroll.scrollHeight;

  try {
    const reply = await sendMessage(text, chat.messages);
    document.getElementById("typingRow")?.remove();
    chat.messages.push({ role: "vgro", text: reply });
    persistChats();
    renderActiveChat();
  } catch (err) {
    document.getElementById("typingRow")?.remove();
    chat.messages.push({ role: "vgro", text: VGRO_I18N.t("mock.fallback") });
    persistChats();
    renderActiveChat();
    console.error("VGRO sendMessage error:", err);
  }
}

function autoGrow(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
}

function toggleSendButton() {
  const input = document.getElementById("chatInput");
  const btn = document.getElementById("sendBtn");
  btn.disabled = input.value.trim().length === 0;
}

/* -------------------------------------------------------------------- */
/* Settings: theme / language / temperature                             */
/* -------------------------------------------------------------------- */

function loadTheme() {
  const saved = localStorage.getItem(VGRO_STORAGE_KEYS.theme) || "dark";
  document.body.setAttribute("data-theme", saved);
}

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem(VGRO_STORAGE_KEYS.theme, theme);
  document.querySelectorAll("[data-theme-option]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-theme-option") === theme);
  });
}

function setLanguageMode(mode) {
  VGRO_I18N.setMode(mode);
  document.querySelectorAll("[data-lang-option]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang-option") === mode);
  });
}

/* -------------------------------------------------------------------- */
/* Event wiring                                                          */
/* -------------------------------------------------------------------- */

function bindEvents() {
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const form = document.getElementById("chatForm");
  const newChatBtn = document.getElementById("newChatBtn");
  const clearChatBtn = document.getElementById("clearChatBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const settingsClose = document.getElementById("settingsClose");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("chatSidebar");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");

  input.addEventListener("input", () => {
    autoGrow(input);
    toggleSendButton();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) handleSend();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!sendBtn.disabled) handleSend();
  });

  newChatBtn.addEventListener("click", () => createNewChat());

  clearChatBtn.addEventListener("click", () => {
    const chat = getActiveChat();
    if (!chat) return;
    chat.messages = [];
    chat.title = null;
    persistChats();
    renderSidebarHistory();
    renderActiveChat();
  });

  settingsBtn.addEventListener("click", () => settingsModal.classList.add("open"));
  settingsClose.addEventListener("click", () => settingsModal.classList.remove("open"));
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove("open");
  });

  document.querySelectorAll("[data-theme-option]").forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.getAttribute("data-theme-option")));
    if (btn.getAttribute("data-theme-option") === document.body.getAttribute("data-theme")) {
      btn.classList.add("active");
    }
  });

  document.querySelectorAll("[data-lang-option]").forEach((btn) => {
    btn.addEventListener("click", () => setLanguageMode(btn.getAttribute("data-lang-option")));
    if (btn.getAttribute("data-lang-option") === VGRO_I18N.getMode()) {
      btn.classList.add("active");
    }
  });

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      sidebarBackdrop.classList.toggle("open");
    });
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", closeMobileSidebar);
  }

  toggleSendButton();
}

function closeMobileSidebar() {
  document.getElementById("chatSidebar")?.classList.remove("open");
  document.getElementById("sidebarBackdrop")?.classList.remove("open");
}
