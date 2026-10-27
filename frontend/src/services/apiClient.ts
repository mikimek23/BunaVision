import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type { ZodType } from 'zod'
import { env } from '../config/env'
import type { ErrorCode } from '../types/api'
import { apiErrorBodySchema } from '../schemas/api.schema'

export class ApiError extends Error {
  readonly code: ErrorCode
  readonly httpStatus?: number
  readonly details?: unknown
  readonly isApiError = true

  constructor(options: {
    code: ErrorCode
    message: string
    httpStatus?: number
    details?: unknown
  }) {
    super(options.message)
    this.name = 'ApiError'
    this.code = options.code
    this.httpStatus = options.httpStatus
    this.details = options.details

    // Maintain prototype chain
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isApiError' in error &&
    (error as ApiError).isApiError === true
  )
}

export function normalizeError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error
  }

  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError

    // Timeout check
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.toLowerCase().includes('timeout')) {
      return new ApiError({
        code: 'TIMEOUT',
        message: 'The request took longer than expected and timed out.',
        details: axiosError.message,
      })
    }

    // Network error (no response received from server)
    if (!axiosError.response) {
      return new ApiError({
        code: 'NETWORK_ERROR',
        message: 'Unable to reach the server. Please check your internet connection.',
        details: axiosError.message,
      })
    }

    const status = axiosError.response.status
    const responseData = axiosError.response.data

    // 1. Try parsing structured ApiErrorBody from backend: { error: { code, message, details } }
    const parsedBody = apiErrorBodySchema.safeParse(responseData)
    if (parsedBody.success) {
      return new ApiError({
        code: parsedBody.data.error.code as ErrorCode,
        message: parsedBody.data.error.message,
        httpStatus: status,
        details: parsedBody.data.error.details,
      })
    }

    // 2. If response has an unparsed error object
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'error' in responseData &&
      typeof (responseData as Record<string, unknown>).error === 'object' &&
      (responseData as Record<string, unknown>).error !== null
    ) {
      const bErr = (responseData as Record<string, unknown>).error as Record<string, unknown>
      const message =
        typeof bErr.message === 'string' && bErr.message.trim()
          ? bErr.message.trim()
          : axiosError.message
      const code =
        typeof bErr.code === 'string' ? (bErr.code as ErrorCode) : 'INTERNAL_ERROR'

      return new ApiError({
        code,
        message,
        httpStatus: status,
        details: bErr.details,
      })
    }

    // 3. FastAPI / DRF detail field: { detail: "..." }
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'detail' in responseData
    ) {
      const detail = (responseData as Record<string, unknown>).detail
      let message = ''
      if (typeof detail === 'string') {
        message = detail
      } else if (Array.isArray(detail)) {
        message = detail.map((d: unknown) => (typeof d === 'object' && d !== null && 'msg' in d ? String((d as { msg: unknown }).msg) : String(d))).join('; ')
      } else if (typeof detail === 'object' && detail !== null) {
        message = Object.entries(detail).map(([k, v]) => `${k}: ${v}`).join('; ')
      }

      if (message) {
        return new ApiError({
          code: status === 401 ? 'INVALID_CREDENTIALS' : 'INVALID_REQUEST',
          message,
          httpStatus: status,
          details: responseData,
        })
      }
    }

    // 4. Raw message field: { message: "..." }
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData
    ) {
      const rawMessage = (responseData as Record<string, unknown>).message
      if (typeof rawMessage === 'string' && rawMessage.trim()) {
        return new ApiError({
          code: 'INTERNAL_ERROR',
          message: rawMessage.trim(),
          httpStatus: status,
          details: responseData,
        })
      }
    }

    // 5. Map common HTTP status codes
    switch (status) {
      case 404:
        return new ApiError({
          code: 'ASSESSMENT_NOT_FOUND',
          message: 'The requested resource could not be found.',
          httpStatus: 404,
        })
      case 401:
        return new ApiError({
          code: 'INVALID_CREDENTIALS',
          message: 'Incorrect email or password.',
          httpStatus: 401,
        })
      case 403:
        return new ApiError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          httpStatus: 403,
        })
      case 409:
        return new ApiError({
          code: 'EMAIL_ALREADY_REGISTERED',
          message: 'An account with this email already exists.',
          httpStatus: 409,
        })
      case 413:
        return new ApiError({
          code: 'IMAGE_TOO_LARGE',
          message: 'This image is larger than the maximum allowed size (10 MB).',
          httpStatus: 413,
        })
      case 415:
        return new ApiError({
          code: 'UNSUPPORTED_FORMAT',
          message: 'Unsupported image format. Please upload a JPEG, PNG, or WEBP photo.',
          httpStatus: 415,
        })
      case 429:
        return new ApiError({
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please slow down and try again shortly.',
          httpStatus: 429,
        })
      case 400:
      case 422:
        return new ApiError({
          code: 'INVALID_REQUEST',
          message: 'The submitted image could not be processed.',
          httpStatus: status,
          details: responseData,
        })
      default:
        return new ApiError({
          code: 'INTERNAL_ERROR',
          message: 'An internal server error occurred. Please try again.',
          httpStatus: status,
          details: responseData,
        })
    }
  }

  // Handle standard AbortError
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError({
      code: 'TIMEOUT',
      message: 'The request was aborted or timed out.',
    })
  }

  // Generic fallback
  const message = error instanceof Error ? error.message : 'An unknown error occurred.'
  return new ApiError({
    code: 'INTERNAL_ERROR',
    message,
    details: error,
  })
}

/**
 * Validates payload against a Zod schema.
 * On mismatch, throws ApiError with code INVALID_RESPONSE per plan §4.4.
 */
export function validateWithSchema<T>(data: unknown, schema?: ZodType<T>): T {
  if (!schema) {
    return data as T
  }

  const result = schema.safeParse(data)
  if (!result.success) {
    // Spec §14.4: Never log image contents, log only error codes and path issues
    console.error(
      'Schema validation mismatch: INVALID_RESPONSE',
      result.error.issues.map((i) => ({ path: i.path, message: i.message })),
    )
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: 'We received an unexpected response format from the server.',
      details: result.error.format(),
    })
  }

  return result.data
}

export const rawAxiosClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.requestTimeoutMs,
  headers: {
    Accept: 'application/json',
  },
})

export interface RequestOptions<T> extends AxiosRequestConfig {
  schema?: ZodType<T>
}

/**
 * High-level API client with timeouts, automatic error normalization,
 * and Zod runtime response validation.
 */
export const apiClient = {
  raw: rawAxiosClient,

  async request<T>(config: RequestOptions<T>): Promise<T> {
    const { schema, ...axiosConfig } = config
    try {
      const response = await rawAxiosClient.request(axiosConfig)
      return validateWithSchema(response.data, schema)
    } catch (error) {
      throw normalizeError(error)
    }
  },

  async get<T>(url: string, config?: RequestOptions<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url })
  },

  async post<T>(url: string, data?: unknown, config?: RequestOptions<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  },

  async put<T>(url: string, data?: unknown, config?: RequestOptions<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  },

  async delete<T>(url: string, config?: RequestOptions<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  },
}
