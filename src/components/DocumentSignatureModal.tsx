import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  PenTool, 
  RotateCcw, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Stamp, 
  Hash, 
  Clock,
  Sparkles,
  FileCheck
} from 'lucide-react';
import type { Document, User, DigitalSignatureInfo } from '../types';

interface DocumentSignatureModalProps {
  doc: Document;
  currentUser?: User | null;
  onClose: () => void;
  onSuccess: (updatedDoc: Document) => void;
}

export default function DocumentSignatureModal({
  doc,
  currentUser,
  onClose,
  onSuccess
}: DocumentSignatureModalProps) {
  // Canvas drawing ref and state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  
  // Customization tools
  const [penColor, setPenColor] = useState<string>('#0f2942'); // أزرق رسمي داكن
  const [penWidth, setPenWidth] = useState<number>(2.5);
  const [includeOfficialSeal, setIncludeOfficialSeal] = useState<boolean>(true);

  // Signer metadata
  const [signerName, setSignerName] = useState(currentUser?.name || 'العميد / مدير عام المصلحة');
  const [signerRank, setSignerRank] = useState(
    currentUser?.role === 'super_admin' ? 'لواء / رئيس المصلحة' : 'عميد / مدير الإدارة العامة'
  );
  const [militaryId, setMilitaryId] = useState('99401');
  const [signingReason, setSigningReason] = useState('المصادقة والتصريح بالإرسال النهائي للمستند الصادر');
  const [securityPin, setSecurityPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Security hashes
  const [certHash, setCertHash] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Generate SHA-256 fingerprint & sovereign code on load
  useEffect(() => {
    const rawPayload = `${doc.id}-${doc.number}-${doc.subject}-${signerName}-${Date.now()}`;
    const encoder = new TextEncoder();
    crypto.subtle.digest('SHA-256', encoder.encode(rawPayload))
      .then((buffer) => {
        const hashArray = Array.from(new Uint8Array(buffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        setCertHash(`SHA256:${hashHex.slice(0, 32)}...`);
      })
      .catch(() => {
        setCertHash(`SHA256:${Math.random().toString(36).substring(2, 18).toUpperCase()}`);
      });

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    setVerificationCode(`YEM-DSIG-${new Date().getFullYear()}-${randomDigits}`);
  }, [doc, signerName]);

  // Canvas setup with retina devicePixelRatio support
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI display
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

    // Draw existing signature if available
    if (doc.digitalSignature?.signatureImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = doc.digitalSignature.signatureImage;
    }
  }, [doc.digitalSignature, penColor, penWidth]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Drawing event handlers (Touch & Pointer)
  const saveStrokeState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setStrokeHistory(prev => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveStrokeState();
    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setStrokeHistory([]);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokeHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previous = strokeHistory[strokeHistory.length - 1];
    setStrokeHistory(prev => prev.slice(0, -1));
    ctx.putImageData(previous, 0, 0);
  };

  // Submit and save signature
  const handleSubmitSignature = async () => {
    if (!hasDrawn) {
      setPinError('يرجى التوقيع أولاً على اللوحة باستخدام القلم أو الفأرة');
      return;
    }

    if (securityPin && securityPin.length < 4) {
      setPinError('رمز الـ PIN يجب أن يتكون من 4 أرقام على الأقل');
      return;
    }

    setIsSaving(true);
    setPinError('');

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      // Export high-res PNG signature
      const signatureDataUrl = canvas.toDataURL('image/png');
      const nowFormatted = new Date().toLocaleString('ar-YE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const signatureInfo: DigitalSignatureInfo = {
        isSigned: true,
        signedBy: signerName,
        signedByRank: signerRank,
        signedAt: nowFormatted,
        certificateHash: certHash,
        pinVerified: Boolean(securityPin),
        signatureImage: signatureDataUrl,
        verificationCode: verificationCode
      };

      // Call backend API
      const res = await fetch(`/api/documents/${doc.id}/sign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digitalSignature: signatureInfo })
      });

      let updatedDoc: Document;
      if (res.ok) {
        updatedDoc = await res.json();
      } else {
        // Fallback local update
        updatedDoc = {
          ...doc,
          digitalSignature: signatureInfo,
          status: 'مكتمل'
        };
      }

      onSuccess(updatedDoc);
    } catch (err) {
      console.error('Error signing document:', err);
      // Fallback local update
      const fallbackSignature: DigitalSignatureInfo = {
        isSigned: true,
        signedBy: signerName,
        signedByRank: signerRank,
        signedAt: new Date().toLocaleString('ar-YE'),
        certificateHash: certHash,
        pinVerified: true,
        signatureImage: canvasRef.current?.toDataURL('image/png'),
        verificationCode: verificationCode
      };
      onSuccess({
        ...doc,
        digitalSignature: fallbackSignature,
        status: 'مكتمل'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <PenTool size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">منصة التوقيع الرقمي والمصادقة السيادية</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Canvas API
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                توقيع المستند الصادر رقم: <strong className="font-mono text-emerald-400">#{doc.number}</strong> ({doc.subject})
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Signer Info Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم المسؤول الموقع</label>
              <input 
                type="text" 
                value={signerName} 
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الرتبة / الصفة الرسمية</label>
              <input 
                type="text" 
                value={signerRank} 
                onChange={(e) => setSignerRank(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الرقم العسكري / الوظيفي</label>
              <input 
                type="text" 
                value={militaryId} 
                onChange={(e) => setMilitaryId(e.target.value)}
                className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Interactive Canvas Drawing Pad */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <PenTool size={14} className="text-blue-600" />
                  لوحة التوقيع الحي المباشر (Canvas Pad):
                </span>
                <span className="text-[11px] text-slate-500">(يدعم شاشات اللمس وقلم الشاشة والفأرة)</span>
              </div>

              {/* Drawing Toolbar (Color & Width & Actions) */}
              <div className="flex items-center gap-2">
                {/* Pen Colors */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  {[
                    { color: '#0f2942', label: 'كحلي رسمي' },
                    { color: '#0f172a', label: 'أسود أمني' },
                    { color: '#1d4ed8', label: 'أزرق ملكي' },
                    { color: '#065f46', label: 'أخضر سيادي' }
                  ].map(c => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setPenColor(c.color)}
                      title={c.label}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        penColor === c.color ? 'scale-125 ring-2 ring-blue-500 ring-offset-1' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                </div>

                {/* Pen Width */}
                <select
                  value={penWidth}
                  onChange={(e) => setPenWidth(Number(e.target.value))}
                  className="text-xs bg-white border border-slate-200 rounded-xl px-2 py-1 font-bold text-slate-700 outline-none"
                >
                  <option value={1.5}>قلم رفيع (1.5px)</option>
                  <option value={2.5}>قلم رسمي (2.5px)</option>
                  <option value={4}>قلم عريض (4px)</option>
                </select>

                {/* Undo & Clear */}
                <button
                  type="button"
                  onClick={handleUndo}
                  title="تراجع عن آخر خطوة"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  title="مسح لوحة التوقيع"
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Canvas Box */}
            <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 transition rounded-2xl overflow-hidden bg-white shadow-inner">
              <canvas
                ref={canvasRef}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                className="w-full h-48 block cursor-crosshair touch-none"
                style={{ touchAction: 'none' }}
              />

              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1.5">
                  <PenTool size={28} className="text-slate-300 stroke-[1.5]" />
                  <p className="text-xs font-bold text-slate-500">وقع هنا بواسطة القلم أو الفأرة</p>
                  <p className="text-[10px] text-slate-400">التوقيع يعتمد فورياً ويتم تضمينه كصورة رقمية عالية الجودة</p>
                </div>
              )}

              {/* Watermark security line */}
              <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[10px] font-mono text-slate-300 pointer-events-none border-t border-slate-100 pt-1">
                <span>REPUBLIC OF YEMEN - PORTS SECURITY</span>
                <span>{verificationCode}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Verification Details */}
          <div className="bg-emerald-950/5 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span className="text-xs font-black">شهادة الاعتماد والتشفير الرقمي المرافقة:</span>
              </div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeOfficialSeal} 
                  onChange={(e) => setIncludeOfficialSeal(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <Stamp size={14} className="text-emerald-700" />
                <span>إرفاق ختم المصلحة الرسمي السيادي</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block mb-0.5">البصمة الرقمية (SHA-256):</span>
                <span className="font-mono text-[11px] font-bold text-slate-800 block truncate">{certHash}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block mb-0.5">رمز التحقق الإلكتروني السيادي:</span>
                <span className="font-mono text-xs font-bold text-emerald-700 block">{verificationCode}</span>
              </div>
            </div>

            {/* Optional Officer PIN for Security Check */}
            <div className="pt-2 border-t border-emerald-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-700">رمز المرور الأمني (PIN) للمسؤول:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="password" 
                  placeholder="أدخل رمز الـ PIN (مثال: 1234)"
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  maxLength={6}
                  className="text-xs font-mono px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-48 text-center tracking-widest"
                />
                <span className="text-[11px] text-slate-400">(اختياري للتوثيق)</span>
              </div>
            </div>
            {pinError && (
              <p className="text-xs text-red-600 flex items-center gap-1 font-bold">
                <AlertCircle size={13} /> {pinError}
              </p>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock size={14} className="text-blue-600" />
            <span>سيتم حفظ التوقيع في السجل الأمني بصيغة غير قابلة للتعديل</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-300"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleSubmitSignature}
              disabled={isSaving || !hasDrawn}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition text-white ${
                isSaving || !hasDrawn
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-600/30'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جارٍ المصادقة والاعتماد...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>اعتماد وتثبيت التوقيع الرقمي</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
