#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');
const protectedPaths = new Set([
  'suggestion.txt',
  'future.md',
  'scripts/image_quota.json',
  'selfmade.log',
]);

function git(args) {
  return cp.execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function normalize(relativePath) {
  return relativePath.replace(/\\/g, '/');
}

function isProtected(relativePath) {
  return protectedPaths.has(normalize(relativePath));
}

function removeTarget(targetPath) {
  if (!targetPath.startsWith(root)) return;
  fs.rmSync(targetPath, { recursive: true, force: true });
}

const statusLines = git(['status', '--porcelain=v1']).split(/\r?\n/).filter(Boolean);
const restoreTracked = [];
const removeUntracked = [];

for (const line of statusLines) {
  const code = line.slice(0, 2);
  const rawPath = line.slice(3).trim();
  const relativePath = normalize(rawPath.includes(' -> ') ? rawPath.split(' -> ').pop() : rawPath);
  if (isProtected(relativePath)) continue;

  if (code === '??') {
    removeUntracked.push(relativePath);
  } else {
    restoreTracked.push(relativePath);
  }
}

if (!restoreTracked.length && !removeUntracked.length) {
  console.log('STARTUP_CLEANUP=NO_CHANGES');
  process.exit(0);
}

if (dryRun) {
  if (restoreTracked.length) console.log(`STARTUP_CLEANUP=WOULD_RESTORE:${restoreTracked.join(',')}`);
  if (removeUntracked.length) console.log(`STARTUP_CLEANUP=WOULD_REMOVE:${removeUntracked.join(',')}`);
  process.exit(0);
}

if (restoreTracked.length) {
  git(['restore', '--source=HEAD', '--staged', '--worktree', '--', ...restoreTracked]);
}

for (const relativePath of removeUntracked) {
  removeTarget(path.join(root, relativePath));
}

if (restoreTracked.length) console.log(`STARTUP_CLEANUP=RESTORED:${restoreTracked.join(',')}`);
if (removeUntracked.length) console.log(`STARTUP_CLEANUP=REMOVED:${removeUntracked.join(',')}`);
