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
import ArchiveSection from './components/ArchiveSection';

// New System Components
import PassportsHub from './components/PassportsHub';
import SeizureRecords from './components/SeizureRecords';
import SecurityScreening from './components/SecurityScreening';
import DeliverySection from './components/DeliverySection';
import OfficesSection from './components/OfficesSection';
import ResidencySection from './components/ResidencySection';
import ExcelImportTool from './components/ExcelImportTool';
import CentralSearchSection from './components/CentralSearchSection';
import SecurityClearanceSection from './components/SecurityClearanceSection';
import PortsSection from './components/PortsSection';
import MovementPermitsSection from './components/MovementPermitsSection';
import OrganizationsSection from './components/OrganizationsSection';
import RefugeesSection from './components/RefugeesSection';
import AuditLogSection from './components/AuditLogSection';
import PoliceIntelligenceSection from './components/PoliceIntelligenceSection';
import OfficialCorrespondenceSection from './components/OfficialCorrespondenceSection';
import MonitoredCompaniesSection from './components/MonitoredCompaniesSection';
import DeveloperModule from './components/DeveloperModule';

import type { 
  Document, 
  User, 
  PassportRecord,
  SeizureRecord,
  SecurityCheckRecord,
  DeliveryRecord,
  OfficeRecord,
  ResidencyOrImmigrantRecord,
  SecurityClearanceRequest,
  BatchTransferRecord,
  PortRecord,
  MovementPermitRecord,
  InternationalOrganization,
  RefugeeRecord,
  AuditLogEntry,
  PoliceIntelligenceRequest,
  OfficialCorrespondence,
  MonitoredCompany,
  LabelOverride
} from './types';

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
  FileText,
  Archive,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Globe,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Clock,
  Anchor,
  Navigation,
  Globe2,
  Fingerprint,
  Terminal,
  ShieldQuestion,
  FileSignature,
  FileCheck,
  Code2
} from 'lucide-react';

