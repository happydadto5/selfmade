#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const secretsPath = path.join(root, 'secrets.txt');
const dailyBudget = parseInt(process.env.IMAGE_DAILY_BUDGET || '100', 10);
const profileArg = (process.argv[2] || process.env.IMAGE_PROFILE || 'small').trim().toLowerCase();
const profileCosts = {
  small: parseInt(process.env.IMAGE_SMALL_REQUEST_COST || '1', 10),
  large: parseInt(process.env.IMAGE_LARGE_REQUEST_COST || '10', 10),
};
const requestCost = /^\d+$/.test(profileArg) ? parseInt(profileArg, 10) : profileCosts[profileArg];

if (!Number.isInteger(dailyBudget) || dailyBudget < 1) {
  console.error(`Invalid image budget: ${process.env.IMAGE_DAILY_BUDGET || '[missing]'}`);
  process.exit(2);
}

if (!Number.isInteger(requestCost) || requestCost < 1) {
  console.error(`Unknown image profile "${profileArg}". Use "small", "large", or a positive numeric credit cost.`);
  process.exit(2);
}

const imageProfile = Object.prototype.hasOwnProperty.call(profileCosts, profileArg) ? profileArg : 'custom';
const size = imageProfile === 'large'
  ? { width: 1536, height: 864, label: 'Generated Large Image' }
  : { width: 512, height: 512, label: 'Generated Small Image' };

function readSecrets() {
  if (!fs.existsSync(secretsPath)) {
    console.error(`Secrets file missing at ${secretsPath}. Create secrets.txt with CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.`);
    process.exit(2);
  }
  const content = fs.readFileSync(secretsPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const out = {};
  for (const line of lines) {
    const match = line.match(/^\s*([^=]+)\s*=\s*(.+)\s*$/);
    if (match) out[match[1].trim()] = match[2].trim();
  }
  return out;
}

try {
  const status = cp.execSync(
    `node "${path.join(root, 'scripts', 'check_image_quota.js')}" check ${dailyBudget} ${requestCost}`,
    { encoding: 'utf8' }
  );
  console.log(status.trim());
  if (!status.includes('IMAGES_ALLOWED=1')) {
    console.error('Image quota exhausted or not allowed.');
    process.exit(1);
  }
} catch (error) {
  console.error(`Image quota check failed: ${error.message}`);
  process.exit(1);
}

readSecrets();

const outDir = path.join(root, 'assets', 'images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const filename = `img-${Date.now()}.svg`;
const filepath = path.join(outDir, filename);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}"><rect width="100%" height="100%" fill="#88ccff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="#222">${size.label}</text></svg>`;
fs.writeFileSync(filepath, svg, 'utf8');

try {
  cp.execSync(
    `node "${path.join(root, 'scripts', 'check_image_quota.js')}" inc ${dailyBudget} ${requestCost}`,
    { stdio: 'inherit' }
  );
} catch (error) {
  console.error(`Failed to increment image quota: ${error.message}`);
}

console.log(`OK:${filepath};PROFILE=${imageProfile};COST=${requestCost}`);
process.exit(0);
