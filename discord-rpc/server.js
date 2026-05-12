const RPC = require("discord-rpc");
const express = require("express");
const cors = require("cors");

const clientId = "1502521014209478656";
const port = 3030;

RPC.register(clientId);

const rpc = new RPC.Client({ transport: "ipc" });
const app = express();

app.use(cors());
app.use(express.json());

let connected = false;

rpc.on("ready", () => {
  connected = true;
  console.log("Discord RPC conectado.");
});

rpc.login({ clientId }).catch((err) => {
  connected = false;
  console.error("Erro ao conectar no Discord RPC:", err.message);
});

function buildActivity(data) {
  const title = data.title || "YouTube Music";
  const artist = data.artist || "Ouvindo música";

  const activity = {
    type: 2,
    details: title,
    state: artist,
    instance: false,
  };

  if (data.isPlaying && data.duration > 0) {
    const now = Date.now();

    activity.startTimestamp = now - data.currentTime * 1000;
    activity.endTimestamp = now + (data.duration - data.currentTime) * 1000;
  }

  return activity;
}

app.post("/presence", async (req, res) => {
  if (!connected) {
    return res.status(503).json({
      ok: false,
      error: "Discord RPC ainda não conectado.",
    });
  }

  try {
    const activity = buildActivity(req.body);
    await rpc.setActivity(activity);

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao atualizar presença:", err.message);

    res.status(500).json({
      ok: false,
      error: "Falha ao atualizar presença.",
    });
  }
});

app.post("/clear", async (_req, res) => {
  try {
    if (connected) await rpc.clearActivity();
    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao limpar presença:", err.message);

    res.status(500).json({
      ok: false,
      error: "Falha ao limpar presença.",
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor Rich Presence rodando em http://localhost:${port}`);
});