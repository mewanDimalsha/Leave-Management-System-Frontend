import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockUser, mockLeaves, createMockAxiosResponse, createMockAxiosError } from '../../test/test-utils'
import LeaveForm from '../../components/LeaveForm'
import LeaveTable from '../../components/LeaveTable'
import { mockedAxios } from '../../test/setup'

// Mock dayjs
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs')
  return (date) => {
    if (date) {
      return originalDayjs(date)
    }
    // Return a mock dayjs object for current date
    return {
      startOf: jest.fn().mockReturnThis(),
      isBefore: jest.fn().mockReturnValue(false),
      isAfter: jest.fn().mockReturnValue(false),
      toISOString: jest.fn().mockReturnValue('2025-01-15T00:00:00.000Z'),
      format: jest.fn().mockReturnValue('2025-01-15'),
      isValid: jest.fn().mockReturnValue(true)
    }
  }
})

describe('Leave Flow Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    global.confirm = jest.fn().mockReturnValue(true)
  })

  describe('Complete Leave Creation Flow', () => {
    it('should create leave and update table', async () => {
      const newLeave = {
        _id: 'new-leave-id',
        employee: 'John Doe',
        fromDate: '2025-01-15T00:00:00.000Z',
        toDate: '2025-01-17T00:00:00.000Z',
        reason: 'Vacation',
        status: 'Pending',
        appliedAt: '2025-01-10T00:00:00.000Z',
        createdAt: '2025-01-10T00:00:00.000Z',
        updatedAt: '2025-01-10T00:00:00.000Z'
      }

      // Mock successful creation
      mockedAxios.post.mockResolvedValueOnce(createMockAxiosResponse(newLeave))

      const { store } = renderWithProviders(<LeaveForm />)

      // Fill form
      const fromDateInput = screen.getByLabelText('From Date')
      const toDateInput = screen.getByLabelText('To Date')
      const reasonInput = screen.getByLabelText('Reason')

      await user.type(fromDateInput, '2025-01-15')
      await user.type(toDateInput, '2025-01-17')
      await user.type(reasonInput, 'Vacation')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /apply leave/i })
      await user.click(submitButton)

      // Verify API call
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:5001/api/leaves',
          {
            fromDate: expect.any(String),
            toDate: expect.any(String),
            reason: 'Vacation'
          },
          expect.any(Object)
        )
      })

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText('Leave applied successfully!')).toBeInTheDocument()
      })

      // Verify Redux state update
      const state = store.getState()
      expect(state.leaves.leaves).toContainEqual(newLeave)
    })

    it('should handle creation errors gracefully', async () => {
      mockedAxios.post.mockRejectedValueOnce(
        createMockAxiosError('Validation error: From date must be in the future', 500)
      )

      renderWithProviders(<LeaveForm />)

      // Fill form with invalid data
      const fromDateInput = screen.getByLabelText('From Date')
      const toDateInput = screen.getByLabelText('To Date')
      const reasonInput = screen.getByLabelText('Reason')

      await user.type(fromDateInput, '2024-01-15') // Past date
      await user.type(toDateInput, '2024-01-17')
      await user.type(reasonInput, 'Vacation')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /apply leave/i })
      await user.click(submitButton)

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText('Validation error: From date must be in the future')).toBeInTheDocument()
      })
    })
  })

  describe('Complete Leave Update Flow', () => {
    const mockLeaveData = {
      _id: '1',
      employee: 'John Doe',
      fromDate: '2025-01-15T00:00:00.000Z',
      toDate: '2025-01-17T00:00:00.000Z',
      reason: 'Vacation',
      status: 'Pending'
    }

    const mockLocation = {
      state: {
        editMode: true,
        leaveData: mockLeaveData
      }
    }

    beforeEach(() => {
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useLocation: () => mockLocation,
        useNavigate: () => jest.fn()
      }))
    })

    it('should update leave and reflect changes', async () => {
      const updatedLeave = {
        ...mockLeaveData,
        reason: 'Updated vacation',
        updatedAt: '2025-01-11T00:00:00.000Z'
      }

      mockedAxios.put.mockResolvedValueOnce(createMockAxiosResponse(updatedLeave))

      const { store } = renderWithProviders(<LeaveForm />)

      // Verify form is pre-filled
      expect(screen.getByDisplayValue('Vacation')).toBeInTheDocument()

      // Update reason
      const reasonInput = screen.getByDisplayValue('Vacation')
      await user.clear(reasonInput)
      await user.type(reasonInput, 'Updated vacation')

      // Submit update
      const submitButton = screen.getByRole('button', { name: /update leave/i })
      await user.click(submitButton)

      // Verify API call
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          'http://localhost:5001/api/leaves/1',
          {
            fromDate: expect.any(String),
            toDate: expect.any(String),
            reason: 'Updated vacation'
          },
          expect.any(Object)
        )
      })

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText('Leave updated successfully!')).toBeInTheDocument()
      })
    })

    it('should handle update errors', async () => {
      mockedAxios.put.mockRejectedValueOnce(
        createMockAxiosError('Leave request not found', 404)
      )

      renderWithProviders(<LeaveForm />)

      const submitButton = screen.getByRole('button', { name: /update leave/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Leave request not found')).toBeInTheDocument()
      })
    })
  })

  describe('Leave Table Actions Integration', () => {
    it('should handle employee edit and delete actions', async () => {
      const mockOnLeaveUpdate = jest.fn()
      
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

      // Test delete action
      const deleteButton = screen.getByLabelText(/delete/i)
      await user.click(deleteButton)

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

    it('should handle admin approve and reject actions', async () => {
      const mockOnLeaveUpdate = jest.fn()
      
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

      // Test approve action
      const approveButton = screen.getByLabelText(/approve/i)
      await user.click(approveButton)

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

      await waitFor(() => {
        expect(mockOnLeaveUpdate).toHaveBeenCalled()
      })
    })
  })

  describe('Status Change Restrictions', () => {
    it('should only allow editing pending leaves', () => {
      const approvedLeaves = mockLeaves.filter(leave => leave.status === 'Approved')
      
      renderWithProviders(
        <LeaveTable 
          leaves={approvedLeaves} 
          onLeaveUpdate={jest.fn()} 
          isAdmin={false} 
        />
      )

      // Should not show edit/delete buttons for approved leaves
      expect(screen.queryByLabelText(/edit/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/delete/i)).not.toBeInTheDocument()
    })

    it('should only allow admin actions on pending leaves', () => {
      const pendingLeaves = mockLeaves.filter(leave => leave.status === 'Pending')
      
      renderWithProviders(
        <LeaveTable 
          leaves={pendingLeaves} 
          onLeaveUpdate={jest.fn()} 
          isAdmin={true} 
        />
      )

      // Should show approve/reject buttons for pending leaves
      expect(screen.getByLabelText(/approve/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/reject/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation Integration', () => {
    it('should validate all required fields', async () => {
      renderWithProviders(<LeaveForm />)

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /apply leave/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
    })

    it('should validate date relationships', async () => {
      renderWithProviders(<LeaveForm />)

      const fromDateInput = screen.getByLabelText('From Date')
      const toDateInput = screen.getByLabelText('To Date')
      const reasonInput = screen.getByLabelText('Reason')

      // Set invalid date range
      await user.type(fromDateInput, '2025-01-20')
      await user.type(toDateInput, '2025-01-15') // Before from date
      await user.type(reasonInput, 'Test reason')

      const submitButton = screen.getByRole('button', { name: /apply leave/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('From date cannot be after to date')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States Integration', () => {
    it('should show loading state during form submission', async () => {
      // Mock slow API response
      mockedAxios.post.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(createMockAxiosResponse({})), 100))
      )

      renderWithProviders(<LeaveForm />)

      const fromDateInput = screen.getByLabelText('From Date')
      const toDateInput = screen.getByLabelText('To Date')
      const reasonInput = screen.getByLabelText('Reason')

      await user.type(fromDateInput, '2025-01-15')
      await user.type(toDateInput, '2025-01-17')
      await user.type(reasonInput, 'Vacation')

      const submitButton = screen.getByRole('button', { name: /apply leave/i })
      await user.click(submitButton)

      // Should show loading state
      expect(screen.getByText('Submitting...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })
})
