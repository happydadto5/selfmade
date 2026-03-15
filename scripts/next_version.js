#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const versionPath = path.join(root, 'VERSION');
const trackerPath = path.join(root, 'VERSION_TRACKER.json');
const dryRun = process.argv.includes('--dry-run');

const currentVersion = fs.readFileSync(versionPath, 'utf8').trim();
if (!/^\d+\.\d+\.\d+$/.test(currentVersion)) {
  console.error(`Invalid current semver version: ${currentVersion}`);
  process.exit(1);
}

const tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));
if (!/^\d{4}-\d{2}-\d{2}$/.test(tracker.baseDate)) {
  console.error(`Invalid VERSION_TRACKER.json baseDate: ${tracker.baseDate}`);
  process.exit(1);
}
if (!Number.isInteger(tracker.baseMajor) || tracker.baseMajor < 1) {
  console.error(`Invalid VERSION_TRACKER.json baseMajor: ${tracker.baseMajor}`);
  process.exit(1);
}

const today = process.env.SELFMADE_VERSION_DATE || toLocalDateString(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) {
  console.error(`Invalid version date override: ${today}`);
  process.exit(1);
}

const dayOffset = daysBetween(tracker.baseDate, today);
if (dayOffset < 0) {
  console.error(`Version date ${today} is before baseDate ${tracker.baseDate}`);
  process.exit(1);
}

const dailyMajor = tracker.baseMajor + dayOffset;
const [major, minor] = currentVersion.split('.').map(Number);
const nextVersion = major === dailyMajor
  ? `${dailyMajor}.${minor + 1}.0`
  : `${dailyMajor}.0.0`;

if (!dryRun) {
  fs.writeFileSync(versionPath, `${nextVersion}\n`, 'utf8');
}

console.log(nextVersion);

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.round((end - start) / 86400000);
}
