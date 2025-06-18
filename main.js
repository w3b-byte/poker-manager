// Poker Tournament Tracker - main.js
// ...existing code...
// Basic navigation and IndexedDB setup will be added here

document.addEventListener('DOMContentLoaded', () => {
  // Simple navigation handler (placeholder)
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const section = link.getAttribute('href').substring(1);
      document.getElementById('app').innerHTML = `<h2>${section.charAt(0).toUpperCase() + section.slice(1)}</h2><p>Coming soon...</p>`;
    });
  });
  // Default view
  document.getElementById('app').innerHTML = '<h2>Schedule</h2><p>Coming soon...</p>';
});
