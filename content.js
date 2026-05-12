console.log("YT Music Dusk loaded.");

/* =========================
   1. CANVAS BACKGROUND
========================= */

const canvas = document.createElement("canvas");
canvas.id = "dusk-canvas";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let time = 0;

function blob(x, y, radius, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
}

function draw() {
  time += 0.006;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  blob(
    canvas.width * (0.18 + Math.sin(time) * 0.05),
    canvas.height * 0.18,
    canvas.width * 0.45,
    "rgba(0, 190, 220, 0.9)"
  );

  blob(
    canvas.width * (0.72 + Math.cos(time * 0.8) * 0.05),
    canvas.height * 0.18,
    canvas.width * 0.45,
    "rgba(255, 120, 50, 0.75)"
  );

  blob(
    canvas.width * 0.5,
    canvas.height * 0.35,
    canvas.width * 0.5,
    "rgba(150, 70, 255, 0.55)"
  );

  requestAnimationFrame(draw);
}

draw();

/* =========================
   2. PLAYER CACHE
========================= */

let player = null;
let progressEl = null;

function cachePlayer() {
  player = document.querySelector("ytmusic-player-bar");
  progressEl = document.querySelector(
    "ytmusic-player-bar tp-yt-paper-slider#progress-bar"
  );
}

setInterval(cachePlayer, 500);
cachePlayer();

/* =========================
   3. PROGRESS (AGORA EM TEMPO REAL)
========================= */
let isDraggingProgress = false;

function updateProgress() {
  if (!player || !progressEl || isDraggingProgress) return;

  const value = Number(progressEl.getAttribute("aria-valuenow"));
  const max = Number(progressEl.getAttribute("aria-valuemax"));

  if (!max || Number.isNaN(value) || Number.isNaN(max)) return;

  const percent = Math.min(Math.max(value / max, 0), 1);
  player.style.setProperty("--dusk-progress", percent);
}

function progressLoop() {
  updateProgress();
  updateSvgProgress();
  requestAnimationFrame(progressLoop);
}

progressLoop();

/* =========================
   4. PLAY STATE (PAUSA ANIMAÇÃO)
========================= */

function updatePlayState() {
  const media = document.querySelector("video, audio");
  if (!media) return;

  document.body.classList.toggle("dusk-paused", media.paused);
}

setInterval(updatePlayState, 500);

/* =========================
   SVG ORGANIC PROGRESS
========================= */

function ensureSvgProgress() {
  if (!player) return null;

  let svg = player.querySelector(".dusk-progress-svg");

  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("dusk-progress-svg");
    svg.setAttribute("viewBox", "0 0 1000 18");
    svg.setAttribute("preserveAspectRatio", "none");

    svg.innerHTML = `
      <defs>
        <linearGradient id="duskProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="var(--dusk-player-color-1)" />
          <stop offset="100%" stop-color="var(--dusk-player-color-2)" />
        </linearGradient>
      </defs>

      <path class="dusk-progress-track" />
      <path class="dusk-progress-fill" />
      <path class="dusk-progress-wave dusk-progress-wave-a" />
      <path class="dusk-progress-wave dusk-progress-wave-b" />
      <circle class="dusk-progress-knob" r="6" />
    `;

    player.appendChild(svg);
  }

  return svg;
}

function buildWavePath(percent, phase = 0, amp = 0.8) {
  const total = 1000;
  const y = 9;
  const end = Math.max(total * percent, 1);

  const playing = !document.body.classList.contains("dusk-paused");
  const t = playing ? performance.now() / 520 + phase : phase;

  return `
    M 0 ${y}
    C ${end * 0.18} ${y + Math.sin(t) * amp},
      ${end * 0.34} ${y - Math.cos(t * 0.9) * amp},
      ${end * 0.50} ${y + Math.sin(t * 1.1) * amp}
    C ${end * 0.66} ${y - Math.sin(t * 0.8) * amp},
      ${end * 0.84} ${y + Math.cos(t) * amp},
      ${end} ${y}
  `;
}
function updateSvgProgress() {
  if (!player) return;

  const svg = ensureSvgProgress();
  if (!svg) return;

  const progress = Number(
    getComputedStyle(player).getPropertyValue("--dusk-progress")
  ) || 0;

  const percent = Math.min(Math.max(progress, 0), 1);
  const end = 1000 * percent;

  const track = svg.querySelector(".dusk-progress-track");
  const fill = svg.querySelector(".dusk-progress-fill");
  const waveA = svg.querySelector(".dusk-progress-wave-a");
  const waveB = svg.querySelector(".dusk-progress-wave-b");
  const knob = svg.querySelector(".dusk-progress-knob");

  if (!track || !fill || !waveA || !waveB || !knob) return;

  track.setAttribute("d", "M 0 9 L 1000 9");
  fill.setAttribute("d", `M 0 9 L ${end} 9`);

  waveA.setAttribute("d", buildWavePath(percent, 0, 1.1));
  waveB.setAttribute("d", buildWavePath(percent, 1.8, 0.7));

  knob.setAttribute("cx", String(end));
  knob.setAttribute("cy", "9");
}

