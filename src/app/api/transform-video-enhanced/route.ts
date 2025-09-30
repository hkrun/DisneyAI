import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { findUserCreditsByUserId } from '@/actions/user'
import { deductUserCredits } from '@/actions/credits'
import { getStyleTemplate } from '@/lib/disney-prompts'
import { wanI2VClient } from '@/lib/wan-i2v-client'
import { downloadAndUploadToOSS } from '@/lib/oss-upload-utility'
import { db } from '@/lib/postgres-client'
import { FluxKontextProClient } from '@/lib/flux-kontext-pro'
import { buildQwenVlmInstruction } from '@/actions/constants'

interface TransformVideoEnhancedRequest {
  image?: string // Base64 图片（可选：当没有现成图片URL时使用）
  styleId?: string // 迪士尼风格ID（可选：当需要先生成风格图片时使用）
  prompt?: string // 用户自定义提示词（可选）
  existingImageUrl?: string // 已有的迪士尼风格图片URL（存在则跳过再次生成与上传）
}

// 使用通义千问 VL-Max 分析迪士尼风格图片以生成视频提示词
async function generatePromptWithQwen(imageUrl: string): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) throw new Error('缺少 DASHSCOPE_API_KEY 配置')

  // 默认使用北京地域
  const endpoint = (process.env.DASHSCOPE_REGION === 'singapore')
    ? 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
    : 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'

  // 默认中文；如需国际化，可从请求头/会话读取语言代码传入
  const instruction = buildQwenVlmInstruction('zh')

  const body = {
    model: 'qwen-vl-max',
    input: {
      messages: [
        { role: 'system', content: [{ type: 'text', text: instruction }] },
        { role: 'user', content: [{ type: 'image', image: imageUrl }] }
      ]
    }
  }

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  if (!resp.ok) {
    let details: any = null
    try { details = await resp.json() } catch { details = await resp.text() }
    console.error('Qwen VL-Max 请求失败', {
      status: resp.status,
      statusText: resp.statusText,
      endpoint,
      requestId: (details && typeof details === 'object') ? details.request_id : undefined,
      code: (details && typeof details === 'object') ? details.code : undefined,
      message: (details && typeof details === 'object') ? details.message : details,
      // 仅打印关键信息，避免输出完整图片URL导致日志过长
      bodyPreview: {
        model: body.model,
        hasImageUrl: Boolean(imageUrl),
        systemTextLen: instruction.length
      }
    })
    throw new Error(`Qwen VL-Max 调用失败: ${resp.status} ${resp.statusText} - ${(details && (details.message || details.code)) || 'Unknown error'}`)
  }

  const data = await resp.json() as any
  const message = data?.output?.choices?.[0]?.message
  let text: string | undefined
  
  if (typeof message?.content === 'string') {
    text = message.content
  } else if (Array.isArray(message?.content)) {
    // 兼容多种格式：{type:'text', text:'...'} 或直接 {text:'...'}
    const textItem = message.content.find((c: any) => c?.text || c?.type === 'text')
    text = textItem?.text || textItem?.content
  }
  
  if (!text) {
    console.error('Qwen VL-Max 返回无文本可用', { sample: JSON.stringify(data?.output?.choices?.[0]?.message)?.slice(0, 500) })
    throw new Error('Qwen VL-Max 未返回文本结果')
  }
  return String(text).trim()
}

// 记录视频任务到数据库
async function recordVideoTask(userId: string, styleId: string, taskId: string, generatedImageUrl?: string) {
  try {
    await db.sql`
      INSERT INTO nf_transform_history (user_id, type, style_id, task_id, status, created_at, generated_image_url) 
      VALUES (${userId}, 'video', ${styleId}, ${taskId}, 'pending', NOW(), ${generatedImageUrl})
    `
  } catch (error) {
    console.error('记录视频任务失败:', error)
  }
}

