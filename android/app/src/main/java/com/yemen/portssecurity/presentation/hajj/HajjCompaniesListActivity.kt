package com.yemen.portssecurity.presentation.hajj

import android.os.Bundle
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import com.yemen.portssecurity.R
import com.yemen.portssecurity.databinding.ActivitySovereignGenericListBinding

/**
 * شاشة الرقابة على شركات تفويج الحج والعمرة وشركات الصرافة والتوظيف والسياحة
 */
class HajjCompaniesListActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySovereignGenericListBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySovereignGenericListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.apply {
            title = getString(R.string.title_hajj_companies)
            setDisplayHomeAsUpEnabled(true)
        }

        setupUI()
    }

    private fun setupUI() {
        val columns = resources.getInteger(R.integer.list_grid_columns)
        binding.rvList.layoutManager = GridLayoutManager(this, columns)

        binding.tvTotalRecords.text = "إجمالي الشركات والوكالات المراقبة: 154 شركة"
        binding.tvActiveStatus.text = "فحص استخبارات الشرطة 1191/1917: نشط"

        binding.swipeRefresh.setOnRefreshListener {
            binding.swipeRefresh.isRefreshing = false
            Toast.makeText(this, "تم تحديث سجلات الشركات والوكالات", Toast.LENGTH_SHORT).show()
        }

        binding.fabAdd.setOnClickListener {
            Toast.makeText(this, "قيد شركة أو وكالة جديدة تحت الرقابة", Toast.LENGTH_SHORT).show()
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
