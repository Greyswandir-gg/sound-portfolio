"use strict";

/* Имя на странице — в index.html.
   Работы — массив WORKS ниже. Поле src (mp3/wav) включает файл вместо этюда. */

const WORKS = [
  {
    id: "north",
    num: "01",
    title: "Север",
    cat: "film",
    catLabel: "Кино",
    year: "2025",
    role: "Саунд-дизайн, фоли, сведение",
    length: "петля",
    text: "Полный метр про полярную станцию. Музыки почти нет: ветер, лёд далеко, шаги по насту.",
    hear: "Низкий дрон, воздух и редкий удар.",
    note: "Этюд собран в браузере и держит холод сцены, это не финальный микс фильма.",
    tone: "#9ec9ff",
  },
  {
    id: "ash",
    num: "02",
    title: "Ash Protocol",
    cat: "game",
    catLabel: "Игра",
    year: "2025",
    role: "Оружие, интерфейс, атмосферы",
    length: "петля",
    text: "Тактический шутер. Оружие сухое, интерфейс звучит как металл по металлу, без геройской музыки.",
    hear: "Пульс, короткие удары, свип раз в такт.",
    note: "Игровой этюд: ритм интерфейса и боя, без финальных ассетов.",
    tone: "#ff6a3d",
  },
  {
    id: "aurum",
    num: "03",
    title: "AURUM",
    cat: "ad",
    catLabel: "Реклама",
    year: "2024",
    role: "Саунд-дизайн и микс",
    length: "петля",
    text: "Ролик механических часов. Каждый щелчок должен звучать дорого и попадать в макросъёмку шестерни.",
    hear: "Точный тик, тихий аккорд, редкая искра.",
    note: "Рекламный этюд: механика и тишина вокруг неё.",
    tone: "#e7a23a",
  },
  {
    id: "night",
    num: "04",
    title: "Ночная смена",
    cat: "series",
    catLabel: "Сериал",
    year: "2023",
    role: "Атмосфера, фоли, тон комнаты",
    length: "петля",
    text: "Диспетчерская после полуночи. Лампа, плёнка, низкий гул стоек. Диалоги садятся в эту комнату.",
    hear: "Тёплый низ, треск, узкий шум.",
    note: "Этюд комнаты. Голосов нет — только место, где они будут звучать.",
    tone: "#e0b07a",
  },
  {
    id: "room",
    num: "05",
    title: "Комната 7",
    cat: "install",
    catLabel: "Инсталляция",
    year: "2024",
    role: "Пространственный звук",
    length: "петля",
    text: "Тёмная комната. Задержка около трети секунды: звук возвращается чуть другим, чем ушёл.",
    hear: "Пэд, дилей, редкие капли.",
    note: "Этюд пространства. В зале это несколько каналов, здесь — стерео.",
    tone: "#c4b2ff",
  },
  {
    id: "paper",
    num: "06",
    title: "Бумажный город",
    cat: "anim",
    catLabel: "Анимация",
    year: "2023",
    role: "Саунд-дизайн",
    length: "петля",
    text: "Бумажные улицы, короткие шаги и ноты, которые не перевешивают картинку.",
    hear: "Пентатоника и сухие щелчки.",
    note: "Лёгкий этюд: ритм шагов и бумага, без оркестра.",
    tone: "#d7e7c8",
  },
];

const PRESETS = {
  wind: { air: 100, drone: 18, hits: 0, tone: 0 },
  hit: { air: 36, drone: 48, hits: 100, tone: 22 },
  full: { air: 72, drone: 80, hits: 58, tone: 46 },
};

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const state = { activeId: "north", filter: "all" };

const $ = (sel) => document.querySelector(sel);
const engine = new Engine();

function workById(id) {
  return WORKS.find((work) => work.id === id);
}

function visibleWorks() {
  return WORKS.filter((work) => state.filter === "all" || work.cat === state.filter);
}

