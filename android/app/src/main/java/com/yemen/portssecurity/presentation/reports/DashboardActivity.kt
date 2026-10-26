package com.yemen.portssecurity.presentation.reports

import android.os.Bundle
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import com.yemen.portssecurity.R
import com.yemen.portssecurity.presentation.main.DashboardFragment

/**
 * شاشة لوحة القيادة المستقلة (DashboardActivity)
 */
class DashboardActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        supportActionBar?.apply {
            title = getString(R.string.title_dashboard)
            setDisplayHomeAsUpEnabled(true)
        }

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, DashboardFragment())
                .commit()
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
