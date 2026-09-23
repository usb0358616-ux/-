# -*- coding: utf-8 -*-
"""
خدمة النسخ الاحتياطي والأرشفة التلقائية
Backup & Automated Archiving Service
"""

import shutil
import os
import sys
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import DB_PATH, get_db_connection

BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backups")


class BackupService:
    @staticmethod
    def create_backup():
        """إنشاء نسخة احتياطية فورية من قاعدة البيانات"""
        os.makedirs(BACKUP_DIR, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = os.path.join(BACKUP_DIR, f"office_backup_{timestamp}.db")
        try:
            shutil.copy2(DB_PATH, backup_file)
            return True, f"تم إنشاء النسخة الاحتياطية بنجاح: {os.path.basename(backup_file)}"
        except Exception as e:
            return False, f"فشل إنشاء النسخة: {str(e)}"

    @staticmethod
    def auto_archive_older_than_months(months=6):
        """أرشفة تلقائية للوثائق التي تجاوزت مدتها 6 أشهر لتسريع النظام"""
        cutoff_date = (datetime.now() - timedelta(days=months * 30)).strftime("%Y-%m-%d")
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                UPDATE documents 
                SET is_archived = 1, archived_at = ?
                WHERE is_archived = 0 AND date < ?
            ''', (now, cutoff_date))

            affected = cursor.rowcount
            conn.commit()
            return True, f"تمت أرشفة {affected} وثيقة قديمة بنجاح إلى قسم الأرشيف المركزي"
        except Exception as e:
            conn.rollback()
            return False, str(e)
        finally:
            conn.close()
