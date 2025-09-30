/**
 * 视频模板管理模块
 */

import { sql } from '@/lib/postgres-client'

// 视频模板接口定义
export interface VideoTemplate {
  id: number
  templateName: string
  templateDescription?: string
  videoUrl: string
  thumbnailUrl?: string
  duration?: string
  category: string
  isPopular: boolean
  sortOrder: number
  status: '1' | '0'
  aliyunTemplateId?: string  // 阿里云模板ID
  createdAt: Date
  updatedAt: Date
}

// 获取所有视频模板
export async function getVideoTemplates(): Promise<{
  success: boolean
  templates?: VideoTemplate[]
  error?: string
}> {
  try {
    const { rows } = await sql`
      SELECT
        id,
        template_name as "templateName",
        template_description as "templateDescription",
        video_url as "videoUrl",
        thumbnail_url as "thumbnailUrl",
        duration,
        category,
        is_popular as "isPopular",
        sort_order as "sortOrder",
        status,
        aliyun_template_id as "aliyunTemplateId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM nf_video_templates
      WHERE status = '1'
      ORDER BY sort_order ASC, created_at DESC
    `

    return {
      success: true,
      templates: rows as VideoTemplate[]
    }
  } catch (error) {
    console.error('获取视频模板失败:', error)
    return {
      success: false,
      error: '获取视频模板失败'
    }
  }
}

// 根据ID获取视频模板
export async function getVideoTemplateById(id: number): Promise<{
  success: boolean
  template?: VideoTemplate
  error?: string
}> {
  try {
    const { rows } = await sql`
      SELECT
        id,
        template_name as "templateName",
        template_description as "templateDescription",
        video_url as "videoUrl",
        thumbnail_url as "thumbnailUrl",
        duration,
        category,
        is_popular as "isPopular",
        sort_order as "sortOrder",
        status,
        aliyun_template_id as "aliyunTemplateId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM nf_video_templates
      WHERE id = ${id} AND status = '1'
    `

    if (rows.length === 0) {
      return {
        success: false,
        error: '视频模板不存在'
      }
    }

    return {
      success: true,
      template: rows[0] as VideoTemplate
    }
  } catch (error) {
    console.error('获取视频模板失败:', error)
    return {
      success: false,
      error: '获取视频模板失败'
    }
  }
}

// 根据分类获取视频模板
export async function getVideoTemplatesByCategory(category: string): Promise<{
  success: boolean
  templates?: VideoTemplate[]
  error?: string
}> {
  try {
    const { rows } = await sql`
      SELECT 
        id,
        template_name as "templateName",
        template_description as "templateDescription",
        video_url as "videoUrl",
        thumbnail_url as "thumbnailUrl",
        duration,
        category,
        is_popular as "isPopular",
        sort_order as "sortOrder",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM nf_video_templates 
      WHERE category = ${category} AND status = '1'
      ORDER BY sort_order ASC, created_at DESC
    `

    return {
      success: true,
      templates: rows as VideoTemplate[]
    }
  } catch (error) {
    console.error('获取分类视频模板失败:', error)
    return {
      success: false,
      error: '获取分类视频模板失败'
    }
  }
}

