package com.yemen.portssecurity.presentation.developer

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.yemen.portssecurity.R

/**
 * شاشة وحدة المطور (الوحدة 14) لنظام أندرويد
 * تتيح لـ super_admin إدارة الحقول EAV وتعديل التسميات وقواعد الترقيم التلقائي
 */
class DeveloperModuleActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // تهيئة وحدة المطور السيادية
        supportActionBar?.apply {
            title = "وحدة المطور (تخصيص المنظومة)"
            setDisplayHomeAsUpEnabled(true)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}
