/**
 * VGRO AI — Translation dictionary
 * -----------------------------------------------------------------------
 * Add a new language by adding one more key (e.g. "ja") with the same
 * shape as "id" / "en" below. No other file needs to change: every page
 * pulls its strings through i18n.t("some.key").
 * -----------------------------------------------------------------------
 */

const VGRO_TRANSLATIONS = {
  id: {
    nav: {
      home: "Beranda",
      about: "Tentang",
      capabilities: "Kemampuan",
      aiCore: "AI Core",
      chat: "Chat",
      startChat: "Mulai Chat",
    },
    hero: {
      eyebrow: "VGRO AI / SISTEM INTELIGENSI PERSONAL",
      headline1: "GENERASI BERIKUTNYA",
      headline2: "AI PERSONAL ANDA",
      body: "Kenalan dengan VGRO AI — asisten personal cerdas yang dibangun untuk berpikir, berkarya, menulis kode, belajar, dan bertumbuh bersamamu.",
      ctaPrimary: "Mulai Chat",
      ctaSecondary: "Jelajahi VGRO",
    },
    about: {
      eyebrow: "APA ITU VGRO?",
      headline: "AI YANG DIBUAT UNTUKMU.",
      body: "VGRO AI adalah sistem inteligensi personal yang membantumu berpikir, berkarya, belajar, memecahkan masalah, dan membangun sesuatu lebih cepat — semuanya dalam satu antarmuka yang terasa hidup.",
    },
    capabilities: {
      eyebrow: "APA YANG BISA VGRO LAKUKAN?",
      headline: "SATU AI, EMPAT KEKUATAN.",
      think: { title: "PIKIR", desc: "Menalar masalah kompleks selangkah demi selangkah." },
      create: { title: "CIPTA", desc: "Mengubah ide menjadi sesuatu yang nyata." },
      code: { title: "KODE", desc: "Membangun dan men-debug perangkat lunak lebih cepat." },
      learn: { title: "BELAJAR", desc: "Memahami topik dan konsep baru dengan mudah." },
    },
    core: {
      eyebrow: "THE AI CORE",
      headline: "SATU ANTARMUKA. RIBUAN KEMUNGKINAN.",
      body: "Di balik VGRO ada satu inti yang menghubungkan setiap kemampuan — merespons konteks, mengingat percakapan, dan beradaptasi dengan caramu bekerja.",
    },
    local: {
      eyebrow: "LOKAL / PRIVAT / TERKENDALI",
      headline1: "AI-MU.",
      headline2: "MESIN-MU.",
      headline3: "ATURAN-MU.",
      body: "VGRO dirancang agar suatu saat dapat berjalan di atas model open-weight secara lokal — tanpa mengirim setiap percakapanmu ke server pihak ketiga.",
      flowUser: "PERANGKAT PENGGUNA",
      flowApi: "VGRO API",
      flowOllama: "OLLAMA",
      flowModel: "MODEL AI",
      point1title: "AI Lokal",
      point1desc: "Model berjalan di infrastruktur yang kamu kendalikan.",
      point2title: "Inferensi Privat",
      point2desc: "Percakapan tidak wajib meninggalkan mesinmu sendiri.",
      point3title: "Tanpa Ketergantungan Per-Token",
      point3desc: "Tidak terikat biaya API pihak ketiga per permintaan.",
      point4title: "Model Open-Weight",
      point4desc: "Fleksibel memilih dan mengganti model sesuai kebutuhan.",
      point5title: "Infrastruktur Self-Hosted",
      point5desc: "Kapasitas penggunaan mengikuti batas hardware/server yang kamu jalankan — bukan tanpa batas secara teknis.",
    },
    cta: {
      headline: "SIAP BERTEMU VGRO?",
      button: "Mulai Chat",
    },
    footer: {
      tagline: "Sistem Inteligensi Personal.",
      linksHeading: "Navigasi",
      socialHeading: "Terhubung",
      rights: "Seluruh hak cipta dilindungi.",
    },
    chat: {
      newChat: "Percakapan Baru",
      recent: "Percakapan Terbaru",
      settings: "Pengaturan",
      model: "Model",
      inputPlaceholder: "Tanyakan apa saja pada VGRO...",
      send: "Kirim",
      clearChat: "Hapus Percakapan",
      emptyTitle: "Mulai percakapan dengan VGRO",
      emptyBody: "Tanyakan sesuatu, minta bantuan menulis kode, atau sekadar mengobrol.",
      thinking: "VGRO sedang berpikir...",
      you: "Kamu",
      vgro: "VGRO",
      settingsTheme: "Tema",
      settingsThemeDark: "Gelap",
      settingsThemeLight: "Terang",
      settingsModel: "Model",
      settingsModelValue: "VGRO Local",
      settingsTemp: "Temperature",
      settingsLanguage: "Bahasa",
      settingsLangAuto: "Deteksi Otomatis",
      settingsLangId: "Bahasa Indonesia",
      settingsLangEn: "English",
      comingSoon: "Tersedia setelah integrasi backend",
      noChats: "Belum ada percakapan tersimpan",
      backToHome: "Kembali ke Beranda",
    },
    mock: {
      greeting: "Halo! Saya VGRO, asisten AI personalmu. Untuk saat ini saya masih menjawab dengan respons contoh di sisi frontend — nanti jawaban ini akan digantikan oleh model AI sungguhan lewat Ollama. Ada yang bisa saya bantu?",
      fallback: "Menarik! Saat ini saya masih berjalan dengan respons contoh (mock) di frontend, jadi jawaban saya belum benar-benar dihasilkan oleh model AI. Setelah backend dan Ollama terhubung, saya akan menjawab pertanyaanmu secara nyata.",
      ml: "Machine learning adalah cara komputer belajar mengenali pola dari data, alih-alih diprogram secara eksplisit untuk setiap aturan. Semakin banyak contoh yang dipelajari, semakin baik model memprediksi atau mengambil keputusan pada data baru.",
    },
  },

  en: {
    nav: {
      home: "Home",
      about: "About",
      capabilities: "Capabilities",
      aiCore: "AI Core",
      chat: "Chat",
      startChat: "Start Chat",
    },
    hero: {
      eyebrow: "VGRO AI / PERSONAL INTELLIGENCE SYSTEM",
      headline1: "THE NEXT GENERATION",
      headline2: "OF PERSONAL AI",
      body: "Meet VGRO AI — an intelligent personal assistant built to think, create, code, learn, and grow with you.",
      ctaPrimary: "Start Chat",
      ctaSecondary: "Explore VGRO",
    },
    about: {
      eyebrow: "WHAT IS VGRO?",
      headline: "AI MADE FOR YOU.",
      body: "VGRO AI is a personal intelligence system designed to help you think, create, learn, solve problems, and build things faster — all inside one interface that feels alive.",
    },
    capabilities: {
      eyebrow: "WHAT CAN VGRO DO?",
      headline: "ONE AI, FOUR STRENGTHS.",
      think: { title: "THINK", desc: "Reason through complex problems, step by step." },
      create: { title: "CREATE", desc: "Turn ideas into something real." },
      code: { title: "CODE", desc: "Build and debug software faster." },
      learn: { title: "LEARN", desc: "Understand new topics and concepts with ease." },
    },
    core: {
      eyebrow: "THE AI CORE",
      headline: "ONE INTERFACE. MANY POSSIBILITIES.",
      body: "Behind VGRO sits a single core that connects every capability — responding to context, remembering the conversation, and adapting to how you work.",
    },
    local: {
      eyebrow: "LOCAL / PRIVATE / IN YOUR CONTROL",
      headline1: "YOUR AI.",
      headline2: "YOUR MACHINE.",
      headline3: "YOUR RULES.",
      body: "VGRO is designed to eventually run on open-weight models locally — without sending every conversation to a third-party server.",
      flowUser: "USER DEVICE",
      flowApi: "VGRO API",
      flowOllama: "OLLAMA",
      flowModel: "AI MODEL",
      point1title: "Local AI",
      point1desc: "Models run on infrastructure you control.",
      point2title: "Private Inference",
      point2desc: "Conversations don't have to leave your own machine.",
      point3title: "No Per-Token Dependency",
      point3desc: "Not locked to third-party API costs per request.",
      point4title: "Open-Weight Models",
      point4desc: "Freedom to choose and swap models as you need.",
      point5title: "Self-Hosted Infrastructure",
      point5desc: "Usage is bound by the hardware/server you run it on — not unlimited in a technical sense.",
    },
    cta: {
      headline: "READY TO MEET VGRO?",
      button: "Start Chat",
    },
    footer: {
      tagline: "Personal Intelligence System.",
      linksHeading: "Navigate",
      socialHeading: "Connect",
      rights: "All rights reserved.",
    },
    chat: {
      newChat: "New Chat",
      recent: "Recent Chats",
      settings: "Settings",
      model: "Model",
      inputPlaceholder: "Ask VGRO anything...",
      send: "Send",
      clearChat: "Clear Chat",
      emptyTitle: "Start a conversation with VGRO",
      emptyBody: "Ask something, request help with code, or just chat.",
      thinking: "VGRO is thinking...",
      you: "You",
      vgro: "VGRO",
      settingsTheme: "Theme",
      settingsThemeDark: "Dark",
      settingsThemeLight: "Light",
      settingsModel: "Model",
      settingsModelValue: "VGRO Local",
      settingsTemp: "Temperature",
      settingsLanguage: "Language",
      settingsLangAuto: "Auto Detect",
      settingsLangId: "Bahasa Indonesia",
      settingsLangEn: "English",
      comingSoon: "Coming with backend integration",
      noChats: "No saved chats yet",
      backToHome: "Back to Home",
    },
    mock: {
      greeting: "Hi! I'm VGRO, your personal AI assistant. Right now I'm running on example frontend responses — soon these will be replaced by a real AI model through Ollama. What can I help you with?",
      fallback: "Interesting! I'm still running on mock responses on the frontend for now, so this isn't a real model-generated answer yet. Once the backend and Ollama are connected, I'll answer your questions for real.",
      ml: "Machine learning is a way for computers to learn patterns from data instead of being explicitly programmed for every rule. The more examples a model sees, the better it gets at predicting or deciding on new data.",
    },
  },
};

