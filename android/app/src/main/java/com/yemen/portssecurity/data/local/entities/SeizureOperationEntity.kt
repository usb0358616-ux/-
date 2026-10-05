package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * جدول دورة العمليات والإحالة للمطابقة والردود الرسمية (Workflow)
 */
@Entity(
    tableName = "seizure_operations",
    foreignKeys = [
        ForeignKey(
            entity = SeizureRecordEntity::class,
            parentColumns = ["id"],
            childColumns = ["seizure_record_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["seizure_record_id"])]
)
data class SeizureOperationEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String, // UUID

    @ColumnInfo(name = "seizure_record_id")
    val seizureRecordId: String,

    @ColumnInfo(name = "operation_type")
    val operationType: String, // إرسال للعمليات، ورود رد، إحالة للنيابة، تدقيق فني...

    @ColumnInfo(name = "letter_number")
    val letterNumber: String, // رقم المذكرة أو البرقية

    @ColumnInfo(name = "letter_date")
    val letterDate: Long, // تاريخ المذكرة

    @ColumnInfo(name = "recipient_entity")
    val recipientEntity: String, // الجهة المستلمة أو المرسلة

    @ColumnInfo(name = "security_findings")
    val securityFindings: String, // نتائج المباينة والتدقيق الجنائي

    @ColumnInfo(name = "officer_in_charge")
    val officerInCharge: String,

    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)
