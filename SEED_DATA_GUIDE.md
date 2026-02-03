# Database Seed Data Guide

## 📊 Summary

The database has been pre-populated with initial dummy data for testing purposes.

**Data Created:**
- ✅ 8 Customer accounts
- ✅ 6 Seller accounts  
- ✅ 1 Admin account
- **Total: 15 test users**

---

## 🔐 Login Credentials

### Admin Account
```
Email: amzify54@gmail.com
Password: admin123
```

### Sample Customer Account
```
Email: jessica.miller1@customer.amzify.com
Password: Customer@123
```

### Sample Seller Account
```
Email: michael.taylor1@seller.amzify.com
Password: Seller@123
Company: HomeComfort Plus
```

---

## 📋 Full List of Created Accounts

### Customers (8)
1. jessica.miller1@customer.amzify.com
2. michael.johnson2@customer.amzify.com
3. michael.rodriguez3@customer.amzify.com
4. jessica.martinez4@customer.amzify.com
5. david.anderson5@customer.amzify.com
6. robert.brown6@customer.amzify.com
7. david.rodriguez7@customer.amzify.com
8. emma.martinez8@customer.amzify.com

**Default Password for all customers:** `Customer@123`

### Sellers (6)
1. michael.taylor1@seller.amzify.com (HomeComfort Plus)
2. maria.rodriguez2@seller.amzify.com (StyleWorks)
3. michael.johnson3@seller.amzify.com (DigitalPro Store)
4. lisa.taylor4@seller.amzify.com (HomeComfort Plus)
5. jessica.rodriguez5@seller.amzify.com (TechVision Store)
6. maria.brown6@seller.amzify.com (ActiveLife Gear)

**Default Password for all sellers:** `Seller@123`

---

## 🎯 Features Available

### Admin Panel (http://localhost:3000)

#### 1. **Users Page** ✅
- View all 8 customers
- Search and filter by name/email
- **Export Features:**
  - ✅ Download as CSV
  - ✅ Download as Excel (.xls)

#### 2. **Sellers Page** ✅
- View all 6 sellers with company information
- Search and filter by name/email/company
- View approval and verification status
- **Export Features:**
  - ✅ Download as CSV
  - ✅ Download as Excel (.xls)

---

## 📥 How to Export Data

### From Users Page:
1. Log in with admin credentials
2. Navigate to **USERS** tab
3. Click **"Download CSV"** or **"Download Excel"** button
4. File downloads as:
   - `users-YYYY-MM-DD.csv` (CSV format)
   - Excel format with formatting and headers

### From Sellers Page:
1. Log in with admin credentials
2. Navigate to **SELLERS** tab
3. Click **"Download CSV"** or **"Download Excel"** button
4. File downloads as:
   - `sellers-YYYY-MM-DD.csv` (CSV format)
   - Excel format with formatting and headers

### Filtering Before Export:
- Use the search box to find specific users/sellers
- Use the filter dropdown to filter by role or status
- Only visible items will be exported

---

## 🛠️ Reseeding the Database

If you want to reset and create fresh test data, run:

```bash
cd backend
npm run seed-mock
```

This will:
1. Clear existing mock data
2. Create new random test accounts
3. Display all new credentials in the console

---

## 📱 System Architecture

```
Frontend (React + TypeScript)
   ↓
Admin Panel (Port 3000)
   ↓
Backend API (Port 5000)
   ↓
Mock Data Store (/backend/data/mock-users.json)
```

**Data Flow:**
- Admin Panel → Backend API → Mock User Store (JSON file)
- All data is persisted in `/backend/data/mock-users.json`
- Passwords are hashed with bcryptjs (10 rounds)

---

## ✨ Features Included

### Data Display
- ✅ Real-time data loading with loading spinner
- ✅ Error handling with retry button
- ✅ Empty state messaging
- ✅ Search functionality
- ✅ Filter by status/role

### Data Export
- ✅ CSV format (comma-separated values)
- ✅ Excel format (HTML-based .xls with styling)
- ✅ Include all relevant columns
- ✅ Timestamped filenames

### UI/UX
- ✅ Professional admin dashboard
- ✅ Responsive design
- ✅ Color-coded status badges
- ✅ Loading states
- ✅ Error messages

---

## 🐛 Troubleshooting

### Data not showing?
1. Ensure backend is running: `npm run dev` in `/backend`
2. Check browser console (F12) for errors
3. Click "Retry" button on error message
4. Hard refresh page: Ctrl+F5

### Export button disabled?
- This happens when there are no users/sellers to export
- Try removing filters or searching for all items

### Backend not connecting?
1. Check if backend is running on port 5000
2. Verify `/backend/.env` has correct configuration
3. Check CORS settings if API calls fail

---

## 📁 Files Modified

1. **Backend Files:**
   - `/backend/scripts/seed-mock-data.js` - NEW: Seed script
   - `/backend/routes/admin.js` - MODIFIED: Added GET /sellers endpoint
   - `/backend/services/adminApi.ts` - MODIFIED: Added getAllSellers() method
   - `/backend/package.json` - MODIFIED: Added "seed-mock" script

2. **Admin Panel Files:**
   - `/amzify-admin-panel/pages/Users.tsx` - MODIFIED: Added Excel export
   - `/amzify-admin-panel/pages/Sellers.tsx` - MODIFIED: Completely rewritten with real API
   - `/amzify-admin-panel/services/adminApi.ts` - MODIFIED: Added getAllSellers()

---

## 🎓 Next Steps

1. **Log in** with admin credentials
2. **Explore** the Users and Sellers pages
3. **Test** search and filter functionality
4. **Export** data to CSV/Excel
5. **Create** more test data by running `npm run seed-mock` again

---

## 📞 Support

For issues or questions, check:
- Browser console (F12) for errors
- Backend console for API logs
- Mock data file: `/backend/data/mock-users.json`

---

**Generated:** February 3, 2026  
**Status:** ✅ All systems operational
