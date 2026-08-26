# AzarCloud — QA & Deployment (Sprint 6)

## PWA checklist

- [x] `public/manifest.json` — name, short_name, icons (192/512/maskable), theme_color, background_color, standalone display
- [x] `public/sw.js` — caches the app shell (`/`, `/index.html`, `/manifest.json`), network-first for navigation with offline fallback to `index.html`, cache-first for other GET requests
- [x] Service worker registered in `src/main.jsx` after `window.load`
- [x] `viewport-fit=cover` + `env(safe-area-inset-*)` used in `tokens.css`, header, bottom nav, dialogs, snackbar — safe for notch/home-indicator devices
- [x] `theme-color` meta tags for light/dark in `index.html`
- [ ] Replace placeholder icons in `public/icons/` with final artwork before shipping (see README)
- [ ] Add an "Update available" prompt (service worker `updatefound` → snackbar "New version available, refresh") — not yet wired; the SW currently updates silently on next load

## Responsive QA — widths to test

Test the app shell, dialogs, folder grid, file list, and upload queue at each width:

| Width | Device class | What to check |
|---|---|---|
| 360px | Small Android | Bottom nav labels don't wrap, FAB doesn't overlap content, dialog fits |
| 390px | iPhone | Safe-area padding, header height, touch targets |
| 430px | Large phone | Folder grid stays 2-column |
| 768px | Tablet / breakpoint | Sidebar appears, bottom nav hides, folder grid becomes 4-column |
| 1024px | Small laptop | Content max-width (960px) keeps line lengths reasonable |
| 1280px | Desktop | Sidebar + content proportions, dialogs center instead of sheet-from-bottom |
| 1440px | Large desktop | No excessive whitespace, content doesn't stretch edge-to-edge |

Known responsive rules already in place (`App.css`, `styles/shared.css`):
- Bottom nav ↔ sidebar swap at `768px`
- Folder grid: 2 columns under 768px, 4 columns at/above
- Dialog/ActionSheet: bottom sheet under 768px, centered modal at/above
- Breadcrumb: hidden under 768px (mobile uses back button instead), shown at/above

## Touch targets

All interactive elements use `--touch-target: 44px` (Button, IconButton, Input, bottom-nav items, file-row menu button, action-sheet items, dialog buttons). Verify with browser dev tools' touch-target overlay if available.

## Performance

- No heavy UI/animation libraries — only `lucide-react` (icons) and `react`/`react-dom`
- No client-side router library — custom ~40-line router in `src/router/router.jsx`
- Skeleton loading instead of spinners (`src/components/Skeleton.jsx`)
- Animations kept to 150–300ms, respect `prefers-reduced-motion` (see `tokens.css`)
- Before shipping: run `npm run build` and check `dist/` bundle size; lazy-load rarely-visited pages (Trash, Favorites) with `React.lazy` if bundle grows large

## Rendering / logic sanity check performed

- All 36 source files parsed successfully with `tsc --noEmit --jsx react-jsx --allowJs` (zero syntax errors)
- Every relative `import ... from "./..."` path verified to resolve to an existing file
- All named imports from `components/index.js` verified against its actual exports
- No page imports `data/mock.js` directly — only `src/services/CloudService.js` does, per the API-isolation rule

## What still needs a real browser + `npm install` to verify

These require an actual dev server and were not (and cannot be) executed in this environment (no network access to fetch npm packages):

- Visual review — nothing here has been screenshotted or rendered live
- Lighthouse PWA audit (installability, offline reload, manifest validity)
- Real mobile Safari/Chrome testing (safe-area insets, service worker registration behavior)
- Accessibility pass (screen reader labels, focus order, contrast ratios against the exact rendered colors)

## Deployment (Vercel)

```bash
npm install
npm run build       # outputs static site to /dist
```

1. Push this project to a GitHub repo.
2. In Vercel: **New Project → Import** the repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Deploy. Vercel serves static files over HTTPS, which is required for service workers and PWA installability.
5. Once a real backend exists, point `src/services/CloudService.js` at the AzarCloud API (see comments in that file) — no other file needs to change.

## Definition of Done — status

- [x] PWA works on mobile and desktop (manifest + service worker + responsive shell in place)
- [x] Dashboard is polished (My Cloud: storage ring, folders, recent files, FAB)
- [x] Folders work (nested browsing, breadcrumb, back nav)
- [x] Files work (detail page, context menu, download/rename/move/share/delete)
- [x] Search works (filename + type filter)
- [x] Upload UI works (queue, waiting/uploading/completed/failed/cancelled, cancel/retry)
- [x] Recent/Favorites/Trash work
- [x] Settings work (theme toggle)
- [x] Loading/empty/error/offline states exist
- [x] Dark mode works
- [x] API layer is isolated (`CloudService`, no direct mock imports outside it)
- [x] No secrets exist in frontend
- [x] No Telegram details are exposed anywhere in UI copy or code comments meant for users
- [ ] Verified live in a browser (needs `npm install` locally — not possible in this sandbox)
- [ ] PWA deployed to Vercel (deployment steps documented above, not yet executed)
