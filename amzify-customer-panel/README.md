<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Amzify Customer Panel

A modern React-based e-commerce customer interface with AI-powered search.

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn

## Localhost Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set the GEMINI_API_KEY:**
   Create a `.env.local` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

Use the following credentials for testing:
- **Customer Email**: `customer@example.com`
- **Password**: `customer123`

**Other test customers:**
- `customer2@example.com` / `customer123` (David Smith)
- `customer3@example.com` / `customer123` (Emily Johnson)

**Note:** Run `npm run seed` in the backend folder first to create demo users and sample data.

## Features
- AI-Powered Product Search (Google Gemini)
- Shopping Cart & Checkout
- Order Tracking
- Wishlist Management
- Seller Dashboard (for customers who are also sellers)
- Product Reviews & Feedback
- User Profile Management
