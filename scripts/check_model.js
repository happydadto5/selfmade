#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const model = process.argv[2] || 'gpt-5-mini';
const root = path.join(__dirname, '..');

function exitFail(msg) {
  console.error(msg);
  process.exit(2);
}

try {
  let out = '';
  try {
    out = execSync('gh copilot models list', { encoding: 'utf8' });
  } catch (e1) {
    try {
      out = execSync('gh copilot models', { encoding: 'utf8' });
    } catch (e2) {
      throw new Error('gh copilot models command not available');
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
      if (/(free|free-tier|no cost|zero-cost|free plan)/i.test(line)) {
        console.log(`Model '${model}' appears to be free.`);
        process.exit(0);
      }
      if (/(paid|subscription|enterprise|pro|paid only|cost)/i.test(line)) {
        exitFail(`Model '${model}' appears to be paid according to gh output: ${line}`);
      }
      exitFail(`Cannot determine if model '${model}' is free. Output line: ${line}`);
    }
  }
} catch (e) {
  // Fallback to local whitelist
  try {
    const fmPath = path.join(root, 'scripts', 'free_models.json');
    if (fs.existsSync(fmPath)) {
      const data = JSON.parse(fs.readFileSync(fmPath, 'utf8'));
      if (data[model] && data[model].free) {
        console.log(`Model '${model}' marked free in scripts/free_models.json`);
        process.exit(0);
      } else {
        exitFail(`Model '${model}' not marked free in scripts/free_models.json`);
      }
    } else {
      exitFail(`Failed to check model availability: ${e.message}\nNo fallback file scripts/free_models.json found.`);
    }
  } catch (e2) {
    exitFail(`Failed to check model availability: ${e.message}; fallback failed: ${e2.message}`);
  }
}
