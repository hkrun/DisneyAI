import 'server-only'

export interface FluxKontextProConfig {
  apiToken: string;
  baseUrl?: string;
}

export interface FluxKontextProRequest {
  image: string; // Base64 encoded image (without data URL prefix)
  prompt: string;
}

export interface FluxKontextProResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string;
  error?: string;
  logs?: string;
}

export class FluxKontextProClient {
  private apiToken: string;
  private baseUrl: string;

  constructor(config: FluxKontextProConfig) {
    this.apiToken = config.apiToken;
    this.baseUrl = config.baseUrl || 'https://api.replicate.com/v1';
  }

  /**
   * 清理提示词，移除可能触发内容过滤的词汇
   */
  private cleanPrompt(prompt: string): string {
    if (!prompt) return '';
    
    // 移除或替换可能敏感的词汇
    const sensitiveWords = [
      'princess', 'romance', 'elegant', 'ballroom', 'glass slipper',
      'adult', 'mature', 'sexy', 'sensual', 'intimate'
    ];
    
    let cleanedPrompt = prompt.toLowerCase();
    
    // 替换敏感词汇
    cleanedPrompt = cleanedPrompt
      .replace(/princess/g, 'character')
      .replace(/romance/g, 'story')
      .replace(/elegant/g, 'beautiful')
      .replace(/ballroom/g, 'dance hall')
      .replace(/glass slipper/g, 'magic shoe')
      .replace(/adult/g, 'mature')
      .replace(/sexy/g, 'attractive')
      .replace(/sensual/g, 'graceful')
      .replace(/intimate/g, 'personal');
    
    return cleanedPrompt;
  }

  /**
   * 调用Flux Kontext Pro API进行图像转换
   */
  async transformImage(request: FluxKontextProRequest): Promise<FluxKontextProResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'black-forest-labs/flux-kontext-pro', // 正确的模型版本
          input: {
            prompt: this.cleanPrompt(request.prompt),
            input_image: `data:image/jpeg;base64,${request.image}`,
            aspect_ratio: "match_input_image",
            output_format: "jpg",
            safety_tolerance: 2,
            prompt_upsampling: false,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Flux API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Flux API Success Response:', result);
      return result;
    } catch (error) {
      console.error('Flux Kontext Pro API error:', error);
      throw new Error(`Failed to transform image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 轮询检查转换状态
   */
  async pollPrediction(predictionId: string): Promise<FluxKontextProResponse> {
    const maxAttempts = 60; // 最多轮询60次
    const interval = 2000; // 每2秒轮询一次

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.apiToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Polling failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.status === 'succeeded' || result.status === 'failed') {
          return result;
        }

        // 等待后继续轮询
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.error(`Polling attempt ${attempt + 1} failed:`, error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    throw new Error('Prediction polling timeout');
  }

  /**
   * 取消预测
   */
  async cancelPrediction(predictionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/predictions/${predictionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Cancel request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to cancel prediction:', error);
      throw error;
    }
  }
}

// 创建默认客户端实例
export const fluxClient = new FluxKontextProClient({
  apiToken: process.env.REPLICATE_API_TOKEN || '',
  baseUrl: process.env.REPLICATE_API_URL || 'https://api.replicate.com/v1'
});
