-- Add mustChangePassword column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS "mustChangePassword" boolean DEFAULT false NOT NULL;

-- Set mustChangePassword to true for all existing teacher accounts
UPDATE users
SET "mustChangePassword" = true
WHERE role = 'teacher';
