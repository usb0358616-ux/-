import type { Express, Request, Response } from 'express';
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
  EntityType
} from './src/types';

export function registerDeveloperRoutes(
  app: Express, 
  recordAuditLog: (actionType: string, module: string, recordIdentifier: string, details: string, officerName?: string, officerRole?: string, terminalIp?: string) => any
) {

  // ==========================================
  // 1. جدول تعريف الحقول field_definitions
  // ==========================================
  let fieldDefinitions: FieldDefinition[] = [
    // اللاجئون (refugee)
    { id: 1, entity_type: 'refugee', field_key: 'fullName', label_ar: 'الاسم الكامل للّاجئ', label_en: 'Full Name', field_type: 'text', is_required: 1, is_system: 1, is_visible: 1, display_order: 1, group_name: 'بيانات شخصية', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 2, entity_type: 'refugee', field_key: 'refugeeFileNumber', label_ar: 'رقم ملف اللجوء', label_en: 'File Number', field_type: 'text', is_required: 1, is_system: 1, is_visible: 1, display_order: 2, group_name: 'بيانات الهوية', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 3, entity_type: 'refugee', field_key: 'unhcrCardNumber', label_ar: 'رقم بطاقة المفوضية (UNHCR)', label_en: 'UNHCR Card Number', field_type: 'text', is_required: 0, is_system: 1, is_visible: 1, display_order: 3, group_name: 'بيانات الهوية', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 4, entity_type: 'refugee', field_key: 'nationality', label_ar: 'الجنسية', label_en: 'Nationality', field_type: 'dropdown', list_code: 'nationalities', is_required: 1, is_system: 1, is_visible: 1, display_order: 4, group_name: 'بيانات شخصية', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 5, entity_type: 'refugee', field_key: 'currentResidence', label_ar: 'مقر الإقامة الحالي / المخيم', label_en: 'Residence', field_type: 'text', is_required: 1, is_system: 1, is_visible: 1, display_order: 5, group_name: 'بيانات السكن', storage_strategy: 'column', created_at: '2026-01-01' },
    // حقول ديناميكية مضافة للاجئ (EAV) - مثل المثال 1 في كراسة المطور: "الطائفة للاجئ"
    { id: 6, entity_type: 'refugee', field_key: 'sect', label_ar: 'الطائفة / المذهب', label_en: 'Sect / Denomination', field_type: 'dropdown', list_code: 'sects_religions', is_required: 0, is_system: 0, is_visible: 1, display_order: 6, group_name: 'بيانات شخصية', help_text: 'تحديد المذهب أو الطائفة لتسهيل تصنيف الرعاية الاجتماعية', storage_strategy: 'eav', created_at: '2026-08-10' },
    { id: 7, entity_type: 'refugee', field_key: 'tribe', label_ar: 'القبيلة / العشيرة', label_en: 'Tribe', field_type: 'text', is_required: 0, is_system: 0, is_visible: 1, display_order: 7, group_name: 'بيانات شخصية', help_text: 'اسم القبيلة أو العشيرة في بلد المنشأ', storage_strategy: 'eav', created_at: '2026-08-10' },
    { id: 8, entity_type: 'refugee', field_key: 'emergency_phone', label_ar: 'هاتف طوارئ للأقارب', label_en: 'Emergency Contact', field_type: 'phone', is_required: 0, is_system: 0, is_visible: 1, display_order: 8, group_name: 'معلومات الاتصال', storage_strategy: 'eav', created_at: '2026-08-10' },

    // محاضر الضبط (seizure)
    { id: 10, entity_type: 'seizure', field_key: 'recordNumber', label_ar: 'رقم محضر الضبط', label_en: 'Record Number', field_type: 'text', is_required: 1, is_system: 1, is_visible: 1, display_order: 1, group_name: 'بيانات المحضر', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 11, entity_type: 'seizure', field_key: 'portName', label_ar: 'اسم المنفذ السيادي', label_en: 'Port Name', field_type: 'dropdown', list_code: 'ports_list', is_required: 1, is_system: 1, is_visible: 1, display_order: 2, group_name: 'بيانات المحضر', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 12, entity_type: 'seizure', field_key: 'seizureDate', label_ar: 'تاريخ الضبط', label_en: 'Seizure Date', field_type: 'date', is_required: 1, is_system: 1, is_visible: 1, display_order: 3, group_name: 'بيانات المحضر', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 13, entity_type: 'seizure', field_key: 'violationType', label_ar: 'نوع المخالفة الأمنية', label_en: 'Violation Type', field_type: 'dropdown', list_code: 'seizure_reasons', is_required: 1, is_system: 1, is_visible: 1, display_order: 4, group_name: 'الأسباب الأمنية', storage_strategy: 'column', created_at: '2026-01-01' },
    // حقل ديناميكي لمحاضر الضبط EAV
    { id: 14, entity_type: 'seizure', field_key: 'confiscated_items', label_ar: 'مضبوطات ومحروزات أخرى', label_en: 'Confiscated Items', field_type: 'textarea', is_required: 0, is_system: 0, is_visible: 1, display_order: 5, group_name: 'المحروزات', help_text: 'أجهزة هاتف أو وثائق مزورة أو أختام تم ضبطها مع الجوازات', storage_strategy: 'eav', created_at: '2026-08-11' },

    // الجوازات (passport)
    { id: 20, entity_type: 'passport', field_key: 'passportNumber', label_ar: 'رقم الجواز', label_en: 'Passport Number', field_type: 'text', is_required: 1, is_system: 1, is_visible: 1, display_order: 1, group_name: 'بيانات الجواز', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 21, entity_type: 'passport', field_key: 'fullName', label_ar: 'الاسم الكامل لحامل الجواز', label_en: 'Holder Name', field_type: 'text', is_required: 1, is_system: 1, is_visible: 1, display_order: 2, group_name: 'البيانات الشخصية', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 22, entity_type: 'passport', field_key: 'nationality', label_ar: 'الجنسية', label_en: 'Nationality', field_type: 'dropdown', list_code: 'nationalities', is_required: 1, is_system: 1, is_visible: 1, display_order: 3, group_name: 'البيانات الشخصية', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 23, entity_type: 'passport', field_key: 'status', label_ar: 'حالة الجواز بالمنظومة', label_en: 'Status', field_type: 'dropdown', list_code: 'passport_statuses', is_required: 1, is_system: 1, is_visible: 1, display_order: 4, group_name: 'الحالة الإجرائية', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 24, entity_type: 'passport', field_key: 'rfid_chip_code', label_ar: 'رمز الشريحة الإلكترونية RFID', label_en: 'RFID Chip Code', field_type: 'text', is_required: 0, is_system: 0, is_visible: 1, display_order: 5, group_name: 'الخصائص البايومترية', storage_strategy: 'eav', created_at: '2026-08-12' },

    // استخبارات الشرطة (intelligence)
    { id: 30, entity_type: 'intelligence', field_key: 'entryNumber', label_ar: 'رقم القيد الرسمي', label_en: 'Entry Number', field_type: 'text', is_required: 1, is_system: 1, is_visible: 1, display_order: 1, group_name: 'الأرقام المرجعية', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 31, entity_type: 'intelligence', field_key: 'investigationNumber', label_ar: 'رقم التحقيق الوزاري', label_en: 'Investigation Number', field_type: 'text', is_required: 1, is_system: 1, is_visible: 1, display_order: 2, group_name: 'الأرقام المرجعية', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 32, entity_type: 'intelligence', field_key: 'requestType', label_ar: 'نوع الطلب الأمني', label_en: 'Request Type', field_type: 'dropdown', list_code: 'intel_request_types', is_required: 1, is_system: 1, is_visible: 1, display_order: 3, group_name: 'تفاصيل الطلب', storage_strategy: 'column', created_at: '2026-01-01' },
    { id: 33, entity_type: 'intelligence', field_key: 'threat_level', label_ar: 'مستوى الخطورة والمتابعة', label_en: 'Threat Level', field_type: 'dropdown', list_code: 'security_levels', is_required: 0, is_system: 0, is_visible: 1, display_order: 4, group_name: 'التقييم الأمني', storage_strategy: 'eav', created_at: '2026-08-15' }
  ];

  // ==========================================
  // 2. جدول قيم الحقول المخصصة EAV (custom_field_values)
  // ==========================================
  let customFieldValues: CustomFieldValue[] = [
    { id: 1, entity_type: 'refugee', entity_id: 'ref-1', field_key: 'sect', value_text: 'مسلم - سني شافعي', updated_at: '2026-08-12T10:00:00Z' },
    { id: 2, entity_type: 'refugee', entity_id: 'ref-1', field_key: 'tribe', value_text: 'فارح - عشيرة هبر جيعلو', updated_at: '2026-08-12T10:00:00Z' },
    { id: 3, entity_type: 'refugee', entity_id: 'ref-2', field_key: 'sect', value_text: 'مسيحي أرثوذكسي', updated_at: '2026-08-12T11:00:00Z' },
    { id: 4, entity_type: 'seizure', entity_id: 'sez-1', field_key: 'confiscated_items', value_text: '3 شرائح اتصال دولية + كرت ذاكرة تالف', updated_at: '2026-08-14T08:00:00Z' }
  ];

  // ==========================================
  // 3. جدول تعديل التسميات label_overrides
  // ==========================================
  let labelOverrides: LabelOverride[] = [
    { id: 1, entity_type: 'passport', field_key: 'passportNumber', original_label: 'رقم الجواز', new_label: 'رقم وثيقة السفر الرسمية', language: 'ar', created_at: '2026-08-10' },
    { id: 2, entity_type: 'refugee', field_key: 'refugeeFileNumber', original_label: 'رقم ملف اللجوء', new_label: 'رقم قيد الحماية المؤقتة', language: 'ar', created_at: '2026-08-10' }
  ];

  // ==========================================
  // 4. جدول قوائم الاختيار list_definitions & list_values
  // ==========================================
  let listDefinitions: ListDefinition[] = [
    { id: 1, list_code: 'nationalities', list_name_ar: 'قائمة الجنسيات المعتمدة', description: 'كافة الجنسيات المعترف بها بالدخول والمنافذ', is_system: 1, created_at: '2026-01-01' },
    { id: 2, list_code: 'professions', list_name_ar: 'قائمة المهن والوظائف', description: 'تصنيف المهن في التأشيرات والإقامات', is_system: 1, created_at: '2026-01-01' },
    { id: 3, list_code: 'organizations', list_name_ar: 'المنظمات والبعثات الدولية', description: 'منظمات الأمم المتحدة والمنظمات الدولية العاملة باليمن', is_system: 1, created_at: '2026-01-01' },
    { id: 4, list_code: 'seizure_reasons', list_name_ar: 'أسباب ومخالفات الضبط', description: 'أسباب حجز الجوازات والوثائق في المنافذ', is_system: 1, created_at: '2026-01-01' },
    { id: 5, list_code: 'sects_religions', list_name_ar: 'الطوائف والمذاهب', description: 'تصنيفات إحصائية خاصة بشؤون اللجوء والمهاجرين', is_system: 0, created_at: '2026-08-10' },
    { id: 6, list_code: 'security_levels', list_name_ar: 'درجات الخطورة الأمنية', description: 'مستويات تصنيف الفحص والتحري الاستخباراتي', is_system: 0, created_at: '2026-08-10' },
    { id: 7, list_code: 'ports_list', list_name_ar: 'المنافذ السيادية الـ 13', description: 'منافذ الجمهورية اليمنية الجوية والبحرية والبرية', is_system: 1, created_at: '2026-01-01' },
    { id: 8, list_code: 'passport_statuses', list_name_ar: 'حالات الجواز الإجرائية', description: 'حالات دورة حياة الجواز المحال والمضبوط', is_system: 1, created_at: '2026-01-01' },
    { id: 9, list_code: 'intel_request_types', list_name_ar: 'أنواع طلبات الاستخبارات', description: 'تصنيف طلبات التحري والفحص الأمني', is_system: 1, created_at: '2026-01-01' }
  ];

  let listValues: ListValue[] = [
    // nationalities (28+ دولة)
    { id: 1, list_code: 'nationalities', value_ar: 'يمني', value_en: 'Yemeni', code: 'YEM', sort_order: 1, is_active: 1, is_default: 1, created_at: '2026-01-01' },
    { id: 2, list_code: 'nationalities', value_ar: 'سعودي', value_en: 'Saudi', code: 'SAU', sort_order: 2, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 3, list_code: 'nationalities', value_ar: 'عماني', value_en: 'Omani', code: 'OMN', sort_order: 3, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 4, list_code: 'nationalities', value_ar: 'إماراتي', value_en: 'Emirati', code: 'ARE', sort_order: 4, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 5, list_code: 'nationalities', value_ar: 'مصري', value_en: 'Egyptian', code: 'EGY', sort_order: 5, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 6, list_code: 'nationalities', value_ar: 'سوري', value_en: 'Syrian', code: 'SYR', sort_order: 6, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 7, list_code: 'nationalities', value_ar: 'سوداني', value_en: 'Sudanese', code: 'SDN', sort_order: 7, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 8, list_code: 'nationalities', value_ar: 'أردني', value_en: 'Jordanian', code: 'JOR', sort_order: 8, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 9, list_code: 'nationalities', value_ar: 'صومالي', value_en: 'Somali', code: 'SOM', sort_order: 9, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 10, list_code: 'nationalities', value_ar: 'إثيوبي', value_en: 'Ethiopian', code: 'ETH', sort_order: 10, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 11, list_code: 'nationalities', value_ar: 'إريتري', value_en: 'Eritrean', code: 'ERI', sort_order: 11, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 12, list_code: 'nationalities', value_ar: 'جيبوتي', value_en: 'Djiboutian', code: 'DJI', sort_order: 12, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 13, list_code: 'nationalities', value_ar: 'فلسطيني', value_en: 'Palestinian', code: 'PSE', sort_order: 13, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 14, list_code: 'nationalities', value_ar: 'عراقي', value_en: 'Iraqi', code: 'IRQ', sort_order: 14, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 15, list_code: 'nationalities', value_ar: 'لبناني', value_en: 'Lebanese', code: 'LBN', sort_order: 15, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 16, list_code: 'nationalities', value_ar: 'تركي', value_en: 'Turkish', code: 'TUR', sort_order: 16, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 17, list_code: 'nationalities', value_ar: 'هندي', value_en: 'Indian', code: 'IND', sort_order: 17, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 18, list_code: 'nationalities', value_ar: 'باكستاني', value_en: 'Pakistani', code: 'PAK', sort_order: 18, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 19, list_code: 'nationalities', value_ar: 'بنغلاديشي', value_en: 'Bangladeshi', code: 'BGD', sort_order: 19, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 20, list_code: 'nationalities', value_ar: 'صيني', value_en: 'Chinese', code: 'CHN', sort_order: 20, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 21, list_code: 'nationalities', value_ar: 'أمريكي', value_en: 'American', code: 'USA', sort_order: 21, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 22, list_code: 'nationalities', value_ar: 'بريطاني', value_en: 'British', code: 'GBR', sort_order: 22, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 23, list_code: 'nationalities', value_ar: 'ألماني', value_en: 'German', code: 'DEU', sort_order: 23, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 24, list_code: 'nationalities', value_ar: 'فرنسي', value_en: 'French', code: 'FRA', sort_order: 24, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 25, list_code: 'nationalities', value_ar: 'روسي', value_en: 'Russian', code: 'RUS', sort_order: 25, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 26, list_code: 'nationalities', value_ar: 'إيطالي', value_en: 'Italian', code: 'ITA', sort_order: 26, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 27, list_code: 'nationalities', value_ar: 'كندي', value_en: 'Canadian', code: 'CAN', sort_order: 27, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 28, list_code: 'nationalities', value_ar: 'أسترالي', value_en: 'Australian', code: 'AUS', sort_order: 28, is_active: 1, is_default: 0, created_at: '2026-01-01' },

    // professions (المهن)
    { id: 40, list_code: 'professions', value_ar: 'موظف أممي / إغاثي', value_en: 'UN / Humanitarian Worker', code: 'UN_STAFF', sort_order: 1, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 41, list_code: 'professions', value_ar: 'دبلوماسي / قنصلي', value_en: 'Diplomat', code: 'DIP', sort_order: 2, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 42, list_code: 'professions', value_ar: 'طبيب / اختصاصي صحي', value_en: 'Doctor / Medical Specialist', code: 'MED', sort_order: 3, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 43, list_code: 'professions', value_ar: 'مهندس / فني تقني', value_en: 'Engineer / Technician', code: 'ENG', sort_order: 4, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 44, list_code: 'professions', value_ar: 'تاجر / رجل أعمال', value_en: 'Businessman / Merchant', code: 'BIZ', sort_order: 5, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 45, list_code: 'professions', value_ar: 'بحار / طاقم سفينة', value_en: 'Sailor / Crew Member', code: 'CREW', sort_order: 6, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 46, list_code: 'professions', value_ar: 'سائق شاحنة نقل دولي', value_en: 'International Truck Driver', code: 'DRV', sort_order: 7, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 47, list_code: 'professions', value_ar: 'صحفي / مراسل إعلامي', value_en: 'Journalist', code: 'JRN', sort_order: 8, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 48, list_code: 'professions', value_ar: 'معلم / أكاديمي', value_en: 'Teacher / Academic', code: 'EDU', sort_order: 9, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 49, list_code: 'professions', value_ar: 'عامل مهني / حرفي', value_en: 'Worker / Artisan', code: 'WRK', sort_order: 10, is_active: 1, is_default: 0, created_at: '2026-01-01' },

    // seizure_reasons (أسباب الضبط)
    { id: 60, list_code: 'seizure_reasons', value_ar: 'اشتباه تزوير في أختام الدخول والخروج', value_en: 'Suspected Forged Stamps', code: 'FORGED_STAMP', sort_order: 1, is_active: 1, is_default: 1, created_at: '2026-01-01' },
    { id: 61, list_code: 'seizure_reasons', value_ar: 'إدراج بقائمة المنع من السفر والمطلوبين أمنياً', value_en: 'Blacklisted / Travel Ban', code: 'TRAVEL_BAN', sort_order: 2, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 62, list_code: 'seizure_reasons', value_ar: 'تلاعب وتبديل في صور وبيانات الجواز', value_en: 'Tampered Bio Page', code: 'TAMPERED_BIO', sort_order: 3, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 63, list_code: 'seizure_reasons', value_ar: 'انتهاء صلاحية وثيقة السفر أو تلف الصفحات', value_en: 'Expired / Damaged Passport', code: 'EXPIRED_DAMAGED', sort_order: 4, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 64, list_code: 'seizure_reasons', value_ar: 'استخدام تأشيرة ملغاة أو منتهية الصلاحية', value_en: 'Cancelled / Expired Visa', code: 'INVALID_VISA', sort_order: 5, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 65, list_code: 'seizure_reasons', value_ar: 'عدم وجود تأشيرة خروج وعودة سارية', value_en: 'Missing Re-entry Visa', code: 'NO_REENTRY', sort_order: 6, is_active: 1, is_default: 0, created_at: '2026-01-01' },
    { id: 66, list_code: 'seizure_reasons', value_ar: 'بلاغ سرقة أو فقدان للجواز بالإنتربول', value_en: 'Reported Stolen / Lost (SLTD)', code: 'INTERPOL_SLTD', sort_order: 7, is_active: 1, is_default: 0, created_at: '2026-01-01' },

    // sects_religions
    { id: 70, list_code: 'sects_religions', value_ar: 'مسلم - سني شافعي', value_en: 'Muslim - Sunni Shafi', code: 'SUN_SHAF', sort_order: 1, is_active: 1, is_default: 1, created_at: '2026-08-10' },
    { id: 71, list_code: 'sects_religions', value_ar: 'مسلم - زيدي', value_en: 'Muslim - Zaydi', code: 'ZAYDI', sort_order: 2, is_active: 1, is_default: 0, created_at: '2026-08-10' },
    { id: 72, list_code: 'sects_religions', value_ar: 'مسيحي - أرثوذكسي', value_en: 'Christian - Orthodox', code: 'CHR_ORTH', sort_order: 3, is_active: 1, is_default: 0, created_at: '2026-08-10' },
    { id: 73, list_code: 'sects_religions', value_ar: 'مسيحي - كاثوليكي / بروتستانتي', value_en: 'Christian - Other', code: 'CHR_OTH', sort_order: 4, is_active: 1, is_default: 0, created_at: '2026-08-10' },
    { id: 74, list_code: 'sects_religions', value_ar: 'أخرى / غير مصرح', value_en: 'Other / Undeclared', code: 'OTHER', sort_order: 5, is_active: 1, is_default: 0, created_at: '2026-08-10' },

    // security_levels
    { id: 80, list_code: 'security_levels', value_ar: 'عادي - تدقيق روتيني اعتيادي', value_en: 'Normal / Routine', code: 'NORMAL', sort_order: 1, is_active: 1, is_default: 1, created_at: '2026-08-10' },
    { id: 81, list_code: 'security_levels', value_ar: 'متوسط - إشعار ومتابعة مسار التحرك', value_en: 'Medium / Monitored', code: 'MEDIUM', sort_order: 2, is_active: 1, is_default: 0, created_at: '2026-08-10' },
    { id: 82, list_code: 'security_levels', value_ar: 'عالي - حظر فوري وتعميم على المنافذ', value_en: 'High / Ban Alert', code: 'HIGH', sort_order: 3, is_active: 1, is_default: 0, created_at: '2026-08-10' },
    { id: 83, list_code: 'security_levels', value_ar: 'حرج - توقيف فوري وإحالة للنيابة الجزائية', value_en: 'Critical / Arrest', code: 'CRITICAL', sort_order: 4, is_active: 1, is_default: 0, created_at: '2026-08-10' }
  ];

  // ==========================================
  // 5. جدول الحقول التلقائية auto_field_rules
  // ==========================================
  let autoFieldRules: AutoFieldRule[] = [
    {
      id: 1,
      entity_type: 'seizure',
      field_key: 'recordNumber',
      rule_type: 'sequence',
      rule_pattern: 'محضر-{YYYY}-{NNNNN}',
      reset_period: 'yearly',
      current_counter: 890,
      counter_padding: 5,
      last_reset_date: '2026-01-01',
      preview_example: 'محضر-2026-00891',
      is_active: 1,
      notes: 'توليد تلقائي لمحاضر الضبط السنوية',
      created_at: '2026-01-01'
    },
    {
      id: 2,
      entity_type: 'correspondence',
      field_key: 'incomingOrOutgoingNumber',
      rule_type: 'sequence',
      rule_pattern: 'ص-{YYYY}{MM}-{NNNN}',
      reset_period: 'monthly',
      current_counter: 104,
      counter_padding: 4,
      last_reset_date: '2026-10-01',
      preview_example: 'ص-202610-0105',
      is_active: 1,
      notes: 'ترقيم متسلسل شهري للمكاتبات الصادرة',
      created_at: '2026-01-01'
    },
    {
      id: 3,
      entity_type: 'refugee',
      field_key: 'refugeeFileNumber',
      rule_type: 'sequence',
      rule_pattern: 'REF-{YYYY}/{NNNN}',
      reset_period: 'yearly',
      current_counter: 144,
      counter_padding: 4,
      last_reset_date: '2026-01-01',
      preview_example: 'REF-2026/0145',
      is_active: 1,
      notes: 'أرقام ملفات اللاجئين الرسمية',
      created_at: '2026-01-01'
    },
    {
      id: 4,
      entity_type: 'intelligence',
      field_key: 'investigationNumber',
      rule_type: 'sequence',
      rule_pattern: '{NNNN}/ت/{YYYY}',
      reset_period: 'yearly',
      current_counter: 1192,
      counter_padding: 4,
      last_reset_date: '2026-01-01',
      preview_example: '1193/ت/2026',
      is_active: 1,
      notes: 'أرقام تحقيقات استخبارات الشرطة المرجعية',
      created_at: '2026-01-01'
    },
    {
      id: 5,
      entity_type: 'clearance',
      field_key: 'transactionNumber',
      rule_type: 'sequence',
      rule_pattern: 'معاملة-{YYYY}-{NNNNN}',
      reset_period: 'yearly',
      current_counter: 2026,
      counter_padding: 5,
      last_reset_date: '2026-01-01',
      preview_example: 'معاملة-2026-02027',
      is_active: 1,
      notes: 'أرقام معاملات الموافقات الأمنية وتتبع المدد (SLA)',
      created_at: '2026-01-01'
    }
  ];

  // دالة مساعدة لحساب الرقم التلقائي بناء على النمط والعداد الحالي
  const evaluateAutoPattern = (pattern: string, counter: number, padding: number, user = 'الضابط المناوب', port = 'الوديعة') => {
    const now = new Date();
    const yyyy = now.getFullYear().toString();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const seqStr = String(counter).padStart(padding, '0');

    let result = pattern
      .replace(/{YYYY}/g, yyyy)
      .replace(/{YY}/g, yyyy.slice(-2))
      .replace(/{MM}/g, mm)
      .replace(/{DD}/g, dd)
      .replace(/{TODAY}/g, `${yyyy}-${mm}-${dd}`)
      .replace(/{NNNNN}/g, seqStr)
      .replace(/{NNNN}/g, seqStr)
      .replace(/{NNN}/g, seqStr)
      .replace(/{USER}/g, user)
      .replace(/{PORT}/g, port);

    return result;
  };

  // ==========================================
  // 6. جدول قوالب الطباعة print_templates & template_sections
  // (الـ 7 قوالب الجاهزة المحددة في الوثيقة)
  // ==========================================
  let printTemplates: PrintTemplate[] = [
    // 1. محضر ضبط قياسي
    {
      id: 1,
      template_code: 'seizure_report',
      template_name_ar: 'محضر ضبط قياسي',
      entity_type: 'seizure',
      page_size: 'A4',
      orientation: 'portrait',
      margins_top: 15,
      margins_bottom: 15,
      margins_left: 15,
      margins_right: 15,
      is_default: 1,
      is_system: 1,
      is_active: 1,
      body_html: `
        <div style="font-family: 'Amiri', 'Traditional Arabic', sans-serif; direction: rtl; text-align: right; line-height: 1.6; color: #111;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px; font-weight: bold; color: #8b0000; text-decoration: underline;">محضر ضبط وثائق سفر ملغاة ومخالفة</h2>
            <p style="margin: 5px 0; font-size: 13px; font-weight: bold;">رقم المحضر: <span style="font-family: monospace; font-size: 15px;">{{recordNumber}}</span> | تاريخ الضبط: {{seizureDate}}</p>
          </div>

          <div style="background: #fdf2f2; border: 1px solid #f87171; padding: 12px; border-radius: 6px; margin-bottom: 15px; font-size: 13px;">
            <p style="margin: 0 0 6px 0;"><strong>المنفذ السيادي:</strong> {{portName}} (النوع: {{portType}})</p>
            <p style="margin: 0 0 6px 0;"><strong>الضابط القابض ومحرر المحضر:</strong> {{officerName}} (الرتبة: {{officerRank}}) - {{authority}}</p>
            <p style="margin: 0 0 6px 0;"><strong>نوع المخالفة والاشتباه:</strong> <span style="color: #b91c1c; font-weight: bold;">{{violationType}}</span></p>
            <p style="margin: 0;"><strong>مكان وموقع الضبط:</strong> {{sourceOfSeizure}}</p>
          </div>

          <h3 style="font-size: 14px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 4px; margin-top: 15px;">أولاً: بيانات الجوازات والوثائق المضبوطة (عدد: {{passportCount}})</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; text-align: center;" border="1">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 6px;">م</th>
                <th style="padding: 6px;">رقم الجواز / الوثيقة</th>
                <th style="padding: 6px;">الاسم المدوّن</th>
                <th style="padding: 6px;">الجنسية</th>
                <th style="padding: 6px;">نوع المخالفة الفنية</th>
                <th style="padding: 6px;">الإجراء المتخذ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 6px;">1</td>
                <td style="padding: 6px; font-family: monospace; font-weight: bold;">{{passportNumber}}</td>
                <td style="padding: 6px;">{{fullName}}</td>
                <td style="padding: 6px;">{{nationality}}</td>
                <td style="padding: 6px;">{{violationDescription}}</td>
                <td style="padding: 6px; font-weight: bold; color: #b91c1c;">حجز وإحالة للاستخبارات</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 20px; font-size: 13px;">
            <p style="font-weight: bold;">ثانياً: تفاصيل الواقعة والملاحظات الأمنية:</p>
            <p style="background: #fafafa; border: 1px dashed #ccc; padding: 10px; border-radius: 4px; min-height: 50px;">
              {{notes}}
            </p>
          </div>

          <div style="margin-top: 35px; display: flex; justify-content: space-between; text-align: center; font-size: 13px; font-weight: bold;">
            <div style="width: 45%;">
              <p>محرر المحضر والضابط المسؤول</p>
              <p style="margin-top: 35px;">{{officerName}}</p>
              <p style="font-size: 11px; color: #666;">(التوقيع والختم الإداري)</p>
            </div>
            <div style="width: 45%;">
              <p>يعتمد / مدير عام المنفذ والجوازات</p>
              <p style="margin-top: 35px;">العميد / مدير الجوازات</p>
              <p style="font-size: 11px; color: #666;">(خاتم مصلحة الهجرة والجوازات)</p>
            </div>
          </div>
        </div>
      `,
      created_at: '2026-01-01',
      sections: [
        {
          id: 101,
          template_id: 1,
          section_type: 'header',
          content_html: `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #002B49; padding-bottom: 10px; font-family: sans-serif; direction: rtl;">
              <div style="text-align: right; font-size: 11px; font-weight: bold;">
                <p style="margin: 0;">الجمهورية اليمنية</p>
                <p style="margin: 2px 0;">وزارة الداخلية</p>
                <p style="margin: 0; color: #002B49;">قطاع الأمن والاستخبارات</p>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px;">🦅</div>
                <div style="font-size: 11px; font-weight: 900; color: #002B49;">مصلحة الهجرة والجوازات والجنسية</div>
              </div>
              <div style="text-align: left; font-size: 11px; font-weight: bold; font-family: monospace;">
                <p style="margin: 0;">التاريخ: {TODAY}</p>
                <p style="margin: 2px 0;">الرقم: {{recordNumber}}</p>
                <p style="margin: 0; color: #b91c1c;">(سري للغاية)</p>
              </div>
            </div>
          `,
          height_mm: 25,
          is_repeating: 1,
          background_color: '#FFFFFF',
          text_color: '#000000'
        },
        {
          id: 102,
          template_id: 1,
          section_type: 'footer',
          content_html: `
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #ccc; padding-top: 5px; font-size: 10px; color: #555; direction: rtl;">
              <span>الضابط المسؤول: {{officerName}} | طُبع بواسطة: {USER}</span>
              <span>صفحة {PAGE} من {PAGES}</span>
              <span>نظام أمن الجوازات والمنافذ - الجمهورية اليمنية</span>
            </div>
          `,
          height_mm: 15,
          is_repeating: 1,
          background_color: '#FFFFFF',
          text_color: '#555555'
        }
      ]
    },

    // 2. تصريح لجوء مؤقت
    {
      id: 2,
      template_code: 'refugee_permit',
      template_name_ar: 'تصريح لجوء مؤقت وبطاقة حماية',
      entity_type: 'refugee',
      page_size: 'A4',
      orientation: 'portrait',
      margins_top: 12,
      margins_bottom: 12,
      margins_left: 12,
      margins_right: 12,
      is_default: 1,
      is_system: 1,
      is_active: 1,
      body_html: `
        <div style="font-family: 'Amiri', sans-serif; direction: rtl; text-align: right; line-height: 1.7;">
          <div style="border: 2px solid #1e3a8a; border-radius: 8px; padding: 15px; background: #fff;">
            <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 15px;">
              <h2 style="margin: 0; color: #1e3a8a; font-size: 20px;">تصريح إقامة وحماية مؤقتة لطالب لجوء</h2>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">صادر بموجب اتفاقية جنيف 1951 وتوجيهات الإدارة العامة لشؤون اللاجئين</p>
            </div>

            <div style="display: flex; gap: 20px; margin-bottom: 15px;">
              <div style="width: 130px; height: 160px; border: 2px dashed #94a3b8; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #64748b; background: #f8fafc; text-align: center;">
                صورة طالب اللجوء<br/>مع الختم البصري
              </div>
              <div style="flex: 1; font-size: 13px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px; font-weight: bold; width: 35%;">رقم الملف السيادي:</td>
                    <td style="padding: 4px; font-family: monospace; font-weight: bold; color: #1e3a8a; font-size: 14px;">{{refugeeFileNumber}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px; font-weight: bold;">رقم بطاقة UNHCR:</td>
                    <td style="padding: 4px; font-family: monospace;">{{unhcrCardNumber}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px; font-weight: bold;">الاسم الكامل:</td>
                    <td style="padding: 4px; font-size: 15px; font-weight: bold;">{{fullName}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px; font-weight: bold;">الجنسية وبلد المنشأ:</td>
                    <td style="padding: 4px;">{{nationality}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px; font-weight: bold;">تاريخ وجهة الوصول:</td>
                    <td style="padding: 4px;">{{arrivalDate}} (منفذ: {{arrivalPortOrCoast}})</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px; font-weight: bold;">مقر الإقامة المسموح به:</td>
                    <td style="padding: 4px; color: #047857; font-weight: bold;">{{currentResidence}}</td>
                  </tr>
                </table>
              </div>
            </div>

            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 10px; font-size: 12px; margin-bottom: 15px;">
              <p style="margin: 0 0 5px 0;"><strong>تاريخ سريان التصريح:</strong> {{arrivalDate}} | <strong>تاريخ الانتهاء الإلزامي:</strong> <span style="color: #b91c1c; font-weight: bold;">{{temporaryPermitExpiry}}</span></p>
              <p style="margin: 0; color: #166534;">يمنح هذا التصريح حامله حماية مؤقتة وعدم إبعاد قسري حتى البت النهائي في طلبه، ولا يعتبر إذناً بالعمل إلا بتصريح رسمي منفصل.</p>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 25px;">
              <div style="text-align: center; width: 100px;">
                <div style="width: 80px; height: 80px; border: 1px solid #000; margin: auto; display: flex; align-items: center; justify-content: center; font-size: 10px;">QR CODE التحقق</div>
                <span style="font-size: 9px; color: #64748b;">امسح للتحقق</span>
              </div>
              <div style="text-align: center;">
                <p style="font-size: 12px; font-weight: bold; margin: 0;">مدير عام الإدارة العامة لشؤون اللاجئين</p>
                <p style="font-size: 11px; margin-top: 30px; font-weight: bold;">الختم الرسمي والتوقيع</p>
              </div>
            </div>
          </div>
        </div>
      `,
      created_at: '2026-01-01',
      sections: [
        {
          id: 201,
          template_id: 2,
          section_type: 'header',
          content_html: `
            <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; font-family: sans-serif; direction: rtl;">
              <p style="margin: 0; font-size: 14px; font-weight: bold;">الجمهورية اليمنية - وزارة الداخلية</p>
              <p style="margin: 2px 0; font-size: 16px; font-weight: 900; color: #1e3a8a;">مصلحة الهجرة والجوازات والجنسية</p>
              <p style="margin: 0; font-size: 12px; color: #334155;">الإدارة العامة لشؤون اللاجئين</p>
            </div>
          `,
          height_mm: 20,
          is_repeating: 1,
          background_color: '#FFFFFF',
          text_color: '#000000'
        }
      ]
    },

    // 3. برقية رسمية (الهيكل السيادي الكامل)
    {
      id: 3,
      template_code: 'official_telegram',
      template_name_ar: 'برقية رسمية سرية (بين القطاعات)',
      entity_type: 'correspondence',
      page_size: 'A4',
      orientation: 'portrait',
      margins_top: 15,
      margins_bottom: 15,
      margins_left: 15,
      margins_right: 15,
      is_default: 1,
      is_system: 1,
      is_active: 1,
      body_html: `
        <div style="font-family: 'Amiri', 'Traditional Arabic', serif; direction: rtl; text-align: right; line-height: 1.8; font-size: 15px; color: #000;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 15px; font-size: 13px; font-weight: bold;">
            <div>رقم الصادر: <span style="font-family: monospace; font-size: 15px;">{{incomingOrOutgoingNumber}}</span></div>
            <div>التاريخ الهجري: {{hijriDate}}</div>
            <div>التاريخ الميلادي: {{gregorianDate}}</div>
          </div>

          <p style="margin: 0 0 10px 0; font-weight: bold;">إلى الأخ / {{toEntity}} المحترم</p>
          <p style="margin: 0 0 10px 0; font-weight: bold;">من / {{fromEntity}}</p>
          
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 4px; margin: 15px 0;">
            <p style="margin: 0 0 4px 0;"><strong>الموضوع:</strong> {{subject}}</p>
            <p style="margin: 0; font-size: 13px; color: #475569;"><strong>الإشارة:</strong> {{referenceNumber}} (رقم التحقيق: {{investigationNumber}} - رقم القيد: {{entryNumber}})</p>
          </div>

          <p style="margin-top: 15px; font-weight: bold;">{{openingGreeting}}</p>
          <p style="text-indent: 30px; text-align: justify; margin: 15px 0;">
            {{bodyContent}}
          </p>

          <p style="font-weight: bold; margin: 20px 0 10px 0;">{{closingDirective}}</p>
          
          <p style="text-align: center; margin-top: 20px; font-weight: bold;">{{closingGreeting}}</p>

          <div style="margin-top: 40px; display: flex; justify-content: flex-end;">
            <div style="text-align: center; width: 250px;">
              <p style="font-weight: bold; margin: 0;">{{signatoryName}}</p>
              <p style="font-size: 13px; color: #475569; margin: 5px 0;">{{signatoryRank}}</p>
              <p style="font-size: 11px; margin-top: 35px; border-top: 1px dashed #999; padding-top: 5px;">{{officialStamp}}</p>
            </div>
          </div>
        </div>
      `,
      created_at: '2026-01-01',
      sections: [
        {
          id: 301,
          template_id: 3,
          section_type: 'header',
          content_html: `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; direction: rtl; font-family: sans-serif;">
              <div style="font-size: 12px; font-weight: bold; text-align: right;">
                <p style="margin: 0;">الجمهورية اليمنية</p>
                <p style="margin: 2px 0;">وزارة الداخلية</p>
                <p style="margin: 0;">فرع استخبارات الشرطة</p>
              </div>
              <div style="text-align: center;">
                <span style="border: 2px solid #b91c1c; color: #b91c1c; font-weight: 900; font-size: 14px; padding: 2px 10px; border-radius: 4px;">برقية سرية وهامة</span>
              </div>
              <div style="font-size: 11px; text-align: left; font-family: monospace;">
                رمز البرقية: INT-SEC-2026
              </div>
            </div>
          `,
          height_mm: 20,
          is_repeating: 1,
          background_color: '#FFFFFF',
          text_color: '#000000'
        },
        {
          id: 302,
          template_id: 3,
          section_type: 'footer',
          content_html: `
            <div style="text-align: center; border-top: 1px solid #ccc; padding-top: 4px; font-size: 10px; color: #777; direction: rtl;">
              تمت معالجة هذه البرقية وتشفيرها عبر المنظومة السيادية | رقم الأرشيف: {TODAY}-{PAGE}
            </div>
          `,
          height_mm: 12,
          is_repeating: 1,
          background_color: '#FFFFFF',
          text_color: '#777777'
        }
      ]
    },

    // 4. مذكرة داخلية
    {
      id: 4,
      template_code: 'internal_memo',
      template_name_ar: 'مذكرة داخلية (بين الإدارات والأقسام)',
      entity_type: 'correspondence',
      page_size: 'A4',
      orientation: 'portrait',
      margins_top: 12,
      margins_bottom: 12,
      margins_left: 12,
      margins_right: 12,
      is_default: 0,
      is_system: 1,
      is_active: 1,
      body_html: `
        <div style="font-family: sans-serif; direction: rtl; text-align: right; line-height: 1.6; font-size: 14px;">
          <div style="background: #e2e8f0; padding: 10px 15px; border-radius: 6px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="width: 15%; font-weight: bold;">إلى:</td>
                <td>{{toEntity}}</td>
                <td style="width: 15%; font-weight: bold;">التاريخ:</td>
                <td style="font-family: monospace;">{{gregorianDate}}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">من:</td>
                <td>{{fromEntity}}</td>
                <td style="font-weight: bold;">رقم القيد:</td>
                <td style="font-family: monospace;">{{incomingOrOutgoingNumber}}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">الموضوع:</td>
                <td colspan="3" style="font-weight: bold; color: #1e3a8a;">{{subject}}</td>
              </tr>
            </table>
          </div>

          <div style="padding: 10px 0; min-height: 250px;">
            <p>{{openingGreeting}}</p>
            <p style="text-align: justify; margin: 15px 0;">{{bodyContent}}</p>
            <p style="font-weight: bold; margin-top: 20px;">{{closingDirective}}</p>
          </div>

          <div style="border-top: 1px solid #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between;">
            <div>
              <p style="font-size: 11px; color: #64748b; margin: 0;">نسخة مع التحية لـ:</p>
              <p style="font-size: 11px; margin: 2px 0;">- ملف القسم</p>
              <p style="font-size: 11px; margin: 0;">- الأرشيف العام</p>
            </div>
            <div style="text-align: center;">
              <p style="font-weight: bold; margin: 0;">{{signatoryName}}</p>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0;">{{signatoryRank}}</p>
            </div>
          </div>
        </div>
      `,
      created_at: '2026-01-01',
      sections: []
    },

    // 5. تقرير شهري
    {
      id: 5,
      template_code: 'monthly_report',
      template_name_ar: 'تقرير الأعمال والإحصاءات الشهري',
      entity_type: 'passport',
      page_size: 'A4',
      orientation: 'portrait',
      margins_top: 15,
      margins_bottom: 15,
      margins_left: 15,
      margins_right: 15,
      is_default: 0,
      is_system: 1,
      is_active: 1,
      body_html: `
        <div style="font-family: sans-serif; direction: rtl; text-align: right; line-height: 1.6;">
          <h2 style="text-align: center; color: #0f172a; margin-bottom: 20px;">خلاصة النشاط والإنجاز الشهري للمنافذ والجوازات</h2>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; text-align: center;">
            <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc;">
              <div style="font-size: 12px; color: #64748b;">إجمالي حركة المسافرين</div>
              <div style="font-size: 22px; font-weight: 900; color: #0284c7; margin-top: 5px;">48,912</div>
            </div>
            <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc;">
              <div style="font-size: 12px; color: #64748b;">محاضر الضبط المنجزة</div>
              <div style="font-size: 22px; font-weight: 900; color: #dc2626; margin-top: 5px;">142</div>
            </div>
            <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc;">
              <div style="font-size: 12px; color: #64748b;">الموافقات الأمنية الصادرة</div>
              <div style="font-size: 22px; font-weight: 900; color: #16a34a; margin-top: 5px;">1,280</div>
            </div>
          </div>

          <h3 style="font-size: 14px; font-weight: bold; border-bottom: 2px solid #0f172a; padding-bottom: 5px;">جدول نشاط المنافذ السيادية الـ 13 الرئيسية</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;" border="1">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 6px;">المنفذ</th>
                <th style="padding: 6px;">النوع</th>
                <th style="padding: 6px;">حركة القدوم</th>
                <th style="padding: 6px;">حركة المغادرة</th>
                <th style="padding: 6px;">المضبوطات</th>
                <th style="padding: 6px;">نسبة الالتزام بالـ SLA</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 6px; font-weight: bold;">منفذ الوديعة البري</td><td style="padding: 6px;">بري</td><td style="padding: 6px;">18,400</td><td style="padding: 6px;">21,100</td><td style="padding: 6px; color: #dc2626;">64</td><td style="padding: 6px; color: #16a34a; font-weight: bold;">98%</td></tr>
              <tr><td style="padding: 6px; font-weight: bold;">مطار عدن الدولي</td><td style="padding: 6px;">جوي</td><td style="padding: 6px;">9,120</td><td style="padding: 6px;">8,950</td><td style="padding: 6px; color: #dc2626;">28</td><td style="padding: 6px; color: #16a34a; font-weight: bold;">99%</td></tr>
              <tr><td style="padding: 6px; font-weight: bold;">منفذ شحن الحدودي</td><td style="padding: 6px;">بري</td><td style="padding: 6px;">4,200</td><td style="padding: 6px;">3,800</td><td style="padding: 6px; color: #dc2626;">12</td><td style="padding: 6px; color: #16a34a; font-weight: bold;">96%</td></tr>
              <tr><td style="padding: 6px; font-weight: bold;">ميناء عدن والمكلا</td><td style="padding: 6px;">بحري</td><td style="padding: 6px;">1,420</td><td style="padding: 6px;">1,310</td><td style="padding: 6px; color: #dc2626;">8</td><td style="padding: 6px; color: #16a34a; font-weight: bold;">100%</td></tr>
            </tbody>
          </table>
        </div>
      `,
      created_at: '2026-01-01',
      sections: []
    },

    // 6. كشف Excel للعمليات
    {
      id: 6,
      template_code: 'operations_manifest',
      template_name_ar: 'كشف Excel للعمليات الميدانية والتدقيق',
      entity_type: 'passenger',
      page_size: 'A4',
      orientation: 'landscape',
      margins_top: 10,
      margins_bottom: 10,
      margins_left: 10,
      margins_right: 10,
      is_default: 0,
      is_system: 1,
      is_active: 1,
      body_html: `
        <div style="font-family: sans-serif; direction: rtl; text-align: right;">
          <h3 style="text-align: center; margin: 0 0 10px 0;">كشف مباينة وفحص ومطابقة المسافرين اليومي - كابينة المنافذ</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: center;" border="1">
            <thead>
              <tr style="background: #e2e8f0;">
                <th style="padding: 5px;">م</th>
                <th style="padding: 5px;">رقم الجواز</th>
                <th style="padding: 5px;">اسم المسافر</th>
                <th style="padding: 5px;">الجنسية</th>
                <th style="padding: 5px;">نوع الحركة</th>
                <th style="padding: 5px;">المنفذ</th>
                <th style="padding: 5px;">الرحلة / المركبة</th>
                <th style="padding: 5px;">نتيجة الفحص الأمني</th>
                <th style="padding: 5px;">ملاحظات التدقيق الميداني</th>
                <th style="padding: 5px;">توقيع الضابط</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 5px;">1</td>
                <td style="padding: 5px; font-family: monospace;">0498112</td>
                <td style="padding: 5px;">عادل أحمد مسعد العولقي</td>
                <td style="padding: 5px;">يمني</td>
                <td style="padding: 5px;">مغادرة</td>
                <td style="padding: 5px;">منفذ الوديعة</td>
                <td style="padding: 5px;">حافلة النقل الجماعي</td>
                <td style="padding: 5px; color: #16a34a; font-weight: bold;">سليم - لا مانع</td>
                <td style="padding: 5px;">مستوف للشروط</td>
                <td style="padding: 5px;">موقع</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
      created_at: '2026-01-01',
      sections: []
    },

    // 7. بطاقة تصريح (بحجم بطاقة تعريف 85.6 × 54 مم)
    {
      id: 7,
      template_code: 'permit_card',
      template_name_ar: 'بطاقة تصريح أمني (حجم بطاقة الهوية ID Card)',
      entity_type: 'movement_permit',
      page_size: 'Card',
      orientation: 'landscape',
      margins_top: 2,
      margins_bottom: 2,
      margins_left: 2,
      margins_right: 2,
      is_default: 0,
      is_system: 1,
      is_active: 1,
      body_html: `
        <div style="width: 85.6mm; height: 54mm; box-sizing: border-box; border: 2px solid #002B49; border-radius: 4mm; padding: 3mm; font-family: sans-serif; direction: rtl; background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%); position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #002B49; padding-bottom: 1mm; margin-bottom: 2mm;">
            <div style="font-size: 7px; font-weight: bold; line-height: 1.2;">
              الجمهورية اليمنية<br/>وزارة الداخلية - قطاع الأمن
            </div>
            <div style="font-size: 9px; font-weight: 900; color: #002B49;">بطاقة تصريح أمني</div>
            <div style="font-size: 8px;">🦅</div>
          </div>

          <div style="display: flex; gap: 3mm;">
            <div style="width: 18mm; height: 24mm; border: 1px solid #94a3b8; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 7px; text-align: center; color: #64748b;">
              صورة الحامل
            </div>
            <div style="flex: 1; font-size: 7.5px; line-height: 1.5;">
              <div><strong>الاسم:</strong> {{leaderName}}</div>
              <div><strong>الجهة:</strong> {{organizationName}}</div>
              <div><strong>رقم التصريح:</strong> <span style="font-family: monospace; font-weight: bold; color: #b91c1c;">{{permitNumber}}</span></div>
              <div><strong>خط السير:</strong> {{approvedRoute}}</div>
              <div><strong>ساري حتى:</strong> {{endDate}}</div>
            </div>
          </div>

          <div style="position: absolute; bottom: 2mm; left: 3mm; right: 3mm; display: flex; justify-content: space-between; align-items: center; border-top: 0.5px solid #ccc; padding-top: 1mm; font-size: 6px; color: #64748b;">
            <span>صالحة لكافة النقاط الأمنية والمنافذ</span>
            <span style="font-weight: bold; color: #002B49;">ختم الإدارة العامة</span>
          </div>
        </div>
      `,
      created_at: '2026-01-01',
      sections: []
    }
  ];

  // ==========================================
  // 7. جدول تخطيط النماذج form_layouts
  // ==========================================
  let formLayouts: FormLayout[] = [
    {
      id: 1,
      entity_type: 'refugee',
      layout_name: 'default',
      is_default: 1,
      is_system: 1,
      created_at: '2026-01-01',
      layout_json: {
        tabs: [
          {
            title: 'بيانات شخصية',
            groups: [
              {
                title: 'الهوية الأساسية',
                rows: [
                  { fields: ['fullName', 'refugeeFileNumber'] },
                  { fields: ['nationality', 'gender', 'birthDate'] }
                ]
              },
              {
                title: 'البيانات الاجتماعية والتصنيف',
                rows: [
                  { fields: ['sect', 'tribe'] },
                  { fields: ['maritalStatus', 'emergency_phone'] }
                ]
              }
            ]
          },
          {
            title: 'الوصول والإقامة',
            groups: [
              {
                title: 'بيانات القدوم والسكن',
                rows: [
                  { fields: ['arrivalDate', 'arrivalPortOrCoast'] },
                  { fields: ['currentResidence', 'sponsorOrEntity'] },
                  { fields: ['temporaryPermitExpiry'] }
                ]
              }
            ]
          }
        ]
      }
    },
    {
      id: 2,
      entity_type: 'seizure',
      layout_name: 'default',
      is_default: 1,
      is_system: 1,
      created_at: '2026-01-01',
      layout_json: {
        tabs: [
          {
            title: 'بيانات محضر الضبط',
            groups: [
              {
                title: 'معلومات الواقعة والمنفذ',
                rows: [
                  { fields: ['recordNumber', 'seizureDate'] },
                  { fields: ['portName', 'sourceOfSeizure'] },
                  { fields: ['officerName', 'authority'] }
                ]
              },
              {
                title: 'المخالفات والمحروزات',
                rows: [
                  { fields: ['violationType'] },
                  { fields: ['confiscated_items'] }
                ]
              }
            ]
          }
        ]
      }
    }
  ];

  // ==========================================
  // 8. جدول لقطات الهيكل schema_snapshots (النسخ الاحتياطي)
  // ==========================================
  let schemaSnapshots: SchemaSnapshot[] = [
    {
      id: 1,
      snapshot_name: 'النسخة السيادية الأساسية (Baseline Schema v1.0)',
      snapshot_type: 'manual_backup',
      schema_json: JSON.stringify({
        fieldDefinitionsCount: fieldDefinitions.length,
        labelOverridesCount: labelOverrides.length,
        listDefinitionsCount: listDefinitions.length,
        autoFieldRulesCount: autoFieldRules.length,
        printTemplatesCount: printTemplates.length,
        formLayoutsCount: formLayouts.length,
        timestamp: '2026-01-01T00:00:00Z'
      }),
      created_by: 'مهندس المطور (Super Admin)',
      created_at: '2026-01-01T00:00:00Z'
    }
  ];

  // دالة مساعدة لأخذ لقطة تلقائية قبل أي تعديل حساس
  const takeAutoSnapshot = (name: string, type: any, user: string) => {
    const fullSnapshot = {
      fieldDefinitions,
      labelOverrides,
      listDefinitions,
      listValues,
      autoFieldRules,
      printTemplates,
      formLayouts,
      timestamp: new Date().toISOString()
    };
    const snap: SchemaSnapshot = {
      id: schemaSnapshots.length + 1,
      snapshot_name: `تلقائي قبل ${name}`,
      snapshot_type: type,
      schema_json: JSON.stringify(fullSnapshot),
      created_by: user,
      created_at: new Date().toISOString()
    };
    schemaSnapshots.unshift(snap);
    // الاحتفاظ بآخر 30 نسخة فقط كما نصت المواصفات
    if (schemaSnapshots.length > 30) {
      schemaSnapshots.pop();
    }
    return snap;
  };

  // ==========================================
  // مسارات REST API لوحدة المطور (Developer API Routes)
  // ==========================================

  // الحصول على كافة الـ Metadata دفعة واحدة
  app.get('/api/developer/metadata/all', (req: Request, res: Response) => {
    res.json({
      fieldDefinitions,
      customFieldValues,
      labelOverrides,
      listDefinitions,
      listValues,
      autoFieldRules,
      printTemplates,
      formLayouts,
      schemaSnapshots
    });
  });

  // التحقق من كلمة مرور المطور (التأكيد المزدوج)
  app.post('/api/developer/verify-password', (req: Request, res: Response) => {
    const { password } = req.body;
    // يقبل كلمة مرور المطور "dev" أو "admin" أو "123"
    if (password === 'dev' || password === 'admin' || password === '123') {
      res.json({ success: true, message: 'تم التحقق بنجاح' });
    } else {
      res.status(401).json({ success: false, message: 'كلمة مرور المطور غير صحيحة' });
    }
  });

  // --- 1. إدارة الحقول field_definitions ---
  app.get('/api/field-definitions', (req: Request, res: Response) => {
    const { entity } = req.query;
    if (entity) {
      return res.json(fieldDefinitions.filter(f => f.entity_type === entity));
    }
    res.json(fieldDefinitions);
  });

  app.post('/api/field-definitions', (req: Request, res: Response) => {
    const user = req.body.officerName || 'مهندس المطور';
    takeAutoSnapshot(`إضافة حقل جديد: ${req.body.field_key}`, 'field_add', user);

    const newField: FieldDefinition = {
      ...req.body,
      id: fieldDefinitions.length + 1,
      is_system: 0,
      is_visible: req.body.is_visible !== undefined ? req.body.is_visible : 1,
      storage_strategy: 'eav',
      created_at: new Date().toISOString()
    };
    fieldDefinitions.push(newField);
    recordAuditLog('إضافة حقل', 'وحدة المطور', `${newField.entity_type}.${newField.field_key}`, `إضافة حقل جديد (${newField.label_ar}) للكيان: ${newField.entity_type}`, user, 'super_admin');
    res.status(201).json(newField);
  });

  app.put('/api/field-definitions/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = fieldDefinitions.findIndex(f => f.id === id);
    if (idx === -1) return res.status(404).json({ error: 'الحقل غير موجود' });

    const user = req.body.officerName || 'مهندس المطور';
    takeAutoSnapshot(`تعديل الحقل: ${fieldDefinitions[idx].field_key}`, 'field_add', user);

    fieldDefinitions[idx] = {
      ...fieldDefinitions[idx],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    recordAuditLog('تعديل حقل', 'وحدة المطور', `${fieldDefinitions[idx].entity_type}.${fieldDefinitions[idx].field_key}`, `تعديل إعدادات الحقل: ${fieldDefinitions[idx].label_ar}`, user, 'super_admin');
    res.json(fieldDefinitions[idx]);
  });

  app.delete('/api/field-definitions/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const field = fieldDefinitions.find(f => f.id === id);
    if (!field) return res.status(404).json({ error: 'الحقل غير موجود' });
    if (field.is_system) {
      return res.status(403).json({ error: 'لا يمكن حذف الحقول الأساسية للنظام (is_system=1)' });
    }

    const user = (req.query.user as string) || 'مهندس المطور';
    takeAutoSnapshot(`حذف الحقل: ${field.field_key}`, 'field_add', user);

    // فحص ما إذا كان هناك بيانات مسجلة في هذا الحقل
    const hasData = customFieldValues.some(v => v.entity_type === field.entity_type && v.field_key === field.field_key);
    if (hasData) {
      // إخفاء الحقل فقط للحفاظ على البيانات
      field.is_visible = 0;
      recordAuditLog('إخفاء حقل', 'وحدة المطور', `${field.entity_type}.${field.field_key}`, `تم إخفاء الحقل لوجود بيانات مخزنة مرتبطة به`, user, 'super_admin');
      return res.json({ message: 'تم إخفاء الحقل مع الاحتفاظ بالبيانات المخزنة', softDeleted: true });
    }

    fieldDefinitions = fieldDefinitions.filter(f => f.id !== id);
    recordAuditLog('حذف حقل', 'وحدة المطور', `${field.entity_type}.${field.field_key}`, `تم حذف الحقل نهائياً لعدم وجود بيانات سابقة`, user, 'super_admin');
    res.status(204).send();
  });

  // --- 2. قيم الحقول المخصصة EAV (custom_field_values) ---
  app.get('/api/custom-field-values/:entityType/:entityId', (req: Request, res: Response) => {
    const { entityType, entityId } = req.params;
    const values = customFieldValues.filter(v => v.entity_type === entityType && String(v.entity_id) === String(entityId));
    res.json(values);
  });

  app.post('/api/custom-field-values', (req: Request, res: Response) => {
    const { entity_type, entity_id, values } = req.body; // values: { [key]: value }
    if (!entity_type || !entity_id || !values) {
      return res.status(400).json({ error: 'بيانات ناقصة' });
    }

    const now = new Date().toISOString();
    Object.entries(values).forEach(([key, val]) => {
      const idx = customFieldValues.findIndex(v => v.entity_type === entity_type && String(v.entity_id) === String(entity_id) && v.field_key === key);
      const entry: CustomFieldValue = {
        id: idx >= 0 ? customFieldValues[idx].id : customFieldValues.length + 1,
        entity_type: entity_type as EntityType,
        entity_id,
        field_key: key,
        value_text: typeof val === 'string' ? val : String(val),
        value_number: typeof val === 'number' ? val : undefined,
        value_bool: typeof val === 'boolean' ? (val ? 1 : 0) : undefined,
        updated_at: now
      };

      if (idx >= 0) {
        customFieldValues[idx] = entry;
      } else {
        customFieldValues.push(entry);
      }
    });

    res.json({ success: true, count: Object.keys(values).length });
  });

  // --- 3. تعديل التسميات label_overrides ---
  app.get('/api/label-overrides', (req: Request, res: Response) => {
    res.json(labelOverrides);
  });

  app.post('/api/label-overrides/batch', (req: Request, res: Response) => {
    const { overrides, user } = req.body; // array of { entity_type, field_key, original_label, new_label }
    if (!Array.isArray(overrides)) return res.status(400).json({ error: 'تنسيق غير صحيح' });

    takeAutoSnapshot('تعديل تسميات الحقول', 'label_edit', user || 'مهندس المطور');

    overrides.forEach(item => {
      const idx = labelOverrides.findIndex(o => o.entity_type === item.entity_type && o.field_key === item.field_key);
      if (idx >= 0) {
        labelOverrides[idx].new_label = item.new_label;
      } else {
        labelOverrides.push({
          id: labelOverrides.length + 1,
          entity_type: item.entity_type,
          field_key: item.field_key,
          original_label: item.original_label,
          new_label: item.new_label,
          language: 'ar',
          created_at: new Date().toISOString()
        });
      }
    });

    recordAuditLog('تعديل تسميات', 'وحدة المطور', 'تسميات جماعية', `تحديث تسميات ${overrides.length} حقل بالمنظومة`, user || 'مهندس المطور', 'super_admin');
    res.json({ success: true, count: overrides.length, labelOverrides });
  });

  app.delete('/api/label-overrides/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    labelOverrides = labelOverrides.filter(o => o.id !== id);
    res.status(204).send();
  });

  // --- 4. قوائم الاختيار list_definitions & list_values ---
  app.get('/api/list-definitions', (req: Request, res: Response) => {
    const withCounts = listDefinitions.map(l => ({
      ...l,
      valuesCount: listValues.filter(v => v.list_code === l.list_code).length
    }));
    res.json(withCounts);
  });

  app.post('/api/list-definitions', (req: Request, res: Response) => {
    const newDef: ListDefinition = {
      ...req.body,
      id: listDefinitions.length + 1,
      is_system: 0,
      created_at: new Date().toISOString()
    };
    listDefinitions.push(newDef);
    res.status(201).json(newDef);
  });

  app.delete('/api/list-definitions/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const def = listDefinitions.find(d => d.id === id);
    if (!def) return res.status(404).json({ error: 'القائمة غير موجودة' });
    if (def.is_system) return res.status(403).json({ error: 'لا يمكن حذف القوائم الأساسية للنظام' });

    listDefinitions = listDefinitions.filter(d => d.id !== id);
    listValues = listValues.filter(v => v.list_code !== def.list_code);
    res.status(204).send();
  });

  app.get('/api/list-values', (req: Request, res: Response) => {
    const { list_code } = req.query;
    if (list_code) {
      return res.json(listValues.filter(v => v.list_code === list_code).sort((a, b) => a.sort_order - b.sort_order));
    }
    res.json(listValues);
  });

  app.post('/api/list-values', (req: Request, res: Response) => {
    const newValue: ListValue = {
      ...req.body,
      id: listValues.length + 1,
      sort_order: req.body.sort_order || listValues.filter(v => v.list_code === req.body.list_code).length + 1,
      is_active: req.body.is_active !== undefined ? req.body.is_active : 1,
      is_default: req.body.is_default || 0,
      created_at: new Date().toISOString()
    };
    listValues.push(newValue);
    res.status(201).json(newValue);
  });

  app.put('/api/list-values/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = listValues.findIndex(v => v.id === id);
    if (idx === -1) return res.status(404).json({ error: 'العنصر غير موجود' });
    listValues[idx] = { ...listValues[idx], ...req.body };
    res.json(listValues[idx]);
  });

  app.delete('/api/list-values/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    listValues = listValues.filter(v => v.id !== id);
    res.status(204).send();
  });

  // --- 5. الحقول التلقائية auto_field_rules ---
  app.get('/api/auto-field-rules', (req: Request, res: Response) => {
    res.json(autoFieldRules);
  });

  app.post('/api/auto-field-rules', (req: Request, res: Response) => {
    const preview = evaluateAutoPattern(req.body.rule_pattern, (req.body.current_counter || 0) + 1, req.body.counter_padding || 5);
    const newRule: AutoFieldRule = {
      ...req.body,
      id: autoFieldRules.length + 1,
      preview_example: preview,
      is_active: 1,
      created_at: new Date().toISOString()
    };
    autoFieldRules.push(newRule);
    res.status(201).json(newRule);
  });

  app.put('/api/auto-field-rules/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = autoFieldRules.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'القاعدة غير موجودة' });
    
    const pattern = req.body.rule_pattern || autoFieldRules[idx].rule_pattern;
    const counter = req.body.current_counter !== undefined ? req.body.current_counter : autoFieldRules[idx].current_counter;
    const padding = req.body.counter_padding || autoFieldRules[idx].counter_padding;
    const preview = evaluateAutoPattern(pattern, counter + 1, padding);

    autoFieldRules[idx] = {
      ...autoFieldRules[idx],
      ...req.body,
      preview_example: preview
    };
    res.json(autoFieldRules[idx]);
  });

  // اختبار واحتساب الرقم القادم live test
  app.post('/api/auto-field-rules/test-generate', (req: Request, res: Response) => {
    const { pattern, current_counter, padding, user, port } = req.body;
    const nextVal = (Number(current_counter) || 0) + 1;
    const generated = evaluateAutoPattern(pattern, nextVal, Number(padding) || 5, user, port);
    res.json({ generated, nextCounter: nextVal });
  });

  // --- 6. قوالب الطباعة print_templates ---
  app.get('/api/print-templates', (req: Request, res: Response) => {
    const { entity } = req.query;
    if (entity) {
      return res.json(printTemplates.filter(t => t.entity_type === entity));
    }
    res.json(printTemplates);
  });

  app.post('/api/print-templates', (req: Request, res: Response) => {
    const user = req.body.officerName || 'مهندس المطور';
    takeAutoSnapshot(`إضافة قالب طباعة: ${req.body.template_name_ar}`, 'template_edit', user);

    const newTemplate: PrintTemplate = {
      ...req.body,
      id: printTemplates.length + 1,
      is_system: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    };
    printTemplates.push(newTemplate);
    recordAuditLog('إضافة قالب طباعة', 'وحدة المطور', newTemplate.template_code, `إضافة قالب طباعة (${newTemplate.template_name_ar}) للكيان: ${newTemplate.entity_type}`, user, 'super_admin');
    res.status(201).json(newTemplate);
  });

  app.put('/api/print-templates/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = printTemplates.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'القالب غير موجود' });

    const user = req.body.officerName || 'مهندس المطور';
    takeAutoSnapshot(`تعديل قالب طباعة: ${printTemplates[idx].template_name_ar}`, 'template_edit', user);

    printTemplates[idx] = {
      ...printTemplates[idx],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    recordAuditLog('تعديل قالب طباعة', 'وحدة المطور', printTemplates[idx].template_code, `تحديث قالب الطباعة: ${printTemplates[idx].template_name_ar}`, user, 'super_admin');
    res.json(printTemplates[idx]);
  });

  app.delete('/api/print-templates/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const t = printTemplates.find(x => x.id === id);
    if (!t) return res.status(404).json({ error: 'القالب غير موجود' });
    if (t.is_system) return res.status(403).json({ error: 'لا يمكن حذف القوالب الأساسية للنظام' });

    printTemplates = printTemplates.filter(x => x.id !== id);
    res.status(204).send();
  });

  // --- 7. تخطيط النماذج form_layouts ---
  app.get('/api/form-layouts', (req: Request, res: Response) => {
    const { entity } = req.query;
    if (entity) {
      return res.json(formLayouts.filter(l => l.entity_type === entity));
    }
    res.json(formLayouts);
  });

  app.post('/api/form-layouts', (req: Request, res: Response) => {
    const newLayout: FormLayout = {
      ...req.body,
      id: formLayouts.length + 1,
      is_system: 0,
      created_at: new Date().toISOString()
    };
    formLayouts.push(newLayout);
    res.status(201).json(newLayout);
  });

  app.put('/api/form-layouts/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = formLayouts.findIndex(l => l.id === id);
    if (idx === -1) return res.status(404).json({ error: 'التخطيط غير موجود' });

    formLayouts[idx] = {
      ...formLayouts[idx],
      ...req.body
    };
    res.json(formLayouts[idx]);
  });

  // --- 8. لقطات الهيكل والنسخ الاحتياطي schema_snapshots ---
  app.get('/api/schema-snapshots', (req: Request, res: Response) => {
    res.json(schemaSnapshots);
  });

  app.post('/api/schema-snapshots', (req: Request, res: Response) => {
    const { snapshot_name, user } = req.body;
    const snap = takeAutoSnapshot(snapshot_name || 'نسخة احتياطية يدوية للهيكل', 'manual_backup', user || 'مهندس المطور');
    recordAuditLog('نسخ احتياطي', 'وحدة المطور', snap.snapshot_name, `أخذ لقطة كاملة لـ Metadata المنظومة`, user || 'مهندس المطور', 'super_admin');
    res.status(201).json(snap);
  });

  // استعادة لقطة سابقة Restore Snapshot (Undo)
  app.post('/api/schema-snapshots/:id/restore', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const snap = schemaSnapshots.find(s => s.id === id);
    if (!snap) return res.status(404).json({ error: 'النسخة غير موجودة' });

    try {
      const data = JSON.parse(snap.schema_json);
      if (data.fieldDefinitions) fieldDefinitions = data.fieldDefinitions;
      if (data.labelOverrides) labelOverrides = data.labelOverrides;
      if (data.listDefinitions) listDefinitions = data.listDefinitions;
      if (data.listValues) listValues = data.listValues;
      if (data.autoFieldRules) autoFieldRules = data.autoFieldRules;
      if (data.printTemplates) printTemplates = data.printTemplates;
      if (data.formLayouts) formLayouts = data.formLayouts;

      snap.restored_at = new Date().toISOString();
      recordAuditLog('استعادة لقطة', 'وحدة المطور', snap.snapshot_name, `استعادة إعدادات وهيكل النظام إلى حالة سابقة (${snap.created_at})`, 'مهندس المطور', 'super_admin');
      
      res.json({
        success: true,
        message: `تمت استعادة النسخة بنجاح: ${snap.snapshot_name}`,
        restoredAt: snap.restored_at
      });
    } catch (e: any) {
      res.status(500).json({ error: 'فشل فك ضغط واستعادة بيانات اللقطة', details: e.message });
    }
  });

}
