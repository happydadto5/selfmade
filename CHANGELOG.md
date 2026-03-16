# Changelog

## 2.17.0
- UI: make transient tip box width responsive to canvas width to avoid overflow on small screens (small)

## 2.16.0
- Accessibility: announce auto-pauses using assertive overlay message so screen readers are notified immediately (small)

## 2.15.0
- Fix: resume audio on restart when sound is enabled (small)

## 2.14.0
- Perf: mark mousedown and global mouseup listeners as passive to improve input responsiveness on touch devices (small)

## 2.13.0
- Tweak: increase auto-pause debounce from 250ms to 300ms to reduce accidental pauses when quickly switching tabs (small)

## 2.12.0
- Fix: accept modern 'Space' key label in keyboard handlers for firing (keyboard compatibility) (small)

## 2.11.0
- Accessibility: add aria-label to overlay for screen readers (small)

## 2.10.0
- Chore: add short changelog entry for this iteration (accessibility/overlay/pause note) (2026-03-16)

## 2.9.0
- Accessibility: increase HUD contrast for improved readability (small)

## 2.8.0
- Fix: correct touch coordinate math so touch zones map to canvas; fixes Android right-stuck movement (small)

## Unreleased
- Collaboration: update guidance so `future.md` changes only when it adds meaningful roadmap or collaboration value, not on most loops.

## 2.7.0
- Accessibility/UX: prevent touch scrolling on the game canvas (touch-action: none) to improve mobile controls (small)

## 2.6.0
- Chore: extract input-clearing helper and use it to avoid duplicated input-clearing code (small)

## 2.5.0
- UI: show live high score in HUD while running (small)

## 2.4.0
- Accessibility: focus canvas on restart so keyboard users regain control (small)

## 2.3.0
- UI: clarify touch controls tip and mention dashed touch-guide lines (small)

## 2.2.0
- Chore: read scripts/prompt.txt, suggestion.txt, and future.md; add short Unreleased changelog entry (2026-03-16)

## 2.1.0
- Fix: clear pending auto-pause timer when user toggles pause to avoid race with blur/visibility auto-pause (small)

## Unreleased
- Automation: reduce the self-evolving loop delay from 5 minutes to 1 minute.
- Automation: clean up unfinished prior-iteration files at startup before starting a new loop, while preserving collaborator-managed files like `suggestion.txt`.
- Chore: read scripts/prompt.txt, suggestion.txt, and future.md; added small changelog entry (2026-03-16)
- Perf: debounce window resize handler to reduce layout thrash on rapid resizes (small)
- UI: add z-index to overlay so pause/game-over overlay sits above other UI elements (small)

## 2.0.0
- Accessibility: improve overlay message readability when paused (small) — 2026-03-16

- Chore: read scripts/prompt.txt, suggestion.txt, and future.md; small incremental update (2026-03-16)

## Unreleased
- UI: allow clicking the overlay when game over to restart the game (small)

## Unreleased
- Accessibility: focus canvas after unpausing via overlay so keyboard users regain control (small)

## Unreleased
- UI: add aria-live to Wave HUD for screen-reader announcements (small)

## Unreleased

## Unreleased

- Fix: clear input on pointercancel/touchcancel to avoid stuck controls when touches are cancelled (small)

## Unreleased

## Unreleased

- Accessibility: pause on window blur/visibility and resume on focus (small)

## Unreleased

- UI: improve touch-guide contrast for touch devices (small)

## Unreleased

- Chore: add short changelog entry for this iteration (2026-03-16) — verified auto-pause/visibility debounce and input-clearing (small)

## Unreleased

- Accessibility: add tabindex and aria-label to the main canvas for keyboard and screen-reader users (small)

## Unreleased

- Fix: persist high score when the game ends so a final score is saved (small)

## Unreleased

- UI: colorize Lives HUD hearts using accessible DOM spans (small)

## Unreleased

- Accessibility: focus canvas on resume when returning to the page so keyboard users regain control (small)

## Unreleased

- Tweak: increase auto-pause debounce from 150ms to 250ms to reduce accidental pauses when quickly switching tabs (small)

## Unreleased
- Pause: show distinct overlay message when auto-paused vs user-paused (small accessibility/UX)

## Unreleased
- UI: colorize Lives HUD hearts for clearer at-a-glance status (small)

## Unreleased
- Accessibility: pause on window blur/visibility to avoid background execution and resume when focus returns (small)

## Unreleased
- Controls: accept uppercase A/D for left/right keys (small accessibility fix)

## Unreleased
- Pause: pause on pagehide to handle navigation away (small)

## Unreleased
- Mobile: hide redundant on-screen buttons on touch devices to prefer full-screen touch zones (small)

## Unreleased
- Accessibility: focus canvas on click to improve keyboard discoverability (small)

## Unreleased
- Accessibility: add aria-label and tabindex to canvas for keyboard and screen-reader users (small)

## Unreleased
- UI: pulse the Wave HUD when a new wave starts (small visual)

## Unreleased

- Accessibility: debounce visibilitychange auto-pause to avoid accidental pauses when quickly switching tabs (small)

