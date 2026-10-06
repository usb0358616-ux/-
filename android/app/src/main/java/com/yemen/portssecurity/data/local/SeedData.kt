package com.yemen.portssecurity.data.local

import com.yemen.portssecurity.core.security.PasswordHasher
import com.yemen.portssecurity.data.local.entities.PermissionEntity
import com.yemen.portssecurity.data.local.entities.RoleEntity
import com.yemen.portssecurity.data.local.entities.RolePermissionCrossRef
import com.yemen.portssecurity.data.local.entities.UserEntity
import com.yemen.portssecurity.data.local.entities.UserRoleCrossRef
import java.util.UUID

/**
 * البيانات التأسيسية السيادية (Seed Data) للأدوار السبعة والصلاحيات الـ 80 والمستخدم الافتراضي
 */
object SeedData {

    // معرفات ثابتة للأدوار
    val ROLE_SUPER_ADMIN_ID = "role-super-admin-001"
    val ROLE_DEPUTY_ADMIN_ID = "role-deputy-admin-002"
    val ROLE_DEPT_MANAGER_ID = "role-dept-manager-003"
    val ROLE_SECTION_HEAD_ID = "role-section-head-004"
    val ROLE_SENIOR_INVESTIGATOR_ID = "role-senior-investigator-005"
    val ROLE_INVESTIGATOR_ID = "role-investigator-006"
    val ROLE_DATA_ENTRY_ID = "role-data-entry-007"

    // 1. الأدوار السبعة الرسمية
    val roles = listOf(
        RoleEntity(
            id = ROLE_SUPER_ADMIN_ID,
            roleCode = "super_admin",
            roleNameAr = "مدير عام",
            roleNameEn = "Super Admin",
            description = "صلاحيات سيادية كاملة على كافة المكونات وإدارة المستخدمين والنسخ الاحتياطي"
        ),
        RoleEntity(
            id = ROLE_DEPUTY_ADMIN_ID,
            roleCode = "deputy_admin",
            roleNameAr = "نائب مدير عام",
            roleNameEn = "Deputy Admin",
            description = "كافة الصلاحيات التشغيلية والأمنية ما عدا إدارة حسابات المستخدمين"
        ),
        RoleEntity(
            id = ROLE_DEPT_MANAGER_ID,
            roleCode = "department_manager",
            roleNameAr = "مدير إدارة",
            roleNameEn = "Department Manager",
            description = "إدارة ومتابعة واعتماد معاملات إدارته ووحدته الأمنية"
        ),
        RoleEntity(
            id = ROLE_SECTION_HEAD_ID,
            roleCode = "section_head",
            roleNameAr = "رئيس قسم",
            roleNameEn = "Section Head",
            description = "إدارة فريق العمل وتوزيع المهام ومراجعة محاضر الضبط والتقارير"
        ),
        RoleEntity(
            id = ROLE_SENIOR_INVESTIGATOR_ID,
            roleCode = "senior_investigator",
            roleNameAr = "محقق أول",
            roleNameEn = "Senior Investigator",
            description = "إضافة وتعديل السجلات وإجراء الفحص الجنائي وإصدار تصاريح التنقل واللجوء"
        ),
        RoleEntity(
            id = ROLE_INVESTIGATOR_ID,
            roleCode = "investigator",
            roleNameAr = "محقق",
            roleNameEn = "Investigator",
            description = "إضافة وتعديل بيانات المسافرين والمضبوطين بدون صلاحية الحذف"
        ),
        RoleEntity(
            id = ROLE_DATA_ENTRY_ID,
            roleCode = "data_entry",
            roleNameAr = "موظف إدخال",
            roleNameEn = "Data Entry",
            description = "إدخال واستيراد البيانات من الكشوفات وملفات Excel فقط"
        )
    )

