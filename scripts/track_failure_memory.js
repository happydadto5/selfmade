#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const statePath = process.env.SELFMADE_PROCESS_STATE_PATH || path.join(root, 'PROCESS_STATE.json');
const mode = (process.argv[2] || '').trim().toLowerCase();
const type = (process.argv[3] || '').trim().toLowerCase();
const sourcePath = (process.argv[4] || '').trim();

const defaults = {
  metaReviewEvery: 10,
  lastMetaReviewReleaseCount: 0,
  lastMetaReviewVersion: '',
  lastMetaReviewAt: '',
  uiReviewEvery: 20,
  lastUiReviewReleaseCount: null,
  lastUiReviewVersion: '',
  lastUiReviewAt: '',
  failureMemory: {
    streak: 0,
    lastType: '',
    lastMessage: '',
    lastHint: 'none',
    lastSource: '',
    updatedAt: '',
    recent: []
  }
};

if (mode !== 'failure' && mode !== 'success') {
  console.error('Usage: node scripts/track_failure_memory.js <failure|success> [validation|test] [logPath]');
  process.exit(1);
}

const state = loadState();

if (mode === 'success') {
  state.failureMemory = {
    ...state.failureMemory,
    streak: 0,
    lastHint: 'none',
    updatedAt: new Date().toISOString()
  };
  saveState(state);
  console.log('FAILURE_MEMORY=RESET');
  process.exit(0);
}

if (!sourcePath) {
  console.error('Missing log path for failure mode.');
  process.exit(1);
}

const message = extractFailureMessage(sourcePath, type);
if (!message) {
  console.error(`No ${type || 'failure'} message found in ${sourcePath}`);
  process.exit(1);
}

const normalizedType = type === 'test' ? 'test' : 'validation';
const normalizedMessage = normalize(message);
const prior = state.failureMemory || defaults.failureMemory;
const sameFailure = prior.lastType === normalizedType && prior.lastMessage === normalizedMessage;
const streak = sameFailure ? (Number(prior.streak) || 0) + 1 : 1;
const hint = buildHint(normalizedType, normalizedMessage, streak);
const recent = Array.isArray(prior.recent) ? prior.recent.slice(0, 5) : [];
recent.unshift({
  type: normalizedType,
  message: normalizedMessage,
  streak,
  recordedAt: new Date().toISOString()
});

state.failureMemory = {
  streak,
  lastType: normalizedType,
  lastMessage: normalizedMessage,
  lastHint: hint,
  lastSource: path.basename(sourcePath),
  updatedAt: new Date().toISOString(),
  recent: recent.slice(0, 6)
};

saveState(state);
console.log(`FAILURE_MEMORY=RECORDED:${normalizedType}:${streak}:${hint}`);

function extractFailureMessage(logFilePath, failureType) {
  const resolved = path.resolve(logFilePath);
  if (!fs.existsSync(resolved)) return '';
  const lines = fs.readFileSync(resolved, 'utf8').split(/\r?\n/);
  const marker = failureType === 'test' ? 'TESTS FAILED:' : 'VALIDATION FAILED:';
  let inSection = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!inSection && line.includes(marker)) {
      inSection = true;
      continue;
    }
    if (!inSection) continue;
    const match = line.match(/^[✗x]\s+(.*)$/i);
    if (match) return match[1].trim();
    if (line && !/^[-=]+$/.test(line)) return line;
  }
  return '';
}

function buildHint(failureType, message, streak) {
  const base = slugify(message);
  if (failureType === 'validation' && /unexpected token '\)'|unexpected token \)|missing catch or finally|unexpected token 'catch'|unexpected token catch/.test(message)) {
    return streak >= 2
      ? 'fix-the-repeated-js-game-syntax-regression-first-avoid-large-try-catch-or-branch-rewrites-and-prefer-small-safe-edits-until-validation-is-green'
      : 'avoid-risky-js-game-branch-edits-until-the-current-syntax-problem-is-understood';
  }
  if (streak >= 2) {
    return `fix-the-repeated-${failureType}-failure-before-new-feature-work-${base}`;
  }
  return `avoid-repeating-latest-${failureType}-failure-${base}`;
}

function loadState() {
  if (!fs.existsSync(statePath)) {
    return JSON.parse(JSON.stringify(defaults));
  }
  const raw = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  return {
    ...defaults,
    ...raw,
    failureMemory: {
      ...defaults.failureMemory,
      ...(raw.failureMemory || {})
    }
  };
}

function saveState(nextState) {
  fs.writeFileSync(statePath, `${JSON.stringify(nextState, null, 2)}\n`, 'utf8');
}

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function slugify(value) {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}