function applyTone(color) {
  document.documentElement.style.setProperty("--tone", color);
  const soft = hexToRgba(color, 0.28);
  document.documentElement.style.setProperty("--tone-soft", soft);
}

function hexToRgba(hex, alpha) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function fmt(seconds) {
  const s = Math.floor(Math.max(0, seconds) % 60);
  const m = Math.floor(Math.max(0, seconds) / 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function readLevels() {
  const levels = {};
  document.querySelectorAll("[data-layer]").forEach((input) => {
    levels[input.dataset.layer] = Number(input.value) / 100;
  });
  return levels;
}

function render() {
  const work = workById(state.activeId);
  applyTone(work.tone);
  $("#stage-cat").textContent = work.catLabel;
  $("#stage-year").textContent = work.year;
  $("#stage-num").textContent = work.num;
  $("#stage-title").textContent = work.title;
  $("#stage-text").textContent = work.text;
  $("#fact-role").textContent = work.role;
  $("#fact-hear").textContent = work.hear;
  $("#fact-len").textContent = work.length;
  $("#stage-note").textContent = work.note;

  const playingThis = engine.mode === "work" && engine.workId === work.id;
  const playBtn = $("#stage-play");
  playBtn.textContent = playingThis ? "Остановить" : "Слушать этюд";
  playBtn.classList.toggle("is-playing", playingThis);
  playBtn.setAttribute("aria-pressed", playingThis ? "true" : "false");

  document.querySelectorAll(".cue").forEach((cue) => {
    const on = cue.dataset.id === work.id;
    const live = engine.mode === "work" && engine.workId === cue.dataset.id;
    cue.classList.toggle("is-active", on);
    cue.classList.toggle("is-playing", live);
    cue.setAttribute("aria-current", on ? "true" : "false");
  });

  document.querySelectorAll(".filters button").forEach((btn) => {
    btn.setAttribute("aria-checked", btn.dataset.filter === state.filter ? "true" : "false");
  });

  const mixerOn = engine.mode === "mixer";
  const mixerBtn = $("#mixer-play");
  mixerBtn.textContent = mixerOn ? "Остановить сцену" : "Запустить сцену";
  mixerBtn.classList.toggle("is-playing", mixerOn);
  mixerBtn.setAttribute("aria-pressed", mixerOn ? "true" : "false");

  const live = Boolean(engine.mode);
  document.body.classList.toggle("is-live", live);
  $("#dock").classList.toggle("is-on", live);
  $("#dock").setAttribute("aria-hidden", live ? "false" : "true");

  if (engine.mode === "mixer") {
    $("#nav-now").textContent = "Север · микшер";
    $("#dock-title").textContent = "Север";
    $("#dock-meta").textContent = "четыре слоя";
    $("#dock-toggle").textContent = "Дальше";
  } else if (engine.mode === "work") {
    const current = workById(engine.workId);
    $("#nav-now").textContent = current.title;
    $("#dock-title").textContent = current.title;
    $("#dock-meta").textContent = current.catLabel;
    $("#dock-toggle").textContent = "Дальше";
  } else {
    $("#nav-now").textContent = "тишина";
    $("#dock-title").textContent = work.title;
    $("#dock-meta").textContent = "выбрано";
    $("#dock-toggle").textContent = "Слушать";
    $("#dock-time").textContent = "0:00";
  }

  const label = live
    ? `Сейчас звучит ${engine.mode === "mixer" ? "микшер Севера" : workById(engine.workId).title}`
    : `Выбрано: ${work.title}`;
  if ($("#live").textContent !== label) $("#live").textContent = label;
  document.title = live
    ? `${engine.mode === "mixer" ? "Север" : workById(engine.workId).title} — Мара Левина`
    : "Мара Левина — саунд-дизайн";
}

async function runAudio(action) {
  try {
    const started = await action();
    if (started) render();
  } catch (error) {
    engine.halt();
    render();
  }
}

async function selectWork(id, opts = {}) {
  if (!workById(id)) return;
  state.activeId = id;
  history.replaceState(null, "", `#${id}`);
  const shouldPlay = Boolean(opts.autoplay) || engine.mode === "work";
  if (shouldPlay) await runAudio(() => engine.playWork(id));
  else render();
  if (opts.focusCue) document.querySelector(`.cue[data-id="${id}"]`)?.focus();
}

function step(dir, focusCue) {
  const list = visibleWorks();
  if (!list.length) return;
  let index = list.findIndex((work) => work.id === state.activeId);
  if (index < 0) index = 0;
  const next = list[(index + dir + list.length) % list.length];
  selectWork(next.id, { focusCue, autoplay: Boolean(engine.mode) });
}

function buildCues() {
  const list = $("#cue-list");
  list.innerHTML = "";
  WORKS.forEach((work) => {
    const item = document.createElement("li");
    item.dataset.cat = work.cat;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cue";
    btn.dataset.id = work.id;
    btn.innerHTML = `<span class="cue-num">${work.num}</span><span class="cue-name">${work.title}</span><span class="cue-cat">${work.catLabel}</span><span class="cue-year">${work.year}</span>`;
    btn.addEventListener("click", () => selectWork(work.id, { autoplay: true }));
    item.appendChild(btn);
    list.appendChild(item);
  });
}

function applyFilter(filter) {
  state.filter = filter;
  document.querySelectorAll("#cue-list li").forEach((item) => {
    const show = filter === "all" || item.dataset.cat === filter;
    item.hidden = !show;
  });
  if (!visibleWorks().some((work) => work.id === state.activeId)) {
    const first = visibleWorks()[0];
    if (first) state.activeId = first.id;
  }
  render();
}

function applyPreset(name) {
  const preset = PRESETS[name];
  document.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.preset === name);
  });
  Object.entries(preset).forEach(([layer, value]) => {
    const input = document.querySelector(`[data-layer="${layer}"]`);
    const label = document.querySelector(`[data-val="${layer}"]`);
    input.value = String(value);
    label.textContent = String(value);
    engine.setLayer(layer, value / 100);
  });
}

