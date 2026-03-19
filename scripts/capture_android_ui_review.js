#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const outputDir = path.join(root, 'docs', 'ui-reviews');
const outputPath = path.join(outputDir, 'android-review-latest.png');
const reviewUrl = 'https://happydadto5.github.io/selfmade/';
const candidates = [
  path.join(process.env.ProgramFiles || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  path.join(process.env['ProgramFiles(x86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  path.join(process.env.ProgramFiles || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe')
].filter(Boolean);

function findBrowser() {
  return candidates.find(candidate => candidate && fs.existsSync(candidate)) || '';
}

function relativeForPrompt(targetPath) {
  return path.relative(root, targetPath).replace(/\//g, '\\');
}

try {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = findBrowser();
  if (!browser) {
    console.log('UI_REVIEW_SCREENSHOT=none');
    console.log('UI_REVIEW_STATUS=UNAVAILABLE_BROWSER');
    process.exit(0);
  }

  cp.execFileSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=412,915',
    '--force-device-scale-factor=2',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=5000',
    '--user-agent=Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
    `--screenshot=${outputPath}`,
    reviewUrl
  ], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  console.log(`UI_REVIEW_SCREENSHOT=${relativeForPrompt(outputPath)}`);
  console.log(`UI_REVIEW_STATUS=CAPTURED:${path.basename(browser)}`);
} catch (error) {
  console.log('UI_REVIEW_SCREENSHOT=none');
  console.log(`UI_REVIEW_STATUS=CAPTURE_FAILED:${(error.message || 'unknown').replace(/\s+/g, ' ')}`);
  process.exit(0);
}
