-- Add foto field to usuarios table
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto TEXT;
