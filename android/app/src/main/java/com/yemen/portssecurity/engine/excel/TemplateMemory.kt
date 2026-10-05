package com.yemen.portssecurity.engine.excel

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * المكون 5: ذاكرة القوالب الذكية (Template Memory)
 * تحفظ التعيينات اليدوية للأعمدة الغريبة حتى يتم التعرف عليها تلقائياً في المرات القادمة
 */
class TemplateMemory(context: Context) {

    private val gson = Gson()
    private val prefs = EncryptedSharedPreferences.create(
        context,
        "excel_template_memory_vault",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val KEY_MAPPINGS = "learned_column_mappings"

    fun saveMapping(rawHeader: String, standardField: FieldDictionary.StandardField) {
        val currentMappings = getAllMappings().toMutableMap()
        currentMappings[FuzzyMatcher.normalizeArabic(rawHeader)] = standardField.name
        prefs.edit().putString(KEY_MAPPINGS, gson.toJson(currentMappings)).apply()
    }

    fun getMappedField(rawHeader: String): FieldDictionary.StandardField? {
        val normalized = FuzzyMatcher.normalizeArabic(rawHeader)
        val mappings = getAllMappings()
        val fieldName = mappings[normalized] ?: return null
        return try {
            FieldDictionary.StandardField.valueOf(fieldName)
        } catch (_: Exception) {
            null
        }
    }

    private fun getAllMappings(): Map<String, String> {
        val json = prefs.getString(KEY_MAPPINGS, null) ?: return emptyMap()
        val type = object : TypeToken<Map<String, String>>() {}.type
        return try {
            gson.fromJson(json, type) ?: emptyMap()
        } catch (_: Exception) {
            emptyMap()
        }
    }
}
