import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  ArrowRightLeft, 
  Calendar,
  Building2,
  FileCheck2,
  Printer
} from 'lucide-react';
import type { SecurityClearanceRequest, BatchTransferRecord, User, ClearanceDepartment } from '../types';
import PersonDossierModal from './PersonDossierModal';
import FormGeneratorModal from './FormGeneratorModal';
import SmartAIImportModal from './SmartAIImportModal';
import { UserCheck, Stamp, Sparkles } from 'lucide-react';

// القواعد الرسمية المعتمدة في محاضر وزارة الداخلية
export const OFFICIAL_SLA_RULES: Record<ClearanceDepartment, { service: string; days: number; periodLabel: string }[]> = {
  'الإدارة العامة للجنسية': [
    { service: 'زواج اليمني من أجنبية', days: 20, periodLabel: '20 يوم' },
    { service: 'زواج الأجنبي من يمنية', days: 20, periodLabel: '20 يوم' },
    { service: 'طلب اكتساب الجنسية لزوجة اليمني', days: 20, periodLabel: '20 يوم' },
    { service: 'طلب الجنسية اليمنية للأجنبي بقرار جمهوري', days: 30, periodLabel: 'شهر فقط (30 يوماً)' },
    { service: 'طلب اليمني إذن اكتساب جنسية أجنبية', days: 20, periodLabel: '20 يوم' }
  ],
  'الإدارة العامة للشؤون العربية والأجنبية': [
    { service: 'طلب تأشيرة الدخول', days: 7, periodLabel: 'أسبوع (7 أيام)' },
    { service: 'طلب الإقامة لأول مرة', days: 7, periodLabel: 'أسبوع (7 أيام)' },
    { service: 'تجديد طلب الإقامة', days: 3, periodLabel: '3 أيام' },
    { service: 'طلب إذن الدخول لأول مرة', days: 7, periodLabel: 'أسبوع (7 أيام)' },
    { service: 'تجديد طلب إذن الدخول', days: 3, periodLabel: '3 أيام' }
  ],
  'الإدارة العامة لشؤون اللاجئين': [
    { service: 'تسجيل طلب اللجوء', days: 3, periodLabel: '3 أيام' },
    { service: 'تجديد طلب اللجوء', days: 3, periodLabel: '3 أيام' }
  ],
  'الإدارة العامة لوثائق السفر': [
    { service: 'طلب وثائق السفر للإخوة الفلسطينيين', days: 3, periodLabel: '3 أيام' },
    { service: 'تجديد طلب وثائق السفر للفلسطينيين', days: 3, periodLabel: '3 أيام' },
    { service: 'منح جوازات سفر لأبناء اليمنيات', days: 3, periodLabel: '3 أيام' }
  ]
};

interface Props {
  clearances: SecurityClearanceRequest[];
  batchTransfers: BatchTransferRecord[];
  user: User | null;
  onRefresh: () => void;
}

