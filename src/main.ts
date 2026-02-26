import './style.css';

type TeamAbbr = string;
type ConditionType = 'SUM' | 'HAS_TEAM' | 'HAS_EQUAL_NUMBERS' | 'COUNT_TEAM';
type ConditionStatus = 'pending' | 'pass' | 'fail';
type MarkerTone = 'blue' | 'purple' | 'gold' | 'slate' | 'green';

interface Tile {
  id: string;
  playerId: number;
  season: string;
  teamAbbr: TeamAbbr;
  jerseyNumber: number;
  colors: [string, string];
}

interface BoardCell {
  id: string;
  x: number;
  y: number;
  zone: 'indigo' | 'blue' | 'slate' | 'gold' | 'purple';
}

interface Condition {
  id: string;
  type: ConditionType;
  regionCellIds: string[];
  label: string;
  markerText: string;
  markerTone: MarkerTone;
  params: {
    targetSum?: number;
    teamAbbr?: TeamAbbr;
    requiredCount?: number;
  };
}

interface Puzzle {
  puzzleId: string;
  difficulty: 'base';
  board: {
    cols: number;
    rows: number;
    cells: BoardCell[];
  };
  trayTiles: Tile[];
  conditions: Condition[];
  solution: Record<string, string>;
}

interface DragState {
  tileId: string;
  ghostEl: HTMLDivElement;
}

interface RegionDefinition {
  key: string;
  id: string;
  cellIds: string[];
  markerTone: MarkerTone;
}

interface MarkerPlacement {
  region: RegionDefinition;
  left: number;
  top: number;
}

interface RegionVisual {
  bg: string;
  text: string;
  regionFill: string;
  regionBorder: string;
}

const MARKER_TONE_COLORS: Record<
  MarkerTone,
  RegionVisual
> = {
  blue: {
    bg: '#1d63d5',
    text: '#ffeb5d',
    regionFill: '#1d63d5',
    regionBorder: '#8dbaff'
  },
  purple: {
    bg: '#6840ab',
    text: '#f6f3ff',
    regionFill: '#6840ab',
    regionBorder: '#c6a8f0'
  },
  gold: {
    bg: '#e8a61e',
    text: '#fffef7',
    regionFill: '#e8a61e',
    regionBorder: '#ffd76f'
  },
  slate: {
    bg: '#3b4558',
    text: '#f4f7ff',
    regionFill: '#3b4558',
    regionBorder: '#afbdd7'
  },
  green: {
    bg: '#10795a',
    text: '#eafff3',
    regionFill: '#10795a',
    regionBorder: '#7ce7c5'
  }
};

const ROLLOVER_HOUR_PT = 7;
const CELL_SIZE = 92;
const CELL_GAP = 8;
const CELL_STEP = CELL_SIZE + CELL_GAP;

