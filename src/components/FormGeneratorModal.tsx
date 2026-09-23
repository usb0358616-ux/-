import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  UserCheck, 
  HeartHandshake, 
  Stamp, 
  Save,
  AlertCircle
} from 'lucide-react';
import type { 
  SecurityClearanceRequest, 
  OfficialFormTemplateType, 
  IssuedOfficialForm, 
  User 
} from '../types';

interface Props {
  clearance: SecurityClearanceRequest;
  user: User | null;
  onClose: () => void;
  onFormSaved: () => void;
}

export interface FormTemplateDefinition {
  type: OfficialFormTemplateType;
  title: string;
  category: string;
  description: string;
  defaultFields: {
    key: string;
    label: string;
    defaultValue: (c: SecurityClearanceRequest) => string;
    placeholder?: string;
    type?: 'text' | 'date' | 'textarea' | 'select';
    options?: string[];
  }[];
  legalPreamble: string;
  pledgeClause: string;
}

export const OFFICIAL_TEMPLATES: FormTemplateDefinition[] = [
  {
    type: 'undertaking_delivery',
    title: 'استمارة تعهد والتزام باستلام جواز سفر',
    category: 'شؤون الجوازات والمنافذ',
    description: 'تعهد رسمي بالمسؤولية القانونية والمحافظة على الجواز وعدم الرهن أو التفريط.',
    legalPreamble: 'بناءً على قانون الجوازات وتوجيهات فرع استخبارات الشرطة بمصلحة الهجرة والجوازات والجنسية، وبعد استكمال إجراءات التدقيق والتحري الأمني اللازم.',
    pledgeClause: 'أقر أنا الموقع أدناه بكامل الأهلية المعتبرة شرعاً وقانوناً بأنني استلمت جواز السفر الموضح بياناته أعلاه، وأتعهد بالمحافظة عليه وعدم تسليمه أو رهنه لدى أي جهة أو شخص، وأتحمل كامل المسؤولية الجنائية والمدنية في حال ثبوت خلاف ذلك.',
    defaultFields: [
      { key: 'applicantName', label: 'اسم صاحب الجواز الرباعي', defaultValue: (c) => c.applicantName },
      { key: 'passportNumber', label: 'رقم جواز السفر', defaultValue: (c) => c.passportOrIdNumber },
      { key: 'nationality', label: 'الجنسية', defaultValue: (c) => c.nationality },
      { key: 'birthDate', label: 'تاريخ الميلاد', defaultValue: (c) => c.birthDate || '' },
      { key: 'nationalId', label: 'رقم البطاقة الشخصية / الوطنية', defaultValue: (c) => c.phone ? `بطاقة: ${c.passportOrIdNumber}` : '' },
      { key: 'phone', label: 'رقم الهاتف للتواصل', defaultValue: (c) => c.phone || '770000000' },
      { key: 'residenceAddress', label: 'عنوان السكن الدائم', defaultValue: (c) => c.address || 'العاصمة / المحافظة - الحي' },
      { key: 'releaseReason', label: 'سبب الضبط أو التحفظ السابق', defaultValue: (c) => 'فحص مطابقة أمنية واشتباه في المنافذ وثبت سلامته' },
      { key: 'officerInCharge', label: 'الضابط المعتمد لإجراءات التسليم', defaultValue: (c) => c.officerInCharge }
    ]
  },
  {
    type: 'marriage_approval_request',
    title: 'استمارة فحص وتحري طلب موافقة زواج من أجنبية / أجنبي',
    category: 'الإدارة العامة للجنسية',
    description: 'استمارة التحري الأمني واستيفاء الشروط لزواج المواطن اليمني من أجنبية أو العكس.',
    legalPreamble: 'إلى الأخ / مدير عام الاستخبارات والتحريات - استناداً إلى اللائحة التنفيذية لوزارة الداخلية الخاصة بضوابط زواج اليمنيين من أجانب، يتم الرفع بنتائج الفحص التالي:',
    pledgeClause: 'يقر صاحب المعاملة بصحة كافة البيانات والشهادات والمستندات المرفقة، ويتحمل المسؤولية أمام القضاء في حال الإدلاء بأي معلومات مضللة، كما يتعهد بإشعار الإدارة فور إتمام عقد القران وتوثيقه.',
    defaultFields: [
      { key: 'applicantName', label: 'اسم الطرف اليمني (مقدم الطلب)', defaultValue: (c) => c.applicantName },
      { key: 'passportNumber', label: 'رقم البطاقة / الجواز', defaultValue: (c) => c.passportOrIdNumber },
      { key: 'nationality', label: 'جنسية مقدم الطلب', defaultValue: (c) => c.nationality },
      { key: 'fianceName', label: 'اسم الطرف الأجنبي (المراد الزواج منه/منها)', defaultValue: (c) => c.sponsorOrFianceName || 'فلانة بنت فلان' },
      { key: 'fianceNationality', label: 'جنسية الطرف الأجنبي', defaultValue: (c) => c.sponsorOrFianceNationality || 'سورية / أجنبية' },
      { key: 'fiancePassport', label: 'رقم جواز سفر الطرف الأجنبي', defaultValue: () => 'A098231' },
      { key: 'applicantProfession', label: 'مهنة / وظيفة المتقدم ومصدر الدخل', defaultValue: () => 'أعمال حرة / موظف حكومي' },
      { key: 'socialStatus', label: 'الحالة الاجتماعية السابقة', defaultValue: () => 'أعزب / متزوج' },
      { key: 'securityCheckVerdict', label: 'نتيجة الفحص الجنائي والأمني للطرفين', defaultValue: (c) => c.securityDecisionNotes || 'خالي من القيود الأمنية ولا توجد موانع نظامية' }
    ]
  },
  {
    type: 'citizenship_identification',
    title: 'استمارة تعريف وبحث أمني لطلب منح / اكتساب الجنسية',
    category: 'الإدارة العامة للجنسية',
    description: 'استمارة حصر السوابق والتحقق من شروط الإقامة والولاء وفق القانون.',
    legalPreamble: 'بموجب المادة القانونية الناظمة للجنسية اليمنية والقرارات الجمهورية الصادرة بشأن شروط المنح والاكتساب لزوجات المواطنين أو الكفاءات.',
    pledgeClause: 'يتعهد طالب الجنسية باحترام الدستور والقوانين النافذة والولاء للجمهورية اليمنية، ويقر بأنه لم يسبق إدانته بأي جناية أو جريمة مخلة بالشرف والأمانة.',
    defaultFields: [
      { key: 'applicantName', label: 'اسم طالب الجنسية الرباعي', defaultValue: (c) => c.applicantName },
      { key: 'originNationality', label: 'الجنسية الأصلية السابقة', defaultValue: (c) => c.nationality },
      { key: 'passportNumber', label: 'رقم جواز السفر الحالي', defaultValue: (c) => c.passportOrIdNumber },
      { key: 'entryDateToCountry', label: 'تاريخ الدخول للبلاد ومدة الإقامة المتصلة', defaultValue: () => '2015-02-10 (أكثر من 10 سنوات إقامة نظامية)' },
      { key: 'maritalStatus', label: 'المسوغ القانوني للطلب', defaultValue: () => 'زوجة مواطن يمني بموجب عقد شرعي' },
      { key: 'sponsorHusbandName', label: 'اسم الزوج / الكفيل اليمني ورقم هويته', defaultValue: (c) => c.sponsorOrFianceName || 'الزوج: يمني الجنسية' },
      { key: 'criminalRecordStatus', label: 'موقف الفيش الجنائي والأدلة الجنائية', defaultValue: () => 'صحيفة الحالة الجنائية نظيفة بالكامل' },
      { key: 'intelligenceRecommendation', label: 'توصية فرع الاستخبارات', defaultValue: () => 'لا مانع أمنياً من السير في إجراءات العرض للاكتساب' }
    ]
  },
  {
    type: 'security_clearance_certificate',
    title: 'إشعار عدم ممانعة وموافقة أمنية رسمية',
    category: 'قطاع الاستخبارات والشؤون الأمنية',
    description: 'شهادة إشعار رسمي من فرع الاستخبارات بالموافقة على منح التأشيرة أو تجديد الإقامة.',
    legalPreamble: 'إلى الأخ / مدير عام الشؤون العربية والأجنبية المحترم - تحية طيبة وبعد؛ بالإشارة إلى المعاملة المحالة إلينا والموضحة أعلاه، نود إشعاركم بما يلي:',
    pledgeClause: 'يتم العمل بموجب هذه الموافقة الأمنية للفترة المحددة نظاماً وتسقط صلاحيتها في حال طرأت أي معلومات أو تعاميم حظر جديدة من أجهزة وزارة الداخلية.',
    defaultFields: [
      { key: 'transactionNumber', label: 'رقم الإحالة والمعاملة الأصلية', defaultValue: (c) => c.transactionNumber },
      { key: 'applicantName', label: 'الاسم الصادر بشأنه الموافقة', defaultValue: (c) => c.applicantName },
      { key: 'nationality', label: 'الجنسية', defaultValue: (c) => c.nationality },
      { key: 'passportNumber', label: 'رقم جواز السفر / الوثيقة', defaultValue: (c) => c.passportOrIdNumber },
      { key: 'serviceApproved', label: 'الخدمة المصرح والموافق عليها', defaultValue: (c) => c.serviceType },
      { key: 'validityPeriod', label: 'فترة الصلاحية المصرح بها', defaultValue: () => 'سنة واحدة من تاريخ الصدور' },
      { key: 'approvingOfficer', label: 'مدير فرع استخبارات الشرطة بالمصلحة', defaultValue: () => 'العميد / محمد قاسم الحرازي' }
    ]
  }
];

