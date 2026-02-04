// PostHog Analytics Configuration for Amzify Seller Panel
// This file contains PostHog setup and tracking configuration

export const posthogConfig = {
  // PostHog instance URL - using EU cloud for better privacy compliance
  apiHost: 'https://eu.posthog.com',
  
  // Project token - Replace with your actual PostHog project token
  // For demo purposes, using a placeholder token
  token: process.env.VITE_POSTHOG_TOKEN || 'phc_demo_token_replace_with_real_token',
  
  // Feature flags and configuration
  options: {
    // Capture page views automatically
    capture_pageview: true,
    
    // Capture performance metrics
    capture_performance: true,
    
    // Session recording configuration
    session_recording: {
      // Enable session recordings for better user experience analysis
      record_sessions: true,
      
      // Only record sessions where users interact with key features
      sample_rate: 0.1, // Record 10% of sessions
      
      // Privacy settings
      mask_all_text: false,
      mask_all_inputs: true, // Mask sensitive input fields
    },
    
    // Autocapture configuration
    autocapture: {
      // Capture clicks, form submissions, page views automatically
      dom_event_allowlist: ['click', 'change', 'submit'],
      
      // Capture CSS selectors for better event identification
      css_selector_allowlist: [
        '[data-ph-capture]', // Custom data attribute for important elements
        '.stat-card',
        '.chart-container', 
        '.nav-item',
        '.action-button'
      ]
    },
    
    // Advanced features
    person_profiles: 'identified_only', // Only create profiles for logged-in users
    
    // Persistence configuration
    persistence: 'localStorage+cookie',
    
    // Cross-domain tracking
    cross_subdomain_cookie: true,
    
    // Privacy and compliance
    respect_dnt: true, // Respect Do Not Track headers
    opt_out_capturing_by_default: false,
    
    // Custom properties to capture automatically
    property_blacklist: [
      '$password',
      '$email', // Don't capture email automatically for privacy
      'password',
      'credit_card'
    ]
  },

  // Custom events we track in the seller dashboard
  events: {
    // Authentication events
    SELLER_LOGIN: 'seller_login',
    SELLER_LOGOUT: 'seller_logout',
    
    // Dashboard events
    DASHBOARD_VIEW: 'dashboard_view',
    STATS_CARD_CLICK: 'stats_card_click',
    CHART_INTERACTION: 'chart_interaction',
    TIME_RANGE_CHANGED: 'time_range_changed',
    DASHBOARD_REFRESH: 'dashboard_refresh',
    
    // Navigation events
    TAB_CHANGED: 'tab_changed',
    PAGE_VIEW: 'page_view',
    
    // Product management events
    PRODUCT_CREATED: 'product_created',
    PRODUCT_UPDATED: 'product_updated',
    PRODUCT_DELETED: 'product_deleted',
    PRODUCT_VIEW: 'product_view',
    
    // Order management events
    ORDER_VIEW: 'order_view',
    ORDER_STATUS_CHANGED: 'order_status_changed',
    ORDER_FULFILLED: 'order_fulfilled',
    
    // Revenue tracking events
    REVENUE_MILESTONE: 'revenue_milestone',
    PAYMENT_RECEIVED: 'payment_received',
    
    // Marketing events
    CAMPAIGN_CREATED: 'campaign_created',
    PROMOTION_LAUNCHED: 'promotion_launched',
    
    // Error tracking
    API_ERROR: 'api_error',
    DASHBOARD_ERROR: 'dashboard_error',
    
    // Performance events
    SLOW_QUERY: 'slow_query',
    PAGE_LOAD_TIME: 'page_load_time'
  },

  // User properties we track for segmentation
  userProperties: {
    seller_tier: 'Seller subscription tier (basic, premium, enterprise)',
    store_category: 'Primary store category',
    monthly_revenue: 'Monthly revenue bracket',
    products_count: 'Number of active products',
    orders_count: 'Total orders processed',
    signup_date: 'Date when seller joined platform',
    last_login: 'Last login timestamp',
    preferred_language: 'UI language preference'
  },

  // Cohorts for analysis
  cohorts: {
    high_performers: 'Sellers with >$10k monthly revenue',
    new_sellers: 'Sellers registered in last 30 days', 
    active_sellers: 'Sellers with activity in last 7 days',
    at_risk: 'Sellers with declining metrics'
  },

  // Funnel analysis stages
  funnels: {
    seller_onboarding: [
      'seller_signup',
      'first_product_added',
      'first_order_received',
      'payment_setup_complete'
    ],
    
    dashboard_engagement: [
      'dashboard_view',
      'stats_card_click', 
      'chart_interaction',
      'action_taken'
    ]
  }
};

// Environment-specific configurations
export const getPostHogConfig = () => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  return {
    ...posthogConfig,
    options: {
      ...posthogConfig.options,
      
      // Disable session recording in development
      session_recording: {
        ...posthogConfig.options.session_recording,
        record_sessions: isProd,
      },
      
      // More verbose logging in development
      loaded: (posthog) => {
        if (isDev) {
          console.log('PostHog loaded for development environment');
          posthog.debug(); // Enable debug mode
        }
      },
      
      // Respect local storage opt-out in development
      opt_out_capturing_by_default: isDev,
    }
  };
};

// Export default config
export default posthogConfig;