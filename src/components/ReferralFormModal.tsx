import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, Check } from 'lucide-react';
import type { DailySummaryEntry, Document } from '../types';

interface ReferralFormModalProps {
  entry?: DailySummaryEntry | null;
  doc?: Document | null;
  onClose: () => void;
}

export default function ReferralFormModal({ entry, doc, onClose }: ReferralFormModalProps) {
  // Pre-filled dates
  const today = new Date();
  const yearG = today.getFullYear();
  const monthG = String(today.getMonth() + 1).padStart(2, '0');
  const dayG = String(today.getDate()).padStart(2, '0');

  const [dateG, setDateG] = useState(`${yearG}/${monthG}/${dayG}`);
  const [dayName, setDayName] = useState('');
  const [dateH, setDateH] = useState('1447/01/01');

  // Personal Info Form State
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [socialStatus, setSocialStatus] = useState('متزوج');
  const [eduQualification, setEduQualification] = useState('');
  const [prevWork, setPrevWork] = useState('');
  const [currentWork, setCurrentWork] = useState('');
  const [relativePhone, setRelativePhone] = useState('');

  // Residency Info Form State
  const [governorate, setGovernorate] = useState('صنعاء');
  const [directorate, setDirectorate] = useState('');
  const [uzlah, setUzlah] = useState('');
  const [village, setVillage] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');

  // Passport Info Form State
  const [passportNumber, setPassportNumber] = useState('');
  const [profession, setProfession] = useState('');
  const [issuePlace, setIssuePlace] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [travelPurpose, setTravelPurpose] = useState('');
  const [sponsorNumber, setSponsorNumber] = useState('');

  // Sponsor Info Form State
  const [sponsorNationality, setSponsorNationality] = useState('يمني');
  const [sponsorName, setSponsorName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [invitationReason, setInvitationReason] = useState('');
  const [sponsorWork, setSponsorWork] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [targetCity, setTargetCity] = useState('');

  // Auto-fill states depending on the transaction input (entry or doc)
  useEffect(() => {
    // Days mapping for Yemen
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    setDayName(days[today.getDay()]);

    // Simple Hijri calculation fallback (approximate for UI display)
    const hijriYear = yearG - 579 - (monthG < '07' ? 1 : 0);
    setDateH(`${hijriYear}/12/11`);

    if (entry) {
      if (entry.type === 'delivery_passports' && entry.delivery_passports) {
        const p = entry.delivery_passports;
        setFullName(p.fullName || '');
        setPassportNumber(p.passportNumber || '');
        setSponsorNationality(p.nationality || 'يمني');
      } else if (entry.type === 'receive_passports' && entry.receive_passports) {
        setBirthPlace(entry.receive_passports.portName || '');
      } else if (entry.type === 'residency_renewal_requests' && entry.residency_renewal_requests) {
        const r = entry.residency_renewal_requests;
        setFullName(r.personName || '');
        setCurrentWork(r.jobTitle || '');
        setGovernorate(r.governorate || 'صنعاء');
        setSponsorNationality('أجنبي');
      } else if (entry.type === 'incoming_memos' && entry.incoming_memos) {
        const m = entry.incoming_memos;
        setTitle(m.subjectSummary || '');
        setPrevWork(m.senderSector || '');
      } else if (entry.type === 'outgoing_memos' && entry.outgoing_memos) {
        const o = entry.outgoing_memos;
        setTitle(o.subjectSummary || '');
        setPrevWork(o.recipientSector || '');
      }
    } else if (doc) {
      setFullName(doc.sender || doc.recipient || '');
      setTitle(doc.subject || '');
      setTravelPurpose(doc.subject || '');
    }
  }, [entry, doc]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 overflow-y-auto no-print dir-rtl" style={{ direction: 'rtl' }}>
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl relative flex flex-col h-[95vh]">
        
        {/* Modal Toolbar - No Print */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-900 text-white rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-400" size={24} />
            <div>
              <h2 className="text-lg font-black">نموذج إحالة وتعهد رسمي (تلقائي)</h2>
              <p className="text-xs text-slate-400">يمكنك تعديل البيانات أدناه على الشاشة قبل تأكيد الطباعة لتوليد استمارة كاملة.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition shadow-lg"
            >
              <Printer size={16} />
              طباعة الاستمارة الرسمية
            </button>
            <button 
              onClick={onClose} 
              className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition text-slate-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Main Body: Split into Interactive Form on right, and printable A4 Preview on left */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-slate-100">
          
          {/* Right Side: Interactive Field Editors */}
          <div className="w-full lg:w-2/5 p-6 overflow-y-auto border-l border-slate-200 bg-white space-y-6">
            <h3 className="font-black text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              تعديل بيانات الاستمارة (تظهر فوراً في المعاينة):
            </h3>

            {/* Date Inputs */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h4 className="text-xs font-black text-slate-700">الترويسة والتواريخ</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">اليوم</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={dayName} onChange={(e) => setDayName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">التاريخ الميلادي</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={dateG} onChange={(e) => setDateG(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">الموافق هجري</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={dateH} onChange={(e) => setDateH(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Section 1: Personal Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h4 className="text-xs font-black text-slate-700">1. البيانات الشخصية</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">الاسم الرباعي الكامل</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg font-bold text-slate-800" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">اللقب</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">الرقم الوطني</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">رقم الهاتف</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">محل الميلاد</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">تاريخ الميلاد</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">المؤهل العلمي</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={eduQualification} onChange={(e) => setEduQualification(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">العمل السابق</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={prevWork} onChange={(e) => setPrevWork(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">العمل الحالي</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={currentWork} onChange={(e) => setCurrentWork(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">هاتف قريب من الدرجة الأولى</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={relativePhone} onChange={(e) => setRelativePhone(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Section 2: Residency Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h4 className="text-xs font-black text-slate-700">2. بيانات الإقامة الحالية</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">المحافظة</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={governorate} onChange={(e) => setGovernorate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">المديرية</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={directorate} onChange={(e) => setDirectorate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">العزلة</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={uzlah} onChange={(e) => setUzlah(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">قرية / مدينة</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={village} onChange={(e) => setVillage(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">الحارة</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">الشارع</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={street} onChange={(e) => setStreet(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Section 3: Passport Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h4 className="text-xs font-black text-slate-700">3. بيانات الجواز</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">رقم الجواز</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">المهنة في الجواز</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={profession} onChange={(e) => setProfession(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">جهة الإصدار</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={issuePlace} onChange={(e) => setIssuePlace(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">اسم المكتب / الوكالة</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={officeName} onChange={(e) => setOfficeName(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">الغرض من السفر</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={travelPurpose} onChange={(e) => setTravelPurpose(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">رقم مرجع الكفيل</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={sponsorNumber} onChange={(e) => setSponsorNumber(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Section 4: Sponsor Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h4 className="text-xs font-black text-slate-700">4. بيانات الكفيل</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">اسم الكفيل الكامل</label>
                  <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">جنسية الكفيل</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={sponsorNationality} onChange={(e) => setSponsorNationality(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">صلة القرابة</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">سبب الدعوة</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={invitationReason} onChange={(e) => setInvitationReason(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">عمل الكفيل</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={sponsorWork} onChange={(e) => setSponsorWork(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">الدولة المقصودة</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={targetCountry} onChange={(e) => setTargetCountry(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">المدينة</label>
                    <input type="text" className="w-full p-2 text-xs bg-white border rounded-lg" value={targetCity} onChange={(e) => setTargetCity(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Left Side: Real-time A4 Print Sheet Preview */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start">
            <div className="bg-white text-slate-900 border border-slate-300 shadow-xl p-0 w-[210mm] min-h-[297mm] box-border relative font-serif text-right text-xs leading-relaxed text-[11px] rounded-lg p-10 print:shadow-none print:border-0 print:p-0 referral-print-preview">
              
              {/* Official Government Header */}
              <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-start text-[10px] leading-normal font-bold">
                <div className="w-1/3 text-right space-y-0.5">
                  <div className="border border-black px-2 py-0.5 mb-1 inline-block text-[11px]">الجمهورية اليمنية</div>
                  <div>وزارة الداخلية</div>
                  <div>قطاع الأمن والاستخبارات</div>
                  <div>الإدارة العامة لاستخبارات الشرطة</div>
                  <div>فرع مصلحة الهجرة والجوازات والجنسية</div>
                </div>

                <div className="w-1/3 flex flex-col items-center text-center">
                  <span className="text-[11px] font-bold mb-1.5">بسم الله الرحمن الرحيم</span>
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/0/00/Coat_of_arms_of_Yemen.svg" 
                    alt="شعار الجمهورية اليمنية" 
                    className="h-14 w-auto object-contain mb-1"
                    referrerPolicy="no-referrer"
                  />
                  <div className="border border-slate-900 px-3 py-1 font-black text-sm bg-slate-100 rounded">
                    اســـتــمـــارة تـــعـــھــد ( مدني )
                  </div>
                </div>

                <div className="w-1/3 flex flex-col items-end">
                  <div className="border border-dashed border-slate-400 w-24 h-28 flex items-center justify-center text-center text-[10px] text-slate-400 p-2 font-sans bg-slate-50 rounded">
                    صورة شخصية
                    <br />
                    (6×4)
                  </div>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-3 border border-black divide-x divide-x-reverse divide-black bg-slate-100/50 mb-3 text-center text-[10px] font-bold">
                <div className="p-1.5 flex justify-center gap-1">
                  <span>التاريخ:</span>
                  <span className="underline decoration-dotted font-mono">{dateG || '...... / ...... / 2026م'}</span>
                </div>
                <div className="p-1.5 flex justify-center gap-1">
                  <span>اليوم:</span>
                  <span className="underline decoration-dotted font-sans">{dayName || '.................'}</span>
                </div>
                <div className="p-1.5 flex justify-center gap-1">
                  <span>الموافق:</span>
                  <span className="underline decoration-dotted font-mono">{dateH || '...... / ...... / 1447هـ'}</span>
                </div>
              </div>

              {/* SECTION 1: PERSONAL INFO */}
              <div className="mb-3">
                <div className="bg-slate-800 text-white px-3 py-1 font-black text-[11px] mb-1.5">البيانات الشخصية</div>
                <table className="w-full border-collapse border border-black text-[11px]">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-1/6 bg-slate-100 p-1.5 font-bold border-l border-black">الاسم الرباعي:</td>
                      <td className="w-3/6 p-1.5 font-bold text-slate-900 text-sm">{fullName || '...........................................................................'}</td>
                      <td className="w-1/6 bg-slate-100 p-1.5 font-bold border-l border-r border-black">اللقب:</td>
                      <td className="w-1/6 p-1.5 font-bold">{title || '............................'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-black">الرقم الوطني:</td>
                      <td className="p-1.5 font-mono">{nationalId || '............................................'}</td>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-r border-black">رقم الهاتف:</td>
                      <td className="p-1.5 font-mono">{phone || '............................'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-black">محل الميلاد:</td>
                      <td className="p-1.5">{birthPlace || '............................................'}</td>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-r border-black">تاريخ الميلاد:</td>
                      <td className="p-1.5 font-mono">{birthDate || '............................'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-black">الحالة الاجتماعية:</td>
                      <td className="p-1.5">{socialStatus || '............................................'}</td>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-r border-black">المؤهل العلمي:</td>
                      <td className="p-1.5">{eduQualification || '............................'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-black">العمل السابق:</td>
                      <td className="p-1.5">{prevWork || '............................................'}</td>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-r border-black">العمل الحالي:</td>
                      <td className="p-1.5">{currentWork || '............................'}</td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-black">قريب درجة أولى:</td>
                      <td colSpan={3} className="p-1.5">
                        <span>هاتف قريب من الدرجة الأولى: </span>
                        <span className="font-mono">{relativePhone || '........................................................'}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION 2: CURRENT RESIDENCY */}
              <div className="mb-3">
                <div className="bg-slate-800 text-white px-3 py-1 font-black text-[11px] mb-1.5">بيانات الاقامة الحاليه</div>
                <table className="w-full border-collapse border border-black text-[11px]">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-1/6 bg-slate-100 p-1.5 font-bold border-l border-black">المحافظة:</td>
                      <td className="w-2/6 p-1.5">{governorate || '............................'}</td>
                      <td className="w-1/6 bg-slate-100 p-1.5 font-bold border-l border-r border-black">المديرية:</td>
                      <td className="w-2/6 p-1.5">{directorate || '............................'}</td>
                      <td className="w-1/6 bg-slate-100 p-1.5 font-bold border-l border-r border-black">العزلة:</td>
                      <td className="w-2/6 p-1.5">{uzlah || '............................'}</td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-black">قرية:</td>
                      <td className="p-1.5">{village || '............................'}</td>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-r border-black">حارة:</td>
                      <td className="p-1.5">{neighborhood || '............................'}</td>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-r border-black">شارع:</td>
                      <td className="p-1.5">{street || '............................'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION 3: PASSPORT INFO */}
              <div className="mb-3">
                <div className="bg-slate-800 text-white px-3 py-1 font-black text-[11px] mb-1.5">بيانات الجواز</div>
                <table className="w-full border-collapse border border-black text-[11px]">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-1/6 bg-slate-100 p-1.5 font-bold border-l border-black">رقم الجواز:</td>
                      <td className="w-2/6 p-1.5 font-bold font-mono">{passportNumber || '.....................................'}</td>
                      <td className="w-1/6 bg-slate-100 p-1.5 font-bold border-l border-r border-black">المهنة:</td>
                      <td className="w-2/6 p-1.5">{profession || '............................'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-black">جهة الاصدار:</td>
                      <td className="p-1.5">{issuePlace || '............................'}</td>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-r border-black">اسم المكتب:</td>
                      <td className="p-1.5">{officeName || '.....................................'}</td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-black">الغرض من السفر:</td>
                      <td className="p-1.5">{travelPurpose || '.....................................'}</td>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-r border-black">رقم الكفيل:</td>
                      <td className="p-1.5 font-mono">{sponsorNumber || '............................'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION 4: SPONSOR INFO */}
              <div className="mb-3">
                <div className="bg-slate-800 text-white px-3 py-1 font-black text-[11px] mb-1.5">بيانات الكفيل</div>
                <table className="w-full border-collapse border border-black text-[11px]">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-1/6 bg-slate-100 p-1.5 font-bold border-l border-black">اسم الكفيل:</td>
                      <td className="w-3/6 p-1.5 font-bold">{sponsorName || '...........................................................................'}</td>
                      <td className="w-1/6 bg-slate-100 p-1.5 font-bold border-l border-r border-black">جنسية الكفيل:</td>
                      <td className="w-1/6 p-1.5">{sponsorNationality || '............................'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-black">صلة القرابة:</td>
                      <td className="p-1.5">{relationship || '............................'}</td>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-r border-black">سبب الدعوة:</td>
                      <td className="p-1.5">{invitationReason || '.....................................................'}</td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-black">عمل الكفيل:</td>
                      <td className="p-1.5">{sponsorWork || '............................'}</td>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-r border-black">الدولة والمدينة:</td>
                      <td className="p-1.5">
                        <span>{targetCountry || '............'}</span>
                        <span className="mx-2">/</span>
                        <span>{targetCity || '............'}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* LEGAL DECLARATION & FINGERPRINT */}
              <div className="border border-black p-3.5 mb-4 rounded bg-slate-50/50 relative">
                <div className="flex justify-between items-start gap-4">
                  {/* Fingerprint area */}
                  <div className="flex flex-col items-center justify-center border border-black rounded-full w-20 h-20 shrink-0 bg-white">
                    <span className="text-[9px] font-black text-red-600 mb-0.5">البصمة</span>
                    <div className="w-12 h-12 border border-slate-300 rounded-full border-dashed"></div>
                  </div>

                  {/* Declaration text */}
                  <p className="text-[10px] text-justify leading-relaxed font-black text-red-600 border-r-2 border-red-500 pr-3">
                    "أقر بصحة البيانات المذكورة أعلاه؛ كما أتعهد وألتزم التزاماً كاملاً بعدم الانخراط أو التعاون مستقبلاً مع أي جهات أجنبية أو معادية بأي صورة كانت، وأقر بوجوب إبلاغ الجهات الأمنية فوراً عن أي محاولة للتواصل أو التجنيد، وأتحمل المسؤولية القانونية والجزائية الكاملة عن أي إخلال بهذا التعهد حفاظاً على أمن المجتمع والدولة وسيادتها، والله على ما أقول شهيد."
                  </p>
                </div>
              </div>

              {/* OFFICERS SIGNATURE AREA */}
              <div className="grid grid-cols-2 gap-8 text-center font-bold text-[10px] mt-6">
                <div>
                  <p className="text-slate-800 mb-8 font-black">المختص /</p>
                  <p className="text-slate-400">......................................................</p>
                </div>
                <div>
                  <p className="text-slate-800 mb-8 font-black">مدير فرع استخبارات الشرطة بمصلحة الهجرة والجوازات والجنسية</p>
                  <p className="text-slate-400">......................................................</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Global CSS style tags injected to force correct A4 printing layout */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .referral-print-preview, .referral-print-preview * {
            visibility: visible !important;
          }
          .referral-print-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            direction: rtl !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  );
}
