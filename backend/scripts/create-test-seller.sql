-- SQL to create a test seller account
-- Run this in your database console or using a database client

-- First, create the user
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active)
VALUES (
  'seller@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyVBzJ7vLTLe', -- bcrypt hash of 'seller123'
  'seller',
  'Test',
  'Seller',
  '1234567890',
  true,
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'seller',
  is_active = true
RETURNING id;

-- Then create/update the seller profile
-- Replace 'USER_ID_HERE' with the actual ID from the above INSERT
-- Or run this after getting the user ID

INSERT INTO seller_profiles (
  user_id,
  company_name,
  business_type,
  description,
  is_approved,
  approval_date,
  commission_rate
)
SELECT 
  u.id,
  'Test Store',
  'Retail',
  'Test seller account for development',
  true,
  NOW(),
  0.15
FROM users u
WHERE u.email = 'seller@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  is_approved = true,
  approval_date = NOW();
