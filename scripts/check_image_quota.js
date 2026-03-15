#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const action = args[0] || 'check';
const limit = parseInt(args[1] || '5000', 10);
const amount = parseInt(args[2] || '1', 10);
const root = path.join(__dirname, '..');
const quotaPath = path.join(root, 'scripts', 'image_quota.json');

function load() { if (fs.existsSync(quotaPath)) return JSON.parse(fs.readFileSync(quotaPath, 'utf8')); return { date: null, count: 0 }; }
function save(obj) { fs.writeFileSync(quotaPath, JSON.stringify(obj, null, 2)); }

const now = new Date();
const today = now.toISOString().slice(0,10);
let data = load();
if (data.date !== today) { data.date = today; data.count = 0; }

if (action === 'check') {
  const remaining = Math.max(0, limit - data.count);
  const allowed = remaining >= amount ? 1 : 0;
  console.log(`IMAGES_ALLOWED=${allowed};REMAINING=${remaining};LIMIT=${limit};UNIT=neurons;REQUEST_COST=${amount}`);
  process.exit(allowed ? 0 : 1);
} else if (action === 'inc') {
  if ((data.count + amount) > limit) {
    const remaining = Math.max(0, limit - data.count);
    console.log(`IMAGES_ALLOWED=0;REMAINING=${remaining};LIMIT=${limit};UNIT=neurons;REQUEST_COST=${amount}`);
    process.exit(1);
  } else {
    data.count += amount;
    save(data);
    const remaining = Math.max(0, limit - data.count);
    console.log(`IMAGES_ALLOWED=1;REMAINING=${remaining};LIMIT=${limit};UNIT=neurons;REQUEST_COST=${amount}`);
    process.exit(0);
  }
} else if (action === 'reset') {
  data.date = today;
  data.count = 0;
  save(data);
  console.log(`IMAGES_ALLOWED=1;REMAINING=${limit};LIMIT=${limit};UNIT=neurons;REQUEST_COST=${amount}`);
  process.exit(0);
} else {
  console.error('Unknown action ' + action);
  process.exit(2);
}
