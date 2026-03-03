'use server'

import { unstable_noStore } from 'next/cache'
import { headers } from 'next/headers'
import { sql, db } from '@/lib/postgres-client'
import { getCurrentUser } from '@/lib/auth'

export interface PromotionPlatform {
  id: number
  platform_key: string
  name: string | null
  utm_source_value: string
  promotion_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface PromotionPlatformWithClicks extends PromotionPlatform {
  click_count: number
}

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.userId !== process.env.APP_ROLE_ADMIN) {
    throw new Error('无权操作')
  }
}

export async function getPromotionPlatformsList(): Promise<{
  success: boolean
  data?: PromotionPlatformWithClicks[]
  error?: string
}> {
  try {
    await requireAdmin()
    const { rows: platforms } = await sql<PromotionPlatform>`
      SELECT id, platform_key, name, utm_source_value, promotion_url, is_active, created_at, updated_at
      FROM nf_promotion_platforms
      ORDER BY id
    `
    const { rows: counts } = await sql<{ platform_id: number; cnt: string }>`
      SELECT platform_id, count(*)::text as cnt
      FROM nf_promotion_clicks
      GROUP BY platform_id
    `
    const countMap = Object.fromEntries(counts.map((r) => [r.platform_id, parseInt(r.cnt, 10) || 0]))
    const data: PromotionPlatformWithClicks[] = platforms.map((p) => ({
      ...p,
      click_count: countMap[p.id] ?? 0,
    }))
    return { success: true, data }
  } catch (e) {
    console.error('getPromotionPlatformsList error:', e)
    return { success: false, error: String(e) }
  }
}

export async function getPromotionPlatformsListPaginated(
  page: number,
  pageSize: number
): Promise<{
  success: boolean
  data?: PromotionPlatformWithClicks[]
  total?: number
  totalPages?: number
  error?: string
}> {
  try {
    await requireAdmin()
    const offset = (page - 1) * pageSize
    const { rows: countRows } = await sql<{ cnt: string }>`
      SELECT count(*)::text as cnt FROM nf_promotion_platforms
    `
    const total = parseInt(countRows[0]?.cnt ?? '0', 10)
    const { rows: platforms } = await sql<PromotionPlatform>`
      SELECT id, platform_key, name, utm_source_value, promotion_url, is_active, created_at, updated_at
      FROM nf_promotion_platforms
      ORDER BY id
      LIMIT ${pageSize} OFFSET ${offset}
    `
    const { rows: counts } = await sql<{ platform_id: number; cnt: string }>`
      SELECT platform_id, count(*)::text as cnt
      FROM nf_promotion_clicks
      GROUP BY platform_id
    `
    const countMap = Object.fromEntries(counts.map((r) => [r.platform_id, parseInt(r.cnt, 10) || 0]))
    const data: PromotionPlatformWithClicks[] = platforms.map((p) => ({
      ...p,
      click_count: countMap[p.id] ?? 0,
    }))
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    return { success: true, data, total, totalPages }
  } catch (e) {
    console.error('getPromotionPlatformsListPaginated error:', e)
    return { success: false, error: String(e) }
  }
}

export interface PromotionClickRecord {
  id: number
  platform_id: number
  platform_name: string | null
  utm_source_value: string
  ip: string | null
  country: string | null
  region: string | null
  city: string | null
  created_at: string
}

