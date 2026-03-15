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

### Versioning
- The first version number advances once per day: day one releases are `1.x.0`, the next day becomes `2.x.0`, and so on.
- Each successful improvement on the same day increments the middle number, so versions progress like `1.0.0`, `1.1.0`, `1.2.0`.
- During an active iteration, the LLM writes changelog notes under a temporary `## Unreleased` section; the batch script converts that section into the actual released version before commit/push so the newest versioned section stays at the top.

### suggestion.txt conventions
- `suggestion.txt` is now a normal tracked repo file, so trusted collaborators can suggest ideas through regular commits or pull requests.
- Plain lines are temporary suggestions. An iteration may keep reusing one across multiple improvements and should remove it only when it feels fully used up.
- Lines starting with `+` are persistent guidance. They should stay in `suggestion.txt` and continue influencing future iterations.

### Safety
- A strict **Content Security Policy** blocks all external scripts, network calls, and inline code injection
- A **validation script** scans every change for dangerous patterns (`eval`, `fetch`, external URLs, etc.)
- Changes that fail validation are **automatically reverted**
- Every successful version is **git-tagged** for easy rollback

### Tech
- Pure HTML5 Canvas + vanilla JavaScript — no frameworks, no build tools, no dependencies
- Hosted via GitHub Pages — no server required