function bind() {
  $("#listen").addEventListener("click", () => {
    $("#works").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    runAudio(() => engine.playWork(state.activeId));
  });

  $("#stage-play").addEventListener("click", () => {
    if (engine.mode === "work" && engine.workId === state.activeId) {
      engine.halt();
      render();
    } else {
      runAudio(() => engine.playWork(state.activeId));
    }
  });

  $("#stage-prev").addEventListener("click", () => step(-1));
  $("#stage-next").addEventListener("click", () => step(1));

  $("#present").addEventListener("click", () => {
    const stage = $("#stage");
    if (document.fullscreenElement) document.exitFullscreen();
    else stage.requestFullscreen?.();
  });

  document.querySelectorAll(".filters button").forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
  });

  $("#cue-list").addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      step(1, true);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1, true);
    }
  });

  document.querySelectorAll("[data-layer]").forEach((input) => {
    input.addEventListener("input", () => {
      const layer = input.dataset.layer;
      document.querySelector(`[data-val="${layer}"]`).textContent = input.value;
      engine.setLayer(layer, Number(input.value) / 100);
      document.querySelectorAll("[data-preset]").forEach((btn) => btn.classList.remove("is-on"));
    });
  });

  document.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
  });

  $("#mixer-play").addEventListener("click", () => {
    if (engine.mode === "mixer") {
      engine.halt();
      render();
    } else {
      runAudio(() => engine.playMixer(readLevels()));
    }
  });

  $("#volume").addEventListener("input", () => {
    engine.setMaster(Number($("#volume").value) / 100);
  });

  $("#mute").addEventListener("click", () => {
    const next = $("#mute").getAttribute("aria-pressed") !== "true";
    $("#mute").setAttribute("aria-pressed", next ? "true" : "false");
    $("#mute").textContent = next ? "Тихо" : "Звук";
    engine.setMuted(next);
  });

  $("#dock-toggle").addEventListener("click", () => step(1));

  $("#dock-stop").addEventListener("click", () => {
    engine.halt();
    render();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== " " || event.repeat) return;
    if (event.target !== document.body) return;
    event.preventDefault();
    if (engine.mode === "mixer" || (engine.mode === "work" && engine.workId === state.activeId)) {
      engine.halt();
      render();
    } else {
      runAudio(() => engine.playWork(state.activeId));
    }
  });

  const glow = $("#glow");
  window.addEventListener("pointermove", (event) => {
    glow.style.transform = `translate3d(${event.clientX - 140}px, ${event.clientY - 140}px, 0)`;
  });
}

