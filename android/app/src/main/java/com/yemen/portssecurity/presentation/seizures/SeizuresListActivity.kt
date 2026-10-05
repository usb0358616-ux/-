package com.yemen.portssecurity.presentation.seizures

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.addTextChangedListener
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.yemen.portssecurity.PortsSecurityApp
import com.yemen.portssecurity.data.local.entities.SeizureRecordEntity
import com.yemen.portssecurity.data.repository.SeizureRepository
import com.yemen.portssecurity.databinding.ActivitySeizuresListBinding
import com.yemen.portssecurity.databinding.ItemSeizureRecordBinding
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * شاشة استعراض وبحث قائمة محاضر الضبط بالمنافذ
 */
class SeizuresListActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySeizuresListBinding
    private lateinit var seizureRepository: SeizureRepository
    private lateinit var adapter: SeizuresAdapter

    private var allSeizures: List<SeizureRecordEntity> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySeizuresListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val app = application as PortsSecurityApp
        seizureRepository = SeizureRepository(app.database.seizureDao(), app.database.auditLogDao())

        adapter = SeizuresAdapter { record ->
            val intent = Intent(this, SeizureRecordActivity::class.java)
            intent.putExtra("SEIZURE_ID", record.id)
            startActivity(intent)
        }

        binding.rvSeizures.layoutManager = LinearLayoutManager(this)
        binding.rvSeizures.adapter = adapter

        binding.fabAddSeizure.setOnClickListener {
            startActivity(Intent(this, SeizureRecordActivity::class.java))
        }

        binding.etSearch.addTextChangedListener { text ->
            filterList(text?.toString().orEmpty())
        }

        loadSeizureRecords()
    }

    private fun loadSeizureRecords() {
        lifecycleScope.launch {
            seizureRepository.getAllSeizureRecords().collectLatest { list ->
                allSeizures = list
                filterList(binding.etSearch.text?.toString().orEmpty())
            }
        }
    }

    private fun filterList(query: String) {
        val q = query.trim().lowercase()
        val filtered = if (q.isEmpty()) {
            allSeizures
        } else {
            allSeizures.filter {
                it.recordNumber.lowercase().contains(q) ||
                it.portName.lowercase().contains(q) ||
                it.violationType.lowercase().contains(q)
            }
        }
        adapter.submitList(filtered)
    }

    private class SeizuresAdapter(
        private val onItemClick: (SeizureRecordEntity) -> Unit
    ) : RecyclerView.Adapter<SeizuresAdapter.ViewHolder>() {

        private var items: List<SeizureRecordEntity> = emptyList()
        private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH)

        fun submitList(newItems: List<SeizureRecordEntity>) {
            items = newItems
            notifyDataSetChanged()
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val binding = ItemSeizureRecordBinding.inflate(
                LayoutInflater.from(parent.context), parent, false
            )
            return ViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            holder.bind(item)
            holder.itemView.setOnClickListener { onItemClick(item) }
        }

        override fun getItemCount(): Int = items.size

        inner class ViewHolder(private val binding: ItemSeizureRecordBinding) :
            RecyclerView.ViewHolder(binding.root) {

            fun bind(item: SeizureRecordEntity) {
                binding.tvRecordNumber.text = "محضر رقم: ${item.recordNumber}"
                binding.tvStatusBadge.text = item.status
                binding.tvPortAndDate.text = "${item.portName} | ${dateFormat.format(Date(item.seizureDate))}"
                binding.tvViolation.text = "المخالفة: ${item.violationType}"
                binding.tvPassportCount.text = "عدد الجوازات المحتجزة: ${item.passportCount}"
            }
        }
    }
}
