# Poker Tournament Tracker

A lightweight, offline-first PWA for tracking online poker tournaments, optimizing multi-table sessions, and managing bankrolls across multiple poker sites. Built with HTML, CSS, JS, and IndexedDB—no frameworks required.

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

# Export/Import Specification for Poker Manager

## Supported Formats
- **CSV**: For Google Sheets compatibility (one file per data type)
- **JSON**: For full backup/restore (all data in one file)

---

## CSV Export Structure
### Tournament Sessions
| Date | Time | Site | Buy-in | GTD | Game Type | Format | Speed | Table Size | Field Size | Re-entries | Addon | Status | Finish Position | Finish Type | ITM | Bounty | Ticket | Bubble Insurance | Total Cashout | Profit/Loss | Notes |
|------|------|------|--------|-----|-----------|--------|-------|------------|------------|------------|-------|--------|-----------------|-------------|-----|--------|--------|------------------|---------------|-------------|-------|
|2025-06-18|19:00|PokerA|100|1000|NLHE|Freezeout|Turbo|9|1200|0|0|Completed|1|Victory|Y|50|0|N|1200|1100|...|

### Bankroll Transactions
| Date | Time | Type | Amount | Site | Currency | Running Balance | Tax Status | Tax Amount | Notes |
|------|------|------|--------|------|----------|-----------------|------------|------------|-------|
|2025-06-18|18:00|Deposit|500|PokerA|INR|500|N/A|0|...|

---

## JSON Export Structure
```json
{
  "tournaments": [ { ... }, ... ],
  "sessions": [ { ... }, ... ],
  "bankroll": [ { ... }, ... ],
  "siteConfig": [ { ... }, ... ],
  "taxRecords": [ { ... }, ... ]
}
```

---

## Import Process
- **CSV**: User selects a CSV file for each data type. The app parses and merges or replaces data.
- **JSON**: User selects a JSON file. The app restores all data, replacing or merging as needed.

---

## Backup/Restore Flow
1. **Export:**
   - User clicks “Export” → chooses CSV (for Sheets) or JSON (for full backup).
   - Files are downloaded to the user’s device.
2. **Import:**
   - User clicks “Import” → selects CSV or JSON file.
   - Data is validated and merged/restored.

---

## Edge Cases
- **Invalid file:** Show error message, do not import.
- **Duplicate records:** Option to skip, overwrite, or merge.
- **Partial data:** Warn user, allow manual correction.

---
If you need to resume or switch devices, just use this README!
