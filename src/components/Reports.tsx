import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Printer, BarChart3 } from 'lucide-react';
import type { Document } from '../types';

interface ReportsProps {
  documents: Document[];
}

export default function Reports({ documents }: ReportsProps) {
  const typeData = [
    { name: 'صادر', value: documents.filter(d => d.type === 'صادر').length },
    { name: 'وارد', value: documents.filter(d => d.type === 'وارد').length },
  ];

  const statusData = [
    { name: 'مكتمل', value: documents.filter(d => d.status === 'مكتمل').length },
    { name: 'قيد التنفيذ', value: documents.filter(d => d.status === 'قيد التنفيذ').length },
    { name: 'مرفوض', value: documents.filter(d => d.status === 'مرفوض').length },
  ];

  const COLORS = ['#1a3a5f', '#c5a059', '#27ae60', '#c0392b'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gray-100 p-4 border border-gray-300 rounded-sm flex justify-between items-center no-print shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-sleek-primary p-2 rounded-sm text-white">
            <BarChart3 size={22} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">التقارير الإحصائية والبيانية (ANALYTICS)</h2>
        </div>
        <button 
          onClick={() => window.print()}
          className="btn-office btn-office-blue"
        >
          <Printer size={18} />
          تصدير التقرير النهائي
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-300 shadow-sm p-4 rounded-sm">
          <div className="bg-gray-50 p-2 border-b border-gray-200 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-700 uppercase">مؤشر حجم التداول (Volume Index)</h3>
            <span className="text-[10px] text-gray-400">آخر تحديث: {new Date().toLocaleDateString('ar-YE')}</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" fontSize={12} fontWeight={700} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '2px' }}
                />
                <Bar dataKey="value" fill="#1a3a5f" radius={[2, 2, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-300 shadow-sm p-4 rounded-sm">
          <div className="bg-gray-50 p-2 border-b border-gray-200 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-700 uppercase">حالة الإنجاز الكلية (Status Analysis)</h3>
            <span className="text-[10px] text-gray-400">بيانات تراكمية</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 shadow-sm p-6 rounded-sm">
        <div className="bg-gray-50 p-2 border-b border-gray-200 mb-6 font-bold text-xs text-gray-700 uppercase">الملخص الرقمي السريع (KPIs Summary)</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الحركات', value: documents.length, color: 'text-gray-900', border: 'border-gray-200', bg: 'bg-white' },
            { label: 'سجلات الصادر', value: typeData[0].value, color: 'text-orange-700', border: 'border-orange-100', bg: 'bg-orange-50/50' },
            { label: 'سجلات الوارد', value: typeData[1].value, color: 'text-blue-700', border: 'border-blue-100', bg: 'bg-blue-50/50' },
            { label: 'المعاملات المنجزة', value: statusData[0].value, color: 'text-green-700', border: 'border-green-100', bg: 'bg-green-50/50' }
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} ${stat.border} p-5 border-2 text-center rounded-sm shadow-xs`}>
              <p className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-4xl font-mono font-black ${stat.color}`}>{stat.value.toString().padStart(3, '0')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
