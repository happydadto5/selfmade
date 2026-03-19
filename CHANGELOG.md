# Changelog

## 5.33.0
- Visual/UI: add subtle drifting cloud layer to background and improve hit atmosphere (tiny) — 2026-03-19

## 5.32.0
- Visual: brief white canvas flash when an enemy is hit to improve hit feedback (tiny) — 2026-03-19

## 5.31.0
- Visual: add a stronger shield bubble when the Shield power-up is active so the player can easily notice invulnerability (tiny) — 2026-03-19

## 5.30.0
- 2026-03-19: Slightly increased shield power-up spawn frequency to make Shields more discoverable during play (small gameplay improvement).

## 5.29.0
- Stability: debounce high-score saves to reduce frequent localStorage writes (tiny) — 2026-03-19

## 5.28.0
- Gameplay: play shield chime when collecting Shield power-up for clearer feedback (tiny) — 2026-03-19

## 5.27.0
- UI: update browser title to include current wave and score for quicker visibility (tiny) — 2026-03-19

## 5.26.0
- Gameplay: add a small 'weevil' enemy that occasionally darts toward the player for extra variety (tiny) — 2026-03-19

## 5.25.0
- Roadmap refreshed (future.md) and meta-review performed; planned next visible change: add a simple Shield power-up and one small enemy behavior to boost variety (meta-check 2026-03-19).

## 5.24.0
- Visual/UI: increase hit marker size and add soft fill for stronger hit feedback (tiny) — 2026-03-19

## 5.23.0
- UI: show wave progress percentage in HUD so players can see at-a-glance how close a wave is (tiny) — 2026-03-19

## 5.22.0
- Gameplay: increase zig/hopper spawn rate to make enemy variety more noticeable (tiny) — 2026-03-19

## 5.21.0
- Visual/UI: improve pause overlay readability with subtle backdrop, padding, and rounded corners for better mobile contrast (tiny) — 2026-03-19

## 5.20.0
- Visual/UI: add subtle backdrop behind compact in-canvas HUD for improved readability (tiny) — 2026-03-19

## 5.19.0
- Levels: award 1 extra life every 5 waves to reinforce progression (small) — 2026-03-19

## 5.18.0
- Gameplay: telegraph charger enemy charge with a pulsing warning icon so players can react (tiny) — 2026-03-19

## 5.17.0
- Stability: pause on pagehide/navigation to ensure backgrounded sessions are paused reliably (tiny) — 2026-03-19

## 5.16.0
- Visual/UI: improve HUD readability with a slightly stronger backdrop and text-shadow for better contrast (tiny) — 2026-03-19

## 5.15.0
- Levels/UI: show remaining enemies for the current wave in the HUD (e.g. "3/10 left") for clearer progression feedback — 2026-03-19

## 5.14.0
- Visual: add brief glowing ring around player when collecting a power-up for more satisfying feedback (tiny) — 2026-03-19

## 5.13.0
- Stability: guard refreshVersionHUD against missing autoPauseEnabled to avoid early startup ReferenceError (tiny) — 2026-03-19

## 5.12.0
- Visual: strengthen hit marker visibility with a brighter yellow glow and slightly larger marker for clearer hit feedback (tiny) — 2026-03-19

## 5.11.0
- Levels: show countdown until next wave during inter-wave delay so players know when the next wave starts (tiny) — 2026-03-19

## 5.10.0
- Gameplay: add new "ladybug" enemy — medium HP with occasional lateral hops for visible variety (tiny) — 2026-03-19

## 5.9.0
- Fix: prevent duplicate HUD toggle from H key handler (stability) — 2026-03-19

## 5.8.0
- Levels: show brief 'Wave X cleared' toast and ARIA announcement when a wave finishes (tiny) — 2026-03-19

## 5.7.0
- Visual: add subtle parallax leaf background for stronger atmosphere (tiny) — 2026-03-19

## 5.6.0
- Reliability: clear transient inputs on focusout/blur to avoid stuck movement or firing when focus shifts (small) — 2026-03-19

## 5.5.0
- Gameplay: increase Shield power-up duration from 12s to 14s so pickups feel slightly more impactful (tiny) — 2026-03-19

## 5.4.0
- UI: show active power-up icon on touch-fire button for better mobile discoverability (tiny) — 2026-03-19

## 5.3.0
- Visual: add subtle petal rotation to enemy-death particles for livelier feedback (tiny) — 2026-03-19

## 5.2.0
- Visual: add small explosion particle burst on enemy death for clearer feedback (tiny) — 2026-03-19

## 5.1.0
- UI: make active power-up HUD more visible with subtle badge background and border (tiny) — 2026-03-19

## 5.0.0
- Visual: add brief radial hit glow on enemy hits for clearer feedback (tiny) — 2026-03-19

## 4.10.0
- Levels: show compact in-canvas wave & remaining-enemies indicator when HUD is hidden (small)

## 4.9.0
- UI: add subtle translucent backdrop blur and improved HUD background for better readability (tiny) — 2026-03-19

