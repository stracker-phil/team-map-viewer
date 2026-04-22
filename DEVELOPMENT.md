# Development

## Prerequisites

- Node.js 20+
- npm (comes with Node)

## Getting started

```bash
npm install
npm run dev
```

Open **http://localhost:5173/team-map-viewer/** — the app loads with sample data automatically.

## Available commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Serve the production build locally |

## Working with data

The app has no data by default — on first load it shows built-in sample data (not persisted).

To test with your own data:
1. Run `npm run dev`
2. Navigate to **Import** in the nav
3. Paste or load your `entities.csv` and `claims.csv`
4. Click **Import** — the data is saved to `localStorage` and survives page reloads

To reset back to sample data, click **Clear all data** on the Import page.

## Deploying

Push to `main` — GitHub Actions builds and deploys automatically to GitHub Pages.

If the repo name ever changes, update `base` in `vite.config.ts` to match.
