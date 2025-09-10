module.exports = {
  server: {
    hostname: '0.0.0.0',
    port: 3000
  },
  database: {
    url: 'postgresql://fake-prod-db:5432/app_production'
  },
  api: {
    baseUrl: 'https://api.mentoria-ci-cd.com'
  },
  features: {
    // Basic system flags
    enableDebug: false,
    enableMetrics: true,
    enableAuth: true,
    
    // Conservative rollout in production
    newDashboard: false,        // Not ready for production yet
    dashboardAnalytics: false,  // Analytics not ready
    
    // Payment system - gradual rollout in production
    newPaymentGateway: false,   // Too risky, keeping old system
    paymentValidation: true,    // Safe validation improvements
    
    // Mobile features - conservative approach
    mobileApiV2: false,         // Still testing in staging
    mobilePushNotifications: false,
    
    // Very conservative percentage rollouts in production
    experimentalSearch: 5,      // Only 5% of production users
    betaFeatures: 0,           // No beta features in production
    
    // Team features - production-ready only
    userProfileRedesign: {
      default: false,  // Not ready for production
      teams: {
        frontend: false,
        qa: false,
        backend: false
      }
    },
    
    // Environment-specific - no debug logging in production
    advancedLogging: {
      environments: {
        development: true,
        staging: true,
        production: false  // Critical: no debug logs in production
      }
    },
    
    // AI features - very limited production rollout
    aiRecommendations: {
      default: false,
      percentage: 2,   // Only 2% of production users
      teams: {
        datascience: false,  // Even data science team gets production experience
        product: false,
        qa: false
      }
    }
  },
  monitoring: {
    enabled: true,
    level: 'error'
  }
};