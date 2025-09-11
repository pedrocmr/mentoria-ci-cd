module.exports = {
  server: {
    hostname: 'localhost',
    port: 3000
  },
  database: {
    url: 'sqlite://dev.db'
  },
  api: {
    baseUrl: 'http://localhost:3000'
  },
  features: {
    // Basic system flags
    enableDebug: true,
    enableMetrics: false,
    enableAuth: false,
    
    // Team-based feature development (trunk-based development simulation)
    // Team Frontend working on new dashboard
    newDashboard: true,
    dashboardAnalytics: false,
    
    // Team Backend working on payment system
    newPaymentGateway: true,
    paymentValidation: true,
    
    // Team Mobile working on mobile API
    mobileApiV2: true,
    mobilePushNotifications: false,
    
    // Gradual rollout features (percentage-based)
    experimentalSearch: 30, // 30% of users
    betaFeatures: 50,       // 50% of users
    
    // Complex team-based flags
    userProfileRedesign: {
      default: false,
      teams: {
        frontend: true,    // Frontend team sees it
        qa: true,         // QA team tests it
        backend: false    // Backend team doesn't need it yet
      }
    },
    
    // Environment-specific overrides
    advancedLogging: {
      environments: {
        development: true,
        staging: true,
        production: false
      }
    },
    
    // Feature with percentage rollout and team overrides
    aiRecommendations: {
      default: false,
      percentage: 10,  // 10% of users by default
      teams: {
        datascience: true, // Data science team always sees it
        product: true      // Product team for testing
      }
    }
  },
  monitoring: {
    enabled: false,
    level: 'debug'
  }
};