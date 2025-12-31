// components/Footer.jsx
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  GitHub,
  Twitter,
  LinkedIn,
  Email,
  RocketLaunch,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1e293b',
        color: 'white',
        py: 8,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <RocketLaunch sx={{ mr: 1, fontSize: 32, color: '#6366f1' }} />
              <Typography variant="h6" fontWeight={800}>
                GovDoc Genie
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, color: '#94a3b8' }}>
              AI-powered document compliance validation system built for the
              Google Hackathon. Enterprise-grade accuracy with beautiful UX.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                sx={{ color: '#94a3b8', '&:hover': { color: '#6366f1' } }}
              >
                <GitHub />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: '#94a3b8', '&:hover': { color: '#6366f1' } }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: '#94a3b8', '&:hover': { color: '#6366f1' } }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: '#94a3b8', '&:hover': { color: '#6366f1' } }}
              >
                <Email />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Product
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" sx={{ color: '#94a3b8', textDecoration: 'none' }}>
                Features
              </Link>
              <Link href="#" sx={{ color: '#94a3b8', textDecoration: 'none' }}>
                Pricing
              </Link>
              <Link href="#" sx={{ color: '#94a3b8', textDecoration: 'none' }}>
                API
              </Link>
              <Link href="#" sx={{ color: '#94a3b8', textDecoration: 'none' }}>
                Documentation
              </Link>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" sx={{ color: '#94a3b8', textDecoration: 'none' }}>
                Blog
              </Link>
              <Link href="#" sx={{ color: '#94a3b8', textDecoration: 'none' }}>
                Case Studies
              </Link>
              <Link href="#" sx={{ color: '#94a3b8', textDecoration: 'none' }}>
                Support
              </Link>
              <Link href="#" sx={{ color: '#94a3b8', textDecoration: 'none' }}>
                Community
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Subscribe to our newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#94a3b8' }}>
              Stay updated with new features and compliance updates.
            </Typography>
            <Box
              component="form"
              sx={{ display: 'flex', gap: 1, maxWidth: 400 }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #334155',
                  backgroundColor: 'transparent',
                  color: 'white',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(45deg, #4f46e5, #6366f1)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Subscribe
              </button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#334155' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            © 2024 GovDoc Genie. Built for Google Hackathon.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" sx={{ color: '#94a3b8', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link href="#" sx={{ color: '#94a3b8', textDecoration: 'none' }}>
              Terms of Service
            </Link>
            <Link href="#" sx={{ color: '#94a3b8', textDecoration: 'none' }}>
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;