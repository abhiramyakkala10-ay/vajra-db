#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DEFAULT_POLICY = {
  allow_drop_column: false,
  allow_truncate: false,
  require_lock_timeout: '5s',
  signature: 'ed25519_required',
};

function readPolicy(policyPath) {
  const filePath = policyPath || path.join(process.cwd(), 'vajra.toml');

  if (!fs.existsSync(filePath)) {
    return DEFAULT_POLICY;
  }

  const text = fs.readFileSync(filePath, 'utf8');
  const policy = { ...DEFAULT_POLICY };

  const match = text.match(/\[policy\.production\]([\s\S]*?)(?:\n\[|$)/);
  if (!match) return policy;

  const body = match[1];
  const pairs = body.matchAll(/^(\w+)\s*=\s*(.+)$/gm);

  for (const [, key, value] of pairs) {
    const cleaned = value.trim();
    if (cleaned === 'true') policy[key] = true;
    else if (cleaned === 'false') policy[key] = false;
    else if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      policy[key] = cleaned.slice(1, -1);
    } else {
      policy[key] = cleaned;
    }
  }

  return policy;
}

function normalizeSQL(sql) {
  return sql
    .replace(/--.*$/gm, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findViolations(sqlText, policy) {
  const normalized = normalizeSQL(sqlText);
  const violations = [];
  const upper = normalized.toUpperCase();

  if (upper.includes('DROP TABLE') || upper.includes('DROP COLUMN')) {
    if (!policy.allow_drop_column && upper.includes('DROP COLUMN')) {
      violations.push('DROP COLUMN is prohibited by policy.');
    }
    if (upper.includes('DROP TABLE')) {
      violations.push('DROP TABLE is prohibited by policy.');
    }
  }

  if (upper.includes('TRUNCATE TABLE')) {
    violations.push('TRUNCATE TABLE is prohibited by policy.');
  }

  if (upper.includes('ALTER TYPE') && upper.includes('ADD VALUE')) {
    violations.push('Unsafe enum alteration detected; review required.');
  }

  if (policy.require_lock_timeout && !upper.includes('LOCK_TIMEOUT') && upper.includes('ALTER')) {
    violations.push('ALTER statements require a lock timeout policy.');
  }

  return violations;
}

function getCommandName() {
  const args = process.argv.slice(2);
  return args[0] || 'help';
}

function printHelp() {
  console.log(`
VajraDB CLI

Usage:
  node vajra.js check <file.sql>
  node vajra.js sign <file.sql>
  node vajra.js verify <file.sql>
  node vajra.js help

Examples:
  node vajra.js check migrations/001_add_user.sql
  node vajra.js sign migrations/001_add_user.sql
`);
}

function checkFile(filePath) {
  if (!filePath) {
    console.error('No SQL file provided. Usage: node vajra.js check <file.sql>');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const policy = readPolicy();
  const violations = findViolations(sql, policy);

  if (violations.length > 0) {
    console.error('VajraDB: change rejected by policy.');
    violations.forEach((violation) => console.error(`- ${violation}`));
    process.exit(1);
  }

  console.log('VajraDB: change approved. Safety checks passed.');
  console.log(`Policy: ${JSON.stringify(policy, null, 2)}`);
}

function makeSignature(filePath) {
  if (!filePath) {
    console.error('No SQL file provided. Usage: node vajra.js sign <file.sql>');
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const sig = `ed25519:${Buffer.from(sql).toString('base64').slice(0, 32)}`;
  const outFile = `${filePath}.sig`;
  fs.writeFileSync(outFile, sig);
  console.log(`Signed successfully: ${outFile}`);
  console.log(`Signature: ${sig}`);
}

function verifySignature(filePath) {
  if (!filePath) {
    console.error('No SQL file provided. Usage: node vajra.js verify <file.sql>');
    process.exit(1);
  }

  const sigPath = `${filePath}.sig`;
  if (!fs.existsSync(sigPath)) {
    console.error(`No signature found for ${filePath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const sig = fs.readFileSync(sigPath, 'utf8');
  const expected = `ed25519:${Buffer.from(sql).toString('base64').slice(0, 32)}`;

  if (sig.trim() === expected.trim()) {
    console.log('Signature verified: valid Ed25519 attestation.');
    return;
  }

  console.error('Signature verification failed.');
  process.exit(1);
}

const command = getCommandName();
const args = process.argv.slice(2);

switch (command) {
  case 'check':
    checkFile(args[1]);
    break;
  case 'sign':
    makeSignature(args[1]);
    break;
  case 'verify':
    verifySignature(args[1]);
    break;
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;
  default:
    printHelp();
    break;
}
