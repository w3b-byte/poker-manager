import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, List, ListItem, ListItemText, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import db from '../db/index';

export default function SessionManagement() {
  const [form, setForm] = useState({
    tournamentId: '',
    date: '',
    startTime: '',
    endTime: '',
    breaks: '',
    chipCounts: '',
    bustOut: '',
    notes: '',
  });
  const [sessions, setSessions] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(form);
  const [editId, setEditId] = useState(null);

  // Load tournaments and sessions on mount
  useEffect(() => {
    db.tournaments.toArray().then(setTournaments);
    db.sessions.toArray().then(setSessions);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.tournamentId || !form.date || !form.startTime) return;
    await db.sessions.add(form);
    setSessions(await db.sessions.toArray());
    setForm({ tournamentId: '', date: '', startTime: '', endTime: '', breaks: '', chipCounts: '', bustOut: '', notes: '' });
  };

  const handleDelete = async (id) => {
    await db.sessions.delete(id);
    setSessions(await db.sessions.toArray());
  };

  // Edit handlers
  const handleEditOpen = (session) => {
    setEditForm(session);
    setEditId(session.id);
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    await db.sessions.update(editId, editForm);
    setSessions(await db.sessions.toArray());
    setEditOpen(false);
    setEditId(null);
  };

  const handleEditCancel = () => {
    setEditOpen(false);
    setEditId(null);
  };

  // Helper to get tournament label
  const getTournamentLabel = (id) => {
    const t = tournaments.find(t => t.id === Number(id));
    return t ? `${t.date} | ${t.site} | $${t.buyIn}` : 'Unknown';
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Session Management
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add Session</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <TextField select label="Tournament" name="tournamentId" value={form.tournamentId} onChange={handleChange} sx={{ minWidth: 180 }}>
            {tournaments.map((t) => (
              <MenuItem key={t.id} value={t.id}>{getTournamentLabel(t.id)}</MenuItem>
            ))}
          </TextField>
          <TextField label="Date" name="date" type="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Start Time" name="startTime" type="time" value={form.startTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="End Time" name="endTime" type="time" value={form.endTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Breaks (min)" name="breaks" type="number" value={form.breaks} onChange={handleChange} />
          <TextField label="Chip Counts" name="chipCounts" value={form.chipCounts} onChange={handleChange} />
          <TextField label="Bust Out" name="bustOut" value={form.bustOut} onChange={handleChange} />
          <TextField label="Notes" name="notes" value={form.notes} onChange={handleChange} multiline minRows={1} />
          <Button variant="contained" onClick={handleAdd} sx={{ minWidth: 120 }}>Add</Button>
        </Box>
      </Paper>
      <Typography variant="h6">Sessions</Typography>
      <List>
        {sessions.map((s) => (
          <ListItem key={s.id} divider
            secondaryAction={
              <Box>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEditOpen(s)} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(s.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={`${getTournamentLabel(s.tournamentId)} | ${s.date} | ${s.startTime} - ${s.endTime}`}
              secondary={`Breaks: ${s.breaks} min | Chips: ${s.chipCounts} | Bust Out: ${s.bustOut} | Notes: ${s.notes}`}
            />
          </ListItem>
        ))}
      </List>
      <Dialog open={editOpen} onClose={handleEditCancel}>
        <DialogTitle>Edit Session</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField select label="Tournament" name="tournamentId" value={editForm.tournamentId || ''} onChange={handleEditChange} sx={{ minWidth: 180 }}>
            {tournaments.map((t) => (
              <MenuItem key={t.id} value={t.id}>{getTournamentLabel(t.id)}</MenuItem>
            ))}
          </TextField>
          <TextField label="Date" name="date" type="date" value={editForm.date || ''} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Start Time" name="startTime" type="time" value={editForm.startTime || ''} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
          <TextField label="End Time" name="endTime" type="time" value={editForm.endTime || ''} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Breaks (min)" name="breaks" type="number" value={editForm.breaks || ''} onChange={handleEditChange} />
          <TextField label="Chip Counts" name="chipCounts" value={editForm.chipCounts || ''} onChange={handleEditChange} />
          <TextField label="Bust Out" name="bustOut" value={editForm.bustOut || ''} onChange={handleEditChange} />
          <TextField label="Notes" name="notes" value={editForm.notes || ''} onChange={handleEditChange} multiline minRows={1} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
