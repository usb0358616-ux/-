
export type DocType = 'وارد' | 'صادر';

export interface DocumentAttachment {
  name: string;
  url: string;
  size?: string;
  type?: string;
  extractedText?: string;
}

export interface Document {
  id: string;
  type: DocType;
  number: string;
  date: string;
  subject: string;
  sender: string;
  recipient: string;
  priority: 'عادي' | 'عاجل' | 'سري جداً';
  status: 'قيد التنفيذ' | 'مكتمل' | 'مرفوض';
  notes?: string;
  isArchived?: boolean;
  archivedAt?: string;
  archiveReason?: string;
  attachments?: DocumentAttachment[];
  extractedContent?: string; // خانة محتويات الملف (النصوص المستخرجة من داخل الملفات)
}

export interface User {
  id: string;
  username: string;
  role: 'super_admin' | 'admin' | 'user';
  name: string;
  permissions?: string[];
}

export type DailySummaryType = 
  | 'delivery_passports' 
  | 'receive_passports'  
  | 'receive_seizure_records' 
  | 'residency_renewal_requests' 
  | 'incoming_memos' 
  | 'outgoing_memos';

export interface PassportDetail {
  id: string;
  fullName: string;
  nationality: string;
  passportNumber: string;
  phone?: string;
  address?: string;
  work?: string;
  entryDate?: string;
  visitType?: string;
  visitExpiry?: string;
  sponsorName?: string;
  sponsorPhone?: string;
}

export interface DailySummaryEntry {
  id: string;
  type: DailySummaryType;
  createdAt: string;
  date: string;
  attachments: { name: string; url: string; size?: string }[];
  
  delivery_passports?: {
    fullName: string;
    nationality: string;
    passportNumber: string;
    docNumber?: string;
    phone?: string;
    address?: string;
    work?: string;
    entryDate?: string;
    visitType?: string;
    visitExpiry?: string;
    sponsorName?: string;
    sponsorPhone?: string;
  };
  
  receive_passports?: {
    portName: string;
    recordNumber: string;
    recordDate: string;
    passportsCount: number;
    passportDetails: PassportDetail[];
    docNumber?: string;
  };

  receive_seizure_records?: {
    portName: string;
    recordNumber: string;
    recordDate: string;
    passportsCount: number;
    passportDetails: PassportDetail[];
    docNumber?: string;
  };

  residency_renewal_requests?: {
    memoNumber: string;
    memoDate: string;
    personName: string;
    affiliation: 'un_office' | 'un_envoy' | 'other';
    jobTitle: string;
    governorate: string;
    actionsTaken: string;
    status: 'completed' | 'pending';
    docNumber?: string;
    nationality?: string;
    passportNumber?: string;
    phone?: string;
    address?: string;
    work?: string;
    entryDate?: string;
    visitType?: string;
    visitExpiry?: string;
    sponsorName?: string;
    sponsorPhone?: string;
  };

  incoming_memos?: {
    incomingNumber: string;
    senderSector: string;
    address: string;
    subjectSummary: string;
    actionsTaken: string;
    status: 'needs_response' | 'pending' | 'responded';
    responseDocNumber?: string;
    docNumber?: string;
  };

  outgoing_memos?: {
    outgoingNumber: string;
    recipientSector: string;
    address: string;
    subjectSummary: string;
    actionsTaken: string;
    status: 'needs_response' | 'pending' | 'responded';
    incomingRefNumber?: string;
    docNumber?: string;
  };
}

export interface PersonalTask {
  id: string;
  title: string;
  dueDate?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

// ==========================================
// هيكل نظام إدارة معلومات وبيانات الجوازات الجديد
// ==========================================

export type PassportStatus = 
  | 'جديد' 
  | 'مسجل' 
  | 'بانتظار الفحص' 
  | 'تم إرسال الفحص' 
  | 'وردت النتيجة' 
  | 'سليم / مخلص' 
  | 'يحتاج إجراء' 
  | 'محال' 
  | 'جاهز للتسليم' 
  | 'تم التسليم' 
  | 'محفوظ' 
  | 'ملغى';

export interface PassportTimelineEvent {
  id: string;
  date: string;
  time?: string;
  type: string; // مثل: 'تسجيل الجواز', 'ورود ضمن محضر ضبط', 'إرسال للفحص الأمني', 'ورود نتيجة الفحص', 'جاهز للتسليم', 'تم التسليم'
  description: string;
  user?: string;
  referenceId?: string;
}

export interface PassportRecord {
  id: string;
  passportNumber: string; // المعرف الأساسي للمطابقة
  fullName: string;
  nationality: string;
  birthDate?: string;
  issuePlace?: string;
  issueDate?: string;
  expiryDate?: string;
  status: PassportStatus;
  
