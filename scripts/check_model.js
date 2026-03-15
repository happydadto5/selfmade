#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const model = args[0] || 'gpt-5-mini';
// Fallback to project whitelist only when explicitly allowed with --allow-fallback or env ALLOW_MODEL_FALLBACK=1
const allowFallback = args.includes('--allow-fallback') || process.env.ALLOW_MODEL_FALLBACK === '1';
const root = path.join(__dirname, '..');

function exitFail(msg) {
  console.error(msg);
  process.exit(2);
}

function tryGhCommands() {
  const cmds = ['gh copilot models list', 'gh copilot models'];
  for (const cmd of cmds) {
    try {
      const out = execSync(cmd, { encoding: 'utf8' });
      if (out && out.trim()) {
        console.log(`Used gh command: ${cmd}`);
        return out;
      }
    } catch (e) {
      // ignore and try next
    }
  }
  throw new Error('gh copilot command not available');
}

try {
  let out = '';
  try {
    out = tryGhCommands();
  } catch (e) {
    if (!allowFallback) {
      exitFail(`Unable to run 'gh copilot' to verify model '${model}': ${e.message}\nFallback to local scripts/free_models.json is disabled by default. To permit fallback, run this script with --allow-fallback or set ALLOW_MODEL_FALLBACK=1 (not recommended).`);
    }
    // Fallback only when explicitly allowed
    const fmPath = path.join(root, 'scripts', 'free_models.json');
    if (fs.existsSync(fmPath)) {
      const data = JSON.parse(fs.readFileSync(fmPath, 'utf8'));
      if (data[model] && data[model].free) {
        console.log(`Model '${model}' marked free in scripts/free_models.json (FALLBACK)`);
        process.exit(0);
      } else {
        exitFail(`Model '${model}' not marked free in scripts/free_models.json (FALLBACK)`);
      }
    } else {
      exitFail(`'gh copilot' not available and no fallback file scripts/free_models.json found.`);
    }
  }

  const lower = out.toLowerCase();
  const modelLower = model.toLowerCase();

  if (!lower.includes(modelLower)) {
    exitFail(`Model '${model}' not listed in 'gh copilot models' output. Aborting.`);
  }

  const lines = out.split(/\r?\n/);
  for (const line of lines) {
    if (line.toLowerCase().includes(modelLower)) {
      // Prefer explicit indicators of free/paid
      if (/(free\b|free-tier|no cost|zero-cost|free plan)/i.test(line)) {
        console.log(`Model '${model}' appears to be free (verified via gh).`);
        process.exit(0);
      }
      if (/(paid\b|subscription|enterprise|pro\b|paid only|cost)/i.test(line)) {
        exitFail(`Model '${model}' appears to be paid according to gh output: ${line}`);
      }
      // If we can't determine from output, treat as non-verified
      exitFail(`Cannot determine if model '${model}' is free from gh output. Output line: ${line}`);
    }
  }
} catch (err) {
  exitFail(`Failed to check model availability: ${err.message}`);
}
