import React from 'react'
import SendIcon from '@mui/icons-material/Send';

const Button = () => {
  return (
    <MuiButton
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
                  </MuiButton>
  )
}

export default Button