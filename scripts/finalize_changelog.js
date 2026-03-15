#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const version = (process.argv[2] || '').trim();
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`Invalid semver version: ${version || '[missing]'}`);
  process.exit(1);
}

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const original = fs.readFileSync(changelogPath, 'utf8');
const unreleasedHeader = '\n## Unreleased\n';
const unreleasedIndex = original.indexOf(unreleasedHeader);

if (unreleasedIndex === -1) {
  console.log('No Unreleased section to finalize.');
  process.exit(0);
}

const sectionStart = unreleasedIndex + unreleasedHeader.length;
const nextSectionOffset = original.slice(sectionStart).search(/\n## /);
const sectionEnd = nextSectionOffset === -1 ? original.length : sectionStart + nextSectionOffset;
const sectionBody = original.slice(sectionStart, sectionEnd).trim();

const before = original.slice(0, unreleasedIndex);
const after = original.slice(sectionEnd).replace(/^\n+/, '\n\n');

let updated = before;
if (sectionBody) {
  updated += `\n## ${version}\n${sectionBody}\n`;
}
updated += after;
updated = updated.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';

fs.writeFileSync(changelogPath, updated, 'utf8');
console.log(`Finalized CHANGELOG.md for ${version}`);
