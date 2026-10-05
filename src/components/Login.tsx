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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8 bg-slate-800 text-white text-center">
          <div className="inline-flex items-center justify-center p-4 bg-slate-700 rounded-full mb-4">
            <ShieldCheck size={48} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold">نظام إدارة الوثائق</h2>
          <p className="text-slate-400 mt-2">مكتب استخبارات الشرطة - فرع الجوازات</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المستخدم</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                <UserIcon size={20} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                <Lock size={20} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="************"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'دخول النظام'}
          </button>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => { setUsername('developer'); setPassword('dev'); }}
              className="flex-1 py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg border border-red-200 text-center transition"
            >
              دخول المطور (Super Admin)
            </button>
            <button
              type="button"
              onClick={() => { setUsername('admin'); setPassword('123'); }}
              className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 text-center transition"
            >
              دخول مدير النظام (admin)
            </button>
          </div>
        </form>
        
        <div className="p-4 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-100">
          تنبيه: هذا النظام مخصص للاستخدام الرسمي السيادي فقط.
        </div>
      </div>
    </div>
  );
}
