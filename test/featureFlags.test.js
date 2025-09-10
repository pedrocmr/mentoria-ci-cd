/**
 * Feature Flags Tests
 * 
 * Comprehensive tests for the feature flag system demonstrating
 * trunk-based development scenarios with multiple teams.
 */

const FeatureFlagService = require('../src/featureFlags.js');
const { TeamFeatureGate, createFeatureFlagGate } = require('../src/featureFlagMiddleware.js');

console.log('🧪 Running Feature Flag Tests...\n');

// Test configurations
const testConfig = {
  environment: 'test',
  features: {
    // Simple boolean flags
    simpleEnabled: true,
    simpleDisabled: false,
    
    // Percentage flags
    percentageFlag: 50,
    
    // Complex team-based flags
    teamFeature: {
      default: false,
      teams: {
        frontend: true,
        backend: false,
        qa: true
      }
    },
    
    // Environment-specific flags
    envSpecificFeature: {
      environments: {
        development: true,
        test: false,
        production: false
      }
    },
    
    // Complex percentage with team overrides
    complexFeature: {
      default: false,
      percentage: 25,
      teams: {
        devops: true
      }
    }
  }
};

let testsPassed = 0;
let testsTotal = 0;

function runTest(testName, testFunction) {
  testsTotal++;
  try {
    testFunction();
    console.log(`✅ ${testName}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${testName}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Initialize service
const featureFlagService = new FeatureFlagService(testConfig);

// Test 1: Basic Flag Operations
runTest('Basic boolean flags work correctly', () => {
  assert(featureFlagService.isEnabled('simpleEnabled') === true, 'Simple enabled flag should be true');
  assert(featureFlagService.isEnabled('simpleDisabled') === false, 'Simple disabled flag should be false');
  assert(featureFlagService.isEnabled('nonExistentFlag') === false, 'Non-existent flag should default to false');
});

// Test 2: Team-based Flags
runTest('Team-based flags work correctly', () => {
  assert(featureFlagService.isEnabled('teamFeature', { team: 'frontend' }) === true, 'Frontend team should see team feature');
  assert(featureFlagService.isEnabled('teamFeature', { team: 'backend' }) === false, 'Backend team should not see team feature');
  assert(featureFlagService.isEnabled('teamFeature', { team: 'qa' }) === true, 'QA team should see team feature');
  assert(featureFlagService.isEnabled('teamFeature', { team: 'unknown' }) === false, 'Unknown team should get default (false)');
});

// Test 3: Environment-specific Flags
runTest('Environment-specific flags work correctly', () => {
  assert(featureFlagService.isEnabled('envSpecificFeature') === false, 'Test environment should have flag disabled');
});

// Test 4: Percentage Flags (deterministic with user ID)
runTest('Percentage flags work with user context', () => {
  // Test with specific user IDs to ensure deterministic behavior
  const user1Result = featureFlagService.isEnabled('percentageFlag', { userId: 'user1' });
  const user2Result = featureFlagService.isEnabled('percentageFlag', { userId: 'user2' });
  
  // Results should be consistent for the same user
  assert(featureFlagService.isEnabled('percentageFlag', { userId: 'user1' }) === user1Result, 'Percentage flag should be consistent for same user');
  assert(featureFlagService.isEnabled('percentageFlag', { userId: 'user2' }) === user2Result, 'Percentage flag should be consistent for same user');
  
  // Results should be boolean
  assert(typeof user1Result === 'boolean', 'User1 result should be boolean');
  assert(typeof user2Result === 'boolean', 'User2 result should be boolean');
});

// Test 5: Complex Flags with Team Overrides
runTest('Complex flags with team overrides work correctly', () => {
  assert(featureFlagService.isEnabled('complexFeature', { team: 'devops' }) === true, 'DevOps team should always see complex feature');
  
  // Other teams should get percentage-based result, but it should be consistent
  const frontendResult = featureFlagService.isEnabled('complexFeature', { team: 'frontend', userId: 'testuser' });
  assert(typeof frontendResult === 'boolean', 'Frontend team should get boolean result');
});

// Test 6: Runtime Overrides
runTest('Runtime overrides work correctly', () => {
  featureFlagService.setRuntimeOverride('simpleDisabled', true);
  assert(featureFlagService.isEnabled('simpleDisabled') === true, 'Runtime override should override config');
  
  featureFlagService.removeRuntimeOverride('simpleDisabled');
  assert(featureFlagService.isEnabled('simpleDisabled') === false, 'Removing override should restore original value');
});

// Test 7: Get All Flags
runTest('Get all flags returns correct structure', () => {
  const allFlags = featureFlagService.getAllFlags({ team: 'frontend' });
  assert(typeof allFlags === 'object', 'getAllFlags should return an object');
  assert(allFlags.hasOwnProperty('simpleEnabled'), 'getAllFlags should include all configured flags');
  assert(allFlags.simpleEnabled.hasOwnProperty('enabled'), 'Flag entries should have enabled property');
  assert(allFlags.simpleEnabled.hasOwnProperty('source'), 'Flag entries should have source property');
});

// Test 8: Metadata
runTest('Metadata provides correct information', () => {
  const metadata = featureFlagService.getMetadata();
  assert(metadata.environment === 'test', 'Metadata should include correct environment');
  assert(typeof metadata.totalFlags === 'number', 'Metadata should include flag count');
  assert(Array.isArray(metadata.availableFlags), 'Metadata should include available flags list');
});

// Test 9: Team Feature Gate
runTest('Team Feature Gate works correctly', () => {
  const frontendGate = new TeamFeatureGate(featureFlagService, 'frontend');
  const backendGate = new TeamFeatureGate(featureFlagService, 'backend');
  
  assert(frontendGate.isEnabled('teamFeature') === true, 'Frontend gate should see team feature');
  assert(backendGate.isEnabled('teamFeature') === false, 'Backend gate should not see team feature');
});

// Test 10: Feature Flag Gate Helper
runTest('Feature Flag Gate helper works correctly', () => {
  const gate = createFeatureFlagGate(featureFlagService);
  
  let executedEnabled = false;
  let executedDisabled = false;
  
  gate.when('simpleEnabled', 
    () => { executedEnabled = true; },
    () => { executedDisabled = true; }
  );
  
  assert(executedEnabled === true, 'Enabled callback should execute');
  assert(executedDisabled === false, 'Disabled callback should not execute');
  
  const value = gate.value('simpleEnabled', 'enabled-value', 'disabled-value');
  assert(value === 'enabled-value', 'Should return enabled value');
});

// Test 11: Team-aware Gate
runTest('Team-aware gate works correctly', () => {
  const gate = createFeatureFlagGate(featureFlagService);
  const frontendGate = gate.forTeam('frontend');
  
  const value = frontendGate.value('teamFeature', 'team-enabled', 'team-disabled');
  assert(value === 'team-enabled', 'Frontend team should get enabled value');
});

// Test 12: Trunk-based Development Simulation
runTest('Trunk-based development simulation works', () => {
  console.log('\n📋 Simulating trunk-based development workflow:');
  
  // Simulate different teams working on main branch
  const teams = ['frontend', 'backend', 'qa', 'devops', 'mobile'];
  
  teams.forEach(team => {
    const teamGate = new TeamFeatureGate(featureFlagService, team);
    console.log(`   Team ${team}:`);
    
    // Check each team's access to different features
    const features = ['teamFeature', 'complexFeature', 'simpleEnabled'];
    features.forEach(feature => {
      const enabled = teamGate.isEnabled(feature);
      console.log(`     - ${feature}: ${enabled ? '✅ enabled' : '❌ disabled'}`);
    });
  });
  
  console.log('   📝 This demonstrates how teams can work on main branch with different feature visibility\n');
  
  assert(true, 'Simulation completed successfully');
});

// Test Results
console.log(`\n📊 Feature Flag Test Results: ${testsPassed}/${testsTotal} tests passed`);

if (testsPassed === testsTotal) {
  console.log('🎉 All feature flag tests passed!');
  console.log('\n🌳 Trunk-based Development Benefits Demonstrated:');
  console.log('   ✅ Multiple teams can work on main branch simultaneously');
  console.log('   ✅ Features can be deployed but kept hidden until ready');
  console.log('   ✅ Team-specific feature visibility enables parallel development');
  console.log('   ✅ Runtime overrides allow for emergency feature toggles');
  console.log('   ✅ Percentage rollouts enable gradual feature deployment');
  console.log('   ✅ Environment-specific configurations ensure proper isolation');
} else {
  console.log('❌ Some feature flag tests failed!');
  process.exit(1);
}