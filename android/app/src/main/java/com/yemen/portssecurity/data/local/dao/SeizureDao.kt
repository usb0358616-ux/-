package com.yemen.portssecurity.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import com.yemen.portssecurity.data.local.entities.SeizedPassportEntity
import com.yemen.portssecurity.data.local.entities.SeizureDeliveryEntity
import com.yemen.portssecurity.data.local.entities.SeizureOperationEntity
import com.yemen.portssecurity.data.local.entities.SeizureRecordEntity
import kotlinx.coroutines.flow.Flow

/**
 * واجهة التعامل مع محاضر الضبط والجوازات المحتجزة والعمليات
 */
@Dao
interface SeizureDao {

    // 1. محاضر الضبط
    @Query("SELECT * FROM seizure_records ORDER BY seizure_date DESC")
    fun getAllSeizureRecordsFlow(): Flow<List<SeizureRecordEntity>>

    @Query("SELECT * FROM seizure_records WHERE id = :id LIMIT 1")
    suspend fun getSeizureRecordById(id: String): SeizureRecordEntity?

    @Query("SELECT * FROM seizure_records WHERE record_number = :recordNumber LIMIT 1")
    suspend fun getSeizureRecordByNumber(recordNumber: String): SeizureRecordEntity?

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insertSeizureRecord(record: SeizureRecordEntity)

    @Update
    suspend fun updateSeizureRecord(record: SeizureRecordEntity)

    // 2. الجوازات المحتجزة
    @Query("SELECT * FROM seized_passports WHERE seizure_record_id = :recordId ORDER BY full_name_ar ASC")
    fun getPassportsForRecordFlow(recordId: String): Flow<List<SeizedPassportEntity>>

    @Query("SELECT * FROM seized_passports WHERE passport_number = :passportNumber")
    suspend fun findSeizedPassportsByNumber(passportNumber: String): List<SeizedPassportEntity>

    @Query("SELECT * FROM seized_passports WHERE id = :id LIMIT 1")
    suspend fun getSeizedPassportById(id: String): SeizedPassportEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSeizedPassport(passport: SeizedPassportEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSeizedPassports(passports: List<SeizedPassportEntity>)

    @Update
    suspend fun updateSeizedPassport(passport: SeizedPassportEntity)

    // 3. العمليات والتداول
    @Query("SELECT * FROM seizure_operations WHERE seizure_record_id = :recordId ORDER BY letter_date DESC")
    fun getOperationsForRecordFlow(recordId: String): Flow<List<SeizureOperationEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOperation(operation: SeizureOperationEntity)

    // 4. تسليم الجوازات
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDelivery(delivery: SeizureDeliveryEntity)

    @Transaction
    suspend fun markPassportDelivered(passportId: String, delivery: SeizureDeliveryEntity) {
        insertDelivery(delivery)
        val passport = getSeizedPassportById(passportId)
        if (passport != null) {
            updateSeizedPassport(passport.copy(isDelivered = true, securityResult = "تم التسليم بموجب سند"))
        }
    }

    @Query("SELECT COUNT(*) FROM seizure_records")
    suspend fun getTotalSeizuresCount(): Int

    @Query("SELECT COUNT(*) FROM seized_passports WHERE is_delivered = 0")
    suspend fun getUndeliveredPassportsCount(): Int
}