## 4.8.0
- Visual: add brief hit markers on enemy hits for clearer feedback (tiny) — 2026-03-19

## 4.7.0
- Visual: add subtle animated background gradient to canvas (tiny) — 2026-03-19

## 4.6.0
- UI: pre-render wave progress bar in HUD for reduced layout shift and improved readability (tiny) — 2026-03-19

## 4.5.0
- Gameplay: add rare Pierce power-up that lets bullets pierce enemies for 12s (tiny) — 2026-03-19

## 4.4.0
- UI: add a small visual wave progress bar in the HUD showing defeated/total enemies (tiny) — 2026-03-19
- Gameplay: increase Rapid power-up duration from 12s to 15s so pickups feel more impactful — 2026-03-19
- Gameplay: increase Rapid power-up potency to 3x fire rate (more impactful) — 2026-03-19
- Automation: slow the loop pause to 7 minutes and add a 20-release Android UI review cadence that can capture a phone-sized screenshot and feed up to two future.md UI ideas into the roadmap.
- Accessibility: announce shield absorption to screen readers so players using assistive tech hear when their shield prevents a life loss (tiny) — 2026-03-18
- Gameplay: sprout enemies now gently bob and occasionally shed leaf particles for livelier visuals (tiny) — 2026-03-18
- Gameplay: pest-mini now wobble slightly for livelier visuals (tiny) — 2026-03-18
- Gameplay: slightly increase power-up drop rate so pickups spawn more often (tiny) — 2026-03-18
- Gameplay: add subtle screen shake when collecting power-ups to improve feedback (tiny) — 2026-03-18
- Accessibility: announce Rapid power-up collection to screen readers (tiny) — 2026-03-18
- Gameplay: slightly increase default projectile speed for a snappier weapon feel (tiny) — 2026-03-18
- Visual: show remaining seconds above player while Rapid is active and enhance glow (tiny) — 2026-03-18
- Audio: add a soft shield chime that plays when a shield absorbs damage (tiny) — 2026-03-18
- Gameplay: add Bomb power-up that clears nearby enemies when collected (tiny) — 2026-03-18
- Visual: make shield ring pulse to show remaining time and improve visibility (tiny) — 2026-03-18
- Visual: add a subtle rapid-fire glow around the player while Rapid power-up is active so the effect is clearer (tiny) — 2026-03-18
- Gameplay: increase power-up duration to 12s so pickups feel more impactful (tiny) — 2026-03-18
- Gameplay: small chance for extra-life power-up to spawn from defeated enemies (tiny) — 2026-03-18
- Visual: charger enemies now show a visible warning triangle while charging so players can react (tiny) — 2026-03-18
- Gameplay: add a slow 'snail' enemy type (larger, more HP, slow-moving with gentle wiggle) — 2026-03-18
- Gameplay: increase power-up collection radius so pickups are easier to collect (tiny) — 2026-03-18
- Gameplay: Increase power-up durations from 6s to 9s so pickups feel more useful (tiny) — 2026-03-18
- Gameplay: increase power-up lifetime to 9s so pickups are easier to collect (tiny) — 2026-03-18
- Fix: active power-up HUD was incorrectly hidden by inline style; now shows collected power-ups (tiny) — 2026-03-18
- Gameplay: Rapid power-up now increases projectile speed for a snappier feel (tiny) — 2026-03-18
- Accessibility: announce collected power-ups to screen readers (tiny) — 2026-03-18
- UI: clarify touch hint toast copy for touch users so controls read more clearly (tiny) — 2026-03-18
- Visual: power-up icons now reflect type (⚡ Rapid, 🛡 Shield) so players can identify pickups more quickly (tiny) — 2026-03-18
- Gameplay: add shield power-up that absorbs one life loss while active and shows a shield ring around the player (tiny) — 2026-03-18
- Gameplay: show transient '+1' floating popup and small particles when a bullet damages but does not kill an enemy (tiny) — 2026-03-18
- Visual/UI: make power-ups more noticeable by adding a subtle pulsing ring around spawned power-ups (tiny) — 2026-03-18
- Gameplay: add brief hit-stop (freeze-frame) on enemy hit to improve combat feel (tiny) — 2026-03-18
- Feedback: add small screen shake, hit sound, and short vibration when enemies are damaged to improve combat feel (tiny) — 2026-03-18
- Gameplay: increase power-up spawn chance to 38% so power-ups appear more often (tiny) — 2026-03-18
- Gameplay: show small enemy health bars for multi-HP enemies to improve combat clarity (tiny) — 2026-03-18
- Gameplay: add Spread power-up (temporary 3-shot spread for 6s) — 2026-03-18
- UI: show active power-up badge in HUD with remaining time (tiny) — 2026-03-18
- Gameplay: add Life power-up that grants +1 life when collected (tiny) — 2026-03-18
- Gameplay: add Vine power-up (🍃) that briefly slows enemies for 6s (tiny) — 2026-03-18
- Gameplay: add pest enemy that splits into two mini pests on death (tiny) — 2026-03-18
- Gameplay: pest now splits into two mini-pests on death (tiny) — 2026-03-18
- Gameplay: add a fast 'bee' enemy that homes slightly toward the player for more lively challenge (tiny) — 2026-03-18
- Gameplay: add a 'moth' enemy type with sinuous horizontal motion for visual variety (tiny) — 2026-03-18
- Gameplay: add a 'sprout' enemy (small garden sprout, low HP, green-themed) — 2026-03-18

