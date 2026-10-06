package com.yemen.portssecurity.data.local.dao

import androidx.room.*
import com.yemen.portssecurity.data.local.entities.PassportTimelineEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PassportTimelineDao {
    @Query("SELECT * FROM passport_timeline WHERE passport_number = :passportNumber ORDER BY event_date DESC, id DESC")
    fun getTimelineForPassport(passportNumber: String): Flow<List<PassportTimelineEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvent(event: PassportTimelineEntity): Long

    @Query("DELETE FROM passport_timeline WHERE passport_number = :passportNumber")
    suspend fun clearTimelineForPassport(passportNumber: String)
}
