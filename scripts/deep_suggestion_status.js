#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const suggestionPath = path.join(root, 'suggestion.txt');
const futurePath = path.join(root, 'future.md');

if (!fs.existsSync(suggestionPath)) {
  console.log('DEEP_SUGGESTION_HINT=none');
  process.exit(0);
}

const suggestionLines = fs.readFileSync(suggestionPath, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

const target = suggestionLines.find((line) => line.startsWith('!!'));
if (!target) {
  console.log('DEEP_SUGGESTION_HINT=none');
  process.exit(0);
}

const text = target.replace(/^!!\s*/, '').trim();
const slug = slugify(text).slice(0, 80) || 'double-bang-suggestion';
const futureContent = fs.existsSync(futurePath) ? fs.readFileSync(futurePath, 'utf8') : '';
const completed = new Set();
const regex = new RegExp(`!!\\[${escapeRegExp(slug)}\\]\\s+Collaboration\\s+([123])\\/3:`, 'gi');

for (const match of futureContent.matchAll(regex)) {
  completed.add(match[1]);
}

let stage = 'implement-after-collaboration';
if (!completed.has('1')) stage = 'collaboration-1-of-3';
else if (!completed.has('2')) stage = 'collaboration-2-of-3';
else if (!completed.has('3')) stage = 'collaboration-3-of-3';

console.log(`DEEP_SUGGESTION_HINT=double-bang-active slug:${slug} stage:${stage}`);

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
