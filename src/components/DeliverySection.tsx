import React, { useState } from 'react';
import { 
  Send, 
  Search, 
  Plus, 
  Printer, 
  CheckCircle2, 
  UserCheck, 
  Building2, 
  FileText, 
  X, 
  Calendar, 
  Clock, 
  Phone,
  FileCheck
} from 'lucide-react';
import type { DeliveryRecord, PassportRecord, User } from '../types';

interface DeliverySectionProps {
  deliveries: DeliveryRecord[];
  passports: PassportRecord[];
  user: User;
  onRefresh: () => void;
}

export default function DeliverySection({ deliveries, passports, user, onRefresh }: DeliverySectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<'all' | 'owner' | 'office'>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [deliveryType, setDeliveryType] = useState<'owner' | 'office'>('owner');
  const [formData, setFormData] = useState({
    // Owner Delivery
    recipientName: '',
    nationalId: '',
    phone: '',
    passportNumber: '',
    // Office Delivery
    officeName: '',
    agentName: '',
    agentNationalId: '',
    agentPhone: '',
    passportsListText: '',
    // Common
    officer: user.name,
    notes: '',
  });

  const readyPassports = passports.filter(p => p.status === 'جاهز للتسليم' || p.status === 'سليم / مخلص');

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = 
      d.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.recipientName && d.recipientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.passportNumber && d.passportNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.officeName && d.officeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.agentName && d.agentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.passportNumbers && d.passportNumbers.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesType = deliveryTypeFilter === 'all' || d.deliveryType === deliveryTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pList = deliveryType === 'office'
        ? formData.passportsListText.split(/[\s,،\n]+/).map(p => p.trim()).filter(Boolean)
        : [formData.passportNumber.trim()];

      if (deliveryType === 'owner' && !formData.passportNumber) {
        alert('يرجى تحديد رقم الجواز المراد تسليمه');
        return;
      }
      if (deliveryType === 'office' && pList.length === 0) {
        alert('يرجى إدخال أرقام الجوازات المسلمة للمكتب');
        return;
      }

      const payload = {
        deliveryType,
        officer: formData.officer || user.name,
        recipientName: formData.recipientName,
        nationalId: formData.nationalId,
        phone: formData.phone,
        passportNumber: formData.passportNumber,
        officeName: formData.officeName,
        agentName: formData.agentName,
        agentNationalId: formData.agentNationalId,
        agentPhone: formData.agentPhone,
        passportNumbers: pList,
        notes: formData.notes
      };

      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          recipientName: '',
          nationalId: '',
          phone: '',
          passportNumber: '',
          officeName: '',
          agentName: '',
          agentNationalId: '',
          agentPhone: '',
          passportsListText: '',
          officer: user.name,
          notes: '',
        });
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل قيد سند التسليم');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إجراء التسليم');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Send className="text-teal-600" size={28} />
            إجراءات وسندات التسليم (لأصحاب الجوازات والمكاتب)
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            إصدار سندات الاستلام والتسليم الرسمية الفردية والجماعية وتوثيق توقيعات المستلمين
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-900/20 transition transform active:scale-95 self-start md:self-auto"
        >
          <Plus size={18} />
          إنشاء سند تسليم جديد
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">إجمالي سندات التسليم</span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-2 block">{deliveries.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">تسليم لأصحاب الجوازات (فردي)</span>
          <span className="text-2xl font-black font-mono text-teal-600 mt-2 block">
            {deliveries.filter(d => d.deliveryType === 'owner').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">تسليم لمكاتب ووكالات (جماعي)</span>
          <span className="text-2xl font-black font-mono text-blue-600 mt-2 block">
            {deliveries.filter(d => d.deliveryType === 'office').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">جوازات جاهزة للتسليم حالياً</span>
          <span className="text-2xl font-black font-mono text-amber-600 mt-2 block">
            {readyPassports.length}
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="البحث برقم السند، اسم المستلم، رقم الهوية، رقم الجواز، أو المكتب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeliveryTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              deliveryTypeFilter === 'all' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setDeliveryTypeFilter('owner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              deliveryTypeFilter === 'owner' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            لأصحاب الجوازات
          </button>
          <button
            onClick={() => setDeliveryTypeFilter('office')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              deliveryTypeFilter === 'office' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            لمكاتب ووكالات
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold">
                <th className="py-3.5 px-4">رقم سند التسليم</th>
                <th className="py-3.5 px-4">النوع</th>
                <th className="py-3.5 px-4">المستلم / الجهة</th>
                <th className="py-3.5 px-4">رقم الهوية والهاتف</th>
                <th className="py-3.5 px-4">عدد الجوازات</th>
                <th className="py-3.5 px-4">تاريخ ووقت التسليم</th>
                <th className="py-3.5 px-4">مسؤول التسليم</th>
                <th className="py-3.5 px-4 text-center">السند</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    لا توجد سندات تسليم مسجلة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((d) => (
                  <tr 
                    key={d.id}
                    onClick={() => setSelectedDelivery(d)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                      {d.deliveryNumber}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold">
                      {d.deliveryType === 'owner' ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <UserCheck size={12} />
                          لصاحب الجواز
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Building2 size={12} />
                          لمكتب / وكالة
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {d.deliveryType === 'owner' ? d.recipientName : `${d.officeName} (${d.agentName})`}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                      {d.deliveryType === 'owner' 
                        ? `${d.nationalId || '—'} / ${d.phone || '—'}`
                        : `${d.agentNationalId || '—'} / ${d.agentPhone || '—'}`}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {d.passportCount || 1} جواز
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                      {d.date} {d.time ? `• ${d.time}` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      {d.officer}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDelivery(d);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto"
                      >
                        <Printer size={13} />
                        عرض السند
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Delivery */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Send className="text-teal-400" size={20} />
                تحرير سند تسليم جوازات رسمي
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Delivery Type selector tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeliveryType('owner')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                    deliveryType === 'owner' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck size={16} />
                  تسليم شخصي لصاحب الجواز
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('office')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                    deliveryType === 'office' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 size={16} />
                  تسليم لمكتب / وكالة سفريات
                </button>
              </div>

              {deliveryType === 'owner' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الجواز المراد تسليمه <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: 0782341"
                      value={formData.passportNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          passportNumber: val,
                          recipientName: prev.recipientName || passports.find(p => p.passportNumber === val.trim())?.fullName || ''
                        }));
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم المستلم بالكامل <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="الاسم الرباعي"
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم البطاقة الشخصية / الهوية <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="الرقم الوطني للهوية"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الهاتف للتواصل <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="770000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم المكتب أو وكالة السفر <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: وكالة الصقر الذهبي"
                      value={formData.officeName}
                      onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم المندوب المفوض <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="اسم مندوب الوكالة"
                      value={formData.agentName}
                      onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رقم بطاقة المندوب</label>
                    <input
                      type="text"
                      placeholder="الرقم الوطني للمندوب"
                      value={formData.agentNationalId}
                      onChange={(e) => setFormData({ ...formData, agentNationalId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">هاتف المندوب</label>
                    <input
                      type="tel"
                      placeholder="770000000"
                      value={formData.agentPhone}
                      onChange={(e) => setFormData({ ...formData, agentPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      أرقام الجوازات المسلمة للوكالة (افصل بينها بفواصل أو أسطر) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="مثال: 0498112, 08765432, 0912456"
                      value={formData.passportsListText}
                      onChange={(e) => setFormData({ ...formData, passportsListText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono"
                    ></textarea>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الموظف القائم بالتسليم</label>
                  <input
                    type="text"
                    value={formData.officer}
                    onChange={(e) => setFormData({ ...formData, officer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات وسند الإخلاء</label>
                  <input
                    type="text"
                    placeholder="تم التسليم بموجب تفويض رسمي..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold shadow-md shadow-teal-900/20"
                >
                  إصدار سند التسليم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Print Delivery Receipt Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 bg-slate-900 text-white no-print">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileCheck className="text-teal-400" size={20} />
                  سند تسليم رسمي: <span className="font-mono text-teal-300">{selectedDelivery.deliveryNumber}</span>
                </h3>
                <p className="text-xs text-slate-400">التاريخ: {selectedDelivery.date}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Printer size={15} />
                  طباعة سند التسليم
                </button>
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Official Receipt Template */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-900">
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h2 className="text-xl font-black">الجمهورية اليمنية</h2>
                <h3 className="text-base font-bold">وزارة الداخلية - مصلحة الهجرة والجوازات والجنسية</h3>
                <h4 className="text-sm font-semibold text-slate-700">مكتب استخبارات الشرطة</h4>
                <div className="mt-3 inline-block px-6 py-1.5 border-2 border-slate-900 font-black text-sm bg-slate-50 rounded">
                  {selectedDelivery.deliveryType === 'owner' 
                    ? `سند استلام وتسليم جواز سفر رسمي رقم (${selectedDelivery.deliveryNumber})`
                    : `مذكرة تسليم جوازات سفر لمكتب / وكالة رقم (${selectedDelivery.deliveryNumber})`}
                </div>
              </div>

              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  إنه في يوم <strong>({selectedDelivery.date})</strong>، تم تسليم الجواز / الجوازات المبينة أدناه إلى:
                </p>

                <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-2 text-xs">
                  {selectedDelivery.deliveryType === 'owner' ? (
                    <>
                      <div><strong>الاسم الرباعي:</strong> {selectedDelivery.recipientName}</div>
                      <div><strong>رقم الهوية الوطنية:</strong> {selectedDelivery.nationalId}</div>
                      <div><strong>رقم الهاتف:</strong> {selectedDelivery.phone}</div>
                      <div><strong>رقم الجواز المسلم:</strong> <span className="font-mono font-bold text-blue-700 text-sm">{selectedDelivery.passportNumber}</span></div>
                    </>
                  ) : (
                    <>
                      <div><strong>المكتب / الوكالة:</strong> {selectedDelivery.officeName}</div>
                      <div><strong>المندوب المفوض بالاستلام:</strong> {selectedDelivery.agentName}</div>
                      <div><strong>رقم هوية المندوب:</strong> {selectedDelivery.agentNationalId || '—'}</div>
                      <div><strong>رقم هاتف المندوب:</strong> {selectedDelivery.agentPhone || '—'}</div>
                      <div><strong>عدد الجوازات المسلمة:</strong> <span className="font-bold">{selectedDelivery.passportCount}</span> جواز</div>
                    </>
                  )}
                </div>

                {selectedDelivery.deliveryType === 'office' && selectedDelivery.passportNumbers && (
                  <div>
                    <h5 className="font-bold text-xs mb-2">بيان بأرقام الجوازات المسلمة بموجب هذه المذكرة:</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedDelivery.passportNumbers.map((num, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-xs">
                          {idx + 1}. {num}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDelivery.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <strong>ملاحظات:</strong> {selectedDelivery.notes}
                  </p>
                )}

                <p className="text-xs text-slate-600 pt-2">
                  أقر أنا الموقع أدناه باستلامي للجواز / الجوازات المذكورة أعلاه سليمة وخالية من أي تلف، وأتحمل كامل المسؤولية القانونية حيالها.
                </p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-slate-300 text-center text-xs">
                <div>
                  <div className="font-bold mb-10">المستلم بما فيه</div>
                  <div>الاسم: {selectedDelivery.signedBy || '................................'}</div>
                  <div>التوقيع والبصمة: ............................................</div>
                </div>
                <div>
                  <div className="font-bold mb-10">الموظف المختص بالتسليم</div>
                  <div>الاسم: {selectedDelivery.officer}</div>
                  <div>الختم الرسمي: ............................................</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end no-print">
              <button
                onClick={() => setSelectedDelivery(null)}
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
