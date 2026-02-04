# Seller Panel Setup & Configuration Guide

## Overview
The Amzify Seller Panel is a comprehensive dashboard for sellers to manage their store, products, orders, and marketing campaigns. This guide will help you set up and get the seller panel working.

---

## Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher
- **Backend Server** running on `http://localhost:5000`
- **Database** PostgreSQL configured and running

---

## Directory Structure
```
amzify-seller-panel/
├── components/          # Reusable UI components
├── context/             # React context (Authentication)
├── services/            # API integration
├── pages/               # Individual page components (Optional - mostly in App.tsx)
├── amzify-seller-hub/   # Landing/onboarding page
├── hooks/               # Custom React hooks
├── public/              # Static assets
├── App.tsx              # Main application component
├── SellerRoutes.tsx     # Route configuration
├── index.tsx            # Entry point
└── vite.config.ts       # Build configuration
```

---

## Quick Start

### 1. Install Dependencies
```bash
cd amzify-seller-panel
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Create a `.env.local` file in the seller panel root:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_POSTHOG_KEY=phc_your_posthog_key_here
VITE_POSTHOG_HOST=https://us.posthog.com
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Set Backend Environment
Ensure backend `.env` is configured:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=postgresql://user:password@localhost:5432/amzify_db
```

### 4. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

### 5. Start the Seller Panel Dev Server
```bash
cd amzify-seller-panel
npm run dev
```

The seller panel will be available at: **http://localhost:3000**

---

## Login Credentials

### Demo Sellers
| Email | Password | Company |
|-------|----------|---------|
| seller@amzify.com | seller123 | Tech Store |
| fashion@amzify.com | seller123 | Fashion Hub |
| home@amzify.com | seller123 | Home Solutions |

To create these users, run the backend seed script:
```bash
cd backend
npm run seed
```

---

## Key Features

### Dashboard Tab
- Real-time sales analytics
- Revenue trends
- Order statistics
- Product performance
- Customer insights

### Products Tab
- Product listing and management
- Create/Edit/Delete products
- Category management
- Inventory tracking
- Product analytics

### Orders Tab
- View all seller orders
- Update order status
- Bulk status updates
- Order tracking
- Customer details

### Customers Tab
- Customer list
- Purchase history
- Customer analytics
- Loyalty insights

### Marketing Tab
- Create marketing campaigns
- Campaign analytics
- Promotional tools
- Social media integration

### Logistics Tab
- Shipment tracking
- Warehouse management
- Return management
- Delivery analytics

### Revenue Tab
- Detailed revenue analytics
- Payment tracking
- Settlement history
- Financial reports

### Social Media
- Social media manager
- Post scheduling
- Analytics integration

---

## Architecture

### Authentication Flow
1. User logs in with email/password
2. Backend validates credentials and returns JWT tokens
3. Tokens stored in localStorage
4. RealAuthContext manages auth state
5. Protected routes redirect unauthenticated users to login

### API Integration
- Base URL: `http://localhost:5000/api`
- All requests include JWT Authorization header
- Automatic error handling and retry logic
- Service: `sellerApiService` in `services/sellerApi.ts`

### State Management
- **React Context API** for authentication
- **Local State** with useState for UI components
- **localStorage** for token persistence
- **useEffect** for data loading

---

## Common Issues & Solutions

### 1. CORS Errors
**Problem**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
- Ensure backend CORS is configured for `http://localhost:3000`
- Check backend `server.js` for proper CORS setup
- Backend should allow localhost origins

```javascript
// In backend server.js
cors({
  origin: function(origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
})
```

### 2. Auth Context Errors
**Problem**: `Cannot read property 'user' of undefined`

**Solution**:
- Ensure `RealAuthContext` is properly imported
- Wrap app with `<AuthProvider>` in `index.tsx`
- Check context file is exporting correctly

### 3. API Connection Errors
**Problem**: `Network Error: Cannot reach http://localhost:5000`

**Solution**:
- Start backend server first: `npm run dev` in backend folder
- Check backend is running on port 5000
- Verify `API_BASE_URL` in sellerApi.ts matches backend

