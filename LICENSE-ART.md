# Artwork licence

This repository holds two different kinds of thing, under two different regimes. Read this
alongside [LICENSE](./LICENSE).

| What | Covers | Licence |
|---|---|---|
| **Tooling** | `scripts/`, `schema/`, `.github/`, `package.json` | [MIT](./LICENSE) — Hou.la |
| **Manifests** | every `bundles/*/bundle.json` | [MIT](./LICENSE) — they are configuration, not art |
| **Artwork** | everything under `bundles/*/assets/` | **stays with its author**, see below |

The `LICENSE` file at the root is plain MIT so that GitHub and licence scanners resolve the
repository correctly. It applies to the tooling and the manifests. **It does not apply to the
artwork**, which the contributor owns and which is governed by this document.

## What you keep

You keep the copyright on every image you submit. Nothing here transfers ownership, and you
remain free to license the same artwork to anyone else, on any terms, including exclusively —
the grant below is non-exclusive.

## What you grant Hou.la

By opening a pull request that adds or modifies files under `bundles/*/assets/`, you grant Hou.la
a **non-exclusive, worldwide, royalty-free, sublicensable** licence to reproduce, store, resize,
re-encode and publicly display that artwork:

- as interactive-gift artwork on the Hou.la platform and its clients (web, mobile, live overlays);
- in the Studio catalogue where creators browse and attach bundles;
- in reasonable promotion of the feature itself (screenshots, store listings, documentation).

Sublicensing is limited to what delivery requires — CDN, hosting and app-store distribution. It
is not permission to sell your artwork on as a standalone asset.

## What you promise

That the artwork is **yours to license**. Specifically: you made it, or you hold the rights to it;
it is not extracted from a game or an app; it does not reproduce a third party's characters,
logos, skins or trade dress; and it is not the output of a model prompted to imitate a specific
franchise or a named living artist's style.

If a pack targets a third-party game, the manifest must carry a `notice` disclaiming any
affiliation with that publisher. CI enforces this whenever `game` is set.

If a claim is made against artwork you submitted, we will take it down. Please don't put us both
in that position.

## Withdrawal

You can ask for your artwork to be removed at any time by opening an issue. We will remove it
from the repository and from the live catalogue within a reasonable delay, and it will stop being
attached to new lives.

The licence survives for uses already made — recordings, VODs, replays, cached copies and
screenshots published before removal — because we cannot rewrite the past. It does not survive
for anything new.

## What Hou.la does not promise

Merging a pull request is not a commitment to publish, keep or feature a bundle. We may decline,
unpublish or remove a bundle at any time, for quality, legal or product reasons, without owing
anything.

## Attribution

Credit your artwork in your bundle's `README.md`. Where the interface has room for it, we display
the bundle's `author`.

---

*This is the plain-language licence that governs contributions to this repository. It is not
legal advice, and it does not replace a written agreement for a commissioned or commercial
collaboration — talk to us first if that is what you have in mind.*
