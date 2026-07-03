import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Calendar, 
  AlertCircle,
  Clock,
  Briefcase,
  ListTodo,
  Check,
  ChevronDown
} from 'lucide-react';
import type { PersonalTask } from '../types';

export default function PersonalTasks() {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  // Load tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('personal_work_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved personal tasks', e);
      }
    }
  }, []);

  // Save tasks to localStorage when they change
  const saveTasks = (updatedTasks: PersonalTask[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('personal_work_tasks', JSON.stringify(updatedTasks));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: PersonalTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      priority: newPriority,
      dueDate: newDueDate || undefined,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);
    setNewTitle('');
    setNewDueDate('');
    setNewPriority('medium');
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
  };

  const handleClearCompleted = () => {
    const updated = tasks.filter(t => !t.completed);
    saveTasks(updated);
  };

  // Filter tasks based on selected filter state
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  // Calculate statistics
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getPriorityBadge = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high':
        return {
          label: 'هام جداً',
          classes: 'bg-red-50 text-red-700 border-red-100'
        };
      case 'medium':
        return {
          label: 'متوسط',
          classes: 'bg-amber-50 text-amber-700 border-amber-100'
        };
      case 'low':
        return {
          label: 'عادي',
          classes: 'bg-slate-50 text-slate-600 border-slate-100'
        };
    }
  };

  const getArabicDateString = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Intl.DateTimeFormat('ar-YE', { day: 'numeric', month: 'short' }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  // Check if task is overdue
  const isOverdue = (task: PersonalTask) => {
    if (task.completed || !task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full dir-rtl" style={{ direction: 'rtl' }}>
      
      {/* Title & Icon Header */}
      <div className="flex justify-between items-center mb-5 border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-900 text-white rounded-xl">
            <ListTodo size={20} />
          </div>
          <div>
            <h3 className="font-black text-gray-800 text-base">مهامي الشخصية وتنظيم العمل</h3>
            <p className="text-[11px] text-gray-400 font-bold">مفكرة جانبية آمنة لا تؤثر على السجلات الرسمية</p>
          </div>
        </div>
        
        {/* Short fractional stat */}
        <span className="text-xs bg-slate-100 text-slate-800 font-black px-2.5 py-1 rounded-full">
          {completedCount} / {totalCount} منجز
        </span>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
            <span>نسبة إنجاز مهام اليوم</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Quick Add Form */}
      <form onSubmit={handleAddTask} className="mb-5 space-y-3">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="أضف مهمة وظيفية جديدة..." 
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none font-bold placeholder-slate-400"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!newTitle.trim()}
            className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl transition duration-200 disabled:opacity-40"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Extra Fields (Priority & Due Date) */}
        {newTitle.trim() && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 animate-in fade-in slide-in-from-top-1 duration-150">
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-1">الأهمية</label>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewPriority(p)}
                    className={`flex-1 text-[10px] py-1 px-1 rounded-lg font-black border transition ${
                      newPriority === p 
                        ? p === 'high' ? 'bg-red-600 text-white border-red-700' : p === 'medium' ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-800 text-white border-slate-900'
                        : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {p === 'high' ? 'هام جداً' : p === 'medium' ? 'متوسط' : 'عادي'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-1">تاريخ الاستحقاق (اختياري)</label>
              <input 
                type="date" 
                className="w-full p-1 text-[10px] font-bold bg-white border border-slate-200 rounded-lg outline-none"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </form>

      {/* Filter Tabs */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
          <button 
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-md transition ${filter === 'active' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            المعلقة ({pendingCount})
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md transition ${filter === 'completed' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            المنجزة ({completedCount})
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md transition ${filter === 'all' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            الكل
          </button>
        </div>

        {completedCount > 0 && (
          <button 
            onClick={handleClearCompleted}
            className="text-[10px] font-bold text-red-500 hover:text-red-700 transition"
          >
            مسح المنجز
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto max-h-[300px] min-h-[150px] space-y-2 pr-1 custom-scrollbar">
        {filteredTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <CheckCircle2 size={32} className="text-slate-200 mb-2" />
            <p className="text-xs font-bold">لا توجد مهام في هذا التبويب</p>
            <p className="text-[10px] text-slate-300">أضف مهام تنظيمية لتبسيط أعمالك الميدانية.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const priorityBadge = getPriorityBadge(task.priority);
            const overdue = isOverdue(task);

            return (
              <div 
                key={task.id} 
                className={`p-3 rounded-xl border transition-all duration-200 flex items-start gap-2.5 justify-between ${
                  task.completed 
                    ? 'bg-slate-50 border-slate-100 opacity-65' 
                    : overdue 
                      ? 'bg-red-50/50 border-red-100 hover:border-red-200' 
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                }`}
              >
                {/* Custom circular checkbox */}
                <button 
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className={`mt-0.5 shrink-0 transition text-slate-400 hover:text-slate-600 ${task.completed ? 'text-emerald-600 hover:text-emerald-700' : ''}`}
                >
                  {task.completed ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Circle size={18} />
                  )}
                </button>

                {/* Title & metadata */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className={`text-xs font-bold text-slate-800 break-words leading-tight ${task.completed ? 'line-through text-slate-400 font-medium' : ''}`}>
                    {task.title}
                  </p>

                  <div className="flex flex-wrap gap-2 items-center text-[10px]">
                    {/* Priority Badge */}
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${priorityBadge.classes}`}>
                      {priorityBadge.label}
                    </span>

                    {/* Due Date Indicator */}
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 font-bold ${overdue ? 'text-red-600 font-black' : 'text-slate-400'}`}>
                        <Calendar size={10} />
                        <span>{overdue ? 'تجاوز الاستحقاق' : 'الاستحقاق'}: {getArabicDateString(task.dueDate)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button 
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition shrink-0"
                  title="حذف المهمة"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
