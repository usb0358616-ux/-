package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * فرع استخبارات الشرطة — كيان طلبات التحري والاستخبارات
 * الحقول السيادية: رقم القيد (1917/المرجع)، رقم التحقيق (1191)، الجهة الطالبة،
 * نوع الطلب (فحص/تحرٍ/توقيف)، النتيجة، تاريخ الرد، مستوى الخطورة.
 */
@Entity(tableName = "police_intelligence_requests")
data class PoliceIntelligenceEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "entry_number")
    val entryNumber: String, // رقم القيد: 1917/المرجع

    @ColumnInfo(name = "investigation_number")
    val investigationNumber: String, // رقم التحقيق: 1191

    @ColumnInfo(name = "requesting_party")
    val requestingParty: String, // الجهة الطالبة

    @ColumnInfo(name = "request_type")
    val requestType: String, // فحص أمني / تحرٍ / توقيف / متابعة

    @ColumnInfo(name = "subject_name")
    val subjectName: String, // اسم الشخص المطلوب التحري عنه

    @ColumnInfo(name = "passport_or_id_number")
    val passportOrIdNumber: String? = null,

    @ColumnInfo(name = "nationality")
    val nationality: String = "يمني",

    @ColumnInfo(name = "request_date")
    val requestDate: String, // تاريخ الطلب

    @ColumnInfo(name = "response_date")
    val responseDate: String? = null, // تاريخ الرد

    @ColumnInfo(name = "result")
    val result: String = "قيد الإجراء", // النتيجة: معتمد وسليم / مطلوب توقيف / مؤجل للتدقيق

    @ColumnInfo(name = "threat_level")
    val threatLevel: String = "عادي", // عادي / متوسط / عالي الخطورة

    @ColumnInfo(name = "sla_days")
    val slaDays: Int = 3, // SLA الرد الأمني: 3 أيام

    @ColumnInfo(name = "officer_in_charge")
    val officerInCharge: String,

    @ColumnInfo(name = "notes")
    val notes: String? = null,

    @ColumnInfo(name = "created_at")
    val createdAt: String
)
