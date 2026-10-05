package com.yemen.portssecurity.presentation.main

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.yemen.portssecurity.core.session.SessionManager
import com.yemen.portssecurity.databinding.FragmentDashboardBinding
import com.yemen.portssecurity.presentation.correspondence.MemorandaListActivity
import com.yemen.portssecurity.presentation.foreigners.ForeignersListActivity
import com.yemen.portssecurity.presentation.migrants.MigrantsListActivity
import com.yemen.portssecurity.presentation.movement.MovementPermitsListActivity
import com.yemen.portssecurity.presentation.passengers.PassengersListActivity
import com.yemen.portssecurity.presentation.ports.PortsListActivity
import com.yemen.portssecurity.presentation.refugees.RefugeesListActivity
import com.yemen.portssecurity.presentation.reports.ReportsActivity
import com.yemen.portssecurity.presentation.reports.SLADashboardActivity
import com.yemen.portssecurity.presentation.seizures.ImportExcelActivity
import com.yemen.portssecurity.presentation.seizures.SeizuresListActivity
import com.yemen.portssecurity.presentation.visas.VisasListActivity

/**
 * لوحة القيادة والمؤشرات الأمنية الرئيسية (12 بطاقة قيادية)
 */
class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.tvWelcomeOfficer.text = "مرحباً بك: ${SessionManager.getOfficerDisplayTitle()}"
        setupCardClicks()
    }

    private fun setupCardClicks() {
        // 1. محاضر الضبط
        binding.cardSeizures.setOnClickListener {
            checkPermissionAndLaunch("seizures.view", SeizuresListActivity::class.java)
        }

        // 2. المسافرون
        binding.cardPassengers.setOnClickListener {
            checkPermissionAndLaunch("passengers.view", PassengersListActivity::class.java)
        }

        // 3. اللاجئون
        binding.cardRefugees.setOnClickListener {
            checkPermissionAndLaunch("refugees.view", RefugeesListActivity::class.java)
        }

        // 4. الوافدون الأجانب
        binding.cardForeigners.setOnClickListener {
            checkPermissionAndLaunch("foreigners.view", ForeignersListActivity::class.java)
        }

        // 5. تصاريح التنقل
        binding.cardMovement.setOnClickListener {
            checkPermissionAndLaunch("movement.view", MovementPermitsListActivity::class.java)
        }

        // 6. التأشيرات والإقامات
        binding.cardVisas.setOnClickListener {
            checkPermissionAndLaunch("visas.view", VisasListActivity::class.java)
        }

        // 7. المهاجرون
        binding.cardMigrants.setOnClickListener {
            checkPermissionAndLaunch("migrants.view", MigrantsListActivity::class.java)
        }

        // 8. المنافذ
        binding.cardPorts.setOnClickListener {
            checkPermissionAndLaunch("ports.view", PortsListActivity::class.java)
        }

        // 9. المراسلات
        binding.cardCorrespondence.setOnClickListener {
            checkPermissionAndLaunch("memoranda.view", MemorandaListActivity::class.java)
        }

        // 10. تتبع SLA
        binding.cardSla.setOnClickListener {
            checkPermissionAndLaunch("sla.view", SLADashboardActivity::class.java)
        }

        // 11. التقارير
        binding.cardReports.setOnClickListener {
            checkPermissionAndLaunch("reports.view", ReportsActivity::class.java)
        }

        // 12. استيراد Excel الذكي
        binding.cardExcelImport.setOnClickListener {
            checkPermissionAndLaunch("excel.import", ImportExcelActivity::class.java)
        }
    }

    private fun checkPermissionAndLaunch(permissionCode: String, targetActivity: Class<*>) {
        if (SessionManager.hasPermission(permissionCode)) {
            startActivity(Intent(requireContext(), targetActivity))
        } else {
            Toast.makeText(requireContext(), "عذراً، ليس لديك الصلاحية الأمنية الكافية: $permissionCode", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