## Unreleased

- UI: add subtle dashed touch-guide vertical line at 1/3 width for touch devices (small)

## Unreleased

- Accessibility: add aria-label to Play Again button so screen readers announce restart shortcut. (small)

## Unreleased

- Docs: read scripts/prompt.txt, suggestion.txt, and future.md to align priorities and roadmap. (small)

## Unreleased
- Chore: add short changelog entry for this iteration (small incremental improvement touching CHANGELOG.md)

## Unreleased
- Accessibility: focus overlay when auto-paused so screen readers are notified.

## Unreleased
- Accessibility: add aria-label to canvas for screen-reader clarity.

## Unreleased
- Accessibility: add 'R' keyboard shortcut to restart the game when it's over.

## Unreleased
- Accessibility: overlay now sets role=dialog and aria-modal when visible for improved screen-reader semantics.

## Unreleased
- UI: overlay now includes a contextual accessible message when paused or on game over.

## 1.29.0
- Pause: suspend AudioContext when auto-paused by blur/visibilitychange; resume on focus/visibility restore when appropriate.

## 1.28.0
- UI: add 'M' keyboard shortcut to toggle mute (persisted to localStorage).

## Unreleased
- Collaboration: expand `future.md` into a shared roadmap plus chat/notes document so LLM sessions can leave ideas, questions, and handoff notes.

## 1.27.0
- Code: declare `wavePulseUntil` to avoid implicit global when spawning waves.

## 1.26.0
- UI: briefly flash a "Wave X" banner when a new wave begins to make progression clearer.

## 1.25.0
- Removed implemented '! The controls for android ...' suggestion from suggestion.txt after adding touch-zone controls in js/game.js.

## 1.24.0
- Add subtle dashed touch-zone guide lines for mobile to make controls more discoverable.

## Unreleased
- Collaboration: `!` suggestion lines now mean do next if safe, then remove after they are materially used.

## 1.23.0
- UI: start first wave immediately on load so Wave counter reflects active gameplay.

## 1.22.0
- Fix: clear transient input keys on visibilitychange to avoid stuck controls when the page/tab is hidden.

## 1.21.0
- Perf: mark canvas pointerdown listener as passive to improve touch responsiveness (js/game.js)

## 1.20.0
- Chore: add short changelog entry for this iteration (small incremental improvement).

## 1.19.0
- Pause: when auto-paused by window blur/visibility loss, clear input keys to prevent stuck controls.

## 1.18.0
- Pause: clear input keys when auto-paused (prevents stuck controls on focus loss)

## 1.17.0
- Chore: add brief Unreleased entry describing this iteration's small change (CHANGELOG updated).

## 1.16.0
- Controls: clicking with a mouse now repositions the player to the clicked X coordinate (improves mouse control).

## 1.15.0
- Fix: ensure mouseup outside canvas clears firing state to avoid stuck fire when releasing the mouse outside the canvas.

## 1.14.0
- Allow clicking paused overlay to resume (accessible): clicking the overlay will unpause the game when paused and not game over.

## 1.13.0
- Stability: clamp animation frame delta (dt) to avoid large update steps after tab switches or long pauses.

## 1.12.0
- Chore: add short changelog entry for this iteration (updated CHANGELOG.md).

## 1.11.0
- Guard: avoid startup error when canvas #game is missing; script now aborts gracefully.

## 1.10.0
- Robustness: guard HUD updates against missing DOM elements to avoid runtime errors.

## 1.9.0
- Controls: add mouse pointer movement to control the player (move mouse to reposition player over canvas)

## 1.8.0
- UI: add dedicated accessible Wave counter in HUD (visible and announced to screen readers)

## 1.7.0
- Accessibility: announce pause/game-over overlay to screen readers by adding aria-live and role to #overlay in index.html

## 1.6.0
- Mobile: add simple touch zones (left/right edges to move, center to fire) and update in-game tip.

