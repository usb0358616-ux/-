package com.yemen.portssecurity.data.local.dao

import androidx.room.*
import com.yemen.portssecurity.data.local.entities.SecurityClearanceEntity
import com.yemen.portssecurity.data.local.entities.SlaPolicyEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SlaPolicyDao {
    @Query("SELECT * FROM sla_policies WHERE is_active = 1 ORDER BY id ASC")
    fun getAllActivePolicies(): Flow<List<SlaPolicyEntity>>

    @Query("SELECT * FROM sla_policies WHERE department = :department ORDER BY id ASC")
    fun getPoliciesByDepartment(department: String): Flow<List<SlaPolicyEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPolicy(policy: SlaPolicyEntity): Long

    // Clearances & SLA Tracking
    @Query("SELECT * FROM security_clearance_requests ORDER BY id DESC")
    fun getAllClearanceRequests(): Flow<List<SecurityClearanceEntity>>

    @Query("SELECT * FROM security_clearance_requests WHERE is_overdue = 1")
    fun getOverdueRequests(): Flow<List<SecurityClearanceEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClearance(clearance: SecurityClearanceEntity): Long

    @Update
    suspend fun updateClearance(clearance: SecurityClearanceEntity)
}
