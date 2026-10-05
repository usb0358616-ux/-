package com.yemen.portssecurity.engine.excel

import kotlin.math.min

/**
 * المكون 3: محرك المطابقة الضبابية (Fuzzy Matching)
 * يتجاهل الهمزات والتشكيل والمسافات الزائدة ويحسب Levenshtein Distance للأخطاء الإملائية
 */
object FuzzyMatcher {

    /**
     * تنظيف النص العربي من التشكيل والهمزات وتوحيد الحروف
     */
    fun normalizeArabic(text: String): String {
        var s = text.trim().lowercase()

        // إزالة التشكيل والتنوين
        s = s.replace(Regex("[\\u064B-\\u0652]"), "")
        s = s.replace(Regex("[\\u0670\\u0640]"), "") // التطويل والألف الخنجرية

        // توحيد الهمزات والألف
        s = s.replace('أ', 'ا')
        s = s.replace('إ', 'ا')
        s = s.replace('آ', 'ا')
        s = s.replace('ٱ', 'ا')

        // توحيد الياء والألف المقصورة والتاء المربوطة
        s = s.replace('ى', 'ي')
        s = s.replace('ة', 'ه')
        s = s.replace('ؤ', 'و')
        s = s.replace('ئ', 'ي')

        // إزالة الفواصل والرموز الخاصة
        s = s.replace(Regex("[_\\-\\./\\\\#:]"), " ")
        s = s.replace(Regex("\\s+"), " ")

        return s.trim()
    }

    /**
     * حساب مسافة Levenshtein بين نصين
     */
    fun levenshteinDistance(s1: String, s2: String): Int {
        val dp = Array(s1.length + 1) { IntArray(s2.length + 1) }

        for (i in 0..s1.length) dp[i][0] = i
        for (j in 0..s2.length) dp[0][j] = j

        for (i in 1..s1.length) {
            for (j in 1..s2.length) {
                val cost = if (s1[i - 1] == s2[j - 1]) 0 else 1
                dp[i][j] = min(
                    min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                    dp[i - 1][j - 1] + cost
                )
            }
        }
        return dp[s1.length][s2.length]
    }

    /**
     * مطابقة عنوان العمود القادم من ملف Excel مع القاموس الرسمي
     * يعيد نسبة التطابق (0.0 إلى 1.0)
     */
    fun calculateSimilarity(rawHeader: String, candidate: String): Double {
        val nRaw = normalizeArabic(rawHeader)
        val nCand = normalizeArabic(candidate)

        if (nRaw == nCand) return 1.0
        if (nRaw.contains(nCand) || nCand.contains(nRaw)) return 0.9

        val maxLen = maxOf(nRaw.length, nCand.length)
        if (maxLen == 0) return 1.0

        val distance = levenshteinDistance(nRaw, nCand)
        val score = 1.0 - (distance.toDouble() / maxLen.toDouble())
        return score
    }

    /**
     * البحث عن أفضل حقل قياسي يطابق عمود الإكسل
     */
    fun findBestMatch(rawHeader: String, threshold: Double = 0.75): FieldDictionary.StandardField? {
        var bestField: FieldDictionary.StandardField? = null
        var bestScore = 0.0

        for ((field, synonyms) in FieldDictionary.SYNONYMS_MAP) {
            for (synonym in synonyms) {
                val score = calculateSimilarity(rawHeader, synonym)
                if (score > bestScore && score >= threshold) {
                    bestScore = score
                    bestField = field
                }
            }
        }
        return bestField
    }
}
