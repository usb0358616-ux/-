package com.yemen.portssecurity.data.repository

import com.yemen.portssecurity.core.session.SessionManager
import com.yemen.portssecurity.data.local.dao.AuditLogDao
import com.yemen.portssecurity.data.local.dao.SeizureDao
import com.yemen.portssecurity.data.local.entities.AuditLogEntity
import com.yemen.portssecurity.data.local.entities.SeizedPassportEntity
import com.yemen.portssecurity.data.local.entities.SeizureDeliveryEntity
import com.yemen.portssecurity.data.local.entities.SeizureOperationEntity
import com.yemen.portssecurity.data.local.entities.SeizureRecordEntity
import kotlinx.coroutines.flow.Flow
import java.util.UUID

/**
 * مستودع إدارة محاضر الضبط ودورة العمليات والتسليم مع التوثيق في سجل التدقيق
 */
class SeizureRepository(
    private val seizureDao: SeizureDao,
    private val auditLogDao: AuditLogDao
) {

    fun getAllSeizureRecords(): Flow<List<SeizureRecordEntity>> = seizureDao.getAllSeizureRecordsFlow()

    suspend fun getSeizureRecordById(id: String): SeizureRecordEntity? = seizureDao.getSeizureRecordById(id)

    fun getPassportsForRecord(recordId: String): Flow<List<SeizedPassportEntity>> =
        seizureDao.getPassportsForRecordFlow(recordId)

    fun getOperationsForRecord(recordId: String): Flow<List<SeizureOperationEntity>> =
        seizureDao.getOperationsForRecordFlow(recordId)

    suspend fun createSeizureRecord(record: SeizureRecordEntity, passports: List<SeizedPassportEntity>) {
        seizureDao.insertSeizureRecord(record)
        if (passports.isNotEmpty()) {
            seizureDao.insertSeizedPassports(passports)
        }
        recordAudit(
            action = "CREATE_SEIZURE",
            recordId = record.id,
            description = "تحرير محضر ضبط برقم: ${record.recordNumber} في منفذ: ${record.portName} (عدد الجوازات: ${passports.size})"
        )
    }

    suspend fun addPassportToSeizure(passport: SeizedPassportEntity) {
        seizureDao.insertSeizedPassport(passport)
        recordAudit(
            action = "ADD_SEIZED_PASSPORT",
            recordId = passport.id,
            description = "إضافة جواز محتجز رقم: ${passport.passportNumber} للمدعو: ${passport.fullNameAr}"
        )
    }

    suspend fun addOperation(operation: SeizureOperationEntity) {
        seizureDao.insertOperation(operation)
        recordAudit(
            action = "SEIZURE_OPERATION",
            recordId = operation.id,
            description = "قيد حركة عملية للمحضر: ${operation.operationType} - مذكرة رقم: ${operation.letterNumber}"
        )
    }

    suspend fun deliverPassport(passportId: String, delivery: SeizureDeliveryEntity) {
        seizureDao.markPassportDelivered(passportId, delivery)
        recordAudit(
            action = "PASSPORT_DELIVERY",
            recordId = delivery.id,
            description = "تسليم جواز سفر بموجب السند: ${delivery.receiptNumber} إلى: ${delivery.receivedByName}"
        )
    }

    private suspend fun recordAudit(action: String, recordId: String, description: String) {
        try {
            auditLogDao.insertLog(
                AuditLogEntity(
                    id = UUID.randomUUID().toString(),
                    userId = SessionManager.getUserId() ?: "SYSTEM",
                    username = SessionManager.getUsername(),
                    militaryNumber = null,
                    action = action,
                    module = "SEIZURES",
                    recordId = recordId,
                    description = description
                )
            )
        } catch (_: Exception) {}
    }
}
