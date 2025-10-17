import React from 'react'
import { Button } from '@mui/material'
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';

const MuiButton = () => {
  const navigate = useNavigate();

  const handleApplyLeave = () => {
    navigate('/leave-form');
  };

  return (
    <Button
      variant="contained"
      color="primary"
      endIcon={<SendIcon />}
      onClick={handleApplyLeave}
      sx={{
        px: 3,
        py: 1.2,
        borderRadius: 2,
        fontWeight: 600,
        boxShadow: 2,
        textTransform: "none",
      }}
    >
      Apply Leave
    </Button>
  )
}

export default MuiButton