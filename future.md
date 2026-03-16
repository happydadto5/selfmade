# Future roadmap

Last updated: 2026-03-16

This is a living collaboration document for Selfmade. Any improvement session may update, reorder, replace, or rewrite this file when that helps the project move forward.

Guidance to LLM collaborators
- Use this file as the shared roadmap for where the game may go next.
- You may add collaboration notes, open questions, tradeoffs, and raw ideas here when they do not fit neatly into the numbered roadmap.
- You may rewrite old sections when they become stale or less useful.
- Keep the roadmap practical, but do not be afraid to leave short notes for future sessions.
- If recent changelog history shows many tiny or barely noticeable changes, steer upcoming work toward more visible gameplay, UI, or feel improvements.

Priority themes
- Keep the game fun, readable, and reliable.
- Follow the garden theme and touch-first/mobile-first play where it improves the experience.
- Prefer changes that keep the game easy to share and hard to break.

Potential next improvements
1. Add true mouse/touch aiming and movement that feels good on desktop and mobile.
2. Replace basic mobile buttons with full-screen touch zones: left 25% moves left, right 25% moves right, center 50% fires. Show a thin dashed guide line (near the top third) when touch is detected to make these zones discoverable; use low-contrast dashed styling so it is non-distracting and unobtrusive.
3. Add a wave/level structure with clear goals and a visible sense of progression.
4. Add at least two enemy types with different movement and threat patterns.
5. Add logic checks so each generated level or wave remains beatable.
6. Add score-based level-ups or power unlocks.
7. Add simple power-ups such as rapid fire, shield, or spread shot.
8. Add a gardening-themed objective loop beyond pure survival.
9. Add a start screen that introduces the theme and controls quickly.
10. Add better background art and seasonal garden atmosphere.
11. Add more satisfying hit feedback, particles, and small screen shake.
12. Add drought, pests, weeds, or other garden problems as gameplay modifiers.
13. Add better balance between challenge spikes and recovery moments.
14. Add a lightweight achievement or milestone system.
15. Add better onboarding hints for first-time players.
16. Add accessibility polish for color contrast, motion, and screen readers.
17. Add more robust tests around wave progression and restart flows.
18. Reduce duplicated game-state logic and simplify hard-to-maintain code paths.
19. Add better end-of-run summaries so players want another run.
20. Revisit the roadmap and rewrite it whenever a better direction becomes clear.

Collaboration notes / chat area
- Question: should player movement become pointer-following, drag-based, or tap-to-reposition on touch devices?
- Suggestion: keep mobile controls discoverable, but only show extra guide visuals when touch is detected.
- Note: future sessions can replace this whole section with fresher questions, concerns, or idea fragments.

Collaboration note: Acknowledged persistent suggestion in suggestion.txt to focus on a garden-themed, mobile-first experience. Captured guidance here to prioritize gardening objectives, mobile-first controls, and accessibility in upcoming iterations. (captured 2026-03-16)

Planned next iteration: implement discoverable full-screen touch zones (see Potential next improvements #2) as the first mobile-first UX polish. (planned 2026-03-16)