export default function SecurityClearanceSection({
  clearances,
  batchTransfers,
  user,
  onRefresh
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'transfers' | 'regulations'>('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SecurityClearanceRequest | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPersonDossier, setSelectedPersonDossier] = useState<SecurityClearanceRequest | null>(null);
  const [selectedRequestForForm, setSelectedRequestForForm] = useState<SecurityClearanceRequest | null>(null);
  const [showAIImportModal, setShowAIImportModal] = useState(false);

  // New Request Form State
  const [selectedDept, setSelectedDept] = useState<ClearanceDepartment>('الإدارة العامة للشؤون العربية والأجنبية');
  const [selectedService, setSelectedService] = useState('طلب تأشيرة الدخول');
  const [formData, setFormData] = useState({
    transactionNumber: `معاملة-${Math.floor(10000 + Math.random() * 90000)}`,
    applicantName: '',
    passportOrIdNumber: '',
    nationality: 'يمني',
    notes: ''
  });

  // Calculate days remaining or overdue
  const getDaysInfo = (dueDateStr: string, status: string) => {
    if (status === 'تمت الموافقة' || status === 'مرفوض') {
      return { text: 'منجزة', color: 'text-slate-500 bg-slate-100', isOverdue: false };
    }
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `متأخرة بـ ${Math.abs(diffDays)} يوم`, color: 'text-rose-700 bg-rose-50 border border-rose-200', isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'تستحق اليوم!', color: 'text-amber-700 bg-amber-50 border border-amber-200 font-bold', isOverdue: false };
    } else if (diffDays <= 2) {
      return { text: `متبقي ${diffDays} يوم (عاجل)`, color: 'text-amber-800 bg-amber-100', isOverdue: false };
    } else {
      return { text: `متبقي ${diffDays} يوم`, color: 'text-emerald-700 bg-emerald-50', isOverdue: false };
    }
  };

  const handleDeptChange = (dept: ClearanceDepartment) => {
    setSelectedDept(dept);
    const services = OFFICIAL_SLA_RULES[dept];
    if (services && services.length > 0) {
      setSelectedService(services[0].service);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const rule = OFFICIAL_SLA_RULES[selectedDept].find(s => s.service === selectedService);
    const days = rule ? rule.days : 7;
    const now = new Date();
    const dueDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const res = await fetch('/api/security-clearances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionNumber: formData.transactionNumber,
          department: selectedDept,
          serviceType: selectedService,
          applicantName: formData.applicantName,
          passportOrIdNumber: formData.passportOrIdNumber,
          nationality: formData.nationality,
          slaDays: days,
          dueDate: dueDate,
          officerInCharge: user?.name || 'مشرف الاستخبارات',
          securityDecisionNotes: formData.notes
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          transactionNumber: `معاملة-${Math.floor(10000 + Math.random() * 90000)}`,
          applicantName: '',
          passportOrIdNumber: '',
          nationality: 'يمني',
          notes: ''
        });
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (status: 'تمت الموافقة' | 'مرفوض' | 'مطلوب إفادة وإيضاح', notes: string) => {
    if (!selectedRequest) return;
    try {
      const res = await fetch(`/api/security-clearances/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          securityDecisionNotes: notes,
          officerInCharge: user?.name || 'مشرف الاستخبارات'
        })
      });
      if (res.ok) {
        setShowActionModal(false);
        setSelectedRequest(null);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = clearances.filter(req => {
    const matchesSearch = 
      req.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.passportOrIdNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || req.department === deptFilter;
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const pendingCount = clearances.filter(c => c.status === 'قيد الدراسة').length;
  const overdueCount = clearances.filter(c => {
    if (c.status !== 'قيد الدراسة') return false;
    const due = new Date(c.dueDate).getTime();
    return due < Date.now();
  }).length;
  const approvedCount = clearances.filter(c => c.status === 'تمت الموافقة').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                وزارة الداخلية - قطاع الخدمات المدنية والاستخبارات
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                وفق الأمر الإداري المعتمد 1448هـ
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-indigo-400" />
              الموافقات الأمنية وتتبع المدد القانونية (SLA)
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              نظام أتمتة الدورة المستندية بين رئاسة مصلحة الهجرة والجوازات وفرع استخبارات الشرطة، مع التتبع اللحظي لمواقيت الرد والرفع الدوري بالكشوفات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAIImportModal(true)}
              className="bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
              <span>استيراد ذكي للمعاملات (Excel / PDF / صورة)</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              إحالة معاملة جديدة
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 font-medium block">إجمالي المعاملات المحالة</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">{clearances.length}</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="text-xs text-amber-300 font-medium block">قيد الدراسة والتدقيق</span>
            <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">{pendingCount}</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="text-xs text-rose-300 font-medium block">تجاوزت المدة المحددة (متأخرة)</span>
            <span className="text-2xl font-black font-mono text-rose-400 mt-1 block">{overdueCount}</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="text-xs text-emerald-300 font-medium block">تمت الموافقة والإنجاز</span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">{approvedCount}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'requests'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          جدول المعاملات وتتبع المدد ({clearances.length})
        </button>
        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'transfers'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" />
          كشوفات التبادل والتسليم بين المصلحة والفرع ({batchTransfers.length})
        </button>
        <button
          onClick={() => setActiveSubTab('regulations')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'regulations'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          اللائحة المعتمدة للمدد الزمنية (المرجع الرسمي)
        </button>
      </div>

      {/* TAB 1: Requests & SLA */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث برقم المعاملة، اسم صاحب الطلب، أو رقم الوثيقة..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-700"
              >
                <option value="all">كافة الإدارات العامة</option>
                <option value="الإدارة العامة للجنسية">الإدارة العامة للجنسية</option>
                <option value="الإدارة العامة للشؤون العربية والأجنبية">الإدارة العامة للشؤون العربية والأجنبية</option>
                <option value="الإدارة العامة لشؤون اللاجئين">الإدارة العامة لشؤون اللاجئين</option>
                <option value="الإدارة العامة لوثائق السفر">الإدارة العامة لوثائق السفر</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-700"
              >
                <option value="all">كافة الحالات</option>
                <option value="قيد الدراسة">قيد الدراسة والتدقيق</option>
                <option value="تمت الموافقة">تمت الموافقة</option>
                <option value="مرفوض">مرفوض</option>
                <option value="مطلوب إفادة وإيضاح">مطلوب إفادة وإيضاح</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">رقم المعاملة</th>
                    <th className="py-3 px-4 font-bold">الإدارة والخدمة</th>
                    <th className="py-3 px-4 font-bold">صاحب الطلب / الوثيقة</th>
                    <th className="py-3 px-4 font-bold">تاريخ الإحالة</th>
                    <th className="py-3 px-4 font-bold">المدة القانونية</th>
                    <th className="py-3 px-4 font-bold">حالة المدة (SLA)</th>
                    <th className="py-3 px-4 font-bold">حالة القرار</th>
                    <th className="py-3 px-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        لا توجد طلبات موافقة أمنية مطابقة لمعايير البحث
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map(req => {
                      const daysInfo = getDaysInfo(req.dueDate, req.status);
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/75 transition">
                          <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                            {req.transactionNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800 block">{req.serviceType}</span>
                            <span className="text-[10px] text-slate-500">{req.department}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => setSelectedPersonDossier(req)}
                              className="font-bold text-indigo-900 hover:text-indigo-600 hover:underline text-right block"
                            >
                              {req.applicantName}
                            </button>
                            <span className="text-[10px] text-slate-500 font-mono">{req.passportOrIdNumber} ({req.nationality})</span>
                            {req.issuedForms && req.issuedForms.length > 0 && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-sm bg-indigo-50 text-indigo-700 text-[9px] font-bold border border-indigo-200">
                                {req.issuedForms.length} استمارة صادرة
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono">
                            {req.submissionDate}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700 font-mono">
                            {req.slaDays} أيام
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-block ${daysInfo.color}`}>
                              {daysInfo.text}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                              الاستحقاق: {req.dueDate}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'تمت الموافقة' ? 'bg-emerald-100 text-emerald-800' :
                              req.status === 'مرفوض' ? 'bg-rose-100 text-rose-800' :
                              req.status === 'مطلوب إفادة وإيضاح' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedPersonDossier(req)}
                                title="عرض ملف الشخص والتعديل وإرفاق الوثائق"
                                className="px-2 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              >
                                <UserCheck size={14} />
                                الملف
                              </button>
                              <button
                                onClick={() => setSelectedRequestForForm(req)}
                                title="إصدار استمارة تعهد أو موافقة مع تعبئة البيانات تلقائياً"
                                className="px-2 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              >
                                <Stamp size={14} />
                                استمارة
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setShowActionModal(true);
                                }}
                                className="px-2 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition"
                              >
                                قرار
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Batch Transfers between Head Office and Intelligence */}
      {activeSubTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">سجل كشوفات التبادل المعتمدة بموجب البند (ثانياً)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                حصر الكشوفات الصادرة من مكتب رئيس المصلحة إلى فرع الاستخبارات وكشوفات إرجاع الردود الموقعة.
              </p>
            </div>
            <button
              onClick={() => alert('تم توليد كشف تسليم جديد وجاهز للتصدير والتوقيع')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              طباعة كشف تسليم رسمي
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batchTransfers.map(bt => (
              <div key={bt.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-700 font-mono block">{bt.batchNumber}</span>
                    <h4 className="font-black text-slate-900 text-sm mt-0.5">
                      {bt.transferType === 'إحالة_للاستخبارات' ? 'إحالة معاملات للفحص والاطلاع' : 'إرجاع ردود المعاملات المنجزة'}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {bt.receivedStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                  <div>
                    <span className="text-slate-400 block">الجهة المحيلة:</span>
                    <span className="font-bold text-slate-800">{bt.fromEntity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">الجهة المستلمة:</span>
                    <span className="font-bold text-slate-800">{bt.toEntity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">تاريخ التسليم:</span>
                    <span className="font-mono text-slate-700">{bt.transferDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">عدد المعاملات:</span>
                    <span className="font-black text-indigo-600 font-mono">{bt.transactionsCount} معاملة</span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="font-bold text-slate-700 block mb-1">المعاملات المشمولة في هذا الكشف:</span>
                  <ul className="space-y-1 bg-white border border-slate-200 rounded-lg p-2 max-h-28 overflow-y-auto">
                    {bt.itemsList.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="font-mono font-bold text-slate-800">{item.transactionNumber}</span>
                        <span>{item.applicantName}</span>
                        <span className="text-slate-400">{item.serviceType}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>المسؤول المسلّم: {bt.officerSent}</span>
                  {bt.officerReceived && <span>المستلم: {bt.officerReceived}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Official SLA Rules Reference (الوثيقة الرسمية) */}
      {activeSubTab === 'regulations' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-indigo-950 text-xs">
            <h3 className="font-bold text-sm text-indigo-900 mb-1 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              المرجع الإداري والأمني الرسمي المحدد للمدد الزمنية:
            </h3>
            <p className="leading-relaxed">
              مذكرة قطاع الخدمات المدنية بوزارة الداخلية برقم (1917) وتاريخ 1448/3/5هـ والمبنية على إحالة وكيل قطاع الأمن والاستخبارات اللواء / علي حسين الحوثي برقم (1191) وتوجيهات رئيس مصلحة الهجرة والجوازات.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(OFFICIAL_SLA_RULES).map(([dept, services], index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="bg-slate-800 text-white px-4 py-3 font-bold text-xs flex items-center justify-between">
                  <span>{dept}</span>
                  <span className="text-slate-400 text-[10px]">{services.length} خدمات محددة</span>
                </div>
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <th className="py-2 px-3 font-bold w-12 text-center">م</th>
                      <th className="py-2 px-3 font-bold">نوع الخدمة</th>
                      <th className="py-2 px-3 font-bold text-left">المدة الزمنية الملزمة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{s.service}</td>
                        <td className="py-2.5 px-3 text-left">
                          <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                            {s.periodLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Security Clearance Request */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">إحالة معاملة جديدة للموافقة الأمنية</h3>
                <p className="text-xs text-slate-500 mt-0.5">تحديد الخدمة والإدارة واحتساب المدة القانونية آلياً</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم المعاملة</label>
                  <input
                    type="text"
                    required
                    value={formData.transactionNumber}
                    onChange={e => setFormData({ ...formData, transactionNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الإدارة العامة المختصة</label>
                  <select
                    value={selectedDept}
                    onChange={e => handleDeptChange(e.target.value as ClearanceDepartment)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
                  >
                    {Object.keys(OFFICIAL_SLA_RULES).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">نوع الخدمة المحددة باللائحة</label>
                <select
                  value={selectedService}
                  onChange={e => setSelectedService(e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-300 bg-indigo-50/40 rounded-lg font-bold text-indigo-900"
                >
                  {OFFICIAL_SLA_RULES[selectedDept].map(s => (
                    <option key={s.service} value={s.service}>
                      {s.service} - [المدة النظامية: {s.periodLabel}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم صاحب الطلب / المعاملة</label>
                  <input
                    type="text"
                    required
                    placeholder="الاسم الرباعي"
                    value={formData.applicantName}
                    onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الجواز أو البطاقة الوطنية</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: 0588219 أو الرقم الوطني"
                    value={formData.passportOrIdNumber}
                    onChange={e => setFormData({ ...formData, passportOrIdNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الجنسية</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات أولية ومرفقات</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="مرفق صورة الوثيقة، الفيش الجنائي، الاستمارة المعتمدة..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-xs"
                >
                  حفظ وتوليد مهلة الاستحقاق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Take Action on Request */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-black text-slate-900 text-base mb-1">
              اتخاذ القرار الأمني للمعاملة: {selectedRequest.transactionNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              صاحب الطلب: <span className="font-bold text-slate-800">{selectedRequest.applicantName}</span> ({selectedRequest.serviceType})
            </p>

            <div className="space-y-3 mb-6">
              <label className="font-bold text-slate-700 text-xs block">ملاحظات وتسبيب القرار الأمني:</label>
              <textarea
                id="decisionNotes"
                rows={3}
                defaultValue={selectedRequest.securityDecisionNotes || ''}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                placeholder="تطابق البيانات مع قاعدة بيانات المنع، لا توجد قيود أمنية، مبررات القرار..."
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  const notes = (document.getElementById('decisionNotes') as HTMLTextAreaElement)?.value;
                  handleUpdateStatus('تمت الموافقة', notes);
                }}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                موافقة أمنية
              </button>
              <button
                onClick={() => {
                  const notes = (document.getElementById('decisionNotes') as HTMLTextAreaElement)?.value;
                  handleUpdateStatus('مرفوض', notes);
                }}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <XCircle className="h-4 w-4" />
                رفض أمني
              </button>
              <button
                onClick={() => {
                  const notes = (document.getElementById('decisionNotes') as HTMLTextAreaElement)?.value;
                  handleUpdateStatus('مطلوب إفادة وإيضاح', notes);
                }}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                طلب إيضاح
              </button>
            </div>

            <button
              onClick={() => setShowActionModal(false)}
              className="w-full mt-3 py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}

      {/* Person Dossier Modal */}
      {selectedPersonDossier && (
        <PersonDossierModal
          clearance={selectedPersonDossier}
          user={user}
          onClose={() => setSelectedPersonDossier(null)}
          onRefresh={() => {
            onRefresh();
            // Update the locally selected person dossier as well
            const updated = clearances.find(c => c.id === selectedPersonDossier.id);
            if (updated) setSelectedPersonDossier(updated);
          }}
        />
      )}

      {/* Direct Form Generator Modal */}
      {selectedRequestForForm && (
        <FormGeneratorModal
          clearance={selectedRequestForForm}
          user={user}
          onClose={() => setSelectedRequestForForm(null)}
          onFormSaved={() => {
            setSelectedRequestForForm(null);
            onRefresh();
          }}
        />
      )}

      {/* نافذة استيراد المعاملات بالذكاء الاصطناعي */}
      <SmartAIImportModal
        isOpen={showAIImportModal}
        onClose={() => setShowAIImportModal(false)}
        targetType="clearances"
        onSuccess={() => {
          onRefresh();
        }}
        userOfficerName={user?.name}
      />
    </div>
  );
}
