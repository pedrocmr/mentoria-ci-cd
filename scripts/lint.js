console.log('🔍 Running lint checks...\n');

const fs = require('fs');
const path = require('path');

let errors = 0;

// Check for common issues in JavaScript files
function lintFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  let fileErrors = 0;
  
  console.log(`Checking ${fileName}...`);
  
  // Check for console.log in production files (except test files)
  if (!filePath.includes('/test/') && !filePath.includes('/scripts/')) {
    const consoleLogMatches = content.match(/console\.log/g);
    if (consoleLogMatches && consoleLogMatches.length > 2) {
      console.log(`  ⚠️  Found ${consoleLogMatches.length} console.log statements (consider using proper logging)`);
    }
  }
  
  // Check for basic syntax issues
  try {
    // Simple syntax check - just try to eval the file in a safe way
    new Function(content);
  } catch (error) {
    console.log(`  ❌ Syntax error: ${error.message}`);
    fileErrors++;
  }
  
  // Check for missing semicolons (simple check)
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.length > 0 && 
        !trimmedLine.endsWith(';') && 
        !trimmedLine.endsWith('{') && 
        !trimmedLine.endsWith('}') &&
        !trimmedLine.startsWith('//') &&
        !trimmedLine.startsWith('*') &&
        !trimmedLine.startsWith('/*') &&
        !trimmedLine.startsWith('*') &&
        !trimmedLine.includes('module.exports') &&
        trimmedLine.match(/^[a-zA-Z].*=/)) {
      console.log(`  ⚠️  Line ${index + 1}: Missing semicolon?`);
    }
  });
  
  if (fileErrors === 0) {
    console.log(`  ✅ No errors found`);
  }
  
  return fileErrors;
}

// Find all JavaScript files
function findJsFiles(dir) {
  const files = [];
  
  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && entry !== 'node_modules' && entry !== '.git') {
        walkDir(fullPath);
      } else if (stat.isFile() && entry.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

// Run linting
const projectRoot = path.join(__dirname, '..');
const jsFiles = findJsFiles(projectRoot);

if (jsFiles.length === 0) {
  console.log('No JavaScript files found to lint');
} else {
  console.log(`Found ${jsFiles.length} JavaScript files to check\n`);
  
  for (const file of jsFiles) {
    errors += lintFile(file);
  }
}

console.log(`\n📊 Lint Results: ${errors} errors found`);

if (errors === 0) {
  console.log('🎉 All files passed linting!');
  process.exit(0);
} else {
  console.log('❌ Linting failed with errors!');
  process.exit(1);
}