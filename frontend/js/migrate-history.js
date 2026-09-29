(() => {
    "use strict";

    // Kunci ini harus SAMA PERSIS dengan VGRO_STORAGE_KEYS.chats di chat.js.
    // Sengaja tidak di-import dari chat.js supaya file ini bisa berjalan
    // independen dari urutan load chat.js.
    const LEGACY_CHATS_KEY = "vgro:chats";

    // Bookkeeping LOKAL (bukan sumber kebenaran) untuk ID chat yang sudah
    // sukses masuk Supabase. Ini murni supaya migrasi yang gagal di tengah
    // jalan (mis. chat ke-3 dari 5 gagal karena koneksi putus) bisa
    // melanjutkan sisanya di percobaan berikutnya TANPA menduplikasi chat
    // yang sudah berhasil dan TANPA melewatkan chat yang belum sempat masuk.
    // Tidak pernah dipakai untuk menghapus apa pun dari localStorage.
    const MIGRATED_IDS_KEY = "vgro:migratedChatIds";

    function readLegacyChats() {
        try {
            const raw = JSON.parse(
                window.localStorage.getItem(LEGACY_CHATS_KEY) || "{}"
            );
            return raw && typeof raw === "object" ? raw : {};
        } catch (error) {
            console.error(
                "[VGRO MIGRATE] Gagal membaca chat lama dari localStorage:",
                error
            );
            return {};
        }
    }

    function readMigratedIds() {
        try {
            const raw = JSON.parse(
                window.localStorage.getItem(MIGRATED_IDS_KEY) || "[]"
            );
            return new Set(Array.isArray(raw) ? raw : []);
        } catch (error) {
            return new Set();
        }
    }

    function addMigratedId(id) {
        try {
            const set = readMigratedIds();
            set.add(id);
            window.localStorage.setItem(
                MIGRATED_IDS_KEY,
                JSON.stringify(Array.from(set))
            );
        } catch (error) {
            console.error(
                "[VGRO MIGRATE] Gagal menyimpan penanda migrasi lokal:",
                error
            );
        }
    }

    async function fetchProfileFlag(userId) {
        const { data, error } = await supabaseClient
            .from("profiles")
            .select("local_history_imported")
            .eq("id", userId)
            .maybeSingle();

        if (error) throw error;

        return Boolean(data && data.local_history_imported);
    }

    async function markImported(userId) {
        const { error } = await supabaseClient
            .from("profiles")
            .update({ local_history_imported: true })
            .eq("id", userId);

        if (error) throw error;
    }

    async function migrateOneChat(userId, chat) {
        const messages = Array.isArray(chat.messages)
            ? chat.messages.filter(
                  (m) => m && typeof m.text === "string" && m.text.trim() !== ""
              )
            : [];

        // Chat kosong (mis. "New chat" yang belum pernah dipakai) tidak
        // perlu dipindahkan.
        if (messages.length === 0) return;

        const { data: newChat, error: chatError } = await supabaseClient
            .from("chats")
            .insert({
                user_id: userId,
                title: chat.title || "New chat"
            })
            .select("id")
            .single();

        if (chatError) throw chatError;

        const rows = messages.map((m) => ({
            chat_id: newChat.id,
            user_id: userId,
            role: m.role === "user" ? "user" : "assistant",
            content: m.text
        }));

        const { error: msgError } = await supabaseClient
            .from("messages")
            .insert(rows);

        if (msgError) throw msgError;
    }

    /**
     * Migrasi satu-kali localStorage -> Supabase untuk user yang sedang login.
     * Aman dipanggil di setiap load: akan langsung selesai tanpa efek apa pun
     * jika migrasi sudah pernah berhasil sebelumnya.
     *
     * localStorage TIDAK PERNAH dihapus oleh fungsi ini, sesuai permintaan:
     * "jangan sampai chat lama hilang".
     */
    async function runMigration(session) {
        if (!session || !session.user) return;

        const userId = session.user.id;

        try {
            const alreadyImported = await fetchProfileFlag(userId);

            if (alreadyImported) return;

            const legacyChats = readLegacyChats();
            const migratedIds = readMigratedIds();

            const pending = Object.values(legacyChats).filter(
                (chat) => chat && chat.id && !migratedIds.has(chat.id)
            );

            if (pending.length === 0) {
                // Tidak ada chat lama sama sekali, ATAU semuanya sudah
                // berhasil dimigrasi di percobaan sebelumnya — tinggal
                // menandai selesai di profil.
                await markImported(userId);
                return;
            }

            console.log(
                `[VGRO MIGRATE] Memindahkan ${pending.length} chat lama ke Supabase...`
            );

            for (const chat of pending) {
                await migrateOneChat(userId, chat);
                // Ditandai SEGERA setelah satu chat berhasil, supaya kalau
                // chat berikutnya gagal, chat ini tidak dimigrasi ulang
                // (tidak dobel) pada percobaan berikutnya.
                addMigratedId(chat.id);
            }

            await markImported(userId);

            console.log("[VGRO MIGRATE] Migrasi chat lama selesai.");

        } catch (error) {
            console.error(
                "[VGRO MIGRATE] Gagal memindahkan chat lama, akan dicoba lagi di load berikutnya:",
                error
            );
            // SENGAJA tidak menandai local_history_imported = true di sini,
            // supaya migrasi dicoba ulang nanti. localStorage tidak disentuh.
        }
    }

    window.VGRO_MIGRATE_HISTORY = runMigration;
})();
