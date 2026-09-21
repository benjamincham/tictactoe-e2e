/**
 * @file main.js — DOM wiring for tic-tac-toe.
 *
 * Implements F1 (board rendering), F2 (human move), F3 (computer opponent)
 * and F5 (restart): the 3×3 grid shipped in `index.html` is kept in sync with
 * the board held here, clicking an empty cell places the human's `X`, the
 * computer then answers with `O` on its own, and the Restart button throws
 * the current game away at any point — mid-game or after it has ended.
 * Clicking an occupied cell does nothing.
 *
 * All rules live in `game.js`; this file only translates between DOM and state.
 */

(function () {
  'use strict';

  /** @type {Board} Current game state. */
  let board = newBoard();

  const boardEl = document.getElementById('board');

  /** @type {HTMLElement[]} The nine cell elements, in board order (index 0..8). */
  const cells = Array.from(boardEl.querySelectorAll('.cell'));

  /** The Restart button. */
  const restartEl = document.getElementById('restart');

  /**
   * Build the accessible name for a cell.
   *
   * @param {number} i Cell index, `0..8`.
   * @param {Cell} player Current occupant of the cell.
   * @returns {string} e.g. `"Row 2, column 3: X"`.
   */
  function labelFor(i, player) {
    const row = Math.floor(i / 3) + 1;
    const col = (i % 3) + 1;
    return `Row ${row}, column ${col}: ${player === EMPTY ? 'empty' : player}`;
  }

  /**
   * Paint the current board onto the grid (F1).
   *
   * @returns {void}
   */
  function render() {
    cells.forEach((cell, i) => {
      const player = board[i];
      cell.textContent = player;
      cell.classList.toggle('cell--x', player === 'X');
      cell.classList.toggle('cell--o', player === 'O');
      cell.setAttribute('aria-label', labelFor(i, player));
    });
  }

  /**
   * Answer the human's move with the computer's `O` (F3).
   *
   * Called only once the human move has been applied and rendered, so `O`
   * never appears before `X`. `bestMove` returns `null` when the board is full
   * or already decided, which is the signal to stop replying.
   *
   * @returns {void}
   */
  function playComputerMove() {
    const i = bestMove(board);
    if (i === null) {
      return;
    }

    const next = placeMove(board, i, COMPUTER);
    if (next === null) {
      return;
    }

    board = next;
    render();
  }

  /**
   * Handle a click on a cell: place the human's `X` (F2), then let the
   * computer reply (F3).
   *
   * @param {MouseEvent} event Click event from a cell element.
   * @returns {void}
   */
  function onCellClick(event) {
    const i = Number(event.currentTarget.dataset.index);

    if (board[i] !== EMPTY) {
      return;
    }

    const next = placeMove(board, i, HUMAN);
    if (next === null) {
      return;
    }

    board = next;
    render();

    playComputerMove();
  }

  /**
   * Hide the result banner (F5).
   *
   * The text is emptied as well as hidden, so a stale announcement can never
   * be re-read by a screen reader after the next game ends. The banner element
   * itself belongs to F4; until it exists this is a silent no-op, so `main.js`
   * keeps working whether or not F4 has been merged.
   *
   * @returns {void}
   */
  function hideBanner() {
    const bannerEl = document.getElementById('banner');
    if (!bannerEl) {
      return;
    }
    bannerEl.textContent = '';
    bannerEl.hidden = true;
  }

  /**
   * Handle a click on Restart (F5): start a new game from scratch.
   *
   * Works mid-game and after a win or a draw, because the whole board is
   * replaced rather than moves being undone one at a time: `newBoard()` hands
   * back a fresh array, the cells are repainted from it and the result banner
   * is cleared.
   *
   * @returns {void}
   */
  function onRestartClick() {
    board = newBoard();
    hideBanner();
    render();
  }

  cells.forEach((cell) => cell.addEventListener('click', onCellClick));
  restartEl.addEventListener('click', onRestartClick);

  render();
})();
