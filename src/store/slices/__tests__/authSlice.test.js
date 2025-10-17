import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  loginUser,
  checkAuthStatus,
  logoutUser,
  clearError
} from '../authSlice'
import { mockedAxios, mockUser, mockAdmin, createMockAxiosResponse, createMockAxiosError } from '../../test/test-utils'

// Mock axios
jest.mock('axios')

describe('authSlice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })
    jest.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth
      expect(state).toEqual({
        isAuthenticated: false,
        user: null,
        role: null,
        isLoading: false,
        error: null
      })
    })
  })

  describe('loginUser', () => {
    const loginCredentials = {
      name: 'john',
      password: 'password123'
    }

    it('should handle loginUser.pending', () => {
      store.dispatch(loginUser.pending())
      const state = store.getState().auth
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle successful user login', async () => {
      const loginResponse = {
        message: 'Login successful',
        name: 'John Doe',
        role: 'user',
        token: 'mock-jwt-token'
      }
      
      mockedAxios.post.mockResolvedValueOnce(createMockAxiosResponse(loginResponse))
      
      await store.dispatch(loginUser(loginCredentials))
      
      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual({
        name: 'John Doe',
        role: 'user'
      })
      expect(state.role).toBe('user')
      expect(state.error).toBeNull()
      
      // Check localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token')
      expect(localStorage.setItem).toHaveBeenCalledWith('userRole', 'user')
      expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'John Doe')
    })

    it('should handle successful admin login', async () => {
      const loginResponse = {
        message: 'Login successful',
        name: 'Admin User',
        role: 'admin',
        token: 'mock-admin-token'
      }
      
      mockedAxios.post.mockResolvedValueOnce(createMockAxiosResponse(loginResponse))
      
      await store.dispatch(loginUser(loginCredentials))
      
      const state = store.getState().auth
      expect(state.role).toBe('admin')
      expect(state.user.role).toBe('admin')
    })

    it('should handle login failure', async () => {
      mockedAxios.post.mockRejectedValueOnce(
        createMockAxiosError('Invalid credentials', 401)
      )
      
      await store.dispatch(loginUser(loginCredentials))
      
      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBe('Invalid credentials')
    })

    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(
        createMockAxiosError('Network Error', 0)
      )
      
      await store.dispatch(loginUser(loginCredentials))
      
      const state = store.getState().auth
      expect(state.error).toBe('Network Error')
    })
  })

  describe('checkAuthStatus', () => {
    it('should handle checkAuthStatus.pending', () => {
      store.dispatch(checkAuthStatus.pending())
      const state = store.getState().auth
      expect(state.isLoading).toBe(true)
    })

    it('should authenticate user if valid token exists', async () => {
      // Mock localStorage with valid token
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid-token'
        if (key === 'userRole') return 'user'
        if (key === 'userName') return 'John Doe'
        return null
      })
      
      const userResponse = {
        id: 'user123',
        name: 'John Doe',
        role: 'user'
      }
      
      mockedAxios.get.mockResolvedValueOnce(createMockAxiosResponse(userResponse))
      
      await store.dispatch(checkAuthStatus())
      
      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual({
        name: 'John Doe',
        role: 'user'
      })
      expect(state.role).toBe('user')
    })

    it('should not authenticate if no token exists', async () => {
      localStorage.getItem.mockReturnValue(null)
      
      await store.dispatch(checkAuthStatus())
      
      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.role).toBeNull()
    })

    it('should handle invalid token', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'invalid-token'
        if (key === 'userRole') return 'user'
        if (key === 'userName') return 'John Doe'
        return null
      })
      
      mockedAxios.get.mockRejectedValueOnce(
        createMockAxiosError('Invalid token', 401)
      )
      
      await store.dispatch(checkAuthStatus())
      
      const state = store.getState().auth
      expect(state.isLoading).toBe(false)
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBe('Invalid token')
    })
  })

  describe('logoutUser', () => {
    it('should clear authentication state', () => {
      // First set some auth state
      store.dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: {
          name: 'John Doe',
          role: 'user',
          token: 'mock-token'
        }
      })
      
      // Then logout
      store.dispatch(logoutUser())
      
      const state = store.getState().auth
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.role).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      
      // Check localStorage was cleared
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('userRole')
      expect(localStorage.removeItem).toHaveBeenCalledWith('userName')
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      // First set an error
      store.dispatch({
        type: 'auth/loginUser/rejected',
        payload: 'Login failed'
      })
      
      // Then clear error
      store.dispatch(clearError())
      
      const state = store.getState().auth
      expect(state.error).toBeNull()
    })
  })

  describe('token validation', () => {
    it('should validate token format', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'invalid-token-format'
        if (key === 'userRole') return 'user'
        if (key === 'userName') return 'John Doe'
        return null
      })
      
      mockedAxios.get.mockRejectedValueOnce(
        createMockAxiosError('Invalid token format', 401)
      )
      
      await store.dispatch(checkAuthStatus())
      
      const state = store.getState().auth
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBe('Invalid token format')
    })
  })

  describe('role-based authentication', () => {
    it('should handle admin role correctly', async () => {
      const loginResponse = {
        message: 'Login successful',
        name: 'Admin User',
        role: 'admin',
        token: 'mock-admin-token'
      }
      
      mockedAxios.post.mockResolvedValueOnce(createMockAxiosResponse(loginResponse))
      
      await store.dispatch(loginUser({ name: 'admin', password: 'password' }))
      
      const state = store.getState().auth
      expect(state.role).toBe('admin')
      expect(state.user.role).toBe('admin')
    })

    it('should handle user role correctly', async () => {
      const loginResponse = {
        message: 'Login successful',
        name: 'Regular User',
        role: 'user',
        token: 'mock-user-token'
      }
      
      mockedAxios.post.mockResolvedValueOnce(createMockAxiosResponse(loginResponse))
      
      await store.dispatch(loginUser({ name: 'user', password: 'password' }))
      
      const state = store.getState().auth
      expect(state.role).toBe('user')
      expect(state.user.role).toBe('user')
    })
  })

  describe('error handling', () => {
    it('should handle server errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(
        createMockAxiosError('Server error', 500)
      )
      
      await store.dispatch(loginUser({ name: 'user', password: 'password' }))
      
      const state = store.getState().auth
      expect(state.error).toBe('Server error')
      expect(state.isAuthenticated).toBe(false)
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout')
      timeoutError.code = 'ECONNABORTED'
      mockedAxios.post.mockRejectedValueOnce(timeoutError)
      
      await store.dispatch(loginUser({ name: 'user', password: 'password' }))
      
      const state = store.getState().auth
      expect(state.error).toBe('timeout')
    })
  })
})
