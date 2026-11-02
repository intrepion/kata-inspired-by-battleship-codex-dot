# Quiet Meridian

An original, calm naval guessing game inspired by classic Battleship. Deploy five ships, read the water, and outwit a fair computer rival. Original SVG illustration, typography, interface and title; no third-party art, fonts, services or runtime dependencies.

## Play online

[Play Quiet Meridian](https://intrepion.github.io/kata-inspired-by-battleship-codex-dot/) — free, playable in your browser.

## Play locally

Open `index.html` directly in a modern browser, or run:

```sh
python3 server.py
```

The server prints a free **127.0.0.1-only** URL. Set `PORT=number` to request a specific free port. No build or installation is required. Keep the terminal running while playing; Ctrl-C stops this server alone.

## Controls and rules

- Select a ship, then click/tap its starting square. Rotate with the button or R while the chart is focused. Select a placed ship to move it. Shuffle and Clear are available before launch.
- Tab reaches controls. On a chart, arrows move; Home/End move to row edges; Enter/Space selects. Escape closes dialogs.
- Place ships of lengths 5, 4, 3, 3, 2 horizontally or vertically within the 10×10 board. No overlaps; adjacent ships are allowed.
- You fire first. One shot each, alternating even after a hit. Hits are ×; misses are •; fully hit ships turn rust. Sink every rival ship to win.
- New mission asks before clearing progress. Reload starts a fresh game. No persistent save, multiplayer, sounds, or telemetry.

The classic rules were checked against [Hasbro's official Battleship instructions](https://www.hasbro.com/common/instruct/battleship.pdf), pages 1–3, on 2026-10-22. This edition uses the name Cruiser for one 3-cell ship and Patrol boat for the 2-cell ship. First turn is assigned to the human instead of selected by agreement. Ship names do not affect rules. This project is unaffiliated with Hasbro.

## Verification

Node.js 20+:

```sh
npm test
npm run check
```

Serve locally and open `/tests/browser.html`, then select **Run browser checks**. The real game runs in an iframe, with deterministic random streams and a shortened computer delay for full matches. Tests cover placement, keyboard, input locking, full win/loss, restart during a pending turn, mobile layout and a synthetic touch path. They use DOM events and are distinct from native input acceptance. The production game has no debug state export or hidden-fleet test API.

See `docs/VERIFICATION.md` for actual results and limits, `docs/DESIGN.md` for scope/architecture, and `CONTEXT.md` for terms.

## Implementation

`engine.js` contains pure placement, shot, turn and result logic. `game.js` owns the DOM and cancellable computer delay. The AI receives copied shot reports only: it targets neighboring unresolved hits and otherwise searches a checkerboard before the remaining cells. It never receives fleet positions. This is an honest opponent, not an optimal probability solver. Ships are revealed when a match ends.

MIT licensed. No paid services or deployment are required.

## Arcade metadata

See [docs/arcade-metadata.md](docs/arcade-metadata.md) for the game-owned manifest and screenshot provenance.
