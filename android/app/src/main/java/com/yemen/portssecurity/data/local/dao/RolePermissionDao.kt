package com.yemen.portssecurity.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.yemen.portssecurity.data.local.entities.PermissionEntity
import com.yemen.portssecurity.data.local.entities.RoleEntity
import com.yemen.portssecurity.data.local.entities.RolePermissionCrossRef
import kotlinx.coroutines.flow.Flow

/**
 * واجهة التعامل مع الأدوار والصلاحيات
 */
@Dao
interface RolePermissionDao {

    @Query("SELECT * FROM roles ORDER BY role_name_ar ASC")
    fun getAllRolesFlow(): Flow<List<RoleEntity>>

    @Query("SELECT * FROM permissions ORDER BY module ASC, action ASC")
    fun getAllPermissionsFlow(): Flow<List<PermissionEntity>>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertRoles(roles: List<RoleEntity>)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertPermissions(permissions: List<PermissionEntity>)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertRolePermissions(crossRefs: List<RolePermissionCrossRef>)

    @Query("SELECT COUNT(*) FROM roles")
    suspend fun getRolesCount(): Int

    @Query("SELECT COUNT(*) FROM permissions")
    suspend fun getPermissionsCount(): Int

    @Query("""
        SELECT p.* FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = :roleId
    """)
    suspend fun getPermissionsByRoleId(roleId: String): List<PermissionEntity>
}
