package com.yemen.portssecurity.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.yemen.portssecurity.data.local.entities.AuditLogEntity
import kotlinx.coroutines.flow.Flow

/**
 * واجهة التعامل مع سجل التدقيق الأمني (Audit Log) - لا تحتوي على دالة Delete للحفاظ على النزاهة القضائية
 */
@Dao
interface AuditLogDao {

    @Insert
    suspend fun insertLog(log: AuditLogEntity)

    @Query("SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentLogsFlow(limit: Int = 100): Flow<List<AuditLogEntity>>

    @Query("SELECT * FROM audit_log WHERE module = :module ORDER BY timestamp DESC")
    fun getLogsByModuleFlow(module: String): Flow<List<AuditLogEntity>>

    @Query("SELECT * FROM audit_log WHERE user_id = :userId ORDER BY timestamp DESC")
    fun getLogsByUserFlow(userId: String): Flow<List<AuditLogEntity>>

    @Query("SELECT * FROM audit_log WHERE timestamp BETWEEN :startTime AND :endTime ORDER BY timestamp DESC")
    suspend fun getLogsBetween(startTime: Long, endTime: Long): List<AuditLogEntity>

    @Query("SELECT COUNT(*) FROM audit_log")
    suspend fun getTotalLogsCount(): Long
}
