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

  for (const [a, b, c] of WIN_LINES) {
    const mark = board[a];
    if (mark !== EMPTY && mark === board[b] && mark === board[c]) {
      return mark;
    }
  }

  const isFull = board.every((cell) => cell !== EMPTY);
  return isFull ? 'draw' : null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BOARD_SIZE, EMPTY, PLAYERS, WIN_LINES, newBoard, placeMove, checkWinner };
}
