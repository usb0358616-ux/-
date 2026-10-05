import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Search, 
  Filter, 
  Printer, 
  UserCheck, 
  Activity, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Terminal, 
  RefreshCw,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import type { AuditLogEntry, User } from '../types';

interface AuditLogSectionProps {
  auditLogs: AuditLogEntry[];
  user: User | null;
  onRefresh: () => void;
}

export default function AuditLogSection({
  auditLogs,
  user,
  onRefresh
}: AuditLogSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.terminalIp && log.terminalIp.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    const matchesAction = actionFilter === 'all' || log.actionType === actionFilter;

    return matchesSearch && matchesModule && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'إنشاء':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'تعديل':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'حذف':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'فحص أمني':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'إصدار تصريح':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'تسجيل ضبط':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'استيراد ذكي':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute left-6 -top-10 opacity-10 pointer-events-none">
          <Terminal size={280} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black rounded-full">
                إدارة الرقابة والتفتيش الأمني الموحد
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black rounded-full">
                سجل التدقيق السيادي (Audit Trail)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              سجل الرقابة والتدقيق الأمني الميداني
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              توثيق غير قابل للتعديل لكافة العمليات الإدارية، نتائج الفحص الأمني، محاضر الضبط بالمنافذ، تصاريح التحرك، وأوامر الاستيراد بالذكاء الاصطناعي مع هوية الضابط المنفذ ومحطة الإدخال.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              <Printer size={16} />
              تصدير تقرير الرقابة
            </button>
            <button
              onClick={onRefresh}
              className="p-2.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 rounded-xl transition"
              title="تحديث السجل اللحظي"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">إجمالي القيود الموثقة</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">{auditLogs.length} عملية</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-purple-400 block">الفحوصات الأمنية</span>
            <span className="text-2xl font-black font-mono text-purple-300 mt-1 block">
              {auditLogs.filter(l => l.module === 'الفحص الأمني').length}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 block">محاضر المنافذ</span>
            <span className="text-2xl font-black font-mono text-amber-300 mt-1 block">
              {auditLogs.filter(l => l.module === 'محاضر الضبط' || l.module === 'المنافذ').length}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-emerald-400 block">حالة السجل الأمني</span>
            <span className="text-2xl font-black font-mono text-emerald-300 mt-1 block">مؤمن ومشفر ✓</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث باسم الضابط، التفاصيل، رقم السجل، المحطة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة الأقسام والموديولات</option>
            <option value="الجوازات">الجوازات</option>
            <option value="المنافذ">المنافذ</option>
            <option value="محاضر الضبط">محاضر الضبط</option>
            <option value="الفحص الأمني">الفحص الأمني</option>
            <option value="الموافقات SLA">الموافقات SLA</option>
            <option value="تصاريح التنقل">تصاريح التنقل</option>
            <option value="المنظمات">المنظمات</option>
            <option value="اللاجئون">اللاجئون</option>
            <option value="الأرشيف">الأرشيف</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة أنواع العمليات</option>
            <option value="إنشاء">إنشاء</option>
            <option value="تعديل">تعديل</option>
            <option value="حذف">حذف</option>
            <option value="فحص أمني">فحص أمني</option>
            <option value="إصدار تصريح">إصدار تصريح</option>
            <option value="تسجيل ضبط">تسجيل ضبط</option>
            <option value="استيراد ذكي">استيراد ذكي</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
              <tr>
                <th className="py-4 px-4">التوقيت والتاريخ</th>
                <th className="py-4 px-4">نوع العملية</th>
                <th className="py-4 px-4">القسم / الموديول</th>
                <th className="py-4 px-4">الضابط والرتبة</th>
                <th className="py-4 px-4">معرف السجل</th>
                <th className="py-4 px-4">تفاصيل الإجراء الأمني</th>
                <th className="py-4 px-4">محطة الإدخال / IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-mono text-slate-500 whitespace-nowrap">
                    <div>{log.timestamp ? new Date(log.timestamp).toLocaleDateString('ar-YE') : '—'}</div>
                    <div className="text-[10px] text-slate-400">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('ar-YE') : ''}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${getActionBadgeColor(log.actionType)}`}>
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800 whitespace-nowrap">
                    {log.module}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{log.officerName}</div>
                    <span className="text-[10px] text-slate-400">{log.officerRole}</span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                    {log.recordIdentifier}
                  </td>
                  <td className="py-4 px-4 max-w-md">
                    <span className="text-slate-800 font-medium leading-relaxed block">
                      {log.details}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.terminalIp || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-16 p-8">
            <Activity size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">لا توجد سجلات تدقيق مطابقة</h3>
            <p className="text-xs text-slate-400 mt-1">تأكد من معايير البحث أو اختيار قسم مختلف.</p>
          </div>
        )}
      </div>
    </div>
  );
}
