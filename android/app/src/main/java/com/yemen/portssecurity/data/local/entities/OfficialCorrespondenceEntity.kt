package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * المكاتبات والبرقيات الرسمية
 * قوالب: برقية داخلية، مذكرة رسمية، طلب تحرٍ أمني، رد على طلب.
 * العناصر الإلزامية:
 * رقم الوارد (تلقائي سنوي)، التاريخ الميلادي والهجري، من / إلى، الإشارة (المرجع)،
 * الموضوع، العطف، المتضمن، وعليه، التحية، التوقيع والختم.
 */
@Entity(tableName = "official_correspondence")
data class OfficialCorrespondenceEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "incoming_number")
    val incomingNumber: String, // رقم الوارد المتسلسل السنوي

    @ColumnInfo(name = "template_type")
    val templateType: String, // برقية داخلية / مذكرة رسمية / طلب تحرٍ أمني / رد على طلب

    @ColumnInfo(name = "gregorian_date")
    val gregorianDate: String,

    @ColumnInfo(name = "hijri_date")
    val hijriDate: String,

    @ColumnInfo(name = "sender_entity")
    val senderEntity: String, // من

    @ColumnInfo(name = "recipient_entity")
    val recipientEntity: String, // إلى

    @ColumnInfo(name = "reference_number")
    val referenceNumber: String? = null, // الإشارة / رقم المرجع السابق

    @ColumnInfo(name = "subject")
    val subject: String, // الموضوع

    @ColumnInfo(name = "salutation")
    val salutation: String = "بالإشارة إلى الموضوع أعلاه،", // العطف

    @ColumnInfo(name = "content_body")
    val contentBody: String, // المتضمن

    @ColumnInfo(name = "conclusion_directive")
    val conclusionDirective: String, // وعليه

    @ColumnInfo(name = "closing_greeting")
    val closingGreeting: String = "وتقبلوا خالص التحية والتقدير،،",

    @ColumnInfo(name = "signer_name")
    val signerName: String, // الاسم

    @ColumnInfo(name = "signer_title")
    val signerTitle: String, // الرتبة والصفة

    @ColumnInfo(name = "has_official_seal")
    val hasOfficialSeal: Boolean = true, // الختم الرسمي

    @ColumnInfo(name = "status")
    val status: String = "صادر ومعتمد",

    @ColumnInfo(name = "created_at")
    val createdAt: String
)
