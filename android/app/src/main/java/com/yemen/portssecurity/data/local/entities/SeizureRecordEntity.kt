package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * جدول رؤوس محاضر الضبط بالمنافذ والنقاط الأمنية
 */
@Entity(
    tableName = "seizure_records",
    indices = [
        Index(value = ["record_number"], unique = true),
        Index(value = ["port_id"]),
        Index(value = ["seizure_date"]),
        Index(value = ["status"])
    ]
)
data class SeizureRecordEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String, // UUID

    @ColumnInfo(name = "record_number")
    val recordNumber: String, // رقم المحضر الرسمي (مثال: 512/و/2026)

    @ColumnInfo(name = "port_id")
    val portId: String, // المنفذ (الوديعة، شحن، مطار عدن...)

    @ColumnInfo(name = "port_name")
    val portName: String,

    @ColumnInfo(name = "port_type")
    val portType: String, // بري، بحري، جوي

    @ColumnInfo(name = "seizure_date")
    val seizureDate: Long, // تاريخ الضبط

    @ColumnInfo(name = "seizure_time")
    val seizureTime: String, // وقت الضبط

    @ColumnInfo(name = "officer_name")
    val officerName: String, // اسم الضابط المحرر للمحضر

    @ColumnInfo(name = "officer_rank")
    val officerRank: String, // رتبة الضابط

    @ColumnInfo(name = "authority")
    val authority: String, // الجهة الضابطة (إدارة جوازات المنفذ، أمن المنفذ...)

    @ColumnInfo(name = "violation_type")
    val violationType: String, // اشتباه تزوير، انتهاء صلاحية، إدراج بقائمة المنع...

    @ColumnInfo(name = "violation_description")
    val violationDescription: String, // شرح المخالفة وحيثيات الضبط

    @ColumnInfo(name = "source_of_seizure")
    val sourceOfSeizure: String, // كبينة التدقيق، صالة القدوم، نقطة التفتيش

    @ColumnInfo(name = "vehicle_type")
    val vehicleType: String? = null, // نوع السيارة في المنافذ البرية

    @ColumnInfo(name = "plate_number")
    val plateNumber: String? = null, // رقم اللوحة

    @ColumnInfo(name = "driver_name")
    val driverName: String? = null, // اسم السائق

    @ColumnInfo(name = "passport_count")
    val passportCount: Int = 1, // إجمالي عدد الجوازات المحتجزة في هذا المحضر

    @ColumnInfo(name = "status")
    val status: String = "قيد التدقيق", // قيد التدقيق، محال للعمليات، سليم، مصادر، تم التسليم

    @ColumnInfo(name = "notes")
    val notes: String? = null,

    @ColumnInfo(name = "created_by_user_id")
    val createdByUserId: String,

    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
)
