const tabs = document.querySelectorAll(".tabs button");
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const nameWrap = document.getElementById("nameWrap");
const submit = document.getElementById("submit");
const form = document.getElementById("form");
const error = document.getElementById("error");

let mode = "login";

function setMode(newMode) {
mode = newMode;

```
tabs.forEach((button) => {
    button.classList.toggle(
        "active",
        button.dataset.mode === newMode
    );
});

nameWrap.classList.toggle(
    "hidden",
    newMode !== "register"
);

if (newMode === "login") {
    title.textContent = "Welcome back.";
    subtitle.textContent =
        "Sign in to continue to your AI workspace.";
    submit.innerHTML = 'Log in <span>→</span>';
} else {
    title.textContent = "Create your VGRO account.";
    subtitle.textContent =
        "Create an account to start your personal AI workspace.";
    submit.innerHTML = 'Create account <span>→</span>';
}

error.textContent = "";
```

}

tabs.forEach((button) => {
button.onclick = () => {
setMode(button.dataset.mode);
};
});

form.onsubmit = (event) => {
event.preventDefault();

```
error.textContent = "";

const email = document
    .getElementById("email")
    .value
    .trim()
    .toLowerCase();

const password = document.getElementById("password").value;

let users = JSON.parse(
    localStorage.getItem("vgro:users") || "{}"
);

// REGISTER
if (mode === "register") {
    const name = document
        .getElementById("name")
        .value
        .trim();

    if (!name) {
        error.textContent = "Please enter your name.";
        return;
    }

    if (!email) {
        error.textContent = "Please enter your email.";
        return;
    }

    if (!password) {
        error.textContent = "Please enter your password.";
        return;
    }

    if (users[email]) {
        error.textContent =
            "An account with this email already exists.";
        return;
    }

    users[email] = {
        name,
        email,
        password
    };

    localStorage.setItem(
        "vgro:users",
        JSON.stringify(users)
    );

    localStorage.setItem(
        "vgro:user",
        JSON.stringify({
            name,
            email
        })
    );

    window.location.href = "app.html";
    return;
}

// LOGIN
if (!email || !password) {
    error.textContent =
        "Please enter your email and password.";
    return;
}

if (!users[email]) {
    error.textContent =
        "Email or password is incorrect.";
    return;
}

if (users[email].password !== password) {
    error.textContent =
        "Email or password is incorrect.";
    return;
}

localStorage.setItem(
    "vgro:user",
    JSON.stringify({
        name: users[email].name,
        email: users[email].email
    })
);

window.location.href = "app.html";
```

};
