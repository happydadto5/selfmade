# Changelog

## Unreleased
- Gameplay: increase Shield power-up duration to 16s and starting charges to 3 (small buff) — 2026-03-21

- Accessibility: focus autopause toast when auto-paused so keyboard users can resume with Enter/Space — 2026-03-21
- Accessibility: expose wave progress bar as progressbar with aria-valuenow/aria-valuemax attributes for assistive tech — 2026-03-21
- Gameplay: reduce Shield power-up duration from 16s to 12s (balance tweak) — 2026-03-21
- Accessibility: Next Wave button supports keyboard activation (Enter/Space) — 2026-03-21
- Accessibility: announce auto-pause to screen readers when auto-paused due to blur/visibility (tiny) — 2026-03-21
- UI: active power-up badge gains a subtle blue glow when Shield is active (tiny) — 2026-03-21
- UI: add visual shield badge to Lives HUD (tiny) — 2026-03-21
- UI: show transient wave toast when a new wave starts — 2026-03-21
- Fix: consolidate shield HUD rendering to avoid duplicate shield badges — 2026-03-21
- Accessibility: make active power-up badge keyboard-focusable (tabindex) and add focus outline for better screen-reader and keyboard discoverability — 2026-03-21
- UI: show shield emoji in active power-up HUD for clearer Shield visibility — 2026-03-21
- UI: slightly increase Wave HUD font-size for improved readability — 2026-03-21
- Stability: initialize data-shield-active attribute to false on load to avoid CSS mismatch — 2026-03-21
- UI: add smooth transition to Next Wave button hover for better discoverability — 2026-03-21
- UI: show subtle global tint while Shield power-up is active for clearer feedback — 2026-03-21
- Accessibility: focus game canvas when Shield is collected so keyboard users retain focus — 2026-03-21
- Stability: stop game loop when canvas is removed (prevent background errors during SPA navigation or automated tests) — 2026-03-21
- Gameplay: spawn guaranteed Shield power-up every 2 waves (tweak) — 2026-03-21
- Stability: clamp shield charges to zero when consumed to avoid negative shield counts (fix) — 2026-03-21
- Gameplay: add 'snatcher' enemy that occasionally dashes toward the player (tiny) — 2026-03-21
- UX: toggle garden background with B key (persisted) — 2026-03-21
- Stability: clear pending timers on unload to avoid delayed callbacks after page close (tiny) — 2026-03-21
- Stability: clear hitPopTimeout on unload to avoid lingering hit-overlay timeouts — 2026-03-21
- UI: pulse Lives HUD when Shield is collected or absorbs a hit for clearer feedback (tiny) — 2026-03-21
- Accessibility: autopause toast keyboard accessible (role+tabindex+keydown) — 2026-03-21
- Stability: abort gracefully if 2D canvas context unavailable to avoid runtime errors (tiny) — 2026-03-21
- Visual/UI: stronger shield pickup pulsing and halo for better pickup discoverability (tiny) — 2026-03-21
- Audio: slightly reduce hit sound volume for better balance (tiny) — 2026-03-21
- Visual/UI: colorblind-friendly hit flash (higher-contrast pop) when colorblind mode is enabled (tiny) — 2026-03-21
- Visual/UI: reduce screen shake when Shield is active to improve feel (tiny) — 2026-03-21
- Stability: removed duplicate unguarded auto-pause handlers to prevent double pauses/toasts (tiny) — 2026-03-21
- Accessibility: increase pause/game-over overlay contrast for improved readability (tiny) — 2026-03-21
- Visual/UI: small increase to hit screen-shake for clearer hit feedback (tiny) — 2026-03-21
- Stability: clear pending scheduled spawn when auto-pausing to prevent new waves while paused (tiny) — 2026-03-21
- Gameplay: add a new 'hopper' enemy that performs lateral hops to increase enemy variety (tiny) — 2026-03-21
- UI: show shield charges in Lives HUD when active (tiny) — 2026-03-21
- Accessibility: expose active power-up as aria-label and tooltip for assistive tech and tooltips — 2026-03-21
- Gameplay: shorten auto-advance after clearing a wave from 1.2s to 0.9s for snappier pacing — 2026-03-21
- UI: increase Wave HUD font-size on small screens for improved readability — 2026-03-21
- Stability: clear pending auto-pause and spawn timeouts on restart to avoid delayed pauses and stray timers — 2026-03-21
- Gameplay: collecting Shield while active now adds one charge (max 3) and extends duration by 8s — 2026-03-21
- Stability: auto-pause on window blur/focus (debounced) to avoid running while unfocused — 2026-03-21
- UI: show clickable autopause toast to prompt 'Tap to resume' when auto-paused by blur/visibility (tiny) — 2026-03-21
- Maintenance: investigated auto-pause behavior; no code change required this iteration (tiny) — 2026-03-21
- Visual/UI: stronger shield glow and halo when Shield is active for clearer feedback (tiny) — 2026-03-21
- Visual/UI: slightly increased shield badge glow and border for clearer Shield feedback (tiny) — 2026-03-21
- Controls: reduce touch hold delay from 100ms to 80ms for snappier mobile hold-to-fire (tiny) — 2026-03-21
- UI: increase Next Wave button touch target for better mobile usability (tiny) — 2026-03-21
- UI: Next Wave button hover lifts and stronger shadow on hover for better discoverability (tiny) — 2026-03-21
- Gameplay: slightly increase power-up pickup radius to make pickups easier to collect (56 → 68) — 2026-03-21
- Visual/UI: active power-up badge gains a subtle pulse and stronger contrast so collected power-ups are more discoverable — 2026-03-21
- Gameplay: spawn guaranteed Shield power-up every 3 waves (pacing) — 2026-03-21
- Stability: clear temporary power-ups on restart so restarting a run doesn't retain previous power-ups — 2026-03-21
- Visual/UI: pulse Shield ring based on remaining time for clearer feedback — 2026-03-21
- UI: autopause toast now hints 'Tap to resume' for mobile clarity — 2026-03-21
- Stability: persist last score and wave to localStorage on auto-pause/visibility to reduce data loss on quick tab switches — 2026-03-21
- Accessibility/Stability: ensure keyboard focus returns to the game canvas when the pause overlay is hidden to improve keyboard and screen-reader workflows — 2026-03-21
- UI: improve pause overlay contrast and add focus outlines for Resume/Replay buttons (accessibility) — 2026-03-21
- Stability: cap bullets to 120 to prevent runaway memory during long runs (tiny) — 2026-03-21
- Gameplay: set Shield charges to 2 to match comment (absorbs up to two hits) — 2026-03-21
- Stability: increase auto-pause debounce from 700ms → 900ms to reduce accidental pauses on quick tab switches (tiny) — 2026-03-21
- (Obsolete) Previous Shield charge suggestions consolidated — 2026-03-21
- Accessibility: announce when Shield power-up expires so screen readers receive clear feedback. — 2026-03-21
- Stability: cap active power-ups to 8 to prevent pathological growth during long runs (tiny) — 2026-03-20
- Fix: prevent duplicate shield HUD badges and keep shield timer updated in HUD (tiny) — 2026-03-20
- Fix: consolidate shield badge update logic to avoid duplicate DOM nodes and ensure timer/charges refresh correctly — 2026-03-20
- Fix: avoid spawning duplicate Shield power-ups when awarding nearby shields (tiny) — 2026-03-20
- Mobile: vibrate on Shield collect and Shield absorb to provide tactile feedback on supported devices (tiny) — 2026-03-20

