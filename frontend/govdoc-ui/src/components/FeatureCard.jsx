import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
} from '@mui/material';

const FeatureCard = ({ icon, title, description, color, delay = 0 }) => {
  return (
    <Card
      className="fade-in hover-card"
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        animationDelay: `${delay}s`,
        '&:hover': {
          borderColor: color,
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 40px ${alpha(color, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            bgcolor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            color: color,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              bgcolor: `${color}25`,
            },
          }}
        >
          {icon}
        </Box>
        
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: '#1e293b',
          }}
        >
          {title}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            lineHeight: 1.6,
            flexGrow: 1,
          }}
        >
          {description}
        </Typography>
        
        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: `1px solid ${alpha(color, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: color,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Learn More →
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;