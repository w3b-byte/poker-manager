import React from 'react';
import { Container, Typography } from '@mui/material';

export default function AnalysisReports() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analysis & Reports
      </Typography>
      <Typography variant="body1">Analyze your performance and generate reports here.</Typography>
    </Container>
  );
}
