import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockUser, createMockAxiosResponse, createMockAxiosError } from '../../test/test-utils'
import LeaveForm from '../LeaveForm'
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

describe('LeaveForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Leave Creation', () => {
    it('should render create form correctly', () => {
      renderWithProviders(<LeaveForm />)
      
      expect(screen.getByText('Apply for Leave')).toBeInTheDocument()
      expect(screen.getByLabelText('From Date')).toBeInTheDocument()
      expect(screen.getByLabelText('To Date')).toBeInTheDocument()
      expect(screen.getByLabelText('Reason')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /apply leave/i })).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      renderWithProviders(<LeaveForm />)
      
      const submitButton = screen.getByRole('button', { name: /apply leave/i })
      await user.click(submitButton)
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
    })

    it('should validate date range', async () => {
      renderWithProviders(<LeaveForm />)
      
      // Fill in form with invalid date range (to date before from date)
      const fromDateInput = screen.getByLabelText('From Date')
      const toDateInput = screen.getByLabelText('To Date')
      const reasonInput = screen.getByLabelText('Reason')
      
      await user.type(fromDateInput, '2025-01-20')
      await user.type(toDateInput, '2025-01-15') // Before from date
      await user.type(reasonInput, 'Test reason')
      
      const submitButton = screen.getByRole('button', { name: /apply leave/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('From date cannot be after to date')).toBeInTheDocument()
      })
    })

    it('should validate future dates', async () => {
      // Mock dayjs to return a date in the past
      const mockDayjs = require('dayjs')
      mockDayjs.mockImplementation(() => ({
        startOf: jest.fn().mockReturnThis(),
        isBefore: jest.fn().mockReturnValue(true), // Simulate past date
        isAfter: jest.fn().mockReturnValue(false),
        toISOString: jest.fn().mockReturnValue('2024-01-15T00:00:00.000Z'),
        format: jest.fn().mockReturnValue('2024-01-15'),
        isValid: jest.fn().mockReturnValue(true)
      }))
      
      renderWithProviders(<LeaveForm />)
      
      const fromDateInput = screen.getByLabelText('From Date')
      const toDateInput = screen.getByLabelText('To Date')
      const reasonInput = screen.getByLabelText('Reason')
      
      await user.type(fromDateInput, '2024-01-15')
      await user.type(toDateInput, '2024-01-17')
      await user.type(reasonInput, 'Test reason')
      
      const submitButton = screen.getByRole('button', { name: /apply leave/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('From date must be today or in the future')).toBeInTheDocument()
      })
    })

    it('should submit valid leave request', async () => {
      mockedAxios.post.mockResolvedValueOnce(
        createMockAxiosResponse({
          _id: 'new-leave-id',
          employee: 'John Doe',
          fromDate: '2025-01-15T00:00:00.000Z',
          toDate: '2025-01-17T00:00:00.000Z',
          reason: 'Vacation',
          status: 'Pending'
        })
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
      
      await waitFor(() => {
        expect(screen.getByText('Leave applied successfully!')).toBeInTheDocument()
      })
    })

    it('should handle API errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(
        createMockAxiosError('Validation error: From date must be in the future', 500)
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
      
      await waitFor(() => {
        expect(screen.getByText('Validation error: From date must be in the future')).toBeInTheDocument()
      })
    })
  })

  describe('Leave Editing', () => {
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
      // Mock useLocation hook
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useLocation: () => mockLocation,
        useNavigate: () => jest.fn()
      }))
    })

    it('should render edit form with pre-filled data', () => {
      renderWithProviders(<LeaveForm />)
      
      expect(screen.getByText('Edit Leave Request')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Vacation')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /update leave/i })).toBeInTheDocument()
    })

    it('should submit updated leave request', async () => {
      mockedAxios.put.mockResolvedValueOnce(
        createMockAxiosResponse({
          ...mockLeaveData,
          reason: 'Updated vacation'
        })
      )
      
      renderWithProviders(<LeaveForm />)
      
      const reasonInput = screen.getByDisplayValue('Vacation')
      await user.clear(reasonInput)
      await user.type(reasonInput, 'Updated vacation')
      
      const submitButton = screen.getByRole('button', { name: /update leave/i })
      await user.click(submitButton)
      
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

  describe('Form Navigation', () => {
    it('should navigate back on cancel', async () => {
      const mockNavigate = jest.fn()
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: null })
      }))
      
      renderWithProviders(<LeaveForm />)
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/employee')
    })
  })

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      // Mock a slow API response
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
      
      expect(screen.getByText('Submitting...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })
})
