import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Printer } from 'lucide-react';
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

  const COLORS = ['#3b82f6', '#f97316', '#10b981', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-slate-800">التقارير الإحصائية</h2>
        <button 
          onClick={() => window.print()}
          className="btn-access"
        >
          <Printer size={18} />
          طباعة التقرير العام
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 border-r-4 border-blue-500 pr-3">توزيع الوثائق حسب النوع</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 border-r-4 border-orange-500 pr-3">تحليل حالة المعاملات</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
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

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">ملخص رقمي سريع</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الوثائق', value: documents.length, color: 'text-gray-900', bg: 'bg-gray-50' },
            { label: 'إجمالي الصادر', value: typeData[0].value, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'إجمالي الوارد', value: typeData[1].value, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'مكتملة الصياغة', value: statusData[0].value, color: 'text-green-600', bg: 'bg-green-50' }
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-4 rounded-xl text-center`}>
              <p className="text-xs font-bold text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
