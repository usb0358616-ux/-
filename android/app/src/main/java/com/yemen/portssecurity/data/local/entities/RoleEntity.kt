package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * جدول الأدوار العسكرية والإدارية السبعة
 */
@Entity(
    tableName = "roles",
    indices = [Index(value = ["role_code"], unique = true)]
)
data class RoleEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String, // UUID

    @ColumnInfo(name = "role_code")
    val roleCode: String, // super_admin, deputy_admin, department_manager, section_head, senior_investigator, investigator, data_entry

    @ColumnInfo(name = "role_name_ar")
    val roleNameAr: String, // اسم الدور بالعربية (مدير عام، نائب مدير عام...)

    @ColumnInfo(name = "role_name_en")
    val roleNameEn: String,

    @ColumnInfo(name = "description")
    val description: String?,

    @ColumnInfo(name = "is_system_role")
    val isSystemRole: Boolean = true, // دور قياسي لا يمكن حذفه

    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)
