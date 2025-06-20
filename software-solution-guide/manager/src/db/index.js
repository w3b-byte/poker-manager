// src/db/index.js
import Dexie from 'dexie';

// Main database for Poker Tournament Tracker
const db = new Dexie('PokerTournamentTracker');

db.version(1).stores({
  tournaments: '++id, date, site, buyIn, gameType, format, speed, tableSize, fieldSize, reEntryCount, addon, status',
  sessions: '++id, date, tournaments, notes',
  bankroll: '++id, date, type, amount, site, category, subcategory, notes',
  analysis: '++id, type, data, createdAt'
});

export default db;