const DEFAULT_PUZZLE: Puzzle = {
  puzzleId: 'p-jerseys-002',
  difficulty: 'base',
  board: {
    cols: 3,
    rows: 3,
    cells: [
      { id: 'a', x: 0, y: 0, zone: 'purple' },
      { id: 'b', x: 1, y: 0, zone: 'blue' },
      { id: 'c', x: 2, y: 0, zone: 'indigo' },
      { id: 'd', x: 0, y: 1, zone: 'purple' },
      { id: 'e', x: 1, y: 1, zone: 'slate' },
      { id: 'f', x: 2, y: 1, zone: 'indigo' },
      { id: 'g', x: 0, y: 2, zone: 'gold' },
      { id: 'h', x: 1, y: 2, zone: 'gold' },
      { id: 'i', x: 2, y: 2, zone: 'slate' }
    ]
  },
  trayTiles: [
    {
      id: 'gsw-30',
      playerId: 201939,
      season: '2025',
      teamAbbr: 'GSW',
      jerseyNumber: 30,
      colors: ['#1D428A', '#FFC72C']
    },
    {
      id: 'gsw-23',
      playerId: 203110,
      season: '2025',
      teamAbbr: 'GSW',
      jerseyNumber: 23,
      colors: ['#1D428A', '#FFC72C']
    },
    {
      id: 'lal-23',
      playerId: 2544,
      season: '2025',
      teamAbbr: 'LAL',
      jerseyNumber: 23,
      colors: ['#552583', '#FDB927']
    },
    {
      id: 'mia-22',
      playerId: 202710,
      season: '2025',
      teamAbbr: 'MIA',
      jerseyNumber: 22,
      colors: ['#98002E', '#F9A01B']
    },
    {
      id: 'nyk-11',
      playerId: 1628973,
      season: '2025',
      teamAbbr: 'NYK',
      jerseyNumber: 11,
      colors: ['#006BB6', '#F58426']
    },
    {
      id: 'dal-77',
      playerId: 1629029,
      season: '2025',
      teamAbbr: 'DAL',
      jerseyNumber: 77,
      colors: ['#00538C', '#B8C4CA']
    },
    {
      id: 'phx-35',
      playerId: 201142,
      season: '2025',
      teamAbbr: 'PHX',
      jerseyNumber: 35,
      colors: ['#1D1160', '#E56020']
    },
    {
      id: 'mil-34',
      playerId: 203507,
      season: '2025',
      teamAbbr: 'MIL',
      jerseyNumber: 34,
      colors: ['#00471B', '#EEE1C6']
    },
    {
      id: 'bos-0',
      playerId: 1628369,
      season: '2025',
      teamAbbr: 'BOS',
      jerseyNumber: 0,
      colors: ['#007A33', '#BA9653']
    }
  ],
  conditions: [
    {
      id: 'sum-top-row',
      type: 'SUM',
      regionCellIds: ['a', 'b', 'c'],
      label: 'Top row sum is 88',
      markerText: '88',
      markerTone: 'blue',
      params: { targetSum: 88 }
    },
    {
      id: 'sum-mid-row',
      type: 'SUM',
      regionCellIds: ['d', 'e', 'f'],
      label: 'Middle row sum is 56',
      markerText: '56',
      markerTone: 'gold',
      params: { targetSum: 56 }
    },
    {
      id: 'has-dal',
      type: 'HAS_TEAM',
      regionCellIds: ['g', 'h'],
      label: 'Bottom-left pair includes DAL',
      markerText: 'DAL+',
      markerTone: 'purple',
      params: { teamAbbr: 'DAL' }
    },
    {
      id: 'has-bos',
      type: 'HAS_TEAM',
      regionCellIds: ['i'],
      label: 'Single tile is BOS',
      markerText: 'BOS+',
      markerTone: 'green',
      params: { teamAbbr: 'BOS' }
    }
  ],
  solution: {
    a: 'lal-23',
    b: 'gsw-30',
    c: 'phx-35',
    d: 'nyk-11',
    e: 'mia-22',
    f: 'gsw-23',
    g: 'dal-77',
    h: 'mil-34',
    i: 'bos-0'
  }
};

const ALT_PUZZLE: Puzzle = {
  puzzleId: 'p-jerseys-003',
  difficulty: 'base',
  board: {
    cols: 3,
    rows: 3,
    cells: [
      { id: 'a', x: 0, y: 0, zone: 'purple' },
      { id: 'b', x: 1, y: 0, zone: 'blue' },
      { id: 'c', x: 2, y: 0, zone: 'indigo' },
      { id: 'd', x: 0, y: 1, zone: 'purple' },
      { id: 'e', x: 1, y: 1, zone: 'slate' },
      { id: 'f', x: 2, y: 1, zone: 'indigo' },
      { id: 'g', x: 0, y: 2, zone: 'gold' },
      { id: 'h', x: 1, y: 2, zone: 'gold' },
      { id: 'i', x: 2, y: 2, zone: 'slate' }
    ]
  },
  trayTiles: [
    {
      id: 'gsw-30',
      playerId: 201939,
      season: '2025',
      teamAbbr: 'GSW',
      jerseyNumber: 30,
      colors: ['#1D428A', '#FFC72C']
    },
    {
      id: 'gsw-23',
      playerId: 203110,
      season: '2025',
      teamAbbr: 'GSW',
      jerseyNumber: 23,
      colors: ['#1D428A', '#FFC72C']
    },
    {
      id: 'lal-23',
      playerId: 2544,
      season: '2025',
      teamAbbr: 'LAL',
      jerseyNumber: 23,
      colors: ['#552583', '#FDB927']
    },
    {
      id: 'mia-22',
      playerId: 202710,
      season: '2025',
      teamAbbr: 'MIA',
      jerseyNumber: 22,
      colors: ['#98002E', '#F9A01B']
    },
    {
      id: 'nyk-11',
      playerId: 1628973,
      season: '2025',
      teamAbbr: 'NYK',
      jerseyNumber: 11,
      colors: ['#006BB6', '#F58426']
    },
    {
      id: 'dal-77',
      playerId: 1629029,
      season: '2025',
      teamAbbr: 'DAL',
      jerseyNumber: 77,
      colors: ['#00538C', '#B8C4CA']
    },
    {
      id: 'phx-35',
      playerId: 201142,
      season: '2025',
      teamAbbr: 'PHX',
      jerseyNumber: 35,
      colors: ['#1D1160', '#E56020']
    },
    {
      id: 'mil-34',
      playerId: 203507,
      season: '2025',
      teamAbbr: 'MIL',
      jerseyNumber: 34,
      colors: ['#00471B', '#EEE1C6']
    },
    {
      id: 'bos-0',
      playerId: 1628369,
      season: '2025',
      teamAbbr: 'BOS',
      jerseyNumber: 0,
      colors: ['#007A33', '#BA9653']
    }
  ],
  conditions: [
    {
      id: 'sum-top-row',
      type: 'SUM',
      regionCellIds: ['a', 'b', 'c'],
      label: 'Top row sum is 64',
      markerText: '64',
      markerTone: 'blue',
      params: { targetSum: 64 }
    },
    {
      id: 'sum-mid-row',
      type: 'SUM',
      regionCellIds: ['d', 'e', 'f'],
      label: 'Middle row sum is 57',
      markerText: '57',
      markerTone: 'gold',
      params: { targetSum: 57 }
    },
    {
      id: 'has-gsw',
      type: 'HAS_TEAM',
      regionCellIds: ['g', 'h'],
      label: 'Bottom-left pair includes GSW',
      markerText: 'GSW+',
      markerTone: 'purple',
      params: { teamAbbr: 'GSW' }
    },
    {
      id: 'has-dal',
      type: 'HAS_TEAM',
      regionCellIds: ['i'],
      label: 'Single tile is DAL',
      markerText: 'DAL',
      markerTone: 'green',
      params: { teamAbbr: 'DAL' }
    }
  ],
  solution: {
    a: 'gsw-30',
    b: 'lal-23',
    c: 'nyk-11',
    d: 'phx-35',
    e: 'bos-0',
    f: 'mia-22',
    g: 'mil-34',
    h: 'gsw-23',
    i: 'dal-77'
  }
};

