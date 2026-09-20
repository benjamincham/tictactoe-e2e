/**
 * @file main.js — DOM wiring for tic-tac-toe.
 *
 * Implements F1 (board rendering), F2 (human move) and F5 (restart): the 3×3
 * grid shipped in `index.html` is kept in sync with the board held here,
 * clicking an empty cell places the human's `X`, and the Restart button clears
 * the board and the result banner at any point in the game.
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

  /** The result banner that announces a win or a draw. */
  const bannerEl = document.getElementById('banner');

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

  /**
   * Clear the result banner (F5).
   *
   * The text is emptied as well as hidden, so a stale announcement can never be
   * re-read by a screen reader when the next game ends.
   *
   * @returns {void}
   */
  function hideBanner() {
    bannerEl.textContent = '';
    bannerEl.hidden = true;
  }

  /**
   * Handle a click on Restart (F5): start a new game from scratch.
   *
   * Works mid-game and after a win or draw, because it replaces the whole board
   * rather than undoing moves one at a time.
   *
   * @returns {void}
   */
  function onRestartClick() {
    board = resetGame();
    hideBanner();
    render();
  }

  cells.forEach((cell) => cell.addEventListener('click', onCellClick));
  restartEl.addEventListener('click', onRestartClick);

  render();
})();
