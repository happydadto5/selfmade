#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const changelogPath = path.join(root, 'CHANGELOG.md');
const changelog = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : '';
const releases = [...changelog.matchAll(/^## (\d+\.\d+\.\d+)$/gm)].map((match, index, all) => {
  const start = match.index + match[0].length;
  const end = index + 1 < all.length ? all[index + 1].index : changelog.length;
  return {
    version: match[1],
    body: changelog.slice(start, end).toLowerCase()
  };
});

const recent = releases.slice(0, 8);
const counts = {
  gameplay: 0,
  levels: 0,
  'visual-ui': 0,
  stability: 0
};

for (const release of recent) {
  counts[classify(release.body)] += 1;
}

const order = ['gameplay', 'levels', 'visual-ui', 'stability'];
let focus = order.find((lane) => counts[lane] === 0) || order[releases.length % order.length];
const lastFocus = recent.length ? classify(recent[0].body) : null;

if (lastFocus === focus) {
  const alternative = order
    .filter((lane) => lane !== focus)
    .sort((left, right) => counts[left] - counts[right])[0];
  if (alternative && counts[alternative] <= counts[focus]) {
    focus = alternative;
  }
}

const hints = {
  gameplay: 'prioritize enemies weapons objectives controls or other changes players can immediately feel',
  levels: 'prioritize wave structure progression goals beatability or pacing improvements that make runs feel more complete',
  'visual-ui': 'prioritize backgrounds hit feedback readable hud visual effects or other clearly visible presentation upgrades',
  stability: 'prioritize tests bug fixes performance or guardrails that unblock future visible work without becoming docs only'
};

console.log(`ITERATION_FOCUS=${focus}`);
console.log(`ITERATION_FOCUS_HINT=${hints[focus]}`);

function classify(text) {
  if (/(validation|smoke test|rollback|cleanup|stability|reliability|crash|guard|bug|fix|debounce|prepare_changelog|process review|automation|selfmade\.bat|prompt|readme|changelog)/.test(text)) {
    return 'stability';
  }

  if (/(wave|level|progression|goal|beatable|pace|difficulty curve|next wave|milestone)/.test(text)) {
    return 'levels';
  }

  if (/(enemy|weapon|power-up|power up|shield|rapid fire|spread shot|boss|objective|control overhaul|touch now repositions|gameplay)/.test(text)) {
    return 'gameplay';
  }

  return 'visual-ui';
}
