package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * جدول الصلاحيات الدقيقة (~80 صلاحية بتنسيق module.action)
 */
@Entity(
    tableName = "permissions",
    indices = [
        Index(value = ["permission_code"], unique = true),
        Index(value = ["module"])
    ]
)
data class PermissionEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String, // UUID

    @ColumnInfo(name = "permission_code")
    val permissionCode: String, // e.g. "seizures.create", "passengers.view"

    @ColumnInfo(name = "permission_name_ar")
    val permissionNameAr: String,

    @ColumnInfo(name = "module")
    val module: String, // اسم الوحدة (passengers, seizures, refugees, etc.)

    @ColumnInfo(name = "action")
    val action: String, // الإجراء (view, create, edit, delete, export, etc.)

    @ColumnInfo(name = "description")
    val description: String?
)