  // الروابط المرجعية
  officeId?: string;
  officeName?: string;
  seizureRecordId?: string;
  seizureRecordNumber?: string;
  portName?: string;
  
  // الفحص الأمني
  securityCheckId?: string;
  securityResult?: 'سليم' | 'يحتاج إجراء' | 'غير مطابق' | 'قيد التدقيق';
  securityCheckDate?: string;
  
  // التسليم
  deliveryId?: string;
  isDelivered?: boolean;
  deliveredTo?: string;
  deliveredAt?: string;
  deliveryReceiptNumber?: string;
  
  // بيانات وملاحظات ومرفقات
  notes?: string;
  timeline: PassportTimelineEvent[];
  attachments?: DocumentAttachment[];
  sourceFile?: string;
  createdAt: string;
  updatedAt?: string;
}

// محاضر الضبط
export interface SeizureRecord {
  id: string;
  recordNumber: string; // رقم المحضر
  seizureDate: string; // تاريخ الضبط
  seizureTime?: string; // وقت الضبط
  portName: string; // المنفذ / النقطة (مثل: منفذ الوديعة، ميناء عدن...)
  portType: 'بري' | 'بحري' | 'جوي' | 'نقطة أمنية';
  officerName: string; // الضابط
  officerRank: string; // الرتبة
  authority: string; // الجهة الضابطة
  passportCount: number; // عدد الجوازات
  passportNumbers: string[]; // أرقام الجوازات المضبوطة
  violationType: string; // نوع المخالفة (تزوير، انتحال، تأشيرة مزورة، قوائم سوداء...)
  violationDescription: string; // وصف المخالفة
  sourceOfSeizure: string; // مصدر الضبط
  arrivalDate: string; // تاريخ وصول المحضر
  receivedBy: string; // الموظف المستلم
  status: 'قيد التدقيق' | 'مكتمل' | 'محال للنيابة' | 'محفوظ في الأرشيف';
  notes?: string;
  attachments?: DocumentAttachment[];
  createdAt: string;
}

// الفحص الأمني والمطابقة
export interface SecurityCheckRecord {
  id: string;
  checkNumber: string;
  date: string;
  passportNumber: string;
  fullName: string;
  nationality: string;
  result: 'سليم / خالي من السوابق' | 'يحتاج إجراء / مطلوب' | 'غير مطابق' | 'قيد الفحص';
  checkDetails: string;
  officer: string;
  sourceFileName?: string;
  sourceSheetName?: string;
  history: {
    date: string;
    result: string;
    notes: string;
    officer: string;
  }[];
  createdAt: string;
}

// التسليم وسندات الاستلام
export interface DeliveryRecord {
  id: string;
  deliveryNumber: string; // رقم سند التسليم
  deliveryType: 'owner' | 'office'; // لصاحب الجواز أو لمكتب/وكالة
  date: string;
  time?: string;
  officer: string;
  
  // بيانات تسليم لصاحب الجواز
  recipientName?: string;
  nationalId?: string;
  phone?: string;
  passportNumber?: string;
  
  // بيانات تسليم لمكتب / وكالة
  officeName?: string;
  agentName?: string;
  agentNationalId?: string;
  agentPhone?: string;
  passportCount?: number;
  passportNumbers?: string[];
  
