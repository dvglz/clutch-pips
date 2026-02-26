Original prompt: yo let's discuss this concept
- business logic
- based on NYT Pips, but more on sports theme
- instead of dominoes, could use just jerseys / numbers, so number won't be inflated
- i want to discuss concept, pitfalls and all of that before we start to code
- output is questions then we proceed to some plan doc then to code
- goal is casual game, new seed every day
- we can use official nba data (we have an api, without copyright infringement, just team colors, team abbr and jersey numbers)

technical
- ts/vite/default stack
- mobile version is more important than desktop
- new seed every day, starting in frontend, then config from backend

## Progress Log
- Added PLAN.md with v1 rules, data model, daily seed strategy, pitfalls, and phased implementation.
- Confirmed: tile identity unique by teamAbbr+jerseyNumber, rollover at 7:00 AM PT, v1 conditions limited to SUM/HAS_TEAM/HAS_EQUAL_NUMBERS.

## TODO
- Scaffold Vite + TypeScript project.
- Implement puzzle logic (drag+drop and tap-to-place).
- Implement region condition checking and incorrect-region highlight.
- Add PT 7:00 AM daily puzzle resolver.
- Run Playwright validation and fix visual/interaction issues.
- Scaffolded Vite + TypeScript project files (`package.json`, `tsconfig*`, `vite.config.ts`, `index.html`).
- Implemented core game in `src/main.ts`:
  - PT daily key with 7:00 AM rollover.
  - Local daily puzzle resolver.
  - Drag-and-drop and tap-to-place interactions.
  - Region condition evaluator for SUM/HAS_TEAM/HAS_EQUAL_NUMBERS.
  - Invalid-region highlight on check/full board.
  - `window.render_game_to_text` and `window.advanceTime` hooks.
- Added mobile-first NYT Pips-inspired styling in `src/style.css`.
- Fixed strict TypeScript nullability issue in `main.ts` and rebuilt successfully.
- Added keyboard control layer for deterministic automation:
  - Arrow keys move board cursor.
  - `a`/`b` cycles available tray jerseys.
  - `enter`/`space` places/removes at cursor.
- Playwright runs executed against `dist` build:
  - Idle render: `output/web-game-check/`.
  - Partial placement interaction: `output/web-game-check-place/`.
  - Full solve interaction: `output/web-game-check-solve/`.
- Verified via `state-0.json` that full solve marks all conditions as `pass` and `boardFilled: true`.

## Remaining TODOs / Suggestions
- Replace local `DAILY_PUZZLES` map with backend-config daily payload fetch.
- Add puzzle authoring/validation CLI to enforce single-solution before publish.
- Add additional day variants with non-square/irregular board shapes.
- UX adjustment after feedback:
  - Removed decorative region diamond tags that were misleading vs actual rules.
  - Added `Reveal solution` button for fast solvability verification.
- Rebuilt and validated with Playwright (`output/web-game-check-reveal/`): reveal action produces full solved state with all conditions passing.
- Implemented major gameplay/UI revision per user feedback:
  - Replaced puzzle content with a new jersey set and new region rules (`p-jerseys-002`).
  - Added `COUNT_TEAM` condition type and changed team marker semantics to explicit counts (`2xGSW`).
  - Added board-attached region markers that are anchored to each region's bottom-right area and remain visible after cells are filled.
  - Added drag/tap replacement behavior: dropping/placing onto an occupied cell replaces existing tile; replaced tile returns to stash.
  - Added right-side panel with Conditions + Debug sections.
  - Debug now includes uncovered-condition-cells diagnostics.
- Build validation: `npm run build` passes.
- Playwright validations:
  - Idle render: `output/web-game-v2-idle/`
  - Swap behavior: `output/web-game-v2-swap/`
  - Reveal solved state: `output/web-game-v2-reveal/` and `output/web-game-v2-reveal-final/`
  - Verified from state snapshots that swap updates placements and solved state sets all conditions to pass.
