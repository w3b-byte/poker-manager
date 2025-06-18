# Poker Tournament Tracker

A lightweight, offline-first PWA for tracking online poker tournaments, optimizing multi-table sessions, and managing bankrolls across multiple poker sites.

## Features
- Tournament scheduling (manual/bulk entry, calendar view coming soon)
- Session/result updates
- Bankroll tracking (multi-site/currency)
- Performance analysis (basic stats)
- IndexedDB local storage
- Manual import/export (JSON, Google Sheets compatible)
- Responsive, accessible UI
- PWA: Add to home screen, works offline

## Usage
1. Open `index.html` in your browser (or deploy to GitHub Pages).
2. Use the navigation to access Schedule, Sessions, Bankroll, Analysis, and Backup/Restore.
3. Export data for backup or Google Sheets. Import to restore.

## Development
- All code is in `index.html`, `main.js`, and `styles.css`.
- Service worker for offline support (`service-worker.js`).
- Manifest for PWA install (`manifest.json`).

## Run Locally
```
npx serve .
```
Or just open `index.html` directly.

## Version Control
```
git init && git add . && git commit -m "Initial commit"
```

## Roadmap
- Add calendar and bulk scheduling UI
- Add charts and advanced analysis
- CSV import/export for Google Sheets
- More accessibility and mobile optimizations
