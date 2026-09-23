import React, { useState } from 'react';
import { 
  Archive, 
  Search, 
  Filter, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  Printer, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  FileSearch, 
  Zap,
  Info
} from 'lucide-react';
import type { Document, User } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ArchiveSectionProps {
  documents: Document[];
  user: User;
  onRefreshDocs: () => Promise<void>;
  onSelectDoc: (doc: Document) => void;
}

export default function ArchiveSection({ 
  documents, 
  user, 
  onRefreshDocs, 
  onSelectDoc 
}: ArchiveSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'صادر' | 'وارد'>('all');
  const [contentFilter, setContentFilter] = useState<'all' | 'has_content' | 'no_content'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [isAutoArchiving, setIsAutoArchiving] = useState(false);
  const [archiveResult, setArchiveResult] = useState<{ count: number; message: string } | null>(null);

  // Filter archived documents
  const archivedDocs = documents.filter(d => d.isArchived);

  // Check how many active documents are older than 6 months and eligible for auto-archive
  const eligibleForAutoArchive = documents.filter(d => {
    if (d.isArchived) return false;
    const docDate = new Date(d.date);
    if (isNaN(docDate.getTime())) return false;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return docDate.getTime() < sixMonthsAgo.getTime();
  });

  const handleRunAutoArchive = async () => {
    setIsAutoArchiving(true);
    setArchiveResult(null);

    try {
      const res = await fetch('/api/documents/auto-archive', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        await onRefreshDocs();
        setArchiveResult({
          count: data.archivedCount,
          message: data.archivedCount > 0 
            ? `تمت أرشفة ${data.archivedCount} مستند قديم تجاوز 6 أشهر ونقلها للأرشيف بنجاح وتسريع النظام!`
            : 'كافة المستندات القديمة (الأقدم من 6 أشهر) مؤرشفة بالفعل مسبقاً، والنظام يعمل بأعلى سرعة.'
        });
      }
    } catch (err) {
      console.error('Failed to run auto-archive', err);
    } finally {
      setIsAutoArchiving(false);
    }
  };

  const handleRestoreDoc = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل تريد استعادة هذه الوثيقة من الأرشيف وإرجاعها إلى السجل النشط؟')) return;

    try {
      const res = await fetch(`/api/documents/${docId}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: false })
      });
      if (res.ok) {
        await onRefreshDocs();
      }
    } catch (err) {
      console.error('Failed to restore document', err);
    }
  };

  // Search & Filter archived documents
  const filteredArchivedDocs = archivedDocs.filter(doc => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      doc.subject.toLowerCase().includes(term) ||
      doc.sender.toLowerCase().includes(term) ||
      doc.recipient.toLowerCase().includes(term) ||
      doc.number.toLowerCase().includes(term) ||
      (doc.extractedContent && doc.extractedContent.toLowerCase().includes(term)) ||
      (doc.notes && doc.notes.toLowerCase().includes(term));

    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesDate = !dateFilter || doc.date === dateFilter || (doc.archivedAt && doc.archivedAt === dateFilter);
    const matchesContent = 
      contentFilter === 'all' ? true :
      contentFilter === 'has_content' ? Boolean(doc.extractedContent && doc.extractedContent.trim().length > 0) :
      !doc.extractedContent || doc.extractedContent.trim().length === 0;

    return matchesSearch && matchesType && matchesDate && matchesContent;
  });

  const docsWithExtractedContentCount = archivedDocs.filter(d => d.extractedContent && d.extractedContent.trim().length > 0).length;

  return (
    <div className="space-y-8">
      {/* Top Banner & Performance Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-bold">
              <Zap size={14} className="text-amber-400" />
              أرشفة تلقائية لرفع كفاءة وسرعة النظام
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              قسم الأرشيف المركزي والمستندات القديمة
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              يتم نقل الوثائق التي تجاوزت 6 أشهر إلى هذا القسم تلقائياً لتقليل حجم المعاملات النشطة في اليوميات والصادر والوارد وتسريع الاستجابة، مع الاحتفاظ بكافة بياناتها وإمكانية استخراج نصوص الملفات والبحث المباشر داخلها.
            </p>
          </div>

          {/* Quick Auto-Archive Action Trigger */}
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">مستندات جاهزة للأرشفة (&gt; 6 أشهر):</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                eligibleForAutoArchive.length > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-300'
              }`}>
                {eligibleForAutoArchive.length} مستند
              </span>
            </div>

            <button
              onClick={handleRunAutoArchive}
              disabled={isAutoArchiving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md transition transform active:scale-95 cursor-pointer"
            >
              <Archive size={18} className={isAutoArchiving ? "animate-spin" : ""} />
              {isAutoArchiving ? 'جاري الفحص والأرشفة...' : 'تشغيل الأرشفة التلقائية الآن'}
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              يفرز المستندات حسب تاريخ التحرير (&gt; 180 يوماً)
            </p>
          </div>
        </div>

        {archiveResult && (
          <div className="mt-6 p-4 bg-blue-950/70 border border-blue-500/40 rounded-xl flex items-center gap-3 text-sm text-blue-200">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <span>{archiveResult.message}</span>
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">إجمالي الوثائق المؤرشفة</p>
            <p className="text-2xl font-black text-slate-800">{archivedDocs.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Archive size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">أرشفة لتجاوز 6 أشهر</p>
            <p className="text-2xl font-black text-amber-600">
              {archivedDocs.filter(d => d.archiveReason?.includes('6 أشهر')).length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">محتويات ونصوص مستخرجة</p>
            <p className="text-2xl font-black text-emerald-600">
              {docsWithExtractedContentCount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">كفاءة وسرعة النظام</p>
            <p className="text-2xl font-black text-blue-600">مثالية (100%)</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Zap size={24} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4 no-print">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[280px]">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              بحث في الأرشيف (رقم القيد، الموضوع، الجهة، أو النصوص المستخرجة داخل الملفات)
            </label>
            <div className="relative">
              <Search className="absolute right-3.5 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="ابحث بأي كلمة أو اسم أو محتوى مستند مؤرشف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div className="w-36">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">النوع</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">الكل</option>
              <option value="وارد">وارد</option>
              <option value="صادر">صادر</option>
            </select>
          </div>

          <div className="w-48">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">حالة محتويات الملف</label>
            <select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">كافة المستندات</option>
              <option value="has_content">نصوص مستخرجة متوفرة</option>
              <option value="no_content">بدون نصوص مستخرجة</option>
            </select>
          </div>

          <div className="w-40">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ المعاملة</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="btn-access !h-10 !bg-slate-800 !text-white text-xs"
          >
            <Printer size={16} />
            طباعة الكشف
          </button>
        </div>
      </div>

      {/* Archived Documents List */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive size={18} className="text-slate-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              سجلات الأرشيف القديم ({filteredArchivedDocs.length} مستند)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            اضغط على أي صف لفتح الوثيقة وعرض "خانة محتويات الملف" واستخراج النصوص
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 text-xs font-bold">
              <tr>
                <th className="px-5 py-3.5">رقم القيد</th>
                <th className="px-5 py-3.5">النوع</th>
                <th className="px-5 py-3.5">الموضوع</th>
                <th className="px-5 py-3.5">الجهة / المعني</th>
                <th className="px-5 py-3.5">تاريخ المعاملة</th>
                <th className="px-5 py-3.5">بيانات الأرشفة</th>
                <th className="px-5 py-3.5">خانة محتويات الملف</th>
                <th className="px-5 py-3.5 text-center no-print">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredArchivedDocs.length > 0 ? (
                filteredArchivedDocs.map((doc) => {
                  const hasContent = Boolean(doc.extractedContent && doc.extractedContent.trim().length > 0);
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => onSelectDoc(doc)}
                      className="hover:bg-blue-50/60 transition cursor-pointer group"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-blue-700">
                        #{doc.number}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                          doc.type === 'صادر' ? "bg-orange-100 text-orange-700" : "bg-teal-100 text-teal-700"
                        )}>
                          {doc.type === 'صادر' ? <ArrowUpRight size={13} /> : <ArrowDownLeft size={13} />}
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800 max-w-xs">
                        <p className="truncate" title={doc.subject}>{doc.subject}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-xs max-w-[180px] truncate">
                        {doc.type === 'وارد' ? doc.sender : doc.recipient}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {doc.date}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 whitespace-nowrap">
                            <Clock size={12} />
                            {doc.archiveReason || 'أرشيف قديم'}
                          </span>
                          {doc.archivedAt && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              مؤرشف في: {doc.archivedAt}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {hasContent ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <Sparkles size={14} className="text-emerald-500 shrink-0" />
                            <span className="truncate max-w-[160px]" title={doc.extractedContent}>
                              تم استخراج النصوص
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                            <FileText size={13} />
                            جاهز للاستخراج
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center no-print" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectDoc(doc)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition text-xs font-bold flex items-center gap-1"
                            title="فتح خانة محتويات الملف واستخراج النصوص"
                          >
                            <FileSearch size={15} />
                            <span className="hidden sm:inline">المحتوى</span>
                          </button>

                          <button
                            onClick={(e) => handleRestoreDoc(doc.id, e)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition text-xs flex items-center gap-1"
                            title="إلغاء الأرشفة واستعادة للسجلات النشطة"
                          >
                            <RotateCcw size={15} />
                            <span className="hidden sm:inline">استعادة</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-slate-400">
                    <Archive size={48} className="mx-auto mb-3 opacity-25" />
                    <p className="font-semibold text-slate-600 mb-1">لا توجد وثائق مؤرشفة تطابق شروط البحث</p>
                    <p className="text-xs text-slate-400">
                      يمكنك تشغيل "الأرشفة التلقائية" أعلاه لنقل المستندات الأقدم من 6 أشهر إلى هنا.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
