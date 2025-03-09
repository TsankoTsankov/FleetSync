import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useStore } from '../store/useStore';
import { generateSchedule } from '../utils/scheduleGenerator';

export const ScheduleGenerator: React.FC = () => {
  const { team, setCurrentSchedule } = useStore();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [error, setError] = useState<string>('');

  const handleGenerate = () => {
    if (team.length === 0) {
      setError('Please add team members before generating a schedule.');
      return;
    }

    const schedule = generateSchedule(year, month, team);
    setCurrentSchedule(schedule);
    setError('');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Generate Schedule
      </Typography>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={month}
            label="Month"
            onChange={(e) => setMonth(e.target.value as number)}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <MenuItem key={m} value={m}>
                {new Date(2024, m - 1).toLocaleString('default', {
                  month: 'long',
                })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={year}
            label="Year"
            onChange={(e) => setYear(e.target.value as number)}
          >
            {Array.from({ length: 3 }, (_, i) => year + i).map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleGenerate}
          disabled={team.length === 0}
        >
          Generate Schedule
        </Button>
      </Paper>
    </Box>
  );
}; 