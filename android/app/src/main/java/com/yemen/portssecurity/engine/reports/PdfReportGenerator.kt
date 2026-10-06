package com.yemen.portssecurity.engine.reports

import android.content.Context
import com.itextpdf.kernel.colors.ColorConstants
import com.itextpdf.kernel.colors.DeviceRgb
import com.itextpdf.kernel.geom.PageSize
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.layout.Document
import com.itextpdf.layout.borders.Border
import com.itextpdf.layout.borders.SolidBorder
import com.itextpdf.layout.element.Cell
import com.itextpdf.layout.element.Paragraph
import com.itextpdf.layout.element.Table
import com.itextpdf.layout.properties.HorizontalAlignment
import com.itextpdf.layout.properties.TextAlignment
import com.itextpdf.layout.properties.UnitValue
import com.yemen.portssecurity.data.local.entities.SeizureRecordEntity
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

/**
 * وحدة توليد التقارير السيادية الرسمية باستخدام مكتبة iText 7 Core
 * تحول بيانات "محاضر الضبط" و"إحصائيات الجوازات" إلى مستندات PDF رسمية قابلة للطباعة
 */
class PdfReportGenerator(private val context: Context) {

    // ألوان الهوية السيادية الرسمية لوزارة الداخلية
    private val navyBlue = DeviceRgb(15, 23, 42) // Slate 900
    private val headerBg = DeviceRgb(241, 245, 249) // Slate 100
    private val accentRed = DeviceRgb(153, 27, 27) // Red 800
    private val goldYellow = DeviceRgb(180, 83, 9) // Amber 700
    private val borderGray = DeviceRgb(203, 213, 225) // Slate 300

