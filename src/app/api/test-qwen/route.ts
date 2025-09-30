import { NextRequest, NextResponse } from 'next/server'
import { buildQwenVlmInstruction } from '@/actions/constants'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ success: false, error: '缺少图片数据' }, { status: 400 })
    }

    const apiKey = process.env.DASHSCOPE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: '缺少 DASHSCOPE_API_KEY 配置' }, { status: 500 })
    }

    // 使用国内地域
    const endpoint = (process.env.DASHSCOPE_REGION === 'singapore')
      ? 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
      : 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'

    const instruction = buildQwenVlmInstruction('zh')

    const body = {
      model: 'qwen-vl-max',
      input: {
        messages: [
          { role: 'system', content: [{ type: 'text', text: instruction }] },
          { role: 'user', content: [{ type: 'image', image: `data:image/jpeg;base64,${image}` }] }
        ]
      }
    }

    console.log('测试 Qwen VL-Max 请求:', {
      endpoint,
      hasImage: Boolean(image),
      systemTextLen: instruction.length,
      bodyPreview: {
        model: body.model,
        messagesCount: body.input.messages.length
      }
    })

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
      
      console.error('Qwen VL-Max 测试请求失败:', {
        status: resp.status,
        statusText: resp.statusText,
        requestId: (details && typeof details === 'object') ? details.request_id : undefined,
        code: (details && typeof details === 'object') ? details.code : undefined,
        message: (details && typeof details === 'object') ? details.message : details
      })
      
      return NextResponse.json({ 
        success: false, 
        error: `Qwen VL-Max 调用失败: ${resp.status} ${resp.statusText} - ${(details && (details.message || details.code)) || 'Unknown error'}` 
      }, { status: 502 })
    }

    const data = await resp.json()
    console.log('Qwen VL-Max 测试响应:', {
      hasOutput: Boolean(data?.output),
      choicesCount: data?.output?.choices?.length || 0,
      sample: JSON.stringify(data?.output?.choices?.[0]?.message)?.slice(0, 200)
    })

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
      console.error('Qwen VL-Max 返回无文本:', { sample: JSON.stringify(data?.output?.choices?.[0]?.message)?.slice(0, 500) })
      return NextResponse.json({ success: false, error: 'Qwen VL-Max 未返回文本结果' }, { status: 502 })
    }

    return NextResponse.json({ 
      success: true, 
      prompt: String(text).trim() 
    })

  } catch (error) {
    console.error('测试 Qwen VL-Max 错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器内部错误' 
    }, { status: 500 })
  }
}