const DAILY_PUZZLES: Record<string, Puzzle> = {
  '2026-02-25': DEFAULT_PUZZLE,
  '2026-02-26': ALT_PUZZLE
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Could not find #app root.');
}
const appRoot = app;

const todayDateKeyPT = getDateKeyPT(new Date(), ROLLOVER_HOUR_PT);
const puzzle = DAILY_PUZZLES[todayDateKeyPT] ?? DEFAULT_PUZZLE;
const tileById = new Map(puzzle.trayTiles.map((tile) => [tile.id, tile]));
const boardCellById = new Map(puzzle.board.cells.map((cell) => [cell.id, cell]));
const teamPaletteByAbbr = new Map<
  TeamAbbr,
  { primary: string; secondary: string }
>();
for (const tile of puzzle.trayTiles) {
  if (!teamPaletteByAbbr.has(tile.teamAbbr)) {
    teamPaletteByAbbr.set(tile.teamAbbr, {
      primary: tile.colors[0],
      secondary: tile.colors[1]
    });
  }
}
const conditionById = new Map(
  puzzle.conditions.map((condition) => [condition.id, condition])
);
const regions = buildRegionDefinitions(puzzle.conditions);
const regionByKey = new Map(regions.map((region) => [region.key, region]));
const conditionRegionKey = new Map(
  puzzle.conditions.map((condition) => [condition.id, getRegionKey(condition.regionCellIds)])
);
const regionConditionIds = new Map<string, string[]>();
for (const condition of puzzle.conditions) {
  const key = conditionRegionKey.get(condition.id) ?? '';
  const existing = regionConditionIds.get(key) ?? [];
  existing.push(condition.id);
  regionConditionIds.set(key, existing);
}
const cellRegionKeys = buildCellRegionIndex(regions);
assertNoOverlappingRegions(cellRegionKeys);

const state = {
  placements: new Map<string, string>(),
  selectedTileId: '' as string,
  didCheck: false,
  cursorCellId: puzzle.board.cells[0]?.id ?? '',
  focusedRegionKey: '' as string,
  dragState: null as DragState | null
};