## 6.115.0
- Visual/UI: increase background leaf density for richer garden atmosphere (tiny) — 2026-03-20

## 6.114.0
- Gameplay: Shield now also absorbs direct enemy collisions (in addition to bottom-leak). Shielded collisions produce a satisfying visual/score feedback so players notice the effect immediately. — 2026-03-20

## 6.113.0
- Levels: add keyboard shortcut N to advance to next wave when cleared (tiny) — 2026-03-20

## 6.112.0
- UI: show shield power-up remaining charges in Lives HUD badge (tiny) — 2026-03-20

## 6.111.0
- Visual/UI: add subtle animated background overlay behind the canvas for improved atmosphere and readable HUD (tiny) — 2026-03-20

## 6.110.0
- Levels: slightly reduce final wave enemy count and give an extra start-of-wave grace period to make the final wave feel achievable (tiny) — 2026-03-20
- Levels: auto-advance to next wave 1.2s after clearing to improve pacing (tiny) — 2026-03-20
- Levels: increase early-wave grace period from 1400ms to 1800ms for the first three waves to improve beatability (tiny) — 2026-03-20
- UI: show Next Wave button only when a wave is cleared to reduce HUD clutter and make progression clearer (tiny) — 2026-03-20
- Levels: show victory overlay when final configured wave is cleared so runs feel beatable (tiny) — 2026-03-20
- Levels/UI: implement finite waves with visible "Wave X/Y" HUD and auto-advance when cleared (small) — 2026-03-20
- UI: mark final configured wave as 'Final Wave' with clearer banner so players know they're at the end (tiny) — 2026-03-20
- UI: show waves-remaining in wave progress HUD for clearer beatability (tiny) — 2026-03-20
- Levels: slightly increase early-wave enemy counts for better pacing (tiny) — 2026-03-20
- Levels: trigger victory overlay when final configured wave is cleared so runs have a clear beatable end (tiny) — 2026-03-20
- Levels: increase wave-clear recovery pause and show bonus on toast (tiny) — 2026-03-20
- UI: improve Next Wave button styling and accessibility for better discoverability (tiny) — 2026-03-20
- Levels: reduce initial wave sizes for better beatability (tiny) — 2026-03-20
- Levels: award wave-clear bonus scaled by remaining lives to reward survival (tiny) — 2026-03-20
- Levels: increase early-wave grace period to improve beatability (tiny) — 2026-03-20
- Levels: adaptive inter-wave delay (longer early waves) to improve pacing and beatability (tiny) — 2026-03-20
- Visual/UI: add celebratory particle burst and victory chime when final configured waves are cleared (small) — 2026-03-20
- Levels: award extra life every 3 waves (was 5) to improve beatability (tiny) — 2026-03-20
- Levels: add manual 'Next Wave' button to let players advance when a wave stalls (tiny) — 2026-03-20
- Levels: extend inter-wave recovery when player is low on lives to improve beatability (tiny) — 2026-03-20
- Levels: increase inter-wave recovery pause when waves clear to improve pacing (tiny) — 2026-03-20
- Levels: show brief 'Wave cleared' pause and award small score bonus to improve pacing (tiny) — 2026-03-20
- Levels: slightly reduce enemy speed cap and growth for better beatability (tiny) — 2026-03-20
- Fix: detect wave cleared by current-wave enemy count, preventing stalled waves when stray enemies remain (tiny) — 2026-03-20
- UI: ensure Wave HUD consistently shows total waves when configured (tiny) — 2026-03-20
- Levels: prevent automatic inter-wave spawn from starting while previous wave enemies remain; show 'Waiting for X enemies' during countdown (small) — 2026-03-20
- Levels: auto-advance to next wave when current wave enemies are cleared (small) — 2026-03-20
- Levels: shorten inter-wave delay slightly for snappier pacing (tiny) — 2026-03-20
- Levels: spawn a guaranteed Shield power-up every 2 waves to aid pacing and recovery (tiny) — 2026-03-20
- Levels: slightly reduce enemy count growth and slow enemy speed scaling to improve beatability and pacing (tiny) — 2026-03-20
- Levels: bump initial wave enemy count so wave 1 has 4 enemies to avoid occasional stalled early waves (tiny) — 2026-03-20
- Levels: ensure spawnWave always reaches intended enemy count (tiny) — 2026-03-20
- Levels: shorten inter-wave delay for snappier pacing and slightly reduce growth per wave (tiny) — 2026-03-20
- Levels: slightly shorten inter-wave delay further to improve beatability and pacing (tiny) — 2026-03-20
- Levels: slightly shorten inter-wave delay and extend early-wave grace to first three waves for snappier pacing and better beatability — 2026-03-20
- UI: improve Next Wave HUD button styling for better discoverability on mobile (tiny) — 2026-03-20
- Levels: add 'continue to next level' option (press L) after final wave to proceed to a slightly harder loop (small) — 2026-03-20
- Fix: reduce wave spawn watchdog threshold to 80ms so fallback enemies appear sooner and prevent stalled waves (tiny) — 2026-03-20
- Levels: increase inter-wave delay slightly for the first three waves to improve beatability and recovery windows (tiny) — 2026-03-20
- Levels: increase wave-start grace for early waves to improve beatability (tiny) — 2026-03-20
- Levels: fix compact in-canvas HUD remaining count to filter by the current wave so the compact HUD shows accurate remaining/total (tiny) — 2026-03-20

