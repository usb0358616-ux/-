import React, { useState } from 'react';
import { 
  Anchor, 
  Plane, 
  Truck, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Users, 
  Activity, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Printer, 
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import type { PortRecord, User } from '../types';

interface PortsSectionProps {
  ports: PortRecord[];
  user: User | null;
  onRefresh: () => void;
  onNavigateToSeizures?: (portName: string) => void;
}

export default function PortsSection({
  ports,
  user,
  onRefresh,
  onNavigateToSeizures
}: PortsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'جوي' | 'بحري' | 'بري'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPort, setSelectedPort] = useState<PortRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<PortRecord>>({});

  const filteredPorts = ports.filter(port => {
    const matchesSearch = 
      port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.governorate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.directorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || port.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || port.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate totals
  const totalCapacity = ports.reduce((acc, p) => acc + (p.dailyCapacity || 0), 0);
  const totalEntries = ports.reduce((acc, p) => acc + (p.totalEntriesToday || 0), 0);
  const totalExits = ports.reduce((acc, p) => acc + (p.totalExitsToday || 0), 0);
  const totalSeizures = ports.reduce((acc, p) => acc + (p.seizuresCount || 0), 0);
  const totalAlerts = ports.reduce((acc, p) => acc + (p.securityAlertsCount || 0), 0);

  const handleOpenEdit = (port: PortRecord) => {
    setSelectedPort(port);
    setEditFormData({ ...port });
    setShowEditModal(true);
  };

  const handleSavePort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPort) return;
    try {
      const res = await fetch(`/api/ports/${selectedPort.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        setShowEditModal(false);
        setSelectedPort(null);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to update port', err);
    }
  };

  const getPortTypeIcon = (type: string) => {
    switch (type) {
      case 'جوي':
        return <Plane className="text-sky-500" size={20} />;
      case 'بحري':
        return <Anchor className="text-cyan-600" size={20} />;
      case 'بري':
        return <Truck className="text-amber-600" size={20} />;
      default:
        return <Building2 className="text-slate-600" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sovereign Banner */}
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute left-6 -top-10 opacity-10 pointer-events-none">
          <ShieldCheck size={280} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black rounded-full">
                الجمهورية اليمنية • وزارة الداخلية
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                شبكة المنافذ السيادية الموحدة (13 منفذاً)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              سجل المنافذ والحدود الرسمية
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              المنظومة المركزية لمتابعة حركة القدوم والمغادرة، جاهزية الورديات الأمنية، والربط اللحظي مع قواعد بيانات الرقابة الحدودية ومكافحة التزوير بالمنافذ الجوية والبحرية والبرية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2"
            >
              <Printer size={16} />
              طباعة كشف المنافذ
            </button>
            <button
              onClick={onRefresh}
              className="p-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 rounded-xl transition"
              title="تحديث البيانات"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 block">إجمالي المنافذ</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">{ports.length} منفذاً</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-sky-400 block">الطاقة الاستيعابية</span>
            <span className="text-2xl font-black font-mono text-sky-300 mt-1 block">{totalCapacity.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-emerald-400 block flex items-center gap-1">
              <ArrowDownLeft size={14} /> وصول اليوم
            </span>
            <span className="text-2xl font-black font-mono text-emerald-300 mt-1 block">{totalEntries.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-amber-400 block flex items-center gap-1">
              <ArrowUpRight size={14} /> مغادرة اليوم
            </span>
            <span className="text-2xl font-black font-mono text-amber-300 mt-1 block">{totalExits.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-purple-400 block">الجوازات المضبوطة</span>
            <span className="text-2xl font-black font-mono text-purple-300 mt-1 block">{totalSeizures} جواز</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-rose-400 block">البلاغات الأمنية النشطة</span>
            <span className="text-2xl font-black font-mono text-rose-300 mt-1 block">{totalAlerts} بلاغ</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث بالاسم، الكود، المحافظة، أو مدير المنفذ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        {/* Type Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              الكل ({ports.length})
            </button>
            <button
              onClick={() => setTypeFilter('جوي')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${typeFilter === 'جوي' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Plane size={14} />
              جوية ({ports.filter(p => p.type === 'جوي').length})
            </button>
            <button
              onClick={() => setTypeFilter('بحري')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${typeFilter === 'بحري' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Anchor size={14} />
              بحرية ({ports.filter(p => p.type === 'بحري').length})
            </button>
            <button
              onClick={() => setTypeFilter('بري')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${typeFilter === 'بري' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Truck size={14} />
              برية ({ports.filter(p => p.type === 'بري').length})
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة الحالات</option>
            <option value="يعمل بكفاءة">يعمل بكفاءة</option>
            <option value="تحت التحديث">تحت التحديث</option>
            <option value="قيود تشغيلية">قيود تشغيلية</option>
            <option value="مغلق مؤقتاً">مغلق مؤقتاً</option>
          </select>
        </div>
      </div>

      {/* Ports Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPorts.map((port) => (
          <div
            key={port.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
          >
            {/* Port Card Header */}
            <div className="p-5 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 group-hover:scale-105 transition">
                    {getPortTypeIcon(port.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {port.code}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">{port.type}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-1 line-clamp-1">
                      {port.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans tracking-wide">
                      {port.englishName}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[11px] font-black px-2.5 py-1 rounded-full border whitespace-nowrap ${
                    port.status === 'يعمل بكفاءة'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : port.status === 'تحت التحديث'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : port.status === 'قيود تشغيلية'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {port.status}
                </span>
              </div>
            </div>

            {/* Port Body Details */}
            <div className="p-5 space-y-3.5 text-xs text-slate-600 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  المحافظة / النطاق:
                </span>
                <span className="font-bold text-slate-800">{port.governorate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  مدير جوازات المنفذ:
                </span>
                <span className="font-bold text-slate-800 text-right">{port.directorName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  هاتف العمليات:
                </span>
                <span className="font-mono font-bold text-slate-800 dir-ltr">{port.phone}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  الوردية الحالية:
                </span>
                <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {port.activeShift}
                </span>
              </div>

              {/* Transit Stats Mini Bar */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">دخول اليوم</span>
                  <span className="text-sm font-black font-mono text-emerald-600 block mt-0.5">
                    +{port.totalEntriesToday}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">خروج اليوم</span>
                  <span className="text-sm font-black font-mono text-amber-600 block mt-0.5">
                    -{port.totalExitsToday}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">محاضر ضبط</span>
                  <span className="text-sm font-black font-mono text-purple-600 block mt-0.5">
                    {port.seizuresCount}
                  </span>
                </div>
              </div>

              {port.notes && (
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic line-clamp-2">
                  {port.notes}
                </p>
              )}
            </div>

            {/* Port Card Footer */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${port.connectedToHQ ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-[10px] font-bold text-slate-500">
                  {port.connectedToHQ ? 'متصل بالشبكة المركزية' : 'اتصال غير مستقر'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {onNavigateToSeizures && port.seizuresCount > 0 && (
                  <button
                    onClick={() => onNavigateToSeizures(port.name)}
                    className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold rounded-lg transition"
                    title="استعراض محاضر الضبط الخاصة بهذا المنفذ"
                  >
                    محاضر الضبط ({port.seizuresCount})
                  </button>
                )}
                <button
                  onClick={() => handleOpenEdit(port)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold rounded-lg shadow-xs transition"
                >
                  تعديل / الوردية
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPorts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Building2 size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">لا توجد منافذ مطابقة للبحث</h3>
          <p className="text-xs text-slate-400 mt-1">يرجى تعديل مصطلح البحث أو اختيار فئة تصفية أخرى.</p>
        </div>
      )}

      {/* Edit Port Modal */}
      {showEditModal && selectedPort && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  تعديل بيانات المنفذ: {selectedPort.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">{selectedPort.code}</span>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePort} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">حالة تشغيل المنفذ</label>
                <select
                  value={editFormData.status || 'يعمل بكفاءة'}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="يعمل بكفاءة">يعمل بكفاءة</option>
                  <option value="تحت التحديث">تحت التحديث</option>
                  <option value="قيود تشغيلية">قيود تشغيلية</option>
                  <option value="مغلق مؤقتاً">مغلق مؤقتاً</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الوردية الأمنية النشطة</label>
                <select
                  value={editFormData.activeShift || 'صباحية'}
                  onChange={(e) => setEditFormData({ ...editFormData, activeShift: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="صباحية">صباحية</option>
                  <option value="مسائية">مسائية</option>
                  <option value="ليلية / 24 ساعة">ليلية / 24 ساعة</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">مدير جوازات المنفذ</label>
                <input
                  type="text"
                  value={editFormData.directorName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, directorName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">هاتف العمليات</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 dir-ltr"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الطاقة الاستيعابية اليومية</label>
                  <input
                    type="number"
                    value={editFormData.dailyCapacity || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, dailyCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات تشغيلية</label>
                <textarea
                  rows={3}
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-900/20 transition"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