export async function getPromotionClicksList(
  page: number,
  pageSize: number,
  options?: { platformId?: number; startDate?: string; endDate?: string }
): Promise<{
  success: boolean
  data?: PromotionClickRecord[]
  total?: number
  totalPages?: number
  error?: string
}> {
  unstable_noStore()
  try {
    await requireAdmin()
    const offset = (page - 1) * pageSize
    const { platformId, startDate, endDate } = options ?? {}
    const conditions: string[] = []
    const countParams: (string | number)[] = []
    const listParams: (string | number)[] = []
    let paramIdx = 1
    if (platformId != null) {
      conditions.push(`c.platform_id = $${paramIdx}`)
      countParams.push(platformId)
      listParams.push(platformId)
      paramIdx++
    }
    if (startDate) {
      conditions.push(`c.created_at::date >= $${paramIdx}::date`)
      countParams.push(startDate)
      listParams.push(startDate)
      paramIdx++
    }
    if (endDate) {
      conditions.push(`c.created_at::date <= $${paramIdx}::date`)
      countParams.push(endDate)
      listParams.push(endDate)
      paramIdx++
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const countQuery = `SELECT count(*)::text as cnt FROM nf_promotion_clicks c ${whereClause}`
    const countResult = await db.query<{ cnt: string }>(countQuery, countParams)
    const total = parseInt(countResult.rows[0]?.cnt ?? '0', 10)
    const listQuery = `SELECT c.id, c.platform_id, p.name as platform_name, c.utm_source_value, c.ip, c.country, c.region, c.city, c.created_at
      FROM nf_promotion_clicks c
      LEFT JOIN nf_promotion_platforms p ON p.id = c.platform_id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`
    listParams.push(pageSize, offset)
    const listResult = await db.query<PromotionClickRecord>(listQuery, listParams)
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    return { success: true, data: listResult.rows, total, totalPages }
  } catch (e) {
    console.error('getPromotionClicksList error:', e)
    return { success: false, error: String(e) }
  }
}

export async function getPromotionRecordsPageData(
  page: number,
  pageSize: number,
  options?: { platformId?: number; startDate?: string; endDate?: string }
): Promise<{
  success: boolean
  platforms?: PromotionPlatformWithClicks[]
  records?: PromotionClickRecord[]
  total?: number
  totalPages?: number
  error?: string
}> {
  unstable_noStore()
  const [platformsRes, clicksRes] = await Promise.all([
    getPromotionPlatformsList(),
    getPromotionClicksList(page, pageSize, options),
  ])
  if (!platformsRes.success) return { success: false, error: platformsRes.error }
  if (!clicksRes.success) return { success: false, error: clicksRes.error }
  return {
    success: true,
    platforms: platformsRes.data ?? [],
    records: clicksRes.data ?? [],
    total: clicksRes.total ?? 0,
    totalPages: clicksRes.totalPages ?? 1,
  }
}

export interface PromotionStatItem {
  platform_id: number
  platform_name: string | null
  platform_key: string
  utm_source_value: string
  click_count: number
}

export async function getPromotionStatsByDateRange(
  startDate?: string,
  endDate?: string
): Promise<{
  success: boolean
  data?: PromotionStatItem[]
  totalClicks?: number
  error?: string
}> {
  unstable_noStore()
  try {
    await requireAdmin()
    const isAll = !startDate?.trim() && !endDate?.trim()
    const query = isAll
      ? `
      SELECT p.id as platform_id, p.name as platform_name, p.platform_key, p.utm_source_value,
             count(c.id)::int as click_count
      FROM nf_promotion_platforms p
      LEFT JOIN nf_promotion_clicks c ON c.platform_id = p.id
      GROUP BY p.id, p.name, p.platform_key, p.utm_source_value
      ORDER BY click_count DESC, p.id
    `
      : `
      SELECT p.id as platform_id, p.name as platform_name, p.platform_key, p.utm_source_value,
             count(c.id)::int as click_count
      FROM nf_promotion_platforms p
      LEFT JOIN nf_promotion_clicks c ON c.platform_id = p.id
        AND (c.created_at AT TIME ZONE 'Asia/Shanghai')::date >= $1::date
        AND (c.created_at AT TIME ZONE 'Asia/Shanghai')::date <= $2::date
      GROUP BY p.id, p.name, p.platform_key, p.utm_source_value
      ORDER BY click_count DESC, p.id
    `
    const result = await db.query<{
      platform_id: number
      platform_name: string | null
      platform_key: string
      utm_source_value: string
      click_count: string
    }>(query, isAll ? [] : [startDate!, endDate!])
    const data: PromotionStatItem[] = result.rows.map((r) => ({
      platform_id: r.platform_id,
      platform_name: r.platform_name,
      platform_key: r.platform_key,
      utm_source_value: r.utm_source_value,
      click_count: parseInt(r.click_count, 10) || 0,
    }))
    const totalClicks = data.reduce((sum, i) => sum + i.click_count, 0)
    return { success: true, data, totalClicks }
  } catch (e) {
    console.error('getPromotionStatsByDateRange error:', e)
    return { success: false, error: String(e) }
  }
}

export async function createPromotionPlatform(payload: {
  platform_key: string
  name?: string | null
  utm_source_value: string
  promotion_url?: string | null
  is_active?: boolean
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await requireAdmin()
    await sql`
      INSERT INTO nf_promotion_platforms (platform_key, name, utm_source_value, promotion_url, is_active)
      VALUES (
        ${payload.platform_key},
        ${payload.name ?? null},
        ${payload.utm_source_value},
        ${payload.promotion_url ?? null},
        ${payload.is_active ?? true}
      )
    `
    return { success: true, message: '已添加' }
  } catch (e: unknown) {
    const msg = (e as { code?: string })?.code === '23505' ? '平台标识或 utm_source 值已存在' : String(e)
    console.error('createPromotionPlatform error:', e)
    return { success: false, error: msg }
  }
}

export async function updatePromotionPlatform(
  id: number,
  payload: {
    platform_key?: string
    name?: string | null
    utm_source_value?: string
    promotion_url?: string | null
    is_active?: boolean
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await requireAdmin()
    const updates: string[] = []
    const values: (string | number | boolean | null)[] = []
    let idx = 1
    if (payload.platform_key !== undefined) {
      updates.push(`platform_key = $${idx}`)
      values.push(payload.platform_key)
      idx++
    }
    if (payload.name !== undefined) {
      updates.push(`name = $${idx}`)
      values.push(payload.name)
      idx++
    }
    if (payload.utm_source_value !== undefined) {
      updates.push(`utm_source_value = $${idx}`)
      values.push(payload.utm_source_value)
      idx++
    }
    if (payload.promotion_url !== undefined) {
      updates.push(`promotion_url = $${idx}`)
      values.push(payload.promotion_url)
      idx++
    }
    if (payload.is_active !== undefined) {
      updates.push(`is_active = $${idx}`)
      values.push(payload.is_active)
      idx++
    }
    if (updates.length === 0) return { success: true, message: '无变更' }
    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)
    const query = `UPDATE nf_promotion_platforms SET ${updates.join(', ')} WHERE id = $${idx}`
    const result = await db.query(query, values)
    if (result.rowCount === 0) return { success: false, error: '记录不存在' }
    return { success: true, message: '已更新' }
  } catch (e: unknown) {
    const msg = (e as { code?: string })?.code === '23505' ? '平台标识或 utm_source 值已存在' : String(e)
    console.error('updatePromotionPlatform error:', e)
    return { success: false, error: msg }
  }
}

