# -*- coding: utf-8 -*-
"""
قاعدة بيانات نظام مكتب المعلومات والبيانات
SQLite Database Initialization & Schema Manager
"""

import sqlite3
import os
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_PATH = os.path.join(DB_DIR, "office.db")


def get_db_connection():
    """الحصول على اتصال بقاعدة البيانات مع إعداد الصفوف كقواميس"""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """إنشاء الجداول الأساسية والفهارس للنظام"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. جدول الجوازات المركزي
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS passports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        passport_number TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        nationality TEXT DEFAULT 'يمني',
        office_name TEXT,
        seizure_record_number TEXT,
        status TEXT NOT NULL DEFAULT 'جديد',
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    ''')

    # 2. جدول الخط الزمني لحركة الجواز
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS passport_timeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        passport_number TEXT NOT NULL,
        event_date TEXT NOT NULL,
        event_title TEXT NOT NULL,
        details TEXT,
        officer TEXT,
        status_tag TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (passport_number) REFERENCES passports (passport_number) ON DELETE CASCADE
    )
    ''')

    # 3. جدول محاضر الضبط بالمنافذ
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS seizure_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        record_number TEXT NOT NULL UNIQUE,
        seizure_date TEXT NOT NULL,
        port_name TEXT NOT NULL,
        port_type TEXT NOT NULL,
        violation_type TEXT NOT NULL,
        officer_name TEXT NOT NULL,
        passport_count INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT NOT NULL
    )
    ''')

    # 4. جدول الفحص الأمني والمطابقة
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS security_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        check_number TEXT NOT NULL UNIQUE,
        passport_number TEXT NOT NULL,
        full_name TEXT NOT NULL,
        nationality TEXT,
        check_date TEXT NOT NULL,
        result TEXT NOT NULL,
        details TEXT,
        officer TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    ''')

    # 5. جدول سندات وإجراءات التسليم
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        delivery_number TEXT NOT NULL UNIQUE,
        delivery_type TEXT NOT NULL, -- owner | office
        delivery_date TEXT NOT NULL,
        delivery_time TEXT,
        officer TEXT NOT NULL,
        recipient_name TEXT,
        recipient_id TEXT,
        recipient_phone TEXT,
        office_name TEXT,
        agent_name TEXT,
        agent_id TEXT,
        passport_count INTEGER DEFAULT 1,
        notes TEXT,
        created_at TEXT NOT NULL
    )
    ''')

    # 6. جدول المكاتب والوكالات
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS offices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        license_number TEXT,
        owner_name TEXT,
        phone TEXT,
        city TEXT DEFAULT 'عدن',
        address TEXT,
        status TEXT DEFAULT 'نشط',
        total_passports INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT NOT NULL
    )
    ''')

    # 7. جدول الإقامات والتأشيرات والمهاجرين
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS residencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL, -- إقامة | تأشيرة | مهاجر / وافد
        person_name TEXT NOT NULL,
        passport_number TEXT NOT NULL,
        nationality TEXT NOT NULL,
        entry_port TEXT,
        sponsor_or_entity TEXT,
        expiry_date TEXT,
        entry_date TEXT,
        status TEXT DEFAULT 'سارية',
        notes TEXT,
        created_at TEXT NOT NULL
    )
    ''')

    # 8. جدول المراسلات والمذكرات (وارد / صادر) والأرشيف
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT NOT NULL,
        date TEXT NOT NULL,
        sender TEXT NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        type TEXT NOT NULL, -- وارد | صادر
        priority TEXT DEFAULT 'عادي',
        security_level TEXT DEFAULT 'عادي',
        status TEXT DEFAULT 'قيد الإجراء',
        is_archived INTEGER DEFAULT 0,
        archived_at TEXT,
        extracted_content TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
    )
    ''')

    # 9. جدول المستخدمين والصلاحيات
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'مستخدم',
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    )
    ''')

    # 10. جدول سجل النشاط والعمليات
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT,
        details TEXT,
        created_at TEXT NOT NULL
    )
    ''')

    # فهارس للبحث السريع برقم الجواز والتاريخ
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_passports_number ON passports(passport_number)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_timeline_pnum ON passport_timeline(passport_number)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_seizures_rec ON seizure_records(record_number)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_docs_archived ON documents(is_archived)')

    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()
    print("تمت تهيئة قاعدة بيانات SQLite بنجاح في:", DB_PATH)
