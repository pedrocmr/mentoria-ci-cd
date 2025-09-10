const package_json = require('../package.json');

// Get environment from ENV variable or default to 'development'
const environment = process.env.NODE_ENV || 'development';

// Load environment specific config
let envConfig = {};
try {
  envConfig = require(`../environments/${environment}.js`);
} catch (error) {
  console.warn(`⚠️  Environment config for '${environment}' not found, using defaults`);
  envConfig = require('../environments/development.js');
}

const config = {
  environment: environment,
  version: package_json.version,
  server: {
    hostname: process.env.HOSTNAME || envConfig.server?.hostname || 'localhost',
    port: process.env.PORT || envConfig.server?.port || 3000
  },
  database: {
    url: process.env.DATABASE_URL || envConfig.database?.url || 'sqlite://fake.db'
  },
  api: {
    baseUrl: process.env.API_BASE_URL || envConfig.api?.baseUrl || 'http://localhost:3000'
  },
  features: envConfig.features || {},
  monitoring: envConfig.monitoring || {}
};

module.exports = config;