    /**
     * 1. تقرير محاضر الضبط بالمنافذ (Seizure Records Official Report)
     */
    fun generateSeizureRecordsPdf(
        records: List<SeizureRecordEntity>,
        reportTitle: String = "تقرير محاضر الضبط وحجز الجوازات والوثائق بالمنافذ",
        officerName: String = "العميد / مدير الإدارة العامة للمنافذ",
        outputFile: File
    ): File {
        val writer = PdfWriter(FileOutputStream(outputFile))
        val pdfDoc = PdfDocument(writer)
        pdfDoc.defaultPageSize = PageSize.A4.rotate() // وضع أفقي لاستيعاب الأعمدة
        val doc = Document(pdfDoc)
        doc.setMargins(25f, 25f, 25f, 25f)

        // 1. ترويسة التقرير الرسمية
        addOfficialHeader(doc, reportTitle)

        // 2. بطاقات الإحصاء الموجز (KPI Summary)
        val totalRecords = records.size
        val totalPassports = records.sumOf { it.passportCount }
        val completedCount = records.count { it.status == "مكتمل" }
        val pendingCount = records.count { it.status == "قيد التدقيق" || it.status == "قيد الفحص" }

        val summaryTable = Table(UnitValue.createPercentArray(floatArrayOf(25f, 25f, 25f, 25f)))
        summaryTable.setWidth(UnitValue.createPercentValue(100f))
        summaryTable.setMarginBottom(15f)

        addKpiCell(summaryTable, "إجمالي محاضر الضبط", totalRecords.toString(), navyBlue)
        addKpiCell(summaryTable, "إجمالي الجوازات المضبوطة", totalPassports.toString(), accentRed)
        addKpiCell(summaryTable, "محاضر مكتملة ومحالة", completedCount.toString(), DeviceRgb(16, 185, 129))
        addKpiCell(summaryTable, "محاضر قيد الفحص والتدقيق", pendingCount.toString(), goldYellow)
        doc.add(summaryTable)

        // 3. جدول بيانات محاضر الضبط
        val table = Table(UnitValue.createPercentArray(floatArrayOf(15f, 15f, 12f, 14f, 10f, 22f, 12f)))
        table.setWidth(UnitValue.createPercentValue(100f))

        // عناوين الأعمدة
        val headers = arrayOf("رقم المحضر", "المنفذ السيادي", "تاريخ الضبط", "الضابط المسؤول", "عدد الجوازات", "نوع المخالفة والسبب", "الحالة")
        for (header in headers) {
            val cell = Cell()
                .add(Paragraph(header).setBold().setFontSize(10f).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(navyBlue)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(6f)
            table.addHeaderCell(cell)
        }

        // صفوف البيانات
        for ((index, item) in records.withIndex()) {
            val bgColor = if (index % 2 == 0) ColorConstants.WHITE else headerBg

            table.addCell(createDataCell(item.recordNumber, bgColor, isBold = true, TextAlignment.CENTER))
            table.addCell(createDataCell(item.portName, bgColor, isBold = false, TextAlignment.RIGHT))
            table.addCell(createDataCell(item.seizureDate, bgColor, isBold = false, TextAlignment.CENTER))
            table.addCell(createDataCell("${item.officerRank} / ${item.officerName}", bgColor, isBold = false, TextAlignment.RIGHT))
            table.addCell(createDataCell("${item.passportCount} جواز", bgColor, isBold = true, TextAlignment.CENTER))
            table.addCell(createDataCell(item.violationType, bgColor, isBold = false, TextAlignment.RIGHT))
            table.addCell(createDataCell(item.status, bgColor, isBold = true, TextAlignment.CENTER))
        }

        doc.add(table)

        // 4. تذييل التقرير والتوقيعات
        addOfficialSignatures(doc, officerName)

        doc.close()
        return outputFile
    }

    /**
     * 2. تقرير إحصائيات الجوازات والمتابعة (Passport Inventory & Statistics Report)
     */
    fun generatePassportStatisticsPdf(
        statusDistribution: Map<String, Int>,
        portDistribution: Map<String, Int>,
        nationalityDistribution: Map<String, Int>,
        totalPassportsCount: Int,
        officerName: String = "العقيد / مدير إدارة المتابعة والتدقيق",
        outputFile: File
    ): File {
        val writer = PdfWriter(FileOutputStream(outputFile))
        val pdfDoc = PdfDocument(writer)
        pdfDoc.defaultPageSize = PageSize.A4 // وضع رأسي
        val doc = Document(pdfDoc)
        doc.setMargins(25f, 25f, 25f, 25f)

        // الترويسة
        addOfficialHeader(doc, "تقرير إحصائيات وتصنيف الجوازات والوثائق بالمنظومة")

        // ملخص عام
        val generalKpiTable = Table(UnitValue.createPercentArray(floatArrayOf(50f, 50f)))
        generalKpiTable.setWidth(UnitValue.createPercentValue(100f))
        generalKpiTable.setMarginBottom(15f)
        addKpiCell(generalKpiTable, "إجمالي الجوازات المسجلة بالمنظومة", totalPassportsCount.toString(), navyBlue)
        addKpiCell(generalKpiTable, "تاريخ إصدار الإحصائية", SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US).format(Date()), DeviceRgb(71, 85, 105))
        doc.add(generalKpiTable)

        // جدول 1: توزيع الحالات الإجرائية
        doc.add(Paragraph("أولاً: تصنيف الجوازات حسب الحالة الإجرائية")
            .setBold().setFontSize(12f).setFontColor(navyBlue).setMarginBottom(6f))

        val statusTable = Table(UnitValue.createPercentArray(floatArrayOf(60f, 20f, 20f)))
        statusTable.setWidth(UnitValue.createPercentValue(100f))
        statusTable.setMarginBottom(15f)

        statusTable.addHeaderCell(createHeaderCell("الحالة الإجرائية"))
        statusTable.addHeaderCell(createHeaderCell("العدد"))
        statusTable.addHeaderCell(createHeaderCell("النسبة"))

        for ((status, count) in statusDistribution) {
            val percentage = if (totalPassportsCount > 0) String.format(Locale.US, "%.1f%%", (count.toFloat() / totalPassportsCount) * 100) else "0%"
            statusTable.addCell(createDataCell(status, ColorConstants.WHITE, false, TextAlignment.RIGHT))
            statusTable.addCell(createDataCell(count.toString(), ColorConstants.WHITE, true, TextAlignment.CENTER))
            statusTable.addCell(createDataCell(percentage, ColorConstants.WHITE, false, TextAlignment.CENTER))
        }
        doc.add(statusTable)

        // جدول 2: توزيع الجوازات حسب المنفذ
        doc.add(Paragraph("ثانياً: التوزيع الجغرافي للمضبوطات حسب المنافذ السيادية")
            .setBold().setFontSize(12f).setFontColor(navyBlue).setMarginBottom(6f))

        val portTable = Table(UnitValue.createPercentArray(floatArrayOf(70f, 30f)))
        portTable.setWidth(UnitValue.createPercentValue(100f))
        portTable.setMarginBottom(15f)

        portTable.addHeaderCell(createHeaderCell("اسم المنفذ"))
        portTable.addHeaderCell(createHeaderCell("عدد الجوازات المحتجزة"))

        for ((port, count) in portDistribution) {
            portTable.addCell(createDataCell(port, ColorConstants.WHITE, false, TextAlignment.RIGHT))
            portTable.addCell(createDataCell(count.toString(), ColorConstants.WHITE, true, TextAlignment.CENTER))
        }
        doc.add(portTable)

        // جدول 3: توزيع الجنسيات
        doc.add(Paragraph("ثالثاً: توزيع حاملي الجوازات حسب الجنسية")
            .setBold().setFontSize(12f).setFontColor(navyBlue).setMarginBottom(6f))

        val natTable = Table(UnitValue.createPercentArray(floatArrayOf(70f, 30f)))
        natTable.setWidth(UnitValue.createPercentValue(100f))
        natTable.setMarginBottom(20f)

        natTable.addHeaderCell(createHeaderCell("الجنسية"))
        natTable.addHeaderCell(createHeaderCell("عدد الجوازات"))

        for ((nat, count) in nationalityDistribution) {
            natTable.addCell(createDataCell(nat, ColorConstants.WHITE, false, TextAlignment.RIGHT))
            natTable.addCell(createDataCell(count.toString(), ColorConstants.WHITE, true, TextAlignment.CENTER))
        }
        doc.add(natTable)

        // التوقيعات الرسمية
        addOfficialSignatures(doc, officerName)

        doc.close()
        return outputFile
    }

