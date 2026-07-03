import React, { useState } from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';
import Header from './Header';
import type { Document } from '../types';
import ReferralFormModal from './ReferralFormModal';

interface DocumentDetailProps {
  doc: Document;
  onClose: () => void;
}

export default function DocumentDetail({ doc, onClose }: DocumentDetailProps) {
  const [showReferralModal, setShowReferralModal] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative flex flex-col h-[90vh]">
        {/* Toolbar - No Print */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-100 rounded-t-xl no-print">
          <div className="flex gap-4">
            <button 
              onClick={() => window.print()}
              className="btn-access !bg-slate-900 !text-white !border-slate-850 hover:!bg-slate-800"
            >
              <Printer size={18} />
              طباعة فورية
            </button>
            <button 
              onClick={() => setShowReferralModal(true)}
              className="btn-access !bg-blue-600 !text-white !border-blue-700 hover:!bg-blue-700 flex items-center gap-1.5"
            >
              <FileText size={18} />
              طباعة نموذج إحالة
            </button>
            <button className="btn-access">
              <Download size={18} />
              حفظ كـ PDF
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Document Content - This is what prints */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-200 printable-area">
          <div className="bg-white mx-auto min-h-full shadow-lg p-0 print:shadow-none w-[210mm] min-h-[297mm]">
            <Header 
              currentType={doc.type} 
              docNumber={doc.number} 
              docDate={doc.date} 
            />
            
            <div className="p-12 space-y-8 text-right font-serif">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black underline decoration-double underline-offset-8">مـذكـــــــــرة {doc.type}</h2>
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

              <div className="space-y-4 text-xl mt-12">
                <p className="font-bold">{doc.type === 'وارد' ? 'من قِبَل:' : 'إلى الأخوة /'}</p>
                <div className="pr-12">
                  <span className="text-2xl font-bold border-b-2 border-gray-800 pb-1">{doc.type === 'وارد' ? doc.sender : doc.recipient}</span>
                </div>
                <p className="pt-4 text-gray-500">المحترمون،،،</p>
              </div>

              <div className="mt-12 min-h-[300px] border-2 border-dashed border-gray-200 p-6 rounded-lg italic text-gray-700">
                {doc.notes || 'لا توجد ملاحظات إضافية لهذا القيد...'}
              </div>

              {/* Signatures Area */}
              <div className="mt-24 grid grid-cols-2 gap-24">
                <div className="text-center">
                  <p className="font-bold underline mb-12">ختم المكتب</p>
                  <div className="w-32 h-32 border-2 border-slate-300 rounded-full mx-auto opacity-30"></div>
                </div>
                <div className="text-center">
                  <p className="font-bold underline mb-12">توقيع المسؤول</p>
                  <p className="text-slate-400 italic">................................</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles for this specific modal to be full page on print */}
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
