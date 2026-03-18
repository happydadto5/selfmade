#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const original = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : '';
const normalized = original.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');

if (!normalized.trim()) {
  fs.writeFileSync(changelogPath, '# Changelog\n\n## Unreleased\n\n', 'utf8');
  console.log('Initialized empty CHANGELOG.md.');
  process.exit(0);
}

let working = normalized.trimStart();
if (!working.startsWith('# Changelog')) {
  working = `# Changelog\n\n${working}`;
}

working = working.replace(/^# Changelog\s*\n*/, '');
const rawSections = working.split(/\n(?=## )/).map(section => section.trim()).filter(Boolean);
const unreleasedBodies = [];
const keptSections = [];

for (const section of rawSections) {
  if (!section.startsWith('## ')) continue;
  const lines = section.split('\n');
  const title = lines[0].trim();
  const body = lines.slice(1).join('\n').trim();
  if (title === '## Unreleased') {
    if (body) unreleasedBodies.push(body);
    continue;
  }
  keptSections.push(`${title}${body ? `\n${body}` : ''}`);
}

const unreleasedBlock = unreleasedBodies.length ? `## Unreleased\n${unreleasedBodies.join('\n\n')}` : '## Unreleased';
const rebuilt = `# Changelog\n\n${unreleasedBlock}${keptSections.length ? `\n\n${keptSections.join('\n\n')}` : ''}\n`;

if (rebuilt === normalized && normalized.startsWith('# Changelog\n\n## Unreleased\n')) {
  console.log('CHANGELOG already has a normalized Unreleased section.');
  process.exit(0);
}

fs.writeFileSync(changelogPath, rebuilt, 'utf8');
console.log('Normalized CHANGELOG.md with a single top Unreleased section.');
