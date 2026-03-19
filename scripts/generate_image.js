#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const secretsPath = path.join(root, 'secrets.txt');
const dailyBudget = parseInt(process.env.IMAGE_DAILY_BUDGET || '100', 10);
const profileArg = (process.argv[2] || process.env.IMAGE_PROFILE || 'small').trim().toLowerCase();
const promptArg = process.argv.slice(3).join(' ').trim();
const profileCosts = {
  small: parseInt(process.env.IMAGE_SMALL_REQUEST_COST || '1', 10),
  large: parseInt(process.env.IMAGE_LARGE_REQUEST_COST || '10', 10),
};
const profileSettings = {
  small: {
    width: 512,
    height: 512,
    steps: 4,
    format: 'jpg',
    defaultPrompt: 'top-down game sprite sheet style illustration for a simple browser shooter enemy, clean silhouette, readable, transparent-looking backdrop feel, bright colors, no text, no watermark'
  },
  large: {
    width: 1536,
    height: 864,
    steps: 6,
    format: 'jpg',
    defaultPrompt: 'stylized whimsical garden battleground background for a simple top-down browser shooter, readable play space, soft colorful plants, no text, no watermark'
  }
};
const requestCost = /^\d+$/.test(profileArg) ? parseInt(profileArg, 10) : profileCosts[profileArg];
const imageProfile = Object.prototype.hasOwnProperty.call(profileSettings, profileArg) ? profileArg : 'custom';
const settings = imageProfile === 'custom'
  ? {
      width: 512,
      height: 512,
      steps: 4,
      format: 'jpg',
      defaultPrompt: 'simple game-ready illustration, readable silhouette, no text, no watermark'
    }
  : profileSettings[imageProfile];

if (!Number.isInteger(dailyBudget) || dailyBudget < 1) {
  console.error(`Invalid image budget: ${process.env.IMAGE_DAILY_BUDGET || '[missing]'}`);
  process.exit(2);
}

if (!Number.isInteger(requestCost) || requestCost < 1) {
  console.error(`Unknown image profile "${profileArg}". Use "small", "large", or a positive numeric credit cost.`);
  process.exit(2);
}

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

  if (!out.CLOUDFLARE_ACCOUNT_ID || !out.CLOUDFLARE_API_TOKEN) {
    console.error('secrets.txt must define CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.');
    process.exit(2);
  }

  return out;
}

function runQuota(action) {
  return cp.execSync(
    `node "${path.join(root, 'scripts', 'check_image_quota.js')}" ${action} ${dailyBudget} ${requestCost}`,
    { encoding: 'utf8' }
  ).trim();
}

async function main() {
  try {
    const status = runQuota('check');
    console.log(status);
    if (!status.includes('IMAGES_ALLOWED=1')) {
      console.error('Image quota exhausted or not allowed.');
      process.exit(1);
    }
  } catch (error) {
    console.error(`Image quota check failed: ${error.message}`);
    process.exit(1);
  }

  const secrets = readSecrets();
  const prompt = promptArg || settings.defaultPrompt;
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${secrets.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secrets.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      steps: settings.steps
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.errors?.map(item => item.message).filter(Boolean).join('; ')
      || payload?.result?.error
      || payload?.error
      || `HTTP ${response.status}`;
    console.error(`Cloudflare image request failed: ${detail}`);
    process.exit(1);
  }

  const imageBase64 = payload?.result?.image || payload?.image || '';
  if (!imageBase64) {
    console.error('Cloudflare image request succeeded but returned no image data.');
    process.exit(1);
  }

  const outDir = path.join(root, 'assets', 'images');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const timestamp = Date.now();
  const basename = `img-${imageProfile}-${timestamp}`;
  const imagePath = path.join(outDir, `${basename}.${settings.format}`);
  const metaPath = path.join(outDir, `${basename}.json`);

  fs.writeFileSync(imagePath, Buffer.from(imageBase64, 'base64'));
  fs.writeFileSync(metaPath, `${JSON.stringify({
    profile: imageProfile,
    cost: requestCost,
    width: settings.width,
    height: settings.height,
    prompt,
    createdAt: new Date().toISOString(),
    engine: '@cf/black-forest-labs/flux-1-schnell'
  }, null, 2)}\n`, 'utf8');

  try {
    console.log(runQuota('inc'));
  } catch (error) {
    console.error(`Failed to increment image quota: ${error.message}`);
    process.exit(1);
  }

  console.log(`OK:${imagePath};PROFILE=${imageProfile};COST=${requestCost};PROMPT=${prompt}`);
}

main().catch(error => {
  console.error(error.message || String(error));
  process.exit(1);
});
