import React from 'react';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>
        Poker Tournament Tracker
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome! Choose a section to get started.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button component={Link} to="/tournaments" fullWidth variant="contained" color="primary">
              Tournament Scheduling
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button component={Link} to="/sessions" fullWidth variant="contained" color="secondary">
              Session Management
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button component={Link} to="/bankroll" fullWidth variant="contained" color="success">
              Bankroll Tracking
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button component={Link} to="/analysis" fullWidth variant="contained" color="info">
              Analysis & Reports
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
