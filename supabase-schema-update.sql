-- Duyurular tablosunu güncelle - isGeneral ve target_students ekle
ALTER TABLE announcements 
ADD COLUMN is_general BOOLEAN DEFAULT TRUE,
ADD COLUMN target_students JSONB DEFAULT '[]'::jsonb;