export default function FormGeneratorModal({
  clearance,
  user,
  onClose,
  onFormSaved
}: Props) {
  const [selectedTemplateType, setSelectedTemplateType] = useState<OfficialFormTemplateType>(
    clearance.serviceType.includes('زواج') ? 'marriage_approval_request' :
    clearance.serviceType.includes('جنسية') ? 'citizenship_identification' :
    'undertaking_delivery'
  );

  const currentTemplate = OFFICIAL_TEMPLATES.find(t => t.type === selectedTemplateType) || OFFICIAL_TEMPLATES[0];

  // Populate dynamic form values based on template defaults
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    currentTemplate.defaultFields.forEach(f => {
      initial[f.key] = f.defaultValue(clearance);
    });
    return initial;
  });

  const [serialNumber, setSerialNumber] = useState(
    `استمارة-${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`
  );
  const [officerName, setOfficerName] = useState(user?.name || clearance.officerInCharge || 'المختص الأمني');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // When switching templates, reinitialize fields
  const handleTemplateChange = (type: OfficialFormTemplateType) => {
    setSelectedTemplateType(type);
    const tmpl = OFFICIAL_TEMPLATES.find(t => t.type === type);
    if (tmpl) {
      const updated: Record<string, string> = {};
      tmpl.defaultFields.forEach(f => {
        updated[f.key] = f.defaultValue(clearance);
      });
      setFieldValues(updated);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveForm = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/security-clearances/${clearance.id}/issue-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: currentTemplate.type,
          title: currentTemplate.title,
          serialNumber,
          officerName,
          formData: fieldValues,
          notes: additionalNotes
        })
      });

      if (res.ok) {
        onFormSaved();
        setShowPrintPreview(true);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الاستمارة');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="p-4 md:p-5 bg-slate-900 text-white flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Stamp size={22} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black flex items-center gap-2">
                منظومة إصدار وتعبئة النماذج والاستمارات الرسمية
              </h2>
              <p className="text-xs text-slate-400">
                المعاملة: <span className="font-mono text-indigo-300 font-bold">{clearance.transactionNumber}</span> • صاحب الطلب: {clearance.applicantName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showPrintPreview && (
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-xs"
              >
                <Printer size={15} />
                طباعة الاستمارة
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Template Selector Ribbon */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-print text-xs">
          <span className="font-bold text-slate-700 whitespace-nowrap ml-2">اختر نموذج الاستمارة:</span>
          {OFFICIAL_TEMPLATES.map(t => (
            <button
              key={t.type}
              onClick={() => handleTemplateChange(t.type)}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedTemplateType === t.type
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FileText size={14} />
              {t.title}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* Printable Official Document Sheet */}
          <div className="bg-white p-6 md:p-8 rounded-xl border-2 border-slate-300 shadow-sm print:border-0 print:shadow-none print:p-0 font-serif" id="official-form-printable">
            
            {/* Government Official Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6 text-center">
              <div className="w-1/3 text-right text-xs font-bold space-y-1 text-slate-800">
                <p>الجمهورية اليمنية</p>
                <p>وزارة الداخلية</p>
                <p>قطاع الأمن والاستخبارات</p>
                <p>فرع استخبارات مصلحة الهجرة والجوازات</p>
              </div>

              <div className="w-1/3 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center font-bold text-xs p-1 text-center bg-slate-50">
                  شعار الجمهورية
                </div>
                <span className="text-[10px] text-slate-500 mt-1 font-mono">{serialNumber}</span>
              </div>

              <div className="w-1/3 text-left text-xs font-bold space-y-1 text-slate-800 font-mono">
                <p>الرقم: {clearance.transactionNumber}</p>
                <p>التاريخ: {new Date().toISOString().split('T')[0]}</p>
                <p>المرفقات: مستوفاة</p>
                <p className="text-indigo-800 font-sans">{currentTemplate.category}</p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-4">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 underline underline-offset-8 decoration-2 decoration-indigo-800">
                {currentTemplate.title}
              </h1>
              <p className="text-xs text-slate-600 mt-2 font-sans">{currentTemplate.description}</p>
            </div>

            {/* Legal Preamble */}
            <div className="my-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
              <p className="font-semibold">{currentTemplate.legalPreamble}</p>
            </div>

            {/* Auto-filled Form Fields (The user can edit missing parts right here!) */}
            <div className="my-6 space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 text-sm">بيانات الشخص والطلب المسترجعة آلياً:</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  تم ملء الحقول تلقائياً، قم بتعديل أو استكمال الناقص فقط
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTemplate.defaultFields.map(f => (
                  <div key={f.key} className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      {f.label}:
                    </label>
                    <input
                      type="text"
                      value={fieldValues[f.key] || ''}
                      onChange={(e) => handleFieldChange(f.key, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={f.placeholder || `أدخل ${f.label}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pledge Clause */}
            <div className="my-6 p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs text-indigo-950 font-sans leading-relaxed">
              <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-indigo-700" />
                صيغة الإقرار والتعهد الرسمي:
              </h4>
              <p>{currentTemplate.pledgeClause}</p>
            </div>

            {/* Signatures & Seal Area */}
            <div className="mt-8 pt-6 border-t-2 border-slate-300 grid grid-cols-3 gap-4 text-center font-sans text-xs">
              <div>
                <span className="font-bold block text-slate-800 mb-8">توقيع وبصمة صاحب الشأن / المقر</span>
                <div className="w-24 h-14 border border-dashed border-slate-400 mx-auto rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                  بصمة الإبهام
                </div>
                <span className="font-semibold text-slate-700 block mt-2">{clearance.applicantName}</span>
              </div>

              <div>
                <span className="font-bold block text-slate-800 mb-8">الضابط المحقق / المختص</span>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full text-center px-2 py-1 border-b border-slate-300 bg-transparent text-xs font-bold no-print"
                />
                <span className="font-bold text-slate-900 block mt-2 print:block">{officerName}</span>
                <span className="text-[10px] text-slate-500 block mt-1">التوقيع: .....................</span>
              </div>

              <div>
                <span className="font-bold block text-slate-800 mb-8">اعتماد فرع الاستخبارات والختم</span>
                <div className="w-20 h-20 border-2 border-indigo-900 rounded-full mx-auto flex items-center justify-center text-[10px] text-indigo-900 font-bold p-1">
                  ختم الاستخبارات
                </div>
                <span className="text-[10px] text-slate-500 block mt-2">يعتمد بموجبه رسمياً</span>
              </div>
            </div>

          </div>

          {/* Additional Notes Before Saving */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl no-print space-y-2">
            <label className="block text-xs font-bold text-slate-700">ملاحظات توثيقية إضافية للأرشفة:</label>
            <input
              type="text"
              placeholder="مثال: تم التأكد من هويته الأصلية وتسليمه الأصل وحفظ نسخة بالأرشيف..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              الرقم التسلسلي للاستمارة: <span className="font-mono font-bold text-slate-800">{serialNumber}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveForm}
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? 'جارٍ الحفظ...' : 'حفظ الاستمارة في ملف الشخص واعتمادها'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
