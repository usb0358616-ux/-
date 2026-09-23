import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  X, 
  Search, 
  FileCheck, 
  AlertCircle,
  FileCode,
  Paperclip,
  Trash2,
  RefreshCw
} from 'lucide-react';
import type { Document, DocumentAttachment } from '../types';

interface FileContentExtractorProps {
  doc: Document;
  onUpdateDoc: (updated: Document) => void;
}

export default function FileContentExtractor({ doc, onUpdateDoc }: FileContentExtractorProps) {
  const [extractedContent, setExtractedContent] = useState(doc.extractedContent || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachments: DocumentAttachment[] = doc.attachments || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;
      const newAttachment: DocumentAttachment = {
        name: file.name,
        url: base64,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type
      };

      const updatedAttachments = [...attachments, newAttachment];
      
      // Auto save attachment to doc
      try {
        const res = await fetch(`/api/documents/${doc.id}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attachments: updatedAttachments })
        });
        if (res.ok) {
          const updatedDoc = await res.json();
          onUpdateDoc(updatedDoc);
          setStatusMessage({ type: 'info', text: `تم إرفاق الملف "${file.name}" بنجاح. يمكنك الآن استخراج النصوص منه.` });
          
          // Trigger text extraction immediately
          extractTextFromFile(base64, file.name, file.type, updatedAttachments);
        }
      } catch (err) {
        console.error('Failed to attach file', err);
      }
    };

    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const extractTextFromFile = async (
    base64Data?: string, 
    fileName?: string, 
    mimeType?: string,
    currentAttachments = attachments
  ) => {
    setLoading(true);
    setStatusMessage(null);

    try {
      // If no file passed, use the first attachment
      let dataToExtract = base64Data;
      let nameToExtract = fileName;
      let typeToExtract = mimeType;

      if (!dataToExtract && currentAttachments.length > 0) {
        dataToExtract = currentAttachments[0].url;
        nameToExtract = currentAttachments[0].name;
        typeToExtract = currentAttachments[0].type || 'image/jpeg';
      }

      if (!dataToExtract && !nameToExtract) {
        // Fallback with document details
        nameToExtract = `مستند_قيد_${doc.number}.pdf`;
      }

      const res = await fetch('/api/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: dataToExtract,
          fileName: nameToExtract,
          mimeType: typeToExtract
        })
      });

      const data = await res.json();
      if (res.ok && data.extractedText) {
        setExtractedContent(data.extractedText);
        
        // Save to document
        const saveRes = await fetch(`/api/documents/${doc.id}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ extractedContent: data.extractedText })
        });

        if (saveRes.ok) {
          const updated = await saveRes.json();
          onUpdateDoc(updated);
          setStatusMessage({ 
            type: 'success', 
            text: 'تم استخراج وتحديث نصوص الملف بنجاح وحفظها في خانة محتويات الملف!' 
          });
        }
      } else {
        throw new Error(data.error || 'تعذر استخراج النصوص');
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'حدث خطأ أثناء استخراج نصوص الملف.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManualContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedContent })
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdateDoc(updated);
        setIsEditing(false);
        setStatusMessage({ type: 'success', text: 'تم حفظ تعديلات محتويات الملف بنجاح.' });
      }
    } catch (err) {
      console.error('Save failed', err);
      setStatusMessage({ type: 'error', text: 'فشل حفظ المحتوى المستخرج.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!extractedContent) return;
    navigator.clipboard.writeText(extractedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteAttachment = async (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    try {
      const res = await fetch(`/api/documents/${doc.id}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachments: updated })
      });
      if (res.ok) {
        const updatedDoc = await res.json();
        onUpdateDoc(updatedDoc);
      }
    } catch (err) {
      console.error('Delete attachment failed', err);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Attachments & Action Bar */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
              <Paperclip size={18} className="text-blue-600" />
              الملفات المرفقة والمسح الضوئي للوثيقة
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              يمكنك إرفاق صور المستند أو تقارير PDF واستخراج نصوصها آلياً إلى خانة محتويات الملف
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*,.pdf,.txt"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition"
            >
              <Upload size={16} />
              إرفاق ملف جديد
            </button>

            <button
              onClick={() => extractTextFromFile()}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition"
              title="استخراج النصوص عبر الذكاء الاصطناعي والـ OCR"
            >
              <Sparkles size={16} className={loading ? "animate-spin" : ""} />
              {loading ? 'جاري الاستخراج...' : 'استخراج النصوص من الملف (OCR)'}
            </button>
          </div>
        </div>

        {/* List of attachments */}
        {attachments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {attachments.map((file, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>{file.name}</p>
                    <p className="text-[11px] text-slate-400">{file.size || 'ملف مرفق'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => extractTextFromFile(file.url, file.name, file.type)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded text-xs"
                    title="استخراج النصوص من هذا الملف"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteAttachment(idx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded text-xs"
                    title="حذف المرفق"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-lg bg-white/50">
            <Paperclip size={24} className="mx-auto text-slate-400 mb-1 opacity-60" />
            <p className="text-xs text-slate-500">لا توجد ملفات مرفقة حالياً. اضغط "إرفاق ملف جديد" لإضافة صورة المسح الضوئي أو مستند الـ PDF.</p>
          </div>
        )}
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          statusMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {statusMessage.type === 'success' ? <FileCheck size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Extracted Text Container (خانة محتويات الملف) */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Header of Section */}
        <div className="bg-slate-800 text-white p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <FileCode size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base">خانة محتويات الملف (النصوص المستخرجة للأرشفة)</h3>
              <p className="text-xs text-slate-300">
                النصوص والأرقام والبيانات المستخرجة من داخل مستندات وملفات الوثيقة لتمكين البحث السريع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {extractedContent && (
              <>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  title="نسخ محتويات الملف إلى الحافظة"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'تم النسخ' : 'نسخ المحتوى'}</span>
                </button>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Edit3 size={14} />
                    <span>تعديل يدوي</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveManualContent}
                    disabled={loading}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Save size={14} />
                    <span>حفظ التعديلات</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* In-Content Search Bar */}
        {extractedContent && !isEditing && (
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="بحث سريع داخل محتويات هذا الملف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="text-xs text-slate-500 font-mono">
              عدد الكلمات: {extractedContent.trim().split(/\s+/).length} | الحروف: {extractedContent.length}
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={extractedContent}
                onChange={(e) => setExtractedContent(e.target.value)}
                rows={12}
                className="w-full p-4 bg-slate-50 border border-slate-300 rounded-lg font-mono text-sm leading-relaxed text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                placeholder="اكتب أو عدّل محتويات ونصوص الملف هنا..."
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveManualContent}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Save size={14} />
                  حفظ التعديلات
                </button>
              </div>
            </div>
          ) : extractedContent ? (
            <div className="bg-slate-50/70 p-5 rounded-lg border border-slate-200 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 select-text">
              {searchTerm ? (
                // Highlight search matches
                extractedContent.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                  part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-200 text-yellow-900 font-bold px-1 rounded">{part}</mark>
                  ) : (
                    part
                  )
                )
              ) : (
                extractedContent
              )}
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <FileText size={48} className="mx-auto text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-700 mb-1">خانة محتويات الملف فارغة حالياً</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                لم يتم استخراج محتويات ونصوص هذا الملف بعد. قم برفع صورة المستند أو الضغط على زر الاستخراج لقراءة كافة النصوص والأرقام والأسماء وحفظها هنا تلقائياً.
              </p>
              <button
                onClick={() => extractTextFromFile()}
                disabled={loading}
                className="btn-access !bg-blue-600 !text-white !h-10 mx-auto"
              >
                <Sparkles size={16} />
                بدء استخراج نصوص الملف الآن
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
