# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/nurdiyanto-87/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/nurdiyanto-87/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice City Cover Studio is a multi-panel GTA-style cover maker: drop in up to three of your own photos, arrange them across a poster, add a title and tagline, and export the result as a PNG to share. It offers three poster sizes — Square 1080×1080, Portrait 1080×1350, and Wide 1920×1080 — with three layouts per size, per-panel crop and zoom (click a panel to select it, drag to reposition its photo), four colour grades (Vice Sunset, Neon Nights, Palm Dusk, Noir), and three lettering styles for the caption (heavy block white, sunset gradient, or neon pink glow). The poster is drawn on a canvas with a striped vapourwave sun, palm silhouettes, film grain, and a vignette, in an original design.

The app is plain static files under `app/` with no build step and no network requests: photos are read on your own machine and never uploaded. All artwork is drawn procedurally in code — no Rockstar Games logos, wordmarks, official artwork, characters, or font files are used. It was built for make.fun's "Make GTA 6 Cover Art" bounty ($250 in USDC).

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. `serve.ts` serves `app/` on port 8080 (pass `--port <n>` to use another port). Add up to three photos, pick a size and layout, write your title and tagline, and hit **Export PNG**.

<sub>Entered on [make.fun](https://make.fun/?ref=9ydfnnbk&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
