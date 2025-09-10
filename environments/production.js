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
    enableDebug: false,
    enableMetrics: true,
    enableAuth: true
  },
  monitoring: {
    enabled: true,
    level: 'error'
  }
};