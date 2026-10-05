package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * سجل العمليات والتدقيق الأمني الصارم (Audit Log) - لا يقبل الحذف أبداً
 */
@Entity(
    tableName = "audit_log",
    indices = [
        Index(value = ["user_id"]),
        Index(value = ["action"]),
        Index(value = ["module"]),
        Index(value = ["timestamp"]),
        Index(value = ["record_id"])
    ]
)
data class AuditLogEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String, // UUID

    @ColumnInfo(name = "user_id")
    val userId: String, // معرف الضابط أو المستخدم

    @ColumnInfo(name = "username")
    val username: String, // اسم المستخدم وقت العملية

    @ColumnInfo(name = "military_number")
    val militaryNumber: String?, // الرقم العسكري

    @ColumnInfo(name = "action")
    val action: String, // CREATE, UPDATE, DELETE, VIEW, EXPORT, LOGIN, LOGOUT, FAILED_LOGIN, BACKUP

    @ColumnInfo(name = "module")
    val module: String, // اسم الوحدة المعنية (seizures, passengers, visas, etc.)

    @ColumnInfo(name = "record_id")
    val recordId: String?, // معرف السجل المتأثر

    @ColumnInfo(name = "description")
    val description: String, // وصف تفصيلي للعملية بالعربية

    @ColumnInfo(name = "old_values")
    val oldValues: String? = null, // JSON للقيم السابقة في حال التعديل

    @ColumnInfo(name = "new_values")
    val newValues: String? = null, // JSON للقيم الجديدة

    @ColumnInfo(name = "port_id")
    val portId: String? = null, // المنفذ الذي تمت فيه العملية

    @ColumnInfo(name = "device_info")
    val deviceInfo: String? = null, // مواصفات الجهاز اللوحي أو الهاتف

    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis()
)