/**
 * Tiny i18n helper.
 * - detects browser language on first load
 * - falls back to Indonesian if the browser language isn't supported
 * - persists the user's explicit choice ("auto" | "id" | "en") in localStorage
 */
const VGRO_I18N = (() => {
  const STORAGE_KEY = "vgro:language";
  const SUPPORTED = ["id", "en"];

  function detectBrowserLang() {
    const nav = (navigator.language || "id").slice(0, 2).toLowerCase();
    return SUPPORTED.includes(nav) ? nav : "en";
  }

  function getMode() {
    return localStorage.getItem(STORAGE_KEY) || "auto";
  }

  function setMode(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
    applyToDocument();
  }

  function getActiveLang() {
    const mode = getMode();
    return mode === "auto" ? detectBrowserLang() : mode;
  }

  function t(path) {
    const lang = getActiveLang();
    const dict = VGRO_TRANSLATIONS[lang] || VGRO_TRANSLATIONS.en;
    const value = path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), dict);
    if (value !== undefined) return value;
    // fall back to English, then to the raw key so nothing ever renders blank
    const fallback = path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), VGRO_TRANSLATIONS.en);
    return fallback !== undefined ? fallback : path;
  }

  function applyToDocument() {
    document.documentElement.setAttribute("lang", getActiveLang());
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(key));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      el.setAttribute("aria-label", t(key));
    });
    document.dispatchEvent(new CustomEvent("vgro:languagechange", { detail: { lang: getActiveLang() } }));
  }

  return { t, getMode, setMode, getActiveLang, applyToDocument, SUPPORTED };
})();
