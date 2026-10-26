import type { ErrorCode } from '../types/api'
import axios from 'axios'

export interface ErrorMessageDefinition {
  code: ErrorCode
  message: string
  nextStep: string
}

export const ERROR_MESSAGES: Record<string, ErrorMessageDefinition> = {
  UNSUPPORTED_FORMAT: {
    code: 'UNSUPPORTED_FORMAT',
    message: "This file type isn't supported. Please upload a JPEG, PNG, or WEBP photo.",
    nextStep: 'Choose another file',
  },
  IMAGE_TOO_LARGE: {
    code: 'IMAGE_TOO_LARGE',
    message: 'This image is larger than the maximum allowed size (10 MB). Try a lower-resolution photo.',
    nextStep: 'Choose another file',
  },
  INVALID_IMAGE: {
    code: 'INVALID_IMAGE',
    message: "We couldn't read this image. Try taking the photo again.",
    nextStep: 'Choose another file',
  },
  IMAGE_NOT_COFFEE: {
    code: 'IMAGE_NOT_COFFEE',
    message: 'This photo does not appear to show green coffee beans. Please upload a clear photo of green coffee beans.',
    nextStep: 'Upload a sample photo of green coffee beans',
  },
  INVALID_REQUEST: {
    code: 'INVALID_REQUEST',
    message: 'The request is invalid. Please check your inputs and try again.',
    nextStep: 'Verify your inputs and retry',
  },
  IDEMPOTENCY_KEY_REUSED: {
    code: 'IDEMPOTENCY_KEY_REUSED',
    message: 'This assessment request was already submitted with different data.',
    nextStep: 'Select a new sample and retry',
  },
  AUTHENTICATION_REQUIRED: {
    code: 'AUTHENTICATION_REQUIRED',
    message: 'Authentication is required. Please sign in.',
    nextStep: 'Sign in to your account',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Incorrect email or password. Please try again.',
    nextStep: 'Check your credentials and try again',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'You do not have permission to perform this action.',
    nextStep: 'Contact an administrator if you believe this is in error',
  },
  EMAIL_ALREADY_REGISTERED: {
    code: 'EMAIL_ALREADY_REGISTERED',
    message: 'An account with this email already exists.',
    nextStep: 'Sign in with your password or use another email',
  },
  INFERENCE_FAILED: {
    code: 'INFERENCE_FAILED',
    message: "The analysis didn't complete. Your image was not assessed.",
    nextStep: 'Retry or try another photo',
  },
  INFERENCE_TIMEOUT: {
    code: 'INFERENCE_TIMEOUT',
    message: 'The image analysis service took too long to respond. Please try again.',
    nextStep: 'Retry in a few moments',
  },
  ADVISORY_FAILED: {
    code: 'ADVISORY_FAILED',
    message: 'The advisory service is unavailable or returned an unusable result.',
    nextStep: 'Try again later',
  },
  PERSISTENCE_FAILED: {
    code: 'PERSISTENCE_FAILED',
    message: 'The result could not be saved. Please try again.',
    nextStep: 'Try again in a few moments',
  },
  MODEL_RELOAD_FAILED: {
    code: 'MODEL_RELOAD_FAILED',
    message: 'The model reload failed. The previously loaded model is still active.',
    nextStep: 'Check vision service logs',
  },
  ASSESSMENT_NOT_FOUND: {
    code: 'ASSESSMENT_NOT_FOUND',
    message: "We couldn't find that assessment.",
    nextStep: 'Return to assessment history',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Please sign in to access this assessment.',
    nextStep: 'Sign in',
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please wait a moment and try again.',
    nextStep: 'Wait a moment and retry',
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong on our side. Please try again.',
    nextStep: 'Try again in a few moments',
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: "Can't reach the server. Check your internet connection and try again.",
    nextStep: 'Check your connection and retry',
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    message: 'The request took longer than expected and timed out.',
    nextStep: 'Check your connection and try again',
  },
  INVALID_RESPONSE: {
    code: 'INVALID_RESPONSE',
    message: 'We received an unexpected response format from the server.',
    nextStep: 'Try again later or contact support',
  },
}