  notes?: string;
  signedBy?: string;
  createdAt: string;
}

// المكاتب والوكالات
export interface OfficeRecord {
  id: string;
  name: string;
  licenseNumber: string;
  ownerName: string;
  phone: string;
  city: string;
  address?: string;
  status: 'نشط' | 'موقوف' | 'تحت المراجعة';
  totalPassports: number;
  notes?: string;
}

// التأشيرات والإقامات والمهاجرين
export interface ResidencyOrImmigrantRecord {
  id: string;
  type: 'إقامة' | 'تأشيرة' | 'مهاجر / وافد';
  personName: string;
  passportNumber: string;
  nationality: string;
  entryPort: string;
  sponsorOrEntity: string;
  expiryDate?: string;
  entryDate?: string;
  status: 'سارية' | 'منتهية' | 'طلب تجديد' | 'مرحل' | 'قيد المتابعة';
  notes?: string;
}

// طلبات الموافقات الأمنية وتتبع المدد القانونية (SLA Tracker)
export type ClearanceDepartment = 
  | 'الإدارة العامة للجنسية' 
  | 'الإدارة العامة للشؤون العربية والأجنبية' 
  | 'الإدارة العامة لشؤون اللاجئين' 
  | 'الإدارة العامة لوثائق السفر';

export interface SecurityClearanceRequest {
  id: string;
  transactionNumber: string; // رقم المعاملة
  department: ClearanceDepartment;
  serviceType: string; // نوع الخدمة (مثل: زواج يمني من أجنبية، طلب تأشيرة الدخول)
  applicantName: string;
  passportOrIdNumber: string;
  nationality: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  sponsorOrFianceName?: string;
  sponsorOrFianceNationality?: string;
  submissionDate: string; // تاريخ الإحالة
  slaDays: number; // المدة النظامية بالأيام (مثل: 20، 7، 3، 30)
  dueDate: string; // تاريخ الاستحقاق الأقصى
  status: 'قيد الدراسة' | 'تمت الموافقة' | 'مرفوض' | 'مطلوب إفادة وإيضاح';
  officerInCharge: string;
  batchTransferNumber?: string; // رقم كشف التسليم المتبادل بين المصلحة والاستخبارات
  responseDate?: string;
  securityDecisionNotes?: string;
  attachments?: DocumentAttachment[];
  issuedForms?: IssuedOfficialForm[];
  isOverdue?: boolean;
}

// النماذج والاستمارات الرسمية المولدة
export type OfficialFormTemplateType = 
  | 'undertaking_delivery' // استمارة تعهد والتزام باستلام جواز سفر
  | 'marriage_approval_request' // استمارة فحص وموافقة زواج أجنبي/أجنبية
  | 'citizenship_identification' // استمارة تعريف وبحث أمني لطلب الجنسية
  | 'security_clearance_certificate' // شهادة/إشعار عدم ممانعة وموافقة أمنية
  | 'pledge_compliance'; // استمارة إقرار وتعهد عام

export interface IssuedOfficialForm {
  id: string;
  templateType: OfficialFormTemplateType;
  title: string;
  serialNumber: string; // رقم تسلسلي للاستمارة
  applicantName: string;
  passportOrId: string;
  nationality: string;
  issueDate: string;
  officerName: string;
  formData: Record<string, string>; // كافة الحقول المسترجعة والتي تمت تعبئتها
  notes?: string;
  createdAt: string;
}

// كشوفات التسليم المتبادلة بين رئاسة المصلحة وفرع الاستخبارات
export interface BatchTransferRecord {
  id: string;
  batchNumber: string; // رقم الكشف
  transferType: 'إحالة_للاستخبارات' | 'إرجاع_ردود_للمصلحة';
  transferDate: string;
  fromEntity: string; // مكتب رئيس المصلحة أو فرع الاستخبارات
  toEntity: string;
  transactionsCount: number;
  itemsList: {
    transactionNumber: string;
    applicantName: string;
    serviceType: string;
  }[];
  officerSent: string;
  officerReceived?: string;
  receivedStatus: 'مستلم وموقع' | 'بانتظار الاستلام والتدقيق';
  notes?: string;
}

// ========================================================
// المجموعة 1 و 8: سجل المنافذ السيادية الـ 13 للجمهورية اليمنية
// ========================================================
export type PortType = 'جوي' | 'بحري' | 'بري';
export type PortStatus = 'يعمل بكفاءة' | 'تحت التحديث' | 'قيود تشغيلية' | 'مغلق مؤقتاً';

export interface PortRecord {
  id: string;
  code: string;
  name: string;
  englishName: string;
  type: PortType;
  governorate: string; // المحافظة
  status: PortStatus;
  directorName: string; // مدير جوازات المنفذ
  directorRank: string; // الرتبة
  phone: string;
  dailyCapacity: number; // الطاقة الاستيعابية اليومية
  activeShift: 'صباحية' | 'مسائية' | 'ليلية / 24 ساعة';
  coordinates?: string;
  connectedToHQ: boolean; // متصل بالشبكة المركزية
  totalEntriesToday: number;
  totalExitsToday: number;
  seizuresCount: number;
  securityAlertsCount: number;
  notes?: string;
}

// ========================================================
// المجموعة 7: تصاريح التنقل للمسافرين والمنظمات والبعثات
// ========================================================
export type MovementEntityType = 'منظمة دولية (UN / INGO)' | 'بعثة دبلوماسية' | 'وفد تجاري / شركات' | 'وفد إعلامي' | 'وافدون وأفراد';
export type MovementPurpose = 'إنساني وإغاثي' | 'دبلوماسي ورسمي' | 'أعمال ومشاريع هندسية' | 'تغطية إعلامية' | 'زيارة سياحية / استكشافية';
export type MovementPermitStatus = 'مصرح وساري' | 'منتهي الصلاحية' | 'معلق للدواعي الأمنية' | 'قيد التدقيق الأمني' | 'ملغي';

export interface MovementCompanion {
  id: string;
  name: string;
  passportOrId: string;
  nationality: string;
  role: string;
}

export interface MovementVehicle {
  id: string;
  plateNumber: string;
  plateGovernorate: string;
  modelAndColor: string;
  driverName: string;
  driverPhone: string;
}

export interface MovementDevice {
  id: string;
  deviceType: 'جهاز لاسلكي VHF/HF' | 'هاتف ثريا فضائي (Thuraya)' | 'طائرة درون تصوير (Drone)' | 'كاميرا احترافية' | 'معدات اتصالات وتشفير';
  brandModel: string;
  serialNumber: string;
  frequencyOrBand?: string;
  isApproved: boolean;
}

export interface MovementPermitRecord {
  id: string;
  permitNumber: string; // رقم التصريح الأمني
  entityType: MovementEntityType;
  organizationName: string;
  applicantLeaderName: string;
  leaderPassport: string;
  leaderNationality: string;
  leaderPhone: string;
  purpose: MovementPurpose;
  originGovernorate: string; // نقطة الانطلاق
  destinationGovernorates: string[]; // المحافظات المشمولة
  approvedRoute: string; // خط السير ونقاط التفتيش المعتمدة
  accommodations: string; // أماكن الإقامة والمبيت
  startDate: string;
  endDate: string;
  validDays: number;
  status: MovementPermitStatus;
  companions: MovementCompanion[];
  vehicles: MovementVehicle[];
  devices: MovementDevice[];
  approvingOfficer: string;
  securityBarcodeToken: string; // رمز التتبع الأمني للنقاط
  specialInstructions?: string;
  createdAt: string;
}

// ========================================================
// المجموعة 10: سجل المنظمات والبعثات الدولية العاملة في اليمن
// ========================================================
export type OrgCategory = 'وكالة أمم متحدة (UN)' | 'منظمة دولية غير حكومية (INGO)' | 'هيئة إقليمية' | 'بعثة دبلوماسية سفارة';
export type OrgStatus = 'معتمدة وسارية' | 'قيد تجديد البروتوكول' | 'موقوفة مؤقتاً';

export interface InternationalOrganization {
  id: string;
  orgCode: string; // رمز المنظمة
  arabicName: string;
  englishName: string;
  acronym: string; // مثل: OCHA, UNICEF, WFP, ICRC
  category: OrgCategory;
  countryOfOrigin: string; // بلد المقر
  agreementNumber: string; // رقم الاتفاقية الأساسية
  agreementDate: string;
  headOfMission: string;
  securityFocalPoint: string;
  phone: string;
  email: string;
  headquartersAddress: string;
  subOffices: string[]; // الفروع في المحافظات
  activeForeignStaff: number; // عدد الكوادر الأجانب
  activeLocalStaff: number; // عدد الكوادر المحليين
  registeredVehicles: number;
  status: OrgStatus;
  activeProjectsSummary: string;
  notes?: string;
}

// ========================================================
// المجموعة 4 و 5: سجل اللاجئين والمهاجرين
// ========================================================
export type RefugeeStatus = 'طالب لجوء مسجل' | 'حاصل على بطاقة لاجئ معتمدة' | 'في انتظار الترحيل والعودة الطوعية' | 'طلب مرفوض' | 'مغادر للبلاد';

export interface RefugeeRecord {
  id: string;
  refugeeFileNumber: string; // رقم ملف اللجوء
  unhcrCardNumber?: string; // رقم بطاقة المفوضية
  fullName: string;
  motherName?: string;
  nationality: string;
  gender: 'ذكر' | 'أنثى';
  birthDate: string;
  maritalStatus: 'أعزب' | 'متزوج' | 'أرمل' | 'مطلق';
  arrivalDate: string;
  arrivalPortOrCoast: string; // نقطة أو ساحل الوصول (مثل: ذباب، أحور، المخا)
  currentResidence: string; // مخيم أو عنوان الإقامة الحالية (مثل: مخيم خرز)
  sponsorOrEntity: string; // الكفيل أو جهة الرعاية
  status: RefugeeStatus;
  dependentsCount: number; // عدد المرافقين من أفراد العائلة
  biometricCollected: boolean; // تم أخذ البصمة العشرية والوجه
  medicalClearance: 'لائق صحياً' | 'تحت الفحص الطبي' | 'حالات خاصة';
  temporaryPermitExpiry?: string;
  notes?: string;
  createdAt: string;
}

// ========================================================
// المجموعة 1: سجل التدقيق الأمني والرقابة (Sovereign Audit Log)
// ========================================================
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  officerName: string;
  officerRole: string;
  actionType: 'إنشاء' | 'تعديل' | 'حذف' | 'أرشفة' | 'فحص أمني' | 'إصدار تصريح' | 'استيراد ذكي' | 'تسجيل ضبط';
  module: 'الجوازات' | 'المنافذ' | 'محاضر الضبط' | 'الفحص الأمني' | 'الموافقات SLA' | 'تصاريح التنقل' | 'المنظمات' | 'اللاجئون' | 'الأرشيف';
  recordIdentifier: string; // معرف السجل أو رقمه
  details: string;
  terminalIp?: string;
}

