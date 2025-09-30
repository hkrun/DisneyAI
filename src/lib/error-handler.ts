import 'server-only'

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  retryable?: boolean
}

export class CustomError extends Error {
  public code?: string
  public statusCode?: number
  public retryable?: boolean

  constructor(message: string, code?: string, statusCode?: number, retryable?: boolean) {
    super(message)
    this.name = 'CustomError'
    this.code = code
    this.statusCode = statusCode
    this.retryable = retryable
  }
}

/**
 * 重试机制配置
 */
export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
}

/**
 * 带重试的异步函数执行器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // 如果不是可重试的错误，直接抛出
      if (error instanceof CustomError && !error.retryable) {
        throw error
      }

      // 如果是最后一次尝试，抛出错误
      if (attempt === finalConfig.maxAttempts) {
        throw lastError
      }

      // 计算延迟时间
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelay
      )

      console.warn(`尝试 ${attempt} 失败，${delay}ms 后重试:`, lastError.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Flux API 特定的错误处理
 */
export function handleFluxApiError(error: any): CustomError {
  if (error.response) {
    const status = error.response.status
    const message = error.response.data?.error || error.response.data?.message || 'API请求失败'
    
    switch (status) {
      case 401:
        return new CustomError('API认证失败，请检查API密钥', 'AUTH_ERROR', 401, false)
      case 402:
        return new CustomError('API配额不足，请检查账户余额', 'QUOTA_ERROR', 402, false)
      case 429:
        return new CustomError('API请求过于频繁，请稍后重试', 'RATE_LIMIT', 429, true)
      case 500:
      case 502:
      case 503:
        return new CustomError('API服务暂时不可用，请稍后重试', 'SERVER_ERROR', status, true)
      default:
        return new CustomError(message, 'API_ERROR', status, status >= 500)
    }
  }
  
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return new CustomError('网络连接失败，请检查网络设置', 'NETWORK_ERROR', 0, true)
  }
  
  if (error.code === 'TIMEOUT') {
    return new CustomError('请求超时，请稍后重试', 'TIMEOUT_ERROR', 0, true)
  }

  return new CustomError(
    error.message || '未知错误',
    'UNKNOWN_ERROR',
    500,
    true
  )
}

/**
 * 数据库错误处理
 */
export function handleDatabaseError(error: any): CustomError {
  if (error.code === '23505') { // 唯一约束违反
    return new CustomError('数据已存在', 'DUPLICATE_ERROR', 409, false)
  }
  
  if (error.code === '23503') { // 外键约束违反
    return new CustomError('关联数据不存在', 'FOREIGN_KEY_ERROR', 400, false)
  }
  
  if (error.code === '23514') { // 检查约束违反
    return new CustomError('数据格式不正确', 'VALIDATION_ERROR', 400, false)
  }

  return new CustomError(
    '数据库操作失败',
    'DATABASE_ERROR',
    500,
    true
  )
}

/**
 * 文件上传错误处理
 */
export function handleUploadError(error: any): CustomError {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new CustomError('文件大小超过限制', 'FILE_TOO_LARGE', 413, false)
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new CustomError('文件数量超过限制', 'TOO_MANY_FILES', 413, false)
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new CustomError('不支持的文件类型', 'INVALID_FILE_TYPE', 400, false)
  }

  return new CustomError(
    '文件上传失败',
    'UPLOAD_ERROR',
    500,
    true
  )
}

/**
 * 用户友好的错误消息映射
 */
export function getUserFriendlyMessage(error: CustomError): string {
  switch (error.code) {
    case 'AUTH_ERROR':
      return '认证失败，请重新登录'
    case 'QUOTA_ERROR':
      return '积分不足，请购买积分后重试'
    case 'RATE_LIMIT':
      return '操作过于频繁，请稍后再试'
    case 'NETWORK_ERROR':
      return '网络连接失败，请检查网络后重试'
    case 'TIMEOUT_ERROR':
      return '请求超时，请稍后重试'
    case 'FILE_TOO_LARGE':
      return '文件太大，请选择小于20MB的图片'
    case 'INVALID_FILE_TYPE':
      return '文件格式不支持，请选择JPG、PNG或GIF格式'
    case 'DUPLICATE_ERROR':
      return '数据已存在，请勿重复操作'
    case 'VALIDATION_ERROR':
      return '输入数据格式不正确'
    default:
      return error.message || '操作失败，请稍后重试'
  }
}
