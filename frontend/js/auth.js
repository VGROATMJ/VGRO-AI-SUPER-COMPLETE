(() => {
    "use strict";

    let currentMode = "login";

    // =========================================
    // ELEMENT
    // =========================================

    function getElement(id) {
        return document.getElementById(id);
    }

    // =========================================
    // MESSAGE
    // =========================================

    function showMessage(message, type = "error") {
        const errorBox = getElement("error");

        if (!errorBox) return;

        errorBox.textContent = message;
        errorBox.className = `message ${type}`;
    }

    function clearMessage() {
        const errorBox = getElement("error");

        if (!errorBox) return;

        errorBox.textContent = "";
        errorBox.className = "message";
    }

    // =========================================
    // CHANGE MODE
    // LOGIN / REGISTER
    // =========================================

    function setMode(mode) {
        currentMode = mode;

        const loginTab =
            document.querySelector('[data-mode="login"]');

        const registerTab =
            document.querySelector('[data-mode="register"]');

        const title =
            getElement("title");

        const subtitle =
            getElement("subtitle");

        const submit =
            getElement("submit");

        const nameWrap =
            getElement("nameWrap");

        const nameInput =
            getElement("name");

        const password =
            getElement("password");

        const forgot =
            getElement("forgot");

        clearMessage();

        if (mode === "register") {
            // REGISTER

            loginTab?.classList.remove("active");
            registerTab?.classList.add("active");

            if (title) {
                title.textContent = "Create your account.";
            }

            if (subtitle) {
                subtitle.textContent =
                    "Create an account to start using your AI workspace.";
            }

            if (nameWrap) {
                nameWrap.classList.remove("hidden");
            }

            if (nameInput) {
                nameInput.required = true;
            }

            if (submit) {
                submit.innerHTML =
                    'Create account <span>→</span>';
            }

            if (password) {
                password.setAttribute(
                    "autocomplete",
                    "new-password"
                );
            }

            if (forgot) {
                forgot.style.display = "none";
            }

        } else {
            // LOGIN

            loginTab?.classList.add("active");
            registerTab?.classList.remove("active");

            if (title) {
                title.textContent = "Welcome back.";
            }

            if (subtitle) {
                subtitle.textContent =
                    "Sign in to continue to your AI workspace.";
            }

            if (nameWrap) {
                nameWrap.classList.add("hidden");
            }

            if (nameInput) {
                nameInput.required = false;
            }

            if (submit) {
                submit.innerHTML =
                    'Log in <span>→</span>';
            }

            if (password) {
                password.setAttribute(
                    "autocomplete",
                    "current-password"
                );
            }

            if (forgot) {
                forgot.style.display = "";
            }
        }
    }

    // =========================================
    // REGISTER
    // =========================================

    async function register() {
        const nameInput =
            getElement("name");

        const emailInput =
            getElement("email");

        const passwordInput =
            getElement("password");

        const submit =
            getElement("submit");

        const name =
            nameInput?.value.trim() || "";

        const email =
            emailInput?.value.trim().toLowerCase() || "";

        const password =
            passwordInput?.value || "";

        if (!name) {
            showMessage("Nama wajib diisi.");
            nameInput?.focus();
            return;
        }

        if (!email) {
            showMessage("Email wajib diisi.");
            emailInput?.focus();
            return;
        }

        if (!password) {
            showMessage("Password wajib diisi.");
            passwordInput?.focus();
            return;
        }

        if (password.length < 6) {
            showMessage("Password minimal 6 karakter.");
            passwordInput?.focus();
            return;
        }

        try {
            submit.disabled = true;

            const {
                data,
                error
            } = await supabaseClient.auth.signUp({
                email: email,
                password: password,

                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (error) {
                throw error;
            }

            /*
             * Jika Supabase meminta verifikasi email,
             * session biasanya belum tersedia.
             */

            if (data.user && !data.session) {
                showMessage(
                    "Akun berhasil dibuat. Silakan cek email untuk verifikasi.",
                    "success"
                );

                document.getElementById("form").reset();

                setMode("login");

                return;
            }

            /*
             * Jika email confirmation tidak aktif,
             * user langsung mendapatkan session.
             */

            if (data.session) {
                showMessage(
                    "Akun berhasil dibuat. Membuka workspace...",
                    "success"
                );

                setTimeout(() => {
                    window.location.href = "app.html";
                }, 700);

                return;
            }

            showMessage(
                "Akun berhasil dibuat. Silakan login."
            );

        } catch (error) {
            console.error(
                "[VGRO AUTH] Register error:",
                error
            );

            showMessage(
                error.message ||
                "Gagal membuat akun."
            );

        } finally {
            submit.disabled = false;
        }
    }

    // =========================================
    // LOGIN
    // =========================================

    async function login() {
        const emailInput =
            getElement("email");

        const passwordInput =
            getElement("password");

        const submit =
            getElement("submit");

        const email =
            emailInput?.value.trim().toLowerCase() || "";

        const password =
            passwordInput?.value || "";

        if (!email || !password) {
            showMessage(
                "Email dan password wajib diisi."
            );
            return;
        }

        try {
            submit.disabled = true;

            const {
                data,
                error
            } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            if (!data.session) {
                throw new Error(
                    "Login belum berhasil. Silakan coba lagi."
                );
            }

            showMessage(
                "Login berhasil. Membuka workspace...",
                "success"
            );

            setTimeout(() => {
                window.location.href = "app.html";
            }, 500);

        } catch (error) {
            console.error(
                "[VGRO AUTH] Login error:",
                error
            );

            showMessage(
                error.message ||
                "Email atau password salah."
            );

        } finally {
            submit.disabled = false;
        }
    }

    // =========================================
    // FORM SUBMIT
    // =========================================

    async function handleSubmit(event) {
        event.preventDefault();

        clearMessage();

        if (currentMode === "register") {
            await register();
        } else {
            await login();
        }
    }

    // =========================================
    // FORGOT PASSWORD
    // =========================================

    async function handleForgotPassword(event) {
        event.preventDefault();

        const emailInput =
            getElement("email");

        const email =
            emailInput?.value.trim().toLowerCase() || "";

        if (!email) {
            showMessage(
                "Masukkan email terlebih dahulu."
            );

            emailInput?.focus();

            return;
        }

        try {
            const { error } =
                await supabaseClient.auth.resetPasswordForEmail(
                    email,
                    {
                        redirectTo:
                            window.location.origin +
                            "/reset-password.html"
                    }
                );

            if (error) {
                throw error;
            }

            showMessage(
                "Link reset password sudah dikirim ke email.",
                "success"
            );

        } catch (error) {
            console.error(
                "[VGRO AUTH] Reset password error:",
                error
            );

            showMessage(
                error.message ||
                "Gagal mengirim link reset password."
            );
        }
    }

    // =========================================
    // CHECK SESSION
    // =========================================

    async function checkSession() {
        try {
            const {
                data,
                error
            } = await supabaseClient.auth.getSession();

            if (error) {
                console.error(
                    "[VGRO AUTH] Session error:",
                    error
                );

                return;
            }

            /*
             * Kalau user sudah login,
             * langsung masuk ke app.html.
             */

            if (data.session) {
                window.location.href = "app.html";
            }

        } catch (error) {
            console.error(
                "[VGRO AUTH] Check session error:",
                error
            );
        }
    }

    // =========================================
    // INITIALIZATION
    // =========================================

    function init() {
        const form =
            getElement("form");

        if (!form) {
            console.warn(
                "[VGRO AUTH] Form tidak ditemukan."
            );

            return;
        }

        const loginTab =
            document.querySelector(
                '[data-mode="login"]'
            );

        const registerTab =
            document.querySelector(
                '[data-mode="register"]'
            );

        const forgot =
            getElement("forgot");

        // Login tab

        loginTab?.addEventListener(
            "click",
            (event) => {
                event.preventDefault();

                setMode("login");
            }
        );

        // Register tab

        registerTab?.addEventListener(
            "click",
            (event) => {
                event.preventDefault();

                setMode("register");
            }
        );

        // Form

        form.addEventListener(
            "submit",
            handleSubmit
        );

        // Forgot password

        forgot?.addEventListener(
            "click",
            handleForgotPassword
        );

        // Default

        setMode("login");

        console.log(
            "[VGRO AUTH] Supabase Auth berhasil dimuat."
        );

        // Check existing session

        checkSession();
    }

    // =========================================
    // START
    // =========================================

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();