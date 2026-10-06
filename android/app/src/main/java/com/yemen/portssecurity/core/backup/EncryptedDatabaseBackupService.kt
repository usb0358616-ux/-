package com.yemen.portssecurity.core.backup

import android.content.Context
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

/**
 * خدمة النسخ الاحتياطي والأرشفة التلقائية المشفرة
 * مستخلصة ومطورة عن خدمة backup_service من مشروع مكتب المعلومات والبيانات
 */
object EncryptedDatabaseBackupService {

    fun createEncryptedBackup(context: Context, backupDir: File): File? {
        return try {
            if (!backupDir.exists()) backupDir.mkdirs()

            val dbFile = context.getDatabasePath("ports_security_encrypted.db")
            if (!dbFile.exists()) return null

            val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
            val zipBackupFile = File(backupDir, "backup_ports_security_$timestamp.yembak")

            ZipOutputStream(FileOutputStream(zipBackupFile)).use { zos ->
                FileInputStream(dbFile).use { fis ->
                    val entry = ZipEntry("database.encrypted")
                    zos.putNextEntry(entry)
                    val buffer = ByteArray(8192)
                    var length: Int
                    while (fis.read(buffer).also { length = it } > 0) {
                        zos.write(buffer, 0, length)
                    }
                    zos.closeEntry()
                }
            }

            zipBackupFile
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