appRoot.innerHTML = `
  <main class="screen">
    <header class="headline">
      <h1>JERSEYS</h1>
      <p>Drag and drop jerseys until every marker rule is satisfied.</p>
      <div class="meta">
        <span>Daily Puzzle</span>
        <span>${todayDateKeyPT}</span>
      </div>
    </header>

    <div class="workspace">
      <section class="play-column">
        <section class="board-wrap">
          <div id="board-shell" class="board-shell">
            <div id="board" class="board" aria-label="Jersey board"></div>
            <div id="markers" class="markers" aria-hidden="true"></div>
          </div>
        </section>

        <section class="tray-wrap">
          <div class="tray-label">Drag jersey to board (dropping on a filled cell swaps it)</div>
          <div id="tray" class="tray" aria-label="Jersey stash"></div>
        </section>
      </section>

      <aside class="side-panel">
        <section class="panel-block">
          <h2>Rules</h2>
          <div id="status" class="status">Fill the board, then check.</div>
          <div class="actions">
            <button id="check-btn" class="check-btn" type="button">Check board</button>
            <button id="reveal-btn" class="reveal-btn" type="button">Reveal</button>
            <button id="reset-btn" class="reset-btn" type="button">Reset</button>
          </div>
        </section>

        <section class="panel-block debug-block">
          <h2>Debug</h2>
          <pre id="debug" class="debug-pre"></pre>
        </section>
      </aside>
    </div>
  </main>
`;

const boardShellEl = must<HTMLDivElement>('#board-shell');
const boardEl = must<HTMLDivElement>('#board');
const markersEl = must<HTMLDivElement>('#markers');
const trayEl = must<HTMLDivElement>('#tray');
const statusEl = must<HTMLDivElement>('#status');
const debugEl = must<HTMLPreElement>('#debug');
const checkButtonEl = must<HTMLButtonElement>('#check-btn');
const revealButtonEl = must<HTMLButtonElement>('#reveal-btn');
const resetButtonEl = must<HTMLButtonElement>('#reset-btn');

checkButtonEl.addEventListener('click', () => {
  state.didCheck = true;
  render();
});

revealButtonEl.addEventListener('click', () => {
  state.placements.clear();
  for (const [cellId, tileId] of Object.entries(puzzle.solution)) {
    state.placements.set(cellId, tileId);
  }
  state.didCheck = true;
  state.selectedTileId = '';
  render();
});

resetButtonEl.addEventListener('click', () => {
  state.placements.clear();
  state.selectedTileId = '';
  state.didCheck = false;
  render();
});

document.addEventListener('keydown', (event) => {
  if (
    event.key === 'ArrowUp' ||
    event.key === 'ArrowDown' ||
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight'
  ) {
    event.preventDefault();
    moveCursor(event.key);
    render();
    return;
  }

  if (event.key === 'a' || event.key === 'A') {
    event.preventDefault();
    cycleSelectedTile(-1);
    render();
    return;
  }

  if (event.key === 'b' || event.key === 'B') {
    event.preventDefault();
    cycleSelectedTile(1);
    render();
    return;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleCellClick(state.cursorCellId);
  }
});

render();

(window as unknown as { render_game_to_text: () => string }).render_game_to_text =
  renderGameToText;
(window as unknown as { advanceTime: (ms: number) => void }).advanceTime = () => {
  render();
};

