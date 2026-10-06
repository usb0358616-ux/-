import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Printer, 
  FileText, 
  ShieldAlert, 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileSpreadsheet,
  Building,
  Smartphone
} from 'lucide-react';
import type { Document, SeizureRecord, PassportRecord } from '../types';

interface ReportsProps {
  documents: Document[];
  seizures?: SeizureRecord[];
  passports?: PassportRecord[];
}

export default function Reports({ documents, seizures = [], passports = [] }: ReportsProps) {
  const [reportType, setReportType] = useState<'general' | 'seizures' | 'passports'>('seizures');

  // Documents stats
  const typeData = [
    { name: 'صادر', value: documents.filter(d => d.type === 'صادر').length },
    { name: 'وارد', value: documents.filter(d => d.type === 'وارد').length },
  ];

  const statusData = [
    { name: 'مكتمل', value: documents.filter(d => d.status === 'مكتمل').length },
    { name: 'قيد التنفيذ', value: documents.filter(d => d.status === 'قيد التنفيذ').length },
    { name: 'مرفوض', value: documents.filter(d => d.status === 'مرفوض').length },
  ];

  const COLORS = ['#3b82f6', '#f97316', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Seizure stats
  const totalSeizures = seizures.length;
  const totalPassportsSeized = seizures.reduce((acc, s) => acc + (s.passportCount || (s.passportNumbers?.length || 0)), 0);
  const completedSeizures = seizures.filter(s => s.status === 'مكتمل').length;
  const pendingSeizures = seizures.filter(s => s.status === 'قيد التدقيق').length;

  // Passports stats
  const totalPassports = passports.length;
  const statusCounts: Record<string, number> = {};
  passports.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });
  const passportStatusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const natCounts: Record<string, number> = {};
  passports.forEach(p => {
    const nat = p.nationality || 'غير محدد';
    natCounts[nat] = (natCounts[nat] || 0) + 1;
  });
  const natChartData = Object.entries(natCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            وحدة التقارير وتوليد المستندات الرسمية (PDF)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            توليد كشوفات وتقارير رسمية جاهزة للطباعة مع دعم وحدة iText 7 لتطبيق الأندرويد
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setReportType('seizures')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'seizures' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              محاضر الضبط
            </button>
            <button
              onClick={() => setReportType('passports')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'passports' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              إحصائيات الجوازات
            </button>
            <button
              onClick={() => setReportType('general')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'general' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المعاملات العامة
            </button>
          </div>

          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Printer size={16} />
            طباعة التقرير (PDF)
          </button>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 1. تقرير محاضر الضبط بالمنافذ                          */}
      {/* ======================================================= */}
      {reportType === 'seizures' && (
        <div className="space-y-6">
          {/* Printable Official Document Container */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm printable">
            {/* Header for Print */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 flex justify-between items-center text-slate-900">
              <div className="text-right text-xs leading-relaxed font-bold">
                <p className="text-sm font-black">الجمهورية اليمنية</p>
                <p>وزارة الداخلية</p>
                <p>مصلحة الهجرة والجوازات والجنسية</p>
                <p>قطاع استخبارات الشرطة والمنافذ</p>
              </div>
              <div className="text-center">
                <h1 className="text-lg font-black text-slate-900">تقرير محاضر الضبط الأمني بالمنافذ السيادية</h1>
                <p className="text-xs text-slate-500 font-mono mt-1">كشف حجز الجوازات والوثائق المخالفة</p>
              </div>
              <div className="text-left text-xs text-slate-600 font-mono">
                <p>التاريخ: {new Date().toLocaleDateString('ar-YE')}</p>
                <p>الرقم: SEZ-REP-{new Date().getFullYear()}</p>
                <p className="text-red-600 font-bold">سري وهام</p>
              </div>
            </div>

            {/* KPI Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-xs text-slate-500 font-bold block">إجمالي محاضر الضبط</span>
                <span className="text-2xl font-black font-mono text-purple-700">{totalSeizures}</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-xs text-slate-500 font-bold block">إجمالي الجوازات المضبوطة</span>
                <span className="text-2xl font-black font-mono text-slate-900">{totalPassportsSeized}</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-xs text-slate-500 font-bold block">محاضر مكتملة ومحالة</span>
                <span className="text-2xl font-black font-mono text-emerald-600">{completedSeizures}</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-xs text-slate-500 font-bold block">محاضر قيد التدقيق والفحص</span>
                <span className="text-2xl font-black font-mono text-amber-600">{pendingSeizures}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="py-3 px-3">م</th>
                    <th className="py-3 px-3">رقم المحضر</th>
                    <th className="py-3 px-3">المنفذ السيادي</th>
                    <th className="py-3 px-3">تاريخ الضبط</th>
                    <th className="py-3 px-3">الضابط المسؤول</th>
                    <th className="py-3 px-3">عدد الجوازات</th>
                    <th className="py-3 px-3">نوع المخالفة والسبب</th>
                    <th className="py-3 px-3">الحالة الإجرائية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {seizures.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">لا توجد محاضر مسجلة حالياً</td>
                    </tr>
                  ) : (
                    seizures.map((s, idx) => (
                      <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-purple-700">{s.recordNumber}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{s.portName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{s.seizureDate}</td>
                        <td className="py-2.5 px-3 text-slate-700">{s.officerRank} / {s.officerName}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-center">{s.passportCount}</td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate">{s.violationType}</td>
                        <td className="py-2.5 px-3 font-bold">{s.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-6 border-t border-slate-200 text-center text-xs">
              <div>
                <p className="font-bold text-slate-700">المحرر والضابط المسؤول</p>
                <p className="mt-8 text-slate-400">التوقيع: .....................................</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">يعتمد / مدير قطاع استخبارات الشرطة والمنافذ</p>
                <p className="mt-8 text-slate-400">[ الختم الرسمي السيادي ]</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 2. تقرير إحصائيات الجوازات والمتابعة                   */}
      {/* ======================================================= */}
      {reportType === 'passports' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm printable">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 flex justify-between items-center text-slate-900">
              <div className="text-right text-xs leading-relaxed font-bold">
                <p className="text-sm font-black">الجمهورية اليمنية</p>
                <p>وزارة الداخلية</p>
                <p>قطاع استخبارات الشرطة - فرع الجوازات</p>
              </div>
              <div className="text-center">
                <h1 className="text-lg font-black text-slate-900">تقرير إحصائيات وتصنيف الجوازات والوثائق</h1>
                <p className="text-xs text-slate-500 font-mono mt-1">بيانات الحالات الإجرائية والجنسيات والتوزيع الجغرافي</p>
              </div>
              <div className="text-left text-xs text-slate-600 font-mono">
                <p>التاريخ: {new Date().toLocaleDateString('ar-YE')}</p>
                <p>إجمالي الجوازات: {totalPassports}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 no-print">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-xs text-slate-800 mb-4 border-r-4 border-blue-600 pr-2">توزيع الجوازات حسب الحالة</h4>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={passportStatusChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {passportStatusChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-xs text-slate-800 mb-4 border-r-4 border-emerald-600 pr-2">توزيع الجوازات حسب الجنسية</h4>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={natChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Summary Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-2">جدول الحالات الإجرائية</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="p-2.5">الحالة</th>
                        <th className="p-2.5 text-center">العدد</th>
                        <th className="p-2.5 text-center">النسبة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {passportStatusChartData.map(item => (
                        <tr key={item.name}>
                          <td className="p-2.5 font-bold text-slate-700">{item.name}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-blue-700">{item.value}</td>
                          <td className="p-2.5 text-center font-mono text-slate-500">
                            {totalPassports > 0 ? `${((item.value / totalPassports) * 100).toFixed(1)}%` : '0%'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-2">جدول توزيع الجنسيات</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="p-2.5">الجنسية</th>
                        <th className="p-2.5 text-center">العدد</th>
                        <th className="p-2.5 text-center">النسبة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {natChartData.map(item => (
                        <tr key={item.name}>
                          <td className="p-2.5 font-bold text-slate-700">{item.name}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-emerald-700">{item.value}</td>
                          <td className="p-2.5 text-center font-mono text-slate-500">
                            {totalPassports > 0 ? `${((item.value / totalPassports) * 100).toFixed(1)}%` : '0%'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Official Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-6 border-t border-slate-200 text-center text-xs">
              <div>
                <p className="font-bold text-slate-700">المحرر / رئيس قسم الإحصاء</p>
                <p className="mt-8 text-slate-400">التوقيع: .....................................</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">يعتمد / مدير الإدارة العامة للمعلومات</p>
                <p className="mt-8 text-slate-400">[ الختم الرسمي السيادي ]</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 3. التقرير العام للمعاملات                              */}
      {/* ======================================================= */}
      {reportType === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-6 border-r-4 border-blue-500 pr-3">توزيع المعاملات حسب النوع</h3>
            <div className="h-[280px]">
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

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-6 border-r-4 border-orange-500 pr-3">تحليل حالة المعاملات</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
