// Poker Tournament Tracker - main.js

// IndexedDB setup
const DB_NAME = 'pokerTrackerDB';
const DB_VERSION = 1;
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function (event) {
      db = event.target.result;
      if (!db.objectStoreNames.contains('tournaments')) {
        db.createObjectStore('tournaments', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('bankrolls')) {
        db.createObjectStore('bankrolls', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = function (event) {
      db = event.target.result;
      resolve(db);
    };
    request.onerror = function (event) {
      reject(event.target.error);
    };
  });
}

async function addTournament(tournament) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tournaments', 'readwrite');
    const store = tx.objectStore('tournaments');
    const req = store.add(tournament);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

async function getTournaments() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tournaments', 'readonly');
    const store = tx.objectStore('tournaments');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e);
  });
}

async function deleteTournament(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tournaments', 'readwrite');
    const store = tx.objectStore('tournaments');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

async function addSession(session) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const req = store.add(session);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

async function getSessions() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e);
  });
}

async function deleteSession(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

async function addBankroll(bankroll) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bankrolls', 'readwrite');
    const store = tx.objectStore('bankrolls');
    const req = store.add(bankroll);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

async function getBankrolls() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bankrolls', 'readonly');
    const store = tx.objectStore('bankrolls');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e);
  });
}

async function deleteBankroll(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bankrolls', 'readwrite');
    const store = tx.objectStore('bankrolls');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

async function getStats() {
  const tournaments = await getTournaments();
  const sessions = await getSessions();
  const totalTournaments = tournaments.length;
  const totalSessions = sessions.length;
  const totalBuyin = sessions.reduce((sum, s) => sum + (s.buyin || 0), 0);
  const totalCashout = sessions.reduce((sum, s) => sum + (s.cashout || 0), 0);
  const netProfit = totalCashout - totalBuyin;
  const winSessions = sessions.filter(s => s.cashout > s.buyin).length;
  const winRate = totalSessions ? (winSessions / totalSessions * 100).toFixed(1) : '0.0';
  return {
    totalTournaments,
    totalSessions,
    totalBuyin,
    totalCashout,
    netProfit,
    winRate
  };
}

function renderScheduleView() {
  document.getElementById('app').innerHTML = `
    <h2>Schedule</h2>
    <form id="tournament-form">
      <input type="text" id="tournament-name" placeholder="Tournament Name" required />
      <input type="datetime-local" id="tournament-date" required />
      <input type="number" id="tournament-buyin" placeholder="Buy-in ($)" min="0" step="0.01" required />
      <button type="submit">Add Tournament</button>
    </form>
    <ul id="tournament-list"></ul>
  `;
  document.getElementById('tournament-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('tournament-name').value.trim();
    const date = document.getElementById('tournament-date').value;
    const buyin = parseFloat(document.getElementById('tournament-buyin').value);
    if (!name || !date || isNaN(buyin)) return;
    await addTournament({ name, date, buyin });
    renderTournamentList();
    e.target.reset();
  };
  renderTournamentList();
}

async function renderTournamentList() {
  const list = document.getElementById('tournament-list');
  if (!list) return;
  const tournaments = await getTournaments();
  list.innerHTML = tournaments.length
    ? tournaments.map(t => `<li><strong>${t.name}</strong> - ${new Date(t.date).toLocaleString()} - $${t.buyin.toFixed(2)} <button data-id="${t.id}" class="delete-btn">Delete</button></li>`).join('')
    : '<li>No tournaments scheduled.</li>';
  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = Number(btn.getAttribute('data-id'));
      await deleteTournament(id);
      renderTournamentList();
    });
  });
}

function renderSessionsView() {
  document.getElementById('app').innerHTML = `
    <h2>Sessions</h2>
    <form id="session-form">
      <input type="datetime-local" id="session-date" required />
      <input type="number" id="session-buyin" placeholder="Buy-in ($)" min="0" step="0.01" required />
      <input type="number" id="session-cashout" placeholder="Cashout ($)" min="0" step="0.01" required />
      <input type="text" id="session-site" placeholder="Site (optional)" />
      <button type="submit">Log Session</button>
    </form>
    <ul id="session-list"></ul>
  `;
  document.getElementById('session-form').onsubmit = async (e) => {
    e.preventDefault();
    const date = document.getElementById('session-date').value;
    const buyin = parseFloat(document.getElementById('session-buyin').value);
    const cashout = parseFloat(document.getElementById('session-cashout').value);
    const site = document.getElementById('session-site').value.trim();
    if (!date || isNaN(buyin) || isNaN(cashout)) return;
    await addSession({ date, buyin, cashout, site });
    renderSessionList();
    e.target.reset();
  };
  renderSessionList();
}

async function renderSessionList() {
  const list = document.getElementById('session-list');
  if (!list) return;
  const sessions = await getSessions();
  list.innerHTML = sessions.length
    ? sessions.map(s => `<li>${new Date(s.date).toLocaleString()} - Buy-in: $${s.buyin.toFixed(2)}, Cashout: $${s.cashout.toFixed(2)}${s.site ? `, Site: ${s.site}` : ''} <button data-id="${s.id}" class="delete-session-btn">Delete</button></li>`).join('')
    : '<li>No sessions logged.</li>';
  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-session-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = Number(btn.getAttribute('data-id'));
      await deleteSession(id);
      renderSessionList();
    });
  });
}