// ========================================================
// الملحق الرسمي: بيانات SLA وسياسات الخدمات الـ 15 الإلزامية
// ========================================================
export interface SlaPolicy {
  id: number;
  service_code: string;
  service_name: string;
  department: ClearanceDepartment;
  days_limit: number;
  legal_reference: string;
  effective_from: string;
  effective_to: string;
  notes: string;
  fees?: number;
}

// ========================================================
// كيان فرع استخبارات الشرطة (Police Intelligence Requests)
// ========================================================
export interface PoliceIntelligenceRequest {
  id: string;
  entryNumber: string; // رقم القيد في المستند (1917/المرجع)
  investigationNumber: string; // رقم التحقيق في المستند (1191)
  requestingEntity: string; // الجهة الطالبة
  requestType: 'فحص أمني ومطابقة' | 'تحرٍ ومتابعة استخباراتية' | 'أمر توقيف وضبط' | 'استعلام سوابق وقوائم';
  subjectName: string;
  passportOrIdNumber: string;
  nationality: string;
  slaDays: number; // 3 أيام للرد كحد أقصى
  receivedDate: string; // تاريخ الورود
  hijriDate?: string; // التاريخ الهجري (1448/3/5 هـ)
  dueDate: string;
  responseDate?: string;
  result: 'سليم / لا مانع أمني' | 'مطلوب إجراء / تعميم حظر' | 'قيد التحري والتدقيق' | 'مرفوض ومحال للتحقيق';
  status: 'قيد الدراسة' | 'تم الرد والإنجاز' | 'متأخرة';
  investigatorOfficer: string;
  findingsAndEvidence?: string;
  notes?: string;
  createdAt: string;
}

