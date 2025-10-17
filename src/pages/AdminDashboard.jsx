import React from 'react'
import StatusFilter from '../components/StatusFilter.jsx'
import LeaveTable from '../components/LeaveTable.jsx'
import Button from '../components/MuiButton.jsx'
import EmployeeFilter from '../components/EmployeeFilter.jsx';

const leaves = [
  {
    id: 1,
    fromDate: "2025-10-10",
    toDate: "2025-10-12",
    reason: "Team Meeting",
    status: "Pending",
  },
  {
    id: 2,
    fromDate: "2025-09-15",
    toDate: "2025-09-16",
    reason: "Project Deadline",
    status: "Approved",
  },
  {
    id: 3,
    fromDate: "2025-08-20",
    toDate: "2025-08-22",
    reason: "Client Visit",
    status: "Rejected",
  },
];  

const AdminDashboard = () => {
  const [statusFilter, setStatusFilter] = React.useState("")
  return (
    <>
      <EmployeeFilter />
      <StatusFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      <LeaveTable leaves={leaves} />
      <Button />
    </>
  )
}

export default AdminDashboard
