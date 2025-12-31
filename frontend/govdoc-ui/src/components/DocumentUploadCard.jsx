import React, { useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  CheckCircle,
  Error,
  Delete,
  Info,
} from '@mui/icons-material';

const DocumentUploadCard = ({
  label,
  description,
  required,
  pattern,
  help,
  file,
  progress,
  error,
  onUpload,
  onRemove,
  delay = 0,
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      onUpload(droppedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <Card
      className="fade-in hover-card"
      sx={{
        height: '100%',
        borderRadius: 3,
        border: error ? '2px solid #ef4444' : '2px solid transparent',
        transition: 'all 0.3s ease',
        animationDelay: `${delay}s`,
        '&:hover': {
          borderColor: '#4f46e5',
        },
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description sx={{ color: '#4f46e5' }} />
            <Typography variant="h6" fontWeight={600}>
              {label}
            </Typography>
            {required && (
              <Chip
                label="Required"
                size="small"
                sx={{ bgcolor: '#dc2626', color: 'white', fontWeight: 600 }}
              />
            )}
          </Box>
          {help && (
            <Tooltip title={help}>
              <IconButton size="small">
                <Info sx={{ fontSize: 18, color: '#6b7280' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
          {description}
        </Typography>

        {pattern && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
              Expected Format:
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {pattern}
            </Typography>
          </Box>
        )}

        {!file ? (
          <Box sx={{ textAlign: 'center' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current.click()}
              sx={{
                py: 2,
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: '#d1d5db',
                '&:hover': {
                  borderColor: '#4f46e5',
                  bgcolor: 'rgba(79, 70, 229, 0.04)',
                },
              }}
            >
              Click or Drag to Upload
            </Button>
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                p: 2,
                bgcolor: '#f8fafc',
                borderRadius: 2,
                mb: 2,
                position: 'relative',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Description sx={{ color: '#10b981' }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 20, color: '#10b981' }} />
                  <IconButton size="small" onClick={onRemove}>
                    <Delete sx={{ fontSize: 20, color: '#6b7280' }} />
                  </IconButton>
                </Box>
              </Box>

              {progress < 100 && (
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    mt: 2,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#e5e7eb',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
                    },
                  }}
                />
              )}
            </Box>

            {progress === 100 && (
              <Alert
                severity="success"
                icon={<CheckCircle />}
                sx={{
                  borderRadius: 2,
                  bgcolor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                }}
              >
                Document uploaded successfully
              </Alert>
            )}
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            icon={<Error />}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUploadCard;