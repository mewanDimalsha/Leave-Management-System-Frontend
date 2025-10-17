import React from 'react'
import { Grid, Paper, TextField } from '@mui/material';

const EmployeeFilter = ({ searchName, setSearchName }) => {
  return (
  <Paper sx={{ p: 2, mb: 3 }}>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Search by Employee Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          fullWidth
          size="small"
        />
      </Grid>

    </Grid>
  </Paper>


  )
}

export default EmployeeFilter