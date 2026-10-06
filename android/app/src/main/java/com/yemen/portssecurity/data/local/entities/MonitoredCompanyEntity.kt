package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * الشركات الخاضعة للرقابة الأمنية:
 * شركات الحج والعمرة، شركات الصرافة، شركات السفر والسياحة، وكالات التوظيف، شركات التأمين.
 */
@Entity(tableName = "monitored_companies")
data class MonitoredCompanyEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "company_code")
    val companyCode: String,

    @ColumnInfo(name = "name")
    val name: String,

    @ColumnInfo(name = "commercial_register")
    val commercialRegister: String,

    @ColumnInfo(name = "category")
    val category: String, // شركات الحج والعمرة / شركات الصرافة / شركات السفر والسياحة / وكالات التوظيف / شركات التأمين

    @ColumnInfo(name = "license_number")
    val licenseNumber: String,

    @ColumnInfo(name = "license_expiry_date")
    val licenseExpiryDate: String,

    @ColumnInfo(name = "owner_name")
    val ownerName: String,

    @ColumnInfo(name = "manager_name")
    val managerName: String,

    @ColumnInfo(name = "phone")
    val phone: String,

    @ColumnInfo(name = "governorate")
    val governorate: String,

    @ColumnInfo(name = "address")
    val address: String,

    @ColumnInfo(name = "security_status")
    val securityStatus: String, // مسموح ومعتمد / موقوف مؤقتاً / محظور أمنياً

    @ColumnInfo(name = "status_decision_number")
    val statusDecisionNumber: String? = null,

    @ColumnInfo(name = "status_decision_date")
    val statusDecisionDate: String? = null,

    @ColumnInfo(name = "notes")
    val notes: String? = null,

    @ColumnInfo(name = "created_at")
    val createdAt: String
)

/**
 * سجل مخالفات الشركات الخاضعة للرقابة
 */
@Entity(
    tableName = "company_violations",
    foreignKeys = [
        ForeignKey(
            entity = MonitoredCompanyEntity::class,
            parentColumns = ["id"],
            childColumns = ["company_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["company_id"])]
)
data class CompanyViolationEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "company_id")
    val companyId: Long,

    @ColumnInfo(name = "violation_date")
    val violationDate: String,

    @ColumnInfo(name = "violation_type")
    val violationType: String,

    @ColumnInfo(name = "decision_number")
    val decisionNumber: String,

    @ColumnInfo(name = "decision_date")
    val decisionDate: String,

    @ColumnInfo(name = "action_taken")
    val actionTaken: String, // إيقاف مؤقت / غرامة مالية / إحالة للنيابة / سحب ترخيص

    @ColumnInfo(name = "officer_name")
    val officerName: String,

    @ColumnInfo(name = "notes")
    val notes: String? = null
)
