import posthog from 'posthog-js';

class AnalyticsService {
  private isInitialized = false;

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      const token = (import.meta as any).env?.VITE_POSTHOG_KEY || 'phc_demo_token';
      posthog.init(token, {
        api_host: 'https://us.posthog.com',
        autocapture: true,
        capture_pageview: true,
        loaded: () => {
          this.isInitialized = true;
          console.log('✅ PostHog Analytics initialized');
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize PostHog:', error);
    }
  }

  // User identification
  identify(userId: string, userProperties?: Record<string, any>) {
    if (!this.isInitialized) return;
    try {
      posthog.identify(userId, userProperties);
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  // Track custom events
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isInitialized) return;
    try {
      posthog.capture(eventName, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  trackEvent(eventName: string, properties?: Record<string, any>) {
    this.track(eventName, properties);
  }

  // Dashboard specific events
  trackDashboardView(userId: string) {
    this.track('dashboard_viewed', {
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }

  trackStatsCardClick(title: string, value: number | string) {
    this.track('stats_card_clicked', {
      card_title: title,
      card_value: value
    });
  }

  trackStatsLoad(stats: any) {
    this.track('stats_loaded', {
      revenue: stats.totalRevenue,
      orders: stats.totalOrders,
      products: stats.activeProducts
    });
  }

  trackChartInteraction(chartType: string, dataPoint?: any) {
    this.track('chart_interaction', {
      chart_type: chartType,
      data_point: dataPoint
    });
  }

  trackRefreshAction(source: string) {
    this.track('dashboard_refresh', {
      source: source
    });
  }

  trackNavigation(from: string, to: string) {
    this.track('navigation', {
      from_tab: from,
      to_tab: to
    });
  }

  trackProductView(productId: string, productName: string) {
    this.track('product_viewed', {
      product_id: productId,
      product_name: productName
    });
  }

  trackOrderView(orderId: string, orderValue: number) {
    this.track('order_viewed', {
      order_id: orderId,
      order_value: orderValue
    });
  }

  trackNavigationAction(destination: string) {
    this.track('navigation', {
      destination: destination,
      source: 'seller_dashboard',
      timestamp: new Date().toISOString()
    });
  }

  // Revenue and business insights
  trackRevenueMetrics(stats: any) {
    this.track('revenue_metrics', {
      total_revenue: stats.totalRevenue,
      total_orders: stats.totalOrders,
      products_sold: stats.productsSold,
      total_customers: stats.totalCustomers,
      revenue_growth: stats.revenueGrowth,
      orders_growth: stats.ordersGrowth,
      avg_order_value: stats.averageOrderValue,
      timestamp: new Date().toISOString()
    });
  }

  // API performance tracking
  trackAPICall(endpoint: string, duration: number, success: boolean) {
    this.track('api_call', {
      endpoint: endpoint,
      duration_ms: duration,
      success: success,
      timestamp: new Date().toISOString()
    });
  }

  // Error tracking
  trackError(error: string, context?: string, additionalData?: any) {
    this.track('error_occurred', {
      error_message: error,
      context: context || 'dashboard',
      additional_data: additionalData,
      timestamp: new Date().toISOString()
    });
  }

  // Feature usage tracking
  trackFeatureUsage(featureName: string, action: string) {
    this.track('feature_usage', {
      feature_name: featureName,
      action: action,
      timestamp: new Date().toISOString()
    });
  }

  // Performance monitoring
  trackPageLoad(loadTime: number) {
    this.track('page_load_time', {
      load_time_ms: loadTime,
      page: 'seller_dashboard',
      timestamp: new Date().toISOString()
    });
  }

  // User properties
  setUserProperties(properties: Record<string, any>) {
    if (!this.isInitialized) return;
    posthog.people.set(properties);
  }

  // Group analytics (for seller companies)
  setGroup(groupType: string, groupKey: string, groupProperties?: Record<string, any>) {
    if (!this.isInitialized) return;
    posthog.group(groupType, groupKey, groupProperties);
  }

  // Feature flags
  isFeatureEnabled(flagKey: string): boolean {
    if (!this.isInitialized) return false;
    return posthog.isFeatureEnabled(flagKey) || false;
  }

  getFeatureFlag(flagKey: string): string | boolean | undefined {
    if (!this.isInitialized) return undefined;
    return posthog.getFeatureFlag(flagKey);
  }

  // Session recording
  startRecording() {
    if (!this.isInitialized) return;
    posthog.startSessionRecording();
  }

  stopRecording() {
    if (!this.isInitialized) return;
    posthog.stopSessionRecording();
  }

  // Reset (for logout)
  reset() {
    if (!this.isInitialized) return;
    posthog.reset();
  }
}

export const analytics = new AnalyticsService();