package com.yemen.portssecurity.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.yemen.portssecurity.core.security.SQLCipherHelper
import com.yemen.portssecurity.data.local.dao.*
import com.yemen.portssecurity.data.local.entities.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * قاعدة البيانات المركزية المشفرة بـ SQLCipher (AppDatabase)
 * تتضمن كافة الكيانات السيادية الـ 14 ووحدة المطور
 */
@Database(
    entities = [
        UserEntity::class,
        RoleEntity::class,
        PermissionEntity::class,
        RolePermissionCrossRef::class,
        UserRoleCrossRef::class,
        AuditLogEntity::class,
        SeizureRecordEntity::class,
        SeizedPassportEntity::class,
        SeizureOperationEntity::class,
        SeizureDeliveryEntity::class,
        PoliceIntelligenceEntity::class,
        OfficialCorrespondenceEntity::class,
        MonitoredCompanyEntity::class,
        CompanyViolationEntity::class,
        SlaPolicyEntity::class,
        SecurityClearanceEntity::class,
        PassportTimelineEntity::class,
        FieldDefinitionEntity::class,
        CustomFieldValueEntity::class,
        LabelOverrideEntity::class,
        ListDefinitionEntity::class,
        ListValueEntity::class,
        AutoFieldRuleEntity::class,
        PrintTemplateEntity::class,
        SchemaSnapshotEntity::class
    ],
    version = 2,
    exportSchema = true
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun userDao(): UserDao
    abstract fun rolePermissionDao(): RolePermissionDao
    abstract fun auditLogDao(): AuditLogDao
    abstract fun seizureDao(): SeizureDao
    abstract fun policeIntelligenceDao(): PoliceIntelligenceDao
    abstract fun officialCorrespondenceDao(): OfficialCorrespondenceDao
    abstract fun monitoredCompanyDao(): MonitoredCompanyDao
    abstract fun slaPolicyDao(): SlaPolicyDao
    abstract fun passportTimelineDao(): PassportTimelineDao
    abstract fun developerMetadataDao(): DeveloperMetadataDao

    companion object {
        private const val DATABASE_NAME = "ports_security_encrypted.db"

        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = buildEncryptedDatabase(context)
                INSTANCE = instance
                instance
            }
        }

        private fun buildEncryptedDatabase(context: Context): AppDatabase {
            // تهيئة معمل تشفير SQLCipher
            val cipherFactory = SQLCipherHelper.getPassphraseFactory(context)

            return Room.databaseBuilder(
                context.applicationContext,
                AppDatabase::class.java,
                DATABASE_NAME
            )
                .openHelperFactory(cipherFactory) // تشفير كامل AES-256 لقاعدة البيانات
                .fallbackToDestructiveMigration()
                .addCallback(object : Callback() {
                    override fun onCreate(db: SupportSQLiteDatabase) {
                        super.onCreate(db)
                        // زراعة البيانات الأولية (Roles, Permissions, Super Admin)
                        CoroutineScope(Dispatchers.IO).launch {
                            val database = getInstance(context)
                            seedInitialData(database)
                        }
                    }
                })
                .build()
        }

        /**
         * زراعة البيانات السيادية التأسيسية
         */
        suspend fun seedInitialData(database: AppDatabase) {
            val roleDao = database.rolePermissionDao()
            val userDao = database.userDao()

            if (roleDao.getRolesCount() == 0) {
                // إدراج الأدوار الـ 7
                roleDao.insertRoles(SeedData.roles)
                // إدراج الصلاحيات الـ 98
                roleDao.insertPermissions(SeedData.permissions)
                // ربط صلاحيات المدير العام
                roleDao.insertRolePermissions(SeedData.superAdminRolePermissions)
                // ربط صلاحيات نائب المدير العام
                roleDao.insertRolePermissions(SeedData.deputyAdminRolePermissions)
                // ربط صلاحيات المحقق الأول
                roleDao.insertRolePermissions(SeedData.seniorInvestigatorPermissions)
                // ربط صلاحيات موظف الإدخال
                roleDao.insertRolePermissions(SeedData.dataEntryPermissions)

                // إدراج المستخدم الافتراضي (مدير عام)
                if (userDao.getUserByUsername(SeedData.defaultAdminUser.username) == null) {
                    userDao.insertUser(SeedData.defaultAdminUser)
                    userDao.assignRoleToUser(SeedData.adminUserRole)
                }
            }
        }
    }
}
