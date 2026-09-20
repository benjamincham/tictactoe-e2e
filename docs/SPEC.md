# SPEC — Tic Tac Toe (E2E test project)

Purpose: end-to-end test of the spec → tickets → auto-dispatch → auto-PR-merge pipeline. Minimal but complete web tic-tac-toe game.

## Users & scope
Single human player vs an unbeatable computer opponent, played in a browser. No accounts, no multiplayer.

## Features (user stories)

### F1 — Board rendering
As a player, I see a 3×3 grid so I can view the game state.
- `index.html` renders a 3×3 grid of clickable cells.
- Cell shows X, O, or empty.

### F2 — Human move (X)
As the player, I click an empty cell and my X appears there.
- Clicking an empty cell places X immediately.
- Clicking an occupied cell does nothing.

### F3 — Turn alternation & computer opponent (O)
As the player, after my move the computer plays O automatically.
- Computer moves only after the human move resolves.
- Computer never plays an occupied cell.

### F4 — Win / draw detection
As a player, I am told when the game ends and who won.
- 8 win lines (3 rows, 3 cols, 2 diagonals) checked after every move.
- Full board with no winner = draw.
- End state displayed with a result banner; no further moves accepted.

### F5 — Restart
As a player, I can start a new game at any time.
- A Restart button clears the board and state.

## Non-goals
AI difficulty settings, score keeping, animations, mobile layout polish.

## Acceptance
- Open `index.html` in a browser; play a full game; win, lose, and draw are all reachable; restart works.
- Pure static site: HTML + CSS + one JS file. No build step, no dependencies.
- All logic unit-testable as pure functions in `game.js` (board ops, winner check).

## Implementation notes
- `game.js` exports: `newBoard()`, `placeMove(board, i, player)`, `checkWinner(board)`, `bestMove(board)` (minimax, unbeatable).
- `main.js` wires DOM events to `game.js` functions.
- Tests: plain Node asserts in `test.js`, run with `node test.js` — must exit 0.