## 4.2.0
- Visual/UI: add subtle background gradient and improve HUD contrast for better readability (tiny) — 2026-03-18
- Automation: fix `selfmade.bat` launcher persistence so the top-level batch process stays alive, reloads itself safely between iterations, and no longer dies on the old re-exec path.
- Automation: replace fragile startup status reads in `selfmade.bat` so cleanup/sync status logging no longer throws batch parsing errors during startup.
- Automation: normalize `CHANGELOG.md` to a single top `## Unreleased` section so changelog prep stops drifting into malformed duplicate sections.

- Visual: add a brief enemy-hit flash when bullets strike enemies to improve feedback (tiny) — 2026-03-17
- Gameplay: add a new zigging "hopper" enemy that oscillates horizontally for gameplay variety (tiny) — 2026-03-18
- Automation: rotate each iteration through gameplay, levels, visual/UI, and stability focus lanes so the loop delivers a healthier mix of visible and behind-the-scenes work.
- Automation: selfmade.bat now stays alive as a small launcher and runs each cycle as a fresh child invocation so updated batch logic is picked up without the process silently dying after a re-exec handoff.
- Automation: poll the full repo for remote changes each iteration so pushed fixes do not sit unseen while the local poller is already running.

- Automation: add a self-tuning process review that analyzes recent changelog history, nudges the prompt toward visible work when needed, and records a lightweight roadmap/process checkpoint about every 10 successful releases.
- Automation: bias future iterations toward more noticeable gameplay/UI progress when recent changelog history has been dominated by tiny polish, accessibility, or roadmap-only updates.
- Accessibility: pause on blur/visibility; improved auto-pause debounce; screen-reader announcements (small).

- Collaboration: update guidance so `future.md` changes only when it adds meaningful roadmap or collaboration value, not on most loops.

- Automation: reduce the self-evolving loop delay from 5 minutes to 1 minute.
- Automation: clean up unfinished prior-iteration files at startup before starting a new loop, while preserving collaborator-managed files like `suggestion.txt`.
- Chore: read scripts/prompt.txt, suggestion.txt, and future.md; added small changelog entry (2026-03-16)
- Perf: debounce window resize handler to reduce layout thrash on rapid resizes (small)
- UI: add z-index to overlay so pause/game-over overlay sits above other UI elements (small)

- UI: allow clicking the overlay when game over to restart the game (small)

- Accessibility: focus canvas after unpausing via overlay so keyboard users regain control (small)

- UI: add aria-live to Wave HUD for screen-reader announcements (small)

- Fix: clear input on pointercancel/touchcancel to avoid stuck controls when touches are cancelled (small)

- Accessibility: pause on window blur/visibility and resume on focus (small)

- UI: improve touch-guide contrast for touch devices (small)

- Chore: add short changelog entry for this iteration (2026-03-16) ΓÇö verified auto-pause/visibility debounce and input-clearing (small)

- Accessibility: add tabindex and aria-label to the main canvas for keyboard and screen-reader users (small)

- Fix: persist high score when the game ends so a final score is saved (small)

- UI: colorize Lives HUD hearts using accessible DOM spans (small)

- Accessibility: focus canvas on resume when returning to the page so keyboard users regain control (small)

- Tweak: increase auto-pause debounce from 150ms to 250ms to reduce accidental pauses when quickly switching tabs (small)

- Pause: show distinct overlay message when auto-paused vs user-paused (small accessibility/UX)

- UI: colorize Lives HUD hearts for clearer at-a-glance status (small)

- Accessibility: pause on window blur/visibility to avoid background execution and resume when focus returns (small)

- Controls: accept uppercase A/D for left/right keys (small accessibility fix)

- Pause: pause on pagehide to handle navigation away (small)

- Mobile: hide redundant on-screen buttons on touch devices to prefer full-screen touch zones (small)

- Accessibility: focus canvas on click to improve keyboard discoverability (small)

- Accessibility: add aria-label and tabindex to canvas for keyboard and screen-reader users (small)

- UI: pulse the Wave HUD when a new wave starts (small visual)

- Accessibility: debounce visibilitychange auto-pause to avoid accidental pauses when quickly switching tabs (small)

- UI: add subtle dashed touch-guide vertical line at 1/3 width for touch devices (small)

- Accessibility: add aria-label to Play Again button so screen readers announce restart shortcut. (small)

- Docs: read scripts/prompt.txt, suggestion.txt, and future.md to align priorities and roadmap. (small)

- Chore: add short changelog entry for this iteration (small incremental improvement touching CHANGELOG.md)

