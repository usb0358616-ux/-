package com.yemen.portssecurity.presentation.auth

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.yemen.portssecurity.PortsSecurityApp
import com.yemen.portssecurity.core.session.SessionManager
import com.yemen.portssecurity.data.local.AppDatabase
import com.yemen.portssecurity.databinding.ActivitySplashBinding
import com.yemen.portssecurity.presentation.main.MainActivity
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * شاشة البداية السيادية - فحص سلامة التشفير وتوجيه الضابط
 */
@SuppressLint("CustomSplashScreen")
class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // حماية الشاشة من الالتقاط الأمني
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )

        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        lifecycleScope.launch {
            // تهيئة وتحقق أمني
            val app = application as PortsSecurityApp
            AppDatabase.seedInitialData(app.database)
            delay(1200) // إظهار الشعار السيادي

            if (SessionManager.isLoggedIn) {
                startActivity(Intent(this@SplashActivity, MainActivity::class.java))
            } else {
                startActivity(Intent(this@SplashActivity, LoginActivity::class.java))
            }
            finish()
        }
    }
}
