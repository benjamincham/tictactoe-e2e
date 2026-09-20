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
 * @typedef {''|'X'|'O'} Cell
 * @typedef {Cell[]} Board A 9-element array indexed 0..8, row by row.
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BOARD_SIZE, EMPTY, PLAYERS, newBoard, placeMove };
}
