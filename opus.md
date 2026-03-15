# Opus Review — Pre-Launch Audit for Selfmade

**Reviewer:** Claude Opus 4.6 (senior review)
**Date:** 2026-03-15
**Live URL:** https://happydadto5.github.io/selfmade/

---

## Critical Finding #1 — selfmade.bat does not invoke the LLM

The batch file bumps the version number and pushes, but **never actually asks an LLM to make an improvement**. It is a publish loop with no brain. Before launch it must be rewritten to:

1. Invoke `gh copilot` (or the Copilot CLI agent) with a prompt like:
   ```
   gh copilot --model gpt-4.1 "Make one small incremental improvement to the game in this repo. Update CHANGELOG.md. Do not remove existing features. Do not add external dependencies or network calls."
   ```
2. Wait for that to complete.
3. Run validation (see #3 below).
4. *Then* bump VERSION, commit, push, pause.

Without this, `selfmade.bat` will spin forever doing nothing but incrementing a number. **This is the single blocker.**

The LLM model used must be a free-tier model. At time of writing, `gpt-4.1` and `claude-haiku-4.5` are free in GitHub Copilot. The batch should verify the model is available before proceeding and halt with a clear message if not.

---

## Critical Finding #2 — Add a Content Security Policy (CSP)

Right now there is zero protection against a future LLM iteration accidentally (or through prompt injection in code comments) introducing:
- `<script src="https://evil.com/...">`
- `eval()`, `Function()`, `innerHTML` with tainted data
- `fetch()` / `XMLHttpRequest` to arbitrary URLs
- Inline event handlers with injected code

Add this to `index.html` `<head>`:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; font-src 'self'; frame-src 'none';">
```

This locks the page down to:
- Scripts: only from same origin (no inline, no eval, no external CDNs)
- Styles: same origin + inline (needed for canvas)
- Images: same origin + data URIs (for procedural sprites)
- Network: **completely blocked** — no fetch, no XHR, no WebSocket
- Frames: none — cannot be embedded or embed others

This is the strongest reasonable policy for a standalone canvas game. If the LLM ever tries to add `eval()` or an external script, the browser will block it and the console will show an error. **This is essential before sharing publicly.**

---

## Critical Finding #3 — Add a smoke-test validation step

Before every commit, the batch must verify the game at least loads without JavaScript errors. Add a validation script (`scripts/validate.js`) that runs via Node.js (already on the system):

```js
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
  /\beval\s*\(/,
  /\bFunction\s*\(/,
  /\binnerHTML\s*=/,
  /\bdocument\.write\s*\(/,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest/,
  /\bWebSocket/,
  /\bimportScripts/,
  /src\s*=\s*["']https?:\/\//i,
  /href\s*=\s*["']https?:\/\//i,
];
const allFiles = [
  ...findFiles(path.join(root, 'js'), '.js'),
  path.join(root, 'index.html'),
  ...findFiles(path.join(root, 'css'), '.css'),
];
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pat of dangerous) {
    if (pat.test(content)) {
      errors.push(`SECURITY: ${path.relative(root, file)} matches forbidden pattern ${pat}`);
    }
  }
}

// 4. VERSION file must be valid semver
const ver = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
if (!/^\d+\.\d+\.\d+$/.test(ver)) errors.push('VERSION is not valid semver: ' + ver);

// 5. CHANGELOG.md must mention the current version
const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
if (!changelog.includes(ver)) errors.push('CHANGELOG.md does not mention current version ' + ver);

if (errors.length) {
  console.error('VALIDATION FAILED:');
  errors.forEach(e => console.error('  ✗ ' + e));
  process.exit(1);
} else {
  console.log('✓ Validation passed for v' + ver);
  process.exit(0);
}

function findFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { recursive: true })
    .filter(f => f.endsWith(ext))
    .map(f => path.join(dir, f));
}
```

The batch must run `node scripts/validate.js` **after** the LLM makes changes and **before** committing. If validation fails, the batch should `git checkout .` to revert and skip the iteration.

---

## Finding #4 — Version string in game.js is hardcoded

`js/game.js` line 11 says `const version = '0.1.0';` — this never gets updated when the batch bumps `VERSION`. The batch (or the LLM prompt) must include a step to sync the version:

```bat
REM After bumping VERSION, patch game.js
powershell -NoProfile -Command "
  $v = (Get-Content VERSION).Trim();
  $js = Get-Content js/game.js -Raw;
  $js = $js -replace \"const version = '[^']*'\", \"const version = '$v'\";
  Set-Content -Path js/game.js -Value $js -NoNewline
"
```

Also update the `<div id="version">` in index.html the same way so the static HTML matches.

---

## Finding #5 — The LLM prompt needs guardrails

The prompt sent to the LLM on each iteration must include explicit constraints. Suggested system prompt for the improvement step:

```
You are improving a small HTML5 Canvas shooter game. The project is at the current directory.

RULES (never violate):
- Make exactly ONE small, incremental improvement per iteration.
- Never remove existing features or gameplay mechanics.
- Never add external dependencies, CDN links, or network calls (fetch, XHR, WebSocket).
- Never use eval(), Function(), innerHTML, document.write(), or importScripts().
- Never add <script> or <link> tags pointing to external URLs.
- All code must be vanilla JS — no frameworks, no build tools.
- Update CHANGELOG.md with a brief description of the change under the current version.
- Keep total JS under 500 lines until version 1.0.
- Preserve the existing file structure: index.html at root, js/game.js, css/style.css.

GOOD improvements (pick one per iteration):
- New enemy type (different shape, movement pattern, HP)
- New visual effect (explosions, particles, screen shake)
- Sound effects (using Web Audio API oscillators only — no external audio files)
- Power-ups (shield, rapid fire, spread shot)
- UI polish (wave counter, lives display, game-over screen, start screen)
- Better player sprite or enemy sprites (procedural Canvas drawing)
- Background variety (parallax scrolling, stars, clouds)
- Difficulty curve tuning
- Mobile control improvements
- Accessibility (pause on blur, colorblind-friendly palette)
```

This gives the LLM creative freedom while preventing it from going off the rails.

---

## Finding #6 — Git commit messages contain literal `\n`

The current git log shows `\n` literally in commit messages (not actual newlines). This is a bat/PowerShell escaping issue. Fix by using separate `-m` flags for the subject and trailer, which is already partially done but the trailer isn't rendering correctly. Use:

```bat
git commit -m "chore: bump version %NEWVER% [auto]" --trailer "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Or use two `-m` flags (which git joins with a blank line):
```bat
git commit -m "chore: bump version %NEWVER% [auto]" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Finding #7 — Simplify the publish pipeline (GitHub Pages serves from main)

I have configured GitHub Pages to serve from the **main branch root** (`/`). This means:
- Every `git push origin main` automatically publishes to https://happydadto5.github.io/selfmade/
- The entire `gh-pages` branch, `dist/` folder, `gh pages publish`, and `git subtree` logic in the batch is **unnecessary complexity**.
- The batch should simply: make change → validate → bump version → commit → push. Done.
- The Google Drive copy (`robocopy`) can stay as an optional backup, but GitHub Pages is the primary URL.

Remove the dist-building and gh-pages publishing sections entirely.

---

## Finding #8 — README should tell the story

This is meant to go viral. The README should:
1. Explain the experiment: "This game is built and continuously improved by an AI (GitHub Copilot). Every ~5 minutes, the AI makes one small improvement. Watch it evolve."
2. Link to the live game prominently: **[▶ Play Now](https://happydadto5.github.io/selfmade/)**
3. Show the current version and a brief changelog summary.
4. Include a "How It Works" section explaining the selfmade.bat loop.
5. Maybe include a badge: version number, last commit date, etc.

This makes the repo itself shareable and interesting.

---

## Finding #9 — Add rollback capability

If the LLM produces a broken iteration (validation passes but gameplay is ruined), the batch should keep a simple escape hatch:

```bat
REM Before making changes, tag the last known-good state
git tag -f last-good
```

Then if the owner wants to roll back: `git reset --hard last-good && git push -f origin main`.

Also consider keeping the last 3 versions as git tags (`v0.1.X`) so you can see the evolution and revert to any point.

---

## Finding #10 — Empty `scripts/` directory and stale `dist/` in repo

- `scripts/` is empty — either put the validation script there (see #3) or remove it.
- `dist/` is in `.gitignore` but was manually committed earlier. Since Pages now serves from main root, `dist/` is unnecessary. Remove it from the repo and keep it in `.gitignore`.

---

## GitHub Settings Applied (by this review)

| Setting | Status | Notes |
|---------|--------|-------|
| Visibility | ✅ Public | Anyone can see code |
| GitHub Pages | ✅ Enabled | main branch, root `/` → https://happydadto5.github.io/selfmade/ |
| Homepage URL | ✅ Set | Points to Pages URL |
| Issues | ✅ Disabled | No outside bug reports |
| Wiki | ✅ Disabled | Not needed |
| Projects | ✅ Disabled | Not needed |
| Discussions | ✅ Disabled | Not needed |
| Forking | ⚠️ Cannot disable | GitHub doesn't allow disabling forks on personal (non-org) repos. Anyone can fork, but they cannot push to your repo or create PRs if issues are disabled. PRs can still technically be opened — you can simply ignore/close them. |

---

## Summary — Priority Order

1. 🔴 **#1 — Add LLM invocation to selfmade.bat** (blocker — nothing works without this)
2. 🔴 **#2 — Add CSP meta tag** (security — do before sharing publicly)
3. 🔴 **#3 — Add validation/smoke test** (safety net against broken deploys)
4. 🟡 **#5 — Write the LLM prompt with guardrails** (quality — prevents wild mutations)
5. 🟡 **#4 — Sync VERSION → game.js** (correctness)
6. 🟡 **#7 — Simplify batch to just push main** (remove dead gh-pages code)
7. 🟢 **#8 — Rewrite README for virality** (marketing)
8. 🟢 **#9 — Add rollback tags** (insurance)
9. 🟢 **#6 — Fix commit message formatting** (cosmetic)
10. 🟢 **#10 — Clean up empty dirs and stale dist** (housekeeping)
