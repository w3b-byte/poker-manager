import React from 'react';
import { Container, Typography } from '@mui/material';

export default function BankrollTracking() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bankroll Tracking
      </Typography>
      <Typography variant="body1">Manage your bankroll and transactions here.</Typography>
    </Container>
  );
}