const heroCanvas = $("#hero-canvas");
const stageCanvas = $("#stage-canvas");
const dockCanvas = $("#dock-canvas");
const timeBuf = new Uint8Array(2048);
const meterBuf = new Uint8Array(256);
let phase = 0;

function resizeCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return null;
  if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function drawWave(canvas, amplify, center) {
  const box = resizeCanvas(canvas);
  if (!box) return;
  const { ctx, width, height } = box;
  ctx.clearRect(0, 0, width, height);
  const tone = getComputedStyle(document.documentElement).getPropertyValue("--tone").trim() || "#e7a23a";
  const mid = height * (center || 0.5);
  const travel = Math.max(22, height * 0.36);
  const step = Math.max(1, Math.floor(timeBuf.length / width));
  ctx.beginPath();
  for (let x = 0; x < width; x += 1) {
    const sample = timeBuf[x * step] / 128 - 1;
    const y = mid + sample * travel * amplify;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = tone;
  ctx.lineWidth = height > 200 ? 2 : 1.6;
  ctx.shadowColor = tone;
  ctx.shadowBlur = height > 200 ? 16 : 0;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawMeters() {
  ["air", "drone", "hits", "tone"].forEach((name) => {
    const bar = document.querySelector(`[data-meter="${name}"]`);
    const analyser = engine.layerAnalysers[name];
    let level = 0.06;
    if (analyser && engine.mode === "mixer") {
      analyser.getByteTimeDomainData(meterBuf);
      let sum = 0;
      for (let i = 0; i < meterBuf.length; i += 1) {
        const x = (meterBuf[i] - 128) / 128;
        sum += x * x;
      }
      level = Math.min(1, Math.sqrt(sum / meterBuf.length) * 5);
    }
    bar.style.transform = `scaleY(${Math.max(0.06, level)})`;
  });
}

function frame() {
  requestAnimationFrame(frame);
  phase += reduced ? 0 : 0.008;
  const playing = Boolean(engine.mode) && engine.analyser;
  if (playing) {
    engine.analyser.getByteTimeDomainData(timeBuf);
  } else if (!reduced) {
    for (let i = 0; i < timeBuf.length; i += 1) {
      const x = i / timeBuf.length;
      const y = Math.sin(x * 7 + phase) * 0.22 + Math.sin(x * 2.2 - phase * 0.6) * 0.1;
      timeBuf[i] = 128 + y * 150;
    }
  }
  drawWave(heroCanvas, playing ? 1.5 : 0.85, 0.34);
  drawWave(stageCanvas, playing ? 2.1 : 1, 0.5);
  drawWave(dockCanvas, playing ? 2.2 : 1, 0.5);
  drawMeters();
  if (engine.mode) $("#dock-time").textContent = fmt(engine.elapsed());
}

function boot() {
  buildCues();
  bind();
  const hash = location.hash.replace("#", "");
  if (workById(hash)) state.activeId = hash;
  applyFilter("all");
  engine.setMaster(0.8);
  requestAnimationFrame(frame);
}

function Engine() {
  this.ctx = null;
  this.mode = null;
  this.workId = null;
  this.token = 0;
  this.timers = [];
  this.nodes = [];
  this.buses = [];
  this.layerGains = {};
  this.layerAnalysers = {};
  this.volume = 0.8;
  this.muted = false;
  this.gen = 0;
  this.startedAt = 0;
  this.analyser = null;
  this.noise = null;
  this.impulses = {};
}

Engine.prototype.unlock = async function unlock() {
  if (!this.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0.0001 : this.volume;
    this.comp = this.ctx.createDynamicsCompressor();
    this.comp.threshold.value = -14;
    this.comp.knee.value = 12;
    this.comp.ratio.value = 6;
    this.comp.attack.value = 0.004;
    this.comp.release.value = 0.24;
    this.pre = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    this.pre.connect(this.comp);
    this.comp.connect(this.analyser);
    this.analyser.connect(this.master);
    this.master.connect(this.ctx.destination);
    this.noise = {
      white: makeNoise(this.ctx, "white"),
      brown: makeNoise(this.ctx, "brown"),
    };
  }
  if (this.ctx.state === "suspended") {
    const resume = this.ctx.resume();
    await Promise.race([resume, new Promise((resolve) => setTimeout(resolve, 300))]);
  }
};

Engine.prototype.halt = function halt() {
  this.gen += 1;
  this.token += 1;
  this.timers.splice(0).forEach(clearTimeout);
  if (this.ctx) {
    const t = this.ctx.currentTime;
    this.buses.forEach((gain) => {
      const current = Math.max(gain.gain.value, 0.0001);
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(current, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    });
    const old = this.nodes;
    this.nodes = [];
    this.buses = [];
    old.forEach((node) => {
      try {
        if (typeof node.stop === "function") node.stop(t + 0.2);
      } catch (error) {
        /* one-shot already ended */
      }
    });
    setTimeout(() => {
      old.forEach((node) => {
        try { node.disconnect(); } catch (error) { /* already gone */ }
      });
    }, 280);
  }
  this.layerGains = {};
  this.layerAnalysers = {};
  this.mode = null;
  this.workId = null;
};

Engine.prototype.track = function track(node) {
  this.nodes.push(node);
  return node;
};

Engine.prototype.makeBus = function makeBus(target) {
  const gain = this.ctx.createGain();
  const now = this.ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(target, 0.0001), now + 0.28);
  gain.connect(this.pre);
  this.buses.push(gain);
  this.track(gain);
  return gain;
};

Engine.prototype.every = function every(token, interval, fn) {
  let next = this.ctx.currentTime + 0.1;
  const arm = () => {
    if (token !== this.token) return;
    const horizon = this.ctx.currentTime + 0.32;
    while (next < horizon) {
      fn(next);
      next += interval;
    }
    const wait = Math.max(40, (next - this.ctx.currentTime - 0.14) * 1000);
    this.timers.push(setTimeout(arm, wait));
  };
  arm();
};

Engine.prototype.impulse = function impulse(seconds) {
  const key = String(seconds);
  if (!this.impulses[key]) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buffer = this.ctx.createBuffer(2, len, rate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < len; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.8;
      }
    }
    this.impulses[key] = buffer;
  }
  return this.impulses[key];
};

