module.exports = {
  server: {
    hostname: '0.0.0.0',
    port: 3000
  },
  database: {
    url: 'postgresql://fake-dev-db:5432/app_dev'
  },
  api: {
    baseUrl: 'https://api-dev.mentoria-ci-cd.com'
  },
  features: {
    enableDebug: true,
    enableMetrics: true,
    enableAuth: false
  },
  monitoring: {
    enabled: true,
    level: 'info'
  }
};