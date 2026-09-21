/**
 * @file main.js — DOM wiring for tic-tac-toe.
 *
 * Implements F1 (board rendering), F2 (human move), F3 (computer opponent),
 * F4 (win / draw detection) and F5 (restart): the 3×3 grid shipped in
 * `index.html` is kept in sync with the board held here, clicking an empty
 * cell places the human's `X`, the computer then answers with `O` on its own,
 * and every move is followed by a winner check. Once the game ends the result
 * is announced in a banner, the cells are disabled and further clicks are
 * ignored. The Restart button throws the current game away at any point —
 * mid-game or after it has ended. Clicking an occupied cell does nothing.
 *
 * All rules live in `game.js`; this file only translates between DOM and state.
 */

(function () {
  'use strict';

  /** @type {Board} Current game state. */
  let board = newBoard();

  /** Whether the game has ended, so no further move may be played (F4). */
  let gameOver = false;

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
   * Cells are disabled once the game is over, which both blocks further input
   * and exposes the finished state to assistive technology (F4).
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
      cell.disabled = gameOver;
    });
  }

  /**
   * Run the bookkeeping that follows every move (F4).
   *
   * This is the single place the finished-game check happens, so the human's
   * move and the computer's reply share one path instead of each duplicating
   * it. The banner is revealed before its text is written so the
   * `role="status"` region is already exposed when the announcement lands.
   *
   * @returns {void}
   */
  function afterMove() {
    const result = checkWinner(board);

    if (result !== null) {
      gameOver = true;
      bannerEl.hidden = false;
      bannerEl.textContent = result === 'draw' ? 'Draw!' : `${result} wins!`;
      render();
    }
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
    afterMove();
  }

  /**
   * Handle a click on a cell: place the human's `X` (F2), check for a result,
   * then let the computer reply (F3) — checked in turn (F4).
   *
   * Clicks are ignored once the game has ended, so a finished board can no
   * longer be changed (F4).
   *
   * @param {MouseEvent} event Click event from a cell element.
   * @returns {void}
   */
  function onCellClick(event) {
    if (gameOver) {
      return;
    }

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
    afterMove();

    if (!gameOver) {
      playComputerMove();
    }
  }

  /**
   * Handle a click on Restart (F5): start a new game from scratch.
   *
   * Works mid-game and after a win or a draw, because the whole board is
   * replaced rather than moves being undone one at a time: `newBoard()` hands
   * back a fresh array, `gameOver` is cleared so cells accept input again, the
   * cells are repainted from it and the result banner is cleared. The banner
   * text is emptied as well as hidden, so a stale announcement can never be
   * re-read by a screen reader after the next game ends.
   *
   * @returns {void}
   */
  function onRestartClick() {
    board = newBoard();
    gameOver = false;
    bannerEl.hidden = true;
    bannerEl.textContent = '';
    render();
  }

  cells.forEach((cell) => cell.addEventListener('click', onCellClick));
  restartEl.addEventListener('click', onRestartClick);

  render();
})();
