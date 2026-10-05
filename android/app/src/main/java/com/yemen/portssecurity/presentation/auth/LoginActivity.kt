package com.yemen.portssecurity.presentation.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.yemen.portssecurity.PortsSecurityApp
import com.yemen.portssecurity.core.security.AuthResult
import com.yemen.portssecurity.databinding.ActivityLoginBinding
import com.yemen.portssecurity.presentation.main.MainActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * شاشة تسجيل الدخول الأمني الرسمي للضباط والمستخدمين
 */
class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // حماية أمنية صارمة لمنع تصوير الشاشة (FLAG_SECURE)
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )

        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnLogin.setOnClickListener {
            attemptLogin()
        }

        binding.tvForgotPassword.setOnClickListener {
            startActivity(Intent(this, ForgotPasswordActivity::class.java))
        }
    }

    private fun attemptLogin() {
        val username = binding.etUsername.text?.toString()?.trim() ?: ""
        val password = binding.etPassword.text?.toString() ?: ""

        if (username.isEmpty()) {
            binding.tilUsername.error = "يرجى إدخال اسم المستخدم أو الرقم العسكري"
            return
        } else {
            binding.tilUsername.error = null
        }

        if (password.isEmpty()) {
            binding.tilPassword.error = "يرجى إدخال كلمة المرور"
            return
        } else {
            binding.tilPassword.error = null
        }

        setLoadingState(true)
        hideErrorMessage()

        val app = application as PortsSecurityApp
        lifecycleScope.launch(Dispatchers.IO) {
            val result = app.authManager.login(username, password)
            withContext(Dispatchers.Main) {
                setLoadingState(false)
                when (result) {
                    is AuthResult.Success -> {
                        val intent = Intent(this@LoginActivity, MainActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    }
                    is AuthResult.Error -> {
                        showErrorMessage(result.message)
                    }
                    is AuthResult.AccountLocked -> {
                        showErrorMessage("تم تجميد هذا الحساب الأمني لتكرار المحاولات الخاطئة. يرجى مراجعة إدارة الأمن والرقابة")
                    }
                }
            }
        }
    }

    private fun setLoadingState(isLoading: Boolean) {
        binding.btnLogin.visibility = if (isLoading) View.INVISIBLE else View.VISIBLE
        binding.pbLoading.visibility = if (isLoading) View.VISIBLE else View.GONE
        binding.etUsername.isEnabled = !isLoading
        binding.etPassword.isEnabled = !isLoading
    }

    private fun showErrorMessage(message: String) {
        binding.tvErrorMessage.text = message
        binding.tvErrorMessage.visibility = View.VISIBLE
    }

    private fun hideErrorMessage() {
        binding.tvErrorMessage.visibility = View.GONE
    }
}
