package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * سياسات واتفاقيات مستوى الخدمة (SLA) الرسمية - وزارة الداخلية
 * 15 خدمة إلزامية:
 * 1-5 الإدارة العامة للجنسية
 * 6-10 الإدارة العامة لشؤون العرب والأجانب
 * 11-12 الإدارة العامة لشؤون اللاجئين
 * 13-15 الإدارة العامة لوثائق السفر
 */
@Entity(tableName = "sla_policies")
data class SlaPolicyEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "service_code")
    val serviceCode: String,

    @ColumnInfo(name = "service_name")
    val serviceName: String,

    @ColumnInfo(name = "department")
    val department: String,

    @ColumnInfo(name = "target_days")
    val targetDays: Int, // عدد الأيام القانوني المحدد باللائحة

    @ColumnInfo(name = "description")
    val description: String? = null,

    @ColumnInfo(name = "is_active")
    val isActive: Boolean = true
)

/**
 * طلبات الموافقات الأمنية وتتبع مدة الإنجاز الفعلية وفق SLA
 */
@Entity(tableName = "security_clearance_requests")
data class SecurityClearanceEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "transaction_number")
    val transactionNumber: String,

    @ColumnInfo(name = "applicant_name")
    val applicantName: String,

    @ColumnInfo(name = "passport_or_id_number")
    val passportOrIdNumber: String,

    @ColumnInfo(name = "nationality")
    val nationality: String = "يمني",

    @ColumnInfo(name = "department")
    val department: String,

    @ColumnInfo(name = "service_type")
    val serviceType: String,

    @ColumnInfo(name = "target_days")
    val targetDays: Int,

    @ColumnInfo(name = "submission_date")
    val submissionDate: String,

    @ColumnInfo(name = "completion_date")
    val completionDate: String? = null,

    @ColumnInfo(name = "status")
    val status: String = "قيد الدراسة", // قيد الدراسة / معتمد ومكتمل / مرفوض

    @ColumnInfo(name = "days_elapsed")
    val daysElapsed: Int = 0,

    @ColumnInfo(name = "is_overdue")
    val isOverdue: Boolean = false,

    @ColumnInfo(name = "officer_name")
    val officerName: String,

    @ColumnInfo(name = "notes")
    val notes: String? = null
)
