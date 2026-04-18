import React, { useState } from 'react';
import { Save, X, PlusCircle, AlertCircle } from 'lucide-react';
import type { Document, DocType } from '../types';

interface DocumentFormProps {
  onSave: (doc: Omit<Document, 'id'>) => void;
  onCancel: () => void;
  initialType?: DocType;
}

export default function DocumentForm({ onSave, onCancel, initialType = 'وارد' }: DocumentFormProps) {
  const [formData, setFormData] = useState<Omit<Document, 'id'>>({
    type: initialType,
    number: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    sender: '',
    recipient: 'فرع مصلحة الجوازات',
    priority: 'عادي',
    status: 'قيد التنفيذ',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-sleek-primary/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-sleek-bg w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col border-2 border-sleek-secondary">
        <div className="ribbon-header p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-sm border border-white/30">
              <PlusCircle className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-none">تسجيل قيد جديد</h2>
              <p className="text-[10px] text-blue-200 mt-1 uppercase tracking-widest">Document Registry Software v1.0</p>
            </div>
          </div>
          <button onClick={onCancel} className="bg-white/10 hover:bg-red-500 p-2 rounded-sm transition-colors group">
            <X size={20} className="text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-[#f0f2f5]">
          <div className="bg-white border border-gray-300 shadow-sm p-6 grid grid-cols-2 gap-x-8 gap-y-4 rounded-sm">
            <div className="col-span-1">
              <label className="label-office">نوع القيد</label>
              <div className="flex gap-1 p-1 bg-gray-100 border border-gray-300 rounded-sm">
                <button
                  type="button"
                  className={`flex-1 py-1 text-xs font-bold rounded-sm transition-all ${formData.type === 'وارد' ? 'bg-blue-600 text-white shadow-inner' : 'text-gray-500 hover:bg-gray-200'}`}
                  onClick={() => setFormData({ ...formData, type: 'وارد' })}
                >
                  وارد (INCOMING)
                </button>
                <button
                  type="button"
                  className={`flex-1 py-1 text-xs font-bold rounded-sm transition-all ${formData.type === 'صادر' ? 'bg-blue-600 text-white shadow-inner' : 'text-gray-500 hover:bg-gray-200'}`}
                  onClick={() => setFormData({ ...formData, type: 'صادر' })}
                >
                  صادر (OUTGOING)
                </button>
              </div>
            </div>

            <div className="col-span-1">
              <label className="label-office">رقم القيد المركزي</label>
              <input
                type="text"
                required
                className="input-office font-mono text-lg"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="0000"
              />
            </div>

            <div className="col-span-1">
              <label className="label-office">تاريخ التسجيل</label>
              <input
                type="date"
                required
                className="input-office"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="col-span-1">
              <label className="label-office">مستوى الأهمية</label>
              <select
                className="input-office appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_10px_center] bg-no-repeat"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="عادي">نطاق عادي</option>
                <option value="عاجل">عاجل (بريد هـام)</option>
                <option value="سري جداً">سري ومكتوم</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="label-office">موضوع المعاملة</label>
              <input
                type="text"
                required
                className="input-office"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="اكتب عنوان الموضوع هنا..."
              />
            </div>

            <div className="col-span-1">
              <label className="label-office">{formData.type === 'وارد' ? 'المصدر (جهة الإرسال)' : 'الوجهة (جهة الاستلام)'}</label>
              <input
                type="text"
                required
                className="input-office"
                value={formData.type === 'وارد' ? formData.sender : formData.recipient}
                onChange={(e) => formData.type === 'وارد' ? setFormData({ ...formData, sender: e.target.value }) : setFormData({ ...formData, recipient: e.target.value })}
                list="contacts"
              />
              <datalist id="contacts">
                <option value="رئاسة الوزراء" />
                <option value="وزارة الداخلية" />
                <option value="جوازات المركز الرئيسي" />
                <option value="فرع صنعاء" />
                <option value="فرع عدن" />
              </datalist>
            </div>

            <div className="col-span-1">
              <label className="label-office">حالة القيد الحالية</label>
              <select
                className="input-office"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="قيد التنفيذ">⏳ قيد الإجراء</option>
                <option value="مكتمل">✅ تم الإنجاز</option>
                <option value="مرفوض">❌ تم الرفض</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="label-office">شرح إضافي / ملاحظات</label>
              <textarea
                className="input-office h-20 resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 btn-office btn-office-blue py-3"
            >
              <Save size={18} />
              حفظ القيد (F2)
            </button>
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                number: '',
                subject: '',
                sender: '',
                notes: ''
              })}
              className="px-6 btn-office btn-office-gray"
            >
              مسح الحقول
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 btn-office bg-red-600 text-white border-red-800 hover:bg-red-700"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
