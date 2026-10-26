package com.yemen.portssecurity.core.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

/**
 * Sovereign Push Notification Manager for the Yemen Ports & Passports Security App.
 * Handles high-priority alerts for:
 * 1. New incoming documents and security transactions (معاملة جديدة)
 * 2. Passport status updates (تحديث حالة الجواز)
 * 3. SLA Security clearance overdue alerts (تنبيهات تجاوز مدد الموافقات الأمنية)
 * 4. Digital document signature confirmations (اعتماد وتوقيع المكاتبات الرسمية)
 */
class PortsNotificationManager(private val context: Context) {

    companion object {
        const val CHANNEL_TRANSACTIONS = "channel_transactions"
        const val CHANNEL_PASSPORTS = "channel_passports"
        const val CHANNEL_SLA_ALERTS = "channel_sla_alerts"
        const val CHANNEL_SIGNATURES = "channel_signatures"

        private var instance: PortsNotificationManager? = null

        fun getInstance(context: Context): PortsNotificationManager {
            return instance ?: synchronized(this) {
                instance ?: PortsNotificationManager(context.applicationContext).also {
                    instance = it
                    it.createNotificationChannels()
                }
            }
        }
    }

    init {
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val transactionsChannel = NotificationChannel(
                CHANNEL_TRANSACTIONS,
                "المعاملات والمكاتبات الواردة",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "إشعارات المعاملات الأمنية والمكاتبات السيادية الجديدة"
                enableVibration(true)
            }

            val passportsChannel = NotificationChannel(
                CHANNEL_PASSPORTS,
                "تحديثات حالة الجوازات",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "إشعارات تغير وضع الجوازات (طباعة، تدقيق، جاهز للتسليم، تسليم)"
            }

            val slaChannel = NotificationChannel(
                CHANNEL_SLA_ALERTS,
                "إنذارات مدد الموافقات الأمنية (SLA)",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "تنبيهات عاجلة عند اقتراب أو تجاوز المدة المحددة نظاماً للمعاملات"
                enableVibration(true)
            }

            val signaturesChannel = NotificationChannel(
                CHANNEL_SIGNATURES,
                "التوقيع الرقمي والاعتمادات السيادية",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "إشعارات توقيع واعتماد المكاتبات الرسمية بالهوية المشفرة"
            }

            notificationManager.createNotificationChannels(
                listOf(transactionsChannel, passportsChannel, slaChannel, signaturesChannel)
            )
        }
    }

    /**
     * Show notification for a new document transaction
     */
    fun showTransactionNotification(
        id: Int,
        title: String,
        body: String,
        referenceNumber: String? = null
    ) {
        val builder = NotificationCompat.Builder(context, CHANNEL_TRANSACTIONS)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)

        try {
            NotificationManagerCompat.from(context).notify(id, builder.build())
        } catch (e: SecurityException) {
            // Android 13+ requires POST_NOTIFICATIONS permission
        }
    }

    /**
     * Show notification for passport status changes
     */
    fun showPassportStatusNotification(
        id: Int,
        passportNumber: String,
        newStatus: String,
        holderName: String
    ) {
        val title = "تحديث في حالة الجواز: $passportNumber"
        val body = "تم تحديث حالة جواز الأخ/ت $holderName إلى: ($newStatus)."

        val builder = NotificationCompat.Builder(context, CHANNEL_PASSPORTS)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)

        try {
            NotificationManagerCompat.from(context).notify(id, builder.build())
        } catch (e: SecurityException) {
            // Android 13+ requires POST_NOTIFICATIONS permission
        }
    }

    /**
     * Show urgent SLA overdue alert
     */
    fun showSlaOverdueAlert(
        id: Int,
        transactionNumber: String,
        serviceType: String,
        overdueDays: Int
    ) {
        val title = "⚠️ إنذار تجاوز مدة قانونية (SLA): $transactionNumber"
        val body = "المعاملة ($serviceType) تجاوزت المدة النظامية المحددة بـ $overdueDays أيام! تتطلب تدخلاً فورياً."

        val builder = NotificationCompat.Builder(context, CHANNEL_SLA_ALERTS)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)

        try {
            NotificationManagerCompat.from(context).notify(id, builder.build())
        } catch (e: SecurityException) {
            // Android 13+ permission check
        }
    }
}
