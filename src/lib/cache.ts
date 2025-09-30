import 'server-only'
import { sql } from '@/lib/postgres-client'

export interface CacheEntry {
  key: string
  value: any
  expiresAt: Date
  createdAt: Date
}

/**
 * 基于数据库的缓存系统
 * 用于缓存Flux API的转换结果
 */

// 生成缓存键
export function generateCacheKey(prefix: string, ...params: string[]): string {
  const normalizedParams = params
    .map(param => param.toLowerCase().replace(/[^a-z0-9]/g, '_'))
    .join('_')
  
  return `${prefix}_${normalizedParams}`
}

// 设置缓存
export async function setCache(
  key: string, 
  value: any, 
  ttlSeconds: number = 3600
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000)
    
    await sql`
      INSERT INTO nf_cache (cache_key, cache_value, expires_at, created_at)
      VALUES (${key}, ${JSON.stringify(value)}, ${expiresAt}, NOW())
      ON CONFLICT (cache_key) 
      DO UPDATE SET 
        cache_value = ${JSON.stringify(value)},
        expires_at = ${expiresAt},
        updated_at = NOW()
    `
  } catch (error) {
    console.error('Cache set error:', error)
    // 缓存失败不应该影响主要功能
  }
}

// 获取缓存
export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    const { rows } = await sql`
      SELECT cache_value, expires_at 
      FROM nf_cache 
      WHERE cache_key = ${key} AND expires_at > NOW()
    `
    
    if (rows.length === 0) {
      return null
    }
    
    return JSON.parse(rows[0].cache_value)
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

// 删除缓存
export async function deleteCache(key: string): Promise<void> {
  try {
    await sql`DELETE FROM nf_cache WHERE cache_key = ${key}`
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

// 清理过期缓存
export async function cleanExpiredCache(): Promise<number> {
  try {
    const { rowCount } = await sql`DELETE FROM nf_cache WHERE expires_at <= NOW()`
    return rowCount || 0
  } catch (error) {
    console.error('Cache cleanup error:', error)
    return 0
  }
}

// 获取缓存统计信息
export async function getCacheStats(): Promise<{
  totalEntries: number
  expiredEntries: number
  memoryUsage: string
}> {
  try {
    const [totalResult, expiredResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM nf_cache`,
      sql`SELECT COUNT(*) as count FROM nf_cache WHERE expires_at <= NOW()`
    ])
    
    const totalEntries = parseInt(totalResult.rows[0]?.count || '0')
    const expiredEntries = parseInt(expiredResult.rows[0]?.count || '0')
    
    // 估算内存使用量（简化计算）
    const memoryUsage = `${Math.round(totalEntries * 0.5)}KB`
    
    return {
      totalEntries,
      expiredEntries,
      memoryUsage
    }
  } catch (error) {
    console.error('Cache stats error:', error)
    return {
      totalEntries: 0,
      expiredEntries: 0,
      memoryUsage: '0KB'
    }
  }
}

/**
 * Flux API结果缓存
 */

// 缓存Flux API结果
export async function cacheFluxResult(
  imageHash: string,
  styleId: string,
  result: {
    predictionId: string
    resultUrl: string
    processingTime: number
  }
): Promise<void> {
  const cacheKey = generateCacheKey('flux_result', imageHash, styleId)
  await setCache(cacheKey, result, 24 * 3600) // 缓存24小时
}

// 获取Flux API缓存结果
export async function getCachedFluxResult(
  imageHash: string,
  styleId: string
): Promise<{
  predictionId: string
  resultUrl: string
  processingTime: number
} | null> {
  const cacheKey = generateCacheKey('flux_result', imageHash, styleId)
  return await getCache(cacheKey)
}

/**
 * 用户转换历史缓存
 */

// 缓存用户转换历史
export async function cacheUserHistory(
  userId: string,
  history: any[]
): Promise<void> {
  const cacheKey = generateCacheKey('user_history', userId)
  await setCache(cacheKey, history, 300) // 缓存5分钟
}

// 获取用户转换历史缓存
export async function getCachedUserHistory(userId: string): Promise<any[] | null> {
  const cacheKey = generateCacheKey('user_history', userId)
  return await getCache(cacheKey)
}

/**
 * 风格模板缓存
 */

// 缓存风格模板列表
export async function cacheStyleTemplates(templates: any[]): Promise<void> {
  const cacheKey = 'style_templates'
  await setCache(cacheKey, templates, 3600) // 缓存1小时
}

// 获取风格模板缓存
export async function getCachedStyleTemplates(): Promise<any[] | null> {
  const cacheKey = 'style_templates'
  return await getCache(cacheKey)
}

/**
 * 图片哈希计算
 */
export async function calculateImageHash(imageData: string): Promise<string> {
  // 使用Web Crypto API计算SHA-256哈希
  const encoder = new TextEncoder()
  const data = encoder.encode(imageData)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
