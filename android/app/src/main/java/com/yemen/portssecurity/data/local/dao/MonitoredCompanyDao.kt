package com.yemen.portssecurity.data.local.dao

import androidx.room.*
import com.yemen.portssecurity.data.local.entities.CompanyViolationEntity
import com.yemen.portssecurity.data.local.entities.MonitoredCompanyEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MonitoredCompanyDao {
    @Query("SELECT * FROM monitored_companies ORDER BY name ASC")
    fun getAllCompanies(): Flow<List<MonitoredCompanyEntity>>

    @Query("SELECT * FROM monitored_companies WHERE category = :category ORDER BY name ASC")
    fun getCompaniesByCategory(category: String): Flow<List<MonitoredCompanyEntity>>

    @Query("SELECT * FROM monitored_companies WHERE id = :id LIMIT 1")
    suspend fun getCompanyById(id: Long): MonitoredCompanyEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCompany(company: MonitoredCompanyEntity): Long

    @Update
    suspend fun updateCompany(company: MonitoredCompanyEntity)

    @Delete
    suspend fun deleteCompany(company: MonitoredCompanyEntity)

    // Violations
    @Query("SELECT * FROM company_violations WHERE company_id = :companyId ORDER BY violation_date DESC")
    fun getViolationsForCompany(companyId: Long): Flow<List<CompanyViolationEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertViolation(violation: CompanyViolationEntity): Long
}
