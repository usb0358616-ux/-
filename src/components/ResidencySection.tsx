import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  PlaneTakeoff, 
  Globe, 
  X,
  CreditCard
} from 'lucide-react';
import type { ResidencyOrImmigrantRecord, User } from '../types';

interface ResidencySectionProps {
  residencies: ResidencyOrImmigrantRecord[];
  user: User;
  onRefresh: () => void;
}

export default function ResidencySection({ residencies, user, onRefresh }: ResidencySectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'إقامة' | 'تأشيرة' | 'مهاجر / وافد'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    type: 'إقامة' as 'إقامة' | 'تأشيرة' | 'مهاجر / وافد',
    personName: '',
    passportNumber: '',
    nationality: 'أجنبي',
    entryPort: 'مطار عدن الدولي',
    sponsorOrEntity: '',
    expiryDate: '',
    entryDate: new Date().toISOString().split('T')[0],
    status: 'سارية' as 'سارية' | 'منتهية' | 'طلب تجديد' | 'مرحل' | 'قيد المتابعة',
    notes: ''
  });

  const filtered = residencies.filter(r => {
    const matchesSearch = 
      r.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.sponsorOrEntity && r.sponsorOrEntity.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.nationality && r.nationality.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/residencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          type: 'إقامة',
          personName: '',
          passportNumber: '',
          nationality: 'أجنبي',
          entryPort: 'مطار عدن الدولي',
          sponsorOrEntity: '',
          expiryDate: '',
          entryDate: new Date().toISOString().split('T')[0],
          status: 'سارية',
          notes: ''
        });
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل إضافة السجل');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إضافة السجل');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Globe className="text-cyan-600" size={28} />
            شؤون الإقامات والتأشيرات والمهاجرين
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            متابعة إقامات الأجانب، البعثات الأممية والمنظمات، التأشيرات الصادرة، والمهاجرين غير النظاميين
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-cyan-900/20 transition transform active:scale-95 self-start md:self-auto"
        >
          <Plus size={18} />
          تسجيل قيد جديد
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">إجمالي القيود المسجلة</span>
          <span className="text-2xl font-black font-mono text-cyan-700 mt-2 block">{residencies.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">إقامات سارية المفعول</span>
          <span className="text-2xl font-black font-mono text-emerald-600 mt-2 block">
            {residencies.filter(r => r.type === 'إقامة' && r.status === 'سارية').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">إقامات وتأشيرات منتهية</span>
          <span className="text-2xl font-black font-mono text-rose-600 mt-2 block">
            {residencies.filter(r => r.status === 'منتهية').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">مهاجرون غير نظاميين</span>
          <span className="text-2xl font-black font-mono text-amber-600 mt-2 block">
            {residencies.filter(r => r.type === 'مهاجر / وافد').length}
          </span>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="البحث بالاسم، رقم الجواز، الجهة/الكفيل، أو الجنسية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              typeFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setTypeFilter('إقامة')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              typeFilter === 'إقامة' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الإقامات
          </button>
          <button
            onClick={() => setTypeFilter('تأشيرة')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              typeFilter === 'تأشيرة' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            التأشيرات
          </button>
          <button
            onClick={() => setTypeFilter('مهاجر / وافد')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              typeFilter === 'مهاجر / وافد' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            مهاجرون
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold">
                <th className="py-3.5 px-4">التصنيف</th>
                <th className="py-3.5 px-4">الاسم بالكامل</th>
                <th className="py-3.5 px-4">رقم الجواز / الوثيقة</th>
                <th className="py-3.5 px-4">الجنسية</th>
                <th className="py-3.5 px-4">الجهة / الكفيل</th>
                <th className="py-3.5 px-4">منفذ الدخول</th>
                <th className="py-3.5 px-4">تاريخ الانتهاء</th>
                <th className="py-3.5 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    لا توجد سجلات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        r.type === 'إقامة' ? 'bg-cyan-100 text-cyan-800' :
                        r.type === 'تأشيرة' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.personName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{r.passportNumber}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.nationality}</td>
                    <td className="py-3.5 px-4 text-slate-700 text-xs font-semibold">{r.sponsorOrEntity || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{r.entryPort || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{r.expiryDate || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        r.status === 'سارية' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'منتهية' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Record */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Globe className="text-cyan-400" size={20} />
                تسجيل قيد إقامة / تأشيرة / مهاجر
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع القيد</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold"
                  >
                    <option value="إقامة">إقامة نظامية</option>
                    <option value="تأشيرة">تأشيرة دخول / عمل</option>
                    <option value="مهاجر / وافد">مهاجر / وافد غير نظامي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold"
                  >
                    <option value="سارية">سارية المفعول</option>
                    <option value="منتهية">منتهية الصلاحية</option>
                    <option value="طلب تجديد">طلب تجديد</option>
                    <option value="مرحل">مرحل / قيد الإبعاد</option>
                    <option value="قيد المتابعة">قيد المتابعة والتدقيق</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم بالكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="اسم الشخص الأجنبي / المقيم"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الجواز / الوثيقة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">الجهة / الكفيل / المنظمة</label>
                  <input
                    type="text"
                    placeholder="مثال: بعثة الأمم المتحدة، شركة..."
                    value={formData.sponsorOrEntity}
                    onChange={(e) => setFormData({ ...formData, sponsorOrEntity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">منفذ الدخول</label>
                  <input
                    type="text"
                    value={formData.entryPort}
                    onChange={(e) => setFormData({ ...formData, entryPort: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الدخول</label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
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
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-bold shadow-md shadow-cyan-900/20"
                >
                  حفظ القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
