import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory "Database" (Simulating Access)
  let documents = [
    { id: "1", type: "وارد", number: "101", date: "2026-07-03", subject: "طلب إجازة", sender: "فرع تعز", recipient: "إدارة الاستخبارات", priority: "عادي", status: "مكتمل" },
    { id: "2", type: "صادر", number: "202", date: "2026-07-02", subject: "تقرير دوري", sender: "مكتب الاستخبارات", recipient: "رئاسة المصلحة", priority: "عاجل", status: "قيد التنفيذ" },
  ];

  let users = [
    { id: "1", username: "admin", password: "123", role: "admin", name: "مدير النظام" },
    { id: "2", username: "user", password: "123", role: "user", name: "موظف صادر" },
  ];

  let dailySummaries = [
    {
      id: "ds-1",
      type: "delivery_passports",
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      attachments: [],
      delivery_passports: {
        fullName: "صلاح علوي محمد العولقي",
        nationality: "يمني",
        passportNumber: "08765432",
        docNumber: "ص-202"
      }
    },
    {
      id: "ds-2",
      type: "incoming_memos",
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      attachments: [],
      incoming_memos: {
        incomingNumber: "و-101",
        senderSector: "مصلحة الهجرة والجوازات والجنسية",
        address: "صنعاء - المقر الرئيسي",
        subjectSummary: "بشأن آلية فحص الجوازات وتحديث قائمة المنوعين من السفر",
        actionsTaken: "تم التعميم على كافة المنافذ للعمل بموجب القائمة الجديدة والرفع بأي إشكاليات",
        status: "responded",
        responseDocNumber: "ص-202"
      }
    }
  ];

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.status(401).json({ success: false, message: "خطأ في اسم المستخدم أو كلمة المرور" });
    }
  });

  app.get("/api/documents", (req, res) => {
    res.json(documents);
  });

  app.post("/api/documents", (req, res) => {
    const newDoc = { ...req.body, id: Date.now().toString() };
    documents.push(newDoc);
    res.status(201).json(newDoc);
  });

  app.delete("/api/documents/:id", (req, res) => {
    documents = documents.filter(d => d.id !== req.params.id);
    res.status(204).send();
  });

  app.get("/api/daily-summaries", (req, res) => {
    res.json(dailySummaries);
  });

  app.post("/api/daily-summaries", async (req, res) => {
    const entry = req.body;
    entry.id = "ds-" + Date.now().toString();
    entry.createdAt = new Date().toISOString();
    
    // Auto-create linked document in documents array
    let linkedDoc: any = null;
    if (entry.type === 'delivery_passports' && entry.delivery_passports) {
      const p = entry.delivery_passports;
      linkedDoc = {
        id: "doc-" + Date.now().toString() + "-p",
        type: "صادر",
        number: p.docNumber || "ص-" + Date.now().toString().slice(-4),
        date: entry.date,
        subject: `تسليم جواز سفر للمدعو: ${p.fullName} (جواز رقم: ${p.passportNumber})`,
        sender: "فرع استخبارات الشرطة - مصلحة الجوازات",
        recipient: `المواطن: ${p.fullName}`,
        priority: "عادي",
        status: "مكتمل",
        notes: `مرتبط بالخلاصة اليومية - تسليم جوازات`
      };
      p.docNumber = linkedDoc.number;
    } else if (entry.type === 'receive_passports' && entry.receive_passports) {
      const p = entry.receive_passports;
      linkedDoc = {
        id: "doc-" + Date.now().toString() + "-p",
        type: "وارد",
        number: p.recordNumber,
        date: p.recordDate,
        subject: `استلام جوازات بموجب محضر ضبط رقم: ${p.recordNumber} (عدد الجوازات: ${p.passportsCount})`,
        sender: `منفذ: ${p.portName}`,
        recipient: "فرع استخبارات الشرطة",
        priority: "عاجل",
        status: "قيد التنفيذ",
        notes: `مرتبط بالخلاصة اليومية - استلام جوازات (${p.passportsCount} جواز)`
      };
      p.docNumber = linkedDoc.number;
    } else if (entry.type === 'receive_seizure_records' && entry.receive_seizure_records) {
      const p = entry.receive_seizure_records;
      linkedDoc = {
        id: "doc-" + Date.now().toString() + "-p",
        type: "وارد",
        number: p.recordNumber,
        date: p.recordDate,
        subject: `استلام محضر ضبط رقم: ${p.recordNumber} من منفذ: ${p.portName} (عدد الجوازات المضبوطة: ${p.passportsCount})`,
        sender: `منفذ: ${p.portName}`,
        recipient: "فرع استخبارات الشرطة",
        priority: "عاجل",
        status: "قيد التنفيذ",
        notes: `مرتبط بالخلاصة اليومية - استلام محضر ضبط`
      };
      p.docNumber = linkedDoc.number;
    } else if (entry.type === 'residency_renewal_requests' && entry.residency_renewal_requests) {
      const p = entry.residency_renewal_requests;
      linkedDoc = {
        id: "doc-" + Date.now().toString() + "-p",
        type: "وارد",
        number: p.memoNumber,
        date: p.memoDate,
        subject: `طلب تجديد إقامة للمدعو: ${p.personName} (${p.affiliation === 'un_office' ? 'الأمم المتحدة' : p.affiliation === 'un_envoy' ? 'المبعوث الأممي' : 'أخرى'})`,
        sender: "وزارة الخارجية وشؤون المغتربين",
        recipient: "فرع استخبارات الشرطة",
        priority: "عادي",
        status: p.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ',
        notes: `مرتبط بالخلاصة اليومية - الوظيفة: ${p.jobTitle}، مستقر في: ${p.governorate}`
      };
      p.docNumber = linkedDoc.number;
    } else if (entry.type === 'incoming_memos' && entry.incoming_memos) {
      const p = entry.incoming_memos;
      linkedDoc = {
        id: "doc-" + Date.now().toString() + "-p",
        type: "وارد",
        number: p.incomingNumber,
        date: entry.date,
        subject: p.subjectSummary,
        sender: `${p.senderSector} - ${p.address}`,
        recipient: "فرع استخبارات الشرطة",
        priority: "عادي",
        status: p.status === 'responded' ? 'مكتمل' : 'قيد التنفيذ',
        notes: `مرتبط بالخلاصة اليومية - الإجراءات: ${p.actionsTaken}`
      };
      p.docNumber = linkedDoc.number;
    } else if (entry.type === 'outgoing_memos' && entry.outgoing_memos) {
      const p = entry.outgoing_memos;
      linkedDoc = {
        id: "doc-" + Date.now().toString() + "-p",
        type: "صادر",
        number: p.outgoingNumber,
        date: entry.date,
        subject: p.subjectSummary,
        sender: "فرع استخبارات الشرطة",
        recipient: `${p.recipientSector} - ${p.address}`,
        priority: "عادي",
        status: "مكتمل",
        notes: `مرتبط بالخلاصة اليومية - الإجراءات: ${p.actionsTaken}`
      };
      p.docNumber = linkedDoc.number;
    }

    if (linkedDoc) {
      documents.unshift(linkedDoc);
    }

    dailySummaries.unshift(entry);
    res.status(201).json(entry);
  });

  app.delete("/api/daily-summaries/:id", (req, res) => {
    dailySummaries = dailySummaries.filter(ds => ds.id !== req.params.id);
    res.status(204).send();
  });

  app.put("/api/daily-summaries/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, responseDocNumber } = req.body;
    
    const summaryIndex = dailySummaries.findIndex(ds => ds.id === id);
    if (summaryIndex === -1) {
      return res.status(404).json({ error: "Summary not found" });
    }

    const summary = dailySummaries[summaryIndex] as any;
    if (summary.type === 'residency_renewal_requests' && summary.residency_renewal_requests) {
      summary.residency_renewal_requests.status = status;
    } else if (summary.type === 'incoming_memos' && summary.incoming_memos) {
      summary.incoming_memos.status = status;
      if (responseDocNumber) {
        summary.incoming_memos.responseDocNumber = responseDocNumber;
      }
    } else if (summary.type === 'outgoing_memos' && summary.outgoing_memos) {
      summary.outgoing_memos.status = status;
    }

    res.json(summary);
  });

  // Base64 file upload uploader route (robust and writes to local public directory if writeable)
  app.post("/api/upload", async (req, res) => {
    try {
      const { name, base64 } = req.body;
      if (!name || !base64) {
        return res.status(400).json({ error: "Missing file name or base64 data" });
      }

      const fs = await import("fs");
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileBuffer = Buffer.from(base64.split(",")[1] || base64, "base64");
      const cleanName = `${Date.now()}-${name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadsDir, cleanName);
      
      fs.writeFileSync(filePath, fileBuffer);
      const url = `/uploads/${cleanName}`;
      res.json({ url, name });
    } catch (err) {
      console.error("Local file upload failed, using fallback data URL:", err);
      // Fallback: return data url itself so it remains completely functional in any environment!
      res.json({ url: req.body.base64, name: req.body.name });
    }
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
  });
}

startServer();
