package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index

/**
 * جدول ربط المستخدمين بالأدوار (Many-to-Many)
 */
@Entity(
    tableName = "user_roles",
    primaryKeys = ["user_id", "role_id"],
    foreignKeys = [
        ForeignKey(
            entity = UserEntity::class,
            parentColumns = ["id"],
            childColumns = ["user_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = RoleEntity::class,
            parentColumns = ["id"],
            childColumns = ["role_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["user_id"]),
        Index(value = ["role_id"])
    ]
)
data class UserRoleCrossRef(
    @ColumnInfo(name = "user_id")
    val userId: String,

    @ColumnInfo(name = "role_id")
    val roleId: String,

    @ColumnInfo(name = "assigned_at")
    val assignedAt: Long = System.currentTimeMillis()
)
