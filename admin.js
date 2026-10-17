"use strict";

const loginForm = document.querySelector("#login");
const studio = document.querySelector("#studio");
const loginError = document.querySelector("#login-error");
const addForm = document.querySelector("#add");
const addStatus = document.querySelector("#add-status");
const added = document.querySelector("#added");

function showStudio(on) {
  loginForm.hidden = on;
  studio.hidden = !on;
}

async function api(url, options) {
  const response = await fetch(url, { credentials: "same-origin", ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Ошибка запроса");
  return data;
}

function lengthOf(file) {
  return new Promise((resolve) => {
    const el = document.createElement(file.type.startsWith("video/") ? "video" : "audio");
    const url = URL.createObjectURL(file);
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const total = Math.round(el.duration || 0);
      URL.revokeObjectURL(url);
      if (!Number.isFinite(total) || total <= 0) {
        resolve("");
        return;
      }
      const minutes = Math.floor(total / 60);
      const seconds = String(total % 60).padStart(2, "0");
      resolve(`${minutes}:${seconds}`);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("");
    };
    el.src = url;
  });
}

async function refreshList() {
  const response = await fetch("data/works-extra.json", { cache: "no-store" });
  const items = response.ok ? await response.json() : [];
  added.replaceChildren();
  items.forEach((work) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = `${work.title} · ${work.catLabel}`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-ghost";
    button.textContent = "Убрать";
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await api("/api/works/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: work.id }),
        });
        await refreshList();
      } catch (error) {
        button.disabled = false;
        addStatus.textContent = error.message;
      }
    });
    item.append(name, button);
    added.appendChild(item);
  });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  const body = {
    username: new FormData(loginForm).get("username"),
    password: new FormData(loginForm).get("password"),
  };
  try {
    await api("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    showStudio(true);
    await refreshList();
  } catch (error) {
    loginError.textContent = error.message;
  }
});

addForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  addStatus.textContent = "Сохраняю…";
  const data = new FormData(addForm);
  const file = data.get("file");
  data.set("length", file ? await lengthOf(file) : "");
  try {
    await api("/api/works", { method: "POST", body: data });
    addForm.reset();
    addStatus.textContent = "Работа добавлена.";
    await refreshList();
  } catch (error) {
    addStatus.textContent = error.message;
  }
});

document.querySelector("#logout").addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" });
  showStudio(false);
});

api("/api/me").then((data) => {
  if (!data.ok) return;
  showStudio(true);
  refreshList();
}).catch(() => {});