    // 2. قائمة الصلاحيات الدقيقة (~80 صلاحية)
    val permissions = listOf(
        // المسافرون (passengers)
        PermissionEntity("p-01", "passengers.view", "عرض سجل المسافرين", "passengers", "view", null),
        PermissionEntity("p-02", "passengers.create", "إضافة مسافر جديد", "passengers", "create", null),
        PermissionEntity("p-03", "passengers.edit", "تعديل بيانات المسافر", "passengers", "edit", null),
        PermissionEntity("p-04", "passengers.delete", "حذف سجل مسافر", "passengers", "delete", null),
        PermissionEntity("p-05", "passengers.export", "تصدير كشف المسافرين", "passengers", "export", null),

        // اللاجئون (refugees)
        PermissionEntity("p-06", "refugees.view", "عرض سجل اللاجئين", "refugees", "view", null),
        PermissionEntity("p-07", "refugees.create", "قيد لاجئ جديد", "refugees", "create", null),
        PermissionEntity("p-08", "refugees.edit", "تعديل بيانات اللاجئ", "refugees", "edit", null),
        PermissionEntity("p-09", "refugees.delete", "حذف قيد لاجئ", "refugees", "delete", null),
        PermissionEntity("p-10", "refugees.permit.issue", "إصدار بطاقة تصريح لجوء", "refugees", "permit.issue", null),
        PermissionEntity("p-11", "refugees.reject", "إصدار قرار رفض البقاء", "refugees", "reject", null),
        PermissionEntity("p-12", "refugees.criminal.view", "عرض السوابق الجنائية للاجئ", "refugees", "criminal.view", null),
        PermissionEntity("p-13", "refugees.criminal.edit", "قيد سوابق جنائية للاجئ", "refugees", "criminal.edit", null),
        PermissionEntity("p-14", "refugees.relatives.view", "عرض أقارب اللاجئ", "refugees", "relatives.view", null),
        PermissionEntity("p-15", "refugees.relatives.edit", "إضافة وتعديل أقارب اللاجئ", "refugees", "relatives.edit", null),

        // الوافدون الأجانب (foreigners)
        PermissionEntity("p-16", "foreigners.view", "عرض سجل الوافدين الأجانب", "foreigners", "view", null),
        PermissionEntity("p-17", "foreigners.create", "قيد وافد أجنبي جديد", "foreigners", "create", null),
        PermissionEntity("p-18", "foreigners.edit", "تعديل بيانات الوافد", "foreigners", "edit", null),
        PermissionEntity("p-19", "foreigners.delete", "حذف وافد", "foreigners", "delete", null),
        PermissionEntity("p-20", "foreigners.qualifications.view", "عرض مؤهلات وخبرات الوافد", "foreigners", "qualifications.view", null),

        // المهاجرون (migrants)
        PermissionEntity("p-21", "migrants.view", "عرض سجل المهاجرين غير الشرعيين", "migrants", "view", null),
        PermissionEntity("p-22", "migrants.create", "تسجيل مهاجر غير شرعي", "migrants", "create", null),
        PermissionEntity("p-23", "migrants.edit", "تعديل بيانات المهاجر", "migrants", "edit", null),
        PermissionEntity("p-24", "migrants.delete", "حذف قيد مهاجر", "migrants", "delete", null),
        PermissionEntity("p-25", "migrants.deport", "إصدار أمر ترحيل", "migrants", "deport", null),

        // محاضر الضبط (seizures)
        PermissionEntity("p-26", "seizures.view", "عرض محاضر الضبط والجوازات المحتجزة", "seizures", "view", null),
        PermissionEntity("p-27", "seizures.create", "تحرير محضر ضبط جديد", "seizures", "create", null),
        PermissionEntity("p-28", "seizures.edit", "تعديل محضر ضبط", "seizures", "edit", null),
        PermissionEntity("p-29", "seizures.delete", "إلغاء أو حذف محضر ضبط", "seizures", "delete", null),
        PermissionEntity("p-30", "seizures.release", "الموافقة على الإفراج عن الجواز", "seizures", "release", null),
        PermissionEntity("p-31", "seizures.ops.send", "إرسال الجوازات للعمليات والمطابقة", "seizures", "ops.send", null),
        PermissionEntity("p-32", "seizures.ops.reply", "تسجيل رد العمليات والفحص", "seizures", "ops.reply", null),
        PermissionEntity("p-33", "seizures.delivery.create", "تحرير سند تسليم جواز سفر", "seizures", "delivery.create", null),
        PermissionEntity("p-34", "seizures.export", "تصدير محاضر الضبط إلى Excel", "seizures", "export", null),

        // تصاريح التنقل (movement)
        PermissionEntity("p-35", "movement.view", "عرض تصاريح التنقل الداخلي", "movement", "view", null),
        PermissionEntity("p-36", "movement.create", "تقديم طلب تصريح تنقل", "movement", "create", null),
        PermissionEntity("p-37", "movement.edit", "تعديل تصريح تنقل", "movement", "edit", null),
        PermissionEntity("p-38", "movement.approve", "اعتماد والموافقة على خط السير", "movement", "approve", null),
        PermissionEntity("p-39", "movement.print", "طباعة تصريح التنقل الرسمي A4", "movement", "print", null),

        // التأشيرات (visas)
        PermissionEntity("p-40", "visas.view", "عرض سجل التأشيرات", "visas", "view", null),
        PermissionEntity("p-41", "visas.issue", "إصدار تأشيرة دخول", "visas", "issue", null),
        PermissionEntity("p-42", "visas.renew", "تجديد التأشيرة", "visas", "renew", null),
        PermissionEntity("p-43", "visas.cancel", "إلغاء التأشيرة", "visas", "cancel", null),

        // الإقامات (residency)
        PermissionEntity("p-44", "residency.view", "عرض سجل الإقامات", "residency", "view", null),
        PermissionEntity("p-45", "residency.issue", "إصدار إقامة لأول مرة", "residency", "issue", null),
        PermissionEntity("p-46", "residency.renew", "تجديد إقامة وافد", "residency", "renew", null),

        // أذون الدخول (entry_permits)
        PermissionEntity("p-47", "entry_permits.view", "عرض أذون الدخول", "entry_permits", "view", null),
        PermissionEntity("p-48", "entry_permits.issue", "منح إذن دخول مؤقت", "entry_permits", "issue", null),
        PermissionEntity("p-49", "entry_permits.renew", "تجديد إذن الدخول", "entry_permits", "renew", null),

        // تأشيرات اليمنيين (yemeni_visas)
        PermissionEntity("p-50", "yemeni_visas.view", "عرض تأشيرات اليمنيين بالخارج", "yemeni_visas", "view", null),
        PermissionEntity("p-51", "yemeni_visas.edit", "تسجيل وتحديث تأشيرات اليمنيين", "yemeni_visas", "edit", null),

        // المذكرات (memoranda)
        PermissionEntity("p-52", "memoranda.view", "عرض المذكرات والمراسلات الرسمية", "memoranda", "view", null),
        PermissionEntity("p-53", "memoranda.draft", "إنشاء مسودة مذكرة رسمية", "memoranda", "draft", null),
        PermissionEntity("p-54", "memoranda.send", "إرسال واعتماد المذكرة الرسمية", "memoranda", "send", null),
        PermissionEntity("p-55", "memoranda.receive", "تسجيل وارد مذكرة رسمية", "memoranda", "receive", null),

        // البرقيات (telegrams)
        PermissionEntity("p-56", "telegrams.view", "عرض البرقيات الأمنية", "telegrams", "view", null),
        PermissionEntity("p-57", "telegrams.create", "صياغة برقية رسمية بالقالب التلقائي", "telegrams", "create", null),
        PermissionEntity("p-58", "telegrams.send", "تعميم وإرسال البرقية للمنافذ", "telegrams", "send", null),

        // المنظمات (organizations)
        PermissionEntity("p-59", "organizations.view", "عرض المنظمات الدولية والبعثات", "organizations", "view", null),
        PermissionEntity("p-60", "organizations.edit", "تعديل وتحديث بيانات المنظمة", "organizations", "edit", null),

        // الجنسية والزواج (nationality & marriage)
        PermissionEntity("p-61", "nationality.view", "عرض طلبات اكتساب الجنسية", "nationality", "view", null),
        PermissionEntity("p-62", "nationality.approve", "الموافقة الأمنية على طلب الجنسية", "nationality", "approve", null),
        PermissionEntity("p-63", "marriage.view", "عرض طلبات الزواج من أجانب", "marriage", "view", null),
        PermissionEntity("p-64", "marriage.approve", "الموافقة الأمنية على الزواج المختلط", "marriage", "approve", null),

        // وثائق السفر (travel_docs)
        PermissionEntity("p-65", "travel_docs.view", "عرض وثائق السفر الخاصة", "travel_docs", "view", null),
        PermissionEntity("p-66", "travel_docs.issue", "إصدار وثائق سفر للأشقاء الفلسطينيين وأبناء اليمنيات", "travel_docs", "issue", null),
        PermissionEntity("p-67", "travel_docs.renew", "تجديد وثائق السفر", "travel_docs", "renew", null),

        // شركات الحج والعمرة (hajj)
        PermissionEntity("p-68", "hajj.view", "عرض سجل وكالات وشركات الحج", "hajj", "view", null),
        PermissionEntity("p-69", "hajj.license", "اعتماد ترخيص الوكالة", "hajj", "license", null),
        PermissionEntity("p-70", "hajj.suspend", "إيقاف أو تجميد وكالة مخالفة", "hajj", "suspend", null),
        PermissionEntity("p-71", "hajj.approve", "الموافقة على كشوفات التفويج", "hajj", "approve", null),

        // المنافذ (ports)
        PermissionEntity("p-72", "ports.view", "عرض بيانات المنافذ الـ 13", "ports", "view", null),
        PermissionEntity("p-73", "ports.edit", "تعديل إعدادات وبيانات المنفذ", "ports", "edit", null),

        // التقارير ولوحة القيادة (reports & dashboard)
        PermissionEntity("p-74", "reports.view", "عرض التقارير والإحصاءات", "reports", "view", null),
        PermissionEntity("p-75", "reports.export", "تصدير التقارير الإحصائية", "reports", "export", null),
        PermissionEntity("p-76", "reports.print", "طباعة التقارير", "reports", "print", null),
        PermissionEntity("p-77", "dashboard.view", "عرض لوحة القيادة والمؤشرات الميدانية", "dashboard", "view", null),

        // سجل التدقيق الأمني (audit)
        PermissionEntity("p-78", "audit.view", "عرض سجل العمليات التاريخي الكامل", "audit", "view", null),
        PermissionEntity("p-79", "audit.export", "تصدير سجل التدقيق للأجهزة الرقابية", "audit", "export", null),

        // إدارة المستخدمين (users)
        PermissionEntity("p-80", "users.view", "عرض قائمة المستخدمين والضباط", "users", "view", null),
        PermissionEntity("p-81", "users.create", "إضافة مستخدم أو ضابط جديد", "users", "create", null),
        PermissionEntity("p-82", "users.edit", "تعديل بيانات ورتب المستخدمين", "users", "edit", null),
        PermissionEntity("p-83", "users.delete", "تعطيل أو حذف حساب مستخدم", "users", "delete", null),
        PermissionEntity("p-84", "users.reset_password", "إعادة ضبط كلمة المرور للضباط", "users", "reset_password", null),

        // الأدوار والإعدادات والنسخ الاحتياطي (roles, settings, backup)
        PermissionEntity("p-85", "roles.view", "عرض مصفوفة الأدوار والصلاحيات", "roles", "view", null),
        PermissionEntity("p-86", "roles.edit", "تعديل صلاحيات الأدوار", "roles", "edit", null),
        PermissionEntity("p-87", "settings.view", "عرض إعدادات النظام السيادية", "settings", "view", null),
        PermissionEntity("p-88", "settings.edit", "تعديل إعدادات النظام", "settings", "edit", null),
        PermissionEntity("p-89", "backup.run", "تنفيذ نسخ احتياطي يدوي مشفر", "backup", "run", null),
        PermissionEntity("p-90", "backup.restore", "استعادة المنظومة من نسخة احتياطية", "backup", "restore", null),

        // قائمة المطلوبين (wanted)
        PermissionEntity("p-91", "wanted.view", "عرض القائمة السوداء والمطلوبين أمنياً", "wanted", "view", null),
        PermissionEntity("p-92", "wanted.add", "إدراج شخص في قائمة الممنوعين من السفر", "wanted", "add", null),
        PermissionEntity("p-93", "wanted.edit", "تعديل بيانات مطلوب أمني", "wanted", "edit", null),
        PermissionEntity("p-94", "wanted.delete", "رفع الحظر عن مسافر بقرار قضائي", "wanted", "delete", null),

        // خدمات وكتالوج SLA (services)
        PermissionEntity("p-95", "services.view", "عرض كتالوج الخدمات ومواقيت SLA", "services", "view", null),
        PermissionEntity("p-96", "services.manage", "تحديث المهل القانونية للخدمات", "services", "manage", null),

        // محرك Excel (excel)
        PermissionEntity("p-97", "excel.import", "استيراد الكشوفات عبر محرك Excel الذكي", "excel", "import", null),
        PermissionEntity("p-98", "excel.export", "تصدير البيانات المجدولة إلى ملف Excel", "excel", "export", null)
    )

