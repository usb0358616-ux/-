import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  X 
} from 'lucide-react';
import type { OfficeRecord, User } from '../types';

interface OfficesSectionProps {
  offices: OfficeRecord[];
  user: User;
  onRefresh: () => void;
}

export default function OfficesSection({ offices, user, onRefresh }: OfficesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    ownerName: '',
    phone: '',
    city: 'عدن',
    address: '',
    status: 'نشط' as const,
    notes: ''
  });

  const filteredOffices = offices.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.licenseNumber && o.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (o.ownerName && o.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (o.city && o.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/offices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          licenseNumber: '',
          ownerName: '',
          phone: '',
          city: 'عدن',
          address: '',
          status: 'نشط',
          notes: ''
        });
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل إضافة المكتب');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إضافة المكتب');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Building2 className="text-indigo-600" size={28} />
            دليل المكاتب ووكالات السفر والسياحة
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            سجل توثيق بيانات مكاتب ووكالات السفر، تراخيصها، أرقام التواصل، وحصيلة الجوازات المنسوبة إليها
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-900/20 transition transform active:scale-95 self-start md:self-auto"
        >
          <Plus size={18} />
          تسجيل وكالة / مكتب جديد
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">إجمالي المكاتب والوكالات</span>
          <span className="text-2xl font-black font-mono text-indigo-700 mt-2 block">{offices.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">المكاتب النشطة والمعتمدة</span>
          <span className="text-2xl font-black font-mono text-emerald-600 mt-2 block">
            {offices.filter(o => o.status === 'نشط').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">المكاتب الموقوفة / تحت المراجعة</span>
          <span className="text-2xl font-black font-mono text-rose-600 mt-2 block">
            {offices.filter(o => o.status === 'موقوف' || o.status === 'تحت المراجعة').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">إجمالي الجوازات المنسوبة</span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-2 block">
            {offices.reduce((acc, o) => acc + (o.totalPassports || 0), 0)}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="البحث باسم المكتب، رقم الترخيص، المالك، أو المدينة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
      </div>

      {/* Grid of Offices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOffices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            لا توجد مكاتب مطابقة لبحثك
          </div>
        ) : (
          filteredOffices.map((off) => (
            <div 
              key={off.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">{off.name}</h3>
                  <span className="text-xs font-mono text-slate-500">ترخيص: {off.licenseNumber || '—'}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  off.status === 'نشط' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {off.status}
                </span>
              </div>

              <div className="text-xs space-y-2 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">المالك / المدير:</span>
                  <span className="font-semibold text-slate-800">{off.ownerName || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الهاتف:</span>
                  <span className="font-mono text-slate-800">{off.phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">المدينة والعنوان:</span>
                  <span className="text-slate-800">{off.city} {off.address ? `• ${off.address}` : ''}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                <span className="text-slate-500 flex items-center gap-1">
                  <CreditCard size={14} className="text-indigo-600" />
                  الجوازات المسجلة:
                </span>
                <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {off.totalPassports || 0} جواز
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Office */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Building2 className="text-indigo-400" size={20} />
                تسجيل مكتب أو وكالة سفريات
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المكتب أو الوكالة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: وكالة البراق للسفريات"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الترخيص</label>
                  <input
                    type="text"
                    placeholder="TR-2026-..."
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المالك / المسؤول</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    placeholder="770000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المدينة</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">العنوان التفصيلي</label>
                <input
                  type="text"
                  placeholder="الشارع، الحي، عمارة..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">حالة الاعتماد</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold"
                >
                  <option value="نشط">نشط ومعتمد</option>
                  <option value="موقوف">موقوف مؤقتاً</option>
                  <option value="تحت المراجعة">تحت المراجعة والتدقيق</option>
                </select>
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
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-900/20"
                >
                  حفظ الوكالة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
