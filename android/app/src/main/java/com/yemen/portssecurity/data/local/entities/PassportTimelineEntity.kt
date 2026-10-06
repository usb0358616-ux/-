package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * سجل الخط الزمني والمسار الإجرائي للجوازات والوثائق
 * منقول ومطور عن نظام مكتب المعلومات والبيانات
 */
@Entity(tableName = "passport_timeline")
data class PassportTimelineEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "passport_number")
    val passportNumber: String,

    @ColumnInfo(name = "event_date")
    val eventDate: String,

    @ColumnInfo(name = "event_title")
    val eventTitle: String,

    @ColumnInfo(name = "details")
    val details: String? = null,

    @ColumnInfo(name = "officer")
    val officer: String,

    @ColumnInfo(name = "status_tag")
    val statusTag: String, // جديد / بانتظار الفحص / تم الفحص / سليم / محال / جاهز للتسليم / تم التسليم

    @ColumnInfo(name = "created_at")
    val createdAt: String
)