    // 3. المستخدم الافتراضي (مدير عام المنظومة السيادية)
    val defaultAdminUser = UserEntity(
        id = "user-super-admin-root",
        username = "admin",
        passwordHash = PasswordHasher.hashPassword("Admin@Yemen2026!"),
        fullName = "اللواء / عبدالكريم يحيى المرتضى",
        militaryNumber = "MIL-77001",
        rank = "لواء",
        portId = null, // المركز الرئيسي
        department = "رئاسة المصلحة - القيادة والسيطرة العامة",
        phoneNumber = "777000111",
        isActive = true,
        isLocked = false,
        failedAttempts = 0
    )

    // 4. ربط المدير العام برول super_admin
    val adminUserRole = UserRoleCrossRef(
        userId = defaultAdminUser.id,
        roleId = ROLE_SUPER_ADMIN_ID
    )

    // 5. ربط الصلاحيات بالأدوار:
    // مدير عام يأخذ كافة الصلاحيات الـ 98
    val superAdminRolePermissions: List<RolePermissionCrossRef> = permissions.map {
        RolePermissionCrossRef(roleId = ROLE_SUPER_ADMIN_ID, permissionId = it.id)
    }

    // نائب مدير عام: كل شيء ما عدا إدارة المستخدمين والأدوار
    val deputyAdminRolePermissions: List<RolePermissionCrossRef> = permissions
        .filter { !it.module.equals("users") && !it.module.equals("roles") }
        .map { RolePermissionCrossRef(roleId = ROLE_DEPUTY_ADMIN_ID, permissionId = it.id) }

