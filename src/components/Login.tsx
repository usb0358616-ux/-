import React, { useState } from 'react';
import { Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
import type { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'خطأ في تسجيل الدخول');
      }
    } catch (err) {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a3a5f] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a3a5f] to-[#0a1a2f] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#f0f2f5] rounded shadow-2xl overflow-hidden border border-gray-400">
        <div className="ribbon-header p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-sm mb-4 border border-white/20">
            <ShieldCheck size={56} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">نظام إدارة الأرشيف الرقمي</h2>
          <p className="text-blue-200 mt-2 text-xs font-bold uppercase tracking-widest">Document Registry Software - Police Intelligence</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-sm text-xs font-bold border border-red-200">
              ⚠️ {error}
            </div>
          )}
          
          <div>
            <label className="label-office">اسم المستخدم (USERNAME)</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                <UserIcon size={18} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-office pr-10 py-3"
                placeholder="اسم المستخدم الرسمي"
                required
              />
            </div>
          </div>

          <div>
            <label className="label-office">كلمة المرور (PASSWORD)</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-office pr-10 py-3"
                placeholder="*******"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-office btn-office-blue py-3.5 text-lg"
          >
            {loading ? 'جاري التحميل...' : 'دخول النظام (LOGIN)'}
          </button>
        </form>
        
        <div className="p-4 bg-gray-200 text-center text-[10px] font-black text-gray-500 border-t border-gray-300">
          تحذير: النظام يخضع لرقابة أمنية مشددة. الدخول غير المصرح ملاحق قانونياً.
        </div>
      </div>
    </div>
  );
}