function render(): void {
  const conditionStatuses = evaluateConditions();
  const regionStatuses = evaluateRegionStatuses(conditionStatuses);
  const focusedRegion = state.focusedRegionKey
    ? regionByKey.get(state.focusedRegionKey) ?? null
    : null;
  const boardIsFull = isBoardFilled();
  const solved = boardIsFull && allConditionsPass(conditionStatuses);
  const shouldShowFailures = state.didCheck || boardIsFull;
  const invalidCellIds = new Set<string>();

  if (shouldShowFailures) {
    for (const condition of puzzle.conditions) {
      if (conditionStatuses[condition.id] === 'fail') {
        for (const cellId of condition.regionCellIds) {
          invalidCellIds.add(cellId);
        }
      }
    }
  }

  const boardWidth = puzzle.board.cols * CELL_SIZE + (puzzle.board.cols - 1) * CELL_GAP;
  const boardHeight = puzzle.board.rows * CELL_SIZE + (puzzle.board.rows - 1) * CELL_GAP;
  boardShellEl.style.width = `${boardWidth}px`;
  boardShellEl.style.height = `${boardHeight}px`;

  boardEl.innerHTML = '';
  for (const cell of puzzle.board.cells) {
    const cellNode = document.createElement('div');
    cellNode.className = `cell cell-${cell.zone}`;
    cellNode.setAttribute('role', 'button');
    cellNode.tabIndex = 0;
    const regionKeys = cellRegionKeys.get(cell.id) ?? [];
    if (regionKeys.length === 1) {
      const region = regionByKey.get(regionKeys[0]);
      if (region) {
        const tone = getRegionVisual(region);
        cellNode.classList.add('cell-region-tone');
        cellNode.style.setProperty('--region-cell-bg', tone.regionFill);
        cellNode.style.setProperty('--region-cell-border', tone.regionBorder);
      }
    }

    if (invalidCellIds.has(cell.id)) {
      cellNode.classList.add('cell-invalid');
    }
    if (cell.id === state.cursorCellId) {
      cellNode.classList.add('cell-cursor');
    }
    if (
      state.focusedRegionKey &&
      (cellRegionKeys.get(cell.id) ?? []).includes(state.focusedRegionKey)
    ) {
      cellNode.classList.add('cell-region-focus');
      if (focusedRegion) {
        const tone = getRegionVisual(focusedRegion);
        cellNode.style.setProperty(
          '--region-focus-bg',
          tone.regionFill
        );
        cellNode.style.setProperty(
          '--region-focus-border',
          tone.text
        );
      }
    }

    cellNode.dataset.cellId = cell.id;
    cellNode.style.left = `${cell.x * CELL_STEP}px`;
    cellNode.style.top = `${cell.y * CELL_STEP}px`;

    const tileId = state.placements.get(cell.id);
    if (tileId) {
      const tile = tileById.get(tileId);
      if (tile) {
        const tileNode = createTileNode(tile, true);
        tileNode.addEventListener('pointerdown', (event) => {
          beginDragTile(event, tile.id);
        });
        cellNode.appendChild(tileNode);
      }
    } else {
      const slot = document.createElement('span');
      slot.className = 'slot-dot';
      slot.setAttribute('aria-hidden', 'true');
      cellNode.appendChild(slot);
    }

    cellNode.addEventListener('click', () => handleCellClick(cell.id));
    cellNode.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCellClick(cell.id);
      }
    });

    boardEl.appendChild(cellNode);
  }

  markersEl.innerHTML = '';
  for (const marker of buildMarkerPlacements(regions)) {
    const tone = getRegionVisual(marker.region);
    const markerNode = document.createElement('div');
    markerNode.className = 'region-marker';
    markerNode.style.left = `${marker.left}px`;
    markerNode.style.top = `${marker.top}px`;
    markerNode.style.setProperty('--marker-bg', tone.bg);
    markerNode.style.setProperty('--marker-text', tone.text);

    const status = regionStatuses[marker.region.key];
    if (status === 'pass') {
      markerNode.classList.add('region-marker-pass');
    } else if (shouldShowFailures && status === 'fail') {
      markerNode.classList.add('region-marker-fail');
    }
    if (state.focusedRegionKey && marker.region.key === state.focusedRegionKey) {
      markerNode.classList.add('region-marker-focus');
    }

    const textNode = document.createElement('span');
    const markerHints = (regionConditionIds.get(marker.region.key) ?? [])
      .map((conditionId) => conditionById.get(conditionId)?.markerText ?? '')
      .filter((hint) => hint.length > 0);
    textNode.textContent = markerHints.join(' | ');
    markerNode.appendChild(textNode);

    const conditionLabels = (regionConditionIds.get(marker.region.key) ?? [])
      .map((conditionId) => conditionById.get(conditionId)?.label ?? conditionId)
      .join(' | ');
    markerNode.title = `${marker.region.id}: ${conditionLabels}`;

    markerNode.addEventListener('mouseenter', () => {
      state.focusedRegionKey = marker.region.key;
      render();
    });
    markerNode.addEventListener('mouseleave', () => {
      state.focusedRegionKey = '';
      render();
    });
    markerNode.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.focusedRegionKey =
        state.focusedRegionKey === marker.region.key ? '' : marker.region.key;
      render();
    });

    markersEl.appendChild(markerNode);
  }

  trayEl.innerHTML = '';
  for (const tile of puzzle.trayTiles) {
    if (isTilePlaced(tile.id)) {
      continue;
    }

    const tileNode = createTileNode(tile, false);
    if (state.selectedTileId === tile.id) {
      tileNode.classList.add('tile-selected');
    }

    tileNode.addEventListener('click', () => {
      if (state.dragState) {
        return;
      }

      state.selectedTileId = state.selectedTileId === tile.id ? '' : tile.id;
      render();
    });

    tileNode.addEventListener('pointerdown', (event) => {
      beginDragTile(event, tile.id);
    });

    trayEl.appendChild(tileNode);
  }

  if (solved) {
    statusEl.textContent = `Solved: ${todayDateKeyPT}`;
    statusEl.className = 'status status-success';
  } else if (boardIsFull && shouldShowFailures) {
    statusEl.textContent =
      'Board is full, but some regions are invalid. Check red markers.';
    statusEl.className = 'status status-fail';
  } else if (state.selectedTileId) {
    statusEl.textContent =
      'Tap or drop on any cell to place; placing on filled cell swaps to stash.';
    statusEl.className = 'status';
  } else {
    statusEl.textContent = 'Fill the board, then check.';
    statusEl.className = 'status';
  }

  const debugPayload = {
    dateKeyPT: todayDateKeyPT,
    puzzleId: puzzle.puzzleId,
    selectedTileId: state.selectedTileId || null,
    cursorCellId: state.cursorCellId,
    focusedRegionKey: state.focusedRegionKey || null,
    boardFilled: boardIsFull,
    solved,
    unplacedTiles: puzzle.trayTiles
      .filter((tile) => !isTilePlaced(tile.id))
      .map((tile) => tile.id),
    placements: puzzle.board.cells.map((cell) => {
      const tile = getTileAtCell(cell.id);
      return {
        cellId: cell.id,
        tileId: tile?.id ?? null,
        teamAbbr: tile?.teamAbbr ?? null,
        jerseyNumber: tile?.jerseyNumber ?? null
      };
    }),
    uncoveredConditionCells: puzzle.board.cells
      .filter(
        (cell) =>
          !puzzle.conditions.some((condition) =>
            condition.regionCellIds.includes(cell.id)
          )
      )
      .map((cell) => cell.id),
    conditionStatuses,
    regionStatuses,
    regions: regions.map((region) => ({
      id: region.id,
      key: region.key,
      cells: region.cellIds,
      conditionIds: regionConditionIds.get(region.key) ?? []
    }))
  };

  debugEl.textContent = JSON.stringify(debugPayload, null, 2);
}

