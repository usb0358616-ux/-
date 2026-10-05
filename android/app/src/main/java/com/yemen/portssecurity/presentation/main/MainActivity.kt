package com.yemen.portssecurity.presentation.main

import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.view.WindowManager
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.ActionBarDrawerToggle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.navigation.NavigationView
import com.yemen.portssecurity.PortsSecurityApp
import com.yemen.portssecurity.R
import com.yemen.portssecurity.core.session.SessionManager
import com.yemen.portssecurity.databinding.ActivityMainBinding
import com.yemen.portssecurity.presentation.admin.AuditLogActivity
import com.yemen.portssecurity.presentation.admin.BackupRestoreActivity
import com.yemen.portssecurity.presentation.admin.SettingsActivity
import com.yemen.portssecurity.presentation.admin.UsersManagementActivity
import com.yemen.portssecurity.presentation.auth.LoginActivity
import com.yemen.portssecurity.presentation.correspondence.MemorandaListActivity
import com.yemen.portssecurity.presentation.foreigners.ForeignersListActivity
import com.yemen.portssecurity.presentation.hajj.HajjCompaniesListActivity
import com.yemen.portssecurity.presentation.migrants.MigrantsListActivity
import com.yemen.portssecurity.presentation.movement.MovementPermitsListActivity
import com.yemen.portssecurity.presentation.passengers.PassengersListActivity
import com.yemen.portssecurity.presentation.ports.PortsListActivity
import com.yemen.portssecurity.presentation.refugees.RefugeesListActivity
import com.yemen.portssecurity.presentation.reports.ReportsActivity
import com.yemen.portssecurity.presentation.reports.SLADashboardActivity
import com.yemen.portssecurity.presentation.seizures.SeizuresListActivity
import com.yemen.portssecurity.presentation.visas.VisasListActivity
import kotlinx.coroutines.launch

/**
 * الشاشة الرئيسية للمنظومة مع الدرج الجانبي (Navigation Drawer) ومراقب الخمول الأمني
 */
class MainActivity : AppCompatActivity(), NavigationView.OnNavigationItemSelectedListener {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // حماية الشاشة من الالتقاط والتصوير الأمني
        window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)

        // التحقق من صلاحية الجلسة
        if (!SessionManager.isLoggedIn) {
            redirectToLogin()
            return
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)

        val toggle = ActionBarDrawerToggle(
            this,
            binding.drawerLayout,
            binding.toolbar,
            R.string.app_name,
            R.string.app_name
        )
        binding.drawerLayout.addDrawerListener(toggle)
        toggle.syncState()

        binding.navView.setNavigationItemSelectedListener(this)

        updateHeaderInfo()

        // تحميل لوحة القيادة الافتراضية
        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, DashboardFragment())
                .commit()
            binding.navView.setCheckedItem(R.id.nav_dashboard)
        }
    }

    override fun onResume() {
        super.onResume()
        if (SessionManager.isSessionExpired()) {
            redirectToLogin()
        } else {
            SessionManager.touchSession()
        }
    }

    override fun onUserInteraction() {
        super.onUserInteraction()
        // تصفير مؤقت الخمول عند أي لمس للشاشة
        if (SessionManager.isSessionExpired()) {
            redirectToLogin()
        } else {
            SessionManager.touchSession()
        }
    }

    private fun updateHeaderInfo() {
        val headerView = binding.navView.getHeaderView(0)
        val tvOfficerName = headerView.findViewById<TextView>(R.id.tvOfficerName)
        val tvMilitaryInfo = headerView.findViewById<TextView>(R.id.tvMilitaryInfo)

        val currentSession = SessionManager.currentSession.value
        if (currentSession != null) {
            tvOfficerName.text = SessionManager.getOfficerDisplayTitle()
            tvMilitaryInfo.text = "الرقم العسكري: ${currentSession.user.militaryNumber} | ${currentSession.user.department}"
        }
    }

    override fun onNavigationItemSelected(item: MenuItem): Boolean {
        binding.drawerLayout.closeDrawer(GravityCompat.START)

        when (item.itemId) {
            R.id.nav_dashboard -> {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.fragmentContainer, DashboardFragment())
                    .commit()
            }
            R.id.nav_seizures -> checkAndLaunch("seizures.view", SeizuresListActivity::class.java)
            R.id.nav_passengers -> checkAndLaunch("passengers.view", PassengersListActivity::class.java)
            R.id.nav_refugees -> checkAndLaunch("refugees.view", RefugeesListActivity::class.java)
            R.id.nav_foreigners -> checkAndLaunch("foreigners.view", ForeignersListActivity::class.java)
            R.id.nav_movement -> checkAndLaunch("movement.view", MovementPermitsListActivity::class.java)
            R.id.nav_visas -> checkAndLaunch("visas.view", VisasListActivity::class.java)
            R.id.nav_migrants -> checkAndLaunch("migrants.view", MigrantsListActivity::class.java)
            R.id.nav_ports -> checkAndLaunch("ports.view", PortsListActivity::class.java)
            R.id.nav_correspondence -> checkAndLaunch("memoranda.view", MemorandaListActivity::class.java)
            R.id.nav_hajj -> checkAndLaunch("hajj.view", HajjCompaniesListActivity::class.java)
            R.id.nav_reports -> checkAndLaunch("reports.view", ReportsActivity::class.java)

            // الإدارة والأمان
            R.id.nav_sla -> checkAndLaunch("sla.view", SLADashboardActivity::class.java)
            R.id.nav_audit -> checkAndLaunch("audit.view", AuditLogActivity::class.java)
            R.id.nav_users -> checkAndLaunch("users.view", UsersManagementActivity::class.java)
            R.id.nav_backup -> checkAndLaunch("backup.run", BackupRestoreActivity::class.java)
            R.id.nav_settings -> checkAndLaunch("settings.view", SettingsActivity::class.java)

            R.id.nav_logout -> {
                performLogout()
            }
        }
        return true
    }

    private fun checkAndLaunch(permissionCode: String, targetActivity: Class<*>) {
        if (SessionManager.hasPermission(permissionCode)) {
            startActivity(Intent(this, targetActivity))
        } else {
            Toast.makeText(this, "عذراً، لا تمتلك الصلاحية: $permissionCode", Toast.LENGTH_SHORT).show()
        }
    }

    private fun performLogout() {
        val app = application as PortsSecurityApp
        lifecycleScope.launch {
            app.authManager.logout()
            redirectToLogin()
        }
    }

    private fun redirectToLogin() {
        SessionManager.endSession()
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
