import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import DocumentList from './components/DocumentList';
import DocumentForm from './components/DocumentForm';
import Reports from './components/Reports';
import DocumentDetail from './components/DocumentDetail';
import type { Document, User, DocType } from './types';
import { 
  LayoutDashboard, 
  Inbox, 
  Send, 
  FileSearch, 
  BarChart3, 
  LogOut, 
  Plus, 
  Menu,
  X as CloseIcon,
  Bell
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'وارد' | 'صادر' | 'search' | 'reports'>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDoc = async (doc: Omit<Document, 'id'>) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (res.ok) {
        setShowForm(false);
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to save document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوثيقة؟')) return;
    try {
      await fetch('/api/documents/' + id, { method: 'DELETE' });
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document');
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Control Panel Ribbon */}
            <div className="bg-white border-b-2 border-sleek-primary shadow-sm p-4 flex gap-4 no-print rounded-sm border border-gray-200">
              <button 
                onClick={() => { setActiveTab('وارد'); setShowForm(true); }} 
                className="btn-office btn-office-blue flex-1 h-16 text-lg"
              >
                <div className="bg-white/20 p-2 rounded-sm ml-2">
                  <Inbox size={24} />
                </div>
                تسجيل وارد جديد
              </button>
              <button 
                onClick={() => { setActiveTab('صادر'); setShowForm(true); }} 
                className="btn-office btn-office-green flex-1 h-16 text-lg"
              >
                <div className="bg-white/20 p-2 rounded-sm ml-2">
                  <Send size={24} />
                </div>
                تسجيل صادر جديد
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'إجمالي الوارد المحقق', value: documents.filter(d => d.type === 'وارد').length, icon: Inbox, color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50' },
                { label: 'إجمالي الصادر المعتمد', value: documents.filter(d => d.type === 'صادر').length, icon: Send, color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
                { label: 'تنبيهات الأهمية القصوى', value: documents.filter(d => d.priority === 'عاجل').length, icon: Bell, color: 'text-red-700', border: 'border-red-200', bg: 'bg-red-50' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.bg} ${stat.border} p-5 border-2 shadow-sm rounded-sm flex items-center justify-between`}>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1">{stat.label}</p>
                    <p className={`text-4xl font-mono font-black ${stat.color}`}>{stat.value.toString().padStart(3, '0')}</p>
                  </div>
                  <stat.icon size={48} className={`opacity-10 ${stat.color}`} />
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-300 shadow-sm p-2 rounded-sm">
              <div className="bg-gray-100 p-3 border-b border-gray-300 flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <LayoutDashboard size={18} className="text-sleek-primary" />
                  شاشة القيود الأخيرة (LAST ENTRIES)
                </h3>
                <button onClick={fetchDocuments} className="text-[10px] font-bold text-blue-600 hover:underline">تحديث البيانات</button>
              </div>
              <DocumentList 
                documents={documents.slice(0, 8)} 
                user={user} 
                onDelete={handleDelete} 
                onSelect={setSelectedDoc} 
              />
            </div>
          </div>
        );
      case 'وارد':
      case 'صادر':
        return (
          <div className="space-y-6">
            <div className="bg-gray-100 p-4 border border-gray-300 rounded-sm flex justify-between items-center no-print shadow-xs">
              <div className="flex items-center gap-3">
                <div className="bg-sleek-primary p-2 rounded-sm">
                  {activeTab === 'وارد' ? <Inbox className="text-white" /> : <Send className="text-white" />}
                </div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">سجل أرشيف {activeTab} (DATABASE)</h2>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                className="btn-office btn-office-blue px-8 py-2.5"
              >
                <Plus size={20} />
                قيد جديد
              </button>
            </div>
            <DocumentList 
              documents={documents.filter(d => d.type === activeTab)} 
              user={user} 
              onDelete={handleDelete} 
              onSelect={setSelectedDoc} 
            />
          </div>
        );
      case 'search':
        return (
          <div className="space-y-6">
            <div className="bg-gray-100 p-4 border border-gray-300 rounded-sm flex items-center gap-3 no-print shadow-xs">
              <div className="bg-gray-700 p-2 rounded-sm text-white">
                <FileSearch size={22} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">البحث المتقدم والأرشفة</h2>
            </div>
            <DocumentList 
              documents={documents} 
              user={user} 
              onDelete={handleDelete} 
              onSelect={setSelectedDoc} 
            />
          </div>
        );
      case 'reports':
        return <Reports documents={documents} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-sleek-bg font-sans">
      {/* Sidebar */}
      <aside className={`bg-sleek-primary text-white transition-all duration-300 flex flex-col fixed inset-y-0 right-0 z-40 no-print shadow-xl ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <span className={`font-black text-xl tracking-tighter transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            ارشيف<span className="text-sleek-secondary">الشرطة</span>
          </span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg">
            {sidebarOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1 px-3">
          {[
            { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
            { id: 'وارد', label: 'الوارد', icon: Inbox },
            { id: 'صادر', label: 'الصادر', icon: Send },
            { id: 'search', label: 'البحث', icon: FileSearch },
            { id: 'reports', label: 'التقارير', icon: BarChart3 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded transition font-semibold ${
                activeTab === item.id 
                ? 'bg-sleek-secondary text-sleek-primary shadow-md' 
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={22} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10 space-y-4">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold border border-white/20">
              {user.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-bold truncate text-white">{user.name}</p>
                <p className="text-[10px] text-sleek-secondary uppercase font-bold">{user.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setUser(null)}
            className={`w-full flex items-center gap-4 px-4 py-2 rounded text-red-400 hover:bg-red-500/10 transition font-semibold ${sidebarOpen ? '' : 'justify-center'}`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>خروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 pb-12 overflow-x-hidden ${sidebarOpen ? 'mr-64' : 'mr-20'}`}>
        <div className="sticky top-0 z-30 bg-white shadow-md border-b-2 border-sleek-secondary no-print">
          <Header 
            currentType={activeTab === 'صادر' || activeTab === 'وارد' ? activeTab : undefined} 
          />
        </div>
        
        {/* Printable Header - Only visible during print */}
        <div className="hidden print:block mb-8">
          <Header 
            currentType={activeTab === 'صادر' || activeTab === 'وارد' ? activeTab : undefined} 
          />
        </div>
        
        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-10 bg-sleek-primary text-white flex justify-between items-center px-6 text-[10px] font-bold no-print z-50">
        <div>المستخدم الحالي: {user.role === 'admin' ? 'عقيد/' : 'نقيب/'} {user.name}</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            حالة الاتصال: متصل بقاعدة البيانات
          </div>
          <div className="border-r border-white/20 h-4"></div>
          <div>{new Date().toLocaleTimeString('ar-YE')} - {new Date().toLocaleDateString('ar-YE')}</div>
        </div>
      </footer>

      {showForm && (
        <DocumentForm 
          onSave={handleSaveDoc} 
          onCancel={() => setShowForm(false)} 
          initialType={activeTab === 'صادر' ? 'صادر' : 'وارد'}
        />
      )}

      {selectedDoc && (
        <DocumentDetail 
          doc={selectedDoc} 
          onClose={() => setSelectedDoc(null)} 
        />
      )}
    </div>
  );
}
