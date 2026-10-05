package com.yemen.portssecurity.core.security

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import net.sqlcipher.database.SupportFactory
import java.security.SecureRandom

/**
 * مدير مفتاح تشفير قاعدة البيانات بنظام SQLCipher عبر Android Keystore و EncryptedSharedPreferences
 */
object SQLCipherHelper {

    private const val PREFS_NAME = "ports_security_vault_prefs"
    private const val DB_PASSPHRASE_KEY = "db_master_passphrase"

    /**
     * الحصول على معمل التشفير (SupportFactory) لقاعدة بيانات Room المشفرة
     */
    fun getPassphraseFactory(context: Context): SupportFactory {
        val passphrase = getOrCreateDatabasePassphrase(context)
        return SupportFactory(passphrase)
    }

    /**
     * استرجاع أو توليد مفتاح عشوائي مشفر مكون من 256 بت (32 بايت) مخزن داخل Android Keystore
     */
    @Synchronized
    private fun getOrCreateDatabasePassphrase(context: Context): ByteArray {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        val encryptedPrefs = EncryptedSharedPreferences.create(
            context,
            PREFS_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )

        var encodedKey = encryptedPrefs.getString(DB_PASSPHRASE_KEY, null)
        if (encodedKey == null) {
            val randomBytes = ByteArray(32)
            SecureRandom().nextBytes(randomBytes)
            encodedKey = android.util.Base64.encodeToString(randomBytes, android.util.Base64.NO_WRAP)
            encryptedPrefs.edit().putString(DB_PASSPHRASE_KEY, encodedKey).apply()
        }

        return android.util.Base64.decode(encodedKey, android.util.Base64.NO_WRAP)
    }
}
