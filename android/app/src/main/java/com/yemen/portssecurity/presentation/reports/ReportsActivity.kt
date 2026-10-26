package com.yemen.portssecurity.presentation.reports

import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import com.yemen.portssecurity.R
import com.yemen.portssecurity.databinding.ActivitySovereignGenericListBinding

/**
 * شاشة التقارير والإحصائيات التراكمية وتوليد كشوفات PDF و Excel
 */
class ReportsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySovereignGenericListBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySovereignGenericListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.apply {
            title = getString(R.string.title_reports)
            setDisplayHomeAsUpEnabled(true)
        }

        setupUI()
    }

    private fun setupUI() {
        val columns = resources.getInteger(R.integer.list_grid_columns)
        binding.rvList.layoutManager = GridLayoutManager(this, columns)

        binding.tvTotalRecords.text = "التقارير اليومية والشهرية والسلاسل الزمنية (30 يوماً)"
        binding.tvActiveStatus.text = "محرك iText 7: جاهز للطباعة"

        binding.swipeRefresh.setOnRefreshListener {
            binding.swipeRefresh.isRefreshing = false
            Toast.makeText(this, "تم تحديث المؤشرات الإحصائية", Toast.LENGTH_SHORT).show()
        }

        binding.fabAdd.setOnClickListener {
            // الانتقال إلى وحدة توليد تقارير PDF الرسمية
            startActivity(Intent(this, OfficialPdfReportsActivity::class.java))
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
