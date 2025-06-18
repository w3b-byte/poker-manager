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
    <button id="bulk-schedule-btn">Bulk Add</button>
    <button id="calendar-view-btn">Calendar View</button>
    <ul id="tournament-list"></ul>
    <div id="edit-tournament-modal" style="display:none;"></div>
    <div id="bulk-schedule-modal" style="display:none;"></div>
    <div id="calendar-modal" style="display:none;"></div>
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
  document.getElementById('bulk-schedule-btn').onclick = showBulkScheduleModal;
  document.getElementById('calendar-view-btn').onclick = showCalendarModal;
  renderTournamentList();
}

function showBulkScheduleModal() {
  const modal = document.getElementById('bulk-schedule-modal');
  modal.style.display = 'block';
  modal.innerHTML = `
    <div style="background:#fff;border:1px solid #ccc;padding:1rem;max-width:400px;margin:1rem auto;">
      <h3>Bulk Add Tournaments</h3>
      <p>Paste one tournament per line, format: <code>Name,YYYY-MM-DDTHH:mm,Buyin</code></p>
      <textarea id="bulk-tournaments" rows="6" style="width:100%;"></textarea>
      <div style="margin-top:0.5rem;">
        <button id="bulk-add-confirm">Add All</button>
        <button id="bulk-add-cancel">Cancel</button>
      </div>
      <div id="bulk-add-feedback" style="margin-top:0.5rem;color:green;"></div>
    </div>
  `;
  document.getElementById('bulk-add-cancel').onclick = () => {
    modal.style.display = 'none';
  };
  document.getElementById('bulk-add-confirm').onclick = async () => {
    const lines = document.getElementById('bulk-tournaments').value.split('\n');
    let added = 0, failed = 0;
    for (const line of lines) {
      const [name, date, buyin] = line.split(',').map(s => s.trim());
      if (name && date && !isNaN(parseFloat(buyin))) {
        try {
          await addTournament({ name, date, buyin: parseFloat(buyin) });
          added++;
        } catch {
          failed++;
        }
      } else if (line.trim()) {
        failed++;
      }
    }
    document.getElementById('bulk-add-feedback').textContent = `${added} added, ${failed} failed.`;
    renderTournamentList();
    if (added > 0) setTimeout(() => { modal.style.display = 'none'; }, 1200);
  };
}

async function updateTournament(id, updated) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tournaments', 'readwrite');
    const store = tx.objectStore('tournaments');
    const req = store.put({ ...updated, id });
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

async function renderTournamentList() {
  const list = document.getElementById('tournament-list');
  if (!list) return;
  const tournaments = await getTournaments();
  list.innerHTML = tournaments.length
    ? tournaments.map(t => `<li><strong>${t.name}</strong> - ${new Date(t.date).toLocaleString()} - $${t.buyin.toFixed(2)} <button data-id="${t.id}" class="edit-tournament-btn">Edit</button> <button data-id="${t.id}" class="delete-btn">Delete</button></li>`).join('')
    : '<li>No tournaments scheduled.</li>';
  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = Number(btn.getAttribute('data-id'));
      await deleteTournament(id);
      renderTournamentList();
    });
  });
  // Add event listeners for edit buttons
  document.querySelectorAll('.edit-tournament-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = Number(btn.getAttribute('data-id'));
      const tournaments = await getTournaments();
      const t = tournaments.find(t => t.id === id);
      if (!t) return;
      showEditTournamentModal(t);
    });
  });
}

function showEditTournamentModal(tournament) {
  const modal = document.getElementById('edit-tournament-modal');
  modal.style.display = 'block';
  modal.innerHTML = `
    <div style="background:#fff;border:1px solid #ccc;padding:1rem;max-width:350px;margin:1rem auto;">
      <h3>Edit Tournament</h3>
      <form id="edit-tournament-form">
        <input type="text" id="edit-tournament-name" value="${tournament.name}" required />
        <input type="datetime-local" id="edit-tournament-date" value="${tournament.date}" required />
        <input type="number" id="edit-tournament-buyin" value="${tournament.buyin}" min="0" step="0.01" required />
        <button type="submit">Save</button>
        <button type="button" id="cancel-edit-tournament">Cancel</button>
      </form>
    </div>
  `;
  document.getElementById('edit-tournament-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-tournament-name').value.trim();
    const date = document.getElementById('edit-tournament-date').value;
    const buyin = parseFloat(document.getElementById('edit-tournament-buyin').value);
    if (!name || !date || isNaN(buyin)) return;
    await updateTournament(tournament.id, { name, date, buyin });
    modal.style.display = 'none';
    renderTournamentList();
  };
  document.getElementById('cancel-edit-tournament').onclick = () => {
    modal.style.display = 'none';
  };
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

async function showCalendarModal() {
  const modal = document.getElementById('calendar-modal');
  modal.style.display = 'block';
  modal.innerHTML = `<div style="background:#fff;border:1px solid #ccc;padding:1rem;max-width:420px;margin:1rem auto;">
    <h3>Calendar View <button id="close-calendar-modal" style="float:right;">Close</button></h3>
    <div id="calendar-container"></div>
  </div>`;
  document.getElementById('close-calendar-modal').onclick = () => {
    modal.style.display = 'none';
  };
  renderCalendar();
}

async function renderCalendar() {
  const container = document.getElementById('calendar-container');
  if (!container) return;
  const tournaments = await getTournaments();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  let html = `<table style="width:100%;border-collapse:collapse;text-align:center;">
    <tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr><tr>`;
  let dayOfWeek = firstDay.getDay();
  for (let i = 0; i < dayOfWeek; i++) html += '<td></td>';
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = new Date(year, month, day).toISOString().slice(0, 10);
    const todaysTournaments = tournaments.filter(t => t.date.slice(0, 10) === dateStr);
    html += `<td style="vertical-align:top;min-width:60px;min-height:60px;border:1px solid #eee;">
      <div style="font-weight:bold;">${day}</div>
      ${todaysTournaments.map(t => `<div style='font-size:0.9em;margin:2px 0;background:#f0f0f0;border-radius:3px;padding:2px;'>${t.name}<br><span style='font-size:0.8em;'>$${t.buyin.toFixed(2)}</span></div>`).join('')}
    </td>`;
    if ((day + dayOfWeek) % 7 === 0 && day !== daysInMonth) html += '</tr><tr>';
  }
  for (let i = (daysInMonth + dayOfWeek) % 7; i < 7 && i !== 0; i++) html += '<td></td>';
  html += '</tr></table>';
  container.innerHTML = html;
}
