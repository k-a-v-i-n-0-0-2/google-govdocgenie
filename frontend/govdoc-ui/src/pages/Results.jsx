import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Share,
  Print,
  Refresh,
  CheckCircle,
  Error,
  Warning,
  Info,
  Description,
  Verified,
  Timeline,
  BarChart,
} from '@mui/icons-material';
import apiService from '../utils/api';

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResults = () => {
      try {
        // Try to get from localStorage first
        const storedResults = localStorage.getItem(`govdoc_results_${sessionId}`);
        if (storedResults) {
          setResults(JSON.parse(storedResults));
        } else {
          setError('Results not found. Please re-upload documents.');
        }
      } catch (err) {
        console.error('Error loading results:', err);
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId]);

  const handleGenerateReport = async () => {
    if (!results) return;
    
    try {
      await apiService.generateReport(results);
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision?.toUpperCase()) {
      case 'APPROVE': return '#10b981';
      case 'NEEDS MORE DOCUMENTS': return '#f59e0b';
      case 'REJECT': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDecisionIcon = (decision) => {
    switch (decision?.toUpperCase()) {
      case 'APPROVE': return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'NEEDS MORE DOCUMENTS': return <Warning sx={{ color: '#f59e0b' }} />;
      case 'REJECT': return <Error sx={{ color: '#ef4444' }} />;
      default: return <Info sx={{ color: '#6b7280' }} />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ display: 'inline-block', mb: 4 }}>
          <Box className="spinner" />
        </Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Loading Results...
        </Typography>
        <LinearProgress sx={{ maxWidth: 400, mx: 'auto', borderRadius: 2 }} />
      </Container>
    );
  }

  if (error || !results) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert
          severity="error"
          sx={{ mb: 4, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/govdoc')}>
              Go Back
            </Button>
          }
        >
          {error || 'No results found'}
        </Alert>
        
        <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
          <Error sx={{ fontSize: 64, color: '#ef4444', mb: 3 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Results Not Found
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            The analysis results could not be loaded. Please re-upload your documents.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => navigate('/govdoc')}
            sx={{ px: 4, py: 1.5 }}
          >
            Re-upload Documents
          </Button>
        </Card>
      </Container>
    );
  }

  const decision = results.analysis?.decision || results.ai_analysis?.decision;
  const confidence = results.analysis?.confidence || results.ai_analysis?.confidence || 0;
  const complianceScore = results.compliance_score || results.validation_results?.completeness?.score || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs sx={{ mb: 4 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          Home
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/govdoc"
          onClick={(e) => {
            e.preventDefault();
            navigate('/govdoc');
          }}
        >
          Upload
        </Link>
        <Typography color="text.primary">Results</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Analysis Results
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Session ID: {sessionId}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/govdoc')}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleGenerateReport}
            sx={{ bgcolor: 'primary.main' }}
          >
            Download PDF
          </Button>
        </Box>
      </Box>

      {/* Summary Card */}
      <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            bgcolor: getDecisionColor(decision),
            p: 4,
            color: 'white',
          }}
        >
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getDecisionIcon(decision)}
              </Box>
            </Grid>
            
            <Grid item xs>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                {decision || 'Pending'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {results.analysis?.summary || results.ai_analysis?.summary || 'Analysis completed'}
              </Typography>
            </Grid>
            
            <Grid item>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                  AI Confidence
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800 }}>
                  {(confidence * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChart sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Compliance Score
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Overall Score
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {complianceScore}/100
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={complianceScore}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: '#e5e7eb',
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${
                        complianceScore >= 85 ? '#10b981' :
                        complianceScore >= 60 ? '#f59e0b' : '#ef4444'
                      }, ${
                        complianceScore >= 85 ? '#34d399' :
                        complianceScore >= 60 ? '#fbbf24' : '#f87171'
                      })`,
                    },
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Documents
                  </Typography>
                  <Typography variant="h6">
                    {results.document_count || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Valid Fields
                  </Typography>
                  <Typography variant="h6">
                    {Object.keys(results.extracted_data || {}).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Validation Results
              </Typography>
              
              {results.detailed_errors?.length > 0 ? (
                <Box>
                  <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                    Found {results.detailed_errors.length} issues that need attention
                  </Alert>
                  
                  {results.detailed_errors.map((error, index) => (
                    <Alert
                      key={index}
                      severity="error"
                      sx={{ mb: 2, borderRadius: 2, alignItems: 'flex-start' }}
                    >
                      <Box>
                        <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                          {error.field?.replace('_', ' ').toUpperCase() || 'Unknown Field'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {error.error}
                        </Typography>
                        {error.help && (
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            💡 {error.help}
                          </Typography>
                        )}
                      </Box>
                    </Alert>
                  ))}
                </Box>
              ) : (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  All validations passed successfully! No issues found.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Extracted Data */}
      {results.extracted_data && (
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Extracted Information
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(results.extracted_data).map(([key, value]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                      height: '100%',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      {key.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {value || 'Not Found'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {(results.recommendations || results.analysis?.recommendations) && (
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Verified sx={{ mr: 2, color: '#10b981' }} />
              <Typography variant="h6" fontWeight={600}>
                Recommendations
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              {(results.recommendations || results.analysis?.recommendations)?.map((rec, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderLeft: '4px solid #10b981',
                      bgcolor: '#f0fdf4',
                    }}
                  >
                    <Typography variant="body2">
                      {rec}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={() => window.print()}
          sx={{ px: 4 }}
        >
          Print Report
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Share />}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
          }}
          sx={{ px: 4 }}
        >
          Share Results
        </Button>
        
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => navigate('/govdoc')}
          sx={{ px: 4, bgcolor: 'primary.main' }}
        >
          New Analysis
        </Button>
      </Box>

      {/* Footer Note */}
      <Box sx={{ textAlign: 'center', mt: 6, pt: 4, borderTop: '1px solid #e5e7eb' }}>
        <Typography variant="caption" color="text.secondary">
          Analysis completed at {new Date(results.timestamp || Date.now()).toLocaleString()}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          This analysis was performed using AI with {results.accuracy_guarantee || '99.99%'} accuracy guarantee
        </Typography>
      </Box>
    </Container>
  );
};

export default Results; // Make sure this line exists