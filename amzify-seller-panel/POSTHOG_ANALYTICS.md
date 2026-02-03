# PostHog Analytics Integration

This document explains the PostHog analytics integration in the Amzify Seller Panel.

## Overview

PostHog is integrated to provide comprehensive analytics and user behavior tracking for the seller dashboard. This helps understand how sellers interact with the platform and identify areas for improvement.

## Features Implemented

### 🚀 Core Tracking
- **User Identification**: Automatically identifies sellers with profile data
- **Page Views**: Tracks all page navigations and dashboard visits
- **Event Tracking**: Captures key user interactions and business events
- **Performance Monitoring**: Tracks API response times and errors
- **Session Recording**: Records user sessions for UX analysis (configurable)

### 📊 Dashboard Analytics
- **Stats Card Interactions**: Tracks clicks on revenue, orders, products, customers cards
- **Chart Interactions**: Monitors how users engage with visualizations
- **Time Range Changes**: Tracks when users change dashboard time periods
- **Refresh Actions**: Monitors manual dashboard refreshes
- **Navigation Patterns**: Tracks tab changes and page flows

### 💰 Business Intelligence
- **Revenue Milestones**: Automatically tracks revenue achievements
- **Order Analytics**: Monitors order processing and fulfillment
- **Product Performance**: Tracks product creation, updates, and views
- **Error Tracking**: Captures API failures and user-facing errors
- **Feature Usage**: Monitors which features are most/least used

## Setup Instructions

### 1. Get PostHog Account
1. Sign up at [posthog.com](https://posthog.com)
2. Create a new project for "Amzify Seller Panel"
3. Copy your project token from the project settings

### 2. Configure Environment
Add your PostHog token to your environment variables:

```bash
# .env.local
VITE_POSTHOG_TOKEN=phc_your_actual_token_here
```

### 3. Update Configuration
Edit `posthog.config.js` to customize:
- Event names and properties
- Session recording settings
- Privacy and compliance options
- Feature flags and A/B testing

## Events Being Tracked

### Authentication
- `seller_login` - When seller logs in
- `seller_logout` - When seller logs out

### Dashboard Usage
- `dashboard_view` - Dashboard page loads
- `stats_card_click` - Clicks on metric cards
- `chart_interaction` - Interactions with charts/graphs
- `time_range_changed` - Time period filter changes
- `dashboard_refresh` - Manual refresh actions

### Navigation
- `tab_changed` - Navigation between sections
- `page_view` - Any page view with context

### Business Actions
- `product_created` - New product added
- `product_updated` - Product modifications
- `order_view` - Order details viewed
- `revenue_milestone` - Revenue achievements

### Technical
- `api_error` - API failures and errors
- `slow_query` - Performance issues
- `analytics_initialized` - Analytics setup

## Data Privacy & Compliance

- ✅ **GDPR Compliant**: Respects user privacy preferences
- ✅ **Opt-out Support**: Users can disable tracking
- ✅ **Data Masking**: Sensitive inputs are masked in recordings
- ✅ **Selective Recording**: Only 10% of sessions recorded by default
- ✅ **Local Storage**: Uses localStorage + cookies for persistence

## Analytics Dashboard

Once data starts flowing, you can access:

1. **PostHog Dashboard**: Real-time analytics and user behavior
2. **Funnels**: Seller onboarding and engagement flows
3. **Cohorts**: Segment high-performing vs at-risk sellers
4. **Session Recordings**: Watch real user interactions
5. **Feature Flags**: A/B testing and gradual feature rollouts

## Key Metrics to Monitor

### Seller Engagement
- Daily/Monthly Active Sellers
- Session duration and page views
- Feature adoption rates
- Dashboard interaction patterns

### Business Performance
- Revenue per seller trends
- Order processing efficiency
- Product catalog growth
- Customer acquisition patterns

### Technical Health
- API response times
- Error rates and types
- Page load performance
- User experience issues

## Development vs Production

### Development Mode
- Debug logging enabled
- Session recording disabled
- Opt-out by default
- Verbose console output

### Production Mode
- Optimized performance
- Session recording enabled (sampled)
- Full event tracking
- Privacy compliance active

## Advanced Features

### Feature Flags
Enable gradual rollouts and A/B testing:

```typescript
// Check if feature is enabled for user
const showNewDashboard = await analytics.isFeatureEnabled('new_dashboard_layout');

// Track feature usage
analytics.trackFeatureUsage('advanced_analytics_panel', true);
```

### Cohort Analysis
Segment users based on behavior:
- High-performing sellers (>$10k/month)
- New sellers (registered <30 days)
- At-risk sellers (declining metrics)

### Custom Properties
Track seller-specific attributes:
- Store category and size
- Geographic location
- Subscription tier
- Performance metrics

## Troubleshooting

### Common Issues
1. **Events not appearing**: Check token configuration
2. **Session recordings empty**: Verify recording settings
3. **Performance impact**: Adjust sampling rates
4. **Privacy concerns**: Review data collection policies

### Debug Mode
Enable debug logging in development:
```typescript
// Already enabled in dev environment
// Check browser console for PostHog debug info
```

## Next Steps

1. **Set up PostHog project** with your actual token
2. **Configure custom events** for your specific business needs
3. **Create dashboards** to monitor key seller metrics
4. **Set up alerts** for critical business events
5. **Implement A/B testing** for new features

## Contact

For analytics questions or PostHog setup help, refer to:
- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Community](https://posthog.com/questions)