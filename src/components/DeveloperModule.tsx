import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Wrench, 
  AlertOctagon, 
  Settings2, 
  Sliders, 
  ListFilter, 
  FileText, 
  Layers, 
  Hash, 
  Type, 
  Eye, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  RotateCcw, 
  Printer, 
  CheckCircle2, 
  ShieldAlert, 
  Lock, 
  Search, 
  Download, 
  Upload, 
  Copy, 
  RefreshCw, 
  X, 
  ChevronRight, 
  LayoutTemplate,
  Calendar,
  Sparkles,
  HelpCircle,
  Building,
  Check,
  Smartphone,
  CreditCard,
  FileCheck
} from 'lucide-react';
import type { 
  FieldDefinition, 
  CustomFieldValue, 
  LabelOverride, 
  ListDefinition, 
  ListValue, 
  AutoFieldRule, 
  PrintTemplate, 
  TemplateSection, 
  FormLayout, 
  SchemaSnapshot,
  EntityType,
  CustomFieldType,
  User
} from '../types';

interface DeveloperModuleProps {
  user: User | null;
  onClose: () => void;
  onRefreshAllData?: () => void;
}

export default function DeveloperModule({ user, onClose, onRefreshAllData }: DeveloperModuleProps) {
  // Navigation State within Developer Module
  const [activeSubModule, setActiveSubModule] = useState<
    'panel' | 'fields' | 'labels' | 'lists' | 'auto_fields' | 'templates' | 'layouts' | 'snapshots'
  >('panel');

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Core Metadata State
  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([]);
  const [labelOverrides, setLabelOverrides] = useState<LabelOverride[]>([]);
  const [listDefinitions, setListDefinitions] = useState<ListDefinition[]>([]);
  const [listValues, setListValues] = useState<ListValue[]>([]);
  const [autoFieldRules, setAutoFieldRules] = useState<AutoFieldRule[]>([]);
  const [printTemplates, setPrintTemplates] = useState<PrintTemplate[]>([]);
  const [formLayouts, setFormLayouts] = useState<FormLayout[]>([]);
  const [schemaSnapshots, setSchemaSnapshots] = useState<SchemaSnapshot[]>([]);

  // Double Confirmation State (Sensitive developer password prompt)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmActionTitle, setConfirmActionTitle] = useState('');
  const [confirmActionWarning, setConfirmActionWarning] = useState('');

  // 1. Field Manager State
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('refugee');
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const [newFieldData, setNewFieldData] = useState<Partial<FieldDefinition>>({
    entity_type: 'refugee',
    field_key: '',
    label_ar: '',
    label_en: '',
    field_type: 'text',
    is_required: 0,
    is_visible: 1,
    display_order: 10,
    group_name: 'بيانات عامة',
    help_text: '',
    default_value: '',
    list_code: ''
  });

  // 2. Label Editor State
  const [labelSearch, setLabelSearch] = useState('');
  const [pendingLabelEdits, setPendingLabelEdits] = useState<{ [key: string]: string }>({});

  // 3. List Manager State
  const [selectedListCode, setSelectedListCode] = useState<string>('nationalities');
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [newListData, setNewListData] = useState({ list_code: '', list_name_ar: '', description: '' });
  const [showAddValueModal, setShowAddValueModal] = useState(false);
  const [newValueData, setNewValueData] = useState({ value_ar: '', value_en: '', code: '' });

  // 4. Auto Fields State
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [newRuleData, setNewRuleData] = useState<Partial<AutoFieldRule>>({
    entity_type: 'seizure',
    field_key: 'recordNumber',
    rule_type: 'sequence',
    rule_pattern: 'محضر-{YYYY}-{NNNNN}',
    reset_period: 'yearly',
    current_counter: 1,
    counter_padding: 5,
    notes: ''
  });

  // 5. Print Template Editor State
  const [selectedTemplate, setSelectedTemplate] = useState<PrintTemplate | null>(null);
  const [templateSubTab, setTemplateSubTab] = useState<'editor' | 'header_footer' | 'preview'>('editor');
  const [templateHtmlBody, setTemplateHtmlBody] = useState('');
  const [templateHeaderHtml, setTemplateHeaderHtml] = useState('');
  const [templateFooterHtml, setTemplateFooterHtml] = useState('');

  // 6. Layout Designer State
  const [layoutEntity, setLayoutEntity] = useState<EntityType>('refugee');

  useEffect(() => {
    loadAllMetadata();
  }, []);

  const loadAllMetadata = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/developer/metadata/all');
      const data = await res.json();
      setFieldDefinitions(data.fieldDefinitions || []);
      setLabelOverrides(data.labelOverrides || []);
      setListDefinitions(data.listDefinitions || []);
      setListValues(data.listValues || []);
      setAutoFieldRules(data.autoFieldRules || []);
      setPrintTemplates(data.printTemplates || []);
      setFormLayouts(data.formLayouts || []);
      setSchemaSnapshots(data.schemaSnapshots || []);

      if (data.printTemplates && data.printTemplates.length > 0 && !selectedTemplate) {
        selectTemplateForEdit(data.printTemplates[0]);
      }
    } catch (err) {
      console.error('Failed to load metadata', err);
      showNoticeMsg('تعذر تحميل بيانات المطور من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNoticeMsg = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4500);
  };

  const promptDeveloperConfirm = (title: string, warning: string, action: () => Promise<void>) => {
    setConfirmActionTitle(title);
    setConfirmActionWarning(warning);
    setConfirmAction(() => action);
    setConfirmPassword('');
    setShowConfirmModal(true);
  };

  const handleExecuteConfirmedAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const vRes = await fetch('/api/developer/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: confirmPassword })
      });
      const vData = await vRes.json();
      if (!vData.success) {
        showNoticeMsg('كلمة مرور المطور غير صحيحة!', 'error');
        return;
      }

      setShowConfirmModal(false);
      if (confirmAction) {
        await confirmAction();
        await loadAllMetadata();
        if (onRefreshAllData) onRefreshAllData();
      }
    } catch (err) {
      showNoticeMsg('فشل تنفيذ العملية المؤكدة', 'error');
    }
  };

  // ----------------------------------------------------
  // Entity labels dictionary
  // ----------------------------------------------------
  const ENTITY_LABELS: Record<EntityType, string> = {
    refugee: 'شؤون اللاجئين والمهاجرين',
    seizure: 'محاضر ضبط الجوازات والوثائق',
    passport: 'سجل الجوازات والمتابعة',
    intelligence: 'فرع استخبارات الشرطة',
    passenger: 'حركة المسافرين والمنافذ',
    security_check: 'الفحص الأمني والمطابقة',
    clearance: 'الموافقات وتتبع المدد (SLA)',
    movement_permit: 'تصاريح التنقل والتحرك',
    company: 'الشركات الخاضعة للرقابة',
    correspondence: 'المكاتبات الرسمية والقوالب'
  };

  // ----------------------------------------------------
  // SUBMODULE 1: Field Manager Handlers
  // ----------------------------------------------------
  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    promptDeveloperConfirm(
      editingField ? 'تعديل حقل بالنظام' : 'إضافة حقل جديد للنظام',
      `سيؤثر هذا الحقل على كيان (${ENTITY_LABELS[selectedEntity]}) وسيتم حفظه في استراتيجية EAV.`,
      async () => {
        const payload = {
          ...newFieldData,
          entity_type: selectedEntity,
          officerName: user?.name || 'مهندس المطور'
        };

        if (editingField) {
          await fetch(`/api/field-definitions/${editingField.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          showNoticeMsg('تم تحديث إعدادات الحقل بنجاح');
        } else {
          await fetch('/api/field-definitions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          showNoticeMsg('تمت إضافة الحقل الجديد بنجاح');
        }
        setShowAddFieldModal(false);
        setEditingField(null);
      }
    );
  };

  const handleDeleteField = (field: FieldDefinition) => {
    if (field.is_system) {
      showNoticeMsg('لا يمكن حذف الحقول الأساسية للنظام (is_system=1)', 'warning');
      return;
    }
    promptDeveloperConfirm(
      `حذف/إخفاء الحقل: ${field.label_ar}`,
      'في حال وجود بيانات سابقة، سيتم إخفاء الحقل تلقائياً لمنع فقدان البيانات.',
      async () => {
        await fetch(`/api/field-definitions/${field.id}?user=${encodeURIComponent(user?.name || 'مهندس المطور')}`, {
          method: 'DELETE'
        });
        showNoticeMsg('تمت معالجة الحقل بنجاح');
      }
    );
  };

  const handleToggleFieldVisibility = async (field: FieldDefinition) => {
    const updatedVis = field.is_visible ? 0 : 1;
    await fetch(`/api/field-definitions/${field.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: updatedVis, officerName: user?.name || 'مهندس المطور' })
    });
    showNoticeMsg(updatedVis ? 'تم إظهار الحقل' : 'تم إخفاء الحقل');
    await loadAllMetadata();
  };

  // ----------------------------------------------------
  // SUBMODULE 2: Label Overrides Handlers
  // ----------------------------------------------------
  const handleSaveAllLabels = async () => {
    const editsToSave = Object.entries(pendingLabelEdits).map(([key, newLabel]) => {
      const [entity, fKey] = key.split(':::');
      const originalField = fieldDefinitions.find(f => f.entity_type === entity && f.field_key === fKey);
      return {
        entity_type: entity as EntityType,
        field_key: fKey,
        original_label: originalField?.label_ar || fKey,
        new_label: String(newLabel)
      };
    }).filter(item => String(item.new_label).trim().length > 0);

    if (editsToSave.length === 0) {
      showNoticeMsg('لا توجد تعديلات محفوظة للتسميات', 'warning');
      return;
    }

    promptDeveloperConfirm(
      'تطبيق تعديل التسميات',
      `سيتم تحديث تسميات ${editsToSave.length} حقل فوراً في كافة شاشات المنظومة وتقاريرها.`,
      async () => {
        await fetch('/api/label-overrides/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ overrides: editsToSave, user: user?.name || 'مهندس المطور' })
        });
        setPendingLabelEdits({});
        showNoticeMsg('تم حفظ وتطبيق التسميات الجديدة بنجاح');
      }
    );
  };

  const handleResetLabel = async (overrideId: number) => {
    await fetch(`/api/label-overrides/${overrideId}`, { method: 'DELETE' });
    showNoticeMsg('تمت استعادة التسمية الأصلية');
    await loadAllMetadata();
  };

  // ----------------------------------------------------
  // SUBMODULE 3: List Manager Handlers
  // ----------------------------------------------------
  const handleSaveNewList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListData.list_code || !newListData.list_name_ar) return;
    await fetch('/api/list-definitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newListData)
    });
    setShowAddListModal(false);
    setSelectedListCode(newListData.list_code);
    setNewListData({ list_code: '', list_name_ar: '', description: '' });
    showNoticeMsg('تم إنشاء القائمة الجديدة');
    await loadAllMetadata();
  };

  const handleSaveNewListValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValueData.value_ar) return;
    await fetch('/api/list-values', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        list_code: selectedListCode,
        ...newValueData
      })
    });
    setShowAddValueModal(false);
    setNewValueData({ value_ar: '', value_en: '', code: '' });
    showNoticeMsg('تمت إضافة القيمة إلى القائمة');
    await loadAllMetadata();
  };

  const handleDeleteListValue = async (id: number) => {
    await fetch(`/api/list-values/${id}`, { method: 'DELETE' });
    showNoticeMsg('تم حذف العنصر');
    await loadAllMetadata();
  };

  // ----------------------------------------------------
  // SUBMODULE 4: Auto Field Rules Handlers
  // ----------------------------------------------------
  const handleTestAutoRule = async () => {
    try {
      const res = await fetch('/api/auto-field-rules/test-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: newRuleData.rule_pattern,
          current_counter: newRuleData.current_counter,
          padding: newRuleData.counter_padding,
          user: user?.name || 'الضابط المناوب',
          port: 'الوديعة'
        })
      });
      const data = await res.json();
      setTestResult(data.generated);
    } catch (err) {
      showNoticeMsg('تعذر اختبار النمط', 'error');
    }
  };

  const handleSaveAutoRule = async (e: React.FormEvent) => {
    e.preventDefault();
    promptDeveloperConfirm(
      'حفظ قاعدة الترقيم التلقائي',
      `سيتم تطبيق هذا النمط على حقل (${newRuleData.field_key}) في الكيان (${newRuleData.entity_type}). السجلات السابقة لن تتأثر.`,
      async () => {
        await fetch('/api/auto-field-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRuleData)
        });
        setShowAddRuleModal(false);
        showNoticeMsg('تم حفظ قاعدة الحقل التلقائي');
      }
    );
  };

  // ----------------------------------------------------
  // SUBMODULE 5: Print Template Handlers
  // ----------------------------------------------------
  const selectTemplateForEdit = (tmpl: PrintTemplate) => {
    setSelectedTemplate(tmpl);
    setTemplateHtmlBody(tmpl.body_html);
    const headerSec = tmpl.sections?.find(s => s.section_type === 'header');
    const footerSec = tmpl.sections?.find(s => s.section_type === 'footer');
    setTemplateHeaderHtml(headerSec ? headerSec.content_html : '');
    setTemplateFooterHtml(footerSec ? footerSec.content_html : '');
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    promptDeveloperConfirm(
      `حفظ قالب الطباعة: ${selectedTemplate.template_name_ar}`,
      'سيتم تطبيق التعديلات على كافة عمليات الطباعة والتصدير المرتبطة بهذا القالب.',
      async () => {
        const updatedSections = [...(selectedTemplate.sections || [])];
        // update header
        const hIdx = updatedSections.findIndex(s => s.section_type === 'header');
        if (hIdx >= 0) {
          updatedSections[hIdx].content_html = templateHeaderHtml;
        } else if (templateHeaderHtml.trim()) {
          updatedSections.push({
            id: Date.now(),
            template_id: selectedTemplate.id,
            section_type: 'header',
            content_html: templateHeaderHtml,
            height_mm: 20,
            is_repeating: 1,
            background_color: '#FFFFFF',
            text_color: '#000000'
          });
        }
        // update footer
        const fIdx = updatedSections.findIndex(s => s.section_type === 'footer');
        if (fIdx >= 0) {
          updatedSections[fIdx].content_html = templateFooterHtml;
        } else if (templateFooterHtml.trim()) {
          updatedSections.push({
            id: Date.now() + 1,
            template_id: selectedTemplate.id,
            section_type: 'footer',
            content_html: templateFooterHtml,
            height_mm: 15,
            is_repeating: 1,
            background_color: '#FFFFFF',
            text_color: '#555555'
          });
        }

        await fetch(`/api/print-templates/${selectedTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            body_html: templateHtmlBody,
            sections: updatedSections,
            officerName: user?.name || 'مهندس المطور'
          })
        });
        showNoticeMsg('تم حفظ وتحديث قالب الطباعة بنجاح');
      }
    );
  };

  const handleTestPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>${selectedTemplate?.template_name_ar || 'معاينة الطباعة'}</title>
          <style>
            @page { size: ${selectedTemplate?.page_size === 'Card' ? '85.6mm 54mm' : selectedTemplate?.page_size || 'A4'} ${selectedTemplate?.orientation || 'portrait'}; margin: 10mm; }
            body { margin: 0; font-family: 'Amiri', 'Traditional Arabic', sans-serif; }
          </style>
        </head>
        <body>
          <div>${templateHeaderHtml}</div>
          <div style="margin: 15px 0;">${templateHtmlBody}</div>
          <div>${templateFooterHtml}</div>
          <script>window.onload = function() { window.print(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ----------------------------------------------------
  // SUBMODULE 6: Snapshots Handlers (Undo & Backups)
  // ----------------------------------------------------
  const handleTakeManualSnapshot = async () => {
    const snapName = window.prompt('أدخل اسماً أو وصفاً للنسخة الاحتياطية للهيكل:', `نسخة يدوية - ${new Date().toLocaleDateString('ar-YE')}`);
    if (!snapName) return;

    await fetch('/api/schema-snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot_name: snapName, user: user?.name || 'مهندس المطور' })
    });
    showNoticeMsg('تم حفظ اللقطة بنجاح');
    await loadAllMetadata();
  };

  const handleRestoreSnapshot = (snap: SchemaSnapshot) => {
    promptDeveloperConfirm(
      `استعادة لقطة الهيكل: ${snap.snapshot_name}`,
      `تحذير: سيتم التراجع عن كافة تعديلات الحقول، التسميات، القوائم، وقوالب الطباعة وإعادتها لحالة ${snap.created_at}.`,
      async () => {
        const res = await fetch(`/api/schema-snapshots/${snap.id}/restore`, { method: 'POST' });
        const d = await res.json();
        if (d.success) {
          showNoticeMsg('تمت استعادة حالة الهيكل بنجاح!');
        } else {
          showNoticeMsg(d.error || 'فشلت الاستعادة', 'error');
        }
      }
    );
  };

  // Filtered lists
  const currentEntityFields = fieldDefinitions.filter(f => f.entity_type === selectedEntity);
  const currentEntityRules = autoFieldRules.filter(r => r.entity_type === selectedEntity);
  const currentListValues = listValues.filter(v => v.list_code === selectedListCode);

  return (
    <div className="space-y-6 text-slate-800 font-sans pb-16">
      {/* Developer Master Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-900 text-white rounded-2xl p-6 shadow-xl border border-red-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 bg-red-600/90 text-white text-xs font-black py-1 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-inner">
          <AlertOctagon size={14} className="animate-pulse" />
          تنبيه أمني صارم: أنت في وضع المطور (Metadata-Driven Engine) — كافة التعديلات تنعكس فورياً وتؤثر على بنية المنظومة
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-600/30 border border-red-500/40 rounded-xl text-red-400">
              <Code2 size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">وحدة المطور وتخصيص المنظومة</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white font-mono uppercase">
                  الوحدة 14 — Super Admin
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1">
                تحويل المنظومة لمنصة ديناميكية بالكامل: إدارة الحقول EAV، التسميات، القوائم، الترقيم التلقائي، وقوالب الطباعة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTakeManualSnapshot}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Save size={15} />
              لقطة احتياطية
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <RotateCcw size={15} />
              العودة للتطبيق العادي
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {notice && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${
            notice.type === 'error' ? 'bg-red-950/80 text-red-300 border-red-700' :
            notice.type === 'warning' ? 'bg-amber-950/80 text-amber-300 border-amber-700' :
            'bg-emerald-950/80 text-emerald-300 border-emerald-700'
          }`}>
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white font-mono">✕</button>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 no-print">
        {[
          { id: 'panel', label: 'لوحة التحكم الرئيسية', icon: LayoutTemplate },
          { id: 'fields', label: 'إدارة الحقول (EAV)', icon: Sliders, badge: fieldDefinitions.length },
          { id: 'labels', label: 'تعديل التسميات', icon: Type, badge: labelOverrides.length },
          { id: 'lists', label: 'إدارة القوائم', icon: ListFilter, badge: listDefinitions.length },
          { id: 'auto_fields', label: 'الحقول التلقائية والترقيم', icon: Hash, badge: autoFieldRules.length },
          { id: 'templates', label: 'قوالب الطباعة السيادية', icon: Printer, badge: printTemplates.length },
          { id: 'layouts', label: 'مصمم التخطيط', icon: Layers },
          { id: 'snapshots', label: 'النسخ الاحتياطي (Snapshots)', icon: RotateCcw, badge: schemaSnapshots.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubModule(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
              activeSubModule === tab.id
                ? 'bg-red-800 text-white shadow-md shadow-red-900/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeSubModule === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ==================================================== */}
      {/* VIEW 1: Main Developer Dashboard (DeveloperPanel)   */}
      {/* ==================================================== */}
      {activeSubModule === 'panel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Fields Manager */}
            <div 
              onClick={() => setActiveSubModule('fields')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl group-hover:scale-110 transition">
                  <Sliders size={24} />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {fieldDefinitions.length} حقل
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900">إدارة الحقول (EAV)</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                إضافة حقول جديدة لأي كيان (نص، رقم، تاريخ، قائمة...) دون تعديل الجداول الأساسية وبأمان تام.
              </p>
              <div className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-[-4px] transition">
                <span>فتح محرر الحقول</span>
                <ChevronRight size={15} />
              </div>
            </div>

            {/* Card 2: Label Editor */}
            <div 
              onClick={() => setActiveSubModule('labels')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-purple-50 text-purple-700 rounded-xl group-hover:scale-110 transition">
                  <Type size={24} />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {labelOverrides.length} تعديل نشط
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900">تعديل التسميات</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                تعديل المسميات الظاهرة في الشاشات (مثال: "رقم الجواز" إلى "رقم وثيقة السفر الرسمية") فورياً.
              </p>
              <div className="mt-4 text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-[-4px] transition">
                <span>فتح محرر التسميات</span>
                <ChevronRight size={15} />
              </div>
            </div>

            {/* Card 3: Lists Manager */}
            <div 
              onClick={() => setActiveSubModule('lists')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-110 transition">
                  <ListFilter size={24} />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {listDefinitions.length} قوائم
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900">إدارة القوائم</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                التحكم في قوائم الاختيار (الجنسيات، المهن، المنظمات، أسباب الضبط، الطوائف...) مع دعم الاستيراد.
              </p>
              <div className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-[-4px] transition">
                <span>إدارة القوائم والقيم</span>
                <ChevronRight size={15} />
              </div>
            </div>

            {/* Card 4: Auto Fields */}
            <div 
              onClick={() => setActiveSubModule('auto_fields')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl group-hover:scale-110 transition">
                  <Hash size={24} />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {autoFieldRules.length} قواعد ترقيم
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900">الحقول التلقائية ومولد الأرقام</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                إنشاء أنماط الترقيم المتسلسلة (محضر-{'{YYYY}'}-{'{NNNNN}'}) مع إعادة التصفير السنوي والشهري.
              </p>
              <div className="mt-4 text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-[-4px] transition">
                <span>ضبط قواعد الترقيم</span>
                <ChevronRight size={15} />
              </div>
            </div>

            {/* Card 5: Print Templates */}
            <div 
              onClick={() => setActiveSubModule('templates')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl group-hover:scale-110 transition">
                  <Printer size={24} />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {printTemplates.length} قوالب رسمية
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900">قوالب الطباعة الرسمية</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                محرر HTML متقدم للـ 7 قوالب الجاهزة (محضر ضبط، تصريح لجوء، برقية، بطاقة تصريح، كشف...) مع الرأس والتذييل.
              </p>
              <div className="mt-4 text-xs font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-[-4px] transition">
                <span>فتح مصمم الطباعة</span>
                <ChevronRight size={15} />
              </div>
            </div>

            {/* Card 6: Layout Designer */}
            <div 
              onClick={() => setActiveSubModule('layouts')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-teal-50 text-teal-700 rounded-xl group-hover:scale-110 transition">
                  <Layers size={24} />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {formLayouts.length} تخطيطات
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900">مصمم تخطيط النماذج</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                ترتيب الحقول في التبويبات والمجموعات والصفوف بدون Drag & Drop بنظام الأزرار والأرقام.
              </p>
              <div className="mt-4 text-xs font-bold text-teal-600 flex items-center gap-1 group-hover:translate-x-[-4px] transition">
                <span>تعديل تخطيط النموذج</span>
                <ChevronRight size={15} />
              </div>
            </div>
          </div>

          {/* Quick Snapshot & Audit Trail Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-black text-sm flex items-center gap-2">
                <RotateCcw size={16} className="text-emerald-400" />
                حماية البيانات واللقطات التلقائية (Safety Net)
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                يتم أخذ لقطة تلقائية قبل أي تعديل حساس مع إمكانية التراجع الفوري (Undo) بنقرة زر واحدة.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                {schemaSnapshots.length} لقطة محفوظة
              </span>
              <button
                onClick={() => setActiveSubModule('snapshots')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                استعراض واستعادة اللقطات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 2: Field Manager (FieldManagerActivity)         */}
      {/* ==================================================== */}
      {activeSubModule === 'fields' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-600 shrink-0">اختر الكيان المستهدف:</label>
              <select
                value={selectedEntity}
                onChange={e => setSelectedEntity(e.target.value as EntityType)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs text-slate-800 focus:ring-2 focus:ring-red-600"
              >
                {Object.entries(ENTITY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label} ({k})</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingField(null);
                setNewFieldData({
                  entity_type: selectedEntity,
                  field_key: '',
                  label_ar: '',
                  label_en: '',
                  field_type: 'text',
                  is_required: 0,
                  is_visible: 1,
                  display_order: currentEntityFields.length + 1,
                  group_name: 'بيانات عامة',
                  help_text: '',
                  default_value: '',
                  list_code: ''
                });
                setShowAddFieldModal(true);
              }}
              className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Plus size={16} />
              + إضافة حقل جديد لـ {ENTITY_LABELS[selectedEntity]}
            </button>
          </div>

          {/* Fields List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700">
                حقول كيان ({ENTITY_LABELS[selectedEntity]}): {currentEntityFields.length} حقل
              </span>
              <span className="text-[11px] text-slate-400">
                الحقول المعلمة بـ (أساسي) لا يمكن حذفها لضمان استقرار المنظومة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100/75 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="py-3 px-4 w-12 text-center">الترتيب</th>
                    <th className="py-3 px-4">التسمية العربية</th>
                    <th className="py-3 px-4">المفتاح البرمجي</th>
                    <th className="py-3 px-4">النوع</th>
                    <th className="py-3 px-4">المجموعة</th>
                    <th className="py-3 px-4">الإلزامية</th>
                    <th className="py-3 px-4">التخزين</th>
                    <th className="py-3 px-4 text-center">الحالة</th>
                    <th className="py-3 px-4 text-center">إجراءات المطور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentEntityFields.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        لا توجد حقول مسجلة لهذا الكيان
                      </td>
                    </tr>
                  ) : (
                    currentEntityFields.map(field => (
                      <tr key={field.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">
                          {field.display_order}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {field.label_ar}
                          {field.label_en && (
                            <span className="text-[10px] text-slate-400 block font-normal">{field.label_en}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 bg-slate-50/50">
                          {field.field_key}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                            {field.field_type}
                            {field.list_code && ` (${field.list_code})`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {field.group_name || 'عام'}
                        </td>
                        <td className="py-3 px-4">
                          {field.is_required ? (
                            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">
                              إجباري *
                            </span>
                          ) : (
                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                              اختياري
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            field.storage_strategy === 'column' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-purple-50 text-purple-700'
                          }`}>
                            {field.storage_strategy === 'column' ? 'أساسي (جدول)' : 'ديناميكي (EAV)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleFieldVisibility(field)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                              field.is_visible 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {field.is_visible ? 'ظاهر' : 'مخفي'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingField(field);
                                setNewFieldData(field);
                                setShowAddFieldModal(true);
                              }}
                              title="تعديل خصائص الحقل"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteField(field)}
                              disabled={Boolean(field.is_system)}
                              title={field.is_system ? 'حقل أساسي للنظام لا يمكن حذفه' : 'حذف أو إخفاء الحقل'}
                              className={`p-1.5 rounded-lg transition ${
                                field.is_system 
                                  ? 'text-slate-300 cursor-not-allowed' 
                                  : 'bg-red-50 hover:bg-red-100 text-red-600'
                              }`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 3: Label Editor (LabelEditorActivity)           */}
      {/* ==================================================== */}
      {activeSubModule === 'labels' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-600 shrink-0">الكيان:</label>
              <select
                value={selectedEntity}
                onChange={e => setSelectedEntity(e.target.value as EntityType)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs"
              >
                {Object.entries(ENTITY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث في الحقول..."
                  value={labelSearch}
                  onChange={e => setLabelSearch(e.target.value)}
                  className="pr-8 pl-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
                <Search size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            <button
              onClick={handleSaveAllLabels}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Save size={16} />
              حفظ وتطبيق كل التعديلات فورياً
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-purple-50/60 border-b border-purple-100 flex items-center justify-between text-xs">
              <span className="font-bold text-purple-950">
                تعديل التسميات لـ ({ENTITY_LABELS[selectedEntity]})
              </span>
              <span className="text-purple-700 font-medium">
                التعديلات تنعكس على كافة الشاشات والقوائم وتقارير الطباعة
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {currentEntityFields
                .filter(f => !labelSearch || f.label_ar.includes(labelSearch) || f.field_key.includes(labelSearch))
                .map(field => {
                  const existingOverride = labelOverrides.find(o => o.entity_type === field.entity_type && o.field_key === field.field_key);
                  const editKey = `${field.entity_type}:::${field.field_key}`;
                  const currentVal = pendingLabelEdits[editKey] !== undefined 
                    ? pendingLabelEdits[editKey] 
                    : (existingOverride ? existingOverride.new_label : field.label_ar);

                  return (
                    <div key={field.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                      <div className="w-full md:w-1/3">
                        <span className="font-bold text-sm text-slate-800 block">{field.label_ar}</span>
                        <span className="text-[11px] font-mono text-slate-400">{field.field_key} ({field.group_name})</span>
                      </div>

                      <div className="text-slate-400 font-bold hidden md:block">→</div>

                      <div className="w-full md:w-1/2 flex items-center gap-2">
                        <input
                          type="text"
                          value={currentVal}
                          onChange={e => setPendingLabelEdits({ ...pendingLabelEdits, [editKey]: e.target.value })}
                          className={`w-full px-3.5 py-2 border rounded-xl text-xs font-bold transition ${
                            currentVal !== field.label_ar ? 'border-purple-500 bg-purple-50/30' : 'border-slate-300'
                          }`}
                          placeholder="أدخل التسمية البديلة..."
                        />
                        {existingOverride && (
                          <button
                            onClick={() => handleResetLabel(existingOverride.id)}
                            title="استعادة التسمية الأصلية"
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold border border-rose-200 shrink-0"
                          >
                            استعادة الأصلية
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 4: List Manager (ListManagerActivity)           */}
      {/* ==================================================== */}
      {activeSubModule === 'lists' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lists Catalog Column */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">قوائم الاختيار (Lists)</h3>
                <p className="text-[11px] text-slate-400">القوائم المستخدمة في الـ Dropdowns</p>
              </div>
              <button
                onClick={() => setShowAddListModal(true)}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
              {listDefinitions.map(list => (
                <div
                  key={list.id}
                  onClick={() => setSelectedListCode(list.list_code)}
                  className={`p-3 rounded-xl border text-right transition cursor-pointer flex items-center justify-between ${
                    selectedListCode === list.list_code
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-xs block">{list.list_name_ar}</span>
                    <span className="text-[10px] font-mono text-slate-400">{list.list_code}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200/70 text-slate-700">
                    {list.valuesCount || listValues.filter(v => v.list_code === list.list_code).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* List Values Table Column */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  قيم القائمة: {listDefinitions.find(l => l.list_code === selectedListCode)?.list_name_ar}
                </h3>
                <p className="text-xs text-slate-400 font-mono">الرمز: {selectedListCode}</p>
              </div>

              <button
                onClick={() => setShowAddValueModal(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Plus size={15} />
                + إضافة قيمة جديدة
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3 w-12 text-center">م</th>
                    <th className="py-2.5 px-3">القيمة بالعربية</th>
                    <th className="py-2.5 px-3">القيمة بالإنجليزية</th>
                    <th className="py-2.5 px-3">الرمز المختصر</th>
                    <th className="py-2.5 px-3 text-center">نشط؟</th>
                    <th className="py-2.5 px-3 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentListValues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        لا توجد عناصر مضافة في هذه القائمة بعد
                      </td>
                    </tr>
                  ) : (
                    currentListValues.map((val, idx) => (
                      <tr key={val.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{val.value_ar}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{val.value_en || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-800">{val.code || '—'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            val.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {val.is_active ? 'نشط' : 'معطل'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleDeleteListValue(val.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 5: Auto Field Rules (AutoFieldEditorActivity)   */}
      {/* ==================================================== */}
      {activeSubModule === 'auto_fields' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900">قواعد الترقيم والتسلسل التلقائي</h3>
              <p className="text-xs text-slate-500 mt-0.5">توليد أرقام المحاضر والبرقيات والمعاملات تلقائياً بنمط ذكي ومحدد</p>
            </div>

            <button
              onClick={() => setShowAddRuleModal(true)}
              className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus size={16} />
              + إضافة نمط ترقيم تلقائي جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {autoFieldRules.map(rule => (
              <div key={rule.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="font-black text-sm text-slate-900">{ENTITY_LABELS[rule.entity_type]}</span>
                    <span className="text-[11px] font-mono text-indigo-700 block">حقل: {rule.field_key}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                    تصفير: {rule.reset_period}
                  </span>
                </div>

                <div className="bg-slate-900 text-white p-3.5 rounded-xl font-mono text-sm flex items-center justify-between">
                  <span className="text-emerald-400">{rule.rule_pattern}</span>
                  <span className="text-xs text-slate-400">العداد: {rule.current_counter}</span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                  <span className="font-bold text-emerald-950">المثال الحي للرقم القادم:</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">{rule.preview_example}</span>
                </div>

                <div className="text-[11px] text-slate-500 pt-1">
                  {rule.notes || 'توليد تلقائي متسلسل مع حشو الأصفار'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 6: Print Template Editor (PrintTemplateEditor)  */}
      {/* ==================================================== */}
      {activeSubModule === 'templates' && (
        <div className="space-y-6">
          {/* Templates Selector Carousel / Grid */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-black text-sm text-slate-900">قوالب الطباعة السيادية الجاهزة (7 قوالب معتمدة):</h3>
            <div className="flex flex-wrap gap-2.5">
              {printTemplates.map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => selectTemplateForEdit(tmpl)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                    selectedTemplate?.id === tmpl.id
                      ? 'bg-rose-700 text-white border-rose-800 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Printer size={15} />
                  <span>{tmpl.template_name_ar}</span>
                  <span className="text-[10px] font-mono opacity-80 font-normal">({tmpl.page_size})</span>
                </button>
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Action Toolbar */}
              <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm">{selectedTemplate.template_name_ar}</span>
                  <span className="text-[11px] font-mono text-slate-400">كود: {selectedTemplate.template_code}</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                    مقاس: {selectedTemplate.page_size} | {selectedTemplate.orientation}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestPrint}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer size={14} />
                    اختبار طباعة
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Save size={14} />
                    حفظ القالب
                  </button>
                </div>
              </div>

              {/* Template Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-4">
                {[
                  { id: 'editor', label: 'محرر جسم القالب (HTML Body)' },
                  { id: 'header_footer', label: 'الرأس والتذييل (Header & Footer)' },
                  { id: 'preview', label: 'معاينة حية' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTemplateSubTab(t.id as any)}
                    className={`py-3 px-4 font-bold text-xs border-b-2 transition ${
                      templateSubTab === t.id
                        ? 'border-rose-600 text-rose-700 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: HTML Body Editor */}
              {templateSubTab === 'editor' && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700">المتغيرات المتاحة للإدراج بالقالب:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['{{fullName}}', '{{passportNumber}}', '{{recordNumber}}', '{{portName}}', '{{officerName}}', '{{seizureDate}}', '{{refugeeFileNumber}}', '{{subject}}', '{TODAY}', '{PAGE}', '{PAGES}', '{USER}'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setTemplateHtmlBody(prev => prev + ' ' + tag)}
                          className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] text-rose-700 hover:bg-rose-50 transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={18}
                    value={templateHtmlBody}
                    onChange={e => setTemplateHtmlBody(e.target.value)}
                    className="w-full p-4 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 bg-slate-950 text-emerald-400 leading-relaxed focus:ring-2 focus:ring-rose-500"
                    placeholder="أدخل كود HTML الخاص بجسم القالب..."
                  />
                </div>
              )}

              {/* Tab 2: Header & Footer */}
              {templateSubTab === 'header_footer' && (
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="font-bold text-xs text-slate-700 block">قسم الرأس (Header HTML):</label>
                    <textarea
                      rows={12}
                      value={templateHeaderHtml}
                      onChange={e => setTemplateHeaderHtml(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs bg-slate-950 text-cyan-300"
                      placeholder="كود HTML لرأس الصفحة..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-xs text-slate-700 block">قسم التذييل (Footer HTML):</label>
                    <textarea
                      rows={12}
                      value={templateFooterHtml}
                      onChange={e => setTemplateFooterHtml(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs bg-slate-950 text-cyan-300"
                      placeholder="كود HTML لتذييل الصفحة..."
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Live Preview */}
              {templateSubTab === 'preview' && (
                <div className="p-6 bg-slate-100 flex justify-center">
                  <div className="bg-white shadow-2xl p-8 rounded border border-slate-200 w-full max-w-3xl min-h-[500px]">
                    <div dangerouslySetInnerHTML={{ __html: templateHeaderHtml }} />
                    <div dangerouslySetInnerHTML={{ __html: templateHtmlBody }} className="my-6" />
                    <div dangerouslySetInnerHTML={{ __html: templateFooterHtml }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 7: Layout Designer (LayoutDesignerActivity)     */}
      {/* ==================================================== */}
      {activeSubModule === 'layouts' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900">مصمم تخطيط النماذج (بدون Drag & Drop)</h3>
              <p className="text-xs text-slate-500 mt-0.5">ترتيب وتوزيع الحقول داخل التبويبات والمجموعات والصفوف بنظام الأزرار المرقمة</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-600">اختر الكيان:</label>
              <select
                value={layoutEntity}
                onChange={e => setLayoutEntity(e.target.value as EntityType)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs"
              >
                {Object.entries(ENTITY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-950 text-xs">
              <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5">
                <Layers size={16} />
                تخطيط نموذج: {ENTITY_LABELS[layoutEntity]}
              </h4>
              <p>
                يمكنك تنظيم الحقول في تبويبات رئيسية، مجموعات فرعية، وتقسيم كل صف إلى (1 أو 2 أو 3 حقول متجاورة) لتسهيل الإدخال السريع.
              </p>
            </div>

            {/* Layout Schema Representation */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-4 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-black text-xs text-slate-700">تبويب: البيانات الشخصية والأساسية</span>
                <span className="text-[10px] font-mono text-slate-400">Tab 1 of 2</span>
              </div>

              {/* Group 1 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-xs text-slate-900 block border-b border-slate-100 pb-1.5">
                  مجموعة: الهوية الأساسية
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>1. الاسم الكامل</span>
                    <span className="text-[10px] font-mono text-slate-400">عرض 50%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>2. رقم الوثيقة / الجواز</span>
                    <span className="text-[10px] font-mono text-slate-400">عرض 50%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>3. الجنسية</span>
                    <span className="text-[10px] font-mono text-slate-400">33%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>4. النوع</span>
                    <span className="text-[10px] font-mono text-slate-400">33%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>5. تاريخ الميلاد</span>
                    <span className="text-[10px] font-mono text-slate-400">33%</span>
                  </div>
                </div>
              </div>

              {/* Group 2 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-xs text-slate-900 block border-b border-slate-100 pb-1.5">
                  مجموعة: الحقول المخصصة والديناميكية (EAV)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-xs font-bold text-purple-900 flex items-center justify-between">
                    <span>6. الطائفة / المذهب</span>
                    <span className="text-[10px] font-mono text-purple-600">dropdown</span>
                  </div>
                  <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-xs font-bold text-purple-900 flex items-center justify-between">
                    <span>7. القبيلة / العشيرة</span>
                    <span className="text-[10px] font-mono text-purple-600">text</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 8: Snapshots & Backup (Undo Engine)            */}
      {/* ==================================================== */}
      {activeSubModule === 'snapshots' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900">سجل اللقطات والنسخ الاحتياطي (Schema Snapshots)</h3>
              <p className="text-xs text-slate-500 mt-0.5">الاحتفاظ بآخر 30 لقطة لهيكل وبيانات المطور مع إمكانية الاستعادة الفورية</p>
            </div>

            <button
              onClick={handleTakeManualSnapshot}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus size={16} />
              + أخذ لقطة كاملة يدوياً الآن
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="py-3 px-4 w-12 text-center">م</th>
                    <th className="py-3 px-4">اسم اللقطة والوصف</th>
                    <th className="py-3 px-4">نوع العملية</th>
                    <th className="py-3 px-4">أنشئت بواسطة</th>
                    <th className="py-3 px-4">التاريخ والوقت</th>
                    <th className="py-3 px-4 text-center">حالة الاستعادة</th>
                    <th className="py-3 px-4 text-center">إجراء (Undo)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schemaSnapshots.map((snap, idx) => (
                    <tr key={snap.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{snap.snapshot_name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                          {snap.snapshot_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{snap.created_by}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{new Date(snap.created_at).toLocaleString('ar-YE')}</td>
                      <td className="py-3 px-4 text-center">
                        {snap.restored_at ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            تمت استعادتها سابقاً
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            جاهزة للاستعادة
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleRestoreSnapshot(snap)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto"
                        >
                          <RotateCcw size={13} />
                          استعادة هذه النسخة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: Add/Edit Field Modal                       */}
      {/* ==================================================== */}
      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {editingField ? 'تعديل خصائص الحقل' : `إضافة حقل جديد لـ (${ENTITY_LABELS[selectedEntity]})`}
                </h3>
                <p className="text-slate-400 mt-0.5">سيتم تخزين الحقل في custom_field_values (EAV) وسينعكس في الواجهات فوراً</p>
              </div>
              <button onClick={() => setShowAddFieldModal(false)} className="text-slate-400 hover:text-slate-600 font-mono text-base">✕</button>
            </div>

            <form onSubmit={handleSaveField} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التسمية العربية للحقل *</label>
                  <input
                    type="text"
                    required
                    value={newFieldData.label_ar || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setNewFieldData({
                        ...newFieldData,
                        label_ar: val,
                        // auto generate field_key if not editing
                        field_key: editingField ? newFieldData.field_key : (newFieldData.field_key || val.trim().replace(/\s+/g, '_').toLowerCase())
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                    placeholder="مثال: الطائفة / المذهب"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">المفتاح البرمجي (Field Key) *</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingField)}
                    value={newFieldData.field_key || ''}
                    onChange={e => setNewFieldData({ ...newFieldData, field_key: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-800 disabled:bg-slate-100"
                    placeholder="sect"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع الحقل (Field Type) *</label>
                  <select
                    value={newFieldData.field_type || 'text'}
                    onChange={e => setNewFieldData({ ...newFieldData, field_type: e.target.value as CustomFieldType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="text">نص عادي (Text)</option>
                    <option value="number">رقمي (Number)</option>
                    <option value="date">تاريخ (Date)</option>
                    <option value="dropdown">قائمة اختيار (Dropdown)</option>
                    <option value="checkbox">خانة اختيار نعم/لا (Checkbox)</option>
                    <option value="textarea">نص متعدد الأسطر (Textarea)</option>
                    <option value="phone">رقم هاتف (Phone)</option>
                    <option value="email">بريد إلكتروني (Email)</option>
                    <option value="file">مرفق ملف / وثيقة (File)</option>
                  </select>
                </div>

                {newFieldData.field_type === 'dropdown' ? (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">قائمة الاختيار المربوطة *</label>
                    <select
                      value={newFieldData.list_code || ''}
                      onChange={e => setNewFieldData({ ...newFieldData, list_code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-800"
                    >
                      <option value="">-- اختر قائمة --</option>
                      {listDefinitions.map(l => (
                        <option key={l.id} value={l.list_code}>{l.list_name_ar} ({l.list_code})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">المجموعة / التبويب</label>
                    <input
                      type="text"
                      value={newFieldData.group_name || ''}
                      onChange={e => setNewFieldData({ ...newFieldData, group_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      placeholder="مثال: بيانات شخصية"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الترتيب الرقمي (Sort Order)</label>
                  <input
                    type="number"
                    value={newFieldData.display_order || 10}
                    onChange={e => setNewFieldData({ ...newFieldData, display_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">هل الحقل إجباري؟</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="isRequired"
                        checked={Boolean(newFieldData.is_required)}
                        onChange={() => setNewFieldData({ ...newFieldData, is_required: 1 })}
                      />
                      <span>نعم (إجباري *)</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-500">
                      <input
                        type="radio"
                        name="isRequired"
                        checked={!newFieldData.is_required}
                        onChange={() => setNewFieldData({ ...newFieldData, is_required: 0 })}
                      />
                      <span>اختياري</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">نص المساعدة والإرشاد (Help Text)</label>
                <input
                  type="text"
                  value={newFieldData.help_text || ''}
                  onChange={e => setNewFieldData({ ...newFieldData, help_text: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  placeholder="شرح يظهر للمستخدم أسفل الحقل لتوجيهه"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">معاينة حية لشكل الحقل في واجهة المستخدم:</span>
                <label className="font-bold text-slate-800 block text-xs">
                  {newFieldData.label_ar || 'اسم الحقل'}
                  {newFieldData.is_required ? <span className="text-red-600"> *</span> : null}
                </label>
                <input
                  type={newFieldData.field_type === 'number' ? 'number' : newFieldData.field_type === 'date' ? 'date' : 'text'}
                  disabled
                  placeholder={newFieldData.default_value || 'إدخال القيمة هنا...'}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-400"
                />
                {newFieldData.help_text && (
                  <span className="text-[10px] text-slate-400 block">{newFieldData.help_text}</span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFieldModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold shadow-md transition"
                >
                  {editingField ? 'تطبيق وحفظ التعديل' : 'إضافة الحقل فوراً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: Double Confirmation Dialog (Security)       */}
      {/* ==================================================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-red-600 text-xs text-slate-800">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <ShieldAlert size={28} />
              <div>
                <h3 className="font-black text-base text-slate-900">{confirmActionTitle}</h3>
                <span className="text-[10px] font-bold text-red-600">تأكيد المطور المزدوج (Double Confirmation)</span>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 text-red-950 p-3 rounded-xl mb-4 leading-relaxed font-medium">
              {confirmActionWarning}
              <div className="mt-2 text-[11px] text-red-800 font-bold">
                ✓ سيتم أخذ نسخة لقطة (Snapshot) تلقائياً قبل التنفيذ لتمكين التراجع إذا لزم.
              </div>
            </div>

            <form onSubmit={handleExecuteConfirmedAction} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    أدخل كلمة مرور المطور لتأكيد الصلاحية:
                  </label>
                  <button
                    type="button"
                    onClick={() => setConfirmPassword('dev')}
                    className="text-[10px] text-red-600 hover:text-red-800 font-bold bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded border border-red-200 cursor-pointer"
                  >
                    تعبئة تلقائية (dev)
                  </button>
                </div>
                <input
                  type="password"
                  required
                  autoFocus
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="كلمة مرور المطور (dev أو 123)"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold shadow-md transition"
                >
                  تأكيد وتطبيق الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: Add New List Definition Modal               */}
      {/* ==================================================== */}
      {showAddListModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-slate-900 text-base mb-1">إنشاء قائمة اختيار جديدة</h3>
            <p className="text-slate-400 mb-4">تتيح إضافة قوائم مخصصة لربطها بالحقول المنسدلة</p>

            <form onSubmit={handleSaveNewList} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">رمز القائمة بالإنجليزية (List Code) *</label>
                <input
                  type="text"
                  required
                  value={newListData.list_code}
                  onChange={e => setNewListData({ ...newListData, list_code: e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  placeholder="provinces_yemen"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم القائمة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newListData.list_name_ar}
                  onChange={e => setNewListData({ ...newListData, list_name_ar: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  placeholder="المحافظات والمدن اليمنية"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">وصف القائمة</label>
                <input
                  type="text"
                  value={newListData.description}
                  onChange={e => setNewListData({ ...newListData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  placeholder="وصف مختصر للغرض من القائمة"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddListModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md"
                >
                  إنشاء القائمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: Add New List Value Modal                    */}
      {/* ==================================================== */}
      {showAddValueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-slate-900 text-base mb-1">إضافة قيمة جديدة للقائمة</h3>
            <p className="text-slate-400 mb-4 font-mono">القائمة: {selectedListCode}</p>

            <form onSubmit={handleSaveNewListValue} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">القيمة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newValueData.value_ar}
                  onChange={e => setNewValueData({ ...newValueData, value_ar: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  placeholder="مثال: ياباني"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">القيمة بالإنجليزية</label>
                <input
                  type="text"
                  value={newValueData.value_en}
                  onChange={e => setNewValueData({ ...newValueData, value_en: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  placeholder="Japanese"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الرمز المختصر (Code)</label>
                <input
                  type="text"
                  value={newValueData.code}
                  onChange={e => setNewValueData({ ...newValueData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  placeholder="JPN"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddValueModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md"
                >
                  إضافة للقائمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: Add/Edit Auto Field Rule Modal             */}
      {/* ==================================================== */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-slate-900 text-base mb-1">إضافة / تعديل نمط ترقيم تلقائي</h3>
            <p className="text-slate-400 mb-4">إنشاء أنماط السلاسل الرقمية والأكواد التلقائية</p>

            <form onSubmit={handleSaveAutoRule} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الكيان المستهدف</label>
                  <select
                    value={newRuleData.entity_type}
                    onChange={e => setNewRuleData({ ...newRuleData, entity_type: e.target.value as EntityType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    {Object.entries(ENTITY_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">المفتاح البرمجي للحقل *</label>
                  <input
                    type="text"
                    required
                    value={newRuleData.field_key || ''}
                    onChange={e => setNewRuleData({ ...newRuleData, field_key: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                    placeholder="recordNumber"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">النمط التلقائي (Pattern) *</label>
                <input
                  type="text"
                  required
                  value={newRuleData.rule_pattern || ''}
                  onChange={e => setNewRuleData({ ...newRuleData, rule_pattern: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-emerald-800 font-bold"
                  placeholder="محضر-{YYYY}-{NNNNN}"
                />
                <div className="mt-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg leading-relaxed">
                  الرموز المتاحة: <code className="text-indigo-600 font-bold">{'{YYYY}'}</code> (السنة)، <code className="text-indigo-600 font-bold">{'{MM}'}</code> (الشهر)، <code className="text-indigo-600 font-bold">{'{DD}'}</code> (اليوم)، <code className="text-indigo-600 font-bold">{'{NNNNN}'}</code> (رقم متسلسل)، <code className="text-indigo-600 font-bold">{'{USER}'}</code> (المستخدم)، <code className="text-indigo-600 font-bold">{'{PORT}'}</code> (المنفذ).
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">دورة إعادة التصفير</label>
                  <select
                    value={newRuleData.reset_period}
                    onChange={e => setNewRuleData({ ...newRuleData, reset_period: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="yearly">سنوياً (مع بداية كل سنة ميلادية)</option>
                    <option value="monthly">شهرياً (مع بداية كل شهر)</option>
                    <option value="daily">يومياً</option>
                    <option value="never">أبداً (تسلسلي دائم)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">طول حشو الأصفار (Padding)</label>
                  <input
                    type="number"
                    value={newRuleData.counter_padding || 5}
                    onChange={e => setNewRuleData({ ...newRuleData, counter_padding: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">اختبار ومحاكاة النمط:</span>
                  <span className="font-mono text-sm text-emerald-400">{testResult || 'اضغط زر الاختبار للتجربة'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleTestAutoRule}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  اختبار الرقم القادم
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold shadow-md"
                >
                  حفظ النمط التلقائي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