function handleCellClick(cellId: string): void {
  state.cursorCellId = cellId;
  const existingTileId = state.placements.get(cellId);

  if (state.selectedTileId) {
    placeTileOnCell(state.selectedTileId, cellId);
    state.selectedTileId = '';
    state.didCheck = false;
    render();
    return;
  }

  if (existingTileId) {
    state.placements.delete(cellId);
    state.didCheck = false;
    render();
  }
}

function placeTileOnCell(tileId: string, cellId: string): void {
  if (!boardCellById.has(cellId)) {
    return;
  }

  for (const [placedCellId, placedTileId] of state.placements.entries()) {
    if (placedTileId === tileId) {
      state.placements.delete(placedCellId);
      break;
    }
  }

  state.placements.set(cellId, tileId);
}

function beginDragTile(event: PointerEvent, tileId: string): void {
  if (event.button !== 0) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const tile = tileById.get(tileId);
  if (!tile) {
    return;
  }

  const ghostEl = createTileNode(tile, true);
  ghostEl.classList.add('tile-ghost');
  document.body.appendChild(ghostEl);
  moveGhost(ghostEl, event.clientX, event.clientY);

  state.dragState = { tileId, ghostEl };

  const onPointerMove = (moveEvent: PointerEvent): void => {
    if (!state.dragState) {
      return;
    }
    moveGhost(state.dragState.ghostEl, moveEvent.clientX, moveEvent.clientY);
  };

  const onPointerUp = (upEvent: PointerEvent): void => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);

    const drag = state.dragState;
    state.dragState = null;

    if (!drag) {
      return;
    }

    drag.ghostEl.remove();

    const targetCell = document
      .elementFromPoint(upEvent.clientX, upEvent.clientY)
      ?.closest<HTMLElement>('.cell');

    if (!targetCell) {
      render();
      return;
    }

    const targetCellId = targetCell.dataset.cellId;
    if (!targetCellId) {
      render();
      return;
    }

    placeTileOnCell(drag.tileId, targetCellId);
    state.cursorCellId = targetCellId;
    state.selectedTileId = '';
    state.didCheck = false;
    render();
  };

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

function buildMarkerPlacements(regionDefs: RegionDefinition[]): MarkerPlacement[] {
  const placements: MarkerPlacement[] = [];

  for (const region of regionDefs) {
    const anchorCell = region.cellIds
      .map((id) => boardCellById.get(id))
      .filter((cell): cell is BoardCell => Boolean(cell))
      .sort((a, b) => {
        if (b.y !== a.y) {
          return b.y - a.y;
        }
        return b.x - a.x;
      })[0];

    if (!anchorCell) {
      continue;
    }

    placements.push({
      region,
      left: (anchorCell.x + 1) * CELL_STEP - CELL_GAP,
      top: (anchorCell.y + 1) * CELL_STEP - CELL_GAP
    });
  }

  return placements;
}

