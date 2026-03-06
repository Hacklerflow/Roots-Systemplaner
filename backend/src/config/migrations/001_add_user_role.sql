-- Migration: Add role column to users table
-- Run this to add admin/user roles

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users (set first user as admin)
UPDATE users SET role = 'admin' WHERE id = (SELECT MIN(id) FROM users);

-- Add check constraint
ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('admin', 'user'));
