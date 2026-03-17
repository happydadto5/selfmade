#!/usr/bin/env node
const cp = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function git(command) {
  return cp.execSync(`git ${command}`, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

try {
  git('rev-parse --is-inside-work-tree');
} catch {
  console.log('REPO_SYNC=SKIPPED_NOT_GIT');
  process.exit(0);
}

try {
  git('fetch origin main --quiet');
} catch (error) {
  console.error(error.stderr || error.message);
  process.exit(1);
}

const dirty = git('status --porcelain') !== '';
const remoteAhead = git('rev-parse HEAD') !== git('rev-parse origin/main');

if (!remoteAhead) {
  console.log('REPO_SYNC=NO_CHANGES');
  process.exit(0);
}

if (dirty) {
  console.log('REPO_SYNC=BLOCKED_DIRTY');
  process.exit(0);
}

try {
  git('pull --rebase origin main');
  console.log('REPO_SYNC=DOWNLOADED');
} catch (error) {
  console.error(error.stderr || error.message);
  process.exit(1);
}