export const DEFAULT_ERROR_MESSAGE: ErrorMessageDefinition = {
  code: 'INTERNAL_ERROR',
  message: 'An unexpected error occurred. Please try again.',
  nextStep: 'Try again in a few moments',
}

/**
 * Returns user-friendly error message and next recommended action for an ErrorCode.
 */
export function getErrorMessage(code?: string | null): ErrorMessageDefinition {
  if (!code) {
    return DEFAULT_ERROR_MESSAGE
  }

  const recognized = ERROR_MESSAGES[code]
  if (recognized) {
    return recognized
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    nextStep: 'Try again in a few moments',
  }
}

/**
 * Extracts the actual human-readable error message sent by the backend.
 * Never displays raw HTTP status code strings like "Request failed with status code 422".
 */
export function extractApiErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred. Please try again.',
): string {
  if (!error) return fallback

  // 1. Check if error is an object with a custom isApiError flag
  if (
    typeof error === 'object' &&
    error !== null &&
    'isApiError' in error &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    const msg = (error as { message: string }).message.trim()
    if (msg && !msg.toLowerCase().includes('status code')) {
      return msg
    }
  }

  // 2. AxiosError or any HTTP response with data
  if (axios.isAxiosError(error) || (typeof error === 'object' && error !== null && 'response' in error)) {
    const res = (error as { response?: { data?: unknown; status?: number } }).response
    const data = res?.data

    if (data && typeof data === 'object') {
      const dataObj = data as Record<string, unknown>

      // Standard BunaVision backend envelope: { error: { code, message, details } }
      if (
        dataObj.error &&
        typeof dataObj.error === 'object' &&
        dataObj.error !== null &&
        'message' in dataObj.error &&
        typeof (dataObj.error as { message: unknown }).message === 'string' &&
        (dataObj.error as { message: string }).message.trim()
      ) {
        return (dataObj.error as { message: string }).message.trim()
      }

      // Backend message field: { message: "..." }
      if (typeof dataObj.message === 'string' && dataObj.message.trim()) {
        return dataObj.message.trim()
      }

      // DRF/FastAPI detail field: { detail: "..." }
      if (typeof dataObj.detail === 'string' && dataObj.detail.trim()) {
        return dataObj.detail.trim()
      }

      // DRF list detail: { detail: ["..."] }
      if (Array.isArray(dataObj.detail) && dataObj.detail.length > 0) {
        return dataObj.detail.map(String).join('; ')
      }

      // DRF dictionary of field validation errors: { password: ["..."], email: ["..."] }
      if (!Array.isArray(data)) {
        const issues: string[] = []
        for (const [key, value] of Object.entries(dataObj)) {
          if (key === 'error') continue
          if (Array.isArray(value)) {
            issues.push(`${key}: ${value.map(String).join(', ')}`)
          } else if (typeof value === 'string' && value.trim()) {
            issues.push(`${key}: ${value.trim()}`)
          }
        }
        if (issues.length > 0) {
          return issues.join('; ')
        }
      }
    }

    // If HTTP status is recognized, map to human-friendly description
    if (res?.status) {
      if (res.status === 404) return "The requested resource could not be found."
      if (res.status === 401) return 'Incorrect email or password. Please try again.'
      if (res.status === 403) return 'You do not have permission to perform this action.'
      if (res.status === 409) return 'An account with this email already exists.'
      if (res.status === 413) return 'This image is larger than the maximum allowed size (10 MB).'
      if (res.status === 415) return 'Unsupported image format. Please upload a JPEG, PNG, or WEBP photo.'
      if (res.status === 429) return 'Too many requests. Please wait a moment and try again.'
      if (res.status >= 500) return 'Something went wrong on our server. Please try again.'
    }
  }

  // 3. Standard Error instance (ignoring generic status code messages)
  if (error instanceof Error) {
    if (error.message && !error.message.toLowerCase().includes('status code')) {
      return error.message
    }
  }

  return fallback
}
