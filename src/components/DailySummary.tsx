import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  Upload, 
  FileCheck, 
  FileX, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Search, 
  Calendar,
  X,
  FileSpreadsheet,
  Building,
  Info,
  TrendingUp,
  AlertTriangle,
  Download,
  Globe
} from 'lucide-react';
import type { DailySummaryEntry, DailySummaryType, PassportDetail } from '../types';
import ReferralFormModal from './ReferralFormModal';

interface DailySummaryProps {
  onRefreshDocs?: () => void;
}

export default function DailySummary({ onRefreshDocs }: DailySummaryProps) {
  const [entries, setEntries] = useState<DailySummaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DailySummaryType>('delivery_passports');
  const [uploading, setUploading] = useState(false);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showStatsPrintView, setShowStatsPrintView] = useState(false);
  const [referralEntry, setReferralEntry] = useState<DailySummaryEntry | null>(null);

  // Numerical Reports State
  const [activeTab, setActiveTab] = useState<'records' | 'reports'>('records');
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportMonth, setReportMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());

  // Attachment proposal status
  const [showProposalInfo, setShowProposalInfo] = useState(true);

  // Form Fields State
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attachments, setAttachments] = useState<{ name: string; url: string; size?: string }[]>([]);

  // 1. تسليم جوازات
  const [delName, setDelName] = useState('');
  const [delNationality, setDelNationality] = useState('يمني');
  const [delPassportNum, setDelPassportNum] = useState('');
  const [delDocNum, setDelDocNum] = useState('');
  const [delPhone, setDelPhone] = useState('');
  const [delAddress, setDelAddress] = useState('');
  const [delJob, setDelJob] = useState('');
  const [delEntryDate, setDelEntryDate] = useState('');
  const [delVisitType, setDelVisitType] = useState('زيارة عمل');
  const [delVisitExpiry, setDelVisitExpiry] = useState('');
  const [delSponsorName, setDelSponsorName] = useState('');
  const [delSponsorPhone, setDelSponsorPhone] = useState('');

  // 2 & 3. استلام جوازات / محاضر ضبط
  const [recPortName, setRecPortName] = useState('');
  const [recRecordNum, setRecRecordNum] = useState('');
  const [recRecordDate, setRecRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recPassportsCount, setRecPassportsCount] = useState<number>(1);
  const [recPassportDetails, setRecPassportDetails] = useState<Omit<PassportDetail, 'id'>[]>([
    { fullName: '', nationality: 'يمني', passportNumber: '', phone: '', address: '', work: '', entryDate: '', visitType: 'زيارة عمل', visitExpiry: '', sponsorName: '', sponsorPhone: '' }
  ]);

  // 4. استلام طلبات تجديد اقامة من الخارجية
  const [reqMemoNum, setReqMemoNum] = useState('');
  const [reqMemoDate, setReqMemoDate] = useState(new Date().toISOString().split('T')[0]);
  const [reqPersonName, setReqPersonName] = useState('');
  const [reqAffiliation, setReqAffiliation] = useState<'un_office' | 'un_envoy' | 'other'>('un_office');
  const [reqJobTitle, setReqJobTitle] = useState('');
  const [reqGovernorate, setReqGovernorate] = useState('صنعاء');
  const [reqActions, setReqActions] = useState('');
  const [reqStatus, setReqStatus] = useState<'completed' | 'pending'>('pending');
  const [reqNationality, setReqNationality] = useState('أجنبي');
  const [reqPassportNum, setReqPassportNum] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqAddress, setReqAddress] = useState('');
  const [reqEntryDate, setReqEntryDate] = useState('');
  const [reqVisitType, setReqVisitType] = useState('زيارة عمل');
  const [reqVisitExpiry, setReqVisitExpiry] = useState('');
  const [reqSponsorName, setReqSponsorName] = useState('');
  const [reqSponsorPhone, setReqSponsorPhone] = useState('');

  // 5 & 6. مذكرات واردة وصادرة
  const [memoNum, setMemoNum] = useState('');
  const [memSector, setMemSector] = useState('مصلحة الهجرة والجوازات والجنسية');
  const [memAddress, setMemAddress] = useState('');
  const [memSubject, setMemSubject] = useState('');
  const [memActions, setMemActions] = useState('');
  const [memStatus, setMemStatus] = useState<'needs_response' | 'pending' | 'responded'>('pending');
  const [memResponseDocNum, setMemResponseDocNum] = useState('');
  const [memIncomingRefNum, setMemIncomingRefNum] = useState('');

  // Dropdown options for Ministry of Interior Sectors
  const interiorSectors = [
    'مكتب وزير الداخلية',
    'مصلحة الهجرة والجوازات والجنسية',
    'قطاع استخبارات الشرطة',
    'قطاع الأمن والشرطة',
    'قطاع الخدمات المدنية',
    'مصلحة الأحوال المدنية والسجل المدني',
    'مصلحة الدفاع المدني',
    'مصلحة التأهيل والإصلاح',
    'الإدارة العامة للبحث الجنائي',
    'الإدارة العامة لشرطة السير',
    'الإدارة العامة لمكافحة المخدرات',
    'الإدارة العامة لشرطة حراسة الحدود',
    'الإدارة العامة لحراسة المنشآت وحماية الشخصيات',
    'قوات الأمن الخاصة',
    'إدارة أمن العاصمة',
    'إدارة أمن محافظة عدن',
    'إدارة أمن محافظة تعز',
    'إدارة أمن محافظة مأرب',
    'إدارة أمن محافظة حضرموت'
  ];

  // Yemeni Governorates list
  const governorates = [
    'صنعاء', 'عدن', 'تعز', 'مأرب', 'الحديدة', 'حضرموت', 'أبين', 'شبوة', 
    'لحج', 'الضالع', 'البيضاء', 'إب', 'ذمار', 'عمران', 'حجة', 'صعدة', 
    'الجوف', 'المهرة', 'أرخبيل سقطرى', 'ريمة', 'المحويت'
  ];

  useEffect(() => {
    fetchEntries();
    
    // Listen for live status updates from the notifications bell
    const handleUpdate = () => {
      fetchEntries();
    };
    window.addEventListener('daily-summary-updated', handleUpdate);
    return () => {
      window.removeEventListener('daily-summary-updated', handleUpdate);
    };
  }, []);

  // Update passport details list when recPassportsCount changes
  useEffect(() => {
    const count = Math.max(1, recPassportsCount);
    setRecPassportDetails(prev => {
      const next = [...prev];
      if (next.length < count) {
        while (next.length < count) {
          next.push({ 
            fullName: '', 
            nationality: 'يمني', 
            passportNumber: '', 
            phone: '', 
            address: '', 
            work: '', 
            entryDate: '', 
            visitType: 'زيارة عمل', 
            visitExpiry: '', 
            sponsorName: '', 
            sponsorPhone: '' 
          });
        }
      } else if (next.length > count) {
        return next.slice(0, count);
      }
      return next;
    });
  }, [recPassportsCount]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/daily-summaries');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error('Failed to fetch daily summaries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: file.name, base64 })
          });
          const uploaded = await res.json();
          setAttachments(prev => [...prev, { name: uploaded.name, url: uploaded.url, size: `${(file.size / 1024).toFixed(1)} KB` }]);
        } catch (err) {
          console.error('Upload failed', err);
        }
      };
      reader.readAsDataURL(file);
    }
    setUploading(false);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القيد؟')) return;
    try {
      await fetch(`/api/daily-summaries/${id}`, { method: 'DELETE' });
      fetchEntries();
      if (onRefreshDocs) onRefreshDocs();
    } catch (err) {
      console.error('Failed to delete entry', err);
    }
  };

  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setAttachments([]);
    setDelName('');
    setDelNationality('يمني');
    setDelPassportNum('');
    setDelDocNum('');
    setDelPhone('');
    setDelAddress('');
    setDelJob('');
    setDelEntryDate('');
    setDelVisitType('زيارة عمل');
    setDelVisitExpiry('');
    setDelSponsorName('');
    setDelSponsorPhone('');

    setRecPortName('');
    setRecRecordNum('');
    setRecRecordDate(new Date().toISOString().split('T')[0]);
    setRecPassportsCount(1);
    setRecPassportDetails([{ 
      fullName: '', 
      nationality: 'يمني', 
      passportNumber: '', 
      phone: '', 
      address: '', 
      work: '', 
      entryDate: '', 
      visitType: 'زيارة عمل', 
      visitExpiry: '', 
      sponsorName: '', 
      sponsorPhone: '' 
    }]);

    setReqMemoNum('');
    setReqMemoDate(new Date().toISOString().split('T')[0]);
    setReqPersonName('');
    setReqAffiliation('un_office');
    setReqJobTitle('');
    setReqGovernorate('صنعاء');
    setReqActions('');
    setReqStatus('pending');
    setReqNationality('أجنبي');
    setReqPassportNum('');
    setReqPhone('');
    setReqAddress('');
    setReqEntryDate('');
    setReqVisitType('زيارة عمل');
    setReqVisitExpiry('');
    setReqSponsorName('');
    setReqSponsorPhone('');

    setMemoNum('');
    setMemAddress('');
    setMemSubject('');
    setMemActions('');
    setMemStatus('pending');
    setMemResponseDocNum('');
    setMemIncomingRefNum('');
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct the payload based on selected type
    const payload: Partial<DailySummaryEntry> = {
      type: selectedType,
      date: formDate,
      attachments: attachments
    };

    if (selectedType === 'delivery_passports') {
      payload.delivery_passports = {
        fullName: delName,
        nationality: delNationality,
        passportNumber: delPassportNum,
        docNumber: delDocNum,
        phone: delPhone || undefined,
        address: delAddress || undefined,
        work: delJob || undefined,
        entryDate: delNationality !== 'يمني' ? delEntryDate || undefined : undefined,
        visitType: delNationality !== 'يمني' ? delVisitType || undefined : undefined,
        visitExpiry: delNationality !== 'يمني' ? delVisitExpiry || undefined : undefined,
        sponsorName: delNationality !== 'يمني' ? delSponsorName || undefined : undefined,
        sponsorPhone: delNationality !== 'يمني' ? delSponsorPhone || undefined : undefined
      };
    } else if (selectedType === 'receive_passports') {
      payload.receive_passports = {
        portName: recPortName,
        recordNumber: recRecordNum,
        recordDate: recRecordDate,
        passportsCount: recPassportsCount,
        passportDetails: recPassportDetails.map((p, idx) => ({ 
          ...p, 
          id: `p-${idx}`,
          entryDate: p.nationality !== 'يمني' ? p.entryDate : undefined,
          visitType: p.nationality !== 'يمني' ? p.visitType : undefined,
          visitExpiry: p.nationality !== 'يمني' ? p.visitExpiry : undefined,
          sponsorName: p.nationality !== 'يمني' ? p.sponsorName : undefined,
          sponsorPhone: p.nationality !== 'يمني' ? p.sponsorPhone : undefined
        }))
      };
    } else if (selectedType === 'receive_seizure_records') {
      payload.receive_seizure_records = {
        portName: recPortName,
        recordNumber: recRecordNum,
        recordDate: recRecordDate,
        passportsCount: recPassportsCount,
        passportDetails: recPassportDetails.map((p, idx) => ({ 
          ...p, 
          id: `p-${idx}`,
          entryDate: p.nationality !== 'يمني' ? p.entryDate : undefined,
          visitType: p.nationality !== 'يمني' ? p.visitType : undefined,
          visitExpiry: p.nationality !== 'يمني' ? p.visitExpiry : undefined,
          sponsorName: p.nationality !== 'يمني' ? p.sponsorName : undefined,
          sponsorPhone: p.nationality !== 'يمني' ? p.sponsorPhone : undefined
        }))
      };
    } else if (selectedType === 'residency_renewal_requests') {
      payload.residency_renewal_requests = {
        memoNumber: reqMemoNum,
        memoDate: reqMemoDate,
        personName: reqPersonName,
        affiliation: reqAffiliation,
        jobTitle: reqJobTitle,
        governorate: reqGovernorate,
        actionsTaken: reqActions,
        status: reqStatus,
        nationality: reqNationality,
        passportNumber: reqPassportNum || undefined,
        phone: reqPhone || undefined,
        address: reqAddress || undefined,
        work: reqJobTitle || undefined,
        entryDate: reqNationality !== 'يمني' ? reqEntryDate || undefined : undefined,
        visitType: reqNationality !== 'يمني' ? reqVisitType || undefined : undefined,
        visitExpiry: reqNationality !== 'يمني' ? reqVisitExpiry || undefined : undefined,
        sponsorName: reqNationality !== 'يمني' ? reqSponsorName || undefined : undefined,
        sponsorPhone: reqNationality !== 'يمني' ? reqSponsorPhone || undefined : undefined
      };
    } else if (selectedType === 'incoming_memos') {
      payload.incoming_memos = {
        incomingNumber: memoNum,
        senderSector: memSector,
        address: memAddress,
        subjectSummary: memSubject,
        actionsTaken: memActions,
        status: memStatus,
        responseDocNumber: memStatus === 'responded' ? memResponseDocNum : undefined
      };
    } else if (selectedType === 'outgoing_memos') {
      payload.outgoing_memos = {
        outgoingNumber: memoNum,
        recipientSector: memSector,
        address: memAddress,
        subjectSummary: memSubject,
        actionsTaken: memActions,
        status: memStatus,
        incomingRefNumber: memIncomingRefNum || undefined
      };
    }

    try {
      const res = await fetch('/api/daily-summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        resetForm();
        fetchEntries();
        if (onRefreshDocs) onRefreshDocs();
      }
    } catch (err) {
      console.error('Failed to save summary log', err);
    }
  };

  // Helper date conversions
  const getArabicWeekday = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return weekdays[date.getDay()];
  };

  const getHijriDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return formatter.format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const getGregorianDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const formatter = new Intl.DateTimeFormat('ar-YE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return formatter.format(date);
    } catch (e) {
      return dateStr;
    }
  };

  // Build the narrative sentence of what was achieved in this log
  const buildNarrativeSentence = (entry: DailySummaryEntry) => {
    switch (entry.type) {
      case 'delivery_passports': {
        const p = entry.delivery_passports;
        let suffix = '';
        if (p?.phone) suffix += `، هاتف: ${p.phone}`;
        if (p?.address) suffix += `، سكن: ${p.address}`;
        if (p?.work) suffix += `، عمل: ${p.work}`;
        if (p?.nationality !== 'يمني') {
          if (p?.entryDate) suffix += `، دخول: ${p.entryDate}`;
          if (p?.visitType) suffix += `، نوع الزيارة: ${p.visitType}`;
          if (p?.visitExpiry) suffix += `، انتهاء الزيارة: ${p.visitExpiry}`;
          if (p?.sponsorName) suffix += `، الكفيل: ${p.sponsorName}`;
          if (p?.sponsorPhone) suffix += `، هاتف الكفيل: ${p.sponsorPhone}`;
        }
        return `تم تسليم جواز السفر للمدعو/ة ${p?.fullName} (الجنسية: ${p?.nationality}، جواز رقم: ${p?.passportNumber}${suffix})، وتم توثيقه صادر رقم ${p?.docNumber || 'معلق'}.`;
      }
      case 'receive_passports': {
        const p = entry.receive_passports;
        const passportsStr = p?.passportDetails?.map(x => {
          let suffix = '';
          if (x.phone) suffix += `، هاتف: ${x.phone}`;
          if (x.address) suffix += `، سكن: ${x.address}`;
          if (x.work) suffix += `، عمل: ${x.work}`;
          if (x.nationality !== 'يمني') {
            if (x.entryDate) suffix += `، دخول: ${x.entryDate}`;
            if (x.visitType) suffix += `، نوع الزيارة: ${x.visitType}`;
            if (x.visitExpiry) suffix += `، انتهاء الزيارة: ${x.visitExpiry}`;
            if (x.sponsorName) suffix += `، الكفيل: ${x.sponsorName}`;
            if (x.sponsorPhone) suffix += `، هاتف الكفيل: ${x.sponsorPhone}`;
          }
          return `${x.fullName} (الجنسية: ${x.nationality}، جواز رقم: ${x.passportNumber}${suffix})`;
        }).join('، و');
        return `تم استلام عدد (${p?.passportsCount}) جوازات سفر من منفذ ${p?.portName} بموجب محضر الضبط رقم (${p?.recordNumber}) المؤرخ في ${p?.recordDate}، والبيانات الشخصية كالتالي: ${passportsStr || 'لا توجد بيانات شخصية مضافه'}.`;
      }
      case 'receive_seizure_records': {
        const p = entry.receive_seizure_records;
        const passportsStr = p?.passportDetails?.map(x => {
          let suffix = '';
          if (x.phone) suffix += `، هاتف: ${x.phone}`;
          if (x.address) suffix += `، سكن: ${x.address}`;
          if (x.work) suffix += `، عمل: ${x.work}`;
          if (x.nationality !== 'يمني') {
            if (x.entryDate) suffix += `، دخول: ${x.entryDate}`;
            if (x.visitType) suffix += `، نوع الزيارة: ${x.visitType}`;
            if (x.visitExpiry) suffix += `، انتهاء الزيارة: ${x.visitExpiry}`;
            if (x.sponsorName) suffix += `، الكفيل: ${x.sponsorName}`;
            if (x.sponsorPhone) suffix += `، هاتف الكفيل: ${x.sponsorPhone}`;
          }
          return `${x.fullName} (الجنسية: ${x.nationality}، جواز رقم: ${x.passportNumber}${suffix})`;
        }).join('، و');
        return `تم استلام محضر ضبط رقم (${p?.recordNumber}) وارد من منفذ ${p?.portName} بتاريخ ${p?.recordDate} وبصحبته عدد (${p?.passportsCount}) جوازات سفر مضبوطة للآتية أسماؤهم: ${passportsStr || 'لا توجد بيانات شخصية مضافة'}.`;
      }
      case 'residency_renewal_requests': {
        const p = entry.residency_renewal_requests;
        const aff = p?.affiliation === 'un_office' ? 'مكتب الأمم المتحدة' : p?.affiliation === 'un_envoy' ? 'المبعوث الأممي' : 'جهة أخرى';
        const statusStr = p?.status === 'completed' ? 'وقد تم إنجاز المعاملة كلياً' : 'وهي قيد المتابعة والدراسة حالياً';
        let suffix = '';
        if (p?.nationality) suffix += `، الجنسية: ${p.nationality}`;
        if (p?.passportNumber) suffix += `، جواز/بطاقة رقم: ${p.passportNumber}`;
        if (p?.phone) suffix += `، هاتف: ${p.phone}`;
        if (p?.address) suffix += `، سكن: ${p.address}`;
        if (p?.work) suffix += `، عمل: ${p.work}`;
        if (p?.nationality && p.nationality !== 'يمني') {
          if (p?.entryDate) suffix += `، دخول: ${p.entryDate}`;
          if (p?.visitType) suffix += `، نوع الزيارة: ${p.visitType}`;
          if (p?.visitExpiry) suffix += `، انتهاء الزيارة: ${p.visitExpiry}`;
          if (p?.sponsorName) suffix += `، الكفيل: ${p.sponsorName}`;
          if (p?.sponsorPhone) suffix += `، هاتف الكفيل: ${p.sponsorPhone}`;
        }
        return `تم استلام طلب تجديد إقامة وارد من وزارة الخارجية برقم مذكرة (${p?.memoNumber}) بتاريخ ${p?.memoDate}، يخص الشخص المطلوب تجديد إقامته المدعو/ة ${p?.personName}${suffix}، وهو ${aff} بصفة وظيفة (${p?.jobTitle}) المستقر في محافظة (${p?.governorate}). الإجراءات المتخذة: ${p?.actionsTaken || 'لا يوجد'}، ${statusStr}.`;
      }
      case 'incoming_memos': {
        const p = entry.incoming_memos;
        let responseStr = '';
        if (p?.status === 'responded') {
          responseStr = `وقد تم الرد عليها وإصدار مذكرة رد برقم صادر (${p.responseDocNumber || 'مكتمل'}).`;
        } else if (p?.status === 'needs_response') {
          responseStr = `والمعاملة بحاجة إلى إعداد صادر رد ومتابعة عاجلة.`;
        } else {
          responseStr = `والمعاملة ما زالت قيد الدراسة والمتابعة الأمنية.`;
        }
        return `تم استلام وقيد المذكرة الواردة برقم وارد (${p?.incomingNumber}) والمقيدة من (${p?.senderSector} - ${p?.address}) بخصوص موضوع: (${p?.subjectSummary})، وتم اتخاذ الإجراءات التالية: ${p?.actionsTaken || 'قيد الإجراء'}، ${responseStr}`;
      }
      case 'outgoing_memos': {
        const p = entry.outgoing_memos;
        const refStr = p?.incomingRefNumber ? `رداً على المذكرة الواردة رقم (${p.incomingRefNumber})` : 'مذكرة صادرة عامة';
        return `تم تصدير وإرسال المذكرة رقم (${p?.outgoingNumber}) الموجهة إلى (${p?.recipientSector} - ${p?.address}) بشأن موضوع: (${p?.subjectSummary})، ${refStr}. الإجراءات والتدابير المتخذة: ${p?.actionsTaken || 'مكتملة الصياغة'}.`;
      }
      default:
        return 'قيد غير معروف';
    }
  };

  const getTypeNameAr = (type: DailySummaryType) => {
    switch (type) {
      case 'delivery_passports': return 'تسليم جوازات';
      case 'receive_passports': return 'استلام جوازات';
      case 'receive_seizure_records': return 'استلام محاضر ضبط';
      case 'residency_renewal_requests': return 'طلب تجديد إقامة من الخارجية';
      case 'incoming_memos': return 'مذكرة / تعميم وارد';
      case 'outgoing_memos': return 'مذكرة صادرة للقطاعات';
    }
  };

  const getReportData = () => {
    let filtered = [...entries];
    if (reportType === 'daily') {
      filtered = entries.filter(e => e.date === reportDate);
    } else if (reportType === 'monthly') {
      const prefix = `${reportYear}-${reportMonth.toString().padStart(2, '0')}`;
      filtered = entries.filter(e => e.date.startsWith(prefix));
    } else if (reportType === 'yearly') {
      const prefix = `${reportYear}`;
      filtered = entries.filter(e => e.date.startsWith(prefix));
    }

    const stats = {
      deliveryCount: 0,
      receiveCount: 0,
      seizureCount: 0,
      residencyCount: 0,
      incomingCount: 0,
      outgoingCount: 0,
      totalEntries: filtered.length,
      actualPassportsReceived: 0,
      actualSeizedPassports: 0,
      nonYemeniCount: 0,
      nonYemeniDetailList: [] as { name: string; passport: string; nationality: string; visitExpiry?: string; phone?: string; type: string; sponsorName?: string; sponsorPhone?: string }[]
    };

    filtered.forEach(e => {
      if (e.type === 'delivery_passports') {
        stats.deliveryCount++;
        const dp = e.delivery_passports;
        if (dp) {
          if (dp.nationality !== 'يمني') {
            stats.nonYemeniCount++;
            stats.nonYemeniDetailList.push({
              name: dp.fullName,
              passport: dp.passportNumber,
              nationality: dp.nationality,
              visitExpiry: dp.visitExpiry,
              phone: dp.phone,
              type: 'تسليم جواز',
              sponsorName: dp.sponsorName,
              sponsorPhone: dp.sponsorPhone
            });
          }
        }
      } else if (e.type === 'receive_passports') {
        stats.receiveCount++;
        const rp = e.receive_passports;
        if (rp) {
          stats.actualPassportsReceived += (rp.passportsCount || 0);
          if (rp.passportDetails) {
            rp.passportDetails.forEach(p => {
              if (p.nationality !== 'يمني') {
                stats.nonYemeniCount++;
                stats.nonYemeniDetailList.push({
                  name: p.fullName,
                  passport: p.passportNumber,
                  nationality: p.nationality,
                  visitExpiry: p.visitExpiry,
                  phone: p.phone,
                  type: 'استلام جواز',
                  sponsorName: p.sponsorName,
                  sponsorPhone: p.sponsorPhone
                });
              }
            });
          }
        }
      } else if (e.type === 'receive_seizure_records') {
        stats.seizureCount++;
        const rs = e.receive_seizure_records;
        if (rs) {
          stats.actualPassportsReceived += (rs.passportsCount || 0);
          stats.actualSeizedPassports += (rs.passportsCount || 0);
          if (rs.passportDetails) {
            rs.passportDetails.forEach(p => {
              if (p.nationality !== 'يمني') {
                stats.nonYemeniCount++;
                stats.nonYemeniDetailList.push({
                  name: p.fullName,
                  passport: p.passportNumber,
                  nationality: p.nationality,
                  visitExpiry: p.visitExpiry,
                  phone: p.phone,
                  type: 'محضر ضبط',
                  sponsorName: p.sponsorName,
                  sponsorPhone: p.sponsorPhone
                });
              }
            });
          }
        }
      } else if (e.type === 'residency_renewal_requests') {
        stats.residencyCount++;
        const rr = e.residency_renewal_requests;
        if (rr) {
          if (rr.nationality !== 'يمني') {
            stats.nonYemeniCount++;
            stats.nonYemeniDetailList.push({
              name: rr.personName,
              passport: rr.passportNumber || 'لا يوجد',
              nationality: rr.nationality,
              visitExpiry: rr.visitExpiry,
              phone: rr.phone,
              type: 'تجديد إقامة',
              sponsorName: rr.sponsorName,
              sponsorPhone: rr.sponsorPhone
            });
          }
        }
      } else if (e.type === 'incoming_memos') {
        stats.incomingCount++;
      } else if (e.type === 'outgoing_memos') {
        stats.outgoingCount++;
      }
    });

    return { filtered, stats };
  };

  const getExpiryAlertBadge = (expiryStr?: string) => {
    if (!expiryStr) return <span className="text-gray-400 font-bold">مستمر</span>;
    const expiryDate = new Date(expiryStr);
    const today = new Date();
    expiryDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-xs px-2.5 py-1 rounded-full font-black">
          <AlertTriangle size={12} className="text-red-600" />
          منتهي (منذ {-diffDays} يوم)
        </span>
      );
    } else if (diffDays <= 15) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-2.5 py-1 rounded-full font-black animate-pulse">
          <AlertTriangle size={12} className="text-amber-600" />
          وشيك (متبقي {diffDays} يوم)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-black">
          <CheckCircle2 size={12} className="text-emerald-600" />
          ساري (متبقي {diffDays} يوم)
        </span>
      );
    }
  };

  const handleExportCSV = () => {
    const { stats } = getReportData();
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "نوع المعاملة,العدد المقيد,الارتباط العملياتي\n";
    csvContent += `تسليم جوازات سفر,${stats.deliveryCount},صادر\n`;
    csvContent += `استلام جوازات سفر,${stats.receiveCount},وارد\n`;
    csvContent += `استلام محاضر ضبط الجوازات,${stats.seizureCount},وارد\n`;
    csvContent += `طلبات تجديد إقامة من الخارجية,${stats.residencyCount},وارد\n`;
    csvContent += `تعاميم ومذكرات واردة,${stats.incomingCount},وارد\n`;
    csvContent += `تعاميم ومذكرات صادرة,${stats.outgoingCount},صادر\n`;
    csvContent += `المجموع الكلي للمعاملات,${stats.totalEntries},-\n`;
    csvContent += `جوازات السفر المستلمة فعلياً,${stats.actualPassportsReceived},-\n`;
    csvContent += `جوازات السفر المضبوطة بمحضر,${stats.actualSeizedPassports},-\n`;
    csvContent += `معاملات الأشخاص الأجانب,${stats.nonYemeniCount},-\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const filename = `التقرير_الاحصائي_${reportType}_${reportDate || reportYear}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEntries = entries.filter(e => e.date === filterDate);

  if (showPrintView) {
    return (
      <div className="bg-white min-h-screen p-8 text-black font-serif dir-rtl" style={{ direction: 'rtl' }}>
        <div className="flex justify-between items-center no-print mb-8 bg-slate-100 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <Printer size={20} className="text-slate-800" />
            <span className="font-bold">معاينة خلاصة التقرير اليومي قبل الطباعة</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()} 
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 shadow"
            >
              <Printer size={16} />
              تأكيد الطباعة
            </button>
            <button 
              onClick={() => setShowPrintView(false)} 
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg font-bold"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>

        {/* Official Header */}
        <div className="border-b-4 border-double border-black pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div className="text-right space-y-1">
              <div className="border border-black p-1 px-4 mb-2 inline-block">
                <h2 className="text-lg font-bold leading-none">الجمهورية اليمنية</h2>
              </div>
              <h3 className="text-sm font-bold">وزارة الداخلية</h3>
              <h3 className="text-sm font-bold">قطاع استخبارات الشرطة</h3>
              <h4 className="text-sm font-bold">فرع مصلحة الهجرة والجوازات والجنسية</h4>
            </div>

            <div className="flex flex-col items-center flex-1 text-center">
              <h1 className="text-lg font-bold mb-2">بسم الله الرحمن الرحيم</h1>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/0/00/Coat_of_arms_of_Yemen.svg" 
                alt="شعار الجمهورية اليمنية" 
                className="h-20 w-auto object-contain mb-2"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-xl font-bold tracking-tight border-b-2 border-black px-4 pb-1">التقرير اليومي وخلاصة الأعمال المنجزة</h2>
            </div>

            <div className="text-right space-y-2 text-sm min-w-[200px]">
              <div className="flex justify-between">
                <span className="font-bold">التقرير ليوم:</span>
                <span className="border-b border-dotted border-black px-2 flex-1 text-center font-semibold">{getArabicWeekday(filterDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">التاريخ الهجري:</span>
                <span className="border-b border-dotted border-black px-2 flex-1 text-center font-semibold">{getHijriDate(filterDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">الموافق ميلادي:</span>
                <span className="border-b border-dotted border-black px-2 flex-1 text-center font-semibold">{getGregorianDate(filterDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Report Content */}
        <div className="space-y-6 text-lg leading-relaxed text-slate-900 pr-4">
          <p className="font-bold text-xl border-r-4 border-slate-900 pr-3 mb-6 bg-slate-50 py-1">
            كشف تفصيلي بالمعاملات والإنجازات الأمنية واليومية المقيدة:
          </p>

          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic border border-dashed border-gray-300 rounded-lg">
              لا توجد معاملات مسجلة في هذا اليوم المحدد ({getArabicWeekday(filterDate)} الموافق {getGregorianDate(filterDate)}).
            </div>
          ) : (
            <ol className="list-decimal list-inside space-y-4 pr-2">
              {filteredEntries.map((entry, idx) => (
                <li key={entry.id} className="pb-3 border-b border-gray-100 last:border-0">
                  <span className="font-bold text-slate-800 ml-1">({getTypeNameAr(entry.type)}) - </span>
                  <span className="text-justify">{buildNarrativeSentence(entry)}</span>
                  
                  {/* Print attachments note if any */}
                  {entry.attachments && entry.attachments.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 mr-6 flex items-center gap-1">
                      <span className="font-semibold">المرفقات المقيدة:</span>
                      <span>{entry.attachments.map(a => a.name).join(' ، ')}</span>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-24 pt-12 border-t border-gray-200 text-center">
          <div>
            <p className="font-bold text-gray-800">المختص / كاتب الخلاصة اليومية</p>
            <p className="text-gray-500 mt-12">..........................................</p>
          </div>
          <div>
            <p className="font-bold text-gray-800">مدير فرع استخبارات الشرطة بمصلحة الهجرة والجوازات</p>
            <p className="text-gray-500 mt-12">..........................................</p>
          </div>
        </div>
      </div>
    );
  }

  if (showStatsPrintView) {
    const { stats } = getReportData();
    const periodStr = reportType === 'daily' 
      ? `ليوم ${getArabicWeekday(reportDate)} الموافق ${getGregorianDate(reportDate)}`
      : reportType === 'monthly'
      ? `لشهر (${reportMonth}) لعام (${reportYear})`
      : `لعام (${reportYear})`;

    return (
      <div className="bg-white min-h-screen p-8 text-black font-serif dir-rtl" style={{ direction: 'rtl' }}>
        <div className="flex justify-between items-center no-print mb-8 bg-slate-100 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <Printer size={20} className="text-slate-800" />
            <span className="font-bold">معاينة التقرير الإحصائي والعددي قبل الطباعة</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()} 
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 shadow animate-pulse"
            >
              <Printer size={16} />
              تأكيد الطباعة
            </button>
            <button 
              onClick={() => setShowStatsPrintView(false)} 
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg font-bold"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>

        {/* Official Header */}
        <div className="border-b-4 border-double border-black pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div className="text-right space-y-1">
              <div className="border border-black p-1 px-4 mb-2 inline-block">
                <h2 className="text-lg font-bold leading-none">الجمهورية اليمنية</h2>
              </div>
              <h3 className="text-sm font-bold">وزارة الداخلية</h3>
              <h3 className="text-sm font-bold">قطاع استخبارات الشرطة</h3>
              <h4 className="text-sm font-bold">فرع مصلحة الهجرة والجوازات والجنسية</h4>
            </div>

            <div className="flex flex-col items-center flex-1 text-center">
              <h1 className="text-lg font-bold mb-2">بسم الله الرحمن الرحيم</h1>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/0/00/Coat_of_arms_of_Yemen.svg" 
                alt="شعار الجمهورية اليمنية" 
                className="h-20 w-auto object-contain mb-2"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-xl font-bold tracking-tight border-b-2 border-black px-4 pb-1">التقرير الإحصائي العددي العام</h2>
              <span className="text-md font-bold mt-1 text-slate-700">{periodStr}</span>
            </div>

            <div className="text-right space-y-2 text-sm min-w-[200px]">
              <div className="flex justify-between">
                <span className="font-bold">تاريخ الطباعة:</span>
                <span className="border-b border-dotted border-black px-2 flex-1 text-center font-semibold">{getGregorianDate(new Date().toISOString().split('T')[0])}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistical Summary Grid */}
        <div className="space-y-6">
          <h3 className="text-xl font-black border-r-4 border-black pr-3 pb-1 mb-4 bg-slate-50">أولاً: الملخص العددي العام للمقيدات</h3>
          
          <table className="w-full border-collapse border border-black text-center text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-black p-2 font-bold">نوع المعاملة / القيد الإداري</th>
                <th className="border border-black p-2 font-bold">إجمالي القيود</th>
                <th className="border border-black p-2 font-bold">الارتباط بالأرشيف</th>
                <th className="border border-black p-2 font-bold">التفاصيل / المرفقات المقيدة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold">تسليم جوازات سفر</td>
                <td className="border border-black p-2 font-semibold">{stats.deliveryCount}</td>
                <td className="border border-black p-2">مرتبط بالصادر</td>
                <td className="border border-black p-2">تسليم شخصي للمواطنين</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">استلام جوازات سفر</td>
                <td className="border border-black p-2 font-semibold">{stats.receiveCount}</td>
                <td className="border border-black p-2">مرتبط بالوارد</td>
                <td className="border border-black p-2">استلام منافذ ضبط ({stats.actualPassportsReceived} جواز)</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">استلام محاضر ضبط الجوازات</td>
                <td className="border border-black p-2 font-semibold">{stats.seizureCount}</td>
                <td className="border border-black p-2">مرتبط بالوارد</td>
                <td className="border border-black p-2">محاضر ضبط قانونية للوافدين والمغادرين</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">طلبات تجديد إقامة من الخارجية</td>
                <td className="border border-black p-2 font-semibold">{stats.residencyCount}</td>
                <td className="border border-black p-2">مرتبط بالوارد</td>
                <td className="border border-black p-2">بعثات، سفارات، ووكالات أممية</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">تعاميم ومذكرات واردة</td>
                <td className="border border-black p-2 font-semibold">{stats.incomingCount}</td>
                <td className="border border-black p-2">مرتبط بالوارد</td>
                <td className="border border-black p-2">توجيهات وبلاغات أمنية عليا</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">تعاميم ومذكرات صادرة</td>
                <td className="border border-black p-2 font-semibold">{stats.outgoingCount}</td>
                <td className="border border-black p-2">مرتبط بالصادر</td>
                <td className="border border-black p-2">تقارير إحالة وردود رسمية للقطاعات</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="border border-black p-2 font-black">المجموع الإجمالي للقيود</td>
                <td className="border border-black p-2 text-lg font-black">{stats.totalEntries}</td>
                <td className="border border-black p-2">-</td>
                <td className="border border-black p-2">إجمالي جوازات مستلمة ومضبوطة: {stats.actualPassportsReceived}</td>
              </tr>
            </tbody>
          </table>

          {stats.nonYemeniDetailList.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-black border-r-4 border-black pr-3 pb-1 mb-4 bg-slate-50">ثانياً: تفصيل المعاملات الخاصة بغير اليمنيين (الأجانب)</h3>
              <table className="w-full border-collapse border border-black text-center text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-black p-2 font-bold">الاسم الرباعي</th>
                    <th className="border border-black p-2 font-bold">الجنسية</th>
                    <th className="border border-black p-2 font-bold">رقم الجواز</th>
                    <th className="border border-black p-2 font-bold">نوع المعاملة</th>
                    <th className="border border-black p-2 font-bold">تاريخ انتهاء الزيارة / الإقامة</th>
                    <th className="border border-black p-2 font-bold">الكفيل / الضامن باليمن</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.nonYemeniDetailList.map((visitor, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-2 font-bold">{visitor.name}</td>
                      <td className="border border-black p-2">{visitor.nationality}</td>
                      <td className="border border-black p-2 font-mono">{visitor.passport}</td>
                      <td className="border border-black p-2">{visitor.type}</td>
                      <td className="border border-black p-2 font-mono text-center">
                        {visitor.visitExpiry ? getGregorianDate(visitor.visitExpiry) : 'غير محدد'}
                      </td>
                      <td className="border border-black p-2">{visitor.sponsorName || 'لا يوجد'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-24 pt-12 border-t border-black text-center">
          <div>
            <p className="font-bold">المختص الإحصائي / فرع الاستخبارات</p>
            <p className="mt-12">..........................................</p>
          </div>
          <div>
            <p className="font-bold">مدير فرع استخبارات الشرطة بمصلحة الهجرة والجوازات</p>
            <p className="mt-12">..........................................</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 no-print" style={{ direction: 'rtl' }}>
      
      {/* Upper bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <FileText className="text-slate-800" size={28} />
            خلاصة الأعمال اليومية والمتابعة الميدانية
          </h2>
          <p className="text-sm text-gray-500 mt-1">تسجيل وتوثيق المعاملات اليومية وربطها الفوري بالوارد والصادر مع خيار طباعة الخلاصة اليومية الرسمية.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow transition transform active:scale-95"
          >
            <Plus size={20} />
            إضافة معاملة جديدة
          </button>
          
          <button 
            onClick={() => setShowPrintView(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow transition"
          >
            <Printer size={18} />
            طباعة الخلاصة اليومية
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-slate-100 p-1 rounded-2xl max-w-md border border-slate-200/50">
        <button
          onClick={() => setActiveTab('records')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'records'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={16} />
          سجل المعاملات اليومية
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp size={16} />
          التقارير العددية والإحصائية
        </button>
      </div>

      {activeTab === 'records' ? (
        <>
          {/* Attachment system proposal panel */}
          {showProposalInfo && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 flex items-start gap-4">
              <Info className="text-amber-600 mt-1 shrink-0" size={22} />
              <div className="space-y-2 flex-1">
                <h4 className="font-bold text-md text-amber-950">💡 اقتراحنا الفني بشأن المرفقات والوثائق المصاحبة لمعاملات الجوازات:</h4>
                <div className="text-sm text-amber-900 leading-relaxed space-y-1">
                  <p>لتسهيل الأرشفة وحفظ المرفقات، قمنا ببناء معالج متقدم للرفع المباشر يدعم الآتي:</p>
                  <ul className="list-disc list-inside space-y-1 mr-2">
                    <li><span className="font-semibold">تخزين سحابي محلي:</span> يتم رفع صور الجوازات أو ملفات الـ PDF بشكل آمن إلى الخادم وحفظها ضمن الأرشيف الفعلي للمعاملة.</li>
                    <li><span className="font-semibold">الأرشفة الثنائية (الموازية):</span> بمجرد حفظ المعاملة، تُربط المرفقات تلقائياً برقم القيد في الوارد أو الصادر لتسهيل البحث الشامل والوصول بنقرة واحدة.</li>
                    <li><span className="font-semibold">دعم المسح الضوئي الفوري:</span> يمكن استخدام كاميرا الهاتف لقص الجواز ورفعه مباشرة.</li>
                  </ul>
                </div>
              </div>
              <button onClick={() => setShowProposalInfo(false)} className="text-amber-600 hover:text-amber-950 p-1">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Filter panel */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Calendar className="text-gray-400 shrink-0" size={20} />
              <span className="text-sm font-bold text-gray-700 whitespace-nowrap">عرض خلاصة معاملات يوم:</span>
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-56 font-bold"
              />
            </div>

            <div className="flex gap-4 items-center text-sm text-gray-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-full md:w-auto justify-center md:justify-start">
              <span className="font-bold">تاريخ اليوم المختار:</span>
              <span>{getArabicWeekday(filterDate)}</span>
              <span className="text-gray-300">|</span>
              <span>{getHijriDate(filterDate)} هـ</span>
              <span className="text-gray-300">|</span>
              <span>{getGregorianDate(filterDate)} م</span>
            </div>
          </div>

          {/* Listings of summaries for filter date */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12 text-slate-500 gap-2">
                <RefreshCw className="animate-spin" size={20} />
                <span>جاري تحميل خلاصة اليوم...</span>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200 shadow-sm text-gray-500">
                <FileSpreadsheet className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="font-bold text-lg text-gray-700">لا توجد سجلات معاملات لليوم المختار</p>
                <p className="text-sm text-gray-400 mt-1">اضغط على زر "إضافة معاملة جديدة" لبدء تدوين الخلاصة اليومية.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-gray-300 transition duration-300 flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-lg">
                          {getTypeNameAr(entry.type)}
                        </span>
                        
                        {/* Direction mapping badge */}
                        {['delivery_passports', 'outgoing_memos'].includes(entry.type) ? (
                          <span className="bg-orange-50 text-orange-700 border border-orange-100 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            مرتبط بالصادر
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            مرتبط بالوارد
                          </span>
                        )}

                        {/* Linked Document Number if any */}
                        <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          القيد: {
                            entry.delivery_passports?.docNumber || 
                            entry.receive_passports?.recordNumber || 
                            entry.receive_seizure_records?.recordNumber || 
                            entry.residency_renewal_requests?.memoNumber || 
                            entry.incoming_memos?.incomingNumber || 
                            entry.outgoing_memos?.outgoingNumber
                          }
                        </span>
                      </div>

                      {/* Summary Narrative string */}
                      <p className="text-gray-800 text-md leading-relaxed font-medium">
                        {buildNarrativeSentence(entry)}
                      </p>

                      {/* Attachment lists */}
                      {entry.attachments && entry.attachments.length > 0 && (
                        <div className="pt-2 border-t border-gray-50 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-gray-500">المرفقات المشفوعة:</span>
                          {entry.attachments.map((attach, idx) => (
                            <a 
                              key={idx} 
                              href={attach.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="bg-slate-50 border border-gray-200 text-slate-700 text-xs font-semibold px-3 py-1 rounded-lg hover:bg-slate-100 flex items-center gap-1 transition"
                            >
                              <Upload size={12} className="rotate-180 text-blue-600" />
                              <span className="max-w-[150px] truncate">{attach.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Left Side Quick Actions inside list */}
                    <div className="flex md:flex-col justify-end items-end gap-2.5 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                      <span className="text-xs text-gray-400 font-bold font-mono">
                        {new Date(entry.createdAt).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      <button 
                        onClick={() => setReferralEntry(entry)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-black rounded-lg transition duration-200"
                        title="طباعة نموذج إحالة / استمارة تعهد لهذه المعاملة"
                      >
                        <Printer size={13} />
                        <span>نموذج إحالة</span>
                      </button>

                      <button 
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition duration-200"
                        title="حذف القيد"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          
          {/* Report Configuration Panel */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" size={22} />
                  تحديد نطاق التقرير الإحصائي والعددي الشامل
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">اصدار واجهة تفصيلية وتحليلية للأنشطة والوارد والصادر مع تنبيهات الزيارات الميدانية غير اليمنية</p>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
                <button
                  onClick={() => setReportType('daily')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition ${reportType === 'daily' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  تقرير يومي
                </button>
                <button
                  onClick={() => setReportType('monthly')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition ${reportType === 'monthly' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  تقرير شهري
                </button>
                <button
                  onClick={() => setReportType('yearly')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition ${reportType === 'yearly' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  تقرير سنوي
                </button>
              </div>
            </div>

            {/* Dynamic Filter Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportType === 'daily' && (
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 block">اختر اليوم المطلوب:</label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                  />
                </div>
              )}

              {reportType === 'monthly' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-500 block">اختر الشهر:</label>
                    <select
                      value={reportMonth}
                      onChange={(e) => setReportMonth(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{m} - {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][m - 1]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-500 block">اختر السنة:</label>
                    <select
                      value={reportYear}
                      onChange={(e) => setReportYear(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                    >
                      {[2024, 2025, 2026, 2027, 2028].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {reportType === 'yearly' && (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-black text-gray-500 block">اختر السنة:</label>
                  <select
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-end justify-end gap-2.5 md:col-span-1">
                <button
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow text-xs transition"
                  title="تصدير جدول البيانات الحالي بصيغة ملف CSV"
                >
                  <Download size={16} />
                  تصدير CSV
                </button>
                <button
                  onClick={() => setShowStatsPrintView(true)}
                  className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow text-xs transition"
                >
                  <Printer size={16} />
                  معاينة وطباعة التقرير
                </button>
              </div>
            </div>
          </div>

          {/* KPIs Overview Cards */}
          {(() => {
            const { stats } = getReportData();
            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-slate-100 text-slate-800 rounded-xl shrink-0">
                      <FileSpreadsheet size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-gray-400 block">إجمالي القيود المسجلة</span>
                      <span className="text-2xl font-black text-slate-900">{stats.totalEntries}</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                      <Upload size={24} className="rotate-180" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-gray-400 block">جوازات مستلمة فعلياً</span>
                      <span className="text-2xl font-black text-slate-900">{stats.actualPassportsReceived}</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-gray-400 block">جوازات مضبوطة بموجب محضر</span>
                      <span className="text-2xl font-black text-slate-900">{stats.actualSeizedPassports}</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                      <Globe size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-gray-400 block">معاملات غير اليمنيين (الأجانب)</span>
                      <span className="text-2xl font-black text-slate-900">{stats.nonYemeniCount}</span>
                    </div>
                  </div>
                </div>

                {/* Grid for progress bars and details table */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Progress Indicators (Left/Right col depending on layout) */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-5 space-y-5">
                    <h4 className="font-black text-slate-800 text-sm border-b border-gray-50 pb-2">التوزيع النسبي للقيود الحالية</h4>
                    
                    {(() => {
                      const total = stats.totalEntries || 1;
                      const types = [
                        { label: 'تسليم جوازات سفر', count: stats.deliveryCount, color: 'bg-indigo-600' },
                        { label: 'استلام جوازات سفر', count: stats.receiveCount, color: 'bg-emerald-600' },
                        { label: 'استلام محاضر ضبط الجوازات', count: stats.seizureCount, color: 'bg-rose-600' },
                        { label: 'طلبات تجديد إقامة من الخارجية', count: stats.residencyCount, color: 'bg-amber-500' },
                        { label: 'تعاميم ومكتبات واردة', count: stats.incomingCount, color: 'bg-sky-600' },
                        { label: 'تعاميم ومكتبات صادرة', count: stats.outgoingCount, color: 'bg-slate-600' },
                      ];

                      return (
                        <div className="space-y-4">
                          {types.map((t, idx) => {
                            const pct = Math.round((t.count / total) * 100);
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-gray-700">{t.label}</span>
                                  <span className="font-black text-slate-900">{t.count} ({pct}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                  <div className={`${t.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Operational breakdown table */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-7 space-y-4">
                    <h4 className="font-black text-slate-800 text-sm border-b border-gray-50 pb-2">التفصيل العددي حسب الارتباط العملياتي</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 font-black">
                            <th className="py-2.5">نوع المعاملة</th>
                            <th className="py-2.5">العدد المقيد</th>
                            <th className="py-2.5">الارتباط</th>
                            <th className="py-2.5 text-left">النسبة المساهمة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-bold text-slate-700">
                          <tr>
                            <td className="py-3">تسليم جوازات سفر</td>
                            <td className="py-3 text-slate-900 font-black">{stats.deliveryCount}</td>
                            <td className="py-3 text-orange-600 text-[10px] bg-orange-50/50 inline-block px-2 py-0.5 rounded-md mt-1.5">صادر</td>
                            <td className="py-3 text-left font-mono">{stats.totalEntries ? Math.round((stats.deliveryCount / stats.totalEntries)*100) : 0}%</td>
                          </tr>
                          <tr>
                            <td className="py-3">استلام جوازات سفر</td>
                            <td className="py-3 text-slate-900 font-black">{stats.receiveCount}</td>
                            <td className="py-3 text-blue-600 text-[10px] bg-blue-50/50 inline-block px-2 py-0.5 rounded-md mt-1.5">وارد</td>
                            <td className="py-3 text-left font-mono">{stats.totalEntries ? Math.round((stats.receiveCount / stats.totalEntries)*100) : 0}%</td>
                          </tr>
                          <tr>
                            <td className="py-3">استلام محاضر ضبط الجوازات</td>
                            <td className="py-3 text-slate-900 font-black">{stats.seizureCount}</td>
                            <td className="py-3 text-blue-600 text-[10px] bg-blue-50/50 inline-block px-2 py-0.5 rounded-md mt-1.5">وارد</td>
                            <td className="py-3 text-left font-mono">{stats.totalEntries ? Math.round((stats.seizureCount / stats.totalEntries)*100) : 0}%</td>
                          </tr>
                          <tr>
                            <td className="py-3">طلبات تجديد إقامة من الخارجية</td>
                            <td className="py-3 text-slate-900 font-black">{stats.residencyCount}</td>
                            <td className="py-3 text-blue-600 text-[10px] bg-blue-50/50 inline-block px-2 py-0.5 rounded-md mt-1.5">وارد</td>
                            <td className="py-3 text-left font-mono">{stats.totalEntries ? Math.round((stats.residencyCount / stats.totalEntries)*100) : 0}%</td>
                          </tr>
                          <tr>
                            <td className="py-3">تعاميم ومكتبات واردة</td>
                            <td className="py-3 text-slate-900 font-black">{stats.incomingCount}</td>
                            <td className="py-3 text-blue-600 text-[10px] bg-blue-50/50 inline-block px-2 py-0.5 rounded-md mt-1.5">وارد</td>
                            <td className="py-3 text-left font-mono">{stats.totalEntries ? Math.round((stats.incomingCount / stats.totalEntries)*100) : 0}%</td>
                          </tr>
                          <tr>
                            <td className="py-3">تعاميم ومكتبات صادرة</td>
                            <td className="py-3 text-slate-900 font-black">{stats.outgoingCount}</td>
                            <td className="py-3 text-orange-600 text-[10px] bg-orange-50/50 inline-block px-2 py-0.5 rounded-md mt-1.5">صادر</td>
                            <td className="py-3 text-left font-mono">{stats.totalEntries ? Math.round((stats.outgoingCount / stats.totalEntries)*100) : 0}%</td>
                          </tr>
                          <tr className="bg-slate-50 font-black text-slate-900">
                            <td className="py-3.5 pr-2 rounded-r-xl">الإجمالي العام للقيود</td>
                            <td className="py-3.5 text-lg font-black">{stats.totalEntries}</td>
                            <td className="py-3.5">-</td>
                            <td className="py-3.5 pl-2 rounded-l-xl text-left font-mono">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Non-Yemeni Visitors Alerts List */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                        <Globe size={18} className="text-amber-600" />
                        حصر وتتبع الزوار الأجانب وتنبيهات الإقامة والزيارات الميدانية
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">تنبيهات ومراقبة فورية لفترات وصلاحيات دخول المغتربين والوافدين المسجلين اليوم</p>
                    </div>
                    <span className="bg-amber-50 text-amber-800 text-xs font-black px-2.5 py-1 rounded-lg border border-amber-200">
                      العدد المسجل: {stats.nonYemeniCount}
                    </span>
                  </div>

                  {stats.nonYemeniDetailList.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs italic">
                      لا توجد أي معاملات مسجلة لغير اليمنيين في نطاق التقرير الحالي.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 font-black">
                            <th className="py-2.5">الاسم الكامل</th>
                            <th className="py-2.5">الجنسية</th>
                            <th className="py-2.5">رقم الجواز</th>
                            <th className="py-2.5">المعاملة</th>
                            <th className="py-2.5">اسم الكفيل وهاتفه</th>
                            <th className="py-2.5 text-left">حالة صلاحية الإقامة/الزيارة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-semibold text-slate-700">
                          {stats.nonYemeniDetailList.map((vis, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition">
                              <td className="py-3.5 font-bold text-slate-900">{vis.name}</td>
                              <td className="py-3.5">
                                <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-md">
                                  {vis.nationality}
                                </span>
                              </td>
                              <td className="py-3.5 font-mono">{vis.passport}</td>
                              <td className="py-3.5 text-gray-500">{vis.type}</td>
                              <td className="py-3.5">
                                {vis.sponsorName ? (
                                  <div>
                                    <span className="block font-bold text-slate-800">{vis.sponsorName}</span>
                                    {vis.sponsorPhone && <span className="block text-[10px] text-gray-400 font-mono mt-0.5">{vis.sponsorPhone}</span>}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">غير محدد</span>
                                )}
                              </td>
                              <td className="py-3.5 text-left">
                                {getExpiryAlertBadge(vis.visitExpiry)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Modal Dialog for registration */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <FileCheck className="text-blue-400" size={24} />
                <h2 className="text-xl font-black">تسجيل معاملة يومية جديدة</h2>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }} 
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body / Form Container */}
            <form onSubmit={handleSaveEntry} className="flex-1 overflow-y-auto p-8 space-y-6">
              
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">نوع المعاملة اليومية</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                    value={selectedType}
                    onChange={(e) => { setSelectedType(e.target.value as DailySummaryType); resetForm(); }}
                  >
                    <option value="delivery_passports">1. تسليم جوازات سفر للمواطنين (مرتبط بالصادر)</option>
                    <option value="receive_passports">2. استلام جوازات من المنافذ (مرتبط بالوارد)</option>
                    <option value="receive_seizure_records">3. استلام محاضر ضبط مع الجوازات (مرتبط بالوارد)</option>
                    <option value="residency_renewal_requests">4. استلام طلبات تجديد الإقامة من الخارجية (مرتبط بالوارد)</option>
                    <option value="incoming_memos">5. استلام مذكرات وتعاميم واردة (مرتبط بالوارد)</option>
                    <option value="outgoing_memos">6. مذكرات وتعميمات صادرة للجهات (مرتبط بالصادر)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ تسجيل العمل</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
              </div>

              {/* DYNAMIC FORMS ACCORDING TO SELECTED TYPE */}

              {/* 1. تسليم جوازات */}
              {selectedType === 'delivery_passports' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl text-xs text-slate-600 font-semibold border border-slate-100">
                    💡 هذه المعاملة ستولد تلقائياً قيداً صادراً في الأرشيف العام باسم المواطن المذكور.
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل للشخص (الرباعي)</label>
                    <input
                      type="text"
                      required
                      placeholder="أدخل الاسم الرباعي"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={delName}
                      onChange={(e) => setDelName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الجنسية</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: يمني، سعودي، هندي"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={delNationality}
                      onChange={(e) => setDelNationality(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم الجواز</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: 08765432"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-left"
                      value={delPassportNum}
                      onChange={(e) => setDelPassportNum(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                    <input
                      type="text"
                      placeholder="مثال: 777123456"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left font-mono"
                      value={delPhone}
                      onChange={(e) => setDelPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">السكن (العنوان بالكامل)</label>
                    <input
                      type="text"
                      placeholder="مثال: صنعاء - حي حدة"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={delAddress}
                      onChange={(e) => setDelAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">جهة العمل / الوظيفة</label>
                    <input
                      type="text"
                      placeholder="مثال: شركة النفط، أعمال حرة"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={delJob}
                      onChange={(e) => setDelJob(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">إشارة مرجعية لرقم الصادر (اختياري)</label>
                    <input
                      type="text"
                      placeholder="سيتم توليده تلقائياً إذا تُرِك فارغاً"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={delDocNum}
                      onChange={(e) => setDelDocNum(e.target.value)}
                    />
                  </div>

                  {delNationality !== 'يمني' && (
                    <div className="md:col-span-2 border border-blue-100 bg-blue-50/50 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-3 duration-300">
                      <h4 className="text-sm font-extrabold text-blue-900 border-b border-blue-100 pb-2">📋 بيانات الدخول والزيارة لغير اليمني</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-blue-800 mb-1">تاريخ الدخول</label>
                          <input
                            type="date"
                            required
                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800"
                            value={delEntryDate}
                            onChange={(e) => setDelEntryDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-blue-800 mb-1">نوع الزيارة</label>
                          <select
                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800"
                            value={delVisitType}
                            onChange={(e) => setDelVisitType(e.target.value)}
                          >
                            <option value="زيارة عمل">زيارة عمل</option>
                            <option value="زيارة عائلية">زيارة عائلية</option>
                            <option value="زيارة علاجية">زيارة علاجية</option>
                            <option value="زيارة سياحية">زيارة سياحية</option>
                            <option value="أخرى">أخرى</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-blue-800 mb-1">تاريخ انتهاء الزيارة</label>
                          <input
                            type="date"
                            required
                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800"
                            value={delVisitExpiry}
                            onChange={(e) => setDelVisitExpiry(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-blue-800 mb-1">بيانات الكفيل / المستقدم</label>
                          <input
                            type="text"
                            required
                            placeholder="الاسم الكامل للكفيل"
                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800"
                            value={delSponsorName}
                            onChange={(e) => setDelSponsorName(e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-blue-800 mb-1">رقم هاتف الكفيل</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: 771234567"
                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800 text-left font-mono"
                            value={delSponsorPhone}
                            onChange={(e) => setDelSponsorPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2 & 3. استلام جوازات واستلام محاضر ضبط */}
              {(selectedType === 'receive_passports' || selectedType === 'receive_seizure_records') && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 font-semibold border border-slate-100">
                    💡 هذه المعاملة ستولد تلقائياً قيداً وارداً يحتوي على كافة بيانات الضبط وعدد الجوازات المرفقة.
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم المنفذ الضابط</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: منفذ الوديعة، ميناء عدن، مطار صنعاء"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={recPortName}
                        onChange={(e) => setRecPortName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم محضر الضبط</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: م ض/112/2026"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={recRecordNum}
                        onChange={(e) => setRecRecordNum(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الضبط</label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={recRecordDate}
                        onChange={(e) => setRecRecordDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">عدد الجوازات المضبوطة</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        value={recPassportsCount}
                        onChange={(e) => setRecPassportsCount(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  {/* Passport Details Dynamic Area */}
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                      <Users size={18} className="text-blue-600" />
                      البيانات الشخصية للجوازات المرفقة بمحضر الضبط ({recPassportsCount} جواز)
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2">
                      {recPassportDetails.map((passport, idx) => (
                        <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4 relative">
                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">
                            {idx + 1}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">الاسم الكامل لصاحب الجواز</label>
                              <input
                                type="text"
                                required
                                placeholder="الاسم الرباعي"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={passport.fullName}
                                onChange={(e) => {
                                  const list = [...recPassportDetails];
                                  list[idx].fullName = e.target.value;
                                  setRecPassportDetails(list);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">الجنسية</label>
                              <input
                                type="text"
                                required
                                placeholder="مثال: يمني، سعودي"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={passport.nationality || ''}
                                onChange={(e) => {
                                  const list = [...recPassportDetails];
                                  list[idx].nationality = e.target.value;
                                  setRecPassportDetails(list);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">رقم الجواز</label>
                              <input
                                type="text"
                                required
                                placeholder="مثال: 09811234"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono text-left"
                                value={passport.passportNumber}
                                onChange={(e) => {
                                  const list = [...recPassportDetails];
                                  list[idx].passportNumber = e.target.value;
                                  setRecPassportDetails(list);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">رقم الهاتف</label>
                              <input
                                type="text"
                                placeholder="رقم الهاتف"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono text-left"
                                value={passport.phone || ''}
                                onChange={(e) => {
                                  const list = [...recPassportDetails];
                                  list[idx].phone = e.target.value;
                                  setRecPassportDetails(list);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">السكن</label>
                              <input
                                type="text"
                                placeholder="عنوان السكن الحالي"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={passport.address || ''}
                                onChange={(e) => {
                                  const list = [...recPassportDetails];
                                  list[idx].address = e.target.value;
                                  setRecPassportDetails(list);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">العمل</label>
                              <input
                                type="text"
                                placeholder="جهة العمل أو الوظيفة"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={passport.work || ''}
                                onChange={(e) => {
                                  const list = [...recPassportDetails];
                                  list[idx].work = e.target.value;
                                  setRecPassportDetails(list);
                                }}
                              />
                            </div>
                          </div>

                          {passport.nationality !== 'يمني' && (
                            <div className="border border-blue-100 bg-blue-50/40 p-4 rounded-xl space-y-3">
                              <h5 className="text-xs font-bold text-blue-900">📋 تفاصيل الدخول والزيارة لغير اليمني (الجواز رقم {idx + 1})</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-blue-800 mb-1">تاريخ الدخول</label>
                                  <input
                                    type="date"
                                    required
                                    className="w-full px-2 py-1 bg-white border border-blue-200 rounded text-xs text-slate-800"
                                    value={passport.entryDate || ''}
                                    onChange={(e) => {
                                      const list = [...recPassportDetails];
                                      list[idx].entryDate = e.target.value;
                                      setRecPassportDetails(list);
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-blue-800 mb-1">نوع الزيارة</label>
                                  <select
                                    className="w-full px-2 py-1 bg-white border border-blue-200 rounded text-xs text-slate-800"
                                    value={passport.visitType || 'زيارة عمل'}
                                    onChange={(e) => {
                                      const list = [...recPassportDetails];
                                      list[idx].visitType = e.target.value;
                                      setRecPassportDetails(list);
                                    }}
                                  >
                                    <option value="زيارة عمل">زيارة عمل</option>
                                    <option value="زيارة عائلية">زيارة عائلية</option>
                                    <option value="زيارة علاجية">زيارة علاجية</option>
                                    <option value="زيارة سياحية">زيارة سياحية</option>
                                    <option value="أخرى">أخرى</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-blue-800 mb-1">تاريخ انتهاء الزيارة</label>
                                  <input
                                    type="date"
                                    required
                                    className="w-full px-2 py-1 bg-white border border-blue-200 rounded text-xs text-slate-800"
                                    value={passport.visitExpiry || ''}
                                    onChange={(e) => {
                                      const list = [...recPassportDetails];
                                      list[idx].visitExpiry = e.target.value;
                                      setRecPassportDetails(list);
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-blue-800 mb-1">بيانات الكفيل</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="اسم الكفيل"
                                    className="w-full px-2 py-1 bg-white border border-blue-200 rounded text-xs text-slate-800"
                                    value={passport.sponsorName || ''}
                                    onChange={(e) => {
                                      const list = [...recPassportDetails];
                                      list[idx].sponsorName = e.target.value;
                                      setRecPassportDetails(list);
                                    }}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-[10px] font-bold text-blue-800 mb-1">رقم هاتف الكفيل</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="مثال: 771234567"
                                    className="w-full px-2 py-1 bg-white border border-blue-200 rounded text-xs text-slate-800 text-left font-mono"
                                    value={passport.sponsorPhone || ''}
                                    onChange={(e) => {
                                      const list = [...recPassportDetails];
                                      list[idx].sponsorPhone = e.target.value;
                                      setRecPassportDetails(list);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. استلام طلبات تجديد اقامة من الخارجية */}
              {selectedType === 'residency_renewal_requests' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 font-semibold border border-slate-100">
                    💡 هذه المعاملة سترتبط بالوارد العام كطلب تجديد إقامة صادر عن وزارة الخارجية.
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم المذكرة الواردة</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: خ/أ/122"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        value={reqMemoNum}
                        onChange={(e) => setReqMemoNum(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ المذكرة</label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={reqMemoDate}
                        onChange={(e) => setReqMemoDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم الشخص المطلوب تجديد إقامته</label>
                      <input
                        type="text"
                        required
                        placeholder="أدخل الاسم الكامل"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={reqPersonName}
                        onChange={(e) => setReqPersonName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الجنسية</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: أجنبي، سوداني، يمني"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={reqNationality}
                        onChange={(e) => setReqNationality(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم الجواز / البطاقة</label>
                      <input
                        type="text"
                        required
                        placeholder="رقم الجواز أو الهوية الشخصية"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-left"
                        value={reqPassportNum}
                        onChange={(e) => setReqPassportNum(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                      <input
                        type="text"
                        placeholder="رقم الهاتف للتواصل"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-left"
                        value={reqPhone}
                        onChange={(e) => setReqPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">السكن في اليمن</label>
                      <input
                        type="text"
                        placeholder="محل الإقامة والسكن الحالي"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={reqAddress}
                        onChange={(e) => setReqAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">التبعية والجهة المستقدمة</label>
                      <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                        value={reqAffiliation}
                        onChange={(e) => setReqAffiliation(e.target.value as any)}
                      >
                        <option value="un_office">تابع لمكتب الأمم المتحدة</option>
                        <option value="un_envoy">تابع للمبعوث الأممي الخاص في اليمن</option>
                        <option value="other">جهة أجنبية / سفارة أخرى</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">نوع الوظيفة التي يشغلها في اليمن</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: مستشار سياسي، منسق إغاثة"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={reqJobTitle}
                        onChange={(e) => setReqJobTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">المحافظة التي يستقر فيها حالياً</label>
                      <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                        value={reqGovernorate}
                        onChange={(e) => setReqGovernorate(e.target.value)}
                      >
                        {governorates.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    {reqNationality !== 'يمني' && (
                      <div className="md:col-span-2 border border-blue-100 bg-blue-50/50 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-3 duration-300">
                        <h4 className="text-sm font-extrabold text-blue-900 border-b border-blue-100 pb-2">📋 بيانات الدخول والزيارة للمقيم الأجنبي</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-blue-800 mb-1">تاريخ الدخول</label>
                            <input
                              type="date"
                              required
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800"
                              value={reqEntryDate}
                              onChange={(e) => setReqEntryDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-blue-800 mb-1">نوع الزيارة / الإقامة</label>
                            <select
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800"
                              value={reqVisitType}
                              onChange={(e) => setReqVisitType(e.target.value)}
                            >
                              <option value="زيارة عمل">زيارة عمل</option>
                              <option value="إقامة سنوية">إقامة سنوية</option>
                              <option value="زيارة عائلية">زيارة عائلية</option>
                              <option value="أخرى">أخرى</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-blue-800 mb-1">تاريخ انتهاء الإقامة / الزيارة</label>
                            <input
                              type="date"
                              required
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800"
                              value={reqVisitExpiry}
                              onChange={(e) => setReqVisitExpiry(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-blue-800 mb-1">بيانات الكفيل / المستقدم في اليمن</label>
                            <input
                              type="text"
                              required
                              placeholder="الاسم الكامل للكفيل"
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800"
                              value={reqSponsorName}
                              onChange={(e) => setReqSponsorName(e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-blue-800 mb-1">رقم هاتف الكفيل</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: 771234567"
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800 text-left font-mono"
                              value={reqSponsorPhone}
                              onChange={(e) => setReqSponsorPhone(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">الإجراءات المتخذة</label>
                      <textarea
                        required
                        placeholder="صف بالتفصيل الإجراءات الاستخباراتية أو الإدارية التي تم اتخاذها..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                        value={reqActions}
                        onChange={(e) => setReqActions(e.target.value)}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">حالة المعاملة</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 font-bold text-slate-700">
                          <input 
                            type="radio" 
                            name="req_status" 
                            checked={reqStatus === 'completed'}
                            onChange={() => setReqStatus('completed')}
                            className="w-4 h-4 text-blue-600" 
                          />
                          منتهية ومكتملة
                        </label>
                        <label className="flex items-center gap-2 font-bold text-slate-700">
                          <input 
                            type="radio" 
                            name="req_status" 
                            checked={reqStatus === 'pending'}
                            onChange={() => setReqStatus('pending')}
                            className="w-4 h-4 text-blue-600" 
                          />
                          قيد المتابعة والدراسة
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5 & 6. مذكرات وتعاميم واردة / صادرة */}
              {(selectedType === 'incoming_memos' || selectedType === 'outgoing_memos') && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 font-semibold border border-slate-100">
                    💡 سيتم ربط هذه المذكرة بقيد رسمي في سجل {selectedType === 'incoming_memos' ? 'الوارد العام' : 'الصادر العام'}.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {selectedType === 'incoming_memos' ? 'رقم القيد في الوارد' : 'رقم المذكرة الصادرة'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: و-1234 أو ص-552"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        value={memoNum}
                        onChange={(e) => setMemoNum(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {selectedType === 'incoming_memos' ? 'الجهة الوارد منها' : 'الجهة الصادر إليها'} (القطاعات والمصالح)
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold"
                        value={memSector}
                        onChange={(e) => setMemSector(e.target.value)}
                      >
                        {interiorSectors.map(sec => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">عنوان وعنوان فرع الجهة</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: المقر الرئيسي - صنعاء"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={memAddress}
                        onChange={(e) => setMemAddress(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">عنوان أو موضوع المذكرة</label>
                      <input
                        type="text"
                        required
                        placeholder="أدخل عنواناً ملخصاً للموضوع"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        value={memSubject}
                        onChange={(e) => setMemSubject(e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">الإجراءات المتخذة</label>
                      <textarea
                        required
                        placeholder="الإجراء المتخذ بشأن المذكرة..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                        value={memActions}
                        onChange={(e) => setMemActions(e.target.value)}
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">حالة الرد والمتابعة</label>
                      <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold"
                        value={memStatus}
                        onChange={(e) => setMemStatus(e.target.value as any)}
                      >
                        <option value="needs_response">بحاجة إلى رد</option>
                        <option value="pending">ما زالت قيد المتابعة</option>
                        <option value="responded">تم الرد رسمياً</option>
                      </select>
                    </div>

                    {/* Show dynamic response code or original code references */}
                    {selectedType === 'incoming_memos' && memStatus === 'responded' && (
                      <div className="animate-in slide-in-from-top duration-300">
                        <label className="block text-sm font-bold text-gray-700 mb-2">رقم الرد في الصادر</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: ص-231"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                          value={memResponseDocNum}
                          onChange={(e) => setMemResponseDocNum(e.target.value)}
                        />
                      </div>
                    )}

                    {selectedType === 'outgoing_memos' && (
                      <div className="animate-in slide-in-from-top duration-300">
                        <label className="block text-sm font-bold text-gray-700 mb-2">رقم المذكرة الواردة المشار إليها (إذا كان رداً عليها)</label>
                        <input
                          type="text"
                          placeholder="مثال: و-1243"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                          value={memIncomingRefNum}
                          onChange={(e) => setMemIncomingRefNum(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Robust Attachment Uploader Component */}
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Upload size={18} className="text-blue-600" />
                  المرفقات والوثائق المؤرشفة (صور الجوازات، صور المحاضر الرسمية، ملفات الـ PDF)
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* File input button container */}
                  <div className="md:col-span-1 border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl p-6 text-center transition flex flex-col justify-center items-center bg-gray-50/50 cursor-pointer relative">
                    <input 
                      type="file" 
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="text-gray-400 mb-2" size={32} />
                    <p className="text-xs font-bold text-gray-700">اسحب الملفات هنا أو اضغط للتصفح</p>
                    <p className="text-[10px] text-gray-400 mt-1">تنسيق PDF وصور جوازات السفر</p>
                  </div>

                  {/* Uploaded attachments cards */}
                  <div className="md:col-span-2 space-y-2 border border-gray-100 rounded-2xl p-4 bg-gray-50 max-h-[160px] overflow-y-auto">
                    {uploading ? (
                      <div className="text-center py-6 text-xs text-gray-500 flex justify-center items-center gap-2">
                        <RefreshCw className="animate-spin text-blue-500" size={16} />
                        جاري معالجة ورفع الملفات...
                      </div>
                    ) : attachments.length === 0 ? (
                      <div className="text-center py-6 text-xs text-gray-400 italic">
                        لم يتم رفع أو إرفاق مستندات حتى الآن لهذه المعاملة.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-xl border border-gray-200 flex items-center justify-between text-xs font-bold gap-2 shadow-sm">
                            <span className="truncate text-slate-800 max-w-[150px]">{file.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-gray-400">{file.size || 'Base64'}</span>
                              <button 
                                type="button" 
                                onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex gap-4 pt-6 border-t border-gray-100 shrink-0">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow transition transform active:scale-95 disabled:opacity-50"
                >
                  <FileCheck size={20} />
                  حفظ المعاملة وأرشفتها
                </button>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <FileX size={20} />
                  إلغاء الأمر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {referralEntry && (
        <ReferralFormModal 
          entry={referralEntry} 
          onClose={() => setReferralEntry(null)} 
        />
      )}
    </div>
  );
}
