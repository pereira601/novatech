const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMoi-123!";
const DATA_DIR = path.join(__dirname, "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const SESSIONS = new Map();
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, "[]", "utf8");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const send = (status, body, type = "application/json; charset=utf-8", extra = {}) => {
    res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "DENY", ...extra });
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  };
  const readBody = () => new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => { data += chunk; if (data.length > 20000) { reject(new Error("Payload trop volumineux")); req.destroy(); } });
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch { reject(new Error("JSON invalide")); } });
    req.on("error", reject);
  });
  const readMessages = () => JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8"));
  const saveMessages = items => fs.writeFileSync(MESSAGES_FILE, JSON.stringify(items, null, 2), "utf8");
  const tokenFromCookie = () => (req.headers.cookie || "").split(";").map(x => x.trim()).find(x => x.startsWith("nt_session="))?.slice("nt_session=".length);
  const isAdmin = () => { const token = tokenFromCookie(); return !!token && SESSIONS.has(token); };

  if (req.method === "GET" && url.pathname === "/api/health") return send(200, { ok: true, service: "NovaTech API" });
  if (req.method === "POST" && url.pathname === "/api/contact") {
    try {
      const b = await readBody();
      const name = String(b.name || "").trim().slice(0, 80);
      const email = String(b.email || "").trim().slice(0, 160);
      const subject = String(b.subject || "Demande depuis le site").trim().slice(0, 120);
      const message = String(b.message || "").trim().slice(0, 3000);
      if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
        return send(400, { error: "Vérifie ton nom, ton adresse e-mail et ton message (10 caractères minimum)." });
      }
      const items = readMessages();
      items.unshift({ id: crypto.randomUUID(), name, email, subject, message, createdAt: new Date().toISOString(), status: "Nouveau" });
      saveMessages(items.slice(0, 1000));
      return send(201, { ok: true, message: "Message reçu ! Merci, nous te répondrons dès que possible." });
    } catch { return send(400, { error: "Impossible de lire le formulaire." }); }
  }
  if (req.method === "POST" && url.pathname === "/api/admin/login") {
    try {
      const b = await readBody();
      if (String(b.username || "") !== ADMIN_USER || String(b.password || "") !== ADMIN_PASSWORD) {
        return send(401, { error: "Identifiants incorrects." });
      }
      const token = crypto.randomBytes(32).toString("hex");
      SESSIONS.set(token, { createdAt: Date.now() });
      return send(200, { ok: true }, "application/json; charset=utf-8", { "Set-Cookie": `nt_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800` });
    } catch { return send(400, { error: "Requête invalide." }); }
  }
  if (url.pathname.startsWith("/api/admin/")) {
    if (!isAdmin()) return send(401, { error: "Connexion administrateur requise." });
    if (req.method === "POST" && url.pathname === "/api/admin/logout") {
      const token = tokenFromCookie(); if (token) SESSIONS.delete(token);
      return send(200, { ok: true }, "application/json; charset=utf-8", { "Set-Cookie": "nt_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
    }
    if (req.method === "GET" && url.pathname === "/api/admin/messages") return send(200, readMessages());
    const match = url.pathname.match(/^\/api\/admin\/messages\/([a-f0-9-]+)$/i);
    if (match && req.method === "PATCH") {
      try {
        const b = await readBody(), items = readMessages(), item = items.find(x => x.id === match[1]);
        if (!item) return send(404, { error: "Message introuvable." });
        if (["Nouveau", "En cours", "Traité"].includes(b.status)) item.status = b.status;
        saveMessages(items); return send(200, item);
      } catch { return send(400, { error: "Requête invalide." }); }
    }
    if (match && req.method === "DELETE") {
      const items = readMessages().filter(x => x.id !== match[1]); saveMessages(items);
      return send(200, { ok: true });
    }
    return send(404, { error: "Route inconnue." });
  }

  let requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const full = path.normalize(path.join(__dirname, "public", requested));
  if (!full.startsWith(path.join(__dirname, "public"))) return send(403, "Interdit", "text/plain; charset=utf-8");
  fs.readFile(full, (err, data) => {
    if (err) return send(404, "Page introuvable", "text/plain; charset=utf-8");
    const ext = path.extname(full);
    const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };
    send(200, data, types[ext] || "application/octet-stream");
  });
});
server.listen(PORT, "0.0.0.0", () => console.log(`NovaTech prêt sur http://localhost:${PORT}`));