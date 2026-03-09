-- Migration: Add role column to users table
-- Run this SQL script to add admin role support

-- Add role column with default value 'user'
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- You can manually set a user as admin using:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

