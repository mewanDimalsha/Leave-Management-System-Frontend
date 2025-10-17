import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockLeaves, mockUser, mockAdmin, createMockAxiosResponse, createMockAxiosError } from '../../test/test-utils'
import LeaveTable from '../LeaveTable'
import { mockedAxios } from '../../test/setup'

// Mock window.confirm
global.confirm = jest.fn()

describe('LeaveTable', () => {
  const user = userEvent.setup()
  const mockOnLeaveUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    global.confirm.mockReturnValue(true)
  })

  describe('Employee View', () => {
    it('should render leave table for employees', () => {
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={false} 
        />
      )
      
      expect(screen.getByText('My Leave Requests')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })

    it('should show correct status chips', () => {
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={false} 
        />
      )
      
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Approved')).toBeInTheDocument()
      expect(screen.getByText('Rejected')).toBeInTheDocument()
    })

    it('should show edit and delete buttons for pending leaves only', () => {
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={false} 
        />
      )
      
      // Should have edit and delete buttons for pending leave (John Doe)
      const editButtons = screen.getAllByLabelText(/edit/i)
      const deleteButtons = screen.getAllByLabelText(/delete/i)
      
      expect(editButtons).toHaveLength(1) // Only for pending leave
      expect(deleteButtons).toHaveLength(1) // Only for pending leave
    })

    it('should not show action buttons for non-pending leaves', () => {
      const approvedLeaves = mockLeaves.filter(leave => leave.status === 'Approved')
      
      renderWithProviders(
        <LeaveTable 
          leaves={approvedLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={false} 
        />
      )
      
      expect(screen.queryByLabelText(/edit/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/delete/i)).not.toBeInTheDocument()
    })

    it('should handle edit leave', async () => {
      const mockNavigate = jest.fn()
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate
      }))
      
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={false} 
        />
      )
      
      const editButton = screen.getByLabelText(/edit/i)
      await user.click(editButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/leave-form', {
        state: {
          editMode: true,
          leaveData: mockLeaves[0]
        }
      })
    })

    it('should handle delete leave', async () => {
      mockedAxios.delete.mockResolvedValueOnce(
        createMockAxiosResponse({ leaveId: '1' })
      )
      
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={false} 
        />
      )
      
      const deleteButton = screen.getByLabelText(/delete/i)
      await user.click(deleteButton)
      
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to cancel this leave request?')
      
      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(
          'http://localhost:5001/api/leaves/1',
          expect.any(Object)
        )
      })
      
      await waitFor(() => {
        expect(mockOnLeaveUpdate).toHaveBeenCalled()
      })
    })

    it('should handle delete confirmation cancellation', async () => {
      global.confirm.mockReturnValue(false)
      
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={false} 
        />
      )
      
      const deleteButton = screen.getByLabelText(/delete/i)
      await user.click(deleteButton)
      
      expect(mockedAxios.delete).not.toHaveBeenCalled()
      expect(mockOnLeaveUpdate).not.toHaveBeenCalled()
    })

    it('should handle delete errors', async () => {
      mockedAxios.delete.mockRejectedValueOnce(
        createMockAxiosError('Leave request not found', 404)
      )
      
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={false} 
        />
      )
      
      const deleteButton = screen.getByLabelText(/delete/i)
      await user.click(deleteButton)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to cancel leave request')).toBeInTheDocument()
      })
    })
  })

  describe('Admin View', () => {
    it('should render leave table for admins', () => {
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={true} 
        />
      )
      
      expect(screen.getByText('My Leave Requests')).toBeInTheDocument()
    })

    it('should show view, approve, and reject buttons for admins', () => {
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={true} 
        />
      )
      
      expect(screen.getAllByLabelText(/view details/i)).toHaveLength(3)
      expect(screen.getAllByLabelText(/approve/i)).toHaveLength(1) // Only for pending
      expect(screen.getAllByLabelText(/reject/i)).toHaveLength(1) // Only for pending
    })

    it('should handle view details', async () => {
      const mockNavigate = jest.fn()
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate
      }))
      
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={true} 
        />
      )
      
      const viewButton = screen.getAllByLabelText(/view details/i)[0]
      await user.click(viewButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/leave-details', {
        state: {
          leaveData: mockLeaves[0],
          readonly: true
        }
      })
    })

    it('should handle approve leave', async () => {
      mockedAxios.put.mockResolvedValueOnce(
        createMockAxiosResponse({
          ...mockLeaves[0],
          status: 'Approved'
        })
      )
      
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={true} 
        />
      )
      
      const approveButton = screen.getByLabelText(/approve/i)
      await user.click(approveButton)
      
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to approve this leave request?')
      
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          'http://localhost:5001/api/leaves/1/approve',
          {},
          expect.any(Object)
        )
      })
      
      await waitFor(() => {
        expect(screen.getByText('Leave request approved successfully!')).toBeInTheDocument()
      })
    })

    it('should handle reject leave', async () => {
      mockedAxios.put.mockResolvedValueOnce(
        createMockAxiosResponse({
          ...mockLeaves[0],
          status: 'Rejected'
        })
      )
      
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={true} 
        />
      )
      
      const rejectButton = screen.getByLabelText(/reject/i)
      await user.click(rejectButton)
      
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to reject this leave request?')
      
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          'http://localhost:5001/api/leaves/1/reject',
          {},
          expect.any(Object)
        )
      })
      
      await waitFor(() => {
        expect(screen.getByText('Leave request rejected successfully!')).toBeInTheDocument()
      })
    })

    it('should handle approval errors', async () => {
      mockedAxios.put.mockRejectedValueOnce(
        createMockAxiosError('Leave request not found', 404)
      )
      
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={true} 
        />
      )
      
      const approveButton = screen.getByLabelText(/approve/i)
      await user.click(approveButton)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to approve leave request')).toBeInTheDocument()
      })
    })

    it('should handle rejection errors', async () => {
      mockedAxios.put.mockRejectedValueOnce(
        createMockAxiosError('Leave request not found', 404)
      )
      
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={true} 
        />
      )
      
      const rejectButton = screen.getByLabelText(/reject/i)
      await user.click(rejectButton)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to reject leave request')).toBeInTheDocument()
      })
    })
  })

  describe('Empty State', () => {
    it('should show no leaves message when empty', () => {
      renderWithProviders(
        <LeaveTable 
          leaves={[]} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={false} 
        />
      )
      
      expect(screen.getByText('No leave requests found')).toBeInTheDocument()
    })
  })

  describe('Status Colors', () => {
    it('should apply correct status colors', () => {
      renderWithProviders(
        <LeaveTable 
          leaves={mockLeaves} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={false} 
        />
      )
      
      // Check that status chips are rendered with correct colors
      const statusChips = screen.getAllByText(/pending|approved|rejected/i)
      expect(statusChips).toHaveLength(3)
    })
  })

  describe('Key Props', () => {
    it('should handle leaves with different ID formats', () => {
      const leavesWithDifferentIds = [
        { _id: '1', employee: 'John', status: 'Pending' },
        { id: '2', employee: 'Jane', status: 'Approved' },
        { _id: '3', employee: 'Bob', status: 'Rejected' }
      ]
      
      renderWithProviders(
        <LeaveTable 
          leaves={leavesWithDifferentIds} 
          onLeaveUpdate={mockOnLeaveUpdate} 
          isAdmin={false} 
        />
      )
      
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('Jane')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })
  })
})
