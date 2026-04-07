# Sylumina — Project Context for Claude Code

## What This Is
A personal static HTML site hosted on GitHub Pages (`fushancen-bot/Sylumina`).
Single-page app: `journal.html` — a private journal with two modes:
- **碎碎念** (journal mode): timestamped entries with mood emoji, star, edit, delete
- **一天** (daily log mode): checklist items grouped by date

No frameworks, no build tools, no backend. All data in `localStorage`.

## Key Technical Constraints
- **GitHub Pages subdirectory**: hosted at `/Sylumina/` — ALL file paths must be relative (`./`, never `/`)
- **iOS auto-zoom**: `<textarea>` and `<input>` must have `font-size >= 16px`
- **Safari PWA icons**: `manifest.json` icons are ignored by Safari — must have `<link rel="apple-touch-icon" href="./icon.png">` in HTML head
- **Offline via Service Worker**: `sw.js` — currently v3. HTML uses network-first strategy; falls back to cache. `journal.html` must be in PRECACHE for offline-first-visit support.

## Files
- `journal.html` — main app (all HTML/CSS/JS inline)
- `sw.js` — service worker (cache version: `sylumina-journal-v3`)
- `manifest.json` — PWA manifest (relative paths, `./icon.png`)
- `icon.png` — home screen icon (proper PNG, not HEIC)
- `汇文明朝体.otf` — local Chinese font (URL-encoded in sw.js PRECACHE)

## localStorage Keys
- `xshan_journal` — journal entries array
- `xshan_daily` — daily log items array
- `xshan_font2` — selected font preference

## Design Notes
- Background: `#f6f2ec` (warm off-white)
- Font options: 汇文明朝体 (local), Noto Serif SC, Crimson Pro, EB Garamond, system
- Entry header shows time only for past entries; full date+time for today's entries
- Date separators show the date (or "今天"); entries show only time to avoid redundancy
- Completed log items: `rgba(90,74,56,0.45)` with strikethrough
- Time color in entry header: `rgba(90,74,56,0.5)`

## Deployment
- Push to `main` branch → GitHub Pages auto-deploys
- User is non-technical; always commit + push, never ask them to run commands
- Direct uploads to GitHub bypass PR flow — can cause merge conflicts on feature branches
