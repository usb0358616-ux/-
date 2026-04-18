import type { DocType } from '../types';

interface HeaderProps {
  currentType?: DocType;
  docNumber?: string;
  docDate?: string;
}

export default function Header({ currentType, docNumber, docDate }: HeaderProps) {
  const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
  
  const gregorianFormatter = new Intl.DateTimeFormat('ar-YE', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  const targetDate = docDate ? new Date(docDate) : new Date();
  const hijriStr = hijriFormatter.format(targetDate);
  const gregorianStr = gregorianFormatter.format(targetDate);

  return (
    <div className="w-full bg-white border-b-4 border-sleek-secondary p-6 flex justify-between items-start text-sleek-primary printable overflow-hidden shadow-sm">
      {/* Right Section - Text from Image */}
      <div className="flex flex-col text-right space-y-1 z-10">
        <div className="border-2 border-sleek-primary p-1 px-4 mb-1">
          <h2 className="text-xl font-bold font-serif leading-none">الجمهورية اليمنية</h2>
        </div>
        <h3 className="text-md font-bold text-sleek-primary">وزارة الداخلية</h3>
        <h3 className="text-md font-bold text-slate-600">قطاع استخبارات الشرطة</h3>
        <h4 className="text-md font-bold text-slate-500">فرع مصلحة الجوازات</h4>
      </div>

      {/* Center Section - Logo and Bismillah */}
      <div className="flex flex-col items-center flex-1">
        <h1 className="text-2xl font-serif font-bold mb-3 tracking-wide">بسم الله الرحمن الرحيم</h1>
        <div className="relative">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/0/00/Coat_of_arms_of_Yemen.svg" 
            alt="شعار الجمهورية اليمنية" 
            className="h-28 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-8 bg-black hidden md:block print:block"></div>
        </div>
      </div>

      {/* Left Section - Dates as seen in image */}
      <div className="flex flex-col text-right space-y-3 min-w-[220px] z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold whitespace-nowrap">الرقـــــــــــــم:</span>
          <span className="flex-1 border-b border-dotted border-gray-600 min-w-32 text-center text-lg">{docNumber || '....................'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold whitespace-nowrap">التاريـــــــــخ:</span>
          <span className="flex-1 border-b border-dotted border-gray-600 min-w-32 text-center text-lg">{hijriStr} هـ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold whitespace-nowrap">الموافــــــــق:</span>
          <span className="flex-1 border-b border-dotted border-gray-600 min-w-32 text-center text-lg">{gregorianStr} م</span>
        </div>
        
        {currentType && (
          <div className="mt-2 text-center border border-gray-300 py-1 bg-gray-50 rounded">
            <span className="text-sm font-bold text-gray-600">البيان: </span>
            <span className="text-blue-700 font-bold">{currentType}</span>
          </div>
        )}
      </div>
    </div>
  );
}
