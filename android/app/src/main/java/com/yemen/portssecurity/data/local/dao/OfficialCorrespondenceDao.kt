package com.yemen.portssecurity.data.local.dao

import androidx.room.*
import com.yemen.portssecurity.data.local.entities.OfficialCorrespondenceEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface OfficialCorrespondenceDao {
    @Query("SELECT * FROM official_correspondence ORDER BY id DESC")
    fun getAllCorrespondence(): Flow<List<OfficialCorrespondenceEntity>>

    @Query("SELECT * FROM official_correspondence WHERE id = :id LIMIT 1")
    suspend fun getById(id: Long): OfficialCorrespondenceEntity?

    @Query("SELECT * FROM official_correspondence WHERE template_type = :templateType ORDER BY id DESC")
    fun getByTemplateType(templateType: String): Flow<List<OfficialCorrespondenceEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: OfficialCorrespondenceEntity): Long

    @Update
    suspend fun update(item: OfficialCorrespondenceEntity)

    @Delete
    suspend fun delete(item: OfficialCorrespondenceEntity)
}