// ========================================================
// المكاتبات والمراسلات الرسمية والقوالب السيادية
// ========================================================
export type OfficialCorrespondenceTemplateType = 
  | 'internal_telegram' // برقية داخلية (بين الإدارات)
  | 'official_memo' // مذكرة رسمية (للخارج)
  | 'security_investigation_request' // طلب تحرٍ أمني (للاستخبارات)
  | 'auto_reply'; // رد على طلب (يولد تلقائياً)

export interface OfficialCorrespondence {
  id: string;
  templateType: OfficialCorrespondenceTemplateType;
  incomingOrOutgoingNumber: string; // رقم الوارد / الصادر تلقائي سنوي
  gregorianDate: string; // التاريخ الميلادي
  hijriDate: string; // التاريخ الهجري (1448/3/5 هـ)
  fromEntity: string; // من
  toEntity: string; // إلى
  referenceNumber: string; // الإشارة (رقم المرجع السابق)
  investigationNumber?: string; // رقم التحقيق (1191)
  entryNumber?: string; // رقم القيد (1917)
  subject: string; // الموضوع
  openingGreeting: string; // العطف / بعد التحية
  bodyContent: string; // المتضمن
  closingDirective: string; // وعليه
  closingGreeting: string; // التحية الختامية
  signatoryName: string; // التوقيع + الاسم
  signatoryRank: string;
  officialStamp: string; // الختم
  createdAt: string;
}

