# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server at http://localhost:4321
npm run build      # Production build to dist/
npm run preview    # Build + run via wrangler dev (simulates Cloudflare env)
npm run deploy     # Build + deploy to Cloudflare Pages via wrangler
```

No test suite is configured. Verify changes by running the dev server.

## Architecture

**Stack:** Astro (static output) + React 19 + TypeScript, deployed on Cloudflare Pages via Wrangler.

`astro.config.mjs` declares `output: 'static'` but wires up `@astrojs/cloudflare` — this produces a `dist/_worker.js` bundle for Cloudflare Pages, not a plain static export. The `preview` script uses `wrangler dev` to replicate this environment locally.

### Component hierarchy and state flow

`src/pages/index.astro` → `src/layouts/Layout.astro` (HTML shell, SEO, GA loader) → `RulerApp.tsx` (root state)

`RulerApp.tsx` owns all shared state: `activeSides` (Set of positions), `unit`, `darkMode`, `guidelinesEnabled`. It renders four `RulerCanvas` instances (one per edge) unconditionally and passes `visible` to control rendering.

- **`RulerCanvas.tsx`** — Canvas API ruler. Uses `useRef` to capture a baseline `devicePixelRatio` at mount, then computes `zoom = currentDpr / baseDpr` on each draw to scale tick sizes correctly when the user zooms the browser. Listens for `resize` and a `matchMedia(resolution)` query to trigger redraws. Ruler thickness is 36px logical.

- **`Controls.tsx`** — Purely presentational. Receives all state as props. Renders as a centered floating panel on desktop and a bottom sheet on mobile (`window.innerWidth < 640`). Has its own local state for `hidden`, `isMobile`, and `fullscreen`.

- **`Guidelines.tsx`** — Crosshair overlay. Active only when `enabled`. Tracks mouse/touch position with document-level listeners. Click places a persistent `Marker`; Escape clears all markers. Coordinates are formatted per unit using CSS reference values (37.795 px/cm, 96 px/inch).

- **`CookieConsent.tsx`** — Gates Google Analytics. Stores consent in `localStorage['cookie-consent']`. GA script injection is handled by `window.__grantConsent()` defined inline in `Layout.astro`.

### z-index layering contract

| Layer | z-index |
|---|---|
| Ruler canvases | 1000 |
| Ad space | 1500 |
| Controls panel / bottom sheet | 2000 |
| Hide/Show toggle button | 2001 |
| Guidelines crosshair lines | 3000 |
| Guidelines coordinate tooltip / clear button | 3001 |

Do not assign z-index values between these layers without updating this table.

### Unit conversion constants

- `cm`: 37.795 px per cm (CSS physical reference at 96 dpi)
- `inch`: 96 px per inch (same standard)
- These constants appear in both `RulerCanvas.tsx` (tick generation) and `Guidelines.tsx` (coordinate display) — keep them in sync.

## Deployment

Deployed to `https://onlineruler.deviloper.dev` (Cloudflare Pages). Security response headers are configured in `public/_headers`. Wrangler config is in `wrangler.jsonc`.
