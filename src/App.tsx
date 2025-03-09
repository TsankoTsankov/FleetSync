import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, CssBaseline } from '@mui/material';
import { TeamManagement } from './components/TeamManagement';
import ScheduleViewer from './components/ScheduleViewer';
import ScheduleCalendar from './components/ScheduleCalendar';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              FleetSync
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Team
            </Button>
            <Button color="inherit" component={Link} to="/schedule">
              Schedule
            </Button>
            <Button color="inherit" component={Link} to="/calendar">
              Calendar
            </Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ flex: 1, py: 3 }}>
          <Routes>
            <Route path="/" element={<TeamManagement />} />
            <Route path="/schedule" element={<ScheduleViewer />} />
            <Route path="/calendar" element={<ScheduleCalendar />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
