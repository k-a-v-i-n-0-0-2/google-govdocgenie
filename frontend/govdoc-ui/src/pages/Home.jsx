// pages/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper,
  Divider,
  Avatar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Slide,
  AppBar,
  Toolbar,
  useScrollTrigger,
} from '@mui/material';
import {
  VerifiedUser,
  Security,
  AutoAwesome,
  CloudUpload,
  Analytics,
  Verified,
  Speed,
  TrendingUp,
  Shield,
  Gavel,
  AdminPanelSettings,
  DocumentScanner,
  AccountBalance,
  Fingerprint,
  LockPerson,
  Dashboard,
  Visibility,
  ChecklistRtl,
  HistoryToggleOff,
  CloudDone,
  WorkspacePremium,
  Menu,
  RocketLaunch,
  Book,
  Description,
  ArrowRightAlt,
  Close,
  Lock,
} from '@mui/icons-material';
import FeatureCard from '../components/FeatureCard';
import StatsCard from '../components/StatsCard';
import './Home.css';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const navItems = [
    { 
      label: 'Home', 
      path: '/', 
      icon: <RocketLaunch fontSize="small" />,
      badge: false 
    },
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <Dashboard fontSize="small" />,
      badge: false 
    },
    { 
      label: 'Validate', 
      path: '/govdoc', 
      icon: <Description fontSize="small" />,
      badge: true,
      badgeContent: 'NEW'
    },
    { 
      label: 'Documentation', 
      path: '/documentation', 
      icon: <Book fontSize="small" />,
      badge: false 
    },
  ];

  const isActive = (path) => location.pathname === path;

  // Drawer Content
  const drawer = (
    <Box className="mobile-drawer-content" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Drawer Header */}
      <Box className="drawer-header">
        <Box className="drawer-brand-container">
          <RocketLaunch className="drawer-brand-icon" />
          <Typography variant="h6" className="drawer-brand-title">
            GovDoc Genie
          </Typography>
        </Box>
        <IconButton
          onClick={handleDrawerToggle}
          className="drawer-close-btn"
          size="large"
        >
          <Close />
        </IconButton>
      </Box>

      {/* Official Badge */}
      <Box className="drawer-official-badge">
        <Chip
          label="OFFICIAL GOVERNMENT PORTAL"
          size="small"
          className="official-chip"
          icon={<VerifiedUser />}
        />
      </Box>

      <Divider className="drawer-divider" />

      {/* Navigation Items */}
      <List className="mobile-nav-list" sx={{ flex: 1 }}>
        {navItems.map((item) => (
          <ListItem
            key={item.label}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
            sx={{
              py: 2,
              px: 3,
            }}
          >
            <ListItemIcon className="nav-item-icon" sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={
                <Box className="nav-item-content">
                  <Typography variant="body1" className="nav-item-text">
                    {item.label}
                  </Typography>
                  {item.badge && (
                    <Chip
                      label={item.badgeContent}
                      size="small"
                      className="nav-badge-mobile"
                    />
                  )}
                </Box>
              }
            />
            {isActive(item.path) && (
              <Verified className="active-indicator" fontSize="small" />
            )}
          </ListItem>
        ))}
      </List>

      <Divider className="drawer-divider" />

      {/* Drawer Footer */}
      <Box className="drawer-footer" sx={{ p: 3 }}>
        <Box className="drawer-security-info" sx={{ mb: 3 }}>
          <Box className="security-badge" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Shield fontSize="small" />
            <Typography variant="caption" className="security-text">
              ENTERPRISE SECURE
            </Typography>
          </Box>
          <Typography variant="caption" className="security-subtext">
            Government-grade encryption & compliance
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            navigate('/govdoc');
            handleDrawerToggle();
          }}
          className="drawer-primary-btn"
          endIcon={<ArrowRightAlt />}
          size="large"
        >
          Start Free Validation
        </Button>
        
        <Typography variant="caption" className="drawer-copyright" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
          © 2024 GovDoc Genie
        </Typography>
      </Box>
    </Box>
  );

  const features = [
    {
      icon: <Fingerprint sx={{ fontSize: 48 }} />,
      title: 'Biometric Authentication',
      description: 'Multi-factor authentication with biometric verification for enhanced security protocols.',
      color: '#0d3b66',
      gradient: 'linear-gradient(135deg, #0d3b66 0%, #1a508b 100%)',
    },
    {
      icon: <DocumentScanner sx={{ fontSize: 48 }} />,
      title: 'Smart OCR Processing',
      description: 'Advanced Optical Character Recognition with 99.9% accuracy for document digitization.',
      color: '#1b4332',
      gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
    },
    {
      icon: <AccountBalance sx={{ fontSize: 48 }} />,
      title: 'Government Integration',
      description: 'Direct integration with government databases for real-time validation against official records.',
      color: '#3d348b',
      gradient: 'linear-gradient(135deg, #3d348b 0%, #5754c1 100%)',
    },
    {
      icon: <ChecklistRtl sx={{ fontSize: 48 }} />,
      title: 'Compliance Dashboard',
      description: 'Comprehensive compliance monitoring with automated reporting and audit trails.',
      color: '#5c4d7d',
      gradient: 'linear-gradient(135deg, #5c4d7d 0%, #726a95 100%)',
    },
    {
      icon: <LockPerson sx={{ fontSize: 48 }} />,
      title: 'End-to-End Encryption',
      description: 'Military-grade AES-256 encryption ensuring complete data protection at all stages.',
      color: '#9d4edd',
      gradient: 'linear-gradient(135deg, #9d4edd 0%, #c77dff 100%)',
    },
    {
      icon: <HistoryToggleOff sx={{ fontSize: 48 }} />,
      title: 'Complete Audit Trail',
      description: 'Immutable blockchain-based audit logs for every document transaction and validation.',
      color: '#006466',
      gradient: 'linear-gradient(135deg, #006466 0%, #0b525b 100%)',
    },
  ];

  const validationProcess = [
    {
      step: '01',
      title: 'Document Submission',
      description: 'Secure upload with automatic format detection and quality assessment',
      icon: <CloudUpload />,
      accent: '#1a508b',
    },
    {
      step: '02',
      title: 'AI Validation',
      description: 'Advanced algorithms validate against current government regulations and standards',
      icon: <AutoAwesome />,
      accent: '#2d6a4f',
    },
    {
      step: '03',
      title: 'Compliance Check',
      description: 'Cross-referencing with official databases and compliance requirements',
      icon: <Verified />,
      accent: '#5c4d7d',
    },
    {
      step: '04',
      title: 'Secure Delivery',
      description: 'Encrypted validation report with digital signatures and timestamps',
      icon: <CloudDone />,
      accent: '#9d4edd',
    },
  ];

  const trustBadges = [
    { 
      icon: <WorkspacePremium />, 
      label: 'ISO 27001 Certified', 
      sublabel: 'Information Security',
      color: '#0d3b66'
    },
    { 
      icon: <VerifiedUser />, 
      label: 'GDPR Compliant', 
      sublabel: 'Data Protection',
      color: '#1b4332'
    },
    { 
      icon: <AccountBalance />, 
      label: 'Govt. Approved', 
      sublabel: 'Official Partner',
      color: '#3d348b'
    },
    { 
      icon: <Shield />, 
      label: 'SOC 2 Type II', 
      sublabel: 'Security Audit',
      color: '#5c4d7d'
    },
  ];

  return (
    <Box className="gov-enterprise-portal">
      {/* Integrated Navbar */}
      <HideOnScroll>
        <AppBar
          position="fixed"
          className={`integrated-navbar ${scrolled ? 'navbar-scrolled' : ''}`}
          elevation={scrolled ? 3 : 0}
          sx={{
            transition: 'all 0.3s ease',
            background: scrolled 
              ? 'linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(27, 38, 59, 0.98) 100%)'
              : 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)',
            backdropFilter: scrolled ? 'blur(20px)' : 'blur(10px)',
            borderBottom: `1px solid ${scrolled ? 'rgba(42, 157, 143, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
            py: { xs: 0.5, md: 0 },
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Toolbar 
              sx={{ 
                px: { xs: 0, sm: 1 },
                minHeight: { xs: 56, md: 64 }
              }}
            >
              {/* Mobile Menu Button */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                className="mobile-menu-btn"
                sx={{ 
                  display: { xs: 'flex', md: 'none' },
                  mr: { xs: 1, sm: 2 }
                }}
              >
                <Menu />
              </IconButton>

              {/* Brand Logo */}
              <Box
                component={Link}
                to="/"
                className="navbar-brand"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  mr: { xs: 1, sm: 2, md: 4 },
                  flexShrink: 0
                }}
              >
                <Box className="brand-icon-container" sx={{ mr: 1 }}>
                  <RocketLaunch className="brand-icon" />
                </Box>
                <Typography
                  variant="h6"
                  className="brand-text"
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    fontSize: { sm: '1.1rem', md: '1.25rem' }
                  }}
                >
                  GovDoc Genie
                </Typography>
                <Typography
                  variant="h6"
                  className="brand-text-mobile"
                  sx={{ display: { xs: 'block', sm: 'none' } }}
                >
                  GDG
                </Typography>
              </Box>

              {/* Desktop Navigation */}
              <Box 
                className="desktop-nav"
                sx={{ 
                  display: { xs: 'none', md: 'flex' },
                  flex: 1,
                  justifyContent: 'center',
                  mx: 2
                }}
              >
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    className={`nav-btn ${isActive(item.path) ? 'active' : ''}`}
                    startIcon={item.icon}
                    sx={{
                      mx: 0.5,
                      px: 2,
                      minWidth: 'auto',
                      fontSize: '0.875rem',
                      fontWeight: isActive(item.path) ? 600 : 500,
                    }}
                  >
                    {item.label}
                    {item.badge && (
                      <Chip
                        label={item.badgeContent}
                        size="small"
                        className="nav-badge"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Button>
                ))}
              </Box>

              {/* Desktop Security Badge */}
              <Box 
                className="desktop-security"
                sx={{ 
                  display: { xs: 'none', lg: 'flex' },
                  alignItems: 'center',
                  mr: 3
                }}
              >
                <Chip
                  icon={<VerifiedUser fontSize="small" />}
                  label="OFFICIAL"
                  size="small"
                  className="official-chip"
                  sx={{ mr: 1 }}
                />
                <Box className="status-indicator" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box className="status-dot" />
                  <Typography variant="caption" className="status-text">
                    SECURE
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box 
                className="action-buttons"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1, sm: 2 },
                  ml: 'auto',
                  flexShrink: 0
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate('/govdoc')}
                  className="secondary-btn"
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    fontSize: { sm: '0.875rem', md: '0.9rem' },
                    px: { sm: 2, md: 3 },
                    py: { xs: 0.75, md: 1 }
                  }}
                >
                  Try Free
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/govdoc')}
                  className="primary-btn"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.9rem' },
                    px: { xs: 1.5, sm: 2, md: 3 },
                    py: { xs: 0.75, md: 1 },
                    minWidth: { xs: 'auto', sm: '100px' }
                  }}
                >
                  {isSmallMobile ? 'Start' : 'Get Started'}
                </Button>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: { xs: '85%', sm: 320 },
            maxWidth: 320,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Spacer for fixed navbar */}
      <Toolbar 
        sx={{ 
          minHeight: { xs: 56, md: 64 } 
        }} 
      />

      {/* Old Header - Now removed since we have navbar */}
      
      {/* Main Hero Section */}
      <Box className="enterprise-hero">
        <Box className="hero-background-pattern" />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center" justifyContent="center">
            <Grid item xs={12} lg={6}>
              <Box className="hero-content-wrapper">
                <Chip 
                  label="ENTERPRISE-GRADE VALIDATION PLATFORM"
                  className="enterprise-badge"
                  icon={<WorkspacePremium />}
                />
                
                <Typography variant="h1" className="enterprise-title">
                  Government Document
                  <Box component="span" className="highlight-enterprise">
                    Verification System
                  </Box>
                </Typography>
                
                <Typography variant="h4" className="enterprise-subtitle">
                  Advanced AI-powered validation platform for government documents with military-grade security and compliance monitoring.
                </Typography>
                
                {/* Key Metrics */}
                <Paper className="metrics-panel" elevation={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={6} sm={3}>
                      <Box className="metric-item">
                        <Typography className="metric-value">99.97%</Typography>
                        <Typography className="metric-label">Accuracy</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box className="metric-item">
                        <Typography className="metric-value">&lt; 3s</Typography>
                        <Typography className="metric-label">Processing</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box className="metric-item">
                        <Typography className="metric-value">AES-256</Typography>
                        <Typography className="metric-label">Encryption</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box className="metric-item">
                        <Typography className="metric-value">24/7</Typography>
                        <Typography className="metric-label">Monitoring</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
                
                {/* Document Types */}
                <Box className="document-types-grid">
                  <Typography variant="h6" className="doc-types-title">
                    SUPPORTED DOCUMENTS
                  </Typography>
                  <Grid container spacing={2}>
                    {['GST Returns', 'PAN Cards', 'Udyam Certificates', 'MSME Documents', 'Quotations', 'Compliance Forms'].map((doc, idx) => (
                      <Grid item xs={6} sm={4} key={idx}>
                        <Box className="doc-type-chip">
                          <DocumentScanner sx={{ fontSize: 16, mr: 1 }} />
                          <Typography variant="body2">{doc}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                
                {/* Action Buttons */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} className="hero-actions">
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/govdoc')}
                    className="primary-action-btn"
                    startIcon={<Dashboard />}
                  >
                    Access Validation Dashboard
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/documentation')}
                    className="secondary-action-btn"
                    startIcon={<Visibility />}
                  >
                    View Platform Demo
                  </Button>
                </Stack>
              </Box>
            </Grid>
            
            <Grid item xs={12} lg={6}>
              <Box className="dashboard-preview-container">
                <Box className="preview-glass">
                  {/* Preview Header */}
                  <Box className="preview-header-bar">
                    <Box className="preview-header-left">
                      <Typography variant="subtitle1" className="preview-title">
                        Document Validation Console
                      </Typography>
                      <Chip label="LIVE" size="small" className="live-status" />
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Security sx={{ fontSize: 18, color: '#10b981' }} />
                      <Typography variant="caption">SECURE SESSION</Typography>
                    </Stack>
                  </Box>
                  
                  {/* Activity Timeline */}
                  <Box className="activity-timeline">
                    {[
                      { time: '10:30', action: 'GST-3B uploaded', status: 'verified' },
                      { time: '10:28', action: 'PAN verification', status: 'processing' },
                      { time: '10:25', action: 'Compliance check', status: 'completed' },
                    ].map((activity, idx) => (
                      <Box key={idx} className="activity-item">
                        <Box className="activity-time">{activity.time}</Box>
                        <Box className="activity-dot" />
                        <Box className="activity-content">
                          <Typography variant="body2">{activity.action}</Typography>
                          <Chip 
                            label={activity.status.toUpperCase()} 
                            size="small"
                            className={`status-${activity.status}`}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  
                  {/* Security Badge */}
                  <Box className="preview-security-badge">
                    <Shield sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="caption" className="security-label">
                        GOVERNMENT APPROVED
                      </Typography>
                      <Typography variant="caption" className="security-subtext">
                        AES-256 Encryption Active
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust & Certification Section */}
      <Box className="certification-section">
        <Container maxWidth="xl">
          <Typography variant="h3" className="section-title" align="center">
            Certified & Compliant
          </Typography>
          <Typography variant="h6" className="section-subtitle" align="center">
            Built to meet the highest international security and compliance standards
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 6 }}>
            {trustBadges.map((badge, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className="certification-card">
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box 
                      className="certification-icon"
                      sx={{ bgcolor: `${badge.color}15` }}
                    >
                      {badge.icon}
                    </Box>
                    <Typography variant="h6" className="certification-title" sx={{ color: badge.color }}>
                      {badge.label}
                    </Typography>
                    <Typography variant="body2" className="certification-subtitle">
                      {badge.sublabel}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Validation Process */}
      <Box className="process-section">
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip 
              label="VALIDATION WORKFLOW" 
              className="workflow-badge"
            />
            <Typography variant="h3" className="section-title">
              Secure Validation Process
            </Typography>
            <Typography variant="h6" className="section-subtitle">
              End-to-end encrypted workflow ensuring document integrity and compliance
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {validationProcess.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box className="process-step-card">
                  <Box className="step-header">
                    <Box className="step-number">{step.step}</Box>
                    <Box 
                      className="step-icon-wrapper"
                      sx={{ bgcolor: `${step.accent}15` }}
                    >
                      {step.icon}
                    </Box>
                  </Box>
                  <Typography variant="h6" className="step-title">
                    {step.title}
                  </Typography>
                  <Typography variant="body2" className="step-description">
                    {step.description}
                  </Typography>
                  <Box className="step-line" sx={{ bgcolor: step.accent }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Enterprise Features */}
      <Box className="features-section">
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" className="section-title">
              Enterprise-Grade Features
            </Typography>
            <Typography variant="h6" className="section-subtitle">
              Comprehensive security and compliance tools for government document validation
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="enterprise-feature-card">
                  <CardContent sx={{ p: 4 }}>
                    <Box 
                      className="feature-icon-container"
                      sx={{ 
                        background: feature.gradient,
                        '&:before': {
                          background: feature.gradient,
                        }
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" className="feature-title">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" className="feature-description">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box className="cta-section">
        <Container maxWidth="lg">
          <Box className="cta-glass-container">
            <Box className="cta-content">
              <WorkspacePremium sx={{ fontSize: 64, mb: 4 }} className="cta-main-icon" />
              
              <Typography variant="h3" className="cta-title">
                Ready for Enterprise Deployment?
              </Typography>
              
              <Typography variant="h6" className="cta-subtitle">
                Schedule a personalized demo with our security team to see how our platform meets your government compliance requirements.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 6 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/govdoc')}
                  className="cta-primary-btn"
                  startIcon={<Dashboard />}
                >
                  Request Enterprise Demo
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/contact')}
                  className="cta-secondary-btn"
                  startIcon={<VerifiedUser />}
                >
                  Contact Security Team
                </Button>
              </Stack>
              
              <Stack direction="row" spacing={4} sx={{ mt: 6 }} className="cta-security-features">
                <Box className="security-feature">
                  <Verified sx={{ fontSize: 20 }} />
                  <Typography variant="body2">GDPR Compliant</Typography>
                </Box>
                <Box className="security-feature">
                  <Shield sx={{ fontSize: 20 }} />
                  <Typography variant="body2">SOC 2 Certified</Typography>
                </Box>
                <Box className="security-feature">
                  <LockPerson sx={{ fontSize: 20 }} />
                  <Typography variant="body2">End-to-End Encrypted</Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box className="gov-portal-footer">
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar 
                  src="/api/placeholder/32/32" 
                  alt="Gov Seal"
                  className="footer-seal"
                />
                <Typography variant="h6" className="footer-title">
                  Government Document Validation Portal
                </Typography>
              </Stack>
              <Typography variant="body2" className="footer-text">
                Official validation platform for government document compliance and verification.
                All validations are performed against current government standards and regulations.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={4} justifyContent="flex-end">
                <Box>
                  <Typography variant="caption" className="footer-heading">
                    SECURITY
                  </Typography>
                  <Typography variant="body2" className="footer-link">
                    Compliance Reports
                  </Typography>
                  <Typography variant="body2" className="footer-link">
                    Security Audits
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="footer-heading">
                    DOCUMENTATION
                  </Typography>
                  <Typography variant="body2" className="footer-link">
                    API Reference
                  </Typography>
                  <Typography variant="body2" className="footer-link">
                    Compliance Guide
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          <Typography variant="caption" className="copyright-text">
            © 2024 Government Document Validation System. All rights reserved. 
            This is an official government-affiliated validation platform.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;