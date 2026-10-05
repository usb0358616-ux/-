import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  Printer, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  X, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Sparkles,
  RefreshCw,
  Copy,
  Edit3
} from 'lucide-react';
import type { OfficialCorrespondence, OfficialCorrespondenceTemplateType, User } from '../types';

interface OfficialCorrespondenceSectionProps {
  correspondences: OfficialCorrespondence[];
  user: User | null;
  onRefresh: () => void;
}

export default function OfficialCorrespondenceSection({
  correspondences,
  user,
  onRefresh
}: OfficialCorrespondenceSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<OfficialCorrespondence | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);

  // Form State for creating/editing official letter
  const [formData, setFormData] = useState<Partial<OfficialCorrespondence>>({
    templateType: 'official_memo',
    incomingOrOutgoingNumber: `ص-${Math.floor(1000 + Math.random() * 9000)}/2026`,
    gregorianDate: '2026-08-18',
    hijriDate: '1448/3/5 هـ',
    fromEntity: 'مصلحة الهجرة والجوازات والجنسية',
    toEntity: 'الأخ / مدير فرع استخبارات الشرطة بمصلحة الجوازات المحترم',
    referenceNumber: 'مذكرة رقم 1191 بتاريخ 1448/3/5 هـ',
    investigationNumber: '1191',
    entryNumber: '1917',
    subject: 'طلب تحرٍ وفحص أمني لعدد من المعاملات الوافدة',
    openingGreeting: 'بعد التحية والتقدير،،،',
    bodyContent: 'عطفاً على التوجيهات الوزارية المنظمة لإجراءات الفحص والتحري الأمني المسبق، والمتضمن إحالة أوليات المعاملات المرفقة الخاصة بطلب منح تأشيرات وإقامات عمل كوادر البعثات والمنظمات الدولية.',
    closingDirective: 'وعليه: نرجو التكرم بالاطلاع وإجراء التحري الأمني والمطابقة مع القوائم السوداء وقواعد بيانات المطلوبين، وموافاتنا بالنتيجة خلال المدة المحددة نظاماً (3 أيام).',
    closingGreeting: 'وتقبلوا خالص التحية والتقدير،،،',
    signatoryName: 'العميد / مدير عام المنافذ والشؤون الأجنبية',
    signatoryRank: 'عميد',
    officialStamp: 'خاتم مصلحة الهجرة والجوازات - قطاع الأمن والاستخبارات'
  });

  const filteredLetters = correspondences.filter(c => {
    const matchesSearch = 
      c.incomingOrOutgoingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.toEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fromEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.referenceNumber && c.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTemplate = templateFilter === 'all' || c.templateType === templateFilter;

    return matchesSearch && matchesTemplate;
  });

  const getTemplateTitle = (type: OfficialCorrespondenceTemplateType) => {
    switch (type) {
      case 'internal_telegram':
        return 'برقية داخلية عاجلة';
      case 'official_memo':
        return 'مذكرة رسمية سيادية';
      case 'security_investigation_request':
        return 'طلب تحرٍ وفحص أمني';
      case 'auto_reply':
        return 'إفادة ورد رسمي معتمد';
      default:
        return 'مكاتبة رسمية';
    }
  };

  const handleTemplateChange = (type: OfficialCorrespondenceTemplateType) => {
    if (type === 'internal_telegram') {
      setFormData(prev => ({
        ...prev,
        templateType: type,
        fromEntity: 'غرفة العمليات المركزية والسيطرة - مصلحة الجوازات',
        toEntity: 'كافة إدارات جوازات المنافذ البرية والبحرية والجوية (الـ 13 منفذاً)',
        openingGreeting: 'برقية فورية / برسم التنفيذ المشدد،،،',
        subject: 'تعميم فوري بضبط وتوقيف مسافر مطلوب لنيابة الأموال العامة',
        bodyContent: 'عطفاً على أمر الضبط والإحضار الصادر من نيابة الأموال العامة، والمتضمن إدراج الاسم في قائمة الممنوعين من السفر وترقب الوصول.',
        closingDirective: 'وعليه: يُلزم ضباط الورديات وكبائن التدقيق في كافة المنافذ بتوقيفه فور محاولته المغادرة أو الدخول وإشعار العمليات فوراً.',
        closingGreeting: 'للعمل بموجبه وتحمل المسؤولية الانضباطية،،،',
        signatoryName: 'العميد / مدير عام العمليات والمنافذ'
      }));
    } else if (type === 'security_investigation_request') {
      setFormData(prev => ({
        ...prev,
        templateType: type,
        fromEntity: 'مكتب رئيس مصلحة الهجرة والجوازات والجنسية',
        toEntity: 'الأخ / مدير فرع استخبارات الشرطة بمصلحة الجوازات المحترم',
        referenceNumber: 'مذكرة وزارية رقم 1191 بتاريخ 1448/3/5 هـ',
        subject: 'طلب تحرٍ وفحص أمني لعدد من المعاملات الوافدة',
        openingGreeting: 'بعد التحية والتقدير،،،',
        bodyContent: 'عطفاً على التوجيهات الوزارية المنظمة لإجراءات الفحص والتحري الأمني المسبق، والمتضمن إحالة أوليات المعاملات المرفقة.',
        closingDirective: 'وعليه: نرجو التكرم بالاطلاع وإجراء التحري الأمني وموافاتنا بالنتيجة خلال 3 أيام.',
        closingGreeting: 'وتقبلوا خالص التحية والتقدير،،،',
        signatoryName: 'العميد / مدير عام المنافذ والشؤون الأجنبية'
      }));
    } else if (type === 'auto_reply') {
      setFormData(prev => ({
        ...prev,
        templateType: type,
        fromEntity: 'فرع استخبارات الشرطة بمصلحة الهجرة والجوازات',
        toEntity: 'الأخ / رئيس مصلحة الهجرة والجوازات والجنسية المحترم',
        referenceNumber: 'إشارة إلى مذكرتكم رقم 1917 المقيدة برقم 1191',
        subject: 'رد على طلب تحرٍ وفحص أمني لطلبات التأشيرة',
        openingGreeting: 'تحية طيبة وبعد،،،',
        bodyContent: 'إشارة إلى مذكرتكم المشار إليها بعاليه، نفيدكم بأنه تم إجراء البحث الجنائي والاستخباراتي والتدقيق الآلي مع سجلات المطلوبين وقوائم المنع من السفر.',
        closingDirective: 'وعليه: نفيدكم بأنه (لا مانع أمنياً) من منح الموافقة والتأشيرة للشخص المذكور لسلامة موقفه الأمني التام.',
        closingGreeting: 'شاكرين تعاونكم المستمر في الحفاظ على الأمن والسيادة الوطنية،،،',
        signatoryName: 'العقيد / نشوان الصليحي - مدير فرع استخبارات الشرطة'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        templateType: 'official_memo',
        fromEntity: 'مصلحة الهجرة والجوازات والجنسية',
        toEntity: 'الأخ / معالي وزير الداخلية المحترم',
        openingGreeting: 'معالي الأخ الوزير / حياكم الله،،،',
        subject: 'مذكرة رفع بنتائج دراسة طلبات اكتساب الجنسية والزواج',
        bodyContent: 'نرفع لمعاليكم ملفات طالبي الزواج واكتساب الجنسية والمتضمن استيفاء التقارير الطبية والتحريات الأمنية.',
        closingDirective: 'وعليه: نرفع لمعاليكم للتكرم بالاطلاع والتوجيه بما ترونه مناسباً.',
        closingGreeting: 'ودمتم ذخراً للوطن،،،',
        signatoryName: 'اللواء / رئيس مصلحة الهجرة والجوازات والجنسية'
      }));
    }
  };

  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/official-correspondence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowEditorModal(false);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to save official correspondence', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sovereign Header Banner */}
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute left-6 -top-10 opacity-10 pointer-events-none">
          <FileText size={280} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black rounded-full">
                الجمهورية اليمنية • وزارة الداخلية
              </span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black rounded-full">
                نظام المكاتبات والمراسلات السيادية الرسمية
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              المكاتبات الرسمية والقوالب السيادية المعتمدة
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              تحرير وتوليد المكاتبات الإلزامية بالقوالب الأربعة (برقية داخلية، مذكرة رسمية، طلب تحرٍ أمني، رد تلقائي) متضمنة الأركان الإلزامية: رقم الوارد/الصادر التلقائي، التاريخين الهجري والميلادي، الإشارة، الموضوع، العطف، المتضمن، وعليه، والختم والتوقيع الرسمي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => {
                handleTemplateChange('security_investigation_request');
                setShowEditorModal(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-900/30 transition flex items-center gap-2"
            >
              <Plus size={16} />
              تحرير مكاتبة جديدة
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              <Printer size={16} />
              طباعة السجل
            </button>
          </div>
        </div>

        {/* Templates Quick Launch Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => {
              handleTemplateChange('internal_telegram');
              setShowEditorModal(true);
            }}
            className="bg-slate-900/60 hover:bg-slate-800 p-3 rounded-2xl border border-slate-800 text-right transition"
          >
            <span className="text-[11px] font-bold text-amber-400 block">قالب 1</span>
            <span className="text-sm font-black text-white mt-0.5 block">برقية داخلية للمنافذ</span>
          </button>
          <button
            onClick={() => {
              handleTemplateChange('official_memo');
              setShowEditorModal(true);
            }}
            className="bg-slate-900/60 hover:bg-slate-800 p-3 rounded-2xl border border-slate-800 text-right transition"
          >
            <span className="text-[11px] font-bold text-blue-400 block">قالب 2</span>
            <span className="text-sm font-black text-white mt-0.5 block">مذكرة رسمية للوزارات</span>
          </button>
          <button
            onClick={() => {
              handleTemplateChange('security_investigation_request');
              setShowEditorModal(true);
            }}
            className="bg-slate-900/60 hover:bg-slate-800 p-3 rounded-2xl border border-slate-800 text-right transition"
          >
            <span className="text-[11px] font-bold text-rose-400 block">قالب 3</span>
            <span className="text-sm font-black text-white mt-0.5 block">طلب تحرٍ أمني (1917)</span>
          </button>
          <button
            onClick={() => {
              handleTemplateChange('auto_reply');
              setShowEditorModal(true);
            }}
            className="bg-slate-900/60 hover:bg-slate-800 p-3 rounded-2xl border border-slate-800 text-right transition"
          >
            <span className="text-[11px] font-bold text-emerald-400 block">قالب 4</span>
            <span className="text-sm font-black text-white mt-0.5 block">رد تلقائي على طلب (1191)</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث برقم الصادر، الموضوع، الجهة، الإشارة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={templateFilter}
            onChange={(e) => setTemplateFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة القوالب الرسمية</option>
            <option value="internal_telegram">برقية داخلية</option>
            <option value="official_memo">مذكرة رسمية</option>
            <option value="security_investigation_request">طلب تحرٍ أمني</option>
            <option value="auto_reply">رد على طلب</option>
          </select>
        </div>
      </div>

      {/* Letters List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLetters.map((letter) => (
          <div
            key={letter.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                    {getTemplateTitle(letter.templateType)}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 mt-1.5">{letter.subject}</h3>
                </div>
                <div className="text-left font-mono">
                  <div className="font-black text-blue-700 text-xs">{letter.incomingOrOutgoingNumber}</div>
                  <div className="text-[10px] text-amber-700 font-bold">{letter.hijriDate}</div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">من:</span>
                  <span className="font-bold text-slate-800">{letter.fromEntity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">إلى:</span>
                  <span className="font-bold text-slate-800">{letter.toEntity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">الإشارة / المرجع:</span>
                  <span className="font-mono text-slate-700 text-[11px]">{letter.referenceNumber}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/70 italic line-clamp-3 leading-relaxed">
                "{letter.bodyContent}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
              <span className="text-[11px] text-slate-400">
                الموقع: {letter.signatoryName}
              </span>
              <button
                onClick={() => {
                  setSelectedLetter(letter);
                  setShowPrintModal(true);
                }}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-lg transition flex items-center gap-1.5"
              >
                <Printer size={14} />
                معاينة وطباعة الوثيقة
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredLetters.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <FileText size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">لا توجد مكاتبات مطابقة للبحث</h3>
          <p className="text-xs text-slate-400 mt-1">اضغط على زر (تحرير مكاتبة جديدة) للبدء في صياغة وثيقة رسمية.</p>
        </div>
      )}

      {/* Editor Modal */}
      {showEditorModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">محرر المكاتبات والمراسلات السيادية الرسمية</h3>
                <p className="text-xs text-slate-400">تطبيق الأركان الرسمية الإلزامية المعتمدة بوزارة الداخلية</p>
              </div>
              <button onClick={() => setShowEditorModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveLetter} className="space-y-4 text-xs">
              {/* Template Selector Buttons */}
              <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                {(['internal_telegram', 'official_memo', 'security_investigation_request', 'auto_reply'] as OfficialCorrespondenceTemplateType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTemplateChange(t)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                      formData.templateType === t
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {getTemplateTitle(t)}
                  </button>
                ))}
              </div>

              {/* Number and Dates Header */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الوارد / الصادر التلقائي *</label>
                  <input
                    type="text"
                    required
                    value={formData.incomingOrOutgoingNumber || ''}
                    onChange={(e) => setFormData({ ...formData, incomingOrOutgoingNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التاريخ الميلادي *</label>
                  <input
                    type="date"
                    required
                    value={formData.gregorianDate || ''}
                    onChange={(e) => setFormData({ ...formData, gregorianDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التاريخ الهجري المعتمد *</label>
                  <input
                    type="text"
                    required
                    value={formData.hijriDate || '1448/3/5 هـ'}
                    onChange={(e) => setFormData({ ...formData, hijriDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-amber-800"
                  />
                </div>
              </div>

              {/* From / To */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">من (الجهة الصادرة) *</label>
                  <input
                    type="text"
                    required
                    value={formData.fromEntity || ''}
                    onChange={(e) => setFormData({ ...formData, fromEntity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">إلى (الجهة المرسل إليها) *</label>
                  <input
                    type="text"
                    required
                    value={formData.toEntity || ''}
                    onChange={(e) => setFormData({ ...formData, toEntity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Reference & Subject */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">الموضوع *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الإشارة (رقم المرجع السابق) *</label>
                  <input
                    type="text"
                    required
                    value={formData.referenceNumber || ''}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Mandatory Structural Clauses */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">التحية الافتتاحية (العطف)</label>
                <input
                  type="text"
                  value={formData.openingGreeting || 'بعد التحية والتقدير،،،'}
                  onChange={(e) => setFormData({ ...formData, openingGreeting: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">المتضمن (نص المذكرة / الحيثيات) *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.bodyContent || ''}
                  onChange={(e) => setFormData({ ...formData, bodyContent: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">وعليه (القرار / التوجيه الإلزامي) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.closingDirective || ''}
                  onChange={(e) => setFormData({ ...formData, closingDirective: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              {/* Signatory */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التوقيع والاسم والصفة *</label>
                  <input
                    type="text"
                    required
                    value={formData.signatoryName || ''}
                    onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الختم المعتمد</label>
                  <input
                    type="text"
                    value={formData.officialStamp || ''}
                    onChange={(e) => setFormData({ ...formData, officialStamp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditorModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-900/20"
                >
                  حفظ وتوليد المكاتبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Sovereign Letter Sheet */}
      {showPrintModal && selectedLetter && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 no-print">
              <span className="font-bold text-slate-500 text-xs">معاينة واستخراج المكاتبة السيادية الرسمية</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/20"
                >
                  <Printer size={16} />
                  طباعة الوثيقة
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* Official Sovereign Document Layout */}
            <div className="p-8 border-2 border-slate-900 rounded-2xl bg-white text-slate-950 space-y-6 print:border-none print:p-0">
              {/* Republic Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 text-center">
                <div className="text-right text-xs space-y-1">
                  <div className="font-black text-sm">الجمهورية اليمنية</div>
                  <div className="font-bold">وزارة الداخلية</div>
                  <div className="font-bold">قطاع الأمن والاستخبارات</div>
                  <div className="font-bold text-blue-950">{selectedLetter.fromEntity}</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-1 p-2">
                    <ShieldCheck size={36} className="text-slate-900" />
                  </div>
                  <h2 className="text-base font-black tracking-tight">{getTemplateTitle(selectedLetter.templateType)}</h2>
                  <span className="text-[10px] font-mono font-bold text-slate-600">OFFICIAL CORRESPONDENCE</span>
                </div>

                <div className="text-left text-xs font-mono space-y-1">
                  <div>رقم الصادر: <span className="font-black text-blue-900">{selectedLetter.incomingOrOutgoingNumber}</span></div>
                  <div>التاريخ الهجري: <span className="font-bold text-amber-900">{selectedLetter.hijriDate}</span></div>
                  <div>التاريخ الميلادي: {selectedLetter.gregorianDate}</div>
                </div>
              </div>

              {/* To and Reference */}
              <div className="space-y-2 text-xs">
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-sm text-slate-900">{selectedLetter.toEntity}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] flex justify-between">
                  <span>الإشارة: {selectedLetter.referenceNumber}</span>
                  {selectedLetter.investigationNumber && (
                    <span>رقم التحقيق: {selectedLetter.investigationNumber} | رقم القيد: {selectedLetter.entryNumber}</span>
                  )}
                </div>
                <div className="font-black text-sm text-slate-900 pt-1">
                  الموضوع: {selectedLetter.subject}
                </div>
              </div>

              {/* Body Content with Mandatory Clauses */}
              <div className="space-y-4 text-xs leading-relaxed text-slate-900 pt-2 border-t border-slate-200">
                <div className="font-bold">{selectedLetter.openingGreeting}</div>
                <div className="text-justify font-medium">{selectedLetter.bodyContent}</div>
                <div className="p-3 bg-slate-50 rounded-xl border-r-4 border-blue-900 font-bold leading-relaxed">
                  {selectedLetter.closingDirective}
                </div>
                <div className="font-bold pt-2">{selectedLetter.closingGreeting}</div>
              </div>

              {/* Signatures & Official Stamp */}
              <div className="pt-8 border-t-2 border-slate-900 flex items-end justify-between text-xs">
                <div className="space-y-1 text-right">
                  <div className="text-[10px] text-slate-500 font-mono">
                    الرقم المرجعي الموثق: {selectedLetter.investigationNumber || '1191'} / {selectedLetter.entryNumber || '1917'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    صدرت بموجب اللائحة الإدارية والسيادية المعتمدة
                  </div>
                </div>

                <div className="text-center p-3 border-2 border-blue-950 rounded-2xl bg-blue-50/20">
                  <div className="text-[11px] font-bold text-slate-600 mb-1">الختم والاعتماد الرسمي</div>
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-900 mx-auto flex flex-col items-center justify-center p-1 text-[9px] font-black text-blue-950">
                    <span>مصلحة الهجرة</span>
                    <span>وزارة الداخلية</span>
                    <span>معتمد رسمياً</span>
                  </div>
                  <div className="font-black text-slate-900 mt-2 text-xs">{selectedLetter.signatoryName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
