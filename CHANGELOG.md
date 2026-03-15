# Changelog

## Unreleased
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



