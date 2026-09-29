"use strict";

// ============================================================
// VGRO STORAGE
// ============================================================

const VGRO_STORAGE_KEYS = {
    chats: "vgro:chats",
    activeChat: "vgro:activeChat",
    theme: "vgro:theme",
    temperature: "vgro:temperature"
};

// ============================================================
// BACKEND VGRO AI
// ============================================================

const VGRO_BACKEND_URL =
    "https://vgro-ai-super-complete-g7xg.vercel.app";

// ============================================================
// SUPABASE CHAT SYNC - PHASE 2
// ============================================================

async function getSupabaseSession() {
    try {
        if (typeof supabaseClient === "undefined" || !supabaseClient.auth) return null;
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.warn("[VGRO SUPABASE] Session error:", error);
            return null;
        }
        return data?.session || null;
    } catch (error) {
        console.warn("[VGRO SUPABASE] Gagal mengambil session:", error);
        return null;
    }
}

async function loadChatsFromSupabase() {
    try {
        const session = await getSupabaseSession();
        if (!session?.user?.id) return false;

        const { data: chats, error: chatError } = await supabaseClient
            .from("chats")
            .select("id, title, created_at, updated_at")
            .eq("user_id", session.user.id)
            .order("updated_at", { ascending: false });

        if (chatError) {
            console.warn("[VGRO SUPABASE] Gagal mengambil chats:", chatError);
            return false;
        }
        if (!Array.isArray(chats) || chats.length === 0) return false;

        const chatIds = chats.map((chat) => chat.id);
        const { data: messages, error: messageError } = await supabaseClient
            .from("messages")
            .select("id, chat_id, role, content, created_at")
            .in("chat_id", chatIds)
            .order("created_at", { ascending: true });

        if (messageError) {
            console.warn("[VGRO SUPABASE] Gagal mengambil messages:", messageError);
            return false;
        }

        const grouped = {};
        chats.forEach((chat) => {
            grouped[chat.id] = {
                id: chat.id,
                title: chat.title || null,
                messages: []
            };
        });

        (messages || []).forEach((message) => {
            if (!grouped[message.chat_id]) return;
            grouped[message.chat_id].messages.push({
                role: message.role === "assistant" ? "vgro" : "user",
                text: message.content || ""
            });
        });

        state.chats = grouped;
        const savedActive = localStorage.getItem(VGRO_STORAGE_KEYS.activeChat);
        state.activeChatId = savedActive && grouped[savedActive]
            ? savedActive
            : chats[0]?.id || null;

        if (!state.activeChatId) return false;

        localStorage.setItem(VGRO_STORAGE_KEYS.chats, JSON.stringify(state.chats));
        localStorage.setItem(VGRO_STORAGE_KEYS.activeChat, state.activeChatId);
        return true;
    } catch (error) {
        console.warn("[VGRO SUPABASE] Sync history gagal:", error);
        return false;
    }
}

async function createSupabaseChat(title) {
    try {
        const session = await getSupabaseSession();
        if (!session?.user?.id) return null;

        const { data, error } = await supabaseClient
            .from("chats")
            .insert({ user_id: session.user.id, title: title || "New Chat" })
            .select("id, title")
            .single();

        if (error) {
            console.warn("[VGRO SUPABASE] Gagal membuat chat:", error);
            return null;
        }
        return data;
    } catch (error) {
        console.warn("[VGRO SUPABASE] Create chat error:", error);
        return null;
    }
}

async function saveSupabaseMessage(chatId, role, content) {
    try {
        if (!chatId || !content) return false;
        const session = await getSupabaseSession();
        if (!session?.user?.id) return false;

        const { error } = await supabaseClient
            .from("messages")
            .insert({
                chat_id: chatId,
                user_id: session.user.id,
                role: role === "vgro" ? "assistant" : "user",
                content: content
            });

        if (error) {
            console.warn("[VGRO SUPABASE] Gagal menyimpan message:", error);
            return false;
        }
        return true;
    } catch (error) {
        console.warn("[VGRO SUPABASE] Save message error:", error);
        return false;
    }
}

