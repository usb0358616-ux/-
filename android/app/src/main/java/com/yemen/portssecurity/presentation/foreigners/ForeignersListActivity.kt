package com.yemen.portssecurity.presentation.foreigners

import android.os.Bundle
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import com.yemen.portssecurity.R
import com.yemen.portssecurity.databinding.ActivitySovereignGenericListBinding

/**
 * شاشة متابعة الوافدين والخبراء الأجانب والمهن
 */
class ForeignersListActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySovereignGenericListBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySovereignGenericListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.apply {
            title = getString(R.string.title_foreigners_list)
            setDisplayHomeAsUpEnabled(true)
        }

        setupUI()
    }

    private fun setupUI() {
        val columns = resources.getInteger(R.integer.list_grid_columns)
        binding.rvList.layoutManager = GridLayoutManager(this, columns)

        binding.tvTotalRecords.text = "إجمالي الوافدين المقيدين: 2,150 وافداً"
        binding.tvActiveStatus.text = "الفحص الطبي: مكتمل بنسبة 98%"

        binding.swipeRefresh.setOnRefreshListener {
            binding.swipeRefresh.isRefreshing = false
            Toast.makeText(this, "تم تحديث بيانات الوافدين الأجانب", Toast.LENGTH_SHORT).show()
        }

        binding.fabAdd.setOnClickListener {
            Toast.makeText(this, "تسجيل قيد وافد أجنبي جديد", Toast.LENGTH_SHORT).show()
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
