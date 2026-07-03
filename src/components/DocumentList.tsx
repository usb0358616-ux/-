import React, { useState } from 'react';
import { Search, Filter, FileText, ArrowUpRight, ArrowDownLeft, Trash2, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 no-print">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">بحث ذكي (موضوع، مرسل، رقم)</label>
            <div className="relative">
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ابحث هنا..."
                className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-40">
            <label className="block text-sm font-semibold text-gray-700 mb-2">نوع الوثيقة</label>
            <select
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="all">الكل</option>
              <option value="صادر">صادر</option>
              <option value="وارد">وارد</option>
            </select>
          </div>

          <div className="w-48">
            <label className="block text-sm font-semibold text-gray-700 mb-2">تصفية بالتاريخ</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <button onClick={() => window.print()} className="btn-access !h-10">
            <Printer size={18} />
            طباعة الجدول
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">رقم القيد</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">النوع</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">الموضوع</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">المرسل / الجهة</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">التاريخ</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700">الحالة</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-blue-50/50 transition cursor-pointer group" onClick={() => onSelect(doc)}>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">#{doc.number}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                      doc.type === 'صادر' ? "bg-orange-100 text-orange-700" : "bg-teal-100 text-teal-700"
                    )}>
                      {doc.type === 'صادر' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{doc.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.sender}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{doc.date}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      doc.status === 'مكتمل' ? "bg-green-100 text-green-700" : 
                      doc.status === 'قيد التنفيذ' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                    )}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={(e) => { e.stopPropagation(); window.print(); }} 
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded shadow-sm"
                        title="طباعة"
                      >
                        <Printer size={16} />
                      </button>
                      {user.role === 'admin' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }} 
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded shadow-sm"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-20" />
                  <p>لا توجد وثائق تطابق البحث</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
