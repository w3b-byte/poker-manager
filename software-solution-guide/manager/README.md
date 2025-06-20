# Poker Tournament Tracker — Vite + React + Material UI PWA

This project is an offline-first, modular, and maintainable PWA for tracking poker tournaments, built with Vite, React, Material UI, and Dexie.js (IndexedDB).

## Features
- Tournament scheduling
  - Add, edit, delete, and list tournaments
  - Fields: date, site, buy-in, game type, format, status, registration window, re-entry count, addon
- Session management
  - Track individual poker sessions within tournaments
  - Record start/end times, breaks, chip counts, bust-outs, notes
- Bankroll tracking
  - Monitor deposits, withdrawals, and balances
  - Visualize bankroll over time
- Analysis & reports
  - View stats by site, game type, format, ROI, ITM, and more
  - Export data (CSV, JSON)
- Fully offline-first (all data in your browser, no server required)
- Modern, accessible UI with Material UI
- Modular codebase for easy feature addition (cloud sync, etc.)
- PWA: installable, works offline, fast

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start development server:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```
4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Maintenance & Customization
- All data is stored locally (IndexedDB via Dexie.js)
- To add features, create new components/pages in `src/`
- For future cloud sync, add Firebase or similar as a new module
- See `copilot-instructions.md` for AI/human maintenance guidance

## Deployment
- Deploy static files (from `dist/`) to GitHub Pages or any static host

---

For more, see `FEATURES.md`, `DESIGN.md`, and `copilot-instructions.md`.
