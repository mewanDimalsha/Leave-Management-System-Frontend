import { Box, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Button} from '@mui/material'
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { deleteLeave, approveLeave, rejectLeave } from '../store/slices/leavesSlice';

const LeaveTable = ({ leaves = [], onLeaveUpdate, isAdmin = false }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleEdit = (leave) => {
    console.log("Edit leave:", leave);
    // Navigate to edit form with leave data
    navigate('/leave-form', { 
      state: { 
        editMode: true, 
        leaveData: leave 
      } 
    });
  };

  const handleCancel = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      const result = await dispatch(deleteLeave(leaveId));
      if (deleteLeave.fulfilled.match(result)) {
        alert('Leave request cancelled successfully!');
        if (onLeaveUpdate) {
          onLeaveUpdate();
        }
      } else {
        alert('Failed to cancel leave request');
      }
    } catch (error) {
      console.error('Error cancelling leave:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Admin functions
  const handleApprove = async (leaveId) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) {
      return;
    }

    try {
      const result = await dispatch(approveLeave(leaveId));
      if (approveLeave.fulfilled.match(result)) {
        alert('Leave request approved successfully!');
        if (onLeaveUpdate) {
          onLeaveUpdate();
        }
      } else {
        alert('Failed to approve leave request');
      }
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleReject = async (leaveId) => {
    if (!window.confirm('Are you sure you want to reject this leave request?')) {
      return;
    }

    try {
      const result = await dispatch(rejectLeave(leaveId));
      if (rejectLeave.fulfilled.match(result)) {
        alert('Leave request rejected successfully!');
        if (onLeaveUpdate) {
          onLeaveUpdate();
        }
      } else {
        alert('Failed to reject leave request');
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleViewDetails = (leave) => {
    console.log("View leave details:", leave);
    // Navigate to readonly leave details page
    navigate('/leave-details', { 
      state: { 
        leaveData: leave,
        readonly: true
      } 
    });
  };

  // Ensure leaves is always an array
  const safeLeaves = Array.isArray(leaves) ? leaves : [];

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
            {safeLeaves.map((leave, index) => (
              <TableRow
                key={leave._id || leave.id || index}
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
                  {isAdmin ? (
                    // Admin actions
                    <>
                      <IconButton
                        color="info"
                        onClick={() => handleViewDetails(leave)}
                        title="View Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {leave.status === "Pending" && (
                        <>
                          <IconButton
                            color="success"
                            onClick={() => handleApprove(leave._id || leave.id)}
                            title="Approve"
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleReject(leave._id || leave.id)}
                            title="Reject"
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      )}
                    </>
                  ) : (
                    // Employee actions
                    leave.status === "Pending" && (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(leave)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleCancel(leave._id || leave.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )
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
