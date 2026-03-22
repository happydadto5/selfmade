#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const logPath = path.join(root, 'selfmade.log');
const statePath = process.env.SELFMADE_PROCESS_STATE_PATH || path.join(root, 'PROCESS_STATE.json');

const stateHint = loadStateHint();
if (stateHint) {
  console.log(`FAILURE_HINT=${stateHint}`);
  process.exit(0);
}

if (!fs.existsSync(logPath)) {
  console.log('FAILURE_HINT=none');
  process.exit(0);
}

const lines = fs.readFileSync(logPath, 'utf8').split(/\r?\n/);
const events = [];

for (let i = 0; i < lines.length; i += 1) {
  const line = stripPrefix(lines[i] || '');

  if (line.includes('VALIDATION FAILED:') || line.includes('TESTS FAILED:')) {
    let message = '';
    for (let j = i + 1; j < Math.min(lines.length, i + 6); j += 1) {
      const candidate = stripPrefix(lines[j] || '');
      const match = candidate.match(/[✗x]\s+(.*)$/i);
      if (match) {
        message = match[1].trim();
        break;
      }
    }
    if (message) {
      events.push({
        type: line.includes('VALIDATION FAILED:') ? 'validation' : 'test',
        message: normalize(message)
      });
    }
  } else if (line.includes('Tested: validation and smoke tests passed.') || line.includes('Released: v')) {
    events.push({ type: 'success', message: '' });
  }
}

const recentFailures = [];
for (let i = events.length - 1; i >= 0; i -= 1) {
  const event = events[i];
  if (event.type === 'success') break;
  recentFailures.push(event);
}

if (recentFailures.length < 2) {
  console.log('FAILURE_HINT=none');
  process.exit(0);
}

const [first, second, third] = recentFailures;
if (first && second && first.type === second.type && first.message === second.message) {
  if (first.message.includes("unexpected token 'catch'") || first.message.includes('unexpected token catch')) {
    console.log('FAILURE_HINT=avoid-complex-js-game-try-catch-edits-and-prefer-simple-graphics-controls-or-css-changes-until-stable');
    process.exit(0);
  }
  if (first.message.includes("unexpected token ')'") || first.message.includes('unexpected token )') || first.message.includes('missing catch or finally')) {
    console.log('FAILURE_HINT=fix-the-repeated-js-game-syntax-regression-first-avoid-large-try-catch-or-branch-rewrites-and-prefer-small-safe-edits-until-validation-is-green');
    process.exit(0);
  }
  console.log(`FAILURE_HINT=avoid-repeating-recent-${first.type}-failure-${slugify(first.message)}`);
  process.exit(0);
}

console.log('FAILURE_HINT=none');

function stripPrefix(value) {
  return value.replace(/^\[[^\]]+\]\s*/, '').trim();
}

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function slugify(value) {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function loadStateHint() {
  if (!fs.existsSync(statePath)) return '';
  try {
    const raw = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    const memory = raw && raw.failureMemory ? raw.failureMemory : null;
    if (!memory) return '';
    const streak = Number(memory.streak) || 0;
    const hint = typeof memory.lastHint === 'string' ? memory.lastHint.trim() : '';
    if (streak >= 2 && hint && hint !== 'none') return hint;
  } catch (error) {}
  return '';
}
