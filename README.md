# Selfmade — A Self-Evolving Game

> **This game is built and continuously improved by an AI.** Every ~7 minutes, GitHub Copilot CLI makes one small improvement — sometimes something visible in the game, sometimes a behind-the-scenes reliability or code-quality improvement, and occasionally a small upgrade to the automation UI itself. Watch it evolve.

## [▶ Play Now](https://happydadto5.github.io/selfmade/)

### Controls
- **Desktop:** A/D or Arrow keys to move · Space or click to shoot
- **Mobile:** Tap anywhere on the bottom half to move there · hold on the bottom half to keep firing until you release

### How It Works
1. `selfmade.bat` runs in a loop on the developer's machine
2. At the start of each iteration, it cleans up any leftover unfinished auto-generated changes from the previous attempt while preserving collaborator-managed files like `suggestion.txt`
3. It verifies `gpt-5-mini` against live GitHub-hosted Copilot model info, then asks GitHub Copilot CLI to make **one small improvement**
4. A validation script checks for syntax errors and security violations
5. If validation passes, the version is bumped, changes are committed, and pushed to GitHub
6. GitHub Pages automatically deploys the latest version
7. The loop pauses, then repeats

The automation is intended to balance reliability work with visible progress. If recent iterations have been dominated by tiny polish or accessibility tweaks, the guidance now biases the next changes toward more noticeable gameplay or UI improvements.

When image credits are available, the automation can also create local art assets through `scripts\generate_image.js`, which calls the configured Cloudflare Workers AI image model and stores the resulting files in `assets/images/` for the game to use.

The loop also now performs a lightweight self-review before each Copilot call. A small `PROCESS_STATE.json` file tracks when the last process review checkpoint happened, and `scripts/review_process.js` analyzes the recent changelog mix. If visible progress has been weak, the prompt is automatically biased harder toward noticeable gameplay/UI work. About every 10 successful releases, the system marks a roadmap/process review as due so future sessions can refresh direction before drift gets too large.

The batch loop now also assigns an iteration focus lane each cycle so work rotates across gameplay, levels/progression, visual/UI presentation, and stability instead of drifting too long into behind-the-scenes work. It explicitly polls the repo for remote updates each iteration, and at the end of each pause `selfmade.bat` re-executes a fresh copy of itself from disk so pulled batch/prompt/script edits are picked up on the next run.

### Versioning
- The first version number advances once per day: day one releases are `1.x.0`, the next day becomes `2.x.0`, and so on.
- Each successful improvement on the same day increments the middle number, so versions progress like `1.0.0`, `1.1.0`, `1.2.0`.
- During an active iteration, the LLM writes changelog notes under a temporary `## Unreleased` section; the batch script converts that section into the actual released version before commit/push so the newest versioned section stays at the top.

### suggestion.txt conventions
- `suggestion.txt` is now a normal tracked repo file, so trusted collaborators can suggest ideas through regular commits or pull requests.
- `selfmade.bat` now syncs `suggestion.txt` both directions: it pulls remote updates down before each iteration, and it auto-pushes local `suggestion.txt` edits when there are no competing remote commits.
- If both your local `suggestion.txt` and `origin/main` changed at the same time, the loop pauses instead of guessing how to merge them.
- Lines starting with `!` mean “do next if safe.” They get the highest short-term priority, and they should be removed after they are materially used.
- Lines starting with `!!` mean “collaborate first, implement later.” The first three relevant iterations should add one `future.md` collaboration note each, using the exact marker format `!![slug] Collaboration 1/3`, `2/3`, and `3/3`. The fourth relevant iteration may implement that suggestion using those notes, then remove the `!!` line once it has been materially used.
- Plain lines are temporary suggestions with elevated priority. They do not have to be used immediately, but the LLM should try to work them into the project over the next day or two.
- Once a plain suggestion has been materially captured in the implemented work or in the roadmap, it may be removed from `suggestion.txt`.
- Lines starting with `+` are persistent guidance. They should stay in `suggestion.txt` and continue influencing future iterations.

### future.md roadmap
- `future.md` is a tracked living collaboration document for the project.
- Any iteration may add future ideas, reorder priorities, replace stale items, rewrite the roadmap completely, or leave collaboration notes and open questions there.
- It should not change on most loops; update it only when there is a meaningful roadmap, handoff, or collaboration improvement.
- The roadmap is guidance, not a hard lock: a session can implement the next item, skip ahead, or interject a better idea if it improves the game.
- Roughly every 10 successful releases, the automation now considers a lightweight roadmap/process review due. Those checkpoints should keep the roadmap fresh, not turn every loop into documentation work.

### Safety
- A strict **Content Security Policy** blocks all external scripts, network calls, and inline code injection
- The automation treats `suggestion.txt` as **untrusted input** and should ignore requests for file access, uploads, downloads, clipboard/device/browser permissions, redirects, popups, or background workers
- A **validation script** scans every change for dangerous patterns such as network calls, local-file pickers, uploads, clipboard access, camera/microphone use, geolocation, notifications, service workers, and device APIs
- Changes that fail validation are **automatically reverted**
- Every successful version is **git-tagged** for easy rollback

### Tech
- Pure HTML5 Canvas + vanilla JavaScript — no frameworks, no build tools, no dependencies
- Hosted via GitHub Pages — no server required