// ========================================================
// الرقابة على الشركات والوكالات (Corporate Security Oversight)
// ========================================================
export type MonitoredCompanyCategory = 
  | 'شركات الحج والعمرة'
  | 'شركات الصرافة'
  | 'شركات السفر والسياحة'
  | 'وكالات التوظيف'
  | 'شركات التأمين';

export type CompanySecurityStatus = 'مسموح ومعتمد' | 'موقوف مؤقتاً' | 'محظور أمنياً' | 'تحت التدقيق';

export interface CompanyViolationRecord {
  id: string;
  violationDate: string;
  violationType: string;
  decisionNumber: string;
  decisionDate: string;
  actionTaken: 'إنذار رسمي' | 'إيقاف مؤقت' | 'إلغاء ترخيص وحظر' | 'غرامة مالية';
  officerName: string;
  notes?: string;
}

export interface MonitoredCompany {
  id: string;
  companyCode: string;
  name: string;
  commercialRegisterNumber: string;
  category: MonitoredCompanyCategory;
  licenseNumber: string;
  licenseExpiryDate: string;
  ownerName: string;
  managerName: string;
  phone: string;
  governorate: string;
  address: string;
  securityStatus: CompanySecurityStatus;
  statusDecisionNumber?: string;
  statusDecisionDate?: string;
  violations: CompanyViolationRecord[];
  notes?: string;
  createdAt: string;
}

// ========================================================
// ملحق 2: وحدة المطور (الوحدة 14) - Developer Customization Module
// نظام المنصة القابلة للتخصيص الكامل (Metadata-Driven Platform)
// ========================================================

export type EntityType = 
  | 'refugee' 
  | 'passenger' 
  | 'seizure' 
  | 'passport' 
  | 'security_check' 
  | 'clearance' 
  | 'movement_permit' 
  | 'company' 
  | 'intelligence' 
  | 'correspondence';

export type CustomFieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'dropdown' 
  | 'checkbox' 
  | 'textarea' 
  | 'phone' 
  | 'email' 
  | 'file';

// 1. تعريف الحقول (field_definitions)
export interface FieldDefinition {
  id: number;
  entity_type: EntityType;
  field_key: string;
  label_ar: string;
  label_en?: string;
  field_type: CustomFieldType;
  is_required: number | boolean;
  is_system: number | boolean; // 1 = حقل أساسي لا يحذف
  is_visible: number | boolean; // 0 = مخفي
  default_value?: string;
  validation_regex?: string;
  min_value?: number;
  max_value?: number;
  max_length?: number;
  display_order: number;
  group_name?: string; // تجميع الحقول: "بيانات شخصية", "بيانات أمنية"
  help_text?: string;
  storage_strategy: 'column' | 'eav';
  list_code?: string; // رمز القائمة لحقول dropdown
  created_at: string;
  updated_at?: string;
}

