/**
 * @file test.js — unit tests for the pure logic in `game.js`.
 *
 * Plain Node asserts, no dependencies. Run with `node test.js`; exits 0 when
 * every check passes.
 */

'use strict';

const assert = require('node:assert/strict');
const { WIN_LINES, newBoard, placeMove, checkWinner } = require('./game.js');

let passed = 0;

/**
 * Run one named test case.
 *
 * @param {string} name Test description shown in the output.
 * @param {() => void} fn Body; throws on failure via `assert`.
 * @returns {void}
 */
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

// --- newBoard ---------------------------------------------------------------

test('newBoard returns nine empty cells', () => {
  const board = newBoard();
  assert.equal(board.length, 9);
  assert.deepEqual(board, ['', '', '', '', '', '', '', '', '']);
});

test('newBoard returns a fresh array every call', () => {
  const a = newBoard();
  const b = newBoard();
  assert.notEqual(a, b);
  a[0] = 'X';
  assert.equal(b[0], '');
});

// --- placeMove --------------------------------------------------------------

test('placeMove puts the mark in the chosen cell', () => {
  const board = placeMove(newBoard(), 4, 'X');
  assert.deepEqual(board, ['', '', '', '', 'X', '', '', '', '']);
});

test('placeMove accepts both players', () => {
  const board = placeMove(placeMove(newBoard(), 0, 'X'), 8, 'O');
  assert.deepEqual(board, ['X', '', '', '', '', '', '', '', 'O']);
});

test('placeMove does not mutate the board it was given', () => {
  const before = newBoard();
  const after = placeMove(before, 2, 'X');
  assert.notEqual(after, before);
  assert.deepEqual(before, newBoard());
  assert.equal(after[2], 'X');
});

test('placeMove rejects a move onto an occupied cell', () => {
  const board = placeMove(newBoard(), 2, 'X');
  assert.equal(placeMove(board, 2, 'O'), null);
  assert.equal(placeMove(board, 2, 'X'), null);
  assert.deepEqual(board, ['', '', 'X', '', '', '', '', '', '']);
});

test('placeMove rejects indexes outside the board', () => {
  const board = newBoard();
  for (const i of [-1, 9, 100, 1.5, NaN, '4', null, undefined]) {
    assert.equal(placeMove(board, i, 'X'), null, `index ${String(i)} should be rejected`);
  }
  assert.deepEqual(board, newBoard());
});

test('placeMove rejects anything that is not a player mark', () => {
  const board = newBoard();
  for (const player of ['x', 'o', 'Z', '', null, undefined, 0]) {
    assert.equal(placeMove(board, 3, player), null, `player ${String(player)} should be rejected`);
  }
  assert.deepEqual(board, newBoard());
});

test('every cell of an empty board is playable', () => {
  for (let i = 0; i < 9; i += 1) {
    const board = placeMove(newBoard(), i, 'X');
    assert.notEqual(board, null, `index ${i} should be playable`);
    assert.equal(board[i], 'X');
  }
});

// --- checkWinner ------------------------------------------------------------

/** @const {ReadonlyArray<string>} Names for `WIN_LINES`, used in failure messages. */
const LINE_NAMES = [
  'top row',
  'middle row',
  'bottom row',
  'left column',
  'middle column',
  'right column',
  'top-left to bottom-right diagonal',
  'top-right to bottom-left diagonal',
];

/**
 * Build a board on which `player` holds every cell of one winning line.
 *
 * @param {readonly [number, number, number]} line Winning line to complete.
 * @param {'X'|'O'} player Mark to place on it.
 * @returns {Board} Board with the line completed by `player`.
 */
function boardWithLine(line, player) {
  let board = newBoard();
  for (const i of line) {
    board = placeMove(board, i, player);
  }
  return board;
}

test('checkWinner returns null for an empty board', () => {
  assert.equal(checkWinner(newBoard()), null);
});

test('checkWinner detects all eight winning lines for X', () => {
  assert.equal(WIN_LINES.length, 8, 'there must be exactly eight winning lines');
  WIN_LINES.forEach((line, n) => {
    assert.equal(
      checkWinner(boardWithLine(line, 'X')),
      'X',
      `${LINE_NAMES[n]} (${line.join('-')}) should win for X`,
    );
  });
});

test('checkWinner detects all eight winning lines for O', () => {
  assert.equal(WIN_LINES.length, 8, 'there must be exactly eight winning lines');
  WIN_LINES.forEach((line, n) => {
    assert.equal(
      checkWinner(boardWithLine(line, 'O')),
      'O',
      `${LINE_NAMES[n]} (${line.join('-')}) should win for O`,
    );
  });
});

test('checkWinner returns null while the game is ongoing', () => {
  const board = placeMove(placeMove(newBoard(), 0, 'X'), 4, 'O');
  assert.deepEqual(board, ['X', '', '', '', 'O', '', '', '', '']);
  assert.equal(checkWinner(board), null);
});

test('checkWinner does not treat two marks on a line as a win', () => {
  const board = placeMove(placeMove(placeMove(newBoard(), 0, 'X'), 4, 'O'), 1, 'X');
  assert.deepEqual(board, ['X', 'X', '', '', 'O', '', '', '', '']);
  assert.equal(checkWinner(board), null);
});

test('checkWinner stays null until the winning move is played', () => {
  let board = newBoard();

  board = placeMove(board, 0, 'X');
  board = placeMove(board, 3, 'O');
  assert.equal(checkWinner(board), null, 'one mark each is not a result');

  board = placeMove(board, 1, 'X');
  board = placeMove(board, 4, 'O');
  assert.equal(checkWinner(board), null, 'two in a row is not a result');

  board = placeMove(board, 2, 'X');
  assert.equal(checkWinner(board), 'X', 'the completed top row ends the game');
});

test('checkWinner returns draw for a full board with no winner', () => {
  const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
  assert.equal(board.includes(''), false, 'the board must be full');
  assert.equal(checkWinner(board), 'draw');
});

test('checkWinner reports a win rather than a draw on a full board', () => {
  const board = ['X', 'X', 'X', 'O', 'O', 'X', 'O', 'X', 'O'];
  assert.equal(board.includes(''), false, 'the board must be full');
  assert.equal(checkWinner(board), 'X');
});

test('checkWinner does not mutate the board it was given', () => {
  const winning = boardWithLine(WIN_LINES[6], 'X');
  const winningBefore = winning.slice();
  assert.equal(checkWinner(winning), 'X');
  assert.deepEqual(winning, winningBefore);

  // A full board takes the draw branch, so it is checked separately.
  const drawn = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
  const drawnBefore = drawn.slice();
  assert.equal(checkWinner(drawn), 'draw');
  assert.deepEqual(drawn, drawnBefore);
});

test('checkWinner returns null for a malformed board', () => {
  for (const board of [null, undefined, [], ['X', 'X', 'X'], 'XXXXXXXXX', 42]) {
    assert.equal(checkWinner(board), null, `${JSON.stringify(board)} should be rejected`);
  }
});

console.log(`\n${passed} tests passed`);
