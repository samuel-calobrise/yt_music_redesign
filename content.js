console.log("YT Music Dusk loaded");

const canvas = document.createElement("canvas");
canvas.id = "dusk-canvas";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

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

function updateDuskProgress() {
  const player = document.querySelector("ytmusic-player-bar");
  const progress = document.querySelector(
    "ytmusic-player-bar tp-yt-paper-slider#progress-bar"
  );

  if (!player || !progress) return;

  const value = Number(progress.getAttribute("aria-valuenow") || 0);
  const max = Number(progress.getAttribute("aria-valuemax") || 0);

  if (!max) return;

  const percent = value / max;
  player.style.setProperty("--dusk-progress", percent);

  let knob = player.querySelector(".dusk-progress-knob");

  if (!knob) {
    knob = document.createElement("div");
    knob.className = "dusk-progress-knob";
    player.appendChild(knob);
  }
}

setInterval(updateDuskProgress, 500);
updateDuskProgress();

setInterval(updateDuskProgress, 500);
updateDuskProgress();

function updateDuskKnob() {
  const player = document.querySelector("ytmusic-player-bar");
  if (!player) return;

  let knob = player.querySelector(".dusk-knob");
  if (!knob) {
    knob = document.createElement("div");
    knob.className = "dusk-knob";
    player.appendChild(knob);
  }

  const progress = Number(getComputedStyle(player).getPropertyValue("--dusk-progress")) || 0;

  knob.style.left = `calc(28px + (100% - 56px) * ${progress})`;
}

setInterval(updateDuskKnob, 500);