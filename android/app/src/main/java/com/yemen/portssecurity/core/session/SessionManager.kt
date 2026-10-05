package com.yemen.portssecurity.core.session

import com.yemen.portssecurity.data.local.entities.RoleEntity
import com.yemen.portssecurity.data.local.entities.UserEntity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * نموذج جلسة الضابط الحالي
 */
data class UserSession(
    val user: UserEntity,
    val roles: List<RoleEntity>,
    val permissionCodes: Set<String>,
    val loginTime: Long = System.currentTimeMillis()
)

/**
 * مدير الجلسة السيادية (SessionManager)
 * يدير حالة تسجيل الدخول، فحص الصلاحيات الدقيقة، ومؤقت تسجيل الخروج التلقائي بعد 15 دقيقة خمول
 */
object SessionManager {

    private const val INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000L // 15 دقيقة خمول

    private val _currentSession = MutableStateFlow<UserSession?>(null)
    val currentSession: StateFlow<UserSession?> = _currentSession.asStateFlow()

    private var lastActivityTimestamp: Long = System.currentTimeMillis()

    /**
     * هل يوجد مستخدم مسجل دخول حالياً؟
     */
    val isLoggedIn: Boolean
        get() = _currentSession.value != null && !isSessionExpired()

    /**
     * بدء جلسة جديدة بعد مصادقة ناجحة
     */
    fun startSession(user: UserEntity, roles: List<RoleEntity>, permissions: List<String>) {
        lastActivityTimestamp = System.currentTimeMillis()
        _currentSession.value = UserSession(
            user = user,
            roles = roles,
            permissionCodes = permissions.toSet()
        )
    }

    /**
     * إنهاء الجلسة ومسح الذاكرة الحساسة
     */
    fun endSession() {
        _currentSession.value = null
        lastActivityTimestamp = 0
    }

    /**
     * تحديث توقيت آخر تفاعل لمنع الإغلاق أثناء الاستخدام
     */
    fun touchSession() {
        if (_currentSession.value != null) {
            if (isSessionExpired()) {
                endSession()
            } else {
                lastActivityTimestamp = System.currentTimeMillis()
            }
        }
    }

    /**
     * فحص هل انتهت مدة الخمول (15 دقيقة)
     */
    fun isSessionExpired(): Boolean {
        if (_currentSession.value == null) return true
        val now = System.currentTimeMillis()
        return (now - lastActivityTimestamp) > INACTIVITY_TIMEOUT_MS
    }

    /**
     * التحقق الصارم من امتلاك الضابط لصلاحية معينة
     * مثال: hasPermission("seizures.create")
     */
    fun hasPermission(permissionCode: String): Boolean {
        val session = _currentSession.value ?: return false
        // المدير العام يملك صلاحية تجاوز كاملة (Super Admin Bypass)
        if (session.roles.any { it.roleCode == "super_admin" }) return true
        return session.permissionCodes.contains(permissionCode)
    }

    /**
     * التحقق من امتلاك أي من الصلاحيات المعطاة
     */
    fun hasAnyPermission(vararg permissionCodes: String): Boolean {
        val session = _currentSession.value ?: return false
        if (session.roles.any { it.roleCode == "super_admin" }) return true
        return permissionCodes.any { session.permissionCodes.contains(it) }
    }

    /**
     * الحصول على معرّف المستخدم الحالي
     */
    fun getUserId(): String? = _currentSession.value?.user?.id

    /**
     * الحصول على اسم المستخدم الحالي
     */
    fun getUsername(): String = _currentSession.value?.user?.username ?: "نظام مجهول"

    /**
     * الحصول على الرتبة والاسم الكامل للعرض الرسمي
     */
    fun getOfficerDisplayTitle(): String {
        val u = _currentSession.value?.user ?: return "غير مسجل"
        return "${u.rank} / ${u.fullName}"
    }
}
