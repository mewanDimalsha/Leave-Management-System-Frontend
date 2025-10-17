import { Routes, Route } from 'react-router-dom'
import './App.css'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import LoginPage from './pages/LoginPage'
import LeaveForm from './components/LeaveForm'
import LeaveDetails from './components/LeaveDetails'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

function App() {

  return (
    <Routes>
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/employee" element={
        <ProtectedRoute requiredRole="user">
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
      <Route path="/leave-form" element={
        <ProtectedRoute requiredRole="user">
          <LeaveForm />
        </ProtectedRoute>
      } />
      <Route path="/leave-details" element={
        <ProtectedRoute requiredRole="admin">
          <LeaveDetails />
        </ProtectedRoute>
      } />
      <Route path="/" element={<LoginPage />} />
    </Routes>
  )
}

export default App
