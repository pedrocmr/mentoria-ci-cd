module.exports = {
  server: {
    hostname: '0.0.0.0',
    port: 3000
  },
  database: {
    url: 'postgresql://fake-staging-db:5432/app_staging'
  },
  api: {
    baseUrl: 'https://api-staging.mentoria-ci-cd.com'
  },
  features: {
    // Basic system flags
    enableDebug: false,
    enableMetrics: true,
    enableAuth: true,
    
    // Team features ready for staging validation
    newDashboard: true,
    dashboardAnalytics: true,  // Analytics ready for staging
    
    // Payment system ready for testing
    newPaymentGateway: true,
    paymentValidation: true,
    
    // Mobile features in staging
    mobileApiV2: true,
    mobilePushNotifications: true,
    
    // Higher percentage rollouts in staging
    experimentalSearch: 80,  // 80% in staging for better testing
    betaFeatures: 100,       // All beta features enabled in staging
    
    // Team features - staging should mirror production behavior
    userProfileRedesign: {
      default: true,  // Default enabled in staging
      teams: {
        frontend: true,
        qa: true,
        backend: true   // Backend team tests integration
      }
    },
    
    // Environment-specific
    advancedLogging: {
      environments: {
        development: true,
        staging: true,
        production: false
      }
    },
    
    // AI features with higher rollout for testing
    aiRecommendations: {
      default: true,   // Default enabled in staging
      percentage: 75,  // 75% rollout for better testing coverage
      teams: {
        datascience: true,
        product: true,
        qa: true
      }
    }
  },
  monitoring: {
    enabled: true,
    level: 'warn'
  }
};