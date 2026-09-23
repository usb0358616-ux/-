import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization for Gemini AI SDK
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper to check if a document is older than 6 months (approx 180 days)
function checkIsOlderThan6Months(dateStr: string): boolean {
  if (!dateStr) return false;
  const docDate = new Date(dateStr);
  if (isNaN(docDate.getTime())) return false;
  
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  return docDate.getTime() < sixMonthsAgo.getTime();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // In-memory "Database"
  let documents: any[] = [
    { 
      id: "1", 
      type: "وارد", 
      number: "101", 
      date: "2026-07-03", 
      subject: "طلب إجازة ومتابعة ميدانية", 
      sender: "فرع تعز", 
      recipient: "إدارة الاستخبارات", 
      priority: "عادي", 
      status: "مكتمل",
      isArchived: false
    },
    { 
      id: "2", 
      type: "صادر", 
      number: "202", 
      date: "2026-07-02", 
      subject: "تقرير دوري بنشاط المنافذ", 
      sender: "مكتب الاستخبارات", 
      recipient: "رئاسة المصلحة", 
      priority: "عاجل", 
      status: "قيد التنفيذ",
      isArchived: false
    },
    { 
      id: "3", 
      type: "وارد", 
      number: "305", 
      date: "2026-08-15", 
      subject: "إشعار وصول وفد أممي وتسهيل مهام", 
      sender: "وزارة الخارجية وشؤون المغتربين", 
      recipient: "فرع استخبارات الشرطة", 
      priority: "عاجل", 
      status: "مكتمل",
      isArchived: false
    },
    // Archived documents (Older than 6 months: e.g. dates from late 2025 / early 2026)
    { 
      id: "old-1", 
      type: "وارد", 
      number: "889", 
      date: "2025-10-14", 
      subject: "محضر ضبط جوازات سفر مشتبه بتزويرها بمنفذ الوديعة البري", 
      sender: "إدارة جوازات منفذ الوديعة", 
      recipient: "إدارة الاستخبارات", 
      priority: "عاجل", 
      status: "مكتمل",
      isArchived: true,
      archivedAt: "2026-04-15",
      archiveReason: "تجاوزت 6 أشهر (أرشفة تلقائية لرفع كفاءة وسرعة النظام)",
      attachments: [
        { name: "محضر_ضبط_889.pdf", url: "/sample_report.pdf", size: "1.4 MB" }
      ],
      extractedContent: `جمهورية اليمن - وزارة الداخلية
مصلحة الهجرة والجوازات والجنسية
محضر ضبط وتحريز رقم: 889 / و / 2025
التاريخ: 14 أكتوبر 2025
المنفذ: منفذ الوديعة البري الحدودي
الموضوع: ضبط عدد (3) جوازات سفر عليها علامات تلاعب في التأشيرات والأختام الأمنية.
بيانات حاملي الجوازات:
1- عادل أحمد مسعد العولقي - جواز رقم: 0498112 - تاريخ الإصدار: 2022/05/10.
2- سمير سالم الكندي - جواز رقم: 0319455.
3- جلال فارع ناصر - جواز رقم: 0782341.
الإجراءات المتخذة:
تم التحفظ على الجوازات وإحالة المشتبه بهم إلى فرع استخبارات الشرطة بمصلحة الهجرة والجوازات لإجراء الفحص الجنائي والمطابقة مع القوائم السوداء والممنوعين.`
    },
    { 
      id: "old-2", 
      type: "صادر", 
      number: "742", 
      date: "2025-11-05", 
      subject: "تعميم أمني بشأن التدقيق الاحترازي على طواقم السفن في المنافذ البحرية", 
      sender: "مكتب استخبارات الشرطة", 
      recipient: "إدارات الجوازات بميناء المكلا وميناء عدن وميناء الحديدة", 
      priority: "سري جداً", 
      status: "مكتمل",
      isArchived: true,
      archivedAt: "2026-05-06",
      archiveReason: "تجاوزت 6 أشهر (أرشفة تلقائية لرفع كفاءة وسرعة النظام)",
      attachments: [
        { name: "تعميم_امني_احترازي_742.pdf", url: "/sample_memo.pdf", size: "920 KB" }
      ],
      extractedContent: `مصلحة الهجرة والجوازات والجنسية - فرع استخبارات الشرطة
برقية سرية وهامة - صادر رقم: 742 / ص / 2025
التاريخ: 5 نوفمبر 2025
إلى الأخوة: مدراء عموم فروع مصلحة الهجرة والجوازات بالموانئ البحرية
الموضوع: تشديد إجراءات التدقيق والتحقق من وثائق طواقم السفن التجارية والناقلات.
بناءً على التوجيهات الأمنية العليا والمعلومات الاستخباراتية الواردة:
يتم التفتيش الدقيق ومطابقة كشوفات البحارة (Crew List) والتأكد من سريان الجوازات والتأشيرات البحرية، وعدم منح تصاريح النزول للشاطئ إلا بعد التدقيق الأمني الشامل وإشعار غرفة العمليات.
مدير فرع استخبارات الشرطة.`
    },
    { 
      id: "old-3", 
      type: "وارد", 
      number: "614", 
      date: "2026-01-18", 
      subject: "كشف معاملات تجديد إقامات كوادر المنظمات الدولية والمبعوث الأممي", 
      sender: "شؤون المنظمات - مصلحة الجوازات", 
      recipient: "فرع استخبارات الشرطة", 
      priority: "عادي", 
      status: "مكتمل",
      isArchived: true,
      archivedAt: "2026-07-20",
      archiveReason: "تجاوزت 6 أشهر (أرشفة تلقائية لرفع كفاءة وسرعة النظام)",
      attachments: [
        { name: "كشف_تجديد_اقامات_يناير.pdf", url: "/sample_list.pdf", size: "650 KB" }
      ],
      extractedContent: `مذكرة واردة - شؤون المنظمات الدولية
الرقم المرجعي: 614 / و / 2026
التاريخ: 18 يناير 2026
الموضوع: كشف طلبات تجديد الإقامات لكوادر منظمة OCHA ومكتب المبعوث الأممي.
الأسماء:
1- ديفيد مايكل ميلر - الجنسية: بريطاني - وظيفة: مستشار دعم لوجستي - جواز رقم: GBR55410982.
2- ماريا كارمن سانتوس - الجنسية: إسبانية - وظيفة: مسؤولة تنسيق المساعدات - جواز رقم: ESP982311.
تمت المراجعة والتدقيق والرفع لفرع الاستخبارات للإفادة بالموافقة والتجديد لمدة عام واحد.`
    }
  ];

  // Initial automatic archive scan on server start
  const initialNow = new Date();
  documents.forEach(doc => {
    if (!doc.isArchived && checkIsOlderThan6Months(doc.date)) {
      doc.isArchived = true;
      doc.archivedAt = doc.archivedAt || initialNow.toISOString().split("T")[0];
      doc.archiveReason = doc.archiveReason || "تجاوزت 6 أشهر (أرشفة تلقائية لرفع كفاءة وسرعة النظام)";
    }
  });

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

  // ==========================================
  // قاعدة بيانات نظام معلومات وبيانات الجوازات
  // ==========================================

  let offices: any[] = [
    {
      id: "off-1",
      name: "وكالة الصقر الذهبي للسفريات والسياحة",
      licenseNumber: "TR-441/2023",
      ownerName: "صالح عبدالكريم المرقشي",
      phone: "770123456",
      city: "عدن",
      address: "المنصورة - شارع التسعين",
      status: "نشط",
      totalPassports: 18,
      notes: "وكالة معتمدة لتفويج المسافرين ومعاملات التأشيرات"
    },
    {
      id: "off-2",
      name: "مكتب النورس لخدمات السفر والتأشيرات",
      licenseNumber: "TR-318/2022",
      ownerName: "عمر سالم باسويد",
      phone: "733987654",
      city: "المكلا",
      address: "فوة - بجانب المجمع الحكومي",
      status: "نشط",
      totalPassports: 12,
      notes: "مكتب معتمد لدى فرع جوازات حضرموت"
    },
    {
      id: "off-3",
      name: "وكالة باب المندب للرحلات",
      licenseNumber: "TR-512/2024",
      ownerName: "جميل عبده هزاع",
      phone: "711456789",
      city: "تعز",
      address: "شارع الحروي",
      status: "تحت المراجعة",
      totalPassports: 5,
      notes: "قيد تجديد السجل التجاري والضمان البنكي"
    }
  ];

  let seizures: any[] = [
    {
      id: "sez-1",
      recordNumber: "889/و/2025",
      seizureDate: "2025-10-14",
      seizureTime: "11:30 صباحاً",
      portName: "منفذ الوديعة البري الحدودي",
      portType: "بري",
      officerName: "أحمد سعيد بارجاء",
      officerRank: "رائد",
      authority: "إدارة جوازات منفذ الوديعة",
      passportCount: 3,
      passportNumbers: ["0498112", "0319455", "0782341"],
      violationType: "اشتباه تلاعب في الأختام والتأشيرات الأمنية",
      violationDescription: "تم ضبط حاملي الجوازات أثناء محاولة المغادرة مع وجود علامات كشط واستبدال لصفحات التأشيرات.",
      sourceOfSeizure: "كبينة التدقيق والتفتيش رقم 3",
      arrivalDate: "2025-10-16",
      receivedBy: "النقيب / فواز العريقي",
      status: "مكتمل",
      notes: "تمت إحالة الجوازات للفحص الجنائي والمطابقة الآلية مع قاعدة الممنوعين.",
      createdAt: "2025-10-16T10:00:00.000Z"
    },
    {
      id: "sez-2",
      recordNumber: "412/و/2026",
      seizureDate: "2026-06-20",
      seizureTime: "04:15 مساءً",
      portName: "ميناء عدن البحري",
      portType: "بحري",
      officerName: "خالد منصور القطيبي",
      officerRank: "نقيب",
      authority: "جوازات ميناء المعلا",
      passportCount: 2,
      passportNumbers: ["0891234", "0912456"],
      violationType: "انتهاء صلاحية وتزوير باركود رقمي",
      violationDescription: "تم ضبط المسافرين على متن سفينة ركاب ببيانات غير مطابقة لنظام المصلحة الآلي.",
      sourceOfSeizure: "بوابة رصيف الركاب",
      arrivalDate: "2026-06-21",
      receivedBy: "الملازم / رامي الشعيبي",
      status: "قيد التدقيق",
      notes: "محال لقسم الفحص الأمني والمطابقة",
      createdAt: "2026-06-21T08:30:00.000Z"
    }
  ];

  let securityChecks: any[] = [
    {
      id: "chk-1",
      checkNumber: "SC-889-1",
      date: "2025-10-17",
      passportNumber: "0498112",
      fullName: "عادل أحمد مسعد العولقي",
      nationality: "يمني",
      result: "سليم / خالي من السوابق",
      checkDetails: "تمت المطابقة مع قاعدة بيانات المطلوبين والقوائم السوداء الدولية والمحلية وتبين سلامة الموقف الأمني وتطابق البصمة العشرية.",
      officer: "المقدم / سالم الحارثي",
      history: [
        {
          date: "2025-10-17",
          result: "سليم / خالي من السوابق",
          notes: "لا توجد أي تعاميم أو بلاغات سابقة مسجلة ضده",
          officer: "المقدم / سالم الحارثي"
        }
      ],
      createdAt: "2025-10-17T09:00:00.000Z"
    },
    {
      id: "chk-2",
      checkNumber: "SC-889-2",
      date: "2025-10-17",
      passportNumber: "0319455",
      fullName: "سمير سالم الكندي",
      nationality: "يمني",
      result: "يحتاج إجراء / مطلوب",
      checkDetails: "يوجد تعميم حظر سفر وتوقيف صادر من نيابة الأموال العامة برقم (تعميم 41/2024).",
      officer: "المقدم / سالم الحارثي",
      history: [
        {
          date: "2025-10-17",
          result: "يحتاج إجراء / مطلوب",
          notes: "صادر بحقه تعميم منع سفر من نيابة الأموال العامة",
          officer: "المقدم / سالم الحارثي"
        }
      ],
      createdAt: "2025-10-17T09:30:00.000Z"
    }
  ];

  let deliveries: any[] = [
    {
      id: "del-1",
      deliveryNumber: "DLV-104",
      deliveryType: "owner",
      date: "2025-10-25",
      time: "10:30 صباحاً",
      officer: "الملازم / رامي الشعيبي",
      recipientName: "جلال فارع ناصر",
      nationalId: "01010045612",
      phone: "777889900",
      passportNumber: "0782341",
      notes: "تم تسليم الجواز لصاحبه بعد استكمال إجراءات التحقق وثبوت بطلان الاشتباه.",
      signedBy: "جلال فارع ناصر",
      createdAt: "2025-10-25T10:30:00.000Z"
    },
    {
      id: "del-2",
      deliveryNumber: "DLV-205",
      deliveryType: "office",
      date: "2026-07-01",
      time: "01:00 ظهراً",
      officer: "النقيب / فواز العريقي",
      officeName: "وكالة الصقر الذهبي للسفريات والسياحة",
      agentName: "مندوب الوكالة: مروان فهد الحميري",
      agentNationalId: "03010098711",
      agentPhone: "770123456",
      passportCount: 2,
      passportNumbers: ["0498112", "08765432"],
      notes: "بموجب تفويض رسمي من الوكالة واستيفاء رسوم المعاملات.",
      signedBy: "مروان فهد الحميري (مندوب معتمد)",
      createdAt: "2026-07-01T13:00:00.000Z"
    }
  ];

  let residencies: any[] = [
    {
      id: "res-1",
      type: "إقامة",
      personName: "ديفيد مايكل ميلر",
      passportNumber: "GBR55410982",
      nationality: "بريطاني",
      entryPort: "مطار عدن الدولي",
      sponsorOrEntity: "منظمة OCHA ومكتب المبعوث الأممي",
      expiryDate: "2027-01-18",
      entryDate: "2025-01-10",
      status: "سارية",
      notes: "مستشار دعم لوجستي - تمت الموافقة على تجديد الإقامة لمدة عام"
    },
    {
      id: "res-2",
      type: "إقامة",
      personName: "ماريا كارمن سانتوس",
      passportNumber: "ESP982311",
      nationality: "إسبانية",
      entryPort: "مطار سيئون الدولي",
      sponsorOrEntity: "منظمة أطباء بلا حدود",
      expiryDate: "2026-11-30",
      entryDate: "2025-05-12",
      status: "طلب تجديد",
      notes: "طبيبة جراحة - ملف التجديد تحت المراجعة الأمنية"
    },
    {
      id: "res-3",
      type: "مهاجر / وافد",
      personName: "إيمانويل كويسي",
      passportNumber: "ETH449102",
      nationality: "إثيوبي",
      entryPort: "ساحل بروم - حضرموت",
      sponsorOrEntity: "مركز استقبال وإيواء الهجرة الدولية",
      expiryDate: "2026-10-01",
      entryDate: "2026-08-05",
      status: "قيد المتابعة",
      notes: "دخول غير شرعي عبر البحر - تم الحصر والتسجيل بالتعاون مع منظمة IOM"
    }
  ];

  // بيانات طلبات الموافقات الأمنية وتتبع المدد القانونية (وفق مذكرة وزارة الداخلية الرسمية)
  let securityClearances: any[] = [
    {
      id: "clr-1",
      transactionNumber: "معاملة-98214",
      department: "الإدارة العامة للجنسية",
      serviceType: "زواج اليمني من أجنبية",
      applicantName: "هشام رضوان محمد الأهدل",
      passportOrIdNumber: "0771239",
      nationality: "يمني (الزوجة: سورية)",
      submissionDate: "2026-09-10",
      slaDays: 20,
      dueDate: "2026-09-30",
      status: "قيد الدراسة",
      officerInCharge: "العقيد / نشوان الصليحي",
      batchTransferNumber: "كشف-مصلحة-2026/89",
      securityDecisionNotes: "تمت مخاطبة الأدلة الجنائية للتحري وجارٍ استكمال تدقيق شهادات المعمودية."
    },
    {
      id: "clr-2",
      transactionNumber: "معاملة-55102",
      department: "الإدارة العامة للشؤون العربية والأجنبية",
      serviceType: "طلب تأشيرة الدخول",
      applicantName: "طارق سليم الفاروقي",
      passportOrIdNumber: "JOR992140",
      nationality: "أردني",
      submissionDate: "2026-09-20",
      slaDays: 7,
      dueDate: "2026-09-27",
      status: "قيد الدراسة",
      officerInCharge: "الملازم / رامي الشعيبي",
      batchTransferNumber: "كشف-مصلحة-2026/92",
      securityDecisionNotes: "طلب زيارة عمل تجارية - تحت الفحص الجنائي والمطابقة الآلية."
    },
    {
      id: "clr-3",
      transactionNumber: "معاملة-41120",
      department: "الإدارة العامة للشؤون العربية والأجنبية",
      serviceType: "تجديد طلب الإقامة",
      applicantName: "كارل هاينز شميت",
      passportOrIdNumber: "DEU881023",
      nationality: "ألماني",
      submissionDate: "2026-09-18",
      slaDays: 3,
      dueDate: "2026-09-21",
      status: "تمت الموافقة",
      officerInCharge: "النقيب / فواز العريقي",
      batchTransferNumber: "كشف-مصلحة-2026/90",
      responseDate: "2026-09-20",
      securityDecisionNotes: "خالي من السوابق، لا توجد أي ملاحظات أمنية، موافقة على تجديد إقامة عمل لمدة سنة."
    },
    {
      id: "clr-4",
      transactionNumber: "معاملة-22019",
      department: "الإدارة العامة لشؤون اللاجئين",
      serviceType: "تسجيل طلب اللجوء",
      applicantName: "أبراهام غيديون هايلي",
      passportOrIdNumber: "ERI11094",
      nationality: "إريتري",
      submissionDate: "2026-09-15",
      slaDays: 3,
      dueDate: "2026-09-18",
      status: "قيد الدراسة",
      officerInCharge: "المقدم / سالم الحارثي",
      batchTransferNumber: "كشف-مصلحة-2026/91",
      securityDecisionNotes: "متأخرة عن المدة المحددة نظراً لعدم ورود إفادة فرع الاستخبارات العسكرية بالمحافظة."
    },
    {
      id: "clr-5",
      transactionNumber: "معاملة-77401",
      department: "الإدارة العامة لوثائق السفر",
      serviceType: "منح جوازات سفر لأبناء اليمنيات",
      applicantName: "أحمد كمال الدين البكري",
      passportOrIdNumber: "EGY448912",
      nationality: "مصري (أم يمنية)",
      submissionDate: "2026-09-12",
      slaDays: 3,
      dueDate: "2026-09-15",
      status: "تمت الموافقة",
      officerInCharge: "العقيد / نشوان الصليحي",
      batchTransferNumber: "كشف-مصلحة-2026/88",
      responseDate: "2026-09-14",
      securityDecisionNotes: "تم استيفاء إثبات الجنسية للأم والشهود ومطابقة الفحص الأمني بنجاح."
    }
  ];

  let batchTransfers: any[] = [
    {
      id: "bt-1",
      batchNumber: "كشف-مصلحة-2026/92",
      transferType: "إحالة_للاستخبارات",
      transferDate: "2026-09-20",
      fromEntity: "مكتب رئيس مصلحة الهجرة والجوازات والجنسية",
      toEntity: "فرع استخبارات الشرطة",
      transactionsCount: 3,
      itemsList: [
        { transactionNumber: "معاملة-55102", applicantName: "طارق سليم الفاروقي", serviceType: "طلب تأشيرة الدخول" },
        { transactionNumber: "معاملة-55103", applicantName: "مايكل جون سميث", serviceType: "طلب تأشيرة الدخول" },
        { transactionNumber: "معاملة-55104", applicantName: "عبدالرحمن الشامي", serviceType: "طلب إذن الدخول لأول مرة" }
      ],
      officerSent: "مدير مكتب رئيس المصلحة / فهد الشامي",
      officerReceived: "ضابط خفر الاستخبارات / ملازم رامي الشعيبي",
      receivedStatus: "مستلم وموقع",
      notes: "إحالة بموجب كشف التبادل المشترك وفق البند (ثانياً) من الأمر الإداري."
    },
    {
      id: "bt-2",
      batchNumber: "كشف-ردود-استخبارات-2026/104",
      transferType: "إرجاع_ردود_للمصلحة",
      transferDate: "2026-09-21",
      fromEntity: "فرع استخبارات الشرطة بمصلحة الجوازات",
      toEntity: "الإدارة العامة للشؤون العربية والأجنبية",
      transactionsCount: 2,
      itemsList: [
        { transactionNumber: "معاملة-41120", applicantName: "كارل هاينز شميت", serviceType: "تجديد طلب الإقامة" },
        { transactionNumber: "معاملة-77401", applicantName: "أحمد كمال الدين البكري", serviceType: "منح جوازات سفر لأبناء اليمنيات" }
      ],
      officerSent: "النقيب / فواز العريقي",
      officerReceived: "مدير إدارة الإقامات / مصلحة الجوازات",
      receivedStatus: "مستلم وموقع",
      notes: "تم تسليم الردود الأمنية الرسمية الموقعة مع كشف الاستلام."
    }
  ];

  let passports: any[] = [
    {
      id: "pass-1",
      passportNumber: "0498112",
      fullName: "عادل أحمد مسعد العولقي",
      nationality: "يمني",
      birthDate: "1988-04-12",
      issuePlace: "شبوة",
      issueDate: "2022-05-10",
      expiryDate: "2028-05-09",
      status: "جاهز للتسليم",
      officeId: "off-1",
      officeName: "وكالة الصقر الذهبي للسفريات والسياحة",
      seizureRecordId: "sez-1",
      seizureRecordNumber: "889/و/2025",
      portName: "منفذ الوديعة البري الحدودي",
      securityCheckId: "chk-1",
      securityResult: "سليم",
      securityCheckDate: "2025-10-17",
      isDelivered: false,
      notes: "تم فحص الجواز جنائياً وثبت سلامته بعد الاشتباه به في المنفذ وجاهز للتسليم للوكيل.",
      timeline: [
        {
          id: "t-1",
          date: "2025-10-14",
          time: "11:30",
          type: "ورود الجواز ضمن محضر ضبط",
          description: "تم ضبط الجواز في منفذ الوديعة البري بموجب محضر رقم 889/و/2025 بسبب اشتباه تلاعب في الأختام.",
          user: "الرائد / أحمد سعيد بارجاء"
        },
        {
          id: "t-2",
          date: "2025-10-16",
          time: "10:15",
          type: "تسجيل الجواز في النظام",
          description: "قيد الجواز رسمياً في سجل استخبارات الشرطة وإحالته للفحص الجنائي والمطابقة.",
          user: "النقيب / فواز العريقي"
        },
        {
          id: "t-3",
          date: "2025-10-16",
          time: "14:00",
          type: "إرسال للفحص الأمني",
          description: "تمت إحالة بيانات الجواز وقيد الفحص رقم SC-889-1 للمطابقة مع القوائم الأمنية.",
          user: "الملازم / رامي الشعيبي"
        },
        {
          id: "t-4",
          date: "2025-10-17",
          time: "09:00",
          type: "ورود نتيجة الفحص",
          description: "وردت نتيجة الفحص: سليم / خالي من السوابق ولا توجد أي تعاميم حظر.",
          user: "المقدم / سالم الحارثي"
        },
        {
          id: "t-5",
          date: "2025-10-18",
          time: "11:00",
          type: "جاهز للتسليم",
          description: "تم اعتماد إخلاء طرف الجواز وتجهيزه للتسليم لوكالة الصقر الذهبي.",
          user: "النقيب / فواز العريقي"
        }
      ],
      createdAt: "2025-10-14T11:30:00.000Z"
    },
    {
      id: "pass-2",
      passportNumber: "0319455",
      fullName: "سمير سالم الكندي",
      nationality: "يمني",
      birthDate: "1992-09-20",
      issuePlace: "حضرموت",
      issueDate: "2021-02-15",
      expiryDate: "2027-02-14",
      status: "محال",
      seizureRecordId: "sez-1",
      seizureRecordNumber: "889/و/2025",
      portName: "منفذ الوديعة البري الحدودي",
      securityCheckId: "chk-2",
      securityResult: "يحتاج إجراء",
      securityCheckDate: "2025-10-17",
      isDelivered: false,
      notes: "محال لنيابة الأموال العامة بموجب تعميم المنع 41/2024.",
      timeline: [
        {
          id: "t-21",
          date: "2025-10-14",
          time: "11:30",
          type: "ورود الجواز ضمن محضر ضبط",
          description: "ضبط الجواز في منفذ الوديعة بموجب محضر رقم 889/و/2025.",
          user: "الرائد / أحمد سعيد بارجاء"
        },
        {
          id: "t-22",
          date: "2025-10-16",
          time: "10:20",
          type: "تسجيل الجواز",
          description: "تسجيل الجواز وإحالته للفحص الأمني.",
          user: "النقيب / فواز العريقي"
        },
        {
          id: "t-23",
          date: "2025-10-17",
          time: "09:30",
          type: "ورود نتيجة الفحص",
          description: "نتيجة الفحص: يحتاج إجراء - مطلوب بموجب تعميم نيابة الأموال العامة 41/2024.",
          user: "المقدم / سالم الحارثي"
        },
        {
          id: "t-24",
          date: "2025-10-19",
          time: "12:00",
          type: "محال",
          description: "تمت إحالة أصل الجواز وملف القضية إلى إدارة الشؤون القانونية والنيابة المختصة.",
          user: "النقيب / فواز العريقي"
        }
      ],
      createdAt: "2025-10-14T11:30:00.000Z"
    },
    {
      id: "pass-3",
      passportNumber: "0782341",
      fullName: "جلال فارع ناصر",
      nationality: "يمني",
      birthDate: "1985-11-03",
      issuePlace: "عدن",
      issueDate: "2020-08-11",
      expiryDate: "2026-08-10",
      status: "تم التسليم",
      seizureRecordId: "sez-1",
      seizureRecordNumber: "889/و/2025",
      portName: "منفذ الوديعة البري الحدودي",
      securityResult: "سليم",
      isDelivered: true,
      deliveredTo: "جلال فارع ناصر (شخصياً)",
      deliveredAt: "2025-10-25",
      deliveryReceiptNumber: "DLV-104",
      notes: "تم تسليم الجواز لصاحبه بموجب سند تسليم رسمي والتوقيع على الاستلام.",
      timeline: [
        {
          id: "t-31",
          date: "2025-10-14",
          time: "11:30",
          type: "ورود الجواز ضمن محضر ضبط",
          description: "ضبط الجواز في منفذ الوديعة بموجب محضر رقم 889/و/2025.",
          user: "الرائد / أحمد سعيد بارجاء"
        },
        {
          id: "t-32",
          date: "2025-10-16",
          time: "10:30",
          type: "تسجيل الجواز",
          description: "تسجيل الجواز وإحالته للفحص.",
          user: "النقيب / فواز العريقي"
        },
        {
          id: "t-33",
          date: "2025-10-17",
          time: "10:00",
          type: "ورود نتيجة الفحص",
          description: "نتيجة الفحص سليم وتم تفنيد الاشتباه.",
          user: "المقدم / سالم الحارثي"
        },
        {
          id: "t-34",
          date: "2025-10-20",
          time: "11:00",
          type: "جاهز للتسليم",
          description: "الجواز جاهز للتسليم لصاحبه.",
          user: "الملازم / رامي الشعيبي"
        },
        {
          id: "t-35",
          date: "2025-10-25",
          time: "10:30",
          type: "تم التسليم",
          description: "تم تسليم الجواز رسمياً لصاحبه بموجب سند تسليم رقم DLV-104.",
          user: "الملازم / رامي الشعيبي"
        }
      ],
      createdAt: "2025-10-14T11:30:00.000Z"
    },
    {
      id: "pass-4",
      passportNumber: "0891234",
      fullName: "مروان فهد الحميري",
      nationality: "يمني",
      birthDate: "1995-07-15",
      issuePlace: "تعز",
      issueDate: "2023-01-10",
      expiryDate: "2029-01-09",
      status: "بانتظار الفحص",
      officeId: "off-2",
      officeName: "مكتب النورس لخدمات السفر والتأشيرات",
      seizureRecordId: "sez-2",
      seizureRecordNumber: "412/و/2026",
      portName: "ميناء عدن البحري",
      securityResult: "قيد التدقيق",
      isDelivered: false,
      notes: "مضبوط في ميناء عدن البحري وقيد الفحص والمطابقة الآلية.",
      timeline: [
        {
          id: "t-41",
          date: "2026-06-20",
          time: "16:15",
          type: "ورود الجواز ضمن محضر ضبط",
          description: "ضبط الجواز في ميناء عدن البحري بموجب محضر رقم 412/و/2026.",
          user: "النقيب / خالد منصور"
        },
        {
          id: "t-42",
          date: "2026-06-21",
          time: "09:00",
          type: "تسجيل الجواز",
          description: "تسجيل الجواز في السجل المركزي.",
          user: "الملازم / رامي الشعيبي"
        },
        {
          id: "t-43",
          date: "2026-06-21",
          time: "11:30",
          type: "بانتظار الفحص",
          description: "تمت إحالة الجواز لقسم الفحص الأمني والمطابقة.",
          user: "النقيب / فواز العريقي"
        }
      ],
      createdAt: "2026-06-20T16:15:00.000Z"
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

  // Auto-Archive old documents (> 6 months / 180 days)
  app.post("/api/documents/auto-archive", (req, res) => {
    let archivedCount = 0;
    const now = new Date();
    const nowFormatted = now.toISOString().split("T")[0];

    documents = documents.map(doc => {
      if (!doc.isArchived && checkIsOlderThan6Months(doc.date)) {
        archivedCount++;
        return {
          ...doc,
          isArchived: true,
          archivedAt: doc.archivedAt || nowFormatted,
          archiveReason: "تجاوزت 6 أشهر (أرشفة تلقائية لرفع كفاءة وسرعة النظام)"
        };
      }
      return doc;
    });

    const totalArchived = documents.filter(d => d.isArchived).length;
    res.json({
      success: true,
      archivedCount,
      totalArchived,
      totalActive: documents.filter(d => !d.isArchived).length,
      documents
    });
  });

  // Archive / Unarchive specific document
  app.put("/api/documents/:id/archive", (req, res) => {
    const { id } = req.params;
    const { isArchived, archiveReason } = req.body;
    const docIndex = documents.findIndex(d => d.id === id);
    if (docIndex === -1) {
      return res.status(404).json({ error: "Document not found" });
    }

    const doc = documents[docIndex];
    const nowFormatted = new Date().toISOString().split("T")[0];

    doc.isArchived = Boolean(isArchived);
    if (doc.isArchived) {
      doc.archivedAt = doc.archivedAt || nowFormatted;
      doc.archiveReason = archiveReason || "أرشفة يدوية";
    } else {
      doc.archivedAt = undefined;
      doc.archiveReason = undefined;
    }

    res.json(doc);
  });

  // Update extracted content or attachments for a document
  app.put("/api/documents/:id/content", (req, res) => {
    const { id } = req.params;
    const { extractedContent, attachments } = req.body;
    const docIndex = documents.findIndex(d => d.id === id);
    if (docIndex === -1) {
      return res.status(404).json({ error: "Document not found" });
    }

    const doc = documents[docIndex];
    if (extractedContent !== undefined) {
      doc.extractedContent = extractedContent;
    }
    if (attachments !== undefined) {
      doc.attachments = attachments;
    }

    res.json(doc);
  });

  // Text extraction from files (Gemini 3.8 Flash OCR with reliable fallback)
  app.post("/api/extract-text", async (req, res) => {
    try {
      const { base64, mimeType, fileName, customPrompt } = req.body;

      if (!base64 && !fileName) {
        return res.status(400).json({ error: "لم يتم تقديم ملف أو بيانات للاستخراج" });
      }

      const ai = getGenAI();

      if (ai && base64) {
        // Strip data prefix if present
        const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
        let cleanMime = mimeType || "image/jpeg";
        if (cleanMime.includes(";")) cleanMime = cleanMime.split(";")[0];

        // Format parts for Gemini
        const parts: any[] = [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: cleanMime,
            },
          },
          {
            text: customPrompt || `أنت نظام خبير في الأرشفة والتوثيق لمصلحة الهجرة والجوازات واستخبارات الشرطة.
المطلوب منك: قراءة هذا المستند أو الملف أو الصورة المرفقة واستخراج كافة محتوياته بدقة كاملة (OCR وقراءة النصوص).
قم بتنسيق النصوص المستخرجة بشكل مهني منظم:
1. نوع الوثيقة وعنوانها
2. رقم الوثيقة أو القيد والمرجع والتاريخ
3. أسماء الأشخاص والبيانات الشخصية (أرقام الجوازات، الجنسيات، الوظائف)
4. الجهة الصادرة / المرسلة والمستلمة
5. متن ومضمون المذكرة أو المحضر بالكامل
6. الأختام والتوقيعات والملاحظات المدونة

اكتب النص المستخرج كاملاً بالعربية بوضوح ليوضع في خانة محتويات الملف الخاصة بالأرشيف.`
          }
        ];

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: { parts },
        });

        const extractedText = response.text || "تم فحص الملف ولكن لم يتم العثور على نصوص مقروءة";
        return res.json({
          success: true,
          extractedText,
          method: "ai_gemini_ocr",
          fileName
        });
      }

      // Fallback: If text-based file, read directly from buffer
      if (base64 && (mimeType?.includes("text") || fileName?.endsWith(".txt") || fileName?.endsWith(".csv") || fileName?.endsWith(".json"))) {
        const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
        const textDecoded = Buffer.from(cleanBase64, "base64").toString("utf-8");
        return res.json({
          success: true,
          extractedText: textDecoded,
          method: "direct_text_decode",
          fileName
        });
      }

      // Graceful template fallback when API key is not configured
      const fallbackText = `[بيانات ومحتويات الملف المؤرشف]
اسم الملف: ${fileName || 'مستند مرفق'}
تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')}
حالة الوثيقة: تمت قراءة وفحص بنية الملف وإدراجه في خانة محتويات الملف بنجاح.
(ملاحظة: يمكنك تعديل أو استكمال تفاصيل النص يدوياً في هذه الخانة أو نسخها، وعند ربط مفتاح GEMINI_API_KEY سيعمل الاستخراج الذكي الشامل بالماسح الضوئي تلقائياً).`;

      res.json({
        success: true,
        extractedText: fallbackText,
        method: "smart_template",
        fileName
      });
    } catch (err: any) {
      console.error("Extraction error:", err);
      res.status(500).json({
        error: "حدث خطأ أثناء معالجة واستخراج نصوص الملف",
        details: err.message
      });
    }
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

  // ==========================================
  // مسارات API للجوازات والخط الزمني (Passports)
  // ==========================================

  app.get("/api/passports", (req, res) => {
    const { status, search, officeId } = req.query;
    let result = [...passports];
    if (status && status !== "all") {
      result = result.filter(p => p.status === status);
    }
    if (officeId) {
      result = result.filter(p => p.officeId === officeId);
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(p => 
        p.passportNumber.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q) ||
        (p.nationality && p.nationality.toLowerCase().includes(q)) ||
        (p.officeName && p.officeName.toLowerCase().includes(q)) ||
        (p.seizureRecordNumber && p.seizureRecordNumber.toLowerCase().includes(q))
      );
    }
    res.json(result);
  });

  app.get("/api/passports/:id", (req, res) => {
    const pass = passports.find(p => p.id === req.params.id || p.passportNumber === req.params.id);
    if (!pass) return res.status(404).json({ error: "الجواز غير موجود" });
    res.json(pass);
  });

  app.post("/api/passports", (req, res) => {
    const { passportNumber, fullName, nationality, birthDate, issuePlace, issueDate, expiryDate, status, officeId, officeName, notes, attachments } = req.body;
    
    if (!passportNumber || !fullName) {
      return res.status(400).json({ error: "رقم الجواز واسم حامله حقول إلزامية" });
    }

    // Check duplicate
    const existing = passports.find(p => p.passportNumber.trim() === String(passportNumber).trim());
    if (existing) {
      return res.status(409).json({ error: `رقم الجواز ${passportNumber} مسجل مسبقاً باسم ${existing.fullName}` });
    }

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const newPassport = {
      id: `pass-${Date.now()}`,
      passportNumber: String(passportNumber).trim(),
      fullName: String(fullName).trim(),
      nationality: nationality || "يمني",
      birthDate: birthDate || "",
      issuePlace: issuePlace || "",
      issueDate: issueDate || "",
      expiryDate: expiryDate || "",
      status: status || "جديد",
      officeId: officeId || "",
      officeName: officeName || "",
      notes: notes || "",
      attachments: attachments || [],
      timeline: [
        {
          id: `t-${Date.now()}`,
          date: dateStr,
          time: timeStr,
          type: "تسجيل الجواز",
          description: `تم قيد وتسجيل الجواز في النظام المركزي بحالة (${status || "جديد"}).`,
          user: "المستخدم الحالي"
        }
      ],
      createdAt: now.toISOString()
    };

    passports.unshift(newPassport);
    res.status(201).json(newPassport);
  });

  app.put("/api/passports/:id", (req, res) => {
    const passIndex = passports.findIndex(p => p.id === req.params.id);
    if (passIndex === -1) return res.status(404).json({ error: "الجواز غير موجود" });

    const current = passports[passIndex];
    const updated = { ...current, ...req.body, updatedAt: new Date().toISOString() };

    // Check if status changed to append timeline event
    if (req.body.status && req.body.status !== current.status) {
      const now = new Date();
      updated.timeline = [
        ...(updated.timeline || []),
        {
          id: `t-${Date.now()}`,
          date: now.toISOString().split("T")[0],
          time: now.toTimeString().slice(0, 5),
          type: req.body.status,
          description: req.body.timelineReason || `تغيير حالة الجواز من (${current.status}) إلى (${req.body.status})`,
          user: req.body.user || "المستخدم الحالي"
        }
      ];
    }

    passports[passIndex] = updated;
    res.json(updated);
  });

  app.delete("/api/passports/:id", (req, res) => {
    passports = passports.filter(p => p.id !== req.params.id);
    res.status(204).send();
  });

  app.post("/api/passports/:id/timeline", (req, res) => {
    const pass = passports.find(p => p.id === req.params.id);
    if (!pass) return res.status(404).json({ error: "الجواز غير موجود" });

    const { type, description, user, date, time } = req.body;
    const now = new Date();
    const event = {
      id: `t-${Date.now()}`,
      date: date || now.toISOString().split("T")[0],
      time: time || now.toTimeString().slice(0, 5),
      type: type || "إجراء إداري",
      description: description || "",
      user: user || "موظف السجل"
    };

    pass.timeline = pass.timeline || [];
    pass.timeline.push(event);
    res.status(201).json(event);
  });

  // Bulk import passports from Excel
  app.post("/api/passports/bulk-import", (req, res) => {
    const { rows, sourceFileName } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "لا توجد سجلات للاستيراد" });
    }

    let addedCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];

    rows.forEach((row, idx) => {
      const pNum = String(row.passportNumber || row['رقم الجواز'] || row['رقم'] || row['الجواز'] || '').trim();
      const name = String(row.fullName || row['الاسم'] || row['اسم صاحب الجواز'] || row['الاسم عربي'] || '').trim();
      const nat = String(row.nationality || row['الجنسية'] || 'يمني').trim();
      const office = String(row.officeName || row['المكتب'] || row['الوكالة'] || '').trim();
      const status = (row.status || row['الحالة'] || 'مسجل') as any;

      if (!pNum && !name) return; // skip empty
      if (!pNum) {
        errors.push(`صف ${idx + 1}: تم تخطيه لعدم وجود رقم الجواز`);
        return;
      }

      // Duplicate check
      const existing = passports.find(p => p.passportNumber.toLowerCase() === pNum.toLowerCase());
      if (existing) {
        duplicateCount++;
        // Add note or timeline event
        existing.timeline.push({
          id: `t-${Date.now()}-${idx}`,
          date: dateStr,
          type: "تطابق استيراد Excel",
          description: `تمت مطابقة الجواز ضمن كشف Excel مستورد من ملف (${sourceFileName || 'كشف خارجي'}).`,
          user: "استيراد Excel"
        });
      } else {
        addedCount++;
        passports.push({
          id: `pass-imp-${Date.now()}-${idx}`,
          passportNumber: pNum,
          fullName: name || "بدون اسم مدون",
          nationality: nat,
          status: status || "مسجل",
          officeName: office,
          sourceFile: sourceFileName || "Excel",
          notes: row.notes || row['ملاحظات'] || "",
          timeline: [
            {
              id: `t-${Date.now()}-${idx}`,
              date: dateStr,
              type: "استيراد من كشف Excel",
              description: `تم استيراد الجواز آلياً من ملف: ${sourceFileName || 'كشف Excel'}.`,
              user: "نظام الاستيراد"
            }
          ],
          createdAt: now.toISOString()
        });
      }
    });

    res.json({
      success: true,
      totalProcessed: rows.length,
      addedCount,
      duplicateCount,
      errors
    });
  });

  // ==========================================
  // مسارات محاضر الضبط (Seizure Records)
  // ==========================================

  app.get("/api/seizures", (req, res) => {
    res.json(seizures);
  });

  app.post("/api/seizures", (req, res) => {
    const { recordNumber, seizureDate, seizureTime, portName, portType, officerName, officerRank, authority, passportCount, passportNumbers, violationType, violationDescription, sourceOfSeizure, arrivalDate, receivedBy, status, notes, attachments } = req.body;
    
    if (!recordNumber || !portName) {
      return res.status(400).json({ error: "رقم المحضر واسم المنفذ حقول مطلوبة" });
    }

    const newSeizure = {
      id: `sez-${Date.now()}`,
      recordNumber,
      seizureDate: seizureDate || new Date().toISOString().split("T")[0],
      seizureTime: seizureTime || "صباحاً",
      portName,
      portType: portType || "بري",
      officerName: officerName || "",
      officerRank: officerRank || "",
      authority: authority || "مكتب استخبارات الشرطة",
      passportCount: Number(passportCount) || (passportNumbers ? passportNumbers.length : 0),
      passportNumbers: Array.isArray(passportNumbers) ? passportNumbers : [],
      violationType: violationType || "اشتباه أمني",
      violationDescription: violationDescription || "",
      sourceOfSeizure: sourceOfSeizure || "نقطة التفتيش والتدقيق",
      arrivalDate: arrivalDate || new Date().toISOString().split("T")[0],
      receivedBy: receivedBy || "مناوب الاستلام",
      status: status || "قيد التدقيق",
      notes: notes || "",
      attachments: attachments || [],
      createdAt: new Date().toISOString()
    };

    seizures.unshift(newSeizure);

    // Link/update passports
    if (newSeizure.passportNumbers && newSeizure.passportNumbers.length > 0) {
      newSeizure.passportNumbers.forEach(pNum => {
        const found = passports.find(p => p.passportNumber === pNum.trim());
        if (found) {
          found.seizureRecordId = newSeizure.id;
          found.seizureRecordNumber = newSeizure.recordNumber;
          found.portName = newSeizure.portName;
          found.timeline.push({
            id: `t-sez-${Date.now()}`,
            date: newSeizure.seizureDate,
            type: "ورود الجواز ضمن محضر ضبط",
            description: `تم قيد الجواز ضمن محضر الضبط رقم (${newSeizure.recordNumber}) في (${newSeizure.portName}) - المخالفة: ${newSeizure.violationType}`,
            user: newSeizure.receivedBy
          });
        }
      });
    }

    res.status(201).json(newSeizure);
  });

  app.put("/api/seizures/:id", (req, res) => {
    const idx = seizures.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "محضر الضبط غير موجود" });
    seizures[idx] = { ...seizures[idx], ...req.body };
    res.json(seizures[idx]);
  });

  app.delete("/api/seizures/:id", (req, res) => {
    seizures = seizures.filter(s => s.id !== req.params.id);
    res.status(204).send();
  });

  // ==========================================
  // مسارات الفحص الأمني والمطابقة (Security Checks)
  // ==========================================

  app.get("/api/security-checks", (req, res) => {
    res.json(securityChecks);
  });

  app.post("/api/security-checks", (req, res) => {
    const { passportNumber, fullName, nationality, result, checkDetails, officer, sourceFileName } = req.body;
    
    if (!passportNumber) {
      return res.status(400).json({ error: "رقم الجواز مطلوب للفحص" });
    }

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];

    const newCheck = {
      id: `chk-${Date.now()}`,
      checkNumber: `SC-${Date.now().toString().slice(-4)}`,
      date: dateStr,
      passportNumber: String(passportNumber).trim(),
      fullName: fullName || "",
      nationality: nationality || "يمني",
      result: result || "سليم / خالي من السوابق",
      checkDetails: checkDetails || "تم التدقيق والمطابقة مع القوائم الأمنية",
      officer: officer || "ضابط الفحص والمطابقة",
      sourceFileName: sourceFileName || "",
      history: [
        {
          date: dateStr,
          result: result || "سليم / خالي من السوابق",
          notes: checkDetails || "الفحص الأولي",
          officer: officer || "ضابط الفحص"
        }
      ],
      createdAt: now.toISOString()
    };

    securityChecks.unshift(newCheck);

    // Update corresponding passport if found
    const targetPass = passports.find(p => p.passportNumber.trim() === newCheck.passportNumber);
    if (targetPass) {
      targetPass.securityCheckId = newCheck.id;
      targetPass.securityResult = newCheck.result.includes("سليم") ? "سليم" : 
                                 newCheck.result.includes("يحتاج") ? "يحتاج إجراء" : 
                                 newCheck.result.includes("غير") ? "غير مطابق" : "قيد التدقيق";
      targetPass.securityCheckDate = dateStr;
      
      if (newCheck.result.includes("سليم")) {
        targetPass.status = "جاهز للتسليم";
      } else if (newCheck.result.includes("يحتاج")) {
        targetPass.status = "يحتاج إجراء";
      }

      targetPass.timeline.push({
        id: `t-chk-${Date.now()}`,
        date: dateStr,
        time: now.toTimeString().slice(0, 5),
        type: "ورود نتيجة الفحص",
        description: `نتيجة الفحص الأمني: (${newCheck.result}). التفاصيل: ${newCheck.checkDetails}`,
        user: newCheck.officer
      });
    }

    res.status(201).json(newCheck);
  });

  // ==========================================
  // مسارات التسليم وسندات الاستلام (Deliveries)
  // ==========================================

  app.get("/api/deliveries", (req, res) => {
    res.json(deliveries);
  });

  app.post("/api/deliveries", (req, res) => {
    const { deliveryType, officer, recipientName, nationalId, phone, passportNumber, officeName, agentName, agentNationalId, agentPhone, passportNumbers, notes } = req.body;
    
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const newDelivery = {
      id: `del-${Date.now()}`,
      deliveryNumber: `DLV-${Date.now().toString().slice(-4)}`,
      deliveryType: deliveryType || "owner",
      date: dateStr,
      time: timeStr,
      officer: officer || "مسؤول التسليم",
      recipientName: recipientName || "",
      nationalId: nationalId || "",
      phone: phone || "",
      passportNumber: passportNumber || "",
      officeName: officeName || "",
      agentName: agentName || "",
      agentNationalId: agentNationalId || "",
      agentPhone: agentPhone || "",
      passportCount: deliveryType === "office" ? (passportNumbers ? passportNumbers.length : 0) : 1,
      passportNumbers: deliveryType === "office" ? (passportNumbers || []) : [passportNumber],
      notes: notes || "",
      signedBy: deliveryType === "owner" ? recipientName : agentName,
      createdAt: now.toISOString()
    };

    deliveries.unshift(newDelivery);

    // Update the passports to "تم التسليم"
    const pNumsToDeliver = newDelivery.passportNumbers || [];
    pNumsToDeliver.forEach(pNum => {
      const pass = passports.find(p => p.passportNumber === String(pNum).trim());
      if (pass) {
        pass.status = "تم التسليم";
        pass.isDelivered = true;
        pass.deliveredTo = newDelivery.signedBy || "المستلم";
        pass.deliveredAt = dateStr;
        pass.deliveryReceiptNumber = newDelivery.deliveryNumber;
        pass.timeline.push({
          id: `t-del-${Date.now()}`,
          date: dateStr,
          time: timeStr,
          type: "تم التسليم",
          description: `تم تسليم الجواز بموجب سند التسليم رقم (${newDelivery.deliveryNumber}) إلى (${pass.deliveredTo}).`,
          user: newDelivery.officer
        });
      }
    });

    res.status(201).json(newDelivery);
  });

  // ==========================================
  // مسارات المكاتب والوكالات (Offices)
  // ==========================================

  app.get("/api/offices", (req, res) => {
    // dynamically compute totalPassports
    const result = offices.map(off => ({
      ...off,
      totalPassports: passports.filter(p => p.officeId === off.id || p.officeName === off.name).length
    }));
    res.json(result);
  });

  app.post("/api/offices", (req, res) => {
    const newOffice = {
      id: `off-${Date.now()}`,
      name: req.body.name,
      licenseNumber: req.body.licenseNumber || "قيد الترخيص",
      ownerName: req.body.ownerName || "",
      phone: req.body.phone || "",
      city: req.body.city || "",
      address: req.body.address || "",
      status: req.body.status || "نشط",
      totalPassports: 0,
      notes: req.body.notes || ""
    };
    offices.push(newOffice);
    res.status(201).json(newOffice);
  });

  // ==========================================
  // مسارات التأشيرات والإقامات والمهاجرين (Residencies)
  // ==========================================

  app.get("/api/residencies", (req, res) => {
    res.json(residencies);
  });

  app.post("/api/residencies", (req, res) => {
    const newRes = {
      id: `res-${Date.now()}`,
      type: req.body.type || "إقامة",
      personName: req.body.personName,
      passportNumber: req.body.passportNumber,
      nationality: req.body.nationality || "أجنبي",
      entryPort: req.body.entryPort || "",
      sponsorOrEntity: req.body.sponsorOrEntity || "",
      expiryDate: req.body.expiryDate || "",
      entryDate: req.body.entryDate || "",
      status: req.body.status || "سارية",
      notes: req.body.notes || ""
    };
    residencies.unshift(newRes);
    res.status(201).json(newRes);
  });

  // ==========================================
  // مسارات الموافقات الأمنية وتتبع المدد (SLA & Clearance)
  // ==========================================

  app.get("/api/security-clearances", (req, res) => {
    res.json(securityClearances);
  });

  app.post("/api/security-clearances", (req, res) => {
    const newClearance = {
      id: `clr-${Date.now()}`,
      transactionNumber: req.body.transactionNumber || `معاملة-${Math.floor(10000 + Math.random() * 90000)}`,
      department: req.body.department,
      serviceType: req.body.serviceType,
      applicantName: req.body.applicantName,
      passportOrIdNumber: req.body.passportOrIdNumber,
      nationality: req.body.nationality || "يمني",
      birthDate: req.body.birthDate || "",
      address: req.body.address || "",
      phone: req.body.phone || "",
      sponsorOrFianceName: req.body.sponsorOrFianceName || "",
      sponsorOrFianceNationality: req.body.sponsorOrFianceNationality || "",
      submissionDate: req.body.submissionDate || new Date().toISOString().split("T")[0],
      slaDays: req.body.slaDays || 7,
      dueDate: req.body.dueDate,
      status: req.body.status || "قيد الدراسة",
      officerInCharge: req.body.officerInCharge || "ضابط الاستخبارات",
      batchTransferNumber: req.body.batchTransferNumber || "",
      securityDecisionNotes: req.body.securityDecisionNotes || "",
      attachments: req.body.attachments || [],
      issuedForms: req.body.issuedForms || []
    };
    securityClearances.unshift(newClearance);
    res.status(201).json(newClearance);
  });

  app.put("/api/security-clearances/:id", (req, res) => {
    const idx = securityClearances.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "المعاملة غير موجودة" });

    const current = securityClearances[idx];
    const updated = {
      ...current,
      ...req.body,
      responseDate: (req.body.status === "تمت الموافقة" || req.body.status === "مرفوض") 
        ? new Date().toISOString().split("T")[0] 
        : (req.body.responseDate || current.responseDate)
    };
    securityClearances[idx] = updated;
    res.json(updated);
  });

  // إضافة استمارة رسمية مولدة للمعاملة
  app.post("/api/security-clearances/:id/issue-form", (req, res) => {
    const idx = securityClearances.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "المعاملة غير موجودة" });

    const current = securityClearances[idx];
    const newForm = {
      id: `form-${Date.now()}`,
      templateType: req.body.templateType,
      title: req.body.title,
      serialNumber: req.body.serialNumber || `استمارة-${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`,
      applicantName: current.applicantName,
      passportOrId: current.passportOrIdNumber,
      nationality: current.nationality,
      issueDate: new Date().toISOString().split("T")[0],
      officerName: req.body.officerName || current.officerInCharge || "المختص الأمني",
      formData: req.body.formData || {},
      notes: req.body.notes || "",
      createdAt: new Date().toISOString()
    };

    if (!current.issuedForms) {
      current.issuedForms = [];
    }
    current.issuedForms.unshift(newForm);

    // إضافة إشعار في الملاحظات الأمنية
    current.securityDecisionNotes = `${current.securityDecisionNotes ? current.securityDecisionNotes + ' | ' : ''}تم إصدار (${newForm.title}) برقم قيد (${newForm.serialNumber})`;

    res.status(201).json({ success: true, form: newForm, clearance: current });
  });


  app.get("/api/batch-transfers", (req, res) => {
    res.json(batchTransfers);
  });

  app.post("/api/batch-transfers", (req, res) => {
    const newBt = {
      id: `bt-${Date.now()}`,
      batchNumber: req.body.batchNumber || `كشف-${Date.now()}`,
      transferType: req.body.transferType || "إحالة_للاستخبارات",
      transferDate: req.body.transferDate || new Date().toISOString().split("T")[0],
      fromEntity: req.body.fromEntity,
      toEntity: req.body.toEntity,
      transactionsCount: req.body.transactionsCount || (req.body.itemsList ? req.body.itemsList.length : 0),
      itemsList: req.body.itemsList || [],
      officerSent: req.body.officerSent,
      officerReceived: req.body.officerReceived || "",
      receivedStatus: req.body.receivedStatus || "مستلم وموقع",
      notes: req.body.notes || ""
    };
    batchTransfers.unshift(newBt);
    res.status(201).json(newBt);
  });


  // ==========================================
  // محرك البحث المركزي الموحد (Central Search)
  // ==========================================

  app.get("/api/central-search", (req, res) => {
    const q = String(req.query.q || "").trim().toLowerCase();
    if (!q) {
      return res.json({
        passports: [],
        seizures: [],
        securityChecks: [],
        deliveries: [],
        residencies: [],
        documents: []
      });
    }

    const matchedPassports = passports.filter(p => 
      p.passportNumber.toLowerCase().includes(q) ||
      p.fullName.toLowerCase().includes(q) ||
      (p.nationality && p.nationality.toLowerCase().includes(q)) ||
      (p.officeName && p.officeName.toLowerCase().includes(q)) ||
      (p.seizureRecordNumber && p.seizureRecordNumber.toLowerCase().includes(q))
    );

    const matchedSeizures = seizures.filter(s => 
      s.recordNumber.toLowerCase().includes(q) ||
      s.portName.toLowerCase().includes(q) ||
      s.officerName.toLowerCase().includes(q) ||
      s.violationType.toLowerCase().includes(q) ||
      (s.passportNumbers && s.passportNumbers.some((p: string) => p.toLowerCase().includes(q)))
    );

    const matchedChecks = securityChecks.filter(c => 
      c.passportNumber.toLowerCase().includes(q) ||
      c.fullName.toLowerCase().includes(q) ||
      c.checkNumber.toLowerCase().includes(q) ||
      c.result.toLowerCase().includes(q)
    );

    const matchedDeliveries = deliveries.filter(d => 
      d.deliveryNumber.toLowerCase().includes(q) ||
      (d.recipientName && d.recipientName.toLowerCase().includes(q)) ||
      (d.passportNumber && d.passportNumber.toLowerCase().includes(q)) ||
      (d.officeName && d.officeName.toLowerCase().includes(q)) ||
      (d.agentName && d.agentName.toLowerCase().includes(q)) ||
      (d.passportNumbers && d.passportNumbers.some((p: string) => p.toLowerCase().includes(q)))
    );

    const matchedResidencies = residencies.filter(r => 
      r.personName.toLowerCase().includes(q) ||
      r.passportNumber.toLowerCase().includes(q) ||
      r.sponsorOrEntity.toLowerCase().includes(q) ||
      r.nationality.toLowerCase().includes(q)
    );

    const matchedDocuments = documents.filter(d => 
      d.number.toLowerCase().includes(q) ||
      d.subject.toLowerCase().includes(q) ||
      d.sender.toLowerCase().includes(q) ||
      d.recipient.toLowerCase().includes(q) ||
      (d.extractedContent && d.extractedContent.toLowerCase().includes(q))
    );

    const matchedClearances = securityClearances.filter(c =>
      c.transactionNumber.toLowerCase().includes(q) ||
      c.applicantName.toLowerCase().includes(q) ||
      c.passportOrIdNumber.toLowerCase().includes(q) ||
      c.serviceType.toLowerCase().includes(q) ||
      (c.nationality && c.nationality.toLowerCase().includes(q))
    );

    res.json({
      passports: matchedPassports,
      seizures: matchedSeizures,
      securityChecks: matchedChecks,
      deliveries: matchedDeliveries,
      residencies: matchedResidencies,
      documents: matchedDocuments,
      clearances: matchedClearances
    });
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
