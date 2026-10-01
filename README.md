# Hou.la — Interactive Gift Bundles

> **Building a Hou.la Connect pack or a game plugin? This repository is not the place.**
> The developer documentation lives at **https://hou.la/apps/houla-connect/developpeurs**
> (French and English): what Connect can drive (game plugins in `mod`, `rcon`, `ws` or `http`
> mode, OBS, keyboard, gamepad, HTTP, WebSocket, MQTT, OSC…), how to write a game plugin, the
> JSON format of a pack (schema 3), the security rules, how to pair a companion program over a
> local HTTP API, and a downloadable kit (verified example packs and plugins, an AI guide, the
> pack banner template). Added 2026-10-01, after a creator's AI read this README and concluded
> there was no documentation for Connect plugins.
>
> This repository only covers the **art bundles** described below (`bundle.json` + artwork),
> imported into the Hou.la gift catalogue. A Connect pack is a different file, written in the
> Connect Lab and published from the app.

📦 **`github.com/Hou-la/houla-bundles`** — submit or customize a pack via a Pull Request (see [CONTRIBUTING](CONTRIBUTING.md)).

Community **art packs** for [Hou.la](https://hou.la) **interactive live gifts**: when a
viewer sends an interactive gift during a live, it triggers a **real-world effect**
on the creator's setup (a Minecraft event via RCON, an OBS overlay, lights, an ASMR
trigger…). A *bundle* is the pack that gives those interactive gifts their **name +
artwork** (shown to viewers) and, optionally, a **suggested effect mapping** (used by
the [open-source connector](https://github.com/Hou-la/houla-live-connector)).

> **Two layers, on purpose.**
> - **Visual layer** (`name`, `image`) → curated by Hou.la, shown to viewers. Approved for IP/quality.
> - **Effect layer** (`effect`) → runs on the *creator's own machine* via the connector. Guidelines enforce non-destructive effects.

## How it works

```
   You (creator/artist)                Hou.la                         Viewer / Creator setup
 ───────────────────────      ───────────────────────      ─────────────────────────────────────
  1. Fork this repo             3. PR reviewed + CI          5. Creator ATTACHES the bundle to a
  2. Add bundles/<slug>/           validates schema             live from the Studio (never touches
     bundle.json + assets      4. Merge → imported into         GitHub) → viewers see the ⚡ gifts
     (open a Pull Request)         the Hou.la catalogue      6. A gift fires the connector effect
```

**You never run a server.** GitHub is only the **submission tunnel**; the Hou.la
database is the runtime catalogue the creator browses in a search modal at the Studio.

## Repository layout

```
bundles/<bundle-slug>/
  bundle.json        # the manifest (validated by CI against schema/bundle.schema.json)
  assets/            # your ORIGINAL artwork (PNG/WebP), referenced by bundle.json
  README.md          # short description + credits
schema/bundle.schema.json
scripts/validate.js  # what CI runs (also runnable locally: npm ci && npm run validate)
```

## Submit a bundle in 4 steps

1. **Fork** this repo.
2. Create `bundles/<your-bundle-slug>/bundle.json` + an `assets/` folder with your art. See
   [`bundles/minecraft/`](bundles/minecraft/) for a complete example.
3. Run `npm ci && npm run validate` locally until it passes.
4. Open a **Pull Request**. CI validates the schema + effect safety; a maintainer reviews the
   **artwork** (the effect is your responsibility on your own machine).

Read **[CONTRIBUTING.md](CONTRIBUTING.md)** first — it covers the hard rules (original art only,
non-destructive effects, reserved slots).

## License

Two regimes, on purpose:

- **Tooling + manifests** (`scripts/`, `schema/`, every `bundle.json`) — [MIT](LICENSE). Reuse them.
- **Artwork** (`bundles/*/assets/`) — **stays under YOUR copyright.** Opening a PR grants Hou.la a
  non-exclusive licence to display it as interactive-gift art on the platform, nothing more, and
  you can ask for it back. The full terms are in **[LICENSE-ART.md](LICENSE-ART.md)** — it is short
  and written to be read.

Packs targeting a third-party game must carry a `notice` disclaiming any affiliation with its
publisher; CI enforces it. The reference bundle is *Survie*, for Minecraft servers: **not an
official Minecraft product, not approved by or associated with Mojang or Microsoft.**
