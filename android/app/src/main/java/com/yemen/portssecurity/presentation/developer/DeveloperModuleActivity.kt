package com.yemen.portssecurity.presentation.developer

import android.os.Bundle
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import com.yemen.portssecurity.R
import com.yemen.portssecurity.databinding.ActivitySovereignGenericListBinding

/**
 * شاشة وحدة المطور (الوحدة 14 السيادية) لنظام أندرويد
 * تتيح لـ super_admin إدارة الحقول EAV وتعديل التسميات وقواعد الترقيم التلقائي
 */
class DeveloperModuleActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySovereignGenericListBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySovereignGenericListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.apply {
            title = "وحدة المطور (تخصيص المنظومة - Unit 14)"
            setDisplayHomeAsUpEnabled(true)
        }

        setupUI()
    }

    private fun setupUI() {
        val columns = resources.getInteger(R.integer.list_grid_columns)
        binding.rvList.layoutManager = GridLayoutManager(this, columns)

        binding.tvTotalRecords.text = "محرك EAV الديناميكي | تعديل التسميات | الترقيم التلقائي"
        binding.tvActiveStatus.text = "حالة وحدة المطور: نشطة للمدير العام"

        binding.swipeRefresh.setOnRefreshListener {
            binding.swipeRefresh.isRefreshing = false
            Toast.makeText(this, "تم تحديث مخططات الهيكل وتخصيصات الحقول", Toast.LENGTH_SHORT).show()
        }

        binding.fabAdd.setOnClickListener {
            Toast.makeText(this, "إضافة حقل مخصص جديد (Custom Field EAV)", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            finish()
            return true
        }
        return super.onOptionsItemSelected(item)
    }
}