function renderBankrollView() {
  document.getElementById('app').innerHTML = `
    <h2>Bankroll</h2>
    <form id="bankroll-form">
      <input type="text" id="bankroll-site" placeholder="Site" required />
      <input type="text" id="bankroll-currency" placeholder="Currency (e.g. USD)" required />
      <input type="number" id="bankroll-amount" placeholder="Amount" step="0.01" required />
      <button type="submit">Add/Update</button>
    </form>
    <ul id="bankroll-list"></ul>
  `;
  document.getElementById('bankroll-form').onsubmit = async (e) => {
    e.preventDefault();
    const site = document.getElementById('bankroll-site').value.trim();
    const currency = document.getElementById('bankroll-currency').value.trim();
    const amount = parseFloat(document.getElementById('bankroll-amount').value);
    if (!site || !currency || isNaN(amount)) return;
    await addBankroll({ site, currency, amount });
    renderBankrollList();
    e.target.reset();
  };
  renderBankrollList();
}

async function renderBankrollList() {
  const list = document.getElementById('bankroll-list');
  if (!list) return;
  const bankrolls = await getBankrolls();
  list.innerHTML = bankrolls.length
    ? bankrolls.map(b => `<li><strong>${b.site}</strong> - ${b.currency} $${b.amount.toFixed(2)} <button data-id="${b.id}" class="delete-bankroll-btn">Delete</button></li>`).join('')
    : '<li>No bankrolls tracked.</li>';
  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-bankroll-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = Number(btn.getAttribute('data-id'));
      await deleteBankroll(id);
      renderBankrollList();
    });
  });
}

async function getStats() {
  const tournaments = await getTournaments();
  const sessions = await getSessions();
  const totalTournaments = tournaments.length;
  const totalSessions = sessions.length;
  const totalBuyin = sessions.reduce((sum, s) => sum + (s.buyin || 0), 0);
  const totalCashout = sessions.reduce((sum, s) => sum + (s.cashout || 0), 0);
  const netProfit = totalCashout - totalBuyin;
  const winSessions = sessions.filter(s => s.cashout > s.buyin).length;
  const winRate = totalSessions ? (winSessions / totalSessions * 100).toFixed(1) : '0.0';
  return {
    totalTournaments,
    totalSessions,
    totalBuyin,
    totalCashout,
    netProfit,
    winRate
  };
}

function renderAnalysisView() {
  document.getElementById('app').innerHTML = `
    <h2>Analysis</h2>
    <ul>
      <li>Total Tournaments: <strong>${stats.totalTournaments}</strong></li>
      <li>Total Sessions: <strong>${stats.totalSessions}</strong></li>
      <li>Total Buy-in: <strong>$${stats.totalBuyin.toFixed(2)}</strong></li>
      <li>Total Cashout: <strong>$${stats.totalCashout.toFixed(2)}</strong></li>
      <li>Net Profit/Loss: <strong style="color:${stats.netProfit >= 0 ? 'green' : 'red'}">$${stats.netProfit.toFixed(2)}</strong></li>
      <li>Session Win Rate: <strong>${stats.winRate}%</strong></li>
    </ul>
    <p>More charts and advanced analysis coming soon.</p>
  `;
}

async function exportData() {
  const tournaments = await getTournaments();
  const sessions = await getSessions();
  const bankrolls = await getBankrolls();
  const data = { tournaments, sessions, bankrolls };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'poker-tracker-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function importData(file) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    alert('Invalid JSON file.');
    return;
  }
  if (data.tournaments) {
    const db = await openDB();
    const tx = db.transaction('tournaments', 'readwrite');
    const store = tx.objectStore('tournaments');
    data.tournaments.forEach(t => store.put(t));
  }
  if (data.sessions) {
    const db = await openDB();
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    data.sessions.forEach(s => store.put(s));
  }
  if (data.bankrolls) {
    const db = await openDB();
    const tx = db.transaction('bankrolls', 'readwrite');
    const store = tx.objectStore('bankrolls');
    data.bankrolls.forEach(b => store.put(b));
  }
  alert('Data imported! Please refresh the page.');
}

function renderBackupView() {
  document.getElementById('app').innerHTML = `
    <h2>Backup / Restore</h2>
    <button id="export-btn">Export Data (JSON)</button>
    <input type="file" id="import-file" accept="application/json" style="display:none;" />
    <button id="import-btn">Import Data (JSON)</button>
    <p>Export your data for backup or Google Sheets. Import to restore.</p>
  `;
  document.getElementById('export-btn').onclick = exportData;
  document.getElementById('import-btn').onclick = () => {
    document.getElementById('import-file').click();
  };
  document.getElementById('import-file').onchange = (e) => {
    const file = e.target.files[0];
    if (file) importData(file);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const section = link.getAttribute('href').substring(1);
      if (section === 'schedule') {
        renderScheduleView();
      } else if (section === 'sessions') {
        renderSessionsView();
      } else if (section === 'bankroll') {
        renderBankrollView();
      } else if (section === 'analysis') {
        renderAnalysisView();
      } else if (section === 'backup') {
        renderBackupView();
      } else {
        document.getElementById('app').innerHTML = `<h2>${section.charAt(0).toUpperCase() + section.slice(1)}</h2><p>Coming soon...</p>`;
      }
    });
  });
  // Default view
  renderScheduleView();
});
