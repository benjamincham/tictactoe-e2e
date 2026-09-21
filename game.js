/**
 * @file game.js — pure tic-tac-toe game logic.
 *
 * Every function here is pure (no DOM, no globals, no mutation of its inputs)
 * so it can be unit tested with plain Node asserts and reused from `main.js`.
 * Loaded as a classic script in the browser and via `module.exports` in Node.
 */

/** @const {number} Number of cells on a tic-tac-toe board. */
const BOARD_SIZE = 9;

/** @const {''} Value stored in an empty cell. */
const EMPTY = '';

/** @const {ReadonlyArray<'X'|'O'>} The two players. */
const PLAYERS = ['X', 'O'];

/** @const {'X'} Mark played by the human. */
const HUMAN = 'X';

/** @const {'O'} Mark played by the computer. */
const COMPUTER = 'O';

/**
 * The eight winning lines: three rows, three columns, two diagonals. Each line
 * holds the three cell indexes that must carry the same non-empty mark.
 *
 * @const {ReadonlyArray<readonly [number, number, number]>}
 */
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * @typedef {''|'X'|'O'} Cell
 * @typedef {Cell[]} Board A 9-element array indexed 0..8, row by row.
 * @typedef {'X'|'O'|'draw'} GameResult A finished game's outcome.
 */

/**
 * Create an empty board.
 *
 * @returns {Board} A new 9-element array with every cell empty (`''`).
 *   A fresh array is returned on each call, so boards are never shared.
 */
function newBoard() {
  return new Array(BOARD_SIZE).fill(EMPTY);
}

/**
 * Place a move, returning a new board. The input board is never mutated.
 *
 * A move is illegal when the index is not an integer in `0..8`, the target
 * cell is already occupied, or `player` is not `'X'` or `'O'`. Illegal moves
 * are rejected with `null` rather than a partially applied board, so callers
 * can treat a falsy result as "nothing happened".
 *
 * @param {Board} board Board to play on.
 * @param {number} i Cell index, `0..8`, counted row by row from the top left.
 * @param {'X'|'O'} player Mark to place.
 * @returns {Board|null} A new board with the move applied, or `null` when the
 *   move is illegal.
 */
function placeMove(board, i, player) {
  if (!Array.isArray(board) || board.length !== BOARD_SIZE) {
    return null;
  }
  if (!Number.isInteger(i) || i < 0 || i >= BOARD_SIZE) {
    return null;
  }
  if (!PLAYERS.includes(player)) {
    return null;
  }
  if (board[i] !== EMPTY) {
    return null;
  }

  const next = board.slice();
  next[i] = player;
  return next;
}

/**
 * Report the winner of a position, if it is already decided.
 *
 * Internal to `checkWinner` and `bestMove`; the player-facing result banner is
 * F4's job.
 *
 * @param {Board} board Position to inspect.
 * @returns {'X'|'O'|null} The mark holding a complete line, else `null`.
 */
function winnerOf(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] !== EMPTY && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

/**
 * @param {Board} board Position to inspect.
 * @returns {boolean} `true` when no empty cell is left.
 */
function isFull(board) {
  return board.every((cell) => cell !== EMPTY);
}

/**
 * Report the outcome of a board (F4).
 *
 * The eight winning lines are checked first, so a line completed on a full
 * board is reported as a win rather than a draw. When no line is complete, a
 * board with no empty cell left is a draw and anything else is still in
 * progress. A malformed board has no outcome worth reporting, so it is treated
 * like `placeMove` treats a malformed move: rejected with `null`.
 *
 * @param {Board} board Board to inspect. Not mutated.
 * @returns {GameResult|null} `'X'` or `'O'` for the player holding a complete
 *   line, `'draw'` for a full board with no winner, or `null` while the game
 *   is still in progress (or the board is malformed).
 */
function checkWinner(board) {
  if (!Array.isArray(board) || board.length !== BOARD_SIZE) {
    return null;
  }

  const winner = winnerOf(board);
  if (winner !== null) {
    return winner;
  }

  return isFull(board) ? 'draw' : null;
}

/**
 * Score a position for the computer with minimax.
 *
 * Terminal scores are depth adjusted (`10 - depth` for a computer win,
 * `depth - 10` for a human win) so the computer prefers the win that arrives
 * soonest and the loss that arrives latest. Without that tiebreak it would be
 * indifferent between blocking now and losing a move later.
 *
 * @param {Board} board Position to score; decided positions are legal input.
 * @param {'X'|'O'} player Player to move in this position.
 * @param {number} depth Marks already placed, used to prefer faster outcomes.
 * @returns {number} Score from the computer's point of view, in `-9..9`.
 */
function minimax(board, player, depth) {
  const winner = winnerOf(board);
  if (winner === COMPUTER) {
    return 10 - depth;
  }
  if (winner === HUMAN) {
    return depth - 10;
  }
  if (isFull(board)) {
    return 0;
  }

  const opponent = player === COMPUTER ? HUMAN : COMPUTER;
  let best = player === COMPUTER ? -Infinity : Infinity;

  for (let i = 0; i < BOARD_SIZE; i += 1) {
    if (board[i] !== EMPTY) {
      continue;
    }
    const next = board.slice();
    next[i] = player;
    const score = minimax(next, opponent, depth + 1);
    best = player === COMPUTER ? Math.max(best, score) : Math.min(best, score);
  }

  return best;
}

/**
 * Pick the computer's move for a position (F3): plain minimax over the whole
 * remaining game tree, so `O` never loses a game it can draw and never misses
 * a win.
 *
 * Cells are scanned in index order and only a strictly better score replaces
 * the current choice, so equal-valued moves always resolve to the lowest
 * index — the result is deterministic rather than dependent on search order.
 * Only empty cells are ever considered, so the returned index is always
 * playable through `placeMove`.
 *
 * @param {Board} board Position with `O` to move.
 * @returns {number|null} An empty cell index `0..8`, or `null` when the board
 *   is malformed or the game is already over.
 */
function bestMove(board) {
  if (!Array.isArray(board) || board.length !== BOARD_SIZE) {
    return null;
  }
  if (winnerOf(board) !== null || isFull(board)) {
    return null;
  }

  let best = null;
  let bestScore = -Infinity;

  for (let i = 0; i < BOARD_SIZE; i += 1) {
    if (board[i] !== EMPTY) {
      continue;
    }
    const next = board.slice();
    next[i] = COMPUTER;
    const score = minimax(next, HUMAN, 1);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }

  return best;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BOARD_SIZE,
    EMPTY,
    PLAYERS,
    HUMAN,
    COMPUTER,
    WIN_LINES,
    newBoard,
    placeMove,
    checkWinner,
    bestMove,
  };
}
