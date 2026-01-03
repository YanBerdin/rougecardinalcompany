#!/usr/bin/env tsx
/**
 * Audit Secrets Management - TASK036 Subtask 1.8
 * 
 * Purpose:
 * - Scan codebase for hardcoded secrets (apikey=, password=, secret=)
 * - Validate T3 Env configuration completeness
 * - Confirm .gitignore excludes sensitive files
 * 
 * Usage:
 *   pnpm exec tsx scripts/audit-secrets-management.ts
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

const ROOT_DIR = resolve(process.cwd());

interface AuditResult {
  check: string;
  passed: boolean;
  details?: string[];
  errors?: string[];
}

const results: AuditResult[] = [];

console.log('🔐 Secrets Management Audit');
console.log('═'.repeat(60));
console.log('');

// Test 1: Search for hardcoded secrets patterns
console.log('1️⃣ Scanning for hardcoded secrets...');
const dangerousPatterns = [
  { pattern: 'apikey\\s*=\\s*["\'][^"\']+["\']', name: 'hardcoded API keys' },
  { pattern: 'api_key\\s*=\\s*["\'][^"\']+["\']', name: 'hardcoded API keys (snake_case)' },
  { pattern: 'password\\s*=\\s*["\'][^"\']+["\']', name: 'hardcoded passwords' },
  { pattern: 'secret\\s*=\\s*["\'][^"\']+["\']', name: 'hardcoded secrets' },
  { pattern: 'token\\s*=\\s*["\'][^"\']+["\']', name: 'hardcoded tokens' },
  { pattern: 'Bearer\\s+[A-Za-z0-9_-]{20,}', name: 'hardcoded Bearer tokens' },
];

const excludePatterns = [
  '--exclude-dir=node_modules',
  '--exclude-dir=.next',
  '--exclude-dir=.git',
  '--exclude=*.md',
  '--exclude=*.json',
  '--exclude=pnpm-lock.yaml',
  '--exclude=audit-secrets-management.ts', // Exclude this script itself
];

let foundIssues = false;
const issueDetails: string[] = [];

for (const { pattern, name } of dangerousPatterns) {
  try {
    const cmd = `grep -rIn -E "${pattern}" ${excludePatterns.join(' ')} . || true`;
    const output = execSync(cmd, { cwd: ROOT_DIR, encoding: 'utf-8' });
    
    if (output.trim()) {
      foundIssues = true;
      issueDetails.push(`   ⚠️  Found ${name}:`);
      output.trim().split('\n').forEach(line => {
        // Filter out false positives (comments, test files, env examples)
        if (!line.includes('//') && 
            !line.includes('/*') && 
            !line.includes('.test.') && 
            !line.includes('.example') &&
            !line.includes('scripts/audit-')) {
          issueDetails.push(`      ${line}`);
        }
      });
    }
  } catch (error) {
    // grep returns non-zero when no match, which is good
  }
}

results.push({
  check: 'Hardcoded secrets scan',
  passed: !foundIssues,
  details: foundIssues ? issueDetails : ['   ✅ No hardcoded secrets found'],
});

console.log(foundIssues ? '   ⚠️  Issues found (see details below)' : '   ✅ No hardcoded secrets found');
console.log('');

// Test 2: Validate T3 Env configuration
console.log('2️⃣ Validating T3 Env configuration...');
const envPath = resolve(ROOT_DIR, 'lib/env.ts');

if (!existsSync(envPath)) {
  results.push({
    check: 'T3 Env config exists',
    passed: false,
    errors: ['   ❌ lib/env.ts not found'],
  });
  console.log('   ❌ lib/env.ts not found');
} else {
  const envContent = readFileSync(envPath, 'utf-8');
  
  const requiredServerVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY',
    'SUPABASE_SECRET_KEY',
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'EMAIL_CONTACT',
  ];
  
  const missingVars: string[] = [];
  const foundVars: string[] = [];
  
  for (const varName of requiredServerVars) {
    if (envContent.includes(varName)) {
      foundVars.push(`   ✓ ${varName}`);
    } else {
      missingVars.push(`   ✗ ${varName}`);
    }
  }
  
  const hasZodValidation = envContent.includes('import { z }') || envContent.includes('import { createEnv }');
  const hasServerClient = envContent.includes('server:') && envContent.includes('client:');
  
  results.push({
    check: 'T3 Env validation',
    passed: missingVars.length === 0 && hasZodValidation && hasServerClient,
    details: [
      ...foundVars,
      ...(hasZodValidation ? ['   ✓ Zod validation enabled'] : ['   ✗ Missing Zod validation']),
      ...(hasServerClient ? ['   ✓ Server/Client separation'] : ['   ✗ Missing server/client config']),
    ],
    errors: missingVars.length > 0 ? missingVars : undefined,
  });
  
  if (missingVars.length === 0 && hasZodValidation && hasServerClient) {
    console.log(`   ✅ T3 Env properly configured (${foundVars.length} vars)`);
  } else {
    console.log('   ⚠️  T3 Env issues found (see details)');
  }
}
console.log('');

// Test 3: Verify .gitignore excludes sensitive files
console.log('3️⃣ Checking .gitignore coverage...');
const gitignorePath = resolve(ROOT_DIR, '.gitignore');

if (!existsSync(gitignorePath)) {
  results.push({
    check: '.gitignore exists',
    passed: false,
    errors: ['   ❌ .gitignore not found'],
  });
  console.log('   ❌ .gitignore not found');
} else {
  const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
  
  const requiredPatterns = [
    { pattern: '.env', name: '.env files' },
    { pattern: '.env*.local', name: '.env*.local pattern' },
  ];
  
  const missingPatterns: string[] = [];
  const foundPatterns: string[] = [];
  
  for (const { pattern, name } of requiredPatterns) {
    if (gitignoreContent.includes(pattern)) {
      foundPatterns.push(`   ✓ ${name}`);
    } else {
      missingPatterns.push(`   ✗ ${name}`);
    }
  }
  
  // Special check: .env.local OR .env*.local (both are valid)
  const hasEnvLocalPattern = gitignoreContent.includes('.env.local') || gitignoreContent.includes('.env*.local');
  if (hasEnvLocalPattern) {
    foundPatterns.push('   ✓ .env.local (via pattern)');
  }
  
  results.push({
    check: '.gitignore coverage',
    passed: missingPatterns.length === 0,
    details: foundPatterns,
    errors: missingPatterns.length > 0 ? missingPatterns : undefined,
  });
  
  if (missingPatterns.length === 0) {
    console.log('   ✅ .gitignore properly configured');
  } else {
    console.log('   ⚠️  Missing patterns in .gitignore');
  }
}
console.log('');

// Test 4: Check for committed .env files (excluding templates)
console.log('4️⃣ Checking for committed .env files...');
try {
  const committedEnvFiles = execSync(
    'git ls-files | grep -E "^\\.env" || true',
    { cwd: ROOT_DIR, encoding: 'utf-8' }
  ).trim();
  
  // Exclude template files (.env.example, .env.local.example, etc.)
  const dangerousEnvFiles = committedEnvFiles
    .split('\n')
    .filter(f => f.trim())
    .filter(f => !f.includes('.example'))
    .filter(f => !f.includes('.template'));
  
  if (dangerousEnvFiles.length > 0) {
    results.push({
      check: 'No committed .env files',
      passed: false,
      errors: dangerousEnvFiles.map(f => `   ❌ ${f}`),
    });
    console.log('   ❌ Found committed .env files:');
    dangerousEnvFiles.forEach(f => console.log(`      ${f}`));
  } else {
    const templateFiles = committedEnvFiles
      .split('\n')
      .filter(f => f.trim())
      .filter(f => f.includes('.example') || f.includes('.template'));
    
    const details = ['   ✅ No dangerous .env files committed'];
    if (templateFiles.length > 0) {
      details.push('   ℹ️  Template files OK (should be committed):');
      templateFiles.forEach(f => details.push(`      - ${f}`));
    }
    
    results.push({
      check: 'No committed .env files',
      passed: true,
      details,
    });
    console.log('   ✅ No dangerous .env files committed');
    if (templateFiles.length > 0) {
      console.log(`   ℹ️  ${templateFiles.length} template file(s) OK`);
    }
  }
} catch (error) {
  results.push({
    check: 'Git check',
    passed: false,
    errors: ['   ⚠️  Could not check git history'],
  });
  console.log('   ⚠️  Could not check git history');
}
console.log('');

// Summary
console.log('═'.repeat(60));
console.log('📊 Audit Summary');
console.log('═'.repeat(60));
console.log('');

const passed = results.filter(r => r.passed).length;
const total = results.length;

results.forEach(result => {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.check}`);
  
  if (result.details && result.details.length > 0) {
    result.details.forEach(d => console.log(d));
  }
  
  if (result.errors && result.errors.length > 0) {
    result.errors.forEach(e => console.log(e));
  }
  
  console.log('');
});

console.log(`Results: ${passed}/${total} checks passed`);
console.log('');

if (passed === total) {
  console.log('🎉 Secrets management audit PASSED!');
  console.log('');
  console.log('✅ All critical checks passed:');
  console.log('   - No hardcoded secrets detected');
  console.log('   - T3 Env properly configured');
  console.log('   - .gitignore excludes sensitive files');
  console.log('   - No committed .env files');
  console.log('');
  console.log('✅ TASK036 Subtask 1.8 - COMPLETE');
  process.exit(0);
} else {
  console.log('⚠️  Secrets management audit FAILED');
  console.log('');
  console.log('Action required: Review and fix issues above');
  process.exit(1);
}