    // --- الدوال المساعدة للتنسيق والترويسة ---

    private fun addOfficialHeader(doc: Document, title: String) {
        val headerTable = Table(UnitValue.createPercentArray(floatArrayOf(30f, 40f, 30f)))
        headerTable.setWidth(UnitValue.createPercentValue(100f))
        headerTable.setMarginBottom(10f)

        // اليمين
        val rightCell = Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT)
            .add(Paragraph("الجمهورية اليمنية").setBold().setFontSize(11f))
            .add(Paragraph("وزارة الداخلية").setBold().setFontSize(10f))
            .add(Paragraph("مصلحة الهجرة والجوازات والجنسية").setFontSize(9f))
            .add(Paragraph("قطاع استخبارات الشرطة والمنافذ").setFontSize(9f))
        headerTable.addCell(rightCell)

        // الوسط
        val centerCell = Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER)
            .add(Paragraph("بسم الله الرحمن الرحيم").setBold().setFontSize(11f))
            .add(Paragraph("شعــــار الجمهورية").setFontSize(8f).setFontColor(ColorConstants.GRAY))
            .add(Paragraph(title).setBold().setFontSize(14f).setFontColor(accentRed).setMarginTop(4f))
        headerTable.addCell(centerCell)

        // اليسار (التاريخ والأرقام)
        val now = Date()
        val dateStr = SimpleDateFormat("yyyy/MM/dd", Locale.US).format(now)
        val timeStr = SimpleDateFormat("HH:mm", Locale.US).format(now)
        val refNumber = "REP-" + System.currentTimeMillis().toString().takeLast(6)

        val leftCell = Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.LEFT)
            .add(Paragraph("الرقـم المرجعي: $refNumber").setFontSize(9f).setFontColor(navyBlue))
            .add(Paragraph("تاريخ التقرير: $dateStr م").setFontSize(9f))
            .add(Paragraph("وقت الطباعة: $timeStr").setFontSize(9f))
            .add(Paragraph("درجة السرية: سري وهام").setFontSize(9f).setFontColor(accentRed).setBold())
        headerTable.addCell(leftCell)

        doc.add(headerTable)

        // خط فاصل سيادي
        val divider = Table(UnitValue.createPercentArray(floatArrayOf(100f)))
            .setWidth(UnitValue.createPercentValue(100f))
            .setBorder(SolidBorder(navyBlue, 2f))
            .setMarginBottom(12f)
        doc.add(divider)
    }

    private fun addKpiCell(table: Table, label: String, value: String, color: DeviceRgb) {
        val cell = Cell()
            .add(Paragraph(label).setFontSize(9f).setFontColor(ColorConstants.GRAY).setTextAlignment(TextAlignment.CENTER))
            .add(Paragraph(value).setBold().setFontSize(16f).setFontColor(color).setTextAlignment(TextAlignment.CENTER))
            .setBackgroundColor(headerBg)
            .setBorder(SolidBorder(borderGray, 1f))
            .setPadding(8f)
        table.addCell(cell)
    }

    private fun createHeaderCell(text: String): Cell {
        return Cell()
            .add(Paragraph(text).setBold().setFontSize(10f).setFontColor(ColorConstants.WHITE))
            .setBackgroundColor(navyBlue)
            .setTextAlignment(TextAlignment.CENTER)
            .setPadding(6f)
    }

    private fun createDataCell(text: String, bgColor: com.itextpdf.kernel.colors.Color, isBold: Boolean, align: TextAlignment): Cell {
        val p = Paragraph(text).setFontSize(9f).setTextAlignment(align)
        if (isBold) p.setBold()
        return Cell()
            .add(p)
            .setBackgroundColor(bgColor)
            .setBorder(SolidBorder(borderGray, 0.5f))
            .setPadding(5f)
    }

    private fun addOfficialSignatures(doc: Document, officerName: String) {
        val sigTable = Table(UnitValue.createPercentArray(floatArrayOf(50f, 50f)))
            .setWidth(UnitValue.createPercentValue(100f))
            .setMarginTop(25f)
            .setBorder(Border.NO_BORDER)

        val officerCell = Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER)
            .add(Paragraph("المحرر والضابط المسؤول").setBold().setFontSize(10f))
            .add(Paragraph(officerName).setFontSize(10f).setMarginTop(4f))
            .add(Paragraph("التوقيع: ...........................").setFontSize(9f).setMarginTop(15f))

        val stampCell = Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER)
            .add(Paragraph("يعتمد / مدير عام قطاع استخبارات الشرطة والمنافذ").setBold().setFontSize(10f))
            .add(Paragraph("اللواء الركن / رئيس المصلحة").setFontSize(10f).setMarginTop(4f))
            .add(Paragraph("[ الختم الرسمي السيادي ]").setFontSize(9f).setFontColor(accentRed).setBold().setMarginTop(15f))

        sigTable.addCell(officerCell)
        sigTable.addCell(stampCell)

        doc.add(sigTable)
    }
}
