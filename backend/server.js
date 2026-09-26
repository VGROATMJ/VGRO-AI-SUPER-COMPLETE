require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

// ===============================
// CONFIGURATION
// ===============================

const PORT = process.env.PORT || 3001;
const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-3.8-flash";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        geminiConfigured: Boolean(
            process.env.GEMINI_API_KEY
        ),
        model: GEMINI_MODEL
    });
});

// ===============================
// CHAT API
// ===============================

app.post("/api/chat", async (req, res) => {
    const {
        message,
        history = [],
        language = "auto"
    } = req.body || {};

    if (!message || typeof message !== "string") {
        return res.status(400).json({
            error: "Field 'message' (string) is required."
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            error:
                "Gemini API key belum dikonfigurasi di server."
        });
    }

    try {
        const reply = await getGeminiReply(
            message,
            history,
            language
        );

        res.json({
            reply
        });

    } catch (err) {
        console.error(
            "[VGRO GEMINI ERROR]",
            err
        );

        res.status(500).json({
            error:
                "VGRO gagal mendapatkan jawaban dari Gemini.",
            detail: err.message
        });
    }
});

// ===============================
// GEMINI AI
// ===============================

async function getGeminiReply(
    message,
    history,
    language
) {
    const previousMessages =
        Array.isArray(history)
            ? history
                .filter(
                    (item) =>
                        item &&
                        (
                            item.role === "user" ||
                            item.role === "vgro"
                        )
                )
                .map((item) => {
                    const role =
                        item.role === "vgro"
                            ? "Assistant"
                            : "User";

                    const text =
                        typeof item.text === "string"
                            ? item.text
                            : "";

                    return `${role}: ${text}`;
                })
                .filter(Boolean)
                .join("\n")
            : "";

    const languageInstruction =
        language === "id"
            ? "Jawab dalam bahasa Indonesia."
            : language === "en"
                ? "Answer in English."
                : "Gunakan bahasa yang sama dengan bahasa pengguna.";

    const prompt = `
Kamu adalah VGRO AI, personal AI assistant yang ramah,
jelas, membantu, dan natural.

${languageInstruction}

Berikan jawaban yang langsung membantu pengguna.
Gunakan bahasa yang mudah dipahami.
Jangan menyebut bahwa kamu menggunakan Gemini.
Jangan menyebut API, server, atau konfigurasi internal.

${
    previousMessages
        ? `Percakapan sebelumnya:
${previousMessages}

`
        : ""
}

Pesan pengguna:
${message}
`;

    const response =
        await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });

    return (
        response.text ||
        "Maaf, VGRO belum mendapatkan jawaban dari AI."
    );
}

// ===============================
// START SERVER
// ===============================

app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `VGRO AI running at http://localhost:${PORT}`
        );
    }
);