- Levels: shorten base inter-wave delay from 2200ms to 1600ms for snappier pacing (small) — 2026-03-20

- UI: improve visibility for wave transitions by styling wave-start/cleared toasts and countdown (tiny) — 2026-03-20
- Levels: show brief "Next wave in ..." countdown after clearing a wave to improve pacing and clarity (tiny) — 2026-03-20

- Levels/UI: display Wave as “X/Y” when maxWaves is configured so players know remaining waves (small) — 2026-03-20

- Levels: reduce wave spawn watchdog delay so fallback enemies appear sooner and prevent stalled waves (small) — 2026-03-20
- Levels: shorten inter-wave delay slightly for snappier pacing and better beatability (tiny) — 2026-03-20
- Levels: add short wave-start grace (enemies slowed ~35% for 0.8s) to improve beatability and give players reaction time (tiny) — 2026-03-20
- Levels: consider wave cleared when its remaining enemies are defeated (prevents stalled waves) — tiny
- UI: show total waves in Wave HUD when maxWaves configured (small) — 2026-03-20
- UI: briefly highlight Next Wave button when a wave is cleared to make progression clearer (tiny) — 2026-03-20

## 6.55.0
- Visual/UI: increase background leaf density for richer garden atmosphere (tiny) — 2026-03-20

