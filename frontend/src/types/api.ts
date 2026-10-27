export type ErrorCode =
  | 'INVALID_IMAGE'
  | 'UNSUPPORTED_FORMAT'
  | 'IMAGE_TOO_LARGE'
  | 'IMAGE_NOT_COFFEE'
  | 'INVALID_REQUEST'
  | 'IDEMPOTENCY_KEY_REUSED'
  | 'AUTHENTICATION_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'ASSESSMENT_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INFERENCE_FAILED'
  | 'INFERENCE_TIMEOUT'
  | 'ADVISORY_FAILED'
  | 'PERSISTENCE_FAILED'
  | 'MODEL_RELOAD_FAILED'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'INVALID_RESPONSE'
  | (string & {})

export interface ApiErrorDetail {
  field?: string
  issue?: string
  [key: string]: unknown
}

export interface ApiErrorBody {
  error: {
    code: ErrorCode
    message: string
    request_id?: string | null
    assessment_id?: string | null
    details?: unknown
  }
}

export interface PaginatedListResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}
