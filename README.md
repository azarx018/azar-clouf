# AzarCloud — Frontend

A mobile-first Personal Cloud Storage PWA. Storage layer is an
implementation detail hidden entirely from the UI — the interface only
ever speaks in File / Folder / Upload / Download / Sync.

## Status: all 6 sprints complete (frontend)

- **Sprint 1 — Foundation + Design System**: PWA shell, design tokens
  (light/dark), typography (Space Grotesk / Inter / JetBrains Mono),
  signature **AtmosphereRing** gauge, 10+ reusable components, custom
  lightweight router (no react-router dependency).
- **Sprint 2 — Main App UI**: My Cloud dashboard (storage overview,
  folder grid, recent files, FAB upload), bottom nav (mobile) / sidebar
  (desktop), compact header.
- **Sprint 3 — Files, Folders, Search**: nested folder browsing with
  breadcrumb (desktop) / back nav (mobile), file detail page, shared
  file context menu (Download/Rename/Move/Share/Get info/Delete) with
  delete confirmation, global search with type filtering.
- **Sprint 4 — Upload + States + Secondary Pages**: upload queue
  (waiting/uploading/completed/failed/cancelled, cancel/retry),
  Favorites, Trash (restore / delete forever), loading skeletons, empty
  state, error state, offline banner.
- **Sprint 5 — API Layer**: single `CloudService` module isolates all
  data access. Every page calls `CloudService`, never mock data or
  `fetch()` directly — swap the internals for real API calls and no
  page needs to change.
- **Sprint 6 — PWA Polish + QA**: see `QA.md` for the full responsive
  checklist, touch-target audit, performance notes, and deployment
  steps.

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to /dist
```

## Icons

Placeholder icons are already generated in `public/icons/` (a simple
cloud mark on the brand gradient). Replace with final artwork before
shipping:

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/icon-maskable-512.png` (safe-zone padded for maskable use)

## Project structure

```
src/
  components/     Reusable UI primitives (Button, Card, Dialog, ActionSheet, ...)
  pages/          Route-level screens (MyCloud, Folder, FileDetail, Search, Upload, ...)
  router/         Minimal custom router (path state + navigate + goBack)
  services/       CloudService.js — the ONLY module that talks to data/backend
  data/           Mock data — only imported by CloudService (Sprint 5 isolation)
  hooks/          useAsync (loading/error wiring), useFileActions, useOnlineStatus
  styles/         tokens.css (design system) + shared.css (cross-page layout classes)
  theme.jsx       Light/dark theme provider
  pageTitle.jsx   Lets pages set the header's dynamic title (folder/file name)
  App.jsx         Shell: header, sidebar, bottom nav, route outlet
public/
  manifest.json   Web app manifest
  sw.js           Offline app-shell service worker
  icons/          App icons (placeholder — replace before shipping)
```

## Connecting the real backend

Everything the UI needs goes through `src/services/CloudService.js`.
Replace each method's mock implementation with a `fetch()` call to the
AzarCloud API — method signatures are already what a real cloud API
would look like (`getFiles`, `uploadFile`, `deleteFile`, `moveFile`,
`searchFiles`, ...). No component or page needs to change.

## Rules carried over from the brief

- PWA only — no Capacitor/Cordova/React Native/Electron/native code.
- The UI must never expose Telegram, Bot, Channel, Message ID, or file ID —
  only Cloud / File / Folder / Upload / Download / Sync.
- All backend calls go through `CloudService` — never call an API or
  touch mock data directly from a component (verified — see `QA.md`).
- No secrets, tokens, or channel IDs may ever live in this frontend.

## Known limitations (documented, not hidden)

- This project was built without network/npm access, so `npm install`
  and a live browser render have not been performed here — see the
  "What still needs a real browser" section in `QA.md`.
- Rename/Move actions currently show a snackbar placeholder
  ("coming soon") — wire these to real dialogs once the backend
  supports them.
- The service worker updates silently; an "update available" prompt is
  not yet implemented (noted in `QA.md`).
