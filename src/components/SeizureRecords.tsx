import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  Plus, 
  Printer, 
  X, 
  MapPin, 
  UserCheck, 
  Calendar, 
  AlertOctagon, 
  Layers, 
  ShieldAlert,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import type { SeizureRecord, User } from '../types';
import SmartAIImportModal from './SmartAIImportModal';

interface SeizureRecordsProps {
  seizures: SeizureRecord[];
  user: User;
  onRefresh: () => void;
}

export default function SeizureRecords({ seizures, user, onRefresh }: SeizureRecordsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeizure, setSelectedSeizure] = useState<SeizureRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIImportModal, setShowAIImportModal] = useState(false);

  const [formData, setFormData] = useState({
    recordNumber: '',
    seizureDate: new Date().toISOString().split('T')[0],
    seizureTime: '10:00 صباحاً',
    portName: 'منفذ الوديعة البري الحدودي',
    portType: 'بري' as const,
    officerName: '',
    officerRank: 'رائد',
    authority: 'إدارة جوازات المنفذ',
    passportCount: 1,
    passportNumbersText: '',
    violationType: 'اشتباه تلاعب وتزوير',
    violationDescription: '',
    sourceOfSeizure: 'كبينة تفتيش وتدقيق الجوازات',
    arrivalDate: new Date().toISOString().split('T')[0],
    receivedBy: user.name,
    status: 'قيد التدقيق' as const,
    notes: ''
  });

  const filteredSeizures = seizures.filter(s => 
    s.recordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.portName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.violationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.passportNumbers && s.passportNumbers.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Split passport numbers by commas or spaces or newlines
      const pNumbers = formData.passportNumbersText
        .split(/[\s,،\n]+/)
        .map(p => p.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        passportCount: pNumbers.length || Number(formData.passportCount),
        passportNumbers: pNumbers
      };

      const res = await fetch('/api/seizures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          recordNumber: '',
          seizureDate: new Date().toISOString().split('T')[0],
          seizureTime: '10:00 صباحاً',
          portName: 'منفذ الوديعة البري الحدودي',
          portType: 'بري',
          officerName: '',
          officerRank: 'رائد',
          authority: 'إدارة جوازات المنفذ',
          passportCount: 1,
          passportNumbersText: '',
          violationType: 'اشتباه تلاعب وتزوير',
          violationDescription: '',
          sourceOfSeizure: 'كبينة تفتيش وتدقيق الجوازات',
          arrivalDate: new Date().toISOString().split('T')[0],
          receivedBy: user.name,
          status: 'قيد التدقيق',
          notes: ''
        });
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل حفظ محضر الضبط');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ محضر الضبط');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-purple-600" size={28} />
            محاضر الضبط في المنافذ والنقاط الأمنية
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            سجل توثيق محاضر الضبط الواردة من المنافذ (البرية، البحرية، والجوية) مع ربط الجوازات المضبوطة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowAIImportModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-slate-900 hover:from-purple-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-md shadow-purple-900/20 transition transform active:scale-95 cursor-pointer"
          >
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
            <span>استيراد ذكي (Excel / PDF / صورة)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-900/20 transition transform active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            قيد محضر جديد
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">إجمالي محاضر الضبط</span>
          <span className="text-2xl font-black font-mono text-purple-700 mt-2 block">{seizures.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">إجمالي الجوازات المضبوطة</span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-2 block">
            {seizures.reduce((acc, s) => acc + (s.passportCount || (s.passportNumbers?.length || 0)), 0)}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">محاضر قيد التدقيق والفحص</span>
          <span className="text-2xl font-black font-mono text-amber-600 mt-2 block">
            {seizures.filter(s => s.status === 'قيد التدقيق').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">محالة للنيابة والقضاء</span>
          <span className="text-2xl font-black font-mono text-rose-600 mt-2 block">
            {seizures.filter(s => s.status === 'محال للنيابة').length}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="البحث برقم المحضر، المنفذ، الضابط، نوع المخالفة، أو رقم جواز مضبوط..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 shadow-xs"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold">
                <th className="py-3.5 px-4">رقم المحضر</th>
                <th className="py-3.5 px-4">المنفذ / النقطة</th>
                <th className="py-3.5 px-4">تاريخ الضبط</th>
                <th className="py-3.5 px-4">الضابط والرتبة</th>
                <th className="py-3.5 px-4">عدد الجوازات</th>
                <th className="py-3.5 px-4">نوع المخالفة</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSeizures.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    لا توجد محاضر ضبط مسجلة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredSeizures.map((s) => (
                  <tr 
                    key={s.id}
                    onClick={() => setSelectedSeizure(s)}
                    className="hover:bg-purple-50/40 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                      {s.recordNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin size={14} className="text-purple-500" />
                      {s.portName}
                      <span className="text-[11px] font-normal text-slate-500">({s.portType})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                      {s.seizureDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 text-xs">
                      <span className="text-slate-500 font-bold ml-1">{s.officerRank} /</span>
                      {s.officerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                        {s.passportCount} جواز
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 text-xs font-semibold max-w-[200px] truncate">
                      {s.violationType}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        s.status === 'مكتمل' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'محال للنيابة' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSeizure(s);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto"
                      >
                        <FileText size={13} />
                        عرض المحضر
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Seizure */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="text-purple-400" size={20} />
                قيد وتوثيق محضر ضبط أمني
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم المحضر الرسمي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 889/و/2026"
                    value={formData.recordNumber}
                    onChange={(e) => setFormData({ ...formData, recordNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المنفذ / النقطة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: منفذ الوديعة، ميناء عدن..."
                    value={formData.portName}
                    onChange={(e) => setFormData({ ...formData, portName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع المنفذ</label>
                  <select
                    value={formData.portType}
                    onChange={(e) => setFormData({ ...formData, portType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold"
                  >
                    <option value="بري">منفذ بري</option>
                    <option value="بحري">ميناء بحري</option>
                    <option value="جوي">مطار جوي</option>
                    <option value="نقطة أمنية">نقطة تفتيش أمنية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الضبط</label>
                  <input
                    type="date"
                    value={formData.seizureDate}
                    onChange={(e) => setFormData({ ...formData, seizureDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الضابط المحرر</label>
                  <input
                    type="text"
                    placeholder="اسم الضابط"
                    value={formData.officerName}
                    onChange={(e) => setFormData({ ...formData, officerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الرتبة العسكرية</label>
                  <select
                    value={formData.officerRank}
                    onChange={(e) => setFormData({ ...formData, officerRank: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold"
                  >
                    <option value="ملازم ثان">ملازم ثان</option>
                    <option value="ملازم أول">ملازم أول</option>
                    <option value="نقيب">نقيب</option>
                    <option value="رائد">رائد</option>
                    <option value="مقدم">مقدم</option>
                    <option value="عقيد">عقيد</option>
                    <option value="عميد">عميد</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    أرقام الجوازات المضبوطة (افصل بينها بفواصل أو مسافات أو أسطر)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="مثال: 0498112, 0319455, 0782341"
                    value={formData.passportNumbersText}
                    onChange={(e) => setFormData({ ...formData, passportNumbersText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                  <p className="text-[11px] text-slate-500 mt-1">
                    سيقوم النظام آلياً بربط هذه الجوازات بهذا المحضر وتحديث خطها الزمني
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع المخالفة</label>
                  <input
                    type="text"
                    placeholder="مثال: اشتباه تزوير تأشيرات، انتهاء صلاحية، كشط أختام..."
                    value={formData.violationType}
                    onChange={(e) => setFormData({ ...formData, violationType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة المحضر</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold"
                  >
                    <option value="قيد التدقيق">قيد التدقيق</option>
                    <option value="مكتمل">مكتمل</option>
                    <option value="محال للنيابة">محال للنيابة</option>
                    <option value="محفوظ في الأرشيف">محفوظ في الأرشيف</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">وصف المخالفة وتفاصيل الضبط</label>
                  <textarea
                    rows={3}
                    placeholder="اكتب تفاصيل وملابسات الضبط..."
                    value={formData.violationDescription}
                    onChange={(e) => setFormData({ ...formData, violationDescription: e.target.value })}
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
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold shadow-md shadow-purple-900/20"
                >
                  قيد وتوثيق المحضر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Seizure Modal / Printable Report */}
      {selectedSeizure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldAlert className="text-purple-400" size={20} />
                  محضر ضبط رسمي رقم: <span className="font-mono text-purple-300">{selectedSeizure.recordNumber}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedSeizure.portName} • تاريخ الضبط: {selectedSeizure.seizureDate}
                </p>
              </div>

              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Printer size={15} />
                  طباعة المحضر
                </button>
                <button
                  onClick={() => setSelectedSeizure(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 print:p-0">
              {/* Header for print */}
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h2 className="text-xl font-black text-slate-900">الجمهورية اليمنية</h2>
                <h3 className="text-base font-bold text-slate-800">وزارة الداخلية - مصلحة الهجرة والجوازات والجنسية</h3>
                <h4 className="text-sm font-semibold text-slate-600">مكتب استخبارات الشرطة - سجل محاضر الضبط بالمنافذ</h4>
                <div className="mt-3 inline-block px-4 py-1 border border-slate-800 font-bold text-sm bg-slate-50">
                  محضر ضبط واستلام جوازات سفر رقم: ({selectedSeizure.recordNumber})
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div><strong>المنفذ / النقطة:</strong> {selectedSeizure.portName} ({selectedSeizure.portType})</div>
                <div><strong>تاريخ الضبط:</strong> {selectedSeizure.seizureDate}</div>
                <div><strong>وقت الضبط:</strong> {selectedSeizure.seizureTime || '—'}</div>
                <div><strong>الضابط المحرر:</strong> {selectedSeizure.officerRank} / {selectedSeizure.officerName}</div>
                <div><strong>الجهة الضابطة:</strong> {selectedSeizure.authority}</div>
                <div><strong>تاريخ وصول المحضر:</strong> {selectedSeizure.arrivalDate}</div>
                <div><strong>الموظف المستلم:</strong> {selectedSeizure.receivedBy}</div>
                <div><strong>حالة المحضر:</strong> {selectedSeizure.status}</div>
                <div><strong>عدد الجوازات:</strong> {selectedSeizure.passportCount}</div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">نوع ووصف المخالفة:</h4>
                <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg text-sm text-red-950 font-medium">
                  <div className="font-bold text-red-800 mb-1">{selectedSeizure.violationType}</div>
                  <p>{selectedSeizure.violationDescription || 'لا يوجد وصف تفصيلي مدون'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">الجوازات المضبوطة المشمولة بالمحضر:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSeizure.passportNumbers && selectedSeizure.passportNumbers.length > 0 ? (
                    selectedSeizure.passportNumbers.map((num, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-900 border border-purple-300 font-mono font-bold text-xs rounded-lg">
                        جواز رقم: {num}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">لم يتم إدراج أرقام محددة</span>
                  )}
                </div>
              </div>

              {selectedSeizure.notes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">ملاحظات:</h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">{selectedSeizure.notes}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-center text-xs">
                <div>
                  <div className="font-bold mb-8">الضابط المحرر للمحضر بالمنفذ</div>
                  <div>الرتبة والاسم: ............................................</div>
                  <div>التوقيع والختم: ............................................</div>
                </div>
                <div>
                  <div className="font-bold mb-8">المستلم بمكتب استخبارات الشرطة</div>
                  <div>الاسم: {selectedSeizure.receivedBy}</div>
                  <div>التوقيع: ............................................</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end no-print">
              <button
                onClick={() => setSelectedSeizure(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة استيراد محاضر الضبط بالذكاء الاصطناعي */}
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
