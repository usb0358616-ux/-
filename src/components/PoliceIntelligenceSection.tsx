import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  Printer, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  UserCheck, 
  Calendar, 
  Building2, 
  Fingerprint, 
  ArrowRightLeft, 
  Sparkles,
  RefreshCw,
  Send,
  Eye
} from 'lucide-react';
import type { PoliceIntelligenceRequest, User } from '../types';

interface PoliceIntelligenceSectionProps {
  requests: PoliceIntelligenceRequest[];
  user: User | null;
  onRefresh: () => void;
  onGenerateReply?: (req: PoliceIntelligenceRequest) => void;
}

export default function PoliceIntelligenceSection({
  requests,
  user,
  onRefresh,
  onGenerateReply
}: PoliceIntelligenceSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<PoliceIntelligenceRequest | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [actionResult, setActionResult] = useState<'سليم / لا مانع أمني' | 'مطلوب إجراء / تعميم حظر' | 'مرفوض ومحال للتحقيق'>('سليم / لا مانع أمني');

  // Form State for new Request
  const [newFormData, setNewFormData] = useState({
    entryNumber: '1917/ق/2026',
    investigationNumber: '1191/ت/2026',
    requestingEntity: 'الإدارة العامة للشؤون العربية والأجنبية',
    requestType: 'فحص أمني ومطابقة' as const,
    subjectName: '',
    passportOrIdNumber: '',
    nationality: 'يمني',
    slaDays: 3,
    receivedDate: new Date().toISOString().split('T')[0],
    hijriDate: '1448/3/5 هـ',
    notes: ''
  });

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.investigationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.passportOrIdNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestingEntity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.requestType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getDaysRemainingInfo = (dueDateStr: string, status: string) => {
    if (status === 'تم الرد والإنجاز') {
      return { text: 'منجزة في الموعد ✓', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', isOverdue: false };
    }
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `متأخرة بـ ${Math.abs(diffDays)} يوم (تجاوزت مهلة الـ 3 أيام)`, color: 'text-rose-700 bg-rose-50 border-rose-200 font-black', isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'تستحق اليوم (مهلة نهائية)', color: 'text-amber-800 bg-amber-100 border-amber-300 font-bold', isOverdue: false };
    } else {
      return { text: `متبقي ${diffDays} يوم من مهلة الـ 3 أيام`, color: 'text-indigo-700 bg-indigo-50 border-indigo-200', isOverdue: false };
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormData.subjectName) return;

    try {
      const res = await fetch('/api/police-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFormData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewFormData({
          entryNumber: `${Math.floor(1900 + Math.random() * 100)}/ق/2026`,
          investigationNumber: `${Math.floor(1100 + Math.random() * 100)}/ت/2026`,
          requestingEntity: 'الإدارة العامة للشؤون العربية والأجنبية',
          requestType: 'فحص أمني ومطابقة',
          subjectName: '',
          passportOrIdNumber: '',
          nationality: 'يمني',
          slaDays: 3,
          receivedDate: new Date().toISOString().split('T')[0],
          hijriDate: '1448/3/5 هـ',
          notes: ''
        });
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to create intelligence request', err);
    }
  };

  const handleSaveDecision = async () => {
    if (!selectedRequest) return;
    try {
      const res = await fetch(`/api/police-intelligence/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'تم الرد والإنجاز',
          result: actionResult,
          findingsAndEvidence: actionNotes,
          responseDate: new Date().toISOString().split('T')[0],
          investigatorOfficer: user?.name || 'العقيد / نشوان الصليحي'
        })
      });
      if (res.ok) {
        setShowActionModal(false);
        setSelectedRequest(null);
        setActionNotes('');
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to update intelligence decision', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute left-6 -top-10 opacity-10 pointer-events-none">
          <ShieldAlert size={280} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black rounded-full">
                وزارة الداخلية • قطاع الأمن والاستخبارات
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black rounded-full">
                فرع استخبارات الشرطة بمصلحة الجوازات
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              فرع استخبارات الشرطة — إدارة التحري والرقابة الأمنية
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              الكيان السيادي المعني بطلبات الفحص الأمني، التحري والمتابعة الاستخباراتية، إصدار أوامر التوقيف والضبط، والردود الرسمية خلال مدة الاستجابة المحددة (3 أيام كحد أقصى وفق المحاضر الرسمية).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-900/30 transition flex items-center gap-2"
            >
              <Plus size={16} />
              قيد طلب تحرٍ جديد
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              <Printer size={16} />
              طباعة كشف الاستخبارات
            </button>
          </div>
        </div>

        {/* Reference Numbers Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">رقم القيد المستندي الرسمي</span>
            <span className="text-xl font-black font-mono text-white mt-1 block">1917 / المرجع</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">رقم التحقيق في المستند</span>
            <span className="text-xl font-black font-mono text-rose-300 mt-1 block">1191</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">التاريخ المعتمد</span>
            <span className="text-xs font-bold font-mono text-amber-300 mt-1 block">1448/3/5 هـ — 18/8/2026م</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">مهلة الرد النظامية (SLA)</span>
            <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">3 أيام فقط</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث برقم القيد (1917)، رقم التحقيق (1191)، الاسم، الجواز..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة الحالات</option>
            <option value="قيد الدراسة">قيد الدراسة والتحري</option>
            <option value="تم الرد والإنجاز">تم الرد والإنجاز</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة أنواع الطلبات</option>
            <option value="فحص أمني ومطابقة">فحص أمني ومطابقة</option>
            <option value="تحرٍ ومتابعة استخباراتية">تحرٍ ومتابعة استخباراتية</option>
            <option value="أمر توقيف وضبط">أمر توقيف وضبط</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
              <tr>
                <th className="py-4 px-4">رقم القيد / المرجع</th>
                <th className="py-4 px-4">رقم التحقيق</th>
                <th className="py-4 px-4">الجهة الطالبة ونوع الطلب</th>
                <th className="py-4 px-4">صاحب المعاملة والجنسية</th>
                <th className="py-4 px-4">تاريخ الورود والهجري</th>
                <th className="py-4 px-4 text-center">مهلة الرد (SLA 3 أيام)</th>
                <th className="py-4 px-4 text-center">النتيجة الاستخباراتية</th>
                <th className="py-4 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const daysInfo = getDaysRemainingInfo(req.dueDate, req.status);
                return (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-4 font-mono font-black text-rose-700 whitespace-nowrap">
                      {req.entryNumber}
                    </td>
                    <td className="py-4 px-4 font-mono font-black text-slate-900 whitespace-nowrap">
                      {req.investigationNumber}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{req.requestType}</div>
                      <span className="text-[11px] text-slate-500">{req.requestingEntity}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{req.subjectName}</div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {req.passportOrIdNumber} • {req.nationality}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{req.receivedDate}</div>
                      <span className="text-[11px] text-amber-700 font-bold block">{req.hijriDate || '1448/3/5 هـ'}</span>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${daysInfo.color}`}>
                        {daysInfo.text}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black border ${
                          req.result === 'سليم / لا مانع أمني'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.result === 'مطلوب إجراء / تعميم حظر'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {req.result}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowActionModal(true);
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition"
                          title="تسجيل النتيجة الأمنية والتحري"
                        >
                          القرار والتحري
                        </button>
                        {onGenerateReply && (
                          <button
                            onClick={() => onGenerateReply(req)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition flex items-center gap-1"
                            title="توليد رد رسمي تلقائي"
                          >
                            <Send size={12} />
                            توليد رد
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-16 p-8">
            <ShieldAlert size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">لا توجد طلبات تحرٍ مسجلة</h3>
            <p className="text-xs text-slate-400 mt-1">يمكنك قيد طلب فحص أمني جديد عبر النموذج أعلاه.</p>
          </div>
        )}
      </div>

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">قيد طلب تحرٍ وفحص أمني لفرع الاستخبارات</h3>
                <p className="text-xs text-slate-400">إدخال رقم القيد 1917 ورقم التحقيق 1191 وتفاصيل المعاملة</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم القيد (في المستند)</label>
                  <input
                    type="text"
                    required
                    value={newFormData.entryNumber}
                    onChange={(e) => setNewFormData({ ...newFormData, entryNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم التحقيق (في المستند)</label>
                  <input
                    type="text"
                    required
                    value={newFormData.investigationNumber}
                    onChange={(e) => setNewFormData({ ...newFormData, investigationNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع الطلب</label>
                  <select
                    value={newFormData.requestType}
                    onChange={(e) => setNewFormData({ ...newFormData, requestType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="فحص أمني ومطابقة">فحص أمني ومطابقة</option>
                    <option value="تحرٍ ومتابعة استخباراتية">تحرٍ ومتابعة استخباراتية</option>
                    <option value="أمر توقيف وضبط">أمر توقيف وضبط</option>
                    <option value="استعلام سوابق وقوائم">استعلام سوابق وقوائم</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الجهة الطالبة</label>
                  <input
                    type="text"
                    required
                    value={newFormData.requestingEntity}
                    onChange={(e) => setNewFormData({ ...newFormData, requestingEntity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">اسم صاحب المعاملة *</label>
                  <input
                    type="text"
                    required
                    placeholder="الاسم الكامل"
                    value={newFormData.subjectName}
                    onChange={(e) => setNewFormData({ ...newFormData, subjectName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الجنسية</label>
                  <input
                    type="text"
                    value={newFormData.nationality}
                    onChange={(e) => setNewFormData({ ...newFormData, nationality: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الجواز أو الهوية</label>
                  <input
                    type="text"
                    placeholder="رقم الوثيقة"
                    value={newFormData.passportOrIdNumber}
                    onChange={(e) => setNewFormData({ ...newFormData, passportOrIdNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التاريخ الهجري (المستندي)</label>
                  <input
                    type="text"
                    value={newFormData.hijriDate}
                    onChange={(e) => setNewFormData({ ...newFormData, hijriDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات ومضمون الإحالة</label>
                <textarea
                  rows={3}
                  placeholder="بيان سبب طلب التحري والفحص..."
                  value={newFormData.notes}
                  onChange={(e) => setNewFormData({ ...newFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-900/20"
                >
                  قيد وإحالة لفرع الاستخبارات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Decision Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">تسجيل نتيجة التحري الاستخباراتي</h3>
                <span className="text-xs text-rose-700 font-mono font-bold">
                  قيد: {selectedRequest.entryNumber} | تحقيق: {selectedRequest.investigationNumber}
                </span>
              </div>
              <button onClick={() => setShowActionModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="font-bold text-slate-900 text-sm mb-1">{selectedRequest.subjectName}</div>
                <div className="text-slate-500 font-mono">{selectedRequest.passportOrIdNumber} • {selectedRequest.nationality}</div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">النتيجة والقرار الأمني *</label>
                <select
                  value={actionResult}
                  onChange={(e) => setActionResult(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="سليم / لا مانع أمني">سليم / لا مانع أمني (موافقة)</option>
                  <option value="مطلوب إجراء / تعميم حظر">مطلوب إجراء / تعميم حظر (إدراج بالقائمة السوداء)</option>
                  <option value="مرفوض ومحال للتحقيق">مرفوض ومحال للتحقيق الجنائي</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">حيثيات القرار ونتائج البحث الجنائي</label>
                <textarea
                  rows={4}
                  required
                  placeholder="تمت المطابقة مع قواعد بيانات المطلوبين والتعاميم وثبت..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveDecision}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-900/20"
                >
                  اعتماد الرد الأمني
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
