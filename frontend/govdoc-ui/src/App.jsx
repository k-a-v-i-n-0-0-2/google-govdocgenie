// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import './App.css';

import Home from './pages/Home';
import GovDoc from './pages/GovDoc';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import Documentation from './pages/DocumentUploadCard';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import apiService from './utils/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5',
      light: '#6366f1',
      dark: '#4338ca',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [backendInfo, setBackendInfo] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const data = await apiService.getSystemStatus();
        setBackendInfo(data);
        setBackendStatus('connected');
      } catch {
        setBackendStatus('error');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <ScrollToTop />

          <Box sx={{ minHeight: 'calc(100vh - 180px)' }}>
            <Routes>
              <Route path="/" element={<Home backendStatus={backendStatus} />} />
              <Route path="/govdoc" element={<GovDoc backendStatus={backendStatus} />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/results/:sessionId" element={<Results />} />
              <Route
                path="/documentation"
                element={<Documentation backendInfo={backendInfo} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>

          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
