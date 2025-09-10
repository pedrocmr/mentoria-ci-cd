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
    enableDebug: true,
    enableMetrics: false,
    enableAuth: false
  },
  monitoring: {
    enabled: false,
    level: 'debug'
  }
};