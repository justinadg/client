import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress
} from '@mui/material';
import AppointmentAnalytics from './AppointmentAnalytics';
import StockAnalytics from './StockAnalytics';

export default function AdminDashboard() {
  const [view, setView] = useState('appointments');

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        component="h1"
        variant="h3"
        color="inherit"
        noWrap
        sx={{ flexGrow: 1, mb: 4 }}
      >
        Admin Dashboard
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          aria-label="analytics view"
        >
          <ToggleButton value="appointments" aria-label="appointments analytics">
            Appointments Analytics
          </ToggleButton>
          <ToggleButton value="stocks" aria-label="stock analytics">
            Stock Analytics
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === 'appointments' ? (
        <AppointmentAnalytics />
      ) : (
        <StockAnalytics />
      )}
    </Container>
  );
}