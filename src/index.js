const http = require('http');
const config = require('../config/config.js');

const hostname = config.server.hostname || 'localhost';
const port = config.server.port || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  
  const response = {
    message: 'Mentoria CI/CD Application',
    environment: config.environment,
    version: config.version,
    timestamp: new Date().toISOString(),
    deployment: {
      build_id: process.env.BUILD_ID || 'local',
      commit_sha: process.env.COMMIT_SHA || 'unknown',
      deployed_at: process.env.DEPLOYED_AT || new Date().toISOString()
    }
  };
  
  res.end(JSON.stringify(response, null, 2));
});

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