## 6.54.0
- Stability: ensure spawnWave always generates the intended enemy count to avoid incomplete waves (small) — 2026-03-20

## 6.53.0
- Visual/UI: increase wave progress bar contrast and animation speed for snappier, more readable feedback (tiny) — 2026-03-20

## 6.52.0
- Levels: add finite waves and victory state (small) — 2026-03-20

## 6.51.0
- Visual/UI: tint active power-up HUD to match collected power-up for clearer pickup feedback (tiny) — 2026-03-20

## 6.50.0
- Stability: flush pending high score to localStorage on unload to avoid losing recent scores on quick navigations (tiny) — 2026-03-20

## 6.49.0
- Accessibility: announce enemy hits via hit-announcer role=status live region for better screen-reader support (tiny) — 2026-03-20

## 6.48.0
- Levels: count remaining enemies for the current wave in HUD so wave progress is accurate (tiny) — 2026-03-20

## 6.47.0
- Gameplay: briefly pulse active power-up HUD when Shield absorbs a hit so players see immediate feedback (tiny) — 2026-03-20

## 6.46.0
- Mobile: reduce touch hold delay from 120ms to 100ms to make hold-to-fire more responsive (tiny) — 2026-03-20

## 6.45.0
- Visual/UI: add subtle dark outline to HUD, wave banner, FPS, and pause/game-over text for improved readability on busy backgrounds (tiny) — 2026-03-20

