// src/pages/GovDoc.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  CheckCircle,
  Error,
  Warning,
  Info,
  Delete,
  ArrowForward,
  Help,
  Close,
  ExpandMore,
  AutoAwesome,
  Verified,
  Assignment,
  PictureAsPdf,
  Code,
  Share,
  Speed,
  Security,
  SmartToy,
} from '@mui/icons-material';
import apiService from '../utils/api';
import './GovDoc.css';

const GovDoc = ({ backendStatus }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [documents, setDocuments] = useState({
    gst_file: null,
    pan_file: null,
    udyam_file: null,
    quotation_file: null,
    signature_file: null,
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [helpOpen, setHelpOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const documentTypes = [
    {
      key: 'gst_file',
      label: 'GST Certificate',
      description: 'GSTIN verification document (PDF/Image)',
      required: true,
      pattern: '27ABCDE1234F1Z5',
      help: '15-character GSTIN format with state code',
    },
    {
      key: 'pan_file',
      label: 'PAN Card',
      description: 'Permanent Account Number card (PDF/Image)',
      required: true,
      pattern: 'ABCDE1234F',
      help: '10-character PAN format',
    },
    {
      key: 'udyam_file',
      label: 'Udyam Certificate',
      description: 'MSME/Udyam registration certificate',
      required: true,
      pattern: 'UDYAM-MH-01-1234567',
      help: 'UDYAM-State-District-Registration',
    },
    {
      key: 'quotation_file',
      label: 'Quotation Document',
      description: 'Commercial quotation with pricing',
      required: true,
      pattern: 'Include company name, date, price',
      help: 'Must include company details and pricing',
    },
    {
      key: 'signature_file',
      label: 'Signature Document',
      description: 'Signed authorization document (PDF/Image)',
      required: true,
      pattern: 'Authorized signature',
      help: 'Document with valid signature',
    },
  ];

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleFileUpload = (fileType, file) => {
    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      showSnackbar(`File ${file.name} exceeds 16MB limit`, 'error');
      return;
    }
    
    // Validate file type
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const extension = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(extension)) {
      showSnackbar(`File ${file.name} must be PDF, PNG, JPG, or JPEG`, 'error');
      return;
    }
    
    setDocuments(prev => ({ ...prev, [fileType]: file }));
    showSnackbar(`${fileType.replace('_file', '').toUpperCase()} uploaded successfully`, 'success');
    
    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [fileType]: 0 }));
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = { ...prev, [fileType]: Math.min(prev[fileType] + 10, 100) };
        if (newProgress[fileType] >= 100) {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 100);
  };

  const handleRemoveFile = (fileType) => {
    setDocuments(prev => ({ ...prev, [fileType]: null }));
    setUploadProgress(prev => ({ ...prev, [fileType]: 0 }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const fileType = Object.keys(documents).find(key => 
        file.name.toLowerCase().includes(key.replace('_file', ''))
      ) || 'gst_file';
      handleFileUpload(fileType, file);
    }
  };

  const handleSubmit = async () => {
    if (!validateUploads()) return;
    
    setProcessing(true);
    setActiveStep(1);
    setResults(null);
    
    try {
      // Create FormData for backend
      const formData = new FormData();
      
      // Append all files with correct field names
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });
      
      // Call backend API
      console.log('Sending documents to backend...');
      const result = await apiService.analyzeDocuments(formData);
      
      if (result.success) {
        setResults(result);
        setActiveStep(3);
        showSnackbar('Analysis completed successfully!', 'success');
      } else {
        throw new Error(result.error || result.message || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('Error analyzing documents:', error);
      setActiveStep(0);
      showSnackbar(`Error: ${error.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const validateUploads = () => {
    const newErrors = {};
    let hasErrors = false;

    documentTypes.forEach(doc => {
      if (doc.required && !documents[doc.key]) {
        newErrors[doc.key] = `${doc.label} is required`;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const getUploadStatus = () => {
    const uploaded = Object.values(documents).filter(Boolean).length;
    const required = documentTypes.filter(d => d.required).length;
    return { uploaded, required, complete: uploaded >= required };
  };

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'APPROVE': return '#10b981';
      case 'NEEDS MORE DOCUMENTS': return '#f59e0b';
      case 'REJECT': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDecisionIcon = (decision) => {
    switch (decision) {
      case 'APPROVE': return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'NEEDS MORE DOCUMENTS': return <Warning sx={{ color: '#f59e0b' }} />;
      case 'REJECT': return <Error sx={{ color: '#ef4444' }} />;
      default: return <Info sx={{ color: '#6b7280' }} />;
    }
  };

  const generateReport = async (format) => {
    if (!results) return;
    
    try {
      if (format === 'pdf') {
        await apiService.generateReport(results);
        showSnackbar('PDF report downloaded successfully!', 'success');
      } else {
        // JSON download
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `govdoc-report-${Date.now()}.json`;
        link.click();
        showSnackbar('JSON report downloaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      showSnackbar('Failed to generate report', 'error');
    }
  };

  const status = getUploadStatus();

  return (
    <Box className="govdoc-portal full-width" sx={{ width: '100vw', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Header Section */}
      <Box className="govdoc-header full-width" sx={{ width: '100vw', maxWidth: '100vw' }}>
        <Container maxWidth={false} className="full-width" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 } }}>
          <Box className="header-content" sx={{ maxWidth: '1400px', mx: 'auto' }}>
            <Typography variant="h3" className="portal-title">
              GovDoc Genie - AI Compliance Checker
            </Typography>
            <Typography variant="h6" className="portal-subtitle">
              Accuracy with Detailed Error Reporting
            </Typography>
            
            
          </Box>
        </Container>
      </Box>

      {/* Main Content - FULL WIDTH */}
      <Container 
        maxWidth={false} 
        className="govdoc-main-container full-width" 
        sx={{ 
          px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
          width: '100vw',
          maxWidth: '100vw'
        }}
      >
        <Grid 
          container 
          spacing={4} 
          className="main-grid-container full-width"
          sx={{ width: '100%', maxWidth: '100%', mx: 0 }}
        >
          {/* Left Column - Upload Section */}
          <Grid 
            item 
            xs={12} 
            md={5} 
            className="grid-item-left"
            sx={{ width: '100%', maxWidth: '100%' }}
          >
            <Card className="upload-section-card full-width" sx={{ width: '100%', maxWidth: '100%' }}>
              <Box className="upload-card-header">
                <Box className="upload-icon-container">
                  <CloudUpload className="upload-icon" />
                </Box>
                <Typography variant="h5" className="upload-section-title">
                  Upload Tender Documents
                </Typography>
              </Box>

              {/* Drag & Drop Area */}
              <Box className="drag-drop-container">
                <Paper
                  className="drag-drop-area"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUpload className="drag-drop-icon" />
                  <Typography variant="h6" className="drag-drop-title">
                    Drag & Drop Files Here
                  </Typography>
                  <Typography variant="body2" className="drag-drop-subtitle">
                    or click to browse files
                  </Typography>
                  <Typography variant="caption" className="drag-drop-info">
                    Supports PDF, JPG, PNG (Max 16MB each)
                  </Typography>
                </Paper>
              </Box>

              <input
                type="file"
                ref={fileInputRef}
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files.length > 0) {
                    const file = files[0];
                    // Try to guess file type from name
                    const fileName = file.name.toLowerCase();
                    let fileType = 'gst_file';
                    if (fileName.includes('pan')) fileType = 'pan_file';
                    else if (fileName.includes('udyam')) fileType = 'udyam_file';
                    else if (fileName.includes('quote') || fileName.includes('price')) fileType = 'quotation_file';
                    else if (fileName.includes('sign')) fileType = 'signature_file';
                    handleFileUpload(fileType, file);
                  }
                }}
              />

              {/* Documents List */}
              <Box className="documents-list">
                {documentTypes.map((docType) => (
                  <Box key={docType.key} className="doc-upload-item">
                    <Box className="doc-label-row">
                      <Typography variant="body1" className="doc-label">
                        {docType.label} {docType.required && <span className="required-star">*</span>}
                      </Typography>
                      {documents[docType.key] && (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(docType.key)}
                          className="remove-file-btn"
                          sx={{ color: '#ef4444' }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                    
                    {!documents[docType.key] ? (
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Description />}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.pdf,.png,.jpg,.jpeg';
                          input.onchange = (e) => {
                            if (e.target.files[0]) {
                              handleFileUpload(docType.key, e.target.files[0]);
                            }
                          };
                          input.click();
                        }}
                        sx={{
                          borderStyle: 'dashed',
                          py: 1.5,
                          borderRadius: 2,
                        }}
                      >
                        Upload {docType.label}
                      </Button>
                    ) : (
                      <Paper className="file-info-card">
                        <Box className="file-details">
                          <Description className="file-icon" />
                          <Box>
                            <Typography variant="body2" className="file-name">
                              {documents[docType.key].name}
                            </Typography>
                            <Typography variant="caption" className="file-size">
                              {(documents[docType.key].size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                        </Box>
                        <CheckCircle sx={{ color: '#10b981' }} />
                      </Paper>
                    )}
                    
                    <Typography variant="caption" className="doc-help-text">
                      <Info sx={{ fontSize: 14, verticalAlign: 'middle' }} />
                      {docType.description}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Upload Progress */}
              <Box className="upload-progress-section">
                <Box className="progress-label-row">
                  <Typography variant="body2" className="progress-label">
                    Documents Uploaded
                  </Typography>
                  <Typography variant="body2" className="progress-count">
                    {status.uploaded}/{status.required}
                  </Typography>
                </Box>
                <Box className="progress-bar-container">
                  <Box 
                    className="progress-bar-fill" 
                    style={{ width: `${(status.uploaded / status.required) * 100}%` }}
                  />
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box className="action-buttons-section">
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!status.complete || processing}
                  startIcon={processing ? <CircularProgress size={20} /> : <AutoAwesome />}
                  className="analyze-btn"
                >
                  {processing ? 'Analyzing...' : 'Analyze Compliance'}
                </Button>

                <Box className="secondary-actions-row">
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setHelpOpen(true)}
                    startIcon={<Help />}
                    className="secondary-action-btn"
                  >
                    Help
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setDocuments({
                        gst_file: null,
                        pan_file: null,
                        udyam_file: null,
                        quotation_file: null,
                        signature_file: null,
                      });
                      setResults(null);
                      setActiveStep(0);
                    }}
                    startIcon={<Delete />}
                    className="secondary-action-btn"
                  >
                    Clear All
                  </Button>
                </Box>
              </Box>
            </Card>

            {/* AI Status Card */}
            <Card className="ai-status-card full-width" sx={{ width: '100%', maxWidth: '100%', mt: 4 }}>
              <Box className="ai-status-header">
                <SmartToy className="ai-status-icon" />
                <Typography variant="h6" className="ai-status-title">
                  AI Model Status
                </Typography>
              </Box>
              
              <List className="status-list">
                <ListItem className="status-list-item">
                  <ListItemIcon className="status-list-icon">
                    <Verified sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary=" Accuracy"
                    secondary="Cross-validation with multiple AI models"
                  />
                </ListItem>
                
                <ListItem className="status-list-item">
                  <ListItemIcon className="status-list-icon">
                    <Speed sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="OCR Support Active"
                    secondary="Processes image-based PDFs and scans"
                  />
                </ListItem>
                
                <ListItem className="status-list-item">
                  <ListItemIcon className="status-list-icon">
                    <Security sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Local AI Model"
                    secondary="No data leaves your system"
                  />
                </ListItem>
              </List>
            </Card>
          </Grid>

          {/* Right Column - Results Display - FULL WIDTH */}
          <Grid 
            item 
            xs={12} 
            md={7} 
            className="grid-item-right right-side-content"
            sx={{ width: '100%', maxWidth: '100%' }}
          >
            {processing ? (
              <Card className="processing-state-card full-width" sx={{ width: '100%', maxWidth: '100%' }}>
                <CardContent className="processing-content">
                  <CircularProgress size={80} className="processing-icon" />
                  <Typography variant="h5" className="processing-title">
                    AI Analysis in Progress
                  </Typography>
                  <Typography variant="body1" className="processing-text">
                    Our AI is processing your documents  accuracy...
                  </Typography>
                  
                  <LinearProgress sx={{ mb: 2, maxWidth: 400, mx: 'auto', height: 8, borderRadius: 4 }} />
                  <Typography variant="caption" className="processing-subtext">
                    Extracting text → Validating patterns → Running AI checks → Cross-verifying
                  </Typography>
                </CardContent>
              </Card>
            ) : results ? (
              <Box className="results-container full-width" sx={{ width: '100%', maxWidth: '100%' }}>
                {/* Decision Score Card */}
                <Card className="decision-score-card full-width" sx={{ width: '100%', maxWidth: '100%' }}>
                  <Box
                    className="decision-header"
                    sx={{ bgcolor: getDecisionColor(results.analysis?.decision), width: '100%' }}
                  >
                    <Grid container alignItems="center" spacing={3} sx={{ width: '100%' }}>
                      <Grid item xs={12} md="auto">
                        <Box className="decision-badge">
                          {getDecisionIcon(results.analysis?.decision)}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md>
                        <Typography variant="h3" className="decision-title">
                          {results.analysis?.decision || 'PENDING'}
                        </Typography>
                        <Typography variant="body1" className="decision-summary">
                          {results.analysis?.summary || 'Analysis completed'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md="auto">
                        <Box className="confidence-score">
                          <Typography variant="h6" className="confidence-label">
                            AI Confidence
                          </Typography>
                          <Typography variant="h2" className="confidence-value">
                            {((results.analysis?.confidence || 0) * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>

                {/* Quick Stats */}
                <Grid container spacing={2} className="stats-grid full-width" sx={{ width: '100%', maxWidth: '100%' }}>
                  <Grid item xs={6} sm={3}>
                    <Card className="stats-card">
                      <CardContent>
                        <Typography variant="h4" className="stats-value" sx={{ color: '#4f46e5' }}>
                          {results.compliance_score || 0}
                        </Typography>
                        <Typography variant="caption" className="stats-label">
                          Compliance Score
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Card className="stats-card">
                      <CardContent>
                        <Typography variant="h4" className="stats-value" sx={{ color: '#10b981' }}>
                          {Object.keys(results.extracted_data || {}).length}
                        </Typography>
                        <Typography variant="caption" className="stats-label">
                          Fields Found
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Card className="stats-card">
                      <CardContent>
                        <Typography variant="h4" className="stats-value" sx={{ color: results.detailed_errors?.length > 0 ? '#f59e0b' : '#10b981' }}>
                          {results.detailed_errors?.length || 0}
                        </Typography>
                        <Typography variant="caption" className="stats-label">
                          Issues Found
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Card className="stats-card">
                      <CardContent>
                        <Typography variant="h4" className="stats-value" sx={{ color: '#6366f1' }}>
                          {results.document_count || 0}
                        </Typography>
                        <Typography variant="caption" className="stats-label">
                          Documents
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Detailed Findings */}
                <Card className="findings-card full-width" sx={{ width: '100%', maxWidth: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" className="findings-header">
                      Detailed Findings
                    </Typography>
                    
                    <List className="findings-list">
                      {results.analysis?.reasons?.map((reason, index) => (
                        <ListItem key={index} className="findings-list-item">
                          <ListItemIcon className="findings-list-icon">
                            {reason.includes('✅') ? (
                              <CheckCircle sx={{ color: '#10b981' }} />
                            ) : reason.includes('❌') ? (
                              <Error sx={{ color: '#ef4444' }} />
                            ) : reason.includes('⚠️') ? (
                              <Warning sx={{ color: '#f59e0b' }} />
                            ) : (
                              <Info sx={{ color: '#3b82f6' }} />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={reason.replace(/^[✅❌⚠️]\s*/, '')}
                            primaryTypographyProps={{
                              fontWeight: reason.includes('❌') ? 600 : 400,
                              color: reason.includes('❌') ? '#ef4444' : 'inherit',
                            }}
                          />
                        </ListItem>
                      ))}
                      
                      {(!results.analysis?.reasons || results.analysis.reasons.length === 0) && (
                        <ListItem className="findings-list-item">
                          <ListItemIcon className="findings-list-icon">
                            <CheckCircle sx={{ color: '#10b981' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="All checks passed successfully"
                            primaryTypographyProps={{ color: '#10b981' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>

                {/* Extracted Data */}
                <Accordion className="extracted-data-accordion full-width" sx={{ width: '100%', maxWidth: '100%' }}>
                  <AccordionSummary expandIcon={<ExpandMore />} className="extracted-data-header">
                    <Assignment className="extracted-data-icon" />
                    <Typography variant="h6" className="extracted-data-title">
                      Extracted Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2} className="extracted-fields-grid">
                      {results.extracted_data && Object.entries(results.extracted_data).map(([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Paper className="extracted-field-card">
                            <Typography variant="caption" className="extracted-field-label">
                              {key.replace('_', ' ').toUpperCase()}
                            </Typography>
                            <Typography variant="body1" className="extracted-field-value">
                              {value || 'Not Found'}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Detailed Errors */}
                {results.detailed_errors && results.detailed_errors.length > 0 && (
                  <Card className="error-card full-width" sx={{ width: '100%', maxWidth: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" className="error-header">
                        <Error sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Missing Required Documents
                      </Typography>
                      
                      <Box className="error-content">
                        {results.detailed_errors.map((error, index) => (
                          <Alert
                            key={index}
                            severity="error"
                            className="error-alert"
                          >
                            <Box>
                              <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                                {error.field?.replace('_', ' ').toUpperCase()}
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
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {results.recommendations && results.recommendations.length > 0 && (
                  <Card className="recommendations-card full-width" sx={{ width: '100%', maxWidth: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" className="recommendations-header">
                        <Verified sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Recommendations
                      </Typography>
                      
                      <List className="recommendations-list">
                        {results.recommendations.map((rec, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <CheckCircle sx={{ color: '#10b981' }} />
                            </ListItemIcon>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                )}

                {/* Report Actions */}
                <Card className="report-actions-card full-width" sx={{ width: '100%', maxWidth: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" className="report-actions-header">
                      Download Reports
                    </Typography>
                    
                    <Grid container spacing={2} className="report-buttons-grid" sx={{ width: '100%' }}>
                      <Grid item xs={12} sm={4}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<PictureAsPdf />}
                          onClick={() => generateReport('pdf')}
                          className="report-btn pdf-report-btn"
                        >
                          PDF Report
                        </Button>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<Code />}
                          onClick={() => generateReport('json')}
                          className="report-btn json-report-btn"
                        >
                          JSON Data
                        </Button>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<Share />}
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            showSnackbar('Link copied to clipboard!', 'success');
                          }}
                          className="report-btn share-btn"
                        >
                          Share
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Card className="empty-state-card full-width" sx={{ width: '100%', maxWidth: '100%' }}>
                <CardContent className="empty-state-content">
                  <Box className="empty-state-icon-container">
                    <Description className="empty-state-icon" />
                  </Box>
                  
                  <Typography variant="h5" className="empty-state-title">
                    No Analysis Yet
                  </Typography>
                  
                  <Typography variant="body1" className="empty-state-description">
                    Upload your tender documents and click "Analyze Compliance" to get started.
                    The system will show:
                  </Typography>
                  
                  <List className="empty-state-list">
                    <ListItem className="empty-state-list-item">
                      <ListItemIcon className="empty-state-list-icon">
                        <CheckCircle sx={{ color: '#10b981' }} />
                      </ListItemIcon>
                      <ListItemText primary="What was extracted from each document" />
                    </ListItem>
                    
                    <ListItem className="empty-state-list-item">
                      <ListItemIcon className="empty-state-list-icon">
                        <Error sx={{ color: '#ef4444' }} />
                      </ListItemIcon>
                      <ListItemText primary="What patterns were not found" />
                    </ListItem>
                    
                    <ListItem className="empty-state-list-item">
                      <ListItemIcon className="empty-state-list-icon">
                        <AutoAwesome sx={{ color: '#3b82f6' }} />
                      </ListItemIcon>
                      <ListItemText primary="Exact reasons for approval/rejection" />
                    </ListItem>
                    
                    <ListItem className="empty-state-list-item">
                      <ListItemIcon className="empty-state-list-icon">
                        <Verified sx={{ color: '#8b5cf6' }} />
                      </ListItemIcon>
                      <ListItemText primary="Detailed evidence with locations" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Help Dialog */}
      <Dialog 
        open={helpOpen} 
        onClose={() => setHelpOpen(false)} 
        className="help-dialog"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="dialog-title">
          Document Requirements
        </DialogTitle>
        <DialogContent className="dialog-content">
          <Box sx={{ mt: 2 }}>
            {documentTypes.map((doc) => (
              <Box key={doc.key} className="help-doc-item">
                <Typography variant="subtitle1" className="doc-item-title">
                  {doc.label} {doc.required && <Chip label="Required" size="small" className="required-chip" />}
                </Typography>
                <Typography variant="body2" className="doc-item-description">
                  {doc.description}
                </Typography>
                <Box className="doc-item-info">
                  <Info sx={{ fontSize: 16 }} />
                  <Typography variant="caption">
                    Format: {doc.pattern}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setHelpOpen(false)} 
            variant="outlined"
            className="secondary-action-btn"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          className="snackbar-alert"
          sx={{ maxWidth: '400px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GovDoc;