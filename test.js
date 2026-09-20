/**
 * @file test.js — unit tests for the pure logic in `game.js`.
 *
 * Plain Node asserts, no dependencies. Run with `node test.js`; exits 0 when
 * every check passes.
 */

'use strict';

const assert = require('node:assert/strict');
const { newBoard, placeMove, resetGame } = require('./game.js');

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

// --- resetGame (F5 restart) -------------------------------------------------

test('resetGame returns nine empty cells', () => {
  assert.equal(resetGame().length, 9);
  assert.deepEqual(resetGame(), ['', '', '', '', '', '', '', '', '']);
});

test('resetGame clears a board that was played on', () => {
  const played = placeMove(placeMove(newBoard(), 4, 'X'), 0, 'O');
  assert.deepEqual(played, ['O', '', '', '', 'X', '', '', '', '']);

  assert.deepEqual(resetGame(), newBoard());
  assert.deepEqual(played, ['O', '', '', '', 'X', '', '', '', '']);
});

test('resetGame returns a fresh array every restart', () => {
  const first = resetGame();
  const second = resetGame();
  assert.notEqual(first, second);
  first[0] = 'X';
  assert.deepEqual(second, newBoard());
});

test('every cell is playable again after a restart', () => {
  const restarted = resetGame();
  for (let i = 0; i < 9; i += 1) {
    const board = placeMove(restarted, i, 'X');
    assert.notEqual(board, null, `index ${i} should be playable after restart`);
    assert.equal(board[i], 'X');
  }
  assert.deepEqual(restarted, newBoard());
});

console.log(`\n${passed} tests passed`);
