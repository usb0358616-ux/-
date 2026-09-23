import React, { useState } from 'react';
import { X, Printer, Download, FileText, Sparkles, Archive, RotateCcw, Clock } from 'lucide-react';
import Header from './Header';
import type { Document } from '../types';
import ReferralFormModal from './ReferralFormModal';
import FileContentExtractor from './FileContentExtractor';

interface DocumentDetailProps {
  doc: Document;
  onClose: () => void;
  onUpdateDoc?: (updated: Document) => void;
  onToggleArchive?: (docId: string, isArchived: boolean) => void;
  defaultTab?: 'memo' | 'content';
}

export default function DocumentDetail({ 
  doc: initialDoc, 
  onClose,
  onUpdateDoc,
  onToggleArchive,
  defaultTab = 'memo'
}: DocumentDetailProps) {
  const [doc, setDoc] = useState<Document>(initialDoc);
  const [activeView, setActiveView] = useState<'memo' | 'content'>(defaultTab);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const handleDocUpdate = (updated: Document) => {
    setDoc(updated);
    if (onUpdateDoc) {
      onUpdateDoc(updated);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl relative flex flex-col h-[92vh] overflow-hidden">
        {/* Top Header & View Tabs - No Print */}
        <div className="px-6 py-4 border-b flex flex-wrap justify-between items-center bg-slate-900 text-white rounded-t-2xl no-print gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-blue-400 font-mono">#{doc.number}</span>
            <div className="h-4 w-px bg-slate-700"></div>
            <h3 className="font-bold text-white text-base truncate max-w-md">{doc.subject}</h3>
            {doc.isArchived && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Archive size={12} />
                مستند مؤرشف
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Tab toggles */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveView('memo')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeView === 'memo' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={14} />
                <span>نموذج الوثيقة للطباعة</span>
              </button>
              <button
                onClick={() => setActiveView('content')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeView === 'content' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles size={14} />
                <span>خانة محتويات الملف (OCR)</span>
                {doc.extractedContent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>
            </div>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Secondary Toolbar - No Print */}
        <div className="px-6 py-2.5 border-b flex flex-wrap justify-between items-center bg-slate-50 text-slate-700 text-xs font-semibold no-print gap-3">
          <div className="flex items-center gap-3">
            <span>النوع: <strong className="text-slate-900">{doc.type}</strong></span>
            <span>|</span>
            <span>التاريخ: <strong className="font-mono text-slate-900">{doc.date}</strong></span>
            <span>|</span>
            <span>الجهة: <strong className="text-slate-900">{doc.type === 'وارد' ? doc.sender : doc.recipient}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleArchive && (
              <button
                onClick={() => onToggleArchive(doc.id, !doc.isArchived)}
                className={`btn-access !h-8 text-xs ${
                  doc.isArchived 
                    ? '!bg-emerald-700 !text-white' 
                    : '!bg-slate-700 !text-white'
                }`}
              >
                {doc.isArchived ? (
                  <>
                    <RotateCcw size={14} />
                    استعادة من الأرشيف
                  </>
                ) : (
                  <>
                    <Archive size={14} />
                    نقل للأرشيف
                  </>
                )}
              </button>
            )}

            <button 
              onClick={() => setShowReferralModal(true)}
              className="btn-access !h-8 text-xs !bg-blue-600 !text-white hover:!bg-blue-700"
            >
              <FileText size={14} />
              طباعة نموذج إحالة
            </button>

            <button 
              onClick={() => window.print()}
              className="btn-access !h-8 text-xs !bg-slate-900 !text-white hover:!bg-slate-800"
            >
              <Printer size={14} />
              طباعة
            </button>
          </div>
        </div>

        {/* View Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/70">
          {activeView === 'content' ? (
            <div className="max-w-4xl mx-auto">
              {doc.isArchived && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900 text-sm">
                  <div className="flex items-center gap-2.5">
                    <Clock size={18} className="text-amber-600 shrink-0" />
                    <div>
                      <strong className="font-bold">هذا الملف محفوظ في قسم الأرشيف القديم</strong>
                      <p className="text-xs text-amber-700 mt-0.5">
                        السبب: {doc.archiveReason || 'تجاوزت مدته 6 أشهر لتسريع واستقرار النظام'}
                      </p>
                    </div>
                  </div>
                  {doc.archivedAt && (
                    <span className="text-xs font-mono text-amber-700">تاريخ الأرشفة: {doc.archivedAt}</span>
                  )}
                </div>
              )}

              <FileContentExtractor 
                doc={doc} 
                onUpdateDoc={handleDocUpdate} 
              />
            </div>
          ) : (
            /* Printable Memorandum View */
            <div className="printable-area">
              <div className="bg-white mx-auto min-h-full shadow-md p-0 print:shadow-none w-[210mm] min-h-[297mm] rounded-xl overflow-hidden border border-slate-200">
                <Header 
                  currentType={doc.type} 
                  docNumber={doc.number} 
                  docDate={doc.date} 
                />
                
                <div className="p-12 space-y-8 text-right font-serif">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-black underline decoration-double underline-offset-8 text-slate-900">
                      مـذكـــــــــرة {doc.type}
                    </h2>
                    {doc.isArchived && (
                      <p className="text-xs font-sans text-slate-500 mt-2">
                        [ مستند منقول إلى قسم الأرشيف الإلكتروني ]
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-xl">
                    <div className="flex gap-2">
                      <span className="font-bold">الموضوع:</span>
                      <span className="border-b-2 border-dotted border-gray-400 flex-1">{doc.subject}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">المستوى:</span>
                      <span className="border-b-2 border-dotted border-gray-400 flex-1">{doc.priority}</span>
                    </div>
                  </div>

                  <div className="space-y-4 text-xl mt-10">
                    <p className="font-bold">{doc.type === 'وارد' ? 'من قِبَل:' : 'إلى الأخوة /'}</p>
                    <div className="pr-12">
                      <span className="text-2xl font-bold border-b-2 border-gray-800 pb-1">{doc.type === 'وارد' ? doc.sender : doc.recipient}</span>
                    </div>
                    <p className="pt-4 text-gray-500">المحترمون،،،</p>
                  </div>

                  <div className="mt-8 min-h-[160px] border-2 border-dashed border-gray-200 p-6 rounded-lg italic text-gray-700">
                    {doc.notes || 'لا توجد ملاحظات إضافية مسجلة في قيد الوثيقة...'}
                  </div>

                  {/* Summary of Extracted Content if available */}
                  {doc.extractedContent && (
                    <div className="mt-6 p-4 bg-slate-50 border border-slate-300 rounded-lg text-right font-sans">
                      <p className="text-xs font-bold text-slate-700 mb-1">
                        خلاصة محتويات الملف المستخرجة (OCR للأرشيف):
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed whitespace-pre-line">
                        {doc.extractedContent}
                      </p>
                    </div>
                  )}

                  {/* Signatures Area */}
                  <div className="mt-16 grid grid-cols-2 gap-24">
                    <div className="text-center">
                      <p className="font-bold underline mb-10">ختم المكتب</p>
                      <div className="w-28 h-28 border-2 border-slate-300 rounded-full mx-auto opacity-30"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold underline mb-10">توقيع المسؤول</p>
                      <p className="text-slate-400 italic">................................</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Styles for print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .printable-area > div {
            box-shadow: none !important;
            width: 100% !important;
            border: none !important;
          }
        }
      `}</style>

      {showReferralModal && (
        <ReferralFormModal 
          doc={doc}
          onClose={() => setShowReferralModal(false)}
        />
      )}
    </div>
  );
}