// 2. قيم الحقول المخصصة EAV (custom_field_values)
export interface CustomFieldValue {
  id: number;
  entity_type: EntityType;
  entity_id: string | number;
  field_key: string;
  value_text?: string;
  value_number?: number;
  value_date?: string;
  value_bool?: number | boolean;
  updated_at: string;
}

// 3. تعديل التسميات (label_overrides)
export interface LabelOverride {
  id: number;
  entity_type: EntityType;
  field_key: string;
  original_label: string;
  new_label: string;
  language: string;
  created_at: string;
}

// 4. قوائم الاختيار (list_definitions & list_values)
export interface ListDefinition {
  id: number;
  list_code: string;
  list_name_ar: string;
  description?: string;
  is_system: number | boolean;
  created_at: string;
  valuesCount?: number;
}

export interface ListValue {
  id: number;
  list_code: string;
  value_ar: string;
  value_en?: string;
  code?: string;
  sort_order: number;
  is_active: number | boolean;
  is_default: number | boolean;
  created_at: string;
}

// 5. الحقول التلقائية ومولد التسلسلات (auto_field_rules)
export type AutoRuleType = 'sequence' | 'date' | 'user' | 'formula' | 'constant';
export type AutoRuleResetPeriod = 'yearly' | 'monthly' | 'daily' | 'never';

export interface AutoFieldRule {
  id: number;
  entity_type: EntityType;
  field_key: string;
  rule_type: AutoRuleType;
  rule_pattern: string; // e.g. محضر-{YYYY}-{NNNNN}
  reset_period: AutoRuleResetPeriod;
  current_counter: number;
  counter_padding: number; // 5 -> 00001
  last_reset_date?: string;
  preview_example: string;
  is_active: number | boolean;
  notes?: string;
  created_at: string;
}

// 6. قوالب الطباعة وأقسامها (print_templates & template_sections)
export type PageSizeType = 'A4' | 'A5' | 'Letter' | 'Card';
export type PageOrientationType = 'portrait' | 'landscape';
export type TemplateSectionType = 'header' | 'footer' | 'watermark';

export interface TemplateSection {
  id: number;
  template_id: number;
  section_type: TemplateSectionType;
  content_html: string;
  height_mm: number;
  is_repeating: number | boolean;
  background_color: string;
  text_color: string;
}

export interface PrintTemplate {
  id: number;
  template_code: string;
  template_name_ar: string;
  entity_type: EntityType;
  page_size: PageSizeType;
  orientation: PageOrientationType;
  margins_top: number;
  margins_bottom: number;
  margins_left: number;
  margins_right: number;
  body_html: string;
  is_default: number | boolean;
  is_system: number | boolean;
  is_active: number | boolean;
  sections?: TemplateSection[];
  created_at: string;
  updated_at?: string;
}

// 7. تخطيط النماذج (form_layouts)
export interface FormLayoutRow {
  fields: string[];
}

export interface FormLayoutGroup {
  title: string;
  rows: FormLayoutRow[];
}

export interface FormLayoutTab {
  title: string;
  groups: FormLayoutGroup[];
}

export interface FormLayoutSchema {
  tabs: FormLayoutTab[];
}

export interface FormLayout {
  id: number;
  entity_type: EntityType;
  layout_name: string;
  layout_json: string | FormLayoutSchema;
  is_default: number | boolean;
  is_system: number | boolean;
  created_at: string;
}

// 8. النسخ الاحتياطي للهيكل (schema_snapshots)
export interface SchemaSnapshot {
  id: number;
  snapshot_name: string;
  snapshot_type: 'field_add' | 'label_edit' | 'rule_change' | 'template_edit' | 'manual_backup' | 'restore';
  schema_json: string;
  created_by: string;
  created_at: string;
  restored_at?: string;
}