Engine.prototype.send = function send(dest, seconds, amount) {
  const input = this.ctx.createGain();
  const conv = this.ctx.createConvolver();
  conv.buffer = this.impulse(seconds);
  const wet = this.ctx.createGain();
  wet.gain.value = amount;
  input.connect(conv);
  conv.connect(wet);
  wet.connect(dest);
  this.track(input);
  this.track(conv);
  this.track(wet);
  return input;
};

Engine.prototype.playWork = async function playWork(id) {
  const gen = ++this.gen;
  await this.unlock();
  if (gen !== this.gen) return false;
  this.halt();
  const token = this.token;
  const bus = this.makeBus(1);
  this.mode = "work";
  this.workId = id;
  this.startedAt = this.ctx.currentTime;
  const work = workById(id);
  if (work && work.src) this.playFile(work.src, bus, token);
  else sketches[id](this, { all: bus }, token);
  return true;
};

Engine.prototype.playMixer = async function playMixer(levels) {
  const gen = ++this.gen;
  await this.unlock();
  if (gen !== this.gen) return false;
  this.halt();
  const token = this.token;
  const outputs = {};
  ["air", "drone", "hits", "tone"].forEach((name) => {
    const level = levels[name] ?? 0.7;
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    if (level < 0.001) gain.gain.setValueAtTime(0, now);
    else {
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(level, now + 0.28);
    }
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    gain.connect(analyser);
    analyser.connect(this.pre);
    this.track(gain);
    this.track(analyser);
    this.buses.push(gain);
    outputs[name] = gain;
    this.layerGains[name] = gain;
    this.layerAnalysers[name] = analyser;
  });
  this.mode = "mixer";
  this.workId = "north";
  this.startedAt = this.ctx.currentTime;
  sketches.north(this, outputs, token);
  return true;
};

