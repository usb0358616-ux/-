import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import DocumentList from './components/DocumentList';
import DocumentForm from './components/DocumentForm';
import Reports from './components/Reports';
import DocumentDetail from './components/DocumentDetail';
import DailySummary from './components/DailySummary';
import NotificationsBell from './components/NotificationsBell';
import PersonalTasks from './components/PersonalTasks';
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
  Bell,
  FileText
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'وارد' | 'صادر' | 'search' | 'reports' | 'daily-summary'>('dashboard');
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
          <div className="space-y-8">
            {/* Quick Actions - Access Style */}
            <div className="flex flex-col sm:flex-row gap-4 no-print">
              <button onClick={() => { setActiveTab('وارد'); setShowForm(true); }} className="btn-access !bg-blue-600 !text-white !h-16 flex-1 text-lg">
                <Plus size={24} />
                وارد جديد
              </button>
              <button onClick={() => { setActiveTab('صادر'); setShowForm(true); }} className="btn-access !bg-orange-600 !text-white !h-16 flex-1 text-lg">
                <Plus size={24} />
                صادر جديد
              </button>
              <button onClick={() => setActiveTab('daily-summary')} className="btn-access !bg-emerald-700 !text-white !h-16 flex-1 text-lg">
                <FileText size={24} />
                خلاصة الأعمال اليومية
              </button>
              <button onClick={() => setActiveTab('reports')} className="btn-access !bg-slate-700 !text-white !h-16 flex-1 text-lg">
                <BarChart3 size={24} />
                التقارير
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'إجمالي الوارد', value: documents.filter(d => d.type === 'وارد').length, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'إجمالي الصادر', value: documents.filter(d => d.type === 'صادر').length, icon: Send, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'المعاملات العاجلة', value: documents.filter(d => d.priority === 'عاجل').length, icon: Bell, color: 'text-red-600', bg: 'bg-red-50' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-white shadow-sm flex items-center justify-between`}>
                  <div>
                    <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon size={40} className={`opacity-20 ${stat.color}`} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-r-4 border-slate-800 pr-3">آخر التحركات والقيود</h3>
                <DocumentList 
                  documents={documents.slice(0, 10)} 
                  user={user} 
                  onDelete={handleDelete} 
                  onSelect={setSelectedDoc} 
                />
              </div>
              <div className="lg:col-span-1">
                <PersonalTasks />
              </div>
            </div>
          </div>
        );
      case 'وارد':
      case 'صادر':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-2xl font-bold text-slate-800">سجل {activeTab}</h2>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md transition transform active:scale-95"
              >
                <Plus size={20} />
                إضافة جديد
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
            <h2 className="text-2xl font-bold text-slate-800 no-print">البحث المتقدم والأرشفة</h2>
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
      case 'daily-summary':
        return <DailySummary onRefreshDocs={fetchDocuments} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 flex flex-col fixed inset-y-0 right-0 z-40 no-print ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <span className={`font-black text-xl tracking-tighter transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            ارشيف<span className="text-blue-400">الشرطة</span>
          </span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
            {sidebarOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
            { id: 'وارد', label: 'الوارد', icon: Inbox },
            { id: 'صادر', label: 'الصادر', icon: Send },
            { id: 'daily-summary', label: 'خلاصة الأعمال اليومية', icon: FileText },
            { id: 'search', label: 'البحث', icon: FileSearch },
            { id: 'reports', label: 'التقارير', icon: BarChart3 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-semibold ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={24} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold border border-slate-600">
              {user.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase">{user.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setUser(null)}
            className={`w-full flex items-center gap-4 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition font-semibold ${sidebarOpen ? '' : 'justify-center'}`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>خروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 pb-12 overflow-x-hidden ${sidebarOpen ? 'mr-64' : 'mr-20'}`}>
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm no-print relative">
          <div className="absolute left-8 top-1/2 -translate-y-1/2 z-40">
            <NotificationsBell onStatusChanged={fetchDocuments} />
          </div>
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