function evaluateRegionStatuses(
  conditionStatuses: Record<string, ConditionStatus>
): Record<string, ConditionStatus> {
  const statuses: Record<string, ConditionStatus> = {};

  for (const region of regions) {
    const ids = regionConditionIds.get(region.key) ?? [];
    const values = ids.map((id) => conditionStatuses[id]);

    if (values.some((status) => status === 'fail')) {
      statuses[region.key] = 'fail';
      continue;
    }
    if (values.length > 0 && values.every((status) => status === 'pass')) {
      statuses[region.key] = 'pass';
      continue;
    }
    statuses[region.key] = 'pending';
  }

  return statuses;
}

function getRegionKey(cellIds: string[]): string {
  return [...cellIds].sort().join('|');
}

function buildRegionDefinitions(conditions: Condition[]): RegionDefinition[] {
  const byKey = new Map<string, RegionDefinition>();
  let idx = 1;

  for (const condition of conditions) {
    const key = getRegionKey(condition.regionCellIds);
    if (byKey.has(key)) {
      continue;
    }

    byKey.set(key, {
      key,
      id: `R${idx}`,
      cellIds: [...condition.regionCellIds],
      markerTone: condition.markerTone
    });
    idx += 1;
  }

  return Array.from(byKey.values());
}

function buildCellRegionIndex(
  regionDefs: RegionDefinition[]
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const cell of puzzle.board.cells) {
    map.set(cell.id, []);
  }

  for (const region of regionDefs) {
    for (const cellId of region.cellIds) {
      const list = map.get(cellId) ?? [];
      list.push(region.key);
      map.set(cellId, list);
    }
  }

  return map;
}

function assertNoOverlappingRegions(cellToRegionKeys: Map<string, string[]>): void {
  const overlaps = Array.from(cellToRegionKeys.entries()).filter(
    ([, keys]) => keys.length > 1
  );
  if (overlaps.length > 0) {
    throw new Error(
      `Region overlap is not allowed. Overlapping cells: ${overlaps
        .map(([cellId]) => cellId)
        .join(', ')}`
    );
  }
}

function getRegionVisual(region: RegionDefinition): RegionVisual {
  const teamCondition = (regionConditionIds.get(region.key) ?? [])
    .map((conditionId) => conditionById.get(conditionId))
    .find(
      (condition): condition is Condition =>
        Boolean(
          condition &&
            (condition.type === 'HAS_TEAM' || condition.type === 'COUNT_TEAM') &&
            condition.params.teamAbbr
        )
    );

  if (teamCondition?.params.teamAbbr) {
    const palette = teamPaletteByAbbr.get(teamCondition.params.teamAbbr);
    if (palette) {
      return {
        bg: palette.primary,
        text: palette.secondary,
        regionFill: palette.primary,
        regionBorder: palette.secondary
      };
    }
  }

  return MARKER_TONE_COLORS[region.markerTone];
}

function evaluateConditions(): Record<string, ConditionStatus> {
  const statuses: Record<string, ConditionStatus> = {};

  for (const condition of puzzle.conditions) {
    const tiles = condition.regionCellIds.map((cellId) => getTileAtCell(cellId));

    if (tiles.some((tile) => tile === null)) {
      statuses[condition.id] = 'pending';
      continue;
    }

    const placedTiles = tiles as Tile[];
    let pass = false;

    if (condition.type === 'SUM') {
      const sum = placedTiles.reduce((acc, tile) => acc + tile.jerseyNumber, 0);
      pass = sum === condition.params.targetSum;
    }

    if (condition.type === 'HAS_TEAM') {
      pass = placedTiles.some((tile) => tile.teamAbbr === condition.params.teamAbbr);
    }

    if (condition.type === 'COUNT_TEAM') {
      const requiredCount = condition.params.requiredCount ?? 1;
      const count = placedTiles.filter(
        (tile) => tile.teamAbbr === condition.params.teamAbbr
      ).length;
      pass = count === requiredCount;
    }

    if (condition.type === 'HAS_EQUAL_NUMBERS') {
      const counts = new Map<number, number>();
      for (const tile of placedTiles) {
        counts.set(tile.jerseyNumber, (counts.get(tile.jerseyNumber) ?? 0) + 1);
      }
      pass = Array.from(counts.values()).some((count) => count > 1);
    }

    statuses[condition.id] = pass ? 'pass' : 'fail';
  }

  return statuses;
}