## 6.44.0
- Visual/UI: show shield ring and charge indicators around the player when Shield is active (tiny).
- Reduced wave spawn watchdog delay so fallback enemies appear sooner when fewer enemies spawn (improves wave reliability).

## 6.42.0
- Stability: guard main loop against uncaught exceptions so an update/draw error won't stop animation; auto-pause and overlay shown on error (tiny) — 2026-03-20

## 6.41.0
- Gameplay: increase Shield charges to 3 so shields feel slightly more forgiving (tiny) — 2026-03-20

## 6.40.0
- Visual/UI: increase background leaf density slightly for richer garden atmosphere (tiny)

## 6.39.0
- Levels: add a small watchdog to auto-fill missing wave enemies to prevent stalled waves during spawning (tiny) — 2026-03-20

## 6.38.0
- Gameplay: improve Shield power-up visibility with a brighter halo and slightly larger icon so pickups are easier to spot (tiny) — 2026-03-20

## 6.37.0
- Stability: only auto-resume when the document has focus to avoid accidental unpauses on some platforms (tiny) — 2026-03-20

## 6.36.0
- Visual/UI: lengthen player hit flash duration for clearer hit feedback (tiny) — 2026-03-20

## 6.35.0
- Levels: ensure dynamically spawned mini-enemies are correctly counted toward the current wave so wave progress and beatability are accurate (tiny)

## 6.34.0
- Gameplay: reduce Shield charges from 3 to 2 to align with documented two-charge design (tiny) — 2026-03-20

## 6.33.0
- Stability: increase auto-pause debounce from 500ms to 700ms to reduce accidental pauses when switching tabs (tiny)

## 6.31.0
- Visual/UI: stronger radial red player-hit flash centered on the player; respects prefers-reduced-motion and falls back to a full-screen red fill on error (tiny)

## 6.30.0
- Levels: add a Next Wave button to the HUD to allow manual wave advancement when progression stalls (tiny)

## 6.29.0
- Gameplay: increase Shield charges from 2 to 3 to make it slightly more forgiving (tiny)

## 6.28.0
- Fix: prevent touch fire button title from growing on repeated HUD updates (small)

## 6.27.0
- Visual/UI: sharpen hit-pop overlay (reduced blur, stronger bloom) for clearer hit feedback (tiny)

## 6.26.0
- Levels: set lastSpawn when a wave starts to ensure inter-wave countdowns behave reliably (tiny)

## 6.25.0
- Gameplay: increase power-up spawn chance and bias shield drops when player is low on lives to improve recovery (small)

## 6.24.0
- Mobile: reduce touch hold delay from 150ms to 120ms to make hold-to-fire more responsive (tiny)

## 6.23.0
- Stability: remove duplicate pagehide handler to avoid redundant pause logic and potential race conditions (tiny)

## 6.22.0
- Levels: shorten inter-wave delay for waves 1-2 to improve pacing and beatability (tiny)

## 6.21.0
- Gameplay: Draw shield charge indicators above player while Shield is active (tiny)

## 6.20.0
- Visual/UI: use --hud-backdrop-opacity for HUD backdrop and increase default to 0.94 for improved contrast (tiny)

## 6.19.0
- Visual/UI: improve hit-pop overlay fallback so hits remain visible on very light backgrounds (tiny)

## 6.18.0
- Levels: ensure wave target uses intended spawn count so waves reliably complete (tiny)

## 6.17.0
- Visual/UI: stronger garden hit flash overlay to improve hit readability (tiny)

## 6.16.0
- Gameplay: align Shield power-up to absorb two hits (set charges to 2) (tiny)

## 6.15.0
- Visual/UI: improve wave progress bar visibility — slightly taller bar and subtle glow for readability on busy backgrounds (tiny)

