package com.yemen.portssecurity

import android.app.Application
import com.yemen.portssecurity.core.security.AuthenticationManager
import com.yemen.portssecurity.data.local.AppDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * فئة التطبيق الرئيسية السيادية - مصلحة الهجرة والجوازات والمنافذ
 */
class PortsSecurityApp : Application() {

    lateinit var database: AppDatabase
        private set

    lateinit var authManager: AuthenticationManager
        private set

    override fun onCreate() {
        super.onCreate()

        // 1. تحميل مكتبات SQLCipher الأصلية لتشفير C/C++
        net.sqlcipher.database.SQLiteDatabase.loadLibs(this)

        // 2. تهيئة قاعدة البيانات المشفرة
        database = AppDatabase.getInstance(this)

        // 3. تهيئة مدير المصادقة والأمن
        authManager = AuthenticationManager(
            userDao = database.userDao(),
            auditLogDao = database.auditLogDao()
        )

        // 4. التحقق من زراعة البيانات في الخلفية
        CoroutineScope(Dispatchers.IO).launch {
            AppDatabase.seedInitialData(database)
        }
    }
}
