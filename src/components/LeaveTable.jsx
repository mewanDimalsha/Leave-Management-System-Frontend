import { Box, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip} from '@mui/material'
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const LeaveTable = ({ leaves }) => {

  const handleEdit = (id) => {
    console.log("Edit leave:", id);
  };

  const handleCancel = (id) => {
    console.log("Cancel leave:", id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "warning";
    }
  };
  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h6"
        fontWeight={600}
        color="primary.main"
        mb={2}
        textAlign="center"
      >
        My Leave Requests
      </Typography>
      <TableContainer
        component={Paper}
        elevation={3}
        sx={{ borderRadius: 3, overflow: "hidden" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                From Date
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                To Date
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Reason
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell
                sx={{ color: "#fff", fontWeight: "bold" }}
                align="center"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow
                key={leave.id}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                  "&:hover": { backgroundColor: "action.selected" },
                }}
              >
                <TableCell>{leave.fromDate}</TableCell>
                <TableCell>{leave.toDate}</TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>
                  <Chip
                    label={leave.status}
                    color={getStatusColor(leave.status)}
                    variant="filled"
                    size="small"
                  />
                </TableCell>

                <TableCell align="center">
                  {leave.status === "Pending" && (
                    <>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(leave.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleCancel(leave.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default LeaveTable
