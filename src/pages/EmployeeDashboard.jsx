import Button from "../components/MuiButton";
import LeaveForm from "../components/LeaveForm"
import LeaveTable from "../components/LeaveTable"
import StatusFilter from "../components/StatusFilter";
import React from "react";

const leaves = [
  {
    id: 1,
    fromDate: "2025-10-10",
    toDate: "2025-10-12",
    reason: "Family Function",
    status: "Pending",
  },
  {
    id: 2,
    fromDate: "2025-09-15",
    toDate: "2025-09-16",
    reason: "Medical Appointment",
    status: "Approved",
  },
  {
    id: 3,
    fromDate: "2025-08-20",
    toDate: "2025-08-22",
    reason: "Vacation",
    status: "Rejected",
  },
];

const EmployeeDashboard = () => {
  const [statusFilter, setStatusFilter] = React.useState("")
  return (
    <>
      <StatusFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      <LeaveTable leaves={leaves} />
      <Button/>
    </>
  )
}

export default EmployeeDashboard

