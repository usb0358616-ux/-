package com.yemen.portssecurity.presentation.refugees

import android.os.Bundle
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import com.yemen.portssecurity.R
import com.yemen.portssecurity.databinding.ActivitySovereignGenericListBinding

/**
 * شاشة سجل شؤون اللاجئين وتصاريح اللجوء المؤقتة
 */
class RefugeesListActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySovereignGenericListBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySovereignGenericListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.apply {
            title = getString(R.string.title_refugees_list)
            setDisplayHomeAsUpEnabled(true)
        }

        setupUI()
    }

    private fun setupUI() {
        val columns = resources.getInteger(R.integer.list_grid_columns)
        binding.rvList.layoutManager = GridLayoutManager(this, columns)

        binding.tvTotalRecords.text = "إجمالي اللاجئين المسجلين: 842 ملفاً"
        binding.tvActiveStatus.text = "التدقيق الجنائي: ساري"

        binding.swipeRefresh.setOnRefreshListener {
            binding.swipeRefresh.isRefreshing = false
            Toast.makeText(this, "تم تحديث سجلات اللاجئين", Toast.LENGTH_SHORT).show()
        }

        binding.fabAdd.setOnClickListener {
            Toast.makeText(this, "قيد ملف لاجئ جديد وإصدار تصريح مؤقت", Toast.LENGTH_SHORT).show()
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
