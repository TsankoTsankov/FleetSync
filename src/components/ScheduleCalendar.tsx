import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useStore } from '../store';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Box, Typography } from '@mui/material';
import { Shift, TeamMember, Role } from '../types';
import { EventClickArg } from '@fullcalendar/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface EditEventDialogProps {
  open: boolean;
  onClose: () => void;
  shift: Shift | null;
  teamMembers: TeamMember[];
  onSave: (updatedShift: Shift) => void;
}

const EditEventDialog: React.FC<EditEventDialogProps> = ({ open, onClose, shift, teamMembers, onSave }) => {
  const [selectedMemberId, setSelectedMemberId] = React.useState(shift?.memberId || '');
  const [selectedRole, setSelectedRole] = React.useState<Role>(shift?.role || 'operator');

  React.useEffect(() => {
    if (shift) {
      setSelectedMemberId(shift.memberId);
      setSelectedRole(shift.role);
    }
  }, [shift]);

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value as Role);
  };

  const handleSave = () => {
    if (shift) {
      onSave({
        ...shift,
        memberId: selectedMemberId,
        role: selectedRole,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Shift</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Team Member</InputLabel>
          <Select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            label="Team Member"
          >
            {teamMembers.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedRole}
            onChange={handleRoleChange}
            label="Role"
          >
            <MenuItem value="operator">Operator</MenuItem>
            <MenuItem value="driver">Driver</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ScheduleCalendar: React.FC = () => {
  const { currentSchedule, team, updateShift } = useStore();
  const [selectedShift, setSelectedShift] = React.useState<Shift | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const calendarRef = React.useRef<any>(null);

  if (!currentSchedule) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">
          No schedule available. Please generate a schedule first.
        </Typography>
      </Box>
    );
  }

  const events = React.useMemo(() => {
    return currentSchedule.shifts.map((shift: Shift) => {
      const member = team.find((m: TeamMember) => m.id === shift.memberId);
      return {
        id: shift.id,
        title: `${member?.name} (${shift.role})`,
        date: shift.date,
        extendedProps: { shift },
        backgroundColor: shift.role === 'operator' ? '#4CAF50' : '#2196F3',
        borderColor: shift.role === 'operator' ? '#2E7D32' : '#1565C0',
      };
    });
  }, [currentSchedule, team]);

  const handleEventClick = (info: EventClickArg) => {
    setSelectedShift(info.event.extendedProps.shift);
    setDialogOpen(true);
  };

  const handleSaveShift = (updatedShift: Shift) => {
    updateShift(updatedShift);
  };

  const handleExportPDF = async () => {
    if (!calendarRef.current) return;

    const calendarEl = calendarRef.current.elRef.current;
    const canvas = await html2canvas(calendarEl);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`calendar-${currentSchedule.year}-${currentSchedule.month}.pdf`);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleExportPDF}
        >
          Export Calendar as PDF
        </Button>
      </Box>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
        height="100%"
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
      />
      <EditEventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        shift={selectedShift}
        teamMembers={team}
        onSave={handleSaveShift}
      />
    </Box>
  );
};

export default ScheduleCalendar; 