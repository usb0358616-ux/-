import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import Header from './Header';
import type { Document } from '../types';

interface DocumentDetailProps {
  doc: Document;
  onClose: () => void;
}

export default function DocumentDetail({ doc, onClose }: DocumentDetailProps) {
  return (
    <div className="fixed inset-0 bg-sleek-primary/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0 print:relative print:z-0 print:block">
      <div className="bg-sleek-bg w-full max-w-4xl rounded-xl shadow-2xl relative flex flex-col h-[90vh] border-2 border-sleek-secondary print:h-auto print:w-full print:max-w-none print:border-none print:rounded-none print:shadow-none">
        {/* Toolbar - No Print */}
        <div className="p-4 border-b border-sleek-border flex justify-between items-center bg-white rounded-t-xl no-print">
          <div className="flex gap-4">
            <button 
              onClick={() => window.print()}
              className="btn-access !bg-sleek-primary !text-white border-none shadow-md"
            >
              <Printer size={18} />
              طباعة فورية
            </button>
            <button className="btn-access !bg-sleek-secondary !text-sleek-primary border-none shadow-md">
              <Download size={18} />
              حفظ كـ PDF
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-sleek-primary transition">
            <X size={24} />
          </button>
        </div>

        {/* Document Content - This is what prints */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-200 printable-area">
          <div className="bg-white mx-auto min-h-full shadow-lg p-0 print:shadow-none w-[210mm] min-h-[297mm] border border-slate-300 print:border-none">
            <Header 
              currentType={doc.type} 
              docNumber={doc.number} 
              docDate={doc.date} 
            />
            
            <div className="p-12 space-y-8 text-right font-serif">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black underline decoration-double underline-offset-8 text-sleek-primary uppercase">مـذكـــــــــرة {doc.type}</h2>
              </div>

              <div className="grid grid-cols-2 gap-8 text-xl">
                <div className="flex gap-2">
                  <span className="font-bold text-sleek-primary">الموضوع:</span>
                  <span className="border-b-2 border-dotted border-sleek-secondary flex-1">{doc.subject}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-sleek-primary">المستوى:</span>
                  <span className="border-b-2 border-dotted border-sleek-secondary flex-1">{doc.priority}</span>
                </div>
              </div>

              <div className="space-y-4 text-xl mt-12">
                <p className="font-bold text-sleek-primary">{doc.type === 'وارد' ? 'من قِبَل:' : 'إلى الأخوة /'}</p>
                <div className="pr-12">
                  <span className="text-2xl font-bold border-b-2 border-sleek-primary pb-1">{doc.type === 'وارد' ? doc.sender : doc.recipient}</span>
                </div>
                <p className="pt-4 text-slate-400">المحترمون،،،</p>
              </div>

              <div className="mt-12 min-h-[300px] border-2 border-dashed border-sleek-border p-6 rounded italic text-slate-600 bg-slate-50/50">
                {doc.notes || 'لا توجد ملاحظات إضافية لهذا القيد...'}
              </div>

              {/* Signatures Area */}
              <div className="mt-24 grid grid-cols-2 gap-24">
                <div className="text-center">
                  <p className="font-bold underline mb-12 text-sleek-primary">ختم المكتب</p>
                  <div className="w-32 h-32 border-2 border-sleek-secondary rounded-full mx-auto opacity-20"></div>
                </div>
                <div className="text-center">
                  <p className="font-bold underline mb-12 text-sleek-primary">توقيع المسؤول</p>
                  <p className="text-slate-300 italic">................................</p>
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
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .printable-area > div {
            box-shadow: none !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