// 创建新的视频模板
export async function createVideoTemplate(params: {
  templateName: string
  templateDescription?: string
  videoUrl: string
  thumbnailUrl?: string
  duration?: string
  category?: string
  isPopular?: boolean
  sortOrder?: number
  aliyunTemplateId?: string
}): Promise<{
  success: boolean
  template?: VideoTemplate
  error?: string
}> {
  try {
    const { rows } = await sql`
      INSERT INTO nf_video_templates (
        template_name, template_description, video_url, thumbnail_url,
        duration, category, is_popular, sort_order, aliyun_template_id
      ) VALUES (
        ${params.templateName},
        ${params.templateDescription || null},
        ${params.videoUrl},
        ${params.thumbnailUrl || null},
        ${params.duration || null},
        ${params.category || 'general'},
        ${params.isPopular || false},
        ${params.sortOrder || 0},
        ${params.aliyunTemplateId || null}
      )
      RETURNING
        id,
        template_name as "templateName",
        template_description as "templateDescription",
        video_url as "videoUrl",
        thumbnail_url as "thumbnailUrl",
        duration,
        category,
        is_popular as "isPopular",
        sort_order as "sortOrder",
        status,
        aliyun_template_id as "aliyunTemplateId",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    if (rows.length === 0) {
      return {
        success: false,
        error: '创建视频模板失败'
      }
    }

    return {
      success: true,
      template: rows[0] as VideoTemplate
    }
  } catch (error) {
    console.error('创建视频模板失败:', error)
    return {
      success: false,
      error: '创建视频模板失败'
    }
  }
}

// 更新视频模板
export async function updateVideoTemplate(id: number, params: {
  templateName?: string
  templateDescription?: string
  videoUrl?: string
  thumbnailUrl?: string
  duration?: string
  category?: string
  isPopular?: boolean
  sortOrder?: number
  status?: '1' | '0'
}): Promise<{
  success: boolean
  template?: VideoTemplate
  error?: string
}> {
  try {
    // 构建更新字段
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (params.templateName !== undefined) {
      updateFields.push(`template_name = $${paramIndex}`)
      updateValues.push(params.templateName)
      paramIndex++
    }

    if (params.templateDescription !== undefined) {
      updateFields.push(`template_description = $${paramIndex}`)
      updateValues.push(params.templateDescription)
      paramIndex++
    }

    if (params.videoUrl !== undefined) {
      updateFields.push(`video_url = $${paramIndex}`)
      updateValues.push(params.videoUrl)
      paramIndex++
    }

    if (params.thumbnailUrl !== undefined) {
      updateFields.push(`thumbnail_url = $${paramIndex}`)
      updateValues.push(params.thumbnailUrl)
      paramIndex++
    }

    if (params.duration !== undefined) {
      updateFields.push(`duration = $${paramIndex}`)
      updateValues.push(params.duration)
      paramIndex++
    }

    if (params.category !== undefined) {
      updateFields.push(`category = $${paramIndex}`)
      updateValues.push(params.category)
      paramIndex++
    }

    if (params.isPopular !== undefined) {
      updateFields.push(`is_popular = $${paramIndex}`)
      updateValues.push(params.isPopular)
      paramIndex++
    }

    if (params.sortOrder !== undefined) {
      updateFields.push(`sort_order = $${paramIndex}`)
      updateValues.push(params.sortOrder)
      paramIndex++
    }

    if (params.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`)
      updateValues.push(params.status)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return {
        success: false,
        error: '没有要更新的字段'
      }
    }

    // 添加更新时间
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
    updateValues.push(id)

    const query = `
      UPDATE nf_video_templates 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        template_name as "templateName",
        template_description as "templateDescription",
        video_url as "videoUrl",
        thumbnail_url as "thumbnailUrl",
        duration,
        category,
        is_popular as "isPopular",
        sort_order as "sortOrder",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    const { rows } = await sql.query(query, updateValues)

    if (rows.length === 0) {
      return {
        success: false,
        error: '视频模板不存在或更新失败'
      }
    }

    return {
      success: true,
      template: rows[0] as VideoTemplate
    }
  } catch (error) {
    console.error('更新视频模板失败:', error)
    return {
      success: false,
      error: '更新视频模板失败'
    }
  }
}

// 删除视频模板
export async function deleteVideoTemplate(id: number): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { rows } = await sql`
      DELETE FROM nf_video_templates
      WHERE id = ${id}
      RETURNING id
    `

    if (rows.length === 0) {
      return {
        success: false,
        error: '视频模板不存在'
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('删除视频模板失败:', error)
    return {
      success: false,
      error: '删除视频模板失败'
    }
  }
}