export async function deletePromotionPlatform(id: number): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await requireAdmin()
    await sql`DELETE FROM nf_promotion_clicks WHERE platform_id = ${id}`
    const result = await sql`DELETE FROM nf_promotion_platforms WHERE id = ${id}`
    if (result.rowCount === 0) return { success: false, error: '记录不存在' }
    return { success: true, message: '已删除' }
  } catch (e) {
    console.error('deletePromotionPlatform error:', e)
    return { success: false, error: String(e) }
  }
}

async function getIp() {
  const headersList = await headers()
  const cfIp = headersList.get('cf-connecting-ip')
  if (cfIp) return cfIp
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  const realIp = headersList.get('x-real-ip')
  return realIp ?? 'unknown'
}

export async function recordPromotionClick(payload: {
  utm_source_value: string
  ip?: string
}): Promise<{ success: boolean; recorded?: boolean; error?: string }> {
  try {
    const value = payload.utm_source_value?.trim()
    if (!value) return { success: true, recorded: false }
    const ip = payload.ip ?? (await getIp())
    const query = `
      INSERT INTO nf_promotion_clicks (platform_id, utm_source_value, ip)
      SELECT id, $1::varchar, $2::varchar
      FROM nf_promotion_platforms
      WHERE utm_source_value = $1 AND is_active = true
    `
    const result = await db.query(query, [value, ip])
    return { success: true, recorded: (result.rowCount ?? 0) > 0 }
  } catch (e) {
    console.error('recordPromotionClick error:', e)
    return { success: false, error: String(e) }
  }
}

