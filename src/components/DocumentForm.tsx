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
    recipient: 'فرع استخبارات الشرطة',
    priority: 'عادي',
    status: 'قيد التنفيذ',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PlusCircle className="text-blue-400" />
            <h2 className="text-xl font-bold">تسجيل وثيقة جديدة</h2>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6 overflow-y-auto max-h-[80vh]">
          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">نوع الوثيقة</label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${formData.type === 'وارد' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                onClick={() => setFormData({ ...formData, type: 'وارد' })}
              >
                وارد
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-bold rounded-md transition ${formData.type === 'صادر' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
                onClick={() => setFormData({ ...formData, type: 'صادر' })}
              >
                صادر
              </button>
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">رقم القيد</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="مثال: 1234"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">التاريخ</label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">الأولوية</label>
            <select
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            >
              <option value="عادي">عادي</option>
              <option value="عاجل">عاجل</option>
              <option value="سري جداً">سري جداً</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">الموضوع</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="وصف مختصر لموضوع الوثيقة"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">{formData.type === 'وارد' ? 'من (الجهة المرسلة)' : 'إلى (الجهة المستلمة)'}</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.type === 'وارد' ? formData.sender : formData.recipient}
              onChange={(e) => formData.type === 'وارد' ? setFormData({ ...formData, sender: e.target.value }) : setFormData({ ...formData, recipient: e.target.value })}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">الحالة</label>
            <select
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="قيد التنفيذ">قيد التنفيذ</option>
              <option value="مكتمل">مكتمل</option>
              <option value="مرفوض">مرفوض</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات إضافية</label>
            <textarea
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="col-span-2 flex gap-4 mt-4">
            <button
              type="submit"
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Save size={20} />
              حفظ الوثيقة
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <X size={20} />
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
