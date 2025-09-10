const http = require('http');
const config = require('../config/config.js');

console.log('🧪 Running tests for Mentoria CI/CD...\n');

// Test 1: Configuration Loading
function testConfigLoading() {
  console.log('Test 1: Configuration Loading');
  
  if (!config) {
    console.error('❌ Config not loaded');
    return false;
  }
  
  if (!config.environment) {
    console.error('❌ Environment not set in config');
    return false;
  }
  
  if (!config.version) {
    console.error('❌ Version not set in config');
    return false;
  }
  
  console.log(`✅ Config loaded successfully (env: ${config.environment}, version: ${config.version})`);
  return true;
}

// Test 2: Server Response
function testServerResponse() {
  return new Promise((resolve, reject) => {
    console.log('Test 2: Server Response');
    
    const server = require('../src/index.js');
    const port = config.server.port;
    
    // Wait a bit for server to start
    setTimeout(() => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET'
      }, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (response.message && response.environment && response.version) {
              console.log('✅ Server response is valid');
              server.close(() => {
                resolve(true);
              });
            } else {
              console.error('❌ Server response missing required fields');
              server.close(() => {
                resolve(false);
              });
            }
          } catch (error) {
            console.error('❌ Server response is not valid JSON');
            server.close(() => {
              resolve(false);
            });
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Server request failed:', error.message);
        server.close(() => {
          resolve(false);
        });
      });
      
      req.end();
    }, 1000);
  });
}

// Test 3: Environment-specific configs
function testEnvironmentConfigs() {
  console.log('Test 3: Environment-specific configs');
  
  const environments = ['development', 'dev', 'staging', 'production'];
  let allValid = true;
  
  for (const env of environments) {
    try {
      const envConfig = require(`../environments/${env}.js`);
      if (!envConfig.server || !envConfig.database || !envConfig.api) {
        console.error(`❌ Environment config for '${env}' is missing required fields`);
        allValid = false;
      } else {
        console.log(`✅ Environment config for '${env}' is valid`);
      }
    } catch (error) {
      console.error(`❌ Environment config for '${env}' could not be loaded`);
      allValid = false;
    }
  }
  
  return allValid;
}

// Run all tests
async function runTests() {
  const results = [];
  
  results.push(testConfigLoading());
  results.push(testEnvironmentConfigs());
  results.push(await testServerResponse());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed!');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});