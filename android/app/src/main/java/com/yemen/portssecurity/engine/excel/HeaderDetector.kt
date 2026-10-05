package com.yemen.portssecurity.engine.excel

import org.apache.poi.ss.usermodel.Row
import org.apache.poi.ss.usermodel.Sheet

/**
 * المكون 2: كاشف صف العناوين الديناميكي (Header Detector)
 * يبحث في أول 15 صفاً ويحسب الكلمات المفتاحية المعروفة لاختيار الصف الذي يحوي العناوين الحقيقية
 */
object HeaderDetector {

    private const val MAX_SCAN_ROWS = 15

    data class DetectionResult(
        val headerRowIndex: Int,
        val matchedFieldsCount: Int,
        val columnIndices: Map<Int, FieldDictionary.StandardField>
    )

    /**
     * فحص أسطر ورقة العمل لتحديد صف العناوين بدقة
     */
    fun detectHeaderRow(sheet: Sheet): DetectionResult {
        var bestRowIndex = 0
        var maxMatches = 0
        var bestColumnMap = emptyMap<Int, FieldDictionary.StandardField>()

        val lastRowToScan = minOf(sheet.lastRowNum, MAX_SCAN_ROWS - 1)

        for (rowIndex in 0..lastRowToScan) {
            val row = sheet.getRow(rowIndex) ?: continue
            val columnMap = mutableMapOf<Int, FieldDictionary.StandardField>()
            var matchesInRow = 0

            val lastCellNum = row.lastCellNum.toInt()
            for (cellIndex in 0 until lastCellNum) {
                val cell = row.getCell(cellIndex) ?: continue
                val cellValue = cell.toString().trim()
                if (cellValue.isBlank()) continue

                val matchedField = FuzzyMatcher.findBestMatch(cellValue)
                if (matchedField != null && !columnMap.containsValue(matchedField)) {
                    columnMap[cellIndex] = matchedField
                    matchesInRow++
                }
            }

            if (matchesInRow > maxMatches) {
                maxMatches = matchesInRow
                bestRowIndex = rowIndex
                bestColumnMap = columnMap
            }
        }

        return DetectionResult(
            headerRowIndex = bestRowIndex,
            matchedFieldsCount = maxMatches,
            columnIndices = bestColumnMap
        )
    }
}
