package com.yemen.portssecurity.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.yemen.portssecurity.data.local.entities.RoleEntity
import com.yemen.portssecurity.data.local.entities.UserEntity
import com.yemen.portssecurity.data.local.entities.UserRoleCrossRef
import kotlinx.coroutines.flow.Flow

/**
 * واجهة التعامل مع المستخدمين وأدوارهم العسكرية
 */
@Dao
interface UserDao {

    @Query("SELECT * FROM users WHERE username = :username LIMIT 1")
    suspend fun getUserByUsername(username: String): UserEntity?

    @Query("SELECT * FROM users WHERE id = :userId LIMIT 1")
    suspend fun getUserById(userId: String): UserEntity?

    @Query("SELECT * FROM users ORDER BY military_number ASC")
    fun getAllUsersFlow(): Flow<List<UserEntity>>

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insertUser(user: UserEntity)

    @Update
    suspend fun updateUser(user: UserEntity)

    @Query("UPDATE users SET last_login_at = :timestamp, failed_attempts = 0 WHERE id = :userId")
    suspend fun recordSuccessfulLogin(userId: String, timestamp: Long)

    @Query("UPDATE users SET failed_attempts = failed_attempts + 1 WHERE username = :username")
    suspend fun incrementFailedAttempts(username: String)

    @Query("UPDATE users SET is_locked = 1 WHERE username = :username")
    suspend fun lockAccount(username: String)

    @Query("UPDATE users SET password_hash = :newPasswordHash, password_changed_at = :timestamp, failed_attempts = 0, is_locked = 0 WHERE id = :userId")
    suspend fun resetPassword(userId: String, newPasswordHash: String, timestamp: Long)

    // علاقات الأدوار للمستخدم
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun assignRoleToUser(crossRef: UserRoleCrossRef)

    @Query("""
        SELECT r.* FROM roles r 
        INNER JOIN user_roles ur ON r.id = ur.role_id 
        WHERE ur.user_id = :userId
    """)
    suspend fun getRolesForUser(userId: String): List<RoleEntity>

    @Query("""
        SELECT p.permission_code FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = :userId
    """)
    suspend fun getPermissionCodesForUser(userId: String): List<String>
}
