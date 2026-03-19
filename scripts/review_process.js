#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const changelogPath = path.join(root, 'CHANGELOG.md');
const statePath = path.join(root, 'PROCESS_STATE.json');
const mode = (process.argv[2] || 'prompt').trim().toLowerCase();

const defaults = {
  metaReviewEvery: 10,
  lastMetaReviewReleaseCount: 0,
  lastMetaReviewVersion: '',
  lastMetaReviewAt: '',
  uiReviewEvery: 20,
  lastUiReviewReleaseCount: null,
  lastUiReviewVersion: '',
  lastUiReviewAt: ''
};

try {
  const analysis = analyze();

  if (mode === 'prompt') {
    console.log(`PROCESS_REVIEW=${analysis.promptReview}`);
    console.log(`META_REVIEW_DUE=${analysis.metaReviewDue ? 'YES' : 'NO'}`);
    console.log(`UI_REVIEW_DUE=${analysis.uiReviewDue ? 'YES' : 'NO'}`);
    process.exit(0);
  }

  if (mode === 'record') {
    const version = (process.argv[3] || '').trim();
    const reviewed = /^yes$/i.test((process.argv[4] || '').trim());
    const uiReviewed = /^yes$/i.test((process.argv[5] || '').trim());
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      console.error(`Invalid semver version: ${version || '[missing]'}`);
      process.exit(1);
    }

    const nextState = {
      ...analysis.state,
      lastMetaReviewAt: analysis.state.lastMetaReviewAt || '',
      lastUiReviewAt: analysis.state.lastUiReviewAt || ''
    };

    if (reviewed) {
      nextState.lastMetaReviewReleaseCount = analysis.releaseCount;
      nextState.lastMetaReviewVersion = version;
      nextState.lastMetaReviewAt = new Date().toISOString();
    }

    if (uiReviewed) {
      nextState.lastUiReviewReleaseCount = analysis.releaseCount;
      nextState.lastUiReviewVersion = version;
      nextState.lastUiReviewAt = new Date().toISOString();
    }

    fs.writeFileSync(statePath, `${JSON.stringify(nextState, null, 2)}\n`, 'utf8');
    console.log(
      reviewed
        ? `Recorded process review at ${version} after ${analysis.releaseCount} releases.`
        : uiReviewed
          ? `Recorded Android UI review at ${version} after ${analysis.releaseCount} releases.`
          : `Process review state unchanged at ${version}.`
    );
    process.exit(0);
  }

  console.error(`Unknown mode: ${mode}`);
  process.exit(1);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

function analyze() {
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const state = loadState();
  const releases = parseReleases(changelog);
  const windowSize = Math.min(10, releases.length);
  const recent = releases.slice(0, windowSize);
  const counts = {
    gameplay: 0,
    ui: 0,
    polish: 0,
    docsProcess: 0,
    reliability: 0,
    unclear: 0
  };

  for (const release of recent) {
    counts[classifyRelease(release.body)] += 1;
  }

  const visibleCount = counts.gameplay + counts.ui;
  const polishHeavy = counts.polish + counts.docsProcess >= Math.max(4, Math.ceil(windowSize * 0.6));
  const visibleWeak = windowSize > 0 && (visibleCount < Math.max(3, Math.ceil(windowSize * 0.35)) || polishHeavy);
  const metaReviewEvery = Number.isInteger(state.metaReviewEvery) && state.metaReviewEvery > 0
    ? state.metaReviewEvery
    : defaults.metaReviewEvery;
  const uiReviewEvery = Number.isInteger(state.uiReviewEvery) && state.uiReviewEvery > 0
    ? state.uiReviewEvery
    : defaults.uiReviewEvery;
  const lastUiReviewReleaseCount = Number.isInteger(state.lastUiReviewReleaseCount) && state.lastUiReviewReleaseCount >= 0
    ? state.lastUiReviewReleaseCount
    : releases.length;
  const metaReviewDue = releases.length - (state.lastMetaReviewReleaseCount || 0) >= metaReviewEvery;
  const uiReviewDue = releases.length - lastUiReviewReleaseCount >= uiReviewEvery;
  const focus = buildFocus({ metaReviewDue, visibleWeak, windowSize, counts });
  const promptReview = [
    `recent${windowSize || 0}`,
    `gameplay:${counts.gameplay}`,
    `ui:${counts.ui}`,
    `polish:${counts.polish}`,
    `docs-process:${counts.docsProcess}`,
    `reliability:${counts.reliability}`,
    `unclear:${counts.unclear}`,
    `visible-weak:${visibleWeak ? 'yes' : 'no'}`,
    `meta-review-due:${metaReviewDue ? 'yes' : 'no'}`,
    `focus:${focus}`
  ].join(' ');

  return {
    state,
    releaseCount: releases.length,
    metaReviewDue,
    uiReviewDue,
    promptReview
  };
}

