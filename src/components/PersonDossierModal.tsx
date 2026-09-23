import React, { useState } from 'react';
import { 
  X, 
  User, 
  FileText, 
  Paperclip, 
  ShieldCheck, 
  Stamp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Printer, 
  Edit3, 
  Save, 
  Plus, 
  ExternalLink,
  Eye,
  Calendar,
  Phone,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import type { SecurityClearanceRequest, User as UserType, IssuedOfficialForm } from '../types';
import FormGeneratorModal from './FormGeneratorModal';

interface Props {
  clearance: SecurityClearanceRequest;
  user: UserType | null;
  onClose: () => void;
  onRefresh: () => void;
}

export default function PersonDossierModal({
  clearance,
  user,
  onClose,
  onRefresh
}: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'forms' | 'attachments' | 'actions'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [showFormGenerator, setShowFormGenerator] = useState(false);
  const [selectedFormToPreview, setSelectedFormToPreview] = useState<IssuedOfficialForm | null>(null);

  // Editable Form Data
  const [editData, setEditData] = useState({
    applicantName: clearance.applicantName,
    passportOrIdNumber: clearance.passportOrIdNumber,
    nationality: clearance.nationality,
    phone: clearance.phone || '',
    address: clearance.address || '',
    birthDate: clearance.birthDate || '',
    sponsorOrFianceName: clearance.sponsorOrFianceName || '',
    sponsorOrFianceNationality: clearance.sponsorOrFianceNationality || '',
    securityDecisionNotes: clearance.securityDecisionNotes || '',
    status: clearance.status
  });

  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveInfo = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/security-clearances/${clearance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        setIsEditing(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachmentName) return;

    const currentAttachments = clearance.attachments || [];
    const updated = [
      ...currentAttachments,
      {
        name: newAttachmentName,
        url: newAttachmentUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=60',
        size: '1.2 MB',
        type: 'وثيقة رسمية'
      }
    ];

    try {
      const res = await fetch(`/api/security-clearances/${clearance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachments: updated })
      });
      if (res.ok) {
        setNewAttachmentName('');
        setNewAttachmentUrl('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecisionAction = async (status: 'تمت الموافقة' | 'مرفوض' | 'مطلوب إفادة وإيضاح', reason: string) => {
    try {
      const res = await fetch(`/api/security-clearances/${clearance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          securityDecisionNotes: `${clearance.securityDecisionNotes ? clearance.securityDecisionNotes + ' | ' : ''}${reason}`,
          officerInCharge: user?.name || clearance.officerInCharge
        })
      });
      if (res.ok) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const issuedFormsList = clearance.issuedForms || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-l from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
              <User size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {clearance.department}
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">
                  {clearance.transactionNumber}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">
                ملف صاحب المعاملة: {clearance.applicantName}
              </h2>
              <p className="text-xs text-slate-300">
                الخدمة: <span className="text-amber-300 font-bold">{clearance.serviceType}</span> • الوثيقة: {clearance.passportOrIdNumber} ({clearance.nationality})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFormGenerator(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Stamp size={16} />
              إصدار استمارة رسمية
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-5 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'info' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User size={15} />
            البيانات والمعلومات الشخصية
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'forms' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stamp size={15} />
            الاستمارات الصادرة ({issuedFormsList.length})
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'attachments' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Paperclip size={15} />
            المرفقات والوثائق ({clearance.attachments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'actions' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={15} />
            اتخاذ القرار الأمني النهائي
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 text-xs space-y-6">

          {/* TAB 1: Personal Info & Editable Data */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div>
                  <h3 className="font-black text-indigo-950 text-sm">بيانات الشخص والمعاملة</h3>
                  <p className="text-slate-600 mt-0.5">يمكن تعديل البيانات أو تحديثها لحفظها في السجل وتعبئتها آلياً بالاستمارات.</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Edit3 size={14} />
                    تعديل البيانات
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg font-bold hover:bg-slate-100"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSaveInfo}
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-xs flex items-center gap-1"
                    >
                      <Save size={14} />
                      {isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                    </button>
                  </div>
                )}
              </div>

              {/* Data Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم صاحب الطلب الرباعي</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.applicantName}
                      onChange={e => setEditData({ ...editData, applicantName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                    />
                  ) : (
                    <span className="font-bold text-slate-900 text-sm block">{clearance.applicantName}</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الجواز / البطاقة الشخصية</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.passportOrIdNumber}
                      onChange={e => setEditData({ ...editData, passportOrIdNumber: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  ) : (
                    <span className="font-bold font-mono text-indigo-700 text-sm block">{clearance.passportOrIdNumber}</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الجنسية</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.nationality}
                      onChange={e => setEditData({ ...editData, nationality: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  ) : (
                    <span className="font-semibold text-slate-800 block">{clearance.nationality}</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ الميلاد</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.birthDate}
                      onChange={e => setEditData({ ...editData, birthDate: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  ) : (
                    <span className="text-slate-800 block font-mono">{clearance.birthDate || 'غير مسجل'}</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الهاتف للتواصل</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      placeholder="770000000"
                    />
                  ) : (
                    <span className="text-slate-800 block font-mono">{clearance.phone || 'غير مسجل'}</span>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">العنوان / مكان الإقامة</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.address}
                      onChange={e => setEditData({ ...editData, address: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      placeholder="المحافظة - المديرية - الحي"
                    />
                  ) : (
                    <span className="text-slate-800 block">{clearance.address || 'غير مسجل'}</span>
                  )}
                </div>

                {/* For marriage or sponsorship */}
                <div className="md:col-span-2 pt-3 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <HeartHandshake size={15} className="text-indigo-600" />
                    بيانات الطرف الثاني (الزوجة الأجنبية / الزوج / الكفيل إن وجد):
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 block mb-0.5">اسم الطرف الثاني</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.sponsorOrFianceName}
                          onChange={e => setEditData({ ...editData, sponsorOrFianceName: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                          placeholder="الاسم الرباعي"
                        />
                      ) : (
                        <span className="font-bold text-slate-800 block">{clearance.sponsorOrFianceName || 'لا يوجد طرف ثانٍ'}</span>
                      )}
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5">جنسية الطرف الثاني</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.sponsorOrFianceNationality}
                          onChange={e => setEditData({ ...editData, sponsorOrFianceNationality: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                          placeholder="مثلاً: سورية، مصرية..."
                        />
                      ) : (
                        <span className="font-bold text-slate-800 block">{clearance.sponsorOrFianceNationality || '—'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-3 border-t border-slate-100">
                  <label className="font-bold text-slate-700 block mb-1">التقرير الأمني وملاحظات التحري</label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editData.securityDecisionNotes}
                      onChange={e => setEditData({ ...editData, securityDecisionNotes: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      placeholder="نتائج التحري، الفيش الجنائي، سجل الأدلة الجنائية..."
                    />
                  ) : (
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {clearance.securityDecisionNotes || 'لا توجد ملاحظات أمنية مسجلة بعد.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Issued Official Forms */}
          {activeTab === 'forms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-800">الاستمارات والنماذج الرسمية الصادرة لهذا الشخص</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    يمكن معاينة أي استمارة تمت تعبئتها مسبقاً وطباعتها بختم الاستخبارات الرسمي.
                  </p>
                </div>
                <button
                  onClick={() => setShowFormGenerator(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Plus size={15} />
                  إصدار استمارة جديدة
                </button>
              </div>

              {issuedFormsList.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-6">
                  <Stamp className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 font-bold">لم يتم إصدار أي استمارة رسمية لهذا الشخص بعد</p>
                  <p className="text-slate-400 text-[11px] mt-1">
                    اضغط على زر "إصدار استمارة رسمية" لتوليد استمارة تعهد أو موافقة زواج أو تعريف جنسية مع تعبئة البيانات آلياً.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {issuedFormsList.map(form => (
                    <div key={form.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <span className="font-mono text-[10px] text-indigo-600 font-bold block">{form.serialNumber}</span>
                          <h4 className="font-black text-slate-900 text-xs mt-0.5">{form.title}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          صادرة ومعتمدة
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1">
                        <p><span className="text-slate-400">تاريخ الصدور:</span> <span className="font-mono">{form.issueDate}</span></p>
                        <p><span className="text-slate-400">الضابط المصدر:</span> <span className="font-semibold text-slate-800">{form.officerName}</span></p>
                        {form.notes && <p className="text-slate-500 italic">{form.notes}</p>}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedFormToPreview(form)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 rounded-lg font-bold flex items-center gap-1.5 transition"
                        >
                          <Eye size={14} />
                          معاينة الاستمارة وطباعتها
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Attachments */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              {/* Add Attachment Form */}
              <form onSubmit={handleAddAttachment} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="font-bold text-slate-700 block mb-1">اسم الوثيقة أو المرفق</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: صورة عقد الزواج، الفيش الجنائي، صورة الجواز..."
                    value={newAttachmentName}
                    onChange={e => setNewAttachmentName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="font-bold text-slate-700 block mb-1">رابط أو مرجع الوثيقة (اختياري)</label>
                  <input
                    type="text"
                    placeholder="رابط المسح الضوئي أو الملف"
                    value={newAttachmentUrl}
                    onChange={e => setNewAttachmentUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  إرفاق وثيقة
                </button>
              </form>

              {/* Attachments List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(!clearance.attachments || clearance.attachments.length === 0) ? (
                  <div className="col-span-2 text-center py-10 text-slate-400">
                    لا توجد مرفقات ملحقة بهذه المعاملة حتى الآن
                  </div>
                ) : (
                  clearance.attachments.map((att, index) => (
                    <div key={index} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600">
                          <FileText size={18} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">{att.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{att.size || '1.0 MB'}</span>
                        </div>
                      </div>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                      >
                        <ExternalLink size={13} />
                        عرض
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Take Official Decision */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-1">القرار الأمني الرسمي لفرع الاستخبارات</h3>
                <p className="text-slate-600 text-xs">
                  بموجب الفحص والتحري ومطابقة قوائم الممنوعين، يمكنك اعتماد الموافقة الرسمية أو الرفض أو طلب إفادة تكميلية.
                </p>
              </div>

              <div className="space-y-3">
                <label className="font-bold text-slate-700 block">تسبيب القرار والتوصية الأمنية:</label>
                <textarea
                  id="finalDecisionNotes"
                  rows={4}
                  defaultValue={clearance.securityDecisionNotes || ''}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs"
                  placeholder="تم فحص القيود الأمنية وثبتت سلامة الأوراق والمستندات..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => {
                    const notes = (document.getElementById('finalDecisionNotes') as HTMLTextAreaElement)?.value;
                    handleDecisionAction('تمت الموافقة', notes);
                  }}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <CheckCircle2 size={18} />
                  اعتماد الموافقة الأمنية
                </button>
                <button
                  onClick={() => {
                    const notes = (document.getElementById('finalDecisionNotes') as HTMLTextAreaElement)?.value;
                    handleDecisionAction('مرفوض', notes);
                  }}
                  className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <XCircle size={18} />
                  رفض أمني رسمي
                </button>
                <button
                  onClick={() => {
                    const notes = (document.getElementById('finalDecisionNotes') as HTMLTextAreaElement)?.value;
                    handleDecisionAction('مطلوب إفادة وإيضاح', notes);
                  }}
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <AlertCircle size={18} />
                  طلب إفادة وإيضاح
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Form Generator Modal */}
      {showFormGenerator && (
        <FormGeneratorModal
          clearance={clearance}
          user={user}
          onClose={() => setShowFormGenerator(false)}
          onFormSaved={() => {
            setShowFormGenerator(false);
            onRefresh();
          }}
        />
      )}

      {/* Preview Form Modal */}
      {selectedFormToPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 no-print">
              <div>
                <h3 className="font-black text-slate-900 text-base">{selectedFormToPreview.title}</h3>
                <span className="text-xs font-mono text-indigo-700 font-bold">{selectedFormToPreview.serialNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Printer size={15} />
                  طباعة
                </button>
                <button
                  onClick={() => setSelectedFormToPreview(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Body */}
            <div className="space-y-4 font-serif text-xs border border-slate-300 p-6 rounded-xl">
              <div className="text-center border-b pb-4">
                <p className="font-bold">وزارة الداخلية - قطاع الأمن والاستخبارات</p>
                <p className="font-bold">فرع استخبارات مصلحة الهجرة والجوازات والجنسية</p>
                <h2 className="text-lg font-black mt-2 underline">{selectedFormToPreview.title}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans text-xs">
                {Object.entries(selectedFormToPreview.formData).map(([k, val]) => (
                  <div key={k} className="p-2 bg-slate-50 rounded-md border border-slate-200">
                    <span className="font-bold text-slate-500 block text-[10px]">{k}:</span>
                    <span className="font-semibold text-slate-900">{val || '—'}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t grid grid-cols-2 text-center font-sans text-xs">
                <div>
                  <span className="font-bold block mb-4">المقر / صاحب الشأن</span>
                  <span className="font-mono">{selectedFormToPreview.applicantName}</span>
                </div>
                <div>
                  <span className="font-bold block mb-4">اعتماد وضابط الاستخبارات</span>
                  <span className="font-bold text-slate-800">{selectedFormToPreview.officerName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
