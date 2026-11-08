---
name: godot-web-cloudflare
description: Export a Godot 4 project to Web (HTML5) and deploy it to Cloudflare Pages so it runs on iPhone Safari and Android Chrome. Use whenever the user mentions export, build, deploy, hosting, Cloudflare, Safari, iPhone, web build, black screen, or "game won't load", even if they do not say "export".
---

# Godot Web export + Cloudflare Pages

## Project settings (set once)
- Rendering > Renderer > Rendering Method: `gl_compatibility`.
- Display > Window > Stretch: Mode `canvas_items`, Aspect `expand`.
- Display > Window > Size: base 1920x1080 (landscape).
- Input Devices > Pointing > Emulate Touch From Mouse: ON (PC testing).

## Export preset
1. Project > Export > Add... > Web. Install export templates if prompted (Editor > Manage Export Templates).
2. Turn **Thread Support OFF** (Godot 4.3+). Single-threaded builds run on iOS Safari without special headers.
3. Export path: `build/web/index.html`. Do not commit `build/` to git.
4. Keep VRAM texture compression for the web preset enabled only if needed; prefer small textures.

## Local test
Browsers block wasm from `file://`. Serve locally:
`python -m http.server 8080 --directory build/web` then open `http://localhost:8080`.
Test on the real iPhone via the Cloudflare preview URL, not only desktop.

## Deploy to Cloudflare Pages
Option A (simplest): Cloudflare dashboard > Workers & Pages > Create > Pages > Upload assets > drag the `build/web` folder.
Option B (CLI): `npx wrangler pages deploy build/web --project-name nihongo-quest`.

## Optional `_headers` file (put in build/web)
Only needed if Thread Support is ON. Single-thread builds do not need it.
```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```
(If you load third-party resources, COEP can break them. Prefer single-thread.)

## Limits and gotchas (verify against current Cloudflare docs when in doubt)
- Per-file size limit on Pages is about 25 MiB; the `.wasm` and `.pck` must each stay below it.
  If `.pck` is too big: shrink textures/audio, subset fonts, split content packs, or load heavy audio on demand.
- Large uploads: enable compression is handled by Cloudflare automatically for common types.
- Safari audio only plays after a user gesture. Always show a "Tap to start" screen.
- Hard-refresh or use a new deploy URL when testing, caches hide fixes.

## Debug checklist
Black/blank screen: check browser console; confirm Compatibility renderer; confirm Thread Support matches headers; confirm files uploaded completely.
