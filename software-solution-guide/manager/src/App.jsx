import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TournamentScheduling from './pages/TournamentScheduling';
import SessionManagement from './pages/SessionManagement';
import BankrollTracking from './pages/BankrollTracking';
import AnalysisReports from './pages/AnalysisReports';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tournaments" element={<TournamentScheduling />} />
        <Route path="/sessions" element={<SessionManagement />} />
        <Route path="/bankroll" element={<BankrollTracking />} />
        <Route path="/analysis" element={<AnalysisReports />} />
      </Routes>
    </Router>
  );
}
