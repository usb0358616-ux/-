package com.yemen.portssecurity.data.local.dao

import androidx.room.*
import com.yemen.portssecurity.data.local.entities.*
import kotlinx.coroutines.flow.Flow

@Dao
interface DeveloperMetadataDao {
    // 1. Field Definitions
    @Query("SELECT * FROM field_definitions WHERE entity_type = :entityType ORDER BY display_order ASC")
    fun getFieldsForEntity(entityType: String): Flow<List<FieldDefinitionEntity>>

    @Query("SELECT * FROM field_definitions ORDER BY entity_type ASC, display_order ASC")
    fun getAllFields(): Flow<List<FieldDefinitionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertField(field: FieldDefinitionEntity): Long

    @Update
    suspend fun updateField(field: FieldDefinitionEntity)

    @Delete
    suspend fun deleteField(field: FieldDefinitionEntity)

    // 2. Custom Field Values (EAV)
    @Query("SELECT * FROM custom_field_values WHERE entity_type = :entityType AND entity_id = :entityId")
    fun getCustomValuesForRecord(entityType: String, entityId: String): Flow<List<CustomFieldValueEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateCustomValue(value: CustomFieldValueEntity): Long

    // 3. Label Overrides
    @Query("SELECT * FROM label_overrides")
    fun getAllLabelOverrides(): Flow<List<LabelOverrideEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLabelOverride(override: LabelOverrideEntity): Long

    @Query("DELETE FROM label_overrides WHERE id = :id")
    suspend fun deleteLabelOverride(id: Long)

    // 4. List Definitions & Values
    @Query("SELECT * FROM list_definitions ORDER BY list_name_ar ASC")
    fun getAllLists(): Flow<List<ListDefinitionEntity>>

    @Query("SELECT * FROM list_values WHERE list_code = :listCode AND is_active = 1 ORDER BY sort_order ASC")
    fun getListValues(listCode: String): Flow<List<ListValueEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertListDefinition(listDef: ListDefinitionEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertListValue(listVal: ListValueEntity): Long

    // 5. Auto Field Rules
    @Query("SELECT * FROM auto_field_rules WHERE entity_type = :entityType AND field_key = :fieldKey AND is_active = 1 LIMIT 1")
    suspend fun getRuleForField(entityType: String, fieldKey: String): AutoFieldRuleEntity?

    @Query("SELECT * FROM auto_field_rules ORDER BY entity_type ASC")
    fun getAllAutoFieldRules(): Flow<List<AutoFieldRuleEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAutoFieldRule(rule: AutoFieldRuleEntity): Long

    @Update
    suspend fun updateAutoFieldRule(rule: AutoFieldRuleEntity)

    // 6. Print Templates
    @Query("SELECT * FROM print_templates WHERE is_active = 1")
    fun getAllPrintTemplates(): Flow<List<PrintTemplateEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPrintTemplate(template: PrintTemplateEntity): Long

    // 7. Schema Snapshots
    @Query("SELECT * FROM schema_snapshots ORDER BY id DESC")
    fun getAllSnapshots(): Flow<List<SchemaSnapshotEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSnapshot(snapshot: SchemaSnapshotEntity): Long
}
