import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configure testing library
configure({ testIdAttribute: 'data-testid' })

// Mock axios
import axios from 'axios'
jest.mock('axios')
const mockedAxios = axios

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

export { mockedAxios }