type TabType = 
  | 'dashboard' 
  | 'developer'
  | 'ports'
  | 'passports' 
  | 'seizures' 
  | 'security' 
  | 'intelligence'
  | 'correspondence'
  | 'companies'
  | 'clearances'
  | 'permits'
  | 'organizations'
  | 'refugees'
  | 'deliveries' 
  | 'offices' 
  | 'residencies' 
  | 'excel-tool' 
  | 'central-search' 
  | 'audit-log'
  | 'وارد' 
  | 'صادر' 
  | 'daily-summary' 
  | 'archive' 
  | 'reports';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [passports, setPassports] = useState<PassportRecord[]>([]);
  const [seizures, setSeizures] = useState<SeizureRecord[]>([]);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheckRecord[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [offices, setOffices] = useState<OfficeRecord[]>([]);
  const [residencies, setResidencies] = useState<ResidencyOrImmigrantRecord[]>([]);
  const [clearances, setClearances] = useState<SecurityClearanceRequest[]>([]);
  const [batchTransfers, setBatchTransfers] = useState<BatchTransferRecord[]>([]);
  const [ports, setPorts] = useState<PortRecord[]>([]);
  const [movementPermits, setMovementPermits] = useState<MovementPermitRecord[]>([]);
  const [organizations, setOrganizations] = useState<InternationalOrganization[]>([]);
  const [refugees, setRefugees] = useState<RefugeeRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [intelligenceRequests, setIntelligenceRequests] = useState<PoliceIntelligenceRequest[]>([]);
  const [correspondences, setCorrespondences] = useState<OfficialCorrespondence[]>([]);
  const [monitoredCompanies, setMonitoredCompanies] = useState<MonitoredCompany[]>([]);
  const [labelOverrides, setLabelOverrides] = useState<LabelOverride[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDocuments(),
        fetchPassports(),
        fetchSeizures(),
        fetchSecurityChecks(),
        fetchDeliveries(),
        fetchOffices(),
        fetchResidencies(),
        fetchClearances(),
        fetchBatchTransfers(),
        fetchPorts(),
        fetchMovementPermits(),
        fetchOrganizations(),
        fetchRefugees(),
        fetchAuditLogs(),
        fetchIntelligence(),
        fetchCorrespondence(),
        fetchCompanies(),
        fetchLabelOverrides()
      ]);
    } catch (err) {
      console.error('Failed to load system data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntelligence = async () => {
    try {
      const res = await fetch('/api/police-intelligence');
      setIntelligenceRequests(await res.json());
    } catch (err) {
      console.error('Failed to fetch police intelligence');
    }
  };

  const fetchCorrespondence = async () => {
    try {
      const res = await fetch('/api/official-correspondence');
      setCorrespondences(await res.json());
    } catch (err) {
      console.error('Failed to fetch official correspondence');
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/monitored-companies');
      setMonitoredCompanies(await res.json());
    } catch (err) {
      console.error('Failed to fetch monitored companies');
    }
  };

  const fetchLabelOverrides = async () => {
    try {
      const res = await fetch('/api/label-overrides');
      setLabelOverrides(await res.json());
    } catch (err) {
      console.error('Failed to fetch label overrides');
    }
  };

  const fetchPorts = async () => {
    try {
      const res = await fetch('/api/ports');
      setPorts(await res.json());
    } catch (err) {
      console.error('Failed to fetch ports');
    }
  };

  const fetchMovementPermits = async () => {
    try {
      const res = await fetch('/api/movement-permits');
      setMovementPermits(await res.json());
    } catch (err) {
      console.error('Failed to fetch movement permits');
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations');
      setOrganizations(await res.json());
    } catch (err) {
      console.error('Failed to fetch organizations');
    }
  };

  const fetchRefugees = async () => {
    try {
      const res = await fetch('/api/refugees');
      setRefugees(await res.json());
    } catch (err) {
      console.error('Failed to fetch refugees');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      setAuditLogs(await res.json());
    } catch (err) {
      console.error('Failed to fetch audit logs');
    }
  };

  const fetchClearances = async () => {
    try {
      const res = await fetch('/api/security-clearances');
      const data = await res.json();
      setClearances(data);
    } catch (err) {
      console.error('Failed to fetch security clearances');
    }
  };

  const fetchBatchTransfers = async () => {
    try {
      const res = await fetch('/api/batch-transfers');
      const data = await res.json();
      setBatchTransfers(data);
    } catch (err) {
      console.error('Failed to fetch batch transfers');
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents');
    }
  };

  const fetchPassports = async () => {
    try {
      const res = await fetch('/api/passports');
      const data = await res.json();
      setPassports(data);
    } catch (err) {
      console.error('Failed to fetch passports');
    }
  };

  const fetchSeizures = async () => {
    try {
      const res = await fetch('/api/seizures');
      const data = await res.json();
      setSeizures(data);
    } catch (err) {
      console.error('Failed to fetch seizures');
    }
  };

  const fetchSecurityChecks = async () => {
    try {
      const res = await fetch('/api/security-checks');
      const data = await res.json();
      setSecurityChecks(data);
    } catch (err) {
      console.error('Failed to fetch security checks');
    }
  };

  const fetchDeliveries = async () => {
    try {
      const res = await fetch('/api/deliveries');
      const data = await res.json();
      setDeliveries(data);
    } catch (err) {
      console.error('Failed to fetch deliveries');
    }
  };

  const fetchOffices = async () => {
    try {
      const res = await fetch('/api/offices');
      const data = await res.json();
      setOffices(data);
    } catch (err) {
      console.error('Failed to fetch offices');
    }
  };

  const fetchResidencies = async () => {
    try {
      const res = await fetch('/api/residencies');
      const data = await res.json();
      setResidencies(data);
    } catch (err) {
      console.error('Failed to fetch residencies');
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

  const handleToggleArchive = async (id: string, isArchived: boolean) => {
    try {
      const res = await fetch(`/api/documents/${id}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived }),
      });
      if (res.ok) {
        await fetchDocuments();
        if (selectedDoc && selectedDoc.id === id) {
          setSelectedDoc(prev => prev ? { ...prev, isArchived } : null);
        }
      }
    } catch (err) {
      console.error('Failed to toggle archive state', err);
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
            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-2.5 no-print">
              <button 
                onClick={() => setActiveTab('developer')} 
                className="btn-access !bg-red-950 !text-white !border !border-red-600/70 !h-12 px-4 text-xs font-black shadow-md flex items-center gap-2"
              >
                <Code2 size={18} className="text-red-400" />
                وحدة المطور (الوحدة 14)
              </button>

              <button 
                onClick={() => setActiveTab('ports')} 
                className="btn-access !bg-sky-700 !text-white !h-12 px-4 text-xs font-black shadow-sm"
              >
                <Anchor size={18} />
                المنافذ الـ 13 السيادية
              </button>

              <button 
                onClick={() => setActiveTab('passports')} 
                className="btn-access !bg-blue-600 !text-white !h-12 px-4 text-xs font-bold shadow-sm"
              >
                <CreditCard size={18} />
                سجل الجوازات
              </button>

              <button 
                onClick={() => setActiveTab('seizures')} 
                className="btn-access !bg-purple-600 !text-white !h-12 px-4 text-xs font-bold shadow-sm"
              >
                <ShieldAlert size={18} />
                محاضر الضبط
              </button>

              <button 
                onClick={() => setActiveTab('security')} 
                className="btn-access !bg-emerald-700 !text-white !h-12 px-4 text-xs font-bold shadow-sm"
              >
                <ShieldCheck size={18} />
                الفحص الأمني
              </button>

              <button 
                onClick={() => setActiveTab('clearances')} 
                className="btn-access !bg-indigo-600 !text-white !h-12 px-4 text-xs font-bold shadow-sm"
              >
                <Clock size={18} />
                الموافقات SLA
              </button>

              <button 
                onClick={() => setActiveTab('permits')} 
                className="btn-access !bg-indigo-800 !text-white !h-12 px-4 text-xs font-bold shadow-sm"
              >
                <Navigation size={18} />
                تصاريح التنقل
              </button>

              <button 
                onClick={() => setActiveTab('organizations')} 
                className="btn-access !bg-teal-700 !text-white !h-12 px-4 text-xs font-bold shadow-sm"
              >
                <Globe2 size={18} />
                المنظمات الدولية
              </button>

              <button 
                onClick={() => setActiveTab('refugees')} 
                className="btn-access !bg-amber-700 !text-white !h-12 px-4 text-xs font-bold shadow-sm"
              >
                <Fingerprint size={18} />
                اللاجئون والمهاجرون
              </button>

              <button 
                onClick={() => setActiveTab('intelligence')} 
                className="btn-access !bg-red-800 !text-white !h-12 px-4 text-xs font-black shadow-sm"
              >
                <ShieldQuestion size={18} />
                استخبارات الشرطة (1191/1917)
              </button>

              <button 
                onClick={() => setActiveTab('correspondence')} 
                className="btn-access !bg-cyan-800 !text-white !h-12 px-4 text-xs font-bold shadow-sm"
              >
                <FileSignature size={18} />
                المكاتبات والقوالب
              </button>

              <button 
                onClick={() => setActiveTab('companies')} 
                className="btn-access !bg-violet-800 !text-white !h-12 px-4 text-xs font-bold shadow-sm"
              >
                <FileCheck size={18} />
                الرقابة على الشركات
              </button>

              <button 
                onClick={() => setActiveTab('audit-log')} 
                className="btn-access !bg-rose-800 !text-white !h-12 px-4 text-xs font-bold shadow-sm"
              >
                <Terminal size={18} />
                سجل الرقابة
              </button>

              <button 
                onClick={() => setActiveTab('central-search')} 
                className="btn-access !bg-slate-900 !text-white !h-12 px-4 text-xs font-bold shadow-sm"
              >
                <Search size={18} />
                البحث المركزي
              </button>
            </div>

            {/* Core Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'إجمالي الجوازات', value: passports.length, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50/70', tab: 'passports' },
                { label: 'محاضر الضبط بالمنافذ', value: seizures.length, icon: ShieldAlert, color: 'text-purple-600', bg: 'bg-purple-50/70', tab: 'seizures' },
                { label: 'جاهز للتسليم', value: passports.filter(p => p.status === 'جاهز للتسليم').length, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50/70', tab: 'passports' },
                { label: 'تم تسليمها', value: passports.filter(p => p.status === 'تم التسليم').length, icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50/70', tab: 'deliveries' },
                { label: 'المكاتب والوكالات', value: offices.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50/70', tab: 'offices' },
                { label: 'الأرشيف الإلكتروني', value: documents.filter(d => d.isArchived).length, icon: Archive, color: 'text-amber-600', bg: 'bg-amber-50/70', tab: 'archive' },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveTab(stat.tab as TabType)}
                  className={`${stat.bg} p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">{stat.label}</span>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <span className={`text-2xl font-black font-mono mt-3 ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Sub-sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Latest Passports with Timeline snippet */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CreditCard className="text-blue-600" size={20} />
                    أحدث الجوازات المسجلة وحركتها
                  </h3>
                  <button 
                    onClick={() => setActiveTab('passports')} 
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    عرض الكل ←
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {passports.slice(0, 5).map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700 text-sm">{p.passportNumber}</span>
                          <span className="text-xs text-slate-500 font-semibold">• {p.fullName}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {p.seizureRecordNumber ? `محضر: ${p.seizureRecordNumber}` : p.officeName || 'تسجيل مباشر'}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks & Archive Quick Action */}
              <div className="space-y-6">
                <PersonalTasks user={user} onRefreshDocs={fetchDocuments} />

                {/* Archive Alert Card */}
                <div className="p-5 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs">
                      <Archive size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-950">قسم الأرشيف الإلكتروني واستخراج النصوص OCR</h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        {documents.filter(d => d.isArchived).length} وثيقة ومستند مؤرشف ومفهرس بالنصوص الكاملة
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('archive')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    فتح الأرشيف
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ports':
        return (
          <PortsSection 
            ports={ports} 
            user={user} 
            onRefresh={fetchAllData} 
            onNavigateToSeizures={(portName) => {
              setActiveTab('seizures');
            }}
          />
        );

      case 'permits':
        return (
          <MovementPermitsSection 
            permits={movementPermits} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'organizations':
        return (
          <OrganizationsSection 
            organizations={organizations} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'refugees':
        return (
          <RefugeesSection 
            refugees={refugees} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'audit-log':
        return (
          <AuditLogSection 
            auditLogs={auditLogs} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'passports':
        return (
          <PassportsHub 
            passports={passports} 
            user={user} 
            onRefresh={fetchAllData} 
            labelOverrides={labelOverrides}
          />
        );

      case 'seizures':
        return (
          <SeizureRecords 
            seizures={seizures} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'security':
        return (
          <SecurityScreening 
            checks={securityChecks} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'intelligence':
        return (
          <PoliceIntelligenceSection 
            requests={intelligenceRequests} 
            user={user} 
            onRefresh={fetchAllData} 
            onGenerateReply={(req) => {
              setActiveTab('correspondence');
            }}
          />
        );

      case 'correspondence':
        return (
          <OfficialCorrespondenceSection 
            correspondences={correspondences} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'companies':
        return (
          <MonitoredCompaniesSection 
            companies={monitoredCompanies} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'developer':
        return (
          <DeveloperModule 
            user={user} 
            onClose={() => setActiveTab('dashboard')} 
            onRefreshAllData={fetchAllData} 
          />
        );

      case 'clearances':
        return (
          <SecurityClearanceSection 
            clearances={clearances} 
            batchTransfers={batchTransfers} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'deliveries':
        return (
          <DeliverySection 
            deliveries={deliveries} 
            passports={passports} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'offices':
        return (
          <OfficesSection 
            offices={offices} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'residencies':
        return (
          <ResidencySection 
            residencies={residencies} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'excel-tool':
        return (
          <ExcelImportTool 
            passports={passports} 
            user={user} 
            onRefresh={fetchAllData} 
          />
        );

      case 'central-search':
        return (
          <CentralSearchSection 
            user={user} 
            onOpenPassport={() => setActiveTab('passports')} 
          />
        );

      case 'وارد':
      case 'صادر':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
              <h2 className="text-2xl font-bold text-slate-800">
                سجل المعاملات: {activeTab}
              </h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-900/20"
              >
                <Plus size={18} />
                قيد معاملة جديدة
              </button>
            </div>
            <DocumentList 
              documents={documents.filter(d => d.type === activeTab && !d.isArchived)} 
              user={user} 
              onDelete={handleDelete} 
              onSelect={setSelectedDoc} 
              onToggleArchive={handleToggleArchive}
            />
          </div>
        );

      case 'archive':
        return (
          <ArchiveSection 
            documents={documents}
            user={user}
            onRefreshDocs={fetchDocuments}
            onSelectDoc={setSelectedDoc}
          />
        );

      case 'daily-summary':
        return <DailySummary onRefreshDocs={fetchDocuments} />;

      case 'reports':
        return <Reports documents={documents} seizures={seizures} passports={passports} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { 
      id: 'developer', 
      label: 'وحدة المطور (تخصيص المنظومة)', 
      icon: Code2, 
      badge: 'Super Admin', 
      badgeColor: 'bg-red-600 text-white font-black' 
    },
    { id: 'central-search', label: 'البحث المركزي الموحد', icon: Search },
    { id: 'ports', label: 'المنافذ الـ 13 السيادية', icon: Anchor, badge: ports.length, badgeColor: 'bg-sky-600 text-white font-black' },
    { id: 'passports', label: 'الجوازات والخط الزمني', icon: CreditCard, badge: passports.length },
    { id: 'seizures', label: 'محاضر الضبط بالمنافذ', icon: ShieldAlert, badge: seizures.length },
    { id: 'security', label: 'الفحص الأمني والمطابقة', icon: ShieldCheck },
    { 
      id: 'intelligence', 
      label: 'فرع استخبارات الشرطة (1191/1917)', 
      icon: ShieldQuestion, 
      badge: intelligenceRequests.length, 
      badgeColor: 'bg-red-700 text-white font-black' 
    },
    { 
      id: 'correspondence', 
      label: 'المكاتبات الرسمية والقوالب', 
      icon: FileSignature, 
      badge: correspondences.length, 
      badgeColor: 'bg-cyan-700 text-white font-bold' 
    },
    { 
      id: 'companies', 
      label: 'الرقابة على الشركات والوكالات', 
      icon: FileCheck, 
      badge: monitoredCompanies.length, 
      badgeColor: 'bg-violet-700 text-white font-bold' 
    },
    { 
      id: 'clearances', 
      label: 'الموافقات وتتبع المدد (SLA)', 
      icon: Clock, 
      badge: clearances.filter(c => c.status === 'قيد الدراسة').length,
      badgeColor: 'bg-indigo-500 text-white font-black'
    },
    { 
      id: 'permits', 
      label: 'تصاريح التنقل والتحرك', 
      icon: Navigation, 
      badge: movementPermits.length, 
      badgeColor: 'bg-indigo-600 text-white font-bold' 
    },
    { 
      id: 'organizations', 
      label: 'المنظمات والبعثات الدولية', 
      icon: Globe2, 
      badge: organizations.length, 
      badgeColor: 'bg-teal-600 text-white font-bold' 
    },
    { 
      id: 'refugees', 
      label: 'شؤون اللاجئين والمهاجرين', 
      icon: Fingerprint, 
      badge: refugees.length, 
      badgeColor: 'bg-amber-600 text-white font-bold' 
    },
    { id: 'deliveries', label: 'سندات وإجراءات التسليم', icon: Send },
    { id: 'offices', label: 'المكاتب والوكالات', icon: Building2, badge: offices.length },
    { id: 'residencies', label: 'الإقامات والتأشيرات', icon: Globe },
    { id: 'excel-tool', label: 'استيراد ومعالجة Excel', icon: FileSpreadsheet },
    { 
      id: 'audit-log', 
      label: 'سجل الرقابة والتدقيق الأمني', 
      icon: Terminal, 
      badge: auditLogs.length, 
      badgeColor: 'bg-rose-600 text-white font-bold' 
    },
    { id: 'وارد', label: 'المعاملات الواردة', icon: Inbox },
    { id: 'صادر', label: 'المعاملات الصادرة', icon: Send },
    { id: 'daily-summary', label: 'خلاصة الأعمال اليومية', icon: FileText },
    { 
      id: 'archive', 
      label: 'قسم الأرشيف والمحتويات', 
      icon: Archive, 
      badge: documents.filter(d => d.isArchived).length,
      badgeColor: 'bg-amber-500 text-slate-950 font-black'
    },
    { id: 'reports', label: 'التقارير والإحصائيات', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`bg-slate-950 text-white transition-all duration-300 flex flex-col fixed inset-y-0 right-0 z-40 no-print ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-800 bg-slate-900/60">
          <span className={`font-black text-lg tracking-tight transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            مكتب <span className="text-blue-400">المعلومات والبيانات</span>
          </span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            {sidebarOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1.5 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition font-semibold text-xs ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={19} className={item.id === 'archive' && activeTab !== 'archive' ? 'text-amber-400' : ''} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </div>
              {sidebarOpen && item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  item.badgeColor || 'bg-blue-500/20 text-blue-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/40 space-y-3">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
              {user.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase">{user.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setUser(null)}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition font-semibold text-xs ${sidebarOpen ? '' : 'justify-center'}`}
          >
            <LogOut size={16} />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 pb-12 overflow-x-hidden ${sidebarOpen ? 'mr-64' : 'mr-20'}`}>
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-xs no-print relative border-b border-slate-200/80">
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
        
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
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
          onUpdateDoc={(updated) => {
            setSelectedDoc(updated);
            fetchDocuments();
          }}
          onToggleArchive={handleToggleArchive}
          defaultTab={selectedDoc.isArchived ? 'content' : 'memo'}
        />
      )}
    </div>
  );
}
