# Jerseys Puzzle Game - V1 Plan

## 1) Product Goal
- Build a daily casual puzzle inspired by NYT Pips, themed around NBA jerseys.
- Core action: place jersey tiles onto board slots so all region conditions are satisfied.
- Mobile-first UX, desktop supported secondarily.
- One shared puzzle per day for all users.

## 2) V1 Rules (Current Agreement)
- Pieces are single jerseys, not domino-style paired tiles.
- Board varies daily and is not required to be rectangular/square.
- Board uses up to ~12 placeable slots to keep session length reasonable.
- Constraints can apply to irregular regions (including non-rectangular shapes).
- Allowed condition examples:
  - Region sum (jersey numbers sum to X)
  - Region team condition (example: include team GSW, or N tiles from team X)
  - Region equal-number condition (example: two equal jersey numbers)
- Duplicate jersey numbers are allowed if teams differ.
- Puzzle must have exactly one valid solution.
- No hints/undo in v1.
- Validation behavior: after submit (or full board), highlight incorrect regions.

## 3) Data Model Proposal
- Tile identity: `tile = { teamAbbr, teamColors, jerseyNumber, playerId, season }`
- Display label:
  - Large `jerseyNumber`
  - Team accent colors
  - Team abbreviation badge
- Condition model:
  - `condition = { id, regionCellIds[], type, params }`
  - `type` enum (initial): `SUM`, `HAS_TEAM`, `COUNT_TEAM`, `HAS_EQUAL_NUMBERS`
- Puzzle model:
  - `puzzle = { puzzleId, dateKeyPT, board, trayTiles, conditions, solution, difficulty }`

## 4) Daily Puzzle and Seeding
- Date key should be derived from `America/Los_Angeles` calendar day.
- Publish target: morning PT (exact hour set by backend config).
- Frontend-first phase:
  - deterministically picks puzzle config from local/static source using PT date key.
- Backend-config phase:
  - frontend fetches puzzle JSON by PT date key.
  - fallback message if unavailable: "Today's puzzle is unavailable. Please try again later."

## 5) Generation and Curation Strategy
- Because uniqueness is mandatory, use a solver to validate puzzle candidates.
- Recommended pipeline:
  1. Build candidate board shape + region set + tile tray.
  2. Generate conditions from an intended solution.
  3. Run solver to count solutions.
  4. Keep only puzzles where solution count is exactly 1.
- Since difficulty is manually curated, start with a hand-authored puzzle list.
- Optional generator can assist editors, but published puzzles should pass uniqueness checks.

## 6) Mobile UX Spec (V1)
- Primary interaction:
  - Drag and drop jersey tile to empty slot.
- Secondary interaction:
  - Tap jersey to select, then tap board slot to place.
- Required mobile behaviors:
  - Large touch targets
  - No accidental page scroll during drag
  - Clear selected state for tap flow
  - Quick reset/remove interaction (tap placed tile to return to tray)
- End-state feedback:
  - Success state + completion timestamp
  - If incorrect, highlight violating regions only

## 7) Pitfalls and Mitigations
- Unique-solution risk:
  - Pitfall: irregular regions + mixed constraints can create multiple solutions.
  - Mitigation: strict solver validation in content pipeline.
- Difficulty drift:
  - Pitfall: "manual" puzzles vary too widely.
  - Mitigation: internal rubric (target solve window ~2-4 minutes) and test solves.
- Data churn:
  - Pitfall: player movement/season updates alter available tiles.
  - Mitigation: freeze puzzle tile pool to a season snapshot version.
- Timezone edge cases:
  - Pitfall: users see wrong day around midnight/DST.
  - Mitigation: always compute puzzle day in `America/Los_Angeles`.
- Mobile input bugs:
  - Pitfall: drag interactions fail on some devices.
  - Mitigation: support both drag and tap-to-place from day one.
- Backend outage:
  - Pitfall: no puzzle fetched.
  - Mitigation: explicit unavailable state and optional static emergency puzzle.

## 8) Implementation Phases
- Phase A: Frontend prototype
  - Vite + TypeScript app scaffold
  - Board/tray rendering
  - Drag + tap placement
  - Condition evaluation
  - Success/failure UI
- Phase B: Puzzle content format
  - JSON schema for board/regions/conditions/solution
  - Local daily resolver by PT date key
- Phase C: Solver and validation
  - Backtracking solver for solution count
  - CLI check for uniqueness on puzzle files
- Phase D: Backend config integration
  - Fetch daily puzzle from API
  - Fallback behavior
- Phase E: Telemetry
  - Completion rate
  - D1 retention linkage hooks
  - Session length tracking

## 9) V1 Out of Scope
- Practice mode (single fixed practice puzzle can be added post-v1).
- Advanced accessibility set (beyond basic readable UI).
- Hints/undo system.
- Player names/images.

## 10) Final Clarifications Before Coding
- Confirm tile identity semantics:
  - Is a tile considered unique by `(teamAbbr + jerseyNumber)`?
- Confirm publish time:
  - Exact PT hour for puzzle rollover (example: 7:00 AM PT).
- Confirm initial condition subset:
  - Keep v1 to only `SUM`, `HAS_TEAM`, `HAS_EQUAL_NUMBERS`?
