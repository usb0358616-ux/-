package com.yemen.portssecurity.core.security

import org.mindrot.jbcrypt.BCrypt

/**
 * محرك تشفير كلمات المرور باستخدام خوارزمية BCrypt السيادية مع 12 جولة تشفير (Salt Rounds)
 */
object PasswordHasher {

    private const val BCRYPT_LOG_ROUNDS = 12

    /**
     * تشفير كلمة مرور جديدة بملح عشوائي
     */
    fun hashPassword(plainTextPassword: String): String {
        require(plainTextPassword.isNotBlank()) { "كلمة المرور لا يمكن أن تكون فارغة" }
        val salt = BCrypt.gensalt(BCRYPT_LOG_ROUNDS)
        return BCrypt.hashpw(plainTextPassword, salt)
    }

    /**
     * التحقق من صحة كلمة المرور المدخلة بمقارنتها مع التشفير المحفوظ
     */
    fun verifyPassword(plainTextPassword: String, hashedPassword: String): Boolean {
        if (plainTextPassword.isBlank() || hashedPassword.isBlank()) return false
        return try {
            BCrypt.checkpw(plainTextPassword, hashedPassword)
        } catch (e: Exception) {
            false
        }
    }
}