### 4. Missing Dependencies
**Problem**: `Module not found` errors

**Solution**:
```bash
npm install --legacy-peer-deps --force
npm install missing-package-name
```

### 5. Build Errors
**Problem**: `Error: Type X does not have property Y`

**Solution**:
- Check `types.ts` for proper type definitions
- Update types if API response structure changed
- Run `npm run build` to catch all errors

---

## Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register/seller` - Seller registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/current-user` - Get current user
- `POST /api/auth/refresh-token` - Refresh JWT token

### Seller Dashboard
- `GET /api/seller/dashboard` - Dashboard overview
- `GET /api/seller/orders` - Seller's orders
- `GET /api/seller/top-products` - Top performing products
- `GET /api/seller/analytics` - Analytics data

### Products
- `GET /api/seller/products` - List seller's products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/seller/orders` - List orders
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/:id` - Get order details

### Categories
- `GET /api/categories/seller/my-categories` - Get seller categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Logistics
- `GET /api/seller/logistics/overview` - Logistics overview
- `GET /api/seller/logistics/shipments` - Shipment list
- `GET /api/seller/logistics/returns` - Return management

---

## Component Structure

### Main Components
- **App.tsx** - Main application root with tab navigation
- **SellerRoutes.tsx** - Route definitions
- **Sidebar.tsx** - Navigation sidebar
- **Topbar.tsx** - Top navigation bar

### Page Components (in App.tsx)
- **DashboardTab** - Dashboard view
- **ProductsTab** - Products management
- **OrdersTab** - Orders management
- **CustomersTab** - Customers view
- **MarketingTab** - Marketing campaigns
- **LogisticsTab** - Logistics management
- **SupportTab** - Support/Tickets
- **RevenueDashboard** - Revenue analytics

### Modal Components
- **LoginPortal** - Login form
- **ProfileModal** - User profile editor
- **ProductModal** - Product editor
- **CheckoutModal** - Checkout (if applicable)
- **FeedbackModal** - Customer feedback

### Service Files
- **sellerApi.ts** - API service for all seller endpoints
- **analytics.ts** - PostHog analytics integration
- **aiService.ts** - AI-powered features (Gemini/Claude)
- **api.ts** - General API utilities

---

## Testing

### Run Tests
```bash
npm run test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests (Single Run)
```bash
npm run test:run
```

---

## Performance Optimization

### Data Loading Strategy
- Dashboard stats load with 10-second timeout
- Background refresh every 30 seconds for orders/products
- Graceful degradation if API fails

### Caching
- User data cached in Context
- localStorage for tokens
- Local component state for UI cache

### Bundle Optimization
- Code splitting at route level
- Lazy loading for components
- Tree shaking unused dependencies

---

## Troubleshooting Tips

1. **Check Console Errors**: Open DevTools → Console for detailed errors
2. **Network Tab**: Check Network tab to see API requests/responses
3. **localStorage**: Check browser storage for tokens
4. **Backend Logs**: Check backend terminal for API errors
5. **Clear Cache**: Use `npm cache clean --force`
6. **Rebuild**: Delete `node_modules` and reinstall

---

## Next Steps

1. ✅ Complete seller registration
2. ✅ Set up products
3. ✅ Configure marketing campaigns
4. ✅ Set up logistics partners
5. ✅ Monitor orders and revenue
6. ✅ Analyze customer insights

---

## Support & Documentation

- **Backend API Docs**: See `backend/README.md`
- **Architecture Guide**: See `ARCHITECTURE_GUIDE.md`
- **Auth Documentation**: See `AUTHENTICATION_CRITICAL_FIX.md`
- **Troubleshooting**: See `QUICK_REFERENCE.md`

---

## Quick Reference Commands

```bash
# Setup
npm install --legacy-peer-deps

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview prod build

# Testing
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:run         # Single test run

# Backend Setup
cd ../backend
npm install
npm run seed             # Create demo data
npm run dev              # Start backend server
```

---

Generated: February 4, 2026
Last Updated: 2026-02-04