## 6.14.0
- Levels: tag spawned enemies with wave id and fix wave progress display so remaining enemy counts are accurate (small)

## 6.13.0
- Stability: clear inputs on visibilitychange to prevent stuck controls when the page is hidden (tiny)

## 6.12.0
- Gameplay: strengthen Shield power-up — now grants 3 charges and lasts 16s; clearer collect feedback (small)

## 6.11.0
- Visual/UI: add subtle vignette to canvas to focus play area and improve HUD readability (tiny) — 2026-03-20

## 6.10.0
- Levels/UI: include wave enemy target in wave start toast and aria announcement for clearer progression feedback

## 6.9.0
- Gameplay: Shield now absorbs two life leaks (small) — 2026-03-20

## 6.8.0
- Accessibility: announce extra-life pickup to screen readers and pulse lives HUD (tiny) — 2026-03-20

## 6.7.0
- Increased inter-wave delay from 1600ms to 2200ms.

## 6.6.0
- Visual/UI: increase HUD backdrop opacity to 0.92 to improve HUD readability on busy backgrounds (tiny) — 2026-03-20

## 6.5.0
- Visual/UI: add brief HUD score pulse when enemies are hit to improve hit feedback (tiny) — 2026-03-20
- UI: Slightly darkened HUD backdrop to improve readability on busy backgrounds. — 2026-03-20
- Visual/UI: tune --hud-backdrop-opacity to 0.86 for improved HUD contrast on busy backgrounds (tiny) — 2026-03-20
- Visual/UI: increase HUD backdrop opacity slightly to improve HUD readability on busy backgrounds (tiny) — 2026-03-20
- Visual/UI: sync hit-pop body overlay CSS animation duration with JS removal timeout (760ms) so canvas and body-level hit flashes align (tiny) — 2026-03-20
- Visual/UI: add subtle parallax to background clouds for improved depth (tiny) — 2026-03-20
- Visual/UI: increase HUD text contrast (white text + darker HUD backdrop) for improved readability on busy backgrounds (tiny) — 2026-03-20
- Visual/UI: tweak garden hit-pop overlay colors and bloom for clearer hit feedback (tiny) — 2026-03-20
- Visual/UI: increased HUD backdrop opacity slightly to improve HUD readability on busy backgrounds (tiny) — 2026-03-20
- Accessibility: announce enemy hits to screen readers via hidden live region (tiny) — 2026-03-20
- Visual/UI: slightly lengthen enemy hit flash and white pop on enemy death for clearer hit feedback (tiny) — 2026-03-20
- Visual/UI: sync body-level hit-pop removal timeout with CSS animation (760ms) so the radial garden hit-pop runs fully and aligns with canvas flash (tiny) — 2026-03-20
- Visual/UI: increase HUD backdrop opacity slightly to improve HUD readability on busy backgrounds (tiny) — 2026-03-20
- Visual/UI: introduce CSS variable --hud-backdrop-opacity to make HUD contrast easy to tune (tiny) — 2026-03-20
- Visual/UI: increase hit-pop bloom and blur for clearer hit feedback (tiny) — 2026-03-20
- Visual/UI: unify and debounce hit-pop overlay removal to reliably sync with CSS animation (tiny) — 2026-03-20
- Visual/UI: use local garden-background.jpg as canvas background when present for stronger theme (tiny) — 2026-03-20
- UI: make wave progress bar responsive and slightly taller for improved readability on mobile (tiny) — 2026-03-20
- Graphics: add and render a generated garden background image so the game finally gets a real visible art upgrade instead of only procedural shapes and hit-flash tweaks.
- Visual/UI: extend enemy hit flash and enlarge hit glow for clearer hit feedback (tiny) — 2026-03-20
- Visual/UI: ensure enemy death triggers white pop overlay for clearer hit feedback (tiny) — 2026-03-20
- Visual/UI: stronger player-life lost flash for clearer feedback (tiny) — 2026-03-20
- Visual/UI: slightly increase garden hit-pop radius and brightness for clearer hit feedback (tiny) — 2026-03-20
- Visual/UI: reduce HUD backdrop darkness slightly to improve readability on a variety of backgrounds (tiny) — 2026-03-20
- Visual/UI: increase HUD backdrop opacity slightly to improve readability on varied backgrounds (tiny) — 2026-03-20
- Automation: when a new `selfmade.bat` launcher starts, it now terminates an older running launcher and takes over cleanly to reduce duplicate-launch file-lock conflicts.
- Visual/UI: reduce bottom pot count and tone down plant graphics to reduce clutter (tiny) — 2026-03-20
- Visual/UI: add subtle canvas shake synchronized with hit-pop overlay to strengthen hit feedback (tiny) — 2026-03-20
- Visual/UI: increase HUD backdrop opacity and blur slightly for improved readability on bright or busy backgrounds (tiny) — 2026-03-20
- Visual/UI: increase garden hit-pop mid-tone opacity slightly for clearer hit feedback (tiny) — 2026-03-20
- Fix: repair malformed non-lethal hit-feedback logic in `js/game.js` so automation validation can complete again after restart.
- Automation: reduce the loop pause from 7 minutes back to 5 minutes.
- Automation: detect when suggestion sync is blocked by unrelated local changes and continue the local loop with a clear warning instead of stalling forever on repeated pull-rebase failures.
- Visual/UI: extend the garden hit-pop flash to 420ms so enemy-hit feedback reads a bit more clearly (tiny) — 2026-03-20
- Visual/UI: use brighter 'screen' blend for garden hit-pop overlay and lengthen fade to 380ms for clearer hit feedback (tiny) — 2026-03-19
- Fix: debounce body hit-pop overlay removal to avoid stacked timeouts on rapid hits (tiny) — 2026-03-19
- Fix: ensure CSS hit-pop overlay removal is delayed so the hit animation runs fully (tiny) — 2026-03-19
- Visual/UI: garden-tinted hit-pop flash for clearer, thematic hit feedback (tiny) — 2026-03-19
- Visual/UI: short fade+pop animation for hit-pop overlay to improve hit feedback (tiny) — 2026-03-19
- Visual/UI: extend white hit-pop duration and soften fade for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: slightly increased white hit flash duration for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: improved HUD text outline for better readability on busy backgrounds (tiny) — 2026-03-19
- Fix: prevent duplicate shield HUD badges and keep shield timer updated (tiny) — 2026-03-19
- Visual/UI: slightly increased HUD backdrop opacity for improved readability on bright/busy backgrounds (tiny) — 2026-03-19
- Feedback: add brief haptic vibration on enemy deaths and player hits for stronger tactile feedback (tiny) — 2026-03-19
- Visual/UI: slightly increased hit-pop overlay radius and intensity for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: add body-level white pop overlay synchronized with canvas hit flash for stronger hit feedback (tiny) — 2026-03-19
- Visual/UI: white radial hit pop centered on hit location for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: add subtle semi-opaque dark backdrop behind HUD for improved contrast on busy backgrounds (tiny) — 2026-03-19
- Visual/UI: increase HUD backdrop contrast for better readability on bright backgrounds (tiny) — 2026-03-19
- Visual/UI: radial garden hit flash centered on hit location to improve hit feedback (tiny) — 2026-03-19
- Visual: Add brief hit flash and subtle screen shake on enemy hits for clearer feedback. (small)
- Visual/UI: stronger shield-absorb feedback — brighter petal burst, brief canvas flash, and subtle screen shake (tiny) — 2026-03-19
- Visual/UI: add brief white hit flash and extra white spark on enemy hits for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: stronger red flash when player loses a life for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: stronger garden hit flash with additive blend for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: Brighter petal burst and stronger canvas flash on enemy deaths for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: slightly longer, warmer canvas hit flash for clearer enemy-hit feedback (tiny) — 2026-03-19
- UI: show shield badge next to Lives when active (tiny) — 2026-03-19
- Visual/UI: emphasize shield badge with a subtle glow and improved contrast so temporary invulnerability is easier to notice (tiny) — 2026-03-19
- Visual/UI: improve HUD text outline for better readability on busy backgrounds (tiny) — 2026-03-19
- Visual/UI: stronger garden hit flash (warmer, punchier) to improve enemy-hit feedback (tiny) — 2026-03-19