function getTileAtCell(cellId: string): Tile | null {
  const tileId = state.placements.get(cellId);
  if (!tileId) {
    return null;
  }
  return tileById.get(tileId) ?? null;
}

function isTilePlaced(tileId: string): boolean {
  for (const placedTileId of state.placements.values()) {
    if (placedTileId === tileId) {
      return true;
    }
  }
  return false;
}

function isBoardFilled(): boolean {
  return state.placements.size === puzzle.board.cells.length;
}

function allConditionsPass(statuses: Record<string, ConditionStatus>): boolean {
  return puzzle.conditions.every((condition) => statuses[condition.id] === 'pass');
}

function moveCursor(direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'): void {
  const currentCell = boardCellById.get(state.cursorCellId);
  if (!currentCell) {
    return;
  }

  const dx = direction === 'ArrowRight' ? 1 : direction === 'ArrowLeft' ? -1 : 0;
  const dy = direction === 'ArrowDown' ? 1 : direction === 'ArrowUp' ? -1 : 0;

  const nextCell = puzzle.board.cells.find(
    (cell) => cell.x === currentCell.x + dx && cell.y === currentCell.y + dy
  );
  if (nextCell) {
    state.cursorCellId = nextCell.id;
  }
}

function cycleSelectedTile(step: 1 | -1): void {
  const availableTiles = puzzle.trayTiles
    .filter((tile) => !isTilePlaced(tile.id))
    .map((tile) => tile.id);

  if (!availableTiles.length) {
    state.selectedTileId = '';
    return;
  }

  if (!state.selectedTileId || !availableTiles.includes(state.selectedTileId)) {
    state.selectedTileId =
      step > 0 ? availableTiles[0] : availableTiles[availableTiles.length - 1];
    return;
  }

  const currentIndex = availableTiles.indexOf(state.selectedTileId);
  const nextIndex =
    (currentIndex + step + availableTiles.length) % availableTiles.length;
  state.selectedTileId = availableTiles[nextIndex];
}

function createTileNode(tile: Tile, compact: boolean): HTMLDivElement {
  const tileNode = document.createElement('div');
  tileNode.className = `tile ${compact ? 'tile-compact' : ''}`;
  tileNode.dataset.tileId = tile.id;
  tileNode.style.setProperty('--team-primary', tile.colors[0]);
  tileNode.style.setProperty('--team-secondary', tile.colors[1]);

  const jersey = document.createElement('span');
  jersey.className = 'tile-jersey';

  const number = document.createElement('span');
  number.className = 'tile-number';
  number.textContent = String(tile.jerseyNumber);

  jersey.appendChild(number);
  tileNode.appendChild(jersey);

  return tileNode;
}

function moveGhost(ghostEl: HTMLElement, x: number, y: number): void {
  ghostEl.style.left = `${x - 30}px`;
  ghostEl.style.top = `${y - 34}px`;
}

function renderGameToText(): string {
  const conditionStatuses = evaluateConditions();

  return JSON.stringify({
    note: 'Coordinates are board-grid based with origin at top-left; +x right, +y down.',
    dateKeyPT: todayDateKeyPT,
    puzzleId: puzzle.puzzleId,
    selectedTileId: state.selectedTileId || null,
    cursorCellId: state.cursorCellId,
    placements: puzzle.board.cells.map((cell) => {
      const tile = getTileAtCell(cell.id);
      return {
        cellId: cell.id,
        x: cell.x,
        y: cell.y,
        teamAbbr: tile?.teamAbbr ?? null,
        jerseyNumber: tile?.jerseyNumber ?? null
      };
    }),
    conditions: puzzle.conditions.map((condition) => ({
      id: condition.id,
      regionId:
        regionByKey.get(conditionRegionKey.get(condition.id) ?? '')?.id ?? null,
      type: condition.type,
      markerText: condition.markerText,
      status: conditionStatuses[condition.id]
    })),
    boardFilled: isBoardFilled()
  });
}

function getDateKeyPT(now: Date, rolloverHour: number): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23'
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);

  const effective = new Date(Date.UTC(year, month - 1, day));
  if (hour < rolloverHour) {
    effective.setUTCDate(effective.getUTCDate() - 1);
  }

  return [
    effective.getUTCFullYear(),
    String(effective.getUTCMonth() + 1).padStart(2, '0'),
    String(effective.getUTCDate()).padStart(2, '0')
  ].join('-');
}

function must<T extends Element>(selector: string): T {
  const node = appRoot.querySelector<T>(selector);
  if (!node) {
    throw new Error(`Missing required node: ${selector}`);
  }
  return node;
}
