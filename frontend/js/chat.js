const VGRO_STORAGE_KEYS = {
chats: "vgro:chats",
activeChat: "vgro:activeChat",
theme: "vgro:theme",
temperature: "vgro:temperature",
};

// Backend VGRO AI
const VGRO_BACKEND_URL =
"https://vgro-ai-super-complete-g7xg.vercel.app";

let state = {
chats: {},
activeChatId: null,
};

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
VGRO_I18N.applyToDocument();

```
loadTheme();
loadChats();
bindEvents();

renderSidebarHistory();
renderActiveChat();

document.addEventListener(
    "vgro:languagechange",
    renderActiveChat
);
```

});

// ============================================================
// SEND MESSAGE
// Frontend → Backend Vercel
// ============================================================

async function sendMessage(message, history) {
try {
const previousHistory = Array.isArray(history)
? history.slice(0, -1)
: [];

```
    const response = await fetch(
        `${VGRO_BACKEND_URL}/api/chat`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                message: message,
                history: previousHistory,
                language: VGRO_I18N.getActiveLang(),
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            `Backend error: ${response.status}`
        );
    }

    const data = await response.json();

    if (!data.reply) {
        throw new Error(
            "Backend tidak memberikan jawaban."
        );
    }

    return data.reply;

} catch (error) {
    console.error(
        "VGRO backend error:",
        error
    );

    return getConnectionErrorMessage();
}
```

}

// ============================================================
// CONNECTION ERROR MESSAGE
// ============================================================

function getConnectionErrorMessage() {
const lang = VGRO_I18N.getActiveLang();

```
if (lang === "id") {
    return "Maaf, VGRO sedang mengalami masalah saat menghubungkan ke server.";
}

return "Sorry, VGRO is having trouble connecting to the server.";
```

}

// ============================================================
// CHAT STORAGE
// ============================================================

function loadChats() {
try {
const saved = JSON.parse(
localStorage.getItem(
VGRO_STORAGE_KEYS.chats
) || "{}"
);

```
    state.chats = saved;
} catch {
    state.chats = {};
}

state.activeChatId =
    localStorage.getItem(
        VGRO_STORAGE_KEYS.activeChat
    );

if (
    !state.activeChatId ||
    !state.chats[state.activeChatId]
) {
    createNewChat(false);
}
```

}

function persistChats() {
localStorage.setItem(
VGRO_STORAGE_KEYS.chats,
JSON.stringify(state.chats)
);

```
localStorage.setItem(
    VGRO_STORAGE_KEYS.activeChat,
    state.activeChatId
);
```

}

function createNewChat(render = true) {
const id = `chat_${Date.now()}`;

```
state.chats[id] = {
    id,
    title: null,
    messages: [],
};

state.activeChatId = id;

persistChats();

if (render) {
    renderSidebarHistory();
    renderActiveChat();
    closeMobileSidebar();
}
```

}

function getActiveChat() {
return state.chats[state.activeChatId];
}

function deriveTitle(text) {
const trimmed = text.trim();

```
return trimmed.length > 38
    ? trimmed.slice(0, 38) + "…"
    : trimmed;
```

}

// ============================================================
// RENDER SIDEBAR HISTORY
// ============================================================

function renderSidebarHistory() {
const list =
document.getElementById("chatHistory");

```
if (!list) return;

const chats = Object.values(state.chats)
    .filter(
        (chat) => chat.messages.length > 0
    )
    .sort(
        (a, b) =>
            Number(b.id.split("_")[1]) -
            Number(a.id.split("_")[1])
    );

list.innerHTML = "";

if (!chats.length) {
    const empty =
        document.createElement("p");

    empty.className = "history-empty";

    empty.setAttribute(
        "data-i18n",
        "chat.noChats"
    );

    empty.textContent =
        VGRO_I18N.t("chat.noChats");

    list.appendChild(empty);

    return;
}

chats.forEach((chat) => {
    const button =
        document.createElement("button");

    button.className =
        "history-item" +
        (
            chat.id === state.activeChatId
                ? " active"
                : ""
        );

    button.textContent =
        chat.title ||
        deriveTitle(
            chat.messages[0].text
        );

    button.addEventListener(
        "click",
        () => {
            state.activeChatId =
                chat.id;

            persistChats();

            renderSidebarHistory();
            renderActiveChat();

            closeMobileSidebar();
        }
    );

    list.appendChild(button);
});
```

}

// ============================================================
// RENDER ACTIVE CHAT
// ============================================================

function renderActiveChat() {
const scroll =
document.getElementById("chatScroll");

```
if (!scroll) return;

const chat = getActiveChat();

scroll.innerHTML = "";

if (
    !chat ||
    chat.messages.length === 0
) {
    scroll.appendChild(
        buildEmptyState()
    );

    return;
}

chat.messages.forEach((message) => {
    scroll.appendChild(
        buildMessageRow(
            message.role,
            message.text
        )
    );
});

scroll.scrollTop =
    scroll.scrollHeight;
```

}

// ============================================================
// EMPTY STATE
// ============================================================

function buildEmptyState() {
const wrap =
document.createElement("div");

```
wrap.className = "chat-empty";

wrap.innerHTML = `
    <div
        class="orb-mini"
        aria-hidden="true"
    ></div>

    <h3 data-i18n="chat.emptyTitle">
        ${VGRO_I18N.t("chat.emptyTitle")}
    </h3>

    <p data-i18n="chat.emptyBody">
        ${VGRO_I18N.t("chat.emptyBody")}
    </p>
`;

return wrap;
```

}

// ============================================================
// MESSAGE ROW
// ============================================================

function buildMessageRow(role, text) {
const row =
document.createElement("div");

```
row.className =
    `msg-row ${role}`;

const avatar =
    document.createElement("div");

avatar.className =
    `avatar ${
        role === "user"
            ? "user"
            : "vgro"
    }`;

avatar.textContent =
    role === "user"
        ? VGRO_I18N
              .t("chat.you")
              .slice(0, 1)
        : "V";

const bubble =
    document.createElement("div");

bubble.className = "bubble";

bubble.textContent = text;

row.appendChild(avatar);
row.appendChild(bubble);

return row;
```

}

// ============================================================
// TYPING INDICATOR
// ============================================================

function buildTypingRow() {
const row =
document.createElement("div");

```
row.className = "msg-row vgro";
row.id = "typingRow";

row.innerHTML = `
    <div class="avatar vgro">
        V
    </div>

    <div class="bubble typing">
        <span></span>
        <span></span>
        <span></span>
    </div>
`;

return row;
```

}

// ============================================================
// SEND FLOW
// ============================================================

async function handleSend() {
const input =
document.getElementById("chatInput");

```
const text = input.value.trim();

if (!text) return;

const chat = getActiveChat();

if (!chat) return;

chat.messages.push({
    role: "user",
    text: text,
});

if (!chat.title) {
    chat.title = deriveTitle(text);
}

persistChats();

renderSidebarHistory();
renderActiveChat();

input.value = "";

autoGrow(input);
toggleSendButton();

const scroll =
    document.getElementById("chatScroll");

scroll.appendChild(
    buildTypingRow()
);

scroll.scrollTop =
    scroll.scrollHeight;

try {
    const reply = await sendMessage(
        text,
        chat.messages
    );

    document
        .getElementById("typingRow")
        ?.remove();

    chat.messages.push({
        role: "vgro",
        text: reply,
    });

    persistChats();
    renderActiveChat();

} catch (error) {
    document
        .getElementById("typingRow")
        ?.remove();

    chat.messages.push({
        role: "vgro",
        text: getConnectionErrorMessage(),
    });

    persistChats();
    renderActiveChat();

    console.error(
        "VGRO sendMessage error:",
        error
    );
}
```

}

// ============================================================
// TEXTAREA
// ============================================================

function autoGrow(textarea) {
textarea.style.height = "auto";

```
textarea.style.height =
    Math.min(
        textarea.scrollHeight,
        160
    ) + "px";
```

}

function toggleSendButton() {
const input =
document.getElementById("chatInput");

```
const button =
    document.getElementById("sendBtn");

if (!input || !button) return;

button.disabled =
    input.value.trim().length === 0;
```

}

// ============================================================
// THEME
// ============================================================

function loadTheme() {
const saved =
localStorage.getItem(
VGRO_STORAGE_KEYS.theme
) || "dark";

```
document.body.setAttribute(
    "data-theme",
    saved
);
```

}

function setTheme(theme) {
document.body.setAttribute(
"data-theme",
theme
);

```
localStorage.setItem(
    VGRO_STORAGE_KEYS.theme,
    theme
);

document
    .querySelectorAll(
        "[data-theme-option]"
    )
    .forEach((button) => {
        button.classList.toggle(
            "active",
            button.getAttribute(
                "data-theme-option"
            ) === theme
        );
    });
```

}

// ============================================================
// LANGUAGE
// ============================================================

function setLanguageMode(mode) {
VGRO_I18N.setMode(mode);

```
document
    .querySelectorAll(
        "[data-lang-option]"
    )
    .forEach((button) => {
        button.classList.toggle(
            "active",
            button.getAttribute(
                "data-lang-option"
            ) === mode
        );
    });
```

}

// ============================================================
// EVENT WIRING
// ============================================================

function bindEvents() {
const input =
document.getElementById("chatInput");

```
const sendBtn =
    document.getElementById("sendBtn");

const form =
    document.getElementById("chatForm");

const newChatBtn =
    document.getElementById("newChatBtn");

const clearChatBtn =
    document.getElementById(
        "clearChatBtn"
    );

const settingsBtn =
    document.getElementById(
        "settingsBtn"
    );

const settingsModal =
    document.getElementById(
        "settingsModal"
    );

const settingsClose =
    document.getElementById(
        "settingsClose"
    );

const sidebarToggle =
    document.getElementById(
        "sidebarToggle"
    );

const sidebar =
    document.getElementById(
        "chatSidebar"
    );

const sidebarBackdrop =
    document.getElementById(
        "sidebarBackdrop"
    );

if (input) {
    input.addEventListener(
        "input",
        () => {
            autoGrow(input);
            toggleSendButton();
        }
    );

    input.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                if (
                    !sendBtn.disabled
                ) {
                    handleSend();
                }
            }
        }
    );
}

if (form) {
    form.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            if (
                !sendBtn.disabled
            ) {
                handleSend();
            }
        }
    );
}

if (newChatBtn) {
    newChatBtn.addEventListener(
        "click",
        () => createNewChat()
    );
}

if (clearChatBtn) {
    clearChatBtn.addEventListener(
        "click",
        () => {
            const chat =
                getActiveChat();

            if (!chat) return;

            chat.messages = [];
            chat.title = null;

            persistChats();

            renderSidebarHistory();
            renderActiveChat();
        }
    );
}

if (
    settingsBtn &&
    settingsModal
) {
    settingsBtn.addEventListener(
        "click",
        () =>
            settingsModal.classList.add(
                "open"
            )
    );
}

if (
    settingsClose &&
    settingsModal
) {
    settingsClose.addEventListener(
        "click",
        () =>
            settingsModal.classList.remove(
                "open"
            )
    );
}

if (settingsModal) {
    settingsModal.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                settingsModal
            ) {
                settingsModal.classList.remove(
                    "open"
                );
            }
        }
    );
}

document
    .querySelectorAll(
        "[data-theme-option]"
    )
    .forEach((button) => {
        button.addEventListener(
            "click",
            () =>
                setTheme(
                    button.getAttribute(
                        "data-theme-option"
                    )
                )
        );

        if (
            button.getAttribute(
                "data-theme-option"
            ) ===
            document.body.getAttribute(
                "data-theme"
            )
        ) {
            button.classList.add(
                "active"
            );
        }
    });

document
    .querySelectorAll(
        "[data-lang-option]"
    )
    .forEach((button) => {
        button.addEventListener(
            "click",
            () =>
                setLanguageMode(
                    button.getAttribute(
                        "data-lang-option"
                    )
                )
        );

        if (
            button.getAttribute(
                "data-lang-option"
            ) ===
            VGRO_I18N.getMode()
        ) {
            button.classList.add(
                "active"
            );
        }
    });

if (sidebarToggle) {
    sidebarToggle.addEventListener(
        "click",
        () => {
            sidebar.classList.toggle(
                "open"
            );

            sidebarBackdrop.classList.toggle(
                "open"
            );
        }
    );
}

if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener(
        "click",
        closeMobileSidebar
    );
}

toggleSendButton();
```

}

// ============================================================
// MOBILE SIDEBAR
// ============================================================

function closeMobileSidebar() {
document
.getElementById("chatSidebar")
?.classList.remove("open");

```
document
    .getElementById("sidebarBackdrop")
    ?.classList.remove("open");
```

}
