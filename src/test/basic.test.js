import { describe, it, expect } from 'vitest'

describe('Basic Test Setup', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should test string operations', () => {
    const str = 'Hello World'
    expect(str.toLowerCase()).toBe('hello world')
  })

  it('should test array operations', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr.includes(2)).toBe(true)
  })
})
