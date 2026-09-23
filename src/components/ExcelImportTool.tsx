import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  ArrowRight,
  Database,
  RefreshCw,
  Eye,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { PassportRecord, User } from '../types';

interface ExcelImportToolProps {
  passports: PassportRecord[];
  user: User;
  onRefresh: () => void;
}

interface ParsedRow {
  passportNumber: string;
  fullName: string;
  nationality: string;
  officeName: string;
  status: string;
  notes: string;
  sourceFile: string;
  isDuplicate: boolean;
  raw: Record<string, any>;
}

export default function ExcelImportTool({ passports, user, onRefresh }: ExcelImportToolProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-column detection helpers
  const findColumnValue = (row: Record<string, any>, candidates: string[]): string => {
    const keys = Object.keys(row);
    for (const cand of candidates) {
      const matchedKey = keys.find(k => k.trim().toLowerCase().includes(cand.toLowerCase()));
      if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
        return String(row[matchedKey]).trim();
      }
    }
    return '';
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    const fileList: File[] = Array.from(selected);
    setFiles(prev => [...prev, ...fileList]);
    setIsProcessing(true);
    setImportSuccess(null);

    const existingPassportNumbers = new Set(passports.map(p => p.passportNumber.trim().toLowerCase()));
    const accumulated: ParsedRow[] = [];

    for (const file of fileList) {
      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[];

          json.forEach(row => {
            const pNum = findColumnValue(row, ['جواز', 'رقم الجواز', 'passport', 'pass_no', 'رقم_الجواز', 'الرقم']);
            const name = findColumnValue(row, ['اسم', 'الاسم', 'صاحب الجواز', 'name', 'full_name', 'الاسم الرباعي']);
            const nat = findColumnValue(row, ['جنسية', 'الجنسية', 'nationality']) || 'يمني';
            const office = findColumnValue(row, ['مكتب', 'المكتب', 'الوكالة', 'وكالة', 'جهة', 'office', 'agency']);
            const status = findColumnValue(row, ['حالة', 'الحالة', 'status']) || 'مسجل';
            const notes = findColumnValue(row, ['ملاحظات', 'ملاحظة', 'notes', 'بيان']);

            if (pNum || name) {
              const isDup = pNum ? existingPassportNumbers.has(pNum.toLowerCase()) : false;
              accumulated.push({
                passportNumber: pNum || '—',
                fullName: name || 'بدون اسم مدون',
                nationality: nat,
                officeName: office,
                status: status || 'مسجل',
                notes,
                sourceFile: `${file.name} (${sheetName})`,
                isDuplicate: isDup,
                raw: row
              });
            }
          });
        });
      } catch (err) {
        console.error('Error reading excel file:', err);
      }
    }

    setParsedRows(prev => [...prev, ...accumulated]);
    setIsProcessing(false);
  };

  const handleClear = () => {
    setFiles([]);
    setParsedRows([]);
    setImportSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBulkImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch('/api/passports/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: parsedRows,
          sourceFileName: files.map(f => f.name).join(', ')
        })
      });

      const data = await res.json();
      if (res.ok) {
        setImportSuccess(`تم استيراد ${data.addedCount} جواز سفر جديد بنجاح، وتحديث ${data.duplicateCount} جواز مكرر مع توثيق الخط الزمني.`);
        onRefresh();
      } else {
        alert(data.error || 'فشل الاستيراد');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setImporting(false);
    }
  };

  // Export cleaned & merged rows to standard UTF-8 CSV or XLSX
  const handleExportStandardExcel = () => {
    if (parsedRows.length === 0) return;
    const cleanData = parsedRows.map((r, i) => ({
      'م': i + 1,
      'رقم الجواز': r.passportNumber,
      'الاسم الكامل': r.fullName,
      'الجنسية': r.nationality,
      'المكتب / الوكالة': r.officeName || '—',
      'الحالة': r.status,
      'مصدر الملف': r.sourceFile,
      'ملاحظات': r.notes
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الجوازات_الموحدة');
    XLSX.writeFile(wb, `كشف_جوازات_موحد_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filtered = parsedRows.filter(r => 
    r.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.officeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sourceFile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const newRecordsCount = parsedRows.filter(r => !r.isDuplicate).length;
  const duplicateRecordsCount = parsedRows.filter(r => r.isDuplicate).length;
  const uniqueOffices = new Set(parsedRows.map(r => r.officeName).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <FileSpreadsheet className="text-emerald-600" size={28} />
            أداة معالجة واستيراد كشوفات Excel المركزية
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            دمج وتوحيد كشوفات الجوازات والمكاتب، كشف التكرارات تلقائياً، واستيراد آلاف السجلات بنقرة واحدة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx, .xls, .csv"
            onChange={handleFilesSelected}
            className="hidden"
            id="excel-file-input"
          />
          <label
            htmlFor="excel-file-input"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-900/20 transition cursor-pointer"
          >
            <Upload size={18} />
            اختيار ملفات Excel للكشف
          </label>
        </div>
      </div>

      {/* Upload Dropzone if no files */}
      {parsedRows.length === 0 && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-12 text-center cursor-pointer transition bg-emerald-50/20"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">اسحب وأفلت كشوفات Excel هنا أو انقر للاختيار</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            يدعم ملفات (.xlsx, .xls, .csv) المتعددة. يتعرف النظام آلياً على أعمدة (رقم الجواز، الاسم، المكتب، الحالة) ويقوم بمطابقتها مع قاعدة بيانات النظام.
          </p>
        </div>
      )}

      {/* Success Notification */}
      {importSuccess && (
        <div className="p-4 bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-300 flex items-center gap-3 font-bold text-sm">
          <CheckCircle2 className="text-emerald-700 flex-shrink-0" size={22} />
          <span>{importSuccess}</span>
        </div>
      )}

      {/* Stats Cards */}
      {parsedRows.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block">إجمالي السجلات المقروءة</span>
            <span className="text-2xl font-black font-mono text-slate-900 mt-2 block">{parsedRows.length}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block">سجلات جديدة (جاهزة للقيد)</span>
            <span className="text-2xl font-black font-mono text-emerald-600 mt-2 block">{newRecordsCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block">مطابقات وتكرارات مسجلة مسبقاً</span>
            <span className="text-2xl font-black font-mono text-amber-600 mt-2 block">{duplicateRecordsCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block">وكالات ومكاتب مكتشفة</span>
            <span className="text-2xl font-black font-mono text-blue-600 mt-2 block">{uniqueOffices}</span>
          </div>
        </div>
      )}

      {/* Table Preview and Actions */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-4 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="بحث في البيانات المعاينة..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={handleExportStandardExcel}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
              >
                <Download size={14} />
                تصدير كشف موحد
              </button>

              <button
                onClick={handleClear}
                className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
              >
                <Trash2 size={14} />
                مسح المعاينة
              </button>

              <button
                onClick={handleBulkImport}
                disabled={importing}
                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-sm"
              >
                {importing ? <RefreshCw className="animate-spin" size={14} /> : <Database size={14} />}
                استيراد إلى قاعدة بيانات الجوازات ({parsedRows.length})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">م</th>
                  <th className="py-2.5 px-3">رقم الجواز</th>
                  <th className="py-2.5 px-3">اسم صاحب الجواز</th>
                  <th className="py-2.5 px-3">الجنسية</th>
                  <th className="py-2.5 px-3">المكتب / الوكالة</th>
                  <th className="py-2.5 px-3">الحالة المقترحة</th>
                  <th className="py-2.5 px-3">فحص التكرار</th>
                  <th className="py-2.5 px-3">الملف المصدر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-400">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{row.passportNumber}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{row.fullName}</td>
                    <td className="py-2 px-3 text-slate-600">{row.nationality}</td>
                    <td className="py-2 px-3 text-slate-700">{row.officeName || '—'}</td>
                    <td className="py-2 px-3">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {row.isDuplicate ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-[11px] flex items-center gap-1 w-fit">
                          <AlertTriangle size={11} />
                          مسجل سابقاً
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[11px] flex items-center gap-1 w-fit">
                          <CheckCircle2 size={11} />
                          جديد
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[10px] truncate max-w-[150px]">{row.sourceFile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div>
              عرض {(page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, filtered.length)} من أصل {filtered.length} سجل
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 bg-slate-100 rounded disabled:opacity-40"
              >
                السابق
              </button>
              <span className="px-2 font-mono">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 bg-slate-100 rounded disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
