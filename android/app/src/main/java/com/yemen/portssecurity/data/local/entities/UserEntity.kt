package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * جدول المستخدمين والضباط في المنظومة الأمنية
 */
@Entity(
    tableName = "users",
    indices = [
        Index(value = ["username"], unique = true),
        Index(value = ["military_number"], unique = true),
        Index(value = ["port_id"])
    ]
)
data class UserEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String, // UUID

    @ColumnInfo(name = "username")
    val username: String, // اسم المستخدم

    @ColumnInfo(name = "password_hash")
    val passwordHash: String, // كلمة المرور المشفرة بـ BCrypt

    @ColumnInfo(name = "full_name")
    val fullName: String, // الاسم الرباعي واللقب

    @ColumnInfo(name = "military_number")
    val militaryNumber: String, // الرقم العسكري

    @ColumnInfo(name = "rank")
    val rank: String, // الرتبة العسكرية (جندي، رقيب، ملازم، نقيب، رائد، مقدم، عقيد، عميد، لواء)

    @ColumnInfo(name = "port_id")
    val portId: String?, // المنفذ المخصص له (nullable للمركز الرئيسي)

    @ColumnInfo(name = "department")
    val department: String, // الإدارة أو القسم

    @ColumnInfo(name = "phone_number")
    val phoneNumber: String?,

    @ColumnInfo(name = "is_active")
    val isActive: Boolean = true, // مفعل أو معطل

    @ColumnInfo(name = "is_locked")
    val isLocked: Boolean = false, // مجمد لتكرار الأخطاء

    @ColumnInfo(name = "failed_attempts")
    val failedAttempts: Int = 0, // عدد المحاولات الفاشلة

    @ColumnInfo(name = "last_login_at")
    val lastLoginAt: Long? = null,

    @ColumnInfo(name = "password_changed_at")
    val passwordChangedAt: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
)
