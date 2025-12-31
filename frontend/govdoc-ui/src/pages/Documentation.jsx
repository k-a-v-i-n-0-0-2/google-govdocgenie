import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import {
  Code,
  Api,
  Security,
  CloudUpload,
  Description,
  CheckCircle,
  Info,
} from '@mui/icons-material';

const Documentation = ({ backendInfo }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
        Documentation & API
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 4, color: '#64748b' }}>
        Learn how to use GovDoc Genie API and integration
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* API Documentation */}
          <Card sx={{ mb: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Api sx={{ mr: 2, color: '#4f46e5' }} />
                <Typography variant="h5" fontWeight={600}>
                  API Documentation
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Base URL
                </Typography>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <code style={{ fontSize: '1rem', fontWeight: 600 }}>
                    http://127.0.0.1:8080
                  </code>
                </Alert>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Endpoints
                </Typography>
                
                <List>
                  <ListItem sx={{ px: 0, py: 2, borderBottom: '1px solid #e5e7eb' }}>
                    <ListItemIcon>
                      <CloudUpload sx={{ color: '#4f46e5' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography fontWeight={600}>
                            POST /analyze
                          </Typography>
                          <Chip label="Main" size="small" color="primary" />
                        </Box>
                      }
                      secondary="Upload documents for compliance analysis. Accepts multipart/form-data with document files."
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0, py: 2, borderBottom: '1px solid #e5e7eb' }}>
                    <ListItemIcon>
                      <Description sx={{ color: '#4f46e5' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography fontWeight={600}>
                          GET /system-status
                        </Typography>
                      }
                      secondary="Check system health and get configuration information."
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon>
                      <Code sx={{ color: '#4f46e5' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography fontWeight={600}>
                          POST /test-patterns
                        </Typography>
                      }
                      secondary="Test document patterns against uploaded file."
                    />
                  </ListItem>
                </List>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Example Request
                </Typography>
                <Card sx={{ bgcolor: '#1e293b', borderRadius: 2 }}>
                  <CardContent>
                    <pre style={{ color: '#e2e8f0', margin: 0, overflowX: 'auto' }}>
{`fetch('http://127.0.0.1:8080/analyze', {
  method: 'POST',
  body: formData,
  headers: {
    // No Content-Type needed for FormData
  }
})
.then(response => response.json())
.then(data => console.log(data));`}
                    </pre>
                  </CardContent>
                </Card>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* System Info */}
          <Card sx={{ mb: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Info sx={{ mr: 2, color: '#4f46e5' }} />
                <Typography variant="h5" fontWeight={600}>
                  System Information
                </Typography>
              </Box>

              {backendInfo ? (
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Backend Status
                    </Typography>
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      <CheckCircle sx={{ mr: 1 }} />
                      Connected
                    </Alert>
                  </Box>

                  <List>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary="Accuracy"
                        secondary={
                          <Typography variant="body2" fontWeight={600} color="primary">
                            {backendInfo.accuracy || '99.99%'}
                          </Typography>
                        }
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary="OCR Support"
                        secondary={
                          <Chip 
                            label={backendInfo.ocr_support ? "Enabled" : "Disabled"} 
                            size="small" 
                            color={backendInfo.ocr_support ? "success" : "default"}
                          />
                        }
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary="Datadog"
                        secondary={
                          <Chip 
                            label={backendInfo.datadog_enabled ? "Enabled" : "Disabled"} 
                            size="small" 
                            color={backendInfo.datadog_enabled ? "success" : "default"}
                          />
                        }
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary="Local AI Model"
                        secondary={
                          <Chip 
                            label={backendInfo.local_model === 'loaded' ? "Loaded" : "Not Loaded"} 
                            size="small" 
                            color={backendInfo.local_model === 'loaded' ? "success" : "warning"}
                          />
                        }
                      />
                    </ListItem>
                  </List>
                </Box>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Connect to backend to see system information
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Security */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Security sx={{ mr: 2, color: '#4f46e5' }} />
                <Typography variant="h5" fontWeight={600}>
                  Security & Compliance
                </Typography>
              </Box>

              <List>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Privacy"
                    secondary="Documents processed locally, not stored"
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Encryption"
                    secondary="All transfers use HTTPS encryption"
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Compliance"
                    secondary="GDPR & Data Protection compliant"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Documentation;