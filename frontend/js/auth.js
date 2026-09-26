(() => {
  "use strict";

  const STORAGE_KEY = "vgro_users";
  const SESSION_KEY = "vgro_current_user";

  // ================================
  // AMBIL DATA USER
  // ================================
  function getUsers() {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
    } catch (error) {
      return [];
    }
  }

  // ================================
  // SIMPAN DATA USER
  // ================================
  function saveUsers(users) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(users)
    );
  }

  // ================================
  // AMBIL FORM
  // ================================
  function getForm() {
    return document.querySelector("form");
  }

  // ================================
  // AMBIL INPUT EMAIL & PASSWORD
  // ================================
  function getInputs() {
    const form = getForm();

    if (!form) {
      return {
        email: null,
        password: null
      };
    }

    const email =
      form.querySelector('input[type="email"]') ||
      form.querySelector('input[name="email"]');

    const password =
      form.querySelector('input[type="password"]') ||
      form.querySelector('input[name="password"]');

    return {
      email,
      password
    };
  }

  // ================================
  // PESAN NOTIFIKASI
  // ================================
  function showMessage(message, isError = true) {
    let box = document.querySelector(
      "#auth-message, .auth-message"
    );

    if (!box) {
      box = document.createElement("div");

      box.id = "auth-message";

      box.style.marginTop = "12px";
      box.style.padding = "10px 12px";
      box.style.borderRadius = "10px";
      box.style.fontSize = "14px";

      const form = getForm();

      if (form) {
        form.appendChild(box);
      } else {
        document.body.appendChild(box);
      }
    }

    box.textContent = message;

    box.style.background = isError
      ? "rgba(239, 68, 68, 0.12)"
      : "rgba(34, 197, 94, 0.12)";

    box.style.color = isError
      ? "#ef4444"
      : "#22c55e";
  }

  // ================================
  // MASUK KE WORKSPACE
  // ================================
  function goToWorkspace() {
    window.location.href = "app.html";
  }

  // ================================
  // LOGIN
  // ================================
  function login(event) {
    event.preventDefault();

    const {
      email,
      password
    } = getInputs();

    const emailValue =
      email?.value.trim().toLowerCase() || "";

    const passwordValue =
      password?.value || "";

    // Cek input
    if (!emailValue || !passwordValue) {
      showMessage(
        "Email dan password wajib diisi."
      );
      return;
    }

    const users = getUsers();

    // Cari user
    const user = users.find(
      (item) =>
        item.email === emailValue &&
        item.password === passwordValue
    );

    // Kalau user tidak ditemukan
    if (!user) {
      showMessage(
        "Email atau password salah. Kalau belum punya akun, pilih Create account."
      );
      return;
    }

    // Simpan session
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        name:
          user.name ||
          emailValue.split("@")[0],

        email: user.email
      })
    );

    showMessage(
      "Login berhasil. Membuka workspace...",
      false
    );

    // Masuk ke workspace
    setTimeout(
      goToWorkspace,
      300
    );
  }

  // ================================
  // REGISTER / CREATE ACCOUNT
  // ================================
  function register(event) {
    event.preventDefault();

    const {
      email,
      password
    } = getInputs();

    const emailValue =
      email?.value.trim().toLowerCase() || "";

    const passwordValue =
      password?.value || "";

    // Cek input
    if (!emailValue || !passwordValue) {
      showMessage(
        "Email dan password wajib diisi."
      );
      return;
    }

    // Password minimal
    if (passwordValue.length < 6) {
      showMessage(
        "Password minimal 6 karakter."
      );
      return;
    }

    const users = getUsers();

    // Cek apakah email sudah ada
    const alreadyExists = users.some(
      (item) =>
        item.email === emailValue
    );

    if (alreadyExists) {
      showMessage(
        "Email sudah terdaftar. Silakan login."
      );
      return;
    }

    // Buat user baru
    users.push({
      name:
        emailValue.split("@")[0],

      email:
        emailValue,

      password:
        passwordValue
    });

    saveUsers(users);

    // Simpan session
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        name:
          emailValue.split("@")[0],

        email:
          emailValue
      })
    );

    showMessage(
      "Akun berhasil dibuat. Membuka workspace...",
      false
    );

    // Masuk ke workspace
    setTimeout(
      goToWorkspace,
      300
    );
  }

  // ================================
  // SETUP AUTH
  // ================================
  function setup() {
    const form = getForm();

    if (!form) {
      console.warn(
        "[VGRO AUTH] Form login tidak ditemukan."
      );

      return;
    }

    // Login melalui submit form
    form.addEventListener(
      "submit",
      login
    );

    // Cari tombol Create Account
    const buttons = [
      ...document.querySelectorAll(
        "button, a"
      )
    ];

    buttons.forEach(
      (button) => {
        const text =
          (
            button.textContent || ""
          )
            .trim()
            .toLowerCase();

        if (
          text.includes(
            "create account"
          ) ||
          text.includes(
            "buat akun"
          ) ||
          text.includes(
            "daftar"
          )
        ) {
          button.addEventListener(
            "click",
            (event) => {
              event.preventDefault();

              register(event);
            }
          );
        }
      }
    );

    console.log(
      "[VGRO AUTH] Auth berhasil dimuat."
    );
  }

  // ================================
  // JALANKAN SETELAH HTML SIAP
  // ================================
  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      setup
    );
  } else {
    setup();
  }
})();