# Database Setup & Seeding Guide

## Overview
All mock data has been removed from the frontend. The application now fetches all data from the PostgreSQL database via backend APIs.

## Prerequisites
- PostgreSQL database (Render, Neon, Supabase, or local)
- Node.js installed
- Backend dependencies installed (`npm install` in backend folder)

## Setup Steps

### 1. Configure Database Connection

Update `backend/.env` with your Render PostgreSQL DATABASE_URL:

```env
DATABASE_URL="postgresql://username:password@host:5432/database_name"
```

Or for Render, it looks like:
```env
DATABASE_URL="postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com/dbname"
```

### 2. Run Database Migrations

```bash
cd backend
npm run migrate
```

This creates all required tables in your database.

### 3. Seed Seller Applications

```bash
npm run seed-applications
```

This will populate the `seller_applications` table with 10 sample applications:
- 4 Pending applications
- 3 Approved applications  
- 3 Rejected applications

### 4. Start Backend Server

```bash
npm run dev
```

Server should start on http://localhost:5000

### 5. Start Admin Panel

```bash
cd ../amzify-admin-panel
npm run dev
```

Admin panel should start on http://localhost:3000 or 3001

## API Endpoints

### Seller Applications
- `GET /api/seller-applications` - Get all applications (Admin only)
- `GET /api/seller-applications/:id` - Get single application
- `POST /api/seller-applications/:id/approve` - Approve application
- `POST /api/seller-applications/:id/reject` - Reject application (requires `reason` in body)
- `GET /api/seller-applications/stats/overview` - Get statistics

### Authentication Required
All seller application endpoints require:
- Valid JWT token in `Authorization: Bearer <token>` header
- Admin role (`requireAdmin` middleware)

## Frontend Changes

### Removed
- All `MOCK_APPLICATIONS` data arrays
- `localStorage` save/load functions
- Mock mode fallback logic

### Updated
- `fetchApplications()` - Now fetches directly from API without localStorage merge
- `handleApprove()` - Calls backend API and refreshes list on success
- `handleReject()` - Calls backend API and refreshes list on success
- Error handling shows proper connection error messages

## Testing

1. Login to admin panel with admin credentials
2. Navigate to "Seller Applications" tab
3. Click "Search" to load applications from database
4. Filter by status: All / Pending / Approved / Rejected
5. View application details
6. Approve/Reject applications (changes persist in database)

## Troubleshooting

### Database Connection Error
- Verify DATABASE_URL is correct in `.env`
- Check if database server is accessible
- Ensure database exists and credentials are valid

### No Applications Showing
- Run seed script: `npm run seed-applications`
- Check backend logs for errors
- Verify admin authentication token is valid

### Approve/Reject Not Working
- Check browser console for errors
- Verify backend server is running
- Ensure you're logged in as admin
- Check backend logs for API errors

## Seed Data Details

Each application includes:
- Business owner info (name, email, phone)
- Company details (name, type, description)
- Address (street, city, state, postal code)
- Tax info (GST, PAN numbers)
- Banking details (bank name, account number, IFSC code)
- Application status and timestamps
- Rejection reason (for rejected applications)

## Next Steps

To seed other data:
1. Create similar seed scripts for users, products, orders, etc.
2. Update respective frontend components to remove mock data
3. Test API endpoints with proper authentication
4. Deploy backend to Render with DATABASE_URL configured