    // محقق أول: إضافة/تعديل/إصدار تصاريح بدون حذف المستخدمين
    val seniorInvestigatorPermissions: List<RolePermissionCrossRef> = permissions
        .filter {
            it.permissionCode in setOf(
                "passengers.view", "passengers.create", "passengers.edit",
                "seizures.view", "seizures.create", "seizures.edit", "seizures.ops.send", "seizures.ops.reply", "seizures.delivery.create", "seizures.export",
                "refugees.view", "refugees.create", "refugees.edit", "refugees.permit.issue", "refugees.criminal.view", "refugees.criminal.edit",
                "foreigners.view", "foreigners.create", "foreigners.edit", "foreigners.qualifications.view",
                "migrants.view", "migrants.create", "migrants.edit",
                "movement.view", "movement.create", "movement.edit", "movement.print",
                "visas.view", "residency.view", "wanted.view", "reports.view", "excel.import", "excel.export"
            )
        }
        .map { RolePermissionCrossRef(roleId = ROLE_SENIOR_INVESTIGATOR_ID, permissionId = it.id) }

    // موظف إدخال: قيد واستيراد Excel وعرض فقط
    val dataEntryPermissions: List<RolePermissionCrossRef> = permissions
        .filter {
            it.action == "view" || it.action == "create" || it.permissionCode == "excel.import"
        }
        .map { RolePermissionCrossRef(roleId = ROLE_DATA_ENTRY_ID, permissionId = it.id) }

