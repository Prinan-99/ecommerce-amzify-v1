# Seller Login Fix - Invalid Credentials Issue

## Problem
The seller login was returning "Invalid credentials" error due to multiple issues:

1. **Bug in login route** - The `findUnique` query was incorrectly using both `email` and `is_active` in the where clause
2. **Missing seller profile validation** - Not properly checking if seller_profiles array exists
3. **Potentially missing or unapproved seller account** in the database

## What Was Fixed

### 1. Fixed Login Route Bug (backend/routes/auth.js)
Changed the login query from:
```javascript
const user = await prisma.users.findUnique({
  where: { 
    email,
    is_active: true  // ❌ This is wrong - findUnique only accepts unique fields
  },
  // ...
});
```

To:
```javascript
const user = await prisma.users.findUnique({
  where: { 
    email  // ✅ Only use unique field
  },
  // ...
});

// Then check is_active separately
if (!user.is_active) {
  return res.status(401).json({ error: 'Account is deactivated. Please contact support.' });
}
```

### 2. Improved Seller Validation
Added proper checks for seller profiles:
```javascript
if (user.role === 'seller') {
  if (user.seller_profiles.length === 0) {
    return res.status(403).json({ error: 'Seller profile not found. Please contact support.' });
  }
  if (!user.seller_profiles[0].is_approved) {
    return res.status(403).json({ error: 'Seller account pending approval' });
  }
}
```

## How to Test the Fix

### Step 1: Restart the Backend Server
If your backend is running, restart it to apply the changes:

```bash
cd backend
npm run dev
```

Or if using PM2 or another process manager, restart it.

### Step 2: Create a Test Seller Account

You have three options:

#### Option A: Use the Node.js Script (Recommended)
```bash
cd backend
node scripts/createTestSeller.js
```

This will create/update a seller account with:
- Email: `seller@example.com`
- Password: `seller123`
- Approved: `true`

#### Option B: Use SQL Script
Run the SQL commands in `backend/scripts/create-test-seller.sql` using your database client or Render dashboard.

#### Option C: Use Seller Registration API
```bash
# Register a new seller
curl -X POST http://localhost:5000/api/auth/register/seller \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newseller@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Seller",
    "companyName": "My Store",
    "phone": "1234567890"
  }'

# Then manually approve in database or via admin panel
```

### Step 3: Test Login
Try logging in with the seller credentials in the seller panel:
- Email: `seller@example.com`
- Password: `seller123`

## Error Messages Guide

After the fix, you'll get more specific error messages:

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Invalid credentials" | Wrong email or password | Check email/password |
| "Account is deactivated. Please contact support." | User account is inactive (`is_active: false`) | Activate account in database |
| "Seller profile not found. Please contact support." | Seller has no seller_profile record | Create seller_profile record |
| "Seller account pending approval" | Seller exists but not approved | Set `is_approved: true` in seller_profiles |

## Database Requirements

For a seller to login successfully, they need:

1. A record in `users` table with:
   - `role: 'seller'`
   - `is_active: true`
   - Valid `email` and `password_hash`

2. A record in `seller_profiles` table with:
   - `user_id` matching the user
   - `is_approved: true`

## Files Changed

- ✅ `backend/routes/auth.js` - Fixed login validation logic
- ✅ `backend/scripts/createTestSeller.js` - Helper script to create test seller
- ✅ `backend/scripts/create-test-seller.sql` - SQL script for manual creation

## Next Steps

1. Restart your backend server
2. Run the createTestSeller.js script OR manually create a seller in your database
3. Try logging in again from the seller panel
4. If still having issues, check the backend logs for specific error messages
