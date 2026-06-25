import { describe, it, expect } from 'vitest'
import { isValidPassword } from '../../auth/utils/passwordValidation'

describe('isValidPassword', () => {
  it('should return false for passwords shorter than 15 characters', () => {
    expect(isValidPassword('Abcdef12345678')).toBe(false)
  })

  it('should return false for passwords without a lowercase letter', () => {
    expect(isValidPassword('ABCDEFGHIJKLMNO1')).toBe(false)
  })

  it('should return false for passwords without an uppercase letter', () => {
    expect(isValidPassword('abcdefghijklmno1')).toBe(false)
  })

  it('should return false for passwords without a digit', () => {
    expect(isValidPassword('AbcdefghijklmnoP')).toBe(false)
  })

  it('should return true for a valid password', () => {
    expect(isValidPassword('ThisIsAValidPassword123')).toBe(true)
  })

  it('should return true for a password that is exactly 15 characters long and valid', () => {
    expect(isValidPassword('ValidPass123456')).toBe(true)
  })

  it('should return false for an empty string', () => {
    expect(isValidPassword('')).toBe(false)
  })
})