/* =========================
   6. COLOR EXTRACTION (OTIMIZADO)
========================= */

let lastThumb = "";

function getThumbnail() {
  return document.querySelector(
    "ytmusic-player-bar img, ytmusic-player-bar yt-img-shadow img"
  );
}

function extractColors(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 32;
  canvas.height = 32;

  ctx.drawImage(img, 0, 0, 32, 32);

  const data = ctx.getImageData(0, 0, 32, 32).data;

  let r = 0, g = 0, b = 0, count = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 180) continue;

    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  if (!count) return;

  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  const hue = rgbToHue(r, g, b);

  document.documentElement.style.setProperty(
    "--dusk-player-color-1",
    `hsl(${hue}, 85%, 72%)`
  );

  document.documentElement.style.setProperty(
    "--dusk-player-color-2",
    `hsl(${(hue + 35) % 360}, 85%, 65%)`
  );
}

function updateColors() {
  const thumb = getThumbnail();

  if (!thumb || !thumb.src) return;

  if (thumb.src !== lastThumb) {
    lastThumb = thumb.src;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = thumb.src;

    img.onload = () => extractColors(img);
  }
}

setInterval(updateColors, 1000);

/* =========================
   7. UTILS
========================= */

function rgbToHue(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  if (d === 0) return 270;

  let h;

  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;

  return Math.round(h * 60 + (h < 0 ? 360 : 0));
}

/* =========================
   8. DRAG VISUAL EM TEMPO REAL
========================= */

function getDragPercent(event) {
  if (!player) return 0;

  const padding = 28;
  const rect = player.getBoundingClientRect();

  const start = rect.left + padding;
  const end = rect.right - padding;

  const percent = (event.clientX - start) / (end - start);

  return Math.min(Math.max(percent, 0), 1);
}

function setVisualProgress(percent) {
  if (!player) return;
  player.style.setProperty("--dusk-progress", percent);
}

document.addEventListener("pointerdown", (event) => {
  if (!progressEl || !player) return;

  if (event.target.closest("tp-yt-paper-slider#progress-bar")) {
    isDraggingProgress = true;

    const percent = getDragPercent(event);
    if (percent !== null) setVisualProgress(percent);
  }
});

document.addEventListener("pointermove", (event) => {
  if (!isDraggingProgress) return;

  const percent = getDragPercent(event);
  if (percent !== null) setVisualProgress(percent);
});

document.addEventListener("pointerup", () => {
  isDraggingProgress = false;
});

document.addEventListener("pointercancel", () => {
  isDraggingProgress = false;
});

const RPC_ENDPOINT = "http://localhost:3030/presence";

let lastPresencePayload = "";

function getTrackInfo() {
  const titleEl = document.querySelector(".title.ytmusic-player-bar");
  const bylineEl = document.querySelector(".byline.ytmusic-player-bar");
  const media = document.querySelector("video, audio");

  const title = titleEl?.textContent?.trim();
  const artist = bylineEl?.textContent?.trim();

  return {
  title: title || "YouTube Music",
  artist: artist || "Ouvindo música",
  isPlaying: media ? !media.paused : true,
  currentTime: media?.currentTime || 0,
  duration: media?.duration || 0,
};
}

async function updateDiscordPresence() {
  const data = getTrackInfo();
  const payload = JSON.stringify(data);

  if (payload === lastPresencePayload) return;
  lastPresencePayload = payload;

  try {
    await fetch(RPC_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });
  } catch {
    // servidor desligado → ignora silenciosamente
  }
}

// espera o player existir antes de começar
function waitForPlayer() {
  const player = document.querySelector("ytmusic-player-bar");

  if (!player) {
    requestAnimationFrame(waitForPlayer);
    return;
  }

  setInterval(updateDiscordPresence, 3000);
}

waitForPlayer();