# -*- coding: utf-8 -*-
"""
خدمة إدارة الجوازات والخط الزمني
Passport & Timeline Management Service
"""

from datetime import datetime
import sys
import os

# إضافة المجلد الرئيسي للمسار
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_connection


class PassportService:
    @staticmethod
    def register_passport(passport_number, full_name, nationality="يمني", office_name=None, seizure_record_number=None, notes=None, officer="النظام"):
        """تسجيل جواز سفر جديد وبدء الخط الزمني الخاص به"""
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        today = datetime.now().strftime("%Y-%m-%d")

        try:
            cursor.execute('''
                INSERT INTO passports (passport_number, full_name, nationality, office_name, seizure_record_number, status, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'جديد', ?, ?, ?)
            ''', (passport_number.strip(), full_name.strip(), nationality, office_name, seizure_record_number, notes, now, now))

            # إضافة أول حدث في الخط الزمني
            init_details = f"تم تسجيل قيد الجواز لأول مرة باسم: {full_name}"
            if seizure_record_number:
                init_details += f" بموجب محضر ضبط رقم {seizure_record_number}"
            elif office_name:
                init_details += f" منسوباً إلى مكتب: {office_name}"

            cursor.execute('''
                INSERT INTO passport_timeline (passport_number, event_date, event_title, details, officer, status_tag, created_at)
                VALUES (?, ?, 'تسجيل الجواز', ?, ?, 'جديد', ?)
            ''', (passport_number.strip(), today, init_details, officer, now))

            conn.commit()
            return True, "تم تسجيل الجواز بنجاح"
        except Exception as e:
            conn.rollback()
            return False, f"فشل تسجيل الجواز: {str(e)}"
        finally:
            conn.close()

    @staticmethod
    def add_timeline_event(passport_number, event_title, details, status_tag=None, officer="المسؤول"):
        """إضافة حدث جديد إلى الخط الزمني للجواز وتحديث حالته"""
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        today = datetime.now().strftime("%Y-%m-%d")

        try:
            cursor.execute('''
                INSERT INTO passport_timeline (passport_number, event_date, event_title, details, officer, status_tag, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (passport_number.strip(), today, event_title, details, officer, status_tag, now))

            if status_tag:
                cursor.execute('''
                    UPDATE passports SET status = ?, updated_at = ? WHERE passport_number = ?
                ''', (status_tag, now, passport_number.strip()))

            conn.commit()
            return True, "تم توثيق الحدث في الخط الزمني"
        except Exception as e:
            conn.rollback()
            return False, str(e)
        finally:
            conn.close()

    @staticmethod
    def get_passport_timeline(passport_number):
        """جلب السجل والخط الزمني الكامل لجواز محدد"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM passports WHERE passport_number = ?", (passport_number.strip(),))
        passport = cursor.fetchone()
        
        if not passport:
            conn.close()
            return None, []

        cursor.execute('''
            SELECT * FROM passport_timeline WHERE passport_number = ? ORDER BY id DESC
        ''', (passport_number.strip(),))
        timeline = cursor.fetchall()
        
        conn.close()
        return dict(passport), [dict(t) for t in timeline]

    @staticmethod
    def search_passports(query):
        """بحث سريع في الجوازات بالرقم أو الاسم"""
        conn = get_db_connection()
        cursor = conn.cursor()
        q = f"%{query.strip()}%"
        cursor.execute('''
            SELECT * FROM passports 
            WHERE passport_number LIKE ? OR full_name LIKE ? OR office_name LIKE ?
            ORDER BY id DESC LIMIT 100
        ''', (q, q, q))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]