    // 6. خدمات كتالوج وزارة الداخلية الـ 15 الرسمية (SLA Catalog)
    val slaPolicies = listOf(
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 1, serviceCode = "NAT-01", serviceName = "زواج يمني من أجنبية", department = "الإدارة العامة للجنسية", targetDays = 20
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 2, serviceCode = "NAT-02", serviceName = "زواج أجنبي من يمنية", department = "الإدارة العامة للجنسية", targetDays = 20
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 3, serviceCode = "NAT-03", serviceName = "طلب اكتساب الجنسية لزوجة يمني", department = "الإدارة العامة للجنسية", targetDays = 20
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 4, serviceCode = "NAT-04", serviceName = "طلب الجنسية بأمر جمهوري", department = "الإدارة العامة للجنسية", targetDays = 30
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 5, serviceCode = "NAT-05", serviceName = "طلب إذن اكتساب جنسية أجنبية", department = "الإدارة العامة للجنسية", targetDays = 20
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 6, serviceCode = "FOR-01", serviceName = "طلب تأشيرة دخول", department = "الإدارة العامة لشؤون العرب والأجانب", targetDays = 7
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 7, serviceCode = "FOR-02", serviceName = "طلب إقامة لأول مرة", department = "الإدارة العامة لشؤون العرب والأجانب", targetDays = 7
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 8, serviceCode = "FOR-03", serviceName = "تجديد إقامة", department = "الإدارة العامة لشؤون العرب والأجانب", targetDays = 3
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 9, serviceCode = "FOR-04", serviceName = "طلب إذن دخول لأول مرة", department = "الإدارة العامة لشؤون العرب والأجانب", targetDays = 7
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 10, serviceCode = "FOR-05", serviceName = "تجديد إذن دخول", department = "الإدارة العامة لشؤون العرب والأجانب", targetDays = 3
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 11, serviceCode = "REF-01", serviceName = "تسجيل طلب لجوء", department = "الإدارة العامة لشؤون اللاجئين", targetDays = 3
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 12, serviceCode = "REF-02", serviceName = "تجديد طلب لجوء", department = "الإدارة العامة لشؤون اللاجئين", targetDays = 3
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 13, serviceCode = "DOC-01", serviceName = "طلب وثائق سفر للإخوة الفلسطينيين", department = "الإدارة العامة لوثائق السفر", targetDays = 3
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 14, serviceCode = "DOC-02", serviceName = "تجديد وثائق السفر للفلسطينيين", department = "الإدارة العامة لوثائق السفر", targetDays = 3
        ),
        com.yemen.portssecurity.data.local.entities.SlaPolicyEntity(
            id = 15, serviceCode = "DOC-03", serviceName = "منح جوازات سفر لأبناء اليمنيات", department = "الإدارة العامة لوثائق السفر", targetDays = 3
        )
    )
}
