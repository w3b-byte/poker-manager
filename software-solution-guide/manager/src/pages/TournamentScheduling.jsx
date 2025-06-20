import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, List, ListItem, ListItemText, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Stack, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import DownloadIcon from '@mui/icons-material/Download';
import db from '../db/index';

const statusOptions = ['Scheduled', 'Registered', 'Playing', 'Completed'];

export default function TournamentScheduling() {
  const [form, setForm] = useState({
    date: '',
    site: '',
    buyIn: '',
    gameType: '',
    format: '',
    status: '',
    registrationWindow: '',
    reEntryCount: '',
    addon: '',
  });
  const [tournaments, setTournaments] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(form);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  // Load tournaments on mount
  React.useEffect(() => {
    db.tournaments.toArray().then(setTournaments);
  }, []);

  // For development: Add mock tournaments if none exist
  React.useEffect(() => {
    db.tournaments.count().then(count => {
      if (count === 0) {
        const mockTournaments = Array.from({ length: 25 }, (_, i) => ({
          date: `2025-06-${String((i % 30) + 1).padStart(2, '0')}`,
          site: `Site ${i % 5 + 1}`,
          buyIn: (50 + (i % 10) * 10).toString(),
          gameType: ['NLHE', 'PLO', 'Omaha', 'Stud', 'Mixed'][i % 5],
          format: ['Freezeout', 'Rebuy', 'Bounty', 'Turbo', 'Deepstack'][i % 5],
          status: statusOptions[i % statusOptions.length],
          registrationWindow: `${(i % 3 + 1) * 30} min` ,
          reEntryCount: (i % 4).toString(),
          addon: i % 2 === 0 ? 'Yes' : 'No',
        }));
        db.tournaments.bulkAdd(mockTournaments).then(() => {
          db.tournaments.toArray().then(setTournaments);
        });
      }
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.date) errors.date = 'Date is required';
    if (!data.site) errors.site = 'Site is required';
    if (!data.buyIn) errors.buyIn = 'Buy-in is required';
    return errors;
  };

  const handleAdd = async () => {
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await db.tournaments.add(form);
    setTournaments(await db.tournaments.toArray());
    setForm({ date: '', site: '', buyIn: '', gameType: '', format: '', status: '', registrationWindow: '', reEntryCount: '', addon: '' });
    setFormErrors({});
    setSuccessMsg('Tournament added!');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleDelete = async (id) => {
    await db.tournaments.delete(id);
    setTournaments(await db.tournaments.toArray());
  };

  // Edit handlers
  const handleEditOpen = (tournament) => {
    setEditForm(tournament);
    setEditId(tournament.id);
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    const errors = validateForm(editForm);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await db.tournaments.update(editId, editForm);
    setTournaments(await db.tournaments.toArray());
    setEditOpen(false);
    setEditId(null);
    setFormErrors({});
    setSuccessMsg('Tournament updated!');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleEditCancel = () => {
    setEditOpen(false);
    setEditId(null);
  };

  // Filtered and sorted tournaments
  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch =
      t.site.toLowerCase().includes(search.toLowerCase()) ||
      t.gameType.toLowerCase().includes(search.toLowerCase()) ||
      t.format.toLowerCase().includes(search.toLowerCase()) ||
      t.date.includes(search);
    const matchesStatus = filterStatus ? t.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });
  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    let aValue = a[sortField] || '';
    let bValue = b[sortField] || '';
    if (sortField === 'buyIn' || sortField === 'reEntryCount') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // CSV export
  const handleExportCSV = () => {
    const headers = ['Date', 'Site', 'Buy-In', 'Game Type', 'Format', 'Status', 'Registration Window', 'Re-Entry Count', 'Addon'];
    const rows = sortedTournaments.map(t => [
      t.date, t.site, t.buyIn, t.gameType, t.format, t.status, t.registrationWindow, t.reEntryCount, t.addon
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(x => `"${x ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tournaments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 700, letterSpacing: 1 }}>
        Tournament Scheduling
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }} component="section" aria-labelledby="add-tournament-heading">
        <Typography id="add-tournament-heading" variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Add Tournament
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {successMsg && <Typography color="success.main" sx={{ mb: 1 }} role="status">{successMsg}</Typography>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
          <TextField label="Date" name="date" type="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!formErrors.date} helperText={formErrors.date} inputProps={{ 'aria-required': true }} autoComplete="off" />
          <TextField label="Site" name="site" value={form.site} onChange={handleChange} error={!!formErrors.site} helperText={formErrors.site} inputProps={{ 'aria-required': true }} autoComplete="off" />
          <TextField label="Buy-In" name="buyIn" type="number" value={form.buyIn} onChange={handleChange} error={!!formErrors.buyIn} helperText={formErrors.buyIn} inputProps={{ 'aria-required': true, min: 0 }} autoComplete="off" />
          <TextField label="Game Type" name="gameType" value={form.gameType} onChange={handleChange} />
          <TextField label="Format" name="format" value={form.format} onChange={handleChange} />
          <TextField select label="Status" name="status" value={form.status} onChange={handleChange} sx={{ minWidth: 120 }}>
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField label="Registration Window" name="registrationWindow" value={form.registrationWindow} onChange={handleChange} />
          <TextField label="Re-Entry Count" name="reEntryCount" type="number" value={form.reEntryCount} onChange={handleChange} />
          <TextField label="Addon" name="addon" value={form.addon} onChange={handleChange} />
          <Button variant="contained" onClick={handleAdd} sx={{ minWidth: 120, alignSelf: 'center', mt: { xs: 2, sm: 0 } }} aria-label="Add Tournament">Add</Button>
        </Stack>
      </Paper>
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }} component="nav" aria-label="Tournament filters and actions">
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Site, Game Type, Format, Date"
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          label="Status"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {statusOptions.map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Sort By"
          value={sortField}
          onChange={e => setSortField(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="date">Date</MenuItem>
          <MenuItem value="site">Site</MenuItem>
          <MenuItem value="buyIn">Buy-In</MenuItem>
          <MenuItem value="gameType">Game Type</MenuItem>
          <MenuItem value="format">Format</MenuItem>
        </TextField>
        <TextField
          select
          label="Order"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </TextField>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          sx={{ ml: 'auto', minWidth: 160 }}
          aria-label="Export tournaments as CSV"
        >
          Export CSV
        </Button>
      </Paper>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }} id="scheduled-tournaments-heading">Scheduled Tournaments</Typography>
      <Divider sx={{ mb: 2 }} />
      <List aria-labelledby="scheduled-tournaments-heading">
        {sortedTournaments.length === 0 && (
          <Typography variant="body1" color="text.secondary" sx={{ p: 2 }} role="status">
            No tournaments found.
          </Typography>
        )}
        {sortedTournaments.map((t) => (
          <Paper key={t.id} elevation={1} sx={{ mb: 2 }}>
            <ListItem divider
              secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label={`Edit tournament on ${t.date} at ${t.site}`} onClick={() => handleEditOpen(t)} sx={{ mr: 1, color: 'primary.main' }} tabIndex={0}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label={`Delete tournament on ${t.date} at ${t.site}`} onClick={() => handleDelete(t.id)} sx={{ color: 'error.main' }} tabIndex={0}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
              tabIndex={0}
              role="listitem"
            >
              <ListItemText
                primary={<>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EventIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t.date}</Typography>
                    <Chip label={t.status} color={t.status === 'Completed' ? 'success' : t.status === 'Playing' ? 'warning' : 'default'} size="small" sx={{ ml: 1 }} />
                    <Typography variant="subtitle2" sx={{ ml: 2 }}>{t.site}</Typography>
                    <Typography variant="subtitle2" sx={{ ml: 2 }} color="secondary">${t.buyIn}</Typography>
                  </Stack>
                </>}
                secondary={<>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
                    <span>Game: <b>{t.gameType}</b></span>
                    <span>Format: <b>{t.format}</b></span>
                    <span>Reg: <b>{t.registrationWindow}</b></span>
                    <span>Re-Entry: <b>{t.reEntryCount}</b></span>
                    <span>Addon: <b>{t.addon}</b></span>
                  </Stack>
                </>}
              />
            </ListItem>
          </Paper>
        ))}
      </List>
      <Dialog open={editOpen} onClose={handleEditCancel} aria-labelledby="edit-tournament-dialog-title">
        <DialogTitle id="edit-tournament-dialog-title">Edit Tournament</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Date" name="date" type="date" value={editForm.date || ''} onChange={handleEditChange} InputLabelProps={{ shrink: true }} error={!!formErrors.date} helperText={formErrors.date} inputProps={{ 'aria-required': true }} autoFocus />
          <TextField label="Site" name="site" value={editForm.site || ''} onChange={handleEditChange} error={!!formErrors.site} helperText={formErrors.site} inputProps={{ 'aria-required': true }} />
          <TextField label="Buy-In" name="buyIn" type="number" value={editForm.buyIn || ''} onChange={handleEditChange} error={!!formErrors.buyIn} helperText={formErrors.buyIn} inputProps={{ 'aria-required': true, min: 0 }} />
          <TextField label="Game Type" name="gameType" value={editForm.gameType || ''} onChange={handleEditChange} />
          <TextField label="Format" name="format" value={editForm.format || ''} onChange={handleEditChange} />
          <TextField select label="Status" name="status" value={editForm.status || ''} onChange={handleEditChange} sx={{ minWidth: 120 }}>
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField label="Registration Window" name="registrationWindow" value={editForm.registrationWindow || ''} onChange={handleEditChange} />
          <TextField label="Re-Entry Count" name="reEntryCount" type="number" value={editForm.reEntryCount || ''} onChange={handleEditChange} />
          <TextField label="Addon" name="addon" value={editForm.addon || ''} onChange={handleEditChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
