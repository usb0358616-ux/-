import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  FileText, 
  X, 
  FileSearch,
  Filter,
  ArrowRight
} from 'lucide-react';
import type { SecurityCheckRecord, User } from '../types';

interface SecurityScreeningProps {
  checks: SecurityCheckRecord[];
  user: User;
  onRefresh: () => void;
}

export default function SecurityScreening({ checks, user, onRefresh }: SecurityScreeningProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [selectedCheck, setSelectedCheck] = useState<SecurityCheckRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    passportNumber: '',
    fullName: '',
    nationality: 'يمني',
    result: 'سليم / خالي من السوابق' as const,
    checkDetails: '',
    officer: user.name,
    sourceFileName: 'فحص مكتبي داخلي',
  });

  const filteredChecks = checks.filter(c => {
    const matchesSearch = 
      c.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.checkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.checkDetails.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResult = 
      resultFilter === 'all' ? true :
      resultFilter === 'safe' ? c.result.includes('سليم') :
      resultFilter === 'action' ? c.result.includes('يحتاج') :
      resultFilter === 'nomatch' ? c.result.includes('غير مطابق') : true;

    return matchesSearch && matchesResult;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/security-checks', {
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
          result: 'سليم / خالي من السوابق',
          checkDetails: '',
          officer: user.name,
          sourceFileName: 'فحص مكتبي داخلي',
        });
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل تسجيل الفحص الأمني');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تسجيل الفحص');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" size={28} />
            الفحص الأمني والمطابقة وقوائم المنع
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            سجل التدقيق الجنائي والأمني للجوازات والمطابقة مع القوائم السوداء والتعاميم مع الاحتفاظ بالأرشيف التاريخي للنتائج
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-900/20 transition transform active:scale-95 self-start md:self-auto"
        >
          <Plus size={18} />
          تسجيل فحص أمني جديد
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">إجمالي عمليات الفحص</span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-2 block">{checks.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">سليم / خالي من السوابق</span>
          <span className="text-2xl font-black font-mono text-emerald-600 mt-2 block">
            {checks.filter(c => c.result.includes('سليم')).length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">يحتاج إجراء / مطلوب أمنياً</span>
          <span className="text-2xl font-black font-mono text-rose-600 mt-2 block">
            {checks.filter(c => c.result.includes('يحتاج')).length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">غير مطابق / تشابه أسماء</span>
          <span className="text-2xl font-black font-mono text-amber-600 mt-2 block">
            {checks.filter(c => c.result.includes('غير')).length}
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="البحث برقم الجواز، الاسم، رقم الفحص، أو تفاصيل الملاحظة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700"
          >
            <option value="all">كافة النتائج</option>
            <option value="safe">سليم / خالي من السوابق فقط</option>
            <option value="action">يحتاج إجراء / مطلوب فقط</option>
            <option value="nomatch">غير مطابق / تشابه أسماء</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold">
                <th className="py-3.5 px-4">رقم الفحص</th>
                <th className="py-3.5 px-4">رقم الجواز</th>
                <th className="py-3.5 px-4">اسم صاحب الجواز</th>
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4">النتيجة الأمنية</th>
                <th className="py-3.5 px-4">تفاصيل النتيجة والمطابقة</th>
                <th className="py-3.5 px-4">الموظف / الضابط</th>
                <th className="py-3.5 px-4 text-center">السجل التاريخي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredChecks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    لا توجد فحوصات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredChecks.map((chk) => (
                  <tr 
                    key={chk.id}
                    onClick={() => setSelectedCheck(chk)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {chk.checkNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-blue-700">
                      {chk.passportNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {chk.fullName || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                      {chk.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        chk.result.includes('سليم') 
                          ? 'bg-emerald-100 text-emerald-800'
                          : chk.result.includes('يحتاج')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {chk.result.includes('سليم') && <CheckCircle2 size={13} />}
                        {chk.result.includes('يحتاج') && <AlertTriangle size={13} />}
                        {chk.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[250px] truncate">
                      {chk.checkDetails}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 font-medium">
                      {chk.officer}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCheck(chk);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto"
                      >
                        <History size={13} />
                        التاريخ ({chk.history?.length || 1})
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Security Check */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={20} />
                تسجيل ومطابقة فحص أمني جديد
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الجواز المراد فحصه <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 0498112"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم صاحب الجواز
                  </label>
                  <input
                    type="text"
                    placeholder="الاسم الثلاثي أو الرباعي"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">نتيجة الفحص والمطابقة</label>
                  <select
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold"
                  >
                    <option value="سليم / خالي من السوابق">سليم / خالي من السوابق</option>
                    <option value="يحتاج إجراء / مطلوب">يحتاج إجراء / مطلوب</option>
                    <option value="غير مطابق">غير مطابق / تشابه أسماء</option>
                    <option value="قيد الفحص">قيد الفحص والمطابقة</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تفاصيل الفحص والمطابقة وقاعدة البيانات المستند إليها
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="اكتب نتيجة التدقيق (مثال: تمت المطابقة مع نظام المطلوبين وثبت عدم وجود أي سوابق...)"
                    value={formData.checkDetails}
                    onChange={(e) => setFormData({ ...formData, checkDetails: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الضابط / الموظف الفاحص</label>
                  <input
                    type="text"
                    value={formData.officer}
                    onChange={(e) => setFormData({ ...formData, officer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مصدر النتيجة / الملف</label>
                  <input
                    type="text"
                    value={formData.sourceFileName}
                    onChange={(e) => setFormData({ ...formData, sourceFileName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
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
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-900/20"
                >
                  اعتماد وحفظ الفحص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: History of Results for this Passport */}
      {selectedCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <History className="text-emerald-400" size={18} />
                  السجل الأمني التاريخي للجواز: <span className="font-mono text-emerald-300">{selectedCheck.passportNumber}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  الاسم: {selectedCheck.fullName || 'غير مدون'} • رقم الفحص: {selectedCheck.checkNumber}
                </p>
              </div>
              <button 
                onClick={() => setSelectedCheck(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">النتيجة المعتمدة الحالية:</span>
                <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                  selectedCheck.result.includes('سليم') ? 'bg-emerald-100 text-emerald-800' :
                  selectedCheck.result.includes('يحتاج') ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {selectedCheck.result}
                </span>
                <p className="mt-2 text-slate-800 text-sm font-medium">{selectedCheck.checkDetails}</p>
              </div>

              <h4 className="text-xs font-bold text-slate-600 uppercase border-b pb-2">
                تاريخ نتائج الفحص والمطابقة السابقة (دون حذف النتائج القديمة):
              </h4>

              <div className="space-y-3">
                {selectedCheck.history && selectedCheck.history.length > 0 ? (
                  selectedCheck.history.map((h, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800">{h.result}</span>
                        <span className="font-mono text-slate-400">{h.date}</span>
                      </div>
                      <p className="text-xs text-slate-600">{h.notes}</p>
                      <div className="text-[11px] text-slate-400 mt-2">الفاحص: {h.officer}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">لا يوجد سجل تاريخي إضافي</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCheck(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
