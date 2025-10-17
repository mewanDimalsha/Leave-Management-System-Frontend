import React from 'react'
import { Button } from '@mui/material'
import SendIcon from '@mui/icons-material/Send';

const MuiButton = () => {
  return (
    <Button
      variant="contained"
      color="primary"
      endIcon={<SendIcon />}
      type="submit"
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