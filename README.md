![make.fun competition](https://make.fun/badge/best-cooking-game-20261125-0137.svg)
![rank](https://make.fun/badge/best-cooking-game-20261125-0137/ELVINO1806/best-cooking-game-20261125-0137/rank.svg)
![reward](https://make.fun/badge/best-cooking-game-20261125-0137/ELVINO1806/best-cooking-game-20261125-0137/reward.svg)

# Sate Arang Senja

A charcoal satay grill game for the [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137) competition on make.fun.

Run one grill stall at dusk: grill skewers over glowing charcoal, chop lontong and onion, ladle peanut sauce, assemble each order on the plate, and serve it before the customer's patience runs out. Three recipes combine the same kitchen in different ways — sate ayam, sate kambing, and sate campur — and the last minute of the shift is rush hour.

## Play

Open `game/index.html` in a desktop browser (or serve `game/` with any static server, e.g. `python3 -m http.server --directory game`). No network, no build step, no libraries.

- Click a station, or use keys 1–5: **1** grill, **2** lontong, **3** sauce, **4** plate, **5** serve. **O** onion, **C** sambal, **T** change meat, **R** restart.
- Grill a skewer until it reads MATANG, then take it before it burns.
- Build the plate to match an order, move it to the pass when it reads SIAP, then serve.

Screenshot scenes: `?shot=start` (full kitchen), `?shot=play` (mid-assembly), `?shot=rush` (rush hour), `?shot=serve` (finished plate).

## The kitchen

One charcoal grill with four skewer slots, a chopping board with lontong, onion and sambal, a peanut-sauce pot, a plating counter and a serving pass. Orders arrive with a patience bar; the last minute of the three-minute shift is rush hour and orders arrive twice as fast. Serving a dish while its patience is high pays a bonus, and fast correct serves build a combo multiplier. A burnt skewer or a wrong serve costs coins.

## Files

- `game/` — the game: `index.html` plus `src/` (config, recipes, state, orders, input, render, staging, main)
- `main.ts` — copies `game/` and `screenshots/` to the output directory and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `screenshots/` — four renders of the game running in a browser
