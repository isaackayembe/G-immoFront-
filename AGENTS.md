# Repository Guidelines

G Business Immo is a React 19 + Vite + Tailwind v4 SPA for a Kinshasa real-estate agency. It has a public site plus an admin dashboard, and all data comes from a separate Django REST backend. This repo holds only the frontend.

## Project Structure & Module Organization

- `src/App.tsx` owns the only shared state: the `properties` list. It loads data (admin list when authenticated, otherwise the public list), applies optimistic updates for status/edit/delete, and passes callbacks down to screens. Screens in `src/screens/` get data and `onNavigate` as props; they do not fetch the property list themselves.
- Routing: URLs are defined once in `src/routes.ts` (`SCREEN_PATHS`, `pathFor`, `propertyPath`, `editPropertyPath`). Navigate with `onNavigate(screenId, transition)` and never hard-code paths. `/admin/*` routes are wrapped in `RequireAuth`.
- Page transitions are passed through router state (`{ transition }`). Scroll-reveal animation (`src/scrollReveal.ts` + `[data-rv]` in `src/index.css`) is applied automatically to public pages. Add `data-no-reveal` to opt a block out.
- `src/services/api.ts` is the single HTTP client. It stores the JWT in `localStorage` (`access_token`), converts DRF errors into readable messages, and sends snake_case fields in multipart uploads. Use `resolveImageUrl()` for every backend image.
- Types live in `src/types/api.ts`, which `src/types.ts` re-exports. Backend models and endpoints are specified in `API_CONTRACT_DJANGO.md`, so keep the types and the contract in sync.
- Branding, contact details, social links and the logo are centralized in `src/config.ts`. Do not add mock data because content must come from the API.
- `mockups/` holds standalone HTML design explorations and is not part of the build.

## Build, Test, and Development Commands

- `npm run dev`: Vite dev server on port 3000, bound to all interfaces (`0.0.0.0`).
- `npm run build` / `npm run preview`: production build to `dist/` and a local preview of it.
- `npm run lint`: runs a type check with `tsc --noEmit`. This is the only automated check.
- Set `VITE_API_BASE_URL` (see `.env.example`) to point at a local Django instance (`http://localhost:8000/api`). It defaults to the PythonAnywhere deployment.

There is no test framework configured.

## Coding Style & Naming Conventions

- TypeScript with the `@/*` alias mapped to the repo root. No ESLint or Prettier config exists, so match the surrounding code (2-space indent, single quotes, named exports for screens such as `export function OffresScreen`).
- UI text, comments and URL slugs are in **French** (`/a-propos`, `/connexion`, `?onglet=`).
- Style with Tailwind utility classes. Fonts are Playfair Display for headings and Hanken Grotesk for body text.

## Deployment

SPA fallback rewrites are provided for both Vercel (`vercel.json`) and Netlify-style hosts (`public/_redirects`). Keep both when changing hosting.

## Commit & Pull Request Guidelines

Early history uses Conventional Commits (`feat:`, `perf:`), while recent commits are free-form French (`Mise à jour`). Prefer `type: short description` going forward.
