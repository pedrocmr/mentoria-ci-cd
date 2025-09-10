const http = require('http');
const url = require('url');
const config = require('../config/config.js');
const FeatureFlagService = require('./featureFlags.js');

const hostname = config.server.hostname || 'localhost';
const port = config.server.port || 3000;

// Initialize Feature Flag Service
const featureFlagService = new FeatureFlagService(config);

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Feature Flag API Endpoints
    if (path === '/api/features') {
      handleFeaturesAPI(req, res, query);
    } else if (path === '/api/features/check') {
      handleFeatureCheckAPI(req, res, query);
    } else if (path === '/api/features/metadata') {
      handleFeatureMetadataAPI(req, res);
    } else if (path === '/health') {
      handleHealthCheck(req, res);
    } else if (path === '/') {
      handleRootEndpoint(req, res);
    } else {
      // 404 for unknown endpoints
      res.statusCode = 404;
      res.end(JSON.stringify({
        error: 'Endpoint not found',
        availableEndpoints: [
          '/',
          '/health',
          '/api/features',
          '/api/features/check',
          '/api/features/metadata'
        ]
      }, null, 2));
    }
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }, null, 2));
  }
});

/**
 * Handle root endpoint with feature flag examples
 */
function handleRootEndpoint(req, res) {
  res.statusCode = 200;
  
  // Example context (simulating different team members)
  const exampleContext = {
    userId: 'user123',
    team: 'frontend'
  };
  
  const response = {
    message: 'Mentoria CI/CD Application with Feature Flags',
    environment: config.environment,
    version: config.version,
    timestamp: new Date().toISOString(),
    deployment: {
      build_id: process.env.BUILD_ID || 'local',
      commit_sha: process.env.COMMIT_SHA || 'unknown',
      deployed_at: process.env.DEPLOYED_AT || new Date().toISOString()
    },
    featureFlags: {
      exampleContext,
      enabledFeatures: featureFlagService.getAllFlags(exampleContext)
    },
    trunkBasedDevelopment: {
      description: 'This application demonstrates trunk-based development with feature flags',
      benefits: [
        'Multiple teams can work on main branch simultaneously',
        'Features can be deployed but kept hidden until ready',
        'Gradual rollouts and A/B testing capabilities',
        'Emergency feature toggles for quick response'
      ]
    }
  };
  
  res.end(JSON.stringify(response, null, 2));
}

/**
 * Handle health check endpoint
 */
function handleHealthCheck(req, res) {
  res.statusCode = 200;
  res.end(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    featureFlagService: 'active'
  }, null, 2));
}

/**
 * Handle feature flags API - get all flags or specific flag
 */
function handleFeaturesAPI(req, res, query) {
  const context = {
    userId: query.userId || 'anonymous',
    team: query.team || null
  };
  
  if (query.flag) {
    // Get specific flag
    const isEnabled = featureFlagService.isEnabled(query.flag, context);
    res.statusCode = 200;
    res.end(JSON.stringify({
      flag: query.flag,
      enabled: isEnabled,
      context,
      environment: config.environment
    }, null, 2));
  } else {
    // Get all flags
    const allFlags = featureFlagService.getAllFlags(context);
    res.statusCode = 200;
    res.end(JSON.stringify({
      flags: allFlags,
      context,
      environment: config.environment,
      totalFlags: Object.keys(allFlags).length
    }, null, 2));
  }
}

/**
 * Handle feature check API - optimized for application code
 */
function handleFeatureCheckAPI(req, res, query) {
  if (!query.flag) {
    res.statusCode = 400;
    res.end(JSON.stringify({
      error: 'Missing required parameter: flag'
    }, null, 2));
    return;
  }
  
  const context = {
    userId: query.userId || 'anonymous',
    team: query.team || null
  };
  
  const isEnabled = featureFlagService.isEnabled(query.flag, context);
  
  res.statusCode = 200;
  res.end(JSON.stringify({
    enabled: isEnabled
  }, null, 2));
}

/**
 * Handle feature flag metadata API
 */
function handleFeatureMetadataAPI(req, res) {
  const metadata = featureFlagService.getMetadata();
  
  res.statusCode = 200;
  res.end(JSON.stringify({
    metadata,
    trunkBasedDevelopmentInfo: {
      description: 'Feature flags enable trunk-based development by allowing teams to merge unfinished features',
      teamWorkflow: {
        step1: 'Developer creates feature branch from main',
        step2: 'Feature is developed with feature flag protection',
        step3: 'Code is merged to main with feature disabled',
        step4: 'Feature is gradually enabled per environment',
        step5: 'Full rollout when feature is proven stable'
      },
      environments: {
        development: 'Features are enabled for testing and development',
        staging: 'Features are enabled for comprehensive QA testing',
        production: 'Features are carefully rolled out to real users'
      }
    }
  }, null, 2));
}

server.listen(port, hostname, () => {
  console.log(`🚀 Server running at http://${hostname}:${port}/`);
  console.log(`📦 Environment: ${config.environment}`);
  console.log(`🔧 Version: ${config.version}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📤 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = server;