#!/usr/bin/env node
const cp = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');
const suggestionPath = 'suggestion.txt';
const coauthor = 'Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>';

function git(command, options = {}) {
  return cp.execSync(`git ${command}`, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function hasLocalSuggestionChanges() {
  return git(`status --porcelain -- ${suggestionPath}`) !== '';
}

function hasRemoteAhead() {
  const head = git('rev-parse HEAD');
  const remote = git('rev-parse origin/main');
  return head !== remote;
}

try {
  git('rev-parse --is-inside-work-tree');
} catch {
  console.log('SUGGESTION_SYNC=SKIPPED_NOT_GIT');
  process.exit(0);
}

try {
  git('fetch origin main --quiet');
} catch (error) {
  console.error(error.stderr || error.message);
  process.exit(1);
}

const localChanges = hasLocalSuggestionChanges();
const remoteAhead = hasRemoteAhead();

if (localChanges && remoteAhead) {
  console.error('suggestion.txt sync blocked: local edits exist and origin/main has new commits. Resolve manually.');
  process.exit(1);
}

if (localChanges) {
  if (dryRun) {
    console.log('SUGGESTION_SYNC=WOULD_UPLOAD');
    process.exit(0);
  }
  git(`add ${suggestionPath}`);
  if (git(`diff --cached --name-only -- ${suggestionPath}`) === '') {
    console.log('SUGGESTION_SYNC=NO_CHANGES');
    process.exit(0);
  }
  git(`commit -m "docs: sync suggestions [auto]" -m "${coauthor}"`);
  git('push origin main');
  console.log('SUGGESTION_SYNC=UPLOADED');
  process.exit(0);
}

if (remoteAhead) {
  if (dryRun) {
    console.log('SUGGESTION_SYNC=WOULD_DOWNLOAD');
    process.exit(0);
  }
  git('pull --ff-only origin main');
  console.log('SUGGESTION_SYNC=DOWNLOADED');
  process.exit(0);
}

console.log('SUGGESTION_SYNC=NO_CHANGES');
