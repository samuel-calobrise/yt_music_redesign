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