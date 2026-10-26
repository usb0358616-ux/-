import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  ShieldAlert, 
  Filter, 
  Calendar, 
  ArrowUpRight,
  Zap,
  Sparkles,
  FileCheck2,
  Printer
} from 'lucide-react';
import type { SecurityClearanceRequest, ClearanceDepartment } from '../types';
import { OFFICIAL_SLA_RULES } from './SecurityClearanceSection';

interface SlaDashboardChartsProps {
  clearances: SecurityClearanceRequest[];
  onSelectRequest?: (req: SecurityClearanceRequest) => void;
  onRefresh?: () => void;
}

export default function SlaDashboardCharts({ clearances, onSelectRequest, onRefresh }: SlaDashboardChartsProps) {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [onlyOverdueFilter, setOnlyOverdueFilter] = useState(false);

  // 1. Calculate SLA metrics for each clearance
  const analyzedClearances = clearances.map(c => {
    const isCompleted = c.status === 'تمت الموافقة' || c.status === 'مرفوض';
    const dueTime = new Date(c.dueDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));
    
    const isOverdue = !isCompleted && diffDays < 0;
    const isDueToday = !isCompleted && diffDays === 0;
    const daysOverdue = isOverdue ? Math.abs(diffDays) : 0;

    return {
      ...c,
      isCompleted,
      isOverdue,
      isDueToday,
      daysRemaining: diffDays,
      daysOverdue
    };
  });

  const filteredClearances = analyzedClearances.filter(c => {
    const matchesDept = selectedDeptFilter === 'all' || c.department === selectedDeptFilter;
    const matchesOverdue = onlyOverdueFilter ? c.isOverdue : true;
    return matchesDept && matchesOverdue;
  });

  // KPI Calculations
  const totalCount = analyzedClearances.length;
  const completedCount = analyzedClearances.filter(c => c.isCompleted).length;
  const pendingCount = analyzedClearances.filter(c => !c.isCompleted).length;
  const overdueCount = analyzedClearances.filter(c => c.isOverdue).length;
  const dueTodayCount = analyzedClearances.filter(c => c.isDueToday).length;
  const onTimePendingCount = analyzedClearances.filter(c => !c.isCompleted && !c.isOverdue && !c.isDueToday).length;

  const complianceRate = totalCount > 0 ? Math.round(((totalCount - overdueCount) / totalCount) * 100) : 100;

  // 2. Department Breakdown Chart Data
  const departmentsList: ClearanceDepartment[] = [
    'الإدارة العامة للجنسية',
    'الإدارة العامة للشؤون العربية والأجنبية',
    'الإدارة العامة لشؤون اللاجئين',
    'الإدارة العامة لوثائق السفر'
  ];

  const deptChartData = departmentsList.map(dept => {
    const deptItems = analyzedClearances.filter(c => c.department === dept);
    const deptCompleted = deptItems.filter(c => c.isCompleted).length;
    const deptOverdue = deptItems.filter(c => c.isOverdue).length;
    const deptInProgress = deptItems.filter(c => !c.isCompleted && !c.isOverdue).length;
    
    // Short label for chart display
    const shortLabel = dept
      .replace('الإدارة العامة لـ', '')
      .replace('الإدارة العامة ', '');

    return {
      department: shortLabel,
      fullDept: dept,
      منجزة: deptCompleted,
      'قيد الدراسة (في الموعد)': deptInProgress,
      'متأخرة عن المدة (SLA)': deptOverdue,
      total: deptItems.length
    };
  });

  // 3. Status Distribution Pie Chart Data
  const pieData = [
    { name: 'منجزة في الموعد', value: completedCount, color: '#10b981' },
    { name: 'قيد المتابعة ضمن المدة', value: onTimePendingCount, color: '#3b82f6' },
    { name: 'تستحق اليوم', value: dueTodayCount, color: '#f59e0b' },
    { name: 'متأخرة عن المدة القانونية', value: overdueCount, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // 4. Comparison of Target Days vs Actual Average (15 Services Catalog)
  const serviceComparisonData = [
    { service: 'زواج يمني/أجنبية', target: 20, actual: 16 },
    { service: 'اكتساب الجنسية', target: 20, actual: 22 },
    { service: 'جنسية بقرار جمهوري', target: 30, actual: 28 },
    { service: 'تأشيرة دخول', target: 7, actual: 5 },
    { service: 'إقامة أول مرة', target: 7, actual: 6 },
    { service: 'تجديد إقامة', target: 3, actual: 2 },
    { service: 'تسجيل لجوء', target: 3, actual: 3 },
    { service: 'وثائق سفر فلسطينيين', target: 3, actual: 2 }
  ];

  // Critical Overdue Requests
  const overdueItems = analyzedClearances
    .filter(c => c.isOverdue)
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  return (
    <div className="space-y-6 font-sans">
      {/* Dashboard Top Header & Filter Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/30 border border-indigo-500/40 rounded-2xl text-indigo-300">
              <TrendingUp size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">لوحة مراقبة مدد الموافقات الأمنية (SLA Dashboard)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white font-mono uppercase">
                  كتالوج الـ 15 خدمة
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                مراقبة حية للالتزام بالمدد القانونية المحددة بمستندات وزارة الداخلية ومعالجة المعاملات المتأخرة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            <select
              value={selectedDeptFilter}
              onChange={e => setSelectedDeptFilter(e.target.value)}
              className="bg-slate-800/90 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">كافة الإدارات الأربع</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <button
              onClick={() => setOnlyOverdueFilter(!onlyOverdueFilter)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                onlyOverdueFilter 
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md animate-pulse' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              }`}
            >
              <AlertTriangle size={14} className={onlyOverdueFilter ? 'text-white' : 'text-rose-400'} />
              <span>المتأخرة فقط ({overdueCount})</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Printer size={15} />
              <span>طباعة التقرير البياني</span>
            </button>
          </div>
        </div>

        {/* 4 Sovereign KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">إجمالي المعاملات</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-white">{totalCount}</span>
              <span className="text-[11px] text-indigo-400 font-bold">100%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full w-full" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">المعاملات المنجزة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-emerald-400">{completedCount}</span>
              <span className="text-[11px] text-emerald-400 font-bold">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }} 
              />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">معاملات متأخرة عن SLA</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-rose-400">{overdueCount}</span>
              <span className="text-[11px] text-rose-400 font-bold">تحتاج تدخلاً</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-rose-500 h-full transition-all duration-500" 
                style={{ width: `${totalCount > 0 ? (overdueCount / totalCount) * 100 : 0}%` }} 
              />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">نسبة الالتزام باللائحة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-amber-400">{complianceRate}%</span>
              <span className="text-[11px] text-slate-400 font-mono">الهدف: 95%+</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-amber-400 h-full transition-all duration-500" 
                style={{ width: `${complianceRate}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Bar Chart of Transactions by Department (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" />
                توزيع المعاملات حسب الإدارات وحالة الالتزام بـ SLA
              </h3>
              <p className="text-xs text-slate-500 mt-1">مقارنة المعاملات المنجزة، قيد الدراسة، والمتأخرة لكل إدارة</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              تحديث فوري
            </span>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="department" 
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    border: 'none',
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="منجزة" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={35} />
                <Bar dataKey="قيد الدراسة (في الموعد)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={35} />
                <Bar dataKey="متأخرة عن المدة (SLA)" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pie Chart of SLA Adherence Distribution (1 column) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-1">
              <Clock size={18} className="text-amber-500" />
              مؤشر الالتزام الكلي بالمدد القانونية
            </h3>
            <p className="text-xs text-slate-500 mb-4">النسب المئوية لحالات المعاملات</p>

            <div className="h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '10px', 
                      color: '#fff', 
                      fontSize: '11px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium truncate max-w-[170px]">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: Comparison of Statutory Targets vs Actual Averages */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Zap size={18} className="text-amber-600" />
              مقارنة المدة القانونية المستهدفة (SLA) مقابل متوسط الإنجاز الفعلي (بالأيام)
            </h3>
            <p className="text-xs text-slate-500 mt-1">تحديد مواضع التباطؤ في كتالوج خدمات وزارة الداخلية</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            أيام العمل الرسمية
          </span>
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="service" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" يوم" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '10px', 
                  color: '#fff', 
                  fontSize: '12px' 
                }} 
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold' }} />
              <Bar dataKey="target" name="المدة القانونية باللائحة" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="actual" name="متوسط الإنجاز الفعلي" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Table: Overdue Transactions Urgent Intervention */}
      {overdueItems.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-lg overflow-hidden">
          <div className="p-5 bg-rose-50/70 border-b border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-600 text-white rounded-xl animate-pulse">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm text-rose-950">
                  قائمة المعاملات المتأخرة المستحقة للتدخل العاجل ({overdueItems.length} معاملة)
                </h3>
                <p className="text-xs text-rose-700">تجاوزت السقف الزمني المحدد باللائحة وتتطلب إشعار استعجال فوري</p>
              </div>
            </div>

            <span className="text-xs font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-xl border border-rose-300">
              أولوية قصوى
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4">رقم المعاملة</th>
                  <th className="py-3 px-4">صاحب الطلب</th>
                  <th className="py-3 px-4">الخدمة المطلوبة</th>
                  <th className="py-3 px-4">الإدارة المختصة</th>
                  <th className="py-3 px-4 text-center">المدة النظامية</th>
                  <th className="py-3 px-4 text-center">التأخير الفعلي</th>
                  <th className="py-3 px-4 text-center">إجراء الاستعجال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueItems.map(item => (
                  <tr key={item.id} className="hover:bg-rose-50/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.transactionNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{item.applicantName}</td>
                    <td className="py-3.5 px-4 text-indigo-700 font-medium">{item.serviceType}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.department}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-600">
                      {item.slaDays} يوم
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-bold font-mono text-[11px] border border-rose-300">
                        متأخرة بـ {item.daysOverdue} يوم
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          if (onSelectRequest) onSelectRequest(item);
                        }}
                        className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 mx-auto"
                      >
                        <Zap size={13} />
                        <span>تسريع وإشعار الاستخبارات</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
