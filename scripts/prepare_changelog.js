#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const original = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : '';
const normalized = original.replace(/^\uFEFF/, '');

if (!normalized.trim()) {
  fs.writeFileSync(changelogPath, '# Changelog\n\n## Unreleased\n\n', 'utf8');
  console.log('Initialized empty CHANGELOG.md.');
  process.exit(0);
}

if (normalized.includes('\n## Unreleased\n')) {
  if (normalized !== original) {
    fs.writeFileSync(changelogPath, normalized, 'utf8');
  }
  console.log('CHANGELOG already has an Unreleased section.');
  process.exit(0);
}

let working = normalized;
if (!working.startsWith('# Changelog')) {
  working = `# Changelog\n\n${working.replace(/^\s+/, '')}`;
}

const updated = working.replace(/^# Changelog\s*\n+/, '# Changelog\n\n## Unreleased\n\n');
if (updated === working) {
  console.error('Failed to prepare CHANGELOG.md.');
  process.exit(1);
}

fs.writeFileSync(changelogPath, updated, 'utf8');
console.log('Inserted Unreleased section at top of CHANGELOG.');
