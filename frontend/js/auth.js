(() => {
    "use strict";

    const STORAGE_KEY = "vgro_users";
    const SESSION_KEY = "vgro_current_user";

    let currentMode = "login";

    // =========================================
    // USER STORAGE
    // =========================================

    function getUsers() {
        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );
        } catch (error) {
            console.error("Gagal membaca user:", error);
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(users)
        );
    }

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
    // LOGIN
    // =========================================

    function login() {
        const emailInput =
            getElement("email");

        const passwordInput =
            getElement("password");

        const email =
            emailInput?.value
                .trim()
                .toLowerCase();

        const password =
            passwordInput?.value || "";

        if (!email || !password) {
            showMessage(
                "Email dan password wajib diisi."
            );
            return;
        }

        const users = getUsers();

        const user = users.find(
            (item) =>
                item.email === email &&
                item.password === password
        );

        if (!user) {
            showMessage(
                "Email atau password salah."
            );
            return;
        }

        const session = {
            name:
                user.name ||
                email.split("@")[0],

            email: user.email
        };

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify(session)
        );

        showMessage(
            "Login berhasil. Membuka workspace...",
            "success"
        );

        setTimeout(() => {
            window.location.href = "app.html";
        }, 500);
    }

    // =========================================
    // REGISTER
    // =========================================

    function register() {
        const nameInput =
            getElement("name");

        const emailInput =
            getElement("email");

        const passwordInput =
            getElement("password");

        const name =
            nameInput?.value.trim() || "";

        const email =
            emailInput?.value
                .trim()
                .toLowerCase() || "";

        const password =
            passwordInput?.value || "";

        if (!name) {
            showMessage(
                "Nama wajib diisi."
            );
            nameInput?.focus();
            return;
        }

        if (!email) {
            showMessage(
                "Email wajib diisi."
            );
            emailInput?.focus();
            return;
        }

        if (!password) {
            showMessage(
                "Password wajib diisi."
            );
            passwordInput?.focus();
            return;
        }

        if (password.length < 6) {
            showMessage(
                "Password minimal 6 karakter."
            );
            passwordInput?.focus();
            return;
        }

        const users = getUsers();

        const exists = users.some(
            (item) =>
                item.email === email
        );

        if (exists) {
            showMessage(
                "Email sudah terdaftar. Silakan login."
            );
            return;
        }

        const newUser = {
            name,
            email,
            password
        };

        users.push(newUser);

        saveUsers(users);

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
                name,
                email
            })
        );

        showMessage(
            "Akun berhasil dibuat. Membuka workspace...",
            "success"
        );

        setTimeout(() => {
            window.location.href = "app.html";
        }, 500);
    }

    // =========================================
    // FORM SUBMIT
    // =========================================

    function handleSubmit(event) {
        event.preventDefault();

        clearMessage();

        if (currentMode === "register") {
            register();
        } else {
            login();
        }
    }

    // =========================================
    // FORGOT PASSWORD
    // =========================================

    function handleForgotPassword(event) {
        event.preventDefault();

        showMessage(
            "Fitur reset password belum tersedia pada versi demo VGRO."
        );
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
            "[VGRO AUTH] Auth berhasil dimuat."
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }
})();