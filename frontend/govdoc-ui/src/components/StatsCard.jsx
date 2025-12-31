import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
} from '@mui/material';

const StatsCard = ({ value, label, icon, trend = '+12%' }) => {
  const isPositive = trend.startsWith('+');
  
  return (
    <Card
      className="fade-in hover-card"
      sx={{
        borderRadius: 3,
        bgcolor: 'white',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #4f46e5, #6366f1)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 0.5,
              }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#64748b', fontWeight: 500 }}
            >
              {label}
            </Typography>
          </Box>
          
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha('#4f46e5', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5',
            }}
          >
            {icon}
          </Box>
        </Box>
        
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 2,
              pt: 2,
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <Box
              sx={{
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderBottom: isPositive ? '6px solid #10b981' : '6px solid #ef4444',
                transform: isPositive ? 'none' : 'rotate(180deg)',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: isPositive ? '#10b981' : '#ef4444',
                fontWeight: 600,
              }}
            >
              {trend}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#94a3b8' }}
            >
              from last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;