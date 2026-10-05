import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  ShieldCheck, 
  FileText, 
  Printer, 
  X, 
  UserCheck, 
  Building2, 
  Calendar, 
  Tag, 
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { PassportRecord, PassportStatus, User, LabelOverride } from '../types';
import FormGeneratorModal from './FormGeneratorModal';
import SmartAIImportModal from './SmartAIImportModal';
import { Stamp, Sparkles } from 'lucide-react';

interface PassportsHubProps {
  passports: PassportRecord[];
  user: User;
  onRefresh: () => void;
  onSelectPassport?: (p: PassportRecord) => void;
  labelOverrides?: LabelOverride[];
}

export const STATUS_COLORS: Record<PassportStatus, { bg: string; text: string; border: string }> = {
  'جديد': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'مسجل': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'بانتظار الفحص': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'تم إرسال الفحص': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'وردت النتيجة': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'سليم / مخلص': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'يحتاج إجراء': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'محال': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'جاهز للتسليم': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'تم التسليم': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  'محفوظ': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  'ملغى': { bg: 'bg-zinc-100', text: 'text-zinc-500', border: 'border-zinc-300' },
};

export default function PassportsHub({ passports, user, onRefresh, onSelectPassport, labelOverrides }: PassportsHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPassport, setSelectedPassport] = useState<PassportRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<PassportStatus>('مسجل');
  const [statusReason, setStatusReason] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAIImportModal, setShowAIImportModal] = useState(false);

  const getFieldLabel = (fieldKey: string, defaultLabel: string) => {
    if (!labelOverrides) return defaultLabel;
    const match = labelOverrides.find(o => o.entity_type === 'passport' && o.field_key === fieldKey);
    return match ? match.new_label : defaultLabel;
  };

  // Form state
  const [formData, setFormData] = useState({
    passportNumber: '',
    fullName: '',
    nationality: 'يمني',
    birthDate: '',
    issuePlace: '',
    issueDate: '',
    expiryDate: '',
    status: 'مسجل' as PassportStatus,
    officeName: '',
    notes: '',
  });

  const filteredPassports = passports.filter(p => {
    const matchesSearch = 
      p.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.officeName && p.officeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.seizureRecordNumber && p.seizureRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/passports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          passportNumber: '',
          fullName: '',
          nationality: 'يمني',
          birthDate: '',
          issuePlace: '',
          issueDate: '',
          expiryDate: '',
          status: 'مسجل',
          officeName: '',
          notes: '',
        });
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل إضافة الجواز');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إضافة الجواز');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedPassport) return;
    try {
      const res = await fetch(`/api/passports/${selectedPassport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          timelineReason: statusReason || `تعديل الحالة إلى ${newStatus}`,
          user: user.name
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedPassport(updated);
        setShowStatusModal(false);
        setStatusReason('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      alert('فشل تحديث الحالة');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <CreditCard className="text-blue-600" size={28} />
            سجل الجوازات المركزي والخط الزمني
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            إدارة وتتبع حركة الجوازات المضبوطة والمسجلة من لحظة الورود حتى التسليم أو الإحالة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAIImportModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
            <span>استيراد ذكي (Excel / PDF / صورة)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-900/20 transition transform active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            تسجيل جواز جديد
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'إجمالي الجوازات', count: passports.length, color: 'text-slate-800', bg: 'bg-white' },
          { label: 'بانتظار الفحص', count: passports.filter(p => p.status === 'بانتظار الفحص' || p.status === 'تم إرسال الفحص').length, color: 'text-amber-600', bg: 'bg-amber-50/50' },
          { label: 'سليم / جاهز للتسليم', count: passports.filter(p => p.status === 'جاهز للتسليم' || p.status === 'سليم / مخلص').length, color: 'text-teal-600', bg: 'bg-teal-50/50' },
          { label: 'يحتاج إجراء / محال', count: passports.filter(p => p.status === 'يحتاج إجراء' || p.status === 'محال').length, color: 'text-rose-600', bg: 'bg-rose-50/50' },
          { label: 'تم التسليم', count: passports.filter(p => p.status === 'تم التسليم').length, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'مسجلة من محاضر', count: passports.filter(p => p.seizureRecordNumber).length, color: 'text-purple-600', bg: 'bg-purple-50/50' },
        ].map((item, idx) => (
          <div key={idx} className={`${item.bg} p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between`}>
            <span className="text-xs font-semibold text-slate-500">{item.label}</span>
            <span className={`text-2xl font-black font-mono mt-2 ${item.color}`}>{item.count}</span>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="البحث برقم الجواز، اسم صاحب الجواز، المكتب، أو رقم المحضر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كافة الحالات</option>
            <option value="جديد">جديد</option>
            <option value="مسجل">مسجل</option>
            <option value="بانتظار الفحص">بانتظار الفحص</option>
            <option value="تم إرسال الفحص">تم إرسال الفحص</option>
            <option value="وردت النتيجة">وردت النتيجة</option>
            <option value="سليم / مخلص">سليم / مخلص</option>
            <option value="يحتاج إجراء">يحتاج إجراء</option>
            <option value="محال">محال</option>
            <option value="جاهز للتسليم">جاهز للتسليم</option>
            <option value="تم التسليم">تم التسليم</option>
            <option value="محفوظ">محفوظ</option>
          </select>
        </div>
      </div>

      {/* Passports Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">{getFieldLabel('passportNumber', 'رقم الجواز')}</th>
                <th className="py-3.5 px-4">اسم صاحب الجواز</th>
                <th className="py-3.5 px-4">الجنسية</th>
                <th className="py-3.5 px-4">الحالة الحالية</th>
                <th className="py-3.5 px-4">محضر الضبط / المصدر</th>
                <th className="py-3.5 px-4">الفحص الأمني</th>
                <th className="py-3.5 px-4">التسليم</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPassports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    لا توجد جوازات مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredPassports.map((p) => {
                  const statusStyle = STATUS_COLORS[p.status] || STATUS_COLORS['مسجل'];
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedPassport(p)}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-black text-blue-700">
                        {p.passportNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {p.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {p.nationality}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {p.seizureRecordNumber ? (
                          <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            محضر: {p.seizureRecordNumber}
                          </span>
                        ) : p.officeName ? (
                          <span className="text-slate-600 truncate max-w-[150px] inline-block">
                            {p.officeName}
                          </span>
                        ) : (
                          <span className="text-slate-400">قيد مباشر</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {p.securityResult ? (
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            p.securityResult === 'سليم' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : p.securityResult === 'يحتاج إجراء' 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.securityResult}
                          </span>
                        ) : (
                          <span className="text-slate-400">لم يفحص بعد</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {p.isDelivered ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            تم التسليم ({p.deliveredAt})
                          </span>
                        ) : p.status === 'جاهز للتسليم' ? (
                          <span className="text-teal-600 font-bold">جاهز للاستلام</span>
                        ) : (
                          <span className="text-slate-400">في الحفظ</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPassport(p);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 mx-auto"
                        >
                          <Clock size={13} />
                          ملف الجواز والخط الزمني
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Passport */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="text-blue-400" size={20} />
                تسجيل بيانات جواز سفر جديد
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الجواز <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 08765432"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم صاحب الجواز بالكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="الاسم الرباعي واللقب"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الجنسية</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مكان الإصدار</label>
                  <input
                    type="text"
                    placeholder="مثال: عدن، المكلا، تعز..."
                    value={formData.issuePlace}
                    onChange={(e) => setFormData({ ...formData, issuePlace: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الحالة الأولية</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PassportStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold"
                  >
                    <option value="جديد">جديد</option>
                    <option value="مسجل">مسجل</option>
                    <option value="بانتظار الفحص">بانتظار الفحص</option>
                    <option value="سليم / مخلص">سليم / مخلص</option>
                    <option value="جاهز للتسليم">جاهز للتسليم</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">الجهة / الوكالة التابع لها (اختياري)</label>
                  <input
                    type="text"
                    placeholder="اسم وكالة السفر أو الجهة المحيلة"
                    value={formData.officeName}
                    onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات وقيد إداري</label>
                  <textarea
                    rows={2}
                    placeholder="أي إشارات أو تفاصيل إضافية..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-900/20"
                >
                  حفظ وتسجيل الجواز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detailed Passport Dossier & Timeline */}
      {selectedPassport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2">
                    ملف الجواز الشامل: <span className="font-mono text-blue-400">{selectedPassport.passportNumber}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedPassport.fullName} • {selectedPassport.nationality}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition no-print"
                >
                  <Printer size={15} />
                  طباعة ملف الجواز
                </button>
                <button
                  onClick={() => setSelectedPassport(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">الحالة الراهنة</span>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    STATUS_COLORS[selectedPassport.status]?.bg || 'bg-slate-200'
                  } ${STATUS_COLORS[selectedPassport.status]?.text || 'text-slate-800'}`}>
                    {selectedPassport.status}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 font-semibold block">مكان وتاريخ الإصدار</span>
                  <span className="text-sm font-bold text-slate-800 mt-1 block">
                    {selectedPassport.issuePlace || 'غير محدد'} ({selectedPassport.issueDate || '—'})
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 font-semibold block">محضر الضبط</span>
                  <span className="text-sm font-bold text-purple-700 mt-1 block">
                    {selectedPassport.seizureRecordNumber ? `رقم ${selectedPassport.seizureRecordNumber} (${selectedPassport.portName || ''})` : 'لا يوجد محضر ضبط'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 font-semibold block">الفحص والمطابقة</span>
                  <span className={`text-sm font-bold mt-1 block ${
                    selectedPassport.securityResult === 'سليم' ? 'text-emerald-600' : 
                    selectedPassport.securityResult === 'يحتاج إجراء' ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {selectedPassport.securityResult || 'قيد المراجعة'}
                  </span>
                </div>
              </div>

              {/* Action Buttons for quick status progression */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="text-xs font-bold text-blue-900 ml-2">الإجراءات السريعة:</span>
                <button
                  onClick={() => {
                    setNewStatus('بانتظار الفحص');
                    setShowStatusModal(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-800 rounded-lg text-xs font-bold transition shadow-xs"
                >
                  إرسال للفحص الأمني
                </button>
                <button
                  onClick={() => {
                    setNewStatus('جاهز للتسليم');
                    setShowStatusModal(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-teal-200 hover:bg-teal-600 hover:text-white text-teal-800 rounded-lg text-xs font-bold transition shadow-xs"
                >
                  اعتماد كـ (جاهز للتسليم)
                </button>
                <button
                  onClick={() => {
                    setNewStatus('تم التسليم');
                    setShowStatusModal(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-800 hover:text-white text-slate-800 rounded-lg text-xs font-bold transition shadow-xs"
                >
                  تسليم الجواز
                </button>
                <button
                  onClick={() => {
                    setNewStatus('محال');
                    setShowStatusModal(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-600 hover:text-white text-rose-800 rounded-lg text-xs font-bold transition shadow-xs"
                >
                  إحالة قانونية
                </button>
                <button
                  onClick={() => setShowFormModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1"
                >
                  <Stamp size={14} />
                  إصدار استمارة رسمية (تعهد/تسليم/موافقة)
                </button>
              </div>

              {/* TIMELINE SECTION (كما تم تحديده بدقة في المواصفات) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Clock className="text-blue-600" size={18} />
                    الخط الزمني لتنقلات وإجراءات الجواز (Timeline)
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedPassport.timeline?.length || 0} أحداث مسجلة
                  </span>
                </div>

                <div className="relative border-r-2 border-blue-200 mr-4 space-y-6 py-2">
                  {selectedPassport.timeline && selectedPassport.timeline.length > 0 ? (
                    selectedPassport.timeline.map((event, idx) => (
                      <div key={event.id || idx} className="relative pr-6">
                        {/* Dot indicator */}
                        <div className="absolute -right-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-xs"></div>
                        
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {event.type}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              {event.date} {event.time ? `• ${event.time}` : ''}
                            </span>
                          </div>
                          <p className="text-sm text-slate-800 font-medium mt-1">
                            {event.description}
                          </p>
                          {event.user && (
                            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 font-semibold">
                              <span>المسؤول:</span>
                              <span className="text-slate-600">{event.user}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="pr-6 text-sm text-slate-400">لا يوجد خط زمني مسجل لهذا الجواز</div>
                  )}
                </div>
              </div>

              {/* Delivery Receipt preview if delivered */}
              {selectedPassport.isDelivered && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 size={18} />
                    بيانات الاستلام والتسليم النهائي
                  </div>
                  <div className="text-xs grid grid-cols-2 gap-2">
                    <div><strong>تاريخ التسليم:</strong> {selectedPassport.deliveredAt}</div>
                    <div><strong>رقم سند التسليم:</strong> {selectedPassport.deliveryReceiptNumber || '—'}</div>
                    <div className="col-span-2"><strong>المستلم:</strong> {selectedPassport.deliveredTo}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPassport(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Status & Reason */}
      {showStatusModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-3">
              تحديث حالة الجواز وإضافة حدث للخط الزمني
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">الحالة الجديدة</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as PassportStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold"
                >
                  <option value="جديد">جديد</option>
                  <option value="مسجل">مسجل</option>
                  <option value="بانتظار الفحص">بانتظار الفحص</option>
                  <option value="تم إرسال الفحص">تم إرسال الفحص</option>
                  <option value="وردت النتيجة">وردت النتيجة</option>
                  <option value="سليم / مخلص">سليم / مخلص</option>
                  <option value="يحتاج إجراء">يحتاج إجراء</option>
                  <option value="محال">محال</option>
                  <option value="جاهز للتسليم">جاهز للتسليم</option>
                  <option value="تم التسليم">تم التسليم</option>
                  <option value="محفوظ">محفوظ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">سبب أو بيان الإجراء (يظهر في الخط الزمني)</label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="اكتب تفاصيل أو مذكرة الإجراء..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-3 py-1.5 text-slate-600 text-xs font-bold hover:bg-slate-100 rounded-lg"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                تأكيد وتسجيل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Generator for selected passport */}
      {showFormModal && selectedPassport && (
        <FormGeneratorModal
          clearance={{
            id: `passport-form-${selectedPassport.id}`,
            transactionNumber: `جواز-${selectedPassport.passportNumber}`,
            department: 'الإدارة العامة لوثائق السفر',
            serviceType: 'إجراءات تسليم وتعهد جواز سفر',
            applicantName: selectedPassport.fullName,
            passportOrIdNumber: selectedPassport.passportNumber,
            nationality: selectedPassport.nationality,
            birthDate: selectedPassport.birthDate,
            address: selectedPassport.officeName || '',
            submissionDate: selectedPassport.issueDate || new Date().toISOString().split('T')[0],
            slaDays: 3,
            dueDate: new Date().toISOString().split('T')[0],
            status: 'قيد الدراسة',
            officerInCharge: user?.name || 'المختص الأمني'
          }}
          user={user}
          onClose={() => setShowFormModal(false)}
          onFormSaved={() => {
            setShowFormModal(false);
            onRefresh();
          }}
        />
      )}

      {/* نافذة استيراد الجوازات المضبوطة بالذكاء الاصطناعي */}
      <SmartAIImportModal
        isOpen={showAIImportModal}
        onClose={() => setShowAIImportModal(false)}
        targetType="seizures"
        onSuccess={() => {
          onRefresh();
        }}
        userOfficerName={user?.name}
      />
    </div>
  );
}
