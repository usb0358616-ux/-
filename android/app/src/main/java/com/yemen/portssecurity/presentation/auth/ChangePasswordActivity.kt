package com.yemen.portssecurity.presentation.auth

import android.os.Bundle
import android.view.WindowManager
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.yemen.portssecurity.PortsSecurityApp
import com.yemen.portssecurity.databinding.ActivityChangePasswordBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ChangePasswordActivity : AppCompatActivity() {

    private lateinit var binding: ActivityChangePasswordBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)

        binding = ActivityChangePasswordBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSubmitChange.setOnClickListener {
            val oldPass = binding.etOldPassword.text?.toString() ?: ""
            val newPass = binding.etNewPassword.text?.toString() ?: ""
            val confirmPass = binding.etConfirmPassword.text?.toString() ?: ""

            if (oldPass.isEmpty() || newPass.isEmpty()) {
                Toast.makeText(this, "يرجى تعبئة كافة الحقول", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (newPass != confirmPass) {
                binding.tilConfirmPassword.error = "كلمات المرور الجديدة غير متطابقة"
                return@setOnClickListener
            } else {
                binding.tilConfirmPassword.error = null
            }

            if (newPass.length < 8) {
                binding.tilNewPassword.error = "كلمة المرور يجب أن لا تقل عن 8 خانات"
                return@setOnClickListener
            }

            val app = application as PortsSecurityApp
            lifecycleScope.launch(Dispatchers.IO) {
                val success = app.authManager.changePassword(oldPass, newPass)
                withContext(Dispatchers.Main) {
                    if (success) {
                        Toast.makeText(this@ChangePasswordActivity, "تم تغيير كلمة المرور بنجاح", Toast.LENGTH_LONG).show()
                        finish()
                    } else {
                        Toast.makeText(this@ChangePasswordActivity, "كلمة المرور الحالية غير صحيحة", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }
}