- Visual/UI: add brief white hit-ring around the player when a life is lost to improve hit clarity (tiny) — 2026-03-19

- Visual/UI: slight increase to canvas hit flash intensity and duration for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: slightly stronger garden-themed hit flash for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: garden petal particles on enemy hits for clearer, themed feedback (tiny) — 2026-03-19
- Visual/UI: increase wave progress bar background contrast and strengthen fill for improved readability (tiny) — 2026-03-19
- Visual/UI: garden-themed soft green canvas hit flash to improve hit feedback (tiny) — 2026-03-19
- Visual/UI: slightly increased canvas hit flash duration and warmth for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: brighter petal explosion uses additive blending for clearer enemy-death feedback (tiny) — 2026-03-19
- Visual/UI: add subtle vignette to improve contrast and readability on busy backgrounds (tiny) — 2026-03-19
- Visual/UI: increase hit flash intensity and duration slightly for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: add soft garden atmospheric background for depth and contrast (tiny) — 2026-03-19
- Visual/UI: stronger wave progress bar with brighter garden-green fill and subtle inner glow for clearer wave progress (tiny) — 2026-03-19
- Visual/UI: garden-themed hit markers (leaf burst) for clearer hit feedback (tiny) — 2026-03-19
- Visual/UI: improve HUD text contrast for better readability on bright backgrounds (tiny) — 2026-03-19
- Visual/UI: stronger garden-themed hit flash (soft yellow) to improve hit feedback (tiny) — 2026-03-19
- Visual/UI: change hit particle color to soft yellow to match garden theme (tiny) — 2026-03-19
- Visual/UI: brighter hit spark particles using additive blending for clearer hit feedback (tiny) — 2026-03-19
- Images: replace the placeholder image generator with a real Cloudflare Workers AI path and explicitly permit that local helper in the automation prompt so future art iterations can create actual local assets instead of only dummy SVG placeholders.