// 更新视频任务状态
async function updateVideoTask(taskId: string, status: string, resultUrl?: string, error?: string) {
  try {
    await db.sql`
      UPDATE nf_transform_history 
      SET status = ${status}, result_url = ${resultUrl}, error = ${error}, updated_at = NOW() 
      WHERE task_id = ${taskId}
    `
  } catch (error) {
    console.error('更新视频任务失败:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ success: false, error: '用户未登录' }, { status: 401 })
    }

    const { image, styleId, prompt, existingImageUrl }: TransformVideoEnhancedRequest = await request.json()

    // 检查用户积分
    const userCredits = await findUserCreditsByUserId(userId)
    if (userCredits < 5) { // 视频转换需要更多积分
      return NextResponse.json({ 
        success: false, 
        error: '积分不足，视频转换需要至少5积分' 
      }, { status: 402 })
    }

    // 当未提供 existingImageUrl 时，才需要依赖风格模板
    const styleTemplate = existingImageUrl ? null : getStyleTemplate(styleId as string)
    if (!existingImageUrl && !styleTemplate) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的风格ID' 
      }, { status: 400 })
    }

    console.log('开始增强视频转换流程:', {
      userId,
      styleId,
      prompt: (prompt || '').slice(0, 50) + '...',
      stylePrompt: styleTemplate?.prompt
    })

    let imageUrl = ''
    let uploadedUrl: string | undefined

    if (existingImageUrl) {
      // 已有图片，直接跳过生成与上传
      console.log('检测到已存在的风格图片URL，跳过生成与上传:', existingImageUrl)
      imageUrl = existingImageUrl
      uploadedUrl = existingImageUrl
    } else {
      // 步骤1：生成迪士尼风格图片
      console.log('步骤1：生成迪士尼风格图片...')

      if (!image) {
        return NextResponse.json({ success: false, error: '缺少图片数据' }, { status: 400 })
      }

      const fluxClient = new FluxKontextProClient({
        apiToken: process.env.REPLICATE_API_TOKEN || ''
      })
      const imageResult = await fluxClient.transformImage({
        image: image,
        prompt: (styleTemplate!).prompt
      })

      if (imageResult.status === 'succeeded') {
        imageUrl = imageResult.output || ''
      } else if (imageResult.status === 'failed') {
        throw new Error(`图片生成失败: ${imageResult.error}`)
      } else {
        const polledResult = await fluxClient.pollPrediction(imageResult.id)
        if (polledResult.status === 'succeeded') {
          imageUrl = polledResult.output || ''
        } else {
          throw new Error(`图片生成失败: ${polledResult.error}`)
        }
      }

      if (!imageUrl) {
        throw new Error('图片生成失败')
      }

      console.log('图片生成完成:', imageUrl)

      // 步骤2：上传生成的图片到OSS
      console.log('步骤2：上传图片到OSS...')
      const uploadResult = await downloadAndUploadToOSS(
        imageUrl,
        `disney-style-${styleId}.jpg`,
        'generated-images',
        'disney-style'
      )

      if (!uploadResult.success) {
        throw new Error(`图片上传到OSS失败: ${uploadResult.error}`)
      }

      console.log('图片上传到OSS完成:', uploadResult.url)
      uploadedUrl = uploadResult.url!
    }

    // 步骤3：使用图片URL和用户提示词生成视频
    // 如果没有提供提示词，使用通义千问 VL-Max 基于已生成的迪士尼风格图片自动生成
    let finalPrompt = (prompt || '').trim()
    if (!finalPrompt) {
      console.log('未提供提示词，调用 Qwen VL-Max 自动生成...')
      try {
        finalPrompt = await generatePromptWithQwen(uploadedUrl || imageUrl)
        console.log('Qwen 生成的提示词:', finalPrompt)
      } catch (err) {
        console.error('Qwen 生成提示词失败:', err)
        return NextResponse.json({ success: false, error: '自动生成提示词失败' }, { status: 502 })
      }
    }

    console.log('步骤3：生成视频...')
    const videoCreate = await wanI2VClient.createTask({
      imageBase64: '', // 不使用Base64，直接使用URL
      imageUrl: uploadedUrl || imageUrl, // 使用已有图片URL
      prompt: finalPrompt || ''
    })

    // 记录视频任务
    await recordVideoTask(userId, (styleId as string) || 'unknown', videoCreate.taskId, uploadedUrl || imageUrl)

    // 扣除用户积分
    await deductUserCredits(userId, 5, '视频转换')

    console.log('视频转换任务创建成功:', videoCreate.taskId)

    return NextResponse.json({ 
      success: true, 
      predictionId: videoCreate.taskId,
      requestId: videoCreate.requestId,
      generatedImageUrl: uploadedUrl || imageUrl
    })

  } catch (error) {
    console.error('增强视频转换错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '视频转换失败' 
    }, { status: 500 })
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
      return NextResponse.json({ 
        success: false, 
        error: '缺少predictionId参数' 
      }, { status: 400 })
    }

    // 查询视频生成状态（带重试机制）
    const taskResult = await wanI2VClient.getTask(predictionId, 3)
    
    if (taskResult.status === 'SUCCEEDED') {
      // 更新数据库记录
      await updateVideoTask(predictionId, 'completed', taskResult.videoUrl)
      
      return NextResponse.json({
        success: true,
        status: 'completed',
        resultUrl: taskResult.videoUrl,
        actualPrompt: taskResult.actualPrompt
      })
    } else if (taskResult.status === 'FAILED') {
      // 更新数据库记录
      await updateVideoTask(predictionId, 'failed', undefined, '视频生成失败')
      
      return NextResponse.json({
        success: true,
        status: 'failed',
        error: '视频生成失败'
      })
    } else {
      return NextResponse.json({
        success: true,
        status: 'processing',
        message: taskResult.status === 'PENDING' ? '正在准备生成视频...' : '正在生成视频...'
      })
    }

  } catch (error) {
    console.error('查询视频转换状态错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '查询状态失败' 
    }, { status: 500 })
  }
}
