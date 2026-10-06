package com.yemen.portssecurity.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * ملحق 2: وحدة المطور (الوحدة 14)
 * Developer Customization Module - Room Entities
 */

// جدول 1: field_definitions — تعريف الحقول
@Entity(
    tableName = "field_definitions",
    indices = [Index(value = ["entity_type", "field_key"], unique = true)]
)
data class FieldDefinitionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "entity_type")
    val entityType: String, // refugee, foreigner, passenger, seizure, passport, intelligence

    @ColumnInfo(name = "field_key")
    val fieldKey: String, // sect, tribe, custom_1

    @ColumnInfo(name = "label_ar")
    val labelAr: String,

    @ColumnInfo(name = "label_en")
    val labelEn: String? = null,

    @ColumnInfo(name = "field_type")
    val fieldType: String, // text, number, date, dropdown, checkbox, textarea, phone, email, file

    @ColumnInfo(name = "list_code")
    val listCode: String? = null,

    @ColumnInfo(name = "is_required")
    val isRequired: Boolean = false,

    @ColumnInfo(name = "is_system")
    val isSystem: Boolean = false,

    @ColumnInfo(name = "is_visible")
    val isVisible: Boolean = true,

    @ColumnInfo(name = "default_value")
    val defaultValue: String? = null,

    @ColumnInfo(name = "display_order")
    val displayOrder: Int = 999,

    @ColumnInfo(name = "group_name")
    val groupName: String? = "عام",

    @ColumnInfo(name = "help_text")
    val helpText: String? = null,

    @ColumnInfo(name = "storage_strategy")
    val storageStrategy: String = "eav", // 'column' أو 'eav'

    @ColumnInfo(name = "created_at")
    val createdAt: String
)

// جدول 2: custom_field_values — EAV لحقول المستخدم
@Entity(
    tableName = "custom_field_values",
    indices = [Index(value = ["entity_type", "entity_id", "field_key"], unique = true)]
)
data class CustomFieldValueEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "entity_type")
    val entityType: String,

    @ColumnInfo(name = "entity_id")
    val entityId: String,

    @ColumnInfo(name = "field_key")
    val fieldKey: String,

    @ColumnInfo(name = "value_text")
    val valueText: String? = null,

    @ColumnInfo(name = "value_number")
    val valueNumber: Double? = null,

    @ColumnInfo(name = "value_date")
    val valueDate: String? = null,

    @ColumnInfo(name = "value_bool")
    val valueBool: Boolean? = null,

    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)

// جدول 3: label_overrides — تعديل تسميات الحقول
@Entity(
    tableName = "label_overrides",
    indices = [Index(value = ["entity_type", "field_key", "language"], unique = true)]
)
data class LabelOverrideEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "entity_type")
    val entityType: String,

    @ColumnInfo(name = "field_key")
    val fieldKey: String,

    @ColumnInfo(name = "original_label")
    val originalLabel: String,

    @ColumnInfo(name = "new_label")
    val newLabel: String,

    @ColumnInfo(name = "language")
    val language: String = "ar",

    @ColumnInfo(name = "created_at")
    val createdAt: String
)

// جدول 4: list_definitions & list_values — قوائم الاختيار
@Entity(
    tableName = "list_definitions",
    indices = [Index(value = ["list_code"], unique = true)]
)
data class ListDefinitionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "list_code")
    val listCode: String,

    @ColumnInfo(name = "list_name_ar")
    val listNameAr: String,

    @ColumnInfo(name = "description")
    val description: String? = null,

    @ColumnInfo(name = "is_system")
    val isSystem: Boolean = false,

    @ColumnInfo(name = "created_at")
    val createdAt: String
)

@Entity(
    tableName = "list_values",
    indices = [Index(value = ["list_code", "value_ar"], unique = true)]
)
data class ListValueEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "list_code")
    val listCode: String,

    @ColumnInfo(name = "value_ar")
    val valueAr: String,

    @ColumnInfo(name = "value_en")
    val valueEn: String? = null,

    @ColumnInfo(name = "code")
    val code: String? = null,

    @ColumnInfo(name = "sort_order")
    val sortOrder: Int = 0,

    @ColumnInfo(name = "is_active")
    val isActive: Boolean = true,

    @ColumnInfo(name = "is_default")
    val isDefault: Boolean = false,

    @ColumnInfo(name = "created_at")
    val createdAt: String
)

// جدول 5: auto_field_rules — الحقول التلقائية
@Entity(
    tableName = "auto_field_rules",
    indices = [Index(value = ["entity_type", "field_key"], unique = true)]
)
data class AutoFieldRuleEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "entity_type")
    val entityType: String,

    @ColumnInfo(name = "field_key")
    val fieldKey: String,

    @ColumnInfo(name = "rule_type")
    val ruleType: String = "sequence",

    @ColumnInfo(name = "rule_pattern")
    val rulePattern: String, // محضر-{YYYY}-{NNNNN}

    @ColumnInfo(name = "reset_period")
    val resetPeriod: String = "yearly",

    @ColumnInfo(name = "current_counter")
    val currentCounter: Long = 0,

    @ColumnInfo(name = "counter_padding")
    val counterPadding: Int = 5,

    @ColumnInfo(name = "preview_example")
    val previewExample: String? = null,

    @ColumnInfo(name = "is_active")
    val isActive: Boolean = true,

    @ColumnInfo(name = "created_at")
    val createdAt: String
)

// جدول 6: print_templates — قوالب الطباعة
@Entity(
    tableName = "print_templates",
    indices = [Index(value = ["template_code"], unique = true)]
)
data class PrintTemplateEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "template_code")
    val templateCode: String,

    @ColumnInfo(name = "template_name_ar")
    val templateNameAr: String,

    @ColumnInfo(name = "entity_type")
    val entityType: String,

    @ColumnInfo(name = "page_size")
    val pageSize: String = "A4",

    @ColumnInfo(name = "orientation")
    val orientation: String = "portrait",

    @ColumnInfo(name = "header_html")
    val headerHtml: String? = null,

    @ColumnInfo(name = "body_html")
    val bodyHtml: String,

    @ColumnInfo(name = "footer_html")
    val footerHtml: String? = null,

    @ColumnInfo(name = "is_active")
    val isActive: Boolean = true,

    @ColumnInfo(name = "created_at")
    val createdAt: String
)

// جدول 7: schema_snapshots — لقطات الهيكل
@Entity(tableName = "schema_snapshots")
data class SchemaSnapshotEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "snapshot_name")
    val snapshotName: String,

    @ColumnInfo(name = "snapshot_type")
    val snapshotType: String = "manual",

    @ColumnInfo(name = "snapshot_data_json")
    val snapshotDataJson: String,

    @ColumnInfo(name = "created_by")
    val createdBy: String,

    @ColumnInfo(name = "created_at")
    val createdAt: String
)
