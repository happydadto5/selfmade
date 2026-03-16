#!/usr/bin/env node
const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/extract_change_summary.js <copilot-output-file>');
  process.exit(2);
}

let content;
try {
  content = fs.readFileSync(filePath, 'utf8');
} catch (error) {
  console.error(`Failed to read Copilot output: ${error.message}`);
  process.exit(1);
}

const normalized = content.replace(/\r\n/g, '\n');
const changeMatch = normalized.match(/(?:^|\n)\s*Change:\s*(.+)/i);

if (changeMatch) {
  console.log(clean(changeMatch[1]));
  process.exit(0);
}

const bulletFallback = normalized
  .split('\n')
  .map((line) => clean(line.replace(/^-\s*/, '')))
  .find((line) =>
    line &&
    /^(Added|Updated|Fixed|Improved|Refined|Adjusted|Changed|Removed|Created|Implemented)\b/i.test(line)
  );

if (bulletFallback) {
  console.log(bulletFallback);
  process.exit(0);
}

const fallback = normalized
  .split('\n')
  .map((line) => clean(line))
  .find((line) =>
    line &&
    !/^(Reading|Running|Preparing|Plan:|Next:|Applying|Calling tools|Committed changes:?|Editing|Viewing|Inspecting|Making|Adding|Using|Report_Intent|Now |This helps|Including intent|Change made|The next step)/i.test(line) &&
    /^(Added|Updated|Fixed|Improved|Refined|Adjusted|Changed|Removed|Created|Implemented)\b/i.test(line)
  );

if (fallback) {
  console.log(fallback);
  process.exit(0);
}

console.log('[no change summary returned]');

function clean(value) {
  return value.replace(/\s+/g, ' ').trim();
}
