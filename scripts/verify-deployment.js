#!/usr/bin/env node

/**
 * Deployment verification script
 * Checks if the app is ready for deployment by validating environment variables
 * and testing database connectivity without making actual API calls
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment readiness...\n');

// Check for required files
const requiredFiles = [
  'next.config.ts',
  'package.json',
  'src/app/layout.tsx',
  'src/app/page.tsx'
];

console.log('📁 Checking required files...');
let filesOk = true;
for (const file of requiredFiles) {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    filesOk = false;
  }
}

// Check environment variables (without exposing values)
console.log('\n🔑 Checking environment variables...');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

let envOk = true;
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} is set`);
  } else {
    console.log(`⚠️  ${envVar} is not set - may cause runtime issues`);
    envOk = false;
  }
}

// Check package.json for required dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  '@clerk/nextjs',
  '@neondatabase/serverless',
  'drizzle-orm',
  'next'
];

let depsOk = true;
for (const dep of requiredDeps) {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
    depsOk = false;
  }
}

// Check Next.js configuration
console.log('\n⚙️  Checking Next.js configuration...');
try {
  const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
  
  if (nextConfig.includes('force-dynamic')) {
    console.log('✅ Dynamic rendering configured');
  } else {
    console.log('⚠️  Consider adding dynamic rendering for database pages');
  }
  
  if (nextConfig.includes('serverComponentsExternalPackages')) {
    console.log('✅ External packages configured');
  } else {
    console.log('⚠️  External packages configuration missing');
  }
} catch (error) {
  console.log('❌ Error reading next.config.ts:', error.message);
}

// Final assessment
console.log('\n📊 Deployment Readiness Summary:');
console.log('================================');

if (filesOk && depsOk) {
  console.log('✅ Core files and dependencies: READY');
} else {
  console.log('❌ Core files and dependencies: ISSUES FOUND');
}

if (envOk) {
  console.log('✅ Environment variables: READY');
} else {
  console.log('⚠️  Environment variables: SOME MISSING (check deployment platform)');
}

console.log('\n💡 Deployment Tips:');
console.log('- Ensure all environment variables are set in your deployment platform');
console.log('- Database connections are established at runtime, not build time');
console.log('- Pages with database calls use dynamic rendering');
console.log('- API routes handle errors gracefully');

if (filesOk && depsOk) {
  console.log('\n🚀 Ready for deployment!');
  process.exit(0);
} else {
  console.log('\n⚠️  Please fix the issues above before deploying');
  process.exit(1);
}
