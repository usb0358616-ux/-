import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  CreditCard,
  Navigation,
  Eye,
  Check,
  ClipboardPaste,
  HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

export type AIImportTargetType = 'visas' | 'seizures' | 'security-checks' | 'clearances' | 'movement-permits';

interface SmartAIImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: AIImportTargetType;
  onSuccess: () => void;
  userOfficerName?: string;
}

export default function SmartAIImportModal({
  isOpen,
  onClose,
  targetType,
  onSuccess,
  userOfficerName = 'ضابط الاستخبارات'
}: SmartAIImportModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [extractedRecords, setExtractedRecords] = useState<any[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ count: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // عناوين وتوصيفات كل قسم
  const metaConfig = {
    visas: {
      title: 'استيراد بيانات التأشيرات والإقامات بالذكاء الاصطناعي',
      subTitle: 'قراءة واستخراج كشوفات التأشيرات، طلبات الدخول، وإقامات الوافدين من ملفات Excel، PDF، أو صور المسح الضوئي',
      icon: Globe,
      color: 'from-cyan-600 to-blue-700',
      badgeBg: 'bg-cyan-100 text-cyan-800',
      apiEndpoint: '/api/residencies/bulk-import',
      fields: ['personName', 'passportNumber', 'nationality', 'type', 'entryPort', 'sponsorOrEntity', 'status']
    },
    seizures: {
      title: 'استيراد محاضر الجوازات المضبوطة بالذكاء الاصطناعي',
      subTitle: 'تحليل واستخراج محاضر الضبط بالمنافذ الحدودية وكشوفات الجوازات المحتجزة والمضبوطة آلياً',
      icon: ShieldAlert,
      color: 'from-purple-600 to-indigo-800',
      badgeBg: 'bg-purple-100 text-purple-800',
      apiEndpoint: '/api/seizures/bulk-import',
      fields: ['recordNumber', 'portName', 'seizureDate', 'officerName', 'passportNumbers', 'violationType', 'status']
    },
    'security-checks': {
      title: 'استيراد نتائج الفحص الأمني والمطابقة بالذكاء الاصطناعي',
      subTitle: 'استخراج نتائج التدقيق الجنائي ومطابقة القوائم السوداء وتعاويم المنع من الكشوفات والتقارير',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-800',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      apiEndpoint: '/api/security-checks/bulk-import',
      fields: ['passportNumber', 'fullName', 'nationality', 'result', 'checkDetails', 'officer']
    },
    clearances: {
      title: 'استيراد طلبات الموافقات وتتبع المدد (SLA) بالذكاء الاصطناعي',
      subTitle: 'استخراج كشوفات طلبات التأشيرات والجنسية والزواج وتتبع المهل القانونية المحددة في المحاضر الرسمية',
      icon: CreditCard,
      color: 'from-blue-600 to-indigo-900',
      badgeBg: 'bg-blue-100 text-blue-800',
      apiEndpoint: '/api/security-clearances/bulk-import',
      fields: ['transactionNumber', 'applicantName', 'passportOrIdNumber', 'nationality', 'department', 'serviceType']
    },
    'movement-permits': {
      title: 'استيراد كشوفات تصاريح التنقل والتحرك بالذكاء الاصطناعي',
      subTitle: 'استخراج كشوفات مواكب المنظمات الدولية والبعثات والمركبات والمرافقين من ملفات Excel و PDF',
      icon: Navigation,
      color: 'from-indigo-600 to-purple-800',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      apiEndpoint: '/api/movement-permits/bulk-import',
      fields: ['permitNumber', 'organizationName', 'applicantLeaderName', 'leaderPassport', 'purpose', 'approvedRoute']
    }
  }[targetType];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processSelectedFile(selected);
  };

  const processSelectedFile = (selected: File) => {
    setFile(selected);
    setErrorMessage(null);
    setSuccessInfo(null);
    setExtractedRecords([]);

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // معالجة واستخراج البيانات عبر الذكاء الاصطناعي
  const handleStartAnalysis = async () => {
    if (!file && !pastedText.trim()) {
      setErrorMessage('يرجى اختيار ملف (Excel / PDF / صورة) أو لصق نص البيانات أولاً');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStep('جاري قراءة وفحص بنية الملف والمحتويات...');

    try {
      let payload: any = {
        targetType,
        fileName: file?.name || 'بيانات_ملصوقة'
      };

      // إذا كان الملف إكسل أو كشف بيانات
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
        setAnalysisStep('جاري قراءة أوراق وجداول ملف Excel...');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[];

        payload.tabularJson = jsonRows.slice(0, 500);
        payload.rawText = XLSX.utils.sheet_to_csv(worksheet).slice(0, 40000);
      } else if (file) {
        // PDF أو صورة
        setAnalysisStep('جاري فحص المستند بالماسح الضوئي الذكي (Multimodal AI OCR)...');
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        payload.base64 = base64Data;
        payload.mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      } else {
        // نص مباشر
        setAnalysisStep('جاري تحليل وهيكلة النص المدخل بالذكاء الاصطناعي...');
        payload.rawText = pastedText;
      }

      setAnalysisStep('جاري استخلاص الحقول وتصنيف السجلات والتحقق من الصلاحيات...');

      const response = await fetch('/api/ai-extract-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشل معالجة واستخراج البيانات بالذكاء الاصطناعي');
      }

      const records = result.records || [];
      if (records.length === 0) {
        setErrorMessage('تم فحص الملف ولكن لم يتم العثور على سجلات مطابقة، يمكنك تجربة نص آخر أو ملف أوضح.');
      } else {
        setExtractedRecords(records);
        // تحديد كل السجلات افتراضياً
        setSelectedIndices(new Set(records.map((_: any, idx: number) => idx)));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'حدث خطأ أثناء معالجة الملف بالذكاء الاصطناعي');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // تعديل حقل معين داخل الجدول المستخرج
  const handleUpdateRecordField = (index: number, field: string, value: any) => {
    setExtractedRecords(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // حذف سجل من القائمة المستخرجة
  const handleDeleteRecord = (index: number) => {
    setExtractedRecords(prev => prev.filter((_, i) => i !== index));
    setSelectedIndices(prev => {
      const updated = new Set<number>();
      prev.forEach(i => {
        if (i < index) updated.add(i);
        else if (i > index) updated.add(i - 1);
      });
      return updated;
    });
  };

  // إضافة سجل يدوي فارغ للقائمة
  const handleAddManualRow = () => {
    let emptyRow: any = {};
    if (targetType === 'visas') {
      emptyRow = {
        personName: '',
        passportNumber: '',
        nationality: 'يمني',
        type: 'تأشيرة',
        entryPort: 'مطار عدن الدولي',
        sponsorOrEntity: '',
        entryDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        status: 'سارية',
        notes: ''
      };
    } else if (targetType === 'seizures') {
      emptyRow = {
        recordNumber: `محضر-${Date.now().toString().slice(-4)}`,
        portName: 'منفذ الوديعة البري الحدودي',
        portType: 'بري',
        seizureDate: new Date().toISOString().split('T')[0],
        officerName: userOfficerName,
        passportNumbers: [],
        violationType: 'اشتباه تزوير أختام',
        violationDescription: '',
        status: 'قيد التدقيق'
      };
    } else if (targetType === 'security-checks') {
      emptyRow = {
        passportNumber: '',
        fullName: '',
        nationality: 'يمني',
        result: 'سليم / خالي من السوابق',
        checkDetails: 'مطابقة يدوية',
        officer: userOfficerName,
        date: new Date().toISOString().split('T')[0]
      };
    } else if (targetType === 'clearances') {
      emptyRow = {
        transactionNumber: `معاملة-${Math.floor(10000 + Math.random() * 90000)}`,
        applicantName: '',
        passportOrIdNumber: '',
        nationality: 'يمني',
        department: 'الإدارة العامة للشؤون العربية والأجنبية',
        serviceType: 'طلب تأشيرة الدخول'
      };
    }

    setExtractedRecords(prev => [emptyRow, ...prev]);
    setSelectedIndices(prev => {
      const updated = new Set<number>();
      updated.add(0);
      prev.forEach(i => updated.add(i + 1));
      return updated;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === extractedRecords.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(extractedRecords.map((_, i) => i)));
    }
  };

  const toggleSelectOne = (index: number) => {
    setSelectedIndices(prev => {
      const copy = new Set(prev);
      if (copy.has(index)) copy.delete(index);
      else copy.add(index);
      return copy;
    });
  };

  // اعتماد وحفظ السجلات في قاعدة البيانات
  const handleCommitImport = async () => {
    const selectedRows = extractedRecords.filter((_, idx) => selectedIndices.has(idx));
    if (selectedRows.length === 0) {
      setErrorMessage('يرجى تحديد سجل واحد على الأقل للاستيراد');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch(metaConfig.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: selectedRows,
          sourceFileName: file?.name || 'استيراد بالذكاء الاصطناعي'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل حفظ السجلات المستوردة');
      }

      setSuccessInfo({ count: data.count || selectedRows.length });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'حدث خطأ أثناء اعتماد واستيراد البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${metaConfig.color} text-white flex items-center justify-between relative shadow-md`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/15 backdrop-blur-xs rounded-2xl border border-white/20 shadow-xs">
              <Sparkles className="text-amber-300 animate-pulse" size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">{metaConfig.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                  محرك Gemini الذكي
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed">
                {metaConfig.subTitle}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Success Banner */}
          {successInfo && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-950">
                    تم استيراد وحفظ {successInfo.count} سجل بنجاح في النظام!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    تم تحديث قاعدة البيانات والسجلات والخط الزمني بصورة فورية.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition"
              >
                تم، إغلاق النافذة
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
              <AlertTriangle className="text-rose-600 shrink-0" size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* File Selection / Mode Switches */}
          {extractedRecords.length === 0 && !successInfo && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'upload'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Upload size={16} />
                  رفع ملف (Excel / PDF / صورة)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'paste'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardPaste size={16} />
                  لصق نص مباشر / جدول
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                    file 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shadow-xs">
                      <FileSpreadsheet size={28} />
                    </div>
                    <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl shadow-xs">
                      <FileText size={28} />
                    </div>
                    <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl shadow-xs">
                      <ImageIcon size={28} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-800">
                      {file ? file.name : 'اسحب وأفلت الملف هنا أو انقر للاختيار'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      يدعم جداول الإكسل (.xlsx, .xls, .csv)، ملفات الـ PDF، وصور المستندات الممسوحة ضوئياً (JPG, PNG)
                    </p>
                  </div>

                  {file && (
                    <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-blue-100/70 border border-blue-200 rounded-xl text-xs font-bold text-blue-800">
                      <Check size={14} />
                      <span>تم تجهيز الملف: {(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  )}

                  {filePreview && (
                    <div className="mt-3 max-h-48 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                      <img src={filePreview} alt="معاينة المستند" className="max-h-48 object-contain mx-auto" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>انسخ نص الكشف أو الجدول أو رسالة المعاملة والصقها هنا:</span>
                    <span className="text-[11px] text-slate-400">سيقوم الذكاء الاصطناعي بتنظيمها تلقائياً</span>
                  </label>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="مثال:&#10;1- طارق سليم الفاروقي - جواز: 07881923 - الجنسية: سوري - تأشيرة عمل - منفذ عدن&#10;2- مايكل جون سميث - جواز: USA912048 - الجنسية: أمريكي - منظمة الصليب الأحمر..."
                    className="w-full p-4 border border-slate-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    dir="rtl"
                  />
                </div>
              )}

              {/* Action Button to Start Extraction */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-slate-400" />
                  <span>يقوم الذكاء الاصطناعي بالتعرف التلقائي على الأعمدة والأسماء وأرقام الجوازات</span>
                </div>

                <button
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing || (!file && !pastedText.trim())}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-white shadow-lg transition cursor-pointer ${
                    isAnalyzing || (!file && !pastedText.trim())
                      ? 'bg-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/20'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>{analysisStep || 'جاري التحليل...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>بدء المعالجة والاستخراج الذكي</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Interactive Review Table when Extracted */}
          {extractedRecords.length > 0 && !successInfo && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                    <Sparkles size={20} />
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      تم استخراج {extractedRecords.length} سجل بنجاح
                    </h4>
                    <p className="text-xs text-slate-500">
                      يمكنك مراجعة وتعديل أي حقل مباشرة في الجدول قبل الاعتماد النهائي
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddManualRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs"
                  >
                    <Plus size={15} />
                    إضافة صف يدوي
                  </button>
                  <button
                    onClick={() => {
                      setExtractedRecords([]);
                      setFile(null);
                      setFilePreview(null);
                      setPastedText('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold transition shadow-2xs"
                  >
                    <RefreshCw size={14} />
                    إعادة الرفع
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs max-h-[420px] overflow-y-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-slate-900 text-white sticky top-0 z-20">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIndices.size === extractedRecords.length && extractedRecords.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-700"
                        />
                      </th>
                      <th className="p-3">#</th>
                      {targetType === 'visas' && (
                        <>
                          <th className="p-3">صاحب التأشيرة / الوافد</th>
                          <th className="p-3">رقم الجواز</th>
                          <th className="p-3">الجنسية</th>
                          <th className="p-3">النوع</th>
                          <th className="p-3">منفذ الدخول</th>
                          <th className="p-3">الكفيل / الجهة</th>
                          <th className="p-3">الحالة</th>
                        </>
                      )}
                      {targetType === 'seizures' && (
                        <>
                          <th className="p-3">رقم المحضر</th>
                          <th className="p-3">المنفذ</th>
                          <th className="p-3">تاريخ الضبط</th>
                          <th className="p-3">الضابط</th>
                          <th className="p-3">الجوازات المضبوطة</th>
                          <th className="p-3">نوع المخالفة</th>
                        </>
                      )}
                      {targetType === 'security-checks' && (
                        <>
                          <th className="p-3">رقم الجواز</th>
                          <th className="p-3">الاسم الكامل</th>
                          <th className="p-3">الجنسية</th>
                          <th className="p-3">نتيجة الفحص</th>
                          <th className="p-3">تفاصيل الفحص والتعميم</th>
                          <th className="p-3">الضابط الفاحص</th>
                        </>
                      )}
                      {targetType === 'clearances' && (
                        <>
                          <th className="p-3">رقم المعاملة</th>
                          <th className="p-3">اسم مقدم الطلب</th>
                          <th className="p-3">رقم الجواز / الهوية</th>
                          <th className="p-3">الجنسية</th>
                          <th className="p-3">نوع الخدمة</th>
                          <th className="p-3">الإدارة</th>
                        </>
                      )}
                      <th className="p-3 text-center w-12">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {extractedRecords.map((rec, idx) => {
                      const isSelected = selectedIndices.has(idx);
                      return (
                        <tr 
                          key={idx} 
                          className={`hover:bg-blue-50/40 transition ${!isSelected ? 'opacity-40 bg-slate-50/60' : ''}`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(idx)}
                              className="rounded border-slate-300"
                            />
                          </td>
                          <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>

                          {/* Dynamic Fields for Visas */}
                          {targetType === 'visas' && (
                            <>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.personName || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'personName', e.target.value)}
                                  className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.passportNumber || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'passportNumber', e.target.value)}
                                  className="w-28 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded font-mono font-bold text-blue-700 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.nationality || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'nationality', e.target.value)}
                                  className="w-20 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs text-slate-600"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={rec.type || 'تأشيرة'}
                                  onChange={(e) => handleUpdateRecordField(idx, 'type', e.target.value)}
                                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                                >
                                  <option value="تأشيرة">تأشيرة</option>
                                  <option value="إقامة">إقامة</option>
                                  <option value="مهاجر / وافد">مهاجر / وافد</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.entryPort || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'entryPort', e.target.value)}
                                  className="w-32 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs text-slate-700"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.sponsorOrEntity || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'sponsorOrEntity', e.target.value)}
                                  className="w-32 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs text-slate-600"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={rec.status || 'سارية'}
                                  onChange={(e) => handleUpdateRecordField(idx, 'status', e.target.value)}
                                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-700"
                                >
                                  <option value="سارية">سارية</option>
                                  <option value="منتهية">منتهية</option>
                                  <option value="طلب تجديد">طلب تجديد</option>
                                  <option value="قيد المتابعة">قيد المتابعة</option>
                                </select>
                              </td>
                            </>
                          )}

                          {/* Dynamic Fields for Seizures */}
                          {targetType === 'seizures' && (
                            <>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.recordNumber || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'recordNumber', e.target.value)}
                                  className="w-28 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded font-mono font-bold text-purple-800 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.portName || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'portName', e.target.value)}
                                  className="w-36 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs font-semibold text-slate-700"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="date"
                                  value={rec.seizureDate || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'seizureDate', e.target.value)}
                                  className="w-28 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs font-mono"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.officerName || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'officerName', e.target.value)}
                                  className="w-28 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs text-slate-600"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={Array.isArray(rec.passportNumbers) ? rec.passportNumbers.join(', ') : rec.passportNumbers || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'passportNumbers', e.target.value.split(/[\s,،]+/).filter(Boolean))}
                                  placeholder="أرقام الجوازات مفصولة بفواصل"
                                  className="w-48 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded font-mono text-xs text-blue-700"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.violationType || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'violationType', e.target.value)}
                                  className="w-36 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs text-rose-700 font-semibold"
                                />
                              </td>
                            </>
                          )}

                          {/* Dynamic Fields for Security Checks */}
                          {targetType === 'security-checks' && (
                            <>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.passportNumber || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'passportNumber', e.target.value)}
                                  className="w-28 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded font-mono font-bold text-emerald-800 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.fullName || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'fullName', e.target.value)}
                                  className="w-40 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded font-bold text-slate-800 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.nationality || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'nationality', e.target.value)}
                                  className="w-20 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs text-slate-600"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={rec.result || 'سليم / خالي من السوابق'}
                                  onChange={(e) => handleUpdateRecordField(idx, 'result', e.target.value)}
                                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-800"
                                >
                                  <option value="سليم / خالي من السوابق">سليم / خالي من السوابق</option>
                                  <option value="يحتاج إجراء وتدقيق">يحتاج إجراء وتدقيق</option>
                                  <option value="غير مطابق / تعميم حظر">غير مطابق / تعميم حظر</option>
                                  <option value="قيد التدقيق">قيد التدقيق</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.checkDetails || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'checkDetails', e.target.value)}
                                  className="w-56 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs text-slate-600"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.officer || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'officer', e.target.value)}
                                  className="w-28 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs text-slate-500"
                                />
                              </td>
                            </>
                          )}

                          {/* Dynamic Fields for Clearances */}
                          {targetType === 'clearances' && (
                            <>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.transactionNumber || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'transactionNumber', e.target.value)}
                                  className="w-28 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded font-mono font-bold text-indigo-700 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.applicantName || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'applicantName', e.target.value)}
                                  className="w-40 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded font-bold text-slate-800 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.passportOrIdNumber || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'passportOrIdNumber', e.target.value)}
                                  className="w-28 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded font-mono font-bold text-blue-700 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.nationality || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'nationality', e.target.value)}
                                  className="w-20 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs text-slate-600"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.serviceType || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'serviceType', e.target.value)}
                                  className="w-36 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs text-slate-700"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={rec.department || ''}
                                  onChange={(e) => handleUpdateRecordField(idx, 'department', e.target.value)}
                                  className="w-44 px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs text-slate-600"
                                />
                              </td>
                            </>
                          )}

                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteRecord(idx)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                              title="حذف هذا الصف"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Commit Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600">
                  تم تحديد {selectedIndices.size} من أصل {extractedRecords.length} سجل للاستيراد
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitImport}
                    disabled={isSaving || selectedIndices.size === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-900/20 transition cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>جاري الحفظ في النظام...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>اعتماد واستيراد ({selectedIndices.size}) سجل في النظام</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
