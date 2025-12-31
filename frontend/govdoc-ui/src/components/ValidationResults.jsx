import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  ExpandMore,
  Description,
  Verified,
  Download,
  Share,
} from '@mui/icons-material';

const ValidationResults = ({ results, preview = false }) => {
  if (!results) return null;

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'APPROVE': return '#10b981';
      case 'NEEDS MORE DOCUMENTS': return '#f59e0b';
      case 'REJECT': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (reason) => {
    if (reason.startsWith('✅')) return <CheckCircle sx={{ color: '#10b981' }} />;
    if (reason.startsWith('❌')) return <Error sx={{ color: '#ef4444' }} />;
    if (reason.startsWith('⚠️')) return <Warning sx={{ color: '#f59e0b' }} />;
    return <Info sx={{ color: '#3b82f6' }} />;
  };

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box
        sx={{
          bgcolor: getDecisionColor(results.analysis?.decision || results.ai_analysis?.decision),
          p: 3,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            Validation Results
          </Typography>
          <Chip
            label={results.analysis?.decision || results.ai_analysis?.decision || 'PENDING'}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          />
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          {results.analysis?.summary || results.ai_analysis?.summary || 'Analysis in progress'}
        </Typography>
      </Box>

      <CardContent>
        {/* Confidence Score */}
        {(results.analysis?.confidence || results.ai_analysis?.confidence) && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" fontWeight={600}>
                AI Confidence Score
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {((results.analysis?.confidence || results.ai_analysis?.confidence) * 100).toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(results.analysis?.confidence || results.ai_analysis?.confidence || 0) * 100}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
                },
              }}
            />
          </Box>
        )}

        {/* Compliance Score */}
        {(results.compliance_score || results.validation_results?.completeness?.score) && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" fontWeight={600}>
                Overall Compliance Score
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {results.compliance_score || results.validation_results?.completeness?.score || 0}/100
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={results.compliance_score || results.validation_results?.completeness?.score || 0}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${
                    (results.compliance_score || results.validation_results?.completeness?.score || 0) >= 85 ? '#10b981' :
                    (results.compliance_score || results.validation_results?.completeness?.score || 0) >= 60 ? '#f59e0b' : '#ef4444'
                  }, ${
                    (results.compliance_score || results.validation_results?.completeness?.score || 0) >= 85 ? '#34d399' :
                    (results.compliance_score || results.validation_results?.completeness?.score || 0) >= 60 ? '#fbbf24' : '#f87171'
                  })`,
                },
              }}
            />
          </Box>
        )}

        {/* Key Findings */}
        {(results.analysis?.reasons || results.detailed_errors) && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Key Findings
            </Typography>
            <List>
              {results.analysis?.reasons?.map((reason, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getSeverityIcon(reason)}
                  </ListItemIcon>
                  <ListItemText
                    primary={reason.replace(/^[✅❌⚠️]\s*/, '')}
                    primaryTypographyProps={{
                      fontWeight: reason.startsWith('❌') ? 600 : 400,
                      color: reason.startsWith('❌') ? '#ef4444' : 'inherit',
                    }}
                  />
                </ListItem>
              ))}
              
              {results.detailed_errors?.map((error, index) => (
                <ListItem key={`error-${index}`} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Error sx={{ color: '#ef4444' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={error.error || error.field}
                    secondary={error.help}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      color: '#ef4444',
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Extracted Data */}
        {results.extracted_data && (
          <Accordion sx={{ mb: 3, borderRadius: '8px !important' }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" fontWeight={600}>
                Extracted Information
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {Object.entries(results.extracted_data).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: '#f8fafc',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                        {key.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {value || 'Not Found'}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Recommendations */}
        {(results.recommendations || results.analysis?.recommendations) && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#10b981' }}>
              Recommendations
            </Typography>
            <List>
              {(results.recommendations || results.analysis?.recommendations)?.map((rec, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Verified sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={rec}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {!preview && (
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<Download />}
              sx={{
                flex: 1,
                py: 1.5,
                background: 'linear-gradient(45deg, #4f46e5, #6366f1)',
              }}
            >
              Download Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
              sx={{ flex: 1, py: 1.5 }}
            >
              Share Results
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationResults;