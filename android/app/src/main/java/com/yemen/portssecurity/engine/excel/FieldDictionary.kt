package com.yemen.portssecurity.engine.excel

/**
 * المكون 1: قاموس المرادفات والمصطلحات الرسمية لأعمدة ملفات Excel بالمنافذ والجوازات
 */
object FieldDictionary {

    enum class StandardField(val displayNameAr: String, val isRequired: Boolean) {
        PASSPORT_NUMBER("رقم الجواز", true),
        FULL_NAME_AR("الاسم بالعربية", true),
        FULL_NAME_EN("الاسم بالإنجليزية", false),
        NATIONALITY("الجنسية", true),
        PROFESSION("المهنة / الوظيفة", false),
        EMPLOYER("جهة العمل / المنظمة", false),
        BIRTH_DATE("تاريخ الميلاد", false),
        BIRTH_PLACE("مكان الميلاد", false),
        GENDER("الجنس", false),
        NATIONAL_ID("الرقم الوطني", false),
        PHONE("رقم الهاتف", false),
        BLOOD_TYPE("فصيلة الدم", false),
        ISSUE_DATE("تاريخ إصدار الجواز", false),
        EXPIRY_DATE("تاريخ انتهاء الجواز", false),
        ISSUING_AUTHORITY("جهة إصدار الجواز", false),
        ENTRY_DATE("تاريخ الدخول / الوارد", false),
        SECURITY_RESULT("نتائج الفحص / المباينة", false),
        REQUEST_TYPE("نوع الطلب", false),
        REPORT_NUMBER("رقم محضر الضبط", false),
        PORT_NAME("اسم المنفذ", false),
        VEHICLE_TYPE("نوع المركبة", false),
        PLATE_NUMBER("رقم اللوحة", false),
        DRIVER_NAME("اسم السائق", false),
        NOTES("ملاحظات", false)
    }

    val SYNONYMS_MAP: Map<StandardField, List<String>> = mapOf(
        StandardField.PASSPORT_NUMBER to listOf(
            "رقم الجواز", "رقم جواز السفر", "رقم الباسبور", "الجواز", "الرقم",
            "passport number", "passport no", "passport", "pass_no", "passno"
        ),
        StandardField.FULL_NAME_AR to listOf(
            "الاسم", "الاسم عربي", "الاسم الرباعي", "اسم العامل", "الاسم الكامل",
            "الإسم عربي", "اسم المسافر", "اسم المهاجر", "صاحب الجواز", "الاسم الثلاثي"
        ),
        StandardField.FULL_NAME_EN to listOf(
            "الاسم إنجليزي", "الاسم بالإنجليزية", "name", "full name", "english name", "passenger name"
        ),
        StandardField.NATIONALITY to listOf(
            "الجنسية", "nationality", "national", "البلد", "الدولة"
        ),
        StandardField.PROFESSION to listOf(
            "المهنة", "المسمى الوظيفي", "profession", "job title", "occupation", "الوظيفة"
        ),
        StandardField.EMPLOYER to listOf(
            "جهة العمل", "المنظمة", "employer", "company", "الشركة", "الكفيل", "الجهة الضامنة"
        ),
        StandardField.BIRTH_DATE to listOf(
            "تاريخ الميلاد", "date of birth", "dob", "الميلاد"
        ),
        StandardField.BIRTH_PLACE to listOf(
            "مكان الميلاد", "place of birth", "محل الميلاد"
        ),
        StandardField.GENDER to listOf(
            "الجنس", "النوع", "gender", "sex"
        ),
        StandardField.NATIONAL_ID to listOf(
            "الرقم الوطني", "national id", "الرقم الآلي", "البطاقة الشخصية", "الهوية"
        ),
        StandardField.PHONE to listOf(
            "رقم الهاتف", "الجوال", "phone", "mobile", "الهاتف", "التلفون"
        ),
        StandardField.BLOOD_TYPE to listOf(
            "فصيلة الدم", "blood type", "blood group", "الفصيلة"
        ),
        StandardField.ISSUE_DATE to listOf(
            "تاريخ اصدار الجواز", "تاريخ الإصدار", "issue date", "تاريخ الاصدار"
        ),
        StandardField.EXPIRY_DATE to listOf(
            "تاريخ انتهاء الجواز", "تاريخ الانتهاء", "expiry date", "صلاحية الجواز"
        ),
        StandardField.ISSUING_AUTHORITY to listOf(
            "جهة اصدار الجواز", "جهة الإصدار", "issuing authority", "مكان الإصدار", "الفرع"
        ),
        StandardField.ENTRY_DATE to listOf(
            "تاريخ الوارد", "تاريخ الدخول", "entry date", "تاريخ الوصول"
        ),
        StandardField.SECURITY_RESULT to listOf(
            "نتائج المباينة", "النتيجة", "نتائج الفحص", "المباينة", "القرار الأمني", "الحالة الأمنية"
        ),
        StandardField.REQUEST_TYPE to listOf(
            "نوع الطلب", "الطلب", "request type", "نوع المعاملة"
        ),
        StandardField.REPORT_NUMBER to listOf(
            "رقم محضر الضبط", "رقم المحضر", "report number", "المحضر", "رقم القيد"
        ),
        StandardField.PORT_NAME to listOf(
            "اسم المنفذ", "المنفذ", "منفذ الضبط", "port", "port name"
        ),
        StandardField.VEHICLE_TYPE to listOf(
            "نوع السيارة", "نوع المركبة", "vehicle type", "السيارة"
        ),
        StandardField.PLATE_NUMBER to listOf(
            "رقم اللوحة", "plate number", "اللوحة", "رقم السيارة"
        ),
        StandardField.DRIVER_NAME to listOf(
            "اسم السائق", "السائق", "driver", "driver name"
        ),
        StandardField.NOTES to listOf(
            "ملاحظات", "ملاحظة", "notes", "البيان", "حيثيات"
        )
    )
}
