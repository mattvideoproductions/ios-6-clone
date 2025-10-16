# Skeuomorphic Asset, Typography, and SFX Guidelines

This document explains how the iOS 6-inspired simulator curates, stores, and delivers its visual and audible assets. Follow these conventions to keep the experience authentic, performant, and license compliant.

## Directory Layout

```
assets/
  icons/            # Application icons in SVG (preferred) or PNG
  textures/         # Tileable background textures (SVG or PNG)
  wallpapers/       # Full-screen backgrounds (SVG + WebP derivatives)
  audio/            # Optional, self-hosted sound files (see notes below)
```

- **SVG first** – Every visual asset should have an SVG source when possible. Raster derivatives (`.png`, `.webp`) are acceptable for compatibility but should be generated from the source SVG to avoid divergence.
- **Filenames** – Use lowercase, dash-separated names (e.g., `ios6-aqua-blue.svg`).
- **No third-party binaries** – Only include assets created in-house or sourced from public-domain / compatible licenses. Document the creation steps or original source in a comment at the top of the SVG.

## Typography

`src/styles/typography.css` loads the open-source [Inter](https://rsms.me/inter/) family, which closely matches Helvetica Neue metrics. The font stack falls back to the system Helvetica Neue, Helvetica, and Arial to respect platform choices. If you have redistribution rights for Helvetica Neue, place the `.woff2` files in `src/fonts/helvetica-neue/` and extend the `@font-face` declarations accordingly.

## CSS Utilities for Skeuomorphism

Utility classes located in `src/styles/utilities.css` provide:

- Drop shadows and inset bevels (`.skeuo-shadow`, `.skeuo-bevel`, `.skeuo-glow`)
- Highlight overlays (`.skeuo-highlight`)
- Text embossing (`.skeuo-text-emboss`)
- Grain overlays (`.skeuo-grain`)

Apply these classes to component wrappers rather than individual elements so the shadows and highlights remain consistent across the simulator.

## Asset Manifest & Lazy Loading Pipeline

A small build step keeps asset metadata in sync with the codebase:

1. Run `npm run build:assets`.
2. `scripts/generate-asset-manifest.mjs` walks the `assets/` directory, collecting file size, format, and category metadata.
3. The script writes `assets/asset-manifest.json`, which the client consumes via `AssetLoader` (`src/scripts/asset-loader.js`).
4. `AssetLoader` exposes helpers to fetch assets on demand and prewarm categories so icons appear instantly while larger wallpapers/textures lazy-load.

You **must** rerun the script whenever you add, remove, or rename assets. The manifest is committed so downstream tooling can operate without running the build step.

### Adding New Assets

1. Place the asset in the appropriate directory.
2. For complex SVGs, include an HTML comment describing how it was built (e.g., “Created with Figma gradients + manual path cleanup on 2024‑10‑16”).
3. Generate any required raster derivatives (e.g., WebP) using a reproducible script. Save the script or command snippet in `docs/` or as a comment in the asset itself.
4. Run `npm run build:assets` to refresh the manifest.
5. Update `docs/ASSET_GUIDELINES.md` if new categories or workflows are introduced.

## Sound Effects

- The default simulator synthesizes lock, unlock, tap, and notification cues with the Web Audio API (`src/scripts/sound-manager.js`).
- To ship recorded sounds, place files inside `assets/audio/` using the canonical names `lock.*`, `unlock.*`, `tap.*`, and/or `notification.*`.
- Update the `AUDIO_FILE_OVERRIDES` map inside `sound-manager.js` with the relative paths and rerun `npm run build:assets` so the manifest captures the additions.
- Only include audio with redistribution rights compatible with Apache 2.0. When in doubt, keep the synthesized defaults.

## Contributor Checklist

- [ ] Verify the asset is original or properly licensed.
- [ ] Ensure SVG view boxes and shapes align with a 60 px grid (icons) or tiling constraints (textures).
- [ ] Export optimized SVG (remove metadata, collapse transforms). The existing assets demonstrate the expected structure.
- [ ] Provide WebP/PNG derivatives for large wallpapers or anything referenced directly in CSS backgrounds.
- [ ] Rerun `npm run build:assets` and inspect the diff.
- [ ] Test the simulator locally (`index.html`) to confirm lazy loading and sound cues operate as expected.

Following these steps keeps the simulator visually cohesive and performant while respecting licensing boundaries.
