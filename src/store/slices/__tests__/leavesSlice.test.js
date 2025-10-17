import { configureStore } from '@reduxjs/toolkit'
import { vi } from 'vitest'
import leavesReducer, {
  fetchLeaves,
  createLeave,
  updateLeave,
  deleteLeave,
  approveLeave,
  rejectLeave,
  setStatusFilter,
  setEmployeeFilter,
  clearFilters,
  clearError,
  clearLeaves
} from '../leavesSlice'
import { mockedAxios, mockLeaves, createMockAxiosResponse, createMockAxiosError } from '../../test/test-utils'

// Mock axios
vi.mock('axios')

describe('leavesSlice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        leaves: leavesReducer,
      },
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().leaves
      expect(state).toEqual({
        leaves: [],
        filteredLeaves: [],
        statusFilter: '',
        employeeFilter: '',
        isLoading: false,
        error: null,
        lastFetch: null
      })
    })
  })

  describe('fetchLeaves', () => {
    it('should handle fetchLeaves.pending', () => {
      store.dispatch(fetchLeaves.pending())
      const state = store.getState().leaves
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle fetchLeaves.fulfilled', async () => {
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosResponse(mockLeaves))
      
      await store.dispatch(fetchLeaves())
      
      const state = store.getState().leaves
      expect(state.isLoading).toBe(false)
      expect(state.leaves).toEqual(mockLeaves)
      expect(state.filteredLeaves).toEqual(mockLeaves)
      expect(state.error).toBeNull()
      expect(state.lastFetch).toBeDefined()
    })

    it('should handle fetchLeaves.rejected', async () => {
      const errorMessage = 'Network error'
      mockedAxios.get.mockRejectedValueOnce(createMockAxiosError(errorMessage))
      
      await store.dispatch(fetchLeaves())
      
      const state = store.getState().leaves
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })

    it('should handle fetchLeaves with employee filter', async () => {
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosResponse(mockLeaves))
      
      await store.dispatch(fetchLeaves({ employee: 'john' }))
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5001/api/leaves?employee=john',
        expect.any(Object)
      )
    })
  })

  describe('createLeave', () => {
    const newLeave = {
      fromDate: '2025-01-15T00:00:00.000Z',
      toDate: '2025-01-17T00:00:00.000Z',
      reason: 'Vacation'
    }

    it('should handle createLeave.pending', () => {
      store.dispatch(createLeave.pending())
      const state = store.getState().leaves
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle createLeave.fulfilled', async () => {
      const createdLeave = { ...mockLeaves[0], _id: 'new-leave-id' }
      mockedAxios.post.mockResolvedValueOnce(createMockAxiosResponse(createdLeave))
      
      // Set initial leaves
      store.dispatch({ type: 'leaves/fetchLeaves/fulfilled', payload: mockLeaves })
      
      await store.dispatch(createLeave(newLeave))
      
      const state = store.getState().leaves
      expect(state.isLoading).toBe(false)
      expect(state.leaves).toContainEqual(createdLeave)
      expect(state.error).toBeNull()
    })

    it('should handle createLeave.rejected', async () => {
      const errorMessage = 'Validation error'
      mockedAxios.post.mockRejectedValueOnce(createMockAxiosError(errorMessage))
      
      await store.dispatch(createLeave(newLeave))
      
      const state = store.getState().leaves
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('updateLeave', () => {
    const updateData = {
      leaveId: '1',
      leaveData: {
        fromDate: '2025-01-16T00:00:00.000Z',
        toDate: '2025-01-18T00:00:00.000Z',
        reason: 'Updated vacation'
      }
    }

    it('should handle updateLeave.fulfilled', async () => {
      const updatedLeave = { ...mockLeaves[0], reason: 'Updated vacation' }
      mockedAxios.put.mockResolvedValueOnce(createMockAxiosResponse(updatedLeave))
      
      // Set initial leaves
      store.dispatch({ type: 'leaves/fetchLeaves/fulfilled', payload: mockLeaves })
      
      await store.dispatch(updateLeave(updateData))
      
      const state = store.getState().leaves
      const updatedLeaveInState = state.leaves.find(leave => leave._id === '1')
      expect(updatedLeaveInState.reason).toBe('Updated vacation')
    })
  })

  describe('deleteLeave', () => {
    it('should handle deleteLeave.fulfilled', async () => {
      mockedAxios.delete.mockResolvedValueOnce(createMockAxiosResponse({ leaveId: '1' }))
      
      // Set initial leaves
      store.dispatch({ type: 'leaves/fetchLeaves/fulfilled', payload: mockLeaves })
      
      await store.dispatch(deleteLeave('1'))
      
      const state = store.getState().leaves
      expect(state.leaves).toHaveLength(2)
      expect(state.leaves.find(leave => leave._id === '1')).toBeUndefined()
    })
  })

  describe('approveLeave', () => {
    it('should handle approveLeave.fulfilled', async () => {
      const approvedLeave = { ...mockLeaves[0], status: 'Approved' }
      mockedAxios.put.mockResolvedValueOnce(createMockAxiosResponse(approvedLeave))
      
      // Set initial leaves
      store.dispatch({ type: 'leaves/fetchLeaves/fulfilled', payload: mockLeaves })
      
      await store.dispatch(approveLeave('1'))
      
      const state = store.getState().leaves
      const approvedLeaveInState = state.leaves.find(leave => leave._id === '1')
      expect(approvedLeaveInState.status).toBe('Approved')
    })
  })

  describe('rejectLeave', () => {
    it('should handle rejectLeave.fulfilled', async () => {
      const rejectedLeave = { ...mockLeaves[0], status: 'Rejected' }
      mockedAxios.put.mockResolvedValueOnce(createMockAxiosResponse(rejectedLeave))
      
      // Set initial leaves
      store.dispatch({ type: 'leaves/fetchLeaves/fulfilled', payload: mockLeaves })
      
      await store.dispatch(rejectLeave('1'))
      
      const state = store.getState().leaves
      const rejectedLeaveInState = state.leaves.find(leave => leave._id === '1')
      expect(rejectedLeaveInState.status).toBe('Rejected')
    })
  })

  describe('filters', () => {
    beforeEach(() => {
      // Set initial leaves
      store.dispatch({ type: 'leaves/fetchLeaves/fulfilled', payload: mockLeaves })
    })

    it('should set status filter', () => {
      store.dispatch(setStatusFilter('Approved'))
      const state = store.getState().leaves
      expect(state.statusFilter).toBe('Approved')
      expect(state.filteredLeaves).toHaveLength(1)
      expect(state.filteredLeaves[0].status).toBe('Approved')
    })

    it('should set employee filter', () => {
      store.dispatch(setEmployeeFilter('john'))
      const state = store.getState().leaves
      expect(state.employeeFilter).toBe('john')
      expect(state.filteredLeaves).toHaveLength(1)
      expect(state.filteredLeaves[0].employee.toLowerCase()).toContain('john')
    })

    it('should clear filters', () => {
      // Set some filters first
      store.dispatch(setStatusFilter('Approved'))
      store.dispatch(setEmployeeFilter('john'))
      
      store.dispatch(clearFilters())
      const state = store.getState().leaves
      expect(state.statusFilter).toBe('')
      expect(state.employeeFilter).toBe('')
      expect(state.filteredLeaves).toEqual(mockLeaves)
    })

    it('should apply combined filters', () => {
      store.dispatch(setStatusFilter('Approved'))
      store.dispatch(setEmployeeFilter('jane'))
      const state = store.getState().leaves
      expect(state.filteredLeaves).toHaveLength(1)
      expect(state.filteredLeaves[0].status).toBe('Approved')
      expect(state.filteredLeaves[0].employee.toLowerCase()).toContain('jane')
    })
  })

  describe('utility actions', () => {
    it('should clear error', () => {
      store.dispatch({ type: 'leaves/fetchLeaves/rejected', payload: 'Error message' })
      store.dispatch(clearError())
      const state = store.getState().leaves
      expect(state.error).toBeNull()
    })

    it('should clear leaves', () => {
      store.dispatch({ type: 'leaves/fetchLeaves/fulfilled', payload: mockLeaves })
      store.dispatch(clearLeaves())
      const state = store.getState().leaves
      expect(state.leaves).toEqual([])
      expect(state.filteredLeaves).toEqual([])
      expect(state.statusFilter).toBe('')
      expect(state.employeeFilter).toBe('')
    })
  })
})
