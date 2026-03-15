#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const snapshotPath = process.argv[2];

function git(command) {
  return execSync(command, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function readLines(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}

function removePath(targetPath) {
  if (!targetPath.startsWith(root)) return;
  fs.rmSync(targetPath, { recursive: true, force: true });
}

try {
  const beforeSet = new Set(readLines(snapshotPath));

  execSync('git restore --source=HEAD --staged --worktree -- .', {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const afterUntracked = git('git ls-files --others --exclude-standard')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const removed = [];
  for (const relativePath of afterUntracked) {
    if (!beforeSet.has(relativePath)) {
      removePath(path.join(root, relativePath));
      removed.push(relativePath);
    }
  }

  console.log('Rollback complete.');
  if (removed.length) {
    console.log(`Removed new untracked files: ${removed.join(', ')}`);
  }
} catch (error) {
  console.error(`Rollback failed: ${error.message}`);
  process.exit(1);
}
