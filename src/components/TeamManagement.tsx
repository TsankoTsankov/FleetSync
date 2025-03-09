import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStore } from '../store';
import { TeamMember, Role } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateSchedule } from '../utils/scheduleGenerator';

export const TeamManagement: React.FC = () => {
  const navigate = useNavigate();
  const { team, addTeamMember, removeTeamMember, setCurrentSchedule } = useStore();
  const [name, setName] = useState('');
  const [roles, setRoles] = useState({ operator: false, driver: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!roles.operator && !roles.driver)) return;

    const selectedRoles: Role[] = [];
    if (roles.operator) selectedRoles.push('operator');
    if (roles.driver) selectedRoles.push('driver');

    const newMember: TeamMember = {
      id: uuidv4(),
      name: name.trim(),
      roles: selectedRoles,
    };

    addTeamMember(newMember);
    setName('');
    setRoles({ operator: false, driver: false });
  };

  const handleGenerateSchedule = () => {
    const currentDate = new Date();
    const schedule = generateSchedule(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      team
    );
    setCurrentSchedule(schedule);
    setTimeout(() => {
      navigate('/schedule');
    }, 0);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Team Management
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Team Member Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
          />
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={roles.operator}
                  onChange={(e) =>
                    setRoles((prev) => ({ ...prev, operator: e.target.checked }))
                  }
                />
              }
              label="Operator"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={roles.driver}
                  onChange={(e) =>
                    setRoles((prev) => ({ ...prev, driver: e.target.checked }))
                  }
                />
              }
              label="Driver"
            />
          </FormGroup>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Add Team Member
          </Button>
        </form>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <List>
          {team.map((member) => (
            <ListItem key={member.id}>
              <ListItemText
                primary={member.name}
                secondary={`Roles: ${member.roles.join(', ')}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => removeTeamMember(member.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {team.length >= 2 && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateSchedule}
          fullWidth
        >
          Generate Schedule
        </Button>
      )}
    </Box>
  );
}; 