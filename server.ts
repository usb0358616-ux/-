import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite Database (The "Single File" data storage like Access)
const db = new Database("archive_data.db");

// Create Tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    number TEXT,
    date TEXT,
    subject TEXT,
    sender TEXT,
    recipient TEXT,
    priority TEXT,
    status TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial admin user if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)").run("admin", "123", "admin", "مدير النظام");
  db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)").run("user", "123", "user", "موظف صادر");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT id, username, role, name FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "خطأ في اسم المستخدم أو كلمة المرور" });
    }
  });

  app.get("/api/documents", (req, res) => {
    const docs = db.prepare("SELECT * FROM documents ORDER BY createdAt DESC").all();
    res.json(docs);
  });

  app.post("/api/documents", (req, res) => {
    const { type, number, date, subject, sender, recipient, priority, status } = req.body;
    const info = db.prepare(`
      INSERT INTO documents (type, number, date, subject, sender, recipient, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(type, number, date, subject, sender, recipient, priority, status);
    
    const newDoc = db.prepare("SELECT * FROM documents WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(newDoc);
  });

  app.delete("/api/documents/:id", (req, res) => {
    db.prepare("DELETE FROM documents WHERE id = ?").run(req.params.id);
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
    console.log(`Database is active: archive_data.db`);
  });
}

startServer();
