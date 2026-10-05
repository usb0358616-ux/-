import React, { useState } from 'react';
import { 
  Navigation, 
  ShieldCheck, 
  Car, 
  Radio, 
  Users, 
  MapPin, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  FileText, 
  Sparkles, 
  Phone, 
  ArrowRight, 
  QrCode, 
  BadgeAlert,
  Trash2,
  Building2
} from 'lucide-react';
import type { MovementPermitRecord, User, MovementCompanion, MovementVehicle, MovementDevice } from '../types';
import SmartAIImportModal from './SmartAIImportModal';

interface MovementPermitsSectionProps {
  permits: MovementPermitRecord[];
  user: User | null;
  onRefresh: () => void;
}

export default function MovementPermitsSection({
  permits,
  user,
  onRefresh
}: MovementPermitsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [selectedPermit, setSelectedPermit] = useState<MovementPermitRecord | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIImportModal, setShowAIImportModal] = useState(false);

  // New Permit Form State
  const [newPermitData, setNewPermitData] = useState({
    organizationName: '',
    entityType: 'منظمة دولية (UN / INGO)' as const,
    applicantLeaderName: '',
    leaderPassport: '',
    leaderNationality: 'أجنبي',
    leaderPhone: '',
    purpose: 'إنساني وإغاثي' as const,
    originGovernorate: 'العاصمة عدن',
    destinationGovernorates: 'عدن، لحج، تعز',
    approvedRoute: 'طريق عدن - العند - طور الباحة - تعز',
    accommodations: 'مقر المنظمة المعتمد',
    startDate: new Date().toISOString().split('T')[0],
    validDays: 10,
    specialInstructions: 'تسهيل المرور عبر كافة النقاط العسكرية والأمنية مع الالتزام بخط السير المعتمد.'
  });

  const [companionsList, setCompanionsList] = useState<MovementCompanion[]>([]);
  const [vehiclesList, setVehiclesList] = useState<MovementVehicle[]>([]);
  const [devicesList, setDevicesList] = useState<MovementDevice[]>([]);

  // Companion form row
  const [tempComp, setTempComp] = useState({ name: '', passportOrId: '', nationality: 'يمني', role: 'مرافق / منسق' });
  // Vehicle form row
  const [tempVeh, setTempVeh] = useState({ plateNumber: '', plateGovernorate: 'عدن', modelAndColor: 'تويوتا لاندكروزر - أبيض', driverName: '', driverPhone: '' });
  // Device form row
  const [tempDev, setTempDev] = useState({ deviceType: 'هاتف ثريا فضائي (Thuraya)' as const, brandModel: 'Thuraya XT', serialNumber: '', isApproved: true });

  const filteredPermits = permits.filter(p => {
    const matchesSearch = 
      p.permitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.applicantLeaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.approvedRoute.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.leaderPassport.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesEntity = entityFilter === 'all' || p.entityType === entityFilter;

    return matchesSearch && matchesStatus && matchesEntity;
  });

  const handleAddCompanion = () => {
    if (!tempComp.name) return;
    setCompanionsList(prev => [...prev, { ...tempComp, id: `cmp-${Date.now()}` }]);
    setTempComp({ name: '', passportOrId: '', nationality: 'يمني', role: 'مرافق / منسق' });
  };

  const handleAddVehicle = () => {
    if (!tempVeh.plateNumber) return;
    setVehiclesList(prev => [...prev, { ...tempVeh, id: `veh-${Date.now()}` }]);
    setTempVeh({ plateNumber: '', plateGovernorate: 'عدن', modelAndColor: 'تويوتا لاندكروزر - أبيض', driverName: '', driverPhone: '' });
  };

  const handleAddDevice = () => {
    if (!tempDev.serialNumber) return;
    setDevicesList(prev => [...prev, { ...tempDev, id: `dev-${Date.now()}` }]);
    setTempDev({ deviceType: 'هاتف ثريا فضائي (Thuraya)', brandModel: 'Thuraya XT', serialNumber: '', isApproved: true });
  };

  const handleCreatePermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermitData.applicantLeaderName || !newPermitData.organizationName) return;

    const start = new Date(newPermitData.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + Number(newPermitData.validDays));

    const payload = {
      ...newPermitData,
      destinationGovernorates: newPermitData.destinationGovernorates.split(/[,،]/).map(s => s.trim()).filter(Boolean),
      startDate: newPermitData.startDate,
      endDate: end.toISOString().split('T')[0],
      validDays: Number(newPermitData.validDays),
      status: 'مصرح وساري',
      companions: companionsList,
      vehicles: vehiclesList,
      devices: devicesList,
      approvingOfficer: user?.name || 'العميد / مدير إدارة التصاريح الأمنية'
    };

    try {
      const res = await fetch('/api/movement-permits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAddModal(false);
        setCompanionsList([]);
        setVehiclesList([]);
        setDevicesList([]);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to create permit', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: any) => {
    try {
      const res = await fetch(`/api/movement-permits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        if (selectedPermit && selectedPermit.id === id) {
          setSelectedPermit(prev => prev ? { ...prev, status } : null);
        }
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute left-6 -top-10 opacity-10 pointer-events-none">
          <Navigation size={280} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black rounded-full">
                إدارة العمليات والسيطرة • مصلحة الجوازات
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black rounded-full">
                نظام تصاريح التنقل وخطوط السير (المجموعة 7)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              منظومة تصاريح التنقل والتحرك الأمني
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              إصدار وتدقيق تصاريح حركة المنظمات الدولية، البعثات الدبلوماسية، والوفود الأجنبية، واعتماد المركبات، السائقين، وأجهزة الاتصالات الفضائية (الثريا / اللاسلكي) وتوليد باركود التحقق للنقاط الأمنية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowAIImportModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Sparkles size={16} className="text-amber-300 animate-pulse" />
              استيراد كشوفات التنقل بالذكاء
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-900/30 transition flex items-center gap-2"
            >
              <Plus size={16} />
              إصدار تصريح جديد
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">إجمالي التصاريح</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">{permits.length}</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-emerald-400 block">مصرح وساري المفعول</span>
            <span className="text-2xl font-black font-mono text-emerald-300 mt-1 block">
              {permits.filter(p => p.status === 'مصرح وساري').length}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 block">أجهزة اتصالات مصرحة</span>
            <span className="text-2xl font-black font-mono text-amber-300 mt-1 block">
              {permits.reduce((acc, p) => acc + (p.devices ? p.devices.length : 0), 0)} جهاز
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-indigo-400 block">مركبات وقوافل معتمدة</span>
            <span className="text-2xl font-black font-mono text-indigo-300 mt-1 block">
              {permits.reduce((acc, p) => acc + (p.vehicles ? p.vehicles.length : 0), 0)} سيارة
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث برقم التصريح، المنظمة، اسم المسؤول، خط السير..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة الحالات</option>
            <option value="مصرح وساري">مصرح وساري</option>
            <option value="منتهي الصلاحية">منتهي الصلاحية</option>
            <option value="معلق للدواعي الأمنية">معلق للدواعي الأمنية</option>
            <option value="ملغي">ملغي</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة الجهات</option>
            <option value="منظمة دولية (UN / INGO)">منظمة دولية (UN / INGO)</option>
            <option value="بعثة دبلوماسية">بعثة دبلوماسية</option>
            <option value="وفد تجاري / شركات">وفد تجاري / شركات</option>
            <option value="وفد إعلامي">وفد إعلامي</option>
            <option value="وافدون وأفراد">وافدون وأفراد</option>
          </select>
        </div>
      </div>

      {/* Permits Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
              <tr>
                <th className="py-4 px-4">رقم التصريح</th>
                <th className="py-4 px-4">الجهة / المنظمة</th>
                <th className="py-4 px-4">مسؤول الموكب والجنسية</th>
                <th className="py-4 px-4">خط السير المصرح به</th>
                <th className="py-4 px-4">الفترة والمدة</th>
                <th className="py-4 px-4 text-center">المرافقين والمركبات</th>
                <th className="py-4 px-4 text-center">الحالة</th>
                <th className="py-4 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPermits.map((permit) => (
                <tr key={permit.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-mono font-black text-indigo-700 whitespace-nowrap">
                    {permit.permitNumber}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{permit.organizationName}</div>
                    <span className="text-[11px] text-slate-400 font-medium">{permit.entityType}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-800">{permit.applicantLeaderName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {permit.leaderPassport} • {permit.leaderNationality}
                    </div>
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <span className="text-slate-700 font-semibold line-clamp-1">{permit.approvedRoute}</span>
                    <span className="text-[11px] text-slate-400">
                      إلى: {permit.destinationGovernorates?.join('، ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-bold text-slate-800">{permit.startDate} → {permit.endDate}</div>
                    <span className="text-[11px] text-indigo-600 font-black">({permit.validDays} أيام)</span>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-[11px] flex items-center gap-1">
                        <Users size={12} /> {permit.companions?.length || 0}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[11px] flex items-center gap-1">
                        <Car size={12} /> {permit.vehicles?.length || 0}
                      </span>
                      {permit.devices && permit.devices.length > 0 && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-bold text-[11px] flex items-center gap-1">
                          <Radio size={12} /> {permit.devices.length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black border ${
                        permit.status === 'مصرح وساري'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : permit.status === 'معلق للدواعي الأمنية'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {permit.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedPermit(permit);
                          setShowPrintModal(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition flex items-center gap-1"
                        title="عرض وطباعة التصريح الأمني الرسمي"
                      >
                        <Printer size={14} />
                        طباعة التصريح
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPermits.length === 0 && (
          <div className="text-center py-16 p-8">
            <Navigation size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">لا توجد تصاريح تنقل مسجلة</h3>
            <p className="text-xs text-slate-400 mt-1">يمكنك إصدار تصريح تحرك أمني جديد أو الاستيراد بالذكاء الاصطناعي.</p>
          </div>
        )}
      </div>

      {/* Official Printable Sovereign Security Permit Modal */}
      {showPrintModal && selectedPermit && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 no-print">
              <span className="font-bold text-slate-500 text-xs">معاينة واستخراج التصريح السيادي</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-900/20"
                >
                  <Printer size={16} />
                  طباعة الوثيقة الرسمية
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* Sovereign Document Sheet */}
            <div className="p-6 border-2 border-slate-900 rounded-2xl bg-white text-slate-950 space-y-6 print:border-none print:p-0">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 text-center">
                <div className="text-right text-xs space-y-1">
                  <div className="font-bold">الجمهورية اليمنية</div>
                  <div className="font-bold">وزارة الداخلية</div>
                  <div className="font-bold">مصلحة الهجرة والجوازات والجنسية</div>
                  <div className="font-black text-indigo-950">إدارة العمليات والسيطرة الأمنية</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-1 p-2">
                    <ShieldCheck size={36} className="text-slate-900" />
                  </div>
                  <h2 className="text-lg font-black tracking-tight">تصريح تحرك وتنقل أمني رسمي</h2>
                  <span className="text-[11px] font-mono font-bold text-slate-600">SECURITY MOVEMENT PERMIT</span>
                </div>

                <div className="text-left text-xs font-mono space-y-1">
                  <div>رقم التصريح: <span className="font-black text-indigo-900">{selectedPermit.permitNumber}</span></div>
                  <div>التاريخ: {selectedPermit.startDate}</div>
                  <div>المدة: {selectedPermit.validDays} يوماً</div>
                </div>
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-bold block mb-0.5">الجهة / المنظمة المصرح لها:</span>
                  <span className="font-black text-sm text-slate-900">{selectedPermit.organizationName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block mb-0.5">الغرض من التحرك:</span>
                  <span className="font-black text-slate-900">{selectedPermit.purpose}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block mb-0.5">مسؤول الموكب / قائد الفريق:</span>
                  <span className="font-black text-slate-900">{selectedPermit.applicantLeaderName} ({selectedPermit.leaderNationality})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block mb-0.5">رقم الجواز والهاتف:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedPermit.leaderPassport} • {selectedPermit.leaderPhone || 'مدرج بالملف'}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-bold block mb-0.5">خط السير والنقاط المعتمدة:</span>
                  <span className="font-black text-slate-900">{selectedPermit.approvedRoute}</span>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                    المحافظات المشمولة: {selectedPermit.destinationGovernorates?.join(' - ')}
                  </div>
                </div>
              </div>

              {/* Companions & Vehicles Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Companions */}
                <div className="border border-slate-300 rounded-xl p-3">
                  <h4 className="font-black text-slate-900 mb-2 flex items-center gap-1.5">
                    <Users size={14} /> أعضاء الفريق والمرافقين ({selectedPermit.companions?.length || 0})
                  </h4>
                  <div className="space-y-1.5">
                    {selectedPermit.companions?.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg text-[11px]">
                        <span className="font-bold">{c.name}</span>
                        <span className="text-slate-500 font-mono">{c.passportOrId} ({c.nationality})</span>
                      </div>
                    ))}
                    {(!selectedPermit.companions || selectedPermit.companions.length === 0) && (
                      <span className="text-slate-400 text-[11px]">لا يوجد مرافقون إضافيون</span>
                    )}
                  </div>
                </div>

                {/* Vehicles */}
                <div className="border border-slate-300 rounded-xl p-3">
                  <h4 className="font-black text-slate-900 mb-2 flex items-center gap-1.5">
                    <Car size={14} /> المركبات والسائقين ({selectedPermit.vehicles?.length || 0})
                  </h4>
                  <div className="space-y-1.5">
                    {selectedPermit.vehicles?.map((v, i) => (
                      <div key={i} className="p-1.5 bg-slate-50 rounded-lg text-[11px] space-y-0.5">
                        <div className="flex items-center justify-between font-bold">
                          <span>{v.modelAndColor}</span>
                          <span className="font-mono text-indigo-900">{v.plateNumber}</span>
                        </div>
                        <div className="text-slate-500">السائق: {v.driverName} ({v.driverPhone})</div>
                      </div>
                    ))}
                    {(!selectedPermit.vehicles || selectedPermit.vehicles.length === 0) && (
                      <span className="text-slate-400 text-[11px]">لا توجد مركبات مسجلة</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Devices Section */}
              {selectedPermit.devices && selectedPermit.devices.length > 0 && (
                <div className="border border-slate-300 rounded-xl p-3 text-xs bg-amber-50/40">
                  <h4 className="font-black text-slate-900 mb-2 flex items-center gap-1.5 text-amber-900">
                    <Radio size={14} /> أجهزة الاتصالات اللاسلكية والفضائية المصرح بحملها
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPermit.devices.map((d, i) => (
                      <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                        <span className="font-bold text-slate-900 block">{d.deviceType}</span>
                        <span className="text-slate-600 font-mono">طراز: {d.brandModel} | سيريال: {d.serialNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Directive & Official Stamp */}
              <div className="border-t-2 border-slate-900 pt-4 flex items-end justify-between text-xs">
                <div className="max-w-md space-y-1">
                  <div className="font-black text-slate-900">توجيه أمني لكافة النقاط العسكرية والأمنية:</div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    يُرجى تسهيل مرور موكب الجهة المذكورة أعلاه بموجب هذا التصريح والالتزام بخط السير والمحافظات المحددة. في حال أي اشتباه يرجى التواصل فوراً مع عمليات مصلحة الجوازات.
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 pt-1">
                    رمز التتبع الرقمي: {selectedPermit.securityBarcodeToken}
                  </div>
                </div>

                <div className="text-center p-3 border-2 border-indigo-950 rounded-2xl bg-indigo-50/30">
                  <div className="text-[11px] font-bold text-slate-600 mb-1">الختم والاعتماد السيادي</div>
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-900 mx-auto flex flex-col items-center justify-center p-1 text-[9px] font-black text-indigo-900">
                    <span>مصلحة الهجرة</span>
                    <span>معتمد</span>
                    <span>العمليات</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-900 mt-1">{selectedPermit.approvingOfficer}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Permit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">إصدار تصريح تحرك أمني جديد</h3>
                <p className="text-xs text-slate-400">إدخال بيانات الموكب، خط السير، المركبات والأجهزة المصرح بها</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreatePermit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم الجهة / المنظمة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: برنامج الأغذية العالمي WFP"
                    value={newPermitData.organizationName}
                    onChange={(e) => setNewPermitData({ ...newPermitData, organizationName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع الجهة</label>
                  <select
                    value={newPermitData.entityType}
                    onChange={(e) => setNewPermitData({ ...newPermitData, entityType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="منظمة دولية (UN / INGO)">منظمة دولية (UN / INGO)</option>
                    <option value="بعثة دبلوماسية">بعثة دبلوماسية</option>
                    <option value="وفد تجاري / شركات">وفد تجاري / شركات</option>
                    <option value="وفد إعلامي">وفد إعلامي</option>
                    <option value="وافدون وأفراد">وافدون وأفراد</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">قائد الفريق / المسؤول *</label>
                  <input
                    type="text"
                    required
                    placeholder="الاسم الكامل"
                    value={newPermitData.applicantLeaderName}
                    onChange={(e) => setNewPermitData({ ...newPermitData, applicantLeaderName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الجواز</label>
                  <input
                    type="text"
                    placeholder="رقم جواز السفر"
                    value={newPermitData.leaderPassport}
                    onChange={(e) => setNewPermitData({ ...newPermitData, leaderPassport: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الجنسية</label>
                  <input
                    type="text"
                    placeholder="الجنسية"
                    value={newPermitData.leaderNationality}
                    onChange={(e) => setNewPermitData({ ...newPermitData, leaderNationality: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">خط السير المعتمد ونقاط التفتيش</label>
                <input
                  type="text"
                  placeholder="مثال: طريق عدن - العند - الضالع - قعطبة"
                  value={newPermitData.approvedRoute}
                  onChange={(e) => setNewPermitData({ ...newPermitData, approvedRoute: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المحافظات المشمولة</label>
                  <input
                    type="text"
                    placeholder="عدن، لحج، تعز"
                    value={newPermitData.destinationGovernorates}
                    onChange={(e) => setNewPermitData({ ...newPermitData, destinationGovernorates: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    value={newPermitData.startDate}
                    onChange={(e) => setNewPermitData({ ...newPermitData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المدة المصرح بها (أيام)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newPermitData.validDays}
                    onChange={(e) => setNewPermitData({ ...newPermitData, validDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Sub-form: Add Companions */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">إضافة مرافقين ({companionsList.length})</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اسم المرافق"
                    value={tempComp.name}
                    onChange={(e) => setTempComp({ ...tempComp, name: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="رقم الهوية/الجواز"
                    value={tempComp.passportOrId}
                    onChange={(e) => setTempComp({ ...tempComp, passportOrId: e.target.value })}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompanion}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold"
                  >
                    + إضافة
                  </button>
                </div>
                {companionsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {companionsList.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[11px] font-bold">
                        {c.name} ({c.passportOrId})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub-form: Add Vehicles */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">إضافة مركبات وقوافل ({vehiclesList.length})</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="نوع السيارة واللون"
                    value={tempVeh.modelAndColor}
                    onChange={(e) => setTempVeh({ ...tempVeh, modelAndColor: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="رقم اللوحة"
                    value={tempVeh.plateNumber}
                    onChange={(e) => setTempVeh({ ...tempVeh, plateNumber: e.target.value })}
                    className="w-28 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="اسم السائق"
                    value={tempVeh.driverName}
                    onChange={(e) => setTempVeh({ ...tempVeh, driverName: e.target.value })}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddVehicle}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold"
                  >
                    + إضافة
                  </button>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-900/20"
                >
                  اعتماد وإصدار التصريح
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Smart Import Modal for Movement Permits */}
      <SmartAIImportModal
        isOpen={showAIImportModal}
        onClose={() => setShowAIImportModal(false)}
        targetType="movement-permits"
        onSuccess={() => {
          onRefresh();
        }}
        userOfficerName={user?.name}
      />
    </div>
  );
}
