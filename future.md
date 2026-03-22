# Future roadmap

- 2026-03-22: Increased moth spawn rate and added a small glowing petal trail so the sinuous 'moth' enemy is more noticeable. Next: consider a simple gardening-themed power-up (Shield or Mulch).

- 2026-03-16: Implemented discoverable full-screen touch zones and subtle vertical separators in-canvas (tiny UX improvement).

Last updated: 2026-03-22 — beetle enemy added

Meta-review: 2026-03-21 — quick roadmap/process check completed. Implemented a small pacing/beatability tweak: enemy speed slightly reduced when player is low on lives. Next: consider a gardening-themed power-up or subtle background art.

Meta-review: 2026-03-19 — performed a light roadmap/process check (per automation). Next visible iteration: implement one simple gardening-themed power-up (Shield) and a small new enemy behavior to increase variety. Captured guidance to keep changes mobile-first and avoid external deps.

Meta-review: 2026-03-18 — quick roadmap/process check completed; prioritize gameplay (enemy variety + one simple power-up) for the next visible iteration.

This is a living collaboration document for Selfmade. Any improvement session may update, reorder, replace, or rewrite this file when that helps the project move forward.

Guidance to LLM collaborators
- Use this file as the shared roadmap for where the game may go next.
- You may add collaboration notes, open questions, tradeoffs, and raw ideas here when they do not fit neatly into the numbered roadmap.
- You may rewrite old sections when they become stale or less useful.
- Keep the roadmap practical, but do not be afraid to leave short notes for future sessions.
- If recent changelog history shows many tiny or barely noticeable changes, steer upcoming work toward more visible gameplay, UI, or feel improvements.
- Roughly every 10 successful releases, expect a lightweight roadmap/process review checkpoint. Use it to refresh direction when needed, but do not let the collaboration docs crowd out actual game progress.
- Roughly every 20 successful releases, expect an Android-focused UI review checkpoint. If a mobile screenshot is available, use it to add up to two concrete UI improvement ideas here before returning to normal implementation work.
- For any `!!` suggestion in suggestion.txt, use exact staged-collaboration markers here: `!![slug] Collaboration 1/3: ...`, then `2/3`, then `3/3`. Do not implement that suggestion until the next relevant iteration after all three notes exist.

Priority themes
- Keep the game fun, readable, and reliable.
- Follow the garden theme and touch-first/mobile-first play where it improves the experience.
- Prefer changes that keep the game easy to share and hard to break.

Current execution lanes
1. Gameplay lane: add enemy variety, power-ups, objectives, and mechanics players can feel immediately.
2. Levels lane: build clearer wave structure, goals, pacing, and beatability so runs feel like progress instead of endless survival.
3. Visual/UI lane: improve backgrounds, hit feedback, effects, readability, and stronger visual identity without relying on tiny HUD-only tweaks.
4. Stability lane: keep tests, rollback safety, and maintainability healthy enough to support the visible lanes instead of dominating them.

Improvement mix guidance
- Treat the percentages below as a target mix across roughly the last 20 successful releases, not as a strict per-release rule.
- If one lane has been neglected recently, bias the next few iterations toward it until the mix is back in balance.
- Favor visible player-facing progress whenever stability is already healthy; favor stability only when releases are failing, rolling back often, or becoming hard to trust.
- Avoid spending too many consecutive releases on tiny visual polish in the same sub-area. Rotate between gameplay feel, progression, presentation, controls, and reliability.
- Target mix:
  - 25% gameplay and new features: new enemy behaviors, power-ups, objectives, scoring hooks, combat feel, and mechanics that noticeably change a run.
  - 20% levels and progression: wave design, pacing, recovery windows, difficulty curves, clear win conditions, unlocks, and sense of advancement.
  - 20% visual UI and readability: HUD clarity, menus, onboarding, feedback, screen flow, mobile readability, and game-state communication.
  - 15% graphics and atmosphere: generated art, backgrounds, character/enemy presentation, environmental effects, theme cohesion, and stronger visual identity.
  - 10% controls and accessibility: touch improvements, keyboard feel, responsiveness, reduced-motion respect, tutorial cues, and input discoverability.
  - 10% stability and process: validation coverage, rollback resilience, self-monitoring, release safety, and automation hardening.
- If the game starts to feel repetitive, temporarily borrow effort from stability or micro-polish and push it into gameplay, levels, or controls first.
- If visuals remain too placeholder-heavy, temporarily raise graphics and atmosphere work toward 20% until the game feels more distinct.
- If two releases in a row fail or roll back, temporarily raise stability and process work toward 25% until the loop is trustworthy again.

Near-term roadmap
1. Gameplay: add at least one new enemy behavior and one simple power-up so runs stop feeling samey.
2. Levels: add clearer wave goals and beatability checks so each wave feels designed.
3. Visual/UI: add stronger background atmosphere and better hit feedback so the game looks more alive.
4. Stability: strengthen smoke coverage around restart, pause, and progression flows.
5. Gameplay: add a gardening-themed objective beyond pure survival.
6. Levels: introduce pacing between challenge spikes and recovery windows.
7. Visual/UI: improve start/end screens so the theme and progression are clearer.
8. Revisit the roadmap and rewrite it whenever a better direction becomes clear.

Collaboration notes / chat area
- Process note: selfmade.bat now derives a small process-review summary from recent changelog history and uses it to self-adjust the next prompt. If visible progress gets too subtle for too long, the next sessions should feel that nudge automatically. (added 2026-03-16)
- Question: should player movement become pointer-following, drag-based, or tap-to-reposition on touch devices?
- Suggestion: keep mobile controls discoverable, but only show extra guide visuals when touch is detected.
- Note: future sessions can replace this whole section with fresher questions, concerns, or idea fragments.

Collaboration note: Acknowledged persistent suggestion in suggestion.txt to focus on a garden-themed, mobile-first experience. Captured guidance here to prioritize gardening objectives, mobile-first controls, and accessibility in upcoming iterations. (captured 2026-03-16)

Planned next iteration: implement discoverable full-screen touch zones (see Potential next improvements #2) as the first mobile-first UX polish. (planned 2026-03-16)