## Unreleased
- Collaboration: treat `suggestion.txt` as higher-priority guidance over time and use `future.md` as a living roadmap that any iteration may rewrite.
- Automation: make the batch `Implemented:` line show the actual `Change:` summary from Copilot output instead of the exploratory preamble.
- Automation: fix suggestion syncing so local suggestion edits can still upload when newer remote commits did not also change `suggestion.txt`, and make version syncing tolerate attributes on the version HUD.
- Automation: auto-merge trusted local and remote suggestion additions instead of stalling the loop on every shared `suggestion.txt` edit.
- Accessibility: announce HUD version to screen readers (added aria-live to #version)

## 1.5.0
- Accessibility: focus Play Again button on Game Over so keyboard and screen-reader users can restart the game more easily.

## 1.4.0
- Automation: sync `suggestion.txt` up and down with GitHub before each iteration, while pausing on conflicting local+remote edits instead of guessing.
- Images: rebalance daily image credits to allow up to 100 small images or 10 large backgrounds per day.
- Accessibility: announce score and lives updates to screen readers (aria-live)

## 1.3.0
- Safety: harden automation and validation against unsafe suggestions that try to access files, device/browser permissions, uploads, redirects, or background APIs.
- UI: show brief controls hint on startup (4s)

## 1.2.0
- Automation: replace `timeout` with a key-consuming pause helper so skipping the wait no longer leaves stray console input like `'ext'` behind.
- Automation: finalize changelog notes into real version headings on release so the newest versioned section stays at the top.
- UI: show lives as hearts in the HUD for clearer at-a-glance status.
- Audio: resume suspended AudioContext on first pointer or key gesture to improve sound playback reliability.
- Automation: allow plain suggestion lines to stay in `suggestion.txt` for multiple iterations and remove them only when they are fully used up.
- Collaboration: track `suggestion.txt` in git so trusted contributors can share and refine guidance through the repo.
- Automation: switch to daily-major versioning so each new day starts a new `N.x.0` release line while same-day improvements increment the middle number.
- UX: prevent page scrolling when using arrow keys or space to control the game (preventDefault on key events).
- Accessibility: added aria-label to mute button for screen-reader support.
- Automation: keep `+`-prefixed suggestion lines as persistent guidance while removing only one-time suggestions after implementation.
- UX: show resume hint on pause overlay ('Press P or Esc to resume').
- Automation: use a dedicated version-sync script so batch version bumps reliably update `VERSION`, `index.html`, and `js/game.js`.
- Automation: cap Cloudflare image generation at 5,000 Neurons/day (50 percent of the 10,000-Neuron free tier) with a conservative default per-image cost.
- Accessibility: add aria-label to mute button for screen-reader support.
- Fix: preserve batch command exit codes so failed tests or pushes actually stop the iteration and roll it back.
- UI: hide the overlay when not needed and make Play Again properly reset game state.
- Accessibility: add aria-labels to touch control buttons for screen-reader support.
- Reliability: fix startup resize handling so the game does not reference `player` before initialization.
- UI: added mute toggle button to enable/disable sound (persisted to localStorage).
- Pause: also handle document.visibilitychange to pause when the tab becomes hidden and resume only when appropriate.
- Visual: add small particle explosions on enemy destruction.
- Fix: sync in-game reported version to v0.1.30.
- UI: sync in-game reported version to v0.1.29.
- Accessibility: add Escape key to toggle pause/unpause (same as 'P').
- Pause: preserve user-initiated pause and only auto-resume when pause was caused by window blur; overlay aria-hidden updated accordingly.
- Accessibility: add 'P' key to toggle pause/unpause and sync overlay visibility.
- Fix: reposition player on window resize to keep the player anchored to the bottom and prevent off-screen positions.
- UI: sync in-game reported version to v0.1.23.
- Audio: resume suspended AudioContext on first user gesture so in-game sounds play reliably.
- UI: sync in-game reported version to v0.1.22.
- Audio: add simple WebAudio firing and hit sound effects using oscillators.
- Fix: show overlay when paused by correcting aria-hidden logic.
- Mobile: tapping the canvas now fires (touchstart/touchend), improving mobile controls.
- UI: synced in-game reported version to v0.1.18.
- UI: synced in-game reported version to v0.1.17.
- Fix: clamp lives at 0 to prevent negative lives when enemies pass the bottom.
- UI: synced in-game reported version to v0.1.14.
- Accessibility: debounce pause on window blur to avoid accidental pauses; do not auto-resume when game over.
- Automation: write a verbose rolling `selfmade.log` for diagnostics and trim it to the newest 200 lines each iteration.
- Automation: keep successful loop output very clean and show detailed logs only for errors or rollbacks.
- Automation: show a clear Waiting / Starting Improvement / Implemented / Tested / Released status flow in selfmade.bat.
- Automation: run startup smoke tests before commit and roll back failed iterations automatically instead of trying to debug them.
- Visual: add small gardening-themed pots along the ground and recolor player sprite to green.
- UI: add Play Again button on Game Over overlay so player can restart without reloading.
- Automation: allow future iterations to choose visible game changes, behind-the-scenes reliability work, and occasional `selfmade.bat` UI polish.
- Automation: surface the first-line improvement summary in a large on-screen banner and repeat it after publish.
- UI: synced in-game reported version to match index.html (v0.1.7).
- Automation: push the moving `last-good` tag separately so it updates cleanly without breaking successful releases.
- Automation: print a visible "Change made this iteration" summary in the batch loop after each Copilot pass.
- Accessibility: pause game on window blur/focus and show a paused overlay.
- Fixed the automation loop to use the current `gh copilot` wrapper syntax.
- Changed model verification to use live GitHub-hosted Copilot availability info instead of repo-local model flags.
- UI: display current wave number in the in-game HUD.
- UI: update HUD lives counter to show remaining lives.
- UI: sync in-game displayed version to match index.html (now v0.1.6).
- UI: synced game.js reported version to v0.1.6 to keep HUD consistent with index.html.

## 0.1.0 - Initial minimal playable game
- Player at bottom, waves of enemies, cartoony art.
- Hybrid controls: keyboard + touch.
- selfmade.bat for automated publish loop (bump version, commit, push, publish to GitHub Pages).

- TEMP cleanup test
