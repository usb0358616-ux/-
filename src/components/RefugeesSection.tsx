import React, { useState } from 'react';
import { 
  Users, 
  Fingerprint, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  HeartPulse, 
  Home, 
  UserCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import type { RefugeeRecord, User, FieldDefinition } from '../types';

interface RefugeesSectionProps {
  refugees: RefugeeRecord[];
  user: User | null;
  onRefresh: () => void;
}

export default function RefugeesSection({
  refugees,
  user,
  onRefresh
}: RefugeesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [natFilter, setNatFilter] = useState<string>('all');
  const [selectedRefugee, setSelectedRefugee] = useState<RefugeeRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  // Dynamic Custom Fields (EAV) - Developer Module
  const [customFields, setCustomFields] = useState<FieldDefinition[]>([]);
  const [customValuesMap, setCustomValuesMap] = useState<Record<string, Record<string, string>>>({});
  const [formCustomValues, setFormCustomValues] = useState<Record<string, string>>({});
  const [dropdownOptionsMap, setDropdownOptionsMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadCustomMetadata();
  }, []);

  const loadCustomMetadata = async () => {
    try {
      const res = await fetch('/api/field-definitions?entity=refugee');
      const fields: FieldDefinition[] = await res.json();
      setCustomFields(fields.filter(f => !f.is_system && f.is_visible));

      // load dropdown options
      const listsRes = await fetch('/api/list-values');
      const lVals: any[] = await listsRes.json();
      const map: Record<string, string[]> = {};
      lVals.forEach(v => {
        if (!map[v.list_code]) map[v.list_code] = [];
        map[v.list_code].push(v.value_ar);
      });
      setDropdownOptionsMap(map);

      // load existing values for all refugees
      const allValsRes = await fetch('/api/developer/metadata/all');
      const allData = await allValsRes.json();
      if (allData.customFieldValues) {
        const valMap: Record<string, Record<string, string>> = {};
        allData.customFieldValues.forEach((item: any) => {
          if (item.entity_type === 'refugee') {
            if (!valMap[String(item.entity_id)]) valMap[String(item.entity_id)] = {};
            valMap[String(item.entity_id)][item.field_key] = item.value_text || '';
          }
        });
        setCustomValuesMap(valMap);
      }
    } catch (err) {
      console.error('Failed to load custom fields in refugees', err);
    }
  };

  const [formData, setFormData] = useState<Partial<RefugeeRecord>>({
    fullName: '',
    motherName: '',
    nationality: 'صومالي',
    gender: 'ذكر',
    birthDate: '1995-01-01',
    maritalStatus: 'أعزب',
    arrivalDate: new Date().toISOString().split('T')[0],
    arrivalPortOrCoast: 'ساحل أحور - أبين',
    currentResidence: 'مخيم خرز للاجئين - لحج',
    sponsorOrEntity: 'المفوضية السامية لشؤون اللاجئين (UNHCR)',
    status: 'طالب لجوء مسجل',
    dependentsCount: 0,
    biometricCollected: true,
    medicalClearance: 'لائق صحياً',
    temporaryPermitExpiry: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    notes: ''
  });

  const filteredRefugees = refugees.filter(ref => {
    const matchesSearch = 
      ref.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.refugeeFileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ref.unhcrCardNumber && ref.unhcrCardNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ref.currentResidence.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;
    const matchesNat = natFilter === 'all' || ref.nationality.includes(natFilter);

    return matchesSearch && matchesStatus && matchesNat;
  });

  const registeredCardsCount = refugees.filter(r => r.status === 'حاصل على بطاقة لاجئ معتمدة').length;
  const voluntaryReturnCount = refugees.filter(r => r.status === 'في انتظار الترحيل والعودة الطوعية').length;
  const biometricCount = refugees.filter(r => r.biometricCollected).length;

  const handleSaveRefugee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) return;

    try {
      const res = await fetch('/api/refugees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const createdRefugee = await res.json();
        // Save any custom field values EAV
        if (Object.keys(formCustomValues).length > 0) {
          await fetch('/api/custom-field-values', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entity_type: 'refugee',
              entity_id: createdRefugee.id,
              values: formCustomValues
            })
          });
        }
        await loadCustomMetadata();
        setShowAddModal(false);
        setFormCustomValues({});
        setFormData({
          fullName: '',
          motherName: '',
          nationality: 'صومالي',
          gender: 'ذكر',
          dependentsCount: 0,
          biometricCollected: true,
          status: 'طالب لجوء مسجل'
        });
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to save refugee record', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sovereign Header Banner */}
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute left-6 -top-10 opacity-10 pointer-events-none">
          <Fingerprint size={280} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black rounded-full">
                الإدارة العامة لشؤون اللاجئين والمهاجرين
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black rounded-full">
                سجل اللاجئين والمهاجرين (المجموعتان 4 و 5)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              منظومة شؤون اللاجئين والمهاجرين
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              الحصر الشامل، التوثيق البايومتري (البصمة العشرية وصورة الوجه)، متابعة مخيمات ومراكز الإيواء، وإصدار بطاقات اللجوء المؤقتة وتنسيق الترحيل والعودة الطوعية مع المفوضية (UNHCR) ومنظمة الهجرة الدولية (IOM).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-900/30 transition flex items-center gap-2"
            >
              <Plus size={16} />
              قيد ملف لجوء جديد
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              <Printer size={16} />
              طباعة الكشف
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">إجمالي الملفات المقيدة</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">{refugees.length}</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-emerald-400 block">بطاقات لجوء معتمدة</span>
            <span className="text-2xl font-black font-mono text-emerald-300 mt-1 block">{registeredCardsCount}</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 block">بانتظار العودة الطوعية</span>
            <span className="text-2xl font-black font-mono text-amber-300 mt-1 block">{voluntaryReturnCount}</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-sky-400 block">تم أخذ البصمة العشرية</span>
            <span className="text-2xl font-black font-mono text-sky-300 mt-1 block">{biometricCount} ({Math.round((biometricCount / (refugees.length || 1)) * 100)}%)</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث برقم الملف، رقم بطاقة UNHCR، الاسم، المخيم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة الحالات</option>
            <option value="حاصل على بطاقة لاجئ معتمدة">حاصل على بطاقة لاجئ معتمدة</option>
            <option value="طالب لجوء مسجل">طالب لجوء مسجل</option>
            <option value="في انتظار الترحيل والعودة الطوعية">في انتظار الترحيل والعودة الطوعية</option>
            <option value="طلب مرفوض">طلب مرفوض</option>
          </select>

          <select
            value={natFilter}
            onChange={(e) => setNatFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة الجنسيات</option>
            <option value="صومالي">صومالي</option>
            <option value="إثيوبي">إثيوبي</option>
            <option value="إريتري">إريتري</option>
            <option value="سوري">سوري</option>
            <option value="سوداني">سوداني</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
              <tr>
                <th className="py-4 px-4">رقم الملف</th>
                <th className="py-4 px-4">الاسم الكامل والجنسية</th>
                <th className="py-4 px-4">بطاقة UNHCR</th>
                <th className="py-4 px-4">نقطة وتاريخ الوصول</th>
                <th className="py-4 px-4">المخيم / مكان الإقامة</th>
                <th className="py-4 px-4 text-center">البصمة العشرية</th>
                <th className="py-4 px-4 text-center">الحالة</th>
                <th className="py-4 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRefugees.map((ref) => (
                <tr key={ref.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-mono font-black text-amber-800 whitespace-nowrap">
                    {ref.refugeeFileNumber}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{ref.fullName}</div>
                    <span className="text-[11px] text-slate-500">
                      {ref.nationality} • {ref.gender} ({ref.maritalStatus})
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-700">
                    {ref.unhcrCardNumber || '—'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-800">{ref.arrivalPortOrCoast}</div>
                    <span className="text-[11px] text-slate-400 font-mono">{ref.arrivalDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-slate-800 font-medium">{ref.currentResidence}</span>
                    <span className="block text-[11px] text-slate-400">
                      {ref.dependentsCount > 0 ? `${ref.dependentsCount} مرافقين من العائلة` : 'بدون مرافقين'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    {ref.biometricCollected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] border border-emerald-200">
                        <Fingerprint size={12} /> مكتمل
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full font-bold text-[10px] border border-rose-200">
                        غير مكتمل
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black border ${
                        ref.status === 'حاصل على بطاقة لاجئ معتمدة'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : ref.status === 'طالب لجوء مسجل'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {ref.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedRefugee(ref);
                        setShowCardModal(true);
                      }}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg transition"
                      title="عرض بطاقة التعريف واستمارة اللجوء"
                    >
                      بطاقة التعريف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRefugees.length === 0 && (
          <div className="text-center py-16 p-8">
            <Users size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">لا توجد ملفات لاجئين مطابقة</h3>
            <p className="text-xs text-slate-400 mt-1">تأكد من شروط البحث أو قم بإضافة ملف جديد.</p>
          </div>
        )}
      </div>

      {/* Refugee ID Card Modal */}
      {showCardModal && selectedRefugee && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 no-print">
              <span className="font-bold text-slate-500 text-xs">بطاقة تعريف مؤقتة لطالب اللجوء / اللاجئ</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Printer size={14} /> طباعة
                </button>
                <button onClick={() => setShowCardModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
              </div>
            </div>

            {/* Official Card Container */}
            <div className="border-2 border-amber-900 rounded-2xl p-5 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 text-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-amber-900 pb-3">
                <div className="text-xs text-right">
                  <div className="font-bold">الجمهورية اليمنية</div>
                  <div className="font-bold">مصلحة الهجرة والجوازات والجنسية</div>
                  <div className="font-black text-amber-950 text-[11px]">الإدارة العامة لشؤون اللاجئين</div>
                </div>
                <div className="text-center">
                  <Fingerprint size={32} className="text-amber-900 mx-auto" />
                  <span className="text-[10px] font-black uppercase text-amber-900">REFUGEE IDENTIFICATION</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-24 h-28 bg-slate-100 border border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 text-[10px]">
                  <Users size={28} className="mb-1" />
                  <span>صورة شخصية</span>
                  <span className="text-[8px] text-emerald-600 font-bold mt-1">بصمة موثقة ✓</span>
                </div>

                <div className="flex-1 space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">الاسم الكامل:</span>
                    <span className="font-black text-sm text-slate-900">{selectedRefugee.fullName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">الجنسية:</span>
                      <span className="font-bold text-slate-900">{selectedRefugee.nationality}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">تاريخ الميلاد:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedRefugee.birthDate}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">رقم ملف اللجوء السيادي:</span>
                    <span className="font-mono font-black text-amber-900">{selectedRefugee.refugeeFileNumber}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم بطاقة المفوضية UNHCR:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedRefugee.unhcrCardNumber || 'قيد الإصدار'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">موقع الإقامة / المخيم:</span>
                  <span className="font-bold text-slate-800">{selectedRefugee.currentResidence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">صلاحية البطاقة المؤقتة:</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedRefugee.temporaryPermitExpiry || 'سارية'}</span>
                </div>
              </div>

              {/* Dynamic Custom Fields (EAV) - مثل الطائفة، القبيلة */}
              {customFields.length > 0 && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-purple-900 border-b border-purple-200 pb-1 flex items-center justify-between">
                    <span>البيانات الإضافية والمخصصة (EAV):</span>
                    <span className="text-[10px] text-purple-600 font-mono font-bold">وحدة المطور</span>
                  </div>
                  {customFields.map(cf => {
                    const val = customValuesMap[String(selectedRefugee.id)]?.[cf.field_key] || '—';
                    return (
                      <div key={cf.id} className="flex justify-between items-center text-slate-700">
                        <span className="font-medium text-slate-600">{cf.label_ar}:</span>
                        <span className="font-bold text-purple-950 font-mono">{val}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-amber-900/40 pt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>تمنح هذه الوثيقة حماية مؤقتة بالتنسيق مع UNHCR</span>
                <span className="font-mono">ختم الإدارة العامة لشؤون اللاجئين</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">قيد ملف لاجئ / مهاجر جديد</h3>
                <p className="text-xs text-slate-400">إدخال البيانات الشخصية، نقطة الوصول، والوضع البايومتري</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveRefugee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="الاسم الرباعي واللقب"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم الأم</label>
                  <input
                    type="text"
                    placeholder="اسم والدة صاحب الطلب"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الجنسية *</label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="صومالي">صومالي</option>
                    <option value="إثيوبي">إثيوبي</option>
                    <option value="إريتري">إريتري</option>
                    <option value="سوري">سوري</option>
                    <option value="سوداني">سوداني</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الجنس</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نقطة أو ساحل الوصول</label>
                  <input
                    type="text"
                    placeholder="مثال: ساحل أحور - أبين / ذباب"
                    value={formData.arrivalPortOrCoast}
                    onChange={(e) => setFormData({ ...formData, arrivalPortOrCoast: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المخيم أو السكن الحالي</label>
                  <input
                    type="text"
                    placeholder="مثال: مخيم خرز / البساتين عدن"
                    value={formData.currentResidence}
                    onChange={(e) => setFormData({ ...formData, currentResidence: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم بطاقة UNHCR (إن وجد)</label>
                  <input
                    type="text"
                    placeholder="UNHCR-YEM-..."
                    value={formData.unhcrCardNumber}
                    onChange={(e) => setFormData({ ...formData, unhcrCardNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">عدد المرافقين من العائلة</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dependentsCount}
                    onChange={(e) => setFormData({ ...formData, dependentsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="طالب لجوء مسجل">طالب لجوء مسجل</option>
                    <option value="حاصل على بطاقة لاجئ معتمدة">حاصل على بطاقة لاجئ معتمدة</option>
                    <option value="في انتظار الترحيل والعودة الطوعية">في انتظار الترحيل والعودة الطوعية</option>
                    <option value="طلب مرفوض">طلب مرفوض</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Custom Fields Section in Add Form */}
              {customFields.length > 0 && (
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-3">
                  <span className="font-bold text-purple-900 block text-xs border-b border-purple-200 pb-1 flex items-center justify-between">
                    <span>حقول إضافية مخصصة (EAV):</span>
                    <span className="text-[10px] text-purple-600 font-mono font-normal">تمت إضافتها عبر وحدة المطور</span>
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {customFields.map(cf => {
                      if (cf.field_type === 'dropdown' && cf.list_code) {
                        const opts = dropdownOptionsMap[cf.list_code] || [];
                        return (
                          <div key={cf.id}>
                            <label className="font-bold text-slate-700 block mb-1">
                              {cf.label_ar} {cf.is_required ? '*' : ''}
                            </label>
                            <select
                              required={Boolean(cf.is_required)}
                              value={formCustomValues[cf.field_key] || ''}
                              onChange={e => setFormCustomValues({ ...formCustomValues, [cf.field_key]: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                            >
                              <option value="">-- اختر {cf.label_ar} --</option>
                              {opts.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        );
                      }
                      return (
                        <div key={cf.id}>
                          <label className="font-bold text-slate-700 block mb-1">
                            {cf.label_ar} {cf.is_required ? '*' : ''}
                          </label>
                          <input
                            type={cf.field_type === 'number' ? 'number' : cf.field_type === 'date' ? 'date' : 'text'}
                            required={Boolean(cf.is_required)}
                            value={formCustomValues[cf.field_key] || ''}
                            onChange={e => setFormCustomValues({ ...formCustomValues, [cf.field_key]: e.target.value })}
                            placeholder={cf.help_text || `أدخل ${cf.label_ar}...`}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="bioCheck"
                  checked={formData.biometricCollected}
                  onChange={(e) => setFormData({ ...formData, biometricCollected: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <label htmlFor="bioCheck" className="font-bold text-slate-800 cursor-pointer">
                  تم أخذ البصمات العشرية وصورة الوجه وإدخالها في السجل الأمني الموحد
                </label>
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
                  حفظ وتسجيل الملف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
