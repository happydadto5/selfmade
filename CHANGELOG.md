# Changelog

## Unreleased
- Automation: print a visible "Change made this iteration" summary in the batch loop after each Copilot pass.
- Accessibility: pause game on window blur/focus and show a paused overlay.
- Fixed the automation loop to use the current `gh copilot` wrapper syntax.
- Changed model verification to use live GitHub-hosted Copilot availability info instead of repo-local model flags.
- UI: display current wave number in the in-game HUD.

## 0.1.0 - Initial minimal playable game
- Player at bottom, waves of enemies, cartoony art.
- Hybrid controls: keyboard + touch.
- selfmade.bat for automated publish loop (bump version, commit, push, publish to GitHub Pages).
