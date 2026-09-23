
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
  role: 'admin' | 'user';
  name: string;
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



