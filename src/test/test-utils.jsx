import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'
import authReducer from '../store/slices/authSlice'
import leavesReducer from '../store/slices/leavesSlice'

// Create a test store with initial state
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      leaves: leavesReducer,
    },
    preloadedState,
  })
}

// Custom render function that includes Redux Provider and Router
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  )

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Mock leave data for testing
export const mockLeaves = [
  {
    _id: '1',
    employee: 'John Doe',
    fromDate: '2025-01-15T00:00:00.000Z',
    toDate: '2025-01-17T00:00:00.000Z',
    reason: 'Vacation',
    status: 'Pending',
    appliedAt: '2025-01-10T00:00:00.000Z',
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z'
  },
  {
    _id: '2',
    employee: 'Jane Smith',
    fromDate: '2025-01-20T00:00:00.000Z',
    toDate: '2025-01-22T00:00:00.000Z',
    reason: 'Sick leave',
    status: 'Approved',
    appliedAt: '2025-01-12T00:00:00.000Z',
    createdAt: '2025-01-12T00:00:00.000Z',
    updatedAt: '2025-01-12T00:00:00.000Z'
  },
  {
    _id: '3',
    employee: 'Bob Johnson',
    fromDate: '2025-01-25T00:00:00.000Z',
    toDate: '2025-01-27T00:00:00.000Z',
    reason: 'Personal',
    status: 'Rejected',
    appliedAt: '2025-01-14T00:00:00.000Z',
    createdAt: '2025-01-14T00:00:00.000Z',
    updatedAt: '2025-01-14T00:00:00.000Z'
  }
]

// Mock user data for testing
export const mockUser = {
  id: 'user123',
  name: 'John Doe',
  role: 'user'
}

export const mockAdmin = {
  id: 'admin123',
  name: 'Admin User',
  role: 'admin'
}

// Helper to create mock axios responses
export const createMockAxiosResponse = (data, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
  request: {}
})

// Helper to create mock axios error
export const createMockAxiosError = (message, status = 500) => {
  const error = new Error(message)
  error.response = {
    data: { message },
    status,
    statusText: 'Internal Server Error',
    headers: {},
    config: {},
    request: {}
  }
  return error
}
