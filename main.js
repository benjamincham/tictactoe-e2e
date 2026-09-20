/**
 * @file main.js — DOM wiring for tic-tac-toe.
 *
 * Implements F1 (board rendering) and F2 (human move): the 3×3 grid shipped in
 * `index.html` is kept in sync with the board held here, and clicking an empty
 * cell places the human's `X`. Clicking an occupied cell does nothing.
 *
 * All rules live in `game.js`; this file only translates between DOM and state.
 */

(function () {
  'use strict';

  /** The human player's mark. */
  const HUMAN = 'X';

  /** @type {Board} Current game state. */
  let board = newBoard();

  const boardEl = document.getElementById('board');

  /** @type {HTMLElement[]} The nine cell elements, in board order (index 0..8). */
  const cells = Array.from(boardEl.querySelectorAll('.cell'));

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
   * Handle a click on a cell (F2): place `X` on empty cells only.
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
  }

  cells.forEach((cell) => cell.addEventListener('click', onCellClick));

  render();
})();
