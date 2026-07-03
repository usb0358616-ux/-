import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  FileText, 
  X, 
  ChevronLeft,
  ChevronDown,
  Building,
  User,
  ShieldAlert,
  Send
} from 'lucide-react';
import type { DailySummaryEntry, DailySummaryType } from '../types';

interface NotificationsBellProps {
  onStatusChanged?: () => void;
}

export default function NotificationsBell({ onStatusChanged }: NotificationsBellProps) {
  const [entries, setEntries] = useState<DailySummaryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseInputs, setResponseInputs] = useState<Record<string, string>>({});
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch summaries to compute alerts
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/daily-summaries');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to fetch daily summaries for alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper: check if transaction is overdue (older than today)
  const isOverdue = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDate = new Date(dateStr);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate < today;
  };

  const getDaysRemaining = (expiryStr?: string) => {
    if (!expiryStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Extract pending items needing response/follow-up
  const pendingItems = entries.filter(entry => {
    if (entry.type === 'residency_renewal_requests' && entry.residency_renewal_requests) {
      return entry.residency_renewal_requests.status === 'pending';
    }
    if (entry.type === 'incoming_memos' && entry.incoming_memos) {
      return entry.incoming_memos.status !== 'responded';
    }
    if (entry.type === 'outgoing_memos' && entry.outgoing_memos) {
      return entry.outgoing_memos.status !== 'responded';
    }
    return false;
  });

  // Extract visa expiry warnings (remaining <= 15 days)
  const visaExpiryAlerts = entries.flatMap(entry => {
    const alerts: any[] = [];
    
    if (entry.type === 'delivery_passports' && entry.delivery_passports) {
      const p = entry.delivery_passports;
      if (p.nationality && p.nationality !== 'يمني' && p.visitExpiry) {
        alerts.push({
          id: `${entry.id}-del`,
          type: 'visa_expiry',
          personName: p.fullName,
          nationality: p.nationality,
          passportNumber: p.passportNumber,
          visitExpiry: p.visitExpiry,
          sponsorName: p.sponsorName,
          sponsorPhone: p.sponsorPhone,
          phone: p.phone,
          date: entry.date
        });
      }
    }
    
    if (entry.type === 'receive_passports' && entry.receive_passports?.passportDetails) {
      entry.receive_passports.passportDetails.forEach((p, idx) => {
        if (p.nationality && p.nationality !== 'يمني' && p.visitExpiry) {
          alerts.push({
            id: `${entry.id}-rec-${idx}`,
            type: 'visa_expiry',
            personName: p.fullName,
            nationality: p.nationality,
            passportNumber: p.passportNumber,
            visitExpiry: p.visitExpiry,
            sponsorName: p.sponsorName,
            sponsorPhone: p.sponsorPhone,
            phone: p.phone,
            date: entry.date
          });
        }
      });
    }
    
    if (entry.type === 'receive_seizure_records' && entry.receive_seizure_records?.passportDetails) {
      entry.receive_seizure_records.passportDetails.forEach((p, idx) => {
        if (p.nationality && p.nationality !== 'يمني' && p.visitExpiry) {
          alerts.push({
            id: `${entry.id}-sei-${idx}`,
            type: 'visa_expiry',
            personName: p.fullName,
            nationality: p.nationality,
            passportNumber: p.passportNumber,
            visitExpiry: p.visitExpiry,
            sponsorName: p.sponsorName,
            sponsorPhone: p.sponsorPhone,
            phone: p.phone,
            date: entry.date
          });
        }
      });
    }
    
    if (entry.type === 'residency_renewal_requests' && entry.residency_renewal_requests) {
      const p = entry.residency_renewal_requests;
      if (p.nationality && p.nationality !== 'يمني' && p.visitExpiry) {
        alerts.push({
          id: `${entry.id}-req`,
          type: 'visa_expiry',
          personName: p.personName,
          nationality: p.nationality,
          passportNumber: p.passportNumber || '',
          visitExpiry: p.visitExpiry,
          sponsorName: p.sponsorName,
          sponsorPhone: p.sponsorPhone,
          phone: p.phone,
          date: entry.date
        });
      }
    }
    
    return alerts;
  }).filter(alert => {
    const days = getDaysRemaining(alert.visitExpiry);
    return days !== null && days <= 15;
  });

  // Overdue items count (pending and created in previous days) plus expired visas
  const overdueItemsCount = pendingItems.filter(item => isOverdue(item.date)).length + 
    visaExpiryAlerts.filter(alert => {
      const days = getDaysRemaining(alert.visitExpiry);
      return days !== null && days < 0;
    }).length;

  const totalActiveCount = pendingItems.length + visaExpiryAlerts.length;

  // Handle status update (marking as completed or responded with ref doc)
  const handleUpdateStatus = async (id: string, type: DailySummaryType, newStatus: string, responseNum?: string) => {
    try {
      const payload: any = { status: newStatus };
      if (responseNum) {
        payload.responseDocNumber = responseNum;
      }

      const res = await fetch(`/api/daily-summaries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchAlerts();
        if (onStatusChanged) {
          onStatusChanged();
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getTypeName = (type: DailySummaryType) => {
    switch (type) {
      case 'residency_renewal_requests': return 'طلب تجديد إقامة';
      case 'incoming_memos': return 'مذكرة واردة';
      case 'outgoing_memos': return 'مذكرة صادرة';
      default: return 'معاملة قيد المتابعة';
    }
  };

  const getArabicDateString = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('ar-YE', { day: 'numeric', month: 'long' }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="relative z-40 dir-rtl" style={{ direction: 'rtl' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-xl transition duration-300 flex items-center justify-center ${
          isOpen ? 'bg-slate-100 text-slate-900' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
        title="التنبيهات وتذكيرات المتابعة"
      >
        <Bell size={22} className={overdueItemsCount > 0 ? 'animate-bounce text-red-600' : ''} />
        
        {/* Overdue Count Badge */}
        {overdueItemsCount > 0 && (
          <span className="absolute -top-1.5 -left-1.5 bg-red-600 text-white text-[11px] font-black h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow">
            {overdueItemsCount}
          </span>
        )}

        {/* Regular Pending Badge (only if no overdue) */}
        {overdueItemsCount === 0 && totalActiveCount > 0 && (
          <span className="absolute -top-1.5 -left-1.5 bg-amber-500 text-white text-[11px] font-black h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow">
            {totalActiveCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-3 w-96 max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-blue-400" />
              <span className="font-black text-sm">التنبيهات والمتابعة اليومية</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchAlerts} 
                disabled={loading}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition disabled:opacity-50"
                title="تحديث قائمة التنبيهات"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-slate-50 p-3 px-4 border-b border-slate-100 flex justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600"></span>
              الحرجة/منتهية: <strong className="text-red-600 text-sm">{overdueItemsCount}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              قرب الانتهاء/معلقة: <strong className="text-amber-600 text-sm">{totalActiveCount - overdueItemsCount}</strong>
            </span>
            <span className="flex items-center gap-1">
              إجمالي النشطة: <strong className="text-slate-900 text-sm">{totalActiveCount}</strong>
            </span>
          </div>

          {/* Alert List Container */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
            {totalActiveCount === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <CheckCircle className="mx-auto text-emerald-500" size={36} />
                <p className="font-bold text-sm text-slate-800">لا توجد تنبيهات معلقة!</p>
                <p className="text-xs text-slate-400">جميع مذكرات ومعاملات الأقسام مستوفاة وتم الرد عليها.</p>
              </div>
            ) : (
              <>
                {/* 1. Memos & Renewals section */}
                {pendingItems.map((item) => {
                  const overdue = isOverdue(item.date);
                  
                  // Extract card info depending on summary type
                  let title = '';
                  let description = '';
                  let identifier = '';

                  if (item.type === 'residency_renewal_requests' && item.residency_renewal_requests) {
                    const p = item.residency_renewal_requests;
                    title = `تجديد إقامة: ${p.personName}`;
                    description = `الوظيفة: ${p.jobTitle || 'أخصائي'} - السكن: ${p.address || p.governorate}`;
                    identifier = `مذكرة رقم ${p.memoNumber}`;
                  } else if (item.type === 'incoming_memos' && item.incoming_memos) {
                    const p = item.incoming_memos;
                    title = `مذكرة واردة: ${p.subjectSummary}`;
                    description = `الجهة المرسلة: ${p.senderSector}`;
                    identifier = `وارد رقم ${p.incomingNumber}`;
                  } else if (item.type === 'outgoing_memos' && item.outgoing_memos) {
                    const p = item.outgoing_memos;
                    title = `مذكرة صادرة: ${p.subjectSummary}`;
                    description = `الجهة المستلمة: ${p.recipientSector}`;
                    identifier = `صادر رقم ${p.outgoingNumber}`;
                  }

                  return (
                    <div key={item.id} className={`p-4 transition duration-200 ${overdue ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-slate-50'}`}>
                      {/* Status & Date Tag */}
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          overdue ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {overdue ? '⚠️ متأخرة جداً' : '⏳ قيد المتابعة'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Clock size={10} />
                          تاريخ المعاملة: {getArabicDateString(item.date)}
                        </span>
                      </div>

                      {/* Main Text Info */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{title}</h4>
                        <p className="text-slate-500 text-[11px] line-clamp-1">{description}</p>
                        <div className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                          <FileText size={10} />
                          <span>{getTypeName(item.type)} • {identifier}</span>
                        </div>
                      </div>

                      {/* Action buttons embedded inside notification item */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100/60 flex flex-col gap-2">
                        {item.type === 'incoming_memos' ? (
                          /* Incoming Memo Needs Response - Show Ref Response Input & Action */
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-600">تسجيل رقم صادر الرد لإغلاق التنبيه:</label>
                            <div className="flex gap-1.5">
                              <input 
                                type="text" 
                                placeholder="أدخل رقم الصادر..."
                                className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none font-bold"
                                value={responseInputs[item.id] || ''}
                                onChange={(e) => setResponseInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                              />
                              <button 
                                onClick={() => {
                                  const val = responseInputs[item.id];
                                  if (!val) return alert('الرجاء إدخال رقم صادر الرد المرجعي');
                                  handleUpdateStatus(item.id, item.type, 'responded', val);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              >
                                <Send size={11} />
                                تم الرد
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Other items (residency / outgoing) - Quick resolve button */
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => handleUpdateStatus(
                                item.id, 
                                item.type, 
                                item.type === 'residency_renewal_requests' ? 'completed' : 'responded'
                              )}
                              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 w-full justify-center shadow-sm"
                            >
                              <CheckCircle size={12} className="text-emerald-400" />
                              تعليم كمنجز / منتهي
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 2. Visa Expiry alerts section */}
                {visaExpiryAlerts.map((alert) => {
                  const days = getDaysRemaining(alert.visitExpiry);
                  const isExpired = days !== null && days < 0;

                  return (
                    <div 
                      key={alert.id} 
                      className={`p-4 border-r-4 transition duration-200 ${
                        isExpired 
                          ? 'border-red-600 bg-red-50/40 hover:bg-red-50/60' 
                          : 'border-amber-500 bg-amber-50/20 hover:bg-amber-50/40'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isExpired ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isExpired ? '🚨 تأشيرة منتهية!' : `⚠️ قرب انتهاء الزيارة (باقي ${days} أيام)`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Clock size={10} />
                          التسجيل: {getArabicDateString(alert.date)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-xs">{alert.personName}</h4>
                        <p className="text-slate-500 text-[11px]">
                          الجنسية: <strong className="text-slate-700">{alert.nationality}</strong> • جواز: <strong className="text-slate-700 font-mono">{alert.passportNumber}</strong>
                        </p>
                        <p className="text-[10px] text-slate-500">
                          تاريخ الانتهاء: <span className="font-mono font-bold text-red-600">{alert.visitExpiry}</span>
                          {alert.sponsorName && <> • الكفيل: <span className="font-semibold">{alert.sponsorName}</span></>}
                        </p>
                        {alert.phone && (
                          <p className="text-[10px] text-slate-400 font-bold">هاتف: {alert.phone}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer of Notification Bar */}
          {totalActiveCount > 0 && (
            <div className="bg-slate-50 p-2.5 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold">
                ⚠️ يرجى متابعة المذكرات المتأخرة وتأشيرات الزوار الأجانب المنتهية لتفادي التجاوزات القانونية.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
