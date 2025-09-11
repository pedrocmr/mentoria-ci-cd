/**
 * Team Development Simulation
 * 
 * This script simulates how different teams can work simultaneously
 * on the main branch using feature flags in a trunk-based development workflow.
 */

const config = require('../config/config.js');
const FeatureFlagService = require('../src/featureFlags.js');
const { TeamFeatureGate, createFeatureFlagGate } = require('../src/featureFlagMiddleware.js');

console.log('🌳 Trunk-Based Development Simulation with Feature Flags\n');
console.log('=' .repeat(60));

// Initialize feature flag service
const featureFlagService = new FeatureFlagService(config);

// Define teams
const teams = [
  { name: 'frontend', members: ['Alice', 'Bob', 'Carol'] },
  { name: 'backend', members: ['David', 'Eve', 'Frank'] },
  { name: 'mobile', members: ['Grace', 'Henry'] },
  { name: 'datascience', members: ['Ivy', 'Jack'] },
  { name: 'qa', members: ['Kate', 'Liam'] },
  { name: 'devops', members: ['Mia', 'Noah'] }
];

// Features being developed by different teams
const featuresInDevelopment = [
  {
    name: 'newDashboard',
    team: 'frontend',
    description: 'Redesigned user dashboard with modern UI'
  },
  {
    name: 'newPaymentGateway', 
    team: 'backend',
    description: 'Integration with new payment provider'
  },
  {
    name: 'mobileApiV2',
    team: 'mobile', 
    description: 'Mobile-optimized API endpoints'
  },
  {
    name: 'aiRecommendations',
    team: 'datascience',
    description: 'AI-powered product recommendations'
  },
  {
    name: 'userProfileRedesign',
    team: 'frontend',
    description: 'Enhanced user profile interface'
  }
];

console.log('📋 Current Sprint: Teams Working on Main Branch');
console.log('-' .repeat(60));

// Simulate each team's work
teams.forEach(team => {
  console.log(`\n👥 Team ${team.name.toUpperCase()} (${team.members.join(', ')})`);
  
  const teamGate = new TeamFeatureGate(featureFlagService, team.name);
  
  // Check what features this team can see
  const visibleFeatures = featuresInDevelopment.filter(feature => 
    teamGate.isEnabled(feature.name)
  );
  
  if (visibleFeatures.length > 0) {
    console.log('   🚀 Features visible to this team:');
    visibleFeatures.forEach(feature => {
      console.log(`      ✅ ${feature.name} - ${feature.description}`);
    });
  }
  
  // Show features this team is developing
  const teamFeatures = featuresInDevelopment.filter(feature => feature.team === team.name);
  if (teamFeatures.length > 0) {
    console.log('   🛠️  Features being developed by this team:');
    teamFeatures.forEach(feature => {
      console.log(`      🔨 ${feature.name} - ${feature.description}`);
    });
  }
  
  // Show features hidden from this team
  const hiddenFeatures = featuresInDevelopment.filter(feature => 
    !teamGate.isEnabled(feature.name)
  );
  if (hiddenFeatures.length > 0) {
    console.log('   🚫 Features hidden from this team:');
    hiddenFeatures.forEach(feature => {
      console.log(`      ❌ ${feature.name} - Not ready for ${team.name} team`);
    });
  }
});

console.log('\n' + '=' .repeat(60));
console.log('🔄 Simulating Daily Development Workflow');
console.log('=' .repeat(60));

// Simulate daily workflow
const gate = createFeatureFlagGate(featureFlagService);

console.log('\n📅 Day 1 - Teams start working on their features');
console.log('   • All teams commit to main branch');
console.log('   • Features are protected by flags');
console.log('   • CI/CD runs but features remain hidden');

console.log('\n📅 Day 2 - Frontend completes newDashboard');
console.log('   • Feature is ready for QA testing');
console.log('   • Flag is updated to include QA team');

// Simulate runtime flag update
featureFlagService.setRuntimeOverride('newDashboard', {
  teams: { frontend: true, qa: true }
});

console.log('   • QA team can now see the new dashboard');

console.log('\n📅 Day 3 - Backend needs integration testing');
console.log('   • Payment gateway ready for staging');
console.log('   • All teams can test integration');

featureFlagService.setRuntimeOverride('newPaymentGateway', true);
console.log('   • Payment gateway now visible to all teams in development');

console.log('\n📅 Day 4 - Staging deployment');
console.log('   • Features promoted to staging environment');
console.log('   • Higher percentage rollouts for testing');

// Simulate staging environment
console.log('\n🎯 Staging Environment Feature Status:');
const stagingConfig = require('../environments/staging.js');
const stagingService = new FeatureFlagService({
  environment: 'staging',
  features: stagingConfig.features
});

featuresInDevelopment.forEach(feature => {
  const enabled = stagingService.isEnabled(feature.name);
  const percentage = typeof stagingConfig.features[feature.name] === 'number' 
    ? stagingConfig.features[feature.name] 
    : null;
  
  console.log(`   ${enabled ? '✅' : '❌'} ${feature.name}: ${
    enabled 
      ? (percentage ? `${percentage}% rollout` : 'fully enabled')
      : 'disabled'
  }`);
});

console.log('\n📅 Day 5 - Production deployment');
console.log('   • Conservative rollout to production');
console.log('   • Gradual percentage-based activation');

// Simulate production environment
console.log('\n🏭 Production Environment Feature Status:');
const productionConfig = require('../environments/production.js');
const productionService = new FeatureFlagService({
  environment: 'production',
  features: productionConfig.features
});

featuresInDevelopment.forEach(feature => {
  const enabled = productionService.isEnabled(feature.name, { userId: 'user123' });
  const percentage = typeof productionConfig.features[feature.name] === 'number' 
    ? productionConfig.features[feature.name] 
    : null;
  
  console.log(`   ${enabled ? '✅' : '❌'} ${feature.name}: ${
    enabled 
      ? (percentage ? `${percentage}% rollout` : 'fully enabled')
      : 'disabled (waiting for validation)'
  }`);
});

console.log('\n' + '=' .repeat(60));
console.log('🎯 Benefits Demonstrated');
console.log('=' .repeat(60));

console.log(`
✅ Multiple teams working simultaneously on main branch
✅ No merge conflicts or integration issues  
✅ Features can be deployed but kept hidden
✅ Team-specific feature visibility
✅ Gradual rollout capabilities
✅ Emergency feature toggles
✅ Environment-specific configurations
✅ Consistent development workflow

🌳 Trunk-Based Development is now practical for large teams!
`);

// Demonstrate emergency toggle
console.log('🚨 Emergency Simulation: Disabling problematic feature');
featureFlagService.setRuntimeOverride('aiRecommendations', false);
console.log('   • AI Recommendations disabled instantly without redeploy');
console.log('   • System remains stable while issue is investigated');

console.log('\n🎉 Simulation Complete! Feature flags enable safe, scalable trunk-based development.');

// Cleanup runtime overrides
featureFlagService.removeRuntimeOverride('newDashboard');
featureFlagService.removeRuntimeOverride('newPaymentGateway');
featureFlagService.removeRuntimeOverride('aiRecommendations');