-- =============================================
-- SINIF YÖNETİM SİSTEMİ - SUPABASE SCHEMA
-- =============================================

-- 1. Öğrenciler Tablosu
CREATE TABLE students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Duyurular Tablosu
CREATE TABLE announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Portfolyo Tablosu
CREATE TABLE portfolio (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_data TEXT,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    shared_with_parent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ödevler Tablosu
CREATE TABLE homework (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    assigned_date DATE NOT NULL,
    student_ids JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Haftalık Değerlendirmeler Tablosu
CREATE TABLE weekly_evaluations (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    week INTEGER NOT NULL,
    subjects JSONB NOT NULL,
    learned TEXT,
    to_improve TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, week)
);

-- 6. Admin Şifresi Tablosu
CREATE TABLE admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Varsayılan admin şifresi ekle
INSERT INTO admin_settings (key, value) VALUES ('admin_password', 'ogretmen2026');

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- =============================================

-- Tüm tablolar için RLS'i etkinleştir
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Herkese okuma/yazma izni ver (anon key ile)
-- Not: Gerçek üretim ortamında daha güvenli politikalar kullanılmalı

CREATE POLICY "Enable all for anon" ON students FOR ALL USING (true);
CREATE POLICY "Enable all for anon" ON announcements FOR ALL USING (true);
CREATE POLICY "Enable all for anon" ON portfolio FOR ALL USING (true);
CREATE POLICY "Enable all for anon" ON homework FOR ALL USING (true);
CREATE POLICY "Enable all for anon" ON weekly_evaluations FOR ALL USING (true);
CREATE POLICY "Enable all for anon" ON admin_settings FOR ALL USING (true);

-- =============================================
-- İNDEXLER (Performans için)
-- =============================================

CREATE INDEX idx_portfolio_student_id ON portfolio(student_id);
CREATE INDEX idx_weekly_evaluations_student_id ON weekly_evaluations(student_id);
CREATE INDEX idx_weekly_evaluations_week ON weekly_evaluations(week);
