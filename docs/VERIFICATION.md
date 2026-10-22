# Verification record

Date: 2026-10-22. Target: Oliver's local Mac; native Chrome via the task-authorized extension surface. Production preview is loopback-only, currently http://127.0.0.1:55602/.

## Passed

- `npm test`: 6 deterministic engine/AI tests. Includes 100 seeded full matches (both win outcomes), legal non-overlapping 17-cell fleets, boundary/overlap rejection, duplicate and invalid shots, hit/miss/sunk, battle prerequisites, alternating turns after hits, immediate completion, and AI alignment/row-boundary/no-repeat/report-copy behavior.
- `npm run check`: syntax checks on engine, controller and browser harness.
- `python3 tests/static_check.py`: root runtime resources are present and local.
- Native Chrome `/tests/browser.html`: **5 groups, 24 assertions**. Manual placement, invalid bounds and overlap, keyboard rotation/navigation, ship movement, clear; repeated-input lock and concealed enemy fleet; restart while a real 650ms computer timer is pending; complete victory and loss matches; post-game lock; mobile 360px overflow check; synthetic touch event path; instructions and restart cancel.
- Native mouse selected A1. Native R, arrow and Return inputs rotated a ship, rejected overlap, then successfully placed the next ship. Launch and keyboard shot resulted in one human and one rival report and returned to the human turn.
- Desktop and narrow native Chrome screenshot inspection: paper/sea visual system renders, chart labels align, cards stack, no horizontal overflow. Temporary viewport override reset after QA.
- Browser logs had no application errors. Installed wallet-extension content scripts emitted unrelated listener/liveness warnings.
- Independent Spec review found no blocking gameplay defects. Its minor summary-count finding was corrected. Standards review found two maintainability issues: unbounded fleet generation and replacement of focused fleet controls. Generation now enumerates legal choices with bounded retries, and fleet controls persist across paints. Regression checks cover constant randomness and focus preservation.

## Limits

- Direct `file://` launch could not be browser-tested: the browser URL policy denied that navigation (HTTP/HTTPS only). No workaround was attempted. Scripts are classic relative local assets, but direct-file compatibility is a source-level claim until manually checked.
- Touch checks dispatch synthetic pointer/click events; no physical touchscreen was available. No screen-reader user acceptance or Safari/Firefox acceptance was performed.
- Browser test full matches use deterministic randomness and shorten the rival delay to 1ms inside the test iframe only. The restart-race check uses the real 650ms delay. There is no production debug export.
- CI checks rules, AI, syntax, static resources and whitespace. Native browser acceptance is local; CI does not run the browser harness.
- The computer is a fair hunt/target opponent, not a proof of optimal strategy. Reloading discards the current game.

## Review boundaries

New project reviewed against the empty initial directory and `docs/DESIGN.md`; no inherited repository files or Git history existed. Only this project was changed. Local memory was read for conventions and was not edited. Complete official GitHub `main/Global/Linux.gitignore`, `Windows.gitignore`, and `macOS.gitignore` templates were fetched on this date and embedded verbatim inside marked sections of `.gitignore`.