async function updateSupabaseChat(chatId, title) {
    try {
        if (!chatId) return false;
        const payload = { updated_at: new Date().toISOString() };
        if (title) payload.title = title;

        const { error } = await supabaseClient
            .from("chats")
            .update(payload)
            .eq("id", chatId);

        if (error) {
            console.warn("[VGRO SUPABASE] Gagal update chat:", error);
            return false;
        }
        return true;
    } catch (error) {
        console.warn("[VGRO SUPABASE] Update chat error:", error);
        return false;
    }
}

// ============================================================
// CHAT STATE
// ============================================================

let state = {
    chats: {},
    activeChatId: null
};

let isSending = false;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("[VGRO CHAT] Chat JS berhasil dimuat.");

    // Jalankan sistem bahasa jika tersedia
    if (
        typeof VGRO_I18N !== "undefined" &&
        typeof VGRO_I18N.applyToDocument === "function"
    ) {
        VGRO_I18N.applyToDocument();
    }

    loadTheme();
    loadChats();
    bindEvents();
    renderSidebarHistory();
    renderActiveChat();

    // Phase 2: gunakan history Supabase jika user sudah login.
    // Jika tidak tersedia, localStorage tetap dipakai.
    loadChatsFromSupabase().then((loaded) => {
        if (loaded) {
            renderSidebarHistory();
            renderActiveChat();
        }
    });

    document.addEventListener("vgro:languagechange", () => {
        renderSidebarHistory();
        renderActiveChat();
    });
});

// ============================================================
// SEND MESSAGE TO BACKEND
// ============================================================

async function sendMessage(message, history) {
    try {
        const previousHistory =
            Array.isArray(history)
                ? history.slice(0, -1)
                : [];

        let language = "auto";

        if (
            typeof VGRO_I18N !== "undefined" &&
            typeof VGRO_I18N.getActiveLang === "function"
        ) {
            language = VGRO_I18N.getActiveLang();
        }

        console.log("[VGRO] Mengirim pesan ke backend...");

        const response = await fetch(
            `${VGRO_BACKEND_URL}/api/chat`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    history: previousHistory,
                    language: language
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                `Backend error: ${response.status}`
            );
        }

        const data = await response.json();

        console.log("[VGRO] Response backend:", data);

        if (!data.reply) {
            throw new Error(
                "Backend tidak memberikan jawaban."
            );
        }

        return data.reply;

    } catch (error) {
        console.error(
            "[VGRO BACKEND ERROR]",
            error
        );

        throw error;
    }
}

// ============================================================
// CONNECTION ERROR
// ============================================================

function getConnectionErrorMessage() {
    let language = "id";

    if (
        typeof VGRO_I18N !== "undefined" &&
        typeof VGRO_I18N.getActiveLang === "function"
    ) {
        language = VGRO_I18N.getActiveLang();
    }

    if (language === "id") {
        return "Maaf, VGRO sedang mengalami masalah saat menghubungkan ke server.";
    }

    return "Sorry, VGRO is having trouble connecting to the server.";
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

        state.chats =
            saved && typeof saved === "object"
                ? saved
                : {};

    } catch (error) {
        console.error(
            "[VGRO CHAT] Gagal membaca chat:",
            error
        );

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
}

// ============================================================
// PERSIST CHAT
// ============================================================

function persistChats() {
    try {
        localStorage.setItem(
            VGRO_STORAGE_KEYS.chats,
            JSON.stringify(state.chats)
        );

        if (state.activeChatId) {
            localStorage.setItem(
                VGRO_STORAGE_KEYS.activeChat,
                state.activeChatId
            );
        }

    } catch (error) {
        console.error(
            "[VGRO CHAT] Gagal menyimpan chat:",
            error
        );
    }
}

// ============================================================
// CREATE NEW CHAT
// ============================================================

