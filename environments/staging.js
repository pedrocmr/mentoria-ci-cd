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
    enableDebug: false,
    enableMetrics: true,
    enableAuth: true
  },
  monitoring: {
    enabled: true,
    level: 'warn'
  }
};