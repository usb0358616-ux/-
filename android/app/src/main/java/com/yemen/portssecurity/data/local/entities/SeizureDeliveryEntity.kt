package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * جدول سندات تسليم الجوازات لأصحابها بعد صدور أمر الإفراج
 */
@Entity(
    tableName = "seizure_deliveries",
    foreignKeys = [
        ForeignKey(
            entity = SeizedPassportEntity::class,
            parentColumns = ["id"],
            childColumns = ["seized_passport_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["seized_passport_id"]),
        Index(value = ["receipt_number"], unique = true)
    ]
)
data class SeizureDeliveryEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String, // UUID

    @ColumnInfo(name = "seized_passport_id")
    val seizedPassportId: String,

    @ColumnInfo(name = "receipt_number")
    val receiptNumber: String, // رقم سند التسليم الرسمي

    @ColumnInfo(name = "delivery_date")
    val deliveryDate: Long, // تاريخ التسليم

    @ColumnInfo(name = "received_by_name")
    val receivedByName: String, // اسم المستلم (صاحب الجواز أو وكيله)

    @ColumnInfo(name = "receiver_id_number")
    val receiverIdNumber: String, // رقم بطاقة المستلم

    @ColumnInfo(name = "receiver_phone")
    val receiverPhone: String?,

    @ColumnInfo(name = "delivery_authority_order")
    val deliveryAuthorityOrder: String, // أمر الإفراج والتسليم برقم وتاريخ

    @ColumnInfo(name = "officer_delivering")
    val officerDelivering: String, // الضابط المسلِّم

    @ColumnInfo(name = "notes")
    val notes: String? = null,

    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)
