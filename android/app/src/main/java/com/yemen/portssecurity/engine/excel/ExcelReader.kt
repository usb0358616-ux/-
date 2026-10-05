package com.yemen.portssecurity.engine.excel

import android.content.Context
import android.net.Uri
import org.apache.poi.ss.usermodel.Cell
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.ss.usermodel.DateUtil
import org.apache.poi.ss.usermodel.WorkbookFactory
import java.io.InputStream
import java.text.SimpleDateFormat
import java.util.Locale

/**
 * نتيجة فحص وحالة السجل المستخرج من الإكسل
 */
enum class RecordStatus {
    VALID,    // ✅ جاهز للاستيراد
    WARNING,  // ⚠️ حقل اختياري مفقود
    ERROR     // ❌ حقل إلزامي مفقود أو مكرر
}

/**
 * نموذج السجل المستخرج الموحد
 */
data class ParsedExcelRow(
    val rowIndex: Int,
    val passportNumber: String,
    val fullNameAr: String,
    val fullNameEn: String?,
    val nationality: String,
    val profession: String?,
    val employer: String?,
    val birthDate: String?,
    val reportNumber: String?,
    val portName: String?,
    val violationType: String?,
    val status: RecordStatus,
    val statusMessage: String,
    val rawValues: Map<String, String>
)

/**
 * قارئ ملفات Excel السيادي باستخدام Apache POI
 */
class ExcelReader(private val context: Context) {

    private val templateMemory = TemplateMemory(context)
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH)

    /**
     * معالجة ملف إكسل من Uri واستخراج كافة السجلات المفحوصة
     */
    fun parseExcelFile(fileUri: Uri, sheetIndex: Int = 0): List<ParsedExcelRow> {
        val inputStream: InputStream = context.contentResolver.openInputStream(fileUri)
            ?: throw IllegalArgumentException("تعذر فتح ملف الإكسل")

        val workbook = WorkbookFactory.create(inputStream)
        if (sheetIndex >= workbook.numberOfSheets) {
            throw IllegalArgumentException("ورقة العمل المطلوبة غير موجودة")
        }

        val sheet = workbook.getSheetAt(sheetIndex)
        val detection = HeaderDetector.detectHeaderRow(sheet)

        val headerRowIndex = detection.headerRowIndex
        val columnMap = detection.columnIndices.toMutableMap()

        // استكمال أي أعمدة غير معروفة من ذاكرة القوالب المحفوظة
        val headerRow = sheet.getRow(headerRowIndex)
        if (headerRow != null) {
            val lastCell = headerRow.lastCellNum.toInt()
            for (c in 0 until lastCell) {
                if (!columnMap.containsKey(c)) {
                    val rawName = headerRow.getCell(c)?.toString()?.trim() ?: ""
                    val learned = templateMemory.getMappedField(rawName)
                    if (learned != null) {
                        columnMap[c] = learned
                    }
                }
            }
        }

        val parsedRows = mutableListOf<ParsedExcelRow>()
        val seenPassports = mutableSetOf<String>()

        val lastRowNum = sheet.lastRowNum
        for (r in (headerRowIndex + 1)..lastRowNum) {
            val row = sheet.getRow(r) ?: continue
            val rowData = mutableMapOf<FieldDictionary.StandardField, String>()
            val rawMap = mutableMapOf<String, String>()

            var hasAnyData = false

            for ((colIdx, standardField) in columnMap) {
                val cell = row.getCell(colIdx)
                val value = getCellValueAsString(cell).trim()
                if (value.isNotEmpty()) {
                    hasAnyData = true
                    rowData[standardField] = value
                    rawMap[standardField.displayNameAr] = value
                }
            }

            if (!hasAnyData) continue // تخطي الأسطر الفارغة

            val passportNum = rowData[FieldDictionary.StandardField.PASSPORT_NUMBER] ?: ""
            val nameAr = rowData[FieldDictionary.StandardField.FULL_NAME_AR] ?: ""
            val nameEn = rowData[FieldDictionary.StandardField.FULL_NAME_EN]
            val nationality = rowData[FieldDictionary.StandardField.NATIONALITY] ?: "يمني"
            val profession = rowData[FieldDictionary.StandardField.PROFESSION]
            val employer = rowData[FieldDictionary.StandardField.EMPLOYER]
            val birthDate = rowData[FieldDictionary.StandardField.BIRTH_DATE]
            val reportNumber = rowData[FieldDictionary.StandardField.REPORT_NUMBER]
            val portName = rowData[FieldDictionary.StandardField.PORT_NAME]
            val violation = rowData[FieldDictionary.StandardField.NOTES]

            // التحقق وتحديد علامة الحالة (Status Badge)
            val status: RecordStatus
            val message: String

            when {
                passportNum.isBlank() -> {
                    status = RecordStatus.ERROR
                    message = "رقم الجواز مفقود (إلزامي)"
                }
                seenPassports.contains(passportNum.lowercase()) -> {
                    status = RecordStatus.ERROR
                    message = "رقم الجواز مكرر في هذا الكشف"
                }
                nameAr.isBlank() -> {
                    status = RecordStatus.ERROR
                    message = "اسم صاحب الجواز مفقود (إلزامي)"
                }
                profession.isNullOrBlank() || employer.isNullOrBlank() -> {
                    status = RecordStatus.WARNING
                    message = "مكتمل مع نقص بيانات ثانوية (المهنة أو جهة العمل)"
                    seenPassports.add(passportNum.lowercase())
                }
                else -> {
                    status = RecordStatus.VALID
                    message = "جاهز للاعتماد"
                    seenPassports.add(passportNum.lowercase())
                }
            }

            parsedRows.add(
                ParsedExcelRow(
                    rowIndex = r + 1,
                    passportNumber = passportNum,
                    fullNameAr = nameAr,
                    fullNameEn = nameEn,
                    nationality = nationality,
                    profession = profession,
                    employer = employer,
                    birthDate = birthDate,
                    reportNumber = reportNumber,
                    portName = portName,
                    violationType = violation,
                    status = status,
                    statusMessage = message,
                    rawValues = rawMap
                )
            )
        }

        workbook.close()
        inputStream.close()
        return parsedRows
    }

    private fun getCellValueAsString(cell: Cell?): String {
        if (cell == null) return ""
        return when (cell.cellType) {
            CellType.STRING -> cell.stringCellValue
            CellType.NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    try {
                        dateFormat.format(cell.dateCellValue)
                    } catch (_: Exception) {
                        cell.numericCellValue.toLong().toString()
                    }
                } else {
                    val num = cell.numericCellValue
                    if (num == num.toLong().toDouble()) {
                        num.toLong().toString()
                    } else {
                        num.toString()
                    }
                }
            }
            CellType.BOOLEAN -> cell.booleanCellValue.toString()
            CellType.FORMULA -> {
                try {
                    cell.stringCellValue
                } catch (_: Exception) {
                    try {
                        cell.numericCellValue.toLong().toString()
                    } catch (_: Exception) {
                        ""
                    }
                }
            }
            else -> ""
        }
    }
}
