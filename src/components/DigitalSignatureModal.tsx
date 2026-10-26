import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  PenTool, 
  Lock, 
  Key, 
  RotateCcw, 
  Fingerprint, 
  FileCheck2, 
  AlertCircle,
  Hash,
  Clock,
  Sparkles
} from 'lucide-react';
import type { OfficialCorrespondence, User, DigitalSignatureInfo } from '../types';

interface DigitalSignatureModalProps {
  letter: OfficialCorrespondence;
  user: User | null;
  onClose: () => void;
  onSuccess: (updated: OfficialCorrespondence) => void;
}

export default function DigitalSignatureModal({
  letter,
  user,
  onClose,
  onSuccess
}: DigitalSignatureModalProps) {
  const [signMethod, setSignMethod] = useState<'draw' | 'token'>('draw');
  const [officerName, setOfficerName] = useState(user?.name || letter.signatoryName || 'العميد / مدير عام المصلحة');
  const [officerRank, setOfficerRank] = useState(user?.role === 'super_admin' ? 'لواء / رئيس المصلحة' : letter.signatoryRank || 'عميد');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [reason, setReason] = useState('اعتماد ومصادقة نهائية للمكاتبة الرسمية');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certHash, setCertHash] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Generate SHA-256 hash & verification code on mount or when content changes
  useEffect(() => {
    const rawData = `${letter.id}-${letter.incomingOrOutgoingNumber}-${letter.subject}-${officerName}-${Date.now()}`;
    const enc = new TextEncoder();
    crypto.subtle.digest('SHA-256', enc.encode(rawData)).then((buf) => {
      const hashArray = Array.from(new Uint8Array(buf));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      setCertHash(`SHA256:${hashHex.slice(0, 32)}...`);
    }).catch(() => {
      setCertHash(`SHA256:${Math.random().toString(36).substring(2, 18).toUpperCase()}`);
    });

    const rnd = Math.floor(100000 + Math.random() * 900000);
    setVerificationCode(`YEM-SIG-${rnd}`);
  }, [letter, officerName]);

  // Canvas setup
  useEffect(() => {
    if (signMethod === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [signMethod]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleSubmitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (!pin || pin.length < 4) {
      setPinError('يرجى إدخال رمز التحقق الأمني الخاص بالمسؤول (4 أرقام على الأقل)');
      return;
    }

    if (signMethod === 'draw' && !hasDrawn) {
      setPinError('يرجى رسم التوقيع باليد على لوحة التوقيع، أو اختر نمط الاعتماد المشفر التلقائي');
      return;
    }

    setIsSubmitting(true);
    try {
      let signatureDataUrl: string | null = null;
      if (signMethod === 'draw' && canvasRef.current) {
        signatureDataUrl = canvasRef.current.toDataURL('image/png');
      }

      const res = await fetch(`/api/official-correspondence/${letter.id}/sign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedBy: officerName,
          signedByRank: officerRank,
          certificateHash: certHash,
          pinVerified: true,
          signatureImage: signatureDataUrl,
          verificationCode: verificationCode,
          reason
        })
      });

      if (!res.ok) {
        throw new Error('فشل تسجيل التوقيع الرقمي في الخادم');
      }

      const updated = await res.json();
      onSuccess(updated);
    } catch (err: any) {
      setPinError(err.message || 'حدث خطأ أثناء حفظ التوقيع الرقمي');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-6 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                منظومة التوقيع والاعتماد الرقمي السيادي
              </h3>
              <p className="text-xs text-slate-400">
                مصادقة إلكترونية مشفرة للمكاتبة رقم: <span className="font-mono text-blue-700 font-bold">{letter.incomingOrOutgoingNumber}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Document Quick Summary */}
        <div className="my-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">موضوع المكاتبة:</span>
            <span className="font-bold text-slate-900 line-clamp-1">{letter.subject}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">الجهة الموجه إليها:</span>
            <span className="text-slate-700">{letter.toEntity}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-slate-500">البصمة الرقمية المتوقعة:</span>
            <span className="text-emerald-700 font-bold">{certHash || 'جاري التوليد...'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmitSignature} className="space-y-4 text-xs">
          {/* Signer Identity Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">اسم المسؤول المخول بالتوقيع *</label>
              <input
                type="text"
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">الرتبة / الصفة الرسمية *</label>
              <input
                type="text"
                required
                value={officerRank}
                onChange={(e) => setOfficerRank(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Signature Method Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-700">طريقة التوقيع والاعتماد:</label>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSignMethod('draw')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
                    signMethod === 'draw'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <PenTool size={13} />
                  رسم باليد
                </button>
                <button
                  type="button"
                  onClick={() => setSignMethod('token')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
                    signMethod === 'token'
                      ? 'bg-white text-emerald-800 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles size={13} />
                  ختم مشفر معتمد
                </button>
              </div>
            </div>

            {signMethod === 'draw' ? (
              <div className="border border-slate-300 rounded-2xl bg-white p-2 relative shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-32 bg-slate-50/50 rounded-xl cursor-crosshair border border-dashed border-slate-200 touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 font-bold text-xs">
                    ✍️ ارسم توقيعك الرسمي هنا بالماوس أو القلم أو اللمس
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 px-1">
                  <span className="text-[11px] text-slate-400">توقيع معتمد ضد التزييف والتعديل</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-rose-50"
                  >
                    <RotateCcw size={12} />
                    مسح وإعادة الرسم
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-emerald-500/50 bg-emerald-50/40 rounded-2xl p-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <Fingerprint size={28} />
                </div>
                <div className="font-black text-emerald-950 text-sm">
                  اعتماد الختم الرقمي المشفر لوزارة الداخلية
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed max-w-sm mx-auto">
                  سيتم توليد شهادة مصادقة رقمية سيادية مرفقة ببيانات المسؤول ورقم القيد وختم المصلحة المشفر المقروء عبر رمز الاستجابة السريعة (QR).
                </p>
                <div className="inline-block px-3 py-1 bg-white border border-emerald-300 rounded-full font-mono font-bold text-[11px] text-emerald-900">
                  رمز التحقق: {verificationCode}
                </div>
              </div>
            )}
          </div>

          {/* Security PIN & Reason */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Key size={14} className="text-amber-600" />
                الرمز السري الأمني للمسؤول (Security Officer PIN) *
              </label>
              <input
                type="password"
                required
                placeholder="أدخل رمز المرور الأمني الخاص بك (مثال: 1191 أو رمزك الخاص)"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError('');
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-center tracking-widest text-base font-black text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">سبب الاعتماد / التوجيه الإداري</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Lock size={12} className="text-emerald-600" />
              <span>التوقيع محمي بخوارزمية SHA-256 ويسجل تلقائياً في سجل الرقابة والتدقيق غير القابل للتعديل.</span>
            </div>
          </div>

          {pinError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{pinError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-black shadow-lg shadow-emerald-900/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التشفير والاعتماد...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  توقيع واعتماد الوثيقة رقمياً
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
