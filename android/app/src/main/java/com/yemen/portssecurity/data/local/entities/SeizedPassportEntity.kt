package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * جدول الجوازات المحتجزة والمضبوطة الفردية
 */
@Entity(
    tableName = "seized_passports",
    foreignKeys = [
        ForeignKey(
            entity = SeizureRecordEntity::class,
            parentColumns = ["id"],
            childColumns = ["seizure_record_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["seizure_record_id"]),
        Index(value = ["passport_number"]),
        Index(value = ["national_id"]),
        Index(value = ["full_name_ar"])
    ]
)
data class SeizedPassportEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String, // UUID

    @ColumnInfo(name = "seizure_record_id")
    val seizureRecordId: String, // ربط برأس المحضر

    @ColumnInfo(name = "passport_number")
    val passportNumber: String, // رقم الجواز المضبوط

    @ColumnInfo(name = "full_name_ar")
    val fullNameAr: String, // الاسم بالعربية

    @ColumnInfo(name = "full_name_en")
    val fullNameEn: String? = null, // الاسم بالإنجليزية

    @ColumnInfo(name = "national_id")
    val nationalId: String? = null, // الرقم الوطني

    @ColumnInfo(name = "nationality")
    val nationality: String = "يمني", // الجنسية

    @ColumnInfo(name = "profession")
    val profession: String? = null, // المهنة

    @ColumnInfo(name = "employer")
    val employer: String? = null, // جهة العمل أو المنظمة

    @ColumnInfo(name = "birth_date")
    val birthDate: String? = null, // تاريخ الميلاد

    @ColumnInfo(name = "birth_place")
    val birthPlace: String? = null,

    @ColumnInfo(name = "gender")
    val gender: String = "ذكر",

    @ColumnInfo(name = "issue_date")
    val issueDate: String? = null,

    @ColumnInfo(name = "expiry_date")
    val expiryDate: String? = null,

    @ColumnInfo(name = "issuing_authority")
    val issuingAuthority: String? = null, // جهة الإصدار (صنعاء، عدن، المكلا...)

    @ColumnInfo(name = "security_result")
    val securityResult: String? = "قيد الفحص", // سليم، مطلوب أمنياً، تزوير مؤكد...

    @ColumnInfo(name = "is_delivered")
    val isDelivered: Boolean = false, // هل تم تسليمه لصاحبه؟

    @ColumnInfo(name = "notes")
    val notes: String? = null,

    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)
