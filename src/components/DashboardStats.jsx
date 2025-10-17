import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid
} from '@mui/material'

const DashboardStats = ({ leaves = [] }) => {
  // Calculate statistics
  const pendingCount = leaves.filter(leave => leave.status === 'Pending').length
  const approvedCount = leaves.filter(leave => leave.status === 'Approved').length
  const rejectedCount = leaves.filter(leave => leave.status === 'Rejected').length

  const stats = [
    {
      title: 'Pending',
      count: pendingCount,
      color: '#ed6c02'
    },
    {
      title: 'Approved',
      count: approvedCount,
      color: '#2e7d32'
    },
    {
      title: 'Rejected',
      count: rejectedCount,
      color: '#d32f2f'
    }
  ]

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={4} justifyContent="center">
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={3} md={2} key={index}>
            <Card 
              elevation={1}
              sx={{ 
                borderRadius: 1.5,
                textAlign: 'center',
                minHeight: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography 
                  variant="h4" 
                  fontWeight={600}
                  color={stat.color}
                  mb={0.5}
                >
                  {stat.count}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  fontWeight={500}
                >
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default DashboardStats