Engine.prototype.playFile = async function playFile(url, bus, token) {
  const response = await fetch(url);
  const raw = await response.arrayBuffer();
  const decoded = await this.ctx.decodeAudioData(raw);
  if (token !== this.token) return;
  const source = this.ctx.createBufferSource();
  source.buffer = decoded;
  source.loop = true;
  source.connect(bus);
  source.start();
  this.track(source);
};

Engine.prototype.setLayer = function setLayer(name, value) {
  const gain = this.layerGains[name];
  if (!gain || !this.ctx) return;
  gain.gain.cancelScheduledValues(this.ctx.currentTime);
  gain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.03);
};

Engine.prototype.setMaster = function setMaster(value) {
  this.volume = value;
  if (!this.master || this.muted) return;
  this.master.gain.setTargetAtTime(value, this.ctx.currentTime, 0.03);
};

Engine.prototype.setMuted = function setMuted(muted) {
  this.muted = muted;
  if (!this.master) return;
  const target = muted ? 0.0001 : Math.max(this.volume, 0.0001);
  this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
};

Engine.prototype.elapsed = function elapsed() {
  if (!this.ctx || !this.mode) return 0;
  return this.ctx.currentTime - this.startedAt;
};

function makeNoise(ctx, kind) {
  const length = Math.floor(ctx.sampleRate * 3);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (kind === "brown") {
      brown = (brown + 0.02 * white) / 1.02;
      data[i] = brown * 3.4;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

function out(outputs, name) {
  return outputs[name] || outputs.all;
}

function loopNoise(engine, dest, options) {
  const ctx = engine.ctx;
  const source = ctx.createBufferSource();
  source.buffer = engine.noise[options.kind || "white"];
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = options.type || "lowpass";
  filter.frequency.value = options.freq || 800;
  filter.Q.value = options.q || 0.7;
  const gain = ctx.createGain();
  gain.gain.value = options.gain;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  if (options.wet) gain.connect(options.wet);
  source.start();
  engine.track(source);
  engine.track(filter);
  engine.track(gain);
  if (options.lfo) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = options.lfo.rate;
    depth.gain.value = options.lfo.depth;
    lfo.connect(depth);
    depth.connect(filter.frequency);
    lfo.start();
    engine.track(lfo);
    engine.track(depth);
  }
  return gain;
}

function hold(engine, dest, options) {
  const ctx = engine.ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = options.type || "sine";
  osc.frequency.value = options.freq;
  gain.gain.value = options.gain;
  osc.connect(gain);
  gain.connect(dest);
  if (options.wet) gain.connect(options.wet);
  if (options.detune) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = options.detune.rate;
    depth.gain.value = options.detune.depth;
    lfo.connect(depth);
    depth.connect(osc.frequency);
    lfo.start();
    engine.track(lfo);
    engine.track(depth);
  }
  osc.start();
  engine.track(osc);
  engine.track(gain);
  return gain;
}

