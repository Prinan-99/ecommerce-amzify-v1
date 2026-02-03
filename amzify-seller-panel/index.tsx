import React from 'react';
import ReactDOM from 'react-dom/client';
import SellerRoutes from './SellerRoutes';
import { AuthProvider } from './context/RealAuthContext';
import { PostHogProvider } from 'posthog-js/react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
        debug: import.meta.env.MODE === 'development',
      }}
    >
      <AuthProvider>
        <SellerRoutes />
      </AuthProvider>
    </PostHogProvider>
  </React.StrictMode>
);