function createNewChat(render = true) {
    const id =
        `chat_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;

    state.chats[id] = {
        id: id,
        title: null,
        messages: []
    };

    state.activeChatId = id;

    persistChats();

    if (render) {
        renderSidebarHistory();
        renderActiveChat();
        closeMobileSidebar();

        const input =
            document.getElementById("chatInput");

        if (input) {
            input.value = "";
            autoGrow(input);
            toggleSendButton();
            input.focus();
        }
    }
}

// ============================================================
// GET ACTIVE CHAT
// ============================================================

function getActiveChat() {
    return state.chats[state.activeChatId];
}

// ============================================================
// CHAT TITLE
// ============================================================

function deriveTitle(text) {
    const trimmed = String(text || "").trim();

    if (trimmed.length > 38) {
        return trimmed.slice(0, 38) + "…";
    }

    return trimmed || "New Chat";
}

// ============================================================
// SIDEBAR HISTORY
// ============================================================

function renderSidebarHistory() {
    const list =
        document.getElementById("chatHistory");

    if (!list) {
        return;
    }

    const chats =
        Object.values(state.chats)
            .filter(
                (chat) =>
                    Array.isArray(chat.messages) &&
                    chat.messages.length > 0
            )
            .sort((a, b) => {
                const aTime =
                    Number(
                        String(a.id).split("_")[1]
                    ) || 0;

                const bTime =
                    Number(
                        String(b.id).split("_")[1]
                    ) || 0;

                return bTime - aTime;
            });

    list.innerHTML = "";

    if (!chats.length) {
        const empty =
            document.createElement("p");

        empty.className =
            "history-empty";

        if (
            typeof VGRO_I18N !== "undefined" &&
            typeof VGRO_I18N.t === "function"
        ) {
            empty.textContent =
                VGRO_I18N.t("chat.noChats");
        } else {
            empty.textContent =
                "Belum ada percakapan.";
        }

        list.appendChild(empty);
        return;
    }

    chats.forEach((chat) => {
        const button =
            document.createElement("button");

        button.type = "button";

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
                chat.messages[0]?.text || ""
            );

        button.addEventListener(
            "click",
            () => {
                if (isSending) {
                    return;
                }

                state.activeChatId =
                    chat.id;

                persistChats();
                renderSidebarHistory();
                renderActiveChat();
                closeMobileSidebar();

                const input =
                    document.getElementById(
                        "chatInput"
                    );

                if (input) {
                    input.focus();
                }
            }
        );

        list.appendChild(button);
    });
}

// ============================================================
// RENDER ACTIVE CHAT
// ============================================================

function renderActiveChat() {
    const scroll =
        document.getElementById("chatScroll");

    if (!scroll) {
        return;
    }

    const chat =
        getActiveChat();

    scroll.innerHTML = "";

    if (
        !chat ||
        !Array.isArray(chat.messages) ||
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
}

// ============================================================
// EMPTY STATE
// ============================================================

function buildEmptyState() {
    const wrap =
        document.createElement("div");

    wrap.className =
        "chat-empty";

    let title =
        "How can I help you?";

    let body =
        "Tulis pesan untuk mulai menggunakan VGRO AI.";

    if (
        typeof VGRO_I18N !== "undefined" &&
        typeof VGRO_I18N.t === "function"
    ) {
        title =
            VGRO_I18N.t(
                "chat.emptyTitle"
            );

        body =
            VGRO_I18N.t(
                "chat.emptyBody"
            );
    }

    const orb =
        document.createElement("div");

    orb.className =
        "orb-mini";

    orb.setAttribute(
        "aria-hidden",
        "true"
    );

    const heading =
        document.createElement("h3");

    heading.textContent =
        title;

    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        body;

    wrap.appendChild(orb);
    wrap.appendChild(heading);
    wrap.appendChild(paragraph);

    return wrap;
}

// ============================================================
// MESSAGE ROW
// ============================================================

function buildMessageRow(role, text) {
    const row =
        document.createElement("div");

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

    if (role === "user") {
        let you = "U";

        if (
            typeof VGRO_I18N !== "undefined" &&
            typeof VGRO_I18N.t === "function"
        ) {
            const translated =
                VGRO_I18N.t("chat.you");

            if (translated) {
                you =
                    translated.slice(0, 1);
            }
        }

        avatar.textContent =
            you;
    } else {
        avatar.textContent =
            "V";
    }

    const bubble =
        document.createElement("div");

    bubble.className =
        "bubble";

    bubble.textContent =
        text;

    row.appendChild(avatar);
    row.appendChild(bubble);

    return row;
}

// ============================================================
// TYPING INDICATOR
// ============================================================

function buildTypingRow() {
    const row =
        document.createElement("div");

    row.className =
        "msg-row vgro";

    row.id =
        "typingRow";

    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar vgro";

    avatar.textContent =
        "V";

    const bubble =
        document.createElement("div");

    bubble.className =
        "bubble typing";

    for (let i = 0; i < 3; i++) {
        const dot =
            document.createElement("span");

        bubble.appendChild(dot);
    }

    row.appendChild(avatar);
    row.appendChild(bubble);

    return row;
}

// ============================================================
// SEND FLOW
// ============================================================

async function handleSend() {
    if (isSending) {
        return;
    }

    const input = document.getElementById("chatInput");

    if (!input) {
        console.error("[VGRO] chatInput tidak ditemukan.");
        return;
    }

    const text = input.value.trim();

    if (!text) {
        return;
    }

    let chat = getActiveChat();

    if (!chat) {
        createNewChat(false);
        chat = getActiveChat();
    }

    if (!chat) {
        return;
    }

    isSending = true;

    // Simpan pesan user ke state/localStorage seperti sebelumnya.
    chat.messages.push({
        role: "user",
        text: text
    });

    // Buat judul chat otomatis.
    if (!chat.title) {
        chat.title = deriveTitle(text);
    }

    persistChats();
    renderSidebarHistory();
    renderActiveChat();

    input.value = "";
    autoGrow(input);
    toggleSendButton();

    const scroll = document.getElementById("chatScroll");

    if (scroll) {
        scroll.appendChild(buildTypingRow());
        scroll.scrollTop = scroll.scrollHeight;
    }

    // Supabase hanya tambahan. Backend Gemini tetap dipakai seperti sebelumnya.
    let supabaseChatId = String(chat.id).startsWith("chat_") ? null : chat.id;

    try {
        const session = await getSupabaseSession();

        if (session?.user?.id && !supabaseChatId) {
            const createdChat = await createSupabaseChat(chat.title);

            if (createdChat?.id) {
                supabaseChatId = createdChat.id;

                delete state.chats[chat.id];
                chat.id = supabaseChatId;
                state.chats[supabaseChatId] = chat;
                state.activeChatId = supabaseChatId;
                persistChats();
            }
        }

        if (supabaseChatId) {
            await saveSupabaseMessage(supabaseChatId, "user", text);
            await updateSupabaseChat(supabaseChatId, chat.title);
        }

        // BACKEND GEMINI - TETAP SAMA
        const reply = await sendMessage(text, chat.messages);

        document.getElementById("typingRow")?.remove();

        chat.messages.push({
            role: "vgro",
            text: reply
        });

        persistChats();
        renderActiveChat();

        if (supabaseChatId) {
            await saveSupabaseMessage(supabaseChatId, "vgro", reply);
            await updateSupabaseChat(supabaseChatId);
        }
    } catch (error) {
        console.error("[VGRO SEND ERROR]", error);

        document.getElementById("typingRow")?.remove();

        chat.messages.push({
            role: "vgro",
            text: getConnectionErrorMessage()
        });

        persistChats();
        renderActiveChat();
    } finally {
        isSending = false;
        toggleSendButton();

        const currentInput = document.getElementById("chatInput");

        if (currentInput) {
            currentInput.focus();
        }
    }
}

// ============================================================
// TEXTAREA
// ============================================================

function autoGrow(textarea) {
    if (!textarea) {
        return;
    }

    textarea.style.height =
        "auto";

    textarea.style.height =
        Math.min(
            textarea.scrollHeight,
            160
        ) + "px";
}

function toggleSendButton() {
    const input =
        document.getElementById(
            "chatInput"
        );

    const button =
        document.getElementById(
            "sendBtn"
        );

    if (!input || !button) {
        return;
    }

    button.disabled =
        isSending ||
        input.value.trim().length === 0;

    if (isSending) {
        button.setAttribute(
            "aria-busy",
            "true"
        );
    } else {
        button.removeAttribute(
            "aria-busy"
        );
    }
}

// ============================================================
// THEME
// ============================================================

function loadTheme() {
    const saved =
        localStorage.getItem(
            VGRO_STORAGE_KEYS.theme
        ) || "dark";

    document.body.setAttribute(
        "data-theme",
        saved
    );

    updateThemeButtons(saved);
}

function setTheme(theme) {
    if (!theme) {
        return;
    }

    document.body.setAttribute(
        "data-theme",
        theme
    );

    localStorage.setItem(
        VGRO_STORAGE_KEYS.theme,
        theme
    );

    updateThemeButtons(theme);
}

function updateThemeButtons(theme) {
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
}

// ============================================================
// LANGUAGE
// ============================================================

function setLanguageMode(mode) {
    if (
        typeof VGRO_I18N === "undefined" ||
        typeof VGRO_I18N.setMode !== "function"
    ) {
        return;
    }

    VGRO_I18N.setMode(mode);

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
}

// ============================================================
// EVENT WIRING
// ============================================================

function bindEvents() {
    const input =
        document.getElementById(
            "chatInput"
        );

    const sendBtn =
        document.getElementById(
            "sendBtn"
        );

    const form =
        document.getElementById(
            "chatForm"
        );

    const newChatBtn =
        document.getElementById(
            "newChatBtn"
        );

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

    console.log(
        "[VGRO] Event binding:",
        {
            input: !!input,
            sendBtn: !!sendBtn,
            form: !!form,
            newChatBtn: !!newChatBtn,
            clearChatBtn: !!clearChatBtn,
            settingsBtn: !!settingsBtn
        }
    );

    // ========================================================
    // INPUT
    // ========================================================

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
                        !isSending &&
                        sendBtn &&
                        !sendBtn.disabled
                    ) {
                        handleSend();
                    }
                }
            }
        );
    }

    // ========================================================
    // FORM
    // ========================================================

    if (form) {
        form.addEventListener(
            "submit",
            (event) => {
                event.preventDefault();

                if (
                    !isSending &&
                    sendBtn &&
                    !sendBtn.disabled
                ) {
                    handleSend();
                }
            }
        );
    }

    // ========================================================
    // SEND BUTTON
    // ========================================================

    if (sendBtn) {
        sendBtn.addEventListener(
            "click",
            (event) => {
                event.preventDefault();

                if (
                    !isSending &&
                    !sendBtn.disabled
                ) {
                    handleSend();
                }
            }
        );
    }

    // ========================================================
    // NEW CHAT
    // ========================================================

    if (newChatBtn) {
        newChatBtn.addEventListener(
            "click",
            () => {
                if (isSending) {
                    return;
                }

                createNewChat();
            }
        );
    }

    // ========================================================
    // CLEAR CHAT
    // ========================================================

    if (clearChatBtn) {
        clearChatBtn.addEventListener(
            "click",
            () => {
                if (isSending) {
                    return;
                }

                const chat =
                    getActiveChat();

                if (!chat) {
                    return;
                }

                chat.messages = [];
                chat.title = null;

                persistChats();
                renderSidebarHistory();
                renderActiveChat();

                const input =
                    document.getElementById(
                        "chatInput"
                    );

                if (input) {
                    input.value = "";
                    autoGrow(input);
                    toggleSendButton();
                    input.focus();
                }
            }
        );
    }

    // ========================================================
    // SETTINGS OPEN
    // ========================================================

    if (
        settingsBtn &&
        settingsModal
    ) {
        settingsBtn.addEventListener(
            "click",
            () => {
                settingsModal.classList.add(
                    "open"
                );
            }
        );
    }

    // ========================================================
    // SETTINGS CLOSE
    // ========================================================

    if (
        settingsClose &&
        settingsModal
    ) {
        settingsClose.addEventListener(
            "click",
            () => {
                settingsModal.classList.remove(
                    "open"
                );
            }
        );
    }

    // ========================================================
    // CLICK OUTSIDE SETTINGS
    // ========================================================

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

    // ========================================================
    // THEME BUTTONS
    // ========================================================

    document
        .querySelectorAll(
            "[data-theme-option]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    setTheme(
                        button.getAttribute(
                            "data-theme-option"
                        )
                    );
                }
            );
        });

    // ========================================================
    // LANGUAGE BUTTONS
    // ========================================================

    document
        .querySelectorAll(
            "[data-lang-option]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    setLanguageMode(
                        button.getAttribute(
                            "data-lang-option"
                        )
                    );
                }
            );
        });

    // ========================================================
    // MOBILE SIDEBAR
    // ========================================================

    if (
        sidebarToggle &&
        sidebar &&
        sidebarBackdrop
    ) {
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

    autoGrow(input);
    toggleSendButton();
}

// ============================================================
// CLOSE MOBILE SIDEBAR
// ============================================================

function closeMobileSidebar() {
    document
        .getElementById(
            "chatSidebar"
        )
        ?.classList.remove(
            "open"
        );

    document
        .getElementById(
            "sidebarBackdrop"
        )
        ?.classList.remove(
            "open"
        );
}