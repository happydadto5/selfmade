#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const original = fs.readFileSync(changelogPath, 'utf8');

if (original.includes('\n## Unreleased\n')) {
  console.log('CHANGELOG already has an Unreleased section.');
  process.exit(0);
}

if (!original.startsWith('# Changelog')) {
  console.error('CHANGELOG.md must start with "# Changelog".');
  process.exit(1);
}

const updated = original.replace(/^# Changelog\s*\n+/, '# Changelog\n\n## Unreleased\n\n');
if (updated === original) {
  console.error('Failed to prepare CHANGELOG.md.');
  process.exit(1);
}

fs.writeFileSync(changelogPath, updated, 'utf8');
console.log('Inserted Unreleased section at top of CHANGELOG.');