function tone(engine, dest, options) {
  const ctx = engine.ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = options.type || "sine";
  osc.frequency.setValueAtTime(Math.max(1, options.freq), options.time);
  if (options.slide) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, options.slide), options.time + options.dur);
  }
  gain.gain.setValueAtTime(0.0001, options.time);
  gain.gain.exponentialRampToValueAtTime(options.gain, options.time + Math.min(0.02, options.dur * 0.3));
  gain.gain.exponentialRampToValueAtTime(0.0001, options.time + options.dur);
  osc.connect(gain);
  gain.connect(dest);
  if (options.wet) gain.connect(options.wet);
  osc.start(options.time);
  osc.stop(options.time + options.dur + 0.03);
  osc.onended = () => {
    try { osc.disconnect(); gain.disconnect(); } catch (error) { /* already stopped */ }
  };
}

function burst(engine, dest, options) {
  const ctx = engine.ctx;
  const source = ctx.createBufferSource();
  source.buffer = engine.noise[options.kind || "white"];
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = options.type || "lowpass";
  filter.frequency.setValueAtTime(options.freq || 1000, options.time);
  if (options.slide) {
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, options.slide), options.time + options.dur);
  }
  filter.Q.value = options.q || 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, options.time);
  gain.gain.exponentialRampToValueAtTime(options.gain, options.time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, options.time + options.dur);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  if (options.wet) gain.connect(options.wet);
  source.start(options.time);
  source.stop(options.time + options.dur + 0.03);
  source.onended = () => {
    try {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    } catch (error) { /* already stopped */ }
  };
}