function loadState() {
  if (!fs.existsSync(statePath)) {
    return { ...defaults };
  }

  const raw = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  return {
    metaReviewEvery: Number.isInteger(raw.metaReviewEvery) && raw.metaReviewEvery > 0
      ? raw.metaReviewEvery
      : defaults.metaReviewEvery,
    lastMetaReviewReleaseCount: Number.isInteger(raw.lastMetaReviewReleaseCount) && raw.lastMetaReviewReleaseCount >= 0
      ? raw.lastMetaReviewReleaseCount
      : defaults.lastMetaReviewReleaseCount,
    lastMetaReviewVersion: typeof raw.lastMetaReviewVersion === 'string'
      ? raw.lastMetaReviewVersion
      : defaults.lastMetaReviewVersion,
    lastMetaReviewAt: typeof raw.lastMetaReviewAt === 'string'
      ? raw.lastMetaReviewAt
      : defaults.lastMetaReviewAt,
    uiReviewEvery: Number.isInteger(raw.uiReviewEvery) && raw.uiReviewEvery > 0
      ? raw.uiReviewEvery
      : defaults.uiReviewEvery,
    lastUiReviewReleaseCount: Number.isInteger(raw.lastUiReviewReleaseCount) && raw.lastUiReviewReleaseCount >= 0
      ? raw.lastUiReviewReleaseCount
      : defaults.lastUiReviewReleaseCount,
    lastUiReviewVersion: typeof raw.lastUiReviewVersion === 'string'
      ? raw.lastUiReviewVersion
      : defaults.lastUiReviewVersion,
    lastUiReviewAt: typeof raw.lastUiReviewAt === 'string'
      ? raw.lastUiReviewAt
      : defaults.lastUiReviewAt
  };
}

function parseReleases(markdown) {
  const matches = [...markdown.matchAll(/^## (\d+\.\d+\.\d+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : markdown.length;
    return {
      version: match[1],
      body: markdown.slice(start, end)
    };
  });
}

function classifyRelease(body) {
  const text = body.toLowerCase();

  if (/(roadmap|changelog|readme|automation|selfmade\.bat|process review|process state|prompt|future\.md|suggestion\.txt|versioning|git tag|github pages|loop)/.test(text)) {
    return 'docsProcess';
  }

  if (/(validation|smoke test|rollback|cleanup|stability|reliability|crash|guard|bug|fix|debounce|prevent .* fail)/.test(text)) {
    return 'reliability';
  }

  if (/(accessibility|screen reader|aria|focus|contrast|readability|reduced-motion|keyboard|clarify|copy tweak|badge|guide line|guide lines|touch hint|touch guide|touch guides|touch-zone|touch zone|toast|hud|button size|button contrast|overlay layout|auto-pause)/.test(text)) {
    return 'polish';
  }

  if (/(gameplay|enemy|wave|level|power-up|power up|rapid fire|spread shot|shield|boss|objective|score-based|difficulty|balance|achievement|milestone|beatable|weapon|damage|spawn|controls? overhaul|touch controls? overhaul)/.test(text)) {
    return 'gameplay';
  }

  if (/(ui|ux|visual|effect|particle|screen shake|background|sprite|touch|mobile|mouse|pointer|control|hud|button|start screen|end-of-run|canvas)/.test(text)) {
    return 'ui';
  }

  return 'unclear';
}

function buildFocus({ metaReviewDue, visibleWeak, windowSize, counts }) {
  if (windowSize === 0) {
    return 'bootstrap-visible-gameplay-and-roadmap';
  }

  if (metaReviewDue && visibleWeak) {
    return 'review-roadmap-then-prioritize-a-noticeable-gameplay-or-ui-change-refresh-future-if-stale';
  }

  if (metaReviewDue) {
    return 'do-a-light-roadmap-and-process-check-before-choosing-the-next-change';
  }

  if (visibleWeak) {
    return 'prioritize-a-noticeable-gameplay-ui-or-feel-improvement';
  }

  if (counts.reliability >= 3) {
    return 'balance-visible-progress-with-reliability-work';
  }

  return 'keep-mixing-visible-progress-with-safe-maintenance';
}
