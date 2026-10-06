package com.yemen.portssecurity.data.repository

import com.yemen.portssecurity.data.local.AppDatabase
import com.yemen.portssecurity.data.local.entities.*
import kotlinx.coroutines.flow.Flow
import java.text.SimpleDateFormat
import java.util.*

/**
 * المستودع المركزي الشامل للمنظومة السيادية (SovereignSystemRepository)
 * يجمع كافة الخدمات والعمليات المشتركة المستخلصة من المشاريع الثلاثة
 */
class SovereignSystemRepository(private val database: AppDatabase) {

    // 1. فرع استخبارات الشرطة (1191/1917)
    fun getAllIntelligenceRequests(): Flow<List<PoliceIntelligenceEntity>> =
        database.policeIntelligenceDao().getAllRequests()

    suspend fun insertIntelligenceRequest(request: PoliceIntelligenceEntity): Long =
        database.policeIntelligenceDao().insert(request)

    // 2. المكاتبات الرسمية والقوالب السيادية
    fun getAllCorrespondence(): Flow<List<OfficialCorrespondenceEntity>> =
        database.officialCorrespondenceDao().getAllCorrespondence()

    suspend fun insertCorrespondence(item: OfficialCorrespondenceEntity): Long =
        database.officialCorrespondenceDao().insert(item)

    // 3. الرقابة على الشركات والوكالات الخمس
    fun getAllMonitoredCompanies(): Flow<List<MonitoredCompanyEntity>> =
        database.monitoredCompanyDao().getAllCompanies()

    suspend fun insertMonitoredCompany(company: MonitoredCompanyEntity): Long =
        database.monitoredCompanyDao().insertCompany(company)

    fun getViolationsForCompany(companyId: Long): Flow<List<CompanyViolationEntity>> =
        database.monitoredCompanyDao().getViolationsForCompany(companyId)

    suspend fun insertCompanyViolation(violation: CompanyViolationEntity): Long =
        database.monitoredCompanyDao().insertViolation(violation)

    // 4. كتالوج SLA للـ 15 خدمة إلزامية وتتبع المدد
    fun getAllActiveSlaPolicies(): Flow<List<SlaPolicyEntity>> =
        database.slaPolicyDao().getAllActivePolicies()

    fun getAllClearanceRequests(): Flow<List<SecurityClearanceEntity>> =
        database.slaPolicyDao().getAllClearanceRequests()

    suspend fun insertClearanceRequest(clearance: SecurityClearanceEntity): Long =
        database.slaPolicyDao().insertClearance(clearance)

    // 5. الخط الزمني لحركة الجوازات والوثائق (من مشروع مكتب المعلومات والبيانات)
    fun getTimelineForPassport(passportNumber: String): Flow<List<PassportTimelineEntity>> =
        database.passportTimelineDao().getTimelineForPassport(passportNumber)

    suspend fun logPassportTimelineEvent(
        passportNumber: String,
        eventTitle: String,
        details: String?,
        officer: String,
        statusTag: String
    ): Long {
        val now = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date())
        val event = PassportTimelineEntity(
            passportNumber = passportNumber,
            eventDate = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date()),
            eventTitle = eventTitle,
            details = details,
            officer = officer,
            statusTag = statusTag,
            createdAt = now
        )
        return database.passportTimelineDao().insertEvent(event)
    }

    // 6. وحدة المطور والتخصيص الديناميكي (Unit 14 - Metadata Engine)
    fun getDynamicFieldsForEntity(entityType: String): Flow<List<FieldDefinitionEntity>> =
        database.developerMetadataDao().getFieldsForEntity(entityType)

    suspend fun addCustomField(field: FieldDefinitionEntity): Long =
        database.developerMetadataDao().insertField(field)

    fun getCustomValuesForRecord(entityType: String, entityId: String): Flow<List<CustomFieldValueEntity>> =
        database.developerMetadataDao().getCustomValuesForRecord(entityType, entityId)

    suspend fun saveCustomValue(value: CustomFieldValueEntity): Long =
        database.developerMetadataDao().insertOrUpdateCustomValue(value)

    fun getAllLabelOverrides(): Flow<List<LabelOverrideEntity>> =
        database.developerMetadataDao().getAllLabelOverrides()

    suspend fun addLabelOverride(override: LabelOverrideEntity): Long =
        database.developerMetadataDao().insertLabelOverride(override)

    fun getDropdownValues(listCode: String): Flow<List<ListValueEntity>> =
        database.developerMetadataDao().getListValues(listCode)

    suspend fun generateNextAutoNumber(entityType: String, fieldKey: String, user: String = "الضابط"): String? {
        val rule = database.developerMetadataDao().getRuleForField(entityType, fieldKey) ?: return null
        val nextCounter = rule.currentCounter + 1
        val yyyy = SimpleDateFormat("yyyy", Locale.US).format(Date())
        val seqStr = String.format("%0${rule.counterPadding}d", nextCounter)
        
        val evaluated = rule.rulePattern
            .replace("{YYYY}", yyyy)
            .replace("{NNNNN}", seqStr)
            .replace("{NNNN}", seqStr)
            .replace("{USER}", user)

        // Increment counter
        database.developerMetadataDao().updateAutoFieldRule(rule.copy(currentCounter = nextCounter))
        return evaluated
    }
}
