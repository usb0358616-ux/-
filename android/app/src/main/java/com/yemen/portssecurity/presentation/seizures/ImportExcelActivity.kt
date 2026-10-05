package com.yemen.portssecurity.presentation.seizures

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.yemen.portssecurity.databinding.ActivityImportExcelBinding
import com.yemen.portssecurity.engine.excel.ExcelReader
import com.yemen.portssecurity.engine.excel.ParsedExcelRow
import com.yemen.portssecurity.engine.excel.RecordStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * شاشة استيراد وفحص كشوفات Excel الذكية
 */
class ImportExcelActivity : AppCompatActivity() {

    private lateinit var binding: ActivityImportExcelBinding
    private lateinit var excelReader: ExcelReader

    private var selectedUri: Uri? = null
    private var parsedResults: List<ParsedExcelRow> = emptyList()

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            selectedUri = uri
            binding.tvSelectedFileName.text = "تم اختيار الملف. جاري الفحص التلقائي..."
            processExcelFile(uri)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityImportExcelBinding.inflate(layoutInflater)
        setContentView(binding.root)

        excelReader = ExcelReader(this)

        binding.cardUploadArea.setOnClickListener {
            // فتح مستكشف الملفات لاختيار ملفات Excel
            filePickerLauncher.launch("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        }

        binding.btnProceedPreview.setOnClickListener {
            if (parsedResults.isNotEmpty()) {
                // الانتقال لشاشة المعاينة قبل الحفظ
                ImportPreviewActivity.currentRecordsToPreview = parsedResults
                val intent = Intent(this, ImportPreviewActivity::class.java)
                startActivity(intent)
            }
        }
    }

    private fun processExcelFile(uri: Uri) {
        binding.pbParsing.visibility = View.VISIBLE
        binding.btnProceedPreview.isEnabled = false

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val results = excelReader.parseExcelFile(uri)
                parsedResults = results

                val validCount = results.count { it.status == RecordStatus.VALID }
                val warningCount = results.count { it.status == RecordStatus.WARNING }
                val errorCount = results.count { it.status == RecordStatus.ERROR }

                withContext(Dispatchers.Main) {
                    binding.pbParsing.visibility = View.GONE
                    binding.cardScanSummary.visibility = View.VISIBLE

                    binding.tvSelectedFileName.text = "تم تحليل الكشف: ${results.size} صفاً"
                    binding.tvSummaryValid.text = "✅ السجلات المكتملة والجاهزة: $validCount"
                    binding.tvSummaryWarning.text = "⚠️ سجلات بنقص بيانات ثانوية: $warningCount"
                    binding.tvSummaryErrors.text = "❌ سجلات غير صالحة أو مكررة: $errorCount"

                    binding.btnProceedPreview.isEnabled = (validCount + warningCount) > 0
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.pbParsing.visibility = View.GONE
                    Toast.makeText(this@ImportExcelActivity, "خطأ في قراءة ملف الإكسل: ${e.message}", Toast.LENGTH_LONG).show()
                    binding.tvSelectedFileName.text = "فشل تحليل الملف. انقر لإعادة المحاولة"
                }
            }
        }
    }
}
