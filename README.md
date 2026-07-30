# Hou.la — Interactive Gift Bundles

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

Manifests + this tooling are MIT. **Artwork you submit stays under YOUR copyright**; by
opening a PR you grant Hou.la a license to display it as interactive-gift art on the platform
(see CONTRIBUTING.md → *Licensing*).
