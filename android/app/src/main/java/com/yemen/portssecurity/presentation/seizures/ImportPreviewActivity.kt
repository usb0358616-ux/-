package com.yemen.portssecurity.presentation.seizures

import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.yemen.portssecurity.PortsSecurityApp
import com.yemen.portssecurity.R
import com.yemen.portssecurity.core.session.SessionManager
import com.yemen.portssecurity.data.local.entities.SeizedPassportEntity
import com.yemen.portssecurity.data.local.entities.SeizureRecordEntity
import com.yemen.portssecurity.data.repository.SeizureRepository
import com.yemen.portssecurity.databinding.ActivityImportPreviewBinding
import com.yemen.portssecurity.databinding.ItemExcelPreviewRowBinding
import com.yemen.portssecurity.engine.excel.ParsedExcelRow
import com.yemen.portssecurity.engine.excel.RecordStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

/**
 * شاشة استعراض ومعاينة سجلات Excel قبل الحفظ والاعتماد في قاعدة البيانات المشفرة
 */
class ImportPreviewActivity : AppCompatActivity() {

    companion object {
        var currentRecordsToPreview: List<ParsedExcelRow> = emptyList()
    }

    private lateinit var binding: ActivityImportPreviewBinding
    private lateinit var seizureRepository: SeizureRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityImportPreviewBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val app = application as PortsSecurityApp
        seizureRepository = SeizureRepository(
            app.database.seizureDao(),
            app.database.auditLogDao()
        )

        val records = currentRecordsToPreview
        binding.tvCountBadge.text = "${records.size} سجل"

        binding.rvPreviewRecords.layoutManager = LinearLayoutManager(this)
        binding.rvPreviewRecords.adapter = PreviewAdapter(records)

        val validRecords = records.filter { it.status != RecordStatus.ERROR }
        binding.btnCommitImport.text = "اعتماد واستيراد (${validRecords.size}) سجل صالح"

        binding.btnCommitImport.setOnClickListener {
            if (validRecords.isEmpty()) {
                Toast.makeText(this, "لا توجد سجلات صالحة للاستيراد في هذا الكشف", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            commitRecordsToDatabase(validRecords)
        }
    }

    private fun commitRecordsToDatabase(records: List<ParsedExcelRow>) {
        binding.btnCommitImport.isEnabled = false

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                // 1. إنشاء رأس محضر ضبط تجميعي لهذه الدفعة المستوردة
                val recordNumber = records.firstOrNull()?.reportNumber ?: "محضر-استيراد-${System.currentTimeMillis().toString().takeLast(6)}"
                val portName = records.firstOrNull()?.portName ?: "منفذ الوديعة البري"

                val seizureRecord = SeizureRecordEntity(
                    id = UUID.randomUUID().toString(),
                    recordNumber = recordNumber,
                    portId = "PORT-IMPORT",
                    portName = portName,
                    portType = "بري",
                    seizureDate = System.currentTimeMillis(),
                    seizureTime = "10:00 صباحاً",
                    officerName = SessionManager.getOfficerDisplayTitle(),
                    officerRank = SessionManager.currentSession.value?.user?.rank ?: "ضابط استيراد",
                    authority = "استيراد ذكي من كشف Excel",
                    violationType = "اشتباه أمني وفحص كشف جماعي",
                    violationDescription = "تم استيراد الكشف آلياً عبر محرك Excel الذكي للتدقيق المركزي",
                    sourceOfSeizure = "كشف عمليات المنافذ",
                    passportCount = records.size,
                    status = "قيد التدقيق",
                    createdByUserId = SessionManager.getUserId() ?: "SYSTEM"
                )

                // 2. تحويل الصفوف المستخرجة إلى كيانات الجوازات المضبوطة
                val passportEntities = records.map { row ->
                    SeizedPassportEntity(
                        id = UUID.randomUUID().toString(),
                        seizureRecordId = seizureRecord.id,
                        passportNumber = row.passportNumber,
                        fullNameAr = row.fullNameAr,
                        fullNameEn = row.fullNameEn,
                        nationality = row.nationality,
                        profession = row.profession,
                        employer = row.employer,
                        birthDate = row.birthDate,
                        securityResult = "قيد التدقيق"
                    )
                }

                // 3. الحفظ في قاعدة البيانات المشفرة
                seizureRepository.createSeizureRecord(seizureRecord, passportEntities)

                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@ImportPreviewActivity,
                        "تم اعتماد واستيراد ${passportEntities.size} سجل بنجاح في قاعدة البيانات المشفرة",
                        Toast.LENGTH_LONG
                    ).show()
                    finish()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.btnCommitImport.isEnabled = true
                    Toast.makeText(this@ImportPreviewActivity, "فشل الاعتماد: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private class PreviewAdapter(private val items: List<ParsedExcelRow>) :
        RecyclerView.Adapter<PreviewAdapter.ViewHolder>() {

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val binding = ItemExcelPreviewRowBinding.inflate(
                LayoutInflater.from(parent.context), parent, false
            )
            return ViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            holder.bind(items[position])
        }

        override fun getItemCount(): Int = items.size

        class ViewHolder(private val binding: ItemExcelPreviewRowBinding) :
            RecyclerView.ViewHolder(binding.root) {

            fun bind(item: ParsedExcelRow) {
                binding.tvPassportNumber.text = item.passportNumber.ifEmpty { "—" }
                binding.tvFullName.text = item.fullNameAr.ifEmpty { "بدون اسم" }

                val snippet = buildString {
                    append("الجنسية: ${item.nationality}")
                    if (!item.profession.isNullOrBlank()) append(" | المهنة: ${item.profession}")
                    if (!item.employer.isNullOrBlank()) append(" | الجهة: ${item.employer}")
                }
                binding.tvDetailsSnippet.text = snippet

                when (item.status) {
                    RecordStatus.VALID -> {
                        binding.tvStatusBadge.text = "✅ جاهز"
                        binding.tvStatusMessage.text = item.statusMessage
                        binding.tvStatusMessage.setTextColor(
                            binding.root.context.getColor(R.color.status_success)
                        )
                    }
                    RecordStatus.WARNING -> {
                        binding.tvStatusBadge.text = "⚠️ نقص ثانوي"
                        binding.tvStatusMessage.text = item.statusMessage
                        binding.tvStatusMessage.setTextColor(
                            binding.root.context.getColor(R.color.status_warning)
                        )
                    }
                    RecordStatus.ERROR -> {
                        binding.tvStatusBadge.text = "❌ غير صالح"
                        binding.tvStatusMessage.text = item.statusMessage
                        binding.tvStatusMessage.setTextColor(
                            binding.root.context.getColor(R.color.status_danger)
                        )
                    }
                }
            }
        }
    }
}
