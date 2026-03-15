#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const secretsPath = path.join(root, 'secrets.txt');

function readSecrets() {
  if (!fs.existsSync(secretsPath)) {
    console.error('Secrets file missing at ' + secretsPath + '. Create secrets.txt with CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.');
    process.exit(2);
  }
  const content = fs.readFileSync(secretsPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const out = {};
  for (const l of lines) {
    const m = l.match(/^\s*([^=]+)\s*=\s*(.+)\s*$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

// Check quota before generating
try {
  const status = cp.execSync(`node "${path.join(root, 'scripts', 'check_image_quota.js')}" check 4`, { encoding: 'utf8' });
  console.log(status.trim());
  if (!status.includes('IMAGES_ALLOWED=1')) {
    console.error('Image quota exhausted or not allowed.');
    process.exit(1);
  }
} catch (e) {
  console.error('Image quota check failed: ' + e.message);
  process.exit(1);
}

// Read secrets (do NOT commit secrets.txt to git)
const secrets = readSecrets();

// For safety: this script writes a placeholder SVG image locally and increments the quota.
const outDir = path.join(root, 'assets', 'images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const filename = `img-${Date.now()}.svg`;
const filepath = path.join(outDir, filename);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="100%" height="100%" fill="#88ccff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="#222">Generated Image</text></svg>`;
fs.writeFileSync(filepath, svg, 'utf8');

// increment quota
try {
  cp.execSync(`node "${path.join(root, 'scripts', 'check_image_quota.js')}" inc 4`, { stdio: 'inherit' });
} catch(e) {
  console.error('Failed to increment image quota: ' + e.message);
}

console.log('OK:'+filepath);
process.exit(0);
