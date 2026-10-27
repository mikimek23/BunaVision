import { describe, it, expect } from 'vitest'
import { getErrorMessage, extractApiErrorMessage, ERROR_MESSAGES } from '../utils/errorMessages'
import type { ErrorCode } from '../types/api'

describe('errorMessages', () => {
  const errorCodes: ErrorCode[] = [
    'INVALID_IMAGE',
    'IMAGE_TOO_LARGE',
    'UNSUPPORTED_FORMAT',
    'IMAGE_NOT_COFFEE',
    'INVALID_REQUEST',
    'AUTHENTICATION_REQUIRED',
    'INVALID_CREDENTIALS',
    'FORBIDDEN',
    'EMAIL_ALREADY_REGISTERED',
    'INFERENCE_FAILED',
    'INFERENCE_TIMEOUT',
    'ASSESSMENT_NOT_FOUND',
    'UNAUTHORIZED',
    'RATE_LIMITED',
    'INTERNAL_ERROR',
    'NETWORK_ERROR',
    'TIMEOUT',
    'INVALID_RESPONSE',
  ]

  it('maps every documented error code to a message and a next action', () => {
    for (const code of errorCodes) {
      const entry = ERROR_MESSAGES[code]
      expect(entry).toBeDefined()
      expect(entry.code).toBe(code)
      expect(entry.message).toBeTruthy()
      expect(entry.nextStep).toBeTruthy()

      const helperResult = getErrorMessage(code)
      expect(helperResult.code).toBe(code)
      expect(helperResult.message).toBe(entry.message)
      expect(helperResult.nextStep).toBe(entry.nextStep)
    }
  })

  it('returns a fallback message for undefined or unknown error codes', () => {
    const fromNull = getErrorMessage(null)
    expect(fromNull.message).toBeTruthy()
    expect(fromNull.nextStep).toBeTruthy()

    const fromUnknown = getErrorMessage('SOME_RANDOM_CODE')
    expect(fromUnknown.code).toBe('INTERNAL_ERROR')
    expect(fromUnknown.message).toBeTruthy()
  })

  describe('extractApiErrorMessage', () => {
    it('extracts actual backend message from error envelope', () => {
      const axiosLikeError = {
        name: 'AxiosError',
        message: 'Request failed with status code 422',
        response: {
          status: 422,
          data: {
            error: {
              code: 'IMAGE_NOT_COFFEE',
              message: 'This photo does not appear to show green coffee beans. Please upload a clear photo.',
            },
          },
        },
      }

      const extracted = extractApiErrorMessage(axiosLikeError)
      expect(extracted).toBe(
        'This photo does not appear to show green coffee beans. Please upload a clear photo.',
      )
      expect(extracted).not.toContain('status code')
    })

    it('extracts field validation errors sent by backend', () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            password: ['Ensure this field has at least 10 characters.'],
          },
        },
      }

      const extracted = extractApiErrorMessage(validationError)
      expect(extracted).toBe('password: Ensure this field has at least 10 characters.')
    })

    it('suppresses raw "Request failed with status code" strings in favor of fallback or status message', () => {
      const genericAxiosError = {
        name: 'AxiosError',
        message: 'Request failed with status code 500',
        response: {
          status: 500,
          data: {},
        },
      }

      const extracted = extractApiErrorMessage(genericAxiosError)
      expect(extracted).not.toContain('status code')
      expect(extracted).toBe('Something went wrong on our server. Please try again.')
    })
  })
})
