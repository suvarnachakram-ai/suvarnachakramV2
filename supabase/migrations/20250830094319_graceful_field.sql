/*
  # Add Admin User for Authentication

  1. Create admin user in auth.users table
  2. This allows login with admin@swarnachakra.com / admin123
*/

-- Insert admin user (this will be handled by Supabase Auth in the UI)
-- The user should sign up through the application with:
-- Email: admin@swarnachakra.com
-- Password: admin123

-- Note: In production, you would create users through Supabase Auth
-- and manage roles through user metadata or a separate profiles table