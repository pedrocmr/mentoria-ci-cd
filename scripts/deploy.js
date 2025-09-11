console.log('🚀 Starting Deployment Process...\n');

const fs = require('fs');
const path = require('path');

// Get target environment from command line argument
const targetEnvironment = process.argv[2];

if (!targetEnvironment) {
  console.error('❌ No target environment specified!');
  console.log('Usage: node deploy.js <environment>');
  console.log('Available environments: dev, staging, production');
  process.exit(1);
}

const validEnvironments = ['dev', 'staging', 'production'];
if (!validEnvironments.includes(targetEnvironment)) {
  console.error(`❌ Invalid environment: ${targetEnvironment}`);
  console.log(`Available environments: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

// Deployment configuration for each environment
const deploymentConfig = {
  dev: {
    name: 'Development',
    url: 'https://dev.mentoria-ci-cd.com',
    replicas: 1,
    autoApproval: true,
    healthCheck: true
  },
  staging: {
    name: 'Staging',
    url: 'https://staging.mentoria-ci-cd.com',
    replicas: 2,
    autoApproval: false,
    healthCheck: true
  },
  production: {
    name: 'Production',
    url: 'https://mentoria-ci-cd.com',
    replicas: 3,
    autoApproval: false,
    healthCheck: true
  }
};

function validateBuild() {
  console.log('🔍 Validating build artifacts...');
  
  const distPath = path.join(__dirname, '..', 'dist');
  const buildInfoPath = path.join(__dirname, '..', 'build-info.json');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ No build artifacts found. Run "npm run build" first.');
    return false;
  }
  
  if (!fs.existsSync(buildInfoPath)) {
    console.error('❌ No build info found. Run "npm run build" first.');
    return false;
  }
  
  console.log('✅ Build artifacts validated');
  return true;
}

function loadBuildInfo() {
  const buildInfoPath = path.join(__dirname, '..', 'build-info.json');
  return JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
}

async function simulateDeployment(environment, buildInfo) {
  const config = deploymentConfig[environment];
  
  console.log(`🎯 Deploying to ${config.name} environment...`);
  console.log(`📍 Target URL: ${config.url}`);
  console.log(`🔢 Replicas: ${config.replicas}`);
  console.log(`📋 Build ID: ${buildInfo.buildId}`);
  
  // Simulate deployment steps
  const steps = [
    { name: 'Pulling container image', duration: 2000 },
    { name: 'Updating configuration', duration: 1000 },
    { name: 'Starting new instances', duration: 3000 },
    { name: 'Running health checks', duration: 2000 },
    { name: 'Updating load balancer', duration: 1000 },
    { name: 'Cleaning up old instances', duration: 1500 }
  ];
  
  for (const step of steps) {
    process.stdout.write(`⏳ ${step.name}...`);
    await new Promise(resolve => setTimeout(resolve, step.duration));
    console.log(' ✅');
  }
}

async function runHealthCheck(environment) {
  const config = deploymentConfig[environment];
  
  if (!config.healthCheck) {
    console.log('⚠️  Health check disabled for this environment');
    return true;
  }
  
  console.log('🩺 Running health check...');
  
  // Simulate health check
  process.stdout.write('   Checking application status...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(' ✅');
  
  process.stdout.write('   Verifying database connection...');
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log(' ✅');
  
  process.stdout.write('   Testing API endpoints...');
  await new Promise(resolve => setTimeout(resolve, 1200));
  console.log(' ✅');
  
  console.log('🎉 Health check passed!');
  return true;
}

function recordDeployment(environment, buildInfo) {
  const deploymentRecord = {
    environment,
    buildId: buildInfo.buildId,
    commitSha: buildInfo.commitSha,
    version: buildInfo.version,
    deployedAt: new Date().toISOString(),
    deployedBy: process.env.GITHUB_ACTOR || 'local-user',
    status: 'success'
  };
  
  // Save deployment record
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = path.join(deploymentsDir, `${environment}-latest.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentRecord, null, 2));
  
  console.log(`📝 Deployment record saved: ${deploymentFile}`);
  return deploymentRecord;
}

async function approvalGate(environment) {
  const config = deploymentConfig[environment];
  
  if (config.autoApproval) {
    console.log('✅ Auto-approval enabled, proceeding...');
    return true;
  }
  
  console.log('⏸️  Manual approval required for this environment');
  console.log('💡 In a real CI/CD system, this would wait for manual approval');
  console.log('✅ Simulating approval... approved!');
  
  return true;
}

// Main deployment process
async function deploy() {
  try {
    console.log(`🎯 Target Environment: ${deploymentConfig[targetEnvironment].name}`);
    console.log('━'.repeat(50));
    
    // Step 1: Validate build
    if (!validateBuild()) {
      process.exit(1);
    }
    
    // Step 2: Load build info
    const buildInfo = loadBuildInfo();
    
    // Step 3: Approval gate
    const approved = await approvalGate(targetEnvironment);
    if (!approved) {
      console.log('❌ Deployment not approved');
      process.exit(1);
    }
    
    // Step 4: Deploy
    await simulateDeployment(targetEnvironment, buildInfo);
    
    // Step 5: Health check
    const healthy = await runHealthCheck(targetEnvironment);
    if (!healthy) {
      console.log('❌ Health check failed');
      process.exit(1);
    }
    
    // Step 6: Record deployment
    const record = recordDeployment(targetEnvironment, buildInfo);
    
    console.log('━'.repeat(50));
    console.log('🎉 Deployment completed successfully!');
    console.log(`🌐 Application URL: ${deploymentConfig[targetEnvironment].url}`);
    console.log(`📋 Build ID: ${record.buildId}`);
    console.log(`⏰ Deployed at: ${record.deployedAt}`);
    
  } catch (error) {
    console.error('💥 Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();