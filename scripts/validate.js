// scripts/validate.js — run with: node scripts/validate.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const errors = [];

// 1. index.html must exist and contain <canvas
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!html.includes('<canvas')) errors.push('index.html missing <canvas> element');

// 2. game.js must exist and parse without syntax errors
const gameJs = fs.readFileSync(path.join(root, 'js', 'game.js'), 'utf8');
try { new Function(gameJs); } catch (e) { errors.push('js/game.js has syntax error: ' + e.message); }

// 3. Security scan — reject dangerous patterns
const dangerous = [
  [/\beval\s*\(/, 'eval()'],
  [/\bFunction\s*\(/, 'Function()'],
  [/\.innerHTML\s*=/, 'innerHTML assignment'],
  [/\bdocument\.write\s*\(/, 'document.write()'],
  [/\bfetch\s*\(/, 'fetch()'],
  [/\bXMLHttpRequest/, 'XMLHttpRequest'],
  [/\bWebSocket/, 'WebSocket'],
  [/\bnavigator\.sendBeacon\s*\(/, 'navigator.sendBeacon()'],
  [/\bRTCPeerConnection\b/, 'RTCPeerConnection'],
  [/\bimportScripts/, 'importScripts'],
  [/\bnavigator\.serviceWorker\b/, 'serviceWorker'],
  [/\bnew\s+Worker\s*\(/, 'Worker()'],
  [/\bnew\s+SharedWorker\s*\(/, 'SharedWorker()'],
  [/\bshowOpenFilePicker\s*\(/, 'showOpenFilePicker()'],
  [/\bshowSaveFilePicker\s*\(/, 'showSaveFilePicker()'],
  [/\bshowDirectoryPicker\s*\(/, 'showDirectoryPicker()'],
  [/\bFileReader\b/, 'FileReader'],
  [/\bnavigator\.clipboard\b/, 'clipboard access'],
  [/\bnavigator\.share\s*\(/, 'navigator.share()'],
  [/\bnavigator\.geolocation\b/, 'geolocation'],
  [/\b(getUserMedia|mediaDevices)\b/, 'camera or microphone access'],
  [/\b(Notification|PushManager)\b/, 'notifications or push'],
  [/\bnavigator\.(usb|bluetooth|serial|hid)\b/, 'device access API'],
  [/\brequestMIDIAccess\s*\(/, 'MIDI access'],
  [/\bNDEFReader\b/, 'NFC access'],
  [/\bwindow\.open\s*\(/, 'window.open()'],
  [/\blocation\.(assign|replace)\s*\(/, 'location redirect'],
  [/\blocation\.href\s*=/, 'location.href redirect'],
  [/<input[^>]+type\s*=\s*["']file["']/i, 'file input element'],
  [/src\s*=\s*["']https?:\/\//i, 'external src URL'],
  [/href\s*=\s*["']https?:\/\//i, 'external href URL'],
];
const allFiles = [
  ...findFiles(path.join(root, 'js'), '.js'),
  path.join(root, 'index.html'),
  ...findFiles(path.join(root, 'css'), '.css'),
];
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const [pat, label] of dangerous) {
    if (pat.test(content)) {
      errors.push(`SECURITY: ${path.relative(root, file)} contains forbidden pattern: ${label}`);
    }
  }
}

// 4. VERSION file must be valid semver
const ver = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
if (!/^\d+\.\d+\.\d+$/.test(ver)) errors.push('VERSION is not valid semver: ' + ver);

// 5. CHANGELOG.md must exist
if (!fs.existsSync(path.join(root, 'CHANGELOG.md'))) errors.push('CHANGELOG.md is missing');

// 6. CSP meta tag must be present
if (!html.includes('Content-Security-Policy')) errors.push('index.html missing Content-Security-Policy meta tag');
for (const directive of ["connect-src 'none'", "worker-src 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'none'", "manifest-src 'none'"]) {
  if (!html.includes(directive)) {
    errors.push(`index.html CSP is missing required directive: ${directive}`);
  }
}

if (errors.length) {
  console.error('VALIDATION FAILED:');
  errors.forEach(e => console.error('  \u2717 ' + e));
  process.exit(1);
} else {
  console.log('\u2713 Validation passed for v' + ver);
  process.exit(0);
}

function findFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findFiles(full, ext));
    else if (entry.name.endsWith(ext)) results.push(full);
  }
  return results;
}