## 5.41.0
- Stability: cap active power-ups to 6 to prevent power-up overload and occasional performance spikes (tiny) — 2026-03-19

## 5.40.0
- Visual/UI: add red-tinted canvas flash and small particle burst when an enemy is hit to improve hit feedback (tiny) — 2026-03-19

## 5.39.0
- Performance: lower particle cap to 100 to improve low-end device stability (tiny) — 2026-03-19

## 5.38.0
- UI: show active power-up and remaining time in HUD (tiny) — 2026-03-19

## 5.37.0
- Levels: ensure wave enemy count reflects actual spawned enemies so the wave progress HUD is accurate (tiny) — 2026-03-19

## 5.36.0
- Gameplay: reduce touch hold delay from 180ms to 150ms for snappier mobile hold-to-fire responsiveness (tiny)

## 5.35.0
- Gameplay: shield now grants +5 score when it absorbs a leaking enemy and shows a small +5 popup (tiny) — 2026-03-19

## 5.34.0
- Visual: add subtle shield sparkles while Shield power-up is active so players can better notice temporary invulnerability (tiny) — 2026-03-19

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
- Levels/UI: show brief "Wave cleared" toast and give a short recovery pause after clearing a wave so pacing is clearer (tiny) — 2026-03-20
- Game: increase power-up pickup radius to 56 to make power-ups easier to collect.

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
