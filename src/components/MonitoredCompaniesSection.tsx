import React, { useState } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Calendar, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  Sparkles,
  RefreshCw,
  Ban,
  UserCheck
} from 'lucide-react';
import type { MonitoredCompany, MonitoredCompanyCategory, CompanySecurityStatus, User } from '../types';

interface MonitoredCompaniesSectionProps {
  companies: MonitoredCompany[];
  user: User | null;
  onRefresh: () => void;
}

export default function MonitoredCompaniesSection({
  companies,
  user,
  onRefresh
}: MonitoredCompaniesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<MonitoredCompany | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);

  // New Company Form State
  const [formData, setFormData] = useState<Partial<MonitoredCompany>>({
    name: '',
    commercialRegisterNumber: '',
    category: 'شركات الحج والعمرة',
    licenseNumber: '',
    licenseExpiryDate: '2027-12-31',
    ownerName: '',
    managerName: '',
    phone: '',
    governorate: 'العاصمة عدن',
    address: '',
    securityStatus: 'مسموح ومعتمد',
    statusDecisionNumber: 'قرار اعتماد وزاري 2026/01',
    statusDecisionDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // New Violation Form State
  const [violationData, setViolationData] = useState({
    violationType: '',
    decisionNumber: `قرار إداري-${Math.floor(10 + Math.random() * 90)}/2026`,
    decisionDate: new Date().toISOString().split('T')[0],
    actionTaken: 'إنذار رسمي' as const,
    notes: ''
  });

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.commercialRegisterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.governorate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || c.securityStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const allowedCount = companies.filter(c => c.securityStatus === 'مسموح ومعتمد').length;
  const suspendedCount = companies.filter(c => c.securityStatus === 'موقوف مؤقتاً').length;
  const bannedCount = companies.filter(c => c.securityStatus === 'محظور أمنياً').length;
  const auditCount = companies.filter(c => c.securityStatus === 'تحت التدقيق').length;

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const res = await fetch('/api/monitored-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          commercialRegisterNumber: '',
          category: 'شركات الحج والعمرة',
          licenseNumber: '',
          licenseExpiryDate: '2027-12-31',
          ownerName: '',
          managerName: '',
          phone: '',
          governorate: 'العاصمة عدن',
          address: '',
          securityStatus: 'مسموح ومعتمد'
        });
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to create company', err);
    }
  };

  const handleUpdateStatus = async (companyId: string, newStatus: CompanySecurityStatus, decisionNum: string) => {
    try {
      const res = await fetch(`/api/monitored-companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          securityStatus: newStatus,
          statusDecisionNumber: decisionNum,
          statusDecisionDate: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        if (selectedCompany && selectedCompany.id === companyId) {
          setSelectedCompany(prev => prev ? { ...prev, securityStatus: newStatus } : null);
        }
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to update company status', err);
    }
  };

  const handleAddViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    const newViol = {
      id: `viol-${Date.now()}`,
      violationDate: violationData.decisionDate,
      violationType: violationData.violationType,
      decisionNumber: violationData.decisionNumber,
      decisionDate: violationData.decisionDate,
      actionTaken: violationData.actionTaken,
      officerName: user?.name || 'مفتش الرقابة الأمنية',
      notes: violationData.notes
    };

    const updatedViolations = [...(selectedCompany.violations || []), newViol];
    let newStatus = selectedCompany.securityStatus;
    if (violationData.actionTaken === 'إيقاف مؤقت') newStatus = 'موقوف مؤقتاً';
    if (violationData.actionTaken === 'إلغاء ترخيص وحظر') newStatus = 'محظور أمنياً';

    try {
      const res = await fetch(`/api/monitored-companies/${selectedCompany.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violations: updatedViolations,
          securityStatus: newStatus,
          statusDecisionNumber: violationData.decisionNumber,
          statusDecisionDate: violationData.decisionDate
        })
      });
      if (res.ok) {
        setShowViolationModal(false);
        setViolationData({
          violationType: '',
          decisionNumber: `قرار إداري-${Math.floor(10 + Math.random() * 90)}/2026`,
          decisionDate: new Date().toISOString().split('T')[0],
          actionTaken: 'إنذار رسمي',
          notes: ''
        });
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to add violation', err);
    }
  };

  const getStatusBadge = (status: CompanySecurityStatus) => {
    switch (status) {
      case 'مسموح ومعتمد':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'موقوف مؤقتاً':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'محظور أمنياً':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'تحت التدقيق':
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sovereign Header Banner */}
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute left-6 -top-10 opacity-10 pointer-events-none">
          <Building2 size={280} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black rounded-full">
                إدارة الرقابة على الشركات والوكالات السياحية
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black rounded-full">
                القطاعات الخاضعة للرقابة الأمنية المشددة
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              منظومة الرقابة والتفتيش الأمني على الشركات
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              المتابعة الأمنية الصارمة للشركات الخاضعة لرقابة مصلحة الجوازات واستخبارات الشرطة (شركات الحج والعمرة، شركات الصرافة، مكاتب السفر والسياحة، وكالات تشغيل وتوظيف الأيدي العاملة، وشركات التأمين) وإدارة قرارات الإيقاف، الحظر، وسجل المخالفات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-900/30 transition flex items-center gap-2"
            >
              <Plus size={16} />
              قيد شركة خاضعة للرقابة
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              <Printer size={16} />
              طباعة السجل الرقابي
            </button>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">إجمالي الشركات المقيدة</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">{companies.length} شركة</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-emerald-400 block">مسموح ومعتمد</span>
            <span className="text-2xl font-black font-mono text-emerald-300 mt-1 block">{allowedCount}</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 block">موقوف مؤقتاً</span>
            <span className="text-2xl font-black font-mono text-amber-300 mt-1 block">{suspendedCount}</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-rose-400 block">محظور أمنياً</span>
            <span className="text-2xl font-black font-mono text-rose-300 mt-1 block">{bannedCount}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث بالاسم، السجل التجاري، رقم الترخيص، المالك..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة القطاعات الخاضعة للرقابة</option>
            <option value="شركات الحج والعمرة">شركات الحج والعمرة</option>
            <option value="شركات الصرافة">شركات الصرافة والتحويلات</option>
            <option value="شركات السفر والسياحة">شركات السفر والسياحة</option>
            <option value="وكالات التوظيف">وكالات التوظيف</option>
            <option value="شركات التأمين">شركات التأمين</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة الحالات الأمنية</option>
            <option value="مسموح ومعتمد">مسموح ومعتمد</option>
            <option value="موقوف مؤقتاً">موقوف مؤقتاً</option>
            <option value="محظور أمنياً">محظور أمنياً</option>
            <option value="تحت التدقيق">تحت التدقيق</option>
          </select>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((comp) => (
          <div
            key={comp.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
          >
            <div className="p-6 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {comp.companyCode}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">{comp.category}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1 line-clamp-1">{comp.name}</h3>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border whitespace-nowrap ${getStatusBadge(comp.securityStatus)}`}>
                  {comp.securityStatus}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3 text-xs text-slate-600 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">السجل التجاري:</span>
                <span className="font-mono font-bold text-slate-800">{comp.commercialRegisterNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">رقم الترخيص:</span>
                <span className="font-mono font-bold text-slate-800">{comp.licenseNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">صلاحية الترخيص:</span>
                <span className="font-mono text-slate-800 font-bold">{comp.licenseExpiryDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">المالك / المدير:</span>
                <span className="font-bold text-slate-800">{comp.ownerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">المقر:</span>
                <span className="text-slate-800 font-medium">{comp.governorate} • {comp.address}</span>
              </div>

              {comp.statusDecisionNumber && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-0.5">
                  <span className="text-slate-400 block">سند القرار الأمني:</span>
                  <span className="font-bold text-slate-800 block">{comp.statusDecisionNumber} ({comp.statusDecisionDate})</span>
                </div>
              )}

              {/* Violations Count */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-bold">سجل المخالفات المسجلة:</span>
                <span className={`font-black font-mono px-2 py-0.5 rounded-full text-xs ${
                  comp.violations && comp.violations.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {comp.violations?.length || 0} مخالفة
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-1">
                {comp.securityStatus === 'مسموح ومعتمد' ? (
                  <button
                    onClick={() => handleUpdateStatus(comp.id, 'موقوف مؤقتاً', 'قرار إيقاف تحفظي')}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold rounded-lg transition"
                  >
                    إيقاف مؤقت
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(comp.id, 'مسموح ومعتمد', 'قرار رفع الإيقاف واستئناف العمل')}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-lg transition"
                  >
                    استئناف النشاط
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedCompany(comp);
                  setShowViolationModal(true);
                }}
                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold rounded-lg transition"
              >
                + قيد مخالفة / قرار
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Building2 size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">لا توجد شركات مطابقة للبحث</h3>
          <p className="text-xs text-slate-400 mt-1">تأكد من اختيار فئة الشركة أو اسم المنشأة.</p>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">قيد شركة / وكالة خاضعة للرقابة الأمنية</h3>
                <p className="text-xs text-slate-400">إدخال البيانات الرسمية والتراخيص والوضع الأمني</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم الشركة / الوكالة *</label>
                  <input
                    type="text"
                    required
                    placeholder="الاسم الرسمي المعتمد"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">القطاع الخاضع للرقابة *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="شركات الحج والعمرة">شركات الحج والعمرة</option>
                    <option value="شركات الصرافة">شركات الصرافة والتحويلات</option>
                    <option value="شركات السفر والسياحة">شركات السفر والسياحة</option>
                    <option value="وكالات التوظيف">وكالات التوظيف وتشغيل الأيدي العاملة</option>
                    <option value="شركات التأمين">شركات التأمين</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم السجل التجاري</label>
                  <input
                    type="text"
                    value={formData.commercialRegisterNumber}
                    onChange={(e) => setFormData({ ...formData, commercialRegisterNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الترخيص الرسمي</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المالك / المفوض</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المحافظة</label>
                  <input
                    type="text"
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">هاتف العمليات</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono dir-ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الحالة الأمنية الأولية</label>
                  <select
                    value={formData.securityStatus}
                    onChange={(e) => setFormData({ ...formData, securityStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="مسموح ومعتمد">مسموح ومعتمد</option>
                    <option value="تحت التدقيق">تحت التدقيق الأمني</option>
                    <option value="موقوف مؤقتاً">موقوف مؤقتاً</option>
                    <option value="محظور أمنياً">محظور أمنياً</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">صلاحية الترخيص</label>
                  <input
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-900/20"
                >
                  حفظ وقيد المنشأة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Violation / Decision Modal */}
      {showViolationModal && selectedCompany && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">تسجيل مخالفة / قرار رقابي</h3>
                <span className="text-xs text-slate-500 font-bold">{selectedCompany.name}</span>
              </div>
              <button onClick={() => setShowViolationModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddViolation} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">طبيعة المخالفة المرتكبة *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="وصف تفصيلي للمخالفة المرتكبة..."
                  value={violationData.violationType}
                  onChange={(e) => setViolationData({ ...violationData, violationType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الإجراء المتخذ *</label>
                  <select
                    value={violationData.actionTaken}
                    onChange={(e) => setViolationData({ ...violationData, actionTaken: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-700"
                  >
                    <option value="إنذار رسمي">إنذار رسمي</option>
                    <option value="إيقاف مؤقت">إيقاف مؤقت عن العمل في المنافذ</option>
                    <option value="إلغاء ترخيص وحظر">إلغاء ترخيص وحظر أمني شامل</option>
                    <option value="غرامة مالية">غرامة مالية</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم القرار / المذكرة الرسمية</label>
                  <input
                    type="text"
                    required
                    value={violationData.decisionNumber}
                    onChange={(e) => setViolationData({ ...violationData, decisionNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات والتوجيهات المنفذة</label>
                <textarea
                  rows={2}
                  value={violationData.notes}
                  onChange={(e) => setViolationData({ ...violationData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowViolationModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-900/20"
                >
                  اعتماد القرار والمخالفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
