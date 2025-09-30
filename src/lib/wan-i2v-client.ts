import 'server-only'

export interface WanI2VConfig {
  apiKey: string
  region?: 'beijing' | 'singapore'
  model?: string
}

export interface WanI2VCreateRequest {
  imageBase64?: string
  imageUrl?: string
  prompt: string
  duration?: 5 | 10
  resolution?: '480P' | '720P' | '1080P'
  audio?: boolean
}

export interface WanI2VCreateResponse {
  taskId: string
  requestId: string
}

export interface WanI2VTaskResponse {
  taskId: string
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'UNKNOWN'
  videoUrl?: string
  error?: string
  submitTime?: string
  endTime?: string
  actualPrompt?: string
}

/**
 * 阿里云 Wan I2V（图片转视频）客户端
 * 支持北京和新加坡地域，根据官方API文档实现
 */
export class WanI2VClient {
  private apiKey: string
  private region: 'beijing' | 'singapore'
  private model: string
  private createEndpoint: string
  private queryEndpoint: string

  constructor(config?: Partial<WanI2VConfig>) {
    this.apiKey = config?.apiKey || process.env.DASHSCOPE_API_KEY || ''
    this.region = config?.region || (process.env.DASHSCOPE_REGION as 'beijing' | 'singapore') || 'beijing'
    this.model = config?.model || process.env.VISION_MODEL || process.env.WAN_I2V_MODEL || 'wan2.5-i2v-preview'
    
    // 根据地域设置端点
    if (this.region === 'singapore') {
      this.createEndpoint = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis'
      this.queryEndpoint = 'https://dashscope-intl.aliyuncs.com/api/v1/tasks'
    } else {
      this.createEndpoint = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis'
      this.queryEndpoint = 'https://dashscope.aliyuncs.com/api/v1/tasks'
    }
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey)
  }

  async createTask(req: WanI2VCreateRequest, maxRetries: number = 3): Promise<WanI2VCreateResponse> {
    if (!this.isConfigured) {
      throw new Error('WAN I2V 未配置（缺少 DASHSCOPE_API_KEY）')
    }

    // 重试逻辑
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(this.createEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-DashScope-Async': 'enable', // 必需的头，启用异步处理
          },
          body: JSON.stringify({
            model: this.model,
            input: {
              prompt: req.prompt,
              img_url: req.imageUrl || `data:image/jpeg;base64,${req.imageBase64}`,
            },
            parameters: {
              resolution: req.resolution || '1080P',
              duration: req.duration || 5,
              prompt_extend: true,
              audio: req.audio !== false, // 默认开启音频
              watermark: false,
            }
          })
        })

        if (!response.ok) {
          const text = await response.text()
          throw new Error(`WAN I2V create failed: ${response.status} ${response.statusText} - ${text}`)
        }

        const data = await response.json()
        
        if (data.code) {
          throw new Error(`WAN I2V create error: ${data.message || data.code}`)
        }

        const taskId = data.output?.task_id
        const requestId = data.request_id

        if (!taskId) {
          throw new Error('WAN I2V response missing task_id')
        }

        return { 
          taskId: String(taskId),
          requestId: String(requestId || '')
        }

      } catch (error) {
        const isLastAttempt = attempt === maxRetries
        const isRetryableError = this.isRetryableError(error)
        
        console.log(`WAN I2V createTask 尝试 ${attempt + 1}/${maxRetries + 1} 失败:`, error instanceof Error ? error.message : error)
        
        if (isLastAttempt || !isRetryableError) {
          throw error
        }
        
        // 指数退避：等待时间逐渐增加
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000) // 最大10秒
        console.log(`等待 ${delay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // 这里不应该到达，但为了TypeScript类型检查
    throw new Error('重试次数已用完')
  }

  async getTask(taskId: string, maxRetries: number = 3): Promise<WanI2VTaskResponse> {
    if (!this.isConfigured) {
      throw new Error('WAN I2V 未配置（缺少 DASHSCOPE_API_KEY）')
    }

    const url = `${this.queryEndpoint}/${encodeURIComponent(taskId)}`
    
    // 重试逻辑
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          }
        })

        if (!response.ok) {
          const text = await response.text()
          throw new Error(`WAN I2V get failed: ${response.status} ${response.statusText} - ${text}`)
        }

        const data = await response.json()
        
        if (data.code) {
          throw new Error(`WAN I2V get error: ${data.message || data.code}`)
        }

        const output = data.output || {}
        const status = output.task_status || 'UNKNOWN'

        return {
          taskId: String(taskId),
          status: status as WanI2VTaskResponse['status'],
          videoUrl: output.video_url,
          error: data.message,
          submitTime: output.submit_time,
          endTime: output.end_time,
          actualPrompt: output.actual_prompt
        }

      } catch (error) {
        const isLastAttempt = attempt === maxRetries
        const isRetryableError = this.isRetryableError(error)
        
        console.log(`WAN I2V getTask 尝试 ${attempt + 1}/${maxRetries + 1} 失败:`, error instanceof Error ? error.message : error)
        
        if (isLastAttempt || !isRetryableError) {
          throw error
        }
        
        // 指数退避：等待时间逐渐增加
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000) // 最大10秒
        console.log(`等待 ${delay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // 这里不应该到达，但为了TypeScript类型检查
    throw new Error('重试次数已用完')
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryableError(error: any): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      // 网络相关错误可以重试
      return message.includes('fetch failed') ||
             message.includes('econnreset') ||
             message.includes('etimedout') ||
             message.includes('enotfound') ||
             message.includes('timeout')
    }
    return false
  }
}

export const wanI2VClient = new WanI2VClient()