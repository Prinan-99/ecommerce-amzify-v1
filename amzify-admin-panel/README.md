
# Nexus E-commerce Admin Console

A production-grade React administrative dashboard for large-scale e-commerce platforms.

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn

## Localhost Setup

1. **Clone the repository** (if applicable) or copy the files into a new project directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. **Access the application**:
   Open [http://localhost:5174](http://localhost:5174) in your browser.

## Authentication
Use the following credentials for testing:
- **Email**: `admin@nexus.com`
- **Password**: `admin123`

## Features
- **Global Dashboard**: Real-time sales and user growth analytics using Recharts.
- **User Management**: Unified interface for customer and seller oversight.
- **Product Moderation**: Approval workflow for seller-submitted inventory.
- **Order Oversight**: Platform-wide transaction monitoring and dispute flagging.
- **Platform Configuration**: Dynamic control over commission rates, fees, and system maintenance.
- **Role-Based Security**: JWT-based session management and route protection.

## Technical Architecture
- **React 18**: Functional components with Hooks.
- **Tailwind CSS**: Utility-first styling for a responsive, high-performance UI.
- **Context API**: Global state management for authentication.
- **Axios**: Modular API service layer with request interceptors for JWT.
- **React Router**: Hash-based routing for environment compatibility.
