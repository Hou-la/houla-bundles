# Contributing a bundle

Thanks for making Hou.la lives more fun! A few **hard rules** keep bundles safe, legal, and
high-quality. CI enforces the mechanical ones; a maintainer reviews the rest.

## 1. Artwork — ORIGINAL only

- Submit **only art you own or that is yours to license**. **No** ripped game textures, no
  logos/skins/characters from other games or brands, no AI output trained to mimic a specific
  franchise, no stock you don't have rights to.
- Formats: **PNG or WebP**, square, transparent background, ~512×512, < 300 KB each.
- Put files under your bundle's `assets/` and reference them as `assets/<file>.png` in `bundle.json`.

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
const { HoulaConnector } = require('@houla/live-connector')
const conn = new HoulaConnector({ key: 'hle_...' })      // or offline mode
conn.loadPreset('./bundles/<slug>/bundle.json')
conn.simulateGift({ slug: 'ix_slot_09' })                // fires the effect locally, no live/coins
```

## 6. Licensing

By opening a PR you confirm the art is yours to license and you grant **Hou.la a non-exclusive,
worldwide license to display it as interactive-gift artwork** on the platform and its clients.
You keep your copyright. Tooling/manifests in this repo are MIT.

## Checklist

- [ ] `npm ci && npm run validate` passes locally
- [ ] Art is original PNG/WebP under `assets/`, referenced correctly
- [ ] Effects use `{player}`-style placeholders, no forbidden commands, `type` ≠ `shell`
- [ ] Slots are `ix_slot_01..30`, each used at most once
- [ ] No secrets / personal data anywhere
- [ ] A short `README.md` in your bundle folder with credits
