import React, { useState } from 'react';
import { Search, Filter, FileText, ArrowUpRight, ArrowDownLeft, Trash2, Printer, ChevronLeft, ChevronRight, FileSearch } from 'lucide-react';
import type { Document, User } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DocumentListProps {
  documents: Document[];
  user: User;
  onDelete: (id: string) => void;
  onSelect: (doc: Document) => void;
}

export default function DocumentList({ documents, user, onDelete, onSelect }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'صادر' | 'وارد'>('all');
  const [dateFilter, setDateFilter] = useState('');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesDate = !dateFilter || doc.date === dateFilter;

    return matchesSearch && matchesType && matchesDate;
  });

  const exportToCSV = () => {
    const headers = ['رقم القيد', 'النوع', 'الموضوع', 'الجهة', 'التاريخ', 'الأولوية', 'الحالة'];
    const rows = filteredDocs.map(doc => [
      doc.number,
      doc.type,
      doc.subject,
      doc.sender || doc.recipient,
      doc.date,
      doc.priority,
      doc.status
    ]);

    const csvContent = [
      '\uFEFF' + headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `archive_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm mb-6 no-print overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-600" />
            <span className="text-xs font-bold text-gray-700">أدوات التصفية والفرز (FILTER TOOLS)</span>
          </div>
          <button 
            onClick={exportToCSV}
            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-sm"
          >
            <FileText size={12} />
            تصدير إلى ملف Excel (CSV)
          </button>
        </div>
        <div className="p-4 flex flex-wrap gap-4 items-end bg-white">
          <div className="flex-1 min-w-[250px]">
            <label className="label-office">البحث السريع</label>
            <div className="relative">
              <Search className="absolute right-3 top-2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="ابحث برقم القيد أو الموضوع..."
                className="input-office pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-40">
            <label className="label-office">فلترة حسب النوع</label>
            <select
              className="input-office"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="all">كل الأنواع</option>
              <option value="صادر">الصادر فقط</option>
              <option value="وارد">الوارد فقط</option>
            </select>
          </div>

          <div className="w-44">
            <label className="label-office">التاريخ المحدد</label>
            <input
              type="date"
              className="input-office"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <button onClick={() => window.print()} className="btn-office btn-office-green min-w-[120px]">
            <Printer size={16} />
            تصدير للطباعة
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#f8f9fa] border-b border-gray-300 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-[11px] font-bold text-gray-600 border-l border-gray-200 uppercase tracking-tight">رقم القيد</th>
                <th className="px-4 py-2 text-[11px] font-bold text-gray-600 border-l border-gray-200 uppercase tracking-tight">التصنيف</th>
                <th className="px-4 py-2 text-[11px] font-bold text-gray-600 border-l border-gray-200 uppercase tracking-tight">موضوع المعاملة</th>
                <th className="px-4 py-2 text-[11px] font-bold text-gray-600 border-l border-gray-200 uppercase tracking-tight">الجهة / المصدر</th>
                <th className="px-4 py-2 text-[11px] font-bold text-gray-600 border-l border-gray-200 uppercase tracking-tight">التاريخ</th>
                <th className="px-4 py-2 text-[11px] font-bold text-gray-600 border-l border-gray-200 uppercase tracking-tight">مستوى الأهمية</th>
                <th className="px-4 py-2 text-[11px] font-bold text-gray-600 border-l border-gray-200 uppercase tracking-tight">الحالة</th>
                <th className="px-4 py-2 text-[11px] font-bold text-gray-600 text-center no-print">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc, idx) => (
                  <tr 
                    key={doc.id} 
                    className={cn(
                      "hover:bg-blue-50 transition-colors cursor-pointer group border-b border-gray-100",
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    )} 
                    onClick={() => onSelect(doc)}
                  >
                    <td className="px-4 py-2 text-sm font-mono font-bold text-blue-900 border-l border-gray-100">{doc.number}</td>
                    <td className="px-4 py-2 border-l border-gray-100">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm border",
                        doc.type === 'صادر' ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {doc.type === 'صادر' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-800 border-l border-gray-100 truncate max-w-xs">{doc.subject}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 border-l border-gray-100 font-medium">{doc.sender || doc.recipient}</td>
                    <td className="px-4 py-2 text-[11px] text-gray-500 font-mono border-l border-gray-100">{doc.date}</td>
                    <td className="px-4 py-2 border-l border-gray-100">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-sm",
                        doc.priority === 'عاجل' ? "bg-red-500 text-white" : 
                        doc.priority === 'سري جداً' ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
                      )}>
                        {doc.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-l border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          doc.status === 'مكتمل' ? "bg-green-500" : 
                          doc.status === 'قيد التنفيذ' ? "bg-blue-500" : "bg-red-500"
                        )}></div>
                        <span className="text-[11px] font-bold text-gray-700">{doc.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 no-print">
                      <div className="flex justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSelect(doc); }} 
                          className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-200 shadow-xs text-blue-600"
                        >
                          <FileText size={14} />
                        </button>
                        {user.role === 'admin' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }} 
                            className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-200 shadow-xs text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-gray-400 bg-white">
                    <FileSearch size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-bold">لا توجد بيانات متاحة لهذا العرض</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex justify-between items-center text-[10px] font-bold text-gray-500">
          <div>إجمالي السجلات المعروضة: {filteredDocs.length} من أصل {documents.length}</div>
          <div className="flex gap-2">
            <button className="hover:text-blue-600"><ChevronRight size={14} /></button>
            <span>صفحة 1 من 1</span>
            <button className="hover:text-blue-600"><ChevronLeft size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