const sketches = {
  north(engine, outputs, token) {
    const air = out(outputs, "air");
    const drone = out(outputs, "drone");
    const hits = out(outputs, "hits");
    const toneBus = out(outputs, "tone");
    const verb = engine.send(drone, 2.5, 0.34);
    loopNoise(engine, air, {
      kind: "brown",
      type: "lowpass",
      freq: 420,
      gain: 0.34,
      lfo: { rate: 0.07, depth: 180 },
    });
    loopNoise(engine, air, {
      kind: "white",
      type: "bandpass",
      freq: 1400,
      q: 4,
      gain: 0.035,
      lfo: { rate: 0.05, depth: 500 },
    });
    hold(engine, drone, { freq: 73.4, gain: 0.11, wet: verb, detune: { rate: 0.12, depth: 0.45 } });
    hold(engine, drone, { freq: 110, gain: 0.05, wet: verb, detune: { rate: 0.08, depth: 0.3 } });
    hold(engine, toneBus, { freq: 220, gain: 0.018, type: "triangle" });
    hold(engine, toneBus, { freq: 329.6, gain: 0.01, type: "sine" });
    engine.every(token, 7.5, (time) => {
      tone(engine, hits, { time, freq: 90, slide: 34, dur: 0.7, gain: 0.22, wet: verb });
      burst(engine, hits, { time, dur: 0.28, gain: 0.2, freq: 180, kind: "brown", wet: verb });
    });
  },

  ash(engine, outputs, token) {
    const dest = outputs.all;
    hold(engine, dest, { freq: 43.65, gain: 0.1, type: "sine" });
    let step = 0;
    engine.every(token, 0.28, (time) => {
      const beat = step;
      step += 1;
      burst(engine, dest, {
        time,
        dur: beat % 4 === 0 ? 0.09 : 0.045,
        gain: beat % 4 === 0 ? 0.16 : 0.07,
        freq: beat % 4 === 0 ? 620 : 1400,
        q: beat % 4 === 0 ? 0.7 : 3,
        type: "bandpass",
      });
      if (beat % 4 === 0) {
        tone(engine, dest, { time, freq: 180, slide: 55, dur: 0.12, type: "triangle", gain: 0.08 });
      }
      if (beat % 16 === 0) {
        burst(engine, dest, {
          time,
          dur: 0.45,
          gain: 0.08,
          freq: 240,
          slide: 4200,
          type: "highpass",
        });
      }
    });
  },

  aurum(engine, outputs, token) {
    const dest = outputs.all;
    const verb = engine.send(dest, 1.3, 0.22);
    hold(engine, dest, { freq: 440, gain: 0.016, type: "triangle", wet: verb });
    hold(engine, dest, { freq: 554.4, gain: 0.012, type: "sine", wet: verb });
    hold(engine, dest, { freq: 659.3, gain: 0.01, type: "sine", wet: verb });
    let step = 0;
    engine.every(token, 0.5, (time) => {
      const beat = step;
      step += 1;
      const accent = beat % 4 === 0;
      tone(engine, dest, {
        time,
        freq: accent ? 784 : 1568,
        dur: accent ? 0.09 : 0.045,
        gain: accent ? 0.07 : 0.05,
        wet: verb,
      });
      if (beat % 8 === 4) {
        burst(engine, dest, { time, dur: 0.12, gain: 0.03, freq: 6800, type: "highpass", q: 1.2 });
      }
    });
  },

  night(engine, outputs, token) {
    const dest = outputs.all;
    const verb = engine.send(dest, 1.1, 0.2);
    hold(engine, dest, { freq: 55, gain: 0.11, type: "triangle", wet: verb });
    hold(engine, dest, { freq: 82.4, gain: 0.04, type: "sine" });
    loopNoise(engine, dest, { kind: "brown", type: "lowpass", freq: 700, gain: 0.07 });
    engine.every(token, 0.11, (time) => {
      if (Math.random() > 0.42) return;
      burst(engine, dest, {
        time,
        dur: 0.025,
        gain: 0.045,
        freq: 3200,
        type: "highpass",
        q: 0.6,
      });
    });
  },

  room(engine, outputs, token) {
    const dest = outputs.all;
    const delay = engine.ctx.createDelay(1);
    delay.delayTime.value = 0.37;
    const feedback = engine.ctx.createGain();
    feedback.gain.value = 0.38;
    const damp = engine.ctx.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 2400;
    const wet = engine.ctx.createGain();
    wet.gain.value = 0.45;
    delay.connect(damp);
    damp.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(dest);
    engine.track(delay);
    engine.track(feedback);
    engine.track(damp);
    engine.track(wet);
    const verb = engine.send(dest, 3.2, 0.4);
    hold(engine, dest, { freq: 196, gain: 0.05, wet: verb, detune: { rate: 0.06, depth: 0.4 } });
    hold(engine, dest, { freq: 246.9, gain: 0.04, wet: verb });
    loopNoise(engine, dest, { kind: "brown", type: "lowpass", freq: 280, gain: 0.08, wet: verb });
    engine.every(token, 2.7, (time) => {
      tone(engine, delay, { time, freq: 1046, slide: 520, dur: 0.45, gain: 0.05, wet: verb });
      tone(engine, delay, { time: time + 0.9, freq: 1568, dur: 0.3, gain: 0.03 });
    });
  },

  paper(engine, outputs, token) {
    const dest = outputs.all;
    const verb = engine.send(dest, 0.7, 0.16);
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 659.25, 523.25];
    const rhythm = [0, 0.22, 0.42, 0.7, 1.02, 1.28, 1.58];
    engine.every(token, 2, (time) => {
      rhythm.forEach((offset, index) => {
        tone(engine, dest, {
          time: time + offset,
          freq: scale[index],
          dur: 0.22,
          gain: 0.07,
          type: "sine",
          wet: verb,
        });
        burst(engine, dest, {
          time: time + offset,
          dur: 0.03,
          gain: 0.05,
          freq: 2400,
          type: "highpass",
        });
      });
    });
  },
};

boot();
