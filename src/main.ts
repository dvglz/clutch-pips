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

interface MarkerPlacement {
  condition: Condition;
  left: number;
  top: number;
}

const ROLLOVER_HOUR_PT = 7;
const CELL_SIZE = 76;
const CELL_GAP = 6;
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
      id: 'sum-south-ramp',
      type: 'SUM',
      regionCellIds: ['d', 'g', 'h'],
      label: 'South ramp sum is 122',
      markerText: '122',
      markerTone: 'gold',
      params: { targetSum: 122 }
    },
    {
      id: 'sum-mid-spine',
      type: 'SUM',
      regionCellIds: ['a', 'd', 'e'],
      label: 'Mid spine sum is 56',
      markerText: '56',
      markerTone: 'purple',
      params: { targetSum: 56 }
    },
    {
      id: 'sum-center-column',
      type: 'SUM',
      regionCellIds: ['b', 'e', 'h'],
      label: 'Center stack sum is 86',
      markerText: '86',
      markerTone: 'slate',
      params: { targetSum: 86 }
    },
    {
      id: 'sum-east-wing',
      type: 'SUM',
      regionCellIds: ['a', 'c', 'f'],
      label: 'East wing sum is 81',
      markerText: '81',
      markerTone: 'blue',
      params: { targetSum: 81 }
    },
    {
      id: 'count-gsw',
      type: 'COUNT_TEAM',
      regionCellIds: ['b', 'c', 'f'],
      label: 'Blue wing has exactly 2 GSW jerseys',
      markerText: '2xGSW',
      markerTone: 'blue',
      params: { teamAbbr: 'GSW', requiredCount: 2 }
    },
    {
      id: 'equal-pair',
      type: 'HAS_EQUAL_NUMBERS',
      regionCellIds: ['a', 'f', 'h'],
      label: 'Diagonal pocket has equal jersey numbers',
      markerText: '==',
      markerTone: 'purple',
      params: {}
    },
    {
      id: 'has-mia',
      type: 'HAS_TEAM',
      regionCellIds: ['e', 'f', 'i'],
      label: 'East pocket includes MIA',
      markerText: 'MIA+',
      markerTone: 'green',
      params: { teamAbbr: 'MIA' }
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

const DAILY_PUZZLES: Record<string, Puzzle> = {
  '2026-02-25': DEFAULT_PUZZLE,
  '2026-02-26': DEFAULT_PUZZLE
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

const state = {
  placements: new Map<string, string>(),
  selectedTileId: '' as string,
  didCheck: false,
  cursorCellId: puzzle.board.cells[0]?.id ?? '',
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
          <h2>Conditions</h2>
          <ul id="conditions" class="conditions"></ul>
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
const conditionsEl = must<HTMLUListElement>('#conditions');
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
    if (invalidCellIds.has(cell.id)) {
      cellNode.classList.add('cell-invalid');
    }
    if (cell.id === state.cursorCellId) {
      cellNode.classList.add('cell-cursor');
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
  for (const marker of buildMarkerPlacements()) {
    const markerNode = document.createElement('div');
    markerNode.className = `region-marker marker-${marker.condition.markerTone}`;
    markerNode.style.left = `${marker.left}px`;
    markerNode.style.top = `${marker.top}px`;

    const status = conditionStatuses[marker.condition.id];
    if (status === 'pass') {
      markerNode.classList.add('region-marker-pass');
    } else if (shouldShowFailures && status === 'fail') {
      markerNode.classList.add('region-marker-fail');
    }

    const textNode = document.createElement('span');
    textNode.textContent = marker.condition.markerText;
    markerNode.appendChild(textNode);
    markerNode.title = marker.condition.label;

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

  conditionsEl.innerHTML = '';
  for (const condition of puzzle.conditions) {
    const conditionNode = document.createElement('li');
    conditionNode.className = 'condition';

    const status = conditionStatuses[condition.id];
    if (shouldShowFailures && status === 'fail') {
      conditionNode.classList.add('condition-fail');
    }
    if (status === 'pass') {
      conditionNode.classList.add('condition-pass');
    }

    const left = document.createElement('div');
    left.className = 'condition-left';
    left.textContent = condition.label;

    const right = document.createElement('div');
    right.className = 'condition-right';
    right.textContent = renderConditionStatus(status, shouldShowFailures);

    conditionNode.appendChild(left);
    conditionNode.appendChild(right);
    conditionsEl.appendChild(conditionNode);
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
    conditionStatuses
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

function buildMarkerPlacements(): MarkerPlacement[] {
  const placements: MarkerPlacement[] = [];
  const anchorStackCount = new Map<string, number>();

  for (const condition of puzzle.conditions) {
    const regionCells = condition.regionCellIds
      .map((id) => boardCellById.get(id))
      .filter((cell): cell is BoardCell => Boolean(cell));

    if (!regionCells.length) {
      continue;
    }

    const maxX = Math.max(...regionCells.map((cell) => cell.x));
    const maxY = Math.max(...regionCells.map((cell) => cell.y));
    const anchorKey = `${maxX}:${maxY}`;
    const stackIndex = anchorStackCount.get(anchorKey) ?? 0;
    anchorStackCount.set(anchorKey, stackIndex + 1);

    placements.push({
      condition,
      left: maxX * CELL_STEP + CELL_SIZE - 6,
      top: maxY * CELL_STEP + CELL_SIZE - 6 - stackIndex * 18
    });
  }

  return placements;
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

  const team = document.createElement('span');
  team.className = 'tile-team';
  team.textContent = tile.teamAbbr;

  jersey.appendChild(number);
  tileNode.appendChild(jersey);
  tileNode.appendChild(team);

  return tileNode;
}

function moveGhost(ghostEl: HTMLElement, x: number, y: number): void {
  ghostEl.style.left = `${x - 30}px`;
  ghostEl.style.top = `${y - 34}px`;
}

function renderConditionStatus(
  status: ConditionStatus,
  shouldShowFailures: boolean
): string {
  if (status === 'pass') {
    return 'OK';
  }
  if (status === 'fail' && shouldShowFailures) {
    return 'X';
  }
  return '...';
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
