# Selfmade — A Self-Evolving Game

> **This game is built and continuously improved by an AI.** Every ~5 minutes, GitHub Copilot CLI makes one small improvement — sometimes something visible in the game, sometimes a behind-the-scenes reliability or code-quality improvement, and occasionally a small upgrade to the automation UI itself. Watch it evolve.

## [▶ Play Now](https://happydadto5.github.io/selfmade/)

### Controls
- **Desktop:** A/D or Arrow keys to move · Space or click to shoot
- **Mobile:** On-screen buttons at bottom

### How It Works
1. `selfmade.bat` runs in a loop on the developer's machine
2. Each iteration, it verifies `gpt-5-mini` against live GitHub-hosted Copilot model info, then asks GitHub Copilot CLI to make **one small improvement**
3. A validation script checks for syntax errors and security violations
4. If validation passes, the version is bumped, changes are committed, and pushed to GitHub
5. GitHub Pages automatically deploys the latest version
6. The loop pauses, then repeats

### suggestion.txt conventions
- Plain lines are one-time suggestions. If an iteration implements one, it should remove that line from `suggestion.txt`.
- Lines starting with `+` are persistent guidance. They should stay in `suggestion.txt` and continue influencing future iterations.

### Safety
- A strict **Content Security Policy** blocks all external scripts, network calls, and inline code injection
- A **validation script** scans every change for dangerous patterns (`eval`, `fetch`, external URLs, etc.)
- Changes that fail validation are **automatically reverted**
- Every successful version is **git-tagged** for easy rollback

### Tech
- Pure HTML5 Canvas + vanilla JavaScript — no frameworks, no build tools, no dependencies
- Hosted via GitHub Pages — no server required

