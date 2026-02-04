# Amzify Customer Panel - Quick Start Guide

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend server running on `http://localhost:5009`

### Installation

```bash
# Navigate to customer panel directory
cd amzify-customer-panel

# Install dependencies
npm install
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy)

#### Production Build

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## ✨ Features Available

### For Guest Users (No Login Required)

- ✅ Browse all products
- ✅ Search and filter by category
- ✅ View product details with image gallery
- ✅ Add items to shopping cart (stored locally)
- ✅ Update cart quantities
- ✅ Remove items from cart
- ✅ View cart total
- ✅ Submit feedback
- ✅ Apply to become a seller
- ⚠️ Login required for checkout

### For Authenticated Users

All guest features PLUS:

- ✅ Complete checkout process
- ✅ Place orders with payment selection
- ✅ View order history
- ✅ Track order status
- ✅ Manage shipping addresses
- ✅ Create and manage wishlist
- ✅ View membership tier and benefits
- ✅ Update account settings
- ✅ Logout functionality
- ✅ Delete account option

## 📱 User Interface

### Desktop Navigation

- **Header Bar**:
  - Amzify logo (click to return home)
  - Home button
  - Products button
  - Search bar
  - Cart button with item count
  - Feedback button
  - Profile/Login button

### Mobile Navigation

- **Bottom Tab Bar**:
  - Shop (home)
  - Products
  - Feedback
  - Cart (elevated center button)
  - Wishlist
  - Profile/Login

## 🛒 Shopping Flow

### 1. Browse Products

- View products on home page
- Or click "Products" to see all products
- Use category filters at top
- Search for specific items

### 2. View Product Details

- Click any product card
- View image gallery (zoom available)
- See price, category, rating
- Read description
- Click "Add to Collection"

### 3. Manage Cart

- Click cart icon (shows item count)
- View all cart items
- Adjust quantities with +/- buttons
- Remove items with trash icon
- See total price

### 4. Checkout (Requires Login)

**Step 1: Shipping Address**

- Enter complete address
- City, state, postal code
- Country (India)

**Step 2: Payment Method**

- Credit/Debit Card
- UPI Payment
- Cash on Delivery (COD)

**Step 3: Confirmation**

- Review order summary
- Confirm address and payment
- Place order

### 5. Track Orders

- Click Profile → My Orders
- View order status
- See tracking numbers
- View order details

## 🔐 Account Features

### Profile Modal Tabs

**Profile**

- Membership tier card
- Reward points
- Benefits section
- Recent orders preview
- Account statistics

**My Orders**

- Complete order history
- Order status tracking
- View detailed information
- Track shipments

**Addresses**

- Saved shipping addresses
- Default address management
- Add new addresses

**Wishlist**

- Save items for later
- Quick add to cart
- Remove items
- View saved products

**Settings**

- Notification preferences
- Privacy settings
- Logout button
- Account deletion

## 🎯 Key Interactions

### Working Buttons

✅ All navigation buttons
✅ Add to cart buttons
✅ Quantity increment/decrement
✅ Remove from cart
✅ Checkout/Place order
✅ View product details
✅ Category filters
✅ Search
✅ View seller details
✅ Wishlist add/remove
✅ Login/Logout
✅ Profile management
✅ Feedback submission
✅ Become seller application

### Interactive Elements

✅ Product image carousel
✅ Image zoom on hover
✅ Category switching
✅ Tab navigation in profile
✅ Modal open/close
✅ Form validation
✅ Loading states
✅ Success animations

## 🔧 Configuration

### Environment

The app connects to backend at: `http://localhost:5009/api`

To change backend URL, update in:

- `services/customerApi.ts`
- Components making direct fetch calls

### Authentication

- JWT tokens stored in localStorage
- `accessToken` - for API requests
- `refreshToken` - for token renewal

## 📊 Data Handling

### Local Cart (Guest Users)

- Cart stored in component state
- Persists during session
- Lost on page refresh
- No server sync

### Synced Cart (Authenticated Users)

- Cart stored locally AND on server
- Instant UI updates
- Background server sync
- Persists across devices

## 🎨 UI Features

### Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Touch-friendly controls

### Animations

- Smooth page transitions
- Cart add animation
- Loading spinners
- Success feedback
- Hover effects

### Accessibility

- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus indicators

## 🐛 Troubleshooting

### Cart not updating?

- Check if backend is running
- For guests, cart is local only
- For users, check network tab for errors

### Products not loading?

- Verify backend is at `http://localhost:5009`
- Check browser console for errors
- Fallback mock data may be shown

### Can't checkout?

- Login required for checkout
- Ensure cart has items
- Fill all address fields
- Select payment method

### Images not showing?

- Check internet connection
- Fallback placeholder images shown
- Backend may not have product images

## 📚 Component Structure

```
App.tsx (Main)
├── Header (Navigation)
├── Home View
│   ├── Hero Section
│   ├── Category Bar
│   └── Product Grid
├── Products Page
│   ├── Category Filters
│   ├── Search Bar
│   └── Product Grid
└── Modals
    ├── Cart Drawer
    ├── Product Modal
    ├── Checkout Modal
    ├── Profile Modal
    ├── Feedback Modal
    ├── Become Seller Modal
    └── Post-Purchase Modal
```

## 💡 Tips

1. **Fast Shopping**: Click + button on product cards for instant add-to-cart
2. **Quick View**: Click anywhere on product card for detailed modal
3. **Guest Mode**: Shop without login, cart saved in browser
4. **Search**: Use search bar for quick product finding
5. **Categories**: Filter by category for focused browsing
6. **Wishlist**: Save items for later (requires login)
7. **Orders**: Track all orders from Profile → My Orders

## 🎉 You're All Set!

The customer panel is fully functional with all buttons and features working. Enjoy shopping on Amzify! 🛍️

---

**Need Help?**

- Check the main `CUSTOMER_PANEL_FIXES.md` for technical details
- See `README.md` for project overview
- Contact support for assistance
