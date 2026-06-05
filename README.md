# Screen Ruler

A free, browser-based on-screen measurement tool. Overlays pixel-perfect rulers on the edges of your browser window to measure anything on your screen in real time.

## Features

- **Four-position rulers** — independently toggle rulers on the top, bottom, left, and right edges
- **Multiple units** — switch between pixels (px), centimeters (cm), and inches (in)
- **Interactive guidelines** — crosshair overlay follows your cursor with real-time coordinates; click to place persistent markers
- **Dark & light themes** — toggle between dark and light mode
- **Fullscreen support** — enter fullscreen for distraction-free measuring
- **Responsive** — works on desktop and mobile (bottom sheet controls on small screens)
- **Zero install** — no downloads, no extensions, just open the page

## Tech Stack

- [Astro](https://astro.build) — static site generation
- [React](https://react.dev) — UI components
- [TypeScript](https://www.typescriptlang.org) — type safety
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) — ruler rendering
- [Cloudflare Pages](https://pages.cloudflare.com) — deployment

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (default: http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Controls.tsx       # Control panel UI
│   ├── Guidelines.tsx     # Crosshair overlay & click markers
│   ├── RulerApp.tsx       # Root app component & state management
│   └── RulerCanvas.tsx    # Canvas-based ruler rendering
├── layouts/
│   └── Layout.astro       # HTML shell with SEO metadata
├── pages/
│   └── index.astro        # Entry page
└── styles/
    └── global.css         # Theme variables & global styles
```

## Deployment

The site is designed to be deployed as a static site on Cloudflare Pages:

```
screenruler.pages.dev
```

Build output goes to `dist/` with built-in `_headers` for security headers.

## License

MIT
