import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  FileText, 
  Clock, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sparkles,
  Inbox
} from 'lucide-react';
import type { PushNotificationItem, TabType } from '../types';

interface PushNotificationManagerProps {
  onNavigateToTab: (tab: TabType) => void;
  currentActiveTab?: TabType;
}

export default function PushNotificationManager({ onNavigateToTab, currentActiveTab }: PushNotificationManagerProps) {
  const [notifications, setNotifications] = useState<PushNotificationItem[]>([]);
  const [activeToast, setActiveToast] = useState<PushNotificationItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>('default');
  const [showTaskbarTray, setShowTaskbarTray] = useState(false);
  const lastKnownIdRef = useRef<string | null>(null);

  // Initialize browser notification permission check
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPerm(Notification.permission);
    }
  }, []);

  // Play official soft chime
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  // Poll for new notifications
  const fetchNotifications = async (isFirst = false) => {
    try {
      const res = await fetch('/api/push-notifications');
      if (!res.ok) return;
      const data: PushNotificationItem[] = await res.json();
      setNotifications(data);

      if (data.length > 0) {
        const newest = data[0];
        // If there's a new notification we haven't popped yet
        if (!isFirst && lastKnownIdRef.current && newest.id !== lastKnownIdRef.current && !newest.isRead) {
          setActiveToast(newest);
          playAlertChime();

          // Native browser notification if allowed
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(newest.title, {
              body: newest.message,
              icon: '/favicon.ico'
            });
          }
        }
        lastKnownIdRef.current = newest.id;
      }
    } catch (err) {
      console.error('Failed to poll push notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 7000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const p = await Notification.requestPermission();
      setBrowserPerm(p);
      if (p === 'granted') {
        playAlertChime();
        new Notification('منظومة الأمن والجوازات والمنافذ', {
          body: 'تم تفعيل التنبيهات الفورية بنجاح على شريط المهام.'
        });
      }
    }
  };

  const markAsRead = async (id?: string) => {
    try {
      await fetch('/api/push-notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.map(n => (!id || n.id === id ? { ...n, isRead: true } : n)));
      if (activeToast && (!id || activeToast.id === id)) {
        setActiveToast(null);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleActionClick = (notif: PushNotificationItem) => {
    markAsRead(notif.id);
    setActiveToast(null);
    setShowTaskbarTray(false);
    if (notif.targetTab) {
      onNavigateToTab(notif.targetTab as TabType);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'passport_status':
        return <CreditCard size={18} className="text-blue-400" />;
      case 'new_transaction':
        return <Inbox size={18} className="text-amber-400" />;
      case 'sla_warning':
        return <AlertTriangle size={18} className="text-rose-400" />;
      case 'correspondence_signed':
        return <ShieldCheck size={18} className="text-emerald-400" />;
      default:
        return <Bell size={18} className="text-indigo-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white animate-pulse">عاجل جداً</span>;
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">هام</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-300">عادي</span>;
    }
  };

  return (
    <>
      {/* 1. Floating Live Push Toast (Top-Right / Bottom-Right) */}
      {activeToast && (
        <div className="fixed bottom-6 left-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300 no-print">
          <div className="bg-slate-950 text-white rounded-2xl p-4 shadow-2xl border-2 border-amber-500/80 backdrop-blur-md relative overflow-hidden">
            {/* Top glowing bar */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-blue-500 animate-pulse" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl mt-0.5">
                  {getTypeIcon(activeToast.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-sm text-amber-300 truncate">{activeToast.title}</span>
                    {getPriorityBadge(activeToast.priority)}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {activeToast.message}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2 font-mono">
                    <Clock size={11} />
                    <span>{new Date(activeToast.createdAt).toLocaleTimeString('ar-YE')}</span>
                    {activeToast.officerName && (
                      <span className="text-slate-400">| المصدر: {activeToast.officerName}</span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveToast(null)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">تنبيه دفع حي ومباشر</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markAsRead(activeToast.id)}
                  className="px-2.5 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  تجاهل
                </button>
                <button
                  onClick={() => handleActionClick(activeToast)}
                  className="px-3.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg shadow-md transition flex items-center gap-1.5"
                >
                  <span>عرض المعاملة</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Taskbar Push Notifications Dock (Bottom Right Toggle) */}
      <div className="fixed bottom-6 right-6 z-40 no-print flex items-center gap-2">
        <button
          onClick={() => setShowTaskbarTray(!showTaskbarTray)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl transition transform active:scale-95 border ${
            unreadCount > 0 
              ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white border-blue-400/50 hover:shadow-blue-900/40' 
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
          title="شريط تنبيهات المعاملات والجوازات (Push Notifications)"
        >
          <div className="relative">
            <Bell size={18} className={unreadCount > 0 ? 'animate-bounce text-amber-300' : ''} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono ring-2 ring-slate-900">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-bold hidden sm:inline">تنبيهات شريط المهام</span>
        </button>
      </div>

      {/* 3. Taskbar Notification Center Drawer */}
      {showTaskbarTray && (
        <div className="fixed bottom-20 right-6 z-50 w-96 max-w-[90vw] bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 no-print text-xs">
          {/* Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl">
                <Bell size={16} />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-100">شريط تنبيهات الدفع الفوري</h3>
                <span className="text-[10px] text-slate-400 font-mono">Realtime Sovereign Notifications</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg border transition ${soundEnabled ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' : 'text-slate-500 border-slate-700'}`}
                title={soundEnabled ? 'صوت التنبيه مفعّل' : 'صوت التنبيه صامت'}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <button
                onClick={() => setShowTaskbarTray(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Browser Permission Banner if not granted */}
          {browserPerm !== 'granted' && (
            <div className="bg-blue-950/80 border-b border-blue-900/60 p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-blue-200 text-[11px]">
                <Sparkles size={14} className="text-blue-400 shrink-0" />
                <span>تفعيل تنبيهات المتصفح على سطح المكتب؟</span>
              </div>
              <button
                onClick={requestBrowserPermission}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black shrink-0 shadow-xs"
              >
                سماح
              </button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{unreadCount} غير مقروء من إجمالي {notifications.length}</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead()}
                className="text-blue-400 hover:text-blue-300 font-bold hover:underline"
              >
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-600" />
                <p>لا توجد تنبيهات جديدة في شريط المهام</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleActionClick(notif)}
                  className={`p-3 rounded-2xl transition cursor-pointer flex items-start gap-3 ${
                    notif.isRead 
                      ? 'bg-slate-900/30 hover:bg-slate-900/70 text-slate-400' 
                      : 'bg-slate-900 border border-slate-700/60 text-slate-200 shadow-sm hover:border-blue-500/50'
                  }`}
                >
                  <div className="p-2 bg-slate-800 rounded-xl mt-0.5 shrink-0">
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`font-bold text-xs truncate ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                        {notif.title}
                      </span>
                      {getPriorityBadge(notif.priority)}
                    </div>
                    <p className="text-[11px] leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                      <span>{new Date(notif.createdAt).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-blue-400 flex items-center gap-1 hover:underline">
                        <span>متابعة</span>
                        <ExternalLink size={10} />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-[10px] text-slate-400">
            نظام التنبيهات السيادية المرتبط بكافة المنافذ والجوازات والمعاملات
          </div>
        </div>
      )}
    </>
  );
}
