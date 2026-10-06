package com.yemen.portssecurity.data.local.dao

import androidx.room.*
import com.yemen.portssecurity.data.local.entities.PoliceIntelligenceEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PoliceIntelligenceDao {
    @Query("SELECT * FROM police_intelligence_requests ORDER BY id DESC")
    fun getAllRequests(): Flow<List<PoliceIntelligenceEntity>>

    @Query("SELECT * FROM police_intelligence_requests WHERE id = :id LIMIT 1")
    suspend fun getRequestById(id: Long): PoliceIntelligenceEntity?

    @Query("SELECT * FROM police_intelligence_requests WHERE entry_number = :entryNumber LIMIT 1")
    suspend fun getRequestByEntryNumber(entryNumber: String): PoliceIntelligenceEntity?

    @Query("SELECT * FROM police_intelligence_requests WHERE investigation_number = :invNumber LIMIT 1")
    suspend fun getRequestByInvestigationNumber(invNumber: String): PoliceIntelligenceEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(request: PoliceIntelligenceEntity): Long

    @Update
    suspend fun update(request: PoliceIntelligenceEntity)

    @Delete
    suspend fun delete(request: PoliceIntelligenceEntity)
}
