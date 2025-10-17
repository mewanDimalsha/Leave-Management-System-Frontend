import React from 'react'
import { 
  Paper, 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material'

const CombinedFilter = ({ 
  searchName, 
  setSearchName, 
  statusFilter, 
  setStatusFilter 
}) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5} md={4}>
          <TextField
            label="Search by Employee Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={7} md={5}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default CombinedFilter
