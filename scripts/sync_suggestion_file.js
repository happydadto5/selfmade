#!/usr/bin/env node
const cp = require('child_process');
const fs = require('fs');
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

function listDirtyPaths() {
  return git('status --porcelain=v1')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const rawPath = line.slice(3).trim();
      return rawPath.includes(' -> ') ? rawPath.split(' -> ').pop() : rawPath;
    });
}

function hasRemoteAhead() {
  const head = git('rev-parse HEAD');
  const remote = git('rev-parse origin/main');
  return head !== remote;
}

function remoteChangedSuggestion() {
  return git(`diff --name-only HEAD..origin/main -- ${suggestionPath}`) !== '';
}

function mergeSuggestionContents(localContent, remoteContent) {
  const merged = localContent.replace(/\r\n/g, '\n').split('\n');
  const seen = new Set(
    merged
      .map((line) => line.trim())
      .filter(Boolean)
  );

  for (const rawLine of remoteContent.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (seen.has(line)) continue;
    if (merged.length && merged[merged.length - 1].trim() !== '') {
      merged.push('');
    }
    merged.push(rawLine);
    seen.add(line);
  }

  return `${merged.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
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
const remoteTouchesSuggestion = remoteAhead && remoteChangedSuggestion();
const dirtyNonSuggestion = listDirtyPaths().some((filePath) => filePath !== suggestionPath);

if (remoteAhead && dirtyNonSuggestion) {
  console.log('SUGGESTION_SYNC=BLOCKED_DIRTY_NON_SUGGESTION');
  process.exit(0);
}

if (localChanges) {
  const localContent = fs.readFileSync(path.join(root, suggestionPath), 'utf8');
  if (remoteTouchesSuggestion) {
    if (dryRun) {
      console.log('SUGGESTION_SYNC=WOULD_MERGE');
      process.exit(0);
    }
    git(`checkout -- ${suggestionPath}`);
    try {
      git('pull --rebase origin main');
    } catch (error) {
      fs.writeFileSync(path.join(root, suggestionPath), localContent, 'utf8');
      console.error(error.stderr || error.message);
      process.exit(1);
    }
    const remoteContent = fs.readFileSync(path.join(root, suggestionPath), 'utf8');
    const mergedContent = mergeSuggestionContents(localContent, remoteContent);
    fs.writeFileSync(path.join(root, suggestionPath), mergedContent, 'utf8');
    git(`add ${suggestionPath}`);
    if (git(`diff --cached --name-only -- ${suggestionPath}`) === '') {
      console.log('SUGGESTION_SYNC=MERGED_NO_CHANGES');
      process.exit(0);
    }
    git(`commit -m "docs: merge suggestions [auto]" -m "${coauthor}"`);
    git('push origin main');
    console.log('SUGGESTION_SYNC=MERGED_AND_UPLOADED');
    process.exit(0);
  }
  if (remoteAhead) {
    if (dryRun) {
      console.log('SUGGESTION_SYNC=WOULD_DOWNLOAD_THEN_UPLOAD');
      process.exit(0);
    }
    git(`checkout -- ${suggestionPath}`);
    try {
      git('pull --rebase origin main');
    } catch (error) {
      fs.writeFileSync(path.join(root, suggestionPath), localContent, 'utf8');
      console.error(error.stderr || error.message);
      process.exit(1);
    }
    fs.writeFileSync(path.join(root, suggestionPath), localContent, 'utf8');
  }
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
  git('pull --rebase origin main');
  console.log('SUGGESTION_SYNC=DOWNLOADED');
  process.exit(0);
}

console.log('SUGGESTION_SYNC=NO_CHANGES');
