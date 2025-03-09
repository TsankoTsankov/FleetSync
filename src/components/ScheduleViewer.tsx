import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  ButtonGroup,
} from '@mui/material';
import { useStore } from '../store';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';

const ScheduleViewer: React.FC = () => {
  const { currentSchedule, team } = useStore();

  if (!currentSchedule) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Typography variant="h6" align="center">
          No schedule generated yet. Please generate a schedule first.
        </Typography>
      </Box>
    );
  }

  const getMemberName = (memberId: string) => {
    const member = team.find((m) => m.id === memberId);
    return member ? member.name : 'Unknown';
  };

  const getTableData = () => {
    return currentSchedule.shifts.reduce((acc: any[], shift) => {
      const date = format(new Date(shift.date), 'dd MMM yyyy');
      const existingRow = acc.find((row) => row[0] === date);

      if (existingRow) {
        if (shift.role === 'operator') {
          existingRow[1] = getMemberName(shift.memberId);
        } else {
          existingRow[2] = getMemberName(shift.memberId);
        }
      } else {
        acc.push([
          date,
          shift.role === 'operator' ? getMemberName(shift.memberId) : '',
          shift.role === 'driver' ? getMemberName(shift.memberId) : '',
        ]);
      }

      return acc;
    }, []);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = getTableData();

    autoTable(doc, {
      head: [['Date', 'Operator', 'Driver']],
      body: tableData,
    });

    doc.save(`schedule-${currentSchedule.year}-${currentSchedule.month}.pdf`);
  };

  const handleExportCSV = () => {
    const tableData = getTableData();
    const csvContent = [
      ['Date', 'Operator', 'Driver'],
      ...tableData
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `schedule-${currentSchedule.year}-${currentSchedule.month}.csv`;
    link.click();
  };

  const handleExportGoogleSheets = () => {
    const tableData = getTableData();
    const csvContent = [
      ['Schedule for ' + format(new Date(currentSchedule.year, currentSchedule.month - 1), 'MMMM yyyy')],
      ['Date', 'Operator', 'Driver'],
      ...tableData
    ].map(row => row.join(',')).join('\n');

    const encodedContent = encodeURIComponent(csvContent);
    const url = `https://docs.google.com/spreadsheets/d/create?content=${encodedContent}`;
    window.open(url, '_blank');
  };

  // Group shifts by date
  const groupedShifts = currentSchedule.shifts.reduce((acc, shift) => {
    const date = shift.date;
    if (!acc[date]) {
      acc[date] = { operator: '', driver: '' };
    }
    if (shift.role === 'operator') {
      acc[date].operator = shift.memberId;
    } else {
      acc[date].driver = shift.memberId;
    }
    return acc;
  }, {} as Record<string, { operator: string; driver: string }>);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Schedule for {format(new Date(currentSchedule.year, currentSchedule.month - 1), 'MMMM yyyy')}
        </Typography>
        <ButtonGroup variant="contained">
          <Button
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPDF}
          >
            PDF
          </Button>
          <Button
            startIcon={<TableViewIcon />}
            onClick={handleExportCSV}
          >
            CSV
          </Button>
          <Button
            startIcon={<TableViewIcon />}
            onClick={handleExportGoogleSheets}
          >
            Google Sheets
          </Button>
        </ButtonGroup>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Operator</TableCell>
              <TableCell>Driver</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(groupedShifts).map(([date, roles]) => (
              <TableRow key={date}>
                <TableCell>{format(new Date(date), 'dd MMM yyyy')}</TableCell>
                <TableCell>{getMemberName(roles.operator)}</TableCell>
                <TableCell>{getMemberName(roles.driver)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ScheduleViewer; 