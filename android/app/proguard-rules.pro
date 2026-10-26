# ========================================================
# قواعد حماية وتقليص الكود (R8 / ProGuard) للمنظومة السيادية
# Yemen Sovereign Ports Security & Passports System
# ========================================================

# 1. منع إزالة أو تشويش كيانات قاعدة البيانات (Room Entities & DAOs)
-keep class com.yemen.portssecurity.data.local.entities.** { *; }
-keep class com.yemen.portssecurity.data.local.dao.** { *; }
-keep class com.yemen.portssecurity.data.local.AppDatabase { *; }
-keepattributes *Annotation*
-dontwarn androidx.room.paging.**

# 2. حماية مكتبة التشفير العسكري SQLCipher
-keep class net.sqlcipher.** { *; }
-keep class net.sqlcipher.database.** { *; }
-dontwarn net.sqlcipher.**

# 3. حماية مكتبة التشفير وتجزئة كلمات المرور BCrypt
-keep class org.mindrot.jbcrypt.** { *; }
-dontwarn org.mindrot.jbcrypt.**

# 4. حماية نماذج ونصوص Gson
-keepattributes Signature
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.google.gson.** { *; }

# 5. حماية محركات معالجة الجداول والمستندات (Apache POI & iText 7)
-keep class org.apache.poi.** { *; }
-dontwarn org.apache.poi.**
-keep class com.itextpdf.** { *; }
-dontwarn com.itextpdf.**
-keep class com.opencsv.** { *; }

# 6. حماية ربط الواجهات ViewBinding
-keepclassmembers class * implements androidx.viewbinding.ViewBinding {
    public static *** inflate(...);
    public static *** bind(...);
}

# 7. حماية مشغلات WorkManager والمصادقة الحيوية
-keep class androidx.work.** { *; }
-keep class androidx.biometric.** { *; }
-dontwarn androidx.biometric.**

# 8. حماية دوال Coroutines و Kotlin Reflection
-keepclassmembers class kotlinx.coroutines.** { *; }
-dontwarn kotlinx.coroutines.**

# 9. منع إزالة السجلات الأمنية والـ SessionManager
-keep class com.yemen.portssecurity.core.session.SessionManager { *; }
-keep class com.yemen.portssecurity.core.security.** { *; }
