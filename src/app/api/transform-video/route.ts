import { NextRequest, NextResponse } from 'next/server'
import { getStyleTemplate } from '@/lib/disney-prompts'
import { wanI2VClient } from '@/lib/wan-i2v-client'
import { sql } from '@/lib/postgres-client'

interface TransformVideoRequest {
  image: string
  styleId: string
}

async function recordVideoTask(userId: string, styleId: string, taskId: string): Promise<void> {
  try {
    await sql`
      INSERT INTO nf_transform_history (
        user_id, style_id, prediction_id, credits_used, status, created_at
      ) VALUES (
        ${userId}, ${styleId}, ${taskId}, ${1}, 'processing', NOW()
      )
    `
  } catch (e) {
    console.error('recordVideoTask error:', e)
  }
}

async function updateVideoTask(taskId: string, status: 'completed' | 'failed', resultUrl?: string): Promise<void> {
  try {
    await sql`
      UPDATE nf_transform_history
      SET status = ${status}, result_url = ${resultUrl || null}, updated_at = NOW()
      WHERE prediction_id = ${taskId}
    `
  } catch (e) {
    console.error('updateVideoTask error:', e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ success: false, error: '用户未登录' }, { status: 401 })
    }

    const body: TransformVideoRequest = await request.json()
    const { image, styleId } = body
    if (!image || !styleId) {
      return NextResponse.json({ success: false, error: '缺少必需参数：image 和 styleId' }, { status: 400 })
    }

    const styleTemplate = getStyleTemplate(styleId)
    if (!styleTemplate) {
      return NextResponse.json({ success: false, error: '无效的风格ID' }, { status: 400 })
    }

    const prompt = styleTemplate.prompt

    // 创建 WAN I2V 任务
    const create = await wanI2VClient.createTask({ 
      imageBase64: image, 
      prompt,
      duration: 5, // 默认5秒视频
      resolution: '1080P', // 默认1080P
      audio: true // 默认开启音频
    })

    // 记录任务
    await recordVideoTask(userId, styleId, create.taskId)

    return NextResponse.json({ 
      success: true, 
      predictionId: create.taskId,
      requestId: create.requestId
    })
  } catch (error) {
    console.error('transform-video POST error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '服务器错误' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ success: false, error: '用户未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const predictionId = searchParams.get('predictionId')
    if (!predictionId) {
      return NextResponse.json({ success: false, error: '缺少predictionId参数' }, { status: 400 })
    }

    const task = await wanI2VClient.getTask(predictionId)
    
    // 映射官方状态到我们的状态
    if (task.status === 'SUCCEEDED' && task.videoUrl) {
      await updateVideoTask(predictionId, 'completed', task.videoUrl)
      return NextResponse.json({ 
        success: true, 
        status: 'completed', 
        resultUrl: task.videoUrl,
        actualPrompt: task.actualPrompt
      })
    }
    
    if (task.status === 'FAILED') {
      await updateVideoTask(predictionId, 'failed')
      return NextResponse.json({ 
        success: false, 
        status: 'failed', 
        error: task.error || '视频生成失败' 
      })
    }

    // PENDING, RUNNING 等状态都返回处理中
    return NextResponse.json({ 
      success: true, 
      status: 'processing',
      message: task.status === 'PENDING' ? '任务排队中...' : '视频生成中...'
    })
  } catch (error) {
    console.error('transform-video GET error:', error)
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 })
  }
}


