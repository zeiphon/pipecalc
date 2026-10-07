# Pipecalc

A frontend-only pipe bending calculator built with React + TypeScript (Vite), hosted on GitHub Pages.

## Development

```sh
npm install
npm run dev        # local dev server
npm test           # unit tests (Vitest)
npm run build      # typecheck + production build into dist/
```

## Deployment

Pushes to `main` deploy automatically via `.github/workflows/deploy.yml`.
One-time setup: repo **Settings → Pages → Source: GitHub Actions**.
