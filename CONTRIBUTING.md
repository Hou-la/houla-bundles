# Contributing a bundle

Thanks for making Hou.la lives more fun! A few **hard rules** keep bundles safe, legal, and
high-quality. CI enforces the mechanical ones; a maintainer reviews the rest.

## 1. Artwork — ORIGINAL only

- Submit **only art you own or that is yours to license**. **No** ripped game textures, no
  logos/skins/characters from other games or brands, no AI output trained to mimic a specific
  franchise, no stock you don't have rights to.
- Put files under your bundle's `assets/` and reference them as `assets/<file>.png` in `bundle.json`.

**CI checks all of this** (`npm run validate`) — these are not suggestions:

| Rule | Value |
|---|---|
| Format | **PNG or WebP** — the actual bytes, not just the extension |
| Shape | **square** |
| Size | between **128×128** and **512×512** |
| Weight | **< 300 KB** per file |

Transparent background, please. If your art isn't square, pad it rather than squashing it:
`magick in.png -background none -gravity center -extent 512x512 out.png`.

**Targeting someone else's game?** Then `bundle.json` must set `notice` — a one-line disclaimer
that your pack is not affiliated with that publisher. CI rejects any bundle that sets `game`
without a `notice`. Example from the reference bundle:

```json
"game": "minecraft",
"notice": "Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft."
```

Don't put the trademark first in your bundle `name` either — name the pack (`"Survie"`), and let
`game` and `description` say what it is compatible with.

## 2. Effects — NON-DESTRUCTIVE only

The `effect` block is a **suggestion** the creator's connector may run on **their own machine**.
To keep community presets safe to share:

- Use the placeholder **`{player}`** / **`{sender}`** / **`{amount}`** — never hardcode names.
- **Forbidden** anywhere in a command/template (CI rejects them): `/stop`, `/ban`, `/op`,
  `/deop`, `/kick`, `/clear`, `/whitelist`, `/save-off`, `/save-all`, `/gamemode`, `op `,
  `shutdown`, `rm `, `del `, `format`, `mkfs`, `:(){`, `sudo`.
- Effect `type` is one of `rcon` | `obs` | `http` | `custom`. **`shell` is not allowed** in
  community bundles (arbitrary shell execution is a footgun).
- Add a `cooldownMs` (0–600000) to throttle spammy effects — the connector also applies its own
  per-slot debounce.

Effects are best-effort suggestions; the connector sanitizes placeholders and the creator can
override or disable any of them.

## 3. Reserved slots

Interactive gifts map onto **Hou.la's reserved, fixed-price slots** — you don't invent prices.
Valid slot slugs are `ix_slot_01` … `ix_slot_30` (cheap → premium). Each slot may appear **once**
per bundle. A bundle fills a subset; you don't have to use all 30.

The price of a slot is set by Hou.la (see the price ladder in the platform docs). Higher slots
trigger the full-screen "divine" moment on viewers; cheap ones a compact pill.

## 4. No confidential / personal data

This repo is **public**. Never commit tokens, server IPs, RCON passwords, personal data, or
anything you wouldn't post publicly. The `effect.command` is a template, not your real secrets —
the creator wires their own credentials locally in the connector, never here.

## 5. Test in the sandbox

Before opening a PR, dry-run your effects with the connector's sandbox:

```js
const { HoulaLiveConnection, loadPreset, applyPreset } = require('@houla/live-connector')

const conn = new HoulaLiveConnection({ token: 'sandbox' }) // no live/coins/connection needed
const preset = loadPreset('./bundles/<slug>/bundle.json')
applyPreset(conn, preset, {
  vars: { player: 'Steve' },
  onCommand: (cmd, gift) => console.log(gift.gift.slug, '→', cmd),
})
conn.simulateGift({ slug: 'ix_slot_09' })                  // fires the effect locally
```

## 6. Licensing

**You keep the copyright on your artwork.** Opening a PR grants Hou.la a non-exclusive,
worldwide licence to display it as interactive-gift artwork on the platform and its clients —
and you can ask for it to be removed later. Tooling and manifests in this repo are
[MIT](LICENSE).

The full terms, including what happens on withdrawal, are in **[LICENSE-ART.md](LICENSE-ART.md)**.
It's short. Read it before you submit — by opening a PR you're agreeing to it.

## Checklist

- [ ] `npm ci && npm run validate` passes locally
- [ ] Art is original, square PNG/WebP (128–512 px, < 300 KB) under `assets/`, referenced correctly
- [ ] `notice` is set if the pack targets a third-party game, and its trademark isn't the `name`
- [ ] Effects use `{player}`-style placeholders, no forbidden commands, `type` ≠ `shell`
- [ ] Slots are `ix_slot_01..99`, each used at most once (two digits: `ix_slot_100` is rejected)
- [ ] `coinCost`, when set, is one of the allowed tiers (see `schema/bundle.schema.json`) — several slots may share the same price
- [ ] No secrets / personal data anywhere
- [ ] A short `README.md` in your bundle folder with credits
- [ ] You've read [LICENSE-ART.md](LICENSE-ART.md) and the art is yours to license
