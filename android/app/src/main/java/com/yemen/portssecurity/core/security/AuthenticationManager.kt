package com.yemen.portssecurity.core.security

import com.yemen.portssecurity.core.session.SessionManager
import com.yemen.portssecurity.data.local.dao.AuditLogDao
import com.yemen.portssecurity.data.local.dao.UserDao
import com.yemen.portssecurity.data.local.entities.AuditLogEntity
import com.yemen.portssecurity.data.local.entities.UserEntity
import java.util.UUID

/**
 * حالات نتيجة عملية تسجيل الدخول
 */
sealed class AuthResult {
    data class Success(val user: UserEntity) : AuthResult()
    data class Error(val message: String) : AuthResult()
    object AccountLocked : AuthResult()
}

/**
 * مدير المصادقة والأمن (AuthenticationManager)
 */
class AuthenticationManager(
    private val userDao: UserDao,
    private val auditLogDao: AuditLogDao
) {

    companion object {
        private const val MAX_FAILED_ATTEMPTS = 5
    }

    /**
     * تسجيل الدخول الأمني بالتحقق المشفر من كلمة المرور
     */
    suspend fun login(username: String, plainPassword: String): AuthResult {
        val cleanUsername = username.trim()
        if (cleanUsername.isBlank() || plainPassword.isBlank()) {
            return AuthResult.Error("يرجى إدخال اسم المستخدم وكلمة المرور")
        }

        val user = userDao.getUserByUsername(cleanUsername)
            ?: return AuthResult.Error("بيانات الدخول غير صحيحة")

        // فحص تجميد الحساب
        if (user.isLocked || user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
            recordAudit(
                userId = user.id,
                username = user.username,
                action = "LOGIN_BLOCKED",
                desc = "محاولة دخول على حساب مجمد لتكرار الأخطاء"
            )
            return AuthResult.AccountLocked
        }

        // فحص تعطيل الحساب
        if (!user.isActive) {
            return AuthResult.Error("تم تعطيل هذا الحساب العسكري. راجع إدارة شؤون الضباط")
        }

        // التحقق من كلمة المرور عبر BCrypt
        val isPasswordCorrect = PasswordHasher.verifyPassword(plainPassword, user.passwordHash)

        if (!isPasswordCorrect) {
            userDao.incrementFailedAttempts(cleanUsername)
            val updatedAttempts = user.failedAttempts + 1

            recordAudit(
                userId = user.id,
                username = user.username,
                action = "FAILED_LOGIN",
                desc = "محاولة دخول خاطئة ($updatedAttempts من $MAX_FAILED_ATTEMPTS)"
            )

            if (updatedAttempts >= MAX_FAILED_ATTEMPTS) {
                userDao.lockAccount(cleanUsername)
                return AuthResult.AccountLocked
            }

            return AuthResult.Error("كلمة المرور غير صحيحة (المحاولة $updatedAttempts من $MAX_FAILED_ATTEMPTS)")
        }

        // نجاح تسجيل الدخول: جلب الأدوار والصلاحيات وتفعيل الجلسة
        val roles = userDao.getRolesForUser(user.id)
        val permissions = userDao.getPermissionCodesForUser(user.id)

        userDao.recordSuccessfulLogin(user.id, System.currentTimeMillis())
        SessionManager.startSession(user, roles, permissions)

        recordAudit(
            userId = user.id,
            username = user.username,
            action = "LOGIN",
            desc = "تسجيل دخول ناجح للضابط: ${user.rank} / ${user.fullName}"
        )

        return AuthResult.Success(user)
    }

    /**
     * تسجيل الخروج الآمن
     */
    suspend fun logout() {
        val user = SessionManager.currentSession.value?.user
        if (user != null) {
            recordAudit(
                userId = user.id,
                username = user.username,
                action = "LOGOUT",
                desc = "تسجيل خروج آمن للضابط: ${user.rank} / ${user.fullName}"
            )
        }
        SessionManager.endSession()
    }

    /**
     * تغيير كلمة المرور للمستخدم الحالي
     */
    suspend fun changePassword(oldPass: String, newPass: String): Boolean {
        val user = SessionManager.currentSession.value?.user ?: return false
        if (!PasswordHasher.verifyPassword(oldPass, user.passwordHash)) {
            return false
        }
        if (newPass.length < 8) return false

        val newHash = PasswordHasher.hashPassword(newPass)
        userDao.resetPassword(user.id, newHash, System.currentTimeMillis())

        recordAudit(
            userId = user.id,
            username = user.username,
            action = "PASSWORD_CHANGE",
            desc = "قام الضابط بتغيير كلمة المرور الخاصة به بنجاح"
        )
        return true
    }

    private suspend fun recordAudit(userId: String, username: String, action: String, desc: String) {
        try {
            auditLogDao.insertLog(
                AuditLogEntity(
                    id = UUID.randomUUID().toString(),
                    userId = userId,
                    username = username,
                    militaryNumber = null,
                    action = action,
                    module = "AUTH",
                    recordId = userId,
                    description = desc
                )
            )
        } catch (_: Exception) {}
    }
}
