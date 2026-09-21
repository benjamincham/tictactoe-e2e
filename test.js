/**
 * @file test.js — unit tests for the pure logic in `game.js`.
 *
 * Plain Node asserts, no dependencies. Run with `node test.js`; exits 0 when
 * every check passes.
 */

'use strict';

const assert = require('node:assert/strict');
const { EMPTY, WIN_LINES, newBoard, placeMove, checkWinner, bestMove } = require('./game.js');

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

// --- bestMove ---------------------------------------------------------------

/**
 * The eight winning lines, restated here on purpose.
 *
 * The exhaustiveness tests below must not grade `game.js` with `game.js`'s own
 * idea of what a win is, so the oracle is duplicated rather than imported.
 *
 * @const {ReadonlyArray<[number, number, number]>}
 */
const LINES = [
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
 * Test oracle: report the winner of a position, if it is already decided.
 *
 * @param {Board} board Position to inspect.
 * @returns {'X'|'O'|null} The mark holding a complete line, else `null`.
 */
function winnerOf(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] !== EMPTY && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

/**
 * Test oracle: report whether a position has no empty cell left.
 *
 * @param {Board} board Position to inspect.
 * @returns {boolean} `true` when the board is full.
 */
function isFull(board) {
  return board.every((cell) => cell !== EMPTY);
}

test('bestMove takes a winning move instead of blocking', () => {
  // O completes the top row at 2; X is one move from completing the middle
  // row at 5. Winning beats blocking, so 2 is the only acceptable answer.
  const board = ['O', 'O', '', 'X', 'X', '', 'X', '', ''];
  assert.equal(winnerOf(board), null, 'fixture must still be live');
  assert.equal(bestMove(board), 2);
});

test('bestMove blocks an immediate human win', () => {
  // X threatens the top row; nothing else saves the game, so O must play 2.
  const board = ['X', 'X', '', 'O', '', '', '', '', ''];
  assert.equal(winnerOf(board), null, 'fixture must still be live');
  assert.equal(bestMove(board), 2);
});

test('bestMove blocks a diagonal human win', () => {
  // X threatens the 0-4-8 diagonal.
  const board = ['X', '', '', '', 'X', 'O', '', '', ''];
  assert.equal(winnerOf(board), null, 'fixture must still be live');
  assert.equal(bestMove(board), 8);
});

test('bestMove opens on an empty board with a playable cell', () => {
  const board = newBoard();
  const i = bestMove(board);

  assert.ok(Number.isInteger(i), `expected a cell index, got ${String(i)}`);
  assert.ok(i >= 0 && i < 9, `index ${i} is off the board`);
  assert.equal(board[i], EMPTY, 'the opening move must target an empty cell');
  assert.notEqual(placeMove(board, i, 'O'), null, 'the opening move must be playable');
  assert.equal(bestMove(board), i, 'bestMove must be deterministic');
  assert.deepEqual(board, newBoard(), 'bestMove must not touch the board');
});

test('bestMove never picks an occupied cell', () => {
  const boards = [
    newBoard(),
    ['X', '', '', '', '', '', '', '', ''],
    ['X', 'O', '', '', 'X', '', '', '', ''],
    ['X', 'O', 'X', 'O', '', '', 'X', '', ''],
    ['X', 'O', 'X', 'O', '', 'X', 'X', '', 'O'],
  ];

  for (const board of boards) {
    assert.equal(winnerOf(board), null, `fixture ${board.join('|')} must still be live`);
    const i = bestMove(board);
    assert.notEqual(i, null, `expected a move for ${board.join('|')}`);
    assert.equal(board[i], EMPTY, `cell ${i} is taken in ${board.join('|')}`);
  }
});

test('bestMove does not mutate the board it was given', () => {
  const board = ['X', 'O', '', '', 'X', '', '', '', ''];
  const before = board.slice();
  bestMove(board);
  assert.deepEqual(board, before);
});

test('bestMove returns null once the game is over', () => {
  const drawn = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
  assert.equal(winnerOf(drawn), null, 'fixture should be a draw');
  assert.equal(bestMove(drawn), null, 'a full board has no move left');
  assert.equal(bestMove(['X', 'X', 'X', 'O', 'O', '', '', '', '']), null, 'X has already won');
  assert.equal(bestMove(['O', 'O', 'O', 'X', 'X', '', '', '', '']), null, 'O has already won');
});

test('bestMove rejects a malformed board', () => {
  for (const board of [null, undefined, [], ['X'], 'XOXOXOXOX', {}]) {
    assert.equal(bestMove(board), null, `${JSON.stringify(board)} should be rejected`);
  }
});

test('bestMove never loses against every possible human strategy', () => {
  let games = 0;

  /**
   * Play out one branch from a live position where `O` is to move: `O` follows
   * `bestMove`, `X` tries every legal reply, and each finished game is checked.
   *
   * @param {Board} board Live position with `O` to move.
   * @returns {void}
   */
  function playout(board) {
    const i = bestMove(board);
    assert.notEqual(i, null, `O must have a move on ${board.join('|')}`);
    assert.equal(board[i], EMPTY, `O must not play taken cell ${i} in ${board.join('|')}`);

    const afterO = placeMove(board, i, 'O');
    assert.notEqual(afterO, null, `cell ${i} from bestMove must be playable`);

    if (winnerOf(afterO) !== null || isFull(afterO)) {
      games += 1;
      return;
    }

    for (let j = 0; j < 9; j += 1) {
      if (afterO[j] !== EMPTY) {
        continue;
      }

      const afterX = placeMove(afterO, j, 'X');
      assert.notEqual(afterX, null, `cell ${j} must be playable for X`);

      if (winnerOf(afterX) === 'X') {
        assert.fail(`O lost after X played ${j}: ${afterX.join('|')}`);
      }
      if (winnerOf(afterX) !== null || isFull(afterX)) {
        games += 1;
        continue;
      }

      playout(afterX);
    }
  }

  // The human opens in every one of the nine cells; the computer answers from
  // there, so this covers every line of play reachable against a perfect O.
  for (let first = 0; first < 9; first += 1) {
    playout(placeMove(newBoard(), first, 'X'));
  }

  assert.ok(games > 100, `expected a broad game tree, only explored ${games} games`);
});

console.log(`\n${passed} tests passed`);