- Accessibility: focus overlay when auto-paused so screen readers are notified.

- Accessibility: add aria-label to canvas for screen-reader clarity.

- Accessibility: add 'R' keyboard shortcut to restart the game when it's over.

- Accessibility: overlay now sets role=dialog and aria-modal when visible for improved screen-reader semantics.

- UI: overlay now includes a contextual accessible message when paused or on game over.

- Collaboration: expand `future.md` into a shared roadmap plus chat/notes document so LLM sessions can leave ideas, questions, and handoff notes.

- Collaboration: `!` suggestion lines now mean do next if safe, then remove after they are materially used.

- Collaboration: treat `suggestion.txt` as higher-priority guidance over time and use `future.md` as a living roadmap that any iteration may rewrite.
- Automation: make the batch `Implemented:` line show the actual `Change:` summary from Copilot output instead of the exploratory preamble.
- Automation: fix suggestion syncing so local suggestion edits can still upload when newer remote commits did not also change `suggestion.txt`, and make version syncing tolerate attributes on the version HUD.
- Automation: auto-merge trusted local and remote suggestion additions instead of stalling the loop on every shared `suggestion.txt` edit.
- Accessibility: announce HUD version to screen readers (added aria-live to #version)

## 4.1.0
- Gameplay: add a small Rapid Fire power-up that temporarily doubles firing rate when collected (tiny) — 2026-03-18

## 4.0.0
- Levels: add a short recovery delay between waves so players get a brief respite before the next wave (tiny) — 2026-03-18

## 3.6.0
- Gameplay: add a new 'charger' enemy that drifts toward the player and occasionally charges downward (tiny) — 2026-03-18

## 3.4.0
- UI: add Wave progress indicator in HUD showing defeated/total enemies for current wave (tiny) — 2026-03-17

## 3.3.0
- UI: mention 'G' garden-grid toggle in help overlay and hidden game description.

## 3.2.0
- UX: Add small on-canvas FPS counter for visibility and debugging (tiny) — 2026-03-17

## 3.1.0
- UX: Add full-screen touch-zone split: left 25% and right 25% now act as continuous left/right move zones; center 50% remains move-to-and-hold-to-fire. Announce and briefly show touch guides on first touch. — 2026-03-17

## 3.0.0
- Fix: restore CHANGELOG.md text header so batch prepare_changelog no longer loops on an empty file.
- Controls: Android touch now repositions the player on any bottom-half tap, and holding on the bottom half keeps firing until release; touch guides were updated to teach the new gesture.
- UI: Add toggleable garden grid overlay (press G) for aiming/visual variety (tiny) — 2026-03-17
- Automation: pass a recent failure hint into the Copilot prompt so repeated rollback patterns like the Unexpected token 'catch' loop are less likely to repeat.
- Automation: !! suggestions now require three future.md collaboration passes before implementation; the batch loop computes and passes the staged status into the Copilot prompt each cycle.

## 2.188.0
- UX: Improve touch-zone discoverability: slightly stronger dashed separators and longer guide visibility on first touch (tiny) ΓÇö 2026-03-16

## 2.187.0
- UI: Show current wave number in pause overlay for clarity (tiny) ΓÇö 2026-03-16

## 2.186.0
- Add subtle screen-shake when a new wave starts (small visual polish) ΓÇö 2026-03-16

## 2.185.0
- UX: Show touch-zone guides on narrower screens (>=240px) to improve mobile discoverability (tiny) ΓÇö 2026-03-16

## 2.184.0
- Docs: tidy suggestion.txt formatting (trim blank lines/whitespace) (tiny) ΓÇö 2026-03-16

## 2.183.0
- UX: When pressing 'T' to preview touch guides, in-canvas separators and pulse now also appear (tiny).

## 2.182.0
- UI: Clarify hidden game description to explicitly document full-screen touch zones (left 25% = left, center 50% = fire, right 25% = right) to improve assistive-tech discoverability (tiny).

## 2.181.0
- UX: Add a brief touch-discovery hint shown on first touch to improve mobile discoverability (tiny) ΓÇö 2026-03-16

## 2.180.0
- UX: Clarify help overlay to include touch controls hint (tiny) ΓÇö 2026-03-16

## 2.179.0
- UI: slightly increase canvas HUD background opacity for improved readability on busy scenes (tiny) ΓÇö 2026-03-16

## 2.178.0
- UI: Add Recent changes entry so the in-game Changes overlay reflects this iteration (tiny) ΓÇö 2026-03-16

## 2.177.0
- Accessibility: announce auto-pause to assistive tech when window loses focus (tiny) ΓÇö 2026-03-16

## 2.176.0
- UX: Add transient touch hint toast styling to improve discoverability on touch devices (tiny) ΓÇö 2026-03-16

## 2.175.0
- UX: Show on-screen touch buttons briefly when pressing T to preview touch zones (tiny) ΓÇö 2026-03-16

## 2.174.0
- UI: Add a brief muzzle flash when firing to improve feedback for taps and key/mouse fire (tiny) ΓÇö 2026-03-16

## 2.173.0
- UI: Tweak #ui (increase font-size, padding, and background contrast for improved readability) (tiny)
- UX: Clarify touch hint wording for first-time touch users (tiny) ΓÇö 2026-03-16

## 2.172.0
- Docs: add a short Unreleased bullet noting a tiny changelog update (this iteration).

## 2.169.0
- UX: show transient touch-controls hint toast on first touch to clarify full-screen touch zones (tiny)

## 2.168.0
- UX: pulse the center fire guide briefly after first touch to improve discoverability (tiny)

## 2.167.0
- UX: show subtle dashed guide line and low-contrast touch-zone overlays on first touch to improve mobile discoverability (tiny)

## 2.166.0
- UI: show enemies remaining in HUD (tiny)

## 2.165.0
- Accessibility: increase auto-pause debounce to 450ms to reduce accidental pauses (tiny)

## 2.164.0
- Accessibility: Announce auto-pause to assistive tech when the page loses focus or visibility to improve screen-reader feedback (tiny)

## 2.171.0
- UX: Added discoverable full-screen touch zones (left 25% = move left, center 50% = fire, right 25% = move right) using pointer events; shows subtle dashed guides on first touch (tiny)
- UX: Show a subtle horizontal dashed guide near the top third of the screen when touch is detected to improve discoverability of full-screen touch zones (tiny)
- Accessibility: Announce transient touch hint toast to assistive tech (aria-live) so screen readers inform first-time touch users (tiny)

## 2.163.0
- UI: slightly larger center touch fire dot for better discoverability on mobile (tiny)

## 2.162.0
- UI: dim canvas when auto-paused to make paused state more visually obvious (tiny)

## 2.161.0
- UX: briefly reveal on-screen touch buttons on first touch for discoverability (tiny)

## 2.160.0
- UI: show floating '+10' score popups when enemies are destroyed (small, visible polish)

## 2.159.0
- UI: add subtle highlight behind Wave HUD when new wave starts to improve visibility (tiny)

## 2.158.0
- UX: add keyboard shortcut 'T' to briefly show touch-zone guides for preview (tiny)

## 2.157.0
- UX: increase touch-guide duration to 7s for better mobile discoverability (tiny)

## 2.156.0
- UX: improve touch-guide reliability on first touch so dashed guides show consistently across touch/pointer events (tiny)

## 2.155.0
- UX: touch hint: center zone shows a subtle dot icon instead of text for clearer mobile discovery (tiny)

## 2.154.0
- UX: show vertical touch-zone separators when touch detected to make mobile touch zones clearer (tiny) ΓÇö 2026-03-16

## 2.149.0
- UI: add subtle drop shadow to canvas HUD and wave banner for improved readability on busy backgrounds (tiny)

## 2.148.0
- UX: show thin dashed guide line near the top third of the canvas when touch is detected to reveal touch zones (tiny) ΓÇö 2026-03-16

## 2.147.0
- Accessibility: announce new wave number via ARIA live region (tiny) ΓÇö 2026-03-16

## 2.146.0
- UI: increase Wave HUD font size slightly for readability (tiny) ΓÇö 2026-03-16

## 2.145.0
- Accessibility: clarify paused message when auto-paused due to focus loss (tiny) ΓÇö 2026-03-16

## 2.144.0
- UX: show live "New high score!" badge and play chime when player surpasses previous high score (tiny) ΓÇö 2026-03-16

## 2.143.0
- Accessibility/UX: prevent touch scrolling during gameplay by setting canvas touch-action to 'none' (tiny)

## 2.142.0
- UX: improve visibility of touch-zone guide lines shown after first touch (tiny)

## 2.141.0
- UX: improve touch-guide detection to also handle pointerdown events on touch devices (tiny) ΓÇö 2026-03-16

## 2.140.0
- Roadmap: add last-updated timestamp to future.md and note suggestion handling (tiny) ΓÇö 2026-03-16

## 2.139.0
- Accessibility: allow Enter/Space to toggle Auto-Pause button for keyboard users (tiny) ΓÇö 2026-03-16

## 2.138.0
- UI: improve Wave HUD visibility ΓÇö increased contrast and font size for the Wave counter (tiny) ΓÇö 2026-03-16

## 2.137.0
- UX: add pointer-event support for touch/pen to map full-screen touch zones (left 25% move left, center fire, right 25% move right) (tiny) ΓÇö 2026-03-16

## 2.136.0
- Roadmap: captured mobile-first garden guidance in future.md (tiny) ΓÇö 2026-03-16

## 2.135.0
- Accessibility: honor prefers-reduced-motion by reducing non-essential animations and transitions (tiny) ΓÇö 2026-03-16

## 2.134.0
- Accessibility: focus Resume button when overlay appears for pause so keyboard and touch users can quickly resume (tiny) ΓÇö 2026-03-16

## 2.133.0
- Accessibility: increase auto-pause debounce to 350ms to reduce accidental pauses (tiny) ΓÇö 2026-03-16

## 2.132.0
- Accessibility: clarify pause-on-blur overlay message to include tap for touch users (tiny) ΓÇö 2026-03-16

## 2.131.0
- UI: include current score in document title while playing so tab shows score (tiny) ΓÇö 2026-03-16

## 2.130.0
- Accessibility: add focus styles for Auto-Pause button to improve keyboard focus visibility (tiny) ΓÇö 2026-03-16

## 2.129.0
- UI: sync Auto-Pause button when toggled via keyboard (O) so HUD updates immediately (tiny)

## 2.128.0
- Accessibility: keep HUD aria-hidden in sync when toggling HUD visibility so screen readers reflect the change (tiny) ΓÇö 2026-03-16

## 2.127.0
- Accessibility: increase auto-pause debounce to 300ms to reduce accidental pauses (tiny) ΓÇö 2026-03-16

## 2.125.0
- Accessibility: add colorblind-mode toggle (press C) ΓÇö small ΓÇö 2026-03-16

## 2.124.0
- Accessibility: add 'auto-paused' body class when auto-paused due to focus/visibility to enable CSS hooks for paused state (tiny) ΓÇö 2026-03-16

## 2.123.0
- Accessibility: respect Auto-Pause preference when auto-resuming on focus/visibility (tiny) ΓÇö 2026-03-16

## 2.122.0
- UI: improve overlay layout and contrast for paused/game-over panel (tiny) ΓÇö 2026-03-16

## 2.121.0
- UX: show dashed touch-zone guides only briefly after the first touch (mobile) ΓÇö tiny ΓÇö 2026-03-16

## 2.120.0
- Gameplay: start new wave immediately when restarting so players don't wait (tiny) ΓÇö 2026-03-16

## 2.119.0
- UI: add Auto-Pause toggle button to HUD for quick accessibility toggling (tiny) ΓÇö 2026-03-16

## 2.118.0
- Accessibility: respect prefers-reduced-motion by disabling screen shake (tiny) ΓÇö 2026-03-16

## 2.117.0
- UI: add .paused body class when overlay is visible to enable CSS hooks for paused state (tiny)

## 2.116.0
- Accessibility: allow pointer/click to resume when auto-paused due to focus loss (small)

## 2.115.0
- Accessibility: announce wave number to assistive tech when a new wave starts (tiny) ΓÇö 2026-03-16

## 2.114.0
- UX: increase transient tip display from 4s to 6s to improve discoverability on mobile and touch devices (tiny)

## 2.112.0
- Fix: avoid keybinding conflict by reserving H for HUD toggle and I for Help; H no longer opens Help (tiny) ΓÇö 2026-03-16

## 2.111.0
- Accessibility: add H key as alternate help toggle (small) ΓÇö 2026-03-16

## 2.110.0
- UI: add Resume button to overlay for easier resume on touch and accessibility (tiny) ΓÇö 2026-03-16

## 2.109.0
- UI: initialize HUD on load so Lives and Wave counters show current values and ARIA attributes are set (tiny) ΓÇö 2026-03-16

## 2.108.0
- Accessibility: clear transient input state when manually pausing to avoid stuck controls (tiny)

## 2.107.0
- UX: show clearer touch-zone guide lines at 25% and 75% on touch devices to match in-canvas guides (tiny) ΓÇö 2026-03-16

## 2.106.0
- Accessibility: increase auto-pause debounce to 200ms to reduce accidental pauses ΓÇö 2026-03-16

## 2.105.0
- UX: show dashed touch guide briefly after first touch to keep screen uncluttered (tiny) ΓÇö 2026-03-16

## 2.104.0
- UI: add subtle translucent background, padding, and rounded corners to the #ui HUD for improved contrast and readability ΓÇö 2026-03-16

## 2.103.0
- Accessibility: clarify auto-pause overlay message to include Space/click resume hint (tiny) ΓÇö 2026-03-16

## 2.102.0
- Accessibility: fix Auto-Pause toggle aria-pressed state to reflect current setting (tiny) ΓÇö 2026-03-16

## 2.101.0
- Accessibility: visible focus ring for interactive controls (mute/help/changes/replay/touch) (tiny) ΓÇö 2026-03-16

## 2.100.0
- Add Auto-pause toggle button to the in-game UI and announce state to assistive tech (tiny) ΓÇö 2026-03-16

## 2.99.0
- Help overlay: include keys O (auto-pause), M (mute), and C (colorblind) in help text for discoverability (tiny) ΓÇö 2026-03-16

## 2.98.0
- Accessibility: respect prefers-reduced-motion for HUD pulse animations (tiny) ΓÇö 2026-03-16

## 2.97.0
- Acknowledge suggestion.txt persistent garden-theme guidance; captured into future.md (tiny) ΓÇö 2026-03-16

## 2.96.0
- Add refreshVersionHUD helper and call it when toggling auto-pause to update the HUD (tiny) ΓÇö 2026-03-16

## 2.95.0
- Accessibility: reduce auto-pause debounce to 120ms for snappier resume (tiny) ΓÇö 2026-03-16

## 2.94.0
- UI: add M/O keyboard hints to on-screen tip for quicker discovery (tiny) ΓÇö 2026-03-16

## 2.93.0
- Accessibility: mark autopause announcer aria-atomic for reliable screen reader announcements (tiny) ΓÇö 2026-03-16

## 2.92.0
- Accessibility: reduce auto-pause debounce to 220ms for snappier resume (tiny) ΓÇö 2026-03-16

## 2.91.0
- Accessibility: make 'Changes' button keyboard accessible (role, tabindex, Enter/Space activation) (small) ΓÇö 2026-03-16

## 2.90.0
- Accessibility: make mute button keyboard-accessible (role + key activation) (small) ΓÇö 2026-03-16

## 2.89.0
- Avoid auto-pausing while pointer/touch is active to prevent interruptions during touch-hold (small) ΓÇö 2026-03-16

## 2.88.0
- Accessibility: add descriptive aria-describedby for game canvas to help screen reader users (small)

## 2.87.0
- Accessibility: announce new high score to assistive tech when a run ends (small)

## 2.86.0
- Accessibility: focus game canvas on pointer interaction so keyboard controls work after tap/click (small) ΓÇö 2026-03-16

## 2.85.0
- Fix: remove redundant focus handler to avoid duplicate overlay messages on resume (small) ΓÇö 2026-03-16

## 2.84.0
- Accessibility: resume suspended audio when user unpauses via overlay (small)

## 2.83.0
- Reliability: clear global pointercancel to avoid stuck controls on some devices (small)

## 2.82.0
- UI: show auto-pause state in version HUD so players can see whether auto-pause is enabled (small)

## 2.81.0
- Persist auto-pause preference in localStorage (toggle O) (small)

## 2.80.0
- Add 'O' key to toggle auto-pause on blur/visibility (accessibility preference)

## 2.79.0
- Accessibility: allow Space to resume when paused (keyboard convenience) (small)

## 2.78.0
- Accessibility: centralize auto-pause debounce constant and use it for blur/visibility handlers (small)

## 2.77.0
- Accessibility: add hidden live region to announce life changes to assistive tech (small)

## 2.76.0
- UI: Larger life hearts in HUD for better visibility (small)

## 2.75.0
- UI: improved canvas HUD background and pulsing when wave or life changes (small)

## 2.74.0
- Fix: remove redundant focus handler to avoid duplicate overlay messages on resume (small)

## 2.73.0
- Accessibility: announce life loss to assistive tech when player loses a life (small)

## 2.72.0
- UI: add "Changes" button to view recent changelog entries in-game (small)

## 2.71.0
- Cap enemy spawn speed to keep waves beatable (small)

## 2.70.0
- Accessibility: pause on blur/visibility with short debounce; suspend/resume audio and announce overlay for screen readers (small)

## 2.69.0
- UI: increase Wave HUD font-size for better readability (small)

## 2.68.0
- Add visual feedback (particles and small screen shake) when player loses a life (small)

## 2.67.0
- Add help overlay toggled with I key and Help button; displays basic controls and closes with I, Escape, or click (small)

## 2.66.0
- Accessibility: add a colorblind-friendly palette toggle (press C) and persist preference (small)

## 2.65.0
- Mobile: show a low-contrast dashed guide line near the top third of the screen when touch input is detected (small)

## 2.64.0
- Accessibility: add 'S' as an alternate key to toggle sound (small)

## 2.63.0
- UX: show keyboard restart hint on canvas when game is over (press R) (small)

## 2.62.0
- Roadmap: expand mobile touch guidance in future.md to capture full-screen touch-zone details (left 25% move left, right 25% move right, center 50% fire) ΓÇö small

## 2.61.0
- UI: add HUD toggle (press H) to hide/show DOM HUD for distraction-free play (small)

## 2.60.0
- Fix: update overlayMessage safely on window focus to avoid replacing the DOM element and potential runtime errors (small)

## 2.59.0
- Fix: remove duplicate blur handler that overwrote overlayMessage and could cause runtime errors when focus is lost (small) ΓÇö 2026-03-16

## 2.58.0
- Accessibility: pause game on window blur; show overlay hint (small) ΓÇö 2026-03-16

## 2.57.0
- Accessibility: show focus outline on canvas when focused to improve keyboard discoverability (small) ΓÇö 2026-03-16

## 2.56.0
- Accessibility: announce mute button state changes to assistive tech using aria-live (small) ΓÇö 2026-03-16

## 2.55.0
- Accessibility: clear overlay message on auto-resume to avoid stale ARIA announcements (small) ΓÇö 2026-03-16

## 2.54.0
- Audio: play short chime on new wave start (small) ΓÇö 2026-03-16

## 2.53.0
- Accessibility: include current wave in document title while playing so users notice progress when tabbed away (small) ΓÇö 2026-03-16

## 2.52.0
- UI: draw HUD on canvas showing Wave and Lives (small) ΓÇö 2026-03-16

## 2.51.0
- Visual: improve canvas rendering for high-DPI displays (use devicePixelRatio scaling) to make graphics crisper (small) ΓÇö 2026-03-16

## 2.50.0
- Pause: clear pending blur timeout on pagehide to avoid stray timers (small) ΓÇö 2026-03-16

## 2.49.0
- UI: pulse Wave HUD when a new wave starts (small) ΓÇö 2026-03-16

## 2.48.0
- UI: adjust dashed touch-guide line to 1/3 width (small) ΓÇö 2026-03-16

## 2.47.0
- Accessibility: set overlay role to dialog and include aria-modal when overlay is toggled for clearer screen-reader semantics (small) ΓÇö 2026-03-16

## 2.46.0
- UI: slightly increase overlay message font-size for better readability (small) ΓÇö 2026-03-16

## 2.45.0
- Robustness: guard localStorage reads/writes with try/catch so the game works when localStorage is unavailable; defaults to sensible values (small) ΓÇö 2026-03-16

## 2.44.0
- UI: adjust touch-guide dashed line to left 25% to better match touch-zone layout (small)

## 2.43.0
- Docs: clean up suggestion.txt wording for readability (small) ΓÇö 2026-03-16

## 2.42.0
- Chore: read scripts/prompt.txt, suggestion.txt, and future.md; add short changelog entry (2026-03-16)

## 2.41.0
- Chore: allow pen (stylus) pointer to reposition player on pointermove so pen users can drag the player (small) ΓÇö 2026-03-16

## 2.40.0
- Accessibility: ensure pause on blur/visibility clears inputs and suspends audio; resume on focus (small)

## 2.39.0
- Fix: robustly parse persisted high score to avoid NaN when localStorage contains invalid value (small)

## 2.38.0
- Visual: add subtle screen shake on enemy destruction (small visual effect)

## 2.37.0
- Pause: clear pending blur/visibility auto-pause timer on unload to avoid stray timeouts (small)

## 2.36.0
- Accessibility: guard overlay message against undefined waveNumber to avoid 'undefined' appearing (small) ΓÇö 2026-03-16

## 2.35.0
- UX: prevent context menu on canvas to avoid accidental menu on right-click during play (small)

## 2.34.0
- Mobile: hide on-screen touch buttons on non-touch devices; show only on touch devices (small)

## 2.33.0
- UI: include final wave count in Game Over overlay message (small)

## 2.32.0
- Fix: clear firing state on pointerup anywhere to avoid stuck fire on pointer devices (small)

## 2.31.0
- UI: increase Wave HUD font-size and contrast to improve readability (small)

## 2.30.0
- UI: pulse Lives HUD briefly when a life is lost to provide clearer feedback (small)

## 2.29.0
- Focus: focus canvas on initial load so keyboard users can play immediately (small)

## 2.28.0
- Accessibility: mark touch-controls aria-hidden to avoid redundant controls for screen readers (small)

## 2.27.0
- Fix: clear touch inputs on touchend/touchcancel to avoid stuck controls on some Android devices (small)

## 2.26.0
- Chore: read scripts/prompt.txt, suggestion.txt, and future.md; add short changelog entry (2026-03-16)

## 2.25.0
- Accessibility: increase overlay contrast to improve readability (small)

## 2.24.0
- Fix: clear touch input on touchcancel to avoid stuck controls (small)

## 2.23.0
- Accessibility: focus canvas on initial load to enable keyboard controls (small)

## 2.22.0
- Fix: prevent touchmove scrolling on canvas to improve mobile controls (small)

## 2.21.0
- UI: update in-game tip to mention garden theme and touch controls (small)

## 2.20.0
- Accessibility: allow Enter/Return to resume from pause when not game over (small)

## 2.19.0
- Accessibility: update document.title to indicate auto-paused when overlay shows pause (small)

## 2.18.0
- Chore: add short changelog entry noting project-docs read (scripts/prompt.txt, suggestion.txt, future.md) (2026-03-16)

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

## 2.0.0
- Accessibility: improve overlay message readability when paused (small) ΓÇö 2026-03-16

- Chore: read scripts/prompt.txt, suggestion.txt, and future.md; small incremental update (2026-03-16)

## 1.29.0
- Pause: suspend AudioContext when auto-paused by blur/visibilitychange; resume on focus/visibility restore when appropriate.

## 1.28.0
- UI: add 'M' keyboard shortcut to toggle mute (persisted to localStorage).

## 1.27.0
- Code: declare `wavePulseUntil` to avoid implicit global when spawning waves.

## 1.26.0
- UI: briefly flash a "Wave X" banner when a new wave begins to make progression clearer.

## 1.25.0
- Removed implemented '! The controls for android ...' suggestion from suggestion.txt after adding touch-zone controls in js/game.js.

## 1.24.0
- Add subtle dashed touch-zone guide lines for mobile to make controls more discoverable.

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
