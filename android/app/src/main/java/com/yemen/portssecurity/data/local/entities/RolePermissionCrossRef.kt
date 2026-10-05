package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index

/**
 * جدول ربط الأدوار بالصلاحيات (Many-to-Many)
 */
@Entity(
    tableName = "role_permissions",
    primaryKeys = ["role_id", "permission_id"],
    foreignKeys = [
        ForeignKey(
            entity = RoleEntity::class,
            parentColumns = ["id"],
            childColumns = ["role_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = PermissionEntity::class,
            parentColumns = ["id"],
            childColumns = ["permission_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["role_id"]),
        Index(value = ["permission_id"])
    ]
)
data class RolePermissionCrossRef(
    @ColumnInfo(name = "role_id")
    val roleId: String,

    @ColumnInfo(name = "permission_id")
    val permissionId: String
)
