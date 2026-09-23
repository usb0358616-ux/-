import React, { useState } from 'react';
import { 
  Search, 
  CreditCard, 
  ShieldAlert, 
  ShieldCheck, 
  Send, 
  FileText, 
  Globe, 
  Building2, 
  ExternalLink,
  Clock,
  ArrowRight
} from 'lucide-react';
import type { PassportRecord, SeizureRecord, SecurityCheckRecord, DeliveryRecord, ResidencyOrImmigrantRecord, Document, User, SecurityClearanceRequest } from '../types';

interface CentralSearchSectionProps {
  user: User;
  onOpenPassport?: (p: PassportRecord) => void;
}

export default function CentralSearchSection({ user, onOpenPassport }: CentralSearchSectionProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    passports: PassportRecord[];
    seizures: SeizureRecord[];
    securityChecks: SecurityCheckRecord[];
    deliveries: DeliveryRecord[];
    residencies: ResidencyOrImmigrantRecord[];
    documents: Document[];
    clearances?: SecurityClearanceRequest[];
  }>({
    passports: [],
    seizures: [],
    securityChecks: [],
    deliveries: [],
    residencies: [],
    documents: [],
    clearances: []
  });
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/central-search?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = 
    results.passports.length + 
    results.seizures.length + 
    results.securityChecks.length + 
    results.deliveries.length + 
    results.residencies.length + 
    results.documents.length +
    (results.clearances?.length || 0);

  return (
    <div className="space-y-6">
      {/* Header & Main Search Box */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
        <div className="max-w-2xl">
          <span className="text-blue-400 text-xs font-black uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            محرك الاستعلام والتقصي المركزي
          </span>
          <h2 className="text-3xl font-black mt-2">البحث المركزي الموحد</h2>
          <p className="text-slate-300 text-sm mt-1">
            ابحث برقم الجواز، اسم الشخص، رقم المحضر، المنفذ، سند التسليم، أو رقم المذكرة عبر كافة أقسام المنظومة
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-3xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="أدخل رقم الجواز، الاسم، رقم المحضر، سند التسليم، أو الكلمة الدلالية..."
            className="w-full pr-14 pl-32 py-4 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 rounded-2xl border border-white/20 focus:outline-none focus:ring-4 focus:ring-blue-500/40 text-base font-semibold backdrop-blur-md transition shadow-2xl"
          />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
          <button
            type="submit"
            disabled={loading}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
          >
            {loading ? 'جارٍ البحث...' : 'بحث مركزي'}
          </button>
        </form>

        {/* Search hints */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="font-bold text-slate-400">عمليات بحث شائعة:</span>
          {['0498112', 'محضر 889', 'منفذ الوديعة', 'وكالة الصقر', 'فحص أمني', 'مطار عدن'].map((hint, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setQuery(hint); }}
              className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg border border-white/10 text-slate-200 transition"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {hasSearched && (
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-bold text-slate-700">
            نتائج البحث عن "{query}": <span className="text-blue-600 font-mono font-black">{totalResults}</span> نتيجة مطابقة
          </span>
        </div>
      )}

      {/* No Results Message */}
      {hasSearched && totalResults === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <Search size={40} className="mx-auto text-slate-300" />
          <h4 className="text-base font-bold text-slate-700">لم يتم العثور على أي نتائج مطابقة</h4>
          <p className="text-xs">تأكد من صحة رقم الجواز أو الاسم وحاول البحث بكلمات أبسط</p>
        </div>
      )}

      {/* Passports Results */}
      {results.passports.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="text-blue-600" size={20} />
              سجل الجوازات ({results.passports.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.passports.map((p) => (
              <div 
                key={p.id}
                onClick={() => onOpenPassport?.(p)}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-700">{p.passportNumber}</span>
                  <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-700">
                    {p.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{p.fullName}</div>
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>{p.nationality}</span>
                  <span className="font-mono">{p.seizureRecordNumber ? `محضر: ${p.seizureRecordNumber}` : p.officeName || 'قيد مباشر'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seizure Records Results */}
      {results.seizures.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-purple-600" size={20} />
              محاضر الضبط بالمنافذ ({results.seizures.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.seizures.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-purple-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-700">محضر: {s.recordNumber}</span>
                  <span className="text-xs text-slate-500 font-mono">{s.seizureDate}</span>
                </div>
                <div className="text-sm font-bold text-slate-800">{s.portName} ({s.portType})</div>
                <div className="text-xs text-slate-600">المخالفة: {s.violationType} • عدد الجوازات: {s.passportCount}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Checks Results */}
      {results.securityChecks.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" size={20} />
              الفحص الأمني والمطابقة ({results.securityChecks.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.securityChecks.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-emerald-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-800">فحص: {c.checkNumber}</span>
                  <span className="text-xs font-bold text-emerald-700">{c.result}</span>
                </div>
                <div className="text-sm font-bold text-slate-800">جواز: {c.passportNumber} • {c.fullName}</div>
                <div className="text-xs text-slate-600">{c.checkDetails}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Results */}
      {results.deliveries.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Send className="text-teal-600" size={20} />
              سندات التسليم ({results.deliveries.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.deliveries.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-teal-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-teal-800">سند: {d.deliveryNumber}</span>
                  <span className="text-xs text-slate-500 font-mono">{d.date}</span>
                </div>
                <div className="text-sm font-bold text-slate-800">
                  المستلم: {d.deliveryType === 'owner' ? d.recipientName : `${d.officeName} (${d.agentName})`}
                </div>
                <div className="text-xs text-slate-600">الجوازات: {d.passportCount} جواز • المنفذ: {d.officer}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Clearances Results */}
      {results.clearances && results.clearances.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={20} />
              الموافقات الأمنية وتتبع المدد (SLA) ({results.clearances.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.clearances.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-900">{c.transactionNumber}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white text-indigo-700 border border-indigo-200">
                    {c.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{c.applicantName}</div>
                <div className="text-xs text-slate-600 font-mono">
                  {c.passportOrIdNumber} ({c.nationality})
                </div>
                <div className="text-xs text-indigo-800 font-semibold">{c.serviceType} • {c.department}</div>
                {c.issuedForms && c.issuedForms.length > 0 && (
                  <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    تم إصدار {c.issuedForms.length} استمارة رسمية
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Archived Documents Results */}
      {results.documents.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileText className="text-slate-700" size={20} />
              المستندات والمذكرات بالأرشيف ({results.documents.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.documents.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800">وثيقة: {doc.number}</span>
                  <span className="text-xs text-slate-500 font-mono">{doc.date}</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{doc.subject}</div>
                <div className="text-xs text-slate-600">من: {doc.sender} إلى: {doc.recipient}</div>
                {doc.extractedContent && (
                  <p className="text-xs text-slate-500 bg-white p-2 rounded border border-slate-100 line-clamp-2">
                    {doc.extractedContent}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
