import React, { useState } from 'react';
import { 
  Building2, 
  Globe2, 
  Users, 
  Car, 
  ShieldCheck, 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import type { InternationalOrganization, User } from '../types';

interface OrganizationsSectionProps {
  organizations: InternationalOrganization[];
  user: User | null;
  onRefresh: () => void;
}

export default function OrganizationsSection({
  organizations,
  user,
  onRefresh
}: OrganizationsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<InternationalOrganization | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState<Partial<InternationalOrganization>>({
    arabicName: '',
    englishName: '',
    acronym: '',
    category: 'وكالة أمم متحدة (UN)',
    countryOfOrigin: '',
    agreementNumber: '',
    agreementDate: new Date().toISOString().split('T')[0],
    headOfMission: '',
    securityFocalPoint: '',
    phone: '',
    email: '',
    headquartersAddress: '',
    activeForeignStaff: 10,
    activeLocalStaff: 50,
    registeredVehicles: 15,
    status: 'معتمدة وسارية',
    activeProjectsSummary: ''
  });

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = 
      org.arabicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.orgCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.headOfMission.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || org.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalForeignStaff = organizations.reduce((acc, o) => acc + (o.activeForeignStaff || 0), 0);
  const totalLocalStaff = organizations.reduce((acc, o) => acc + (o.activeLocalStaff || 0), 0);
  const totalVehicles = organizations.reduce((acc, o) => acc + (o.registeredVehicles || 0), 0);

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.arabicName || !formData.acronym) return;

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          orgCode: `ORG-${formData.acronym?.toUpperCase()}`
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          arabicName: '',
          englishName: '',
          acronym: '',
          category: 'وكالة أمم متحدة (UN)',
          activeForeignStaff: 10,
          activeLocalStaff: 50,
          registeredVehicles: 15,
          status: 'معتمدة وسارية'
        });
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to create organization', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sovereign Header Banner */}
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute left-6 -top-10 opacity-10 pointer-events-none">
          <Globe2 size={280} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-black rounded-full">
                الإدارة العامة للشؤون العربية والأجنبية
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black rounded-full">
                سجل المنظمات والبعثات الدولية (المجموعة 10)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              سجل المنظمات والهيئات الدولية المعتمدة
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              السجل المركزي لحصر وكالات الأمم المتحدة (UN)، المنظمات الدولية غير الحكومية (INGOs)، والهيئات الدبلوماسية، وتتبع بروتوكولات الاتفاقيات وكوادرها وتصاريح أسطول مركباتها.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-900/30 transition flex items-center gap-2"
            >
              <Plus size={16} />
              قيد منظمة جديدة
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              <Printer size={16} />
              طباعة الدليل
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">إجمالي المنظمات المقيدة</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">{organizations.length} منظمة</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-teal-400 block">الكوادر الأجانب النشطون</span>
            <span className="text-2xl font-black font-mono text-teal-300 mt-1 block">{totalForeignStaff} موظف</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-blue-400 block">الكوادر المحليون</span>
            <span className="text-2xl font-black font-mono text-blue-300 mt-1 block">{totalLocalStaff} موظف</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 block">المركبات المسجلة رسمياً</span>
            <span className="text-2xl font-black font-mono text-amber-300 mt-1 block">{totalVehicles} مركبة</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث بالاسم، الرمز (OCHA, WFP)، رئيس البعثة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة الفئات</option>
            <option value="وكالة أمم متحدة (UN)">وكالات الأمم المتحدة (UN)</option>
            <option value="منظمة دولية غير حكومية (INGO)">منظمات دولية غير حكومية (INGO)</option>
            <option value="بعثة دبلوماسية سفارة">بعثات دبلوماسية</option>
            <option value="هيئة إقليمية">هيئات إقليمية</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => (
          <div
            key={org.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
          >
            <div className="p-6 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center font-black text-teal-800 text-sm">
                    {org.acronym}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 line-clamp-1">{org.arabicName}</h3>
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{org.englishName}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black rounded-full whitespace-nowrap">
                  {org.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3 text-xs text-slate-600 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">التصنيف:</span>
                <span className="font-bold text-slate-800">{org.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">رئيس البعثة:</span>
                <span className="font-bold text-slate-800">{org.headOfMission}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">مسؤول الأمن والسلامة:</span>
                <span className="font-bold text-slate-800">{org.securityFocalPoint}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">رقم الاتفاقية الأساسية:</span>
                <span className="font-mono font-bold text-slate-800">{org.agreementNumber}</span>
              </div>

              {/* Staff Stats */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">كوادر أجانب</span>
                  <span className="text-sm font-black font-mono text-teal-700 block mt-0.5">{org.activeForeignStaff}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">كوادر محليين</span>
                  <span className="text-sm font-black font-mono text-blue-700 block mt-0.5">{org.activeLocalStaff}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">سيارات معتمدة</span>
                  <span className="text-sm font-black font-mono text-amber-700 block mt-0.5">{org.registeredVehicles}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Phone size={12} /> {org.phone}
              </span>
              <button
                onClick={() => {
                  setSelectedOrg(org);
                  setShowDetailModal(true);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-teal-800 border border-teal-200 text-[11px] font-bold rounded-lg shadow-xs transition"
              >
                عرض الملف الكامل
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOrgs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Building2 size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">لا توجد منظمات مطابقة</h3>
          <p className="text-xs text-slate-400 mt-1">تأكد من كتابة الاسم أو الرمز بالإنجليزية أو العربية.</p>
        </div>
      )}

      {/* Add Organization Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">قيد منظمة / هيئة دولية جديدة</h3>
                <p className="text-xs text-slate-400">إدخال البيانات الأساسية، رئيس البعثة، والاتفاقية</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveOrg} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">الاسم باللغة العربية *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: منظمة الصحة العالمية"
                    value={formData.arabicName}
                    onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الرمز المختصر *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: WHO"
                    value={formData.acronym}
                    onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الاسم باللغة الإنجليزية</label>
                <input
                  type="text"
                  placeholder="World Health Organization"
                  value={formData.englishName}
                  onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التصنيف</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="وكالة أمم متحدة (UN)">وكالة أمم متحدة (UN)</option>
                    <option value="منظمة دولية غير حكومية (INGO)">منظمة دولية غير حكومية (INGO)</option>
                    <option value="بعثة دبلوماسية سفارة">بعثة دبلوماسية سفارة</option>
                    <option value="هيئة إقليمية">هيئة إقليمية</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">بلد المقر الأصلي</label>
                  <input
                    type="text"
                    placeholder="سويسرا / الولايات المتحدة / إيطاليا"
                    value={formData.countryOfOrigin}
                    onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رئيس البعثة في اليمن</label>
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    value={formData.headOfMission}
                    onChange={(e) => setFormData({ ...formData, headOfMission: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">مسؤول التنسيق الأمني والسلامة</label>
                  <input
                    type="text"
                    placeholder="الاسم ورقم الهاتف"
                    value={formData.securityFocalPoint}
                    onChange={(e) => setFormData({ ...formData, securityFocalPoint: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الكوادر الأجانب</label>
                  <input
                    type="number"
                    value={formData.activeForeignStaff}
                    onChange={(e) => setFormData({ ...formData, activeForeignStaff: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الكوادر المحليون</label>
                  <input
                    type="number"
                    value={formData.activeLocalStaff}
                    onChange={(e) => setFormData({ ...formData, activeLocalStaff: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المركبات المسجلة</label>
                  <input
                    type="number"
                    value={formData.registeredVehicles}
                    onChange={(e) => setFormData({ ...formData, registeredVehicles: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملخص المشاريع الإنسانية والتنموية</label>
                <textarea
                  rows={3}
                  placeholder="مشاريع الإغاثة، المياه، الصحة، والتعليم..."
                  value={formData.activeProjectsSummary}
                  onChange={(e) => setFormData({ ...formData, activeProjectsSummary: e.target.value })}
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-900/20"
                >
                  قيد واعتماد المنظمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organization Detail Modal */}
      {showDetailModal && selectedOrg && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center font-black text-teal-800 text-xs">
                  {selectedOrg.acronym}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedOrg.arabicName}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedOrg.orgCode}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between"><span className="text-slate-500 font-bold">الاسم الإنجليزي:</span> <span className="font-semibold text-slate-800">{selectedOrg.englishName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">رقم الاتفاقية:</span> <span className="font-mono text-slate-800 font-bold">{selectedOrg.agreementNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">تاريخ الاتفاقية:</span> <span className="font-mono text-slate-800">{selectedOrg.agreementDate}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">المقر الرئيسي:</span> <span className="text-slate-800 font-medium">{selectedOrg.headquartersAddress}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">هاتف العمليات:</span> <span className="font-mono text-slate-800 dir-ltr">{selectedOrg.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">البريد الإلكتروني:</span> <span className="font-mono text-slate-800">{selectedOrg.email}</span></div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">المكاتب والفروع بالمحافظات:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedOrg.subOffices?.map((sub, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">ملخص الأنشطة والمشاريع:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedOrg.activeProjectsSummary}
                </p>
              </div>

              {selectedOrg.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block mb-0.5">ملاحظات التنسيق الأمني:</span>
                  <p>{selectedOrg.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                إغلاق الملف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
