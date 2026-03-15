#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const action = args[0] || 'check';
const limit = parseInt(args[1] || '100', 10);
const amount = parseInt(args[2] || '1', 10);
const root = path.join(__dirname, '..');
const quotaPath = path.join(root, 'scripts', 'image_quota.json');

function load() {
  if (fs.existsSync(quotaPath)) {
    return JSON.parse(fs.readFileSync(quotaPath, 'utf8'));
  }
  return { date: null, count: 0 };
}

function save(obj) {
  fs.writeFileSync(quotaPath, JSON.stringify(obj, null, 2));
}

function printStatus(allowed, remaining, requestCost) {
  console.log(
    `IMAGES_ALLOWED=${allowed};REMAINING=${remaining};LIMIT=${limit};UNIT=image-credits;REQUEST_COST=${requestCost}`
  );
}

if (!Number.isInteger(limit) || limit < 1) {
  console.error(`Invalid image budget: ${args[1] || '[missing]'}`);
  process.exit(2);
}

if (!Number.isInteger(amount) || amount < 1) {
  console.error(`Invalid image request cost: ${args[2] || '[missing]'}`);
  process.exit(2);
}

const today = new Date().toISOString().slice(0, 10);
const data = load();
if (data.date !== today) {
  data.date = today;
  data.count = 0;
}

if (action === 'check') {
  const remaining = Math.max(0, limit - data.count);
  const allowed = remaining >= amount ? 1 : 0;
  printStatus(allowed, remaining, amount);
  process.exit(allowed ? 0 : 1);
}

if (action === 'inc') {
  const remaining = Math.max(0, limit - data.count);
  if (remaining < amount) {
    printStatus(0, remaining, amount);
    process.exit(1);
  }
  data.count += amount;
  save(data);
  printStatus(1, Math.max(0, limit - data.count), amount);
  process.exit(0);
}

if (action === 'reset') {
  data.date = today;
  data.count = 0;
  save(data);
  printStatus(1, limit, amount);
  process.exit(0);
}

console.error(`Unknown action ${action}`);
process.exit(2);
